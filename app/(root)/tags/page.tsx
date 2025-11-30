import React from "react";
import { getTags } from "@/lib/actions/tag.actions";

const Tags = async () => {
  const { success, data, error } = await getTags({
    page: 1,
    pageSize: 10,
    query: "nextjs",
  });

  const { tags } = data || {};

  return <div>{JSON.stringify(tags, null, 2)}</div>;
};
export default Tags;
