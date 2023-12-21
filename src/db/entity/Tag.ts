import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}
