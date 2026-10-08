# AutoHaus: качване в Namecheap / SuperHosting

Това е **сайтът + неговият админ панел**, адаптирани от
`Nikichh1/autohaus34`, изходен commit `82bf95aa000d2a8925afca2470d87e367bce47de`.
Старата фирмена PHP система **не е в това репо** и не е включена в архива.
Не я изтривайте и не прекратявайте стария хостинг при качването на сайта.

## Изисквания

- cPanel → **Setup Node.js App**, Node.js **22 или 24**, Passenger и HTTPS.
- Изходящ HTTPS достъп до Supabase и съществуващите услуги за превод/поща.
- Namecheap: изберете **EU** при поръчката. SuperHosting: проверете дали
  конкретният план включва Node.js; само наличието на cPanel не е достатъчно.

Няма runtime npm зависимости. Не е нужен VPS или платен Vercel само за този
сайт. Ресурсните лимити и съвместимостта на конкретния акаунт се проверяват
с тестово публикуване, не се гарантират от кода.

## Най-лесният вариант: готов архив

1. Използвайте `artifacts/cpanel/autohaus34-cnpanel.tar.gz`, произведен с
   `npm run package:cpanel`. Това е runtime архив, не целият GitHub.
2. В cPanel → Domains създайте тестов поддомейн, например `test.autohaus.bg`,
   с **отделна празна публична директория**. Ако DNS е извън cPanel (например
   Cloudflare), добавете нужния запис и там. Не променяйте основния домейн/пощата.
3. В File Manager създайте `/home/CPANEL_USER/apps/autohaus34-cnpanel`.
   Качете и разархивирайте архива **в тази папка**, така че `app.js` да е
   непосредствено в нея. Заменете `CPANEL_USER` с вашето потребителско име.
   **Не качвайте архива или целия GitHub в `public_html` / друга публична папка.**
4. cPanel → Setup Node.js App → Create Application:

   | Поле | Стойност |
   |---|---|
   | Node.js version | 22 или 24 |
   | Application mode | Production |
   | Application root | `apps/autohaus34-cnpanel` |
   | Application URL | тестовият домейн, път `/` |
   | Application startup file | `app.js` |

5. Добавете Environment variables:

   | Име | Стойност |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PUBLIC_ORIGIN` | `https://test.autohaus.bg` — реалният адрес, без път |
   | `ALLOWED_HOSTS` | По избор: допълнителни разрешени имена, със запетая |
   | `TRUST_PROXY` | `1` само зад доверения прокси на хостинга; иначе `0` |
   | `RESEND_API_KEY` | Само ако вече използвате Resend за запитванията |
   | `RESEND_FROM_EMAIL` | Съществуващият потвърден подател за Resend |

   Не копирайте временни Vercel OIDC токени. Тайни ключове/пароли не се
   слагат в Git, `dist/`, JavaScript за браузъра или чат.
6. Натиснете **Create / Restart**. При готовия архив няма build на хостинга.
   `Run NPM Install` е допустим, но няма production зависимости.
   Не стартирайте `app.js` отделно чрез `Run JS Script`: Passenger управлява
   процеса. Не заменяйте генерирания `.htaccess`. Архивът включва `tmp/restart.txt`.
7. Отворете `https://test.autohaus.bg/healthz`, сайта и
   `https://test.autohaus.bg/admin/login.html`. `/healthz` проверява само
   стартиралия процес, **не** Supabase, пощата или PHP.

`dist/` съдържа публичните assets; API кодът се изпълнява от Node.js.
`/admin` остава защитен. Запазени са dynamic homepage renderer и API маршрутите.

## Supabase: без преместване на данни

Същият Supabase проект, потребители, роли, автомобили и Storage се запазват.
Публичният проект URL и publishable key вече са конфигурирани в текущия код;
това **не са** привилегировани ключове. Админът използва проверена
потребителска сесия и същите server-side проверки / RLS.
**Не е необходим service-role ключ за тази миграция.**

**Не изпълнявайте `admin/schema.sql`, reset, seed, bootstrap или миграции
само заради смяната на web хостинга.** Това не е преместване към MySQL/MariaDB.
Изборът на EU не променя региона или абонамента на Supabase.

Входът е със съществуващите email/password акаунти. При email линкове,
възстановяване на парола или OAuth проверете Supabase Auth Site URL / redirect
URL, без да премахвате стария адрес преди края на теста.

## Проверка преди пренасочване

- Каталог, автомобил, BG/EN, снимки и управлявани homepage снимки.
- Вход / изход; роли; `/admin` без сесия връща към входа.
- `/.env`, `/server/admin-lib.js`, `/admin/schema.sql` и `.git` не са достъпни.
- Запис, качване, изтриване и роли се тестват **само с изолирани данни/копие**.
  Тестов сайт към production Supabase може да променя същите реални данни —
  това не е sandbox. Първо използвайте предоставените mock тестове.
- Пощата/преводът са външни интеграции. Локалните тестове ползват mocks;
  реалната доставка и достъпността на безплатните преводачи не са гарантирани.
- PHP се мигрира отделно: файлове, собствена база, PHP версия, cron задачи,
  конфигурация. Може да остане на `my.autohaus.bg`, със собствен document root.

След проверка и одобрение задайте `PUBLIC_ORIGIN=https://autohaus.bg`, добавете
`www.autohaus.bg` в `ALLOWED_HOSTS` ако се обслужва от приложението, настройте
Application URL/HTTPS и Restart. Запазете копие на DNS; променяйте само нужните
web записи при текущия DNS доставчик. **Не сменяйте nameservers, MX или
пощенски записи без отделен план.** Запазете Vercel / стария хостинг за rollback
до приемане на сайта, PHP и пощата.

## GitHub и обновяване

Git Version Control: клонирайте **новото private репо**, с read-only deploy key,
в `apps/autohaus34-cnpanel`, извън публичната директория. В Terminal/SSH
активирайте **точната Node среда**, показана в Setup Node.js App:

```sh
# Първо изпълнете показаната от cPanel activate команда; не гадайте пътя.
cd /home/CPANEL_USER/apps/autohaus34-cnpanel
node --version
npm run build
```

После Restart от cPanel. Не стартирайте втори daemon / `npm start` в SSH.
Clone / Update from Remote **не означава автоматичен build/deployment**.
Няма auto-deploy hook: проверявайте обновяването в отделна папка/приложение,
пазете предишния runtime архив и чак после обновявайте активната версия.
Не изпълнявайте build върху работещата версия по време на обслужване на посетители.

## Локална проверка

```sh
npm run build
npm run check
npm test
npm run package:cpanel
npm start
```

Адрес: `http://127.0.0.1:3217`. `.env` не се зарежда автоматично.
За локален игнориран файл може Node `--env-file`; в cPanel използвайте
Environment variables. Optional database/image QA изисква отделно tooling.
`npm test` не използва реална база или поща. Кодът и fixture тестовете не са
потвърждение за реално публикуване при доставчика или операторско приемане.

## Официални инструкции

- [Namecheap: Node.js App](https://www.namecheap.com/support/knowledgebase/article.aspx/10047/2182/how-to-work-with-nodejs-app/)
- [SuperHosting: Node.js App](https://help.superhosting.bg/setup-nodejs-app-cpanel.html)
- [Passenger: reverse port binding](https://www.phusionpassenger.com/docs/advanced_guides/in_depth/node/reverse_port_binding.html)
- [Supabase: redirect URL](https://supabase.com/docs/guides/auth/redirect-urls)
