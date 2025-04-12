import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "src/users/entities/user-role.enum";
import { User } from "src/users/entities/user.entity";
import { ROLES_KEY } from "./roles.decorator";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // public으로 설정된 경우 인증/권한 검사 생략
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (isPublic) {
            return true
        }

        // 핸들러 또는 클래스에 설정된 역할 가져오기
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        // 설정된 역할이 없는 핸들러는 true를 반환하여 접근 허용
        if (!requiredRoles) {
            return true
        }

        // 요청 객체에서 사용자 정보 가져오기
        const { user }: { user: User } = context.switchToHttp().getRequest()

        console.log('[RolesGuard] user:', user)
        console.log('[RolesGuard] user.role:', user.role)
        console.log('[RolesGuard] requiredRoles:', requiredRoles)


        // 사용자의 역할이 필요한 역할 목록에 포함되는지 권한 확인
        return requiredRoles.some((role) => user.role === role)
    }
}