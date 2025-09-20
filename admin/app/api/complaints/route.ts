import { z } from "zod";
import { db } from "@/db/drizzle";
import { corsHeaders } from "../headers";
import { complaintsTable, usersTable } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const complaints = await db.select().from(complaintsTable);
    // .innerJoin(usersTable, eq(complaintsTable.createdBy, usersTable.id));

    // console.log(complaints);

    return NextResponse.json(
      {
        message: "Complaints Found Successfully",
        complaints,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("COMPLAINTS[GET]:", error);
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

const complaintSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(500),
  location: z.string().min(5).max(200),
  category: z.string().min(1),
  images: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        data: z.string(),
      })
    )
    .optional(),
  status: z.string().default("pending"),
  createdBy: z.uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = complaintSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    const { title, description, location, images, status, createdBy } =
      validation.data;

    // const imageUrls = images ? JSON.stringify(images) : null;

    const [complaint] = await db
      .insert(complaintsTable)
      .values({
        title,
        description,
        location,
        status,
        createdBy,
        // images: imageUrls,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Complaint submitted successfully",
        complaint,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Complaint submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit complaint. Please try again." },
      { status: 500, headers: corsHeaders }
    );
  }
}
