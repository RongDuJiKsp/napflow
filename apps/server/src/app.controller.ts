import { Controller, Get } from '@nestjs/common'
import { hello }from '@shared/funcs/hello-world'
@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return hello('nestjs')
  }
}
