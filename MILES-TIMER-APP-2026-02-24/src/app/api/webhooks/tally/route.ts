// This API endpoint receives new leads from Tally forms
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  // Verify the webhook secret
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Parse the event date
    const eventDate = data.eventDate ? new Date(data.eventDate) : new Date();
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Create the lead in the database
    const lead = await prisma.lead.create({
      data: {
        eventName: data.eventName || "Événement sans nom",
        eventDate,
        city: data.city || "",
        postcode: data.postcode || "",
        participants: data.participants ? parseInt(data.participants) : null,
        discipline: data.discipline || null,
        notes: data.notes || null,
        organizerName: data.organizerName || "",
        organizerEmail: data.organizerEmail || "",
        organizerPhone: data.organizerPhone || null,
        status: "NOUVEAU",
      },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
