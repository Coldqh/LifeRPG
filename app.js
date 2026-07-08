'use strict';

const STORAGE_KEY = 'prime-rpg-state-v1';

const STAT_KEYS = ['BODY', 'FIGHTER', 'MIND', 'WORK', 'CREATOR', 'CALM', 'DISCIPLINE', 'CHARISMA', 'MONEY'];

const LEVELS = [0, 1000, 2200, 3600, 5200, 7000, 9000, 11500, 14500, 18000, 22000, 27000, 33000, 40000];

const DAILY_QUESTS = [
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
    key: 'charisma', title: 'CHARISMA', stat: 'CHARISMA', maxXp: 20,
    items: [
      { id: 'charisma_contact', text: 'нормальный контакт с человеком', xp: 10, stat: 'CHARISMA' },
      { id: 'charisma_message', text: 'написал знакомому / поговорил на работе / дейтинг без залипа', xp: 10, stat: 'CHARISMA' }
    ]
  },
  {
    key: 'discipline', title: 'DISCIPLINE', stat: 'DISCIPLINE', maxXp: 30,
    items: [
      { id: 'discipline_insta0', text: 'инста 0 минут', xp: 10, stat: 'DISCIPLINE' },
      { id: 'discipline_energy1', text: 'энергетик максимум 1', xp: 10, stat: 'DISCIPLINE' },
      { id: 'discipline_no_junk', text: 'без сладкого мусора / фастфуда / импульсивной херни', xp: 10, stat: 'DISCIPLINE' }
    ]
  },
  {
    key: 'money', title: 'MONEY', stat: 'MONEY', maxXp: 30,
    items: [
      { id: 'money_expenses', text: 'записал траты за день', xp: 10, stat: 'MONEY' },
      { id: 'money_no_trash', text: 'не купил ненужную херню', xp: 10, stat: 'MONEY' },
      { id: 'money_career', text: 'сделал шаг к деньгам/карьере', xp: 10, stat: 'MONEY' }
    ]
  }
];

const PENALTIES = [
  { id: 'insta_slip', text: 'инста-срыв 30+ минут', xp: -20 },
  { id: 'energy_2plus', text: '2+ энергетика', xp: -15 },
  { id: 'junk_food', text: 'сладкое/фастфуд вне плана', xp: -15 },
  { id: 'missed_report', text: 'пропустил отчёт', xp: -10 },
  { id: 'late_sleep', text: 'лёг очень поздно без причины', xp: -15 },
  { id: 'anxiety_no_actions', text: 'день полностью в тревоге без действий', xp: -20 },
  { id: 'self_blame', text: 'сорвался и начал себя гнобить', xp: -10 }
];

