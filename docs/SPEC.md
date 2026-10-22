# Circle — Project Spec

Circle is where fans talk. Users join fan communities ("circles") for movies, books and
football, post and discuss in them, and chat live with other members.

## 1. Scope

### Lab Phase (frontend first)
1. Auth screens: register, log in, stay logged in, log out
2. Profile: display name, bio, avatar; any logged-in user can view any profile
3. Circles: browse the seeded circles, join and leave; circle page shows its posts
4. Posts: create in a joined circle (text and/or one photo, optional spoiler flag);
   delete own; feed of posts from joined circles
5. Likes: like/unlike a post
6. Comments: add (emoji picker), edit own, delete own; post author can delete any
   comment on their post
7. Live circle chat: one real-time chat room per circle, members only
8. Search: one search bar, results in three tabs — Circles, People, Posts
9. Landing page with a Three.js animated hero

The frontend is built first against a mock API (MSW) that follows section 5 exactly,
so it connects to the real backend later without rewrites.

### Later / startup version
Following users, DMs, user-created circles, moderation, notifications, stories,
reposts, bookmarks, video, GIFs, more niches (e.g. fragrance), refresh tokens and
httpOnly-cookie auth, external movie/book/football data.

## 2. Stack
Client: Vite, React 19, TypeScript (strict), Redux Toolkit + RTK Query, React Router,
Tailwind CSS, MSW (mock API), React Toastify, emoji-picker-react, socket.io-client,
@react-three/fiber + @react-three/drei
Server: Node 22+, Express 5, TypeScript (strict), Mongoose, Zod, bcrypt, jsonwebtoken,
Cloudinary (signed direct uploads), socket.io, helmet, cors, express-rate-limit, dotenv
Data: MongoDB Atlas | Media: Cloudinary
Hosting: client on Vercel, server on Render
Testing: Vitest + Supertest (server logic and routes), Postman + Newman (API contract)

## 3. Folder structure
```
talkcircle/
  README.md
  docs/SPEC.md
  postman/
  client/
    src/
      app/            store, router, hooks
      features/       auth, circles, posts, profile, chat, search
      components/     ui/, three/
      pages/
      lib/            api, socket, token
      mocks/          MSW handlers and mock data
      types/
  server/
    src/
      config/         env.ts, db.ts
      models/         <name>.model.ts
      repositories/   <name>.repository.ts   (the only layer that talks to MongoDB)
      services/       <name>.service.ts      (business rules and permission checks)
      controllers/    <name>.controller.ts   (validate input, call service, respond)
      routes/         <name>.routes.ts
      validators/     <name>.schemas.ts      (Zod)
      middleware/     errorHandler, rateLimit, requireAuth
      socket/         chat handlers
      utils/          AppError.ts, pagination.ts
      scripts/        seed.ts, checkDb.ts
      app.ts
      server.ts
```
Boundary rule: a service calls only its own repository. If it needs another domain's
data, it calls that domain's service.

## 4. Data models
User: username (unique, lowercase, 3–20, a-z 0-9 _), email (unique, lowercase),
passwordHash (never returned), displayName (1–50), bio (0–160),
avatar {url, publicId} | null, timestamps

Circle: name, slug (unique), category ("movies" | "books" | "football"),
description (0–300), memberCount, timestamps. Created only by the seed script.

Membership: user, circle, timestamps. Owned by circles.

Post: author, circle, text (0–2000), image {url, publicId} | null (text or image
required), isSpoiler (default false), likeCount, commentCount, timestamps

Like: user, post, timestamps. Owned by interactions.

Comment: post, author, text (1–500), editedAt: Date | null, timestamps

ChatMessage: circle, sender, text (1–1000), timestamps

Counters (memberCount, likeCount, commentCount) change in the same MongoDB transaction
as the record they count, and only when membership/like/comment actually changed.

### Indexes
| Collection | Index | Serves |
|---|---|---|
| users | email (unique), username (unique) | Login, profile lookup, no duplicate accounts |
| users | text index on username, displayName | People search |
| circles | slug (unique); text index on name, description | Circle page, circle search |
| memberships | { user, circle } (unique); { circle } | Membership checks, no double joins |
| posts | { circle, createdAt, _id } | Circle page and feed |
| posts | { author, createdAt } | Profile posts |
| posts | text index on text | Post search |
| likes | { user, post } (unique) | No double likes |
| comments | { post, createdAt } | Comments in order |
| chatmessages | { circle, createdAt } | Chat history |

Seeded circles (scripts/seed.ts, idempotent by slug):
Movies: Marvel & DC, Nollywood, Hollywood, bollywood,Anime · Books: African Literature, Fantasy & Sci-Fi ·
Football: Premier League, laliga UCL, UEL,NPFL, Super Eagles

