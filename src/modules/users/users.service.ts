// src/modules/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Staff } from './entities/staff.entity';
import * as bcrypt from 'bcrypt'; // 설치한 bcrypt 임포트

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Staff) private staffRepository: Repository<Staff>,
    private dataSource: DataSource,
  ) {}

  async register(userData: any) {
    return await this.dataSource.transaction(async (manager) => {
      
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const staff = manager.create(Staff, {
        name: userData.name,
        phoneNumber: userData.phoneNumber,
      });
      const savedStaff = await manager.save(Staff, staff);

      const user = manager.create(User, {
        email: userData.email,
        password: hashedPassword,
        role: userData.role, // ADMIN, PHARMACIST, STAFF
        staff: savedStaff,   // 1 on 1
      });

      return await manager.save(User, user);
    });
  }
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { email },
      relations: ['staff'] 
    });
  }
}