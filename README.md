# 08

A tiny cat-video window that lives on your Mac.

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

08 lives quietly in your menu bar. Every few minutes, a small floating window pops up in the corner of your screen playing a muted video of a cat doing absolutely nothing productive — for as long as you tell it to, from one minute to "until I hide her."

That's the whole app. No chat, no clicking through menus, no productivity feature hiding underneath. Just a small, looping reminder that it's fine to stop and watch something lazy for a moment.

**You supply the video.** 08 doesn't ship with one — right-click the tray icon and choose **"Add cat video…"** to open the folder it watches, then drop any `.mp4`, `.mov`, `.webm`, or `.m4v` file in there named anything you like (if you add more than one, the most recently added wins). Choose **"Reload video"** afterward to pick it up without restarting the app.

## The story

08 is named after my actual cat. She spends most of her day asleep in a sunbeam, and it's genuinely one of the more grounding things to watch in the middle of a stressful work session.

I wanted a tiny piece of software that borrowed that feeling — not another notification demanding attention, but the opposite: something that shows up, plays something lazy, and quietly suggests you could be a little lazy too.

She lives in your menu bar (right-click the icon for "Show 08 now," to set how long she stays on screen, to add/reload her video, or to quit).

## Development

```
npm install
npm start          # run in dev
npm run dist:mac   # build an unsigned universal dmg + zip
```

Built with Electron + TypeScript. See `src/main` for the app shell (tray, scheduler, window, video lookup) and `src/renderer/popup` for the video player itself.

## License

MIT
