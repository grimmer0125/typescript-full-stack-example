import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Restaurant } from './restaurant.model';
@ObjectType()
export class RestaurantData {
  @Field(type => Int)
  total: number;

  @Field(type => [Restaurant])
  restaurants: Restaurant[];
}
