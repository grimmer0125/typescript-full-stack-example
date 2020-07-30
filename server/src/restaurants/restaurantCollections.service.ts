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

  async shareToOtherEmail(restaurantCollectionID: number, targetEamil: string) {
    const user = await this.usersRepository.findOne({ email: targetEamil });
    if (!user) {
      throw new Error('no this email account');
    }

    const restaurantCollection = await await this.restaurantCollectionssRepository.findOne(
      {
        where: {
          id: restaurantCollectionID,
        },
        relations: ['owners'],
      },
    );
    if (restaurantCollection) {
      if (
        restaurantCollection.owners.find(owner => {
          if (owner.id === user.id) {
            return true;
          }
        })
      ) {
        throw new Error(
          'this restaurantCollection already belongs to this email:' +
            targetEamil,
        );
      }

      restaurantCollection.owners.push(user);
      await this.restaurantCollectionssRepository.save(restaurantCollection);

      return true;
    }
    return false;
  }

  async upsert(
    user: User,
    restaurantName: string,
    restaurantCollectionName: string,
  ) {
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

    return { collection, restaurant };
  }

  async findRestaurantCollectionContent(
    user: User,
    restaurantCollectionID: number,
  ) {
    const restaurantCollection = await this.restaurantCollectionssRepository
      .createQueryBuilder('restaurantCollection')
      .leftJoinAndSelect('restaurantCollection.restaurants', 'restaurant')
      .leftJoinAndSelect('restaurantCollection.owners', 'user')
      .where('restaurantCollection.id = :id', { id: restaurantCollectionID })
      .getOne();

    if (!restaurantCollection) {
      throw new Error('no restaurantCollection');
    }
    if (
      !restaurantCollection.owners.find(owner => {
        if (owner.id === user.id) {
          return true;
        }
      })
    ) {
      throw new Error('this restaurantCollection does not belong to you');
    }

    return restaurantCollection;
  }

  async findRestaurantCollections(user: User) {
    const foundUser = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.restaurantCollections', 'restaurantCollection')
      .where('user.id = :id', { id: user.id })
      .getOne();

    return {
      total: foundUser.restaurantCollections.length,
      restaurantCollections: foundUser.restaurantCollections,
    };
  }
}
