import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Medicine, (medicine) => medicine.supplier)
  medicines!: Medicine[];
}