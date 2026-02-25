// Temporary API endpoint to import all timers
// Usage: POST /api/admin/import-timers with admin token

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Your timer data from the spreadsheet (ALL timers except "Refused")
const timers = [
  { name: "La team", email: "prestationlateam@gmail.com", phone: "33665936865", postcode: "71510", lat: 46.847018, lng: 4.68508, status: "Partner – High Coverage" },
  { name: "Sportchronometrage", email: "contact@sportchronometrage.fr", phone: "33617473369", postcode: "62138", lat: 50.511452, lng: 2.785499, status: "Partner – High Coverage" },
  { name: "Sud Chrono", email: "contact@sudchrono.fr", phone: "33787102893", postcode: "11100", lat: 43.149447, lng: 3.003543, status: "Partner – High Coverage" },
  { name: "Comité Nord", email: "orga.hs59@gmail.com", phone: "33681840171", postcode: "59000", lat: 50.63026, lng: 3.07635, status: "Partner – Low Coverage" },
  { name: "Go timing", email: "contact@gotiming.fr", phone: "33677997650", postcode: "57000", lat: 49.100815, lng: 6.173373, status: "Partner – Low Coverage" },
  { name: "Maurienne Chrono", email: "maurienne.chrono@gmail.com", phone: "33689989180", postcode: "73140", lat: 45.205781, lng: 6.514229, status: "Partner – High Coverage" },
  { name: "Tout en O", email: "touteno@gmail.com", phone: "33682671235", postcode: "59495", lat: 51.047901, lng: 2.454165, status: "Partner – High Coverage" },
  { name: "Chronolap", email: "chronolap@gmail.com", phone: "32471721819", postcode: "7370", lat: 50.386888, lng: 3.786657, status: "Partner – High Coverage" },
  { name: "Wanatime", email: "contact@traildelacolline.fr", phone: "33769909574", postcode: "67190", lat: 48.551108, lng: 7.40417, status: "Partner – Low Coverage" },
  { name: "Chrono Normandie", email: "chrono.normandie@gmail.com", phone: "", postcode: "76200", lat: 49.917762, lng: 1.073925, status: "Partner – Low Coverage" },
  { name: "Chronoplace", email: "contact@chronoplace.fr", phone: "33624788488", postcode: "72250", lat: 47.910769, lng: 0.337603, status: "Partner – Low Coverage" },
  { name: "MPSE", email: "contact@mpse.fr", phone: "33782868176", postcode: "27590", lat: 49.331613, lng: 1.214346, status: "Partner – Low Coverage" },
  { name: "AOCHS", email: "aochs.chrono@orange.fr", phone: "33607434559", postcode: "77220", lat: 48.742897, lng: 2.742211, status: "Partner – High Coverage" },
  { name: "Ultra Timing - Original", email: "victor@ultratiming.be", phone: "33766028308", postcode: "4432", lat: 50.693357, lng: 5.492921, status: "Partner – Low Coverage" },
  { name: "Ultra Timing - Victor", email: "victor@ultratiming.be", phone: "33766028308", postcode: "74700", lat: 45.932054, lng: 6.598599, status: "Partner – Low Coverage" },
  { name: "Ultra Timing - Kevin", email: "kevin@ultratiming.be", phone: "33661025863", postcode: "14000", lat: 49.184972, lng: -0.369908, status: "Partner – Low Coverage" },
  { name: "Ultra Timing - Alex", email: "victor@ultratiming.be", phone: "33766028308", postcode: "8000", lat: 49.769011, lng: 4.697616, status: "Partner – Low Coverage" },
  { name: "Sport Pro", email: "contact@sportpro.re", phone: "", postcode: "97470", lat: -21.072406, lng: 55.651399, status: "No Partner – No News" },
  { name: "OTop Services", email: "info@otop.be", phone: "", postcode: "4357", lat: 50.636455, lng: 5.317112, status: "No Partner – No News" },
  { name: "Goal Timing", email: "goaltiming@gmail.com", phone: "320498560524", postcode: "5650", lat: 50.251043, lng: 4.424344, status: "No Partner – No News" },
  { name: "Chronowest", email: "contact@chronowest.fr", phone: "33643170203", postcode: "22350", lat: 48.321623, lng: -2.134857, status: "Open to Partnership" },
  { name: "Datasport", email: "info@datasport.com", phone: "41323214411", postcode: "4563", lat: 47.169792, lng: 7.573623, status: "No Partner – No News" },
  { name: "Chrono course", email: "contact@chrono-course.com", phone: "33297404351", postcode: "56000", lat: 47.657712, lng: -2.755509, status: "No Partner – No News" },
  { name: "KMS", email: "contact@kms.fr", phone: "", postcode: "13004", lat: 43.308565, lng: 5.400065, status: "No Partner – No News" },
  { name: "OK time", email: "contact@ok-time.fr", phone: "33662668940", postcode: "24660", lat: 45.172676, lng: 0.713485, status: "No Partner – No News" },
  { name: "SportimersTESTCarlos", email: "carlos+sportimers@miles.team", phone: "33684255241", postcode: "20229", lat: 42.37439, lng: 9.368129, status: "No Partner – No News" },
  { name: "Nikrome", email: "contact@nikrome.com", phone: "33607954934", postcode: "84400", lat: 43.904369, lng: 5.434126, status: "Open to Partnership" },
  { name: "Eventicom", email: "contact@eventicom.fr", phone: "33632179785", postcode: "73550", lat: 45.363969, lng: 6.588453, status: "No Partner – No News" },
  { name: "Globalpacing", email: "info@globalpacing.com", phone: "320477857910", postcode: "1350", lat: 50.690616, lng: 4.956583, status: "No Partner – No News" },
  { name: "Oxybol", email: "contact@oxybol.fr", phone: "", postcode: "78490", lat: 48.81199, lng: 1.944804, status: "No Partner – No News" },
  { name: "Endurance Chrono", email: "contact@endurancechrono.com", phone: "", postcode: "30310", lat: 43.734083, lng: 4.238797, status: "No Partner – No News" },
  { name: "Centre chrono sports", email: "marc.trainingo@gmail.com", phone: "33613599076", postcode: "66400", lat: 42.498492, lng: 2.716093, status: "No Partner – No News" },
  { name: "Logicourse", email: "mercierjj@wanadoo.fr", phone: "33608095080", postcode: "42550", lat: 45.384736, lng: 3.954491, status: "No Partner – No News" },
  { name: "PerfEvent - Original", email: "contact@perfevent.com", phone: "33630276123", postcode: "26200", lat: 44.554675, lng: 4.747398, status: "Open to Partnership" },
  { name: "PerfEvent - Voiron", email: "contact@perfevent.com", phone: "33630276123", postcode: "38500", lat: 45.369933, lng: 5.59835, status: "Open to Partnership" },
  { name: "Course organisation", email: "contact@course-organisation.fr", phone: "", postcode: "78120", lat: 48.611868, lng: 1.879916, status: "No Partner – No News" },
  { name: "Chrono puces", email: "contact@chronopuces.fr", phone: "", postcode: "43000", lat: 45.056451, lng: 3.864576, status: "Open to Partnership" },
  { name: "Smile Events 27", email: "", phone: "", postcode: "61600", lat: 48.598146, lng: -0.338374, status: "No Partner – No News" },
  { name: "Run'heure", email: "runheure@live.fr", phone: "", postcode: "17330", lat: 46.069645, lng: -0.618154, status: "No Partner – No News" },
  { name: "ChronoPro", email: "bagraph@chronopro.net", phone: "", postcode: "54410", lat: 48.650156, lng: 6.231463, status: "No Partner – No News" },
  { name: "Timing Zone", email: "carlos+testtimertimingzone@miles.team", phone: "33610824331", postcode: "6084", lat: 43.620385, lng: 6.970399, status: "No Partner – No News" },
  { name: "Chrono boost", email: "contact@chronoboost.fr", phone: "33750835952", postcode: "76290", lat: 49.597125, lng: 0.175276, status: "Open to Partnership" },
  { name: "Sport timing caraïbes", email: "frederic.lannet.stc@orange.fr", phone: "", postcode: "97190", lat: 16.207211, lng: -61.493131, status: "No Partner – No News" },
  { name: "M-Chrono", email: "infomchrono@gmail.com", phone: "", postcode: "88200", lat: 48.047426, lng: 6.578077, status: "Partner – Low Coverage" },
  { name: "Chronos Metron", email: "chronosmetron@gmail.com", phone: "33613206345", postcode: "49070", lat: 47.471751, lng: -0.65354, status: "Open to Partnership" },
  { name: "ChronoSports", email: "chronosports83@gmail.com", phone: "", postcode: "83150", lat: 43.148542, lng: 5.74645, status: "Open to Partnership" },
  { name: "Chrono team", email: "contact.chronoteam@gmail.com", phone: "33663302884", postcode: "28000", lat: 48.447106, lng: 1.505694, status: "Partner – Low Coverage" },
  { name: "Otimis", email: "miguel@otimis.fr", phone: "33614910153", postcode: "77140", lat: 48.276289, lng: 2.694334, status: "No Partner – No News" },
  { name: "Cantagrel chrono", email: "cantagrelnicolas@yahoo.fr", phone: "", postcode: "12340", lat: 44.490658, lng: 2.626399, status: "No Partner – No News" },
  { name: "Midi Run", email: "contact@groupe-unicom.fr", phone: "33582952223", postcode: "9120", lat: 43.042429, lng: 1.627297, status: "No Partner – No News" },
  { name: "Tip Tip Top", email: "jerome.peguilhe@gmail.com", phone: "33611944614", postcode: "40230", lat: 43.67073, lng: -1.34832, status: "No Partner – No News" },
  { name: "Chronom", email: "contact@chronom.org", phone: "", postcode: "24750", lat: 45.215556, lng: 0.727222, status: "No Partner – No News" },
  { name: "Ain Bugey Chrono", email: "contact@ainbugeychrono.fr", phone: "33613174079", postcode: "1000", lat: 46.203505, lng: 5.222507, status: "No Partner – No News" },
  { name: "Chronoweb", email: "contact@chronoweb.com", phone: "33615333983", postcode: "87000", lat: 45.829607, lng: 1.257437, status: "No Partner – No News" },
  { name: "Nordsport", email: "yannick@nordsport-chronometrage.fr", phone: "33635436684", postcode: "59310", lat: 50.45243, lng: 3.201534, status: "No Partner – No News" },
  { name: "Courir 36", email: "contact@courir36.fr", phone: "33664690678", postcode: "36250", lat: 46.779493, lng: 1.642252, status: "No Partner – No News" },
  { name: "Chronostem", email: "chronostem@sfr.fr", phone: "", postcode: "55100", lat: 49.185201, lng: 5.33784, status: "No Partner – No News" },
  { name: "Sport-Info /CHRONO COMPETITION", email: "benjamin.stohr@chronocompetition.com", phone: "33610343180", postcode: "67700", lat: 48.731065, lng: 7.370427, status: "No Partner – No News" },
  { name: "JMG Chrono", email: "", phone: "33625474952", postcode: "6690", lat: 43.788096, lng: 7.268935, status: "No Partner – No News" },
  { name: "PerfEvent - Chambé (ex.SCO)", email: "contact@perfevent.com", phone: "33630276123", postcode: "73000", lat: 45.570673, lng: 5.915002, status: "Open to Partnership" },
  { name: "Chrono top", email: "info@chronotop.run", phone: "33682391291", postcode: "74200", lat: 46.346429, lng: 6.47079, status: "No Partner – No News" },
  { name: "Jorganise", email: "contact@jorganize.fr", phone: "33616443886", postcode: "19600", lat: 45.103065, lng: 1.414496, status: "No Partner – No News" },
  { name: "Inscriptionsenligne.fr", email: "inscriptionsenligne@hotmail.com", phone: "33768463242", postcode: "32000", lat: 43.653279, lng: 0.574878, status: "No Partner – No News" },
  { name: "Run Evasion Chrono", email: "julienperry@hotmail.fr", phone: "", postcode: "30700", lat: 44.016273, lng: 4.446902, status: "No Partner – No News" },
  { name: "Point Course", email: "contact@pointcourse.com", phone: "33467454110", postcode: "34570", lat: 43.58391, lng: 3.764256, status: "No Partner – No News" },
  { name: "DanSoft", email: "chrono@dansoft.fr", phone: "33688079008", postcode: "70000", lat: 47.633961, lng: 6.106983, status: "No Partner – No News" },
  { name: "Trail Aventures", email: "johan.salomon@gmail.com", phone: "", postcode: "25580", lat: 47.077504, lng: 6.339694, status: "No Partner – No News" },
  { name: "SG Chrono", email: "audrey.mamet@sgchrono.fr", phone: "33664970252", postcode: "69510", lat: 45.678048, lng: 4.70368, status: "No Partner – No News" },
  { name: "ACN Timing", email: "info@acn-timing.com", phone: "", postcode: "1000", lat: 50.861405, lng: 4.352549, status: "No Partner – No News" },
  { name: "Chamois Chrono", email: "chamoischrono@gmail.com", phone: "33611504851", postcode: "79000", lat: 46.325786, lng: -0.472312, status: "No Partner – No News" },
  { name: "Chrono Univers", email: "ddestouches@chrono-univers.ca", phone: "590690403343", postcode: "97115", lat: 16.332735, lng: -61.698147, status: "No Partner – No News" },
  { name: "Chrono33", email: "coutardg@free.fr", phone: "33626963621", postcode: "33650", lat: 44.644657, lng: -0.571217, status: "No Partner – No News" },
  { name: "JF Chronotrail", email: "", phone: "33673052167", postcode: "84210", lat: 47.32951, lng: 4.18247, status: "No Partner – No News" },
  { name: "Just Chrono", email: "justchrono@free.fr", phone: "33677975451", postcode: "31000", lat: 43.60443, lng: 1.439195, status: "No Partner – No News" },
  { name: "Top Chrono", email: "direction@topchrono.biz", phone: "", postcode: "97480", lat: -21.292154, lng: 55.647459, status: "No Partner – No News" },
  { name: "Cantal chrono", email: "cantalchrono.events@gmail.com", phone: "", postcode: "15270", lat: 45.417939, lng: 2.58445, status: "No Partner – No News" },
  { name: "Triskell Chrono", email: "triskell.chrono@gmail.com", phone: "33660032821", postcode: "56450", lat: 47.601167, lng: -2.646961, status: "Open to Partnership" },
  { name: "LAML Sport Organisation", email: "", phone: "33675401897", postcode: "38440", lat: 45.485899, lng: 5.206351, status: "No Partner – No News" },
  { name: "EasyCHRONO", email: "", phone: "", postcode: "37230", lat: 47.40117, lng: 0.626191, status: "No Partner – No News" },
  { name: "Chrono047", email: "chrono047@outlook.fr", phone: "33643818978", postcode: "47000", lat: 44.200945, lng: 0.624471, status: "Partner – High Coverage" },
  { name: "Courses 80", email: "", phone: "", postcode: "80800", lat: 49.908291, lng: 2.511073, status: "No Partner – No News" },
  { name: "Vosges CAP", email: "", phone: "", postcode: "88500", lat: 48.30053, lng: 6.131297, status: "Open to Partnership" },
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
      // Check if timer already exists using raw SQL (avoid Prisma schema issues)
      const existing = await prisma.$queryRawUnsafe(
        `SELECT id FROM "Timer" WHERE email = $1 LIMIT 1`,
        timer.email
      );

      if (existing && Array.isArray(existing) && existing.length > 0) {
        const msg = `⚠️  Already exists: ${timer.name}`;
        console.log(msg);
        results.push(msg);
        skipped++;
        continue;
      }

      // Create timer using raw SQL (avoid Prisma schema issues)
      const accessToken = crypto.randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Timer" ("id", "name", "email", "phone", "postcode", "lat", "lng", "accessToken", "isActive", "partnerStatus", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        crypto.randomUUID(),
        timer.name,
        timer.email,
        timer.phone || null,
        timer.postcode,
        timer.lat,
        timer.lng,
        accessToken,
        true,
        timer.status
      );

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
