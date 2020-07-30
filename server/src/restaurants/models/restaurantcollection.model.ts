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

  @Field(type => [Restaurant])
  @ManyToMany(
    type => Restaurant,
    restaurant => restaurant.collections,
  )
  restaurants: Restaurant[];

  @Field(type => [User])
  @ManyToMany(
    type => User,
    owner => owner.restaurantCollections,
  )
  @JoinTable()
  owners: User[];
}
