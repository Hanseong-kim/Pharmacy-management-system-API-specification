import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { Medicine } from './entities/medicine.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, Supplier])],
  controllers: [MedicinesController],
  providers: [MedicinesService],
  exports: [MedicinesService],
})
export class MedicinesModule {}
