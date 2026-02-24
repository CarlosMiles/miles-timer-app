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

    // Create timer
    const timer = await prisma.timer.create({
      data: {
        name,
        companyName: companyName || null,
        email,
        phone: phone || null,
        postcode,
        lat: geo?.lat || null,
        lng: geo?.lng || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      timer: {
        id: timer.id,
        name: timer.name,
        email: timer.email,
        accessToken: timer.accessToken,
        portalUrl: `${process.env.APP_URL}/chrono/${timer.accessToken}`,
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
    const timers = await prisma.timer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      timers: timers.map((t) => ({
        id: t.id,
        name: t.name,
        companyName: t.companyName,
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
