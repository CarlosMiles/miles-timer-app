import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOrganizerEmail } from "@/lib/email";

const VALID_STATUSES = [
  "NON_DISPONIBLE",
  "DISPONIBLE",
  "DEVIS_ENVOYE",
  "GAGNE",
  "PERDU",
];

// GET - Get assignment details
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string; leadId: string } }
) {
  const { token, leadId } = params;

  try {
    // Find timer by access token
    const timers = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Timer" WHERE "accessToken" = $1 LIMIT 1`,
      token
    );
    const timer = Array.isArray(timers) ? timers[0] : null;

    if (!timer) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 });
    }

    // Get assignment
    const assignments = await prisma.$queryRawUnsafe(
      `SELECT a.*, l."eventName", l."eventDate", l."city", l."postcode", 
              l."participants", l."organizerName", l."organizerEmail"
       FROM "Assignment" a 
       JOIN "Lead" l ON a."leadId" = l.id 
       WHERE a."leadId" = $1 AND a."timerId" = $2 LIMIT 1`,
      leadId,
      timer.id
    );
    const assignment = Array.isArray(assignments) ? assignments[0] : null;

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Get assignment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// POST - Update status
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string; leadId: string } }
) {
  const { token, leadId } = params;

  try {
    // Find timer by access token
    const timers = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Timer" WHERE "accessToken" = $1 LIMIT 1`,
      token
    );
    const timer = Array.isArray(timers) ? timers[0] : null;

    if (!timer) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 });
    }

    // Get request body
    const body = await req.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status", validStatuses: VALID_STATUSES },
        { status: 400 }
      );
    }

    // Find assignment
    const assignments = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Assignment" WHERE "leadId" = $1 AND "timerId" = $2 LIMIT 1`,
      leadId,
      timer.id
    );
    const assignment = Array.isArray(assignments) ? assignments[0] : null;

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Update assignment status
    await prisma.$executeRawUnsafe(
      `UPDATE "Assignment" SET "status" = $1, "respondedAt" = NOW() WHERE "id" = $2`,
      status,
      assignment.id
    );

    // If status is DISPONIBLE, send intro email to organizer
    if (status === "DISPONIBLE") {
      // Get lead info
      const leads = await prisma.$queryRawUnsafe(
        `SELECT * FROM "Lead" WHERE "id" = $1 LIMIT 1`,
        leadId
      );
      const lead = Array.isArray(leads) ? leads[0] : null;

      if (lead) {
        await sendOrganizerEmail(
          lead.organizerEmail,
          lead.organizerName,
          lead,
          timer
        );
      }
    }

    return NextResponse.json({
      success: true,
      status,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Failed to update status", details: String(error) },
      { status: 500 }
    );
  }
}
