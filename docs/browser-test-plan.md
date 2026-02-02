# Browser Test Plan (Chrome MCP)

Comprehensive manual QA test plan executed via Claude Code + Chrome MCP browser automation.
Run this after every new feature is added or significant change is merged.

**Test credentials:**
- Email: `will9455.llc@gmail.com`
- Password: `Learn1234!`
- Gemini API Key: `AIzaSyDDNEOh-iRuAPDw6ERZQm2k2pj4XGWIq-8`
- Base URL: `http://localhost:3000`

---

## Pre-flight Checks

- [ ] Dev server is running (`npm run dev`)
- [ ] Chrome MCP extension is connected
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run test` passes all tests

---

## 1. Landing Page (`/`)

### 1.1 Layout & Content
- [ ] Page loads without errors
- [ ] Navigation bar visible (logo, language switcher, login, sign up buttons)
- [ ] Hero section renders with headline and CTA
- [ ] "How It Works" section renders with steps
- [ ] Examples section renders with sample learning paths
- [ ] Footer renders with privacy policy and terms links

### 1.2 Language Switcher
- [ ] Language dropdown opens and shows 6 locales (en, es, fr, de, it, zh)
- [ ] Switching language updates all visible text
- [ ] Language selection persists on page reload (localStorage)

### 1.3 Navigation
- [ ] "Login" button navigates to `/login`
- [ ] "Sign Up" button navigates to `/signup`
- [ ] Privacy Policy link navigates to `/privacy-policy`
- [ ] Terms & Conditions link navigates to `/terms-and-conditions`

---

## 2. Authentication

### 2.1 Login Page (`/login`)
- [ ] Page renders with email and password fields
- [ ] Empty form submission shows validation error
- [ ] Invalid credentials show error message
- [ ] Successful login redirects to dashboard (`/`)
- [ ] Google OAuth button is visible and clickable
- [ ] "Sign up" link navigates to `/signup`

### 2.2 Signup Page (`/signup`)
- [ ] Page renders with name, email, and password fields
- [ ] Empty form submission shows validation error
- [ ] Password < 6 chars shows validation error
- [ ] "Login" link navigates to `/login`
- [ ] Google OAuth button visible

### 2.3 Logout
- [ ] Logout option accessible from dashboard header dropdown
- [ ] Clicking logout shows confirmation dialog
- [ ] Confirming logout redirects to landing page
- [ ] Canceling logout dismisses dialog
- [ ] After logout, visiting `/` redirects to landing page (not dashboard)

### 2.4 Route Protection
- [ ] Visiting `/courses` while logged out redirects to `/login`
- [ ] Visiting `/course/[id]` while logged out redirects to `/login`
- [ ] Visiting `/login` while logged in redirects to dashboard

---

## 3. Dashboard (Authenticated `/`)

### 3.1 Dashboard Header
- [ ] "Learn Anything" branding visible
- [ ] User avatar (or initial) displayed
- [ ] Clicking avatar opens dropdown menu
- [ ] Dropdown shows: username, Browse Learning Paths, Settings, Logout
- [ ] Clicking outside dropdown closes it
- [ ] "Browse Learning Paths" navigates to `/courses`

### 3.2 Main Content
- [ ] "What do you want to learn today?" heading visible
- [ ] Animated cursor blink effect works
- [ ] "Browse Learning Paths" button present and navigates to `/courses`

### 3.3 Tips Banner
- [ ] Tip banner appears with lightbulb icon and message
- [ ] CTA button is clickable and performs correct action
- [ ] Dismiss button hides the banner
- [ ] Banner stays dismissed after page reload (sessionStorage)
- [ ] Banner reappears in a new session/tab

### 3.4 Active Module Carousel
- [ ] If enrolled courses with active steps: carousel shows project slides
- [ ] Slide shows project title and course name
- [ ] Next/prev navigation buttons work
- [ ] Dot indicators reflect current slide
- [ ] "Complete" button opens completion modal
- [ ] If no active steps: empty state message shown

### 3.5 Course Grid (Started Courses)
- [ ] If enrolled courses exist: grid shows course cards
- [ ] Each card shows title, first-letter badge, module count
- [ ] Clicking a card navigates to `/course/[id]`
- [ ] If no enrolled courses: empty state message shown
- [ ] Loading skeleton appears while data loads

### 3.6 Error Handling
- [ ] If profile fetch fails: error banner with retry button appears
- [ ] Retry button re-fetches profile

---

## 4. Course Creation (Learn Modal)

### 4.1 Opening the Modal
- [ ] "Learn something new" button/input on dashboard opens modal
- [ ] If no Gemini API key set: API Key Warning Dialog appears instead
- [ ] Warning dialog has "Go to Settings" and "Cancel" buttons

### 4.2 Multi-Step Wizard
- [ ] Step 1 (Topic): Text input field, required validation
- [ ] Step 2 (Details): Textarea for description
- [ ] Step 3 (Expertise): Buttons for Beginner/Intermediate/Advanced/Expert
- [ ] Step 4 (Experience Details): Optional textarea, skip available
- [ ] Step 5 (Commitment): Weekly/Bi-weekly/Monthly/Quarterly buttons
- [ ] Step 6 (Duration): Time period options with validation
- [ ] Step 7 (Review): All answers displayed, edit buttons work
- [ ] Chat-style typing animation between steps
- [ ] Editing a previous answer returns to that step
- [ ] "Begin" button starts course generation

### 4.3 Course Generation
- [ ] Loading screen appears during LLM generation
- [ ] On success: redirects to new course page
- [ ] On error: error message with retry option
- [ ] Low likelihood score (< 30%) shows rejection message

---

## 5. Courses Page (`/courses`)

### 5.1 Tab Navigation
- [ ] "My Learning Paths" tab active by default
- [ ] "Public Learning Paths" tab shows coming soon placeholder
- [ ] Tab state reflected in URL

### 5.2 My Courses Tab
- [ ] All user courses displayed in grid
- [ ] Each card shows: initial badge, title, step count
- [ ] Enrolled courses show "Already Enrolled" disabled badge
- [ ] Non-enrolled courses show "Start Learning Path" CTA
- [ ] Clicking a course navigates to `/course/[id]`
- [ ] Empty state shown when no courses
- [ ] Loading skeleton during fetch

---

## 6. Course Detail Page (`/course/[id]`)

### 6.1 Unenrolled View
- [ ] Course title displayed
- [ ] Back to dashboard link works
- [ ] Learning goal (short + detailed) displayed
- [ ] Info cards: total steps, expertise, target level, success rate
- [ ] Commitment frequency selector (Weekly/Bi-weekly/Monthly/Quarterly)
- [ ] Enroll button visible and functional
- [ ] Validation errors for invalid commitment
- [ ] Module list preview (titles only, no projects)

### 6.2 Enrolled View
- [ ] Progress bar shows correct percentage
- [ ] Motivational message based on progress
- [ ] Hero project card shows current active project
- [ ] Project title and instructions visible
- [ ] "Complete" button opens completion modal
- [ ] Module timeline renders all modules
- [ ] Current module highlighted
- [ ] Completed modules show completion status
- [ ] Modules are expandable/collapsible
- [ ] Projects listed under each module

### 6.3 Unenroll
- [ ] Unenroll option accessible
- [ ] Confirmation dialog appears
- [ ] Confirming unenroll removes enrollment
- [ ] Page updates to unenrolled view

### 6.4 Course Completion
- [ ] When all modules completed: celebration component appears
- [ ] Progress shows 100%

---

## 7. Project Completion Modal

- [ ] Modal opens from active project card or carousel
- [ ] Course name, module name, project title displayed
- [ ] Comment textarea available (optional)
- [ ] Character counter works
- [ ] Image upload button present
- [ ] Upload accepts JPEG, PNG, WebP
- [ ] Upload rejects files > 10 MB
- [ ] Image preview shown after upload
- [ ] Remove image button works
- [ ] "Cancel" dismisses modal
- [ ] "Mark as Completed" submits successfully
- [ ] Loading spinner during submission
- [ ] After completion: project status updates, next project shown

---

## 8. Settings Modal

### 8.1 Opening Settings
- [ ] Settings accessible from dashboard header dropdown
- [ ] Modal opens with three tabs: General, API Keys, Customization
- [ ] Default tab is General

### 8.2 General Tab - Avatar
- [ ] Current avatar displayed (or initial placeholder)
- [ ] Upload button opens file picker
- [ ] New avatar preview shown
- [ ] Save updates avatar
- [ ] Clear removes avatar

### 8.3 General Tab - Username
- [ ] Current username displayed
- [ ] Edit field allows changes
- [ ] Save validates uniqueness
- [ ] Error shown for taken username
- [ ] Success message on update

### 8.4 General Tab - Display Name
- [ ] Current name displayed
- [ ] Edit field allows changes
- [ ] Character limit enforced
- [ ] Save updates name
- [ ] Dashboard header reflects change

### 8.5 General Tab - Email
- [ ] Current email displayed
- [ ] Edit field for new email
- [ ] Save triggers verification notification

### 8.6 General Tab - Password
- [ ] Section visible for email auth users
- [ ] Current password, new password, confirm fields
- [ ] Validation for minimum length
- [ ] Mismatch shows error
- [ ] Success message on update

### 8.7 API Keys Tab
- [ ] Masked key shown if exists ("currently set" indicator)
- [ ] Input field for new key
- [ ] Security info button opens info modal
- [ ] Google AI Studio link present
- [ ] Save encrypts and stores key
- [ ] Clear removes key
- [ ] Success/error messages

### 8.8 Customization Tab - Tone
- [ ] 8 preset tone options visible
- [ ] Each shows name and description
- [ ] Selecting a preset highlights it
- [ ] Custom option enables textarea
- [ ] Character limit on custom tone
- [ ] Reset to default button works
- [ ] Save persists selection

### 8.9 Customization Tab - Theme
- [ ] 5 theme options visible (Terminal, Space, School, Gym, 90s Internet)
- [ ] Each shows color preview and description
- [ ] Clicking theme applies it instantly
- [ ] Selected theme shows checkmark
- [ ] Theme persists after page reload
- [ ] All UI elements update to new theme colors

---

## 9. Upcoming Projects Banner

- [ ] Banner appears on dashboard if enrolled courses have upcoming projects
- [ ] Shows "Upcoming Projects" title with count
- [ ] Project list shows: checkbox, title, course name, step info, due date
- [ ] Due date color coding: red (overdue), yellow (due soon), gray (normal)
- [ ] Clicking project navigates to course page
- [ ] Checkbox opens completion modal
- [ ] "Load more" button appears if > 5 projects
- [ ] Pagination works correctly

---

## 10. Theme System

- [ ] Terminal theme: green accent, dark background, CRT effects
- [ ] Space theme: purple accent
- [ ] School theme: orange/brown accent
- [ ] Gym theme: pink/red accent
- [ ] 90s Internet theme: cyan accent
- [ ] Theme applies to all pages consistently
- [ ] Buttons, links, progress bars all use theme colors
- [ ] No hardcoded colors visible (all use `--t-*` tokens)

---

## 11. Responsive & Cross-cutting

### 11.1 Loading States
- [ ] Skeleton loaders appear for profile, courses, course detail
- [ ] Spinners shown during form submissions
- [ ] No layout shift when data loads

### 11.2 Error Boundary
- [ ] If a component crashes: fallback error UI shown
- [ ] Retry button attempts recovery

### 11.3 i18n
- [ ] Language persists across page navigations
- [ ] All user-facing text uses i18n keys (no raw English in non-en locale)

---

## 12. Static Pages

- [ ] `/privacy-policy` renders full content with "Back to Home" link
- [ ] `/terms-and-conditions` renders full content with "Back to Home" link

---

## Test Execution Notes

- **Pass**: Feature works as described
- **Fail**: Feature broken or behaves unexpectedly (note the issue)
- **Skip**: Feature cannot be tested (note reason)
- **Partial**: Feature partially works (note what's broken)

When a test fails, capture:
1. Screenshot of the failure
2. Console errors (via `read_console_messages`)
3. Network request failures (via `read_network_requests`)
4. Steps to reproduce
