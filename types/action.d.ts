interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    name: string;
    username: string;
    email: string;
    image: string;
  };
}

interface AuthCredentials {
  username: string;
  name: string;
  email: string;
  password: string;
}

interface CreateQuestionsParams {
  title: string;
  content: string;
  tags: string[];
}

interface EditQuestionParams extends CreateQuestionsParams {
  questionId: string;
}

interface GetQuestionParams {
  questionId: string;
}

interface IncrementViewCountParams {
  questionId: string;
}

interface createVoteParams {
  targetId: string;
  targetType: "question" | "answer";
  voteType: "upvotes" | "downvotes";
}

interface UpdateVoteCountParams extends createVoteParams {
  change: number;
}

interface HasVotedParams {
  targetId: string;
  targetType: "question" | "answer";
}

interface HasVotedResponse {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}
