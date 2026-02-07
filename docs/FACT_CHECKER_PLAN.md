# Fact Checker App - Development Plan

## 📋 Project Overview

A hybrid web application (mobile-optimized) that helps users fact-check claims by generating steelman counter-arguments using AI. The app uses the steelman technique - presenting the strongest possible version of an opposing argument - to help users critically evaluate information.

### Core Concept
- **Input**: User submits a claim/statement to fact-check
- **Process**: AI analyzes the claim and generates a steelman counter-argument
- **Output**: Presents the strongest opposing argument with supporting evidence and reasoning

---

## 🏗️ Architecture & Tech Stack

### Current Stack (Leveraging Existing)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Docker, Docker Compose

### Additional Technologies Needed
- **AI Integration**: 
  - OpenAI API (GPT-4) or Anthropic Claude API
  - Alternative: Hugging Face Transformers (self-hosted)
- **State Management**: Zustand or React Context (for UI state)
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui (already mentioned in README)
- **Caching**: Redis (already in docker-compose.yml)
- **Rate Limiting**: express-rate-limit

---

## 🎯 Core Features

### Phase 1: MVP (Minimum Viable Product)
1. **Claim Submission**
   - Text input for claims/statements
   - Character limit (e.g., 500-1000 chars)
   - Basic validation

2. **AI-Powered Steelman Generation**
   - API endpoint that calls AI service
   - Generates strongest counter-argument
   - Returns structured response

3. **Result Display**
   - Show original claim
   - Display steelman counter-argument
   - Basic formatting and readability

4. **Mobile-Optimized UI**
   - Responsive design (mobile-first)
   - Touch-friendly interface
   - Fast loading times

### Phase 2: Enhanced Features
1. **Claim History**
   - Save user submissions (optional authentication)
   - View past fact-checks
   - Search/filter history

2. **Enhanced AI Output**
   - Multiple counter-arguments (top 3)
   - Confidence scores
   - Supporting evidence citations
   - Related topics/similar claims

3. **User Feedback**
   - Rate usefulness of counter-arguments
   - Report issues/improvements
   - Community voting

4. **Advanced Features**
   - Claim categorization (politics, science, health, etc.)
   - Fact-checking sources integration
   - Export/share results
   - Dark mode

### Phase 3: Advanced Features
1. **User Accounts**
   - Authentication (JWT ready in stack)
   - Personal dashboard
   - Saved favorites
   - Custom preferences

2. **Community Features**
   - Discussion threads per claim
   - User-submitted counter-arguments
   - Moderation system

3. **Analytics & Insights**
   - Trending claims
   - Most fact-checked topics
   - User statistics

---

## 🗄️ Database Schema

### Core Models

```prisma
// Claim submission
model Claim {
  id          String   @id @default(cuid())
  content     String   @db.Text
  category    String?  // politics, science, health, etc.
  userId      String?  // Optional: for authenticated users
  user        User?    @relation(fields: [userId], references: [id])
  
  // AI-generated results
  steelmanArguments Json? // Array of counter-arguments
  confidenceScore   Float?
  processingStatus  String @default("pending") // pending, processing, completed, failed
  
  // Metadata
  ipAddress   String?  // For rate limiting (anonymized)
  userAgent   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  feedbacks   Feedback[]
  discussions Discussion[]
  
  @@index([userId])
  @@index([createdAt])
  @@index([category])
}

// User feedback on results
model Feedback {
  id          String   @id @default(cuid())
  claimId     String
  claim       Claim    @relation(fields: [claimId], references: [id], onDelete: Cascade)
  
  rating      Int      // 1-5 stars
  helpful     Boolean?
  comment     String?  @db.Text
  
  createdAt   DateTime @default(now())
  
  @@index([claimId])
}

// Discussion threads (Phase 3)
model Discussion {
  id          String   @id @default(cuid())
  claimId     String
  claim       Claim    @relation(fields: [claimId], references: [id], onDelete: Cascade)
  
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  
  content     String   @db.Text
  parentId    String?  // For threaded discussions
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([claimId])
  @@index([parentId])
}

// Enhanced User model
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  
  // User preferences
  preferences Json?    // Theme, default categories, etc.
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  claims      Claim[]
  discussions Discussion[]
  
  @@map("users")
}
```

---

## 🤖 AI Integration Strategy

### API Service Design

**Backend Service**: `backend/src/services/aiService.ts`

```typescript
interface SteelmanRequest {
  claim: string;
  category?: string;
  context?: string;
}

interface SteelmanResponse {
  counterArguments: Array<{
    argument: string;
    reasoning: string;
    evidence?: string[];
    strength: number; // 1-10
  }>;
  confidence: number;
  relatedTopics?: string[];
  processingTime: number;
}
```

### AI Prompt Engineering

