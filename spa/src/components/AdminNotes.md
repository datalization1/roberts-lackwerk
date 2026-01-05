Hinweis zum Admin-Guard:
- Aktuell ist der Login nur ein Toggle in LocalStorage (key `rl-admin-authed`). Backend-Auth/Session/JWT muss noch angebunden werden.
- Admin-APIs benötigen Staff/IsAdminUser; funktionierende Aufrufe setzen voraus, dass der Browser bereits eine gültige Session-Cookie von Django besitzt oder wir JWT ergänzen.

Status-Actions:
- Schadenmeldungen: Status-Update via PATCH; Actions-Buttons sind Platzhalter (in-progress/completed/cancelled).
- Buchungen: POST auf Status-Actions (confirmed/completed/cancelled).

ToDo für echtes Setup:
- Login-Endpoint (Session oder JWT) einbauen, Token/Cookie setzen, Axios auth header konfigurieren.
- Fehler-/Success-Badges verbessern; Filter/Suche/Pagination ergänzen.
