# Browser-Based Coding Platform — Product & UI Design Brief

## AppName: CoderArena

## 1. Product Overview

Design a modern developer-focused web application that combines a **browser-based coding environment, isolated development playgrounds, GitHub integration, and interview preparation**.

The core idea is:

> **A complete coding environment in the browser where developers can build, experiment, and prepare for technical interviews without setting up a local development environment.**

Users can instantly create coding playgrounds from predefined templates:

- React
- Next.js
- Vue
- Angular
- TypeScript (no framework)
- Express
- Hono
- Other frameworks and runtimes in the future

The template list is defined in the project (`src/lib/sandbox-templates.ts`), which is the source of truth wherever this brief mentions playground templates.

LeetCode-style algorithm problems are solved in a language rather than a framework template: **JavaScript, TypeScript, or Python** (see sections 7 and 19). The TypeScript playground template is separate: a plain TypeScript web project with no framework.

Each playground provides an isolated development environment running through Docker-based infrastructure. Users can write code in a Monaco-style editor, run their application, and see the result through a realtime preview.

The product should eventually evolve into an **interview preparation platform for software developers**, combining practical development exercises with LeetCode-style programming problems.

---

# 2. Core Product Concept

The platform has two major experiences.

### Development Playground

Users get a complete browser-based development environment:

- File explorer
- Code editor
- Terminal
- Live application preview
- Multiple files
- Framework templates
- Dependency installation
- Code execution
- Persistent sessions
- Save and restore playgrounds
- GitHub integration

### Interview Practice

A future section will provide structured technical interview practice:

- Development challenges
- React challenges
- Next.js challenges
- Backend challenges
- API development challenges
- JavaScript/TypeScript problems
- LeetCode-style algorithm problems in JavaScript, TypeScript, or Python
- Test cases
- Automatic code execution
- Automated evaluation
- Difficulty levels
- Progress tracking

The platform should feel like a combination of:

**CodeSandbox + GitHub Codespaces + LeetCode + an interview preparation platform**, while maintaining its own identity.

Do not directly copy the visual design of these products.

---

# 3. Target Users

The primary users are software developers and students preparing for technical interviews.

### Main user groups

#### Students

Students want to:

- Practice coding
- Prepare for interviews
- Learn frameworks
- Solve programming problems
- Build small projects
- Practice without configuring their computer

#### Junior Developers

They want to:

- Improve practical coding skills
- Practice realistic development tasks
- Prepare for coding interviews
- Experiment with frameworks
- Build portfolio projects

#### Experienced Developers

They may use the platform to:

- Quickly test ideas
- Experiment with frameworks
- Review coding concepts
- Practice interview questions
- Clone and modify GitHub repositories

---

# 4. Brand Personality

The product should feel:

- Developer-first
- Technical
- Modern
- Minimal
- Fast
- Reliable
- Professional
- Slightly futuristic
- AI-native without becoming an "AI gimmick"

Avoid generic startup aesthetics.

Do not make the interface look like a marketing SaaS dashboard with excessive gradients, giant rounded cards, random illustrations, or fake statistics.

The visual language should feel like a serious developer tool.

Think:

**modern IDE + developer infrastructure + premium SaaS.**

---

# 5. Visual Design Direction

Use a dark-first interface.

Primary characteristics:

- Dark charcoal/near-black background
- Subtle borders
- High information density
- Monospace typography for code-related information
- Clean sans-serif typography for application UI
- Small radius cards
- Minimal shadows
- Subtle accent colors
- Excellent spacing
- Strong visual hierarchy

Accent color: **orange** (`--brand` in `src/app/globals.css`), on a black/neutral base. Primary buttons stay black (light theme) / near-white (dark theme). Green is reserved for success states (tests passed, Accepted, saved).

Use the accent primarily for:

- Primary actions
- Active navigation
- Status indicators
- Selected items
- Progress
- Important interactive elements

Do not overuse the accent.

The UI should resemble a professional developer product rather than a gaming interface.

