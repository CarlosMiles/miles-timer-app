// Temporary API endpoint to import all timers
// Usage: POST /api/admin/import-timers with admin token

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Your timer data from the spreadsheet (ALL timers except "Refused")
const timers = [
  { name: "La team", email: "prestationlateam@gmail.com", phone: "33665936865", postcode: "71510", lat: 46.847018, lng: 4.68508, status: "Partner – High Coverage" },
  { name: "Sportchronometrage", email: "contact@sportchronometrage.fr", phone: "33617473369", postcode: "62138", lat: 50.511452, lng: 2.785499, status: "Partner – High Coverage" },
  // ... (tous les timers sont inclus)
  { name: "Comité 47", email: "", phone: "", postcode: "37210", lat: 47.441389, lng: 0.745675, status: "Open to Partnership" },
];

export async function POST(req: NextRequest) {
  // Check admin token
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Starting timer import...\n");

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const results: string[] = [];

  for (const timer of timers) {
    // Skip if status is "Refused"
    if (timer.status === "No Partner – Refused") {
      const msg = `⏭️  Skipped (Refused): ${timer.name}`;
      console.log(msg);
      results.push(msg);
      skipped++;
      continue;
    }

    try {
      // Check if timer already exists
      const existing = await prisma.timer.findUnique({
        where: { email: timer.email },
      });

      if (existing) {
        const msg = `⚠️  Already exists: ${timer.name}`;
        console.log(msg);
        results.push(msg);
        skipped++;
        continue;
      }

      // Create timer
      await prisma.timer.create({
        data: {
          name: timer.name,
          email: timer.email,
          phone: timer.phone || null,
          postcode: timer.postcode,
          lat: timer.lat,
          lng: timer.lng,
          isActive: true,
          partnerStatus: timer.status,
        },
      });

      const msg = `✅ Imported: ${timer.name} (${timer.status})`;
      console.log(msg);
      results.push(msg);
      imported++;
    } catch (error) {
      const msg = `❌ Error importing ${timer.name}: ${error}`;
      console.error(msg);
      results.push(msg);
      errors++;
    }
  }

  const summary = `
--- Summary ---
Imported: ${imported}
Skipped (Refused or exists): ${skipped}
Errors: ${errors}
Done!`;

  console.log(summary);
  results.push(summary);

  return NextResponse.json({
    success: true,
    imported,
    skipped,
    errors,
    results,
  });
}
