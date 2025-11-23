import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import handleError from "@/lib/handlers/error";
import { APIErrorResponse } from "@/types/global";
import { SignInWithOAuthSchema } from "@/lib/validation";
import { ValidationError } from "@/lib/http-errors";
import slugify from "slugify";
import User from "@/database/user.model";
import Account from "@/database/account.model";
import { NextResponse } from "next/server";

// POST endpoint for handling OAuth sign-in
export async function POST(request: Request) {
  // Parse body from incoming request
  const { provider, providerAccountId, user } = await request.json();

  // Ensure DB connection is established
  await dbConnect();

  // Start MongoDB transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate input using Zod schema
    const validatedData = SignInWithOAuthSchema.safeParse({ provider, providerAccountId, user });
    if (!validatedData.success) throw new ValidationError(validatedData.error.flatten().fieldErrors);

    // Extract user fields from payload
    const { name, username, email, image } = user;

    // Generate URL-safe slug for username
    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Check if user already exists by email
    let existingUser = await User.findOne({ email }).session(session);

    // If user doesn't exist → create them
    if (!existingUser) {
      [existingUser] = await User.create([{ name, username: slugifiedUsername, email, image }], { session });
    } else {
      // Prepare only updated fields (name/image)
      const updatedData: { name?: string; image?: string } = {};

      if (existingUser.name !== name) updatedData.name = name;
      if (existingUser.image !== image) updatedData.image = image;

      // Update user only if changes detected
      if (Object.keys(updatedData).length > 0)
        await User.updateOne({ _id: existingUser._id }, { $set: updatedData }).session(session);
    }

    // Check if this OAuth account is already linked to the user
    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session);

    // If account does not exist → create OAuth account entry
    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    }

    // Commit changes if no errors occurred
    await session.commitTransaction();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // Roll back all operations if an error happens
    await session.abortTransaction();
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    // Always end session after transaction
    await session.endSession();
  }
}
