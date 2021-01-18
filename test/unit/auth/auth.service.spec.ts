import { Test } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { UserRepository } from '../../../src/auth/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
const authCredentialsDto = {
  username: 'test username',
  password: 'test',
};

const mockUserRepository = () => ({
  findOne: jest.fn(),
  validateUserPassword: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn().mockResolvedValue('testToken'),
});

describe('AuthService', () => {
  let authService;
  let userRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = await moduleRef.get(AuthService);
    userRepository = await moduleRef.get(UserRepository);
  });

  describe('isUsernameValid()', () => {
    it('should return a Conflict exception if user name is already taken', async () => {
      userRepository.findOne.mockResolvedValue(authCredentialsDto as any);
      expect(userRepository.findOne).not.toHaveBeenCalled();
      await expect(
        authService.isUsernameValid(authCredentialsDto),
      ).rejects.toThrow(ConflictException);
    });
    it('should return true if username is free', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      expect(userRepository.findOne).not.toHaveBeenCalled();
      expect(await authService.isUsernameValid(authCredentialsDto)).toEqual(
        true,
      );
    });
  });
  describe('signIn()', () => {
    it('should throw Unauthorized exception if credentials are invalid', async () => {
      userRepository.validateUserPassword.mockResolvedValue(false as any);
      await expect(authService.signIn(authCredentialsDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return a token if user is successfully signed in', async () => {
      userRepository.validateUserPassword.mockResolvedValue('test user' as any);
      const result = await authService.signIn(authCredentialsDto);
      expect(result).toEqual({ accessToken: 'testToken' });
    });
  });
});
