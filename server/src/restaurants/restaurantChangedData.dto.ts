import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RestaurantCollection } from './models/restaurantcollection.model';
import { Restaurant } from './models/restaurant.model';

/**
 * This is a DTO (Data Transfer Object),
 */
@ObjectType()
export class RestaurantChangedData {
  @Field(type => Int)
  restaurantCollectionID: number;

  @Field()
  restaurant: Restaurant;
}
