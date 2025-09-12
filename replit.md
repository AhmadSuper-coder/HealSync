# Homeopathy Patient Management System

## Overview

HomeoClinic is a comprehensive patient management system designed specifically for homeopathy practitioners and clinics. The application provides a complete digital solution for managing patient records, appointments, prescriptions, billing, and communication. It features a modern web interface built with React and TypeScript, offering both light and dark themes with accessibility considerations.

The system focuses on streamlining clinic operations through features like OTP-based patient verification, prescription management with homeopathic medicine support, appointment scheduling with calendar views, billing integration, and automated communication tools. The application is designed with Material Design principles for healthcare applications, ensuring clarity and professional medical interface standards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with custom design system and shadcn/ui component library
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Theme System**: Context-based theme provider supporting light/dark modes with system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API architecture with mock data implementation
- **Session Management**: Express sessions with PostgreSQL session store
- **File Structure**: Monorepo structure with shared types and schemas

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for scalable cloud database
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Data Validation**: Zod schemas for runtime type checking and validation

### Authentication and Authorization
- **Patient Verification**: OTP-based mobile verification system
- **Session Management**: Server-side session storage with PostgreSQL backend
- **Security**: Input validation and sanitization throughout the application

### External Dependencies
- **UI Components**: Radix UI primitives for accessible, unstyled components
- **Charts and Visualization**: Recharts for reporting and analytics
- **Date Handling**: date-fns for comprehensive date manipulation
- **File Upload**: React Dropzone for drag-and-drop file handling
- **Icons**: Lucide React for consistent iconography

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm** and **drizzle-zod**: Type-safe ORM with schema validation
- **express**: Web application framework for API endpoints
- **@tanstack/react-query**: Server state management and caching

### UI and Styling Dependencies
- **@radix-ui/react-**: Complete set of accessible UI primitives (accordion, dialog, dropdown, etc.)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Modern icon library

### Form and Validation Dependencies
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolvers for various schema libraries
- **zod**: TypeScript-first schema validation

### Development and Build Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **postcss** and **autoprefixer**: CSS processing
- **esbuild**: Fast JavaScript bundler for production builds

### Specialized Dependencies
- **recharts**: Charting library for reports and analytics
- **react-dropzone**: File upload with drag-and-drop functionality
- **date-fns**: Date utility library
- **embla-carousel-react**: Carousel component for image galleries
- **cmdk**: Command palette component for enhanced UX