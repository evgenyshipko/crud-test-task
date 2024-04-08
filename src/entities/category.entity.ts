/* eslint-disable camelcase */
import {
  Column,
  CreateDateColumn,
  Entity as EntityORM,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type Nullable<T> = T | null;

@EntityORM('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // англ
  @Column({ type: 'character varying', unique: true })
  slug: string;

  // англ, кириллица
  @Column({ type: 'character varying' })
  name: string;

  // англ, кириллица
  @Column({ type: 'character varying', nullable: true })
  description?: Nullable<string>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate: Date;

  @Column({ type: 'boolean' })
  active: boolean;
}