---

# 6. Landing Page

Create a polished marketing landing page introducing the platform.

## Hero Section

The hero should immediately communicate the core value.

Possible headline direction:

> **Code. Build. Practice. Anywhere.**

Alternative:

> **Your coding environment, directly in the browser.**

Supporting text:

> Create isolated development environments, build with your favorite frameworks, connect GitHub repositories, and prepare for technical interviews — all from one browser-based workspace.

Primary CTA:

**Start Coding**

Secondary CTA:

**Explore Playground**

The hero should contain a realistic product screenshot/mockup showing the browser IDE.

Do not use an abstract illustration as the primary hero visual.

Show the actual product.

---

# 7. Landing Page Sections

## Section: Instant Development Environment

Explain that users can create a development environment without installing dependencies locally.

Show:

- Template selection
- React
- Next.js
- Vue
- Angular
- TypeScript
- Express
- Hono

Message:

> Pick a template and start coding immediately.

---

## Section: Code in the Browser

Show a realistic IDE interface.

Highlight:

- Monaco editor
- File explorer
- Terminal
- Live preview
- Multiple files
- Persistent workspace

Copy direction:

> A complete development environment without leaving your browser.

---

## Section: GitHub Integration

Explain GitHub functionality.

Users can:

- Connect their GitHub account
- Push playgrounds to GitHub
- Create repositories
- Clone existing repositories
- Edit repositories inside the browser
- Continue working on existing projects

Visual design:

Show a GitHub repository being imported into a playground and then edited inside the IDE.

---

## Section: Practice Real Development

Introduce the future interview-practice functionality.

Instead of only solving algorithm problems, users can practice realistic software development tasks.

Examples:

- Build a React component
- Implement an API
- Fix a broken application
- Implement authentication
- Build a REST endpoint
- Debug a Node.js application
- Implement a frontend feature

Message:

> Practice the kind of coding you actually do in software engineering interviews.

---

## Section: Algorithm Practice

Introduce the future LeetCode-style system.

Show:

- Problem description
- Code editor
- Language selector: JavaScript, TypeScript, Python
- Test cases
- Run button
- Evaluation
- Runtime
- Memory
- Submission status

Problems should be executed inside isolated environments using the platform's backend evaluation infrastructure.

---

## Section: One Workspace

Present the product as a unified environment:

**Learn → Code → Test → Build → Push**

Avoid positioning the product as merely another online code editor.

The long-term vision is an integrated developer interview preparation platform.

---

# 8. Authentication

Design a clean authentication experience.

Support:

- Email/password
- Google
- GitHub

The GitHub authentication flow should clearly explain that GitHub authorization is required for repository-related functionality.

Authentication pages should be minimal and developer-focused.

Example:

```
Welcome back

Continue with GitHub
Continue with Google

----------------

Email
Password

Sign in
```

Avoid unnecessary onboarding questions.

---

# 9. Dashboard

The dashboard is the primary application home.

Layout:

### Left Sidebar

Navigation:

- Dashboard
- Playgrounds
- GitHub
- Practice
- Problems
- Submissions
- Settings

At the bottom:

- User profile
- Account settings
- Theme
- Logout

---

# 10. Dashboard Main Area

Header:

> Good evening, [Name]

Supporting text:

> Continue where you left off or start something new.

Primary actions:

**New Playground**

**Practice Problem**

---

## Recent Playgrounds

Display recently accessed playgrounds.

Each item should show:

- Project name
- Framework/template
- Last modified
- GitHub repository if connected
- Running/stopped state

Example:

```
my-next-app
Next.js · TypeScript

Updated 12 minutes ago
GitHub: github.com/user/my-next-app
```

---

## Quick Start Templates

Provide template cards:

- React
- Next.js
- Vue
- Angular
- TypeScript
- Express
- Hono

Each card should have:

- Framework icon
- Name
- Short description
- Create button

---

## Continue Practicing

Show interview practice progress.

Example:

