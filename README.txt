BABLOOH GAMES — Telegram Mini App

Содержимое:
- index.html — меню приложения
- flappy.html — Flappy Bablooh
- eggs.html — Баблух ловит яйца
- doodle.html — Doodle Bablooh
- ninja.html — BABLOOH Ninja
- bablooh-head.png — PNG-спрайт головы для BABLOOH Ninja

Публикация:
1. Загрузите все HTML-файлы и bablooh-head.png в один публичный сайт/репозиторий.
2. Включите HTTPS-хостинг (например, GitHub Pages или Netlify).
3. Убедитесь, что главная страница открывается по адресу https://...
4. В @BotFather подключите этот адрес:
   /mybots → выберите бота → Bot Settings → Configure Mini App → Enable Mini App
   либо /setmenubutton, чтобы поставить кнопку запуска в меню чата.
5. Не вставляйте токен бота в HTML и не отправляйте его никому.

Примечание: текущие рекорды хранятся в localStorage конкретного браузера/устройства.
Для общих таблиц рекордов между всеми игроками потребуется сервер и проверка Telegram initData.


GLOBAL LEADERBOARD
The game files now submit best scores to the Supabase Edge Function submit-score using Telegram WebApp initData. The menu reads the public leaderboard view. Keep BOT_TOKEN and SUPABASE_SERVICE_ROLE_KEY only in Supabase secrets; never place them in these files.
