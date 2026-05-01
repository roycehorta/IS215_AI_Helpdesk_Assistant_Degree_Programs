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
- 19-rule system prompt to prevent hallucination and prompt injection
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
1. Extract user question + chat history from request (`GetUserQuestionService`)
2. Merge memory — last 6 messages cleaned of markdown noise for context (`MergeMemoryService`)
3. Extract keywords — stop words removed, faculty and level detected (`ExtractKeywordsService`)
4. Determine S3 prefixes — detect faculty (supports multiple) and level from keywords (`DetermineKeysToFetchService`)
5. Fetch matching `.md` document keys from S3 via intelligent prefix routing (`FetchS3Context`)
6. Build context — fetch document contents from S3 and assemble into prompt (`BuildContextService`)
7. Send context + question to OpenAI GPT-4o mini with 19 strict rules (`GenerateAnswerService`)
8. Return structured JSON answer with `isRelevant` flag
9. If bot cannot answer — suggest support ticket via `[Open a Support Ticket](#action)` link

**Lambda Route Dispatch (`_route` body parameter):**

| `_route` value | Handler | Description |
|---|---|---|
| `ticket` | `generateTicket` | Create a new support ticket in DynamoDB |
| `get-tickets` | `getTickets` | Fetch all tickets for admin dashboard |
| `save-checklist` | `saveChecklist` | Save a checklist item status |
| `get-checklist` | `getChecklist` | Fetch full checklist from DynamoDB |
| `send-reply` | `sendReply` | Send SES email reply to student |
| `analyze-tor` | `analyzeDocument` | Run Textract on uploaded TOR/diploma |
| *(default)* | Chat pipeline | Full RAG pipeline for user questions |

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
    │   │   ├── SESClient.mjs             # AWS SES client
    │   │   └── OpenAIClient.mjs          # OpenAI HTTP client
    │   └── service/
    │       ├── GetUserQuestionService.mjs       # Extracts question + history
    │       ├── MergeMemoryService.mjs           # Merges last 6 messages
    │       ├── ExtractKeywordsService.mjs       # Stop word removal + keywords
    │       ├── DetermineKeysToFetchService.mjs  # S3 prefix routing logic (faculty + level detection)
    │       ├── FetchS3Context.mjs               # Lists + fetches S3 document content
    │       ├── BuildContextService.mjs          # Assembles full OpenAI context from S3 docs
    │       ├── GenerateAnswerService.mjs         # OpenAI call + 19-rule system prompt
    │       ├── GenerateTicketService.mjs         # Atomic DynamoDB ticket creation
    │       ├── GetTicketsService.mjs             # Fetch all tickets from DynamoDB
    │       ├── SendReplyService.mjs              # SES email reply to student
    │       ├── SaveChecklistService.mjs          # Save checklist item to DynamoDB
    │       ├── GetChecklistService.mjs           # Fetch checklist from DynamoDB
    │       ├── SuccessResponseService.mjs        # Shared success response helper
    │       └── AnalyzeDocumentService.mjs        # Textract TOR/diploma analysis
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

The routing logic is split across `DetermineKeysToFetchService.mjs` (prefix building) and `FetchS3Context.mjs` (key listing + document fetching). Multiple faculties can now be detected simultaneously from a single query.

| Detected | Result |
|---|---|
| Multiple faculties + Level | Fetch `faculty/level/` folder for each detected faculty in parallel |
| Single faculty + Level | Fetch `faculty/level/` folder |
| Faculties only (broad) | Fetch all levels under each detected faculty |
| Level only | Fetch `all faculties/level/` folders |
| No faculty, no level | Fallback — fetch entire `s3-knowledgebase/` |

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

Follow these steps in order. Complete AWS Setup (S3, DynamoDB, SES, IAM) before deploying Lambda or the frontend.

