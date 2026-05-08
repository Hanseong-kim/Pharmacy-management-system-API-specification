import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { Prescription } from './entities/prescription.entity';
import { Medicine } from '../medicines/entities/medicine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prescription, Medicine])],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
})
export class PrescriptionsModule {}
