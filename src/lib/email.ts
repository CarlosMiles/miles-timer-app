// This file handles sending emails using Resend
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "Miles Republic <devis@milesrepublic.com>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Send email to timer when a new lead is available
export async function sendTimerEmail(
  timerEmail: string,
  timerName: string,
  lead: {
    id: string;
    eventName: string;
    eventDate: Date;
    city: string;
    postcode: string;
    participants?: number | null;
    notes?: string | null;
  },
  accessToken: string
) {
  const portalUrl = `${APP_URL}/chrono/${accessToken}`;

  const subject = `Nouveau devis - ${lead.eventName} (${lead.city})`;

  const text = `Bonjour ${timerName},

Nouvelle demande de devis chronométrage :

📍 Événement : ${lead.eventName}
📅 Date : ${lead.eventDate.toLocaleDateString("fr-FR")}
📮 Lieu : ${lead.city} (${lead.postcode})
👥 Participants : ${lead.participants || "Non précisé"}

${lead.notes ? `📝 Notes : ${lead.notes}\n` : ""}
Pour voir les détails et répondre :
👉 ${portalUrl}

---
Miles Republic
`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: timerEmail,
      subject,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

// Send intro email to organizer when a timer accepts
export async function sendOrganizerEmail(
  organizerEmail: string,
  organizerName: string,
  lead: {
    eventName: string;
    eventDate: Date;
    city: string;
  },
  timer: {
    name: string;
    companyName?: string | null;
    email: string;
    phone?: string | null;
  }
) {
  const subject = `Chronométreur disponible - ${lead.eventName}`;

  const text = `Bonjour ${organizerName},

Bonne nouvelle ! Un chronométreur est disponible pour votre événement :

📍 ${lead.eventName}
📅 ${lead.eventDate.toLocaleDateString("fr-FR")}
📮 ${lead.city}

Contact du chronométreur :
• ${timer.companyName || timer.name}
• Email : ${timer.email}
${timer.phone ? `• Téléphone : ${timer.phone}` : ""}

Il va vous contacter directement sous peu.

---
Miles Republic
`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: organizerEmail,
      subject,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
