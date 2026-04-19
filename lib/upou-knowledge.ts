// Scripted UPOU helpdesk knowledge base. Pure keyword matching.

export type ScriptedReply = {
  keywords: string[];
  reply: string;
};

export const UPOU_REPLIES: ScriptedReply[] = [
  {
    keywords: ["enroll", "enrolment", "enrollment", "apply", "application", "admission", "admit"],
    reply: `**Enrollment & Admission to UPOU**

UPOU offers two application periods each year:
- **First semester:** January – February
- **Second semester:** June – July

**General requirements:**
1. Accomplished online application form (via the UPOU Online Application System)
2. Bachelor's degree transcript (for graduate programs)
3. Two recommendation letters
4. Statement of purpose
5. Valid government-issued ID
6. Application fee payment

**How to apply:**
1. Visit **oas.upou.edu.ph** and create an account
2. Choose your degree program
3. Upload required documents
4. Pay the application fee
5. Wait for the admission result via email

Need help with a specific program? Just ask!`,
  },
  {
    keywords: ["program", "course", "degree", "offer", "study", "bams", "bes", "diploma", "master", "phd", "doctor"],
    reply: `**UPOU Degree Programs**

UPOU offers programs across three faculties:

**Faculty of Management & Development Studies (FMDS)**
- Diploma / Master in Social Work
- Master of Public Management
- Master of Development Communication
- PhD by Research

**Faculty of Information & Communication Studies (FICS)**
- Bachelor of Arts in Multimedia Studies (BAMS)
- Diploma / Master in Computer Science
- Master of Information Systems

**Faculty of Education (FED)**
- Bachelor of Education Studies (BES)
- Diploma / Master of Arts in Language & Literacy Education
- Master of Distance Education
- PhD in Education

All programs are delivered through **distance e-learning** via the UPOU MyPortal.`,
  },
  {
    keywords: ["tuition", "fee", "cost", "price", "payment", "pay", "scholar", "financial"],
    reply: `**Tuition & Fees**

- **Undergraduate:** ~₱1,000 per unit (subject to bracketing)
- **Graduate (Diploma/Master):** ~₱1,500 – ₱2,500 per unit
- **Doctoral:** ~₱3,000 per unit
- **Miscellaneous fees:** ~₱1,500 per semester

**Accepted payment methods:**
- Landbank Link.BizPortal
- DragonPay
- UPOU Cashier (over the counter)
- Bank deposit (BPI / Landbank)

**Scholarships available:**
- UPOU Scholarship Grants
- DOST-SEI Scholarships
- CHED Scholarships
- Faculty Tuition Discounts for UP employees

For exact figures, please refer to the **Office of the University Registrar** or convert this to a ticket.`,
  },
  {
    keywords: ["myportal", "portal", "login", "password", "reset", "tech", "technical", "course site", "moodle", "access"],
    reply: `**Technical Support — MyPortal**

**Login issues:**
1. Go to **myportal.upou.edu.ph**
2. Use your UPOU email (e.g. *firstname.lastname@upou.edu.ph*) and password
3. Make sure cookies are enabled

**Forgot password?**
- Click **"Forgot Password"** on the MyPortal login page
- Enter your registered email
- Check your inbox (and spam) for the reset link

**Can't access your course site?**
- Confirm you're officially enrolled in the course
- Wait 24–48 hours after enrollment for system sync
- Contact your course's **Faculty-in-Charge (FIC)**

Still stuck? Please **convert this conversation to a ticket** so the IT helpdesk can investigate.`,
  },
  {
    keywords: ["schedule", "semester", "academic calendar", "calendar", "term", "when start", "class start"],
    reply: `**Academic Calendar**

UPOU follows the UP System academic calendar:
- **First semester:** August – December
- **Second semester:** January – May
- **Midyear term:** June – July (optional, limited offerings)

Class sessions are **fully online and asynchronous**, but weekly deliverables and assessments follow scheduled deadlines set by your Faculty-in-Charge.`,
  },
  {
    keywords: ["contact", "email", "phone", "address", "office", "reach", "helpdesk"],
    reply: `**Contact UPOU**

- **Main Office:** Los Baños, Laguna 4031, Philippines
- **Trunkline:** (049) 536-6001 to 06
- **Helpdesk Email:** helpdesk@upou.edu.ph
- **Office of the University Registrar:** our@upou.edu.ph
- **Website:** https://www.upou.edu.ph

Office hours: **Monday – Friday, 8:00 AM – 5:00 PM (PHT)**`,
  },
  {
    keywords: ["mode", "online", "distance", "asynchronous", "how learn", "delivery", "class"],
    reply: `**Mode of Study at UPOU**

UPOU is the Philippines' premier **open and distance e-learning university**. All instruction is delivered:
- **Fully online** via the MyPortal learning management system
- **Asynchronous** — no fixed live class hours
- Through readings, recorded lectures, discussion forums, and submitted assessments
- With **Faculty-in-Charge (FIC)** guiding each course

This makes UPOU ideal for working professionals and learners across the globe.`,
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "kumusta"],
    reply: `Hello! 👋 I'm the **UPOU Helpdesk Assistant**. I can help you with:

- 📝 Enrollment & admission
- 🎓 Available degree programs
- 💰 Tuition & fees
- 🛠️ Technical support (MyPortal, login, etc.)
- 📅 Academic schedules
- 📞 Contact information

What would you like to know?`,
  },
];

export function getScriptedReply(input: string): string {
  const lower = input.toLowerCase();
  for (const item of UPOU_REPLIES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.reply;
    }
  }
  return `I'm not sure I have a scripted answer for that yet. 🤔

You can try asking about:
- **Enrollment** ("how do I apply?")
- **Programs** ("what degrees are available?")
- **Tuition & fees**
- **Technical support** (MyPortal, password)
- **Schedules** or **contact info**

If your concern is more specific, please click **Convert to Ticket** below to send it to a human helpdesk officer.`;
}
