import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  reviewQueue() {
    return { status: 'ok', items: [] };
  }
}
