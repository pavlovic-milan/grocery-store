import { HttpResponseCode } from '../enums/HttpResponseCode';
import PublicError from './PublicError';

export default class ResourceNotFoundError extends PublicError {
  public httpStatusCode(): HttpResponseCode {
    return HttpResponseCode.NOT_FOUND;
  }
}
