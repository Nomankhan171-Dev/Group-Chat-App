# CircleChat — Two User Test View

A Node.js + Express + Socket.IO + MongoDB chat app designed for easy testing with two users on one screen.

## What changed
- No room/group selector on the frontend.
- Two independent chat windows are visible side by side.
- User 1 and User 2 each use their own Socket.IO connection.
- Both users are automatically connected to the same `general` room.
- Names can be changed from either panel with the Update button.
- Messages are stored in MongoDB exactly like the original app.

## Environment variable
Create `MONGODB_URI` in your hosting environment or `.env` file.

Example format:
`mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/circlechat?appName=Cluster0`

Do not commit your real password to GitHub.
