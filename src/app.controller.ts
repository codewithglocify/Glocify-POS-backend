import { Controller, Get } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health / hello check' })
  @ApiOkResponse({ schema: { type: 'string', example: 'Hello World!' } })
  getHello() {
    return this.appService.getHello();
  }
}
