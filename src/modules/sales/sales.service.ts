import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { Medicine } from '../medicines/entities/medicine.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private salesRepository: Repository<Sale>,
    @InjectRepository(Medicine) private medicineRepository: Repository<Medicine>,
    private dataSource: DataSource,
  ) {}

  async processSale(medicineId: number, quantity: number, staffId: number) {
    return await this.dataSource.transaction(async (manager) => {
      const medicine = await manager.findOne(Medicine, { where: { id: medicineId } });
      if (!medicine) throw new BadRequestException('약품 없음');
      if (medicine.stockQty < quantity) throw new BadRequestException('재고 부족');

      medicine.stockQty -= quantity; // 재고 차감
      await manager.save(medicine);

      const sale = manager.create(Sale, {
        totalAmount: medicine.price * quantity,
        staff: { id: staffId } as any,
        status: 'COMPLETED'
      });
      return await manager.save(sale);
    });
  }
}