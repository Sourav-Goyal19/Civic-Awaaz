import { db } from "@/db/drizzle";
import { corsHeaders } from "../headers";
import { assignmentsTable } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { complaintId, officerId, assignedBy } = body;

    const [assignment] = await db
      .insert(assignmentsTable)
      .values({
        complaintId,
        officerId,
        assignedBy,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Assignment done",
        assignment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ASSIGNMENTS[POST]:", error);
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
