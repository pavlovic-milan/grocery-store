import { Router } from 'express';
import authController from '../controllers/authController';
import {
  loginSchema,
  signupSchema,
} from '../middewares/express-validator/authSchemas';
import validationErrorHandler from '../middewares/validationErrorHandler';

export default function registerAuthRoutes(): Router {
  const router = Router();

  router.post(
    '/login',
    loginSchema,
    validationErrorHandler,
    authController.login
  );

  router.post(
    '/signup',
    signupSchema,
    validationErrorHandler,
    authController.signup
  );

  return router;
}
