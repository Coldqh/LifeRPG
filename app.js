'use strict';

const STORAGE_KEY = 'prime-rpg-state-v10';
const STORAGE_KEY_BACKUP = 'prime-rpg-state-backup-v10';
const LEGACY_STORAGE_KEY_V8 = 'prime-rpg-state-v8';
const LEGACY_STORAGE_KEY_V7 = 'prime-rpg-state-v7';
const LEGACY_STORAGE_KEY_V5 = 'prime-rpg-state-v5';
const LEGACY_STORAGE_KEY_V3 = 'prime-rpg-state-v3';
const LEGACY_STORAGE_KEY = 'prime-rpg-state-v2';
const LEGACY_STORAGE_KEY_V1 = 'prime-rpg-state-v1';
const APP_VERSION = 'v1.0';
const APP_CACHE_QUERY = '1.0.0';
const MOSCOW_TZ = 'Europe/Moscow';
const ROLLOVER_CHECK_MS = 30 * 1000;

const STAT_KEYS = ['BODY', 'FIGHTER', 'MIND', 'WORK', 'CREATOR', 'CALM', 'DISCIPLINE'];
const LEVELS = [0, 1000, 2200, 3600, 5200, 7000, 9000, 11500, 14500, 18000, 22000, 27000, 33000, 40000];

const DEFAULT_DAILY_QUESTS = [
  {
    key: 'body', title: 'BODY', stat: 'BODY', maxXp: 40,
    items: [
      { id: 'body_training', text: 'тренировка в зале / бокс / домашняя тренировка', xp: 15, stat: 'FIGHTER' },
      { id: 'body_steps', text: 'шаги 12 000+', xp: 10, stat: 'BODY' },
      { id: 'body_food', text: 'питание по плану', xp: 10, stat: 'BODY' },
      { id: 'body_protein', text: 'белок 160+ г', xp: 5, stat: 'BODY' }
    ]
  },
  {
    key: 'work', title: 'WORK', stat: 'WORK', maxXp: 40,
    items: [
      { id: 'work_main', text: 'рабочий день / учёба / главная обязанность выполнена', xp: 20, stat: 'WORK' },
      { id: 'work_log', text: 'записал, что сделал', xp: 5, stat: 'WORK' },
      { id: 'work_learned', text: 'записал, что узнал', xp: 5, stat: 'MIND' },
      { id: 'work_not_quit', text: 'не слился, когда было непонятно', xp: 5, stat: 'DISCIPLINE' },
      { id: 'work_question', text: 'задал нормальный вопрос / закрыл мелкую задачу', xp: 5, stat: 'WORK' }
    ]
  },
  {
    key: 'creator', title: 'CREATOR', stat: 'CREATOR', maxXp: 40,
    items: [
      { id: 'creator_project30', text: '30+ минут проекта', xp: 20, stat: 'CREATOR' },
      { id: 'creator_result', text: 'сделал видимый результат', xp: 10, stat: 'CREATOR' },
      { id: 'creator_idea', text: 'записал идею / механику / структуру', xp: 5, stat: 'CREATOR' },
      { id: 'creator_focus', text: 'не распылялся на 5 проектов сразу', xp: 5, stat: 'DISCIPLINE' }
    ]
  },
  {
    key: 'calm', title: 'CALM', stat: 'CALM', maxXp: 30,
    items: [
      { id: 'calm_sleep', text: 'сон зафиксирован', xp: 5, stat: 'CALM' },
      { id: 'calm_anxiety', text: 'тревога 1–10 записана', xp: 5, stat: 'CALM' },
      { id: 'calm_mood', text: 'настроение 1–10 записано', xp: 5, stat: 'CALM' },
      { id: 'calm_annoyed', text: 'написал, что именно заебало', xp: 5, stat: 'CALM' },
      { id: 'calm_good', text: 'написал 1 нормальную вещь за день', xp: 5, stat: 'CALM' },
      { id: 'calm_no_compare', text: 'не накрутил себя инстой/сравнением', xp: 5, stat: 'DISCIPLINE' }
    ]
  },
  {
    key: 'mind', title: 'MIND', stat: 'MIND', maxXp: 20,
    items: [
      { id: 'mind_reading', text: 'чтение 15+ минут', xp: 10, stat: 'MIND' },
      { id: 'mind_learning', text: 'испанский / история / психология / аналитика 15+ минут', xp: 10, stat: 'MIND' }
    ]
  },
  {
    key: 'discipline', title: 'DISCIPLINE', stat: 'DISCIPLINE', maxXp: 30,
    items: [
      { id: 'discipline_insta0', text: 'инста 0 минут', xp: 10, stat: 'DISCIPLINE' },
      { id: 'discipline_energy1', text: 'энергетик максимум 1', xp: 10, stat: 'DISCIPLINE' },
      { id: 'discipline_no_junk', text: 'без сладкого мусора / фастфуда / импульсивной херни', xp: 10, stat: 'DISCIPLINE' }
    ]
  }

];

const PENALTIES = [
  { id: 'insta_slip', text: 'инста-срыв 30+ минут', xp: -20 },
  { id: 'energy_2plus', text: '2+ энергетика', xp: -15 },
  { id: 'junk_food', text: 'сладкое/фастфуд вне плана', xp: -15 },
  { id: 'missed_report', text: 'день не был отмечен', xp: -10 },
  { id: 'late_sleep', text: 'лёг очень поздно без причины', xp: -15 },
  { id: 'anxiety_no_actions', text: 'день полностью в тревоге без действий', xp: -20 },
  { id: 'self_blame', text: 'сорвался и начал себя гнобить', xp: -10 }
];

const WEEKLY_BOSSES = [
  {
    key: 'bodyBoss', title: 'BODY', stat: 'BODY', maxXp: 130,
    items: [
      { id: 'body_3_trainings', text: '3 тренировки за неделю', xp: 50 },
      { id: 'body_avg_steps', text: 'средние шаги 12к+', xp: 30 },
      { id: 'body_food_5', text: 'питание 5/7 дней по плану', xp: 30 },
      { id: 'body_photo', text: 'фото формы 1 раз', xp: 20 }
    ]
  },
  {
    key: 'workBoss', title: 'WORK', stat: 'WORK', maxXp: 150,
    items: [
      { id: 'work_5_days', text: '5 рабочих дней закрыты', xp: 50 },
      { id: 'work_5_logs', text: '5 рабочих журналов', xp: 30 },
      { id: 'work_10_terms', text: 'выписал 10 новых терминов/процессов', xp: 20 },
      { id: 'work_system', text: 'понял одну новую систему/процедуру', xp: 20 },
      { id: 'work_conclusion', text: 'сделал вывод недели', xp: 30 }
    ]
  },
  {
    key: 'creatorBoss', title: 'CREATOR', stat: 'CREATOR', maxXp: 150,
    items: [
      { id: 'creator_3_sessions', text: '3 сессии проекта по 30+ минут', xp: 40 },
      { id: 'creator_visible_result', text: '1 видимый результат', xp: 50 },
      { id: 'creator_roadmap', text: 'обновил roadmap / список задач', xp: 20 },
      { id: 'creator_no_spread', text: 'не распылялся на всё сразу', xp: 20 },
      { id: 'creator_showed_result', text: 'показал мне итог недели', xp: 20 }
    ]
  },
  {
    key: 'calmBoss', title: 'CALM', stat: 'CALM', maxXp: 150,
    items: [
      { id: 'calm_sleep_7', text: 'сон записан 7/7 дней', xp: 30 },
      { id: 'calm_anxiety_7', text: 'тревога записана 7/7 дней', xp: 30 },
      { id: 'calm_no_spin_3', text: 'минимум 3 дня без сильной накрутки', xp: 30 },
      { id: 'calm_insta_control', text: 'инста под контролем всю неделю', xp: 30 },
      { id: 'calm_head_conclusion', text: 'сделал недельный вывод по голове', xp: 30 }
    ]
  }

];

const DAILY_METRIC_FIELDS = [];
const NOTE_FIELDS = [];
const WEEKLY_NOTE_FIELDS = [];

let state;
let suppressAutosave = false;

