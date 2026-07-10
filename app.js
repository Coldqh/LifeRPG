'use strict';

const STORAGE_KEY = 'prime-rpg-state-v18';
const STORAGE_KEY_BACKUP = 'prime-rpg-state-backup-v18';
const LEGACY_STORAGE_KEY_V17 = 'prime-rpg-state-v16';
const LEGACY_STORAGE_KEY_BACKUP_V17 = 'prime-rpg-state-backup-v16';
const LEGACY_STORAGE_KEY_V15 = 'prime-rpg-state-v15';
const LEGACY_STORAGE_KEY_BACKUP_V15 = 'prime-rpg-state-backup-v15';
const LEGACY_STORAGE_KEY_V14 = 'prime-rpg-state-v14';
const LEGACY_STORAGE_KEY_BACKUP_V14 = 'prime-rpg-state-backup-v14';
const LEGACY_STORAGE_KEY_V10 = 'prime-rpg-state-v10';
const LEGACY_STORAGE_KEY_V8 = 'prime-rpg-state-v8';
const LEGACY_STORAGE_KEY_V7 = 'prime-rpg-state-v7';
const LEGACY_STORAGE_KEY_V5 = 'prime-rpg-state-v5';
const LEGACY_STORAGE_KEY_V3 = 'prime-rpg-state-v3';
const LEGACY_STORAGE_KEY = 'prime-rpg-state-v2';
const LEGACY_STORAGE_KEY_V1 = 'prime-rpg-state-v1';
const APP_VERSION = 'v2.1';
const APP_CACHE_QUERY = '2.1.0';
const MOSCOW_TZ = 'Europe/Moscow';
const ROLLOVER_CHECK_MS = 30 * 1000;
const AUTO_BACKUP_PREFIX = 'prime-rpg-auto-backup-';
const RECOVERY_BACKUP_PREFIX = 'prime-rpg-recovery-backup-';
const MAX_AUTO_BACKUPS = 7;
const MAX_RECOVERY_BACKUPS = 5;
let saveStatusTimer = null;

const STAT_KEYS = ['BODY', 'FIGHTER', 'MIND', 'WORK', 'CREATOR', 'CALM', 'DISCIPLINE'];
const LEVELS = [0, 1000, 2200, 3600, 5200, 7000, 9000, 11500, 14500, 18000, 22000, 27000, 33000, 40000];

