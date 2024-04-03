import ResourceNotFoundError from '../errors/ResourceNotFoundError';
import User, { UserModel, UserModelForApiResponse } from '../models/User';
import ErrorData from '../errors/ErrorData';
import { UserRole } from '../enums/UserRole';
import { checkPermissions } from '../utils/checkPermissions';
import { getRelevantFacilityIds } from '../utils/getRelevantFacilityIds';
import Facility, { FacilityModel } from '../models/Facility';
import ForbiddenError from '../errors/ForbiddenError';
import bcrypt from 'bcrypt';
import ConflictError from '../errors/ConflictError';
import mongoose, { FilterQuery } from 'mongoose';

class UserService {
  private static instance: UserService;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async getUser(
    userId: string,
    requestByRole: UserRole,
    requestForRole: UserRole,
    requestFromFacilityId?: string
  ): Promise<UserModelForApiResponse> {
    checkPermissions({
      requestByRole,
      requestFromFacilityId,
      requestForRole,
      isManageRequest: false,
    });

    const relevantFacilityIds = await getRelevantFacilityIds(
      requestFromFacilityId!
    );

    const user = await User.findOne({
      _id: userId,
      role: requestForRole,
      facilityId: { $in: relevantFacilityIds },
    });

    if (!user) {
      throw new ResourceNotFoundError(
        new ErrorData(`User with id ${userId} not found`)
      );
    }

    return this.mapUserForResponse(user);
  }

  public async deleteUser(
    userId: string,
    requestByRole: UserRole,
    requestForRole: UserRole,
    requestFromFacilityId?: string
  ): Promise<void> {
    checkPermissions({
      requestByRole,
      requestFromFacilityId,
      requestForRole,
      isManageRequest: true,
    });

    const relevantFacilityIds = await getRelevantFacilityIds(
      requestFromFacilityId!
    );

    const user = await User.findOneAndDelete({
      _id: userId,
      role: requestForRole,
      facilityId: { $in: relevantFacilityIds },
    });

    if (!user) {
      throw new ResourceNotFoundError(
        new ErrorData(`User with id ${userId} not found`)
      );
    }
  }

  public async createUser({
    username,
    password,
    role,
    name,
    facilityName,
    requestByRole,
    requestFromFacilityId,
  }: {
    username: string;
    password: string;
    role: UserRole;
    name: string;
    facilityName: string;
    requestByRole: UserRole;
    requestFromFacilityId?: string;
  }): Promise<UserModelForApiResponse> {
    checkPermissions({
      requestByRole,
      requestFromFacilityId,
      isManageRequest: true,
    });

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      throw new ConflictError(new ErrorData('Invalid username'));
    }

    // checkPermissions would throw error if requestFromFacilityId was undefined
    const { facility } = await this.validateFacility(
      requestFromFacilityId!,
      facilityName
    );

    const user: UserModel = await User.create({
      username,
      password: bcrypt.hashSync(password, 10),
      name,
      role,
      facilityId: facility._id,
    });

    return this.mapUserForResponse(user);
  }

  public async updateUser({
    userId,
    newUsername,
    newPassword,
    newRole,
    newName,
    newFacilityName,
    requestByRole,
    requestForRole,
    requestFromFacilityId,
  }: {
    userId: string;
    newUsername?: string;
    newPassword?: string;
    newRole?: UserRole;
    newName?: string;
    newFacilityName?: string;
    requestByRole: UserRole;
    requestForRole: UserRole;
    requestFromFacilityId?: string;
  }): Promise<UserModelForApiResponse> {
    checkPermissions({
      requestByRole,
      requestFromFacilityId,
      requestForRole,
      isManageRequest: true,
    });

    if (newUsername) {
      const existingUser = await User.findOne({ username: newUsername });

      if (existingUser) {
        throw new ConflictError(
          new ErrorData(`User with same username already exists`)
        );
      }
    }

    let relevantFacilityIds;
    let newFacilityId;
    if (newFacilityName) {
      // checkPermissions would throw error if requestFromFacilityId was undefined
      const { facility, relevantFacilityIds: updatedRelevantFacilityIds } =
        await this.validateFacility(requestFromFacilityId!, newFacilityName);

      relevantFacilityIds = updatedRelevantFacilityIds;
      newFacilityId = facility._id;
    }

    if (!relevantFacilityIds) {
      relevantFacilityIds = await getRelevantFacilityIds(
        requestFromFacilityId!
      );
    }

    const user: UserModel | null = await User.findOneAndUpdate(
      {
        _id: userId,
        role: requestForRole,
        facilityId: { $in: relevantFacilityIds },
      },
      {
        $set: {
          ...(newUsername && { username: newUsername }),
          ...(newPassword && { password: bcrypt.hashSync(newPassword, 10) }),
          ...(newName && { name: newName }),
          ...(newFacilityId && { facilityId: newFacilityId }),
          ...(newRole && { role: newRole }),
        },
      },
      { new: true }
    );

    if (!user) {
      throw new ResourceNotFoundError(
        new ErrorData(`User with id ${userId} not found`)
      );
    }

    return this.mapUserForResponse(user);
  }

  public async getUsersForFacility({
    facilityId,
    includeDescendants,
    requestByRole,
    requestForRole,
    requestFromFacilityId,
  }: {
    facilityId: string;
    includeDescendants: boolean;
    requestByRole: UserRole;
    requestForRole: UserRole;
    requestFromFacilityId?: string;
  }): Promise<UserModelForApiResponse[]> {
    checkPermissions({
      requestByRole,
      requestFromFacilityId,
      requestForRole,
      isManageRequest: false,
    });

    // checkPermissions would throw error if requestFromFacilityId was undefined
    await this.validateFacility(requestFromFacilityId!, undefined, facilityId);

    const filter: FilterQuery<UserModel> = {
      role: requestForRole,
      facilityId,
    };

    if (includeDescendants) {
      const getUsersFromFacilityIds = await getRelevantFacilityIds(facilityId);
      filter.facilityId = { $in: getUsersFromFacilityIds };
    }

    const users = await User.find(filter);

    return users.map((user) => this.mapUserForResponse(user));
  }

  private mapUserForResponse(user: UserModel): UserModelForApiResponse {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: ommitedPassword, ...userForResponse } = user.toObject({
      versionKey: false,
    });

    return userForResponse;
  }

  private async validateFacility(
    requestFromFacilityId: string,
    facilityName?: string,
    facilityId?: string
  ): Promise<{
    facility: FacilityModel;
    relevantFacilityIds: mongoose.Types.ObjectId[];
  }> {
    const facility = await Facility.findOne({
      ...(facilityName && { name: facilityName }),
      ...(facilityId && { _id: facilityId }),
    });

    if (!facility) {
      throw new ResourceNotFoundError(
        new ErrorData(
          `Facility with provided name ${facilityName} does not exist`
        )
      );
    }

    const relevantFacilityIds = await getRelevantFacilityIds(
      requestFromFacilityId
    );

    if (
      !relevantFacilityIds.some(
        (facilityObjectId) =>
          facilityObjectId.toString() === facility._id.toString()
      )
    ) {
      throw new ForbiddenError(
        new ErrorData(
          'User is not allowed to see or manage users in provided facility'
        )
      );
    }

    return { facility, relevantFacilityIds };
  }
}

export default UserService.getInstance();