function cloneQuestConfig(quests) {
  return JSON.parse(JSON.stringify(Array.isArray(quests) ? quests : []));
}


function isDisabledCategory(quest) {
  const key = String(quest?.key || '').toLowerCase();
  const title = String(quest?.title || quest?.category || '').toUpperCase();
  return ['charisma', 'social', 'money'].includes(key) || ['CHARISMA', 'SOCIAL', 'MONEY'].includes(title);
}

function filterActiveDailyQuests(quests) {
  return cloneQuestConfig(quests).filter((quest) => !isDisabledCategory(quest));
}

function getDailyQuests() {
  const quests = state?.config?.dailyQuests;
  const active = filterActiveDailyQuests(Array.isArray(quests) && quests.length ? quests : DEFAULT_DAILY_QUESTS);
  return active.length ? active : filterActiveDailyQuests(DEFAULT_DAILY_QUESTS);
}

function safeId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'e')
    .replace(/[^a-zа-я0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48) || `quest_${Date.now()}`;
}

function normalizeStat(value, fallback = 'DISCIPLINE') {
  const stat = String(value || fallback).trim().toUpperCase();
  return STAT_KEYS.includes(stat) ? stat : fallback;
}

function normalizeCategoryKey(value) {
  const raw = String(value || '').trim();
  const known = {
    BODY: 'body', FIGHTER: 'fighter', WORK: 'work', CREATOR: 'creator', CALM: 'calm', MIND: 'mind',
    DISCIPLINE: 'discipline'
  };
  return known[raw.toUpperCase()] || safeId(raw);
}

function normalizeQuestItem(item, categoryKey) {
  if (!item || typeof item !== 'object') return null;
  const text = String(item.text || item.title || item.name || '').trim();
  if (!text) return null;
  const xp = Math.max(1, Math.min(100, Number(item.xp || item.XP || 10)));
  const id = safeId(item.id || `${categoryKey}_${text}`);
  return { id, text, xp, stat: normalizeStat(item.stat || item.category || categoryKey.toUpperCase(), 'DISCIPLINE') };
}

function normalizeQuestPack(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('quest pack должен быть JSON-объектом');
  const mode = String(payload.mode || 'merge').toLowerCase() === 'replace' ? 'replace' : 'merge';
  const source = Array.isArray(payload.dailyQuests) ? payload.dailyQuests : Array.isArray(payload.quests) ? payload.quests : [];
  if (!source.length) throw new Error('в quest pack нет dailyQuests или quests');

  const groups = new Map();
  source.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    if (Array.isArray(entry.items) || Array.isArray(entry.quests)) {
      const title = String(entry.category || entry.title || entry.name || 'CUSTOM').trim();
      const key = normalizeCategoryKey(title);
      const stat = normalizeStat(entry.stat || title, 'DISCIPLINE');
      const items = (entry.items || entry.quests).map((item) => normalizeQuestItem(item, key)).filter(Boolean);
      if (!groups.has(key)) groups.set(key, { key, title: String(entry.title || entry.category || key).trim().toUpperCase(), stat, maxXp: Number(entry.maxXp || 0), items: [] });
      groups.get(key).items.push(...items);
    } else {
      const title = String(entry.category || 'CUSTOM').trim();
      const key = normalizeCategoryKey(title);
      const stat = normalizeStat(entry.stat || title, 'DISCIPLINE');
      const item = normalizeQuestItem(entry, key);
      if (!item) return;
      if (!groups.has(key)) groups.set(key, { key, title: title.toUpperCase(), stat, maxXp: 0, items: [] });
      groups.get(key).items.push(item);
    }
  });

  const categories = [...groups.values()].map((group) => {
    const seen = new Set();
    const items = [];
    group.items.forEach((item) => {
      if (seen.has(item.id) || items.length >= 10) return;
      seen.add(item.id);
      items.push(item);
    });
    const maxXp = group.maxXp > 0 ? Math.min(Number(group.maxXp), items.reduce((sum, item) => sum + item.xp, 0)) : items.reduce((sum, item) => sum + item.xp, 0);
    return { ...group, maxXp, items };
  }).filter((group) => group.items.length);

  if (!categories.length) throw new Error('не найдено валидных квестов');
  return { mode, categories };
}

function defaultState() {
  const today = todayMoscowISO();
  const weekId = getWeekStart(today);
  return {
    version: 10,
    profile: {
      playerName: '',
      seasonName: 'Москва / Сушка / Работа',
      seasonGoal: 'стабильный режим: тело, работа, проекты, спокойствие',
      startDate: today
    },
    config: {
      dailyQuests: filterActiveDailyQuests(DEFAULT_DAILY_QUESTS)
    },
    system: {
      currentDate: today,
      currentWeekId: weekId,
      dayCounter: 1,
      lastSyncAt: nowMoscowStamp()
    },
    currentDay: createDayDraft(today, 1),
    currentWeek: createWeekDraft(weekId, today),
    days: [],
    weeks: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY_BACKUP) || localStorage.getItem(LEGACY_STORAGE_KEY_V8) || localStorage.getItem(LEGACY_STORAGE_KEY_V7) || localStorage.getItem(LEGACY_STORAGE_KEY_V5) || localStorage.getItem(LEGACY_STORAGE_KEY_V3) || localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return migrateState(parsed);
  } catch (error) {
    console.error(error);
    return defaultState();
  }
}

function migrateState(parsed) {
  const base = defaultState();
  const stateLike = {
    ...base,
    ...parsed,
    version: 10,
    profile: { ...base.profile, ...(parsed.profile || {}) },
    config: { ...base.config, ...(parsed.config || {}) },
    system: { ...base.system, ...(parsed.system || {}) },
    days: Array.isArray(parsed.days) ? parsed.days : [],
    weeks: Array.isArray(parsed.weeks) ? parsed.weeks : []
  };

  stateLike.config.dailyQuests = filterActiveDailyQuests(stateLike.config.dailyQuests || DEFAULT_DAILY_QUESTS);
  if (!stateLike.currentDay) {
    const today = todayMoscowISO();
    const oldToday = stateLike.days.find((day) => day.id === today || day.metrics?.date === today);
    stateLike.currentDay = oldToday ? dayToDraft(oldToday) : createDayDraft(today, getNextDayNumberFromDays(stateLike.days));
    stateLike.days = stateLike.days.filter((day) => (day.id !== today && day.metrics?.date !== today));
  }
  if (!stateLike.currentWeek) stateLike.currentWeek = createWeekDraft(getWeekStart(todayMoscowISO()));
  const activeDailyIds = new Set((stateLike.config.dailyQuests || []).flatMap((quest) => (quest.items || []).map((item) => item.id)));
  const activeWeeklyIds = new Set(WEEKLY_BOSSES.flatMap((week) => week.items.map((item) => item.id)));
  stateLike.currentDay.completed = (stateLike.currentDay.completed || []).filter((id) => activeDailyIds.has(id));
  stateLike.currentWeek.completed = (stateLike.currentWeek.completed || []).filter((id) => activeWeeklyIds.has(id));
  stateLike.system.currentDate = stateLike.currentDay.date || todayMoscowISO();
  stateLike.system.currentWeekId = stateLike.currentWeek.weekId || getWeekStart(todayMoscowISO());
  stateLike.system.dayCounter = Math.max(
    Number(stateLike.system.dayCounter || 1),
    getNextDayNumberFromDays(stateLike.days),
    Number(stateLike.currentDay.dayNumber || 1)
  );
  return stateLike;
}

function saveState() {
  if (!state) return;
  state.version = 10;
  state.system.lastSyncAt = nowMoscowStamp();
  const payload = JSON.stringify(state);
  try {
    localStorage.setItem(STORAGE_KEY, payload);
    localStorage.setItem(STORAGE_KEY_BACKUP, payload);
  } catch (error) {
    console.error('PRIME RPG save failed', error);
    showToast('Не удалось сохранить данные');
  }
}

function forceSaveNow() {
  try {
    if (!state) return;
    const dailyForm = $('#dailyForm');
    const weeklyForm = $('#weeklyForm');
    if (dailyForm) state.currentDay = collectCurrentDayFromForm();
    if (weeklyForm) state.currentWeek = collectCurrentWeekFromForm();
    saveState();
  } catch (error) {
    console.warn('Force save failed', error);
  }
}

