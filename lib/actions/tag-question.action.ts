"use server";

import { GetTagQuestionsSchema } from "@/lib/validation";
import { ActionResponse, ErrorResponse, GetTagQuestionsParams } from "@/types/global";
import Question, { IQuestionDoc } from "@/database/question.model";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import { FilterQuery } from "mongoose";
import TagQuestion from "@/database/tag-question.model";
import { escapeRegex } from "@/lib/utils";
import Tag, { ITagDoc } from "@/database/tag.model";

export async function getTagQuestions(params: GetTagQuestionsParams): Promise<
  ActionResponse<{
    tag: string;
    questions: IQuestionDoc[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({ params, schema: GetTagQuestionsSchema });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { page = 1, pageSize = 10, query, tagId } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<typeof Question> = {};

  if (query) {
    const safe = escapeRegex(query);
    filterQuery.title = { $regex: new RegExp(safe, "i") };
  }

  try {
    // Find all question IDs linked to the given tag
    const tag = (await Tag.findById(tagId).select("name").lean()) as unknown as ITagDoc;
    const tagLinks = await TagQuestion.find({ tag: tagId }).select("question").lean();

    const questionIds = tagLinks.map((tagLink) => tagLink.question);

    if (questionIds.length === 0) {
      return { success: true, data: { tag: tag.name, questions: [], isNext: false } };
    }

    // Merge the base query with the linked question IDs
    const baseQuery: FilterQuery<typeof Question> = { _id: { $in: questionIds }, ...filterQuery };

    const total = await Question.countDocuments(baseQuery);
    const questions = await Question.find(baseQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .skip(skip)
      .limit(limit);

    const isNext = total > skip + questions.length;

    return { success: true, data: { tag: tag.name, questions: JSON.parse(JSON.stringify(questions)), isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
