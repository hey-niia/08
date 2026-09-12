# 08

A tiny Pomodoro-style break reminder shaped like a cat.

<p align="center">
  <img src="build/icon.png" width="160" alt="08 app icon" />
</p>

## Download

**[Download for Mac →](https://github.com/hey-niia/08/releases/latest)**

08 is unsigned, so on first launch macOS will say it "cannot be opened because the developer cannot be verified." Right-click the app → **Open** → **Open** again, or run:

```
xattr -cr /Applications/08.app
```

## About

Tell 08 how often to check in and how long to stay, and she'll pop into the corner of your screen — napping, stretching, walking, or crouching for a snack — for exactly that long, then disappear. Both are set from the tray icon:

- **Show every** — 5 / 15 / 25 / 50 minutes, or off (manual only)
- **Stay on screen** — 1 / 3 / 5 / 10 / 15 minutes, or until you hide her

No tasks, no streaks, no guilt-tripping if you skip a "session." No chat, no clicking through menus, no productivity feature hiding underneath, either. Just a small, pixelated cue that it's time to look away for a second.

## The story

08 is named after my actual cat. She spends most of her day asleep in a sunbeam, and it's genuinely one of the more grounding things to watch in the middle of a stressful work session.

I wanted a tiny piece of software that borrowed that feeling — not another notification demanding attention, but the opposite: something that shows up, does nothing, and quietly suggests you could do nothing too, for a second.

She lives in your menu bar (right-click for "Show 08 now," to set her rhythm, or to quit).

**A note on the art:** the current sprites are placeholders borrowed from [wil-pe/CATAI](https://github.com/wil-pe/CATAI) (MIT-licensed — see `src/renderer/popup/sprites/ATTRIBUTION.md`) while original artwork is still in progress. `art/` has the in-repo pose generator used for the first from-scratch pass, for whenever that replacement happens.

## Development

```
npm install
npm start          # run in dev
npm run dist:mac   # build an unsigned universal dmg + zip
```

Built with Electron + TypeScript. See `src/main` for the app shell (tray, scheduler, window) and `src/renderer/popup` for the sprites and animation.

## License

MIT for the app itself. The placeholder sprites in `src/renderer/popup/sprites/` are third-party (MIT-licensed CATAI assets) — see `src/renderer/popup/sprites/ATTRIBUTION.md`.
