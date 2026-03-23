# **App Name**: MedBuddy

## Core Features:

- Anonymous Document Processing: Enables immediate upload of PDF/image without requiring login, automatically creating a temporary session for processing and generating output.
- AI-Powered Document Simplification Tool: Processes extracted medical text using an LLM to generate plain-language diagnoses, medication schedules, and other patient-friendly summaries as structured JSON, strictly adhering to AI safety rules and acting as a tool to interpret and present only document-based information.
- Comprehensive Report Display: Renders the eight mandatory output sections (Original Text, Plain-language Diagnosis, Medication Schedule Table, Side Effect Alerts, Follow-up Checklist, One-line Family Summary, Original vs Simple Explanation, Voice Output Player) in a clear, minimal, and user-friendly interface.
- Secure Document & Report Management: Stores uploaded files privately in Supabase Storage and associated metadata/processed reports in Supabase Database, ensuring temporary guest reports expire, and linking permanent reports to authenticated users with RLS.
- AI Output Validation & Fallback: Validates the structure and completeness of AI-generated JSON, inserting predefined safe fallback values for any missing or invalid fields to prevent critical information gaps.
- Multi-Language Voice Summary: Generates a concise, patient-friendly spoken summary of the key report findings (diagnosis, meds, follow-up, family summary) using gTTS, in the user-selected language, with an integrated audio player.
- Optional Account Integration for Persistence: Allows users to optionally sign up/log in (via Supabase Auth) *after* report generation to permanently save their session-based reports and access history, without blocking the initial emergency workflow.

## Style Guidelines:

- Primary color: A deep cerulean blue (#2E73B8), conveying trust and reliability, contrasting clearly with the light background for important UI elements.
- Background color: A very light silver-blue (#F0F2F5), providing a clean, neutral canvas that minimizes visual distraction and enhances readability in an emergency context.
- Accent color: A vibrant aqua (#1FB5B5), used sparingly for critical call-to-action buttons, alerts, and active states to provide clear visual cues without being overpowering.
- Body and headline font: 'Inter', a grotesque-style sans-serif, chosen for its modern, objective, and neutral aesthetic that prioritizes readability across all sections in a minimal UI.
- Use simple, clean, and universally recognized line-style icons for functions like upload, play, pause, download, and save, ensuring immediate comprehension for users under stress.
- Implement a clean, spacious layout with clear section breaks and ample whitespace to ensure focus and readability of critical medical information. Content is presented in a single-column flow, occasionally split for comparative views where logical, prioritizing hierarchy and clarity.
- Employ only essential, subtle animations to provide feedback for user interactions such as button presses or file upload progress, focusing on speed and minimal delay without adding visual complexity.