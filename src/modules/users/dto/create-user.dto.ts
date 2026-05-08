import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'admin@pharmacy.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password!: string;

  @ApiProperty({ example: 'Jacob' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'PHARMACIST', 'STAFF'] })
  @IsEnum(['ADMIN', 'PHARMACIST', 'STAFF'])
  role!: string;

  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  phoneNumber!: string;

  @ApiPropertyOptional({ example: '서울시 강남구' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;
}
