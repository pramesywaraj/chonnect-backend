import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 30 })
  @Expose()
  name: string;

  @Column({ type: 'varchar', length: 40 })
  @Expose()
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  @Expose()
  profile_image: string;

  @CreateDateColumn()
  @Expose()
  created_at: Date;

  @UpdateDateColumn()
  @Expose()
  updated_at: Date;
}
