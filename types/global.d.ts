import { NextResponse } from "next/server";

interface Tag {
  _id: string;
  name: string;
}

interface Author {
  _id: string;
  name: string;
  image: string;
}

interface Question {
  _id: string;
  title: string;
  tags: Tag[];
  author: Author;
  upvotes: number;
  answers: number;
  views: number;
  createdAt: Date;
}

// Base shape for all action responses (success or error)
type ActionResponse<T = null> = {
  success: boolean; // Indicates if the action succeeded or failed
  data?: T; // Returned data when successful
  errors?: {
    // Error details when unsuccessful
    message: string; // Main error message
    details?: Record<string, string[]>;
  };
  status?: number; // Optional HTTP-like status code
};

// Response type for successful actions (forces success: true)
type SuccessResponse<T = null> = ActionResponse<T> & { success: true };

// Response type for failed actions (forces success: false)
type ErrorResponse = ActionResponse<undefined> & { success: false };

// Next.js API response specifically for error responses
type APIErrorResponse = NextResponse<ErrorResponse>;

// Next.js API response for success OR error responses
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}
