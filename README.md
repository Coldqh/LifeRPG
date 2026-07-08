# PRIME RPG v0.6

Личная RPG-система прокачки реальной жизни.

Статическое приложение: `HTML + CSS + JavaScript`. Сервер не нужен. Данные хранятся в браузере через `localStorage`.

## Что работает

- live-день по Москве;
- автообновление дня в 00:00 МСК;
- автообновление недели в ночь с воскресенья на понедельник;
- ежедневные квесты;
- штрафы;
- XP и ранги дня;
- общий уровень;
- статы персонажа;
- недельные боссы;
- история дней и недель;
- полный сброс истории;
- экспорт/импорт backup JSON;
- импорт кастомных квестов через quest pack JSON;
- максимум 10 квестов на категорию;
- PWA/offline-cache.

## Быстрый запуск локально

```bash
python -m http.server 8080
```

Открыть:

```text
http://localhost:8080
```

## GitHub Pages

1. Загрузи файлы в корень репозитория.
2. Открой `Settings → Pages`.
3. Source: `Deploy from a branch`.
4. Branch: `main`.
5. Folder: `/root`.

Ссылка будет вида:

```text
https://coldqh.github.io/LifeRPG/
```

После обновления открывай с версией:

```text
https://coldqh.github.io/LifeRPG/?v=0.6.0
```

## Quest pack

В настройках можно скачать шаблон задач, отправить его в ChatGPT, заполнить и импортировать обратно.

Минимальный формат:

```json
{
  "type": "prime-rpg-quest-pack",
  "mode": "merge",
  "dailyQuests": [
    {
      "category": "BODY",
      "title": "BODY",
      "stat": "BODY",
      "items": [
        { "text": "мобилити 15 минут", "xp": 10, "stat": "BODY" }
      ]
    }
  ]
}
```

`mode: merge` добавляет квесты.  
`mode: replace` заменяет квесты в указанной категории.

Поддерживаемые статы:

```text
BODY, FIGHTER, MIND, WORK, CREATOR, CALM, DISCIPLINE, CHARISMA, MONEY
```

## Важно

Данные лежат локально в браузере. Раз в неделю делай экспорт backup JSON.
