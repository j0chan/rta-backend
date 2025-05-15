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

    // 추천 키워드 생성
    async generateKeywords(prompt: string): Promise<string[]> {
        try {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }]
        })

        const content = response.choices[0].message.content || ''

        // 키워드 정제: 줄바꿈, 쉼표 등 기준으로 나눔
        const keywords = content
            .split(/[\n,]+/)
            .map(k => k.trim())
            .filter(k => k.length > 0)

        if (keywords.length === 0) {
            throw new NotFoundException('키워드 없음')
        }

        return keywords
        } catch (error) {
        console.error('OpenAI 키워드 생성 실패:', error)
        throw new Error('OpenAI 키워드 요청 실패')
        }
    }
}