const WEEKLY_BOSSES = [
  {
    key: 'bodyBoss', title: 'BODY BOSS', stat: 'BODY', maxXp: 150,
    items: [
      { id: 'body_3_trainings', text: '3 тренировки за неделю', xp: 50 },
      { id: 'body_avg_steps', text: 'средние шаги 12к+', xp: 30 },
      { id: 'body_food_5', text: 'питание 5/7 дней по плану', xp: 30 },
      { id: 'body_weight_waist', text: 'вес и талия замерены', xp: 20 },
      { id: 'body_photo', text: 'фото формы 1 раз', xp: 20 }
    ]
  },
  {
    key: 'workBoss', title: 'WORK BOSS', stat: 'WORK', maxXp: 150,
    items: [
      { id: 'work_5_days', text: '5 рабочих дней закрыты', xp: 50 },
      { id: 'work_5_logs', text: '5 рабочих журналов', xp: 30 },
      { id: 'work_10_terms', text: 'выписал 10 новых терминов/процессов', xp: 20 },
      { id: 'work_system', text: 'понял одну новую систему/процедуру', xp: 20 },
      { id: 'work_conclusion', text: 'сделал вывод недели', xp: 30 }
    ]
  },
  {
    key: 'creatorBoss', title: 'CREATOR BOSS', stat: 'CREATOR', maxXp: 150,
    items: [
      { id: 'creator_3_sessions', text: '3 сессии проекта по 30+ минут', xp: 40 },
      { id: 'creator_visible_result', text: '1 видимый результат', xp: 50 },
      { id: 'creator_roadmap', text: 'обновил roadmap / список задач', xp: 20 },
      { id: 'creator_no_spread', text: 'не распылялся на всё сразу', xp: 20 },
      { id: 'creator_showed_result', text: 'показал мне итог недели', xp: 20 }
    ]
  },
  {
    key: 'calmBoss', title: 'CALM BOSS', stat: 'CALM', maxXp: 150,
    items: [
      { id: 'calm_sleep_7', text: 'сон записан 7/7 дней', xp: 30 },
      { id: 'calm_anxiety_7', text: 'тревога записана 7/7 дней', xp: 30 },
      { id: 'calm_no_spin_3', text: 'минимум 3 дня без сильной накрутки', xp: 30 },
      { id: 'calm_insta_control', text: 'инста под контролем всю неделю', xp: 30 },
      { id: 'calm_head_conclusion', text: 'сделал недельный вывод по голове', xp: 30 }
    ]
  },
  {
    key: 'socialBoss', title: 'SOCIAL BOSS', stat: 'CHARISMA', maxXp: 100,
    items: [
      { id: 'social_live_contact', text: '1 встреча / прогулка / живой контакт', xp: 30 },
      { id: 'social_2_chats', text: '2 нормальных переписки без залипа', xp: 20 },
      { id: 'social_new_contact', text: '1 новый контакт / разговор на работе', xp: 20 },
      { id: 'social_dating_limit', text: 'дейтинг максимум 20 минут за раз', xp: 10 },
      { id: 'social_no_likes_value', text: 'не оценивал себя по лайкам', xp: 20 }
    ]
  },
  {
    key: 'moneyBoss', title: 'MONEY BOSS', stat: 'MONEY', maxXp: 100,
    items: [
      { id: 'money_expenses_5', text: 'записал траты 5/7 дней', xp: 30 },
      { id: 'money_no_trash_week', text: 'не слил деньги на мусор', xp: 30 },
      { id: 'money_career_step', text: 'сделал карьерный шаг', xp: 20 },
      { id: 'money_week_situation', text: 'понял финансовую ситуацию недели', xp: 20 }
    ]
  }
];

const NOTE_FIELDS = ['workDone', 'workLearned', 'workStuck', 'creatorProject', 'creatorDone', 'calmAnnoyed', 'calmGood', 'mindNote', 'charismaNote', 'moneyNote'];
const DAILY_METRIC_FIELDS = ['date', 'dayNumber', 'weight', 'waist', 'sleep', 'steps', 'energyDrink', 'instagram'];
const WEEKLY_NOTE_FIELDS = ['workTasks', 'workInsight', 'creatorProject', 'creatorResult', 'calmTriggers', 'calmHelped', 'socialContacts', 'moneyInsight', 'weekSummary', 'improve'];
const WEEKLY_METRIC_FIELDS = ['weekNumber', 'startDate', 'endDate', 'weightStart', 'weightEnd', 'waistStart', 'waistEnd', 'avgSteps'];

let state = loadState();

