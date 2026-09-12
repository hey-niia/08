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

Tell 08 how often to check in and how long to stay, and she'll show up — napping, stretching, crouching for a snack, or actually walking the width of your screen — then disappear. Everything's set from the tray icon:

- **Number of cats** — 1 to 4. Just 08, or bring in Biscuit, Ash, and Mocha too, each on their own independent schedule
- **Show every** — 5 / 15 / 25 / 50 minutes, or off (manual only)
- **Stay on screen** — 1 / 3 / 5 / 10 / 15 minutes, or until you hide her (doesn't apply while she's mid-walk — she just finishes crossing the screen)

No tasks, no streaks, no guilt-tripping if you skip a "session." No chat, no clicking through menus, no productivity feature hiding underneath, either. Just a small, pixelated cue that it's time to look away for a second.

## The story

08 is named after my actual cat. Whenever I look at her, she reminds me that I don't have to run around doing a hundred things like the world is ending — that it's fine to be lazy, do nothing for a second, and let time slow down.

The name is also a quiet nod to *108 Bows of Gratitude*, a practice of gratitude and slowing down through repeated, mindful bows. 08 isn't really a Pomodoro clone underneath — "show every" and "stay on screen" borrow that familiar shape because it's practical, but the spirit is closer to the bows: not just clocking work and breaks, but actually pausing, noticing, being grateful for a moment. And the name itself is a small bow to her — my very special, very smart cat.

She lives in your menu bar (right-click for "Show now," to set her rhythm, choose how many cats, or to quit).

**The roster.** 08 herself is black-and-white, original art (see `art/` for the generator). Biscuit, Ash, and Mocha are placeholder sprites borrowed from [wil-pe/CATAI](https://github.com/wil-pe/CATAI) (MIT-licensed — see `src/renderer/popup/sprites/ATTRIBUTION.md`) while more original art is still in progress.

## Development

```
npm install
npm start          # run in dev
npm run dist:mac   # build an unsigned universal dmg + zip
```

Built with Electron + TypeScript. See `src/main` for the app shell (`cats.ts` roster, `catInstance.ts`/`catManager.ts` for per-cat behavior and scheduling, tray, window) and `src/renderer/popup` for the sprites and animation.

## License

MIT for the app itself. The placeholder sprites in `src/renderer/popup/sprites/` are third-party (MIT-licensed CATAI assets) — see `src/renderer/popup/sprites/ATTRIBUTION.md`.
