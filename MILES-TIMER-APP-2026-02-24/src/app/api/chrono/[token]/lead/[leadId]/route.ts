// This API endpoint updates a timer's status for a lead
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOrganizerEmail } from "@/lib/email";

const VALID_STATUSES = [
  "A_CONTACTER",
  "EN_ATTENTE",
  "DEVIS_ENVOYE",
  "GAGNE",
  "PERDU",
  "PAS_DISPONIBLE",
];

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string; leadId: string } }
) {
  const { token, leadId } = params;

  try {
    // Find timer by access token
    const timer = await prisma.timer.findUnique({
      where: { accessToken: token },
    });

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
    const assignment = await prisma.assignment.findUnique({
      where: {
        leadId_timerId: { leadId, timerId: timer.id },
      },
      include: { lead: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Update assignment status
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: {
        status,
        respondedAt: new Date(),
      },
    });

    // If status is EN_ATTENTE (timer accepted), send intro email to organizer
    // Only if this is the first timer to accept
    if (status === "EN_ATTENTE") {
      // Check if any other timer has already accepted this lead
      const otherAccepted = await prisma.assignment.findFirst({
        where: {
          leadId,
          status: "EN_ATTENTE",
          timerId: { not: timer.id },
        },
      });

      // If no one else has accepted, send intro email
      if (!otherAccepted) {
        await sendOrganizerEmail(
          assignment.lead.organizerEmail,
          assignment.lead.organizerName,
          assignment.lead,
          timer
        );

        // Update lead status
        await prisma.lead.update({
          where: { id: leadId },
          data: { status: "EN_ATTENTE" },
        });
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
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
