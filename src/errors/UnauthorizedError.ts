import { HttpResponseCode } from '../enums/HttpResponseCode';
import PublicError from './PublicError';

export default class UnauthorizedError extends PublicError {
  public httpStatusCode(): HttpResponseCode {
    return HttpResponseCode.UNAUTHORIZED;
  }
}
