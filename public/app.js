const ROOM_ID = "general";

function createChatClient({ socket, nameInputId, titleId, applyId, formId, inputId, messagesId, errorId }) {
  const nameInput = document.getElementById(nameInputId);
  const title = document.getElementById(titleId);
  const applyBtn = document.getElementById(applyId);
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  const messages = document.getElementById(messagesId);
  const errorEl = document.getElementById(errorId);

  let userName = nameInput.value.trim();
  let currentRoom = ROOM_ID;

  function showError(text) {
    errorEl.textContent = text;
    errorEl.classList.remove("hidden");
    setTimeout(() => errorEl.classList.add("hidden"), 3500);
  }

  function join() {
    const nextName = nameInput.value.trim();
    if (!nextName) {
      showError("Please enter a name.");
      return;
    }

    userName = nextName;
    title.textContent = userName;
    input.placeholder = `Message as ${userName}...`;
    socket.emit("user:join", { name: userName, roomId: currentRoom });
  }

  function clearMessages() {
    messages.innerHTML = "";
  }

  function addMessage(message) {
    const item = document.createElement("article");
    const isMine = message.sender === userName;
    item.className = `message${isMine ? " mine" : ""}`;

    const meta = document.createElement("div");
    meta.className = "meta";

    const sender = document.createElement("strong");
    sender.textContent = isMine ? "You" : message.sender;

    const time = document.createElement("span");
    time.textContent = message.createdAt
      ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "now";

    meta.append(sender, time);

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = message.text;

    item.append(meta, bubble);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  socket.on("connect", join);

  socket.on("room:history", ({ room, messages: history }) => {
    currentRoom = room?.roomId || ROOM_ID;
    clearMessages();

    if (!history.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No messages yet. Start the conversation.";
      messages.appendChild(empty);
      return;
    }

    history.forEach(addMessage);
  });

  socket.on("message:new", (message) => {
    const empty = messages.querySelector(".empty");
    if (empty) empty.remove();
    addMessage(message);
  });

  socket.on("app:error", showError);

  applyBtn.addEventListener("click", join);

  nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      join();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    socket.emit("message:send", text);
    input.value = "";
    input.focus();
  });
}

createChatClient({
  socket: io(),
  nameInputId: "nameA",
  titleId: "titleA",
  applyId: "applyA",
  formId: "formA",
  inputId: "inputA",
  messagesId: "messagesA",
  errorId: "errorA"
});

createChatClient({
  socket: io(),
  nameInputId: "nameB",
  titleId: "titleB",
  applyId: "applyB",
  formId: "formB",
  inputId: "inputB",
  messagesId: "messagesB",
  errorId: "errorB"
});
