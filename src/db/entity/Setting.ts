import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Setting {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  key!: string;

  @Column({ nullable: true })
  value?: string;
}
