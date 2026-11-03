# Voxelia

The game. Serve this repo with GitHub Pages — Settings → Pages → deploy from
the `main` branch, root folder.

    index.html        the game. One file. See CODE-MAP.md for what is where.
    manifest.json     makes it installable
    sw.js             the offline copy
    store.js          optional shop, delete it and nothing breaks
    rewards.js        optional wallet: pays players for creatures they tame
    *.png             app icons and store screenshots, at the root
    widget-*.json     Windows widget definition

Everything sits in the repo root, which is what Pages serves.

## Pointing it at your server

Open `index.html`, find this line near the top of the script, and put your
Render address in it:

    const DEFAULT_SERVER = 'your-service.onrender.com';

That is the only connection between the two repos. Without it the game still
runs perfectly on its own; only multiplayer needs the server.

## Offline

On the first visit the service worker copies the game onto the device. After
that it opens with no connection at all. On a phone, Add to Home Screen gives
it an icon and opens it fullscreen.

## Being kind to a free server

The game asks very little of it: one visit ping per device per day, a room list
every twelve seconds only while the multiplayer screen is open and the tab is
visible, probe results cached for two minutes, and a minute's back-off after any
failure. Gameplay itself runs over a single WebSocket, not repeated requests.

## The wallet

`rewards.js` adds a Wallet button to the title screen. Taming a creature in
survival earns a claim; creative earns nothing.

Nothing about the money is decided in the browser. This file asks the server
what the balance is and shows the answer. The server keeps one record per
creature: the first account to tame it is paid, and nobody is paid for it again
— not the same person twice, not the next owner after a trade. Rates and the
daily cap live on the server. Editing `rewards.js` changes a number on that
player's own screen and nothing else.

Rates, set on the server: common 1c, uncommon 3c, rare 8c, exotic 15c,
legendary 25c, with a daily ceiling per account.

Withdrawals are not wired to a payment provider yet — the button explains that
rather than pretending. Connect one in `withdraw()` when you are ready.

## Packaging for the stores

PWABuilder reported 404s because the manifest pointed into `icons/` and
`screenshots/`. Every image now sits at the repo root and the manifest points
at plain filenames, so one flat upload works. I checked each declared size
against the real file — all fifteen icons and four screenshots match.

Two manifest fields I deliberately left out rather than invent:

- `iarc_rating_id` — you get this by filling in the IARC questionnaire during
  store submission. Paste the code it gives you into the manifest.
- `related_applications` — fill this in with your store listing ids once the
  apps exist.

Both stores wrap the same files. Multiplayer keeps working because the game
talks to your Render address over https and wss, which is reachable from a
packaged app exactly as it is from the browser.

## Music

Five pieces. The game looks for each one in this order and keeps the first that
loads, so it works whichever way you uploaded them:

    audio/NAME.ogg → NAME.ogg → audio/NAME.m4a → NAME.m4a → audio/NAME.wav → NAME.wav

If the original `.wav` files are sitting loose in the repo root, that is fine —
it finds them. The compressed copies in `audio/` are 1.8 MB against 16 MB for
the WAVs, so they are worth using when you can, but nothing needs moving.

The game picks by where you are:

| Piece | Where it plays |
|---|---|
| Home_Screen_music | the title screen |
| Grass_land_music | the Vale, jungle, shore, reef and Lumen Grove |
| Land_music | dunes, taiga, emberash, peaks, canyon |
| Space_blast_off_song | the rocket climbing out of the sky, and the descent |
| Other_planet | out among the planets, and on any world that is not this one |

Pieces crossfade rather than cutting, and the choice is re-checked every couple
of seconds. Sound and music have separate sliders in both the pause menu and
settings. If `audio/` is missing the game is simply quiet.

The originals were 16 MB of WAV; these are 1.8 MB in total and are cached for
offline play.

## Split screen (computers only)

Two players on one computer. Pause → Split screen. Each player needs their own
controller, or Player 1 can use the keyboard and mouse. Browsers only show a
controller after one of its buttons has been pressed, so press something on each
before opening the panel.

The panel lists every controller the browser can see: its number, make (Xbox,
PlayStation, Nintendo, 8BitDo), the name the browser reports, vendor and product
codes, layout, button count and whether it can rumble. "Which is this?" buzzes
that controller, and a controller's row lights up while you press its buttons,
so you can always tell them apart.

Player 2 plays on the right half with their own body, camera, hotbar and
inventory. The world is shared. Split screen is local only, so it is not
available while you are in an online room.

## Voice

Voice uses STUN to find a direct path between players and falls back to a free
public relay (Open Relay) when a network forbids a direct connection, which is
common on mobile data. For heavier use, set up your own TURN server and add it
before the game script loads:

    <script>window.VOXELIA_TURN = [{ urls: 'turn:your.server:3478',
      username: 'user', credential: 'pass' }];</script>
