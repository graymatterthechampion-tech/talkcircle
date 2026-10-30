# Circle — Project Spec

Circle is where fans talk. Users join fan communities ("circles") for movies, books and
football, follow other fans, post and discuss in circles, and chat live with other members.

## 1. Scope

### Lab Phase (frontend first)
1. Auth screens: register, log in, stay logged in, log out
2. Profile: display name, bio, avatar, follower and following counts; any logged-in user
   can view any profile
3. Following: follow and unfollow users; followers and following lists
4. Circles: browse the seeded circles, join and leave; circle page shows its posts with
   Hot and New tabs
5. Posts: create in a joined circle (text and/or one photo, optional spoiler flag);
   delete own; Home feed of posts from joined circles, followed users and yourself
6. Likes: like/unlike a post
7. Comments: add (emoji picker), edit own, delete own; post author can delete any
   comment on their post
8. Live circle chat: one real-time chat room per circle, members only
9. Search: one search bar, results in three tabs — Circles, People, Posts
10. Settings: account rows, Appearance (System, Light, Dark), log out; rows not built
    yet are shown disabled with "Coming soon"
11. Landing page with a Three.js animated hero

The frontend is built first against a mock API (MSW) that follows section 5 exactly,
so it connects to the real backend later without rewrites.

### Later / startup version
"For you" ranked Home tab, per-category ranking decay, DMs, user-created circles,
moderation, notifications, stories, reposts, bookmarks, voice notes, video, live rooms,
GIFs, more niches (e.g. fragrance), refresh tokens and httpOnly-cookie auth, appearance
saved to the account, external movie/book/football data.

## 2. Stack
Client: Vite, React 19, TypeScript (strict), Redux Toolkit + RTK Query, React Router,
Tailwind CSS, lucide-react, MSW (mock API), React Toastify, emoji-picker-react,
socket.io-client, @react-three/fiber + @react-three/drei
Server: Node 24, Express 5, TypeScript (strict), Mongoose, Zod, Passport.js
(passport-local, passport-jwt), bcrypt, jsonwebtoken, Cloudinary (signed direct uploads),
socket.io, helmet, cors, express-rate-limit, dotenv
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
      app/            router, store, hooks
      features/       auth, circles, posts, profile, follows, chat, search, settings
      components/     layout/, ui/, three/
      pages/
      lib/            api, socket, token, theme
      mocks/          MSW handlers and mock data
      types/
  server/
    src/
      config/         env.ts, db.ts, passport.ts
      models/         <name>.model.ts
      repositories/   <name>.repository.ts   (the only layer that talks to MongoDB)
      services/       <name>.service.ts      (business rules and permission checks)
      controllers/    <name>.controller.ts   (validate input, call service, respond)
      routes/         <name>.routes.ts
      validators/     <name>.schemas.ts      (Zod)
      middleware/     errorHandler, rateLimit, requireAuth
      socket/         chat handlers
      utils/          AppError.ts, pagination.ts, ranking.ts
      scripts/        seed.ts, checkDb.ts
      app.ts
      server.ts
