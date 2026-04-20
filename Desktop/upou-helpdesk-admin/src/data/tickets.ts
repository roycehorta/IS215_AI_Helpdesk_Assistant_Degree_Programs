export type TicketStatus = "Submitted" | "In Process" | "In Progress" | "Completed";

export interface TicketTimelineEntry {
  status: TicketStatus;
  at: string; // ISO
  note?: string;
}

export interface Ticket {
  id: string;
  studentName: string;
  studentNumber: string;
  email: string;
  program: string;
  subject: string;
  concern: string;
  dateSubmitted: string; // ISO
  status: TicketStatus;
  timeline: TicketTimelineEntry[];
}

export const STATUS_ORDER: TicketStatus[] = ["Submitted", "In Process", "In Progress", "Completed"];

const daysAgo = (n: number, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return d.toISOString();
};

const programs = [
  "Diploma in Computer Science",
  "BA Multimedia Studies",
  "Master of Public Management",
  "Diploma in Language Studies Education",
  "Master of Information Systems",
  "BES Information Technology",
  "Master of Development Communication",
];

const concerns: Array<{ subject: string; concern: string }> = [
  {
    subject: "Unable to access MyPortal",
    concern:
      "I have been unable to log in to MyPortal since yesterday. I've tried resetting my password twice but still get an 'invalid credentials' error. Please assist so I can submit my assignments on time.",
  },
  {
    subject: "Request for Transcript of Records",
    concern:
      "Good day! I would like to request an official Transcript of Records for employment purposes. Kindly advise on the fees and processing time. Thank you.",
  },
  {
    subject: "Enrollment issue for 2nd Semester",
    concern:
      "My enrollment was not processed even after payment confirmation. The system still shows 'Pending'. I've attached my receipt. Please verify and update.",
  },
  {
    subject: "Change of study center",
    concern:
      "I am requesting a change of study center from Los Baños to Davao due to relocation. What documents do I need to submit?",
  },
  {
    subject: "Missing grade in course DCSc 201",
    concern:
      "My grade for DCSc 201 is still missing on my record. The semester ended a month ago. Could you please follow up with the instructor?",
  },
  {
    subject: "Certificate of Enrollment request",
    concern:
      "I need a Certificate of Enrollment for my scholarship renewal. Kindly issue one as soon as possible. My student number is attached.",
  },
  {
    subject: "Technical issue with online exam",
    concern:
      "The exam platform kept disconnecting during my midterm. I was only able to submit half of my answers. Requesting a re-take or grade review.",
  },
  {
    subject: "Tuition fee assessment inquiry",
    concern:
      "There seems to be a discrepancy in my tuition assessment. I was charged for 18 units but only enrolled in 15. Please reconcile.",
  },
  {
    subject: "Request for Leave of Absence",
    concern:
      "Due to medical reasons, I'm requesting a Leave of Absence for this semester. Attached are my medical certificate and LOA form.",
  },
  {
    subject: "Course shifting inquiry",
    concern:
      "I want to shift from BAMS to Diploma in Computer Science next semester. What is the procedure and are there additional fees?",
  },
  {
    subject: "Forgot student number",
    concern:
      "I've forgotten my student number and cannot retrieve it from my old emails. Can you please help me recover it using my full name and birthdate?",
  },
  {
    subject: "Library e-resources access",
    concern:
      "I cannot access the e-journals through the UPOU library portal. It keeps asking for additional credentials that I was never given.",
  },
  {
    subject: "Late enrollment request",
    concern:
      "Due to a delayed scholarship release, I was unable to enroll on time. May I request to be accommodated for late enrollment this term?",
  },
  {
    subject: "Diploma release schedule",
    concern:
      "I graduated last term and would like to know when my diploma will be available for pick-up or courier delivery.",
  },
  {
    subject: "Incorrect name spelling on records",
    concern:
      "My middle name is misspelled in my student records. Please advise on the correction process and required documents.",
  },
  {
    subject: "Refund of overpayment",
    concern:
      "I was overcharged by PHP 1,500 last semester. I've submitted the refund form two months ago but haven't received any update.",
  },
  {
    subject: "Adviser assignment request",
    concern:
      "I am in my thesis stage but have not yet been assigned a thesis adviser. Could you please endorse my application to the program chair?",
  },
  {
    subject: "Password reset not working",
    concern:
      "The password reset link I received from MyPortal is expired by the time I open it. Please send a new one with a longer validity window.",
  },
  {
    subject: "Request to drop a subject",
    concern:
      "I would like to drop SocSc 101 due to conflicting personal commitments. Kindly guide me through the dropping process.",
  },
  {
    subject: "Scholarship endorsement letter",
    concern:
      "I'm applying for a private scholarship and need an endorsement letter from UPOU. Please let me know the requirements.",
  },
  {
    subject: "Thesis defense scheduling",
    concern:
      "My panel is complete and my manuscript is approved. How do I formally request a defense schedule?",
  },
  {
    subject: "Duplicate payment made",
    concern:
      "I accidentally paid my tuition twice through different channels. Requesting a refund or credit to next semester.",
  },
  {
    subject: "Online module not loading",
    concern:
      "The MODeL platform shows a blank page for my CMSc 150 course. I've tried different browsers and devices.",
  },
  {
    subject: "Request for honorable dismissal",
    concern:
      "I'm transferring to another university and need an honorable dismissal document. Please advise on the process.",
  },
  {
    subject: "Update contact information",
    concern:
      "I recently changed my mobile number and email address. How do I update these in my official UPOU records?",
  },
];

