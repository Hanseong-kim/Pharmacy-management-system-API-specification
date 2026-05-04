// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    // 1. user check.
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email or Password is incorrect.');
    }

    // 2. Compart passwords.
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email or Password is incorrect.');
    }

    // 3. 토큰에 들어갈 내용(Payload) 구성
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      staffName: user.staff?.name // 편의상 이름도 넣어주면 좋습니다.
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}