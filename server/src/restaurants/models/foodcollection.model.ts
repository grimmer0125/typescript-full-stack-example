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

import { User } from '../../users/models/user.model';

import { Restaurant } from './restaurant.model';

@ObjectType()
@Entity()
export class FoodCollection {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id?: number;

  @Field()
  @Column()
  name: string;

  @ManyToMany(
    type => Restaurant,
    restaurant => restaurant.foodCollections,
  )
  restaurants: Restaurant[];

  @ManyToMany(
    type => User,
    owner => owner.foodCollections,
  )
  @JoinTable()
  owners: User[];

  // @OneToMany(
  //   type => OpenTime,
  //   openTime => openTime.restaurant,
  // )
  // @Field(type => [OpenTime])
  // openTimes: OpenTime[];

  // @CreateDateColumn({ type: 'date' })
  // created: Date;
}
