// This API endpoint finds timers within 300km and sends them emails
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geocodePostcode, distanceKm } from "@/lib/geo";
import { sendTimerEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin token
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leadId = params.id;

  try {
    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Geocode the lead location if needed
    let leadLat = lead.lat;
    let leadLng = lead.lng;

    if (!leadLat || !leadLng) {
      const geo = await geocodePostcode(lead.postcode);
      if (geo) {
        leadLat = geo.lat;
        leadLng = geo.lng;
        await prisma.lead.update({
          where: { id: leadId },
          data: { lat: leadLat, lng: leadLng },
        });
      }
    }

    if (!leadLat || !leadLng) {
      return NextResponse.json(
        { error: "Could not geocode lead location" },
        { status: 400 }
      );
    }

    // Get all active timers with location (exclude only "Refused")
    const timers = await prisma.timer.findMany({
      where: {
        isActive: true,
        lat: { not: null },
        lng: { not: null },
        partnerStatus: {
          not: "No Partner – Refused",
        },
      },
    });

    // Find timers within 300km
    const nearbyTimers = timers
      .map((timer) => ({
        timer,
        distance: distanceKm(
          { lat: leadLat!, lng: leadLng! },
          { lat: timer.lat!, lng: timer.lng! }
        ),
      }))
      .filter((t) => t.distance <= 300)
      .sort((a, b) => a.distance - b.distance);

    // Create assignments and send emails
    const results = [];
    for (const { timer, distance } of nearbyTimers) {
      // Check if assignment already exists
      const existing = await prisma.assignment.findUnique({
        where: {
          leadId_timerId: { leadId, timerId: timer.id },
        },
      });

      if (existing) continue;

      // Create assignment
      const assignment = await prisma.assignment.create({
        data: {
          leadId,
          timerId: timer.id,
          distanceKm: distance,
          status: "A_CONTACTER",
        },
      });

      // Send email
      const emailResult = await sendTimerEmail(
        timer.email,
        timer.name,
        lead,
        timer.accessToken
      );

      if (emailResult.success) {
        await prisma.assignment.update({
          where: { id: assignment.id },
          data: { emailSentAt: new Date() },
        });
      }

      results.push({
        timer: timer.name,
        email: timer.email,
        distance: Math.round(distance),
        emailSent: emailResult.success,
      });
    }

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "TIMERS_CONTACTES" },
    });

    return NextResponse.json({
      success: true,
      timersFound: nearbyTimers.length,
      timersContacted: results.length,
      results,
    });
  } catch (error) {
    console.error("Research error:", error);
    return NextResponse.json(
      { error: "Failed to launch research" },
      { status: 500 }
    );
  }
}
