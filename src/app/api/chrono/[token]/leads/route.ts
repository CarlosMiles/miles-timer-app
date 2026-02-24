// This API endpoint returns all leads assigned to a timer
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  try {
    // Find timer by access token
    const timer = await prisma.timer.findUnique({
      where: { accessToken: token },
    });

    if (!timer) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 });
    }

    // Get all assignments for this timer
    const assignments = await prisma.assignment.findMany({
      where: { timerId: timer.id },
      include: { lead: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      timer: {
        name: timer.name,
        companyName: timer.companyName,
        email: timer.email,
      },
      assignments: assignments.map((a) => ({
        id: a.id,
        leadId: a.leadId,
        eventName: a.lead.eventName,
        eventDate: a.lead.eventDate,
        city: a.lead.city,
        postcode: a.lead.postcode,
        participants: a.lead.participants,
        organizerName: a.lead.organizerName,
        organizerEmail: a.lead.organizerEmail,
        organizerPhone: a.lead.organizerPhone,
        notes: a.lead.notes,
        status: a.status,
        distanceKm: a.distanceKm,
        emailSentAt: a.emailSentAt,
        respondedAt: a.respondedAt,
      })),
    });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
