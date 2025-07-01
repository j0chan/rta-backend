import { CreateUserDTO } from './DTO/create-user.dto';
import { UpdateUserDTO } from './DTO/update-user.dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name)

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        // private filesService: FilesService,
    ) { }

    // CREATE - 회원가입
    async createUser(createUserDTO: CreateUserDTO): Promise<User> {
        this.logger.log("createUser Start")

        const { email, password, nickname, phone_number, role } = createUserDTO
        const newUser: User = this.usersRepository.create({
            email: email,
            password: password,
            nickname: nickname,
            phone_number: phone_number,
            role: role,
            created_at: new Date()
        })
        const createdUser = await this.usersRepository.save(newUser)

        // await this.filesService.createDefaultProfileImage(createdUser)

        return createdUser
    }

    // READ[1] - 모든 유저 정보 조회
    async readAllUsers(): Promise<User[]> {
        this.logger.log("readUserById Start")

        const foundUsers: User[] = await this.usersRepository.find()
        if (foundUsers.length === 0) {
            throw new NotFoundException("Cannot Find Any User")
        }

        return foundUsers
    }

    // READ[2] - 로그인된 유저 정보 조회
    async readUserById(user_id: number): Promise<User> {
        this.logger.log("readUserById Start")

        const foundUser = await this.usersRepository.findOneBy({ id: user_id })
        if (!foundUser) {
            throw new NotFoundException(`User Not Found user_id=${user_id}`)
        }

        return foundUser
    }

    // READ[3] - 이메일로 유저 조회
    async readUserByEmail(email: string): Promise<User> {
        this.logger.log("readUserByEmail Start")

        const foundUser = await this.usersRepository.findOne({ where: { email } })
        if (!foundUser) {
            throw new NotFoundException('User Not found')
        }

        return foundUser
    }

    // 이메일 중복검사
    async readEmailExists(email: string): Promise<boolean> {
        return this.readUserByEmail(email)
            .then(() => true)
            .catch(() => false)
    }

    // UPDATE - 로그인된 유저 정보 수정
    async updateUserById(user_id: number, updateUserDTO: UpdateUserDTO, file?: Express.Multer.File) {
        this.logger.log("updateUserById Start")

        const foundUser = await this.readUserById(user_id)
        const { password, nickname } = updateUserDTO
        foundUser.password = password
        foundUser.nickname = nickname

        // if(file) {
        //     const uploadedFile = await this.fileService.updateUserProfileImage(file, foundUser)
        //     foundUser.profile_image = uploadedFile
        // }

        await this.usersRepository.save(foundUser)
    }

    // DELETE - 로그인된 유저 탈퇴
    async deleteUserById(user_id: number) {
        this.logger.log("deleteUserById Start")

        const foundUser = await this.readUserById(user_id)
        await this.usersRepository.remove(foundUser)
    }
}
