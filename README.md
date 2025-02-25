# Social Media Post Publisher/Scheduler

A comprehensive Next.js application for publishing and scheduling posts across multiple social media platforms from a single interface.

## Project Overview

This application allows users (typically social media managers or marketers) to draft, publish, and schedule posts to multiple social media platforms (Facebook, Twitter/X, LinkedIn, etc.) simultaneously. It streamlines social media management by providing a unified interface and powerful scheduling capabilities.

## Features

### Core Features
- **Unified Post Creation**: Write once, publish anywhere
- **Multi-platform Publishing**: Support for major social networks
- **Post Scheduling**: Schedule posts for optimal times
- **Post Preview**: See how posts will appear on each platform
- **Media Uploads**: Support for images, videos, and other attachments
- **Draft Saving**: Save posts as drafts for later editing

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface using Tailwind and ShadcnUI
- **Real-time Feedback**: Immediate status updates on post publishing

### Admin Features
- **Analytics Dashboard**: Track post performance
- **User Management**: Admin controls for team access (if needed)
- **Audit Logs**: Track all posting activities

## Technology Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, ShadcnUI
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM, hosted on Neon
- **Deployment**: Vercel (or any other preferred platform)
- **State Management**: React Context API / Zustand
- **API Communication**: React Query / SWR

## Architecture

### User Authentication (OAuth2 Flow)
- Admin login to each social media platform via OAuth2
- Secure storage of access tokens
- Token refresh management

### Unified Posting Interface
- Single post editor with platform-specific previews
- Platform selection options
- Scheduling interface
- Media upload capabilities

### Backend API Layer
- Next.js API routes to securely handle social media API calls
- Server-side validation and error handling
- Rate limiting and retry mechanisms

### Database Schema
- User profiles and settings
- Saved posts (drafts, scheduled, and published)
- Platform connections and tokens
- Analytics data

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database (or Neon account)
- Developer accounts on social media platforms you wish to integrate

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/social-media-publisher.git
   cd social-media-publisher
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Environment setup:
   Create a `.env.local` file with the following variables:
   ```
   # Database
   DATABASE_URL="postgresql://..."
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   
   # Social Media API Keys
   FACEBOOK_APP_ID=
   FACEBOOK_APP_SECRET=
   
   TWITTER_API_KEY=
   TWITTER_API_SECRET=
   
   LINKEDIN_CLIENT_ID=
   LINKEDIN_CLIENT_SECRET=
   
   # Add other platform keys as needed
   ```

4. Initialize the database:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Social Media API Integrations

### Supported Platforms
- **Facebook/Instagram** (Meta API)
- **Twitter/X** (Twitter API v2)
- **LinkedIn** (LinkedIn Marketing API)
- **Pinterest** (Pinterest API)
- **TikTok** (TikTok for Business API)

### Integration Requirements
For each platform, you'll need to:
1. Create a developer account/app
2. Configure OAuth2 redirect URIs
3. Request necessary permissions
4. Set up webhook endpoints (for feedback)

## Database Schema

### Users
- User profile information
- Authentication details
- Preferences

### Platforms
- Connected social media accounts
- OAuth tokens
- Platform-specific settings

### Posts
- Content (text, media URLs)
- Status (draft, scheduled, published)
- Publishing details (platforms, timestamps)
- Performance metrics

### Media
- Uploaded files
- Processing status
- Platform-specific formats

## Authentication Flow

1. **User Authentication**:
   - Users sign in to the application using Clerk
   - Role-based access control for team environments

2. **Platform Connection**:
   - OAuth2 flow for each social media platform
   - Token storage in encrypted format
   - Automatic refresh of expired tokens

## Development Roadmap

### Phase 1: Foundation
- Basic app setup with Next.js, Clerk, and Prisma
- Database schema design and implementation
- User authentication implementation

### Phase 2: Core Publishing
- Social media platform integrations (start with 2-3 platforms)
- Post creation interface
- Basic publishing functionality

### Phase 3: Advanced Features
- Scheduling capabilities
- Media handling
- Post analytics
- Additional platform integrations

### Phase 4: Refinement
- UI/UX improvements
- Performance optimization
- Error handling refinement
- Comprehensive testing

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
