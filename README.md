# Circle

**Where fans talk.** A social app built around fan communities ("circles") for movies, books and football — post, discuss and chat live with people who love the same things.

> **Status:** In active development — GOMYCODE Lab Phase (Frontend)

## Lab Phase objectives

| Objective | Plan |
|---|---|
| Layout of the home page and user profiles | Mobile-first designs for Home and Profile, plus desktop layouts |
| Navigation and search | Bottom tab bar (mobile), sidebar (desktop); search across Circles, People and Posts |
| Styling | Tailwind CSS with a custom design system (colours, type, spacing) |
| Responsive testing | 360px Android, 390px iPhone, 768px tablet, 1280px+ desktop; Chrome DevTools, real devices, Safari, Lighthouse |

## Design

- Mobile-first, snap-inspired interface: activity rings on circles, a central create button, full-screen live chat and a tile-based Explore page
- Typography: a three-font system (logo, headings and body text), to be finalised in Figma
- Accessibility: 44px minimum touch targets and WCAG AA colour contrast
- Figma file: *link coming soon*

## Features

- Registration and login
- User profiles with avatar, bio and stats
- Fan circles for movies, books and football: browse, join and leave
- Posts with text and photos, with optional spoiler blur
- Feed of posts from the circles you've joined
- Likes and comments
- Live real-time chat in every circle
- Search across circles, people and posts
- Animated 3D landing page

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, Redux Toolkit (RTK Query), React Router, Tailwind CSS, Three.js |
| Mock API (frontend phase) | Mock Service Worker (MSW), following the API contract in `docs/SPEC.md` |
| Backend | Node.js, Express 5, TypeScript, MongoDB (Mongoose), Socket.io |
| Media | Cloudinary (direct uploads) |
| Testing | Vitest, Supertest, Postman / Newman |
| Deployment | Vercel (client), Render (server), MongoDB Atlas |

## Progress

- [x] Project spec and API contract (`docs/SPEC.md`)
- [x] UI concept and design direction
- [x] Server foundation: strict TypeScript, ESLint, environment validation, MongoDB connection, error class
- [ ] Figma designs (mobile and desktop)
- [ ] Frontend setup: Vite, Tailwind theme, routing
- [ ] Home feed and profile pages
- [ ] Navigation and search
- [ ] Explore, circle page and live chat UI
- [ ] Responsive testing and deployment to Vercel
- [ ] Backend API, then connect the frontend to it

## Project structure


## Running the server locally

Requirements: Node.js 22+, a MongoDB Atlas cluster.

```bash
cd server
npm install
cp .env.example .env
```

Fill in `server/.env`:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string, with `circle` as the database name |
| `JWT_SECRET` | At least 32 random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |

Then:

```bash
npm run dev        # start with auto-restart
npm test           # run the test suite
npm run typecheck  # check types
npm run lint       # check code quality
```

Check it's running: http://localhost:4001/api/health


## Development approach

Solo project. The frontend is built first against a mock API that follows the same contract as the real backend, so the two connect without rewrites. Developed with AI assistance (Claude) for planning, design concepts and code explanations; all code is reviewed, tested and understood by the author.

## Author

John Achadu — Software Developer
[GitHub](https://github.com/graymatterthechampion-tech) · [LinkedIn](https://www.linkedin.com/in/john-achadu-7863ba444/)