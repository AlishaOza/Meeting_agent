# Meeting Agent 🤖

**An AI-powered meeting assistant that transforms meeting transcripts into structured, actionable insights.**

Meeting Agent is a full-stack web application designed to simplify meeting follow-ups by allowing users to upload meeting transcripts and generate AI-assisted summaries and analysis. It provides a web interface, backend APIs, authentication, document text extraction, and a PostgreSQL database.

## ✨ Features

- **User Authentication** — Register and log in to access the application.
- **Meeting Transcript Upload** — Upload meeting documents in PDF, DOCX, and TXT formats.
- **Text Extraction** — Extract readable text from supported document formats.
- **AI-Powered Analysis** — Integrate an AI provider to analyze meeting content.
- **Structured Meeting Insights** — Present analysis results through the application interface.
- **REST API** — Separate frontend and backend architecture.
- **Database Integration** — PostgreSQL for persistent application data.
- **Docker Support** — Run the frontend, backend, and database using Docker Compose.
- **TypeScript** — Improve maintainability and type safety across the application.

> Note: Scanned PDFs that contain images rather than selectable text may require OCR support.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| AI Integration | Gemini provider and mock provider |
| Document Processing | `pdf-parse`, `mammoth` |
| File Uploads | Multer |
| API Communication | Axios, REST APIs |
| Deployment / Local Environment | Docker, Docker Compose |
| Version Control | Git, GitHub |

## 🏗️ Architecture

```text
                 ┌─────────────────────┐
                 │     User / Browser  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │   TypeScript + Vite │
                 └──────────┬──────────┘
                            │ HTTP / REST
                            ▼
                 ┌─────────────────────┐
                 │   Express Backend   │
                 │   Authentication    │
                 │   Meeting APIs       │
                 └──────┬────────┬─────┘
                        │        │
             ┌──────────▼───┐  ┌─▼────────────────┐
             │  PostgreSQL  │  │ AI Provider      │
             │  + Prisma    │  │ Gemini / Mock    │
             └──────────────┘  └──────────────────┘
```

## 📂 Project Structure

```text
Meeting_agent/
├── client/                  # React frontend
├── server/                  # Express backend
│   ├── prisma/              # Prisma schema and migrations
│   └── src/                 # Backend source code
├── docker-compose.yml       # Application services
├── package.json             # Root project scripts and dependencies
├── package-lock.json        # Dependency lockfile
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment variable template
├── .gitignore               # Git exclusions
└── README.md                # Project documentation
```