**Steelman Prompt Template**:
```
You are a fact-checking assistant that uses the steelman technique - presenting the strongest possible version of an opposing argument.

Claim to analyze: "{claim}"

Generate a steelman counter-argument that:
1. Presents the strongest possible opposing viewpoint
2. Uses logical reasoning and evidence
3. Addresses the claim fairly and charitably
4. Highlights potential weaknesses or alternative perspectives
5. Maintains intellectual honesty

Format your response as JSON with:
- counterArguments: array of 1-3 counter-arguments
- Each counter-argument should include: argument, reasoning, evidence (if available), strength score
- confidence: overall confidence in the counter-argument (0-1)
- relatedTopics: relevant topics for further research
```

### Caching Strategy
- Cache AI responses for identical/similar claims (using Redis)
- Cache key: hash of normalized claim text
- TTL: 7 days (or configurable)
- Reduces API costs and improves response time

### Rate Limiting
- Free tier: 10 requests/hour per IP
- Authenticated users: 50 requests/hour
- Premium (future): Unlimited

---

## 📱 UI/UX Design (Mobile-First)

### Design Principles
1. **Mobile-First**: Design for mobile, enhance for desktop
2. **Fast & Lightweight**: Optimize for slow connections
3. **Accessible**: WCAG 2.1 AA compliance
4. **Progressive Enhancement**: Works without JavaScript

### Key Screens

#### 1. Home/Input Screen
- Large, prominent text input
- Character counter
- Category selector (optional)
- Submit button (sticky on mobile)
- Recent/popular claims (below fold)

#### 2. Results Screen
- Original claim (collapsible)
- Steelman counter-argument(s) (prominent)
- Confidence indicator
- Evidence/sources (expandable)
- Action buttons: Share, Save, Feedback
- Related claims section

#### 3. History Screen (Phase 2)
- List of past claims
- Search/filter
- Quick actions (view, delete)

### Component Structure
```
frontend/
├── app/
│   ├── page.tsx              # Home/Input
│   ├── results/
│   │   └── [id]/
│   │       └── page.tsx      # Results display
│   └── history/
│       └── page.tsx          # Claim history
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── ClaimInput.tsx        # Main input form
│   ├── SteelmanResult.tsx    # Result display
│   ├── ConfidenceBadge.tsx  # Confidence indicator
│   ├── EvidenceList.tsx     # Evidence display
│   └── MobileNav.tsx        # Mobile navigation
└── lib/
    ├── api.ts               # API client
    └── ai.ts                # AI service utilities
```

---

## 🔌 API Endpoints

### Core Endpoints

```
POST   /api/claims              # Submit new claim for fact-checking
GET    /api/claims/:id          # Get claim and results
GET    /api/claims              # List claims (with pagination)
POST   /api/claims/:id/feedback # Submit feedback

# User endpoints (Phase 2/3)
GET    /api/users/me            # Get current user
GET    /api/users/me/claims     # Get user's claims
POST   /api/auth/login          # Authentication
POST   /api/auth/register       # Registration
```

### Request/Response Examples

**POST /api/claims**
```json
Request:
{
  "claim": "Climate change is not caused by human activity",
  "category": "science",
  "context": "Optional additional context"
}

Response:
{
  "id": "clx123...",
  "claim": "Climate change is not caused by human activity",
  "status": "completed",
  "steelmanArguments": [
    {
      "argument": "While natural climate variability exists...",
      "reasoning": "The strongest counter-argument considers...",
      "evidence": ["IPCC reports", "NASA data"],
      "strength": 9
    }
  ],
  "confidence": 0.95,
  "relatedTopics": ["greenhouse gases", "carbon cycle"],
  "createdAt": "2026-02-07T..."
}
```

---

## 🔒 Security & Performance

### Security Measures
1. **Input Validation**
   - Sanitize user input
   - Validate claim length and content
   - Prevent injection attacks

2. **Rate Limiting**
   - Per-IP limits
   - Per-user limits (authenticated)
   - Prevent abuse

3. **API Security**
   - Secure AI API keys (environment variables)
   - Request signing (optional)
   - CORS configuration

4. **Data Privacy**
   - Anonymize IP addresses
   - Optional user accounts
   - GDPR compliance considerations

### Performance Optimizations
1. **Caching**
   - Redis for AI responses
   - CDN for static assets
   - Browser caching headers

2. **Optimization**
   - Code splitting (Next.js automatic)
   - Image optimization
   - Lazy loading for results
   - Server-side rendering where appropriate

3. **Monitoring**
   - Error tracking (Sentry or similar)
   - Performance monitoring
   - API usage tracking

---

## 🚀 Development Phases

### Phase 1: MVP (Week 1-2)
**Goal**: Working fact-checker with basic AI integration

**Tasks**:
- [ ] Set up AI service integration (OpenAI/Claude)
- [ ] Create database schema for Claim model
- [ ] Build claim submission API endpoint
- [ ] Implement AI prompt engineering
- [ ] Create mobile-optimized input UI
- [ ] Build results display component
- [ ] Add basic error handling
- [ ] Set up rate limiting
- [ ] Deploy to staging environment

**Deliverables**:
- Users can submit claims
- AI generates steelman counter-arguments
- Results displayed in mobile-friendly UI
- Basic rate limiting in place

