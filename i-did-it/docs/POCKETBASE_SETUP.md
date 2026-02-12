# Настройка PocketBase

## Установка

1. Скачай PocketBase с https://pocketbase.io/docs/
2. Распакуй в папку `pocketbase/` в корне проекта
3. Запусти: `./pocketbase serve`
4. Открой админку: http://127.0.0.1:8090/_/
5. Создай админ-аккаунт

## Настройка коллекции users

В PocketBase коллекция **users** уже есть (Auth collection). Добавь поля:

| Поле | Тип | Настройки |
|------|-----|-----------|
| username | text | unique, required, min: 3, max: 30 |
| first_name | text | — |
| last_name | text | — |
| bio | text | max: 500 |
| avatar | file | single, max size: 2MB, mime types: image/* |
| followers_count | number | default: 0 |
| following_count | number | default: 0 |
| goals_count | number | default: 0 |
| completed_goals_count | number | default: 0 |

### API Rules для users

| Действие | Правило |
|----------|--------|
| List/Search | `@request.auth.id != ""` — только авторизованные видят список |
| View | `""` — все могут смотреть профиль |
| Create | автоматически при регистрации |
| Update | `@request.auth.id = id` — только свой профиль |
| Delete | `@request.auth.id = id` — только свой профиль |

## Схема проекта

Справочный файл схемы: [pb_schema.json](../pb_schema.json).  
Коллекции создаются через админку. Экспорт схемы: `./pocketbase migrate collections`.
