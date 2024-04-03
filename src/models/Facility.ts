import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';
import { FacilityType } from '../enums/FacilityType';

export interface FacilityModel extends Document {
  name: string;
  type: FacilityType;
  parentId?: ObjectId;
}

const FacilitySchema: Schema<FacilityModel> = new Schema({
  name: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: [FacilityType.STORE, FacilityType.OFFICE],
    required: true,
  },
  parentId: { type: Schema.Types.ObjectId, ref: 'Facility' },
});

const Facility: Model<FacilityModel> = mongoose.model<FacilityModel>(
  'Facility',
  FacilitySchema
);

export default Facility;