function $(selector, root = document) { return root.querySelector(selector); }
function $$(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }

function getMoscowParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: MOSCOW_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
}

function todayMoscowISO(date = new Date()) {
  const p = getMoscowParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

function nowMoscowStamp(date = new Date()) {
  const p = getMoscowParts(date);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second} МСК`;
}

function moscowTimeText() {
  const p = getMoscowParts();
  return `${p.hour}:${p.minute} МСК`;
}

function moscowWeekdayText(date = new Date()) {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: MOSCOW_TZ, weekday: 'long' }).format(date);
}

function moscowFullDateText(date = new Date()) {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: MOSCOW_TZ, day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function parseISODate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(iso, amount) {
  const date = parseISODate(iso);
  date.setUTCDate(date.getUTCDate() + amount);
  return toISODate(date);
}

function diffDays(a, b) {
  return Math.round((parseISODate(b) - parseISODate(a)) / 86400000);
}

function getWeekDay(iso) {
  const day = parseISODate(iso).getUTCDay();
  return day === 0 ? 7 : day;
}

function getWeekStart(iso) {
  return addDays(iso, -(getWeekDay(iso) - 1));
}

function getWeekEnd(weekStart) {
  return addDays(weekStart, 6);
}

function getSeasonWeekNumber(weekStart = getWeekStart(todayMoscowISO()), startDateOverride = null) {
  const startDate = startDateOverride || state?.profile?.startDate || todayMoscowISO();
  const seasonStartWeek = getWeekStart(startDate);
  return Math.max(1, Math.floor(diffDays(seasonStartWeek, weekStart) / 7) + 1);
}

function getNextDayNumberFromDays(days = state.days) {
  const maxClosed = days.reduce((value, day) => Math.max(value, Number(day.metrics?.dayNumber || day.dayNumber || 0)), 0);
  return maxClosed + 1;
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function checked(form, name) {
  const input = form?.elements?.[name];
  return Boolean(input && input.checked);
}

function setChecked(form, name, value) {
  const input = form?.elements?.[name];
  if (input) input.checked = Boolean(value);
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}


function categoryIcon(value) {
  const key = String(value || '').toUpperCase();
  const icons = {
    BODY: '🥊',
    FIGHTER: '🥊',
    WORK: '💼',
    CREATOR: '🛠️',
    CALM: '🧘',
    MIND: '📚',
    DISCIPLINE: '⚡',
    WEEK: '📅',
    HISTORY: '📈',
    SETTINGS: '⚙️'
  };
  return icons[key] || '✅';
}

function questIcon(name, text, xp) {
  const source = `${name || ''} ${text || ''}`.toLowerCase();
  if (xp < 0) return '⚠️';
  if (source.includes('training') || source.includes('трен') || source.includes('бокс')) return '🥊';
  if (source.includes('steps') || source.includes('шаг')) return '👟';
  if (source.includes('food') || source.includes('пит') || source.includes('protein') || source.includes('белок')) return '🍗';
  if (source.includes('work') || source.includes('рабоч') || source.includes('задач')) return '💼';
  if (source.includes('learn') || source.includes('узнал') || source.includes('чтение') || source.includes('испан')) return '📚';
  if (source.includes('creator') || source.includes('проект') || source.includes('roadmap') || source.includes('иде')) return '🛠️';
  if (source.includes('calm') || source.includes('сон') || source.includes('тревог') || source.includes('настро')) return '🧘';
  if (source.includes('insta') || source.includes('инста')) return '📵';
  if (source.includes('энергет')) return '🥤';
  if (source.includes('мусор') || source.includes('фастфуд') || source.includes('слад')) return '🚫';
  return '✅';
}

function notifyApp(message, options = {}) {
  showToast(message);
  const banner = $('#updateBanner');
  const bannerText = $('#updateBannerText');
  if (options.banner && banner && bannerText) {
    bannerText.textContent = message;
    banner.hidden = false;
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification('PRIME RPG', { body: message, tag: 'prime-rpg-update' }); } catch (_) {}
  }
}

async function requestNotifications() {
  if (!('Notification' in window)) {
    showToast('Браузер не поддерживает уведомления');
    return;
  }
  const permission = await Notification.requestPermission();
  showToast(permission === 'granted' ? 'Уведомления включены' : 'Уведомления не включены');
}

async function refreshAppVersion() {
  forceSaveNow();
  notifyApp('Обновляю версию. Данные сохранены.', { banner: false });
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith('prime-rpg')).map((key) => caches.delete(key)));
    }
  } catch (error) {
    console.warn('Version refresh cleanup failed', error);
  }
  const base = `${window.location.origin}${window.location.pathname}`;
  window.location.replace(`${base}?v=${APP_CACHE_QUERY}&t=${Date.now()}`);
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2300);
}

function showBootError(error) {
  const message = error?.message || String(error || 'unknown error');
  const box = document.createElement('div');
  box.className = 'boot-error';
  box.innerHTML = `<strong>PRIME RPG boot error</strong><span>${escapeHTML(message)}</span><small>JS упал при старте. Открой сайт с ?v=1.0.0 или очисти данные сайта.</small>`;
  document.body.prepend(box);
}

window.addEventListener('error', (event) => {
  console.error('PRIME RPG runtime error', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('PRIME RPG promise error', event.reason);
});

function createDayDraft(date, dayNumber) {
  return {
    id: date,
    date,
    dayNumber,
    createdAt: nowMoscowStamp(),
    metrics: {},
    notes: {},
    completed: [],
    penalties: [],
    status: 'active'
  };
}

function createWeekDraft(weekId, startDateOverride = null) {
  return {
    id: weekId,
    weekId,
    weekNumber: getSeasonWeekNumber(weekId, startDateOverride),
    startDate: weekId,
    endDate: getWeekEnd(weekId),
    createdAt: nowMoscowStamp(),
    notes: {},
    completed: [],
    status: 'active'
  };
}

function dayToDraft(day) {
  return {
    id: day.metrics?.date || day.date || day.id,
    date: day.metrics?.date || day.date || day.id,
    dayNumber: Number(day.metrics?.dayNumber || day.dayNumber || getNextDayNumberFromDays()),
    createdAt: day.createdAt || nowMoscowStamp(),
    metrics: { ...day.metrics },
    notes: { ...day.notes },
    completed: [...(day.completed || [])],
    penalties: [...(day.penalties || [])],
    status: 'active'
  };
}

function calculateDailyFromDraft(draft = state.currentDay) {
  const completedSet = new Set(draft.completed || []);
  const penaltySet = new Set(draft.penalties || []);
  const categoryXp = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));
  const questXp = {};

  getDailyQuests().forEach((quest) => {
    let sum = 0;
    quest.items.forEach((item) => {
      if (completedSet.has(item.id)) {
        sum += item.xp;
        categoryXp[item.stat] = (categoryXp[item.stat] || 0) + item.xp;
      }
    });
    questXp[quest.key] = Math.min(sum, quest.maxXp);
  });

  const positiveXp = Object.values(questXp).reduce((sum, value) => sum + value, 0);
  const penaltyXp = PENALTIES.reduce((sum, item) => penaltySet.has(item.id) ? sum + item.xp : sum, 0);
  const netXp = positiveXp + penaltyXp;
  return {
    questXp,
    categoryXp,
    positiveXp,
    penaltyXp,
    netXp,
    rank: getDailyRank(netXp),
    completed: [...completedSet],
    penalties: [...penaltySet]
  };
}

function calculateWeeklyFromDraft(draft = state.currentWeek) {
  const completedSet = new Set(draft.completed || []);
  const bossXp = {};
  const categoryXp = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));

  WEEKLY_BOSSES.forEach((boss) => {
    let sum = 0;
    boss.items.forEach((item) => {
      if (completedSet.has(item.id)) sum += item.xp;
    });
    const capped = Math.min(sum, boss.maxXp);
    bossXp[boss.key] = capped;
    categoryXp[boss.stat] = (categoryXp[boss.stat] || 0) + capped;
  });

  const totalXp = Object.values(bossXp).reduce((sum, value) => sum + value, 0);
  return { bossXp, categoryXp, totalXp, completed: [...completedSet] };
}

function getDailyRank(xp) {
  if (xp >= 250) return 'Legendary Day';
  if (xp >= 201) return 'Elite Day';
  if (xp >= 151) return 'Prime Day';
  if (xp >= 101) return 'Solid Day';
  if (xp >= 51) return 'Survived';
  return 'Broken Day';
}

function getLevel(totalXp) {
  let level = 1;
  for (let i = 1; i < LEVELS.length; i += 1) {
    if (totalXp >= LEVELS[i]) level = i + 1;
  }
  const currentFloor = LEVELS[level - 1] || 0;
  const next = LEVELS[level] || LEVELS[LEVELS.length - 1] + 10000;
  const progress = Math.max(0, Math.min(100, ((totalXp - currentFloor) / (next - currentFloor)) * 100));
  return { level, currentFloor, next, progress };
}

function getStatusRank(totalXp) {
  if (totalXp >= 35000) return '0.001%';
  if (totalXp >= 22000) return 'Prime Human';
  if (totalXp >= 12000) return '0.1% Operator';
  if (totalXp >= 7000) return 'Elite Candidate';
  if (totalXp >= 3000) return 'Rare Build';
  if (totalXp >= 1000) return 'Strong Guy';
  return 'Ordinary';
}

function formatDate(iso) {
  if (!iso) return '—';
  const [year, month, day] = String(iso).split('-');
  return `${day}.${month}.${year}`;
}

function renderDailyQuests() {
  const grid = $('#dailyQuestGrid');
  if (!grid) return;
  grid.innerHTML = getDailyQuests().map((quest) => `
    <article class="quest-card">
      <header>
        <div>
          <p class="eyebrow"><span class="emoji">${categoryIcon(quest.stat)}</span> ${escapeHTML(quest.stat)}</p>
          <h3><span class="card-art">${categoryIcon(quest.title)}</span>${escapeHTML(quest.title)}</h3>
        </div>
        <strong class="quest-xp">+${quest.maxXp}</strong>
      </header>
      <div class="checkbox-grid">
        ${quest.items.map((item) => checkRow(`q_${item.id}`, item.text, item.xp)).join('')}
      </div>
    </article>
  `).join('');

  const penaltyGrid = $('#penaltyGrid');
  if (penaltyGrid) penaltyGrid.innerHTML = PENALTIES.map((item) => checkRow(`p_${item.id}`, item.text, item.xp, '⚠️')).join('');
}

function renderWeeklyBosses() {
  const grid = $('#weeklyBossGrid');
  if (!grid) return;
  grid.innerHTML = WEEKLY_BOSSES.map((boss) => `
    <article class="quest-card">
      <header>
        <div>
          <p class="eyebrow"><span class="emoji">${categoryIcon(boss.stat)}</span> ${escapeHTML(boss.stat)}</p>
          <h3><span class="card-art">${categoryIcon(boss.title)}</span>${escapeHTML(boss.title)}</h3>
        </div>
        <strong class="quest-xp">+${boss.maxXp}</strong>
      </header>
      <div class="checkbox-grid">
        ${boss.items.map((item) => checkRow(`b_${item.id}`, item.text, item.xp, categoryIcon(boss.title))).join('')}
      </div>
    </article>
  `).join('');
}

function checkRow(name, text, xp, icon = null) {
  const sign = xp > 0 ? `+${xp}` : `${xp}`;
  const rowIcon = icon || questIcon(name, text, xp);
  return `
    <div class="check-row">
      <label>
        <input name="${escapeHTML(name)}" type="checkbox" />
        <span class="row-icon" aria-hidden="true">${escapeHTML(rowIcon)}</span>
        <span>${escapeHTML(text)}</span>
      </label>
      <span class="xp">${escapeHTML(sign)}</span>
    </div>
  `;
}

function fillDailyForm() {
  const form = $('#dailyForm');
  if (!form) return;
  suppressAutosave = true;
  form.reset();
  const draft = state.currentDay;
  DAILY_METRIC_FIELDS.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = draft.metrics?.[field] ?? '';
  });
  NOTE_FIELDS.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = draft.notes?.[field] ?? '';
  });
  getDailyQuests().flatMap((quest) => quest.items).forEach((item) => setChecked(form, `q_${item.id}`, draft.completed?.includes(item.id)));
  PENALTIES.forEach((item) => setChecked(form, `p_${item.id}`, draft.penalties?.includes(item.id)));
  suppressAutosave = false;
  updateDailyPreview();
  updateClockUI();
}

function fillWeeklyForm() {
  const form = $('#weeklyForm');
  if (!form) return;
  suppressAutosave = true;
  form.reset();
  const draft = state.currentWeek;
  WEEKLY_NOTE_FIELDS.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = draft.notes?.[field] ?? '';
  });
  WEEKLY_BOSSES.flatMap((boss) => boss.items).forEach((item) => setChecked(form, `b_${item.id}`, draft.completed?.includes(item.id)));
  suppressAutosave = false;
  updateWeeklyPreview();
  updateClockUI();
}

function collectCurrentDayFromForm() {
  const form = $('#dailyForm');
  const draft = {
    ...state.currentDay,
    id: state.system.currentDate,
    date: state.system.currentDate,
    dayNumber: state.system.dayCounter,
    metrics: {},
    notes: {},
    completed: [],
    penalties: []
  };

  DAILY_METRIC_FIELDS.forEach((field) => {
    const value = form.elements[field]?.value ?? '';
    draft.metrics[field] = toNumber(value) ?? value;
  });
  NOTE_FIELDS.forEach((field) => {
    draft.notes[field] = form.elements[field]?.value?.trim() || '';
  });
  getDailyQuests().flatMap((quest) => quest.items).forEach((item) => {
    if (checked(form, `q_${item.id}`)) draft.completed.push(item.id);
  });
  PENALTIES.forEach((item) => {
    if (checked(form, `p_${item.id}`)) draft.penalties.push(item.id);
  });
  return draft;
}

function collectCurrentWeekFromForm() {
  const form = $('#weeklyForm');
  const draft = {
    ...state.currentWeek,
    id: state.system.currentWeekId,
    weekId: state.system.currentWeekId,
    weekNumber: getSeasonWeekNumber(state.system.currentWeekId),
    startDate: state.system.currentWeekId,
    endDate: getWeekEnd(state.system.currentWeekId),
    notes: {},
    completed: []
  };

  WEEKLY_NOTE_FIELDS.forEach((field) => {
    draft.notes[field] = form.elements[field]?.value?.trim() || '';
  });
  WEEKLY_BOSSES.flatMap((boss) => boss.items).forEach((item) => {
    if (checked(form, `b_${item.id}`)) draft.completed.push(item.id);
  });
  return draft;
}

function autosaveCurrentDay() {
  if (suppressAutosave) return;
  state.currentDay = collectCurrentDayFromForm();
  saveState();
  updateDailyPreview();
  renderDashboard();
}

function autosaveCurrentWeek() {
  if (suppressAutosave) return;
  state.currentWeek = collectCurrentWeekFromForm();
  saveState();
  updateWeeklyPreview();
  renderDashboard();
}

function updateDailyPreview() {
  const title = $('#dailyResultTitle');
  const details = $('#dailyResultDetails');
  if (!title || !details) return;
  const result = calculateDailyFromDraft(state.currentDay);
  title.textContent = `${result.netXp} XP — ${result.rank}`;
  details.textContent = `Live-день: ${formatDate(state.currentDay.date)}. Плюс: ${result.positiveXp} XP. Штрафы: ${result.penaltyXp} XP. База BODY/WORK/CREATOR/CALM: ${['body', 'work', 'creator', 'calm'].map((key) => result.questXp[key] || 0).reduce((a, b) => a + b, 0)} / 150 XP.`;
}

function updateWeeklyPreview() {
  // В недельной вкладке нет отдельного live-блока. Галочки сохраняются как pending XP до автозакрытия недели.
}

function finalizeDay(draft, reason = 'midnight') {
  if (!draft || !draft.date) return null;
  const calc = calculateDailyFromDraft(draft);
  const day = {
    id: draft.date,
    date: draft.date,
    weekId: getWeekStart(draft.date),
    createdAt: draft.createdAt || nowMoscowStamp(),
    closedAt: nowMoscowStamp(),
    closedBy: reason,
    metrics: {
      date: draft.date,
      dayNumber: draft.dayNumber,
      ...(draft.metrics || {})
    },
    notes: { ...(draft.notes || {}) },
    completed: calc.completed,
    penalties: calc.penalties,
    questXp: calc.questXp,
    categoryXp: calc.categoryXp,
    positiveXp: calc.positiveXp,
    penaltyXp: calc.penaltyXp,
    netXp: calc.netXp,
    rank: calc.rank
  };
  state.days = state.days.filter((item) => item.id !== day.id && item.metrics?.date !== day.id);
  state.days.push(day);
  state.days.sort((a, b) => (a.metrics?.date || a.id || '').localeCompare(b.metrics?.date || b.id || ''));
  return day;
}

function createMissedDay(date, dayNumber) {
  const draft = createDayDraft(date, dayNumber);
  draft.penalties = ['missed_report'];
  draft.notes = {
    calmAnnoyed: 'Автозакрытие: день пропущен.',
    calmGood: 'Система сохранила цепочку дней.'
  };
  return draft;
}

function finalizeWeek(draft, reason = 'monday-rollover') {
  if (!draft || !draft.weekId) return null;
  const calc = calculateWeeklyFromDraft(draft);
  const days = getClosedDaysInWeek(draft.weekId);
  const metrics = buildWeekMetrics(draft, days);
  const notes = {
    ...(draft.notes || {}),
    weekSummary: draft.notes?.weekSummary || buildAutoWeekSummary(days, calc),
    improve: draft.notes?.improve || buildAutoWeekImprove(days)
  };
  const week = {
    id: draft.weekId,
    weekId: draft.weekId,
    weekNumber: getSeasonWeekNumber(draft.weekId),
    createdAt: draft.createdAt || nowMoscowStamp(),
    closedAt: nowMoscowStamp(),
    closedBy: reason,
    metrics,
    notes,
    completed: calc.completed,
    bossXp: calc.bossXp,
    categoryXp: calc.categoryXp,
    totalXp: calc.totalXp,
    dailyXp: days.reduce((sum, day) => sum + Number(day.netXp || 0), 0),
    dayCount: days.length,
    result: isWeeklyMinimumPassed(days, draft) ? 'passed' : 'failed'
  };
  state.weeks = state.weeks.filter((item) => item.id !== week.id && item.weekId !== week.id);
  state.weeks.push(week);
  state.weeks.sort((a, b) => (a.weekId || a.id || '').localeCompare(b.weekId || b.id || ''));
  return week;
}

function buildWeekMetrics(draft, days) {
  return {
    weekNumber: getSeasonWeekNumber(draft.weekId),
    startDate: draft.weekId,
    endDate: getWeekEnd(draft.weekId),
    reports: days.length,
    trainingCount: days.filter((day) => day.completed?.includes('body_training')).length,
    foodPlanDays: days.filter((day) => day.completed?.includes('body_food')).length,
    workJournals: days.filter((day) => day.completed?.includes('work_log')).length,
    projectSessions: days.filter((day) => day.completed?.includes('creator_project30')).length,
    instagramControlDays: days.filter((day) => !day.penalties?.includes('insta_slip')).length
  };
}

function average(values) {
  if (!values.length) return '';
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getClosedDaysInWeek(weekId) {
  const end = getWeekEnd(weekId);
  return state.days
    .filter((day) => {
      const date = day.metrics?.date || day.date || day.id;
      return date >= weekId && date <= end;
    })
    .sort((a, b) => (a.metrics?.date || a.id || '').localeCompare(b.metrics?.date || b.id || ''));
}

function isWeeklyMinimumPassed(days) {
  const reports = days.length;
  const trainings = days.filter((day) => day.completed?.includes('body_training')).length;
  const workLogs = days.filter((day) => day.completed?.includes('work_log')).length;
  const projectSessions = days.filter((day) => day.completed?.includes('creator_project30')).length;
  const instaControl = days.filter((day) => !day.penalties?.includes('insta_slip')).length;
  return trainings >= 3 && workLogs >= 5 && projectSessions >= 3 && reports >= 7 && instaControl === reports;
}

function buildAutoWeekSummary(days, calc) {
  const totalDaily = days.reduce((sum, day) => sum + Number(day.netXp || 0), 0);
  const best = [...days].sort((a, b) => Number(b.netXp || 0) - Number(a.netXp || 0))[0];
  return `Автосводка: ${days.length}/7 дней, ${totalDaily} XP за дни, ${calc.totalXp} XP за неделю.${best ? ` Лучший день: ${formatDate(best.metrics?.date)} — ${best.netXp} XP.` : ''}`;
}

function buildAutoWeekImprove(days) {
  if (days.length < 7) return 'Закрывать каждый день, а не оставлять пустые провалы.';
  const lowDays = days.filter((day) => Number(day.netXp || 0) <= 100).length;
  if (lowDays >= 3) return 'Поднять базу: BODY / WORK / CREATOR / CALM.';
  return 'Удержать ритм и добавить один сильный проектный результат.';
}

function syncClock(showMessage = false) {
  const today = todayMoscowISO();
  let changed = false;

  if (!state.currentDay) state.currentDay = createDayDraft(today, getNextDayNumberFromDays());
  if (!state.currentWeek) state.currentWeek = createWeekDraft(getWeekStart(today));

  const activeDate = state.currentDay.date || state.system.currentDate || today;

  if (activeDate < today) {
    // закрываем последний активный день
    finalizeDay(state.currentDay, 'auto-midnight-msk');
    let nextDate = addDays(activeDate, 1);
    let nextNumber = Number(state.currentDay.dayNumber || state.system.dayCounter || 1) + 1;

    // создаём пустые пропущенные дни, если приложение не открывали несколько суток
    while (nextDate < today) {
      finalizeDay(createMissedDay(nextDate, nextNumber), 'auto-missed-day');
      nextDate = addDays(nextDate, 1);
      nextNumber += 1;
    }

    state.system.currentDate = today;
    state.system.dayCounter = nextNumber;
    state.currentDay = createDayDraft(today, nextNumber);
    changed = true;
  }

  const currentWeekId = getWeekStart(today);
  const activeWeekId = state.currentWeek.weekId || state.system.currentWeekId || currentWeekId;
  if (activeWeekId < currentWeekId) {
    finalizeWeek(state.currentWeek, 'auto-monday-msk');
    let nextWeekId = addDays(activeWeekId, 7);
    while (nextWeekId < currentWeekId) {
      finalizeWeek(createWeekDraft(nextWeekId), 'auto-missed-week');
      nextWeekId = addDays(nextWeekId, 7);
    }
    state.system.currentWeekId = currentWeekId;
    state.currentWeek = createWeekDraft(currentWeekId);
    changed = true;
  }

  state.system.currentDate = state.currentDay.date;
  state.system.currentWeekId = state.currentWeek.weekId;
  updateClockUI();

  if (changed) {
    saveState();
    fillDailyForm();
    fillWeeklyForm();
    renderAll();
    showToast(showMessage ? 'Синхронизация: календарь обновлён по МСК' : 'День обновлён по МСК');
  }
}

function updateClockUI() {
  const now = new Date();
  const today = state.currentDay?.date || todayMoscowISO(now);
  const week = state.currentWeek || createWeekDraft(getWeekStart(today));
  const weekday = moscowWeekdayText(now);
  const dateText = moscowFullDateText(now);
  const timeText = moscowTimeText();
  const dayText = `День №${state.currentDay?.dayNumber || 1} • ${formatDate(today)} • ${weekday}`;
  const weekText = `Неделя №${getSeasonWeekNumber(week.weekId)} • ${formatDate(week.startDate)} — ${formatDate(week.endDate)}`;
  const nextText = `Следующая смена дня: 00:00 МСК`;
  if ($('#appVersionValue')) $('#appVersionValue').textContent = APP_VERSION;
  if ($('#moscowDateValue')) $('#moscowDateValue').textContent = dateText;
  if ($('#moscowWeekdayValue')) $('#moscowWeekdayValue').textContent = weekday;
  if ($('#moscowTimeValue')) $('#moscowTimeValue').textContent = timeText;
  if ($('#currentDayMeta')) $('#currentDayMeta').textContent = dayText;
  if ($('#currentWeekMeta')) $('#currentWeekMeta').textContent = weekText;
  if ($('#rolloverMeta')) $('#rolloverMeta').textContent = nextText;
  if ($('#dailyLiveTitle')) $('#dailyLiveTitle').textContent = `Квесты текущего дня — ${formatDate(today)}`;
  if ($('#weeklyLiveTitle')) $('#weeklyLiveTitle').textContent = `Неделя — ${formatDate(week.startDate)}–${formatDate(week.endDate)}`;
}

function getTotals() {
  const statXp = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));
  const pendingStatXp = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));
  let closedDailyXp = 0;
  state.days.forEach((day) => {
    closedDailyXp += Number(day.netXp || 0);
    Object.entries(day.categoryXp || {}).forEach(([key, value]) => {
      if (key in statXp) statXp[key] = (statXp[key] || 0) + Number(value || 0);
    });
  });

  let closedWeeklyXp = 0;
  state.weeks.forEach((week) => {
    closedWeeklyXp += Number(week.totalXp || 0);
    Object.entries(week.categoryXp || {}).forEach(([key, value]) => {
      if (key in statXp) statXp[key] = (statXp[key] || 0) + Number(value || 0);
    });
  });

  const liveDaily = calculateDailyFromDraft(state.currentDay);
  Object.entries(liveDaily.categoryXp || {}).forEach(([key, value]) => {
    if (key in pendingStatXp) pendingStatXp[key] = (pendingStatXp[key] || 0) + Number(value || 0);
  });

  const liveWeek = calculateWeeklyFromDraft(state.currentWeek);
  Object.entries(liveWeek.categoryXp || {}).forEach(([key, value]) => {
    if (key in pendingStatXp) pendingStatXp[key] = (pendingStatXp[key] || 0) + Number(value || 0);
  });

  const confirmedTotalXp = closedDailyXp + closedWeeklyXp;
  const pendingXp = liveDaily.netXp + liveWeek.totalXp;

  return {
    statXp,
    pendingStatXp,
    closedDailyXp,
    closedWeeklyXp,
    confirmedTotalXp,
    pendingDailyXp: liveDaily.netXp,
    pendingWeeklyXp: liveWeek.totalXp,
    pendingXp,
    totalXp: confirmedTotalXp
  };
}

function renderDashboard() {
  const totals = getTotals();
  const level = getLevel(totals.confirmedTotalXp);
  const liveDaily = calculateDailyFromDraft(state.currentDay);
  const liveWeek = calculateWeeklyFromDraft(state.currentWeek);
  if ($('#seasonTitle')) $('#seasonTitle').textContent = state.profile.seasonName || 'Москва / Сушка / Работа';
  if ($('#statusRank')) $('#statusRank').textContent = getStatusRank(totals.confirmedTotalXp);
  $('#levelValue').textContent = level.level;
  $('#levelProgressText').textContent = `${totals.confirmedTotalXp}+${totals.pendingXp} / ${level.next} XP`;
  $('#levelProgressBar').style.width = `${level.progress}%`;
  $('#totalXpValue').textContent = `${totals.confirmedTotalXp}+${totals.pendingXp}`;
  $('#lastDayRank').textContent = liveDaily.rank;
  $('#lastDayXp').textContent = `итог дня: +${liveDaily.netXp} XP`;
  const weekXp = getWeekCurrentXpParts();
  $('#weekXpValue').textContent = `${weekXp.confirmed}+${weekXp.pending} XP`;
  $('#weekReportsValue').textContent = `${getClosedDaysInWeek(state.currentWeek.weekId).length}/7 дней • неделя +${liveWeek.totalXp} XP`;

  $('#statBars').innerHTML = STAT_KEYS.map((key) => {
    const value = totals.statXp[key] || 0;
    const pending = totals.pendingStatXp[key] || 0;
    const width = Math.min(100, (value / 2500) * 100);
    const text = pending ? `${value}+${pending} XP` : `${value} XP`;
    return `
      <div>
        <div class="bar-top"><span><span class="emoji">${categoryIcon(key)}</span> ${escapeHTML(key)}</span><strong>${escapeHTML(text)}</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
      </div>
    `;
  }).join('');

  renderWeeklyMinimum();
  renderRecentDays();
  updateClockUI();
}

function getWeekCurrentXpParts() {
  const weekId = state.currentWeek?.weekId || getWeekStart(todayMoscowISO());
  const confirmed = getClosedDaysInWeek(weekId).reduce((sum, day) => sum + Number(day.netXp || 0), 0);
  const pendingDaily = state.currentDay?.date >= weekId && state.currentDay?.date <= getWeekEnd(weekId) ? calculateDailyFromDraft(state.currentDay).netXp : 0;
  const pendingWeekly = calculateWeeklyFromDraft(state.currentWeek).totalXp;
  return { confirmed, pending: pendingDaily + pendingWeekly };
}

function renderWeeklyMinimum() {
  const weekId = state.currentWeek?.weekId || getWeekStart(todayMoscowISO());
  const days = getClosedDaysInWeek(weekId);
  const includeCurrent = state.currentDay?.date >= weekId && state.currentDay?.date <= getWeekEnd(weekId)
    ? [...days, finalizePreviewDay(state.currentDay)]
    : days;
  const reports = includeCurrent.length;
  const trainings = includeCurrent.filter((day) => day.completed?.includes('body_training')).length;
  const workLogs = includeCurrent.filter((day) => day.completed?.includes('work_log')).length;
  const projectSessions = includeCurrent.filter((day) => day.completed?.includes('creator_project30')).length;
  const instaControl = includeCurrent.filter((day) => !day.penalties?.includes('insta_slip')).length;

  const items = [
    { text: '3 тренировки', value: `${trainings}/3`, ok: trainings >= 3 },
    { text: '5 рабочих журналов', value: `${workLogs}/5`, ok: workLogs >= 5 },
    { text: '3 проектные сессии', value: `${projectSessions}/3`, ok: projectSessions >= 3 },
    { text: '7 активных дней', value: `${reports}/7`, ok: reports >= 7 },
    { text: 'инста под контролем', value: `${instaControl}/${reports || 7}`, ok: reports >= 1 && instaControl === reports }
  ];

  $('#weeklyMinimumList').innerHTML = items.map((item) => `
    <li><span><span class="row-icon" aria-hidden="true">${item.ok ? '✅' : '▫️'}</span>${escapeHTML(item.text)}</span><strong class="${item.ok ? 'ok' : 'bad'}">${escapeHTML(item.value)}</strong></li>
  `).join('');
}

function finalizePreviewDay(draft) {
  const calc = calculateDailyFromDraft(draft);
  return {
    id: draft.date,
    date: draft.date,
    metrics: { date: draft.date, dayNumber: draft.dayNumber, ...(draft.metrics || {}) },
    notes: { ...(draft.notes || {}) },
    completed: calc.completed,
    penalties: calc.penalties,
    netXp: calc.netXp,
    rank: calc.rank
  };
}

function isEmptyDayDraft(draft) {
  if (!draft) return true;
  const hasCompleted = Boolean(draft.completed?.length || draft.penalties?.length);
  const hasMetrics = Object.values(draft.metrics || {}).some((value) => value !== '' && value !== null && value !== undefined);
  const hasNotes = Object.values(draft.notes || {}).some((value) => String(value || '').trim());
  return !hasCompleted && !hasMetrics && !hasNotes;
}

function getVisibleHistoryDays() {
  const days = [...state.days];
  if (!isEmptyDayDraft(state.currentDay)) days.unshift(finalizePreviewDay(state.currentDay));
  return days.sort((a, b) => (b.metrics?.date || b.id || '').localeCompare(a.metrics?.date || a.id || ''));
}

function renderRecentDays() {
  const recent = getVisibleHistoryDays().slice(0, 5);
  $('#recentDays').innerHTML = recent.length ? recent.map(dayHistoryItem).join('') : '<p class="muted">Пока пусто. Отмечай текущий день.</p>';
}

function dayHistoryItem(day) {
  const isCurrent = day.id === state.currentDay?.date;
  const notes = [day.notes?.creatorProject, day.notes?.creatorDone, day.notes?.workDone].filter(Boolean).slice(0, 2).join(' • ');
  return `
    <article class="history-item">
      <div class="history-item-top">
        <div>
          <div class="history-title">${formatDate(day.metrics?.date || day.date || day.id)} — ${escapeHTML(day.rank)}${isCurrent ? ' • live' : ''}</div>
          <div class="history-meta">${day.netXp} XP${day.positiveXp !== undefined ? ` • плюс ${day.positiveXp} • штраф ${day.penaltyXp}` : ''}</div>
        </div>
        <div class="history-actions">
          ${isCurrent ? '<button class="mini-btn" type="button" data-tab-go="daily">Открыть</button>' : ''}
          <button class="mini-btn" type="button" data-delete-day="${escapeHTML(day.id)}">Удалить</button>
        </div>
      </div>
      ${notes ? `<div class="history-meta">${escapeHTML(notes)}</div>` : ''}
    </article>
  `;
}

function weekHistoryItem(week) {
  return `
    <article class="history-item">
      <div class="history-item-top">
        <div>
          <div class="history-title">Неделя ${escapeHTML(week.metrics?.weekNumber || week.weekNumber || week.id)} — ${week.result === 'passed' ? 'закрыта' : 'не закрыта'}</div>
          <div class="history-meta">${week.totalXp} week XP • ${week.dailyXp || 0} day XP • ${formatDate(week.metrics?.startDate || week.startDate)} — ${formatDate(week.metrics?.endDate || week.endDate)}</div>
        </div>
        <div class="history-actions">
          <button class="mini-btn" type="button" data-delete-week="${escapeHTML(week.id)}">Удалить</button>
        </div>
      </div>
      ${week.notes?.weekSummary ? `<div class="history-meta">${escapeHTML(week.notes.weekSummary)}</div>` : ''}
    </article>
  `;
}

function renderHistory() {
  const days = getVisibleHistoryDays();
  const weeks = [...state.weeks].sort((a, b) => (b.weekId || b.id || '').localeCompare(a.weekId || a.id || ''));
  $('#historyDays').innerHTML = days.length ? days.map(dayHistoryItem).join('') : '<p class="muted">Дней пока нет.</p>';
  $('#historyWeeks').innerHTML = weeks.length ? weeks.map(weekHistoryItem).join('') : '<p class="muted">Недель пока нет. Первая закроется в ночь с воскресенья на понедельник.</p>';
}

function renderSettings() {
  const info = $('#questImportInfo');
  if (info) info.textContent = `Категорий: ${getDailyQuests().length}. Максимум 10 квестов на категорию.`;
}

function buildChatPrompt() {
  const totals = getTotals();
  return `PRIME RPG — состояние

Сезон: ${state.profile.seasonName || 'Москва / Сушка / Работа'}
Дата МСК: ${formatDate(state.currentDay.date)}
День №${state.currentDay.dayNumber}
Неделя №${getSeasonWeekNumber(state.currentWeek.weekId)}
Total XP: ${totals.confirmedTotalXp}+${totals.pendingXp}
Status: ${getStatusRank(totals.confirmedTotalXp)}

Разбери мой PRIME RPG прогресс:
1. Коротко оцени текущий день.
2. Назови XP и ранг дня.
3. Назови просадку.
4. Дай 3 действия на завтра.
5. Не лей мотивационную воду.

Стиль: коротко, жёстко, по делу.`;
}

function saveSettings(event) {
  event?.preventDefault?.();
}

function switchTab(tabId) {
  $$('.tab-btn').forEach((button) => button.classList.toggle('active', button.dataset.tab === tabId));
  $$('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === tabId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exportData() {
  autosaveCurrentDay();
  autosaveCurrentWeek();
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `prime-rpg-backup-${todayMoscowISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('JSON экспортирован');
}


function applyQuestPack(payload) {
  const pack = normalizeQuestPack(payload);
  const current = cloneQuestConfig(getDailyQuests());

  pack.categories.filter((incoming) => !isDisabledCategory(incoming)).forEach((incoming) => {
    let category = current.find((item) => item.key === incoming.key || item.title?.toUpperCase() === incoming.title.toUpperCase());
    if (!category) {
      category = { key: incoming.key, title: incoming.title, stat: incoming.stat, maxXp: 0, items: [] };
      current.push(category);
    }

    if (pack.mode === 'replace') category.items = [];

    const byId = new Map((category.items || []).map((item) => [item.id, item]));
    incoming.items.forEach((item) => {
      if (byId.has(item.id)) byId.set(item.id, item);
      else if (byId.size < 10) byId.set(item.id, item);
    });

    category.items = [...byId.values()].slice(0, 10);
    category.stat = normalizeStat(incoming.stat || category.stat, 'DISCIPLINE');
    category.title = String(incoming.title || category.title || incoming.key).toUpperCase();
    const sum = category.items.reduce((total, item) => total + Number(item.xp || 0), 0);
    category.maxXp = Math.max(0, Number(incoming.maxXp || sum));
  });

  state.config = { ...(state.config || {}), dailyQuests: current.filter((category) => Array.isArray(category.items) && category.items.length) };
  state.currentDay.completed = (state.currentDay.completed || []).filter((id) => getDailyQuests().some((category) => category.items.some((item) => item.id === id)));
  saveState();
  renderDailyQuests();
  fillDailyForm();
  renderAll();
  showToast(`Квесты импортированы: ${pack.categories.length} категорий`);
}

function importQuestPack(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result));
      applyQuestPack(payload);
    } catch (error) {
      console.error(error);
      showToast(`Ошибка импорта квестов: ${error.message || 'bad JSON'}`);
    }
  };
  reader.readAsText(file);
}

