import handleError from "@/lib/handlers/error";
import { APIErrorResponse } from "@/types/global";
import dbConnect from "@/lib/mongoose";
import User from "@/database/user.model";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { NextResponse } from "next/server";
import { UserSchema } from "@/lib/validation";

// GET api/users/:id
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();

    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User");

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// DELETE api/users/:id
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new NotFoundError("User");

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// PUT api/users/:id
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();

    const body = await request.json();

    const validatedData = UserSchema.partial().safeParse(body);
    if (!validatedData.success) throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const updatedUser = await User.findByIdAndUpdate(id, validatedData.data, { new: true });
    if (!updatedUser) throw new NotFoundError("User");

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
