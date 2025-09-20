import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { corsHeaders } from "../../headers";

const signUpSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "officer", "citizen"]),
  name: z.string().min(1, "Name is required"),
});

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = signUpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.message,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const { email, password, name, role } = validation.data;

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email already in use",
        },
        {
          status: 409,
          headers: corsHeaders,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        email,
        password: hashedPassword,
        name,
        role,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Sign up successful",
        user: newUser,
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