function downloadQuestTemplate() {
  const template = {
    type: 'prime-rpg-quest-pack',
    mode: 'merge',
    dailyQuests: [
      {
        category: 'BODY',
        title: 'BODY',
        stat: 'BODY',
        items: [
          { text: 'пример нового BODY-квеста', xp: 10, stat: 'BODY' }
        ]
      },
      {
        category: 'CREATOR',
        title: 'CREATOR',
        stat: 'CREATOR',
        items: [
          { text: 'пример нового CREATOR-квеста', xp: 10, stat: 'CREATOR' }
        ]
      }
    ]
  };
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'prime-rpg-quest-pack-template.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Шаблон quest pack скачан');
}

function resetQuestConfig() {
  const ok = window.confirm('Сбросить квесты к базовым? История останется.');
  if (!ok) return;
  state.config = { ...(state.config || {}), dailyQuests: filterActiveDailyQuests(DEFAULT_DAILY_QUESTS) };
  state.currentDay.completed = [];
  saveState();
  renderDailyQuests();
  fillDailyForm();
  renderAll();
  showToast('Квесты сброшены к базовым');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result));
      if (!imported || typeof imported !== 'object') throw new Error('bad file');
      if (imported.type === 'prime-rpg-quest-pack' || imported.dailyQuests || imported.quests) {
        applyQuestPack(imported);
        return;
      }
      state = migrateState(imported);
      saveState();
      syncClock(false);
      fillDailyForm();
      fillWeeklyForm();
      renderAll();
      showToast('Данные импортированы');
    } catch (error) {
      console.error(error);
      showToast('Файл не похож на backup PRIME RPG');
    }
  };
  reader.readAsText(file);
}

