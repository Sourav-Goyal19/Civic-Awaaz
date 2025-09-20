import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { corsHeaders } from "../headers";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "officer"));

    return NextResponse.json({
      message: "Officers Found Successfully",
      officers: users,
    });
  } catch (error) {
    console.error("OFFICERS[GET]:", error);
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
