import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateSaleStatusDto {
  @ApiProperty({ enum: ['COMPLETED', 'CANCELLED'], description: '변경할 판매 상태' })
  @IsEnum(['COMPLETED', 'CANCELLED'])
  status!: string;
}
