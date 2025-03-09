import { User } from 'src/users/entities/user.entity';
import { ExecutionContext } from './../../../node_modules/@nestjs/common/interfaces/features/execution-context.interface.d';
import { createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator((data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest()
    return req.user
})