function defaultState() {
  return {
    profile: {
      playerName: '',
      seasonName: 'Москва / Сушка / Работа',
      seasonGoal: 'стабильный режим: тело, работа, проекты, спокойствие',
      startDate: todayISO()
    },
    days: [],
    weeks: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      profile: { ...defaultState().profile, ...(parsed.profile || {}) },
      days: Array.isArray(parsed.days) ? parsed.days : [],
      weeks: Array.isArray(parsed.weeks) ? parsed.weeks : []
    };
  } catch (error) {
    console.error(error);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function $(selector, root = document) { return root.querySelector(selector); }
function $$(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }

function todayISO() {
  const date = new Date();
  const tz = date.getTimezoneOffset() * 60000;
  return new Date(date - tz).toISOString().slice(0, 10);
}

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function checked(form, name) {
  const input = form.elements[name];
  return Boolean(input && input.checked);
}

function setChecked(form, name, value) {
  const input = form.elements[name];
  if (input) input.checked = Boolean(value);
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2300);
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
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function renderDailyQuests() {
  const grid = $('#dailyQuestGrid');
  grid.innerHTML = DAILY_QUESTS.map((quest) => `
    <article class="quest-card">
      <header>
        <div>
          <p class="eyebrow">${escapeHTML(quest.stat)}</p>
          <h3>${escapeHTML(quest.title)}</h3>
        </div>
        <strong class="quest-xp">+${quest.maxXp}</strong>
      </header>
      <div class="checkbox-grid">
        ${quest.items.map((item) => checkRow(`q_${item.id}`, item.text, item.xp)).join('')}
      </div>
    </article>
  `).join('');

  const penaltyGrid = $('#penaltyGrid');
  penaltyGrid.innerHTML = PENALTIES.map((item) => checkRow(`p_${item.id}`, item.text, item.xp)).join('');
}

function renderWeeklyBosses() {
  const grid = $('#weeklyBossGrid');
  grid.innerHTML = WEEKLY_BOSSES.map((boss) => `
    <article class="quest-card">
      <header>
        <div>
          <p class="eyebrow">${escapeHTML(boss.stat)}</p>
          <h3>${escapeHTML(boss.title)}</h3>
        </div>
        <strong class="quest-xp">+${boss.maxXp}</strong>
      </header>
      <div class="checkbox-grid">
        ${boss.items.map((item) => checkRow(`b_${item.id}`, item.text, item.xp)).join('')}
      </div>
    </article>
  `).join('');
}

function checkRow(name, text, xp) {
  const sign = xp > 0 ? `+${xp}` : `${xp}`;
  return `
    <div class="check-row">
      <label>
        <input name="${escapeHTML(name)}" type="checkbox" />
        <span>${escapeHTML(text)}</span>
      </label>
      <span class="xp">${escapeHTML(sign)}</span>
    </div>
  `;
}

function calculateDaily(form = $('#dailyForm')) {
  const categoryXp = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));
  const questXp = {};
  const completed = [];

  DAILY_QUESTS.forEach((quest) => {
    let sum = 0;
    quest.items.forEach((item) => {
      if (checked(form, `q_${item.id}`)) {
        sum += item.xp;
        categoryXp[item.stat] = (categoryXp[item.stat] || 0) + item.xp;
        completed.push(item.id);
      }
    });
    questXp[quest.key] = Math.min(sum, quest.maxXp);
  });

  const positiveXp = Object.values(questXp).reduce((sum, value) => sum + value, 0);
  const penalties = [];
  const penaltyXp = PENALTIES.reduce((sum, item) => {
    if (checked(form, `p_${item.id}`)) {
      penalties.push(item.id);
      return sum + item.xp;
    }
    return sum;
  }, 0);

  const netXp = positiveXp + penaltyXp;
  return {
    questXp,
    categoryXp,
    positiveXp,
    penaltyXp,
    netXp,
    rank: getDailyRank(netXp),
    completed,
    penalties
  };
}

function updateDailyPreview() {
  const result = calculateDaily();
  $('#dailyResultTitle').textContent = `${result.netXp} XP — ${result.rank}`;
  $('#dailyResultDetails').textContent = `Плюс: ${result.positiveXp} XP. Штрафы: ${result.penaltyXp} XP. База BODY/WORK/CREATOR/CALM: ${['body', 'work', 'creator', 'calm'].map((key) => result.questXp[key]).reduce((a, b) => a + b, 0)} / 150 XP.`;
}

