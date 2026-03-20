import { Injectable } from '@nestjs/common';

@Injectable()
export class DestinationsService {
  list() {
    return { status: 'ok', items: [] };
  }

  detail(slug: string) {
    return { status: 'ok', slug };
  }
}
