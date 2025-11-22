import handleError from "@/lib/handlers/error";
import { APIErrorResponse } from "@/types/global";
import { UserSchema } from "@/lib/validation";
import User from "@/database/user.model";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  try {
    await dbConnect();

    const validatedData = UserSchema.partial().safeParse({ email });
    if (!validatedData.success) throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError("User");

    return Response.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
