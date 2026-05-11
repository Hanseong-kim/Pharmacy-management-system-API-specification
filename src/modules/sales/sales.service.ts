import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FindSalesQueryDto } from './dto/find-sales-query.dto';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Sale) private salesRepository: Repository<Sale>,
    @InjectRepository(Medicine) private medicineRepository: Repository<Medicine>,
    private dataSource: DataSource,
  ) {}

  async findAll(query: FindSalesQueryDto) {
    const { page = 1, limit = 10, status, customerId, staffId, dateFrom, dateTo, sortBy = 'createdAt', order = 'DESC' } = query;

    const qb = this.salesRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'item')
      .leftJoinAndSelect('item.medicine', 'medicine')
      .leftJoinAndSelect('sale.staff', 'staff')
      .leftJoinAndSelect('sale.customer', 'customer');

    if (status) qb.andWhere('sale.status = :status', { status });
    if (customerId) qb.andWhere('customer.id = :customerId', { customerId });
    if (staffId) qb.andWhere('staff.id = :staffId', { staffId });
    if (dateFrom) qb.andWhere('sale.createdAt >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('sale.createdAt <= :dateTo', { dateTo });

    const allowed: Record<string, string> = {
      createdAt: 'sale.createdAt',
      totalAmount: 'sale.totalAmount',
      status: 'sale.status',
    };
    qb.orderBy(allowed[sortBy] ?? 'sale.createdAt', order as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['items', 'items.medicine', 'staff', 'customer'],
    });
    if (!sale) throw new NotFoundException('해당 판매 기록을 찾을 수 없습니다.');
    return sale;
  }

  async processSale(dto: CreateSaleDto, staffId: number) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dto.customerId) {
          const customer = await manager.findOne(Customer, { where: { id: dto.customerId } });
          if (!customer) throw new BadRequestException(`고객 ID ${dto.customerId}을(를) 찾을 수 없습니다.`);
        }

        let total = 0;
        const saleItemsData: { medicine: Medicine; quantity: number; unitPrice: number }[] = [];

        for (const item of dto.items) {
          const medicine = await manager.findOne(Medicine, { where: { id: item.medicineId } });
          if (!medicine) throw new BadRequestException(`약품 ID ${item.medicineId}을(를) 찾을 수 없습니다.`);
          if (!medicine.isActive) throw new BadRequestException(`약품 "${medicine.name}"은(는) 비활성 상태입니다.`);
          if (new Date(medicine.expiryDate) < today) throw new BadRequestException(`약품 "${medicine.name}"이(가) 만료되었습니다.`);
          if (medicine.stockQty < item.quantity) throw new BadRequestException(`약품 "${medicine.name}" 재고 부족 (현재: ${medicine.stockQty})`);

          medicine.stockQty -= item.quantity;
          await manager.save(medicine);

          const unitPrice = Number(medicine.price);
          total += unitPrice * item.quantity;
          saleItemsData.push({ medicine, quantity: item.quantity, unitPrice });
        }

        const sale = manager.create(Sale, {
          totalAmount: total,
          staff: { id: staffId } as any,
          customer: dto.customerId ? ({ id: dto.customerId } as any) : undefined,
          status: 'COMPLETED',
        });
        const savedSale = await manager.save(sale);

        for (const si of saleItemsData) {
          const saleItem = manager.create(SaleItem, {
            sale: savedSale,
            medicine: si.medicine,
            quantity: si.quantity,
            unitPrice: si.unitPrice,
          });
          await manager.save(saleItem);
        }

        return savedSale;
      });
    } catch (error) {
      this.logger.error('processSale failed', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('판매 처리 중 오류가 발생했습니다.');
    }
  }

  async updateStatus(id: number, status: string) {
    try {
      const sale = await this.findOne(id);
      if (sale.status === 'CANCELLED') throw new BadRequestException('이미 취소된 판매입니다.');

      if (status === 'CANCELLED') {
        await this.dataSource.transaction(async (manager) => {
          for (const item of sale.items) {
            await manager.increment(Medicine, { id: item.medicine.id }, 'stockQty', item.quantity);
          }
          await manager.update(Sale, id, { status: 'CANCELLED' });
        });
        return this.findOne(id);
      }

      sale.status = status;
      return await this.salesRepository.save(sale);
    } catch (error) {
      this.logger.error(`updateStatus failed for sale ${id}`, error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('판매 상태 변경 중 오류가 발생했습니다.');
    }
  }

  async remove(id: number) {
    try {
      const sale = await this.findOne(id);

      if (sale.status !== 'CANCELLED') {
        await this.dataSource.transaction(async (manager) => {
          for (const item of sale.items) {
            await manager.increment(Medicine, { id: item.medicine.id }, 'stockQty', item.quantity);
          }
        });
      }

      return await this.salesRepository.remove(sale);
    } catch (error) {
      this.logger.error(`remove failed for sale ${id}`, error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('판매 삭제 중 오류가 발생했습니다.');
    }
  }
}
