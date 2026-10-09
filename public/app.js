function createUserWindow(config) {
  const socket = io();

  const joinForm = document.getElementById(config.joinFormId);
  const chatCard = document.getElementById(config.chatCardId);
  const nameInput = document.getElementById(config.nameId);
  const roomInput = document.getElementById(config.roomId);
  const roomLabel = document.getElementById(config.roomLabelId);
  const joinError = document.getElementById(config.joinErrorId);
  const chatError = document.getElementById(config.chatErrorId);
  const messages = document.getElementById(config.messagesId);
  const messageForm = document.getElementById(config.messageFormId);
  const messageInput = document.getElementById(config.messageId);
  const leaveBtn = document.getElementById(config.leaveId);

  let username = "";
  let activeRoom = "";
  let isJoined = false;

  function showError(element, text) {
    element.textContent = text;
    element.classList.remove("hidden");
    clearTimeout(element._timer);
    element._timer = setTimeout(() => element.classList.add("hidden"), 3500);
  }

  function showJoinScreen() {
    isJoined = false;
    activeRoom = "";
    chatCard.classList.add("hidden");
    joinForm.classList.remove("hidden");
    messages.innerHTML = "";
    roomLabel.textContent = "-";
    roomInput.focus();
  }

  function showChatScreen(roomId) {
    activeRoom = roomId;
    isJoined = true;
    roomLabel.textContent = roomId;
    joinForm.classList.add("hidden");
    chatCard.classList.remove("hidden");
    messageInput.focus();
  }

  function renderEmpty() {
    messages.innerHTML = '<div class="empty-state">No messages yet. Start the conversation.</div>';
  }

  function clearEmpty() {
    const empty = messages.querySelector(".empty-state");
    if (empty) empty.remove();
  }

  function addMessage(message) {
    clearEmpty();

    const row = document.createElement("div");
    const mine = message.sender === username;
    row.className = `message-row${mine ? " mine" : ""}`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    const sender = document.createElement("strong");
    sender.textContent = message.sender;

    bubble.appendChild(sender);
    bubble.appendChild(document.createTextNode(`: ${message.text}`));
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const room = roomInput.value.trim();

    if (!name) {
      showError(joinError, "Please enter username.");
      return;
    }
    if (!room) {
      showError(joinError, "Please enter Room ID.");
      return;
    }

    username = name;
    activeRoom = room;

    // Open the chat screen immediately so the Join button always responds.
    // The server will then return history for this room.
    showChatScreen(activeRoom);
    messages.innerHTML = '<div class="empty-state">Connecting to room...</div>';

    socket.emit("user:join", { name: username, roomId: activeRoom });
  });

  socket.on("room:history", ({ room, messages: history }) => {
    if (!room) return;
    showChatScreen(room.roomId);
    messages.innerHTML = "";

    if (!history || history.length === 0) {
      renderEmpty();
      return;
    }

    history.forEach(addMessage);
  });

  socket.on("message:new", (message) => {
    if (!isJoined || message.roomId !== activeRoom) return;
    addMessage(message);
  });

  socket.on("app:error", (text) => {
    showError(isJoined ? chatError : joinError, text || "Something went wrong.");
  });

  socket.on("connect_error", () => {
    showError(isJoined ? chatError : joinError, "Server connection failed. Please refresh and try again.");
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !isJoined) return;

    socket.emit("message:send", text);
    messageInput.value = "";
    messageInput.focus();
  });

  leaveBtn.addEventListener("click", () => {
    socket.emit("user:leave");
    showJoinScreen();
  });

  socket.on("connect", () => {
    if (isJoined && username && activeRoom) {
      socket.emit("user:join", { name: username, roomId: activeRoom });
    }
  });
}

createUserWindow({
  joinFormId: "joinFormA",
  chatCardId: "chatCardA",
  nameId: "nameA",
  roomId: "roomA",
  roomLabelId: "roomLabelA",
  joinErrorId: "joinErrorA",
  chatErrorId: "chatErrorA",
  messagesId: "messagesA",
  messageFormId: "messageFormA",
  messageId: "messageA",
  leaveId: "leaveA"
});

createUserWindow({
  joinFormId: "joinFormB",
  chatCardId: "chatCardB",
  nameId: "nameB",
  roomId: "roomB",
  roomLabelId: "roomLabelB",
  joinErrorId: "joinErrorB",
  chatErrorId: "chatErrorB",
  messagesId: "messagesB",
  messageFormId: "messageFormB",
  messageId: "messageB",
  leaveId: "leaveB"
});
