import { Button } from "@/components/ui/button";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import LocalSearch from "@/components/search/LocalSearch";
import HomeFilter from "@/components/filters/HomeFilter";
import QuestionCard from "@/components/cards/QuestionCard";
import { api } from "@/lib/api";

const questions = [
  {
    _id: "1",
    title: "How to use React with TypeScript?",
    description: "How can I use React with TypeScript?",
    tags: [{ _id: "1", name: "react" }],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
    },
    upvotes: 100,
    answers: 20,
    views: 1000,
    createdAt: new Date("2021-09-01"),
  },

  {
    _id: "2",
    title: "What is the difference between useEffect and useLayoutEffect?",
    description: "When should I use useEffect vs useLayoutEffect in React?",
    tags: [{ _id: "2", name: "react-hooks" }],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
    },
    upvotes: 85,
    answers: 12,
    views: 750,
    createdAt: new Date(),
  },

  {
    _id: "3",
    title: "How to optimize Next.js performance?",
    description: "What techniques can help improve performance in a Next.js application?",
    tags: [{ _id: "3", name: "nextjs" }],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
    },
    upvotes: 120,
    answers: 30,
    views: 1500,
    createdAt: new Date(),
  },

  {
    _id: "4",
    title: "How to design a MongoDB schema?",
    description: "What are the best practices when designing MongoDB schemas?",
    tags: [{ _id: "4", name: "mongodb" }],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
    },
    upvotes: 65,
    answers: 8,
    views: 600,
    createdAt: new Date(),
  },

  {
    _id: "5",
    title: "How to write async functions in Node.js?",
    description: "What is the proper way to handle asynchronous operations in Node.js?",
    tags: [{ _id: "5", name: "nodejs" }],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
    },
    upvotes: 90,
    answers: 14,
    views: 820,
    createdAt: new Date(),
  },
];

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Home = async ({ searchParams }: SearchParams) => {
  // const session = await auth();
  const users = await api.users.getAll();

  console.log(users);

  const { query = "", filter = "" } = await searchParams;

  const lowerQuery = query?.toLowerCase() || "";
  const lowerFilter = filter?.toLowerCase() || "";

  const filteredQuestions = questions.filter(({ title, tags }) => {
    const matchesQuery = !lowerQuery || title?.toLowerCase().includes(lowerQuery);
    const matchesFilter = !lowerFilter || tags?.some((t) => t.name?.toLowerCase() === lowerFilter);
    return matchesQuery && matchesFilter;
  });

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button className="primary-gradient !text-light-900 min-h-[46px] px-4 py-3" asChild>
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch route="/" icon="/icons/search.svg" className="flex-1" placeholder="Search questions..." />
      </section>
      <HomeFilter />
      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredQuestions.map((question, _) => {
          return <QuestionCard key={question._id} question={question} />;
        })}
      </div>
    </>
  );
};

export default Home;
