# QA Lab 🧪

A full-stack testing playground designed to experiment with automation, AI agents and CI/CD pipelines.

## Documentation

- **[API](./docs/API.md)** – Endpoints, authentication, request/response format, and basic behavior.
- **[About the project](./docs/SOBRE-O-PROJETO.md)** – How the project started (advanced JavaScript + MCP/agents), current state, and next steps.

## Architecture

- Frontend: Next.js
- Backend: Node.js + Express
- Database: PostgreSQL (Docker)
- Automation: Cypress / Playwright
- AI Agents: MCP Agents
- CI/CD: GitHub Actions

## Project Structure

qa-lab/
│
├── .github/         → CI/CD pipelines
├── agents/          → AI agents for QA
├── backend/         → API services
├── database/        → Docker database setup
├── frontend/        → Next.js frontend
├── tests/           → automated tests

## Goals

- Create a QA experimentation platform
- Integrate AI agents into testing workflows
- Automate test execution with CI/CD
- Track test evolution with reports