### Phase 2: Enhanced Features (Week 3-4)
**Goal**: Improved UX and additional features

**Tasks**:
- [ ] Add claim history (localStorage or database)
- [ ] Implement caching (Redis)
- [ ] Enhance AI output (multiple arguments, confidence scores)
- [ ] Add feedback system
- [ ] Improve UI/UX based on testing
- [ ] Add loading states and animations
- [ ] Implement share functionality
- [ ] Add category filtering

**Deliverables**:
- Claim history functionality
- Improved AI responses
- User feedback collection
- Better performance with caching

### Phase 3: Advanced Features (Week 5+)
**Goal**: Full-featured application

**Tasks**:
- [ ] Implement user authentication
- [ ] Add user dashboard
- [ ] Build discussion/comment system
- [ ] Add analytics and insights
- [ ] Implement advanced search
- [ ] Add export/share features
- [ ] Performance optimization
- [ ] Comprehensive testing

**Deliverables**:
- User accounts and personalization
- Community features
- Analytics dashboard
- Production-ready application

---

## 📦 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/factchecker_db

# AI Service
OPENAI_API_KEY=sk-... # or ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=gpt-4-turbo-preview # or claude-3-opus-20240229
AI_MAX_TOKENS=2000

# Redis
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000 # 1 hour
RATE_LIMIT_MAX_REQUESTS=10

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# App
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Testing Strategy

### Unit Tests
- AI service prompt generation
- Input validation
- Data transformation utilities

### Integration Tests
- API endpoints
- Database operations
- AI service integration

### E2E Tests
- Claim submission flow
- Results display
- Mobile responsiveness

### Manual Testing
- Cross-browser testing
- Mobile device testing
- Performance testing
- Accessibility testing

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)
1. **Usage Metrics**
   - Claims submitted per day
   - Average response time
   - User retention rate

2. **Quality Metrics**
   - User feedback ratings
   - AI response quality scores
   - Error rates

3. **Performance Metrics**
   - Page load times
   - API response times
   - Cache hit rates

4. **Business Metrics** (if applicable)
   - Cost per claim (AI API costs)
   - User acquisition
   - Engagement metrics

---

## 🎨 Design Mockups (High-Level)

### Mobile View
```
┌─────────────────────┐
│   Fact Checker      │
├─────────────────────┤
│                     │
│  [Text Input Box]   │
│                     │
│  Character: 0/500   │
│                     │
│  Category: [Select] │
│                     │
│  [Submit Button]    │
│                     │
│  Recent Claims:     │
│  • Claim 1          │
│  • Claim 2          │
└─────────────────────┘
```

### Results View
```
┌─────────────────────┐
│  ← Back             │
├─────────────────────┤
│  Original Claim:    │
│  "..."              │
│                     │
│  ┌───────────────┐ │
│  │ Steelman      │ │
│  │ Counter-Arg   │ │
│  │               │ │
│  │ [Argument]    │ │
│  │               │ │
│  │ Confidence:   │ │
│  │ ████████░░ 85%│ │
│  └───────────────┘ │
│                     │
│  [Share] [Save]    │
└─────────────────────┘
```

---

## 🚧 Potential Challenges & Solutions

### Challenge 1: AI API Costs
**Solution**: 
- Implement aggressive caching
- Rate limiting
- Consider self-hosted models for common queries
- Optimize prompts for token efficiency

### Challenge 2: Response Quality
**Solution**:
- Iterative prompt engineering
- User feedback loop
- A/B testing different prompts
- Fine-tuning (if using OpenAI)

### Challenge 3: Mobile Performance
**Solution**:
- Code splitting
- Lazy loading
- Optimize images/assets
- Use Next.js Image component
- Implement service worker for offline support

### Challenge 4: Bias in AI Responses
**Solution**:
- Clear disclaimers about AI limitations
- Multiple counter-arguments when possible
- User feedback mechanism
- Regular prompt audits

---

## 📚 Resources & References

### Steelman Technique
- [Steelman Argument - Wikipedia](https://en.wikipedia.org/wiki/Steelman_argument)
- [Rationality: A-Z by Eliezer Yudkowsky](https://www.lesswrong.com/rationality)

### AI Integration
- OpenAI API Documentation
- Anthropic Claude API Documentation
- Prompt Engineering Best Practices

### Mobile-First Design
- [Mobile-First Design Guide](https://www.smashingmagazine.com/2020/07/mobile-first-strategy/)
- Progressive Web App (PWA) considerations

---

## ✅ Next Steps

1. **Immediate Actions**:
   - Review and approve this plan
   - Set up AI API account (OpenAI/Anthropic)
   - Create feature branch: `feature/fact-checker`
   - Begin Phase 1 development

2. **Setup Tasks**:
   - Update Prisma schema with Claim model
   - Configure environment variables
   - Set up AI service integration
   - Create initial UI components

3. **Development**:
   - Follow Phase 1 tasks sequentially
   - Daily standups to track progress
   - Regular testing and iteration

---

**Document Version**: 1.0  
**Last Updated**: February 7, 2026  
**Status**: Ready for Implementation
