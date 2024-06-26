/* eslint-disable no-unused-vars */
import { Model, ObjectId } from 'mongoose';

export type TUser = {
  _id?: ObjectId;
  email: string;
  password: string;
  username: string;
  passwordChangedAt?: Date;
};

export interface UserModel extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser | null>;
  isUserExistsByUserName(username: string): Promise<TUser | null>;
  isPasswordMatched(
    plainTextPassword: string,
    hasPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}