```
Frontend
12 / 30 completed

Algorithms
24 / 100 completed

Backend
7 / 25 completed
```

Use subtle progress indicators rather than large decorative charts.

---

# 11. Playground Creation Flow

When the user clicks **New Playground**, show a template selection interface.

Title:

> Create a new playground

Template categories:

### Frontend

- React
- Vue
- Angular
- TypeScript

### Full-stack

- Next.js

### Backend

- Express
- Hono

These are the templates defined in the project (`src/lib/sandbox-templates.ts`). The TypeScript template is a plain TypeScript web project (Vite, no framework). JavaScript and Python are not playground templates; like TypeScript, they are languages for algorithm problems (section 19).

Each template should display:

- Logo
- Template name
- Runtime
- Short description

Example:

```
React
UI library for interactive web apps

JavaScript
Vite

[Create Playground]
```

Allow the user to optionally enter a project name.

---

# 12. Playground / IDE Interface

This is the most important application screen.

The design should resemble a professional IDE.

Structure:

```
┌──────────────────────────────────────────────────────────────┐
│ Logo   Project Name       GitHub   Run   Save   User         │
├────────────┬─────────────────────────────────┬───────────────┤
│            │                                 │               │
│ File       │                                 │               │
│ Explorer   │        Code Editor              │   Preview     │
│            │                                 │               │
│ src/       │        Monaco Editor            │   Browser     │
│  App.jsx   │                                 │   Preview     │
│  main.jsx  │                                 │               │
│ package... │                                 │               │
│            │                                 │               │
├────────────┴─────────────────────────────────┴───────────────┤
│ Terminal                                                     │
│ $ npm install                                                │
│ $ npm run dev                                                │
└──────────────────────────────────────────────────────────────┘
```

The IDE should support:

### File Explorer

- Create file
- Create folder
- Rename
- Delete
- Upload
- Search

### Editor

Use a Monaco-style editor.

Features:

- Syntax highlighting
- Autocomplete
- Multiple tabs
- Search
- Replace
- Line numbers
- Error indicators

Future:

- AI autocomplete
- AI code explanation
- AI debugging
- AI suggestions

### Preview

Display the running application.

Include:

- Refresh
- Open in new tab
- Device size selector
- URL/address indicator

### Terminal

Provide a terminal at the bottom.

Users should be able to run commands inside the isolated environment.

---

# 13. Playground Persistence

A playground should automatically save the user's work.

The system should remember:

- Files
- Folder structure
- Code changes
- Dependencies
- Configuration
- Terminal/session state where appropriate
- Last opened file
- Editor state

Users should be able to close the browser and later return to the same playground.

Display:

> Saved just now

or

> Saving...

This gives the application the feel of a persistent development workspace.

---

# 14. GitHub Integration

Create a dedicated GitHub section.

Possible states:

### GitHub Not Connected

Display:

> Connect GitHub to import repositories and push your playgrounds.

CTA:

**Connect GitHub**

---

### GitHub Connected

Show:

- GitHub username
- Repository list
- Search repositories
- Import repository
- Create repository

Repository cards should show:

- Repository name
- Visibility
- Default branch
- Last updated

---

# 15. Push Playground to GitHub

Inside a playground:

Button:

**Push to GitHub**

Open a modal:

```
Push to GitHub

Repository name
[ my-react-project ]

Visibility
○ Public
○ Private

Description
[ ... ]

[Cancel] [Create Repository]
```

After successful push:

> Successfully pushed to GitHub.

Provide repository link.

---

# 16. Clone GitHub Repository

Dashboard action:

**Import from GitHub**

Flow:

```
Select Repository

Search repositories...

my-project
awesome-next-app
portfolio
interview-prep

[Import]
```

After selecting:

> Preparing your development environment...

Then open the repository inside the browser IDE.

The experience should feel nearly instantaneous even though the backend may be provisioning a container.

---

# 17. Interview Practice Platform

This is the long-term expansion of the product.

Create a dedicated **Practice** section.

Navigation:

