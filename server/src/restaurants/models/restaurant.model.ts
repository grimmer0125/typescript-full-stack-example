import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { OpenTime } from './opentime.model';

@ObjectType()
@Entity()
export class Restaurant {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id?: number;

  // @Field({ nullable: true })
  // @Column()
  // firstName?: string;

  // @Field({ nullable: true })
  // @Column()
  // lastName?: string;

  @Field()
  @Column()
  name: string;

  @OneToMany(
    type => OpenTime,
    openTime => openTime.restaurant,
  )
  @Field(type => [OpenTime])
  openTimes: OpenTime[];

  @CreateDateColumn({ type: 'date' })
  created: Date;
}
