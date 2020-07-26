import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
// import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt');

// export type User = any;

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    // const user = new User();
    // user.firstName = createUserDto.firstName;
    // user.lastName = createUserDto.lastName;
    // user.email = createUserDto.email;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);

    return this.usersRepository.save({ ...user, password: hashPassword });
  }

  async findOne(username: string): Promise<User> {
    return this.usersRepository.findOne({ username });
  }
  // async findOne(username: string): Promise<User | undefined> {
  //   return this.users.find(user => user.username === username);
  // }
}
