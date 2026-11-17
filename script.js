// Bootstrap version.

const state = { tier: "all", location: "all", max_hours: null };
let DELETED_QUESTS = [];
let activeModalQuest = null;
let pendingDeleteId = null;

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const modal = (id) => bootstrap.Modal.getOrCreateInstance($(id));
const TIER_COLOR = { paid: "info", free: "success", premium: "danger" };

function showToast(msg, color = "success") {
  const t = $("xp-toast");
  t.className = `toast align-items-center text-bg-${color} border-0`;
  $("toast-body").textContent = msg;
  bootstrap.Toast.getOrCreateInstance(t, { delay: 3000 }).show();
}

function formatHighlightedTitle(title) {
  const w = title.split(" ");
  if (w.length <= 2) return `<strong>${esc(title)}</strong>`;
  return `<strong>${esc(w.slice(0, 2).join(" "))}</strong> ${esc(w.slice(2).join(" "))}`;
}

function filterQuests() {
  return QUESTS
    .filter((q) => state.tier === "all" || q.tier === state.tier)
    .filter((q) => state.location === "all" || q.location === state.location)
    .filter((q) => state.max_hours === null || q.time_hours <= state.max_hours)
    .sort((a, b) => b.xp - a.xp);
}

function moneyBadge(q, modalView = false) {
  if (q.tier === "premium") return `<span class="badge text-bg-danger">₱${q.cost || 0} entry fee</span>`;
  if (q.tier === "paid") return `<span class="badge text-bg-info">₱${q.payout || 0} ${modalView ? "payout" : "(gets paid)"}</span>`;
  return `<span class="badge text-bg-success">${modalView ? "Free task" : "Free (just for fun)"}</span>`;
}

function questCardHTML(q) {
  const c = TIER_COLOR[q.tier] || "primary";
  return `
  <div class="col">
    <article id="card-${q.id}" class="card quest-card h-100 border-top border-4 border-${c} shadow-sm position-relative" onclick="openQuestModal('${q.id}')">
      <button type="button" class="btn-close position-absolute top-0 end-0 m-2" aria-label="Delete quest" title="Delete quest"
        onclick="event.stopPropagation(); promptDelete('${q.id}')"></button>
      <div class="card-body d-flex flex-column gap-2">
        <div class="d-flex justify-content-between align-items-start gap-2 pe-4">
          <div>
            <p class="card-title xp-display mb-0">${formatHighlightedTitle(q.title)}</p>
            <small class="text-body-secondary">${esc(q.org)}</small>
          </div>
          <span class="badge text-bg-primary rounded-pill text-nowrap">+${q.xp} XP</span>
        </div>
        <p class="card-text small text-body-secondary flex-grow-1 mb-0">${esc(q.description)}</p>
      </div>
      <div class="card-footer bg-transparent d-flex flex-wrap gap-1">
        <span class="badge text-bg-secondary">${TIER_LABELS[q.tier] || q.tier}</span>
        <span class="badge text-bg-secondary">${esc(q.location.replace("-", " "))}</span>
        <span class="badge text-bg-secondary">${q.time_hours} hrs</span>
        ${moneyBadge(q)}
      </div>
    </article>
  </div>`;
}

function renderQuests() {
  const results = filterQuests();
  $("results-count").textContent = results.length;
  $("quest-grid").innerHTML = results.length
    ? results.map(questCardHTML).join("")
    : `<div class="col-12"><div class="alert alert-info text-center mb-0">No quests match your filters. Try widening the location or hours.</div></div>`;
}

function renderHeroStats() {
  $("stat-quest-count").textContent = QUESTS.length;
  $("stat-total-xp").textContent = QUESTS.reduce((s, q) => s + q.xp, 0);
  $("deleted-count").textContent = DELETED_QUESTS.length;
}

// ----- Quest detail modal -----
window.openQuestModal = function (id) {
  const q = [...QUESTS, ...DELETED_QUESTS].find((i) => i.id === id);
  if (!q) return;
  activeModalQuest = q;
  $("modal-title").textContent = q.title;
  $("modal-org").textContent = `Organizer: ${q.org}`;
  $("modal-desc").textContent = q.description;
  $("modal-meta").innerHTML = `
    <span class="badge text-bg-secondary">Tier: ${TIER_LABELS[q.tier] || q.tier}</span>
    <span class="badge text-bg-secondary">Location: ${esc(q.location.replace("-", " "))}</span>
    <span class="badge text-bg-secondary">Duration: ${q.time_hours} hrs</span>
    <span class="badge text-bg-primary">Award: +${q.xp} XP</span>
    ${moneyBadge(q, true)}`;
  modal("quest-modal").show();
};

$("accept-quest-btn").addEventListener("click", () => {
  modal("quest-modal").hide();
  showToast(`Accepted "${activeModalQuest.title}". Added to your active side quests.`);
});

// ----- Delete / restore -----
window.promptDelete = function (id) { pendingDeleteId = id; modal("delete-modal").show(); };

$("confirm-delete-btn").addEventListener("click", () => {
  const idx = QUESTS.findIndex((q) => q.id === pendingDeleteId);
  if (idx !== -1) DELETED_QUESTS.push(QUESTS.splice(idx, 1)[0]);
  pendingDeleteId = null;
  modal("delete-modal").hide();
  renderHeroStats(); renderQuests();
  showToast("Quest deleted. You can restore it from the recovery list.", "secondary");
});

$("open-restore-modal-btn").addEventListener("click", () => { renderRestoreList(); modal("restore-modal").show(); });

