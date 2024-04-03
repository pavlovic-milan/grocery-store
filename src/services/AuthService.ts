import bcrypt from 'bcrypt';
import ResourceNotFoundError from '../errors/ResourceNotFoundError';
import UnauthorizedError from '../errors/UnauthorizedError';
import User, { UserModel } from '../models/User';
import jwt from 'jsonwebtoken';
import ErrorData from '../errors/ErrorData';
import BadRequestError from '../errors/BadRequestError';
import ConflictError from '../errors/ConflictError';
import { UserRole } from '../enums/UserRole';
import Facility from '../models/Facility';

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(username: string, password: string): Promise<string> {
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      throw new UnauthorizedError(
        new ErrorData(`Invalid username or password`)
      );
    }
    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError(
        new ErrorData('Invalid username or password')
      );
    }

    const accessToken = this.generateAccessToken(user);

    return accessToken;
  }

  public async signup(
    username: string,
    password: string,
    confirmPassword: string,
    name: string,
    role: UserRole,
    facilityName: string
  ): Promise<string> {
    if (password.trim() !== confirmPassword.trim()) {
      throw new BadRequestError(
        new ErrorData('Provided passwords do not match')
      );
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      throw new ConflictError(
        new ErrorData(`User with same username already exists`)
      );
    }

    const facility = await Facility.findOne({
      name: facilityName,
    });

    if (!facility) {
      throw new ResourceNotFoundError(
        new ErrorData(
          `Facility with provided name ${facilityName} does not exist`
        )
      );
    }

    const user = await User.create({
      name,
      role,
      username: username.trim(),
      password: bcrypt.hashSync(password.trim(), 10),
      facilityId: facility._id,
    });

    const accessToken = this.generateAccessToken(user);

    return accessToken;
  }

  private generateAccessToken(user: UserModel): string {
    return jwt.sign(
      { userId: user._id, role: user.role, faciityId: user.facilityId },
      process.env.JWT_SECRET ?? 'jwt_secret',
      {
        expiresIn: '1h',
      }
    );
  }
}

export default AuthService.getInstance();
