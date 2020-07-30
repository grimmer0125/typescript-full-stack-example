import { Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UseGuards } from '@nestjs/common';

import { GqlAuthGuard, CurrentUser } from '../auth/gql-jwt-auth.guard';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(returns => User, { description: 'use this to get personal profile' })
  @UseGuards(GqlAuthGuard)
  async whoAmI(@CurrentUser() createUserDto: User) {
    const user = await this.usersService.findOne(createUserDto.username);
    return user;
  }
}
