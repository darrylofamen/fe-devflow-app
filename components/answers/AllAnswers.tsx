import React from "react";
import { ActionResponse, Answer } from "@/types/global";
import { IAnswerDoc } from "@/database/answer.model";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_ANSWERS } from "@/constants/states";
import AnswerCard from "@/components/cards/AnswerCard";

interface Props extends ActionResponse<IAnswerDoc[]> {
  totalAnswers: number;
}

const AllAnswers = ({ data, success, error, totalAnswers }: Props) => {
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers === 1 ? `${totalAnswers} Answer` : `${totalAnswers} Answers`}
        </h3>
        <p>Filters</p>
      </div>

      <DataRenderer
        success={success}
        data={data as unknown as Answer[]}
        empty={EMPTY_ANSWERS}
        render={(answers: Answer[]) => answers.map((answer) => <AnswerCard key={answer._id as string} {...answer} />)}
      />
    </div>
  );
};
export default AllAnswers;
