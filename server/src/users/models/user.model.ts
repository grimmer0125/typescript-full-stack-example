import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Index,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';

import { RestaurantCollection } from '../../restaurants/models/restaurantcollection.model';

@ObjectType()
@Entity()
export class User {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id?: number;

  @Field()
  @Column()
  email: string;

  @Field()
  @Index()
  @Column()
  username?: string;

  @Field()
  @Column()
  password: string;

  @ManyToMany(
    type => RestaurantCollection,
    restaurantCollection => restaurantCollection.owners,
  )
  restaurantCollections: RestaurantCollection[];
}
