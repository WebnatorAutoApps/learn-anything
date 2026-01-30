# LearnAnything

A personalized learning companion that generates AI-powered, learn-by-doing plans adapted to your available time and learning goals.

**Live Demo**: [https://learn-anything-six.vercel.app](https://learn-anything-six.vercel.app)

---

## Project Overview

LearnAnything addresses a fundamental problem in self-directed learning: the gap between wanting to learn something and knowing exactly what to do next. Traditional learning resources (courses, books, tutorials) are static and don't adapt to individual schedules, prior knowledge, or learning preferences.

This project builds a system where users can:

1. Select any topic they want to learn
2. Receive an AI-generated, step-by-step learning plan
3. Execute hands-on tasks designed to build real skills
4. Adapt the plan based on available time

The core differentiator is **learn-by-doing**: instead of passive content consumption, users receive actionable tasks that require active engagement.

---

## Product Goals

1. **Reduce friction in starting to learn** - No more analysis paralysis about which course to take or book to read.
2. **Enable learning in fragmented time** - Plans adapt whether you have 15 minutes or 2 hours.
3. **Prioritize doing over reading** - Every learning step involves a concrete action or output.
4. **Maintain context across sessions** - The system remembers where you are and what you've done.

---

## Core Concepts

### Learn-by-Doing

Every learning step is an actionable task, not passive content. Instead of "Read about variables in Python," the system generates "Create a Python script that stores your name, age, and favorite color in variables, then prints a sentence using all three."

The AI generates tasks that:
- Require the learner to produce something (code, writing, analysis)
- Build on previously completed tasks
- Can be validated or self-assessed

### Linear Plans

Learning paths are structured as linear sequences of steps. This design choice is intentional:

- **Reduces decision fatigue** - Users always know exactly what to do next
- **Enables time-based adaptation** - Each step has an estimated duration
- **Simplifies progress tracking** - Completion is binary per step

Non-linear, branching curricula are explicitly out of scope. Users who want to skip ahead or explore tangents can start a new topic.

### Time Adaptation

Users specify how much time they have available. The system selects or adjusts tasks to fit that window:

- **15 minutes**: Micro-tasks (review, quick exercises, short reading)
- **30-60 minutes**: Standard learning tasks
- **2+ hours**: Deep work sessions with multi-part projects

Time adaptation happens at task selection, not by truncating tasks mid-execution.

---

## Phase 1 Scope

Phase 1 establishes the foundational infrastructure required before AI-powered learning can be implemented.

### In Scope

- **Authentication system** - Login/logout with session management
- **Protected routes** - Only authenticated users access the main application
- **Topic selection UI** - Users can view and select learning topics
- **Terminal-inspired design system** - Consistent visual language (CRT aesthetic)
- **Deployment infrastructure** - CI/CD pipeline, production hosting on Vercel
- **Responsive layout** - Works on mobile, tablet, and desktop

### Out of Scope (Phase 1)

- AI integration or LLM API calls
- Dynamic learning plan generation
- User progress persistence (database)
- Real user accounts (currently uses hardcoded test credentials)
- Topic detail pages with actual learning content
- Time-based task adaptation
- User profile or settings
- Multiple user support

### Current Test Credentials

For Phase 1 testing only:
- Username: `test`
- Password: `Learn1234!`

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Login Page  │  │  Home Page   │  │  Topic Pages (Future)│   │
│  │              │  │  (Topics)    │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Application                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Middleware  │  │  API Routes  │  │  Server Components   │   │
│  │  (Auth)      │  │  /api/login  │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Future)
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Database    │  │  LLM API     │  │  Auth Provider       │   │
│  │  (Future)    │  │  (Future)    │  │  (Future)            │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 16 | Server/client rendering, API routes, middleware |
| UI Library | React 19 | Component-based UI |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Language | TypeScript 5 | Type safety |
| Hosting | Vercel | Production deployment |
| CI/CD | GitHub Actions | Build verification |

### Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home page with topic selection |
| `src/app/login/page.tsx` | Authentication UI |
| `src/app/api/login/route.ts` | Authentication endpoint |
| `src/proxy.ts` | Route protection, session validation |
| `src/app/globals.css` | Terminal-effect styling |

---

## AI Responsibilities and Constraints

AI is not integrated in Phase 1. This section documents how AI will be used in future phases.

### AI Responsibilities (Future)

1. **Generate learning plans** - Given a topic and user context, produce a sequence of learn-by-doing steps
2. **Adapt to time constraints** - Select appropriate tasks for the available time window
3. **Create actionable tasks** - Every generated step must be a concrete, completable action
4. **Maintain difficulty progression** - Tasks should build on each other logically

### AI Constraints (Future)

1. **No open-ended conversations** - AI generates structured plans, not chat responses
2. **No content creation at runtime** - Plans reference or generate specific tasks, not dynamic tutoring
3. **Deterministic where possible** - Same inputs should produce consistent (if not identical) outputs
4. **Transparent reasoning** - Users can see why a task was recommended

### AI Will NOT

- Replace human judgment on learning goals
- Generate assessments or certifications
- Provide real-time tutoring or Q&A
- Make decisions about user skill level without explicit input

---

## Non-Goals and Explicit Exclusions

The following are explicitly **not** goals of this project:

1. **Social features** - No sharing, leaderboards, or community aspects
2. **Content library** - We generate plans, not host educational content
3. **Certification or credentials** - No badges, certificates, or verified completions
4. **Mobile native apps** - Web-only, responsive design serves mobile users
5. **Offline support** - Requires internet connection
6. **Multi-language support** - English only for Phase 1
7. **Accessibility beyond standard compliance** - Screen reader support is a future consideration
8. **Gamification** - No points, streaks, or achievements
9. **Instructor or mentor roles** - Single-user, self-directed learning only
10. **Integration with external learning platforms** - Standalone system

---

## Future Phases (High-Level)

### Phase 2: AI Integration

- Connect to LLM API (likely Anthropic Claude)
- Implement learning plan generation for a single topic
- Basic time-based task selection
- Store generated plans (not user progress)

### Phase 3: Persistence and Accounts

- Database integration (user data, progress, plans)
- Real authentication (OAuth or email/password)
- Progress tracking across sessions
- Multiple topics per user

### Phase 4: Refinement

- Plan quality improvements based on user feedback
- Additional topics and domains
- Performance optimization
- Expanded time adaptation logic

---

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Environment Variables

None required for Phase 1. Future phases will require:

- `ANTHROPIC_API_KEY` - For LLM API access
- `DATABASE_URL` - For persistence layer

---

## Contributing

This project uses a Trello-based workflow:
- Branches are named `trello/{card-id}-{description}`
- All changes go through pull requests
- CI must pass before merging

---

## Document History

This README is the authoritative source for product scope and architecture decisions. It should be updated when:

- Phase scope changes
- Architectural decisions are made
- Non-goals are added or removed
- New phases begin

Last updated: Phase 1 development
