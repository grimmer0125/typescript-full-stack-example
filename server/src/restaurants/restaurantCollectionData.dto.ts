import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RestaurantCollection } from './models/restaurantcollection.model';

/**
 * This is a DTO (Data Transfer Object),
 */
@ObjectType()
export class RestaurantCollectionData {
  @Field(type => Int)
  total: number;

  @Field(type => [RestaurantCollection])
  restaurantCollections: RestaurantCollection[];
}
