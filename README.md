# Group Chat - Two User Test

A simple Node.js + MongoDB + Socket.IO chat demo built for testing two users on the same screen.

## Flow
1. Each user window first asks for Username and Room ID.
2. Press Join Room.
3. That window switches to the chat screen.
4. Use the same Room ID in both windows to chat with each other in real time.
5. Leave returns that window to the join form.

## Environment variable
Create `MONGODB_URI` in your hosting environment. Do not commit your real password or `.env` file to GitHub.

## Run locally
```bash
npm install
npm start
```
