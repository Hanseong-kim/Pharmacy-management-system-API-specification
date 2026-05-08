import { Controller, Post, Get, Patch, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FindSalesQueryDto } from './dto/find-sales-query.dto';
import { UpdateSaleStatusDto } from './dto/update-sale-status.dto';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: '판매 목록 조회 (필터링, 페이지네이션, 정렬)' })
  findAll(@Query() query: FindSalesQueryDto) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '판매 단건 조회 (아이템 상세 포함)' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: '판매 생성 (재고 차감, 만료/비활성 약품 검증)' })
  create(@Request() req: any, @Body() createSaleDto: CreateSaleDto) {
    return this.salesService.processSale(createSaleDto, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '판매 상태 변경 (CANCELLED 시 재고 복원)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateSaleStatusDto) {
    return this.salesService.updateStatus(+id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '판매 삭제 (미취소 판매 시 재고 자동 복원)' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