const DEFAULT_DAILY_QUESTS = [
  {
    key: 'body', title: 'BODY', stat: 'BODY', maxXp: 30,
    items: [
      { id: 'body_move', text: 'движение 10+ минут', xp: 15, stat: 'BODY' },
      { id: 'body_water', text: 'вода / базовая забота о теле', xp: 5, stat: 'BODY' },
      { id: 'body_food_basic', text: 'один нормальный приём еды', xp: 10, stat: 'BODY' }
    ]
  },
  {
    key: 'work', title: 'WORK', stat: 'WORK', maxXp: 30,
    items: [
      { id: 'work_main', text: 'главная обязанность дня выполнена', xp: 20, stat: 'WORK' },
      { id: 'work_plan', text: 'записал 1 задачу / следующий шаг', xp: 5, stat: 'WORK' },
      { id: 'work_note', text: 'записал 1 вывод дня', xp: 5, stat: 'MIND' }
    ]
  },
  {
    key: 'creator', title: 'CREATOR', stat: 'CREATOR', maxXp: 25,
    items: [
      { id: 'creator_15', text: '15+ минут проекта / творчества', xp: 15, stat: 'CREATOR' },
      { id: 'creator_note', text: 'сохранил идею / результат', xp: 10, stat: 'CREATOR' }
    ]
  },
  {
    key: 'calm', title: 'CALM', stat: 'CALM', maxXp: 25,
    items: [
      { id: 'calm_check', text: 'отметил состояние дня', xp: 5, stat: 'CALM' },
      { id: 'calm_pause', text: '5 минут без шума / пауза', xp: 10, stat: 'CALM' },
      { id: 'calm_sleep', text: 'сон зафиксирован', xp: 10, stat: 'CALM' }
    ]
  },
  {
    key: 'mind', title: 'MIND', stat: 'MIND', maxXp: 15,
    items: [
      { id: 'mind_10', text: '10+ минут чтения / обучения', xp: 15, stat: 'MIND' }
    ]
  },
  {
    key: 'discipline', title: 'DISCIPLINE', stat: 'DISCIPLINE', maxXp: 15,
    items: [
      { id: 'discipline_no_scroll', text: 'без тупого залипания 30+ минут', xp: 15, stat: 'DISCIPLINE' }
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
    key: 'bodyWeek', title: 'BODY', stat: 'BODY', maxXp: 100,
    items: [
      { id: 'body_week_3_move', text: '3 дня с движением', xp: 50 },
      { id: 'body_week_5_food', text: '5 дней базовой заботы о теле', xp: 50 }
    ]
  },
  {
    key: 'workWeek', title: 'WORK', stat: 'WORK', maxXp: 100,
    items: [
      { id: 'work_week_5_main', text: '5 главных обязанностей закрыты', xp: 60 },
      { id: 'work_week_3_notes', text: '3 рабочих вывода записаны', xp: 40 }
    ]
  },
  {
    key: 'creatorWeek', title: 'CREATOR', stat: 'CREATOR', maxXp: 100,
    items: [
      { id: 'creator_week_3_sessions', text: '3 проектные сессии', xp: 60 },
      { id: 'creator_week_result', text: '1 видимый результат недели', xp: 40 }
    ]
  },
  {
    key: 'calmWeek', title: 'CALM', stat: 'CALM', maxXp: 100,
    items: [
      { id: 'calm_week_5_check', text: '5 дней отмечено состояние', xp: 50 },
      { id: 'calm_week_3_pause', text: '3 дня с паузой без шума', xp: 50 }
    ]
  }
];


function cloneWeeklyQuestConfig(quests) {
  return JSON.parse(JSON.stringify(Array.isArray(quests) ? quests : []));
}

function filterActiveWeeklyQuests(quests) {
  return cloneWeeklyQuestConfig(quests).filter((quest) => !isDisabledCategory(quest));
}

function getWeeklyQuests() {
  const quests = state?.config?.weeklyQuests;
  const active = filterActiveWeeklyQuests(Array.isArray(quests) && quests.length ? quests : WEEKLY_BOSSES);
  return active.length ? active : filterActiveWeeklyQuests(WEEKLY_BOSSES);
}

const DAILY_CHALLENGES = [
  { id: 'hard_steps_20k', title: '20K March', text: '20 000+ шагов за день', xp: 80, stat: 'BODY', icon: '👟' },
  { id: 'hard_steps_25k', title: '25K March', text: '25 000+ шагов за день', xp: 120, stat: 'BODY', icon: '🥾' },
  { id: 'hard_morning_run_25', title: 'Morning Run', text: 'пробежка утром 25+ минут', xp: 90, stat: 'BODY', icon: '🏃' },
  { id: 'hard_roadwork_40', title: 'Roadwork Day', text: '40+ минут лёгкого бега / ходьбы в темпе', xp: 100, stat: 'BODY', icon: '🛣️' },
  { id: 'hard_double_training', title: 'Double Training', text: '2 разные физические активности за день', xp: 120, stat: 'BODY', icon: '⚡' },
  { id: 'hard_mobility_40', title: 'Mobility Lock', text: '40 минут мобилити / растяжки / суставки', xp: 70, stat: 'BODY', icon: '🧘' },
  { id: 'hard_no_sugar_24', title: 'No Sugar Hard Mode', text: '24 часа без сладкого, фастфуда и перекусов-мусора', xp: 90, stat: 'DISCIPLINE', icon: '🚫' },
  { id: 'hard_read_120', title: 'Read 120', text: '2 часа книги без телефона рядом', xp: 140, stat: 'MIND', icon: '📚' },
  { id: 'hard_full_apartment_reset', title: 'Full Apartment Reset', text: 'генеральная уборка всей квартиры', xp: 150, stat: 'DISCIPLINE', icon: '🧹' },
  { id: 'hard_zero_excuses_morning', title: 'Zero Excuses Morning', text: 'в первые 2 часа закрыть BODY или CREATOR', xp: 100, stat: 'DISCIPLINE', icon: '🌅' }
];

const ACHIEVEMENTS = [
  { id: 'first_step', icon: '👣', title: 'First Step', text: 'закрыть первый день', target: 1, calc: (ctx) => ctx.days.length },
  { id: 'first_100', icon: '⚡', title: 'First 100', text: 'набрать 100 подтверждённого XP', target: 100, calc: (ctx) => ctx.confirmedXp },
  { id: 'solid_day', icon: '✅', title: 'Solid Day', text: 'получить Solid Day или выше', target: 1, calc: (ctx) => ctx.days.some((d) => Number(d.netXp || 0) >= 101) ? 1 : 0 },
  { id: 'prime_day', icon: '🔷', title: 'Prime Day', text: 'получить Prime Day или выше', target: 1, calc: (ctx) => ctx.days.some((d) => Number(d.netXp || 0) >= 151) ? 1 : 0 },
  { id: 'elite_day', icon: '🏆', title: 'Elite Day', text: 'получить Elite Day или выше', target: 1, calc: (ctx) => ctx.days.some((d) => Number(d.netXp || 0) >= 201) ? 1 : 0 },
  { id: 'streak_3', icon: '🔥', title: '3-Day Streak', text: '3 активных дня подряд', target: 3, calc: (ctx) => getBestActiveStreak(ctx.days) },
  { id: 'streak_7', icon: '🧱', title: '7-Day Streak', text: '7 активных дней подряд', target: 7, calc: (ctx) => getBestActiveStreak(ctx.days) },
  { id: 'no_zero_week', icon: '📅', title: 'No Zero Week', text: '7 дней недели с XP выше 0', target: 1, calc: (ctx) => hasNoZeroWeek(ctx.days) ? 1 : 0 },
  { id: 'body_starter', icon: '💪', title: 'Body Starter', text: '10 BODY-действий', target: 10, calc: (ctx) => countCompletedByPrefix(ctx.days, ['body_']) },
  { id: 'work_mode', icon: '💼', title: 'Work Mode', text: '10 WORK-действий', target: 10, calc: (ctx) => countCompletedByPrefix(ctx.days, ['work_']) },
  { id: 'creator_spark', icon: '🛠️', title: 'Creator Spark', text: '7 CREATOR-действий', target: 7, calc: (ctx) => countCompletedByPrefix(ctx.days, ['creator_']) },
  { id: 'calm_base', icon: '🧘', title: 'Calm Base', text: '10 CALM-действий', target: 10, calc: (ctx) => countCompletedByPrefix(ctx.days, ['calm_']) },
  { id: 'mind_online', icon: '📚', title: 'Mind Online', text: '5 MIND-действий', target: 5, calc: (ctx) => countCompletedByPrefix(ctx.days, ['mind_']) },
  { id: 'discipline_core', icon: '⚡', title: 'Discipline Core', text: '7 DISCIPLINE-действий', target: 7, calc: (ctx) => countCompletedByPrefix(ctx.days, ['discipline_']) },
  { id: 'challenge_1', icon: '🎲', title: 'Challenge Accepted', text: 'закрыть первый челлендж', target: 1, calc: (ctx) => ctx.challengeWins },
  { id: 'challenge_5', icon: '🎯', title: 'Challenge Hunter', text: 'закрыть 5 челленджей', target: 5, calc: (ctx) => ctx.challengeWins },
  { id: 'week_1', icon: '📆', title: 'Weekly Starter', text: 'закрыть первую неделю', target: 1, calc: (ctx) => ctx.weeks.length },
  { id: 'prime_week', icon: '💎', title: 'Prime Week', text: '1000+ XP за неделю', target: 1, calc: (ctx) => ctx.weeks.some((w) => Number(w.dailyXp || 0) + Number(w.totalXp || 0) >= 1000) ? 1 : 0 },
  { id: 'recovery', icon: '🩹', title: 'Recovery', text: 'после Broken Day сделать Solid Day', target: 1, calc: (ctx) => hasRecoveryDay(ctx.days) ? 1 : 0 },
  { id: 'level_5', icon: '🚀', title: 'Level 5', text: 'достичь 5 уровня', target: 5, calc: (ctx) => getLevel(ctx.confirmedXp).level }
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


function normalizeQuestItem(item, categoryKey, fallbackStat = 'DISCIPLINE', maxItemXp = 200) {
  if (!item || typeof item !== 'object') return null;
  const text = String(item.text || item.title || item.name || '').trim();
  if (!text) return null;
  const xp = Math.max(1, Math.min(maxItemXp, Number(item.xp || item.XP || 10)));
  const id = safeId(item.id || `${categoryKey}_${text}`);
  return { id, text, xp, stat: normalizeStat(item.stat || item.category || fallbackStat, fallbackStat) };
}

function normalizeQuestCategory(entry, maxItemXp = 200) {
  if (!entry || typeof entry !== 'object') return null;
  const rawTitle = String(entry.category || entry.title || entry.name || 'CUSTOM').trim();
  const key = normalizeCategoryKey(rawTitle);
  const stat = normalizeStat(entry.stat || rawTitle, 'DISCIPLINE');
  const rawItems = Array.isArray(entry.items) ? entry.items : Array.isArray(entry.quests) ? entry.quests : [];
  const items = rawItems.map((item) => normalizeQuestItem(item, key, stat, maxItemXp)).filter(Boolean);
  if (!items.length && !rawItems.length) {
    const single = normalizeQuestItem(entry, key, stat, maxItemXp);
    if (single) items.push(single);
  }
  const seen = new Set();
  const limited = [];
  items.forEach((item) => {
    if (seen.has(item.id) || limited.length >= 10) return;
    seen.add(item.id);
    limited.push(item);
  });
  if (!limited.length) return null;
  const sum = limited.reduce((total, item) => total + Number(item.xp || 0), 0);
  const maxXpRaw = Number(entry.maxXp || entry.maxXP || 0);
  const maxXp = maxXpRaw > 0 ? Math.min(maxXpRaw, sum) : sum;
  return {
    key,
    title: String(entry.title || entry.category || key).trim().toUpperCase(),
    stat,
    maxXp,
    items: limited
  };
}

function normalizeQuestPackSection(source, maxItemXp) {
  if (!Array.isArray(source)) return [];
  const groups = new Map();
  source.forEach((entry) => {
    const category = normalizeQuestCategory(entry, maxItemXp);
    if (!category) return;
    if (!groups.has(category.key)) {
      groups.set(category.key, { ...category, items: [] });
    }
    const group = groups.get(category.key);
    group.title = category.title || group.title;
    group.stat = category.stat || group.stat;
    group.maxXp = Math.max(Number(group.maxXp || 0), Number(category.maxXp || 0));
    group.items.push(...category.items);
  });

  return [...groups.values()].map((group) => {
    const seen = new Set();
    const items = [];
    group.items.forEach((item) => {
      if (seen.has(item.id) || items.length >= 10) return;
      seen.add(item.id);
      items.push(item);
    });
    const sum = items.reduce((total, item) => total + Number(item.xp || 0), 0);
    return { ...group, maxXp: group.maxXp > 0 ? Math.min(group.maxXp, sum) : sum, items };
  }).filter((group) => group.items.length);
}

function normalizeQuestPack(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('quest pack должен быть JSON-объектом');
  const rawMode = String(payload.mode || 'merge').toLowerCase();
  const mode = ['merge', 'replace', 'replace_all'].includes(rawMode) ? rawMode : 'merge';
  const dailyModeRaw = String(payload.dailyMode || mode).toLowerCase();
  const weeklyModeRaw = String(payload.weeklyMode || mode).toLowerCase();
  const dailyMode = ['merge', 'replace', 'replace_all'].includes(dailyModeRaw) ? dailyModeRaw : mode;
  const weeklyMode = ['merge', 'replace', 'replace_all'].includes(weeklyModeRaw) ? weeklyModeRaw : mode;

  const dailySource = Array.isArray(payload.dailyQuests) ? payload.dailyQuests : Array.isArray(payload.quests) ? payload.quests : [];
  const weeklySource = Array.isArray(payload.weeklyQuests) ? payload.weeklyQuests : Array.isArray(payload.weekQuests) ? payload.weekQuests : [];
  const dailyCategories = normalizeQuestPackSection(dailySource, 150).filter((category) => !isDisabledCategory(category));
  const weeklyCategories = normalizeQuestPackSection(weeklySource, 300).filter((category) => !isDisabledCategory(category));

  if (!dailyCategories.length && !weeklyCategories.length) throw new Error('в quest pack нет dailyQuests или weeklyQuests');
  return { mode, dailyMode, weeklyMode, dailyCategories, weeklyCategories };
}

function defaultState() {
  const today = todayMoscowISO();
  const weekId = getWeekStart(today);
  return {
    version: 21,
    profile: {
      playerName: '',
      seasonName: 'Москва / Сушка / Работа',
      seasonGoal: 'стабильный режим: тело, работа, проекты, спокойствие',
      startDate: today
    },
    config: {
      dailyQuests: filterActiveDailyQuests(DEFAULT_DAILY_QUESTS),
      weeklyQuests: filterActiveWeeklyQuests(WEEKLY_BOSSES)
    },
    ui: {
      activeTab: 'dashboard',
      hideCompleted: false,
      collapsedDaily: [],
      collapsedWeekly: []
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
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY_BACKUP) || localStorage.getItem(LEGACY_STORAGE_KEY_V17) || localStorage.getItem(LEGACY_STORAGE_KEY_BACKUP_V17) || localStorage.getItem(LEGACY_STORAGE_KEY_V15) || localStorage.getItem(LEGACY_STORAGE_KEY_BACKUP_V15) || localStorage.getItem(LEGACY_STORAGE_KEY_V14) || localStorage.getItem(LEGACY_STORAGE_KEY_BACKUP_V14) || localStorage.getItem(LEGACY_STORAGE_KEY_V10) || localStorage.getItem(LEGACY_STORAGE_KEY_V8) || localStorage.getItem(LEGACY_STORAGE_KEY_V7) || localStorage.getItem(LEGACY_STORAGE_KEY_V5) || localStorage.getItem(LEGACY_STORAGE_KEY_V3) || localStorage.getItem(LEGACY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY_V1);
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
    version: 21,
    profile: { ...base.profile, ...(parsed.profile || {}) },
    config: { ...base.config, ...(parsed.config || {}) },
    ui: { ...base.ui, ...(parsed.ui || {}) },
    system: { ...base.system, ...(parsed.system || {}) },
    days: Array.isArray(parsed.days) ? parsed.days : [],
    weeks: Array.isArray(parsed.weeks) ? parsed.weeks : []
  };

  stateLike.config.dailyQuests = filterActiveDailyQuests(stateLike.config.dailyQuests || DEFAULT_DAILY_QUESTS);
  stateLike.config.weeklyQuests = filterActiveWeeklyQuests(stateLike.config.weeklyQuests || WEEKLY_BOSSES);
  if (!stateLike.currentDay) {
    const today = todayMoscowISO();
    const oldToday = stateLike.days.find((day) => day.id === today || day.metrics?.date === today);
    stateLike.currentDay = oldToday ? dayToDraft(oldToday) : createDayDraft(today, getNextDayNumberFromDays(stateLike.days));
    stateLike.days = stateLike.days.filter((day) => (day.id !== today && day.metrics?.date !== today));
  }
  if (!stateLike.currentWeek) stateLike.currentWeek = createWeekDraft(getWeekStart(todayMoscowISO()));
  const activeDailyIds = new Set((stateLike.config.dailyQuests || []).flatMap((quest) => (quest.items || []).map((item) => item.id)));
  const activeWeeklyIds = new Set((stateLike.config.weeklyQuests || []).flatMap((week) => (week.items || []).map((item) => item.id)));
  stateLike.currentDay.completed = (stateLike.currentDay.completed || []).filter((id) => activeDailyIds.has(id));
  stateLike.currentWeek.completed = (stateLike.currentWeek.completed || []).filter((id) => activeWeeklyIds.has(id));
  stateLike.system.currentDate = stateLike.currentDay.date || todayMoscowISO();
  stateLike.system.currentWeekId = stateLike.currentWeek.weekId || getWeekStart(todayMoscowISO());
  stateLike.system.dayCounter = Math.max(
    Number(stateLike.system.dayCounter || 1),
    getNextDayNumberFromDays(stateLike.days),
    Number(stateLike.currentDay.dayNumber || 1)
  );
  stateLike.ui.activeTab = document.getElementById(stateLike.ui.activeTab) ? stateLike.ui.activeTab : 'dashboard';
  stateLike.ui.hideCompleted = Boolean(stateLike.ui.hideCompleted);
  stateLike.ui.collapsedDaily = Array.isArray(stateLike.ui.collapsedDaily) ? stateLike.ui.collapsedDaily : [];
  stateLike.ui.collapsedWeekly = Array.isArray(stateLike.ui.collapsedWeekly) ? stateLike.ui.collapsedWeekly : [];
  return stateLike;
}

function setSaveStatus(status, detail = '') {
  const node = $('#saveStatusValue');
  if (!node) return;
  node.classList.remove('is-saving', 'is-saved', 'is-error');
  if (status === 'saving') {
    node.classList.add('is-saving');
    node.textContent = 'Сохранение…';
    return;
  }
  if (status === 'error') {
    node.classList.add('is-error');
    node.textContent = detail || 'Ошибка сохранения';
    return;
  }
  node.classList.add('is-saved');
  const parts = getMoscowParts();
  node.textContent = `Сохранено ${parts.hour}:${parts.minute}`;
}

function snapshotEnvelope(reason, sourceState = state) {
  return {
    type: 'prime-rpg-auto-snapshot',
    version: 1,
    reason,
    createdAt: new Date().toISOString(),
    moscowStamp: nowMoscowStamp(),
    state: sourceState
  };
}

function trimSnapshotKeys(prefix, limit) {
  const keys = Object.keys(localStorage)
    .filter((key) => key.startsWith(prefix))
    .sort()
    .reverse();
  keys.slice(limit).forEach((key) => localStorage.removeItem(key));
}

function writeDailySnapshot() {
  if (!state) return;
  const key = `${AUTO_BACKUP_PREFIX}${todayMoscowISO()}`;
  localStorage.setItem(key, JSON.stringify(snapshotEnvelope('daily-auto')));
  trimSnapshotKeys(AUTO_BACKUP_PREFIX, MAX_AUTO_BACKUPS);
}

function createRecoverySnapshot(reason = 'manual') {
  if (!state) return null;
  try {
    const key = `${RECOVERY_BACKUP_PREFIX}${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(snapshotEnvelope(reason)));
    trimSnapshotKeys(RECOVERY_BACKUP_PREFIX, MAX_RECOVERY_BACKUPS);
    return key;
  } catch (error) {
    console.warn('Recovery snapshot failed', error);
    return null;
  }
}

function getStoredSnapshots() {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith(AUTO_BACKUP_PREFIX) || key.startsWith(RECOVERY_BACKUP_PREFIX));
  return keys.map((key) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      const stamp = parsed?.moscowStamp || parsed?.createdAt || key.replace(AUTO_BACKUP_PREFIX, '').replace(RECOVERY_BACKUP_PREFIX, '');
      return { key, stamp, reason: parsed?.reason || 'backup', createdAt: parsed?.createdAt || '', payload: parsed };
    } catch (_) {
      return null;
    }
  }).filter(Boolean).sort((a, b) => String(b.createdAt || b.key).localeCompare(String(a.createdAt || a.key)));
}

function saveState(options = {}) {
  if (!state) return;
  const { quiet = false, snapshot = true } = options;
  if (!quiet) setSaveStatus('saving');
  state.version = 21;
  state.system.lastSyncAt = nowMoscowStamp();
  const payload = JSON.stringify(state);
  try {
    localStorage.setItem(STORAGE_KEY, payload);
    localStorage.setItem(STORAGE_KEY_BACKUP, payload);
    if (snapshot) {
      try { writeDailySnapshot(); } catch (snapshotError) { console.warn('Daily snapshot failed', snapshotError); }
    }
    window.clearTimeout(saveStatusTimer);
    saveStatusTimer = window.setTimeout(() => setSaveStatus('saved'), quiet ? 0 : 160);
  } catch (error) {
    console.error('PRIME RPG save failed', error);
    setSaveStatus('error');
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
    BODY: '💪',
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
  box.innerHTML = `<strong>PRIME RPG boot error</strong><span>${escapeHTML(message)}</span><small>JS упал при старте. Открой сайт с ?v=2.1.0 или очисти данные сайта.</small>`;
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
    challengeCompleted: false,
    challengeId: getDailyChallenge(date).id,
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
    challengeCompleted: Boolean(day.challenge?.completed || day.challengeCompleted),
    challengeId: day.challenge?.id || day.challengeId || getDailyChallenge(day.metrics?.date || day.date || day.id).id,
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

  const challenge = getChallengeResult(draft);
  if (challenge.completed) {
    questXp.challenge = challenge.xp;
    categoryXp[challenge.stat] = (categoryXp[challenge.stat] || 0) + challenge.xp;
  } else {
    questXp.challenge = 0;
  }

  const positiveXp = Object.values(questXp).reduce((sum, value) => sum + value, 0);
  const penaltyXp = PENALTIES.reduce((sum, item) => penaltySet.has(item.id) ? sum + item.xp : sum, 0);
  const netXp = positiveXp + penaltyXp;
  return {
    questXp,
    categoryXp,
    challenge,
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

  getWeeklyQuests().forEach((boss) => {
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


function getMonthStart(iso) {
  const [year, month] = String(iso).split('-');
  return `${year}-${month}-01`;
}

function getMonthEnd(iso) {
  const [year, month] = String(iso).split('-').map(Number);
  return toISODate(new Date(Date.UTC(year, month, 0)));
}

function getMonthDays(iso) {
  const start = getMonthStart(iso);
  const end = getMonthEnd(iso);
  const days = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

function getRankClass(rank) {
  const value = String(rank || '').toLowerCase();
  if (value.includes('legendary')) return 'legendary';
  if (value.includes('elite')) return 'elite';
  if (value.includes('prime')) return 'prime';
  if (value.includes('solid')) return 'solid';
  if (value.includes('survived')) return 'survived';
  if (value.includes('broken')) return 'broken';
  return 'empty';
}

function shortRank(rank) {
  const value = String(rank || '');
  if (value.includes('Legendary')) return 'L';
  if (value.includes('Elite')) return 'E';
  if (value.includes('Prime')) return 'P';
  if (value.includes('Solid')) return 'S';
  if (value.includes('Survived')) return 'V';
  if (value.includes('Broken')) return 'B';
  return '—';
}


function stableHash(value) {
  return String(value || '').split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function getDailyChallenge(date = state?.currentDay?.date || todayMoscowISO()) {
  const index = Math.abs(stableHash(date)) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}

function isChallengeCompleted(draft = state.currentDay) {
  return Boolean(draft?.challengeCompleted || draft?.challenge?.completed);
}

function getChallengeResult(draft = state.currentDay) {
  const challenge = getDailyChallenge(draft?.date || todayMoscowISO());
  const completed = isChallengeCompleted(draft);
  return { ...challenge, completed, xp: completed ? Number(challenge.xp || 0) : 0 };
}

function getAchievementContext() {
  const days = [...state.days].sort((a, b) => (a.metrics?.date || a.id || '').localeCompare(b.metrics?.date || b.id || ''));
  const confirmedXp = days.reduce((sum, day) => sum + Number(day.netXp || 0), 0) + state.weeks.reduce((sum, week) => sum + Number(week.totalXp || 0), 0);
  const challengeWins = days.filter((day) => day.challenge?.completed).length;
  return { days, weeks: state.weeks || [], confirmedXp, challengeWins };
}

function countCompletedByPrefix(days, prefixes) {
  return days.reduce((sum, day) => sum + (day.completed || []).filter((id) => prefixes.some((prefix) => String(id).startsWith(prefix))).length, 0);
}

function getBestActiveStreak(days) {
  const activeDates = new Set(days.filter((day) => Number(day.netXp || 0) > 0).map((day) => day.metrics?.date || day.date || day.id));
  const sorted = [...activeDates].sort();
  let best = 0;
  let current = 0;
  let previous = null;
  sorted.forEach((date) => {
    current = previous && diffDays(previous, date) === 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = date;
  });
  return best;
}

function hasNoZeroWeek(days) {
  const byWeek = new Map();
  days.forEach((day) => {
    const date = day.metrics?.date || day.date || day.id;
    const week = getWeekStart(date);
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week).push(day);
  });
  return [...byWeek.values()].some((items) => items.length >= 7 && items.every((day) => Number(day.netXp || 0) > 0));
}

function hasRecoveryDay(days) {
  const sorted = [...days].sort((a, b) => (a.metrics?.date || a.id || '').localeCompare(b.metrics?.date || b.id || ''));
  for (let i = 1; i < sorted.length; i += 1) {
    if (Number(sorted[i - 1].netXp || 0) <= 50 && Number(sorted[i].netXp || 0) >= 101) return true;
  }
  return false;
}

function getAchievementStates() {
  const ctx = getAchievementContext();
  return ACHIEVEMENTS.map((achievement) => {
    const value = Math.max(0, Number(achievement.calc(ctx) || 0));
    const unlocked = value >= achievement.target;
    return { ...achievement, value, unlocked, progress: Math.min(100, (value / achievement.target) * 100) };
  });
}

function renderDailyQuests() {
  const grid = $('#dailyQuestGrid');
  if (!grid) return;
  const collapsed = new Set(state?.ui?.collapsedDaily || []);
  grid.innerHTML = getDailyQuests().map((quest) => `
    <article class="quest-card${collapsed.has(quest.key) ? ' collapsed' : ''}" data-category="${escapeHTML(quest.key)}" data-code="${escapeHTML(String(quest.title || quest.key).slice(0, 2))}">
      <header>
        <div>
          <h3><span class="card-art">${categoryIcon(quest.title)}</span>${escapeHTML(quest.title)}</h3>
          <div class="quest-meta">${quest.items.length} ACTIONS · ${escapeHTML(quest.stat || quest.title)}</div>
        </div>
        <div class="quest-head-actions">
          <strong class="quest-xp">+${quest.maxXp}</strong>
          <button class="category-collapse-btn" type="button" data-collapse-scope="daily" data-collapse-category="${escapeHTML(quest.key)}" aria-expanded="${collapsed.has(quest.key) ? 'false' : 'true'}" aria-label="Свернуть категорию ${escapeHTML(quest.title)}">⌄</button>
        </div>
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
  const collapsed = new Set(state?.ui?.collapsedWeekly || []);
  grid.innerHTML = getWeeklyQuests().map((boss) => `
    <article class="quest-card${collapsed.has(boss.key) ? ' collapsed' : ''}" data-category="${escapeHTML(boss.key)}" data-code="${escapeHTML(String(boss.title || boss.key).slice(0, 2))}">
      <header>
        <div>
          <h3><span class="card-art">${categoryIcon(boss.title)}</span>${escapeHTML(boss.title)}</h3>
          <div class="quest-meta">${boss.items.length} WEEKLY ACTIONS · ${escapeHTML(boss.stat || boss.title)}</div>
        </div>
        <div class="quest-head-actions">
          <strong class="quest-xp">+${boss.maxXp}</strong>
          <button class="category-collapse-btn" type="button" data-collapse-scope="weekly" data-collapse-category="${escapeHTML(boss.key)}" aria-expanded="${collapsed.has(boss.key) ? 'false' : 'true'}" aria-label="Свернуть категорию ${escapeHTML(boss.title)}">⌄</button>
        </div>
      </header>
      <div class="checkbox-grid">
        ${boss.items.map((item) => checkRow(`b_${item.id}`, item.text, item.xp)).join('')}
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
  fillChallengeForm();
  suppressAutosave = false;
  updateDailyPreview();
  updateClockUI();
  applyQuestVisibility();
}

function fillChallengeForm() {
  const form = $('#challengeForm');
  if (!form) return;
  suppressAutosave = true;
  form.reset();
  const input = form.elements.challenge_done;
  if (input) input.checked = isChallengeCompleted(state.currentDay);
  suppressAutosave = false;
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
  getWeeklyQuests().flatMap((boss) => boss.items).forEach((item) => setChecked(form, `b_${item.id}`, draft.completed?.includes(item.id)));
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
  const challenge = getDailyChallenge(draft.date);
  const challengeForm = $('#challengeForm');
  draft.challengeId = challenge.id;
  draft.challengeCompleted = Boolean(challengeForm?.elements?.challenge_done?.checked);
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
  getWeeklyQuests().flatMap((boss) => boss.items).forEach((item) => {
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
  renderChallenges();
  updateDailyCommand();
  applyQuestVisibility();
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

function getDailyRankTarget(xp) {
  const targets = [
    { value: 101, label: 'Solid Day' },
    { value: 151, label: 'Prime Day' },
    { value: 201, label: 'Elite Day' },
    { value: 250, label: 'Legendary Day' }
  ];
  const next = targets.find((target) => xp < target.value);
  if (!next) return { label: 'Legendary Day закрыт', remaining: 0, target: 250 };
  return { label: `До ${next.label}: ${next.value - xp} XP`, remaining: next.value - xp, target: next.value };
}

function updateDailyCommand() {
  const result = calculateDailyFromDraft(state.currentDay);
  const items = getDailyQuests().flatMap((quest) => quest.items);
  const completed = new Set(state.currentDay?.completed || []);
  const doneCount = items.filter((item) => completed.has(item.id)).length;
  const target = getDailyRankTarget(result.netXp);
  if ($('#dailyPendingXp')) $('#dailyPendingXp').textContent = `${result.netXp} XP`;
  if ($('#dailyCompletedCount')) $('#dailyCompletedCount').textContent = `${doneCount} / ${items.length} действий`;
  if ($('#dailyRankTarget')) $('#dailyRankTarget').textContent = target.label;
  if ($('#dailyRankProgressBar')) $('#dailyRankProgressBar').style.width = `${Math.max(0, Math.min(100, (result.netXp / 250) * 100))}%`;
}

function applyQuestVisibility() {
  const hide = Boolean(state?.ui?.hideCompleted);
  const grid = $('#dailyQuestGrid');
  if (grid) {
    $$('.check-row', grid).forEach((row) => {
      const input = $('input[type="checkbox"]', row);
      row.classList.toggle('is-hidden-completed', hide && Boolean(input?.checked));
    });
  }
  const button = $('#hideCompletedBtn');
  if (button) {
    button.setAttribute('aria-pressed', hide ? 'true' : 'false');
    button.textContent = hide ? 'Показать выполненные' : 'Скрыть выполненные';
    button.classList.toggle('active', hide);
  }
}

function toggleHideCompleted() {
  state.ui.hideCompleted = !state.ui.hideCompleted;
  saveState({ quiet: true });
  applyQuestVisibility();
}

function toggleQuestCategory(scope, key) {
  const field = scope === 'weekly' ? 'collapsedWeekly' : 'collapsedDaily';
  const values = new Set(state.ui[field] || []);
  if (values.has(key)) values.delete(key); else values.add(key);
  state.ui[field] = [...values];
  saveState({ quiet: true });
  const grid = scope === 'weekly' ? $('#weeklyBossGrid') : $('#dailyQuestGrid');
  const card = grid ? $$('[data-category]', grid).find((item) => item.dataset.category === key) : null;
  if (card) {
    card.classList.toggle('collapsed', values.has(key));
    const button = card.querySelector('[data-collapse-category]');
    if (button) button.setAttribute('aria-expanded', values.has(key) ? 'false' : 'true');
  }
}

function updateWeeklyPreview() {
  // В недельной вкладке нет отдельного live-блока. Галочки сохраняются как pending XP до автозакрытия недели.
}


function buildAutoDaySummary(day, calc) {
  const quests = getDailyQuests();
  const categoryParts = quests.map((quest) => ({
    key: quest.key,
    title: quest.title,
    xp: Number(calc.questXp?.[quest.key] || 0),
    maxXp: Number(quest.maxXp || 0)
  }));
  const activeParts = categoryParts.filter((part) => part.xp > 0);
  const top = [...activeParts].sort((a, b) => b.xp - a.xp)[0] || null;
  const baseKeys = new Set(['body', 'work', 'creator', 'calm']);
  const weak = categoryParts.filter((part) => baseKeys.has(part.key)).sort((a, b) => a.xp - b.xp)[0] || categoryParts.sort((a, b) => a.xp - b.xp)[0] || null;
  const completedCount = Number(calc.completed?.length || 0);
  const penaltiesCount = Number(calc.penalties?.length || 0);
  const date = formatDate(day.metrics?.date || day.date || day.id);
  const categoryLine = categoryParts
    .filter((part) => part.xp > 0)
    .map((part) => `${part.title} +${part.xp}`)
    .join(' • ');

  let line = `${date}: ${calc.rank}, ${calc.netXp} XP.`;
  if (calc.netXp <= 0) line = `${date}: день закрыт пусто, ${calc.netXp} XP.`;
  else if (top) line = `${date}: ${calc.rank}. Сильнее всего: ${top.title} +${top.xp} XP.`;

  let focus = 'База держится. Следующий день — без усложнения.';
  if (penaltiesCount > 0) focus = `Штрафы забрали ${Math.abs(Number(calc.penaltyXp || 0))} XP. Убрать главный слив.`;
  else if (weak && weak.xp === 0) focus = `Просадка: ${weak.title}. Закрыть хотя бы 1 действие завтра.`;
  else if (completedCount >= 8) focus = 'Сильный день. Завтра сохранить ритм, не разгонять хаос.';

  return {
    title: calc.rank,
    line,
    focus,
    categoryLine: categoryLine || 'Нет закрытых категорий.',
    date,
    netXp: calc.netXp,
    positiveXp: calc.positiveXp,
    penaltyXp: calc.penaltyXp,
    strongest: top?.title || '',
    weakest: weak?.title || '',
    completedCount,
    penaltiesCount
  };
}

function getDaySummary(day) {
  if (day?.summary) return day.summary;
  const calc = {
    questXp: day?.questXp || {},
    categoryXp: day?.categoryXp || {},
    positiveXp: Number(day?.positiveXp || 0),
    penaltyXp: Number(day?.penaltyXp || 0),
    netXp: Number(day?.netXp || 0),
    rank: day?.rank || getDailyRank(Number(day?.netXp || 0)),
    completed: day?.completed || [],
    penalties: day?.penalties || []
  };
  return buildAutoDaySummary(day || {}, calc);
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
    challenge: calc.challenge,
    questXp: calc.questXp,
    categoryXp: calc.categoryXp,
    positiveXp: calc.positiveXp,
    penaltyXp: calc.penaltyXp,
    netXp: calc.netXp,
    rank: calc.rank
  };
  day.summary = buildAutoDaySummary(day, calc);
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
    movementDays: days.filter((day) => hasAnyCompleted(day, ['body_move', 'body_training'])).length,
    workMainDays: days.filter((day) => hasAnyCompleted(day, ['work_main'])).length,
    workNotes: days.filter((day) => hasAnyCompleted(day, ['work_note', 'work_log'])).length,
    projectSessions: days.filter((day) => hasAnyCompleted(day, ['creator_15', 'creator_project30'])).length,
    calmChecks: days.filter((day) => hasAnyCompleted(day, ['calm_check', 'calm_mood', 'calm_anxiety'])).length
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

function hasAnyCompleted(day, ids) {
  return ids.some((id) => day.completed?.includes(id));
}

function isWeeklyMinimumPassed(days) {
  const reports = days.length;
  const movement = days.filter((day) => hasAnyCompleted(day, ['body_move', 'body_training'])).length;
  const workMain = days.filter((day) => hasAnyCompleted(day, ['work_main'])).length;
  const projectSessions = days.filter((day) => hasAnyCompleted(day, ['creator_15', 'creator_project30'])).length;
  const calmChecks = days.filter((day) => hasAnyCompleted(day, ['calm_check', 'calm_mood', 'calm_anxiety'])).length;
  return movement >= 3 && workMain >= 5 && projectSessions >= 3 && calmChecks >= 5 && reports >= 7;
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
  if ($('#dailyLiveTitle')) $('#dailyLiveTitle').textContent = `День — ${formatDate(today)}`;
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
  if ($('#heroTodayXp')) $('#heroTodayXp').textContent = `+${liveDaily.netXp} XP`;
  if ($('#heroWeekXp')) $('#heroWeekXp').textContent = `${weekXp.confirmed}+${weekXp.pending} XP`;

  $('#statBars').innerHTML = STAT_KEYS.map((key) => {
    const value = totals.statXp[key] || 0;
    const pending = totals.pendingStatXp[key] || 0;
    const width = Math.min(100, (value / 2500) * 100);
    const pendingWidth = Math.min(Math.max(0, 100 - width), (pending / 2500) * 100);
    const text = pending ? `${value}+${pending} XP` : `${value} XP`;
    return `
      <div class="stat-line" data-stat="${escapeHTML(key)}">
        <div class="bar-top"><span><span class="emoji">${categoryIcon(key)}</span> ${escapeHTML(key)}</span><strong>${escapeHTML(text)}</strong></div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${width}%"></div>
          <div class="bar-pending" style="left:${width}%;width:${pendingWidth}%"></div>
        </div>
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
  const list = $('#weeklyMinimumList');
  if (!list) return;
  const completed = new Set(state.currentWeek?.completed || []);
  const items = getWeeklyQuests().map((quest) => {
    const doneItems = (quest.items || []).filter((item) => completed.has(item.id));
    const doneXp = Math.min(
      doneItems.reduce((sum, item) => sum + Number(item.xp || 0), 0),
      Number(quest.maxXp || 0)
    );
    const totalItems = (quest.items || []).length || 1;
    const ok = doneItems.length === totalItems || (quest.maxXp && doneXp >= quest.maxXp);
    return {
      text: quest.title || quest.key,
      value: `${doneItems.length}/${totalItems} • ${doneXp}/${quest.maxXp || doneXp} XP`,
      ok
    };
  });

  list.innerHTML = items.length ? items.map((item) => `
    <li><span><span class="row-icon" aria-hidden="true">${item.ok ? '✅' : '▫️'}</span>${escapeHTML(item.text)}</span><strong class="${item.ok ? 'ok' : 'bad'}">${escapeHTML(item.value)}</strong></li>
  `).join('') : '<li><span>Недельные квесты не заданы</span><strong class="bad">0</strong></li>';
}

function renderMonthCalendar() {
  const grid = $('#monthCalendar');
  if (!grid) return;
  const today = state.currentDay?.date || todayMoscowISO();
  const monthDays = getMonthDays(today);
  const firstOffset = getWeekDay(monthDays[0]) - 1;
  const dayMap = new Map();
  state.days.forEach((day) => {
    const id = day.metrics?.date || day.date || day.id;
    if (id) dayMap.set(id, day);
  });
  if (!isEmptyDayDraft(state.currentDay)) dayMap.set(state.currentDay.date, finalizePreviewDay(state.currentDay));

  const blanks = Array.from({ length: firstOffset }, (_, index) => `<div class="calendar-cell is-blank" aria-hidden="true"></div>`).join('');
  const cells = monthDays.map((iso) => {
    const day = dayMap.get(iso);
    const isToday = iso === today;
    const isLive = day && iso === state.currentDay?.date;
    const rank = day?.rank || '';
    const cls = day ? getRankClass(rank) : 'empty';
    const xp = day ? Number(day.netXp || 0) : null;
    return `
      <div class="calendar-cell rank-${cls}${isToday ? ' is-today' : ''}${isLive ? ' is-live' : ''}" title="${formatDate(iso)}${rank ? ` — ${rank}, ${xp} XP` : ''}">
        <span>${Number(iso.slice(-2))}</span>
        <strong>${day ? shortRank(rank) : ''}</strong>
        ${day ? `<small>${xp}</small>` : ''}
      </div>
    `;
  }).join('');

  const title = $('#monthCalendarTitle');
  if (title) {
    const monthText = new Intl.DateTimeFormat('ru-RU', { timeZone: MOSCOW_TZ, month: 'long', year: 'numeric' }).format(parseISODate(today));
    title.textContent = `Календарь — ${monthText}`;
  }
  grid.innerHTML = blanks + cells;
}


function renderChallenges() {
  const box = $('#dailyChallengeBox');
  const list = $('#challengeLibrary');
  if (!box && !list) return;
  const challenge = getDailyChallenge(state.currentDay?.date || todayMoscowISO());
  const completed = isChallengeCompleted(state.currentDay);
  if (box) {
    box.innerHTML = `
      <article class="challenge-card ${completed ? 'is-complete' : ''}" data-rarity="${Number(challenge.xp || 0) >= 140 ? 'legendary' : Number(challenge.xp || 0) >= 100 ? 'elite' : 'hard'}">
        <div class="challenge-main">
          <div class="challenge-icon" aria-hidden="true">${escapeHTML(challenge.icon || '🎲')}</div>
          <div>
            <p class="eyebrow">Сегодняшний челлендж</p>
            <h3>${escapeHTML(challenge.title)}</h3>
            <p class="muted">${escapeHTML(challenge.text)}</p>
          </div>
        </div>
        <label class="challenge-check">
          <input name="challenge_done" type="checkbox" ${completed ? 'checked' : ''} />
          <span>${completed ? 'Готово' : 'Закрыть'}</span>
          <strong>+${Number(challenge.xp || 0)} XP</strong>
        </label>
      </article>
    `;
  }
  if (list) {
    list.innerHTML = DAILY_CHALLENGES.map((item) => `
      <article class="mini-library-card ${item.id === challenge.id ? 'is-current' : ''}">
        <span aria-hidden="true">${escapeHTML(item.icon || '🎲')}</span>
        <div>
          <strong>${escapeHTML(item.title)}</strong>
          <small>${escapeHTML(item.text)} • +${Number(item.xp || 0)} XP</small>
        </div>
      </article>
    `).join('');
  }
}

function achievementRarity(item) {
  const legendary = ['prime_week', 'level_5'];
  const epic = ['elite_day', 'streak_7', 'no_zero_week', 'discipline_core', 'challenge_5', 'recovery'];
  const rare = ['prime_day', 'streak_3', 'creator_spark', 'calm_base', 'mind_online', 'challenge_1', 'week_1'];
  if (legendary.includes(item.id)) return 'legendary';
  if (epic.includes(item.id)) return 'epic';
  if (rare.includes(item.id)) return 'rare';
  return 'common';
}

function renderAchievements() {
  const grid = $('#achievementGrid');
  const summary = $('#achievementSummary');
  if (!grid) return;
  const achievements = getAchievementStates();
  const unlocked = achievements.filter((item) => item.unlocked).length;
  if (summary) summary.textContent = `${unlocked}/${achievements.length} открыто`;
  grid.innerHTML = achievements.map((item) => `
    <article class="achievement-card ${item.unlocked ? 'is-unlocked' : 'is-locked'}" data-rarity="${achievementRarity(item)}">
      <div class="achievement-icon" aria-hidden="true">${escapeHTML(item.icon)}</div>
      <div>
        <div class="achievement-title">
          <strong>${escapeHTML(item.title)}</strong>
          <span>${item.unlocked ? 'открыто' : `${Math.min(item.value, item.target)}/${item.target}`}</span>
        </div>
        <p>${escapeHTML(item.text)}</p>
        <div class="mini-progress"><div style="width:${item.progress}%"></div></div>
      </div>
    </article>
  `).join('');
}

function renderLatestDaySummary() {
  const box = $('#latestDaySummary');
  if (!box) return;
  const latestClosed = [...state.days].sort((a, b) => (b.metrics?.date || b.id || '').localeCompare(a.metrics?.date || a.id || ''))[0];
  if (!latestClosed) {
    box.innerHTML = `<p class="muted">Первый итог появится после автоматического закрытия дня в 00:00 МСК.</p>`;
    return;
  }
  const summary = getDaySummary(latestClosed);
  box.innerHTML = `
    <article class="summary-card rank-${getRankClass(summary.title)}">
      <div class="summary-top">
        <strong>${escapeHTML(summary.title)}</strong>
        <span>${escapeHTML(summary.date)} • ${summary.netXp} XP</span>
      </div>
      <p>${escapeHTML(summary.line)}</p>
      <p class="muted">${escapeHTML(summary.categoryLine)}</p>
      <p class="summary-focus">${escapeHTML(summary.focus)}</p>
    </article>
  `;
}

function finalizePreviewDay(draft) {
  const calc = calculateDailyFromDraft(draft);
  const day = {
    id: draft.date,
    date: draft.date,
    metrics: { date: draft.date, dayNumber: draft.dayNumber, ...(draft.metrics || {}) },
    notes: { ...(draft.notes || {}) },
    completed: calc.completed,
    penalties: calc.penalties,
    challenge: calc.challenge,
    questXp: calc.questXp,
    categoryXp: calc.categoryXp,
    positiveXp: calc.positiveXp,
    penaltyXp: calc.penaltyXp,
    netXp: calc.netXp,
    rank: calc.rank
  };
  day.summary = buildAutoDaySummary(day, calc);
  return day;
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
  const summary = getDaySummary(day);
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
      ${summary?.focus ? `<div class="history-meta">${escapeHTML(summary.categoryLine)}<br>${escapeHTML(summary.focus)}</div>` : ''}
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
  const select = $('#backupSelect');
  const snapshots = getStoredSnapshots();
  if (select) {
    select.innerHTML = snapshots.length
      ? snapshots.map((item, index) => `<option value="${escapeHTML(item.key)}">${index === 0 ? 'Последняя · ' : ''}${escapeHTML(item.stamp)} · ${escapeHTML(item.reason)}</option>`).join('')
      : '<option value="">Копий пока нет</option>';
    select.disabled = !snapshots.length;
  }
  const restore = $('#restoreBackupBtn');
  if (restore) restore.disabled = !snapshots.length;
  const backupInfo = $('#backupInfo');
  if (backupInfo) backupInfo.textContent = snapshots.length ? `Доступно копий: ${snapshots.length}. Хранятся 7 дневных и аварийные снимки.` : 'Копия появится после первого сохранения.';
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

function closeMobileMenu() {
  const nav = $('#mainNav');
  const button = $('#mobileMenuBtn');
  const backdrop = $('#menuBackdrop');
  if (nav) nav.classList.remove('open');
  if (button) button.setAttribute('aria-expanded', 'false');
  if (backdrop) {
    backdrop.classList.remove('show');
    backdrop.hidden = true;
  }
  document.body.classList.remove('menu-open');
}

function openMobileMenu() {
  const nav = $('#mainNav');
  const button = $('#mobileMenuBtn');
  const backdrop = $('#menuBackdrop');
  if (nav) nav.classList.add('open');
  if (button) button.setAttribute('aria-expanded', 'true');
  if (backdrop) {
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('show'));
  }
  document.body.classList.add('menu-open');
}

function toggleMobileMenu() {
  const nav = $('#mainNav');
  if (nav?.classList.contains('open')) closeMobileMenu();
  else openMobileMenu();
}

function switchTab(tabId) {
  const current = $('.tab-panel.active');
  const next = document.getElementById(tabId);
  if (!next || current === next) {
    closeMobileMenu();
    return;
  }

  // Сначала закрываем мобильное меню и возвращаемся наверх без smooth-scroll.
  // Так браузер не пытается одновременно анимировать скролл, высоту страницы и вкладку.
  closeMobileMenu();
  if (window.scrollY > 2) window.scrollTo(0, 0);

  $$('.tab-btn').forEach((button) => button.classList.toggle('active', button.dataset.tab === tabId));
  state.ui.activeTab = tabId;
  saveState({ quiet: true, snapshot: false });

  if (current) current.classList.remove('active', 'entering', 'leaving');
  next.classList.remove('entering', 'leaving');
  next.classList.add('active');
  if (tabId === 'settings') renderSettings();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    next.classList.add('entering');
    window.setTimeout(() => next.classList.remove('entering'), 220);
  }
}

function restoreActiveTab() {
  const tabId = state?.ui?.activeTab || 'dashboard';
  const next = document.getElementById(tabId) || document.getElementById('dashboard');
  $$('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel === next));
  $$('.tab-btn').forEach((button) => button.classList.toggle('active', button.dataset.tab === next.id));
}

function restoreSelectedBackup() {
  const key = $('#backupSelect')?.value;
  if (!key) return;
  const ok = window.confirm('Восстановить выбранную копию? Текущее состояние будет сохранено в аварийный снимок.');
  if (!ok) return;
  try {
    createRecoverySnapshot('before-restore');
    const envelope = JSON.parse(localStorage.getItem(key));
    const restored = envelope?.state || envelope;
    state = migrateState(restored);
    saveState();
    renderDailyQuests();
    renderWeeklyBosses();
    fillDailyForm();
    fillWeeklyForm();
    renderAll();
    restoreActiveTab();
    showToast('Резервная копия восстановлена');
  } catch (error) {
    console.error('Backup restore failed', error);
    showToast('Не удалось восстановить копию');
  }
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



function mergeQuestCategories(current, incomingCategories, mode) {
  const incoming = incomingCategories.filter((category) => !isDisabledCategory(category));
  if (mode === 'replace_all') return incoming;

  const result = cloneQuestConfig(current);
  incoming.forEach((categoryIn) => {
    let category = result.find((item) => item.key === categoryIn.key || item.title?.toUpperCase() === categoryIn.title.toUpperCase());
    if (!category) {
      category = { key: categoryIn.key, title: categoryIn.title, stat: categoryIn.stat, maxXp: 0, items: [] };
      result.push(category);
    }

    if (mode === 'replace') category.items = [];

    const byId = new Map((category.items || []).map((item) => [item.id, item]));
    categoryIn.items.forEach((item) => {
      if (byId.has(item.id)) byId.set(item.id, item);
      else if (byId.size < 10) byId.set(item.id, item);
    });

    category.items = [...byId.values()].slice(0, 10);
    category.stat = normalizeStat(categoryIn.stat || category.stat, 'DISCIPLINE');
    category.title = String(categoryIn.title || category.title || categoryIn.key).toUpperCase();
    const sum = category.items.reduce((total, item) => total + Number(item.xp || 0), 0);
    category.maxXp = Math.max(0, Number(categoryIn.maxXp || sum));
  });

  return result.filter((category) => Array.isArray(category.items) && category.items.length);
}

function applyQuestPack(payload) {
  createRecoverySnapshot('before-quest-import');
  const pack = normalizeQuestPack(payload);
  const currentDaily = cloneQuestConfig(getDailyQuests());
  const currentWeekly = cloneQuestConfig(getWeeklyQuests());

  const nextDaily = pack.dailyCategories.length
    ? mergeQuestCategories(currentDaily, pack.dailyCategories, pack.dailyMode)
    : currentDaily;
  const nextWeekly = pack.weeklyCategories.length
    ? mergeQuestCategories(currentWeekly, pack.weeklyCategories, pack.weeklyMode)
    : currentWeekly;

  state.config = {
    ...(state.config || {}),
    dailyQuests: filterActiveDailyQuests(nextDaily),
    weeklyQuests: filterActiveWeeklyQuests(nextWeekly)
  };

  const activeDailyIds = new Set(getDailyQuests().flatMap((category) => category.items.map((item) => item.id)));
  const activeWeeklyIds = new Set(getWeeklyQuests().flatMap((category) => category.items.map((item) => item.id)));
  state.currentDay.completed = (state.currentDay.completed || []).filter((id) => activeDailyIds.has(id));
  state.currentWeek.completed = (state.currentWeek.completed || []).filter((id) => activeWeeklyIds.has(id));

  saveState();
  renderDailyQuests();
  renderWeeklyBosses();
  fillDailyForm();
  fillWeeklyForm();
  renderAll();

  const dailyText = pack.dailyCategories.length ? `${pack.dailyCategories.length} daily` : '0 daily';
  const weeklyText = pack.weeklyCategories.length ? `${pack.weeklyCategories.length} weekly` : '0 weekly';
  showToast(`Quest pack применён: ${dailyText}, ${weeklyText}`);
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
    version: 2,
    packName: 'My PRIME RPG Quest Pack',
    mode: 'replace_all',
    notes: 'mode: merge — добавить; replace — заменить указанные категории; replace_all — заменить весь список daily/weekly из файла.',
    limits: {
      maxItemsPerCategory: 10,
      supportedStats: STAT_KEYS
    },
    dailyQuests: [
      {
        category: 'BODY',
        title: 'BODY',
        stat: 'BODY',
        maxXp: 40,
        items: [
          { id: 'body_training', text: 'тренировка / движение 30+ минут', xp: 20, stat: 'BODY' },
          { id: 'body_food', text: 'питание по плану', xp: 10, stat: 'BODY' },
          { id: 'body_steps', text: '10 000+ шагов', xp: 10, stat: 'BODY' }
        ]
      },
      {
        category: 'WORK',
        title: 'WORK',
        stat: 'WORK',
        maxXp: 40,
        items: [
          { id: 'work_main', text: 'главная обязанность дня закрыта', xp: 25, stat: 'WORK' },
          { id: 'work_log', text: 'записал, что сделал', xp: 10, stat: 'WORK' },
          { id: 'work_question', text: 'задал вопрос / разобрал непонятное', xp: 5, stat: 'MIND' }
        ]
      }
    ],
    weeklyQuests: [
      {
        category: 'BODY',
        title: 'BODY',
        stat: 'BODY',
        maxXp: 150,
        items: [
          { id: 'week_body_3_trainings', text: '3 тренировки за неделю', xp: 70, stat: 'BODY' },
          { id: 'week_body_5_food', text: '5 дней питания по плану', xp: 50, stat: 'BODY' },
          { id: 'week_body_steps_avg', text: 'средние шаги 10к+', xp: 30, stat: 'BODY' }
        ]
      },
      {
        category: 'CREATOR',
        title: 'CREATOR',
        stat: 'CREATOR',
        maxXp: 150,
        items: [
          { id: 'week_creator_3_sessions', text: '3 проектные сессии', xp: 60, stat: 'CREATOR' },
          { id: 'week_creator_visible_result', text: '1 видимый результат', xp: 70, stat: 'CREATOR' },
          { id: 'week_creator_roadmap', text: 'обновил список задач', xp: 20, stat: 'CREATOR' }
        ]
      }
    ]
  };
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'prime-rpg-quest-pack-v2-template.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Шаблон quest pack v2 скачан');
}

function resetQuestConfig() {
  const ok = window.confirm('Сбросить дневные и недельные квесты к базовым? История останется.');
  if (!ok) return;
  createRecoverySnapshot('before-quest-reset');
  state.config = {
    ...(state.config || {}),
    dailyQuests: filterActiveDailyQuests(DEFAULT_DAILY_QUESTS),
    weeklyQuests: filterActiveWeeklyQuests(WEEKLY_BOSSES)
  };
  state.currentDay.completed = [];
  state.currentWeek.completed = [];
  saveState();
  renderDailyQuests();
  renderWeeklyBosses();
  fillDailyForm();
  fillWeeklyForm();
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
      if (imported.type === 'prime-rpg-quest-pack' || imported.dailyQuests || imported.weeklyQuests || imported.quests || imported.weekQuests) {
        applyQuestPack(imported);
        return;
      }
      createRecoverySnapshot('before-backup-import');
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
  days.forEach((day) => { const summary = getDaySummary(day); lines.push(`${formatDate(day.metrics?.date)} — ${day.netXp} XP — ${day.rank}. ${summary.focus}`); });
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
  renderMonthCalendar();
  renderChallenges();
  renderAchievements();
  renderHistory();
  renderSettings();
  updateDailyPreview();
  updateWeeklyPreview();
  updateDailyCommand();
  applyQuestVisibility();
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
  if ($('#mobileMenuBtn')) $('#mobileMenuBtn').addEventListener('click', toggleMobileMenu);
  if ($('#menuBackdrop')) $('#menuBackdrop').addEventListener('click', closeMobileMenu);
  if ($('#hideCompletedBtn')) $('#hideCompletedBtn').addEventListener('click', toggleHideCompleted);
  if ($('#restoreBackupBtn')) $('#restoreBackupBtn').addEventListener('click', restoreSelectedBackup);
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-collapse-category]');
    if (!button) return;
    toggleQuestCategory(button.dataset.collapseScope, button.dataset.collapseCategory);
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMobileMenu(); });
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
  const challengeForm = $('#challengeForm');
  if (challengeForm) {
    challengeForm.addEventListener('change', autosaveCurrentDay);
    challengeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      autosaveCurrentDay();
      showToast('Челлендж сохранён');
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
    createRecoverySnapshot('before-full-reset');
    Object.keys(localStorage)
      .filter((key) => key.startsWith('prime-rpg') && !key.startsWith(AUTO_BACKUP_PREFIX) && !key.startsWith(RECOVERY_BACKUP_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
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
    showToast('Всё сброшено. Аварийная копия сохранена');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) forceSaveNow();
    else syncClock(false);
  });
  window.addEventListener('pagehide', forceSaveNow);
  window.addEventListener('beforeunload', forceSaveNow);
  window.addEventListener('focus', () => syncClock(false));
}

function startClockTicker() {
  updateClockUI();
  const delay = 60000 - (Date.now() % 60000) + 40;
  window.setTimeout(() => {
    updateClockUI();
    window.setInterval(updateClockUI, 60000);
  }, delay);
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
    restoreActiveTab();
    setSaveStatus('saved');
    registerServiceWorker();
    window.setInterval(() => syncClock(false), ROLLOVER_CHECK_MS);
    startClockTicker();
  } catch (error) {
    console.error('PRIME RPG boot failed', error);
    showBootError(error);
  }
}

init();
