import { NextFunction, Request, Response } from 'express';
import { HttpResponseCode } from '../enums/HttpResponseCode';
import { UserRole } from '../enums/UserRole';
import { AppRequest } from '../middewares/authenticate';
import UserService from '../services/UserService';

export default {
  getEmployee: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { userId: employeeId } = req.params;
    const { role: requestedByRole, facilityId } = req.user!;

    try {
      const employee = await UserService.getUser(
        employeeId,
        requestedByRole,
        UserRole.EMPLOYEE,
        facilityId
      );

      res.status(HttpResponseCode.SUCCESS).json(employee);
    } catch (err) {
      next(err);
    }
  },

  deleteEmployee: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { userId: employeeId } = req.params;
    const { role: requestedByRole, facilityId } = req.user!;

    try {
      await UserService.deleteUser(
        employeeId,
        requestedByRole,
        UserRole.EMPLOYEE,
        facilityId
      );

      res.status(HttpResponseCode.SUCCESS).json({});
    } catch (err) {
      next(err);
    }
  },

  createEmployee: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { username, password, name, facilityName } = req.body;
    const { role: requestByRole, facilityId } = req.user!;

    try {
      const employee = await UserService.createUser({
        username,
        password,
        role: UserRole.EMPLOYEE,
        name,
        facilityName,
        requestByRole,
        requestFromFacilityId: facilityId,
      });

      res.status(HttpResponseCode.SUCCESS).json(employee);
    } catch (err) {
      next(err);
    }
  },

  updateEmployee: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { userId: employeeId } = req.params;
    const { newUsername, newPassword, newRole, newName, newFacilityName } =
      req.body;
    const { role: requestByRole, facilityId } = req.user!;

    try {
      const employee = await UserService.updateUser({
        userId: employeeId,
        newUsername,
        newPassword,
        newRole,
        newName,
        newFacilityName,
        requestByRole,
        requestForRole: UserRole.EMPLOYEE,
        requestFromFacilityId: facilityId,
      });

      res.status(HttpResponseCode.SUCCESS).json(employee);
    } catch (err) {
      next(err);
    }
  },

  getEmployeesForFacility: async (
    req: AppRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { facilityId } = req.params;
    const { includeDescendants } = req.query;
    const { role: requestByRole, facilityId: requestFromFacilityId } =
      req.user!;

    try {
      const employees = await UserService.getUsersForFacility({
        facilityId,
        includeDescendants: includeDescendants === 'true',
        requestByRole,
        requestForRole: UserRole.EMPLOYEE,
        requestFromFacilityId,
      });

      res.status(HttpResponseCode.SUCCESS).json(employees);
    } catch (err) {
      next(err);
    }
  },
};
