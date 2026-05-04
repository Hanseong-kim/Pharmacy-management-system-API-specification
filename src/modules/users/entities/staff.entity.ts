import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Staff {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  phoneNumber!: string;

  // 1 on 1 : user has one staff profile
  @OneToOne(() => User, (user) => user.staff)
  user!: User;
}