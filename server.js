
require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const Room = require("./models/Room");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

app.use(express.static(path.join(__dirname, "public")));

function cleanText(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

async function seedRooms() {
  const defaults = [
    { roomId: "general", name: "General", emoji: "💬" },
    { roomId: "design", name: "Design", emoji: "🎨" },
    { roomId: "development", name: "Development", emoji: "💻" }
  ];

  for (const room of defaults) {
    await Room.updateOne(
      { roomId: room.roomId },
      { $setOnInsert: room },
      { upsert: true }
    );
  }
}

async function getRooms() {
  return Room.find().sort({ createdAt: 1 }).lean();
}

async function getRecentMessages(roomId) {
  return Message.find({ roomId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
    .then((items) => items.reverse());
}

io.on("connection", async (socket) => {
  try {
    socket.emit("rooms:list", await getRooms());
  } catch {
    socket.emit("app:error", "Could not load rooms.");
  }

  socket.on("user:join", async ({ name, roomId }) => {
    const username = cleanText(name, 40);
    if (!username) return;

    let room = await Room.findOne({ roomId }).lean();
    if (!room) room = await Room.findOne({ roomId: "general" }).lean();
    if (!room) return;

    if (socket.data.roomId) socket.leave(socket.data.roomId);

    socket.data.name = username;
    socket.data.roomId = room.roomId;
    socket.join(room.roomId);

    const history = await getRecentMessages(room.roomId);

    socket.emit("room:history", {
      room,
      messages: history
    });

    socket.to(room.roomId).emit("room:notice", {
      text: `${username} joined #${room.name}`,
      createdAt: Date.now()
    });
  });

  socket.on("room:switch", async (roomId) => {
    if (!socket.data.name) return;

    const room = await Room.findOne({ roomId }).lean();
    if (!room) return;

    if (socket.data.roomId) socket.leave(socket.data.roomId);

    socket.data.roomId = room.roomId;
    socket.join(room.roomId);

    socket.emit("room:history", {
      room,
      messages: await getRecentMessages(room.roomId)
    });
  });

  socket.on("room:create", async (name, callback) => {
    try {
      const roomName = cleanText(name, 35);
      if (!roomName) {
        callback?.({ ok: false, error: "Room name required." });
        return;
      }

      const roomId = roomName
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 35);

      if (!roomId) {
        callback?.({ ok: false, error: "Invalid room name." });
        return;
      }

      let room = await Room.findOne({ roomId }).lean();

      if (!room) {
        room = await Room.create({
          roomId,
          name: roomName,
          emoji: "💬"
        });
        room = room.toObject();
      }

      io.emit("rooms:list", await getRooms());
      callback?.({ ok: true, room });
    } catch {
      callback?.({ ok: false, error: "Could not create room." });
    }
  });

  socket.on("message:send", async (text) => {
    try {
      const messageText = cleanText(text, 1000);
      const { roomId, name: sender } = socket.data;

      if (!messageText || !roomId || !sender) return;

      const saved = await Message.create({
        roomId,
        sender,
        text: messageText
      });

      io.to(roomId).emit("message:new", saved.toObject());
    } catch {
      socket.emit("app:error", "Message could not be sent.");
    }
  });

  socket.on("disconnect", async () => {
    const { name, roomId } = socket.data;
    if (!name || !roomId) return;

    const room = await Room.findOne({ roomId }).lean();
    if (!room) return;

    socket.to(roomId).emit("room:notice", {
      text: `${name} left #${room.name}`,
      createdAt: Date.now()
    });
  });
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");

  await seedRooms();

  server.listen(PORT, () => {
    console.log(`CircleChat running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Startup error:", err.message);
  process.exit(1);
});