function calculateWeekly(form = $('#weeklyForm')) {
  const bossXp = {};
  const categoryXp = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));
  const completed = [];

  WEEKLY_BOSSES.forEach((boss) => {
    let sum = 0;
    boss.items.forEach((item) => {
      if (checked(form, `b_${item.id}`)) {
        sum += item.xp;
        completed.push(item.id);
      }
    });
    const capped = Math.min(sum, boss.maxXp);
    bossXp[boss.key] = capped;
    categoryXp[boss.stat] = (categoryXp[boss.stat] || 0) + capped;
  });

  const totalXp = Object.values(bossXp).reduce((sum, value) => sum + value, 0);
  return { bossXp, categoryXp, totalXp, completed };
}

function updateWeeklyPreview() {
  const result = calculateWeekly();
  const passed = result.totalXp >= 500;
  $('#weeklyResultTitle').textContent = `${result.totalXp} XP — ${passed ? 'неделя закрыта' : 'неделя не закрыта'}`;
  $('#weeklyResultDetails').textContent = `Максимум недели: 800 XP. Боссы: BODY ${result.bossXp.bodyBoss || 0}, WORK ${result.bossXp.workBoss || 0}, CREATOR ${result.bossXp.creatorBoss || 0}, CALM ${result.bossXp.calmBoss || 0}, SOCIAL ${result.bossXp.socialBoss || 0}, MONEY ${result.bossXp.moneyBoss || 0}.`;
}

function collectDailyData() {
  const form = $('#dailyForm');
  const calc = calculateDaily(form);
  const data = {
    id: form.elements.date.value || todayISO(),
    createdAt: new Date().toISOString(),
    metrics: {},
    notes: {},
    completed: calc.completed,
    penalties: calc.penalties,
    questXp: calc.questXp,
    categoryXp: calc.categoryXp,
    positiveXp: calc.positiveXp,
    penaltyXp: calc.penaltyXp,
    netXp: calc.netXp,
    rank: calc.rank
  };

  DAILY_METRIC_FIELDS.forEach((field) => {
    const value = form.elements[field]?.value ?? '';
    data.metrics[field] = ['date'].includes(field) ? value : toNumber(value) ?? value;
  });

  NOTE_FIELDS.forEach((field) => {
    data.notes[field] = form.elements[field]?.value?.trim() || '';
  });

  return data;
}

function saveDaily(event) {
  event.preventDefault();
  const data = collectDailyData();
  if (!data.metrics.date) data.metrics.date = todayISO();
  data.id = data.metrics.date;
  state.days = state.days.filter((day) => day.id !== data.id);
  state.days.push(data);
  state.days.sort((a, b) => (a.metrics.date || '').localeCompare(b.metrics.date || ''));
  saveState();
  renderAll();
  showToast(`День сохранён: ${data.netXp} XP — ${data.rank}`);
}

function collectWeeklyData() {
  const form = $('#weeklyForm');
  const calc = calculateWeekly(form);
  const weekNumber = form.elements.weekNumber.value || getSeasonWeekNumber();
  const data = {
    id: String(weekNumber),
    createdAt: new Date().toISOString(),
    metrics: {},
    notes: {},
    completed: calc.completed,
    bossXp: calc.bossXp,
    categoryXp: calc.categoryXp,
    totalXp: calc.totalXp,
    result: calc.totalXp >= 500 ? 'passed' : 'failed'
  };

  WEEKLY_METRIC_FIELDS.forEach((field) => {
    const value = form.elements[field]?.value ?? '';
    data.metrics[field] = ['startDate', 'endDate'].includes(field) ? value : toNumber(value) ?? value;
  });

  WEEKLY_NOTE_FIELDS.forEach((field) => {
    data.notes[field] = form.elements[field]?.value?.trim() || '';
  });

  return data;
}

