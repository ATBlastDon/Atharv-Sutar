// --------------------- Config ---------------------
const API_BASE = "https://bot-45f5.onrender.com"; // <-- replace if your URL differs
const apiUrl = `${API_BASE}/chat`;
const SESSION_KEY = 'atb_session';

// --------------------- DOM Elements ---------------------
const messagesDiv = document.getElementById('messages');
const input = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const questionBtns = document.querySelectorAll('.question-btn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const clearChatBtn = document.getElementById('clearChat');
const exportChatBtn = document.getElementById('exportChat');
const notification = document.getElementById('notification');
const connectionStatus = document.getElementById('connectionStatus');

// --------------------- State ---------------------
let sessionId = localStorage.getItem(SESSION_KEY) || null;
let isOnline = true;
let waitingForResponse = false;

// --------------------- Helper Functions ---------------------
function showNotification(message, isError = false) {
    if (!notification) return;
    notification.textContent = message;
    notification.className = isError ? 'notification error show' : 'notification show';
    setTimeout(() => notification.classList.remove('show'), 3000);
}

function updateConnectionStatus(online) {
    isOnline = online;
    if (!connectionStatus) return;
    connectionStatus.innerHTML = online
        ? '<i class="fas fa-circle" style="color: #4CAF50;"></i> Connected'
        : '<i class="fas fa-circle" style="color: #f44336;"></i> Offline';
}

function parseMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function removeLatestSuggestions() {
    const prev = document.querySelector('.latest-suggestions');
    if (prev) prev.remove();
}

function showTyping() {
    hideTyping();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';

    const bubble = document.createElement('div');
    bubble.className = 'typing-indicator';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        bubble.appendChild(dot);
    }

    const text = document.createElement('span');
    text.className = 'typing-text';
    text.textContent = 'ATB is typing...';
    bubble.appendChild(text);

    typingDiv.appendChild(bubble);
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

function naturalizeTime(date = new Date()) {
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2,'0')}`;
}

function generateSuggestions(userInput, botReply) {
    const u = (userInput || "").toLowerCase();
    const b = (botReply || "").toLowerCase();

    if (b.includes("education") || u.includes("education") || u.includes("degree")) {
        return [
            { text: "What are his skills?", icon: "fas fa-code" },
            { text: "Show me his projects", icon: "fas fa-laptop-code" },
            { text: "How can I contact him?", icon: "fas fa-envelope" }
        ];
    }

    if (b.includes("project") || b.includes("studysync") || u.includes("project") || u.includes("studysync")) {
        return [
            { text: "Tell me about StudySync Apps", icon: "fas fa-mobile-alt" },
            { text: "Tell me about Library Management", icon: "fas fa-book" },
            { text: "Show Portfolio Website", icon: "fas fa-globe" },
            { text: "How can I contact him?", icon: "fas fa-envelope" }
        ];
    }

    if (b.includes("contact") || u.includes("contact") || u.includes("email")) {
        return [
            { text: "Give me his email", icon: "fas fa-at" },
            { text: "Show LinkedIn", icon: "fas fa-linkedin" },
        ];
    }

    // Default suggestions
    return [
        { text: "Brief introduction", icon: "fas fa-user" },
        { text: "Detailed information", icon: "fas fa-info-circle" },
        { text: "Show projects", icon: "fas fa-code-branch" },
        { text: "Contact details", icon: "fas fa-envelope" }
    ];
}

// --------------------- Append Message ---------------------
function appendMessage(who, text, userInputForSuggestions = "") {
    removeLatestSuggestions();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${who}-message`;

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    if (who === 'bot') {
        bubbleDiv.innerHTML = parseMarkdown(text || "");
    } else {
        bubbleDiv.textContent = text || "";
    }

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = naturalizeTime();
    bubbleDiv.appendChild(timeDiv);

    messageDiv.appendChild(bubbleDiv);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Generate suggestions if bot
    if (who === 'bot') {
        const suggestions = generateSuggestions(userInputForSuggestions, text);
        if (suggestions.length) {
            const sugContainer = document.createElement('div');
            sugContainer.className = 'suggestions latest-suggestions';
            suggestions.slice(0, 4).forEach(s => {
                const btn = document.createElement('button');
                btn.className = 'suggestion-btn';
                btn.innerHTML = `<i class="${s.icon}"></i> ${s.text}`;
                btn.addEventListener('click', () => {
                    input.value = s.text;
                    handleSend(true);
                });
                sugContainer.appendChild(btn);
            });
            messagesDiv.appendChild(sugContainer);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }
}

