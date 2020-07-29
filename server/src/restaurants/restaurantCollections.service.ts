import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './models/restaurant.model';
import { OpenTime } from './models/opentime.model';
import { RestaurantCollection } from './models/restaurantcollection.model';
import { User } from '../users/models/user.model';

@Injectable()
export class RestaurantCollectionsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(OpenTime)
    private openTimesRepository: Repository<OpenTime>,
    @InjectRepository(RestaurantCollection)
    private restaurantCollectionssRepository: Repository<RestaurantCollection>,
  ) {}

  async create(
    user: User,
    restaurantName: string,
    restaurantCollectionName: string,
  ): Promise<RestaurantCollection> {
    console.log(
      'restaurantName,',
      user,
      restaurantName,
      restaurantCollectionName,
    );

    // user -> collection -> restaurant

    /**
     * find the restaurant
     */
    const restaurant = await this.restaurantsRepository.findOne({
      where: {
        name: restaurantName,
      },
      relations: ['collections'],
    });
    if (!restaurant) {
      throw new Error('no restaurant');
    }
    if (
      restaurant.collections.findIndex(collection => {
        if (collection.name === restaurantCollectionName) {
          return true;
        }
      }) > -1
    ) {
      throw new Error("already in this user's collection");
    }

    /**
     * find the user
     */
    const user2 = await this.usersRepository.findOne({ id: user.id });
    if (!user2) {
      throw new Error('no user');
    }
    /**
     * insert or update a Restaurant
     */
    let collection: RestaurantCollection;
    collection = await await this.restaurantCollectionssRepository.findOne({
      where: {
        name: restaurantCollectionName,
      },
      relations: ['owners'],
    });
    if (collection) {
      collection.owners.push(user2);
      await this.restaurantCollectionssRepository.save(collection);
    } else {
      collection = new RestaurantCollection();
      collection.name = restaurantCollectionName;
      collection.owners = [user2];
      await this.restaurantCollectionssRepository.save(collection);
    }

    /**
     * udpate restaurant's collections
     */
    restaurant.collections.push(collection);
    await this.restaurantsRepository.save(restaurant);

    return collection;
  }

  async findRestaurantCollections(user: User) {
    // const { userID, username } = user;
    console.log('findRestaurantCollections');

    const foundUser = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.restaurantCollections', 'restaurantCollection')
      .where('user.id = :id', { id: user.id })
      .getOne();

    console.log('foundUser:', foundUser);
    return {
      total: foundUser.restaurantCollections.length,
      restaurantCollections: foundUser.restaurantCollections,
    };
  }
}
