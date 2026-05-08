import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: '홍길동' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '010-9876-5432' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '서울시 마포구' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '2023-03-01' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;
}
