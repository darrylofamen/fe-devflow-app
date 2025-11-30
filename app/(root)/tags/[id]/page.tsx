import React from "react";
import { Question, RouteParams } from "@/types/global";
import { getTagQuestions } from "@/lib/actions/tag-question.action";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";

const Page = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, query = "" } = await searchParams;

  const { success, data, error } = await getTagQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    tagId: id,
  });

  const { tag, questions } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">{tag}</h1>
      <section className="mt-11">
        <LocalSearch
          route={ROUTES.TAG(id)}
          icon="/icons/search.svg"
          placeholder="Search questions related to this tag..."
          iconPosition="left"
          className="flex-1"
        />

        <DataRenderer
          success={success}
          data={questions}
          error={error}
          empty={EMPTY_QUESTION}
          render={(questions) => (
            <div className="mt-10 flex w-full flex-col gap-6">
              {questions.map((question) => {
                return <QuestionCard key={question._id as string} question={question as unknown as Question} />;
              })}
            </div>
          )}
        />
      </section>
    </>
  );
};
export default Page;