**Deployment order:**
1. [AWS Setup](#aws-setup) — S3, DynamoDB, SES, IAM (do this first)
2. [Step 1 — Package Lambda](#step-1--package-the-lambda-function)
3. [Step 2 — Create Lambda function](#step-2--create-the-lambda-function)
4. [Step 3 — Set environment variables](#step-3--set-lambda-environment-variables)
5. [Step 4 — Create API Gateway](#step-4--create-and-configure-api-gateway)
6. [Step 5 — Seed DynamoDB](#step-5--seed-dynamodb)
7. [Step 6 — Build and deploy frontend to EC2](#step-6--build-and-deploy-frontend-to-ec2)

---

### Step 1 — Package the Lambda function

From the `backend/` directory, install dependencies and zip everything except secrets and cache:

```
cd backend
npm install
zip -r function.zip . --exclude "*.env" "logs/*" "node_modules/.cache/*"
```

This produces `backend/function.zip`. Keep this file — you will upload it in the next step.

---

### Step 2 — Create the Lambda function

1. Go to **AWS Console → Lambda → Create function**
2. Select **Author from scratch**
3. Set the following:
   - **Function name:** `upou-helpdesk`
   - **Runtime:** Node.js 18.x
   - **Architecture:** x86_64
   - **Execution role:** Use existing role → select `LabRole` (Learner Lab) or your IAM role
4. Click **Create function**
5. On the function page, go to **Code → Upload from → .zip file**
6. Upload `backend/function.zip`
7. After upload, go to **Configuration → General configuration → Edit** and set:
   - **Handler:** `index.handler`
   - **Timeout:** 30 seconds
   - **Memory:** 256 MB

---

### Step 3 — Set Lambda environment variables

Go to **Configuration → Environment variables → Edit** and add each of the following:

| Key | Value |
|---|---|
| `AWS_REGION` | `ap-southeast-1` |
| `AWS_ACCESS_KEY_ID` | Your access key |
| `AWS_SECRET_ACCESS_KEY` | Your secret key |
| `AWS_SESSION_TOKEN` | Your session token *(Learner Lab only — rotate every 4 hours)* |
| `S3_BUCKET_NAME` | Your S3 bucket name |
| `DYNAMODB_TABLE_NAME` | `upou-helpdesk-tickets` |
| `OPENAI_ENDPOINT` | `https://is215-openai.upou.io/v1/chat/completions` |
| `OPENAI_API_KEY` | Your class API key from MyPortal |
| `OPENAI_MODEL` | `gpt-4o-mini` |

Click **Save**. Verify the function deploys without errors by checking the **Test** tab with a simple `{}` payload.

> **Learner Lab reminder:** Every time you start a new lab session, your `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` rotate. You must update these three values in the Lambda environment variables each session.

---

### Step 4 — Create and configure API Gateway

All frontend requests are routed through a **single Lambda function** using the `_route` field in the request body. You only need one API Gateway route for all chat and ticket operations.

1. Go to **AWS Console → API Gateway → Create API**
2. Choose **HTTP API → Build**
3. Under **Integrations**, click **Add integration**:
   - Integration type: Lambda
   - Lambda function: select `upou-helpdesk`
4. Under **Configure routes**, add:
   - **Method:** `POST` — **Path:** `/api`
5. Click **Next → Next → Create**
6. After creation, go to **CORS** under your API settings and configure:
   - **Allow origins:** `*` (or your EC2 domain once known)
   - **Allow methods:** `POST, OPTIONS`
   - **Allow headers:** `Content-Type, Authorization`
7. Note your **Invoke URL** — it will look like:
   ```
   https://xxxxxxxxxx.execute-api.ap-southeast-1.amazonaws.com
   ```
   You will use this in the frontend `.env` in Step 6.

---

### Step 5 — Seed DynamoDB

Before the ticketing system can generate ticket IDs, the DynamoDB counter row must be initialized. Run this once from your local machine with valid AWS credentials in `backend/.env`:

```
cd backend
node test-seed-tickets.mjs
```

This creates the `__COUNTER__` row and seeds 40 sample tickets. Confirm in the AWS Console under **DynamoDB → Tables → upou-helpdesk-tickets → Explore items** that records appear.

---

### Step 6 — Build and deploy frontend to EC2

#### 6a. Set the API URL

Edit `frontend/.env` and point it at your API Gateway invoke URL from Step 4:

```
VITE_API_URL=https://xxxxxxxxxx.execute-api.ap-southeast-1.amazonaws.com/api
```

#### 6b. Build the frontend

```
cd frontend
npm install
npm run build
```

This produces a `frontend/dist/` folder containing the static site.

#### 6c. Transfer the build to EC2

```
scp -i your-key.pem -r frontend/dist/ ec2-user@project.kabautista4.is215.upou.io>:/home/ec2-user/upou-helpdesk/
```

#### 6d. Install and configure Nginx on EC2

SSH into your EC2 instance:

```
ssh -i your-key.pem ec2-user@project.kabautista4.is215.upou.io
```

Install Nginx and copy the build:

```
sudo yum install nginx -y           # Amazon Linux
sudo mkdir -p /usr/share/nginx/html
sudo cp -r /home/ec2-user/upou-helpdesk/dist/* /usr/share/nginx/html/
```

Create an Nginx config at `/etc/nginx/conf.d/upou.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Start Nginx:

```
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### 6e. Open EC2 port 80

In the AWS Console, go to **EC2 → Security Groups → your instance's security group → Inbound rules → Edit** and add:

- **Type:** HTTP — **Port:** 80 — **Source:** `0.0.0.0/0`

The app will be accessible at `https://project.kabautista4.is215.upou.io`.

---

### Verifying the deployment

Once all steps are complete, open the frontend in your browser and confirm:

- [ ] The chat interface loads and the bot responds to a greeting
- [ ] A question about a UPOU program returns a relevant answer
- [ ] The **Upload TOR / Diploma** button accepts a file and returns recommendations
- [ ] Submitting a support ticket creates a record (check DynamoDB)
- [ ] The admin dashboard at `/admin` loads and displays tickets
- [ ] Replying to a ticket from the admin panel sends an email (check SES logs)

---

## Prompt Engineering

The system prompt in `GenerateAnswerService.mjs` contains **19 strict rules** that govern bot behavior:

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
| 19 | Never mix program levels in a single response |

---

## Bonus Features

### Ticketing System (DynamoDB + SES)

Users can submit a support ticket directly from the chat interface via the **Submit Ticket** button. The ticket description is pre-filled with the user's last question. The full chat transcript is automatically attached. User needs to fill out all neccessary information.

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
2. Open a pull request into `dev` and one member manages merging/pull request
3. `dev` is merged into `main` for stable final releases only
4. Do not push `.env` files or AWS credentials under any circumstance

---

## Group Members

| Name | Role | GitHub |
|---|---|---|
| Aquino, Jade | Backend, Lambda, Git Branch Management | [@jaqquin](https://github.com/jaqquin) |
| Ayes, Mari Cris | Backend, Lambda, AWS Integration | [@crisayes](https://github.com/crisayes) |
| Adel, Deo Rico | Backend, Data Scraping, S3 Knowledge Base | [@deyorico](https://github.com/deyorico) |
| Bautista, Katrina Mae | Backend, Data Scraping, S3 Knowledge Base | [@katrinamaebautista](https://github.com/katrinamaebautista) |
| Evidor, Darvin | Backend, Lamda, AWS Integration | [@dmevidor](https://github.com/dmevidor) |
| Hortaleza, Royce | Frontend, Chat UI | [@roycehorta](https://github.com/roycehorta) |
| Joaquin, John Rainer | Backend, Lambda, AWS Integration | [@jmjoaquin1](https://github.com/jmjoaquin1) |
| Llenado, Daryljade | Backend, Frontend, Ticketing | [@jedlovescpe2](https://github.com/jedlovescpe2) |
| Molina, Yolanda | Backend, Documentation | [@yemolina](https://github.com/yemolina) |

---

## License

This project is developed for academic purposes as part of IS 215 at UP Open University. It is not intended for commercial use or public distribution. All rights reserved by the project group and UPOU.
