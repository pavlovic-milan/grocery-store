import { param } from 'express-validator';
import mongoose from 'mongoose';

export const idParamSchema = (idParamName: string) => [
  param(idParamName)
    .notEmpty()
    .withMessage(`${idParamName} is required`)
    .custom((value: string) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`${idParamName} must be a valid ObjectId`),
];
