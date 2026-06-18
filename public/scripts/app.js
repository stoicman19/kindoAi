// KindoAI — UI controller for view toggling, key management, chat hub,
// and the streaming Career Workspace.
(function () {
  // ---- View toggle ---------------------------------------------------------
  function activateView(view) {
    document.querySelectorAll("[data-view]").forEach((el) => {
      el.classList.toggle("hidden", el.dataset.view !== view);
    });
    document.querySelectorAll("[data-view-btn]").forEach((btn) => {
      const active = btn.dataset.viewBtn === view;
      btn.classList.toggle("bg-white", active);
      btn.classList.toggle("text-slate-900", active);
      btn.classList.toggle("text-white/70", !active);
    });
  }

  // ---- Engine select -------------------------------------------------------
  function populateEngineSelect() {
    const sel = document.getElementById("engine-select");
    if (!sel) return;
    sel.innerHTML = Object.entries(window.AI_ENGINES)
      .map(
        ([id, e]) =>
          `<option value="${id}">${e.name} — ${e.model}</option>`,
      )
      .join("");
  }

  // ---- API key manager -----------------------------------------------------
  function renderKeyManager() {
    const wrap = document.getElementById("key-list");
    if (!wrap) return;
    const stored = window.CareerEngine.getStoredKeys();
    wrap.innerHTML = Object.entries(window.AI_ENGINES)
      .map(([id, e]) => {
        const has = !!stored[e.keyName];
        return `
        <div class="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white">${e.name}</div>
            <div class="text-[11px] text-white/40 truncate">${e.keyHint}</div>
          </div>
          <input
            data-key-input="${e.keyName}"
            type="password"
            placeholder="${has ? "•••••••• saved" : e.keyName}"
            class="w-48 rounded-md border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <button
            data-save-key="${e.keyName}"
            class="rounded-md bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-emerald-400"
          >Save</button>
        </div>`;
      })
      .join("");

    wrap.querySelectorAll("[data-save-key]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.dataset.saveKey;
        const input = wrap.querySelector(`[data-key-input="${name}"]`);
        const val = input.value.trim();
        if (!val) return;
        window.CareerEngine.setStoredKey(name, val);
        input.value = "";
        renderKeyManager();
      });
    });
  }

  // ---- Tiny markdown renderer (safe-ish, no exec) -------------------------
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function renderMarkdown(md) {
    let html = escapeHtml(md);
    html = html.replace(/^### (.*)$/gm, '<h3 class="mt-4 text-base font-semibold text-white">$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2 class="mt-5 text-lg font-semibold text-white">$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1 class="mt-6 text-xl font-bold text-emerald-300">$1</h1>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-white/10 px-1 py-0.5 text-[12px]">$1</code>');
    html = html.replace(/^- (.*)$/gm, '<li class="ml-5 list-disc">$1</li>');
    html = html.replace(/\n{2,}/g, '</p><p class="mt-2">');
    return `<p>${html}</p>`;
  }

  // ---- Career workspace ----------------------------------------------------
  function setupCareer() {
    const runBtn = document.getElementById("run-tailor");
    const output = document.getElementById("career-output");
    const status = document.getElementById("career-status");
    const copyBtn = document.getElementById("copy-output");

    let raw = "";

    runBtn?.addEventListener("click", async () => {
      const resume = document.getElementById("resume-input").value;
      const job = document.getElementById("job-input").value;
      const engine = document.getElementById("engine-select").value;

      if (!resume.trim() || !job.trim()) {
        status.textContent = "Paste both your resume and the job details first.";
        status.className = "text-xs text-amber-300";
        return;
      }

      raw = "";
      output.innerHTML =
        '<div class="text-sm text-white/40">Streaming response…</div>';
      status.textContent = `Contacting ${window.AI_ENGINES[engine].name}…`;
      status.className = "text-xs text-white/60";
      runBtn.disabled = true;
      runBtn.classList.add("opacity-60", "cursor-not-allowed");

      await window.CareerEngine.processCareerTask(resume, job, engine, {
        onChunk: (chunk) => {
          raw += chunk;
          output.innerHTML = renderMarkdown(raw);
          output.scrollTop = output.scrollHeight;
        },
        onEngineSwitch: (id) => {
          status.textContent = `Quota hit — failing over to ${window.AI_ENGINES[id].name}…`;
          status.className = "text-xs text-amber-300";
        },
        onDone: (id) => {
          status.textContent = `Done — generated by ${window.AI_ENGINES[id].name}.`;
          status.className = "text-xs text-emerald-300";
          runBtn.disabled = false;
          runBtn.classList.remove("opacity-60", "cursor-not-allowed");
        },
        onError: (err) => {
          status.textContent = err.message;
          status.className = "text-xs text-red-300";
          runBtn.disabled = false;
          runBtn.classList.remove("opacity-60", "cursor-not-allowed");
        },
      });
    });

    copyBtn?.addEventListener("click", async () => {
      if (!raw) return;
      await navigator.clipboard.writeText(raw);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy to Clipboard"), 1500);
    });
  }

  // ---- Chat hub ------------------------------------------------------------
  function setupChat() {
    const sendBtn = document.getElementById("chat-send");
    const input = document.getElementById("chat-input");
    const log = document.getElementById("chat-log");
    const engineSel = document.getElementById("chat-engine");

    if (engineSel) {
      engineSel.innerHTML = Object.entries(window.AI_ENGINES)
        .map(([id, e]) => `<option value="${id}">${e.name}</option>`)
        .join("");
    }

    function appendBubble(role, text) {
      const div = document.createElement("div");
      div.className =
        role === "user"
          ? "ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-emerald-500/90 px-4 py-2 text-sm text-slate-900"
          : "mr-auto max-w-[80%] rounded-2xl rounded-bl-sm bg-white/[0.06] px-4 py-2 text-sm text-white";
      div.textContent = text;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
      return div;
    }

    sendBtn?.addEventListener("click", async () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      appendBubble("user", text);
      const bubble = appendBubble("assistant", "");
      const engineId = engineSel.value;
      let buf = "";
      await window.CareerEngine.processCareerTask(
        "(none — general chat)",
        text,
        engineId,
        {
          onChunk: (c) => {
            buf += c;
            bubble.textContent = buf;
            log.scrollTop = log.scrollHeight;
          },
          onDone: () => {},
          onError: (err) => {
            bubble.textContent = `Error: ${err.message}`;
            bubble.className =
              "mr-auto max-w-[80%] rounded-2xl rounded-bl-sm bg-red-500/20 px-4 py-2 text-sm text-red-200";
          },
        },
      );
    });

    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }

  // ---- Boot ----------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    populateEngineSelect();
    renderKeyManager();
    setupCareer();
    setupChat();

    document.querySelectorAll("[data-view-btn]").forEach((btn) =>
      btn.addEventListener("click", () => activateView(btn.dataset.viewBtn)),
    );
    activateView("career");

    const keyToggle = document.getElementById("toggle-keys");
    const keyPanel = document.getElementById("key-panel");
    keyToggle?.addEventListener("click", () => {
      keyPanel.classList.toggle("hidden");
    });
  });
})();