function saveWeekly(event) {
  event.preventDefault();
  const data = collectWeeklyData();
  state.weeks = state.weeks.filter((week) => week.id !== data.id);
  state.weeks.push(data);
  state.weeks.sort((a, b) => Number(a.id) - Number(b.id));
  saveState();
  renderAll();
  showToast(`Неделя сохранена: ${data.totalXp} XP`);
}

function fillDailyForm(day) {
  const form = $('#dailyForm');
  form.reset();
  const source = day || {
    metrics: {
      date: todayISO(),
      dayNumber: getNextDayNumber(),
      energyDrink: '',
      instagram: ''
    },
    notes: {},
    completed: [],
    penalties: []
  };

  DAILY_METRIC_FIELDS.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = source.metrics?.[field] ?? '';
  });
  NOTE_FIELDS.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = source.notes?.[field] ?? '';
  });
  DAILY_QUESTS.flatMap((quest) => quest.items).forEach((item) => setChecked(form, `q_${item.id}`, source.completed?.includes(item.id)));
  PENALTIES.forEach((item) => setChecked(form, `p_${item.id}`, source.penalties?.includes(item.id)));
  updateDailyPreview();
}

function fillWeeklyForm(week) {
  const form = $('#weeklyForm');
  form.reset();
  const range = getCurrentWeekRange();
  const source = week || {
    metrics: {
      weekNumber: getSeasonWeekNumber(),
      startDate: range.start,
      endDate: range.end
    },
    notes: {},
    completed: []
  };

  WEEKLY_METRIC_FIELDS.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = source.metrics?.[field] ?? '';
  });
  WEEKLY_NOTE_FIELDS.forEach((field) => {
    if (form.elements[field]) form.elements[field].value = source.notes?.[field] ?? '';
  });
  WEEKLY_BOSSES.flatMap((boss) => boss.items).forEach((item) => setChecked(form, `b_${item.id}`, source.completed?.includes(item.id)));
  updateWeeklyPreview();
}

function getNextDayNumber() {
  const max = state.days.reduce((value, day) => Math.max(value, Number(day.metrics?.dayNumber || 0)), 0);
  return max + 1;
}

function getSeasonWeekNumber() {
  const start = new Date(state.profile.startDate || todayISO());
  const now = new Date(todayISO());
  const diffMs = now - start;
  return Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1);
}

function getCurrentWeekRange() {
  const now = new Date(todayISO());
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toISODate(monday), end: toISODate(sunday) };
}

function toISODate(date) {
  const tz = date.getTimezoneOffset() * 60000;
  return new Date(date - tz).toISOString().slice(0, 10);
}

function getCurrentWeekDays() {
  const { start, end } = getCurrentWeekRange();
  return state.days.filter((day) => (day.metrics?.date || day.id) >= start && (day.metrics?.date || day.id) <= end);
}

function getTotals() {
  const dailyXp = state.days.reduce((sum, day) => sum + Math.max(0, Number(day.netXp || 0)), 0);
  const weeklyXp = state.weeks.reduce((sum, week) => sum + Math.max(0, Number(week.totalXp || 0)), 0);
  const statXp = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));

  state.days.forEach((day) => {
    Object.entries(day.categoryXp || {}).forEach(([stat, value]) => {
      statXp[stat] = (statXp[stat] || 0) + Number(value || 0);
    });
  });
  state.weeks.forEach((week) => {
    Object.entries(week.categoryXp || {}).forEach(([stat, value]) => {
      statXp[stat] = (statXp[stat] || 0) + Number(value || 0);
    });
  });

  return { dailyXp, weeklyXp, totalXp: dailyXp + weeklyXp, statXp };
}

