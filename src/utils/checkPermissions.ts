import { UserRole } from '../enums/UserRole';
import ErrorData from '../errors/ErrorData';
import ForbiddenError from '../errors/ForbiddenError';

export const checkPermissions = ({
  requestByRole,
  requestFromFacilityId,
  requestForRole,
  isManageRequest,
}: {
  requestByRole: UserRole;
  requestFromFacilityId?: string;
  requestForRole?: UserRole;
  isManageRequest: boolean;
}): void => {
  if (!requestFromFacilityId) {
    throw new ForbiddenError(
      new ErrorData(
        'Users that do not belong to any facility do not have permissions to see or manage other users'
      )
    );
  }

  if (requestByRole === UserRole.EMPLOYEE) {
    if (requestForRole === UserRole.MANAGER) {
      throw new ForbiddenError(
        new ErrorData(
          'Emplyees do not have permissions to see or manage managers'
        )
      );
    }

    if (isManageRequest) {
      throw new ForbiddenError(
        new ErrorData('Emplyees do not have permissions to manage users')
      );
    }
  }
};
