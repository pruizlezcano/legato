import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'tag' })
export default class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}
