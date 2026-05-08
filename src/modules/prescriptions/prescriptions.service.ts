import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { FindPrescriptionsQueryDto } from './dto/find-prescriptions-query.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
  ) {}

  async create(dto: CreatePrescriptionDto) {
    const { customerId, medicineIds, ...rest } = dto;

    const prescription = this.prescriptionRepository.create({
      ...rest,
      customer: { id: customerId } as any,
    });

    if (medicineIds && medicineIds.length > 0) {
      prescription.medicines = await this.medicineRepository.findByIds(medicineIds);
    } else {
      prescription.medicines = [];
    }

    return await this.prescriptionRepository.save(prescription);
  }

  async findAll(query: FindPrescriptionsQueryDto) {
    const { page = 1, limit = 10, customerId, sortBy = 'createdAt', order = 'DESC' } = query;

    const qb = this.prescriptionRepository
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.customer', 'customer')
      .leftJoinAndSelect('prescription.medicines', 'medicine');

    if (customerId) qb.andWhere('customer.id = :customerId', { customerId });

    const allowed: Record<string, string> = {
      createdAt: 'prescription.createdAt',
      issuedDate: 'prescription.issuedDate',
    };
    qb.orderBy(allowed[sortBy] ?? 'prescription.createdAt', order as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['customer', 'medicines'],
    });
    if (!prescription) throw new NotFoundException('해당 처방전을 찾을 수 없습니다.');
    return prescription;
  }

  async update(id: number, dto: UpdatePrescriptionDto) {
    const prescription = await this.findOne(id);
    const { customerId, medicineIds, ...rest } = dto;

    Object.assign(prescription, rest);
    if (customerId !== undefined) {
      (prescription as any).customer = { id: customerId };
    }
    if (medicineIds !== undefined) {
      prescription.medicines = medicineIds.length > 0
        ? await this.medicineRepository.findByIds(medicineIds)
        : [];
    }

    return await this.prescriptionRepository.save(prescription);
  }

  async remove(id: number) {
    const prescription = await this.findOne(id);
    return await this.prescriptionRepository.remove(prescription);
  }
}
