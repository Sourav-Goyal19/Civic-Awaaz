import { db } from "@/db/drizzle";
import { corsHeaders } from "../headers";
import { assignmentsTable, complaintsTable, usersTable } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

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

    await db
      .update(complaintsTable)
      .set({
        status: "assigned",
      })
      .where(eq(complaintsTable.id, complaintId));

    await db
      .update(usersTable)
      .set({
        assignments: sql`${usersTable.assignments} + 1`,
      })
      .where(eq(usersTable.id, officerId));

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
