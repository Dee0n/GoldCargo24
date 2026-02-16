# LolaGoldCargo — Система отслеживания посылок

Карго-компания: доставка товаров с китайских маркетплейсов в Казахстан.

## Стек технологий

- **Next.js 15** (App Router, TypeScript)
- **PostgreSQL** + **Prisma ORM v5**
- **Tailwind CSS** + **shadcn/ui**
- **JWT авторизация** (jose) — access (15 мин) + refresh (30 дней)
- **xlsx** — парсинг Excel файлов с китайского склада
- **Docker Compose** — деплой на VPS

## Быстрый старт (локально)

### 1. Установить зависимости

```bash
npm install
```

### 2. Настроить переменные окружения

```bash
cp .env.example .env
# Отредактируйте .env — укажите DATABASE_URL и JWT_SECRET
```

### 3. Запустить PostgreSQL (через Docker)

```bash
docker run -d \
  --name cargo_postgres \
  -e POSTGRES_DB=lolagoldcargo \
  -e POSTGRES_USER=cargo \
  -e POSTGRES_PASSWORD=cargo_secret \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Инициализировать базу данных

```bash
npm run setup
# Выполняет: prisma generate + migrate deploy + seed
# Создаёт: admin (phone: 77001234567, password: admin123) + статусы + настройки
```

### 5. Запустить сервер разработки

```bash
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Сервер разработки |
| `npm run build` | Сборка для продакшн |
| `npm run start` | Запуск продакшн сборки |
| `npm run db:generate` | Генерация Prisma клиента |
| `npm run db:migrate` | Создать и применить миграцию (dev) |
| `npm run db:push` | Синхронизировать схему без миграций |
| `npm run db:seed` | Сидировать базу (admin + статусы + настройки) |
| `npm run db:studio` | Открыть Prisma Studio |
| `npm run setup` | Полная инициализация (generate + migrate + seed) |

## Деплой на VPS (Docker Compose)

### 1. Настроить .env на сервере

```bash
cp .env.example .env
# Обязательно измените:
# DB_PASSWORD=ваш_безопасный_пароль
# JWT_SECRET=очень_длинная_случайная_строка_64_символа
# JWT_REFRESH_SECRET=ещё_одна_длинная_случайная_строка
# ADMIN_PHONE=ваш_номер_телефона
# ADMIN_PASSWORD=ваш_безопасный_пароль
```

### 2. Получить SSL сертификат

```bash
apt install certbot
certbot certonly --standalone -d goldcargo24.kz -d www.goldcargo24.kz
```

### 3. Обновить nginx.conf

Замените `goldcargo24.kz` на ваш домен в `nginx.conf`.

### 4. Запустить

```bash
docker compose up -d
```

### 5. Проверить логи

```bash
docker compose logs -f app
```

## Структура проекта

```
src/
├── app/
│   ├── (auth)/          # Страницы входа и регистрации
│   ├── (client)/        # Клиентские страницы (посылки, профиль)
│   ├── (admin)/         # Админ панель
│   └── api/             # API роуты
├── lib/
│   ├── prisma.ts        # Prisma клиент
│   ├── auth/            # JWT, пароли, middleware
│   ├── xlsx/            # Импортёр XLSX файлов
│   └── validations/     # Zod схемы
└── components/
    ├── ui/              # shadcn/ui компоненты
    ├── shared/          # StatusBadge, TrackTimeline
    ├── layout/          # Навигация, сайдбар
    └── providers/       # AuthProvider
```

## Формат XLSX файла

Для загрузки файлов с китайского склада требуются колонки:

| Китайское название | Описание |
|--------------------|----------|
| 快递单号 | Трек-номер |
| 总单号 | Номер партии |
| 客户姓名 | Код клиента |
| 添加时间 | Дата добавления |
| 更新时间 | Дата обновления |
| 状态 | Статус (на китайском) |

Статусы автоматически маппируются через поле `chineseName` в настройках статусов.

## Дефолтные данные (после seed)

**Админ:** телефон `77001234567`, пароль `admin123`

**Статусы:**
- Ожидает (серый)
- На складе в Китае / 已入库 (жёлтый)
- Отправлено из Китая / 已出库 (синий)
- В пути / 运输中 (фиолетовый)
- На складе в Казахстане / 已到达 (зелёный)
- Готов к выдаче / 待取件 (бирюзовый)
- Выдан / 已签收 (ярко-зелёный) ✓ финальный
