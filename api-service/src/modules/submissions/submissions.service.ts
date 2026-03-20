import { Injectable } from '@nestjs/common';

@Injectable()
export class SubmissionsService {
  list() {
    return { status: 'ok', items: [] };
  }

  create(payload: Record<string, unknown>) {
    return { status: 'ok', message: 'TODO: create submission', payload };
  }

  detail(id: string) {
    return { status: 'ok', id };
  }
}
