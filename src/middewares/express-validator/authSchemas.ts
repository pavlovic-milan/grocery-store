import { body } from 'express-validator';
import { UserRole } from '../../enums/UserRole';

export const loginSchema = [
  body('username')
    .notEmpty()
    .withMessage('username is required field')
    .isString()
    .withMessage('username has to be a string'),
  body('password')
    .notEmpty()
    .withMessage('password is required field')
    .isString()
    .withMessage('password has to be a string'),
];

export const signupSchema = [
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
  body('confirmPassword')
    .notEmpty()
    .withMessage('confirmPassword is required field')
    .isString()
    .withMessage('confirmPassword has to be a string')
    .isLength({ min: 5 })
    .withMessage('confirmPassword must be at least 5 chars long'),
  body('name')
    .notEmpty()
    .withMessage('name is required field')
    .isString()
    .withMessage('name has to be a string'),
  body('role')
    .notEmpty()
    .withMessage('role is required field')
    .custom((value) => {
      return Object.values(UserRole).includes(value);
    })
    .withMessage(
      `invalid role provided, valid roles are [${UserRole.MANAGER}, ${UserRole.EMPLOYEE}]`
    ),
  body('facilityName')
    .notEmpty()
    .withMessage('facilityName is required field')
    .isString()
    .withMessage('facilityName has to be a string'),
];
