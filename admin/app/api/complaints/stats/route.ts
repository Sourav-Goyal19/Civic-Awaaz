import { db } from "@/db/drizzle";
import { complaintsTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "../../headers";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) filter (where ${complaintsTable.status} = 'pending')`,
        resolved: sql<number>`count(*) filter (where ${complaintsTable.status} = 'resolved')`,
        assigned: sql<number>`count(*) filter (where ${complaintsTable.status} = 'assigned')`,
      })
      .from(complaintsTable);

    return NextResponse.json(
      {
        message: "Stats Found Successfully",
        stats,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Complaint submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit complaint. Please try again." },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Select count(*) as total, count(*) as pending where status = 'pending'
