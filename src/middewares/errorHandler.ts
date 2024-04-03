import { NextFunction, Response } from 'express';
import { HttpResponseCode } from '../enums/HttpResponseCode';
import PublicError from '../errors/PublicError';

export default async function errorHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Promise<void> {
  console.error(err);
  if (err instanceof PublicError) {
    res.status(err.httpStatusCode());
    res.json({ error: err.errorData.serialize() });
    return;
  }

  res.status(HttpResponseCode.INTERNAL_SERVER_ERROR);
  res.json('Internal server error');
}
