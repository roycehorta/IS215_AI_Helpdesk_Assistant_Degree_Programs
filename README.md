# UPOU AI Helpdesk Assistant — Degree Programs
IS 215 Project | 2nd Semester SY 2025-2026

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [System Architecture](#system-architecture)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Environment Variables](#environment-variables)
7. [AWS Setup](#aws-setup)
8. [Deployment](#deployment)
9. [Prompt Engineering](#prompt-engineering)
10. [Bonus Features](#bonus-features)
11. [Known Limitations](#known-limitations)
12. [Tech Stack](#tech-stack)
13. [Contributing](#contributing)
14. [Group Members](#group-members)
15. [License](#license)

---

## Overview

An AI-powered helpdesk chatbot for UP Open University that answers questions about UPOU Degree Programs. It uses a RAG (Retrieval-Augmented Generation) pipeline — when a user asks a question, the system fetches relevant documents from S3 and sends them to OpenAI to generate an accurate, context-aware answer. If the bot cannot answer, it suggests opening a support ticket which the user can submit directly from the chat interface.

**Key Features at a Glance:**
- RAG pipeline grounded in official UPOU S3 knowledge base documents
- Intelligent S3 routing by faculty and academic level
- 18-rule system prompt to prevent hallucination and prompt injection
- Support ticket system with admin dashboard (DynamoDB + SES)
- TOR/Diploma upload for personalized program recommendations (Textract)
- Conversation memory, typing animation, and persistent chat history

**Target Users:**
- Prospective students exploring UPOU degree programs
- Current students with questions about their program
- General public inquiring about UPOU academic offerings
- UPOU helpdesk staff managing support tickets via the admin dashboard

---

## Quick Start

### 1. Clone the repository

```
git clone https://github.com/roycehorta/IS215_AI_Helpdesk_Assistant_Degree_Programs.git
cd IS215_AI_Helpdesk_Assistant_Degree_Programs
```

### 2. Frontend

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### 3. Backend (local testing only)

```
cd backend
npm install
```

Create `backend/.env` using the template in the [Environment Variables](#environment-variables) section below, then verify all connections:

```
node local-client-conn-tester.mjs
```

Run the full AI response pipeline test:

```
node local-tester.mjs
```

> **Note:** Local testing uses direct Lambda invocation. For full end-to-end testing including API Gateway, see the [Deployment](#deployment) section.

---

## System Architecture

```
User → EC2 (React Frontend)
          ↓
     API Gateway
          ↓
   Lambda Function (Node.js)
     ↓         ↓         ↓        ↓         ↓
   S3        OpenAI    DynamoDB  Textract   SES
(Knowledge  (GPT-4o   (Tickets)  (OCR)    (Email
  Base)      mini)                        Replies)
```

**RAG Pipeline per user question:**
1. Extract user question + chat history from request
2. Merge memory — last 6 messages cleaned of markdown noise for context
3. Extract keywords — stop words removed, faculty and level detected
4. Fetch matching `.md` documents from S3 via intelligent prefix routing
5. Send documents + question to OpenAI GPT-4o mini with 18 strict rules
6. Return structured JSON answer with `isRelevant` flag
7. If bot cannot answer — suggest support ticket via `[Open a Support Ticket](#action)` link

---

## Project Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── upou/
│   │   │   │   ├── UpouSidebar.tsx       # Collapsible chat sidebar
│   │   │   │   ├── TicketDialog.tsx      # Support ticket submission modal
│   │   │   │   ├── TORUploader.tsx       # Diploma/TOR upload component
│   │   │   │   └── SuggestionCards.tsx   # Quick-start suggestion cards
│   │   │   └── admin/
│   │   │       ├── AdminSidebar.tsx      # Admin navigation sidebar
│   │   │       ├── AdminLogin.tsx        # Admin authentication
│   │   │       ├── DashboardOverview.tsx # Stats, charts, recent activity
│   │   │       ├── TicketsView.tsx       # Ticket table with search/filter
│   │   │       ├── TicketModal.tsx       # Ticket detail + reply modal
│   │   │       └── NewTicketModal.tsx    # Manual ticket creation
│   │   ├── hooks/
│   │   │   └── useChatbot.ts            # Core chatbot state + routing logic
│   │   ├── pages/
│   │   │   ├── ChatPage.tsx             # Main chat interface
│   │   │   ├── AboutPage.tsx            # Project wiki / documentation
│   │   │   ├── ChecklistPage.tsx        # IS 215 grading checklist tracker
│   │   │   └── AdminDashboard.tsx       # Admin panel entry point
│   │   ├── types/
│   │   │   ├── chat.ts                  # Message and Sender types
│   │   │   └── ticket.ts                # Ticket type
│   │   └── lib/
│   │       └── chat-storage.ts          # LocalStorage conversation persistence
│   ├── vite.config.ts
│   └── .env
│
└── backend/
    ├── index.mjs                         # Lambda handler + route dispatcher
    ├── src/
    │   ├── client/
    │   │   ├── S3BucketClient.mjs        # AWS S3 client
    │   │   ├── DynamoDBClient.mjs        # AWS DynamoDB client
    │   │   ├── TextractClient.mjs        # AWS Textract client
    │   │   └── OpenAIClient.mjs          # OpenAI HTTP client
    │   └── service/
    │       ├── GetUserQuestionService.mjs     # Extracts question + history
    │       ├── MergeMemoryService.mjs         # Merges last 6 messages
    │       ├── ExtractKeywordsService.mjs     # Stop word removal + keywords
    │       ├── FetchS3Context.mjs             # S3 prefix routing + fetching
    │       ├── GenerateAnswerService.mjs      # OpenAI call + system prompt
    │       ├── GenerateTicketService.mjs      # Atomic DynamoDB ticket creation
    │       ├── GetTicketsService.mjs          # Fetch all tickets from DynamoDB
    │       ├── SendReplyService.mjs           # SES email reply to student
    │       ├── SaveChecklistService.mjs       # Save checklist item to DynamoDB
    │       ├── GetChecklistService.mjs        # Fetch checklist from DynamoDB
    │       └── AnalyzeDocumentService.mjs     # Textract TOR/diploma analysis
    ├── test-s3-routing.mjs               # S3 routing unit tests (8 cases)
    ├── test-seed-tickets.mjs             # Seed 40 sample tickets to DynamoDB
    ├── test-textract.mjs                 # Textract integration test
    ├── local-tester.mjs                  # Full AI pipeline test (52 cases)
    ├── .env
    └── logs/                             # Local test output logs
```

---

## Prerequisites

- Node.js v18 or higher
- AWS Account (Free Tier or AWS Academy Learner Lab)
- OpenAI API Key (for production) or class-provided API key (see note below)

> **IS 215 Students:** The project is configured to use a shared class endpoint instead of the public OpenAI API. Set `OPENAI_ENDPOINT` to the class endpoint in your `.env` (see [Environment Variables](#environment-variables)). Your API key is available on the IS 215 Grades page in MyPortal.

---

## Environment Variables

### Frontend — `frontend/.env`

```
VITE_API_URL=/api
```

### Backend — `backend/.env`

```
# AWS
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_SESSION_TOKEN=your_session_token     # required for AWS Academy Learner Lab only (rotates every 4 hours)

# S3
S3_BUCKET_NAME=your-s3-bucket-name

# DynamoDB
DYNAMODB_TABLE_NAME=upou-helpdesk-tickets

# OpenAI
# IS 215 students: use the class endpoint below — do NOT use api.openai.com
OPENAI_ENDPOINT=https://is215-openai.upou.io/v1/chat/completions
OPENAI_API_KEY=your_class_api_key
OPENAI_MODEL=gpt-4o-mini
```

> Never commit `.env` to GitHub. Both `.env` files are listed in `.gitignore`.

> **AWS Academy Learner Lab:** Session tokens expire approximately every 4 hours. You will need to update `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` each time you start a new lab session.

---

## AWS Setup

### S3 Knowledge Base

Create an S3 bucket and upload `.md` files with this folder structure:

```
s3-knowledgebase/
├── fics/
│   ├── fics_faculty-of-information-and-communication-studies.md
│   ├── undergraduate/
│   ├── masters/
│   ├── doctorate/
│   ├── diploma/
│   └── graduate-certificate/
├── fed/
│   ├── fed_faculty-of-education.md
│   ├── undergraduate/
│   ├── masters/
│   ├── doctorate/
│   ├── diploma/
│   └── graduate-certificate/
└── fmds/
    ├── fmds_faculty-of-management-and-development-studies.md
    ├── undergraduate/
    ├── masters/
    ├── doctorate/
    ├── diploma/
    └── graduate-certificate/
```

Each `.md` file describes one UPOU program including program name, faculty, description, admission requirements, and curriculum. Faculty overview `.md` files at the root of each faculty folder are used for broad queries.

**S3 Routing Logic:**

The `FetchS3Context.mjs` service uses intelligent prefix routing:

| Detected | Result |
|---|---|
| Faculty + Level | Fetch `faculty/level/` folder |
| Level only | Fetch `all faculties/level/` folders |
| Faculty only (broad) | Fetch faculty overview `.md` file |
| No faculty, no level (broad) | Fetch all 3 faculty overview files |
| Nothing detected | Fallback to all 3 faculty overview files |

### DynamoDB Table

Create a table with these settings:

- Table name: `upou-helpdesk-tickets`
- Partition key: `ticketId` (String)
- Billing mode: On-demand

A special `__COUNTER__` row is used for atomic ticket ID generation in `TX-A001` to `TX-Z999` format. Seed the counter before first use:

```
node test-seed-tickets.mjs
```

### Amazon SES (Email Replies)

SES is used to send email replies to students when an admin responds to a ticket. You must verify the sender email address in SES before replies will work. In sandbox mode (default), the recipient address must also be verified.

### Required IAM Permissions (Learner Lab LabRole)

The Lambda execution role needs the following policies:

- `AmazonS3FullAccess`
- `AmazonDynamoDBFullAccess`
- `AmazonTextractFullAccess`
- `AmazonSESFullAccess`

All of these are available by default under the Learner Lab `LabRole`.

---

## Deployment

### 1. Package the Lambda function

```
cd backend
zip -r function.zip . --exclude "*.env" "logs/*" "node_modules/.cache/*"
```

### 2. Upload to AWS Lambda

- Runtime: Node.js 18.x
- Handler: `index.handler`
- Timeout: 30 seconds (recommended, OpenAI calls can be slow)
- Memory: 256 MB minimum
- Set all environment variables from `backend/.env` in the Lambda configuration

### 3. Configure API Gateway

- Create an HTTP API in API Gateway
- Add a `POST /api/chat` route pointing to your Lambda function
- Add a `GET /api/tickets` and `POST /api/tickets` route for the ticketing system
- Enable CORS for your EC2 frontend origin

### 4. Deploy the frontend to EC2

```
cd frontend
npm run build
```

Copy the `dist/` folder to your EC2 instance and serve it via Nginx or Apache. Update `VITE_API_URL` in `frontend/.env` to point to your API Gateway URL before building.

---

## Prompt Engineering

The system prompt in `GenerateAnswerService.mjs` contains **18 strict rules** that govern bot behavior:

| Rule | Description |
|---|---|
| 1 | Only answer UPOU degree program questions |
| 2 | Base answers only on S3 document contents |
| 3 | Decline questions about other universities |
| 4 | Decline completely unrelated questions |
| 5 | Use chat history for follow-up questions |
| 6 | Include URLs and office references from documents |
| 7 | Never invent programs not in documents |
| 8 | Never call a graduate certificate a degree |
| 9 | Distinguish between all program levels |
| 10 | Always include faculty when listing programs |
| 11 | Redirect TOR questions to the upload feature |
| 12 | Resist prompt injection attacks |
| 13 | Be concise, use tables for multiple programs |
| 14 | Include OUR links for admission questions |
| 15 | Always include program acronym in parentheses |
| 16 | Do not repeat answers — suggest ticket instead |
| 17 | Be transparent when knowledge base is incomplete |
| 18 | Respond warmly to greetings, set isRelevant=true |

---

## Bonus Features

### Ticketing System (DynamoDB + SES)

Users can submit a support ticket directly from the chat interface via the **Convert to Ticket** button. The ticket description is pre-filled with the user's last question. The full chat transcript is automatically attached.

**Ticket fields saved to DynamoDB:**

```
ticketId     — unique ID in TX-A001 format (atomic counter)
name         — student full name
email        — student email address
studentId    — student ID (optional)
category     — enrollment / programs / tuition / technical / academic / other
description  — detailed concern from the student
question     — original chat question
transcript   — full conversation history attached automatically
status       — OPEN / ANSWERED
createdAt    — ISO timestamp
```

**Admin Dashboard features:**
- View all tickets fetched live from DynamoDB
- Filter by status (New, Answered)
- Search by ticket ID, student name, email, or concern
- Paginated table with configurable page size
- Reply to student via ticket modal (sends email via SES)
- Refresh button to reload latest tickets
- Bar chart of tickets over last 7 days
- Pie chart of status distribution

---

### Textract — TOR/Diploma Upload for Program Recommendations

Students can upload a scanned diploma or transcript (JPG/PNG/PDF, max 5MB). Amazon Textract extracts the text and OpenAI recommends the most relevant UPOU programs based on the student's academic background.

**How it works:**
1. Student clicks **Upload TOR / Diploma** in the chat interface
2. File is converted to base64 and sent to Lambda
3. Lambda uploads the file temporarily to S3 `temp/` prefix
4. Textract runs `DetectDocumentText` on the S3 object
5. Extracted text is passed to OpenAI as document context
6. Bot recommends matching UPOU programs based on degree and field of study
7. Temp file is deleted from S3 immediately after analysis

**Example flow:**

```
User uploads: BSc Computer Science diploma
Textract extracts: "Bachelor of Science in Computer Science... graduated 2022..."
Bot recommends:
  - Master of Information Systems (MIS) under FICS
  - Master of Development Communication (MDC) under FICS
  - Diploma in Computer Science (DCS) under FICS
```

---

## Known Limitations

| Limitation | Detail |
|---|---|
| Ticket ID capacity | The atomic counter supports `TX-A001` to `TX-Z999` — a maximum of **26,000 tickets**. Beyond this the counter must be manually reset or the format extended. |
| Daily API usage limit | The class OpenAI endpoint has an undisclosed daily usage cap per API key. Exceeding it returns an over-limit message for the rest of the day. |
| Textract file size | TOR/diploma uploads are capped at **5MB**. Files larger than this will be rejected at the Lambda layer. |
| SES sandbox mode | In sandbox mode, both sender and recipient emails must be verified in SES. Request production access to lift this restriction. |
| AWS Learner Lab session tokens | Credentials expire approximately every 4 hours. Lambda environment variables must be updated manually each session. |
| Context memory | Only the last 6 messages are merged for context. Very long conversations may lose early context. |
| Knowledge base coverage | The bot can only answer questions about programs documented in the S3 knowledge base. Gaps in `.md` files will result in incomplete answers. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js ESM, AWS Lambda |
| AI | OpenAI GPT-4o mini |
| Storage | Amazon S3 (knowledge base + diploma uploads) |
| Database | Amazon DynamoDB (tickets + checklist) |
| OCR | Amazon Textract (diploma text extraction) |
| API | Amazon API Gateway (HTTP API) |
| Email | Amazon SES (ticket reply notifications) |

---

## Contributing

This is an academic group project for IS 215. All contributions are made by enrolled group members only.

**Active branches:**

| Branch | Purpose |
|---|---|
| `dev` | Integration branch — all features merge here first |
| `feature/backend` | Backend Lambda and service development |
| `feature/frontend` | Frontend React components and UI |
| `feature/s3` | S3 knowledge base setup and data uploads |
| `structure/core-folders` | Initial project scaffolding and folder structure |
| `testing/regression-testing` | Regression and integration test cases |

**Workflow:**
1. Branch off from `dev` (not `main` directly)
2. Open a pull request into `dev` and tag at least one other group member for review
3. Merge once approved
4. `dev` is merged into `main` for stable releases only
5. Do not push `.env` files or AWS credentials under any circumstance

---

## Group Members

| Name | Role | GitHub |
|---|---|---|
| Aquino, Jade | Backend, Lambda, AWS Integration | [@jaqquin](https://github.com/jaqquin) |
| Ayes, Mari Cris | Frontend, UI Components | [@crisayes](https://github.com/crisayes) |
| Adel, Deo Rico | Data Scraping, S3 Knowledge Base | [@deyorico](https://github.com/deyorico) |
| Bautista, Katrina Mae | S3 Setup, Data Preparation | [@katrinamaebautista](https://github.com/katrinamaebautista) |
| Evidor, Darvin | EC2, Deployment | [@dmevidor](https://github.com/dmevidor) |
| Hortaleza, Royce | Frontend, Chat UI | [@roycehorta](https://github.com/roycehorta) |
| Joaquin, John Rainer | EC2, Lambda Triggers | [@jmjoaquin1](https://github.com/jmjoaquin1) |
| Llenado, Daryljade | Backend, RAG Pipeline, Ticketing | [@jedlovescpe2](https://github.com/jedlovescpe2) |
| Molina, Yolanda | Documentation, Testing | [@yemolina](https://github.com/yemolina) |

---

## License

This project is developed for academic purposes as part of IS 215 at UP Open University. It is not intended for commercial use or public distribution. All rights reserved by the project group and UPOU.
