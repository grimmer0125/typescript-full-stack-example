import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { OpenTime } from './opentime.model';

import { FoodCollection } from './foodcollection.model';

@ObjectType()
@Entity()
export class Restaurant {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id?: number;

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

  @ManyToMany(
    type => FoodCollection,
    foodCollection => foodCollection.restaurants,
  )
  @JoinTable()
  foodCollections: FoodCollection[];
}
