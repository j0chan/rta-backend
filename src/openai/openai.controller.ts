import { Body, Controller, Post } from '@nestjs/common'
import { OpenaiService } from './openai.service'

@Controller('api/openai')
export class OpenaiController {
    constructor(private readonly openAiService: OpenaiService) {}
    
    @Post('/')
    async test(
        @Body('text') text: string
    ): Promise<string> {
        return await this.openAiService.summarizeText(text)
    }
}
