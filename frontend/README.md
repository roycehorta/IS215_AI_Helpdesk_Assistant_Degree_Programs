# UPOU Degree Programs Advisor AI (UPBOT)

A serverless, Retrieval-Augmented Generation (RAG) chatbot designed to act as an academic advisor for the University of the Philippines Open University (UPOU). 

Built as a group project for **IS 215 - Advance Computer Systems**, this system utilizes a highly modular architecture, splitting responsibilities across a React frontend, an AWS Lambda middleware engine, and an S3-backed knowledge base.

---

## 🏗️ System Architecture & Workflow

The workload is divided into specialized deployment "Pods" to ensure seamless handoffs and strict security boundaries.

* **Pod 1 (Knowledge Base - AWS S3):** Provisions strict-access AWS S3 buckets to store processed Markdown (`.md`) and JSON files detailing UPOU curriculum data. Acts as the sole source of truth for the AI.
* **Pod 2 (Middleware Engine - AWS Lambda):** Manages the serverless Node.js backend. Uses custom IAM roles to securely read from S3 and exposes the data via an HTTP API Gateway to the frontend.
* **Pod 3 (GenAI Integration - OpenAI):** Injects the OpenAI API (`gpt-4o-mini`) into the Lambda layer. Applies strict System Personas to prevent hallucinations and formats the S3 data into conversational responses. Features a "Sliding Window" memory system to maintain chat context efficiently.
* **Pod 4 (Frontend UI - React/Vite):** A React Single Page Application (SPA) built with Vite, Tailwind CSS v4, and React Router. Hosted on an Ubuntu AWS EC2 instance utilizing an Nginx reverse proxy.

---

## 📁 Repository Structure

This monorepo contains all components of the system:

```text
upbot/
├── frontend/             # React SPA (Vite, Tailwind v4, React Router)
├── lambda-backend/       # Node.js code for the AWS Lambda middleware
├── s3-knowledgebase/     # Markdown (.md) context files for S3 upload
├── docs/                 # Additional project documentation
└── README.md             # This file