import { Controller, Get, Param } from '@nestjs/common';

import { DestinationsService } from './destinations.service';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  list() {
    return this.destinationsService.list();
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.destinationsService.detail(slug);
  }
}
