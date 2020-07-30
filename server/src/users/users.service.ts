import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './models/user.model';
const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    const storedUser = await this.usersRepository.findOne({
      username: user.username,
    });
    if (storedUser) {
      throw new Error('existing user');
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);

    return this.usersRepository.save({ ...user, password: hashPassword });
  }

  async findOne(username: string): Promise<User> {
    return this.usersRepository.findOne({ username });
  }
}