function copyText(text, successMessage) {
  navigator.clipboard.writeText(text).then(() => showToast(successMessage)).catch(() => showToast('Не удалось скопировать'));
}

function buildHistorySummary() {
  const days = getVisibleHistoryDays()
    .slice(0, 7)
    .reverse();
  const totals = getTotals();
  const lines = [
    'PRIME RPG — сводка',
    `Дата МСК: ${formatDate(state.currentDay.date)}`,
    `Total XP: ${totals.confirmedTotalXp}+${totals.pendingXp}`,
    `Status: ${getStatusRank(totals.confirmedTotalXp)}`, 
    `Current week: ${formatDate(state.currentWeek.startDate)} — ${formatDate(state.currentWeek.endDate)}`,
    '',
    'Последние дни:'
  ];
  days.forEach((day) => lines.push(`${formatDate(day.metrics?.date)} — ${day.netXp} XP — ${day.rank}`));
  if (state.weeks.length) {
    lines.push('', 'Закрытые недели:');
    state.weeks.slice(-3).forEach((week) => lines.push(`Неделя ${week.metrics?.weekNumber || week.weekNumber}: ${week.dailyXp || 0} daily XP + ${week.totalXp} week XP — ${week.result}`));
  }
  return lines.join('\n');
}

function deleteDay(id) {
  const targetId = String(id || '');
  const isCurrent = targetId === state.currentDay?.date || targetId === state.currentDay?.id;
  const ok = window.confirm(isCurrent ? 'Удалить текущий live-день? Галочки будут очищены.' : 'Удалить этот день из истории?');
  if (!ok) return;

  state.days = state.days.filter((day) => day.id !== targetId && day.metrics?.date !== targetId);
  if (isCurrent) {
    state.currentDay = createDayDraft(state.system.currentDate, state.system.dayCounter);
    fillDailyForm();
  }
  saveState();
  renderAll();
  showToast(isCurrent ? 'Текущий день очищен' : 'День удалён');
}

