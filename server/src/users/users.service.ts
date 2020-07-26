import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.model';

// export type User = any;

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    // this.users = [
    //   {
    //     userId: 1,
    //     username: 'john',
    //     password: 'changeme',
    //   },
    //   {
    //     userId: 2,
    //     username: 'chris',
    //     password: 'secret',
    //   },
    //   {
    //     userId: 3,
    //     username: 'maria',
    //     password: 'guess',
    //   },
    // ];
  }

  async create(createUserDto: User): Promise<User> {
    // const user = new User();
    // user.firstName = createUserDto.firstName;
    // user.lastName = createUserDto.lastName;
    // user.email = createUserDto.email;
    // user.password = createUserDto.password;

    return this.usersRepository.save(createUserDto);
  }

  async findOne(username: string): Promise<User> {
    return this.usersRepository.findOne({ username });
  }
  // async findOne(username: string): Promise<User | undefined> {
  //   return this.users.find(user => user.username === username);
  // }
}
