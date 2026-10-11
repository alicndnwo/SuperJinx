<div align="center">

<img src="readme-hero.svg" width="100%" alt="Super JinX · Marzban on Railway"/>

[فارسی](README.md) | [English](README.en.md) | **Русский** | [中文](README.zh_CN.md)

<br/>

<img src="readme-tag-marzban.svg" alt="Marzban latest"/>
<img src="readme-tag-railway.svg" alt="Railway ready"/>
<img src="readme-tag-xray.svg" alt="Xray WS, HU, XHTTP, Reality"/>
<img src="readme-tag-region.svg" alt="Region Amsterdam"/>
<img src="readme-tag-lang.svg" alt="UI FA EN RU ZH"/>
<img src="readme-tag-license.svg" alt="License AGPL-3.0"/>

<br/><br/>

**Бесплатная VPN-панель Marzban для Railway в один клик.**<br/>
Без VPS, без домена, без сертификатов. Пять минут на установку, и первая ссылка подписки готова.

<br/>

<a href="https://t.me/Super_Jinx"><img src="readme-badge-telegram.svg" height="40" alt="Telegram @Super_Jinx"/></a>
<a href="https://github.com/x4gpanell"><img src="readme-badge-github.svg" height="40" alt="GitHub x4gpanell"/></a>
<img src="readme-badge-free.svg" height="40" alt="100% Free"/>

<br/><br/>

<img src="readme-stats.svg" width="100%" alt="12 methods · 5 minutes · 15s self-heal · 4 languages"/>

</div>

## Обзор

