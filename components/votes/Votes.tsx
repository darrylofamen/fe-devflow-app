"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn, formatNumber } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { createVote } from "@/lib/actions/vote.action";

interface Props {
  targetId: string;
  targetType: "question" | "answer";
  upvotes: number;
  downvotes: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

const Votes = ({ targetId, targetType, upvotes, downvotes, hasUpvoted, hasDownvoted }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const session = useSession();
  const userId = session?.data?.user?.id;

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!userId) {
      return toast("Unauthorized", {
        description: "You need to be logged in to be able to vote",
        style: {
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
        },
      });
    }

    try {
      setIsLoading(true);

      const result = await createVote({
        targetId,
        voteType,
        targetType,
      });

      const successMessage =
        voteType === "upvote"
          ? `Upvote ${!hasUpvoted ? "added" : "removed"} successfully`
          : `Downvote ${!hasDownvoted ? "added" : "removed"} successfully`;

      toast(successMessage, {
        description: "Your vote has been recorded.",
        style: {
          backgroundColor: "#d4edda",
          color: "#155724",
          border: "1px solid #c3e6cb",
        },
      });
    } catch {
      return toast("Failed to vote", {
        description: "An error occured while voting. Please try again later.",
        style: {
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={hasUpvoted ? "/icons/upvoted.svg" : "/icons/upvote.svg"}
          alt="Upvote Icon"
          width={18}
          height={18}
          className={cn("cursor-pointer", isLoading && "opacity-50")}
          aria-label="Upvote"
          onClick={() => !isLoading && handleVote("upvote")}
        />
      </div>

      <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
        <p className="subtle-medium text-dark400_light900">{formatNumber(upvotes)}</p>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={hasDownvoted ? "/icons/downvoted.svg" : "/icons/downvote.svg"}
          alt="Downvote Icon"
          width={18}
          height={18}
          className={cn("cursor-pointer", isLoading && "opacity-50")}
          aria-label="Downvote"
          onClick={() => !isLoading && handleVote("downvote")}
        />
      </div>

      <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
        <p className="subtle-medium text-dark400_light900">{formatNumber(downvotes)}</p>
      </div>
    </div>
  );
};
export default Votes;
