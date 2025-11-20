import { NextResponse } from "next/server";
import handleError from "@/lib/handlers/error";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import { ForbiddenError, ValidationError } from "@/lib/http-errors";
import Account from "@/database/account.model";

export async function GET() {
  try {
    await dbConnect();

    const accounts = await Account.find();

    return NextResponse.json({ success: true, data: accounts }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// Create Account
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    const validatedData = AccountSchema.safeParse(body);
    if (!validatedData.success) throw new ValidationError(validatedData.error?.flatten().fieldErrors);

    const { provider, providerAccountId } = validatedData.data;

    const existingAccount = await Account.findOne({
      provider,
      providerAccountId,
    });
    if (existingAccount) throw new ForbiddenError("An account with this provider already exists");

    const newAccount = await Account.create(validatedData.data);

    return NextResponse.json({ success: true, data: newAccount }, { status: 201 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
