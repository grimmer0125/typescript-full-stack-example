// https://github.com/nestjs/nest/blob/master/sample/23-graphql-code-first/src/recipes/recipes.resolver.ts
import { PubSub } from 'graphql-subscriptions';

import { GqlAuthGuard, CurrentUser } from '../auth/gql-jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

const pubSub = new PubSub();
let count = 7;

import { Field, Int, ObjectType } from '@nestjs/graphql';

// import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
// import { PubSub } from 'apollo-server-express';
// import { NewRecipeInput } from './dto/new-recipe.input';
// import { RecipesArgs } from './dto/recipes.args';
// import { Recipe } from './models/recipe.model';
import { AuthorsService } from './authors.service';
import { Author } from './models/author.model';
import { Comment } from './models/comment.model';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

@Resolver(of => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService, // private postsService: PostsService,
  ) {}

  // getAuthor(obj, args, context, info) <- how to get context, info ?
  @Query(returns => Author, { name: 'author' })
  async getAuthor(@Args('id', { type: () => Int }) id2: number) {
    console.log('author1');
    // await timeout(60 * 6 * 1000); //10s
    console.log('author2');
    return this.authorsService.findOneById(id2);
  }

  //   @ResolveField('posts', returns => [Post])
  //   async getPosts(@Parent() author: Author) {
  //     const { id } = author;
  //     return this.postsService.findAll({ authorId: id });
  //   }

  @UseGuards(GqlAuthGuard)
  @Subscription(returns => Comment, {
    name: 'commentAdded',
    filter: (payload, variables, context) => {
      // besides context, client can send subscription's variables
      if (payload?.commentAdded?.author === context?.req?.user?.username) {
        return true;
      }
      return false;
    },
  })
  addCommentHandler() {
    return pubSub.asyncIterator('commentAdded');
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Comment)
  async addComment(
    @Args('postId', { type: () => Int }) postId: number,
    @Args('comment') comment: string,
  ) {
    const newComment = {
      id: count,
      author: 'john',
    };
    count += 1;
    // const newComment = this.commentsService.addComment({ id: postId, comment });
    pubSub.publish('commentAdded', { commentAdded: newComment });
    return newComment;
  }
}
