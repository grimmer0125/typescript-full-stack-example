import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { GraphQLModule } from '@nestjs/graphql';

import { AuthorsResolver } from './authors.resolver';
import { AuthorsService } from './authors.service';

@Module({
  //   imports: [PostsModule],
  providers: [AuthorsService, AuthorsResolver],
})
export class AuthorsModule {}
