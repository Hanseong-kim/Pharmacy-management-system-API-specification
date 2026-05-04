import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { AuthGuard } from '@nestjs/passport'; 
import { RolesGuard } from '../../common/guards/roles.guard'; 
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('medicines')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @Roles('ADMIN', 'PHARMACIST')
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicinesService.create(createMedicineDto);   
  }

  @Get()
  findAll() {
    return this.medicinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'PHARMACIST')
  update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.medicinesService.update(+id, updateMedicineDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(+id);
  }
}