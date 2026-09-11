# 08

A tiny black-and-white cat who lives on your Mac.

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

08 doesn't do anything, really. She lives quietly in your menu bar, and every few minutes she wanders into the corner of your screen — napping, stretching, or chasing a ball of yarn — for about ten seconds before disappearing again.

That's the whole app. No chat, no clicking, no productivity feature hiding underneath. Just a small, illustrated reminder that it's fine to stop and do nothing for a moment, the way a cat does.

## The story

08 is named after my actual cat. She spends most of her day asleep in a sunbeam, and it's genuinely one of the more grounding things to watch in the middle of a stressful work session.

I wanted a tiny piece of software that borrowed that feeling — not another notification demanding attention, but the opposite: something that shows up, does nothing, and quietly suggests you could do nothing too, for a second.

She lives in your menu bar (click the icon for "Show 08 now" or to quit) and otherwise just shows up on her own schedule. No color, because she isn't one — just black-and-white ink, to match how she actually looks.

## Development

```
npm install
npm start          # run in dev
npm run dist:mac   # build an unsigned universal dmg + zip
```

Built with Electron + TypeScript. See `src/main` for the app shell (tray, scheduler, window) and `src/renderer/popup` for the illustrations.

## License

MIT
