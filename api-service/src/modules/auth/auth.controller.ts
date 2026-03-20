import { Controller, Get, Post } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login() {
    return this.authService.login();
  }

  @Post('register')
  register() {
    return this.authService.register();
  }

  @Get('me')
  me() {
    return this.authService.me();
  }
}
