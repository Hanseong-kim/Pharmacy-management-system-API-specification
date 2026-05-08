import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { FindMedicinesQueryDto } from './dto/find-medicines-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('medicines')
@ApiBearerAuth()
@Controller('medicines')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @Roles('ADMIN', 'PHARMACIST')
  @ApiOperation({ summary: '약품 등록 (ADMIN, PHARMACIST)' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicinesService.create(createMedicineDto);
  }

  @Get()
  @ApiOperation({ summary: '약품 목록 조회 (필터링, 페이지네이션, 정렬)' })
  findAll(@Query() query: FindMedicinesQueryDto) {
    return this.medicinesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '약품 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'PHARMACIST')
  @ApiOperation({ summary: '약품 정보 수정 (ADMIN, PHARMACIST)' })
  update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.medicinesService.update(+id, updateMedicineDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '약품 비활성화 soft delete (ADMIN)' })
  remove(@Param('id') id: string) {
    return this.medicinesService.remove(+id);
  }
}
