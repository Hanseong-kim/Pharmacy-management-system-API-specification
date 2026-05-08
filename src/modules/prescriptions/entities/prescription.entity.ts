import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity()
export class Prescription {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  doctorName!: string;

  @Column({ type: 'date' })
  issuedDate!: Date;

  @Column({ nullable: true, type: 'text' })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  // Customer 삭제 시 처방 이력 보존 — customer 필드만 NULL로 변경
  @ManyToOne(() => Customer, { onDelete: 'SET NULL', nullable: true })
  customer?: Customer | null;

  @ManyToMany(() => Medicine)
  @JoinTable()
  medicines!: Medicine[];
}
