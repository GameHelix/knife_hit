# MyFrog - Task Management System

## Overview
MyFrog is a modern task and project management system built with Next.js 14, featuring real-time updates, project organization, and comprehensive task tracking. The application provides an intuitive interface for managing projects and tasks efficiently.

## Project Structure Explanation

```plaintext
.
├── src/                          # Source code directory
│   ├── app/                      # Next.js 14 app directory
│   │   ├── api/                  # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── logging/         # Activity logging endpoints
│   │   │   ├── projects/        # Project management endpoints
│   │   │   └── tasks/          # Task management endpoints
│   │   ├── auth/                # Authentication pages
│   │   ├── dashboard/           # Dashboard components and page
│   │   ├── projects/            # Project-specific pages
│   │   └── fonts/              # Custom font files
│   ├── components/              # Reusable React components
│   │   ├── auth/               # Authentication forms
│   │   ├── projects/           # Project-related components
│   │   └── tasks/              # Task-related components
│   ├── lib/                    # Utility and configuration files
│   └── types/                  # TypeScript type definitions
├── prisma/                     # Database schema and migrations
└── public/                     # Static assets
```

### Key Directories and Files

#### `/src/app`
- **api/**: Server-side API route handlers
  - `auth/`: Authentication endpoints including NextAuth configuration
  - `logging/`: Activity tracking endpoints
  - `projects/`: Project CRUD operations
  - `tasks/`: Task management endpoints
- **auth/**: Authentication pages (signin/signup)
- **dashboard/**: Main dashboard implementation
- **projects/**: Project-specific pages and components

#### `/src/components`
- **auth/**: Authentication-related components
  - `SignInForm.tsx`: Login form implementation
  - `SignUpForm.tsx`: Registration form implementation
- **projects/**: Project management components
  - `CreateProjectModal.tsx`: Project creation dialog
  - `ProjectCard.tsx`: Individual project display
  - `ProjectList.tsx`: Project collection display
- **tasks/**: Task management components
  - `TaskForm.tsx`: Task creation/editing form
  - `TaskList.tsx`: Task collection display
  - `TaskEditModal.tsx`: Task editing dialog

#### `/src/lib`
- `analytics.ts`: Google Analytics integration
- `auth.config.ts`: NextAuth configuration
- `logging.ts`: Activity logging utilities
- `prisma.ts`: Database client configuration
- `utils.ts`: Shared utility functions

#### `/prisma`
- `schema.prisma`: Database schema definition
- `migrations/`: Database migration files

## Technical Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework

### Backend
- **Next.js API Routes**: Server-side endpoints
- **Prisma**: Type-safe ORM
- **PostgreSQL**: Database
- **NextAuth.js**: Authentication
- **Zod**: Schema validation

## Features

### Authentication
- Email/password authentication
- Protected routes
- Session management
- Rate limiting
- Activity logging

### Project Management
- Project CRUD operations
- Project-specific task organization
- Activity tracking
- Real-time updates

### Task Management
- Task creation and editing
- Priority levels (LOW, MEDIUM, HIGH)
- Status tracking (PENDING, IN_PROGRESS, COMPLETED)
- Due date management
- Sorting and filtering

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/myfrog.git
cd myfrog
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/myfrog"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| NEXTAUTH_SECRET | Authentication secret key | Yes |
| NEXTAUTH_URL | Application base URL | Yes |
| GOOGLE_ANALYTICS_ID | GA tracking ID | No |

## API Routes

### Authentication
- `POST /api/auth/signup`: Create new account
- `POST /api/auth/signin`: Sign in
- `GET/POST /api/auth/[...nextauth]`: NextAuth endpoints

### Projects
- `GET /api/projects`: List projects
- `POST /api/projects`: Create project
- `PATCH /api/projects`: Update project
- `DELETE /api/projects`: Delete project

### Tasks
- `GET /api/tasks`: List tasks
- `POST /api/tasks`: Create task
- `PATCH /api/tasks/[id]`: Update task
- `DELETE /api/tasks/[id]`: Delete task

## Database Schema

### User
```prisma
model User {
  id            String         @id @default(cuid())
  name          String?
  email         String         @unique
  password      String
  tasks         Task[]
  projects      Project[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  deletedAt     DateTime?     
  isDeleted     Boolean        @default(false)
  userActivity  UserActivity[]
  lastLoginAt   DateTime?
  loginCount    Int            @default(0)
  settings      Json?
  avatar        String?
}
```

### Project
```prisma
model Project {
  id          String      @id @default(cuid())
  name        String
  description String?
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  tasks       Task[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?
  isDeleted   Boolean     @default(false)
  color       String?
  isArchived  Boolean     @default(false)
}
```

### Task
```prisma
model Task {
  id          String      @id @default(cuid())
  title       String
  description String?
  status      Status      @default(PENDING)
  priority    Priority    @default(MEDIUM)
  dueDate     DateTime?
  userId      String
  projectId   String
  user        User        @relation(fields: [userId], references: [id])
  project     Project     @relation(fields: [projectId], references: [id])
  position    Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?
  isDeleted   Boolean     @default(false)
}
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Follow component folder structure

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Create pull request
5. Code review
6. Merge to main


## Support

For support:
- Create GitHub issue
  
## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## Acknowledgments

- Next.js team
- Vercel for hosting
- Contributors and maintainers
