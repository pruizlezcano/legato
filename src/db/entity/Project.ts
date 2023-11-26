import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Project {
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

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column()
  modifiedAt!: Date;
}
