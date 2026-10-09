
const socket = io();

const login = document.getElementById("login");
const app = document.getElementById("app");
const loginForm = document.getElementById("loginForm");
const nameInput = document.getElementById("nameInput");
const roomsEl = document.getElementById("rooms");
const messagesEl = document.getElementById("messages");
const roomTitle = document.getElementById("roomTitle");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const roomForm = document.getElementById("roomForm");
const roomInput = document.getElementById("roomInput");
const toggleRoom = document.getElementById("toggleRoom");
const errorEl = document.getElementById("error");
const noticeEl = document.getElementById("notice");
const profileName = document.getElementById("profileName");
const avatar = document.getElementById("avatar");
const logoutBtn = document.getElementById("logout");

let userName = localStorage.getItem("circlechat_name") || "";
let activeRoom = "general";
let rooms = [];

function initials(name) {
  return name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
}

function showError(text) {
  errorEl.textContent = text;
  errorEl.classList.remove("hidden");
  setTimeout(() => errorEl.classList.add("hidden"), 4500);
}

function showNotice(text) {
  noticeEl.textContent = text;
  noticeEl.classList.remove("hidden");
  setTimeout(() => noticeEl.classList.add("hidden"), 2200);
}

function enterChat() {
  login.classList.add("hidden");
  app.classList.remove("hidden");
  profileName.textContent = userName;
  avatar.textContent = initials(userName);
  socket.emit("user:join", { name: userName, roomId: activeRoom });
}

if (userName) enterChat();

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  userName = nameInput.value.trim();
  if (!userName) return;
  localStorage.setItem("circlechat_name", userName);
  enterChat();
});

socket.on("rooms:list", (list) => {
  rooms = list;
  renderRooms();
});

socket.on("room:history", ({ room, messages }) => {
  activeRoom = room.roomId;
  roomTitle.textContent = `#${room.name}`;
  messagesEl.innerHTML = "";
  if (!messages.length) {
    messagesEl.innerHTML = '<div class="empty"><h3>Start the conversation</h3><p>No messages yet.</p></div>';
  } else {
    messages.forEach(addMessage);
  }
  renderRooms();
});

socket.on("message:new", (message) => {
  const empty = messagesEl.querySelector(".empty");
  if (empty) empty.remove();
  addMessage(message);
});

socket.on("room:notice", ({ text }) => showNotice(text));
socket.on("app:error", showError);

function renderRooms() {
  roomsEl.innerHTML = "";
  rooms.forEach((room) => {
    const btn = document.createElement("button");
    btn.textContent = `${room.emoji || "💬"} #${room.name}`;
    if (room.roomId === activeRoom) btn.classList.add("active");
    btn.onclick = () => {
      activeRoom = room.roomId;
      socket.emit("room:switch", room.roomId);
    };
    roomsEl.appendChild(btn);
  });
}

function addMessage(message) {
  const item = document.createElement("article");
  item.className = "message" + (message.sender === userName ? " mine" : "");

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "now";

  item.innerHTML = `
    <div class="meta">
      <strong>${escapeHtml(message.sender === userName ? "You" : message.sender)}</strong>
      <span>${time}</span>
    </div>
    <div class="bubble">${escapeHtml(message.text)}</div>
  `;

  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit("message:send", text);
  messageInput.value = "";
});

toggleRoom.addEventListener("click", () => {
  roomForm.classList.toggle("hidden");
});

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = roomInput.value.trim();
  if (!name) return;

  socket.emit("room:create", name, (result) => {
    if (!result?.ok) {
      showError(result?.error || "Could not create room.");
      return;
    }

    roomInput.value = "";
    roomForm.classList.add("hidden");
    activeRoom = result.room.roomId;
    socket.emit("room:switch", result.room.roomId);
  });
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("circlechat_name");
  location.reload();
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
