"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import { CreateVoteSchema, HasVotedSchema, UpdateVoteCountSchema } from "@/lib/validation";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import mongoose, { ClientSession } from "mongoose";
import { Answer, Question, Vote } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function updateVoteCount(params: UpdateVoteCountParams, session: ClientSession): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: UpdateVoteCountSchema });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { targetId, voteType, targetType, change } = validationResult.params!;

  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvotes" ? "upvotes" : "downvotes";

  try {
    const model = await Model.findById(targetId);
    const result = await Model.findByIdAndUpdate(
      targetId,
      {
        $inc: {
          [voteField]: change,
        },
      },
      { new: true, session }
    );

    if (!result) throw new Error("Failed to update vote count");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(params: createVoteParams): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { targetId, voteType, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) return handleError(new Error("User not logged in")) as ErrorResponse;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (existingVote) {
      if (existingVote && existingVote.voteType === voteType) {
        // If the vote type is the same, delete the existing vote
        await existingVote.deleteOne({ _id: existingVote._id }, session);
        // Update the vote count in the target document
        await updateVoteCount({ targetId, voteType, targetType, change: -1 }, session);
      } else {
        // If the user has already voted with a different voteType, update the vote
        await Vote.findByIdAndUpdate(existingVote._id, { voteType }, { new: true, session });

        // Decrement the existing voteType count
        await updateVoteCount({ targetId, targetType, voteType: existingVote.voteType, change: -1 }, session);
        // Increment the new voteType count
        await updateVoteCount({ targetId, targetType, voteType, change: 1 }, session);
      }
    } else {
      await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        { session }
      );
      await updateVoteCount({ targetId, targetType, voteType, change: 1 }, session);
    }

    revalidatePath(ROUTES.QUESTIONS(targetId));

    await session.commitTransaction();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  }
}

export async function hasVoted(params: HasVotedParams): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({ params, schema: HasVotedSchema, authorize: true });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const vote = await Vote.findOne({ author: userId, actionId: targetId, actionType: targetType });

    if (!vote) {
      return { success: true, data: { hasUpvoted: false, hasDownvoted: false } };
    }

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvotes",
        hasDownvoted: vote.voteType === "downvotes",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
