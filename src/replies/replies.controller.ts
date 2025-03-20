import { RepliesService } from './replies.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common'
import { CreateReplyDTO } from './DTO/create-reply.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { Reply } from './entities/reply.entity'
import { ReadAllRepliesDTO } from './DTO/read-all-replies.dto'
import { UpdateReplyDTO } from './DTO/upate-reply.dto'
import { ReadReplyDTO } from './DTO/read-reply.dto'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from 'src/users/entities/user-role.enum'
import { Roles } from 'src/common/custom-decorators/roles.decorator'

@Controller('api/replies')
@UseGuards(AuthGuard('jwt'), RolesGuard) // JWT인증, roles guard 적용
export class RepliesController {

    // 생성자 정의
    constructor(private repliesService: RepliesService) { }

    // CREATE - 리뷰 대댓글 (매니저 전용)
    // 미구현: logger
    // 비고: 매니저 여부를 판단하는 guard 必
    @Post('/:review_id')
    @Roles(UserRole.MANAGER)
    async createReply(
        @Param('review_id') review_id: number,
        @Body() createReplyDTO: CreateReplyDTO): Promise<ApiResponseDTO<Reply>> {
        await this.repliesService.createReply(review_id, createReplyDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, 'Reply Created Successfully')
    }

    // READ[1] - 모든 대댓글 조회 (매니저 전용)
    // 미구현: logger
    @Get('/')
    @Roles(UserRole.MANAGER)
    async readAllReplies(): Promise<ApiResponseDTO<ReadAllRepliesDTO[]>> {
        const replies: Reply[] = await this.repliesService.readAllReplies()
        const readAllRepliesDTO = replies.map(reply => new ReadAllRepliesDTO(reply))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Replies Retrieved Succefully', readAllRepliesDTO)
    }

    // READ[2] - 특정 대댓글 조회
    // 미구현: looger
    @Get('/:reply_id')
    async readReplyById(@Param('reply_id') reply_id: number): Promise<ApiResponseDTO<ReadReplyDTO>> {
        const foundReply = new ReadReplyDTO(await this.repliesService.readReplyById(reply_id))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Reply Retrieved Successfully', foundReply)
    }

    // UPDATE - 대댓글 수정
    // 미구현: logger
    @Put('/:reply_id')
    @Roles(UserRole.MANAGER)
    async updateReplyByReplyId(
        @Param('reply_id') reply_id: number,
        @Body() updateReplyDTO: UpdateReplyDTO): Promise<ApiResponseDTO<void>> {
        await this.repliesService.updateReplyByReplyId(reply_id, updateReplyDTO)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Reply Updated Successfully')
    }

    // DELETE - 대댓글 삭제
    // 미구현: logger
    @Delete('/:reply_id')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    async deleteReplyByReplyId(@Param('reply_id') reply_id: number): Promise<ApiResponseDTO<void>> {
        await this.repliesService.deleteReplyByReplyId(reply_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'Reply Deleted Successfully')
    }
}
