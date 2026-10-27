const app = document.querySelector(".app");
const chatList = document.getElementById("chatList");
const messagesBox = document.getElementById("messages");

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const searchInput = document.getElementById("searchInput");

const headerName = document.getElementById("headerName");
const headerAvatar = document.getElementById("headerAvatar");
const headerStatus = document.getElementById("headerStatus");

const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");

const themeBtn = document.getElementById("themeBtn");
const backBtn = document.getElementById("backBtn");
const clearChatBtn = document.getElementById("clearChatBtn");

const contacts = [
  {
    id: 1,
    name: "John Doe",
    initials: "JD",
    online: true,
    color: "#16834a",
    greeting: "Hey! How are you doing today?"
  },
  {
    id: 2,
    name: "Sarah Williams",
    initials: "SW",
    online: true,
    color: "#9b59b6",
    greeting: "Hello! Hope you're having a great day."
  },
  {
    id: 3,
    name: "Michael Brown",
    initials: "MB",
    online: false,
    color: "#e67e22",
    greeting: "Let's catch up sometime!"
  },
  {
    id: 4,
    name: "Emily Johnson",
    initials: "EJ",
    online: true,
    color: "#3498db",
    greeting: "Good morning! 😊"
  },
  {
    id: 5,
    name: "David Wilson",
    initials: "DW",
    online: false,
    color: "#e74c3c",
    greeting: "Have you finished the project?"
  }
];

const replies = [
  "That's really interesting! 😊",
  "I totally agree with you.",
  "Sounds good to me! 👍",
  "Tell me more about that.",
  "Haha, that's funny! 😂",
  "Thank you for sharing.",
  "I'll get back to you soon.",
  "That's amazing! 🎉",
  "How has your day been?",
  "I understand what you mean."
];

function loadJSON(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return saved && typeof saved === "object"
      ? saved
      : fallback;
  } catch {
    return fallback;
  }
}

let chats = loadJSON("chatflowMessages", {});
let unread = loadJSON("chatflowUnread", {});

let activeContact = 1;
let replyTimers = {};

contacts.forEach(contact => {
  if (!Array.isArray(chats[contact.id])) {
    chats[contact.id] = [
      {
        text: contact.greeting,
        sender: "received",
        time: new Date().toISOString()
      }
    ];
  }

  if (typeof unread[contact.id] !== "number") {
    unread[contact.id] = 0;
  }
});

function saveChats() {
  try {
    localStorage.setItem(
      "chatflowMessages",
      JSON.stringify(chats)
    );

    localStorage.setItem(
      "chatflowUnread",
      JSON.stringify(unread)
    );
  } catch (error) {
    console.warn("Unable to save chats:", error);
  }
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getLastMessage(id) {
  const conversation = chats[id] || [];
  return conversation[conversation.length - 1];
}

function renderContacts() {
  chatList.replaceChildren();

  const keyword = searchInput.value.toLowerCase();

  const filtered = contacts.filter(contact =>
    contact.name.toLowerCase().includes(keyword)
  );

  document.getElementById("chatCount").textContent =
    filtered.length;

  filtered.forEach(contact => {
    const lastMessage = getLastMessage(contact.id);

    const item = document.createElement("div");
    item.className = "chat-item";

    if (activeContact === contact.id) {
      item.classList.add("active");
    }

    item.tabIndex = 0;
    item.setAttribute("role", "button");

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.style.background = contact.color;
    avatar.textContent = contact.initials;

    const info = document.createElement("div");
    info.className = "chat-info";

    const name = document.createElement("h4");
    name.textContent = contact.name;

    const preview = document.createElement("p");
    preview.textContent = lastMessage
      ? lastMessage.text
      : "No messages yet";

    info.append(name, preview);

    const meta = document.createElement("div");
    meta.className = "chat-meta";

    const time = document.createElement("small");
    time.textContent = lastMessage
      ? formatTime(lastMessage.time)
      : "";

    meta.appendChild(time);

    if (unread[contact.id] > 0) {
      const badge = document.createElement("span");
      badge.className = "unread";
      badge.textContent = unread[contact.id];
      meta.appendChild(document.createElement("br"));
      meta.appendChild(badge);
    }

    item.append(avatar, info, meta);

    item.addEventListener("click", () => {
      openChat(contact.id);
    });

    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openChat(contact.id);
      }
    });

    chatList.appendChild(item);
  });
}