## ⚙️ Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) — compatible with the project configuration
- [npm](https://www.npmjs.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

Ensure Docker Desktop is running before starting the application.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AlishaOza/Meeting_agent.git
cd Meeting_agent
```

### 2. Configure environment variables

Create your local environment configuration using the provided template.

In PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and configure the required values according to your local environment.

Typical configuration categories include:

- PostgreSQL database credentials
- Database connection settings
- JWT authentication secret
- Frontend URL
- AI provider selection
- Gemini API key, if using Gemini

Use strong, unique secrets for local deployment. Never commit real API keys, passwords, or JWT secrets to GitHub.

**Important:** The exact variable names and required values must match the project's `.env.example`, `docker-compose.yml`, and backend configuration.

### 3. Start the application using Docker

From the project root, run:

```bash
docker compose up --build -d
```

This builds and starts the configured application services.

Check their status:

```bash
docker compose ps
```

View backend logs:

```bash
docker compose logs --tail=100 server
```

View all service logs:

```bash
docker compose logs
```

### 4. Open the application

Once the containers are running, open:

**Frontend:** http://localhost:8080

**Backend health endpoint:** http://localhost:5000/api/health

The backend's internal port may be exposed differently depending on your Docker Compose configuration. If the health endpoint is not accessible directly, check the configured port mappings or use the frontend's `/api` proxy.

### 5. Stop the application

```bash
docker compose down
```

To stop the containers and remove the database volume as well, use `docker compose down -v` only when you intentionally want to delete the persisted database data.

## 📝 How to Use

1. Start the application.
2. Register an account or log in.
3. Navigate to the meeting creation or upload page.
4. Upload a supported meeting transcript: PDF, DOCX, or TXT.
5. Submit the document for processing.
6. Review the extracted meeting text and available analysis results.

The exact analysis sections and actions depend on the current application implementation and selected AI provider.

## 🧠 AI Provider Configuration

The backend supports provider selection through the `AI_PROVIDER` environment variable.

| Provider | Purpose |
|---|---|
| `mock` | Uses the mock provider for demo or development behavior. |
| `gemini` | Uses the Gemini provider for AI-assisted analysis. |

To enable Gemini:

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Set `AI_PROVIDER=gemini` in the environment configuration used by the backend container.
3. Configure the required Gemini API key and model settings according to the backend implementation.
4. Restart the backend service:

```bash
docker compose up -d --force-recreate server
```

Keep API keys private. Do not hardcode them in source files or publish them in the repository.

## 🗄️ Database and Migrations

The project uses PostgreSQL with Prisma for database access and schema management.

Database migrations are configured as part of the backend startup workflow. To inspect the backend logs and migration status, run:

```bash
docker compose logs --tail=100 server
```

When making schema changes, create and test migrations using the Prisma configuration included in the project. Back up important database data before applying migrations to a production environment.

## 🔐 Security Considerations

- Keep `.env` and other secret files out of version control.
- Use strong JWT secrets and database passwords.
- Validate uploaded files and their sizes.
- Avoid logging API keys, authentication tokens, or sensitive meeting content.
- Use HTTPS and appropriate security headers in production.
- Apply authentication and authorization checks to protected API endpoints.
- Restrict access to meeting transcripts and generated analysis.
- Never expose database credentials or private configuration in public repositories.

## 🧪 Development and Troubleshooting

### Check running containers

```bash
docker compose ps
```

### Inspect backend errors

```bash
docker compose logs --tail=100 server
```

### Rebuild the backend after source changes

```bash
docker compose build server
docker compose up -d --force-recreate server
```

### Rebuild the frontend after source changes

```bash
docker compose build client
docker compose up -d --force-recreate client
```

### Common issues

**Application does not open**

- Confirm Docker Desktop is running.
- Check container status with `docker compose ps`.
- Review service logs.
- Confirm port `8080` is available.

**Database connection fails**

- Confirm the PostgreSQL container is running.
- Check the database credentials and connection configuration.
- Inside Docker Compose, the backend should use the database service hostname and its internal port rather than `localhost`.

**AI analysis does not use Gemini**

- Verify the configured `AI_PROVIDER`.
- Confirm the backend container receives the required environment variables.
- Check backend logs for provider or API errors.

**No readable text is extracted**

- Confirm the uploaded document is supported.
- Check whether the PDF contains selectable text.
- Scanned or image-only PDFs may require OCR.

## 🛣️ Future Improvements

Potential improvements for future versions include:

- Meeting summaries with configurable output formats
- Automatic action-item and decision extraction
- Assignment of tasks to meeting participants
- Deadlines and follow-up reminders
- Searchable meeting history
- Export of analysis to PDF or DOCX
- Calendar and productivity-tool integrations
- OCR support for scanned meeting documents
- Automated tests and continuous integration

These are potential enhancements and are not necessarily implemented in the current version.

## 👩‍💻 Author

**Alisha Oza**

- GitHub: [@AlishaOza](https://github.com/AlishaOza)
- LinkedIn: [Alisha Oza](https://www.linkedin.com/in/alishaoza/)
- Portfolio: [alishaozaportfolio.netlify.app](https://alishaozaportfolio.netlify.app/)

## 📄 License

No license has been specified yet. If you intend to distribute this project publicly, consider adding a `LICENSE` file that reflects how you want others to use the code.

---

**Meeting Agent** — Making meeting information easier to understand and act on.
