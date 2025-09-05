import { UpdateUserDTO } from './DTO/update-user.dto'
import { CreateUserDTO } from './DTO/create-user.dto'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import { FileService } from 'src/file/file.service'
import { UserPoint } from './entities/user-point.entity'

@Injectable()
export class UsersService {
    // User 엔터티 주입
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private fileService: FileService,
        
        @InjectRepository(UserPoint)
        private userPointRepository: Repository<UserPoint>,
    ) { }

    // CREATE - 회원가입
    async createUser(createUserDTO: CreateUserDTO): Promise<User> {
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

        await this.fileService.createDefaultProfileImage(createdUser)

        const userPoint = this.userPointRepository.create({
            user: createdUser,
            balance: 0
        });
        await this.userPointRepository.save(userPoint);

        return createdUser
    }

    // READ[1] - 모든 유저 조회
    async readAllUsers(): Promise<User[]> {
        const foundUsers: User[] = await this.usersRepository.find()
        if (!foundUsers) {
            throw new NotFoundException(`Cannot Find Events`)
        }

        return foundUsers
    }

    // READ[2] - 내 정보 조회
    async readUserById(user_id: number): Promise<User> {
        const foundUser = await this.usersRepository.findOne({
            where: { user_id }
        })
        if (!foundUser) {
            throw new NotFoundException(`Cannot Find Event By Id ${user_id}`)
        }

        return foundUser
    }

    // READ[3] - 이메일로 유저 찾기
    async findUserByEmail(email: string): Promise<User> {
        const existingUser = await this.usersRepository.findOne({ where: { email } })
        if (!existingUser) {
            throw new NotFoundException('User Not Found!')
        }
        return existingUser
    }

    // 이메일 중복검사
    async readEmailExists(email: string): Promise<boolean> {
        return this.findUserByEmail(email)
            .then(() => true) // 유저가 존재하면 true
            .catch(() => false) // 예외 발생 시(유저 없음) false
    }

    // UPDATE - 내 정보 수정
    async updateUserById(user_id: number, updateUserDTO: UpdateUserDTO, file?: Express.Multer.File) {
        const foundUser = await this.readUserById(user_id)

        const { password, nickname } = updateUserDTO

        foundUser.password = password
        foundUser.nickname = nickname

        if (file) {
            const uploadedFile = await this.fileService.updateUserProfileImage(file, foundUser)

            foundUser.profile_image = uploadedFile
        }

        await this.usersRepository.save(foundUser)
    }

    // DELETE - 프로필 사진 기본값으로 변경
    async revertToDefaultProfileImage(user_id: number) {
        await this.fileService.revertToDefaultProfileImage(user_id)
    }

    // DELETE - 탈퇴
    async deleteUserById(user_id: number) {
        const foundUser = await this.readUserById(user_id)

        await this.usersRepository.remove(foundUser)
    }

    // 이메일 존재(중복) 여부 체크
    async checkEmailExist(email: string): Promise<void> {
        const existingUser = await this.usersRepository.findOne({ where: { email } })
        if (existingUser) {
            throw new ConflictException('Email Already Exists!')
        }
    }
}