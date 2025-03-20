import { User } from 'src/users/entities/user.entity'
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface'
import { createParamDecorator } from "@nestjs/common"

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest()
    return req.user
})