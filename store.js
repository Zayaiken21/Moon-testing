/**
 * store.js — the Voxelia shop.
 *
 * One store, for everything. There used to be two: this file had a catalogue
 * on the title screen, and the wallet grew a membership panel of its own
 * later — and both of them built an element called `store-screen`. Two things
 * with one id means `getElementById` finds whichever was built first, so
 * opening one of them opened the other. They are one panel now, and this file
 * owns it.
 *
 * What is really for sale
 * -----------------------
 * The membership, and nothing else yet. Everything else is shown so players
 * can see what is coming, and it says plainly that it is not for sale rather
 * than taking anybody to a checkout that cannot work. `sellable: true` is
 * what makes something buyable, and only the membership has it.
 *
 * Who decides what somebody owns
 * ------------------------------
 * The server. This file can ask for a checkout and can show what the server
 * says, and that is all. A membership is turned on by Stripe's webhook
 * talking to the server; nothing in a browser — not this file, not the page
 * Stripe sends people back to — can grant one.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 1. What is in the shop.                                             *
   *                                                                     *
   *    Add freely. `sellable: true` means it can actually be bought,    *
   *    and for now only the membership has it.                          *
   * ------------------------------------------------------------------ */
  const CATALOGUE = [
    {
      id: 'membership',
      name: 'Voxelia Member',
      price: '',                                  // the server says what it costs
      blurb: 'Five times the daily earning limit, withdrawals open sooner, and a ' +
             'member tag by your name.',
      swatch: '#7FFFD9',
      membership: true,
      sellable: true
    },

    /* ---- looks ---- */
    { id: 'skins-explorer', name: 'Explorer Looks', price: '$3.99', group: 'Looks',
      blurb: 'Six more characters: diver, ranger, pilot, botanist, miner and drifter.',
      swatch: '#A97BFF' },
    { id: 'skins-deepsea', name: 'Deep Sea Looks', price: '$3.99', group: 'Looks',
      blurb: 'Four divers with lamps that really light the water around them.',
      swatch: '#4FC8FF' },
    { id: 'skins-starfarer', name: 'Starfarer Suits', price: '$4.99', group: 'Looks',
      blurb: 'Five space suits with working visors, and a tether that glows.',
      swatch: '#C79BFF' },
    { id: 'pet-hats', name: 'Hats For Pets', price: '$2.49', group: 'Looks',
      blurb: 'Twelve little hats your companions can wear. Purely silly.',
      swatch: '#FF8A4C' },

    /* ---- things to build with ---- */
    { id: 'lantern-set', name: 'Lantern Set', price: '$1.99', group: 'Building',
      blurb: 'Eight lamps, in warm, cold, coral, violet, sea green and three more.',
      swatch: '#FFC24C' },
    { id: 'glass-works', name: 'Glass Works', price: '$2.99', group: 'Building',
      blurb: 'Stained glass in sixteen colours, with panes and lattices.',
      swatch: '#8FE3D0' },
    { id: 'castle-kit', name: 'Castle Kit', price: '$3.99', group: 'Building',
      blurb: 'Battlements, arrow slits, banners, and a drawbridge that works.',
      swatch: '#B9B4C8' },
    { id: 'garden-kit', name: 'Garden Kit', price: '$2.99', group: 'Building',
      blurb: 'Trellises, hedges, flowerbeds and a fountain that runs.',
      swatch: '#8FE39A' },

    /* ---- places and creatures ---- */
    { id: 'world-caverns', name: 'The Deep Caverns', price: '$4.99', group: 'Worlds',
      blurb: 'A cave system under every world, with its own creatures and its own light.',
      swatch: '#6E5BA8' },
    { id: 'world-archipelago', name: 'The Archipelago', price: '$4.99', group: 'Worlds',
      blurb: 'A thousand islands, shallow reefs, and something large in the deep.',
      swatch: '#2E8BD0' },
    { id: 'creatures-mythic', name: 'Rare Creature Pack', price: '$3.99', group: 'Worlds',
      blurb: 'Twenty more creatures to find, every one of them worth something.',
      swatch: '#FFD36E' },

    /* ---- playing together ---- */
    { id: 'room-slots', name: 'Bigger Rooms', price: '$4.99', group: 'Together',
      blurb: 'Host up to thirty two players at once instead of eight.',
      swatch: '#FF6E8A' },
    { id: 'world-slots', name: 'More Saved Worlds', price: '$1.99', group: 'Together',
      blurb: 'Keep twenty saved worlds instead of five.',
      swatch: '#7FD8FF' },
    { id: 'supporter', name: 'Supporter Badge', price: '$2.99', group: 'Together',
      blurb: 'A coloured tag above your head, and our thanks. Nothing else.',
      swatch: '#6FE3C4' }
  ];

  /* ------------------------------------------------------------------ *
   * 2. Talking to the server.                                           *
   * ------------------------------------------------------------------ */
  function base() {
    let addr = '';
    try {
      addr = window.DEFAULT_SERVER ||
        (window.Game && Game.net && Game.net.url ? Game.net.url.replace(/^ws/, 'http') : '');
    } catch (e) {}
    if (!addr) return '';
    if (/^https?:\/\//.test(addr)) return addr.replace(/\/$/, '');
    return (location.protocol === 'https:' ? 'https://' : 'http://') +
      addr.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  const session = () => {
    try { return (window.VoxeliaWallet && VoxeliaWallet.session && VoxeliaWallet.session()) || ''; }
    catch (e) { return ''; }
  };
  const account = () => {
    try { return (window.VoxeliaWallet && VoxeliaWallet.signedIn && VoxeliaWallet.signedIn()) || null; }
    catch (e) { return null; }
  };
  const money = (c) => '$' + (Math.max(0, c | 0) / 100).toFixed(2);

  async function ask(route, body) {
    const b = base();
    if (!b) throw new Error('offline');
    const res = await fetch(b + route, body ? {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    } : undefined);
    return res.json();
  }

  let plans = null;

  const say = (text, how) => {
    const el = document.getElementById('store-said');
    if (!el) return;
    el.className = 'store-said' + (how ? ' ' + how : '');
    el.textContent = text;
  };

  /* ------------------------------------------------------------------ *
   * 3. The membership.                                                  *
   * ------------------------------------------------------------------ */
  async function buyMembership() {
    if (!account()) {
      say('Make an account first — a membership belongs to a person, not to this ' +
          'device. Title screen → Account.', 'bad');
      return;
    }
    say('Opening the card page…');
    try {
      const out = await ask('/store/checkout', { session: session() });
      if (!out.ok || !out.url) { say(out.why || 'Could not open the card page.', 'bad'); return; }
      /* Stripe hosts the card form, so no card detail ever reaches this page.
         That is the whole reason to send people there rather than asking for
         a card number here. */
      say('Taking you to the card page…');
      location.href = out.url;
    } catch (e) { say('Could not reach the server.', 'bad'); }
  }

  async function manageMembership() {
    say('Opening your billing page…');
    try {
      const out = await ask('/store/manage', { session: session() });
      if (!out.ok || !out.url) { say(out.why || 'Could not open the billing page.', 'bad'); return; }
      location.href = out.url;
    } catch (e) { say('Could not reach the server.', 'bad'); }
  }

  async function redeem() {
    const box = document.getElementById('store-code');
    const code = ((box && box.value) || '').trim();
    if (!code) { say('Type the code in first.', 'bad'); return; }
    if (!account()) { say('Sign in first, so the membership has somewhere to go.', 'bad'); return; }
    say('Checking…');
    try {
      const out = await ask('/store/redeem', { session: session(), code });
      if (!out.ok) { say(out.why || 'That code did not work.', 'bad'); return; }
      say('Done. Your daily limit is now ' + money(out.cap) + '.', 'good');
      try { if (window.Game && Game.toast) Game.toast('Membership on.'); } catch (e) {}
      try { if (window.VoxeliaWallet) await VoxeliaWallet.refresh(); } catch (e) {}
      render();
    } catch (e) { say('Could not reach the server.', 'bad'); }
  }

  /* ------------------------------------------------------------------ *
   * 4. What this device thinks the player owns. The server is the       *
   *    truth; this is only for showing a tick.                          *
   * ------------------------------------------------------------------ */
  const OWNED_KEY = 'voxelia.store.owned';
  function owned() {
    try { return JSON.parse(localStorage.getItem(OWNED_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function grant(id) {
    try {
      const list = owned();
      if (list.indexOf(id) === -1) list.push(id);
      localStorage.setItem(OWNED_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  /* ------------------------------------------------------------------ *
   * 5. The panel.                                                       *
   * ------------------------------------------------------------------ */
  const CSS = `
  #store-screen{position:fixed;inset:0;z-index:84;display:none;overflow:auto;
    background:linear-gradient(180deg, rgba(14,12,22,.66), rgba(14,12,22,.95));
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    padding:max(16px, env(safe-area-inset-top)) 16px 28px}
  #store-screen.open{display:block}
  #store-screen .store-sheet{max-width:760px;margin:0 auto;background:#12182B;
    border:1px solid #27324E;border-radius:20px;padding:22px;color:#EDE9F5;
    font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    box-shadow:0 18px 60px rgba(0,0,0,.5)}
  #store-screen h2{font-family:"Chakra Petch", ui-sans-serif, system-ui, sans-serif;
    font-size:23px;margin:0 0 4px}
  #store-screen h3{font-family:"Chakra Petch", ui-sans-serif, system-ui, sans-serif;
    font-size:13px;letter-spacing:.09em;text-transform:uppercase;color:#7E8CAC;
    margin:22px 0 10px}
  #store-screen p.note{color:#9AA7C4;font-size:13.5px;line-height:1.55;margin:0 0 16px}

  .store-hero{background:linear-gradient(150deg,#1C6B5A,#123E52);border:1px solid #2F7F6B;
    border-radius:16px;padding:18px}
  .store-hero h4{font-family:"Chakra Petch", sans-serif;font-size:19px;margin:0 0 2px}
  .store-hero .price{font-family:"Chakra Petch", sans-serif;font-size:30px;color:#7FFFD9;
    line-height:1.1;margin:6px 0 2px}
  .store-hero .price small{font-size:13px;color:#A8D8CC;display:block;font-family:inherit}
  .store-hero p{color:#CDEDE4;font-size:13.5px;line-height:1.5;margin:8px 0 0}
  .store-perks{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));
    gap:8px;margin:14px 0 2px}
  .store-perk{background:rgba(0,0,0,.22);border-radius:10px;padding:9px 11px}
  .store-perk b{display:block;font-family:"Chakra Petch", sans-serif;font-size:17px;color:#7FFFD9}
  .store-perk small{color:#A8D8CC;font-size:11px;text-transform:uppercase;letter-spacing:.05em}

  .store-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
  .store-card{background:#1A2440;border:1px solid #27324E;border-radius:14px;
    padding:14px;display:flex;flex-direction:column;gap:7px}
  .store-card .swatch{width:100%;height:56px;border-radius:9px}
  .store-card b{font-family:"Chakra Petch", sans-serif;font-size:15px}
  .store-card small{color:#9AA7C4;font-size:12px;line-height:1.45;flex:1}
  .store-card .row{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .store-card .cost{font-family:"Chakra Petch", sans-serif;font-size:15px;color:#8FD8FF}
  .store-soon{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;
    color:#7E8CAC;border:1px solid #27324E;border-radius:999px;padding:3px 9px;white-space:nowrap}
  .store-owned{color:#7FFFD9;border-color:#2F7F6B}

  #store-screen button{background:#7FFFD9;color:#052B23;border:none;border-radius:11px;
    padding:12px 18px;font:inherit;font-weight:700;cursor:pointer;font-size:15px}
  #store-screen button.ghost{background:#1A2440;color:#EDE9F5;border:1px solid #27324E;
    font-weight:500;font-size:14px;padding:10px 15px}
  #store-screen button:disabled{opacity:.5;cursor:default}
  #store-screen .store-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
  #store-code{width:100%;margin:10px 0 0;background:#1A2440;border:1px solid #27324E;
    border-radius:10px;padding:12px;color:#EDE9F5;font:inherit;font-size:16px;
    letter-spacing:.14em;text-transform:uppercase}
  .store-said{font-size:13px;line-height:1.5;margin:12px 0 0;color:#9AA7C4;min-height:1.2em}
  .store-said.bad{color:#FF9B8A}
  .store-said.good{color:#7FFFD9}
  .store-legal{color:#6F7C9A;font-size:11.5px;line-height:1.5;margin-top:18px}
  .store-test{background:rgba(255,194,76,.14);border:1px solid rgba(255,194,76,.45);
    color:#FFD98A;border-radius:10px;padding:9px 12px;font-size:12.5px;margin:0 0 14px}
  `;

  function build() {
    /* One store, even when an old copy of something else is still cached.
    
       A service worker can leave somebody running this file next to an older
       rewards.js that still built a panel of its own, also called
       `store-screen`. Two elements with one id means `getElementById` finds
       whichever came first, so pressing Membership in the wallet opened an
       empty shell with the real store stranded behind it and nothing that
       would close either. Any panel that is not the one built here is taken
       out before this one goes in. */
    const existing = document.getElementById('store-screen');
    if (existing) {
      if (existing.dataset.storeJs === '1') return;      // ours already
      try { existing.parentNode.removeChild(existing); } catch (e) {}
    }
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const screen = document.createElement('section');
    screen.id = 'store-screen';
    screen.dataset.storeJs = '1';
    screen.innerHTML =
      '<div class="store-sheet">' +
        '<h2>Store</h2>' +
        '<p class="note">Voxelia is free, and stays free. This is how it pays for its server.</p>' +
        '<div id="store-test"></div>' +
        '<div id="store-hero"></div>' +
        '<div id="store-rest"></div>' +
        '<p class="store-said" id="store-said"></p>' +
        '<div class="store-actions"><button class="ghost" id="store-close">Close</button></div>' +
        '<p class="store-legal">Payments are handled by Stripe. No card details ever reach ' +
          'this game or its server. If you are under 18, ask whoever pays the bill first.</p>' +
      '</div>';
    document.body.appendChild(screen);

    screen.addEventListener('click', (e) => { if (e.target === screen) close(); });
    document.getElementById('store-close').addEventListener('click', close);
  }

  /** The membership, with whatever the server says it costs today. */
  function drawHero() {
    const hero = document.getElementById('store-hero');
    if (!hero) return;
    const item = CATALOGUE[0];

    if (!plans) {
      hero.innerHTML = '<div class="store-hero"><h4>' + item.name + '</h4>' +
        '<p>Asking the server what this costs…</p></div>';
      return;
    }

    const a = account();
    const member = !!(a && (a.member || a.subscribed));
    const price = money(plans.membership.priceCents);
    const trial = plans.trialDays || 0;

    hero.innerHTML =
      '<div class="store-hero">' +
        '<h4>' + (plans.membership.name || item.name) + '</h4>' +
        '<div class="price">' +
          (member ? 'You are a member' : (trial ? trial + ' days free' : price)) +
          '<small>' + (member
            ? (a.subscription_until ? 'through ' + String(a.subscription_until).slice(0, 10) : 'thank you')
            : (trial ? 'then ' + price + ' a month · cancel any time'
                     : price + ' a month · cancel any time')) +
          '</small></div>' +
        '<p>' + (plans.membership.blurb || item.blurb) + '</p>' +
        '<div class="store-perks">' +
          '<div class="store-perk"><small>Daily limit now</small><b>' +
            money(plans.free.cap) + '</b></div>' +
          '<div class="store-perk"><small>As a member</small><b>' +
            money(plans.member.cap) + '</b></div>' +
          '<div class="store-perk"><small>Withdraw from</small><b>' +
            money(plans.member.withdraw.min) + '</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="store-actions">' +
        (member
          ? '<button id="store-manage">Manage membership</button>'
          : (plans.card
              ? '<button id="store-buy">' +
                (trial ? 'Start my ' + trial + ' day free trial' : 'Become a member') + '</button>'
              : '<button id="store-buy" disabled>Card payments are not set up yet</button>')) +
        '<button class="ghost" id="store-have-code">I have a code</button>' +
      '</div>' +
      '<div id="store-code-row" style="display:none">' +
        '<input id="store-code" placeholder="ABCD-1234-EFGH" autocomplete="off" spellcheck="false" />' +
        '<div class="store-actions"><button id="store-redeem">Turn it on</button></div>' +
      '</div>';

    const manage = document.getElementById('store-manage');
    if (manage) manage.addEventListener('click', manageMembership);
    const buy = document.getElementById('store-buy');
    if (buy && !buy.disabled) buy.addEventListener('click', buyMembership);

    document.getElementById('store-have-code').addEventListener('click', () => {
      const row = document.getElementById('store-code-row');
      row.style.display = row.style.display === 'none' ? 'block' : 'none';
      if (row.style.display === 'block') document.getElementById('store-code').focus();
    });
    document.getElementById('store-redeem').addEventListener('click', redeem);
    document.getElementById('store-code').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') redeem();
    });

    const test = document.getElementById('store-test');
    if (test) {
      test.innerHTML = plans.testMode
        ? '<p class="store-test">Stripe is in <b>test mode</b>, so no real money can move. ' +
          'Card 4242 4242 4242 4242, any date in the future, any three digits.</p>'
        : '';
    }
  }

  /** Everything else: shown, described, and honestly not for sale yet. */
  function drawRest() {
    const box = document.getElementById('store-rest');
    if (!box) return;
    const have = owned();
    const groups = [];
    for (const item of CATALOGUE) {
      if (item.membership) continue;
      const g = item.group || 'More';
      let row = groups.find(x => x.name === g);
      if (!row) { row = { name: g, items: [] }; groups.push(row); }
      row.items.push(item);
    }
    box.innerHTML = groups.map(g =>
      '<h3>' + g.name + '</h3><div class="store-grid">' +
      g.items.map(item =>
        '<div class="store-card" data-id="' + item.id + '">' +
          '<span class="swatch" style="background:linear-gradient(140deg,' +
            item.swatch + ',' + item.swatch + '55)"></span>' +
          '<b>' + item.name + '</b>' +
          '<small>' + item.blurb + '</small>' +
          '<span class="row"><span class="cost">' + item.price + '</span>' +
          (have.indexOf(item.id) >= 0
            ? '<span class="store-soon store-owned">Yours</span>'
            : '<span class="store-soon">' + (item.sellable ? 'Buy' : 'Coming soon') + '</span>') +
          '</span>' +
        '</div>').join('') +
      '</div>').join('');
  }

  function render() { drawHero(); drawRest(); }

  async function open() {
    build();
    document.getElementById('store-screen').classList.add('open');
    say('');
    render();
    try {
      const got = await ask('/store/plans');
      plans = (got && got.ok) ? got : null;
    } catch (e) { plans = null; }
    if (!plans) {
      const hero = document.getElementById('store-hero');
      if (hero) {
        hero.innerHTML = '<div class="store-hero"><h4>Voxelia Member</h4>' +
          '<p>The store needs a connection. Try again in a moment.</p></div>';
      }
      return;
    }
    render();
  }

  function close() {
    const s = document.getElementById('store-screen');
    if (s) s.classList.remove('open');
  }

  /* Somebody coming back from Stripe.
   *
   * The membership is turned on by Stripe telling the server, not by this
   * page loading — anybody could load this page. So all this does is say
   * thank you and ask the server again every couple of seconds until the
   * webhook has landed, which is usually within one.
   */
  function checkReturn() {
    let paid = null;
    try { paid = new URLSearchParams(location.search).get('paid'); } catch (e) {}
    if (paid === null) return;
    try {
      const url = new URL(location.href);
      url.searchParams.delete('paid');
      url.searchParams.delete('session');
      history.replaceState({}, '', url.toString());
    } catch (e) {}
    if (paid !== '1') return;

    const toast = (m) => { try { if (window.Game && Game.toast) Game.toast(m); } catch (e) {} };
    toast('Thank you. Turning your membership on…');
    let tries = 0;
    const look = () => {
      tries++;
      try {
        if (window.VoxeliaWallet && VoxeliaWallet.refresh) {
          VoxeliaWallet.refresh().then((w) => {
            if (w && w.member) { toast('You are a member. Enjoy.'); return; }
            if (tries < 8) setTimeout(look, 2000);
            else toast('That is taking a moment — it will turn on shortly. ' +
                       'There is no need to pay again.');
          }).catch(() => { if (tries < 8) setTimeout(look, 2000); });
          return;
        }
      } catch (e) {}
      if (tries < 8) setTimeout(look, 2000);
    };
    setTimeout(look, 1500);
  }

  window.VoxeliaStore = {
    open, close, render,
    owns: (id) => owned().indexOf(id) >= 0,
    all: () => owned().slice(),
    catalogue: () => CATALOGUE.slice(),
    grant, buyMembership, manageMembership, redeem
  };

  /* A way in from the title screen, beside the other buttons. */
  function attach() {
    if (document.getElementById('open-store')) return;
    const row = document.querySelector('#home .minor-row');
    if (!row) { setTimeout(attach, 700); return; }
    const btn = document.createElement('button');
    btn.id = 'open-store';
    btn.className = 'btn';
    btn.textContent = 'Store';
    btn.addEventListener('click', open);
    row.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { attach(); checkReturn(); });
  } else {
    attach();
    checkReturn();
  }
})();
