import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import Tag from './Tag';

@Entity()
export default class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  file!: string;

  @Column()
  path!: string;

  @Column()
  bpm!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  genre?: string;

  @ManyToMany(() => Tag)
  @JoinTable()
  tags?: Tag[];

  tagNames?: string[];

  @Column({ default: false })
  favorite!: boolean;

  @Column({ default: false })
  hidden!: boolean;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column()
  modifiedAt!: Date;

  @Column({ nullable: true })
  scale?: string;

  @Column({ nullable: true })
  notes?: string;
}
