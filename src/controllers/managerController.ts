import { NextFunction, Request, Response } from 'express';
import { HttpResponseCode } from '../enums/HttpResponseCode';
import { UserRole } from '../enums/UserRole';
import { AppRequest } from '../middewares/authenticate';
import UserService from '../services/UserService';

export default {
  getManager: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { userId: managerId } = req.params;
    const { role: requestedByRole, facilityId } = req.user!;

    try {
      const manager = await UserService.getUser(
        managerId,
        requestedByRole,
        UserRole.MANAGER,
        facilityId
      );

      res.status(HttpResponseCode.SUCCESS).json(manager);
    } catch (err) {
      next(err);
    }
  },

  deleteManager: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { userId: managerId } = req.params;
    const { role: requestedByRole, facilityId } = req.user!;

    try {
      await UserService.deleteUser(
        managerId,
        requestedByRole,
        UserRole.MANAGER,
        facilityId
      );

      res.status(HttpResponseCode.SUCCESS).json({});
    } catch (err) {
      next(err);
    }
  },

  createManager: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { username, password, name, facilityName } = req.body;
    const { role: requestByRole, facilityId } = req.user!;

    try {
      const manager = await UserService.createUser({
        username,
        password,
        role: UserRole.MANAGER,
        name,
        facilityName,
        requestByRole,
        requestFromFacilityId: facilityId,
      });

      res.status(HttpResponseCode.SUCCESS).json(manager);
    } catch (err) {
      next(err);
    }
  },

  updateManager: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { userId: managerId } = req.params;
    const { newUsername, newPassword, newRole, newName, newFacilityName } =
      req.body;
    const { role: requestByRole, facilityId } = req.user!;

    try {
      const manager = await UserService.updateUser({
        userId: managerId,
        newUsername,
        newPassword,
        newRole,
        newName,
        newFacilityName,
        requestByRole,
        requestForRole: UserRole.MANAGER,
        requestFromFacilityId: facilityId,
      });

      res.status(HttpResponseCode.SUCCESS).json(manager);
    } catch (err) {
      next(err);
    }
  },

  getManagersForFacility: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { facilityId } = req.params;
    const { includeDescendants } = req.query;
    const { role: requestByRole, facilityId: requestFromFacilityId } =
      req.user!;

    try {
      const managers = await UserService.getUsersForFacility({
        facilityId,
        includeDescendants: includeDescendants === 'true',
        requestByRole,
        requestForRole: UserRole.MANAGER,
        requestFromFacilityId,
      });

      res.status(HttpResponseCode.SUCCESS).json(managers);
    } catch (err) {
      next(err);
    }
  },
};
