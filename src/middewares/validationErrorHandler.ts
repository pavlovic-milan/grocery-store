import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import BadRequestError from '../errors/BadRequestError';
import ErrorData from '../errors/ErrorData';

export default async function validationErrorHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    next(
      new BadRequestError(
        new ErrorData(
          'Request validation failed.',
          validationErrors.array().map((e) => new ErrorData(`${e.msg}`))
        )
      )
    );
  } else {
    next();
  }
}
