import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuthService from '../../../src/services/AuthService';
import User from '../../../src/models/User';
import BadRequestError from '../../../src/errors/BadRequestError';
import UnauthorizedError from '../../../src/errors/UnauthorizedError';
import { UserRole } from '../../../src/enums/UserRole';
import ConflictError from '../../../src/errors/ConflictError';
import ResourceNotFoundError from '../../../src/errors/ResourceNotFoundError';
import Facility from '../../../src/models/Facility';
import { mockUser } from '../../mocks/mockUser';
import { mockFacility } from '../../mocks/mockFacility';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../src/models/User', () => ({
  findOne: jest.fn().mockImplementation(() => ({
    select: jest.fn(),
  })),
  create: jest.fn(),
}));
jest.mock('../../../src/models/Facility', () => ({
  findOne: jest.fn(),
}));

describe('AuthService unit tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const mockedUser = mockUser();

  describe('login method unit tests', () => {
    it('will throw UnauthorizedError if user with provided username does not exist', async () => {
      // arrange

      // act & assert
      await expect(AuthService.login('username', 'password')).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('will throw UnauthorizedError if bad password is provided for existing user', async () => {
      // arrange
      (User.findOne as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockedUser),
      }));

      // act & assert
      await expect(
        AuthService.login(mockedUser.username!, 'password1')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('will return access token on successful login', async () => {
      // arrange
      const accessToken = 'accessToken';
      (User.findOne as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockedUser),
      }));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(accessToken);

      // act
      const response = await AuthService.login(
        mockedUser.username!,
        mockedUser.password!
      );

      // assert
      expect(response).toStrictEqual(accessToken);
    });
  });

  describe('signup', () => {
    const inputParams = {
      username: 'username',
      password: 'password',
      confirmPassword: 'password',
      name: 'User',
      role: UserRole.MANAGER,
      facilityName: 'facility',
    };

    it('will throw BadRequestError if provided password do not match', async () => {
      // arrange

      // act & assert
      await expect(
        AuthService.signup(
          inputParams.username,
          inputParams.password,
          `${inputParams.password}1`,
          inputParams.name,
          inputParams.role,
          inputParams.facilityName
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('will throw ConflictError if user with same username already exists', async () => {
      // arrange
      (User.findOne as jest.Mock).mockResolvedValue(mockedUser),
        // act & assert
        await expect(
          AuthService.signup(
            mockedUser.username!,
            inputParams.password,
            inputParams.confirmPassword,
            inputParams.name,
            inputParams.role,
            inputParams.facilityName
          )
        ).rejects.toThrow(ConflictError);
    });

    it('will throw ResourceNotFound if there is no facility with provided name', async () => {
      // arrange

      // act & assert
      await expect(
        AuthService.signup(
          inputParams.username,
          inputParams.password,
          inputParams.confirmPassword,
          inputParams.name,
          inputParams.role,
          inputParams.facilityName
        )
      ).rejects.toThrow(ResourceNotFoundError);
    });

    it('will return access token on successful signup', async () => {
      // arrange
      const hashedPassword = 'hashedPassword';
      const accessToken = 'accessToen';
      const mockedFacility = mockFacility();
      (Facility.findOne as jest.Mock).mockResolvedValue(mockedFacility);
      (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);
      (User.create as jest.Mock).mockResolvedValue(mockedUser);
      (jwt.sign as jest.Mock).mockReturnValue(accessToken);

      // act
      const response = await AuthService.signup(
        mockedUser.username!,
        inputParams.password,
        inputParams.confirmPassword,
        inputParams.name,
        inputParams.role,
        inputParams.facilityName
      );

      // assert
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(User.create).toHaveBeenLastCalledWith({
        name: inputParams.name,
        role: inputParams.role,
        username: inputParams.username.trim(),
        password: hashedPassword,
        facilityId: mockedFacility._id,
      });
      expect(response).toStrictEqual(accessToken);
    });
  });
});
