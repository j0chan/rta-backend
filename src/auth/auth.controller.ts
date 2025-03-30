import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDTO } from 'src/users/DTO/create-user.dto'
import { ApiResponseDTO } from 'src/common/api-reponse-dto/api-response.dto'
import { SignInDTO } from './DTO/sign-in.dto'
import { Response } from 'express'

@Controller('api/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // Sign-Up
    @Post('/signup')
    async singUp(
        @Body() createUserDTO: CreateUserDTO
    ): Promise<ApiResponseDTO<void>> {
        await this.authService.signUp(createUserDTO)

        return new ApiResponseDTO(true, HttpStatus.CREATED, 'User Created Successfully!')
    }

    // Sign-In
    @Post('/signin')
    async singIn(
        @Body() signInDTO: SignInDTO,
        @Res() res: Response
    ): Promise<void> {
        const accessToken = await this.authService.signIn(signInDTO)

        // [2] JWT를 헤더에 저장 후 ApiResponse를 바디에 담아 전송
        res.setHeader('Authorization', accessToken)
        const response = new ApiResponseDTO(true, HttpStatus.OK, 'User Logged In Successfully!', { accessToken })

        res.send(response)
    }
}
