# RudraHealth AI — OUD Recovery Companion (Patient Web App)

A **mobile-first web app** rebuilt from the
[`prototype_v1_3.html`](https://dionysus.psych.wisc.edu/rudrahealth/prototype_v1_3.html)
**Patient Dashboard**. Same data, same screens, same flows — extracted from the
prototype and restructured as a standalone web app.

- **Mobile (≤ 480px):** the app fills the entire viewport edge-to-edge (no phone
  bezel), with safe-area insets for notches/home bars — a true mobile-first layout.
- **Desktop / tablet:** the app is centered inside a scaled phone frame so you can
  preview the mobile experience.
- The provider dashboard and the patient/provider master toggle from the prototype
  were **removed** — this build is the patient experience only.

## Run it

No build step, no dependencies (Chart.js is loaded from a CDN). Serve the folder
with any static server, then open the URL on your phone or in a browser's device
emulator.

```bash
# from this folder
python3 -m http.server 4173
# then open http://localhost:4173
```

If `python3 -m http.server` is blocked in your environment, use the bundled server:

```bash
python3 ".claude/serve.py"   # serves this folder on http://127.0.0.1:4173
```

To view the mobile-first layout, open your browser's device toolbar (e.g. Chrome
DevTools → toggle device toolbar) and pick a phone, or just open it on your phone.

## Project structure

```
index.html      # markup — all patient screens + overlays
css/styles.css  # design system + mobile-first responsive overrides
js/app.js       # navigation, flows, charts, gamification (no provider code)
.claude/        # local preview launch config + static server
```

## Screens & flows (carried over verbatim)

- **Home** — Recovery Health gauge (score 73), Recovery Today (Insights / Reflect /
  Connect), MAT medication due, daily quests, streak flame, mystery XP.
- **Tools, Patterns (charts), Rewards, MAT, Narcan, Workbook/DTx, Check-in,
  Appointments, Profile.**
- **Overlays:** Sage AI chat, SOS / relapse mode, peer connect threads (cravings,
  stress, family, pain, friends), insights, find-a-provider, voice journal, sleep
  log, pain management, clinical screens (SBIRT, SDOH, drug screen, COWS/withdrawal,
  functional status), TCM tracker, milestone share, notifications.
- Interactive: daily task confirmations, MAT dose / attendance check-offs, XP popups
  with variable "mystery" bonuses, pattern chart item/timeframe switching, recovery
  health chart timeframes.

## Notes

- Data is exactly as in the prototype (hard-coded demo data — no backend).
- The **Reflect** check-in opens the original Qualtrics survey link in a new tab,
  same as the prototype.
- Chart.js 4.4.0 is loaded from cdnjs; an internet connection is needed for charts
  and Google Fonts to render.
