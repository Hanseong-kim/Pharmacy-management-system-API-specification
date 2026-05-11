import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn } from 'typeorm';
import { Staff } from './staff.entity';

/**
 * Represents an authenticated system user (3NF compliant).
 *
 * This table stores only authentication-related attributes (email, password, role).
 * All staff profile data (name, phone, address, hireDate) has been separated into the
 * `Staff` entity, eliminating the transitive dependency: userId → staffName → staffPhone.
 * Each non-key attribute depends solely on the primary key `id`.
 */
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
