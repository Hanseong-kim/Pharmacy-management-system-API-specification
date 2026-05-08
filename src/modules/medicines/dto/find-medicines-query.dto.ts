import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class FindMedicinesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '활성 여부 (true/false)' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-12-31', description: '이 날짜 이전 만료 약품 필터' })
  @IsOptional()
  @IsDateString()
  expiryBefore?: string;

  @ApiPropertyOptional({ example: '2025-01-01', description: '이 날짜 이후 만료 약품 필터' })
  @IsOptional()
  @IsDateString()
  expiryAfter?: string;

  @ApiPropertyOptional({ example: 1, description: '공급업체 ID로 필터' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  supplierId?: number;
}
