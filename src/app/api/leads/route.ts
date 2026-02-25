// API endpoint for leads - GET (list) and POST (create)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geocodePostcode } from "@/lib/geo";

// GET - List all leads (for admin dashboard)
export async function GET(req: NextRequest) {
  // Check token from Authorization header
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Use raw SQL to avoid schema mismatch issues
    const leads = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Lead" ORDER BY "createdAt" DESC`
    );

    // Get timers (assignments) for each lead
    const leadsWithTimers = await Promise.all(
      (Array.isArray(leads) ? leads : []).map(async (lead: any) => {
        const assignments = await prisma.$queryRawUnsafe(
          `SELECT a.*, t.id as "timerId", t.name as "timerName", t.email as "timerEmail", t."accessToken" 
           FROM "Assignment" a 
           JOIN "Timer" t ON a."timerId" = t.id 
           WHERE a."leadId" = $1`,
          lead.id
        );
        
        // Transform assignments to timers format expected by frontend
        const timers = (Array.isArray(assignments) ? assignments : []).map((a: any) => ({
          id: a.timerId,
          name: a.timerName,
          email: a.timerEmail,
          status: a.status,
          distanceKm: a.distanceKm,
          emailSentAt: a.emailSentAt,
        }));
        
        return { ...lead, timers };
      })
    );

    return NextResponse.json({ leads: leadsWithTimers });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new lead (from Tally/Make.com webhook)
export async function POST(req: NextRequest) {
  // Check webhook secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { eventName, eventDate, city, postcode, participants, organizerName, organizerEmail } = body;

    // Validate required fields
    if (!eventName || !eventDate || !city || !postcode || !organizerName || !organizerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Geocode the postcode
    let lat = null;
    let lng = null;
    try {
      const geo = await geocodePostcode(postcode);
      lat = geo?.lat || null;
      lng = geo?.lng || null;
    } catch (geoError) {
      console.warn("Geocoding failed:", geoError);
    }

    // Create lead using raw SQL
    const leadId = crypto.randomUUID();
    const parsedDate = new Date(eventDate);
    
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Lead" ("id", "eventName", "eventDate", "city", "postcode", "lat", "lng", "participants", "organizerName", "organizerEmail", "status", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      leadId,
      eventName,
      parsedDate,
      city,
      postcode,
      lat,
      lng,
      participants ? parseInt(participants) : null,
      organizerName,
      organizerEmail,
      "NOUVEAU"
    );

    return NextResponse.json({
      success: true,
      message: "Lead created successfully",
      leadId,
    });
  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json(
      { error: "Failed to create lead", details: String(error) },
      { status: 500 }
    );
  }
}
