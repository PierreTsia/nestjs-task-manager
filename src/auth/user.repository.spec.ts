import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

const mockCredentialsDto = { username: 'test username', password: 'test' };

describe('UserRepository', () => {
  let userRepository;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  describe('signUp()', () => {
    let save;
    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });
    it('should sign up a user', async () => {
      save.mockResolvedValue(undefined);
      expect(save).not.toHaveBeenCalled();
      await expect(
        userRepository.signUp(mockCredentialsDto),
      ).resolves.not.toThrow();
      expect(save).toHaveBeenCalled();
    });
    const rejectionsCases: [string, { code: string }, any][] = [
      [
        'a conflict exception if user already exists',
        { code: '23505' },
        ConflictException,
      ],
      [
        'an internal servor error in other cases',
        { code: '24505' },
        InternalServerErrorException,
      ],
    ];

    test.each(rejectionsCases)(
      'should throw %s',
      async (_, code, exception) => {
        save.mockRejectedValue(code);
        expect(save).not.toHaveBeenCalled();
        await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
          exception,
        );
      },
    );
  });
  describe('validateUserPassword()', () => {
    let user;
    beforeEach(async () => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'Test User';
      user.validatePassword = jest.fn();
    });
    it('should return the username if the validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);
      expect(user.validatePassword).not.toHaveBeenCalled();
      const result = await userRepository.validateUserPassword(
        mockCredentialsDto,
      );
      expect(result).toEqual(user.username);
    });
    it('should return false if the user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.validateUserPassword(
        mockCredentialsDto,
      );
      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toEqual(false);
    });
    it('should return false if the password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);
      const result = await userRepository.validateUserPassword(
        mockCredentialsDto,
      );
      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toEqual(false);
    });
  });
  describe('hashPassword()', () => {
    it('should call bcrypt.hash to generate a hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('test_hash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword(
        'TestPassword',
        'testSalt',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('TestPassword', 'testSalt');
      expect(result).toEqual('test_hash');
    });
  });
});
