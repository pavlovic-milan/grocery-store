import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../enums/UserRole';
import ErrorData from '../errors/ErrorData';
import ForbiddenError from '../errors/ForbiddenError';
import UnauthorizedError from '../errors/UnauthorizedError';

interface TokenPayload {
  userId: string;
  role: UserRole;
  faciityId?: string;
  iat: number;
  exp: number;
}

interface AppUser {
  _id: string;
  role: UserRole;
  facilityId?: string;
}

export interface AppRequest extends Request {
  user?: AppUser;
}

export default function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.replace('Bearer ', '') || null;

  if (!token) {
    next(
      new UnauthorizedError(new ErrorData('Authentication token is missing'))
    );
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET ?? 'jwt_secret', (err, decoded) => {
    if (err) {
      next(new ForbiddenError(new ErrorData('Authentication failed')));
      return;
    }
    const payload = decoded as TokenPayload;
    (req as AppRequest).user = {
      _id: payload.userId,
      role: payload.role,
      facilityId: payload.faciityId,
    };
    next();
  });
}
