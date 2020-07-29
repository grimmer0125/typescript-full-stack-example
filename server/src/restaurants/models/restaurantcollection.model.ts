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
export class RestaurantCollection {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id?: number;

  @Field()
  @Column()
  name: string;

  @ManyToMany(
    type => Restaurant,
    restaurant => restaurant.collections,
  )
  restaurants: Restaurant[];

  @ManyToMany(
    type => User,
    owner => owner.restaurantCollections,
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
