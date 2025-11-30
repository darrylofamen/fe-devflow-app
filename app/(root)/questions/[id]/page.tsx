import { Question, RouteParams } from "@/types/global";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import Metric from "@/components/Metric";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import TagCard from "@/components/cards/TagCard";
import Preview from "@/components/editor/Preview";
import { getQuestion, incrementViewCount } from "@/lib/actions/question.action";
import { redirect } from "next/navigation";
import { after } from "next/server";
import AnswerForm from "@/components/forms/AnswerForm";

const QuestionDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  const { success, data } = await getQuestion({ questionId: id });

  // This will run after the response of await getQuestion is received and UI updates are rendered
  after(async () => {
    await incrementViewCount({
      questionId: id,
    });
  });

  const question = data as unknown as Question;

  if (!success || !question) return redirect("/404");

  const { author, createdAt, answers, views, tags, title, content } = question;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              className="size-[22px]"
              fallbackClassName="text-[10px]"
              image={author.image}
            />

            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">{author.name}</p>
            </Link>
          </div>

          <div className="flex justify-end">
            <p>Votes</p>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">{title}</h2>
      </div>

      <div className="mt-5 mb-8 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="Clock Icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="Message Icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="Eye Icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagCard key={tag._id} _id={tag._id as string} name={tag.name} compact />
        ))}
      </div>

      <section className="my-5">
        <AnswerForm />
      </section>
    </>
  );
};

export default QuestionDetails;
