# PRIME RPG v1.8

Компактный habit tracker / RPG-система прокачки реальной жизни.

Работает как статическое приложение: `HTML + CSS + JavaScript`. Сервер не нужен. Данные хранятся в браузере через `localStorage` + резервный backup-ключ.

## Что внутри

- профиль с уровнем, XP, неделей и статами;
- дневные квесты;
- недельные квесты;
- штрафы;
- pending XP: опыт текущего дня/недели не применяется до закрытия;
- календарь;
- достижения;
- ежедневный случайный челлендж;
- история дней и недель;
- импорт/экспорт backup JSON;
- Quest Pack v2 для обновления дневных и недельных квестов;
- PWA/service worker с network-first стратегией.

## v1.8 — Quest Import 2.0

Главное обновление: один JSON-файл теперь может обновлять сразу:

- `dailyQuests` — дневные квесты;
- `weeklyQuests` — недельные квесты.

Поддерживаются режимы:

- `merge` — добавить новые квесты и обновить совпадающие по `id`;
- `replace` — заменить только категории, которые есть в файле;
- `replace_all` — полностью заменить дневной и/или недельный список из файла.

Максимум: 10 квестов на категорию.

## Формат Quest Pack v2

```json
{
  "type": "prime-rpg-quest-pack",
  "version": 2,
  "packName": "My PRIME RPG Quest Pack",
  "mode": "replace_all",
  "dailyQuests": [],
  "weeklyQuests": []
}
```

Можно использовать разные режимы отдельно:

```json
{
  "type": "prime-rpg-quest-pack",
  "version": 2,
  "dailyMode": "replace_all",
  "weeklyMode": "merge",
  "dailyQuests": [],
  "weeklyQuests": []
}
```

## Пример категории

```json
{
  "category": "BODY",
  "title": "BODY",
  "stat": "BODY",
  "maxXp": 40,
  "items": [
    { "id": "body_training", "text": "тренировка / движение 30+ минут", "xp": 20, "stat": "BODY" }
  ]
}
```

## Локальный запуск

```bash
python -m http.server 8080
```

Потом открыть:

```text
http://localhost:8080
```

## GitHub Pages

После обновления файлов:

```bash
git add .
git commit -m "Update PRIME RPG v1.8 quest import"
git push
```

Открыть:

```text
https://coldqh.github.io/LifeRPG/?v=1.8.0
```

На телефоне после деплоя: `Настройки → Обновить версию`.

## Важно

Данные лежат локально в браузере. Раз в неделю делай экспорт JSON.
