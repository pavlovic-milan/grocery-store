import { HttpResponseCode } from '../enums/HttpResponseCode';
import PublicError from './PublicError';

export default class ConflictError extends PublicError {
  public httpStatusCode(): HttpResponseCode {
    return HttpResponseCode.CONFLICT;
  }
}
