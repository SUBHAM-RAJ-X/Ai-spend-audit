# Architecture Documentation

## Overview

The AI Spend Audit application is built as a modern web application using Next.js 14 with the App Router, TypeScript, and Tailwind CSS. The architecture follows a client-server model with Supabase as the backend database and OpenAI API for AI-powered features.

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router for routing and server-side rendering
- **TypeScript 5**: Type-safe JavaScript development
- **Tailwind CSS 3**: Utility-first CSS framework for styling
- **React 18**: UI library with hooks for state management

### Backend & Database
- **Supabase**: Backend-as-a-Service providing:
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - REST API
- **OpenAI API**: GPT-3.5-turbo for AI-powered audit summaries

### Deployment & Infrastructure
- **Vercel**: Recommended hosting platform (optimized for Next.js)
- **Environment Variables**: Secure configuration management

## Project Structure

```
ai-spend-audit/
├── app/                    # Next.js App Router pages
│   ├── audit/             # Audit form page
│   ├── result/[id]/       # Dynamic results page
│   ├── api/summary/       # AI summary API route
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
│   ├── ToolInput.tsx      # Tool input form
│   └── LeadCapture.tsx    # Lead capture form
├── lib/                   # Core business logic
│   ├── auditEngine.ts     # Audit calculation logic
│   ├── pricingData.ts     # Tool pricing information
│   ├── summaryService.ts  # AI summary service
│   ├── auditShare.ts      # Share functionality
│   ├── leadCapture.ts     # Lead capture logic
│   └── supabase.ts        # Supabase client
├── utils/                 # Utility functions
│   └── storage.ts         # Local storage helpers
├── supabase/              # Database schema
│   └── schema.sql         # SQL schema definition
└── public/                # Static assets
```

## Data Flow Architecture

### Audit Flow
1. **Data Input**: User adds AI tools via `ToolInput` component
2. **Local Storage**: Tools stored in browser localStorage for persistence
3. **Audit Calculation**: `auditEngine.ts` processes data and generates recommendations
4. **Results Display**: Results shown in dynamic route `/result/[id]`
5. **Database Storage**: Audit results saved to Supabase `audits` table
6. **Share Generation**: Unique ID generated for shareable links

### AI Summary Flow
1. **Trigger**: Summary generation initiated after audit completion
2. **API Call**: `summaryService.ts` calls OpenAI API via Next.js API route
3. **Processing**: GPT-3.5 analyzes audit data and generates summary
4. **Fallback**: If API fails, uses predefined fallback summary
5. **Display**: Summary shown in results page with source attribution

### Lead Capture Flow
1. **Display**: Lead capture form shown after audit results (non-shared audits only)
2. **Validation**: Client-side validation for email format and required fields
3. **Submission**: Data sent to Supabase `leads` table
4. **Success**: Confirmation message displayed, form hidden

## Database Design

### Tables

#### `audits`
```sql
- id: TEXT (PRIMARY KEY) - Unique audit identifier
- tools: JSONB - Array of tool data and recommendations
- total_savings: DECIMAL - Monthly savings amount
- annual_savings: DECIMAL - Annual savings projection
- is_public: BOOLEAN - Public sharing flag
- created_at: TIMESTAMP - Creation timestamp
- updated_at: TIMESTAMP - Last update timestamp
```

#### `leads`
```sql
- id: BIGINT (PRIMARY KEY) - Auto-incrementing ID
- email: TEXT - User email (required)
- company_name: TEXT - Company name (optional)
- role: TEXT - User role (optional)
- audit_id: TEXT - Reference to audit
- total_savings: DECIMAL - Context for lead quality
- annual_savings: DECIMAL - Annual savings context
- tools_count: INTEGER - Number of tools analyzed
- created_at: TIMESTAMP - Lead capture timestamp
```

### Security Model
- **Row Level Security (RLS)**: Enabled on both tables
- **Public Access**: Only `is_public = true` audits visible publicly
- **Insert Permissions**: Anyone can create audits and leads
- **Select Permissions**: Service role only for leads, public for audits

