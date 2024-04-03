import { NextFunction, Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { HttpResponseCode } from '../enums/HttpResponseCode';

export default {
  login: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { username, password } = req.body;

    try {
      const accessToken = await AuthService.login(username, password);

      res
        .status(HttpResponseCode.SUCCESS)
        .json({ message: 'Login successful', accessToken });
    } catch (err) {
      next(err);
    }
  },

  signup: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { username, password, confirmPassword, name, role, facilityName } =
      req.body;

    try {
      const accessToken = await AuthService.signup(
        username,
        password,
        confirmPassword,
        name,
        role,
        facilityName
      );

      res
        .status(HttpResponseCode.SUCCESS)
        .json({ message: 'Signup successful', accessToken });
    } catch (err) {
      next(err);
    }
  },
};
