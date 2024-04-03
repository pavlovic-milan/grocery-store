import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';
import { UserRole } from '../enums/UserRole';

export interface UserModel extends Document {
  name: string;
  role: UserRole;
  username: string;
  password: string;
  facilityId?: ObjectId;
}

export interface UserModelForApiResponse {
  _id: ObjectId;
  name: string;
  role: UserRole;
  username: string;
  facilityId?: ObjectId;
}

const UserSchema: Schema<UserModel> = new Schema({
  name: { type: String, required: true },
  role: {
    type: String,
    enum: [UserRole.MANAGER, UserRole.EMPLOYEE],
    required: true,
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  facilityId: { type: Schema.Types.ObjectId, ref: 'Facility' },
});

const User: Model<UserModel> = mongoose.model<UserModel>('User', UserSchema);

export default User;
