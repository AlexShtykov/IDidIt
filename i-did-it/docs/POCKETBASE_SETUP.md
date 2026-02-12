# Настройка PocketBase

## Установка

1. Скачай PocketBase с https://pocketbase.io/docs/
2. Распакуй в папку `pocketbase/` в корне проекта
3. Запусти:
   - **Linux/macOS:** `./pocketbase serve`
   - **Windows PowerShell:** `.\pocketbase.exe serve` (обязательно `.\` — иначе команда не найдена)
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
| **Create** | **оставьте пустым** (пустая строка `""`) — иначе регистрация выдаст "Failed to create record" |
| Update | `@request.auth.id = id` — только свой профиль |
| Delete | `@request.auth.id = id` — только свой профиль |

По умолчанию Create в PocketBase заблокирован: создавать записи могут только админы. Чтобы пользователи могли регистрироваться, в админке: **Collections → users → API Rules → Create** — очистите поле (должна быть пустая строка).

### Если при сохранении профиля появляется "Something went wrong" или 403

Чаще всего это из‑за правила **Update**. В админке: **Collections → users → API Rules** в поле **Update** должно быть ровно:

```txt
@request.auth.id = id
```

(без кавычек; `id` — это ID записи, которую обновляют). Если правило пустое или заблокировано — пользователь не сможет обновить свой профиль.

## Коллекция: goals

Тип: **Base collection**

### Поля

| Поле | Тип | Настройки |
|------|-----|-----------|
| user | relation | → users, required, single (автор) |
| title | text | required, min: 1, max: 200 |
| description | text | max: 5000 |
| target_date | date | — (дедлайн) |
| status | select | active, completed, cancelled; default: active |
| status_comment | text | — (комментарий при завершении) |
| status_image | file | single, image/* (фото результата) |
| images | file | multiple, max 5, image/* (галерея цели) |
| views_count | number | default: 0 |
| likes_count | number | default: 0 |
| comments_count | number | default: 0 |

### API Rules для goals

**Важно:** если не настроить правила, по умолчанию List и View доступны только суперадминам — в приложении появится ошибка **"Only superusers can perform this action"**.

1. Открой **Collections → goals**.
2. Перейди на вкладку **API Rules**.
3. Для **List/Search** и **View**:
   - Убери галочку «Allow only admins» / «Superusers only», если она стоит.
   - Оставь поле правила **пустым** (полностью очисти текст) — пустое правило = «разрешить всем».
4. Сохрани коллекцию (кнопка внизу).

| Действие   | Правило | Что сделать в админке |
|------------|--------|------------------------|
| List/Search | пусто | Поле оставить пустым, доступ не только для админов |
| View        | пусто | Поле оставить пустым, доступ не только для админов |
| Create      | `@request.auth.id != ""` | Только авторизованные могут создавать цели |
| Update      | `@request.auth.id = user` | Только автор цели может редактировать |
| Delete      | `@request.auth.id = user` | Только автор цели может удалять |

В правилах Update/Delete поле `user` — это ID автора цели; сравнение с `@request.auth.id` ограничивает действие только автором.

### Ошибка «Only superusers can perform this action» на странице «Мои цели»

Ошибка означает, что для коллекции **goals** действия **List** и/или **View** разрешены только администраторам. Исправление:

1. Админка PocketBase → **Collections** → **goals**.
2. Вкладка **API Rules**.
3. **List/Search**: поле правила должно быть **пустым** (ничего не вписано). Если есть галочка вроде «Only admins» / «Superusers» — сними её.
4. **View**: то же — пустое поле, без ограничения «только админы».
5. Нажми **Save** внизу страницы.

После этого обнови страницу «Мои цели» в приложении.

---

## Коллекция: subtasks

Тип: **Base collection**

### Поля

| Поле | Тип | Настройки |
|------|-----|-----------|
| goal | relation | → goals, required, single, **cascade delete** |
| title | text | required, max: 200 |
| target_date | date | — |
| is_completed | bool | default: false |
| completed_at | date | — |
| sort_order | number | default: 0 |

### API Rules для subtasks

| Действие | Правило |
|----------|--------|
| List/Search | `""` |
| View | `""` |
| Create | `@request.auth.id = goal.user` — только автор цели |
| Update | `@request.auth.id = goal.user` — только автор цели |
| Delete | `@request.auth.id = goal.user` — только автор цели |

В правилах обращение `goal.user` даёт ID пользователя — автора цели. PocketBase разрешает обращение к полям связанной записи в API Rules.

---

## Коллекция: entries

Тип: **Base collection**

### Поля

| Поле | Тип | Настройки |
|------|-----|-----------|
| goal | relation | → goals, required, single, **cascade delete** |
| user | relation | → users, required, single (автор / владелец цели) |
| content | text | required, max: 10000 |
| attachments | file | multiple, max 10 (картинки и документы) |
| likes_count | number | default: 0 |
| comments_count | number | default: 0 |

### API Rules для entries

| Действие | Правило |
|----------|--------|
| List/Search | `""` |
| View | `""` |
| Create | `@request.auth.id = goal.user.id` — только автор цели может добавлять записи |
| Update | `@request.auth.id = user.id` — только автор записи |
| Delete | `@request.auth.id = user.id` — только автор записи |

---

## Схема проекта

Справочный файл схемы: [pb_schema.json](../pb_schema.json).  
Коллекции создаются через админку. Экспорт схемы: `./pocketbase migrate collections`.
