import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: '한국제약' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'contact@kspharm.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '02-1234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '서울시 강남구' })
  @IsOptional()
  @IsString()
  address?: string;
}
