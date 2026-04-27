# UPOU Degree Programs Chatbot – User Manual

## 1. Overview
This system is an AI-powered chatbot designed to answer questions about UPOU degree programs. It uses a Retrieval-Augmented Generation (RAG) approach by retrieving relevant information from stored documents and generating responses.

---

## 2. System Architecture

The system consists of:

- **Frontend** – User interface for input and displaying responses
- **Backend (AWS Lambda)** – Handles user requests and processing
- **S3 Bucket** – Stores knowledge base (markdown files)
- **Services Layer**:
  - GetUserQuestionService – extracts user input
  - ExtractKeywordsService – identifies keywords
  - FetchS3Context – retrieves relevant documents
  - MergeMemoryService – combines previous chat context (if implemented)

---

## 3. How the System Works

1. User submits a question via the interface
2. Backend receives the request
3. The system:
   - Extracts the question
   - Identifies keywords
   - Searches the S3 knowledge base
4. Relevant content is retrieved
5. The system generates a response
6. Response is returned to the user

---

## 4. How to Use the System

1. Open the chatbot interface
2. Type your question (e.g., “What programs are offered by UPOU?”)
3. Click submit / send
4. Wait for the response
5. The chatbot will display the answer

---

## 5. Error Handling

- If the system takes too long:
  - A loading state should be shown
- If the API fails:
  - An error message should be displayed
- If no answer is found:
  - The system returns a fallback response

---

## 6. Deployment Overview

1. Upload backend code to AWS Lambda
2. Configure API Gateway
3. Set up S3 bucket with markdown files
4. Connect frontend to API endpoint

---

## 7. Notes

- The system depends on the accuracy of the knowledge base
- Responses may vary depending on keyword matching
- Future improvements include better memory handling and AI response generation