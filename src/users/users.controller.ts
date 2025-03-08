import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { CreateUserDTO } from './DTO/create-user.dto'
import { UsersService } from './users.service'
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { User } from './entities/user.entity'
import { ReadUserDTO } from './DTO/read-user.dto'
import { UpdateUserDTO } from './DTO/update-user.dto'
import { ReadAllUsersDTO } from './DTO/read-all-users.dto'

@Controller('api/users')
export class UsersController {
    // init
    constructor(private usersService: UsersService) { }

    // CREATE - 회원가입
    // 미구현: logger
    @Post('/')
    async createUser(@Body() createUserDTO: CreateUserDTO): Promise<ApiResponseDTO<void>> {
        await this.usersService.createUser(createUserDTO)
        return new ApiResponseDTO(true, HttpStatus.CREATED, 'User Created Successfully!')
    }

    // READ[1] - 모든 유저 정보 조회
    // 미구현: logger
    @Get('/')
    async readAllUsers(): Promise<ApiResponseDTO<ReadAllUsersDTO[]>> {
        const users: User[] = await this.usersService.readAllUsers()
        const readAllUsersDTO: ReadAllUsersDTO[] = users.map(user => new ReadAllUsersDTO(user))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Users Retrieved Successfully', readAllUsersDTO)
    }

    // READ[2] - 내 정보 조회
    // 미구현: logger
    @Get('/:user_id')
    async readUserById(@Param('user_id') user_id: number): Promise<ApiResponseDTO<ReadUserDTO>> {
        const foundUser: User = await this.usersService.readUserById(user_id)

        const readUserDTO: ReadUserDTO = new ReadUserDTO(foundUser)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Event Retrieved Successfully', readUserDTO)
    }

    // UPDATE - by user_id
    // 미구현: logger
    @Put('/:user_id')
    async updateUserById(
        @Param('user_id') user_id: number,
        @Body() updateUserDto: UpdateUserDTO): Promise<ApiResponseDTO<void>> {
        await this.usersService.updateUserById(user_id, updateUserDto)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'User Updated Successfully')
    }

    // DELETE - 탈퇴
    // 미구현: logger
    @Delete('/:user_id')
    async deleteUserById(@Param('user_id') user_id: number): Promise<ApiResponseDTO<void>> {
        await this.usersService.deleteUserById(user_id)

        return new ApiResponseDTO(true, HttpStatus.NO_CONTENT, 'User Deleted Successfully')
    }
}
