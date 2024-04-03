import { checkPermissions } from '../../../src/utils/checkPermissions';
import { UserRole } from '../../../src/enums/UserRole';
import ForbiddenError from '../../../src/errors/ForbiddenError';

describe('checkPermissions unit tests', () => {
  it('will throw ForbiddenError if requestFromFacilityId is not provided', () => {
    // arrange
    const inputParams = {
      requestByRole: UserRole.MANAGER,
      requestFromFacilityId: undefined,
      requestForRole: UserRole.EMPLOYEE,
      isManageRequest: false,
    };

    // act & assert
    expect(() => checkPermissions(inputParams)).toThrow(ForbiddenError);
  });

  it('will throw ForbiddenError if requestByRole is EMPLOYEE and requestForRole is MANAGER', () => {
    // arrange
    const inputParams = {
      requestByRole: UserRole.EMPLOYEE,
      requestFromFacilityId: 'facilityId',
      requestForRole: UserRole.MANAGER,
      isManageRequest: false,
    };

    // act & assert
    expect(() => checkPermissions(inputParams)).toThrow(ForbiddenError);
  });

  it('will throw ForbiddenError if requestByRole is EMPLOYEE and isManageRequest is true', () => {
    // arrange
    const inputParams = {
      requestByRole: UserRole.EMPLOYEE,
      requestFromFacilityId: 'facilityId',
      requestForRole: UserRole.EMPLOYEE,
      isManageRequest: true,
    };

    // act & assert
    expect(() => checkPermissions(inputParams)).toThrow(ForbiddenError);
  });

  it('will not throw if requestFromFacilityId is provided and requestByRole is not EMPLOYEE', () => {
    // arrange
    const inputParams = {
      requestByRole: UserRole.MANAGER,
      requestFromFacilityId: 'facilityId',
      requestForRole: UserRole.EMPLOYEE,
      isManageRequest: false,
    };

    // act & assert
    expect(() => checkPermissions(inputParams)).not.toThrow();
  });
});