function deleteWeek(id) {
  state.weeks = state.weeks.filter((week) => week.id !== id && week.weekId !== id);
  saveState();
  renderAll();
  showToast('Неделя удалена');
}

function handleHistoryClick(event) {
  const tabGo = event.target.closest('[data-tab-go]');
  const deleteDayButton = event.target.closest('[data-delete-day]');
  const deleteWeekButton = event.target.closest('[data-delete-week]');
  if (tabGo) switchTab(tabGo.dataset.tabGo);
  if (deleteDayButton) deleteDay(deleteDayButton.dataset.deleteDay);
  if (deleteWeekButton) deleteWeek(deleteWeekButton.dataset.deleteWeek);
}

function resetCurrentDay() {
  const ok = window.confirm('Очистить только текущий день? Закрытые дни не трогаются.');
  if (!ok) return;
  state.currentDay = createDayDraft(state.system.currentDate, state.system.dayCounter);
  saveState();
  fillDailyForm();
  renderAll();
  showToast('Текущий день очищен');
}

function resetCurrentWeek() {
  const ok = window.confirm('Очистить только текущую неделю? Закрытые недели не трогаются.');
  if (!ok) return;
  state.currentWeek = createWeekDraft(state.system.currentWeekId);
  saveState();
  fillWeeklyForm();
  renderAll();
  showToast('Текущая неделя очищена');
}

