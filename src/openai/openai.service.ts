import { Injectable, NotFoundException } from '@nestjs/common'
import OpenAI from 'openai'

@Injectable()
export class OpenaiService {
    private openai: OpenAI
    
    // init
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })
    }

    // test: 일단 api 연결이 되나만 보는 
    async summarizeText(text: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `이 문장을 요약해 주세요: ${text}`}]
            })
            const summarized = response.choices[0].message.content
            if (!summarized) {
                throw new NotFoundException()
            }

            return summarized
            
        } catch (error) {
            console.error('OpenAI API error: ', error)
            throw new Error('OpenAI 요약 실패')
        }
    }
}
