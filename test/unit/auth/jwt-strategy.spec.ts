import { JwtStrategy } from '../../../src/auth/jwt.strategy';
import { UserRepository } from '../../../src/auth/user.repository';
import { Test } from '@nestjs/testing';
import { User } from '../../../src/auth/user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = await moduleRef.get<JwtStrategy>(JwtStrategy);
    userRepository = await moduleRef.get<UserRepository>(UserRepository);
  });

  describe('validate()', () => {
    it('should validate and return the user based on JWT payload', async () => {
      const user = new User();
      user.username = 'test';
      userRepository.findOne.mockResolvedValue(user as any);
      expect(userRepository.findOne).not.toHaveBeenCalled();
      const result = await jwtStrategy.validate(user);
      expect(userRepository.findOne).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
    it('should throw an unauthorized exception if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      await expect(jwtStrategy.validate({ username: '' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
