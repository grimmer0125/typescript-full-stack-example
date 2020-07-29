import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

import { FoodCollection } from '../../restaurants/models/foodcollection.model';

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
  @Column()
  username?: string;

  @Field()
  @Column()
  password: string;

  @ManyToMany(
    type => FoodCollection,
    foodCollection => foodCollection.owners,
  )
  foodCollections: FoodCollection[];
}
