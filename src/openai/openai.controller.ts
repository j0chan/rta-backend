import { Body, Controller, Post } from '@nestjs/common'
import { OpenaiService } from './openai.service'
import { Public } from 'src/common/custom-decorators/public.decorator'

@Controller('api/openai')
export class OpenaiController {
    constructor(private readonly openAiService: OpenaiService) {}
    
    @Post('/')
    async test(
        @Body('text') text: string
    ): Promise<string> {
        return await this.openAiService.summarizeText(text)
    }

    // 프론트에서 날씨/날짜 정보를 받아 추천 키워드 반환
    @Public()
    @Post('/keywords')
    async getKeywords(
        @Body('prompt') prompt: string
    ): Promise<{ keywords: string[] }> {
        const keywords = await this.openAiService.generateKeywords(prompt)
        return { keywords }
    }
}
