import { Body, Controller, Get, HttpStatus, Logger, Put, Query, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiResponseDTO } from 'src/common/api-response-DTO/api-response.dto';
import { ReadUserDTO } from './DTO/read-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDTO } from './DTO/update-user.dto';
import { Roles } from 'src/common/custom-decorators/roles.decorator';
import { UserRole } from './entities/user-role.enum';
import { Public } from 'src/common/custom-decorators/public.decorator';

@Controller('api/users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name)

    constructor(private usersService: UsersService) { }

    // READ[1] - 모든 유저 정보 조회
    @Get('/')
    @Roles(UserRole.ADMIN)
    async readAllUsers(): Promise<ApiResponseDTO<ReadUserDTO[]>> {
        this.logger.log("readAllUsers Start")

        const users: User[] = await this.usersService.readAllUsers()
        const readUserDTOs: ReadUserDTO[] = users.map(user => new ReadUserDTO(user))

        return new ApiResponseDTO(true, HttpStatus.OK, 'Retrived All Users', readUserDTOs)
    }

    // READ[2] - 로그인된 유저 정보 조회
    @Public()
    @Get('/my')
    async readUserById(
        // @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO<ReadUserDTO>> {
        this.logger.log("readUserById Start")

        // const user_id = req.user.id
        const user_id = 1 // 추후 윗라인으로 대체
        const foundUser: User = await this.usersService.readUserById(user_id)
        const readUserDTO: ReadUserDTO = new ReadUserDTO(foundUser)

        return new ApiResponseDTO(true, HttpStatus.OK, `Retrived user_id=${user_id}`, readUserDTO)
    }

    // READ[3] - 이메일 중복 검사
    @Public()
    @Get('/check-email')
    async readEmailExists(
        @Query('email') email: string
    ): Promise<ApiResponseDTO<boolean>> {
        this.logger.log("readEmailExists Start")

        const isExists = await this.usersService.readEmailExists(email)

        return new ApiResponseDTO(true, HttpStatus.OK, 'Email Check Completed', isExists)
    }

    // UPDATE - 로그인된 유저 정보 수정
    @Put('/')
    // @UseInterceptors(FileInterceptor('profile_image'))
    @Roles(UserRole.USER, UserRole.MANAGER)
    async updateUserById(
        // @Req() req: AuthenticatedRequest,
        @Body() updateUserDTO: UpdateUserDTO,
        @UploadedFile() profile_image: Express.Multer.File
    ): Promise<ApiResponseDTO<void>> {
        this.logger.log("updateUserById Start")

        // const user_id = req.user.id
        const user_id = 1 // 추후 윗라인으로 대체
        await this.usersService.updateUserById(user_id, updateUserDTO, profile_image)

        return new ApiResponseDTO(true, HttpStatus.OK, "User Info Updated")
    }

    // DELETE - 로그인된 유저 탈퇴
    @Roles(UserRole.USER, UserRole.MANAGER)
    async deleteUserById(
        // @Req() req: AuthenticatedRequest
    ): Promise<ApiResponseDTO<void>> {
        this.logger.log("deleteUserById Start")

        // const user_id = req.user.id
        const user_id = 1 // 추후 윗라인으로 대체
        await this.usersService.deleteUserById(user_id)

        return new ApiResponseDTO(true, HttpStatus.OK, 'User Deleted')
    }
}
