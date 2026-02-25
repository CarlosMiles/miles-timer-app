import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geocodePostcode, distanceKm } from "@/lib/geo";
import { sendTimerEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leadId = params.id;

  try {
    // Get lead using raw SQL
    const leads = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Lead" WHERE "id" = $1 LIMIT 1`,
      leadId
    );
    const lead = Array.isArray(leads) ? leads[0] : null;

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Geocode lead if needed
    let leadLat = lead.lat;
    let leadLng = lead.lng;

    if (!leadLat || !leadLng) {
      const geo = await geocodePostcode(lead.postcode);
      if (geo) {
        leadLat = geo.lat;
        leadLng = geo.lng;
        await prisma.$executeRawUnsafe(
          `UPDATE "Lead" SET "lat" = $1, "lng" = $2, "updatedAt" = NOW() WHERE "id" = $3`,
          leadLat, leadLng, leadId
        );
      }
    }

    if (!leadLat || !leadLng) {
      return NextResponse.json(
        { error: "Could not geocode lead location" },
        { status: 400 }
      );
    }

    // Get all active timers with location (exclude only "Refused")
    const timers = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Timer" WHERE "isActive" = true AND "lat" IS NOT NULL AND "lng" IS NOT NULL AND "partnerStatus" != 'No Partner – Refused'`
    );

    // Find timers within 300km
    const nearbyTimers = (Array.isArray(timers) ? timers : [])
      .map((timer: any) => ({
        timer,
        distance: distanceKm(
          { lat: leadLat!, lng: leadLng! },
          { lat: timer.lat!, lng: timer.lng! }
        ),
      }))
      .filter((t: any) => t.distance <= 300)
      .sort((a: any, b: any) => a.distance - b.distance);

    // Create assignments and send emails
    const results = [];
    for (const { timer, distance } of nearbyTimers) {
      // Check if assignment already exists
      const existing = await prisma.$queryRawUnsafe(
        `SELECT * FROM "Assignment" WHERE "leadId" = $1 AND "timerId" = $2 LIMIT 1`,
        leadId, timer.id
      );

      if (existing && Array.isArray(existing) && existing.length > 0) continue;

      // Create assignment
      const assignmentId = crypto.randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Assignment" ("id", "leadId", "timerId", "distanceKm", "status", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        assignmentId, leadId, timer.id, distance, "A_CONTACTER"
      );

      // Send email
      const emailResult = await sendTimerEmail(
        timer.email,
        timer.name,
        lead,
        timer.accessToken
      );

      if (emailResult.success) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Assignment" SET "emailSentAt" = NOW() WHERE "id" = $1`,
          assignmentId
        );
      }

      results.push({
        timer: timer.name,
        email: timer.email,
        distance: Math.round(distance),
        emailSent: emailResult.success,
      });
    }

    // Update lead status
    await prisma.$executeRawUnsafe(
      `UPDATE "Lead" SET "status" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
      "TIMERS_CONTACTES", leadId
    );

    return NextResponse.json({
      success: true,
      timersFound: nearbyTimers.length,
      timersContacted: results.length,
      results,
    });
  } catch (error) {
    console.error("Research error:", error);
    return NextResponse.json(
      { error: "Failed to launch research", details: String(error) },
      { status: 500 }
    );
  }
}