function renderDashboard() {
  const totals = getTotals();
  const level = getLevel(totals.totalXp);
  const currentWeekDays = getCurrentWeekDays();
  const weekXp = currentWeekDays.reduce((sum, day) => sum + Math.max(0, Number(day.netXp || 0)), 0);
  const lastDay = [...state.days].sort((a, b) => (b.metrics?.date || '').localeCompare(a.metrics?.date || ''))[0];

  $('#seasonTitle').textContent = state.profile.seasonName || 'Москва / Сушка / Работа';
  $('#statusRank').textContent = getStatusRank(totals.totalXp);
  $('#levelValue').textContent = level.level;
  $('#levelProgressText').textContent = `${totals.totalXp - level.currentFloor} / ${level.next - level.currentFloor} XP`;
  $('#levelProgressBar').style.width = `${level.progress}%`;
  $('#totalXpValue').textContent = totals.totalXp;
  $('#lastDayRank').textContent = lastDay?.rank || '—';
  $('#lastDayXp').textContent = lastDay ? `${lastDay.netXp} XP • ${formatDate(lastDay.metrics.date)}` : 'нет отчёта';
  $('#weekXpValue').textContent = `${weekXp} XP`;
  $('#weekReportsValue').textContent = `${currentWeekDays.length} отчётов`;

  renderStatBars(totals.statXp);
  renderWeeklyMinimum(currentWeekDays);
  renderRecentDays();
}

