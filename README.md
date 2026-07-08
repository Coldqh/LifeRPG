# PRIME RPG

Личная RPG-система прокачки реальной жизни.

Работает как статическое приложение: `HTML + CSS + JavaScript`. Сервер не нужен. Данные хранятся в браузере через `localStorage`.

## Что внутри

- ежедневный отчёт;
- дневные квесты BODY / WORK / CREATOR / CALM / MIND / CHARISMA / DISCIPLINE / MONEY;
- штрафы;
- автоматический подсчёт XP;
- ранги дня;
- общий уровень;
- статус-ранг;
- статы персонажа;
- недельные боссы;
- обязательный минимум недели;
- история дней и недель;
- экспорт/импорт JSON;
- PWA manifest;
- service worker для базового офлайн-кэша.

## Быстрый запуск локально

Открой `index.html` в браузере.

Лучше через маленький локальный сервер:

```bash
python -m http.server 8080
```

Потом открыть:

```text
http://localhost:8080
```

## Хостинг на GitHub Pages

### Вариант 1 — через ветку main

1. Создай репозиторий на GitHub.
2. Загрузи все файлы из этой папки в корень репозитория.
3. Проверь, что `index.html` лежит в корне.
4. Открой `Settings` → `Pages`.
5. В `Build and deployment` выбери:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Сохрани.
7. Через минуту сайт будет доступен по ссылке GitHub Pages.

### Вариант 2 — через GitHub Actions

В проекте уже есть workflow:

```text
.github/workflows/pages.yml
```

Для этого в `Settings` → `Pages` выбери Source: `GitHub Actions`.

## Важно

Данные лежат в браузере. Если почистить данные сайта — отчёты исчезнут.

Раз в неделю нажимай `Экспорт` и сохраняй backup JSON.

## Структура

```text
prime-rpg-app/
├── index.html
├── styles.css
├── app.js
├── manifest.json
├── sw.js
├── .nojekyll
├── README.md
├── assets/
│   └── icon.svg
└── .github/
    └── workflows/
        └── pages.yml
```

## PRIME RPG v0.1

Это первая рабочая версия. Она не идеальная. Она должна делать главное: фиксировать день, считать XP, держать ритм.
