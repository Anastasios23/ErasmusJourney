import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  list() {
    return this.submissionsService.list();
  }

  @Post()
  create(@Body() payload: Record<string, unknown>) {
    return this.submissionsService.create(payload);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.submissionsService.detail(id);
  }
}