function renderStatBars(statXp) {
  const container = $('#statBars');
  container.innerHTML = STAT_KEYS.map((stat) => {
    const xp = Number(statXp[stat] || 0);
    const pct = Math.min(100, (xp % 1000) / 10);
    return `
      <div>
        <div class="bar-top"><span>${escapeHTML(stat)}</span><strong>${xp} XP</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');
}

function renderWeeklyMinimum(days) {
  const trainings = days.filter((day) => day.completed?.includes('body_training')).length;
  const workLogs = days.filter((day) => day.completed?.includes('work_log')).length;
  const projectSessions = days.filter((day) => day.completed?.includes('creator_project30')).length;
  const reports = days.length;
  const instaControl = days.filter((day) => !day.penalties?.includes('insta_slip')).length;
  const bodyMeasure = days.some((day) => day.metrics?.weight && day.metrics?.waist);
  const social = days.some((day) => day.completed?.includes('charisma_contact') || day.completed?.includes('charisma_message'));

  const items = [
    { text: '3 тренировки', value: `${trainings}/3`, ok: trainings >= 3 },
    { text: '5 рабочих журналов', value: `${workLogs}/5`, ok: workLogs >= 5 },
    { text: '3 проектные сессии', value: `${projectSessions}/3`, ok: projectSessions >= 3 },
    { text: '7 коротких отчётов', value: `${reports}/7`, ok: reports >= 7 },
    { text: 'инста под контролем', value: `${instaControl}/${reports || 7}`, ok: reports >= 1 && instaControl === reports },
    { text: 'вес + талия', value: bodyMeasure ? 'есть' : 'нет', ok: bodyMeasure },
    { text: '1 социальное действие', value: social ? 'есть' : 'нет', ok: social }
  ];

  $('#weeklyMinimumList').innerHTML = items.map((item) => `
    <li><span>${escapeHTML(item.text)}</span><strong class="${item.ok ? 'ok' : 'bad'}">${escapeHTML(item.value)}</strong></li>
  `).join('');
}

function renderRecentDays() {
  const recent = [...state.days].sort((a, b) => (b.metrics?.date || '').localeCompare(a.metrics?.date || '')).slice(0, 5);
  $('#recentDays').innerHTML = recent.length ? recent.map(dayHistoryItem).join('') : '<p class="muted">Пока пусто. Заполни первый день.</p>';
}

function dayHistoryItem(day) {
  const notes = [day.notes?.creatorProject, day.notes?.creatorDone, day.notes?.workDone].filter(Boolean).slice(0, 2).join(' • ');
  return `
    <article class="history-item">
      <div class="history-item-top">
        <div>
          <div class="history-title">${formatDate(day.metrics?.date)} — ${escapeHTML(day.rank)}</div>
          <div class="history-meta">${day.netXp} XP • плюс ${day.positiveXp} • штраф ${day.penaltyXp}</div>
        </div>
        <div class="history-actions">
          <button class="mini-btn" type="button" data-edit-day="${escapeHTML(day.id)}">Открыть</button>
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
          <div class="history-title">Неделя ${escapeHTML(week.id)} — ${week.result === 'passed' ? 'закрыта' : 'не закрыта'}</div>
          <div class="history-meta">${week.totalXp} XP • ${formatDate(week.metrics?.startDate)} — ${formatDate(week.metrics?.endDate)}</div>
        </div>
        <div class="history-actions">
          <button class="mini-btn" type="button" data-edit-week="${escapeHTML(week.id)}">Открыть</button>
          <button class="mini-btn" type="button" data-delete-week="${escapeHTML(week.id)}">Удалить</button>
        </div>
      </div>
      ${week.notes?.weekSummary ? `<div class="history-meta">${escapeHTML(week.notes.weekSummary)}</div>` : ''}
    </article>
  `;
}

function renderHistory() {
  const days = [...state.days].sort((a, b) => (b.metrics?.date || '').localeCompare(a.metrics?.date || ''));
  const weeks = [...state.weeks].sort((a, b) => Number(b.id) - Number(a.id));
  $('#historyDays').innerHTML = days.length ? days.map(dayHistoryItem).join('') : '<p class="muted">Дней пока нет.</p>';
  $('#historyWeeks').innerHTML = weeks.length ? weeks.map(weekHistoryItem).join('') : '<p class="muted">Недель пока нет.</p>';
}

function renderSettings() {
  const form = $('#settingsForm');
  form.elements.playerName.value = state.profile.playerName || '';
  form.elements.seasonName.value = state.profile.seasonName || '';
  form.elements.startDate.value = state.profile.startDate || todayISO();
  form.elements.seasonGoal.value = state.profile.seasonGoal || '';
  $('#chatPrompt').textContent = buildChatPrompt();
}

function buildChatPrompt() {
  const totals = getTotals();
  return `PRIME RPG — разбор дня

Текущий сезон: ${state.profile.seasonName || 'Москва / Сушка / Работа'}
Текущий XP: ${totals.totalXp}
Текущий статус: ${getStatusRank(totals.totalXp)}

Разбери мой дневной отчёт по системе PRIME RPG:
1. Посчитай XP по квестам.
2. Посчитай штрафы.
3. Дай ранг дня.
4. Обнови статы BODY/FIGHTER/MIND/WORK/CREATOR/CALM/DISCIPLINE/CHARISMA/MONEY.
5. Коротко скажи, что было нормально.
6. Коротко скажи, где просадка.
7. Дай 3 квеста на завтра.

Стиль: коротко, жёстко, без воды, без мотивационного цирка.`;
}

function saveSettings(event) {
  event.preventDefault();
  const form = $('#settingsForm');
  state.profile = {
    ...state.profile,
    playerName: form.elements.playerName.value.trim(),
    seasonName: form.elements.seasonName.value.trim() || 'Москва / Сушка / Работа',
    startDate: form.elements.startDate.value || todayISO(),
    seasonGoal: form.elements.seasonGoal.value.trim()
  };
  saveState();
  renderAll();
  showToast('Профиль сохранён');
}

function switchTab(tabId) {
  $$('.tab-btn').forEach((button) => button.classList.toggle('active', button.dataset.tab === tabId));
  $$('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === tabId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exportData() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `prime-rpg-backup-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('JSON экспортирован');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result));
      if (!imported || typeof imported !== 'object') throw new Error('bad file');
      state = {
        ...defaultState(),
        ...imported,
        profile: { ...defaultState().profile, ...(imported.profile || {}) },
        days: Array.isArray(imported.days) ? imported.days : [],
        weeks: Array.isArray(imported.weeks) ? imported.weeks : []
      };
      saveState();
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
  const days = [...state.days].sort((a, b) => (b.metrics?.date || '').localeCompare(a.metrics?.date || '')).slice(0, 7).reverse();
  const totals = getTotals();
  const lines = [
    'PRIME RPG — сводка',
    `Total XP: ${totals.totalXp}`,
    `Status: ${getStatusRank(totals.totalXp)}`,
    '',
    'Последние дни:'
  ];
  days.forEach((day) => {
    lines.push(`${formatDate(day.metrics?.date)} — ${day.netXp} XP — ${day.rank}`);
  });
  return lines.join('\n');
}