```
Practice
├── Overview
├── Development
├── Algorithms
├── Frontend
├── Backend
└── System Design
```

---

# 18. Practice Dashboard

Show:

### Your Progress

- Problems solved
- Problems attempted
- Success rate
- Current streak
- Practice time

### Categories

```
Algorithms
Frontend
Backend
React
Node.js
Databases
APIs
System Design
```

Each category displays progress.

Avoid turning the dashboard into a gamified children's learning platform.

Keep it professional and developer-focused.

---

# 19. Problem Page

The problem-solving interface should resemble a professional coding assessment platform.

Layout:

```
┌───────────────────────┬─────────────────────────────┐
│                       │                             │
│ Problem Description   │ Code Editor   [JavaScript ▾]│
│                       │                             │
│ Title                 │                             │
│ Difficulty            │                             │
│ Description           │                             │
│ Examples              │                             │
│ Constraints           │                             │
│                       │                             │
│                       │                             │
├───────────────────────┴─────────────────────────────┤
│ Test Cases                                          │
│                                                     │
│ Input          Output          Result               │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Run Code                         Submit Solution    │
└─────────────────────────────────────────────────────┘
```

### Languages

Algorithm problems can be solved in:

- JavaScript
- TypeScript
- Python

The editor header has a language selector. Each problem provides starter code in all three languages, and its test cases run against the language the user submits in.

---

# 20. Development Challenges

Unlike traditional algorithm platforms, development challenges should simulate real software engineering tasks.

Examples:

### React

> Build a searchable user table with pagination and sorting.

### Next.js

> Implement an authenticated dashboard with server-side data fetching.

### Node.js

> Build a REST API for managing tasks.

### Debugging

> Find and fix the memory leak in this Node.js service.

### Backend

> Implement rate limiting middleware.

### Database

> Optimize this slow database query.

The challenge environment should provide a starter repository.

The user edits the repository in the browser.

The backend runs tests against the user's code.

---

# 21. Evaluation System

The platform should provide automated evaluation.

When the user submits:

```
Running tests...

✓ Test 1
✓ Test 2
✓ Test 3
✗ Test 4

3 / 4 tests passed
```

For algorithm problems:

- Test cases
- Runtime
- Memory
- Compilation errors
- Runtime errors

For development challenges:

- Unit tests
- Integration tests
- API tests
- Functional tests
- Potentially lint/type checks

The evaluation system should run code in isolated containers.

---

# 22. Submission History

Each problem should have a submission history.

Display:

```
Submissions

Today · 21:32
Accepted
Runtime: 124 ms

Today · 21:21
Wrong Answer

Yesterday · 18:42
Runtime Error
```

Users can open a previous submission and inspect their code.

---

# 23. Design System

Create a reusable design system.

Components should include:

- Buttons
- Inputs
- Dropdowns
- Modals
- Tabs
- Cards
- Badges
- Tooltips
- Toast notifications
- Progress indicators
- Tables
- Command palette
- File tree
- Code editor
- Terminal
- Resizable panels

Use consistent spacing, typography, borders, radius, and interaction states.

---

# 24. Important UX Principles

### 1. Developer-first

The product should prioritize productivity over decorative UI.

### 2. Fast feedback

Actions should provide immediate feedback.

Examples:

```
Saving...
Saved
Connecting...
Connected
Building...
Running...
Tests passed
```

### 3. Minimal friction

A user should be able to go from:

**Login → Create Playground → Code**

within seconds.

### 4. Persistent state

Users should never worry about losing their code.

### 5. Clear system status

Because containers, builds, previews, GitHub operations, and evaluations happen asynchronously, status must always be visible.

### 6. Keyboard-friendly

Support keyboard shortcuts throughout the application.

Consider a global command palette:

`Cmd/Ctrl + K`

Example commands:

```
> Create playground
> Open playground
> Search files
> Import GitHub repository
> Run project
> Open terminal
> Search practice problems
```

---

# 25. Responsive Design

