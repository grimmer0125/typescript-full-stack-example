import { Injectable } from '@nestjs/common';
import { CreatePostInput } from './dto/new-post.input';
import { GetAuthorArgs } from './dto/get-author.args';
import { Author } from './models/author.model';

@Injectable()
export class AuthorsService {
  /**
   * MOCK
   * Put some real business logic here
   * Left for demonstration purposes
   */

  async create(data: CreatePostInput): Promise<Author> {
    return {} as any;
  }

  async findOneById(id: number): Promise<Author> {
    return { id: 0, firstName: 'a', lastName: 'b' }; // as any;
  }

  async findAll(authorsArgs: GetAuthorArgs): Promise<Author[]> {
    return [] as Author[];
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }
}
