import React from "react";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import Image from "next/image";
import TagCard from "@/components/cards/TagCard";

const hotQuestions = [
  { _id: "1", title: "How to use React with TypeScript?" },
  { _id: "2", title: "How to use Next.js with TypeScript?" },
  { _id: "3", title: "How to use Tailwind CSS with TypeScript?" },
  { _id: "4", title: "How to use React Query with TypeScript?" },
  { _id: "5", title: "How to use React Router with TypeScript?" },
];

const popularTags = [
  {
    _id: "1",
    name: "react",
    questions: 100,
  },
  {
    _id: "2",
    name: "javascript",
    questions: 110,
  },
  {
    _id: "3",
    name: "typescript",
    questions: 120,
  },
  {
    _id: "4",
    name: "next.js",
    questions: 130,
  },
  {
    _id: "5",
    name: "three.js",
    questions: 150,
  },
];

const RightSidebar = () => {
  return (
    <section>
      <div className="no-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map(({ _id, title }) => {
            return (
              <Link
                key={_id}
                href={ROUTES.PROFILE(_id)}
                className="flex cursor-pointer items-center justify-between gap-7"
              >
                <p className="body-medium text-dark500_light700">{title}</p>

                <Image src="/icons/chevron-right.svg" alt="Chevron" width={16} height={16} className="invert-colors" />
              </Link>
            );
          })}
        </div>

        <div className="mt-16">
          <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>

          <div className="mt-7 flex flex-col gap-4">
            {popularTags.map(({ _id, name, questions }) => {
              return <TagCard key={_id} _id={_id} name={name} questions={questions} showCount compact />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
export default RightSidebar;
