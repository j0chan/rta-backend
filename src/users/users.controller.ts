import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { UsersService } from './users.service'
import { Body, Controller, Delete, Get, HttpStatus, Put, Query, Req, UseGuards } from '@nestjs/common'
import { User } from './entities/user.entity'
import { ReadUserDTO } from './DTO/read-user.dto'
import { UpdateUserDTO } from './DTO/update-user.dto'
import { RolesGuard } from 'src/common/custom-decorators/custom-role.guard'
import { Roles } from 'src/common/custom-decorators/roles.decorator'
import { UserRole } from './entities/user-role.enum'
import { AuthGuard } from '@nestjs/passport'
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface'
import { Public } from 'src/common/custom-decorators/public.decorator'

@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    // READ - 모든 유저 정보 조회
    @Get('/')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    async readAllUsers(): Promise<ApiResponseDTO<ReadUserDTO[]>> {
        const users: User[] = await this.usersService.readAllUsers()
        const readUserDTOs: ReadUserDTO[] = users.map(user => new ReadUserDTO(user))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Users Retrieved Successfully', readUserDTOs)
    }

    // READ - 이메일 중복 검사
    @Public()
    @Get('/check-email')
    async readEmailExists(
        @Query('email') email: string
    ): Promise<ApiResponseDTO<boolean>> {
        const exists = await this.usersService.readEmailExists(email)
        return new ApiResponseDTO(true, HttpStatus.OK, 'Email Check Completed', exists)
    }

    // READ - 내 정보 조회
    @Get('/my')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    async readUserById(
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO<ReadUserDTO>> {
        const user_id = req.user.user_id

        const foundUser: User = await this.usersService.readUserById(user_id)

        const readUserDTO: ReadUserDTO = new ReadUserDTO(foundUser)

        return new ApiResponseDTO(true, HttpStatus.OK, 'User Retrieved Successfully', readUserDTO)
    }

    // UPDATE - by user_id
    @Put('/')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.USER, UserRole.MANAGER)
    async updateUserById(
        @Req() req: AuthenticatedRequest,
        @Body() updateUserDto: UpdateUserDTO
    ): Promise<ApiResponseDTO<void>> {
        const user_id = req.user.user_id

        await this.usersService.updateUserById(user_id, updateUserDto)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'User Updated Successfully')
    }

    // DELETE - 탈퇴
    @Delete('/')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.USER, UserRole.MANAGER)
    async deleteUserById(
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO<void>> {
        const user_id = req.user.user_id
        
        await this.usersService.deleteUserById(user_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'User Deleted Successfully')
    }
}