```
Boundary rule: a service calls only its own repository. If it needs another domain's
data, it calls that domain's service.

## 4. Data models
User: username (unique, lowercase, 3–20, a-z 0-9 _), email (unique, lowercase),
passwordHash (never returned), displayName (1–50), bio (0–160),
avatar {url, publicId} | null, followerCount, followingCount, timestamps

Follow: follower, following, timestamps. Owned by follows. A user cannot follow
themselves.

Circle: name, slug (unique), category ("movies" | "books" | "football"),
description (0–300), memberCount, timestamps. Created only by the seed script.

Membership: user, circle, timestamps. Owned by circles.

Post: author, circle, text (0–2000), image {url, publicId} | null (text or image
required), isSpoiler (default false), likeCount, commentCount, hotScore, timestamps

Like: user, post, timestamps. Owned by interactions.

Comment: post, author, text (1–500), editedAt: Date | null, timestamps

ChatMessage: circle, sender, text (1–1000), timestamps

Counters (memberCount, followerCount, followingCount, likeCount, commentCount, hotScore)
change in the same MongoDB transaction as the record they count, and only when the
membership/follow/like/comment actually changed.

### Ranking (Hot)
hotScore = log10(1 + likeCount + 2 × commentCount) + createdAtSeconds / 45000
- Set when the post is created; recalculated only when likeCount or commentCount
  changes. Age is built in at creation, so scores never need recalculating as time
  passes, and the field can be stored and indexed.
- Comments weigh twice a like because they show discussion.
- 45000 seconds (12.5 hours): a post needs 10× the engagement to outrank one posted
  12.5 hours later.
- The formula lives only in utils/ranking.ts.
- Home is always chronological; Hot is used on circle pages only.

### Indexes
| Collection | Index | Serves |
|---|---|---|
| users | email (unique), username (unique) | Login, profile lookup, no duplicate accounts |
| users | text index on username, displayName | People search |
| follows | { follower, following } (unique); { following, createdAt } | Follow checks, no double follows, followers list |
| circles | slug (unique); text index on name, description | Circle page, circle search |
| memberships | { user, circle } (unique); { circle } | Membership checks, no double joins |
| posts | { circle, createdAt, _id } | Circle page New tab and Home feed |
| posts | { circle, hotScore, _id } | Circle page Hot tab |
| posts | { author, createdAt, _id } | Profile posts and Home feed |
| posts | text index on text | Post search |
| likes | { user, post } (unique) | No double likes |
| comments | { post, createdAt } | Comments in order |
| chatmessages | { circle, createdAt } | Chat history |

Seeded circles (scripts/seed.ts, idempotent by slug):
Movies: Marvel & DC, Nollywood, Hollywood, Bollywood, Anime · Books: African Literature,
Fantasy & Sci-Fi · Football: Premier League, La Liga, UCL, UEL, NPFL, Super Eagles

## 5. API contract (base /api, JSON, auth = Authorization: Bearer <jwt>)
Errors always: { "error": { "code": string, "message": string, "details"?: unknown } }
Lists are cursor-paginated: ?cursor=<opaque>&limit=<1-20, default 10> → { items, nextCursor }
Chronological lists page on (createdAt, _id); the Hot tab pages on (hotScore, _id).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /health | no | 200 if DB connected, 503 if not |
| POST | /auth/register | no | → 201 { token, user } |
| POST | /auth/login | no | → { token, user } (passport-local) |
| GET | /auth/me | yes | Current user |
| GET | /users/:username | yes | Public profile with counts and isFollowing |
| PATCH | /users/me | yes | Update displayName, bio, avatar { publicId } |
| GET | /users/:username/posts | yes | Profile posts, newest first |
| POST | /users/:username/follow | yes | Idempotent follow; following yourself → 400 |
| DELETE | /users/:username/follow | yes | Idempotent unfollow |
| GET | /users/:username/followers | yes | Paginated, newest first, each with isFollowing |
| GET | /users/:username/following | yes | Paginated, newest first, each with isFollowing |
| GET | /circles | yes | All circles, each with isMember |
| GET | /circles/:slug | yes | One circle with isMember |
| POST | /circles/:slug/join | yes | Idempotent join |
| DELETE | /circles/:slug/join | yes | Idempotent leave |
| GET | /circles/:slug/posts?sort=hot\|new | yes | Circle posts; sort defaults to hot |
| GET | /circles/:slug/messages | yes | Members only; chat history, newest first |
| POST | /media/signature | yes | Signed Cloudinary upload params for the user's folder |
| POST | /posts | yes | { circleId, text?, image? { publicId }, isSpoiler? }; members only |
| GET | /posts/feed | yes | → { items: FeedItem[], nextCursor }; chronological |
| GET | /posts/:id | yes | Single post |
| DELETE | /posts/:id | yes | Author only; deletes image, likes and comments |
| POST | /posts/:id/like | yes | Idempotent like |
| DELETE | /posts/:id/like | yes | Idempotent unlike |
| GET | /posts/:id/comments | yes | Paginated, oldest first |
| POST | /posts/:id/comments | yes | Add comment |
| PATCH | /comments/:id | yes | Comment author only; sets editedAt |
| DELETE | /comments/:id | yes | Comment author OR post author |
| GET | /search?q=&type=circles\|people\|posts | yes | q is 2–100 chars; paginated |

Home feed = posts from joined circles, followed users and yourself, newest first. A post
that matches more than one rule appears once.
FeedItem = { type: "post", post: Post } — a union, extensible to ads/suggestions later.
Feed selection logic lives only in services/feed.service.ts.

Socket.io (connect with auth: { token }; each socket joins room user:<id>)
- client → server: circle:enter { circleId } → ack; server checks membership, joins circle:<id>
- client → server: circle:exit { circleId } → leaves the room
- client → server: message:send { circleId, text } → ack { ok: true, message } | { ok: false, error }
- server → room circle:<id>: message:new { message }
- Leaving a circle via the API also removes that user's sockets from the circle room.
- Chat is always chronological; it is never ranked.

## 6. Rules and limits
- Authentication uses Passport.js with session: false — passport-local checks
  email and password at login, passport-jwt protects every other route
  (config/passport.ts; requireAuth wraps passport.authenticate("jwt"))
- All permissions are enforced in services and socket handlers; unauthorized → 403
- Posting and chatting require circle membership; leaving keeps existing posts
- Spoiler posts are always blurred until tapped, in every list and in every sort order
- Hot tab: scores change while someone scrolls, so a post can move between pages. The
  client removes duplicates by post id; an occasional skipped post is accepted.
- Images go browser → Cloudinary directly; the server never holds image data in memory.
  Uploads are limited to the user's own folder, jpeg/png/webp, max 5 MB.
- Every authenticated response sends Cache-Control: no-store
- Passwords: min 8 chars, bcrypt cost 12; JWT expiry 7 days
- JWT stored in localStorage — known limitation; cookie-based auth planned later.
  On logout the client clears the RTK Query cache.
- Rate limits: 10/min on /auth/*, 100/min elsewhere; chat 5 messages per 10 s per user
- Search: debounced 300 ms on the client; query text is never used as a raw regex
- Appearance: System (follows the device), Light or Dark; default System. Saved on the
  device (localStorage); falls back to System if storage is blocked. Applied before
  the first paint so there is no flash of the wrong theme.
- Local server port: 4001

## 7. Screens and design
Mobile-first, snap-inspired direction: activity rings on circles, central create
button, full-screen live chat, tile-based Explore.
Screens: Landing (Three.js hero) · Register/Login · Home feed · Explore circles ·
Circle page (Hot/New posts + live chat) · Post detail with comments · Search (Circles,
People, Posts) · Profile (+ edit, followers, following) · Settings · 404.
States: empty, loading (skeletons), error/offline, long content, large numbers (12.4k).
Colours: charcoal accent, light and dark themes. All colours are tokens in
client/src/index.css; components never use fixed colour values. Colour never carries
meaning on its own (the active tab also has a dot and aria-current).
Typography: three-font system (logo, headings, body) — to be finalised in Figma.
Accessibility: 44px minimum touch targets, WCAG AA contrast (4.5:1 text, 3:1 icons).
Responsive targets: 360, 390, 768, 1280+ px.

## 8. Known scaling limits
| Component | Breaks when | Later fix |
|---|---|---|
| Rate-limit counters (in memory) | 2+ server instances | Redis store |
| Socket.io rooms | 2+ server instances | Socket.io Redis adapter |
| Home feed query (joined circles + followed users) | Users join hundreds of circles or follow thousands of people | Precomputed feeds (fan-out on write) |
| hotScore and counter updates | Thousands of likes per second on one viral post | Batch counter updates every few seconds |
| Hot tab pagination | Very active circles reorder quickly | Snapshot scores per scroll session |
| Likes and comments as ranking signals | Fake accounts inflate scores | Abuse detection, weighting trusted accounts |
| MongoDB text search | Typo tolerance needed | Atlas Search |
| JWT in localStorage | Need to revoke stolen sessions | Refresh tokens + revocation |
| Render / Atlas free tiers | Real traffic | Paid plans |