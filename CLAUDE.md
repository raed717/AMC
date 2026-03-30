# AMC

This file provides context about the project for AI assistants.

## Project Overview

- **Ecosystem**: Typescript

## Tech Stack

- **Runtime**: none
- **Package Manager**: npm

### Frontend

- Framework: next
- CSS: tailwind
- UI Library: shadcn-ui

### Backend

- Framework: self
- API: trpc
- Validation: zod

### Database

- Database: sqlite
- ORM: drizzle

### Authentication

- Provider: better-auth

## Project Structure

```
AMC/
├── apps/
│   ├── web/         # Frontend application
├── packages/
│   ├── api/         # API layer
│   ├── auth/        # Authentication
│   └── db/          # Database schema
```

## Common Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open database UI

## Maintenance

Keep CLAUDE.md updated when:

- Adding/removing dependencies
- Changing project structure
- Adding new features or services
- Modifying build/dev workflows

AI assistants should suggest updates to this file when they notice relevant changes.
