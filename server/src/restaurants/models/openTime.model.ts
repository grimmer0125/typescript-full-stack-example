import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Restaurant } from './restaurant.model';

@ObjectType()
@Entity()
export class OpenTime {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id?: number;

  @Field()
  @Column()
  weekDay: number;

  //00:00:00, 24:00:00
  @Field()
  @Column('time without time zone')
  openHour: string;

  @Field()
  @Column('time without time zone')
  closeHour: string;

  // not work, why?
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.openTimes,
  )
  restaurant: Restaurant;
}