## Component Architecture

### Page Components
- **Landing Page**: Marketing and introduction to the service
- **Audit Page**: Form for inputting AI tool subscriptions
- **Results Page**: Dynamic route displaying audit analysis

### Reusable Components
- **ToolInput**: Form component for adding AI tools with validation
- **LeadCapture**: Lead generation form with spam prevention

### Layout Components
- **Navigation**: Sticky header with branding and actions
- **Footer**: Simple footer with branding

## State Management

### Client-Side State
- **React Hooks**: useState, useEffect for component state
- **Local Storage**: Persistent audit data between sessions
- **URL Parameters**: Audit ID for shared links

### Server-Side State
- **Supabase**: Source of truth for audit and lead data
- **API Routes**: Server-side processing for AI summaries

## API Architecture

### Internal APIs
- **`/api/summary`**: POST endpoint for AI summary generation
  - Validates input data
  - Calls OpenAI API with engineered prompts
  - Returns summary or fallback

### External APIs
- **OpenAI API**: GPT-3.5-turbo for text generation
- **Supabase API**: Database operations via client SDK

## Security Considerations

### Data Privacy
- **Public Sharing**: Sensitive data filtered from public views
- **Input Validation**: All user inputs validated client and server-side
- **Environment Variables**: API keys and secrets secured

### Access Control
- **RLS Policies**: Database access controlled at row level
- **Rate Limiting**: Basic spam prevention on lead capture
- **CORS**: Proper cross-origin resource sharing

## Performance Optimizations

### Frontend
- **Code Splitting**: Automatic route-based splitting in Next.js
- **Image Optimization**: Next.js Image component for assets
- **Bundle Analysis**: Optimized dependencies and tree-shaking

### Backend
- **Database Indexing**: Optimized queries on frequently accessed fields
- **Caching**: Appropriate caching strategies for API responses
- **Connection Pooling**: Managed by Supabase infrastructure

## AI Integration Decisions

### Where AI is Used
- **Audit Summaries**: GPT-3.5 generates personalized insights from audit data
- **Natural Language Processing**: Converts structured data into readable summaries

### Where AI is Intentionally Avoided
- **Audit Calculations**: Deterministic algorithms ensure accuracy and reliability
- **Recommendations**: Rule-based logic provides consistent, verifiable suggestions
- **Validation**: Traditional validation methods for security and reliability

### AI Architecture
- **Fallback Strategy**: Graceful degradation when AI services unavailable
- **Prompt Engineering**: Carefully crafted prompts for consistent output
- **Error Handling**: Comprehensive error handling for AI API failures

## Deployment Architecture

### Development
- **Local Development**: Next.js dev server with hot reload
- **Environment Management**: Separate configs for development/production

### Production
- **Vercel Deployment**: Zero-config deployment for Next.js applications
- **Environment Variables**: Secure configuration management
- **CDN**: Global content delivery via Vercel Edge Network

## Monitoring & Observability

### Error Handling
- **Client-Side**: Try-catch blocks with user-friendly error messages
- **Server-Side**: API route error handling with appropriate HTTP status codes
- **Database**: Supabase error logging and monitoring

### Performance Monitoring
- **Web Vitals**: Next.js automatic performance monitoring
- **Database Queries**: Supabase query performance insights
- **API Response Times**: Custom monitoring for AI API calls

## Future Scalability Considerations

### Database Scaling
- **Read Replicas**: For high-read scenarios
- **Partitioning**: By date or region for large datasets
- **Caching Layer**: Redis for frequently accessed data

### Feature Expansion
- **Multi-tenancy**: Support for multiple organizations
- **Advanced Analytics**: Historical trend analysis
- **Integration APIs**: Third-party tool integrations

This architecture provides a solid foundation for a modern SaaS application while maintaining simplicity and developer productivity.
