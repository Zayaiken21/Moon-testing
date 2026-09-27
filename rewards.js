/**
 * rewards.js — the wallet, kept deliberately separate from the game.
 *
 * Drop this beside index.html and add one line to the page:
 *
 *     <script src="rewards.js"></script>
 *
 * The game runs perfectly without it. When it is present, a Wallet button
 * appears on the title screen and taming an animal in survival earns a claim.
 *
 * ── How the money is kept honest ────────────────────────────────────────────
 * Nothing here decides what anything is worth, and nothing here holds a
 * balance. This file asks the server, and shows what the server says. The
 * server keeps one record per creature — the first account to tame it is paid,
 * and no one is ever paid for it again, including the same person, including
 * after the pet is traded away. Rates and the daily cap live on the server too.
 * If someone edits this file, the worst they achieve is a wrong number on their
 * own screen; the ledger does not move.
 * ───────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  const ACCOUNT_KEY = 'voxelia.account';
  const NAME_KEY = 'voxelia.account.name';
  /* What each kind is worth, in cents. The server is the one that decides;
     this is only what the wallet shows before it has been asked. */
  const DEFAULT_RATES = { common: 0, uncommon: 2, rare: 6, exotic: 12, legendary: 30 };
  let cache = { balance: 0, caught: 0, today: 0, dailyCap: 0, rates: {} };
  let pending = [];                 // claims held while offline

  /* ---------- who this player is ---------- */
  function accountId() {
    let id = null;
    try { id = localStorage.getItem(ACCOUNT_KEY); } catch (e) {}
    if (!id) {
      id = 'acc_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      try { localStorage.setItem(ACCOUNT_KEY, id); } catch (e) {}
    }
    return id;
  }

  function serverBase() {
    const g = window.Game;
    let addr = '';
    try {
      addr = (window.DEFAULT_SERVER) ||
             (g && g.net && g.net.url ? g.net.url.replace(/^ws/, 'http') : '');
      if (!addr) {
        const el = document.querySelector('#mp-relay');
        addr = el ? el.value.trim() : '';
      }
    } catch (e) {}
    if (!addr) return '';
    if (/^https?:\/\//.test(addr)) return addr.replace(/\/$/, '');
    const proto = location.protocol === 'https:' ? 'https://' : 'http://';
    return proto + addr.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  const money = (cents) => '$' + (Math.max(0, cents | 0) / 100).toFixed(2);

  /* ---------- talking to the ledger ---------- */
  async function refresh() {
    const base = serverBase();
    if (!base) return cache;
    try {
      const res = await fetch(base + '/wallet?account=' + encodeURIComponent(accountId()));
      if (res.ok) cache = await res.json();
    } catch (e) { /* offline: the last known figures stay on screen */ }
    render();
    return cache;
  }

  async function claim(creatureKey, rarity) {
    const base = serverBase();
    const body = {
      account: accountId(), session: session(), creature: creatureKey, rarity,
      mode: (window.Game && window.Game.mode) || 'survival'
    };
    if (rarity === 'common') return { ok: false, why: '', cents: 0 };   // nothing to ask for
    if (!base) { pending.push(body); return null; }
    try {
      const res = await fetch(base + '/claim', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const out = await res.json();
      if (out && out.ok) {
        cache.balance = out.balance;
        cache.caught = out.caught;
        toast('Caught! ' + money(out.cents) + ' added. Wallet: ' + money(out.balance));
        render();
      } else if (out && out.why) {
        // a common animal earns nothing; that is not a problem, so it is
        // said once and quietly rather than as a warning
        toast(out.why);
      }
      return out;
    } catch (e) {
      pending.push(body);            // try again when the server is back
      return null;
    }
  }

  async function flushPending() {
    if (!pending.length || !serverBase()) return;
    const queue = pending.slice();
    pending = [];
    for (const body of queue) {
      await claim(body.creature, body.rarity);
    }
  }

  async function transfer(creatureKey, toAccount) {
    const base = serverBase();
    if (!base) { toast('Trading needs a connection.'); return null; }
    try {
      const res = await fetch(base + '/transfer', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ creature: creatureKey, to: toAccount })
      });
      return await res.json();
    } catch (e) { return null; }
  }

  function toast(msg) {
    if (window.Game && window.Game.toast) window.Game.toast(msg);
    else console.info(msg);
  }


  /* ------------------------------------------------------------------ *
   * The account. Email, username, password, and a way back in if the    *
   * password is forgotten. Nothing here holds a balance; it asks the     *
   * server and shows the answer.                                        *
   * ------------------------------------------------------------------ */
  const SESSION_KEY = 'voxelia.session';

  function session() {
    try { return localStorage.getItem(SESSION_KEY) || ''; } catch (e) { return ''; }
  }

  function setSession(t) {
    try { t ? localStorage.setItem(SESSION_KEY, t) : localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  /* Talking to the server, patiently and honestly.

     A free Render service goes to sleep after a quarter of an hour of quiet
     and takes the better part of a minute to wake up. While it is waking it
     answers with a holding page rather than an answer, and reading that as
     JSON throws — which used to come out as "Could not reach the server",
     the one message that is certainly wrong, because the server had in fact
     answered. So a sleeping server is waited for rather than reported as
     broken, and anything that really did go wrong says what it was. */
  async function api(route, body, onWaking) {
    const base = serverBase();
    if (!base) return { ok: false, why: 'No server configured.' };

    const once = async () => {
      const res = await fetch(base + route, {
        method: body ? 'POST' : 'GET',
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (e) {}
      return { res, data, text };
    };

    const waited = (ms) => new Promise((r) => setTimeout(r, ms));
    let last = '';
    // a little under a minute, which covers a cold start with room to spare
    for (let go = 0; go < 7; go++) {
      try {
        const { res, data, text } = await once();
        if (data) return data;                       // a real answer
        if (res.status >= 500 || res.status === 0) {
          // waking up, or briefly unwell: say so and try again
          last = 'The server is waking up (' + res.status + ').';
        } else if (res.status === 404) {
          return { ok: false, why: 'The server is running an older build: ' + route + ' is not there.' };
        } else {
          return { ok: false, why: 'The server answered with ' + res.status +
                   ', not an answer we understand.' +
                   (text && text.length < 120 ? ' It said: ' + text.trim() : '') };
        }
      } catch (e) {
        // no connection at all, or the browser refused it
        last = 'Could not reach ' + base.replace(/^https?:\/\//, '') + '.';
      }
      if (go === 0 && onWaking) { try { onWaking(); } catch (e) {} }
      await waited(go < 2 ? 2500 : 9000);
    }
    return { ok: false, why: last + ' It may be asleep — give it a minute and try again.' };
  }

  let account = null;

  async function refreshAccount() {
    const t = session();
    if (!t) { account = null; renderAccount(); return null; }
    const me = await api('/account/me?session=' + encodeURIComponent(t));
    account = me && me.username ? me : null;
    if (!account) setSession('');
    renderAccount();
    return account;
  }

  const ACCOUNT_CSS = `
  #account-screen{position:fixed;inset:0;z-index:84;display:none;overflow:auto;
    background:linear-gradient(180deg, rgba(8,20,40,.74), rgba(8,14,26,.95));
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    padding:max(20px, env(safe-area-inset-top)) 16px 28px}
  #account-screen.open{display:block}
  #account-screen .acc-sheet{position:relative}
  #account-screen .acc-x{position:absolute;top:10px;right:10px;width:38px;height:38px;
    border-radius:50%;background:#262236;border:1px solid #332E47;color:#EDE9F5;
    font-size:16px;line-height:1;cursor:pointer;display:grid;place-items:center;padding:0}
  #account-screen .acc-x:hover{border-color:#7FFFD9;color:#7FFFD9}
  #account-screen .acc-where{margin:14px 0 0;color:#6C7793;font-size:11px;
    text-align:center;word-break:break-all}
  #account-screen h2{padding-right:46px}
  .acc-sheet{max-width:440px;margin:0 auto;background:#12182B;border:1px solid #27324E;
    border-radius:20px;padding:24px;color:#EDE9F5;
    font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    box-shadow:0 26px 70px rgba(0,0,0,.6)}
  .acc-sheet h2{font-family:"Chakra Petch", ui-sans-serif, system-ui, sans-serif;
    margin:0 0 4px;font-size:22px}
  .acc-sheet p.lede{color:#9AA7C4;font-size:13px;line-height:1.55;margin:0 0 16px}
  .acc-tabs{display:flex;gap:6px;margin-bottom:16px}
  .acc-tabs button{flex:1;background:#1A2440;border:1px solid #27324E;color:#9AA7C4;
    border-radius:10px;padding:9px;font-family:"Chakra Petch",sans-serif;font-size:13px;cursor:pointer}
  .acc-tabs button.on{border-color:#7FFFD9;color:#7FFFD9;background:rgba(127,255,217,.12)}
  .acc-field{margin-bottom:11px}
  .acc-field label{display:block;color:#9AA7C4;font-size:11.5px;margin-bottom:4px;
    text-transform:uppercase;letter-spacing:.05em}
  .acc-field input{width:100%;background:#0E1526;border:1px solid #27324E;border-radius:10px;
    padding:11px 13px;color:#EDE9F5;font-size:14px;box-sizing:border-box}
  .acc-field input:focus{outline:2px solid #7FFFD9;outline-offset:1px}
  .acc-sheet button.primary{width:100%;background:#7FFFD9;color:#052B23;border:none;
    border-radius:10px;padding:12px;font-family:"Chakra Petch",sans-serif;font-size:15px;
    cursor:pointer;margin-top:6px}
  .acc-link{background:none;border:none;color:#8FD8FF;font-size:12.5px;cursor:pointer;
    padding:8px 0;text-decoration:underline}
  .acc-msg{font-size:12.5px;line-height:1.5;margin-top:10px;color:#9AA7C4}
  .acc-msg.bad{color:#FF9E9E}
  .acc-msg.good{color:#7FFFD9}
  .acc-me{background:#1A2440;border:1px solid #27324E;border-radius:14px;padding:16px;margin-bottom:14px}
  .acc-me b{font-family:"Chakra Petch",sans-serif;font-size:17px;display:block}
  .acc-me small{color:#9AA7C4;font-size:12px}
  .acc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
  .acc-stats div{background:#0E1526;border:1px solid #27324E;border-radius:10px;padding:10px;text-align:center}
  .acc-stats b{color:#7FFFD9;font-size:18px;display:block}
  .acc-stats small{font-size:10.5px;text-transform:uppercase;letter-spacing:.04em}
  #open-account{text-align:center}
  `;

  let accMode = 'in';

  function buildAccount() {
    const style = document.createElement('style');
    style.textContent = ACCOUNT_CSS;
    document.head.appendChild(style);

    const screen = document.createElement('section');
    screen.id = 'account-screen';
    /* A cross in the corner, always there.

       The only way out used to be the Done button, and that is only drawn
       once you are signed in — so anybody looking at the sign-in form was
       stuck on it with no way back to the game, on every device. */
    screen.innerHTML =
      '<div class="acc-sheet">' +
        '<button class="acc-x" id="acc-x" aria-label="Close" title="Close">\u2715</button>' +
        '<h2>Your account</h2>' +
        '<p class="lede">An account keeps your companions and what you have earned, ' +
        'on every device you play on.</p>' +
        '<div id="acc-body"></div>' +
        '<p class="acc-where" id="acc-where"></p>' +
      '</div>';
    document.body.appendChild(screen);
    screen.querySelector('#acc-x').addEventListener('click', closeAccount);
    // a press on the dark part outside the card closes it too
    screen.addEventListener('click', (e) => { if (e.target === screen) closeAccount(); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (screen.classList.contains('open')) { e.preventDefault(); closeAccount(); }
      const w = document.getElementById('wallet-screen');
      if (w && w.classList.contains('open')) { e.preventDefault(); w.classList.remove('open'); }
    });
    renderAccount();
  }

  function renderAccount() {
    const body = document.getElementById('acc-body');
    if (!body) return;
    /* Which server this is talking to, in small print. When something is
       wrong it is nearly always this, and guessing at it from the outside is
       no fun for anybody. */
    const where = document.getElementById('acc-where');
    if (where) {
      const base = serverBase();
      where.textContent = base
        ? 'Talking to ' + base.replace(/^https?:\/\//, '')
        : 'No server address set in the game.';
    }

    if (account) {
      body.innerHTML =
        '<div class="acc-me"><b>' + account.username + '</b>' +
          '<small>' + account.email + (account.subscribed ? ' · member' : '') + '</small>' +
          '<div class="acc-stats">' +
            '<div><b>' + money(account.balance) + '</b><small>balance</small></div>' +
            '<div><b>' + account.caught + '</b><small>caught</small></div>' +
            '<div><b>' + money(account.cap) + '</b><small>a day</small></div>' +
          '</div>' +
        '</div>' +
        '<p class="acc-msg">Earned today: ' + money(account.today) + ' of ' + money(account.cap) + '.' +
        (account.subscribed ? '' : ' A membership raises the daily limit to ' + money(25) + '.') + '</p>' +
        '<button class="primary" id="acc-close">Done</button>' +
        '<button class="acc-link" id="acc-out">Sign out</button>';
      document.getElementById('acc-close').addEventListener('click', closeAccount);
      document.getElementById('acc-out').addEventListener('click', async () => {
        setSession(''); account = null; renderAccount();
      });
      return;
    }

    const tabs = '<div class="acc-tabs">' +
      '<button id="tab-in" class="' + (accMode === 'in' ? 'on' : '') + '">Sign in</button>' +
      '<button id="tab-up" class="' + (accMode === 'up' ? 'on' : '') + '">Create one</button>' +
      '</div>';

    if (accMode === 'forgot') {
      body.innerHTML =
        '<div class="acc-field"><label>Email</label><input id="acc-email" type="email" autocomplete="email" /></div>' +
        '<button class="primary" id="acc-go">Send a reset link</button>' +
        '<button class="acc-link" id="acc-back">Back to signing in</button>' +
        '<div class="acc-msg" id="acc-msg"></div>';
      document.getElementById('acc-back').addEventListener('click', () => { accMode = 'in'; renderAccount(); });
      document.getElementById('acc-go').addEventListener('click', doForgot);
      return;
    }

    if (accMode === 'reset') {
      body.innerHTML =
        '<div class="acc-field"><label>Reset code</label><input id="acc-token" /></div>' +
        '<div class="acc-field"><label>New password</label><input id="acc-pass" type="password" autocomplete="new-password" /></div>' +
        '<button class="primary" id="acc-go">Set the new password</button>' +
        '<button class="acc-link" id="acc-back">Back to signing in</button>' +
        '<div class="acc-msg" id="acc-msg"></div>';
      document.getElementById('acc-back').addEventListener('click', () => { accMode = 'in'; renderAccount(); });
      document.getElementById('acc-go').addEventListener('click', doReset);
      return;
    }

    body.innerHTML = tabs +
      '<div class="acc-field"><label>Email</label><input id="acc-email" type="email" autocomplete="email" /></div>' +
      (accMode === 'up'
        ? '<div class="acc-field"><label>Username</label><input id="acc-user" autocomplete="username" /></div>' : '') +
      '<div class="acc-field"><label>Password</label><input id="acc-pass" type="password" ' +
        'autocomplete="' + (accMode === 'up' ? 'new-password' : 'current-password') + '" /></div>' +
      '<button class="primary" id="acc-go">' + (accMode === 'up' ? 'Create my account' : 'Sign in') + '</button>' +
      (accMode === 'in' ? '<button class="acc-link" id="acc-forgot">I have forgotten my password</button>' +
                          '<button class="acc-link" id="acc-have">I have a reset code</button>' : '') +
      '<div class="acc-msg" id="acc-msg"></div>';

    document.getElementById('tab-in').addEventListener('click', () => { accMode = 'in'; renderAccount(); });
    document.getElementById('tab-up').addEventListener('click', () => { accMode = 'up'; renderAccount(); });
    document.getElementById('acc-go').addEventListener('click', accMode === 'up' ? doSignUp : doSignIn);
    const f = document.getElementById('acc-forgot');
    if (f) f.addEventListener('click', () => { accMode = 'forgot'; renderAccount(); });
    const hv = document.getElementById('acc-have');
    if (hv) hv.addEventListener('click', () => { accMode = 'reset'; renderAccount(); });
  }

  function say(text, kind) {
    const el = document.getElementById('acc-msg');
    if (el) { el.textContent = text; el.className = 'acc-msg ' + (kind || ''); }
  }

  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  async function doSignUp() {
    say('Creating it\u2026');
    const out = await api('/account/signup', {
      email: val('acc-email'), username: val('acc-user'), password: val('acc-pass')
    }, () => say('Waking the server up. This can take up to a minute the first time.'));
    if (out.ok) { setSession(out.session); account = out.account; renderAccount(); toast('Welcome, ' + account.username + '.'); }
    else say(out.why || 'That did not work.', 'bad');
  }

  async function doSignIn() {
    say('Checking\u2026');
    const out = await api('/account/signin', { email: val('acc-email'), password: val('acc-pass') },
      () => say('Waking the server up. This can take up to a minute the first time.'));
    if (out.ok) { setSession(out.session); account = out.account; renderAccount(); toast('Signed in.'); }
    else say(out.why || 'That did not work.', 'bad');
  }

  async function doForgot() {
    say('Sending…');
    await api('/account/forgot', { email: val('acc-email') });
    // the same answer either way, so the form cannot be used to find out who has an account
    say('If that email has an account, a reset code is on its way. ' +
        'Come back with "I have a reset code" once you have it.', 'good');
  }

  async function doReset() {
    say('Setting it…');
    const out = await api('/account/reset', { token: val('acc-token'), password: val('acc-pass') });
    if (out.ok) { setSession(out.session); await refreshAccount(); toast('Password changed.'); }
    else say(out.why || 'That code did not work.', 'bad');
  }

  function openAccount() {
    document.getElementById('account-screen').classList.add('open');
    refreshAccount();
  }
  function closeAccount() { document.getElementById('account-screen').classList.remove('open'); }

  /* ---------- the panel ---------- */
  const CSS = `
  #wallet-screen{position:fixed;inset:0;z-index:82;display:none;overflow:auto;
    background:linear-gradient(180deg, rgba(8,20,40,.72), rgba(8,14,26,.94));
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    padding:max(18px, env(safe-area-inset-top)) 16px 28px}
  #wallet-screen.open{display:block}
  .wallet-sheet{max-width:600px;margin:0 auto;background:#12182B;border:1px solid #27324E;
    border-radius:20px;padding:24px;color:#EDE9F5;
    font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    box-shadow:0 26px 70px rgba(0,0,0,.6)}
  .wallet-sheet h2{font-family:"Chakra Petch", ui-sans-serif, system-ui, sans-serif;
    margin:0 0 4px;font-size:23px}
  .wallet-sheet p.lede{color:#9AA7C4;font-size:13.5px;line-height:1.55;margin:0 0 18px}
  .wallet-balance{background:linear-gradient(150deg,#1C6B5A,#123E52);border:1px solid #2F7F6B;
    border-radius:16px;padding:20px;text-align:center;margin-bottom:14px;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
  .wallet-balance b{display:block;font-family:"Chakra Petch", sans-serif;font-size:42px;color:#7FFFD9}
  .wallet-balance small{color:#A8D8CC;font-size:12px;text-transform:uppercase;letter-spacing:.06em}
  .wallet-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
  .wallet-card{background:#1A2440;border:1px solid #27324E;border-radius:12px;padding:14px}
  .wallet-card b{display:block;font-family:"Chakra Petch", sans-serif;font-size:24px;color:#8FD8FF}
  .wallet-card small{color:#9AA7C4;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
  .rate-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #27324E;
    font-size:13px}
  .rate-row:last-child{border-bottom:none}
  .rate-row span{color:#9AA7C4}
  .rate-row b{color:#7FFFD9;font-family:"Chakra Petch", sans-serif}
  .wallet-sheet button{background:#7FFFD9;color:#052B23;border:none;border-radius:10px;
    padding:12px 18px;font-family:"Chakra Petch", sans-serif;font-size:14px;cursor:pointer;margin-top:8px}
  .wallet-sheet button.ghost{background:#1A2440;color:#EDE9F5;border:1px solid #27324E}
  .wallet-note{color:#7E8CAC;font-size:12px;line-height:1.5;margin-top:16px}
  #open-wallet{text-align:center}
  `;

  function build() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const screen = document.createElement('section');
    screen.id = 'wallet-screen';
    screen.innerHTML =
      '<div class="wallet-sheet">' +
        '<h2>Wallet</h2>' +
        '<p class="lede">Every creature you tame in survival pays once, the first time ' +
        'anyone tames it. Creative does not count, and a pet you are given has already ' +
        'paid its finder.</p>' +
        '<div class="wallet-balance"><small>Balance</small><b id="w-balance">$0.00</b></div>' +
        '<div class="wallet-grid">' +
          '<div class="wallet-card"><small>Creatures caught</small><b id="w-caught">0</b></div>' +
          '<div class="wallet-card"><small>Earned today</small><b id="w-today">$0.00</b></div>' +
          '<div class="wallet-card"><small>Daily limit</small><b id="w-cap">—</b></div>' +
        '</div>' +
        '<h3 style="font-family:Chakra Petch,sans-serif;font-size:15px;margin:20px 0 6px">What they pay</h3>' +
        '<div id="w-rates"></div>' +
        '<button id="w-withdraw">Request a withdrawal</button> ' +
        '<button class="ghost" id="w-refresh">Refresh</button> ' +
        '<button class="ghost" id="w-close">Close</button>' +
        '<p class="wallet-note" id="w-account"></p>' +
      '</div>';
    document.body.appendChild(screen);

    document.getElementById('w-close').addEventListener('click', close);
    document.getElementById('w-refresh').addEventListener('click', () => { flushPending(); refresh(); });
    document.getElementById('w-withdraw').addEventListener('click', withdraw);
    render();
  }

  function render() {
    const b = document.getElementById('w-balance');
    if (!b) return;
    b.textContent = money(cache.balance);
    document.getElementById('w-caught').textContent = cache.caught || 0;
    document.getElementById('w-today').textContent = money(cache.today);
    document.getElementById('w-cap').textContent = cache.dailyCap ? money(cache.dailyCap) : '—';
    const rates = cache.rates && Object.keys(cache.rates).length ? cache.rates : DEFAULT_RATES;
    const order = ['common', 'uncommon', 'rare', 'exotic', 'legendary'];
    const keys = order.filter((k) => rates[k] !== undefined)
      .concat(Object.keys(rates).filter((k) => order.indexOf(k) < 0));
    document.getElementById('w-rates').innerHTML =
      '<p class="wallet-note">Only the first person anywhere to tame a particular animal is paid for it.</p>' +
      keys.map((k) =>
        '<div class="rate-row"><span>' + k + '</span><b>' +
        (rates[k] > 0 ? money(rates[k]) : 'nothing') + '</b></div>').join('') +
      '<p class="wallet-note">Most animals are common, so most of what you tame is for the company.</p>';
    document.getElementById('w-account').textContent =
      'Account ' + accountId() + (serverBase() ? '' : ' · offline, claims are held until you reconnect') +
      (pending.length ? ' · ' + pending.length + ' waiting to send' : '');
  }

  function withdraw() {
    if (cache.balance < 500) {
      toast('Withdrawals open at ' + money(500) + '. You have ' + money(cache.balance) + '.');
      return;
    }
    toast('Withdrawals are not connected to a payment provider yet.');
  }

  function open() { document.getElementById('wallet-screen').classList.add('open'); flushPending(); refresh(); }
  function close() { document.getElementById('wallet-screen').classList.remove('open'); }

  /* ---------- watching for a tame ---------- */
  function hook() {
    const g = window.Game;
    if (!g || !g.setCompanion) { setTimeout(hook, 800); return; }
    const original = g.setCompanion.bind(g);
    g.setCompanion = function (c) {
      const out = original(c);
      try {
        if (c && c.tamed && g.mode === 'survival' && !c.claimed) {
          c.claimed = true;
          // a key the server can trust: the world it came from and its own spawn id
          const world = (g.world && g.world.seedText) || 'world';
          const key = world + ':' + (c.spawnKey || c.id) + ':' + c.species;
          const def = c.def || {};
          const rarity = def.rarity || (def.rare ? 'rare' : 'common');
          /* Whoever actually tamed it is paid. In split screen the game runs
             player two's turn with their state swapped in, so the flag below
             says which of the two is holding the reins right now. */
          const who = (window.Split && window.Split.on && window.Split.acting === 2) ? 2 : 1;
          claimFor(who, key, rarity);
        }
      } catch (e) {}
      return out;
    };
  }

  /* ------------------------------------------------------------------
     A second person at the same computer.

     Split screen starts with player two as a guest, which needs nothing at
     all. If they would rather be themselves, they sign in here and from then
     on what they catch is paid into their own account, not player one's.
     Their session is held in memory only: it never touches the saved one, so
     signing player two in cannot sign player one out, and closing the tab
     leaves no trace of them on a shared computer.
     ------------------------------------------------------------------ */
  let guest2 = null;                 // { session, username, email, balance, ... }

  async function signInSecond(email, password) {
    const out = await api('/account/signin', { email: email, password: password });
    if (!out || !out.ok || !out.session) {
      return { ok: false, why: (out && out.why) || 'Those details were not recognised.' };
    }
    const me = await api('/account/me?session=' + encodeURIComponent(out.session));
    guest2 = me && me.username ? Object.assign({ session: out.session }, me) : null;
    if (!guest2) return { ok: false, why: 'Signed in, but the account could not be read.' };
    return { ok: true, account: guest2 };
  }

  function signOutSecond() { guest2 = null; }

  /** What player two catches is paid to player two. */
  async function claimFor(who, creatureKey, rarity) {
    const base = serverBase();
    const acc = (who === 2 && guest2) ? guest2 : null;
    if (!acc) return claim(creatureKey, rarity);       // a guest earns nothing of their own
    const body = {
      account: acc.id || acc.username, session: acc.session,
      creature: creatureKey, rarity,
      mode: (window.Game && window.Game.mode) || 'survival'
    };
    if (!base) return null;
    try {
      const res = await fetch(base + '/claim', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const out = await res.json();
      if (out && out.ok) {
        guest2.balance = out.balance;
        guest2.caught = out.caught;
        toast(acc.username + ' caught one \u2014 ' + money(out.cents) + ' to their wallet.');
      } else if (out && out.why) toast(acc.username + ': ' + out.why);
      return out;
    } catch (e) { return null; }
  }

  window.VoxeliaWallet = {
    open, close, refresh, claim, transfer,
    openAccount, closeAccount, signedIn: () => account, session,
    account: accountId,
    balance: () => cache.balance,
    caught: () => cache.caught,
    // the second person at this computer
    signInSecond, signOutSecond, claimFor,
    second: () => guest2
  };

  function attach() {
    build();
    buildAccount();
    hook();
    const row = document.querySelector('#home .minor-row');
    if (row) {
      const acc = document.createElement('button');
      acc.className = 'btn';
      acc.id = 'open-account';
      acc.textContent = 'Account';
      acc.addEventListener('click', openAccount);
      row.appendChild(acc);

      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.id = 'open-wallet';
      btn.textContent = 'Wallet';
      btn.addEventListener('click', open);
      row.appendChild(btn);
    }
    refreshAccount();
    refresh();
    setInterval(flushPending, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();