**Super JinX** объединяет официальную панель [Marzban](https://github.com/Gozargah/Marzban), nginx и [Xray-core](https://github.com/XTLS/Xray-core) в один сервис Railway. Всё работает через один порт, TLS обеспечивает Railway на 443, а все настройки, для которых обычно нужен терминал, уже сделаны.

Поверх Marzban добавлены 12 готовых методов подключения, панели реселлеров с ограничениями на стороне сервера, собственная страница подписки, самовосстанавливающийся сторож, защищённый inbound и полностью переведённый интерфейс.

## Содержание

- [Возможности](#возможности)
- [Скриншоты](#скриншоты)
- [Быстрый старт](#быстрый-старт)
- [Как это работает](#как-это-работает)
- [Методы подключения](#методы-подключения)
- [Панели реселлеров](#панели-реселлеров)
- [Страница подписки](#страница-подписки)
- [Самовосстановление](#самовосстановление)
- [Безопасность](#безопасность)
- [Дополнительные маршруты](#дополнительные-маршруты)
- [Переменные окружения](#переменные-окружения)
- [Регионы](#регионы)
- [Рекомендуемые клиенты](#рекомендуемые-клиенты)
- [Решение проблем](#решение-проблем)
- [Поддержка проекта](#поддержка-проекта)
- [Сообщество](#сообщество)

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Возможности

<img src="readme-features.svg" width="100%" alt="Features"/>

- **Установка в один клик** на Railway, первый вход `admin / admin`, смена из меню панели
- **12 прямых методов подключения** на VLESS, VMess, Trojan, WebSocket и HTTPUpgrade, у каждого свой TLS-отпечаток и профиль фрагментации
- **Reality** через Railway TCP Proxy и конфиги **Mirror** на дополнительных доменах
- **Оптимизация скорости**: BBR, heartbeat, early data (`ed=2560`), блокировка QUIC и простые ссылки для всех приложений
- **Панели реселлеров** с мастером создания, готовыми пакетами и серверными лимитами
- **JinX Pass**: страница подписки с отдельной версией для компьютера и телефона, живым пингом и QR
- **Сторож** проверяет каждый компонент каждые 15 секунд и делает ежедневные бэкапы
- **Защищённый inbound**, блокировка входа после 10 неверных паролей и блокировка рекламы на сервере
- **Четыре языка** для всего, что добавляет Super JinX: персидский, английский, русский и китайский

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Скриншоты

<table>
<tr>
<td width="70%"><img src="readme-shot-sub.jpg" alt="Страница подписки на компьютере"/></td>
<td width="30%"><img src="readme-shot-sub-mobile.jpg" alt="Страница подписки на телефоне"/></td>
</tr>
<tr>
<td align="center"><sub>JinX Pass · компьютер</sub></td>
<td align="center"><sub>JinX Pass · телефон</sub></td>
</tr>
<tr>
<td><img src="readme-shot-donate.jpg" alt="Страница поддержки на компьютере"/></td>
<td><img src="readme-shot-donate-mobile.jpg" alt="Страница поддержки на телефоне"/></td>
</tr>
<tr>
<td align="center"><sub>Поддержка · компьютер</sub></td>
<td align="center"><sub>Поддержка · телефон</sub></td>
</tr>
</table>

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Быстрый старт

<img src="readme-deploy.svg" width="100%" alt="Fork, Railway, Amsterdam, Volume, Port 8080, No sleep, Deploy"/>

| Шаг | Действие |
|:--:|---|
| 1 | Поставьте **Star** и сделайте **Fork** этого репозитория |
| 2 | В [Railway](https://railway.com) выберите `New Project` → `Deploy from GitHub repo` и ваш форк |
| 3 | `Settings` → `Deploy` → `Regions` → **EU West (Amsterdam)** |
| 4 | `Attach Volume` с путём **`/var/lib/marzban`** |
| 5 | `Settings` → `Networking` → `Generate Domain` на порту **`8080`** |
| 6 | Убедитесь, что **Serverless / App Sleeping выключен** |
| 7 | **Redeploy** |

<div align="center">

| Панель | Логин | Пароль |
|:--:|:--:|:--:|
| `https://<домен>.up.railway.app/dashboard/` | `admin` | `admin` |

</div>

> [!IMPORTANT]
> После первого входа откройте меню и выберите **смену логина и пароля**. Изменение применяется сразу и сохраняется после редеплоя.

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Как это работает

<img src="readme-flow.svg" width="100%" alt="Phone, Railway Edge, nginx, Xray, Internet"/>

Railway завершает TLS на порту 443 и передаёт трафик в nginx на порт **8080**. nginx обслуживает панель, страницу подписки и все транспорты Xray с одного порта. Сторож **JinX Doctor** проверяет каждый компонент каждые 15 секунд. Сертификаты не нужны и никогда не истекают.

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Методы подключения

<img src="readme-methods.svg" width="100%" alt="12 connection methods"/>

Имя каждого конфига начинается с **جینکس | 𝗝𝗶𝗻𝗫**, далее идут название метода и протокол.

| # | Метод | Протокол | Отпечаток | Примечание |
|:--:|---|---|:--:|---|
| 1 | **Amsterdam Rocket** | JinX Core | ios | Напрямую, полная скорость. Имя меняется вместе с регионом |
| 2 | **Ghost Anti-Filter** | JinX Core | chrome | Сильная фрагментация для заблокированного SNI |
| 3 | **Hyper Drive** | VLESS WS | firefox | — |
| 4 | **Swift Shield** | VLESS WS | chrome | Лёгкая фрагментация |
| 5 | **Vortex** | VMess WS | safari | Полная скорость |
| 6 | **Trident** | Trojan WS | edge | — |
| 7 | **Ninja Stealth** | Trojan WS | random | Сильная фрагментация |
| 8 | **Lightning** | HTTPUpgrade | chrome | Самый лёгкий транспорт, полная скорость |
| 9 | **Meteor** | HTTPUpgrade | ios | Лёгкая фрагментация |
| 10 | **Warp Speed** | XHTTP packet-up | chrome | Короткие запросы, проходит любую сеть |
| 11 | **Nebula** | HTTPUpgrade | firefox | — |
| 12 | **Quantum** | XHTTP stream-up | edge | Один непрерывный поток, высокая скорость |
| + | **Reality Pulse**, **Dark Matter** | Reality | chrome, firefox | При включённом TCP Proxy |
| + | **Mirror** | JinX Core, HTTPUpgrade | chrome | Дополнительные домены сервиса |

Два конфига XHTTP (как в панели Vodiwalker) работают с `alpn=h2,http/1.1`; `JINX_XHTTP=0` выключает их. Если транспорта нет, те же имена переходят на следующий (HTTPUpgrade, затем WebSocket): конфигов всегда 12, без повторов.

### Оптимизация скорости

Всё включено автоматически.

| Функция | Эффект |
|---|---|
| **16k соединений** | nginx принимает до 16 384 соединений на worker, загруженная панель не тормозит |
| **Без Mux** | Hiddify, Clash и sing-box подключаются без проблем |
| **BBR** | Стабильная скорость в мобильных сетях, если ядро это позволяет |
| **Heartbeat** | Небольшой пинг каждые 30 секунд не даёт оператору закрыть простаивающую линию |
| **Early data** | На один круг меньше при каждом соединении |
| **Блокировка QUIC** | Браузеры и YouTube переходят на TCP, внутри туннеля это плавнее |
| **HTTP-тест задержки** | sing-box и Clash тестируют на один круг быстрее |
| **Простые ссылки для всех приложений** | Каждое приложение само собирает конфиг; полный JSON включается переменной |

> [!TIP]
> Только реальный пинг, никаких фальшивых чисел. В v2rayNG или V2Box укажите тестовый адрес `http://cp.cloudflare.com/` и запустите групповой тест.

### Reality

1. `Settings` → `Networking` → **TCP Proxy** с портом приложения **`2010`**
2. **Redeploy**. Конфиги **Reality Pulse** и **Dark Matter** добавятся в каждую подписку автоматически.

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Панели реселлеров

Откройте меню и выберите **Панели реселлеров**. Пункт виден только главному администратору.

| Параметр | Описание |
|---|---|
| **Пакеты** | Бронза `10 · 100 ГБ · 30 д`, Серебро `50 · 500 ГБ · 30 д`, Золото `100 · 1 ТБ · 30 д`, Бриллиант `500 · 5 ТБ · 90 д`, Свой |
| **Проверка на лету** | Занятые имена и неверные лимиты видны сразу |
| **Надёжный пароль** | Генератор на 14 символов с индикатором надёжности |
| **Предпросмотр и выдача** | Живая карточка, копирование каждого поля, копировать всё и поделиться |
| **Пополнение и продление** | Трафик, дни и слоты пользователей за один шаг |
| **История** | Все действия реселлера с датой и временем |
| **Серверные лимиты** | Количество пользователей, трафик и срок обойти нельзя |

Реселлеры входят по адресу **`https://<домен>/agent/`** и видят отдельное приветствие. При удалении реселлера его пользователи сохраняются и переходят главному администратору.

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Страница подписки

- Светящаяся карточка с трафиком, сроком и статусом
- Отдельные версии для **компьютера** и **телефона**
- Живой пинг у каждого конфига и рекомендованный выбор
- Импорт в одно касание для Android, iOS и Windows
- Надёжное копирование, встроенные QR-коды, копировать всё и скачать файл конфигов
- Помощник **JinX Care** проверяет часы телефона, соединение, сервер и пинг
- Тёмная и светлая темы, персидский и английский
- Никаких внешних запросов

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Самовосстановление

| Если сломается | JinX Doctor сделает |
|---|---|
| nginx | Запустит его снова |
| Ядро Xray | Каждые 60 секунд проверяет реальное соединение и при необходимости перезапускает ядро |
| Панель не отвечает | Чисто перезапускает весь сервис |
| Повреждённый конфиг Xray | Сохраняет копию и собирает заново |
| Ссылки подписки | Каждые 20 секунд поддерживает хосты в порядке |
| Страница подписки или поддержки | Восстанавливает из эталонной копии |
| База данных | Ежедневный бэкап, хранятся последние 7 |

> Укажите `DOCTOR_TG_TOKEN` и `DOCTOR_TG_CHAT`, чтобы получать уведомления в Telegram.

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Безопасность

| | |
|---|---|
| **Учётные данные** | Логин и пароль меняются из меню, сразу и навсегда |
| **Блокировка входа** | 10 неверных паролей закрывают вход на 5 минут, по IP и по имени пользователя на сервере |
| **Защищённый inbound** | Core settings только для чтения, конфиг Xray пересобирается при каждом запуске, хосты восстанавливаются за 20 секунд |
| **Сохранность данных** | База, пользователи и реселлеры хранятся на томе Railway |

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Дополнительные маршруты

<details>
<summary><b>Ретранслятор в Иране</b></summary>

<br/>

```
Client  ──►  Iran VPS :443  ══ TLS passthrough ══►  Railway
```

```bash
sudo bash iran-relay.sh xxxx.up.railway.app
```

Затем укажите `IRAN_RELAY_IP=<ip сервера>` в Railway и сделайте редеплой.

</details>

<details>
<summary><b>Cloudflare Tunnel</b></summary>

<br/>

1. Подключите домен к Cloudflare.
2. `Zero Trust` → `Networks` → `Tunnels` → `Create a tunnel` (Cloudflared), скопируйте токен.
3. Добавьте public hostname с сервисом `HTTP` → `127.0.0.1:8080`.
4. Укажите переменные и сделайте редеплой:

```env
CF_TUNNEL_TOKEN=<токен>
CF_TUNNEL_HOSTNAME=jinx.example.com
CF_CLEAN_IP=<необязательный clean IP>
```

</details>

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Переменные окружения

Все переменные необязательны.

<details>
<summary><b>Полный список</b></summary>

<br/>

| Переменная | По умолчанию | Описание |
|---|---|---|
| `PANEL_DOMAIN` | | Свой домен |
| `RESET_ADMIN_PASSWORD` | | `1` сбрасывает вход на `admin / admin`, затем удалите переменную |
| `SUB_UPDATE_INTERVAL` | `6` | Интервал автообновления подписки в часах |
| `DOCTOR_TG_TOKEN`, `DOCTOR_TG_CHAT` | | Уведомления в Telegram |
| `TELEGRAM_API_TOKEN`, `TELEGRAM_ADMIN_ID` | | Собственный Telegram-бот Marzban |
| `CF_TUNNEL_TOKEN`, `CF_TUNNEL_HOSTNAME` | | Cloudflare Tunnel |
| `CF_CLEAN_IP`, `CF_PORTS` | `443,2053,8443` | Clean IP и порты |
| `IRAN_RELAY_IP`, `IRAN_RELAY_PORT` | `443` | Ретранслятор в Иране |
| `JINX_EXTRA_DOMAINS` | | Дополнительные домены, по конфигу Mirror на каждый |
| `JINX_REALITY_SNI` | `www.speedtest.net` | Сайт-прикрытие Reality |
| `JINX_FRAGMENT` | `10-20,10-20,tlshello` | Сильная фрагментация, пусто = выключено |
| `JINX_FRAGMENT_LIGHT` | `100-200,1-3,tlshello` | Лёгкая фрагментация |
| `JINX_MUX` | `0` | `1` = включить (только v2rayNG с JSON) |
| `JINX_BBR`, `JINX_ADBLOCK`, `JINX_FAST`, `JINX_REALITY` | `1` | `0` выключает функцию |
| `JINX_HEARTBEAT` | `30` | Секунды, `0` выключает |
| `USE_CUSTOM_JSON_FOR_V2RAYNG` | `False` | `True` = полный JSON для v2rayNG, v2rayN, Streisand и Happ |

</details>

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Регионы

| Регион Railway | Статус |
|---|:--:|
| **EU West · Amsterdam** | Рекомендуется |
| US East · Virginia | Поддерживается |
| US West · California | Поддерживается |
| Southeast Asia · Singapore | Поддерживается |

## Рекомендуемые клиенты

| Android | iOS | Windows / macOS |
|:--:|:--:|:--:|
| v2rayNG · Hiddify · NekoBox | Streisand · V2Box · Hiddify | v2rayN · Hiddify · Clash Verge |

Не включайте Mux в приложении (сервер Xray не поддерживает Mux приложений вроде Hiddify). После изменений нажимайте **Update subscription**.

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Решение проблем

<details><summary><b>Конфиги отключаются через некоторое время</b></summary><br/>Выключите Serverless / App Sleeping в настройках сервиса.</details>

<details><summary><b>Деплой падает на health check</b></summary><br/>Порт домена должен быть <code>8080</code>. Проверьте логи <code>alembic</code> и <code>main.py</code>.</details>

<details><summary><b>Забыл пароль</b></summary><br/>Добавьте <code>RESET_ADMIN_PASSWORD=1</code>, сделайте редеплой, войдите как <code>admin / admin</code> и удалите переменную.</details>

<details><summary><b>Пользователи пропадают после редеплоя</b></summary><br/>Том не подключён к <code>/var/lib/marzban</code>.</details>

<details><summary><b>Прямые конфиги не подключаются</b></summary><br/>Попробуйте Ghost Anti-Filter, Ninja Stealth или Swift Shield, затем Reality или Cloudflare Tunnel.</details>

<details><summary><b>Высокий пинг</b></summary><br/>Выберите регион Amsterdam, укажите тестовый адрес <code>http://cp.cloudflare.com/</code> и используйте Lightning или Reality.</details>

<p align="center"><img src="readme-divider.svg" width="100%" alt=""/></p>

## Поддержка проекта

Кнопка **Поддержать** в нижнем углу панели открывает `https://<домен>/donate/`. Каждый адрес проверяется контрольной суммой своей сети, QR-коды создаются на устройстве, внешних запросов нет. Чтобы указать свои адреса, отредактируйте только `donate-config.js`.

## Сообщество

<div align="center">

<a href="https://t.me/Super_Jinx"><img src="readme-badge-telegram.svg" height="40" alt="Telegram @Super_Jinx"/></a>
<a href="https://github.com/x4gpanell"><img src="readme-badge-github.svg" height="40" alt="GitHub x4gpanell"/></a>

<br/><br/>

Если Super JinX вам помог, поставьте звезду.

<sub>Основано на <a href="https://github.com/Gozargah/Marzban">Marzban</a> (AGPL-3.0) и <a href="https://github.com/XTLS/Xray-core">Xray-core</a>.</sub>

<img src="readme-footer.svg" width="100%" alt="Super JinX · free forever"/>

</div>
