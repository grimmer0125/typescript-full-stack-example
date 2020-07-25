import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('auth/signup')
  async signup(@Request() req) {
    // const {
    //   body: { email, password },
    // } = req;
    const email = req.body.email as string;
    const password = req.body.password as string;

    const resp = await this.usersService.create({ email, password });

    return resp;
    // return
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get()
  async getHello(): Promise<string> {
    const resp = await this.appService.getHello();
    return resp;
  }
}
