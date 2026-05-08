import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@pharmacy.com', description: '사용자 이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: '사용자 비밀번호' })
  @IsString()
  password!: string;
}