## 5. API contract (base /api, JSON, auth = Authorization: Bearer <jwt>)
Errors always: { "error": { "code": string, "message": string, "details"?: unknown } }
Lists are cursor-paginated on (createdAt, _id): ?cursor=<opaque>&limit=<1-20, default 10>
→ { items, nextCursor }

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /health | no | 200 if DB connected, 503 if not |
| POST | /auth/register | no | → 201 { token, user } |
| POST | /auth/login | no | → { token, user } |
| GET | /auth/me | yes | Current user |
| GET | /users/:username | yes | Public profile with stats |
| PATCH | /users/me | yes | Update displayName, bio, avatar { publicId } |
| GET | /users/:username/posts | yes | Profile posts |
| GET | /circles | yes | All circles, each with isMember |
| GET | /circles/:slug | yes | One circle with isMember |
| POST | /circles/:slug/join | yes | Idempotent join |
| DELETE | /circles/:slug/join | yes | Idempotent leave |
| GET | /circles/:slug/posts | yes | Circle posts, newest first |
| GET | /circles/:slug/messages | yes | Members only; chat history, newest first |
| POST | /media/signature | yes | Signed Cloudinary upload params for the user's folder |
| POST | /posts | yes | { circleId, text?, image? { publicId }, isSpoiler? }; members only |
| GET | /posts/feed | yes | → { items: FeedItem[], nextCursor } from joined circles |
| GET | /posts/:id | yes | Single post |
| DELETE | /posts/:id | yes | Author only; deletes image, likes and comments |
| POST | /posts/:id/like | yes | Idempotent like |
| DELETE | /posts/:id/like | yes | Idempotent unlike |
| GET | /posts/:id/comments | yes | Paginated, oldest first |
| POST | /posts/:id/comments | yes | Add comment |
| PATCH | /comments/:id | yes | Comment author only; sets editedAt |
| DELETE | /comments/:id | yes | Comment author OR post author |
| GET | /search?q=&type=circles\|people\|posts | yes | q is 2–100 chars; paginated |

FeedItem = { type: "post", post: Post } — a union, extensible to ads/suggestions later.
Feed selection logic lives only in services/feed.service.ts.

Socket.io (connect with auth: { token }; each socket joins room user:<id>)
- client → server: circle:enter { circleId } → ack; server checks membership, joins circle:<id>
- client → server: circle:exit { circleId } → leaves the room
- client → server: message:send { circleId, text } → ack { ok: true, message } | { ok: false, error }
- server → room circle:<id>: message:new { message }
- Leaving a circle via the API also removes that user's sockets from the circle room.

## 6. Rules and limits
- All permissions are enforced in services and socket handlers; unauthorized → 403
- Posting and chatting require circle membership; leaving keeps existing posts
- Images go browser → Cloudinary directly; the server never holds image data in memory.
  Uploads are limited to the user's own folder, jpeg/png/webp, max 5 MB.
- Every authenticated response sends Cache-Control: no-store
- Passwords: min 8 chars, bcrypt cost 12; JWT expiry 7 days
- JWT stored in localStorage — known limitation; cookie-based auth planned later.
  On logout the client clears the RTK Query cache.
- Rate limits: 10/min on /auth/*, 100/min elsewhere; chat 5 messages per 10 s per user
- Search: debounced 300 ms on the client; query text is never used as a raw regex
- Local server port: 4000

## 7. Screens and design
Mobile-first, snap-inspired direction: activity rings on circles, central create
button, full-screen live chat, tile-based Explore.
Screens: Landing (Three.js hero) · Register/Login · Home feed · Explore circles ·
Circle page (posts + live chat) · Post detail with comments · Search (Circles, People,
Posts) · Profile (+ edit) · 404.
States: empty, loading (skeletons), error/offline, long content, large numbers (12.4k).
Typography: three-font system (logo, headings, body) — to be finalised in Figma.
Accessibility: 44px minimum touch targets, WCAG AA contrast.
Responsive targets: 360, 390, 768, 1280+ px.

## 8. Known scaling limits
| Component | Breaks when | Later fix |
|---|---|---|
| Rate-limit counters (in memory) | 2+ server instances | Redis store |
| Socket.io rooms | 2+ server instances | Socket.io Redis adapter |
| Feed query ($in over joined circles) | Users join hundreds of circles | Precomputed feeds |
| MongoDB text search | Typo tolerance needed | Atlas Search |
| JWT in localStorage | Need to revoke stolen sessions | Refresh tokens + revocation |
| Render / Atlas free tiers | Real traffic | Paid plans |