const names = [
  "Maria Santos",
  "Juan Dela Cruz",
  "Andrea Reyes",
  "Miguel Aquino",
  "Sofia Mendoza",
  "Gabriel Ramos",
  "Isabella Cruz",
  "Rafael Villanueva",
  "Camille Gonzales",
  "Diego Torres",
  "Patricia Lim",
  "Joaquin Bautista",
  "Angela Pascual",
  "Leonardo Castro",
  "Bianca Navarro",
  "Marco De Leon",
  "Elena Domingo",
  "Vincent Ocampo",
  "Therese Andrada",
  "Paolo Salazar",
  "Nicole Fernandez",
  "Enrique Rosales",
  "Katrina Valdez",
  "Lorenzo Tan",
  "Alyssa Garcia",
];

const statuses: TicketStatus[] = [
  "Submitted", "Submitted", "Submitted",
  "In Process", "In Process", "In Process", "In Process", "In Process",
  "In Progress", "In Progress", "In Progress", "In Progress", "In Progress", "In Progress",
  "Completed", "Completed", "Completed", "Completed", "Completed", "Completed", "Completed", "Completed",
  "In Progress", "In Process", "Completed",
];

const buildTimeline = (status: TicketStatus, submittedAt: string): TicketTimelineEntry[] => {
  const idx = STATUS_ORDER.indexOf(status);
  const base = new Date(submittedAt).getTime();
  return STATUS_ORDER.slice(0, idx + 1).map((s, i) => ({
    status: s,
    at: new Date(base + i * 1000 * 60 * 60 * 18).toISOString(),
    note: i === 0 ? "Ticket received by helpdesk." : undefined,
  }));
};

export const seedTickets = (): Ticket[] => {
  return names.map((name, i) => {
    const c = concerns[i % concerns.length];
    const submitted = daysAgo(Math.floor(Math.random() * 14), 8 + (i % 9));
    const status = statuses[i % statuses.length];
    return {
      id: `UPOU-${String(1024 + i).padStart(5, "0")}`,
      studentName: name,
      studentNumber: `2023-${String(10000 + i * 37).slice(-5)}`,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@up.edu.ph`,
      program: programs[i % programs.length],
      subject: c.subject,
      concern: c.concern,
      dateSubmitted: submitted,
      status,
      timeline: buildTimeline(status, submitted),
    };
  });
};
