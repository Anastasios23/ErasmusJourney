import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login() {
    return { status: 'ok', message: 'TODO: implement login' };
  }

  register() {
    return { status: 'ok', message: 'TODO: implement registration' };
  }

  me() {
    return { status: 'ok', user: null };
  }
}
