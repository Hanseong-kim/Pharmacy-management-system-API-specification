// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StaffController } from './staff.controller';
import { User } from './entities/user.entity';
import { Staff } from './entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Staff])],
  controllers: [UsersController, StaffController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}