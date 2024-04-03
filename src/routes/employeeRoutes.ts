import { Router } from 'express';
import employeeController from '../controllers/employeeController';
import authenticate from '../middewares/authenticate';
import { idParamSchema } from '../middewares/express-validator/idParamSchema';
import {
  createUserSchema,
  getUsersForFacilitySchema,
  updateUserSchema,
} from '../middewares/express-validator/userSchemas';
import validationErrorHandler from '../middewares/validationErrorHandler';

export default function registerEmployeeRoutes(): Router {
  const router = Router();

  router.get(
    '/:userId',
    authenticate,
    idParamSchema('userId'),
    validationErrorHandler,
    employeeController.getEmployee
  );

  router.delete(
    '/:userId',
    authenticate,
    idParamSchema('userId'),
    validationErrorHandler,
    employeeController.deleteEmployee
  );

  router.post(
    '/',
    authenticate,
    createUserSchema,
    validationErrorHandler,
    employeeController.createEmployee
  );

  router.patch(
    '/:userId',
    authenticate,
    updateUserSchema,
    validationErrorHandler,
    employeeController.updateEmployee
  );

  router.get(
    '/facility/:facilityId',
    authenticate,
    getUsersForFacilitySchema,
    validationErrorHandler,
    employeeController.getEmployeesForFacility
  );

  return router;
}