function renderAll() {
  renderDashboard();
  renderHistory();
  renderSettings();
  updateDailyPreview();
  updateWeeklyPreview();
  updateClockUI();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register(`./sw.js?v=${APP_CACHE_QUERY}`)
    .then((reg) => {
      reg.update();
      if (reg.waiting && navigator.serviceWorker.controller) notifyApp('Доступна новая версия PRIME RPG', { banner: true });
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            notifyApp('Доступна новая версия PRIME RPG', { banner: true });
          }
        });
      });
    })
    .catch((error) => console.warn('SW registration failed', error));

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    notifyApp('Версия обновлена');
  });
}

function bindEvents() {
  $$('.tab-btn').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  const dailyForm = $('#dailyForm');
  if (dailyForm) {
    dailyForm.addEventListener('input', autosaveCurrentDay);
    dailyForm.addEventListener('change', autosaveCurrentDay);
    dailyForm.addEventListener('submit', (event) => {
      event.preventDefault();
      autosaveCurrentDay();
      showToast('Текущий день сохранён');
    });
  }
  const weeklyForm = $('#weeklyForm');
  if (weeklyForm) {
    weeklyForm.addEventListener('input', autosaveCurrentWeek);
    weeklyForm.addEventListener('change', autosaveCurrentWeek);
    weeklyForm.addEventListener('submit', (event) => {
      event.preventDefault();
      autosaveCurrentWeek();
      showToast('Текущая неделя зафиксирована');
    });
  }
  if ($('#settingsForm')) $('#settingsForm').addEventListener('submit', saveSettings);
  if ($('#syncClockBtn')) $('#syncClockBtn').addEventListener('click', () => syncClock(true));
  if ($('#forceUpdateBtn')) $('#forceUpdateBtn').addEventListener('click', refreshAppVersion);
  if ($('#updateNowBtn')) $('#updateNowBtn').addEventListener('click', refreshAppVersion);
  if ($('#dismissUpdateBtn')) $('#dismissUpdateBtn').addEventListener('click', () => { const banner = $('#updateBanner'); if (banner) banner.hidden = true; });
  if ($('#enableNotificationsBtn')) $('#enableNotificationsBtn').addEventListener('click', requestNotifications);
  if ($('#clearDailyBtn')) $('#clearDailyBtn').addEventListener('click', resetCurrentDay);
  if ($('#clearWeeklyBtn')) $('#clearWeeklyBtn').addEventListener('click', resetCurrentWeek);
  if ($('#exportBtn')) $('#exportBtn').addEventListener('click', exportData);
  if ($('#importFile')) $('#importFile').addEventListener('change', (event) => importData(event.target.files[0]));
  if ($('#questImportFile')) $('#questImportFile').addEventListener('change', (event) => importQuestPack(event.target.files[0]));
  if ($('#downloadQuestTemplateBtn')) $('#downloadQuestTemplateBtn').addEventListener('click', downloadQuestTemplate);
  if ($('#resetQuestConfigBtn')) $('#resetQuestConfigBtn').addEventListener('click', resetQuestConfig);
  if ($('#copyPromptBtn') && $('#chatPrompt')) $('#copyPromptBtn').addEventListener('click', () => copyText($('#chatPrompt').textContent, 'Промпт скопирован'));
  $('#copySummaryBtn').addEventListener('click', () => copyText(buildHistorySummary(), 'Сводка скопирована'));
  $('#history').addEventListener('click', handleHistoryClick);
  $('#dashboard').addEventListener('click', handleHistoryClick);
  $('#resetBtn').addEventListener('click', () => {
    const ok = window.confirm('Стереть все дни, недели и настройки PRIME RPG?');
    if (!ok) return;
    Object.keys(localStorage).filter((key) => key.startsWith('prime-rpg')).forEach((key) => localStorage.removeItem(key));
    if ('caches' in window) caches.keys().then((keys) => keys.filter((key) => key.startsWith('prime-rpg')).forEach((key) => caches.delete(key))).catch(() => {});
    state = defaultState();
    state.days = [];
    state.weeks = [];
    state.currentDay = createDayDraft(state.system.currentDate, 1);
    state.currentWeek = createWeekDraft(state.system.currentWeekId, state.profile.startDate);
    saveState();
    renderDailyQuests();
    fillDailyForm();
    fillWeeklyForm();
    renderAll();
    showToast('Всё сброшено: история очищена');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) forceSaveNow();
    else syncClock(false);
  });
  window.addEventListener('pagehide', forceSaveNow);
  window.addEventListener('beforeunload', forceSaveNow);
  window.addEventListener('focus', () => syncClock(false));
}

function init() {
  try {
    if (!state) state = loadState();
    renderDailyQuests();
    renderWeeklyBosses();
    bindEvents();
    syncClock(false);
    fillDailyForm();
    fillWeeklyForm();
    renderAll();
    registerServiceWorker();
    window.setInterval(() => syncClock(false), ROLLOVER_CHECK_MS);
    window.setInterval(updateClockUI, 1000);
  } catch (error) {
    console.error('PRIME RPG boot failed', error);
    showBootError(error);
  }
}

init();
