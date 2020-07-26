import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/models/user.model';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user) {
      const isMatch: boolean = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async signup(createUserDto: User): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  async login(user: User) {
    const payload = { username: user.username, id: user.id };
    let expireAccessToken = '90m';
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      expireAccessToken = '30d';
    }
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: expireAccessToken,
      }),
    };
  }
}
