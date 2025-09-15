# Overview

This is "Omari, Spirit of Old" - an AI personal assistant web application built with React and Express. The application provides a conversational chat interface where users can interact with the AI assistant Omari for daily tasks, schedule management, and external application integrations. The system uses a device-based approach where each client device gets a unique ID and maintains its own conversation history and settings.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Vite**: Build tool and development server for fast development and optimized production builds
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Component library built on Radix UI primitives for consistent UI components
- **TanStack Query**: Data fetching and state management for server state
- **Wouter**: Lightweight client-side routing library

## Backend Architecture
- **Express.js**: Node.js web framework serving both API routes and static files
- **TypeScript**: Type-safe JavaScript for better development experience
- **Memory Storage**: In-memory data storage implementation with interface for future database integration
- **OpenAI Integration**: GPT-5 model for AI conversation capabilities
- **Rate Limiting**: Protection against excessive AI API requests

## Data Storage
- **Drizzle ORM**: Type-safe SQL query builder configured for PostgreSQL
- **PostgreSQL**: Production database (configured but using memory storage in current implementation)
- **Neon Database**: Serverless PostgreSQL provider integration
- **Schema Design**: Device-centric model with conversations, messages, and integrations

## Authentication and Session Management
- **Device-based Authentication**: Uses unique device IDs stored in localStorage instead of traditional user accounts
- **No Traditional Auth**: System operates without login/password, focusing on device persistence
- **Session Storage**: Device settings and preferences stored per device

## API Design
- **RESTful Endpoints**: Consistent REST API for device management, conversations, messages, and integrations
- **Type-safe Interfaces**: Shared TypeScript types between frontend and backend
- **Error Handling**: Centralized error handling with appropriate HTTP status codes
- **Request Logging**: Detailed logging for API requests with response capture

## UI/UX Architecture
- **Dark Theme**: Consistent dark mode design with purple accent colors
- **Mobile-First**: Responsive design optimized for mobile devices
- **Component-based**: Modular UI components for reusability
- **Accessibility**: Built on Radix UI primitives for keyboard navigation and screen reader support

# External Dependencies

## AI Services
- **OpenAI API**: GPT-5 model integration for conversational AI capabilities
- **Rate Limiting**: Express rate limiting to control AI API usage

## Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Database migrations and schema management
- **PostgreSQL**: Production database engine

## UI and Design
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Custom web fonts (Inter, DM Sans, Fira Code, Geist Mono)

## Development Tools
- **Vite**: Build tool with HMR and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Type checking and development tooling
- **Replit Integration**: Development environment and deployment platform

## Third-party Integrations
- **Calendar Integration**: Planned integration for schedule management
- **Email Integration**: Planned integration for email summaries
- **Task Management**: Planned integration for task tracking
- **Weather Services**: Planned integration for weather information