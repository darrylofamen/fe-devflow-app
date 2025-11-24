"use server";

import { ActionResponse, ErrorResponse, PaginatedSearchParams } from "@/types/global";
import action from "@/lib/handlers/action";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  PaginatedSearchParamsSchema,
} from "@/lib/validation";
import handleError from "@/lib/handlers/error";
import mongoose, { FilterQuery } from "mongoose";
import Question, { IQuestionDoc } from "@/database/question.model";
import Tag, { ITagDoc } from "@/database/tag.model";
import TagQuestion, { ITagQuestion } from "@/database/tag-question.model";

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

export async function editQuestion(params: EditQuestionParams): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({ params, schema: EditQuestionSchema, authorize: true });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the question being edited, including its current tags
    const question = await Question.findById(questionId).populate("tags");

    if (!question) throw new Error("Question not found");

    // Only the original author can edit the question
    if (question.author.toString() !== userId) throw new Error("You are not authorized to edit this question");

    // Only update title/content if they were actually changed
    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      // Save the basic question changes inside the transaction
      await question.save({ session });
    }

    // --- TAG PROCESSING SECTION ---

    // Determine which tags should be ADDED:
    // If the incoming tag is not already in question.tags (case insensitive)
    const tagsToAdd = tags.filter(
      (tag) => !question.tags?.map((t: ITagDoc) => t.name.toLowerCase()).includes(tag.toLowerCase())
    );

    // Determine which tags should be REMOVED:
    // Any existing tag on the question that is not present in the new tag list
    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) => !tags?.map((t) => t?.toLowerCase()).includes(tag.name.toLowerCase())
    );

    // Prepare array for new TagQuestion relation documents
    const newTagQuestionDocuments: ITagQuestion[] = [];

    // --- ADD TAG LOGIC ---
    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        // Find existing Tag by name (case insensitive)
        // If not found → create it. Also increment its question count.
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );

        // Create an entry for the TagQuestion model
        if (existingTag) {
          newTagQuestionDocuments.push({
            tag: existingTag._id,
            question: question._id,
          });
        }

        // Add the tag ID to the array of new tags
        question.tags.push(existingTag._id);
      }
    }

    // --- REMOVE TAG LOGIC ---
    if (tagsToRemove.length > 0) {
      // Extract IDs of tags being removed
      const tagIdsToRemove = tagsToRemove.map((t: ITagDoc) => t._id);

      // Decrease the "questions" count for each removed tag
      await Tag.updateMany({ _id: { $in: tagIdsToRemove } }, { $inc: { questions: -1 } }, { session });

      // Remove TagQuestion relationships linking these tags to this question
      await TagQuestion.deleteMany({ tag: { $in: tagIdsToRemove }, question: questionId }, { session });

      // If there are tags removed, update the question's tags array using the new set of tag IDs
      question.tags = question.tags?.filter(
        (tag: mongoose.Types.ObjectId) => !tag.toString().includes(tagIdsToRemove.toString())
      );
    }

    // Insert all new TagQuestion mapping documents
    if (newTagQuestionDocuments.length > 0) {
      await TagQuestion.insertMany(newTagQuestionDocuments, { session });
    }

    // Save final question updates (tag array)
    await question.save({ session });

    // Commit the transaction — all changes become permanent
    await session.commitTransaction();

    // Return an updated question
    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    // Rollback everything if an error happened
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    // End session regardless of success/failure
    await session.endSession();
  }
}

export async function getQuestion(params: GetQuestionParams): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({ params, schema: GetQuestionSchema, authorize: true });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId).populate("tags");

    if (!question) throw new Error("Question not found");

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getQuestions(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    questions: IQuestionDoc[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({ params, schema: PaginatedSearchParamsSchema });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<typeof Question> = {};

  if (filter === "recommended") return { success: true, data: { questions: [], isNext: false } };

  if (query) {
    filterQuery.$or = [{ title: { $regex: new RegExp(query, "i") } }, { content: { $regex: new RegExp(query, "i") } }];
  }

  let sortCriteria = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "unanswered":
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalQuestions = await Question.countDocuments(filterQuery);
    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;

    return { success: true, data: { questions: JSON.parse(JSON.stringify(questions)), isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
