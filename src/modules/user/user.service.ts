import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { User } from '../../entities/user.entity';

import { CreateUserRequestDto, UpdateUserRequestDto } from './dtos';

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

  public async findByIds(userIds: string[]): Promise<User[]> {
    return await this.userRepository.findBy({
      id: In(userIds),
    });
  }

  public async createUser(createUserRequestDto: CreateUserRequestDto): Promise<User> {
    const hashedPassword = await this.passwordService.hash(createUserRequestDto.password);

    const newUser = this.userRepository.create({
      ...createUserRequestDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(newUser);
  }

  public async updateUser(
    userId: string,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<User> {
    if (updateUserRequestDto.password)
      updateUserRequestDto.password = await this.passwordService.hash(
        updateUserRequestDto.password,
      );

    await this.userRepository.update({ id: userId }, updateUserRequestDto);

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
