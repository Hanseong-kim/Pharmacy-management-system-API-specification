import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @ApiProperty({ example: 1, description: '고객 ID' })
  @IsInt()
  customerId!: number;

  @ApiProperty({ example: '김의사' })
  @IsString()
  doctorName!: string;

  @ApiProperty({ example: '2025-05-01' })
  @IsDateString()
  issuedDate!: string;

  @ApiPropertyOptional({ example: '하루 3회 복용' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [Number], example: [1, 2], description: '처방 약품 ID 목록' })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  medicineIds?: number[];
}