The main IDE is optimized for desktop.

The marketing website and dashboard should be responsive.

On smaller screens:

- Sidebar becomes collapsible
- Panels become tabs
- Preview becomes a separate tab
- Terminal becomes expandable
- Editor remains usable

Do not attempt to squeeze the complete three-panel IDE into a mobile screen.

---

# 26. Empty States

Create thoughtful empty states.

Examples:

### No Playgrounds

> Your workspace is empty.

> Create your first playground and start coding in seconds.

**Create Playground**

### No GitHub Connection

> Connect GitHub to import repositories and push your projects.

**Connect GitHub**

### No Practice History

> Start your first challenge.

**Browse Problems**

Avoid generic illustrations where possible. Use simple icons and clear typography.

---

# 27. Loading States

The application relies on container provisioning, so loading states are important.

Example:

```
Preparing playground

✓ Creating workspace
✓ Starting container
✓ Installing dependencies
● Starting development server

Almost ready...
```

This should feel like infrastructure is working rather than a generic loading spinner.

---

# 28. Error Handling

Errors should be understandable to developers.

Bad:

> Something went wrong.

Better:

> Development server failed to start.

```
Error: Port 3000 is already in use.
```

Actions:

**Restart Environment**

**View Logs**

**Open Terminal**

---

# 29. Overall Application Structure

Final navigation should approximately be:

```
Dashboard
│
├── Playgrounds
│   ├── All Playgrounds
│   ├── Recent
│   └── Templates
│
├── Practice
│   ├── Overview
│   ├── Development
│   ├── Algorithms
│   ├── Frontend
│   ├── Backend
│   └── System Design
│
├── GitHub
│   ├── Repositories
│   └── Imports
│
├── Submissions
│
└── Settings
```

---

# 30. Product Evolution

The UI should be designed so that the current playground product can naturally evolve into the larger platform.

### Phase 1

Browser IDE

```
Templates
    ↓
Playground
    ↓
Editor
    ↓
Terminal + Preview
```

### Phase 2

GitHub integration

```
GitHub
    ↕
Playground
    ↕
Browser IDE
```

### Phase 3

Interview practice

```
Problems
    ↓
Starter Repository
    ↓
Browser IDE
    ↓
Tests
    ↓
Evaluation
    ↓
Submission
```

### Phase 4

Complete developer interview platform

```
Learn
  ↓
Practice
  ↓
Build
  ↓
Test
  ↓
Evaluate
  ↓
Track Progress
```

The interface should make this evolution feel natural rather than requiring a complete redesign later.

---

# 31. Landing Page Messaging

The product should communicate one central idea:

> **Practice software engineering by actually writing software.**

Traditional algorithm platforms focus primarily on isolated coding problems.

This platform should differentiate itself by allowing developers to practice **real development environments and realistic engineering tasks**.

The positioning should be around:

**Build. Practice. Ship.**

rather than simply:

**Solve coding problems.**

---

# 32. Final Design Requirement

Generate a complete, production-quality UI/UX system for this product.

Design the following screens:

1. Landing page
2. Login
3. Signup
4. Dashboard
5. Playground creation
6. Playground/IDE
7. GitHub integration
8. GitHub repository import
9. GitHub push flow
10. Practice dashboard
11. Problem listing
12. Problem detail + code editor
13. Test/evaluation results
14. Submission history
15. Settings
16. Empty states
17. Loading states
18. Error states

The result should feel like a **serious developer infrastructure product**, not a generic SaaS dashboard.

Prioritize:

**clarity → usability → developer workflow → performance perception → visual polish.**

Use realistic developer content rather than placeholder text such as "Lorem ipsum".

Use realistic project names, repository names, code snippets, terminal output, problem descriptions, and test results so the UI feels like a real product.

Do not fabricate user counts, reviews, company logos, customer logos, revenue numbers, or fake testimonials.

The final design should be cohesive across the marketing website and authenticated application while clearly distinguishing the landing-page experience from the dense developer IDE experience.
