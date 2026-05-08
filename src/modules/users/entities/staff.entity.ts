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

  @Column({ nullable: true })
  address!: string;

  @Column({ type: 'date', nullable: true })
  hireDate!: Date;

  @OneToOne(() => User, (user) => user.staff, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;
}
