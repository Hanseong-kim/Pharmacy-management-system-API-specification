import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * Represents a staff member's profile (3NF compliant).
 *
 * Personal profile attributes (name, phoneNumber, address, hireDate) are stored
 * here rather than on the `User` entity, removing the transitive dependency that
 * would arise from mixing authentication data with HR profile data in a single table.
 * The FK `userId` on this side ensures each Staff row depends fully on its own PK.
 */
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
