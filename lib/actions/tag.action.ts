"use server";

import { ActionResponse, ErrorResponse, PaginatedSearchParams } from "@/types/global";
import action from "@/lib/handlers/action";
import { PaginatedSearchParamsSchema } from "@/lib/validation";
import handleError from "@/lib/handlers/error";
import { FilterQuery } from "mongoose";
import Tag, { ITagDoc } from "@/database/tag.model";
import { escapeRegex } from "@/lib/utils";

export async function getTags(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    tags: ITagDoc[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({ params, schema: PaginatedSearchParamsSchema });

  if (validationResult instanceof Error) return handleError(validationResult) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<typeof Tag> = {};
  // Only include tags that have at least 1 associated question
  filterQuery.questions = { $gte: 1 };

  if (query) {
    const safe = escapeRegex(query);
    filterQuery.$or = [{ name: { $regex: new RegExp(safe, "i") } }];
  }

  let sortCriteria = {};

  switch (filter) {
    case "popular":
      sortCriteria = { questions: -1 };
      break;
    case "recent":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "name":
      sortCriteria = { name: 1 };
      break;
    default:
      sortCriteria = { questions: -1 };
      break;
  }

  try {
    const totalTags = await Tag.countDocuments(filterQuery);
    const tags = await Tag.find(filterQuery).sort(sortCriteria).skip(skip).limit(limit);

    const isNext = totalTags > skip + tags.length;

    return { success: true, data: { tags: JSON.parse(JSON.stringify(tags)), isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
