"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "@/lib/handlers/action";
import { AskQuestionSchema } from "@/lib/validation";
import handleError from "@/lib/handlers/error";
import mongoose from "mongoose";
import Question, { IQuestionDoc } from "@/database/question.model";
import Tag from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";

export async function createQuestion(params: CreateQuestionsParams): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({ params, schema: AskQuestionSchema, authorize: true });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [question] = await Question.create([{ title, content, author: userId }], { session });

    if (!question) throw new Error("Failed to create question");

    // Create an array to store the tag IDs
    const tagsIds: mongoose.Types.ObjectId[] = [];
    // Create an array to store the tag-question documents
    const tagQuestionDocuments = [];

    for (const tag of tags) {
      // Find an existing tag by name (case-insensitive).
      // If found → update it. If not found → insert it.
      const existingTag = await Tag.findOneAndUpdate(
        {
          // Match the tag name exactly but ignore case
          name: { $regex: new RegExp(`^${tag}$`, "i") },
        },
        {
          // Only set the name if a new document is created
          $setOnInsert: { name: tag },

          // Increment the "questions" count whether found or inserted
          $inc: { questions: 1 },
        },
        {
          // Create a new tag if no match is found
          upsert: true,

          // Return the updated/new document instead of the old one
          new: true,

          // Run the operation within the active transaction session
          session,
        }
      );

      tagsIds.push(existingTag._id);
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    // Insert the tag-question documents into the database
    await TagQuestion.insertMany(tagQuestionDocuments, { session });

    // Update the question with the array of tag IDs
    await Question.findByIdAndUpdate(question._id, { $push: { tags: { $each: tagsIds } } }, { session, new: true });

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
