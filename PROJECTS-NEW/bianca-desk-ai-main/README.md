# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3f34b979-51da-4767-a946-c4f9c6380474

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3f34b979-51da-4767-a946-c4f9c6380474) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3f34b979-51da-4767-a946-c4f9c6380474) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Environment Variables

The application supports the following environment variables for configuration:

### Server Configuration
```bash
# Server port (default: 7070)
PORT=7070

# FlameRouter URLs for AI routing
FLAMEROUTER_CLOUD_URL=https://your-cloud-instance.com
FLAMEROUTER_LOCAL_URL=http://localhost:8080

# Escalation webhook for urgent tickets (optional)
ESCALATION_WEBHOOK=https://hooks.zapier.com/hooks/catch/your-webhook-url
```

### Example .env file
```bash
PORT=7070
FLAMEROUTER_CLOUD_URL=https://api.flamerouter.com
FLAMEROUTER_LOCAL_URL=http://localhost:8080
ESCALATION_WEBHOOK=https://hooks.zapier.com/hooks/catch/123456/abcdef
```

## Features

### Support Tickets
- Create tickets from user messages
- Mark tickets as urgent for escalation
- Automatic webhook notifications for urgent tickets

### Knowledge Base
- Index markdown and PDF files with `node scripts/ingest-all.mjs`
- TF-IDF powered search with relevance scoring
- Automatic excerpt generation

### Configuration
- Real-time server status monitoring
- FlameRouter integration settings
- Privacy mode controls
- AI persona selection
