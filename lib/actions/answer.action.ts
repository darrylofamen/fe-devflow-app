"use server";

import { AnswerServerSchema, GetAnswersSchema } from "@/lib/validation";
import { ActionResponse, AnswerServerSchemaParams, ErrorResponse, GetAnswersByQuestionIdParams } from "@/types/global";
import Answer, { IAnswerDoc } from "@/database/answer.model";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import mongoose from "mongoose";
import { Question } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function createAnswer(params: AnswerServerSchemaParams): Promise<ActionResponse<IAnswerDoc>> {
  const validationResult = await action({ params, schema: AnswerServerSchema, authorize: true });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { questionId, content } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);

    if (!question) throw new Error("Question not found");

    const [answer] = await Answer.create([{ author: userId, question: questionId, content }], { session });

    if (!answer) throw new Error("Failed to create answer");

    // Increment the question's "answers" count'
    question.answers += 1;
    await question.save({ session });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTIONS(questionId));

    return { success: true, data: JSON.parse(JSON.stringify(answer)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAnswers(params: GetAnswersByQuestionIdParams): Promise<
  ActionResponse<{
    answers: IAnswerDoc[];
    totalAnswers: number;
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetAnswersSchema,
  });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { questionId } = validationResult.params!;

  const { page = 1, pageSize = 10, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  let sortCriteria = {};

  switch (filter) {
    case "latest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "highestUpvotes":
      sortCriteria = { upvotes: -1 };
      break;
    case "lowestUpvotes":
      sortCriteria = { upvotes: 1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalAnswers = await Answer.countDocuments({ question: questionId });
    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id name image")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalAnswers > skip + answers.length;

    return { success: true, data: { answers: JSON.parse(JSON.stringify(answers)), totalAnswers, isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
