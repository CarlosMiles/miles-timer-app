import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  try {
    // Find timer by access token using raw SQL
    const timers = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Timer" WHERE "accessToken" = $1 LIMIT 1`,
      token
    );
    const timer = Array.isArray(timers) ? timers[0] : null;

    if (!timer) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 });
    }

    // Get all assignments for this timer with lead info
    const assignments = await prisma.$queryRawUnsafe(
      `SELECT a.*, l."eventName", l."eventDate", l."city", l."postcode", 
              l."participants", l."organizerName", l."organizerEmail"
       FROM "Assignment" a 
       JOIN "Lead" l ON a."leadId" = l.id 
       WHERE a."timerId" = $1 
       ORDER BY a."createdAt" DESC`,
      timer.id
    );

    return NextResponse.json({
      timer: {
        name: timer.name,
        email: timer.email,
      },
      assignments: (Array.isArray(assignments) ? assignments : []).map((a: any) => ({
        id: a.id,
        leadId: a.leadId,
        eventName: a.eventName,
        eventDate: a.eventDate,
        city: a.city,
        postcode: a.postcode,
        participants: a.participants,
        organizerName: a.organizerName,
        organizerEmail: a.organizerEmail,
        status: a.status,
        distanceKm: a.distanceKm,
        emailSentAt: a.emailSentAt,
        respondedAt: a.respondedAt,
      })),
    });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", details: String(error) },
      { status: 500 }
    );
  }
}
