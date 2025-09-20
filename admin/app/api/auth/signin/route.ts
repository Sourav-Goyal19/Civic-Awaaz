import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { corsHeaders } from "../../headers";

const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = signInSchema.safeParse(body);

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

    const { email, password } = validation.data;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Sign in successful",
        user,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Sign in error:", error);
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
