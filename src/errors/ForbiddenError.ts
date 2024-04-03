import { HttpResponseCode } from '../enums/HttpResponseCode';
import PublicError from './PublicError';

export default class ForbiddenError extends PublicError {
  public httpStatusCode(): HttpResponseCode {
    return HttpResponseCode.FORBIDDEN;
  }
}