function openChat(id) {
  activeContact = id;

  const contact = contacts.find(item => item.id === id);

  headerName.textContent = contact.name;
  headerAvatar.textContent = contact.initials;
  headerAvatar.style.background = contact.color;

  headerStatus.textContent = contact.online
    ? "● Online"
    : "● Offline";

  headerStatus.style.color = contact.online
    ? "#16834a"
    : "#888888";

  unread[id] = 0;

  app.classList.add("mobile-chat-open");

  saveChats();
  renderContacts();
  renderMessages();

  emojiPicker.classList.add("hidden");
  messageInput.focus();
}

function renderMessages() {
  messagesBox.replaceChildren();

  const dateLabel = document.createElement("div");
  dateLabel.className = "date-label";
  dateLabel.textContent = "Conversation";
  messagesBox.appendChild(dateLabel);

  const conversation = chats[activeContact] || [];

  conversation.forEach(message => {
    const bubble = document.createElement("div");
    bubble.className = `message ${message.sender}`;

    const text = document.createElement("p");
    text.textContent = message.text;

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = formatTime(message.time);

    bubble.append(text, time);
    messagesBox.appendChild(bubble);
  });

  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function sendMessage(event) {
  event.preventDefault();

  const text = messageInput.value.trim();

  if (!text) return;

  const contactId = activeContact;

  chats[contactId].push({
    text: text,
    sender: "sent",
    time: new Date().toISOString()
  });

  messageInput.value = "";

  saveChats();
  renderMessages();
  renderContacts();

  emojiPicker.classList.add("hidden");

  simulateReply(contactId);
}

function simulateReply(contactId) {
  // Only one pending automatic reply per contact.
  if (replyTimers[contactId]) {
    clearTimeout(replyTimers[contactId]);
  }

  replyTimers[contactId] = setTimeout(() => {
    const randomReply = replies[
      Math.floor(Math.random() * replies.length)
    ];

    chats[contactId].push({
      text: randomReply,
      sender: "received",
      time: new Date().toISOString()
    });

    if (
      activeContact !== contactId ||
      !app.classList.contains("mobile-chat-open") &&
      window.innerWidth <= 700
    ) {
      unread[contactId]++;
    }

    saveChats();
    renderContacts();

    if (activeContact === contactId) {
      renderMessages();
    }

    delete replyTimers[contactId];
  }, 1200);
}

function clearChat() {
  const contact = contacts.find(
    item => item.id === activeContact
  );

  const confirmed = confirm(
    `Delete all messages with ${contact.name}?`
  );

  if (!confirmed) return;

  if (replyTimers[activeContact]) {
    clearTimeout(replyTimers[activeContact]);
    delete replyTimers[activeContact];
  }

  chats[activeContact] = [];
  unread[activeContact] = 0;

  saveChats();
  renderMessages();
  renderContacts();
}

function toggleTheme() {
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  themeBtn.textContent = dark ? "☀" : "☾";

  try {
    localStorage.setItem(
      "chatflowTheme",
      dark ? "dark" : "light"
    );
  } catch (error) {
    console.warn("Unable to save theme:", error);
  }
}

if (localStorage.getItem("chatflowTheme") === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀";
}

messageForm.addEventListener("submit", sendMessage);

searchInput.addEventListener("input", renderContacts);

themeBtn.addEventListener("click", toggleTheme);

clearChatBtn.addEventListener("click", clearChat);

backBtn.addEventListener("click", () => {
  app.classList.remove("mobile-chat-open");
  emojiPicker.classList.add("hidden");
  renderContacts();
});

emojiBtn.addEventListener("click", () => {
  emojiPicker.classList.toggle("hidden");
});

document.querySelectorAll(".emoji-picker button")
  .forEach(button => {
    button.addEventListener("click", () => {
      messageInput.value += button.textContent;
      messageInput.focus();
    });
  });

openChat(activeContact);

// Show contact list first on mobile.
app.classList.remove("mobile-chat-open");