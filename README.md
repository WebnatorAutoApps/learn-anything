# Learn Anything

An AI-powered learning companion that helps you master any skill through personalized, project-based learning paths.

## Live Demo

**Production URL**: [https://learn-anything-six.vercel.app](https://learn-anything-six.vercel.app)

---

## What is Learn Anything?

Learn Anything is a learning platform that uses artificial intelligence to generate personalized learning paths for any skill you want to master. Whether it's programming, cooking, music, or any other skill, the app creates a structured roadmap of small, achievable projects that guide you from beginner to your desired skill level.

### The Problem

Traditional learning often lacks structure and personalization. People struggle with:
- Not knowing where to start
- Feeling overwhelmed by the amount of content available
- Lack of practical, hands-on projects
- No clear milestones or progress tracking
- Generic courses that don't fit their specific goals or timeline

### The Solution

Learn Anything solves this by:
1. **Understanding your goals** - What skill do you want to learn? What's your current level? How much time can you dedicate?
2. **Generating a personalized path** - AI creates a custom learning roadmap based on your inputs
3. **Project-based learning** - Each milestone is a small, practical project you complete
4. **Flexible timelines** - Learn in 1 month or 12 months - the AI adapts the pace
5. **Progress tracking** - Unlock skill levels as you complete projects

---

## How It Works

### 1. Choose a Skill
Select any skill you want to learn - the possibilities are endless:
- **Programming**: Python, JavaScript, Rust, etc.
- **Creative**: Cooking, Photography, Music Production
- **Professional**: Public Speaking, Project Management
- **Personal**: Fitness, Meditation, Language Learning

### 2. Configure Your Learning Path
Provide the AI with your parameters:
- **Current Level**: Beginner, Intermediate, or Advanced
- **Time Commitment**: How many hours per week can you dedicate?
- **Duration**: Your target completion timeframe (e.g., 6 months)
- **Goals/Comments**: Specific objectives like "I want to learn Python for AI" or "I want to cook Italian cuisine"

### 3. Get Your Personalized Roadmap
The AI generates a structured learning path with:
- **Milestones**: Clear checkpoints marking your progress
- **Projects**: Hands-on tasks to complete at regular intervals
- **Resources**: Curated materials to support each project
- **Timeline**: A realistic schedule based on your availability

### 4. Learn by Doing
Complete small projects at your own pace:
- Each project builds on previous knowledge
- Practical application reinforces learning
- Regular achievements keep you motivated
- Unlock skill levels as you progress

---

## Example: Learning Python for AI

**Input:**
- Skill: Python
- Current Level: Beginner
- Time: 10 hours/week
- Duration: 6 months
- Goal: "I want to learn Python specifically for AI and machine learning"

**Generated Path (Example):**

| Week | Project | Skills Unlocked |
|------|---------|-----------------|
| 1-2 | Build a calculator CLI | Variables, Functions, Basic I/O |
| 3-4 | Create a data parser | File handling, Data structures |
| 5-6 | Web scraper project | Libraries, HTTP, JSON |
| 7-8 | Data visualization dashboard | Pandas, Matplotlib |
| 9-12 | ML classification model | NumPy, Scikit-learn |
| 13-16 | Neural network from scratch | Math fundamentals, Backpropagation |
| 17-20 | Image classifier with TensorFlow | Deep learning, CNNs |
| 21-24 | Personal AI project | Integration, Deployment |

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16 (App Router)
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Fonts**: Geist Sans & Geist Mono
- **Deployment**: Vercel with GitHub integration
- **CI/CD**: GitHub Actions

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── login/
│   │       └── route.ts       # Authentication API endpoint
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── page.tsx               # Home page (topic selection)
│   ├── layout.tsx             # Root layout with metadata
│   └── globals.css            # Global styles & terminal theme
└── middleware.ts              # Route protection
```

---

## Current Features

- [x] Authentication system with route protection
- [x] Home dashboard with topic selection
- [x] Retro terminal-style UI theme
- [x] Responsive design
- [x] CI/CD pipeline with automated deployments

---

## Planned Features

### Core Learning Experience
- [ ] Topic detail pages with learning path configuration
- [ ] AI-powered learning path generation
- [ ] Project milestone system
- [ ] Progress tracking and skill level unlocking
- [ ] Timer/scheduling for project deadlines

### User Management
- [ ] User registration and profiles
- [ ] Database integration for user data
- [ ] OAuth authentication (Google, GitHub)
- [ ] Password reset functionality

### Content & Resources
- [ ] Curated resource library per topic
- [ ] Project templates and starter kits
- [ ] Community-shared learning paths
- [ ] Achievement badges and certificates

### Analytics & Insights
- [ ] Learning analytics dashboard
- [ ] Time tracking per project
- [ ] Skill progression visualization
- [ ] Weekly/monthly progress reports

---

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm, yarn, pnpm, or bun

### Development

1. Clone the repository:
```bash
git clone <repository-url>
cd learn-anything
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Credentials
For development, use these hardcoded credentials:
- **Username**: `test`
- **Password**: `Learn1234!`

### Build for Production
```bash
npm run build
npm start
```

---

## Contributing

This project follows a structured development workflow:
1. Create a feature branch from `main`
2. Implement the feature with proper TypeScript types
3. Ensure `npm run build` passes
4. Submit a pull request for review

---

## License

This project is private and proprietary.
