// src/modules/sales/sales.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale } from './entities/sale.entity';
import { Medicine } from '../medicines/entities/medicine.entity'; // Medicine 추가

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Medicine])], 
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}