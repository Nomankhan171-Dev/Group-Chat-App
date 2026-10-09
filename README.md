# CircleChat — Node.js + MongoDB

Real-time group chat built with:

- Node.js
- Express
- Socket.IO
- MongoDB
- Mongoose
- HTML / CSS / JavaScript

## Features

- Real-time group chat
- Multiple chat rooms
- Create rooms
- MongoDB message history
- MongoDB room storage
- Name-based entry
- Timestamps
- Responsive dark UI

## 1. Install

```bash
npm install
```

## 2. Create `.env`

Copy `.env.example` to `.env`.

Example:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/circlechat
PORT=3000
```

## 3. MongoDB Atlas

Create a free MongoDB Atlas database.

Then:
1. Create database user
2. Add your IP in Network Access
3. Copy the connection string
4. Paste it into `MONGODB_URI`

## 4. Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Deploy

This app needs a Node.js server, so deploy it on a Node-friendly platform such as Render, Railway, or another service that can run Express + Socket.IO.

Vercel static hosting alone is not ideal for a persistent Socket.IO server.
