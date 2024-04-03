import { UserRole } from '../../src/enums/UserRole';
import { UserModel } from '../../src/models/User';

export const mockUser = (
  overrides: Partial<UserModel> = {}
): Partial<UserModel> => ({
  _id: '1',
  username: 'username',
  name: 'name',
  password: 'password',
  role: UserRole.MANAGER,
  toObject: function () {
    return {
      _id: this._id,
      username: this.username,
      name: this.name,
      role: this.role,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  },
  ...overrides,
});
