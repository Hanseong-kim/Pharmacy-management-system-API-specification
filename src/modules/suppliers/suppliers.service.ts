import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    const supplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async findAll(page: number = 1, limit: number = 10, sortBy = 'id', order: 'ASC' | 'DESC' = 'ASC') {
    const allowed: Record<string, string> = { id: 'id', name: 'name', createdAt: 'createdAt' };
    const col = allowed[sortBy] ?? 'id';

    const [data, total] = await this.supplierRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [col]: order },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['medicines'],
    });
    if (!supplier) throw new NotFoundException('해당 공급업체를 찾을 수 없습니다.');
    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    Object.assign(supplier, updateSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    return await this.supplierRepository.remove(supplier);
  }
}
