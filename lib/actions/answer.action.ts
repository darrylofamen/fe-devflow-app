"use server";

import { AnswerServerSchema } from "@/lib/validation";
import { ActionResponse, AnswerServerSchemaParams, ErrorResponse } from "@/types/global";
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
