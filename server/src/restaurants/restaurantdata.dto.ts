import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Restaurant } from './models/restaurant.model';

/**
 * This is a DTO (Data Transfer Object),
 */
@ObjectType()
export class RestaurantData {
  @Field(type => Int)
  total: number;

  @Field(type => [Restaurant])
  restaurants: Restaurant[];
}
