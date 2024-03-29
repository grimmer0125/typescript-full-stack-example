import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
  Int,
} from '@nestjs/graphql';
import axios from 'axios';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import { RestaurantsService } from './restaurants.service';
import { RestaurantData } from './restaurantdata.dto';
import { RestaurantCollectionData } from './restaurantCollectionData.dto';

import { GqlAuthGuard, CurrentUser } from '../auth/gql-jwt-auth.guard';
import { User } from '../users/models/user.model';
import { RestaurantCollectionsService } from './restaurantCollections.service';
import { RestaurantCollection } from './models/restaurantcollection.model';
import { RestaurantChangedData } from './restaurantChangedData.dto';

const pubSub = new PubSub();

@Resolver()
export class RestaurantsResolver {
  constructor(
    private restaurantsService: RestaurantsService,
    private restaurantCollectionsService: RestaurantCollectionsService,
  ) {}

  /** for testing */
  @Query(returns => String)
  async hello() {
    return 'world';
  }

  @UseGuards(GqlAuthGuard)
  @Subscription(returns => RestaurantChangedData, {
    name: 'restaurantAddedIntoCollection',
    filter: (payload, variables, context) => {
      // besides context, client can send subscription's variables
      if (
        payload?.restaurantAddedIntoCollection?.target ===
        context?.req?.user?.username
      ) {
        return true;
      }
      return false;
    },
  })
  restaurantAddedIntoCollection() {
    return pubSub.asyncIterator('restaurantAddedIntoCollection');
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async shareRestaurantCollectionToEmail(
    @CurrentUser() user: User,
    @Args('restaurantCollectionID', { type: () => Int })
    restaurantCollectionID: number,
    @Args('targetEamil') targetEamil: string,
  ) {
    const data = await this.restaurantCollectionsService.shareToOtherEmail(
      restaurantCollectionID,
      targetEamil,
    );

    return data;
  }

  @Query(returns => RestaurantCollection)
  @UseGuards(GqlAuthGuard)
  async fetchRestaurantCollectionContent(
    @CurrentUser() user: User,
    @Args('restaurantCollectionID', { type: () => Int })
    restaurantCollectionID?: number,
  ) {
    const data = await this.restaurantCollectionsService.findRestaurantCollectionContent(
      user,
      restaurantCollectionID,
    );
    return data;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => RestaurantCollection)
  async addRestaurantToCollection(
    @CurrentUser() user: User,
    @Args('restaurantID', { type: () => Int }) restaurantID: number,
    @Args('restaurantCollectionName')
    restaurantCollectionName: string,
  ) {
    const data = await this.restaurantCollectionsService.upsert(
      user,
      restaurantID,
      restaurantCollectionName,
    );

    const { collection, restaurant } = data;

    if (collection.owners) {
      for (const target of collection.owners) {
        if (target.username === user.username) {
          continue;
        }
        /**
         * publish to other owners
         */
        pubSub.publish('restaurantAddedIntoCollection', {
          restaurantAddedIntoCollection: {
            restaurantCollectionID: collection.id,
            target: target.username,
            restaurant,
          },
        });
      }
    }

    return collection;
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
    const response = await axios.get(sourceURL);

    /**
     * convert response.data (csv) to db data
     */
    await this.restaurantsService.batchUpsert(response.data);

    return 'ok';
  }
}
