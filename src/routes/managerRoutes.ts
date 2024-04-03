import { Router } from 'express';
import managerController from '../controllers/managerController';
import authenticate from '../middewares/authenticate';
import { idParamSchema } from '../middewares/express-validator/idParamSchema';
import {
  createUserSchema,
  getUsersForFacilitySchema,
  updateUserSchema,
} from '../middewares/express-validator/userSchemas';
import validationErrorHandler from '../middewares/validationErrorHandler';

export default function registerManagerRoutes(): Router {
  const router = Router();

  router.get(
    '/:userId',
    authenticate,
    idParamSchema('userId'),
    validationErrorHandler,
    managerController.getManager
  );

  router.delete(
    '/:userId',
    authenticate,
    idParamSchema('userId'),
    validationErrorHandler,
    managerController.deleteManager
  );

  router.post(
    '/',
    authenticate,
    createUserSchema,
    validationErrorHandler,
    managerController.createManager
  );

  router.patch(
    '/:userId',
    authenticate,
    updateUserSchema,
    validationErrorHandler,
    managerController.updateManager
  );

  router.get(
    '/facility/:facilityId',
    authenticate,
    getUsersForFacilitySchema,
    validationErrorHandler,
    managerController.getManagersForFacility
  );

  return router;
}
