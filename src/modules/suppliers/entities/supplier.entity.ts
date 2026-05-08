import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  contactEmail!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  address!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Medicine, (medicine) => medicine.supplier)
  medicines!: Medicine[];
}
