import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn } from 'typeorm';
import { Staff } from './staff.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: ['ADMIN', 'PHARMACIST', 'STAFF'] })
  role!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Staff, (staff) => staff.user, { cascade: true })
  staff!: Staff;
}
