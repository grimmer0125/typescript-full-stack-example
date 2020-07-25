import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UseGuards } from '@nestjs/common';

import { GqlAuthGuard, CurrentUser } from '../auth/gql-jwt-auth.guard';

export class UsersResolver {
  @Query(returns => User)
  @UseGuards(GqlAuthGuard)
  whoAmI(@CurrentUser() user: User) {
    console.log('user from token:', user);
    //return this.usersService.findById(user.id);
    return { id: 0, firstName: 'a', lastName: 'b' };
  }
}