function deleteDay(id) {
  state.days = state.days.filter((day) => day.id !== id);
  saveState();
  renderAll();
  showToast('День удалён');
}

function deleteWeek(id) {
  state.weeks = state.weeks.filter((week) => week.id !== id);
  saveState();
  renderAll();
  showToast('Неделя удалена');
}

function handleHistoryClick(event) {
  const editDay = event.target.closest('[data-edit-day]');
  const deleteDayButton = event.target.closest('[data-delete-day]');
  const editWeek = event.target.closest('[data-edit-week]');
  const deleteWeekButton = event.target.closest('[data-delete-week]');

  if (editDay) {
    const day = state.days.find((item) => item.id === editDay.dataset.editDay);
    if (day) {
      fillDailyForm(day);
      switchTab('daily');
    }
  }
  if (deleteDayButton) deleteDay(deleteDayButton.dataset.deleteDay);
  if (editWeek) {
    const week = state.weeks.find((item) => item.id === editWeek.dataset.editWeek);
    if (week) {
      fillWeeklyForm(week);
      switchTab('weekly');
    }
  }
  if (deleteWeekButton) deleteWeek(deleteWeekButton.dataset.deleteWeek);
}

function renderAll() {
  renderDashboard();
  renderHistory();
  renderSettings();
  updateDailyPreview();
  updateWeeklyPreview();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('SW registration failed', error));
  }
}

function bindEvents() {
  $$('.tab-btn').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  $('#dailyForm').addEventListener('input', updateDailyPreview);
  $('#dailyForm').addEventListener('change', updateDailyPreview);
  $('#dailyForm').addEventListener('submit', saveDaily);
  $('#weeklyForm').addEventListener('input', updateWeeklyPreview);
  $('#weeklyForm').addEventListener('change', updateWeeklyPreview);
  $('#weeklyForm').addEventListener('submit', saveWeekly);
  $('#settingsForm').addEventListener('submit', saveSettings);
  $('#fillTodayBtn').addEventListener('click', () => fillDailyForm());
  $('#clearDailyBtn').addEventListener('click', () => fillDailyForm());
  $('#fillWeekBtn').addEventListener('click', () => fillWeeklyForm());
  $('#clearWeeklyBtn').addEventListener('click', () => fillWeeklyForm());
  $('#exportBtn').addEventListener('click', exportData);
  $('#importFile').addEventListener('change', (event) => importData(event.target.files[0]));
  $('#copyPromptBtn').addEventListener('click', () => copyText($('#chatPrompt').textContent, 'Промпт скопирован'));
  $('#copySummaryBtn').addEventListener('click', () => copyText(buildHistorySummary(), 'Сводка скопирована'));
  $('#history').addEventListener('click', handleHistoryClick);
  $('#dashboard').addEventListener('click', handleHistoryClick);
  $('#resetBtn').addEventListener('click', () => {
    const ok = window.confirm('Стереть все дни, недели и настройки PRIME RPG?');
    if (!ok) return;
    state = defaultState();
    saveState();
    fillDailyForm();
    fillWeeklyForm();
    renderAll();
    showToast('Система сброшена');
  });
}

function init() {
  renderDailyQuests();
  renderWeeklyBosses();
  bindEvents();
  fillDailyForm();
  fillWeeklyForm();
  renderAll();
  registerServiceWorker();
}

init();
