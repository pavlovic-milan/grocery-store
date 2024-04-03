import bcrypt from 'bcrypt';
import UserService from '../../../src/services/UserService';
import User from '../../../src/models/User';
import { UserRole } from '../../../src/enums/UserRole';
import ResourceNotFoundError from '../../../src/errors/ResourceNotFoundError';
import Facility from '../../../src/models/Facility';
import { mockUser } from '../../mocks/mockUser';
import { getRelevantFacilityIds } from '../../../src/utils/getRelevantFacilityIds';
import ConflictError from '../../../src/errors/ConflictError';
import { mockFacility } from '../../mocks/mockFacility';
import ForbiddenError from '../../../src/errors/ForbiddenError';

jest.mock('bcrypt');
jest.mock('../../../src/utils/checkPermissions', () => ({
  checkPermissions: jest.fn(),
}));
jest.mock('../../../src/utils/getRelevantFacilityIds', () => ({
  getRelevantFacilityIds: jest.fn(),
}));
jest.mock('../../../src/models/User', () => ({
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  find: jest.fn(),
}));
jest.mock('../../../src/models/Facility', () => ({
  findOne: jest.fn(),
}));

describe('UserService unit tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const mockedUser = mockUser();
  const mockedFacility = mockFacility();

  describe('getUser method unit tests', () => {
    it('will throw ResourceNotFound error when user with provided id, role and relevant facility ids was not found', async () => {
      // arrange

      // act & assert
      await expect(
        UserService.getUser('userId', UserRole.MANAGER, UserRole.MANAGER)
      ).rejects.toThrow(ResourceNotFoundError);
    });

    it('will return mapped user when user is found for provided id, role and relevant facility ids', async () => {
      // arrange
      const userId = '1';
      const requestByRole = UserRole.MANAGER;
      const relevantFacilityIds = ['1', '2'];
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );
      (User.findOne as jest.Mock).mockResolvedValue(mockedUser);

      // act
      const response = await UserService.getUser(
        userId,
        requestByRole,
        UserRole.MANAGER
      );

      // assert
      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(User.findOne).toHaveBeenCalledWith({
        _id: userId,
        role: requestByRole,
        facilityId: { $in: relevantFacilityIds },
      });
      expect(response).toStrictEqual({
        _id: mockedUser._id,
        name: mockedUser.name,
        role: mockedUser.role,
        username: mockedUser.username,
      });
    });
  });

  describe('deleteUser method unit tests', () => {
    it('will throw ResourceNotFound error when user with provided id, role and relevant facility ids was not found', async () => {
      // arrange

      // act & assert
      await expect(
        UserService.deleteUser('userId', UserRole.MANAGER, UserRole.MANAGER)
      ).rejects.toThrow(ResourceNotFoundError);
    });

    it('will delete user when user is found for provided id, role and relevant facility ids', async () => {
      // arrange
      const userId = '1';
      const requestByRole = UserRole.MANAGER;
      const relevantFacilityIds = ['1', '2'];
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );
      (User.findOneAndDelete as jest.Mock).mockResolvedValue(mockedUser);

      // act
      await UserService.deleteUser(userId, requestByRole, UserRole.MANAGER);

      // assert
      expect(User.findOneAndDelete).toHaveBeenCalledTimes(1);
      expect(User.findOneAndDelete).toHaveBeenCalledWith({
        _id: userId,
        role: requestByRole,
        facilityId: { $in: relevantFacilityIds },
      });
    });
  });

  describe('createUser method unit tests', () => {
    const inputParams = {
      username: 'username',
      password: 'password',
      name: 'User',
      role: UserRole.MANAGER,
      facilityName: 'facility',
      requestByRole: UserRole.MANAGER,
      requestFromFacilityIds: '1',
    };

    it('will throw Conflict error when user with same username already exists', async () => {
      // arrange
      (User.findOne as jest.Mock).mockResolvedValue(mockedUser);

      // act & assert
      await expect(UserService.createUser(inputParams)).rejects.toThrow(
        ConflictError
      );
    });

    it('will throw ResourceNotFound error when facility with provided name does not exist', async () => {
      // arrange

      // act & assert
      await expect(UserService.createUser(inputParams)).rejects.toThrow(
        ResourceNotFoundError
      );
    });

    it('will throw Forbidden error when facility with provided name does not belong to relevant facilities for user', async () => {
      // arrange
      const relevantFacilityIds = ['1', '2'];
      (Facility.findOne as jest.Mock).mockResolvedValue(
        mockFacility({ _id: '100' })
      );
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );

      // act & assert
      await expect(UserService.createUser(inputParams)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('will create and return user', async () => {
      // arrange
      const relevantFacilityIds = ['1', '2'];
      const hashedPassword = 'hashedPassword';
      (Facility.findOne as jest.Mock).mockResolvedValue(mockedFacility);
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );
      (User.create as jest.Mock).mockResolvedValue(mockedUser);
      (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);

      // act
      const response = await UserService.createUser(inputParams);

      // assert
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(User.create).toHaveBeenCalledWith({
        username: inputParams.username,
        password: hashedPassword,
        name: inputParams.name,
        role: inputParams.role,
        facilityId: mockedFacility._id,
      });
      expect(response).toStrictEqual({
        _id: mockedUser._id,
        name: mockedUser.name,
        role: mockedUser.role,
        username: mockedUser.username,
      });
    });
  });

  describe('updateUser method unit tests', () => {
    const inputParams = {
      userId: 'userId',
      newUsername: 'username',
      newPassword: 'password',
      newName: 'User',
      newRole: UserRole.MANAGER,
      newFacilityName: 'facility',
      requestByRole: UserRole.MANAGER,
      requestForRole: UserRole.MANAGER,
      requestFromFacilityIds: '1',
    };

    it('will throw Conflict error when new username is provided and user with same username already exists', async () => {
      // arrange
      (User.findOne as jest.Mock).mockResolvedValue(mockedUser);

      // act & assert
      await expect(UserService.updateUser(inputParams)).rejects.toThrow(
        ConflictError
      );
    });

    it('will throw ResourceNotFound error when facility with provided new facility name does not exist', async () => {
      // arrange

      // act & assert
      await expect(UserService.updateUser(inputParams)).rejects.toThrow(
        ResourceNotFoundError
      );
    });

    it('will throw Forbidden error when facility with provided new facility name does not belong to relevant facilities for user', async () => {
      // arrange
      const relevantFacilityIds = ['1', '2'];
      (Facility.findOne as jest.Mock).mockResolvedValue(
        mockFacility({ _id: '100' })
      );
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );

      // act & assert
      await expect(UserService.updateUser(inputParams)).rejects.toThrow(
        ForbiddenError
      );
    });

    it('will throw ResourceNotFound error when user with provided id, role and relevant facility ids was not found', async () => {
      // arrange
      const relevantFacilityIds = ['1', '2'];
      (Facility.findOne as jest.Mock).mockResolvedValue(mockedFacility);
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );

      // act & assert
      await expect(UserService.updateUser(inputParams)).rejects.toThrow(
        ResourceNotFoundError
      );
    });

    it('will update and return user - new facility name was not provided', async () => {
      // arrange
      const relevantFacilityIds = ['1', '2'];
      const hashedPassword = 'hashedPassword';
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue(mockedUser);
      (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);

      // act
      const response = await UserService.updateUser({
        ...inputParams,
        newFacilityName: undefined,
      });

      // assert
      expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: inputParams.userId,
          role: inputParams.requestForRole,
          facilityId: { $in: relevantFacilityIds },
        },
        {
          $set: {
            username: inputParams.newUsername,
            password: hashedPassword,
            name: inputParams.newName,
            role: inputParams.newRole,
          },
        },
        { new: true }
      );
      expect(response).toStrictEqual({
        _id: mockedUser._id,
        name: mockedUser.name,
        role: mockedUser.role,
        username: mockedUser.username,
      });
    });

    it('will update and return user - new facility name was provided', async () => {
      // arrange
      const relevantFacilityIds = ['1', '2'];
      const hashedPassword = 'hashedPassword';
      (Facility.findOne as jest.Mock).mockResolvedValue(mockedFacility);
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue(mockedUser);
      (bcrypt.hashSync as jest.Mock).mockReturnValue(hashedPassword);

      // act
      const response = await UserService.updateUser(inputParams);

      // assert
      expect(User.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: inputParams.userId,
          role: inputParams.requestForRole,
          facilityId: { $in: relevantFacilityIds },
        },
        {
          $set: {
            username: inputParams.newUsername,
            password: hashedPassword,
            name: inputParams.newName,
            role: inputParams.newRole,
            facilityId: mockedFacility._id,
          },
        },
        { new: true }
      );
      expect(response).toStrictEqual({
        _id: mockedUser._id,
        name: mockedUser.name,
        role: mockedUser.role,
        username: mockedUser.username,
      });
    });
  });

  describe('getUsersForFacility method unit tests', () => {
    const inputParams = {
      facilityId: 'facilityId',
      includeDescendants: false,
      requestByRole: UserRole.MANAGER,
      requestForRole: UserRole.MANAGER,
      requestFromFacilityIds: '1',
    };

    it('will throw ResourceNotFound error when facility with provided id does not exist', async () => {
      // arrange

      // act & assert
      await expect(
        UserService.getUsersForFacility(inputParams)
      ).rejects.toThrow(ResourceNotFoundError);
    });

    it('will throw Forbidden error when facility with provided id does not belong to relevant facilities for user', async () => {
      // arrange
      const relevantFacilityIds = ['1', '2'];
      (Facility.findOne as jest.Mock).mockResolvedValue(
        mockFacility({ _id: '100' })
      );
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );

      // act & assert
      await expect(
        UserService.getUsersForFacility(inputParams)
      ).rejects.toThrow(ForbiddenError);
    });

    it('will return users for provided facility without descendants', async () => {
      // arrange
      const relevantFacilityIds = ['1', '2'];
      const user1 = mockUser({ _id: '1' });
      const user2 = mockUser({ _id: '2' });
      (Facility.findOne as jest.Mock).mockResolvedValue(mockedFacility);
      (getRelevantFacilityIds as jest.Mock).mockResolvedValue(
        relevantFacilityIds
      );
      (User.find as jest.Mock).mockResolvedValue([user1, user2]);

      // act
      const response = await UserService.getUsersForFacility(inputParams);

      // assert
      expect(User.find).toHaveBeenCalledTimes(1);
      expect(User.find).toHaveBeenCalledWith({
        role: inputParams.requestForRole,
        facilityId: inputParams.facilityId,
      });
      expect(response).toStrictEqual([
        {
          _id: user1._id,
          name: user1.name,
          role: user1.role,
          username: user1.username,
        },
        {
          _id: user2._id,
          name: user2.name,
          role: user2.role,
          username: user2.username,
        },
      ]);
    });

    it('will return users for provided facility with descendants', async () => {
      // arrange
      const relevantFacilityIds = ['1', '2'];
      const getUsersFromFacilityIds = ['3', '4'];
      const user1 = mockUser({ _id: '1' });
      const user2 = mockUser({ _id: '2' });
      (Facility.findOne as jest.Mock).mockResolvedValue(mockedFacility);
      (getRelevantFacilityIds as jest.Mock)
        .mockResolvedValueOnce(relevantFacilityIds)
        .mockResolvedValueOnce(getUsersFromFacilityIds);
      (User.find as jest.Mock).mockResolvedValue([user1, user2]);

      // act
      const response = await UserService.getUsersForFacility({
        ...inputParams,
        includeDescendants: true,
      });

      // assert
      expect(User.find).toHaveBeenCalledTimes(1);
      expect(User.find).toHaveBeenCalledWith({
        role: inputParams.requestForRole,
        facilityId: { $in: getUsersFromFacilityIds },
      });
      expect(response).toStrictEqual([
        {
          _id: user1._id,
          name: user1.name,
          role: user1.role,
          username: user1.username,
        },
        {
          _id: user2._id,
          name: user2.name,
          role: user2.role,
          username: user2.username,
        },
      ]);
    });
  });
});
