import { Router } from 'express';

import registerManagerRoutes from './managerRoutes';
import registerEmployeeRoutes from './employeeRoutes';
import registerAuthRoutes from './authRoutes';

export default function registerRoutes(router: Router): Router {
  router.use('/auth', registerAuthRoutes());
  router.use('/employees', registerEmployeeRoutes());
  router.use('/managers', registerManagerRoutes());
  return router;
}
