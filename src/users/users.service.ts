import { UpdateUserDTO } from './DTO/update-user.dto';
import { CreateUserDTO } from './DTO/create-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    // User 엔터티 주입
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    // CREATE - 회원가입
    // 미구현: logger, 에러 처리
    async createUser(createUserDTO: CreateUserDTO): Promise<User> {
        const { email, password, nickname, phone_number, role } = createUserDTO

        const newUser: User = this.userRepository.create({
            email: email,
            password: password,
            nickname: nickname,
            phone_number: phone_number,
            role: role,
            created_at: new Date()
        })

        const createdUser = await this.userRepository.save(newUser)

        return createdUser
    }

    // READ[1] - 모든 유저 조회
    // 미구현: logger, 에러 처리
    async readAllUsers(): Promise<User[]> {
        const foundUsers: User[] = await this.userRepository.find()
        if(!foundUsers) {
            throw new NotFoundException(`Cannot Find Events`)
        }

        return foundUsers
    }

    // READ[2] - 내 정보 조회
    // 미구현: logger, 에러 처리
    async readUserById(user_id: number): Promise<User> {
        const foundUser = await this.userRepository.createQueryBuilder('User')
            .where('User.user_id = :id', {id: user_id})
            .getOne() as User
        if(!foundUser) {
            throw new NotFoundException(`Cannot Find Event By Id ${user_id}`)
        }

        return foundUser
    }

    // UPDATE - 내 정보 수정
    // 미구현: logger, 에러 처리
    async updateUserById(user_id: number, updateUserDTO: UpdateUserDTO) {
        const foundUser = await this.readUserById(user_id)

        const { password, nickname } = updateUserDTO

        foundUser.password = password
        foundUser.nickname = nickname

        await this.userRepository.save(foundUser)
    }

    // DELETE
    // 미구현: logger, 에러 처리
    async deleteUserById(user_id: number) {
        const foundUser = await this.readUserById(user_id)

        await this.userRepository.remove(foundUser)
    }
}