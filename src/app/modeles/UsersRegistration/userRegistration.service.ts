import httpStatus from 'http-status';
import { TUser } from './userRegistration.interface';
import AppError from '../../errors/appError';
import { User } from './userRegistration.model';

const createUserIntoDB = async (payload: TUser) => {
  const { email, username } = payload;
  const userExists = await User.findOne({ email });
  const userUsernameExists = await User.findOne({ username });

  if (userExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User already exists! Duplicate email.',
    );
  }

  if (userUsernameExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User already exists! Duplicate username.',
    );
  }

  const data = {
    ...payload,
    passwordChangedAt: new Date(),
  };

  const user = await User.create(data);

  if (user) {
    const result = await User.aggregate([
      {
        $match: { email: user?.email },
      },
      {
        $project: {
          password: 0,
          passwordChangedAt: 0,
          __v: 0,
        },
      },
    ]);
    return result[0];
  }
};

export const UserServices = {
  createUserIntoDB,
};
