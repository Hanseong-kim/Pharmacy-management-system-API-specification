import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';

export class SaleItemDto {
  @ApiProperty({ example: 1, description: '약품 ID' })
  @IsInt()
  medicineId!: number;

  @ApiProperty({ example: 2, description: '판매 수량' })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({ example: 1, description: '고객 ID (선택)' })
  @IsOptional()
  @IsInt()
  customerId?: number;

  @ApiProperty({ type: [SaleItemDto], description: '판매 약품 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items!: SaleItemDto[];
}
