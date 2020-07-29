import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module'; //' /user.module';

import { RestaurantsResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';
import { RestaurantCollectionsService } from './restaurantCollections.service';

import { Restaurant } from './models/restaurant.model';
import { RestaurantCollection } from './models/restaurantcollection.model';
import { OpenTime } from './models/opentime.model';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Restaurant, OpenTime, RestaurantCollection]),
  ],
  providers: [
    RestaurantsService,
    RestaurantCollectionsService,
    RestaurantsResolver,
  ], // RestaurantsService
})
export class RestaurantsModule {}
