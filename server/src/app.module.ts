import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthorsModule } from './authors/authors.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthorsModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true, //process.cwd() + 'src/schema.gql',
      // context: ({ req }) => ({ req }),
      context: ({ req, connection }) =>
        connection ? { req: { headers: connection.context } } : { req },
      installSubscriptionHandlers: true,
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
