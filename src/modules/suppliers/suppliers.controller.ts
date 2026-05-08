import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('suppliers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: '공급업체 등록' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: '공급업체 목록 조회 (페이지네이션, 정렬)' })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.suppliersService.findAll(pagination.page, pagination.limit, pagination.sortBy, pagination.order);
  }

  @Get(':id')
  @ApiOperation({ summary: '공급업체 단건 조회 (의약품 목록 포함)' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '공급업체 정보 수정' })
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '공급업체 삭제' })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(+id);
  }
}
