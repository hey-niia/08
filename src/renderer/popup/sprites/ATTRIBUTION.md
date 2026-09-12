# Sprite attribution

## 08

Original art — see `art/` for the pose generator (smooth vector shapes rasterized
down to a pixel grid). Not derived from any third-party source.

## Biscuit, Ash, Mocha

These three cats' sprites (`sprites/biscuit/`, `sprites/ash/`, `sprites/mocha/`) are
placeholder sprites taken from the
["cute_orange_cat"](https://github.com/wil-pe/CATAI/tree/main/cute_orange_cat)
asset set in **[wil-pe/CATAI](https://github.com/wil-pe/CATAI)**, used under the
project's MIT license. It's the only cat model that repo ships (no second sprite
set exists there to draw from), so Biscuit is the unmodified original orange
colorway, and Ash/Mocha are recolors of the same source frames: Ash is a dark
charcoal gray (`magick -colorspace Gray -level 0%,100%,0.5 -fill black -colorize 15%`,
tuned to read as a distinct dark cat rather than a faded copy of Biscuit), and
Mocha is a warm brown tint (`magick -fill ... -colorize ...`).

They are **temporary stand-ins**, not final art — 08 is a different, much simpler
app than CATAI (no chat, no AI, no per-cat personalities/dialogue) and doesn't
warrant reusing its full 368-sprite animation set. The plan is to replace these
with original artwork (using the same generator that made 08's own sprites) once
there's time for a proper pass; until then, credit stays here per the MIT license.