function renderRestoreList() {
  $("restore-list").innerHTML = DELETED_QUESTS.length
    ? DELETED_QUESTS.map((q) => `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div><strong>${esc(q.title)}</strong><div class="small text-body-secondary">${esc(q.org)} (+${q.xp} XP)</div></div>
        <button class="btn btn-warning btn-sm rounded-pill" onclick="restoreQuest('${q.id}')">Restore</button>
      </div>`).join("")
    : `<div class="alert alert-secondary mb-0 text-center">No deleted quests to restore.</div>`;
}

window.restoreQuest = function (id) {
  const idx = DELETED_QUESTS.findIndex((q) => q.id === id);
  if (idx !== -1) QUESTS.unshift(DELETED_QUESTS.splice(idx, 1)[0]);
  renderHeroStats(); renderQuests(); renderRestoreList();
  showToast("Quest restored to the board.");
  if (!DELETED_QUESTS.length) modal("restore-modal").hide();
};

// ----- Add quest form -----
$("q-tier").addEventListener("change", (e) => {
  const money = $("q-money");
  const isFree = e.target.value === "free";
  money.disabled = isFree;
  if (isFree) money.value = "0";
});

function resetFilters() {
  state.tier = "all"; state.location = "all"; state.max_hours = null;
  $("tier-group").querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.value === "all"));
  $("location-select").value = "all";
  $("hours-range").value = 16;
  $("hours-value").textContent = "Any";
}

$("dynamic-quest-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  // Bootstrap form validation
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    showToast("Please fill in every field. Hours: 1-16, XP: 10-1000.", "danger");
    return;
  }
  const tier = $("q-tier").value;
  const money = Number($("q-money").value) || 0;
  const q = {
    id: "custom-" + Date.now(), tier,
    title: $("q-title").value.trim(), org: $("q-org").value.trim(), description: $("q-desc").value.trim(),
    time_hours: Number($("q-hours").value) || 1, location: $("q-location").value, xp: Number($("q-xp").value) || 100,
  };
  if (tier === "premium") q.cost = money; else q.payout = tier === "paid" ? money : 0;
  QUESTS.unshift(q);
  form.reset();
  form.classList.remove("was-validated");
  $("q-money").disabled = false;
  resetFilters();           
  renderHeroStats(); renderQuests();
  showToast("Quest deployed to the board.");
  // The board is sorted by XP
  const card = $("card-" + q.id);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.style.outline = "3px solid var(--bs-warning)";
    card.style.outlineOffset = "2px";
    setTimeout(() => { card.style.outline = ""; }, 3000);
  }
});

// ----- Filters -----
$("tier-group").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-value]");
  if (!btn) return;
  $("tier-group").querySelectorAll("button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  state.tier = btn.dataset.value;
  renderQuests();
});
$("location-select").addEventListener("change", (e) => { state.location = e.target.value; renderQuests(); });
$("hours-range").addEventListener("input", (e) => {
  const v = Number(e.target.value);
  state.max_hours = v >= 16 ? null : v;
  $("hours-value").textContent = v >= 16 ? "Any" : `${v} hrs or less`;
  renderQuests();
});

// ----- Themes: light, dark, pink (Bootstrap data-bs-theme + Dropdown) -----
const THEMES = { light: "☀️", dark: "🌙", pink: "🌸" };
function applyTheme(theme) {
  if (!THEMES[theme]) theme = "light";
  document.documentElement.setAttribute("data-bs-theme", theme);
  $("theme-icon").textContent = THEMES[theme];
  document.querySelectorAll("#theme-menu .dropdown-item").forEach((b) => {
    const on = b.dataset.theme === theme;
    b.classList.toggle("active", on);
    b.setAttribute("aria-current", on ? "true" : "false");
  });
  localStorage.setItem("xp-theme", theme);
}
$("theme-menu").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-theme]");
  if (btn) applyTheme(btn.dataset.theme);
});

// ----- Profile -----
const DEFAULT_PROFILE = { name: "Ajax", cls: "Second-year Student", avatar: "🎒" };
let currentProfile = JSON.parse(localStorage.getItem("xp-profile") || "null") || { ...DEFAULT_PROFILE };
let pendingAvatar = currentProfile.avatar;
const formWrap = $("profile-form-wrap");

function markAvatar(a) {
  $("avatar-options").querySelectorAll("button").forEach((b) => {
    const on = b.dataset.avatar === a;
    b.classList.toggle("active", on);
    b.classList.toggle("btn-outline-secondary", !on);
    b.classList.toggle("btn-primary", on);
  });
}
function renderProfile() {
  $("display-name").textContent = currentProfile.name || DEFAULT_PROFILE.name;
  $("display-class").textContent = `Class: ${currentProfile.cls || DEFAULT_PROFILE.cls}`;
  $("avatar-btn").textContent = currentProfile.avatar || DEFAULT_PROFILE.avatar;
}
// Fill the form each time the Collapse opens
formWrap.addEventListener("show.bs.collapse", () => {
  $("input-name").value = currentProfile.name || "";
  $("input-class").value = currentProfile.cls || "";
  pendingAvatar = currentProfile.avatar;
  markAvatar(pendingAvatar);
});
$("avatar-options").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-avatar]");
  if (!btn) return;
  pendingAvatar = btn.dataset.avatar;
  markAvatar(pendingAvatar);
});
$("profile-form").addEventListener("submit", (e) => {
  e.preventDefault();
  currentProfile = {
    name: $("input-name").value.trim() || DEFAULT_PROFILE.name,
    cls: $("input-class").value.trim() || DEFAULT_PROFILE.cls,
    avatar: pendingAvatar,
  };
  localStorage.setItem("xp-profile", JSON.stringify(currentProfile));
  renderProfile();
  bootstrap.Collapse.getOrCreateInstance(formWrap).hide();
  showToast("Profile saved.");
});

// ----- Init -----
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("xp-theme");
  applyTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  renderHeroStats(); renderQuests(); renderProfile();
});
