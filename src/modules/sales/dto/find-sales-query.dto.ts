import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class FindSalesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['COMPLETED', 'CANCELLED'], description: '판매 상태 필터' })
  @IsOptional()
  @IsEnum(['COMPLETED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ example: 1, description: '고객 ID 필터' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customerId?: number;

  @ApiPropertyOptional({ example: 1, description: '직원 ID 필터' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  staffId?: number;

  @ApiPropertyOptional({ example: '2025-01-01', description: '시작 날짜 필터' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2025-12-31', description: '종료 날짜 필터' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
