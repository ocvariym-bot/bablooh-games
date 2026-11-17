BABLOOH GAMES — Telegram Mini App

Содержимое:
- index.html — меню приложения
- flappy.html — Flappy Bablooh
- eggs.html — Баблух ловит яйца
- doodle.html — Doodle Bablooh
- ninja.html — BABLOOH Ninja
- bablooh-head.png — базовый спрайт BABLOOH Ninja
- doodle-enemy-1.png ... doodle-enemy-3.png — враги Doodle
- ninja-target-1.png, ninja-target-2.png — игровые цели BABLOOH Ninja
- game-over.png — изображение на экране поражения

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


ОБНОВЛЕНИЕ ФОНА И DOODLE:
- Во всех играх переходы между цветовыми темами фона выполняются постепенно.
- В Doodle можно победить врага, приземлившись на него сверху: враг падает, наклоняется и исчезает, игрок получает дополнительный отскок и 50 очков.
- При боковом или нижнем столкновении с живым врагом игра заканчивается.
- Платформы в Doodle стали шире и располагаются чаще; интервалы между ними уменьшены, а доля ломающихся платформ снижена для более комфортного прохождения.


FIX — DOODLE START / JUMP
- Rebuilt Doodle's start and jump loop to ensure the first jump starts reliably.
- Added a guaranteed starting platform staircase and closer platform spacing.
- Kept enemy stomp/death animation, side collision defeat, controls, and Supabase score submission.
