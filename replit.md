# Overview

This is a Breakout game built as a full-stack web application using React, TypeScript, and Express. The game features canvas-based gameplay where players control a paddle to bounce a ball and destroy blocks. The application includes a complete frontend game engine with audio support, game state management, and a modern UI built with shadcn/ui components. The backend provides a REST API foundation with PostgreSQL database integration via Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Game Engine**: Canvas-based 2D game rendering with manual animation loops
- **State Management**: Zustand for game state, audio controls, and UI state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **3D Graphics**: React Three Fiber ecosystem (@react-three/fiber, @react-three/drei) for potential 3D enhancements

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful API structure with `/api` prefix
- **Development**: Hot reload via Vite integration in development mode
- **Storage**: Dual storage implementation (in-memory for development, database for production)

## Game Architecture
- **Core Game Loop**: Canvas-based rendering with requestAnimationFrame
- **Physics**: Custom collision detection for ball-paddle and ball-block interactions
- **Audio System**: HTML5 Audio API with mute/unmute controls
- **Input Handling**: Keyboard events for paddle movement (arrow keys, WASD)
- **Game States**: State machine with ready, playing, game over, and won states

## Data Storage
- **Database**: PostgreSQL with Neon Database integration
- **Schema Management**: Drizzle Kit for migrations and schema validation
- **Session Storage**: Connect-pg-simple for PostgreSQL-backed sessions
- **Development Storage**: In-memory storage class for rapid development

## Build System
- **Frontend Build**: Vite with React plugin and TypeScript support
- **Backend Build**: esbuild for server-side bundling
- **Asset Handling**: Support for GLTF/GLB models, audio files (MP3, OGG, WAV)
- **Shader Support**: GLSL shader loading via vite-plugin-glsl
- **Development**: Concurrent frontend and backend development with hot reload

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Connection Pooling**: Built-in connection management for serverless environments

## UI and Styling
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for UI elements
- **Inter Font**: Google Fonts integration for typography

## Game Development
- **Canvas API**: Native browser 2D rendering
- **Web Audio API**: HTML5 audio for sound effects and music
- **React Three Fiber**: 3D rendering capabilities (optional enhancement)

## Development Tools
- **TypeScript**: Type safety and developer experience
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundling for production
- **PostCSS**: CSS processing with Autoprefixer

## State Management
- **Zustand**: Lightweight state management with middleware support
- **React Query**: Server state management for API interactions

## Production Deployment
- **Express Static**: Static file serving for production builds
- **Environment Variables**: Configuration for database URLs and secrets
- **Session Management**: Secure session handling with PostgreSQL storage