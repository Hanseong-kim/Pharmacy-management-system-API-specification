import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Swagger용 설명 추가

export class CreateMedicineDto {
  @ApiProperty({ example: '타이레놀' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '해열 진통제', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 3000 })
  @IsInt()
  @Min(0, { message: '가격은 0원 이상이어야 합니다.' })
  price!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stockQty!: number;

  @ApiProperty({ example: '2026-12-31' })
  @IsString()
  expiryDate!: string;
}