/* eslint-disable no-unsafe-optional-chaining */
import { JwtPayload } from 'jsonwebtoken';
import { TInteraction } from './interaction.interface';
import { User } from '../UsersRegistration/userRegistration.model';
import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { Interaction } from './interaction.model';
import { Post } from '../Posts/post.model';

const createInteractionIntoDB = async (
  payload: TInteraction,
  user: JwtPayload,
) => {
  const isUserExists = await User.findById({ _id: user._id });
  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const isPostExists = await Post.findById({ _id: payload?.postId });

  if (!isPostExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found!');
  }

  const isInteractionAlive = await Interaction.findOne({
    postId: payload?.postId,
  });

  if (!isInteractionAlive) {
    const data = {
      ...payload,
      interactionAuthId: isUserExists?._id,
      interactionNumber: 1,
    };
    const result = await Interaction.create(data);

    const actionData = {
      actions: isPostExists?.actions + 1,
      InteractedPeopleId: [isUserExists?._id],
    };
    await Post.findByIdAndUpdate({ _id: payload?.postId }, actionData, {
      new: true,
      runValidators: true,
    });
    return {
      message: 'Liked this post.',
      result,
    };
  }

  if (payload?.interactionType === 'like' && isUserExists && isPostExists) {
    const data = {
      interactionNumber: isInteractionAlive?.interactionNumber + 1,
    };
    const result = await Interaction.findOneAndUpdate(
      { postId: payload?.postId },
      data,
      {
        new: true,
        runValidators: true,
      },
    );

    const actionData = {
      actions: isPostExists?.actions + 1,
      InteractedPeopleId: [
        ...isPostExists?.InteractedPeopleId,
        `${isUserExists?._id}`,
      ],
      // isPostExists?.InteractedPeopleId?.push(`${user._id}`)
    };
    await Post.findByIdAndUpdate({ _id: payload?.postId }, actionData, {
      new: true,
      runValidators: true,
    });

    return {
      message: 'Liked this post.',
      result,
    };
  }

  if (payload?.interactionType === 'unlike') {
    const data = {
      interactionNumber: isInteractionAlive?.interactionNumber - 1,
    };
    const result = await Interaction.findOneAndUpdate(
      { postId: payload?.postId },
      data,
      {
        new: true,
        runValidators: true,
      },
    );

    const filteredInteractedPeopleId = isPostExists?.InteractedPeopleId?.filter(
      (id) => id !== `${user._id}`,
    );

    const actionData = {
      actions: isPostExists?.actions - 1,
      InteractedPeopleId: filteredInteractedPeopleId,
    };
    await Post.findByIdAndUpdate({ _id: payload?.postId }, actionData, {
      new: true,
      runValidators: true,
    });

    return {
      message: 'Unliked this post.',
      result,
    };
  }
};

export const InteractionServices = {
  createInteractionIntoDB,
};
