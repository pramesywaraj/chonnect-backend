import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';

import { CreateUserDto, UpdateUserDto } from './dtos';

import PasswordService from './password.service';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  public async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }

  public async findOneById(userId: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ id: userId });
  }

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.hash(createUserDto.password);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(newUser);
  }

  public async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password)
      updateUserDto.password = await this.passwordService.hash(updateUserDto.password);

    await this.userRepository.update({ id: userId }, updateUserDto);

    const updatedUser = await this.findOneById(userId);
    if (!updatedUser) {
      throw new UnauthorizedException('User not found after update');
    }

    return updatedUser;
  }

  public async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const result = await this.userRepository.update(
      { id: userId },
      { refresh_token: refreshToken },
    );

    if (result.affected === 0) throw new NotFoundException(`User with ID ${userId} not found`);
  }
}
