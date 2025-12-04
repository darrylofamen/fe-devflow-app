import React from "react";
import { getUsers } from "@/lib/actions/user.action";
import { RouteParams } from "@/types/global";

const Community = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query = "", filter = "" } = await searchParams;

  const { success, data: users } = await getUsers({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });

  console.log(users);

  return <div>Community</div>;
};
export default Community;
