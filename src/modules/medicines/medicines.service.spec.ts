import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { Medicine } from './entities/medicine.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { FindMedicinesQueryDto } from './dto/find-medicines-query.dto';

const mockMedicine: Medicine = {
  id: 1,
  name: '타이레놀',
  description: '해열 진통제',
  stockQty: 100,
  price: 3000 as any,
  expiryDate: new Date('2026-12-31'),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  supplier: null as any,
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockMedicine], 1]),
};

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockSupplierRepository = {
  findOne: jest.fn(),
};

describe('MedicinesService', () => {
  let service: MedicinesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicinesService,
        { provide: getRepositoryToken(Medicine), useValue: mockRepository },
        { provide: getRepositoryToken(Supplier), useValue: mockSupplierRepository },
      ],
    }).compile();

    service = module.get<MedicinesService>(MedicinesService);
  });

  describe('create', () => {
    it('should create and return a medicine', async () => {
      const dto: CreateMedicineDto = {
        name: '타이레놀',
        price: 3000,
        stockQty: 100,
        expiryDate: '2026-12-31',
      };
      mockRepository.create.mockReturnValue({ ...mockMedicine });
      mockRepository.save.mockResolvedValue(mockMedicine);

      const result = await service.create(dto);
      expect(result).toEqual(mockMedicine);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should assign supplier when supplierId is provided', async () => {
      const dto: CreateMedicineDto = { name: '약', price: 1000, stockQty: 10, expiryDate: '2026-01-01', supplierId: 2 };
      const mockSupplier = { id: 2, name: '테스트공급처' };
      const created: any = { name: '약' };
      mockSupplierRepository.findOne.mockResolvedValue(mockSupplier);
      mockRepository.create.mockReturnValue(created);
      mockRepository.save.mockResolvedValue({ ...created, supplier: mockSupplier });

      await service.create(dto);
      expect(created.supplier).toEqual(mockSupplier);
    });

    it('should throw NotFoundException when supplierId does not exist', async () => {
      const dto: CreateMedicineDto = { name: '약', price: 1000, stockQty: 10, expiryDate: '2026-01-01', supplierId: 999 };
      mockSupplierRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({});

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated medicines', async () => {
      const query: FindMedicinesQueryDto = { page: 1, limit: 10 };
      const result = await service.findAll(query);

      expect(result.data).toEqual([mockMedicine]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });

    it('should apply isActive filter when provided', async () => {
      const query: FindMedicinesQueryDto = { page: 1, limit: 10, isActive: true };
      await service.findAll(query);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('medicine.isActive = :isActive', { isActive: true });
    });

    it('should apply supplierId filter when provided', async () => {
      const query: FindMedicinesQueryDto = { page: 1, limit: 10, supplierId: 1 };
      await service.findAll(query);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('supplier.id = :supplierId', { supplierId: 1 });
    });
  });

  describe('findOne', () => {
    it('should return a medicine by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMedicine);
      const result = await service.findOne(1);
      expect(result).toEqual(mockMedicine);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['supplier'] });
    });

    it('should throw NotFoundException when medicine not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the medicine', async () => {
      const updateDto: UpdateMedicineDto = { price: 5000 };
      const updated = { ...mockMedicine, price: 5000 as any };
      mockRepository.findOne.mockResolvedValue({ ...mockMedicine });
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, updateDto);
      expect(result.price).toBe(5000);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when medicine not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update(999, { price: 1000 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove (soft delete)', () => {
    it('should set isActive to false instead of deleting', async () => {
      const medicine = { ...mockMedicine, isActive: true };
      mockRepository.findOne.mockResolvedValue(medicine);
      mockRepository.save.mockResolvedValue({ ...medicine, isActive: false });

      await service.remove(1);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
    });

    it('should throw NotFoundException when medicine not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
