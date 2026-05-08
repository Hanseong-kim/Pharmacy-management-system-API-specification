import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({ example: '타이레놀' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '해열 진통제' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stockQty!: number;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  expiryDate!: string;

  @ApiPropertyOptional({ example: 1, description: '공급업체 ID' })
  @IsOptional()
  @IsInt()
  supplierId?: number;
}