// --------------------- Local Fallback ---------------------
function generateResponseLocal(inp) {
    const s = (inp || "").toLowerCase();
    if (!s) return "Hi — ask me about Atharv's education, projects, skills, or contact details.";
    if (s.includes('hi') || s.includes('hello') || s.includes('hey')) return "Hello! I'm ATB — I can give a brief intro, detailed info, or show projects. Which would you like?";
    if (s.includes('education') || s.includes('degree') || s.includes('study')) return "Atharv has a B.E. in Computer Science (AI & ML) and Honors in Data Science. Want full details?";
    if (s.includes('skill') || s.includes('technology') || s.includes('tech')) return "Skills: Python, Flutter, AI/ML, SQL, Firebase, Git, Leadership, Teamwork, Adaptability. Want projects that use these?";
    if (s.includes('project') || s.includes('studysync') || s.includes('library')) return "Projects: StudySync Apps (Flutter), Library Management (Python), Portfolio Website (HTML/CSS). Ask 'Tell me about StudySync' for details.";
    if (s.includes('contact') || s.includes('email') || s.includes('linkedin')) return "Contact: atharvsutar3102003@gmail.com — LinkedIn: www.linkedin.com/in/atharv-sutar — GitHub: https://github.com/ATBlastDon";

    const defaults = [
        "I can give a brief introduction, detailed information, list projects, or share contact details. What would you like?",
        "Ask about education, projects, skills or contact."
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}

// --------------------- Backend API ---------------------
async function sendToBackend(text) {
    if (!text) return;

    showTyping();
    updateConnectionStatus(true);
    waitingForResponse = true;
    sendBtn.disabled = true;
    input.disabled = true;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, message: text }),
            signal: controller.signal,
            mode: 'cors'
        });

        clearTimeout(timeout);

        if (!resp.ok) {
            const txt = await resp.text().catch(()=>`Status ${resp.status}`);
            throw new Error(txt || ('HTTP ' + resp.status));
        }

        const j = await resp.json();
        hideTyping();

        if (j.session_id) {
            sessionId = j.session_id;
            localStorage.setItem(SESSION_KEY, sessionId);
        }

        const reply = (typeof j.reply === 'string' && j.reply.length) ? j.reply : generateResponseLocal(text);
        appendMessage('bot', reply, text);

        updateConnectionStatus(true);
    } catch (err) {
        hideTyping();
        console.error('Backend error', err);
        updateConnectionStatus(false);

        const fallback = generateResponseLocal(text);
        appendMessage('bot', fallback + " (local fallback — backend unreachable)", text);
        showNotification("Connection issue", true);
    } finally {
        waitingForResponse = false;
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
    }
}

// --------------------- Send Handler ---------------------
async function handleSend(autoSend = false) {
    if (waitingForResponse) return; // prevent double send
    const txt = input.value.trim();
    if (!txt) return;

    appendMessage('user', txt);
    input.value = '';
    input.focus();

    // Send to backend (will fallback to local if unreachable)
    await sendToBackend(txt);
}

// --------------------- Event Listeners ---------------------
sendBtn.addEventListener('click', () => handleSend());
input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

questionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        input.value = btn.textContent;
        handleSend();
    });
});

menuToggle?.addEventListener('click', () => sidebar.classList.toggle('active'));

clearChatBtn?.addEventListener('click', () => {
    messagesDiv.innerHTML = '';
    showNotification("Chat cleared.");
});

exportChatBtn?.addEventListener('click', () => {
    const chatText = Array.from(messagesDiv.querySelectorAll('.message-bubble'))
        .map(b => b.textContent).join('\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'chat.txt';
    a.click();
    showNotification("Chat exported.");
});

window.addEventListener('online', () => updateConnectionStatus(true));
window.addEventListener('offline', () => updateConnectionStatus(false));

// --------------------- Initial Message ---------------------
document.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatus(true);
    appendMessage('bot', "Hello! I'm ATB — your interactive assistant. Ask me about Atharv's education, projects, skills, or contact details.");
});

