import { body, query } from 'express-validator';
import { UserRole } from '../../enums/UserRole';
import { idParamSchema } from './idParamSchema';

export const createUserSchema = [
  body('username')
    .notEmpty()
    .withMessage('username is required field')
    .isString()
    .withMessage('username has to be a string'),
  body('password')
    .notEmpty()
    .withMessage('password is required field')
    .isString()
    .withMessage('password has to be a string')
    .isLength({ min: 5 })
    .withMessage('password must be at least 5 chars long'),
  body('name')
    .notEmpty()
    .withMessage('name is required field')
    .isString()
    .withMessage('name has to be a string'),
  body('facilityName')
    .notEmpty()
    .withMessage('facilityName is required field')
    .isString()
    .withMessage('facilityName has to be a string'),
];

export const updateUserSchema = [
  ...idParamSchema('userId'),
  body('newUsername')
    .optional()
    .isString()
    .withMessage('newUsername has to be a string'),
  body('newPassword')
    .isString()
    .optional()
    .withMessage('newPassword has to be a string')
    .isLength({ min: 5 })
    .withMessage('newPassword must be at least 5 chars long'),
  body('newName')
    .optional()
    .isString()
    .withMessage('newName has to be a string'),
  body('newRole')
    .optional()
    .custom((value) => {
      return Object.values(UserRole).includes(value);
    })
    .withMessage(
      `invalid new role provided, valid roles are [${UserRole.MANAGER}, ${UserRole.EMPLOYEE}]`
    ),
  body('newFacilityName')
    .optional()
    .isString()
    .withMessage('newFacilityName has to be a string'),
];

export const getUsersForFacilitySchema = [
  ...idParamSchema('facilityId'),
  query('includeDescendants')
    .optional()
    .isBoolean()
    .withMessage('includeDescendants must be a boolean value'),
];
