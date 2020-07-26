// import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
// import { User } from './models/user.model';
// import { UseGuards } from '@nestjs/common';
// import { GqlAuthGuard, CurrentUser } from '../auth/gql-jwt-auth.guard';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './models/restaurant.model';
import axios from 'axios';

@Resolver()
export class RestaurantsResolver {
  constructor(private restaurantsService: RestaurantsService) {}

  @Query(returns => String)
  async hello() {
    return 'world';
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
