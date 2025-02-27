import { UserRole } from "src/users/entities/user-role.enum";
import { User } from "src/users/entities/user.entity";

export class UserResponseDto {
    email: string;
    role: UserRole;

    constructor(user: User) {
        this.email = user.email;
        this.role = user.role;
    }
}