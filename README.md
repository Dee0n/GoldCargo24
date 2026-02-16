# GoldCargo24

Сайт карго-компании по доставке товаров из Китая в Казахстан.

## Стек

- Next.js 15, TypeScript
- PostgreSQL, Prisma
- Tailwind CSS, shadcn/ui
- JWT авторизация (jose)
- Парсинг Excel (xlsx)
- Docker Compose для деплоя

## Запуск

```bash
npm install
cp .env.example .env
# прописать DATABASE_URL и JWT_SECRET в .env
npm run setup
npm run dev
```

Откроется на http://localhost:3000

## Скрипты

| Команда | Что делает |
|---------|-----------|
| `npm run dev` | Дев-сервер |
| `npm run build` | Продакшн-сборка |
| `npm run setup` | Инициализация БД (generate + migrate + seed) |
| `npm run db:studio` | Prisma Studio |

## Деплой

```bash
cp .env.example .env
# заполнить .env
docker compose up -d
```

SSL через certbot, nginx конфиг в `nginx.conf`.

## Структура

```
src/
├── app/
│   ├── (auth)/       — логин, регистрация
│   ├── (client)/     — клиентский кабинет
│   ├── (admin)/      — админка
│   └── api/          — API
├── lib/              — утилиты, авторизация, импорт xlsx
└── components/       — UI компоненты
```

## Формат XLSX

Файл со склада в Китае, колонки: 快递单号, 总单号, 客户姓名, 添加时间, 更新时间, 状态.

## Дефолтный вход

Админ: `77001234567` / `admin123`
