import { HttpResponseCode } from '../enums/HttpResponseCode';
import ErrorData from './ErrorData';

export default abstract class PublicError extends Error {
  constructor(readonly errorData: ErrorData) {
    super(errorData.message);
  }

  public abstract httpStatusCode(): HttpResponseCode;
}
