import { Args, Mutation, Query, Resolver, Int } from '@nestjs/graphql';
import axios from 'axios';
import { UseGuards } from '@nestjs/common';

import { RestaurantsService } from './restaurants.service';
import { RestaurantData } from './restaurantdata.dto';
import { RestaurantCollectionData } from './restaurantCollectionData.dto';

import { GqlAuthGuard, CurrentUser } from '../auth/gql-jwt-auth.guard';
import { User } from '../users/models/user.model';
import { RestaurantCollectionsService } from './restaurantCollections.service';
import { RestaurantCollection } from './models/restaurantcollection.model';

@Resolver()
export class RestaurantsResolver {
  constructor(
    private restaurantsService: RestaurantsService,
    private restaurantCollectionsService: RestaurantCollectionsService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => RestaurantCollection)
  async addRestaurantToCollection(
    @CurrentUser() user: User,
    @Args('restaurantName') restaurantName: string,
    @Args('restaurantCollectionName') restaurantCollectionName: string,
  ) {
    console.log('add to collection');
    const data = await this.restaurantCollectionsService.create(
      user,
      restaurantName,
      restaurantCollectionName,
    );

    return data;
  }

  @Query(returns => RestaurantCollectionData)
  @UseGuards(GqlAuthGuard)
  async fetchRestaurantCollectionList(@CurrentUser() user: User) {
    const data = await this.restaurantCollectionsService.findRestaurantCollections(
      user,
    );
    return data;
  }

  @Query(returns => RestaurantData)
  @UseGuards(GqlAuthGuard)
  async fetchRestaurants(
    @CurrentUser() createUserDto: User, // works with UserGuard
    @Args('perPage', { type: () => Int }) perPage?: number,
    @Args('page', { type: () => Int }) page?: number,
    @Args('filterWeekDay', { type: () => Int }) filterWeekDay?: number,
    @Args('filterTime') filterTime?: string,
    @Args('filterRestaurentName') filterRestaurentName?: string,
  ) {
    console.log('get fetchRestaurants ');
    if (filterWeekDay || filterTime || filterRestaurentName) {
      const data = await this.restaurantsService.findRestaurantsByFilter(
        perPage,
        page,
        filterWeekDay,
        filterTime,
        filterRestaurentName,
      );

      return data;
    }
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
