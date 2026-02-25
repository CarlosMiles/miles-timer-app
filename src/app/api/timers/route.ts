// This API endpoint manages timers (add, list)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { geocodePostcode } from "@/lib/geo";

// Add a new timer
export async function POST(req: NextRequest) {
  // Check admin token
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, companyName, email, phone, postcode } = body;

    // Validate required fields
    if (!name || !email || !postcode) {
      return NextResponse.json(
        { error: "Name, email, and postcode are required" },
        { status: 400 }
      );
    }

    // Geocode the postcode
    const geo = await geocodePostcode(postcode);

    // Create timer using raw SQL
    const accessToken = crypto.randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Timer" ("id", "name", "email", "phone", "postcode", "lat", "lng", "accessToken", "isActive", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      crypto.randomUUID(),
      name,
      email,
      phone || null,
      postcode,
      geo?.lat || null,
      geo?.lng || null,
      accessToken,
      true
    );

    return NextResponse.json({
      success: true,
      timer: {
        name,
        email,
        accessToken,
        portalUrl: `${process.env.APP_URL}/chrono/${accessToken}`,
      },
    });
  } catch (error) {
    console.error("Create timer error:", error);
    return NextResponse.json(
      { error: "Failed to create timer" },
      { status: 500 }
    );
  }
}

// List all timers
export async function GET(req: NextRequest) {
  // Check admin token
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const timers = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Timer" ORDER BY "createdAt" DESC`
    );

    return NextResponse.json({
      timers: (Array.isArray(timers) ? timers : []).map((t: any) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        postcode: t.postcode,
        lat: t.lat,
        lng: t.lng,
        isActive: t.isActive,
        accessToken: t.accessToken,
        portalUrl: `${process.env.APP_URL}/chrono/${t.accessToken}`,
      })),
    });
  } catch (error) {
    console.error("Get timers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timers" },
      { status: 500 }
    );
  }
}
