import { HttpResponseCode } from '../enums/HttpResponseCode';
import PublicError from './PublicError';

export default class BadRequestError extends PublicError {
  public httpStatusCode(): HttpResponseCode {
    return HttpResponseCode.BAD_REQUEST;
  }
}
