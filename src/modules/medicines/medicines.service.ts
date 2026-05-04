import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from './entities/medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
  ) {}

  // 1.register medicine
  async create(createMedicineDto: CreateMedicineDto) {
    const medicine = this.medicineRepository.create(createMedicineDto);
    return await this.medicineRepository.save(medicine);
  }

  // 2. find all medicines
  async findAll() {
    return await this.medicineRepository.find();
  }

  // 3. find one medicine by id
  async findOne(id: number) {
    const medicine = await this.medicineRepository.findOne({ where: { id } });
    if (!medicine) throw new NotFoundException('해당 약품을 찾을 수 없습니다.');
    return medicine;
  }

  // 4. update medicine
  async update(id: number, updateMedicineDto: UpdateMedicineDto) {
    const medicine = await this.findOne(id);
    Object.assign(medicine, updateMedicineDto);
    return await this.medicineRepository.save(medicine);
  }

  // 5. delete medicine
  async remove(id: number) {
    const medicine = await this.findOne(id);
    return await this.medicineRepository.remove(medicine);
  }
}