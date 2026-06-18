// KindoAI — localStorage quota tracker.
// Counts daily usage per engine and renders progress bars.
(function () {
  const STORAGE_KEY = "kindo_quota_v1";

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function readAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed.__day !== today()) return { __day: today() };
      return parsed;
    } catch {
      return { __day: today() };
    }
  }

  function writeAll(data) {
    data.__day = today();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getCount(engineId) {
    const all = readAll();
    return all[engineId] || 0;
  }

  function increment(engineId) {
    const all = readAll();
    all[engineId] = (all[engineId] || 0) + 1;
    writeAll(all);
    render();
    return all[engineId];
  }

  function reset(engineId) {
    const all = readAll();
    if (engineId) delete all[engineId];
    else Object.keys(all).forEach((k) => k !== "__day" && delete all[k]);
    writeAll(all);
    render();
  }

  function render() {
    const container = document.getElementById("quota-grid");
    if (!container || !window.AI_ENGINES) return;
    const html = Object.entries(window.AI_ENGINES)
      .map(([id, eng]) => {
        const used = getCount(id);
        const cap = eng.dailyCap || 100;
        const pct = Math.min(100, Math.round((used / cap) * 100));
        const barColor =
          pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-400" : "bg-emerald-400";
        return `
          <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-semibold text-white">${eng.name}</div>
                <div class="text-[11px] text-white/50">${eng.model}</div>
              </div>
              <span class="text-[11px] text-white/60">${used} / ${cap}</span>
            </div>
            <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div class="h-full ${barColor} transition-all" style="width:${pct}%"></div>
            </div>
            <div class="mt-2 flex items-center justify-between text-[11px] text-white/40">
              <span>${eng.limit}</span>
              <span>${eng.attachment}</span>
            </div>
          </div>`;
      })
      .join("");
    container.innerHTML = html;
  }

  window.QuotaTracker = { getCount, increment, reset, render };
  document.addEventListener("DOMContentLoaded", render);
})();
