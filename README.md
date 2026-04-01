# AMC

This project was created with [Better Fullstack](https://github.com/Marve10s/Better-Fullstack), a modern TypeScript stack that combines Next.js, Self, TRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - CSS framework
- **shadcn/ui** - UI components
- **tRPC** - End-to-end type-safe APIs
- **Drizzle** - TypeScript-first ORM
- **SQLite/Turso** - Database engine
- **Authentication** - Better Auth
- **Turborepo** - Optimized monorepo build system

## Application Features

### Patient Portal
- View personal information (name, email, phone, gender, birthday)
- Unique QR code for medical ID
- Download QR code or copy patient ID

### Doctor Dashboard
- QR code scanner to quickly access patient records
- Manual patient ID entry option

### Patient Management
- View patient personal information
- Add new medical visits with diagnosis and notes
- View medical visit history with doctor info and timestamps
- Manage medications (add, view, delete)
- Predefined medication frequencies (once daily, twice daily, etc.)
- Morning and night dose tracking

### Database Schema
- `medical_visits` - Patient visits with notes and diagnosis
- `medications` - Patient medications with dosage and frequency
- `visit_medications` - Link between visits and medications
- User phone number field

## Getting Started

First, install the dependencies:

```bash
npm install
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local SQLite database (optional):

```bash
npm run db:local
```

2. Update your `.env` file in the `apps/web` directory with the appropriate connection details if needed.

3. Apply the schema to your database:

```bash
npm run db:push
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the fullstack application.

## Project Structure

```
AMC/
├── apps/
│   └── web/         # Fullstack application (Next.js)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run check-types`: Check TypeScript types across all apps
- `npm run db:push`: Push schema changes to database
- `npm run db:studio`: Open database studio UI
- `npm run db:local`: Start the local SQLite database
