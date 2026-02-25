import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete all assignments first (foreign key constraint)
    await prisma.$executeRawUnsafe(`DELETE FROM "Assignment"`);
    
    // Delete all timers
    await prisma.$executeRawUnsafe(`DELETE FROM "Timer"`);
    
    return NextResponse.json({ success: true, message: "All timers cleared" });
  } catch (error) {
    console.error("Clear error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
