import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { FindPrescriptionsQueryDto } from './dto/find-prescriptions-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('prescriptions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles('ADMIN', 'PHARMACIST')
  @ApiOperation({ summary: '처방전 등록 (ADMIN, PHARMACIST)' })
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Get()
  @ApiOperation({ summary: '처방전 목록 조회 (고객 필터, 페이지네이션)' })
  findAll(@Query() query: FindPrescriptionsQueryDto) {
    return this.prescriptionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '처방전 단건 조회 (약품 목록 포함)' })
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'PHARMACIST')
  @ApiOperation({ summary: '처방전 수정 (ADMIN, PHARMACIST)' })
  update(@Param('id') id: string, @Body() updatePrescriptionDto: UpdatePrescriptionDto) {
    return this.prescriptionsService.update(+id, updatePrescriptionDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'PHARMACIST')
  @ApiOperation({ summary: '처방전 삭제 (ADMIN, PHARMACIST)' })
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(+id);
  }
}
