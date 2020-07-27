import { Args, Mutation, Query, Resolver, Int } from '@nestjs/graphql';
import axios from 'axios';

import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './models/restaurant.model';
import { RestaurantData } from './models/restaurantdata.model';

@Resolver()
export class RestaurantsResolver {
  constructor(private restaurantsService: RestaurantsService) {}

  @Query(returns => String)
  async hello() {
    return 'world';
  }

  @Query(returns => RestaurantData)
  async fetchRestaurants(
    @Args('perPage', { type: () => Int }) perPage?: number,
    @Args('page', { type: () => Int }) page?: number,
  ) {
    const data = await this.restaurantsService.findRestaurants(perPage, page);
    return data;
  }

  @Mutation(returns => String)
  async etlRestaurantRawData(@Args('sourceURL') sourceURL: string) {
    console.log('fetchURL:', sourceURL);

    const response = await axios.get(sourceURL);

    /**
     * convert response.data (csv) to db data
     */
    console.log('csv:', response.data.length);
    await this.restaurantsService.batchUpsert(response.data);

    return 'ok';
  }
}
