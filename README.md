# TalkCircle

A full-stack social media platform with real-time messaging, built with the MERN stack and TypeScript.

> **Status:** Draft — awaiting instructor approval (GOMYCODE Lab Phase, due 24 October 2026)

## About

TalkCircle puts your circle first: a feed of friends' posts, likes and comments, and private real-time conversations, with an animated 3D landing page built in Three.js.

## Core features (Lab Phase)

- Registration and login with JWT authentication
- User profiles with avatar and bio, visible to all logged-in users
- Posts with text and photos; a feed of your own and your friends' posts
- Friends: search, send/accept/decline/cancel requests, remove friends
- Like and unlike posts
- Comments with emoji support; edit and delete your own comments; post authors can delete any comment on their posts
- Real-time one-to-one messaging between friends
- Animated 3D landing page

## Planned extensions

Stories, highlights and status updates · reposts, bookmarks and share links · video uploads, GIFs and multiple reactions · notifications

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, Redux Toolkit (RTK Query), Tailwind CSS, Three.js |
| Backend | Node.js, Express, TypeScript, MongoDB (Mongoose), Socket.io |
| Media | Cloudinary |
| Testing | Postman / Newman |
| Deployment | Vercel (client), Render (server), MongoDB Atlas |

## Development approach

Solo project. Each feature is built end to end — data model, API endpoint, Postman tests, then the user interface — and deployed continuously from the first day.

Developed with AI-assisted coding (Claude Code); all code is reviewed, tested and understood by the author.

## Author

John Achadu — Software Developer
GitHub: [graymatterthechampion-tech](https://github.com/graymatterthechampion-tech)