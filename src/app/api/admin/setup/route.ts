import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create tables manually using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Lead" (
        "id" TEXT NOT NULL,
        "eventName" TEXT NOT NULL,
        "eventDate" TIMESTAMP(3) NOT NULL,
        "city" TEXT NOT NULL,
        "postcode" TEXT NOT NULL,
        "lat" DOUBLE PRECISION,
        "lng" DOUBLE PRECISION,
        "participants" INTEGER,
        "organizerName" TEXT NOT NULL,
        "organizerEmail" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'NOUVEAU',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Timer" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "postcode" TEXT NOT NULL,
        "lat" DOUBLE PRECISION,
        "lng" DOUBLE PRECISION,
        "accessToken" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "partnerStatus" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Timer_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Timer_email_key" UNIQUE ("email"),
        CONSTRAINT "Timer_accessToken_key" UNIQUE ("accessToken")
      );
    `);

    // Add companyName column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Timer" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Assignment" (
        "id" TEXT NOT NULL,
        "leadId" TEXT NOT NULL,
        "timerId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'A_CONTACTER',
        "distanceKm" DOUBLE PRECISION,
        "emailSentAt" TIMESTAMP(3),
        "respondedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Assignment_leadId_timerId_key" UNIQUE ("leadId", "timerId")
      );
    `);

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Assignment_leadId_idx" ON "Assignment"("leadId");
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Assignment_timerId_idx" ON "Assignment"("timerId");
    `);

    return NextResponse.json({ 
      success: true, 
      message: "Database tables created successfully!" 
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