// ------- Check Connection UI behavior (add to bottom of script.js) -------
(function () {
  const CHECK_BTN = document.getElementById('checkHealthBtn');
  if (!CHECK_BTN) return;

  // backend base: prefer window.ATB_backend if set by page, else fallback
  const BACKEND = (window.ATB_backend && window.ATB_backend.replace(/\/$/, '')) || "https://bot-45f5.onrender.com";
  const HEALTH = BACKEND + "/health";

  // create popover element (hidden until used)
  let pop = null;
  function createPopover() {
    pop = document.createElement('div');
    pop.className = 'health-popover';
    pop.innerHTML = `
      <div class="title">Server Health</div>
      <div class="status"><div class="dot" style="background:#f59e0b"></div><div class="state">Checking…</div></div>
      <div class="meta">Click to refresh. Polls every time you click.</div>
    `;
    document.body.appendChild(pop);
  }

  function positionPopover() {
    if (!pop) return;
    const rect = CHECK_BTN.getBoundingClientRect();
    // position to the top-right of button, with small offset
    const left = Math.min(window.innerWidth - pop.offsetWidth - 12, rect.right - pop.offsetWidth + 8);
    const top = rect.bottom + 10; // below the button
    pop.style.left = `${Math.max(8, left)}px`;
    pop.style.top = `${top}px`;
  }

  async function doCheck(showPopup = true) {
    if (showPopup && !pop) createPopover();
    if (showPopup) {
      pop.querySelector('.dot').style.background = '#f59e0b';
      pop.querySelector('.state').textContent = 'Checking…';
      positionPopover();
    }

    // show spinner inside button while fetching
    let spinner = CHECK_BTN.querySelector('.spinner');
    if (!spinner) {
      spinner = document.createElement('span');
      spinner.className = 'spinner';
      CHECK_BTN.prepend(spinner);
    }

    try {
      const r = await fetch(HEALTH, { method: 'GET', cache: 'no-store', mode: 'cors' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();

      // update button look and popover
      CHECK_BTN.classList.remove('offline'); CHECK_BTN.classList.add('online');
      CHECK_BTN.title = 'Connected';

      if (pop) {
        pop.querySelector('.dot').style.background = '#10b981';
        pop.querySelector('.state').textContent = `${j.status || 'healthy'} · data_loaded: ${j.data_loaded ? 'yes' : 'no'}`;
        const meta = pop.querySelector('.meta');
        if (meta) meta.textContent = `Active sessions: ${j.active_sessions} · ${new Date(j.timestamp).toLocaleString()}`;
      }

    } catch (err) {
      CHECK_BTN.classList.remove('online'); CHECK_BTN.classList.add('offline');
      CHECK_BTN.title = 'Offline or unreachable';
      if (pop) {
        pop.querySelector('.dot').style.background = '#ef4444';
        pop.querySelector('.state').textContent = (err && err.message) ? err.message : 'unreachable';
        pop.querySelector('.meta').textContent = 'Check your network or backend CORS/settings.';
      }
      console.error('Health check error:', err);
    } finally {
      // remove spinner after a short delay so user sees status
      setTimeout(() => {
        const s = CHECK_BTN.querySelector('.spinner');
        if (s) s.remove();
      }, 400);
    }
  }

  // show/hide popover on button click and perform check
  let visible = false;
  CHECK_BTN.addEventListener('click', async (e) => {
    e.stopPropagation();
    visible = !visible;
    if (visible) {
      if (!pop) createPopover();
      positionPopover();
      pop.style.display = 'block';
      await doCheck(true);
    } else if (pop) {
      pop.style.display = 'none';
    }
  });

  // reposition popover on resize/scroll
  window.addEventListener('resize', () => positionPopover());
  window.addEventListener('scroll', () => positionPopover(), true);

  // close popover when clicking outside
  document.addEventListener('click', (ev) => {
    if (!pop) return;
    if (!pop.contains(ev.target) && ev.target !== CHECK_BTN) {
      pop.style.display = 'none';
      visible = false;
    }
  });
})();

const backButton = document.getElementById('backButton');

if (backButton) {
    backButton.addEventListener('click', () => {
        // Go back to portfolio main page
        window.location.href = "../index.html"; // Adjust path if needed
    });
}

