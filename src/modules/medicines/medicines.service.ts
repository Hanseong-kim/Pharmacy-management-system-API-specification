import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from './entities/medicine.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { FindMedicinesQueryDto } from './dto/find-medicines-query.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createMedicineDto: CreateMedicineDto) {
    const { supplierId, ...rest } = createMedicineDto;
    const medicine = this.medicineRepository.create(rest as any) as unknown as Medicine;

    if (supplierId) {
      const supplier = await this.supplierRepository.findOne({ where: { id: supplierId } });
      if (!supplier) throw new NotFoundException('입력하신 ID의 공급처를 찾을 수 없습니다.');
      medicine.supplier = supplier;
    }

    return await this.medicineRepository.save(medicine);
  }

  async findAll(query: FindMedicinesQueryDto) {
    const { page = 1, limit = 10, isActive, expiryBefore, expiryAfter, supplierId, sortBy = 'id', order = 'ASC' } = query;

    const qb = this.medicineRepository
      .createQueryBuilder('medicine')
      .leftJoinAndSelect('medicine.supplier', 'supplier');

    if (isActive !== undefined) {
      qb.andWhere('medicine.isActive = :isActive', { isActive });
    }
    if (expiryBefore) {
      qb.andWhere('medicine.expiryDate <= :expiryBefore', { expiryBefore });
    }
    if (expiryAfter) {
      qb.andWhere('medicine.expiryDate >= :expiryAfter', { expiryAfter });
    }
    if (supplierId) {
      qb.andWhere('supplier.id = :supplierId', { supplierId });
    }

    const allowed: Record<string, string> = {
      id: 'medicine.id',
      name: 'medicine.name',
      price: 'medicine.price',
      expiryDate: 'medicine.expiryDate',
      createdAt: 'medicine.createdAt',
      stockQty: 'medicine.stockQty',
    };
    qb.orderBy(allowed[sortBy] ?? 'medicine.id', order as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const medicine = await this.medicineRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });
    if (!medicine) throw new NotFoundException('해당 약품을 찾을 수 없습니다.');
    return medicine;
  }

  async update(id: number, updateMedicineDto: UpdateMedicineDto) {
    const medicine = await this.findOne(id);
    const { supplierId, ...rest } = updateMedicineDto as any;
    Object.assign(medicine, rest);

    if (supplierId !== undefined) {
      if (supplierId) {
        const supplier = await this.supplierRepository.findOne({ where: { id: supplierId } });
        if (!supplier) throw new NotFoundException('입력하신 ID의 공급처를 찾을 수 없습니다.');
        medicine.supplier = supplier;
      } else {
        medicine.supplier = null as any;
      }
    }

    return await this.medicineRepository.save(medicine);
  }

  async remove(id: number) {
    const medicine = await this.findOne(id);
    medicine.isActive = false;
    //await this.medicineRepository.update(id, { isActive: false }); // can optimize by directly updating without loading entity
    return await this.medicineRepository.save(medicine);
  }
}
