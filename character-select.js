const CHARACTER_PRESETS = [
  {id:'male_01_explorer',sex:'male',name:'Explorer',style:'explorer',hair:'#3A261B',shirt:'#315fca',accent:'#F4C247',jacket:'#55412f',pants:'#59604c',pants2:'#3c4236',shoes:'#2d2928',sole:'#161616'},
  {id:'male_02_ranger',sex:'male',name:'Ranger',style:'ranger',hair:'#4a2f20',shirt:'#315b38',accent:'#cdb58a',jacket:'#7c6644',pants:'#3e5144',pants2:'#2d3c32',shoes:'#4a3425',sole:'#231a14'},
  {id:'male_03_builder',sex:'male',name:'Builder',style:'builder',hair:'#3a271e',shirt:'#b14f2d',accent:'#e1b57a',jacket:'#333941',pants:'#37404a',pants2:'#262d34',shoes:'#514031',sole:'#28231f'},
  {id:'male_04_scout',sex:'male',name:'Scout',style:'scout',hair:'#3d281e',shirt:'#18aeb0',accent:'#d7f4ef',jacket:'#1e4258',pants:'#24364e',pants2:'#17263b',shoes:'#27b9bd',sole:'#e8f0ec'},
  {id:'male_05_pilot',sex:'male',name:'Pilot',style:'pilot',hair:'#3b241c',shirt:'#722a31',accent:'#f4dfc3',jacket:'#722a31',pants:'#34312f',pants2:'#262422',shoes:'#3b2c27',sole:'#191715'},
  {id:'male_06_scholar',sex:'male',name:'Scholar',style:'scholar',hair:'#3a2a25',shirt:'#384f76',accent:'#e6e8eb',jacket:'#304765',pants:'#555b63',pants2:'#41464c',shoes:'#2b2d31',sole:'#17191c'},
  {id:'male_07_farmhand',sex:'male',name:'Farmhand',style:'farmhand',hair:'#74482c',shirt:'#ede1ca',accent:'#c99a45',jacket:'#6e7650',pants:'#6e7650',pants2:'#596043',shoes:'#6c4a2c',sole:'#3e2d1f'},
  {id:'male_08_coastwalker',sex:'male',name:'Coast Walker',style:'coastwalker',hair:'#6b3d29',shirt:'#6ec4cf',accent:'#f6f1e7',jacket:'#6ec4cf',pants:'#e8dfcf',pants2:'#c9c0b0',shoes:'#6ec4cf',sole:'#f9f7f2'},
  {id:'male_09_starfarer',sex:'male',name:'Starfarer',style:'starfairer',hair:'#18243c',shirt:'#1d2739',accent:'#42dfff',jacket:'#dee8f2',pants:'#20293b',pants2:'#101724',shoes:'#223046',sole:'#111827',acc1:'#dce5ee',acc2:'#3fe6ff'},
  {id:'male_10_wanderer',sex:'male',name:'Wanderer',style:'wanderer',hair:'#4a2f28',shirt:'#4c4655',accent:'#7d3f67',jacket:'#393742',pants:'#3b3941',pants2:'#29272f',shoes:'#423832',sole:'#231e1b'},
  {id:'female_01_explorer',sex:'female',name:'Explorer',style:'explorer',hair:'#5a3426',shirt:'#315fca',accent:'#F4C247',jacket:'#55412f',pants:'#59604c',pants2:'#3c4236',shoes:'#2d2928',sole:'#161616'},
  {id:'female_02_ranger',sex:'female',name:'Ranger',style:'ranger',hair:'#4a2f20',shirt:'#315b38',accent:'#cdb58a',jacket:'#7c6644',pants:'#3e5144',pants2:'#2d3c32',shoes:'#4a3425',sole:'#231a14'},
  {id:'female_03_builder',sex:'female',name:'Builder',style:'builder',hair:'#4b2a22',shirt:'#b14f2d',accent:'#e1b57a',jacket:'#333941',pants:'#37404a',pants2:'#262d34',shoes:'#514031',sole:'#28231f'},
  {id:'female_04_scout',sex:'female',name:'Scout',style:'scout',hair:'#4a2b23',shirt:'#18aeb0',accent:'#d7f4ef',jacket:'#1e4258',pants:'#24364e',pants2:'#17263b',shoes:'#27b9bd',sole:'#e8f0ec'},
  {id:'female_05_pilot',sex:'female',name:'Pilot',style:'pilot',hair:'#4a2e25',shirt:'#722a31',accent:'#f4dfc3',jacket:'#722a31',pants:'#34312f',pants2:'#262422',shoes:'#3b2c27',sole:'#191715'},
  {id:'female_06_scholar',sex:'female',name:'Scholar',style:'scholar',hair:'#4c322a',shirt:'#384f76',accent:'#e6e8eb',jacket:'#304765',pants:'#555b63',pants2:'#41464c',shoes:'#2b2d31',sole:'#17191c'},
  {id:'female_07_gardener',sex:'female',name:'Gardener',style:'farmhand',hair:'#6a412a',shirt:'#ede1ca',accent:'#c99a45',jacket:'#6e7650',pants:'#6e7650',pants2:'#596043',shoes:'#6c4a2c',sole:'#3e2d1f'},
  {id:'female_08_coastwalker',sex:'female',name:'Coast Walker',style:'coastwalker',hair:'#70432f',shirt:'#6ec4cf',accent:'#f6f1e7',jacket:'#6ec4cf',pants:'#e8dfcf',pants2:'#c9c0b0',shoes:'#6ec4cf',sole:'#f9f7f2'},
  {id:'female_09_starfarer',sex:'female',name:'Starfarer',style:'starfairer',hair:'#1b2038',shirt:'#1d2739',accent:'#42dfff',jacket:'#dee8f2',pants:'#20293b',pants2:'#101724',shoes:'#223046',sole:'#111827',acc1:'#dce5ee',acc2:'#3fe6ff'},
  {id:'female_10_wanderer',sex:'female',name:'Wanderer',style:'wanderer',hair:'#58313f',shirt:'#4c4655',accent:'#7d3f67',jacket:'#393742',pants:'#3b3941',pants2:'#29272f',shoes:'#423832',sole:'#231e1b'}
];

const DEFAULT_SKIN = '#E8BF96';
const COLOR_FIELDS = [
  ['skin','Skin'],['hair','Hair'],['eyes','Eyes'],['shirt','Top'],['accent','Top Accent'],['jacket','Outerwear'],['sleeves','Sleeves'],['pants','Bottom'],['pants2','Bottom Accent'],['shoes','Shoes'],['sole','Soles'],['acc1','Accessory 1'],['acc2','Accessory 2']
];

let state = {sex:'male',presetId:'male_01_explorer',name:'Player',colors:{}};
let rotated = false;
/* Which colours the player has deliberately chosen. Picking a different style
   used to throw every one of them away, so changing a colour and then trying
   another outfit put you back to that outfit's factory colours and it looked
   as though the customiser did nothing. What you have chosen is now carried
   from one style to the next, until you press Reset. */
let touched = new Set();

/* ------------------------------------------------------------------
   The real thing. The flat panels above are drawn with CSS so the page
   is usable the instant it opens; this puts the actual rigged model on
   top of them, idling, so you are choosing the character you will play
   rather than a picture of it. If three.js or the model pack cannot be
   reached, nothing happens and the CSS figure stays.
   ------------------------------------------------------------------ */
const Preview3D = {
  ready: null, avatar: null, want: null, failed: false,

  boot() {
    if (this.failed) return null;
    if (this.ready) return this.ready;
    this.ready = (async () => {
      if (!window.THREE) throw new Error('three.js not present');
      if (!window.VoxeliaAvatars) throw new Error('avatar pack not present');
      const stage = document.querySelector('.avatar-stage');
      if (!stage) throw new Error('no stage');
      const canvas = document.createElement('canvas');
      canvas.className = 'avatar-3d';
      canvas.setAttribute('aria-hidden', 'true');
      stage.appendChild(canvas);
      this.canvas = canvas;
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
      this.rig = new THREE.Group();
      this.scene.add(this.rig);
      this.scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2438, 1.05));
      const key = new THREE.DirectionalLight(0xffffff, 0.85);
      key.position.set(2.4, 4, 3.2);
      this.scene.add(key);
      const rim = new THREE.DirectionalLight(0x8fd8ff, 0.4);
      rim.position.set(-3, 2, -2.5);
      this.scene.add(rim);
      this.clock = (window.performance || Date).now();
      this.spin = 0;
      this.resize();
      window.addEventListener('resize', () => this.resize());
      const frame = () => {
        requestAnimationFrame(frame);
        const now = (window.performance || Date).now();
        const dt = Math.min(0.05, (now - this.clock) / 1000);
        this.clock = now;
        if (this.avatar) {
          this.avatar.update(dt, { speed: 0, grounded: true });
          // a slow turn, or the angle the rotate button asked for
          this.spin += rotated ? dt * 1.1 : dt * 0.32;
          this.rig.rotation.y = this.spin;
        }
        this.renderer.render(this.scene, this.camera);
      };
      requestAnimationFrame(frame);
      return true;
    })().catch((e) => { this.failed = true; console.info('3D preview unavailable:', e.message); throw e; });
    return this.ready;
  },

  resize() {
    if (!this.renderer || !this.canvas) return;
    const st = this.canvas.parentNode;
    const w = Math.max(1, st.clientWidth), h = Math.max(1, st.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // frame a 1.8 m figure from the knees up, whatever shape the panel is
    const fit = Math.max(1.05, 2.15 / Math.min(1.4, Math.max(0.5, w / h)));
    this.camera.position.set(0, 0.95, 2.35 * fit);
    this.camera.lookAt(0, 0.92, 0);
  },

  show(presetId, colors) {
    this.want = presetId;
    const go = this.boot();
    if (!go) return;
    go.then(() => {
      if (this.want !== presetId) return;
      return VoxeliaAvatars.create({ characterVersion: 2, presetId, name: 'Preview', colors: toPacket(colors) })
        .then((av) => {
          if (this.want !== presetId) { av.dispose(); return; }
          if (this.avatar) this.avatar.dispose();
          this.avatar = av;
          av.object.position.y = -0.02;
          this.rig.add(av.object);
          document.querySelector('.avatar-stage').classList.add('has-3d');
        });
    }).catch(() => {});
  },

  recolor(colors) {
    if (this.avatar) this.avatar.recolor(toPacket(colors));
  }
};

/* ------------------------------------------------------------------
   The picture on each tile.

   The tiles used to be the same flat CSS figure for everybody, which made
   ten different characters look like ten copies of one template. Each tile
   now holds a picture of the actual model, drawn once into a small canvas by
   a renderer kept aside for the purpose, and kept. If the model pack or the
   browser's second drawing surface is not there, nothing is drawn and the
   flat figure underneath stays exactly as it was.
   ------------------------------------------------------------------ */
const Thumbs = {
  shots: new Map(),        // presetId@colourStamp -> canvas
  queue: [],
  busy: false,
  failed: false,
  SIZE: 132,

  /* One drawing surface, borrowed.

     This used to make a WebGLRenderer of its own, and that is the whole
     reason the tiles stayed flat on a phone. A browser will only give a page
     so many drawing surfaces — on iOS not many at all — and this page has
     already spent one on the big preview, with the game holding others in
     the page around it. Asking for a second was refused, `failed` was set,
     and every tile fell back to the CSS template for the rest of the visit:
     a real model in the preview and ten identical cut-outs beside it, which
     is exactly what it looked like.

     So the preview's renderer is borrowed instead. It is resized to the size
     of a tile, our own little scene is drawn into it, the pixels are copied
     out, and it is put straight back the way it was — the preview redraws
     every frame anyway, so it never notices. No second surface, nothing to
     refuse. */
  kit() {
    if (this.painter !== undefined) return this.painter;
    try {
      if (!window.THREE || !window.VoxeliaAvatars) throw new Error('no model pack');
      /* If the preview itself could not start there will never be a
         renderer to borrow, and asking every quarter second for ever is
         worse than nothing. */
      if (Preview3D && Preview3D.failed) throw new Error('no preview to borrow');
      const borrowed = Preview3D && Preview3D.renderer;
      if (!borrowed) return undefined;          // not up yet: ask again shortly
      const scene = new THREE.Scene();
      // far enough back that the whole figure fits, head to shoes
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
      camera.position.set(0.30, 0.94, 5.25);
      camera.lookAt(0, 0.86, 0);
      scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2438, 1.15));
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(2.2, 3.4, 3);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x8fd8ff, 0.45);
      rim.position.set(-2.6, 1.8, -2.2);
      scene.add(rim);
      this.painter = { renderer: borrowed, scene, camera };
    } catch (e) {
      this.painter = null;
      this.failed = true;
      console.info('character pictures unavailable:', e.message);
    }
    return this.painter;
  },

  /**
   * Draw one figure into a small canvas.
   *
   * This draws into a picture of its own rather than into the one on screen.
   *
   * Reading the pixels back off the visible canvas is only reliable in the
   * same breath as the drawing — a browser is free to clear it the moment it
   * has put it on screen — and worse, this page lives in a frame the game
   * hides rather than closes. Hidden, that canvas has no size at all, so a
   * picture taken while it was away came back empty, and an empty picture
   * was then kept for good. That is why the characters were there, and then
   * after a trip into the game and back, were blank squares.
   *
   * A render target has a size of its own and does not care whether anything
   * is on screen, so the same drawing works whether the page is showing or
   * not, and the preview is never resized out from under itself.
   */
  paint(object) {
    const p = this.painter;
    const r = p.renderer;
    const N = this.SIZE * 2;
    if (!p.target) p.target = new THREE.WebGLRenderTarget(N, N);

    const out = document.createElement('canvas');
    out.width = out.height = this.SIZE;
    const wasTarget = r.getRenderTarget();
    try {
      p.scene.add(object);
      r.setRenderTarget(p.target);
      r.render(p.scene, p.camera);
      const buf = new Uint8Array(N * N * 4);
      r.readRenderTargetPixels(p.target, 0, 0, N, N, buf);
      p.scene.remove(object);

      /* A render target counts its rows from the bottom and a canvas from
         the top, so the rows go back in the other order or everybody comes
         out standing on their head. */
      const big = document.createElement('canvas');
      big.width = big.height = N;
      const bg = big.getContext('2d');
      const img = bg.createImageData(N, N);
      for (let y = 0; y < N; y++) {
        const from = (N - 1 - y) * N * 4;
        img.data.set(buf.subarray(from, from + N * 4), y * N * 4);
      }
      bg.putImageData(img, 0, 0);

      const g = out.getContext('2d');
      g.imageSmoothingEnabled = true;
      g.drawImage(big, 0, 0, this.SIZE, this.SIZE);
    } finally {
      try { r.setRenderTarget(wasTarget || null); } catch (e) {}
    }
    return out;
  },

  /** Is there anything actually in this picture? */
  drawn(canvas) {
    try {
      const d = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let lit = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 12) lit++;
      return lit > canvas.width * canvas.height * 0.01;
    } catch (e) { return true; }      // cannot tell: assume it is fine
  },

  /** A picture of this character, drawn when it gets to the front. */
  want(presetId, colors, onDone) {
    if (this.failed) return null;
    const stamp = presetId + '@' + JSON.stringify(colors || {});
    const have = this.shots.get(stamp);
    if (have) { onDone(have); return have; }
    this.queue.push({ presetId, colors, stamp, onDone });
    this.pump();
    return null;
  },

  pump() {
    if (this.busy || this.failed || !this.queue.length) return;
    const p = this.kit();
    /* `undefined` means the preview has not finished starting up, which is
       not a failure — the models are still loading. Ask again in a moment
       rather than giving up on pictures for the whole visit. */
    if (p === undefined) {
      if (!this.waiting) {
        this.waiting = true;
        setTimeout(() => { this.waiting = false; this.pump(); }, 260);
      }
      return;
    }
    if (!p) return;
    this.busy = true;
    const job = this.queue.shift();
    VoxeliaAvatars.create({ characterVersion: 2, presetId: job.presetId,
                            name: 'Tile', colors: toPacket(job.colors) })
      .then((av) => {
        av.object.position.y = -0.04;
        const out = this.paint(av.object);
        av.dispose();
        /* An empty picture is not worth keeping — kept, it would be handed
           back for ever and the character would stay a blank square. Left
           uncached, the flat figure shows instead and the next time the
           grid is built it is drawn again properly. */
        if (!this.drawn(out)) {
          console.info('no picture for ' + job.presetId + ' this time');
          return;
        }
        this.shots.set(job.stamp, out);
        job.onDone(out);
      })
      /* One character that will not load is one blank tile, not ten. This
         used to set `failed`, which stopped every picture after it. */
      .catch((e) => { console.info('no picture for ' + job.presetId + ':', e.message); })
      .then(() => { this.busy = false; this.pump(); });
  }
};

/* the colour names the game and the model pack use */
function toPacket(c) {
  c = c || {};
  return {
    skin: c.skin, hair: c.hair, eyes: c.eyes, eyebrows: c.hair,
    shirt: c.shirt, shirtSecondary: c.accent, jacket: c.jacket, sleeves: c.sleeves,
    pants: c.pants, pantsSecondary: c.pants2, shoes: c.shoes, sole: c.sole,
    accessoryPrimary: c.acc1, accessorySecondary: c.acc2
  };
}

const $ = s => document.querySelector(s);
const presetGrid = $('#presetGrid');
const colorGrid = $('#colorGrid');
/* The big preview is replaced on every render, so it must be looked up fresh
   each time. Holding the first node in a const meant every later render
   replaced a node that was no longer in the page: the thumbnails highlighted
   but the preview never changed, which read as "choosing does nothing". */
const stageAvatar = () => document.querySelector('.avatar-stage .avatar');

function currentPreset(){return CHARACTER_PRESETS.find(p=>p.id===state.presetId) || CHARACTER_PRESETS[0]}
function presetColors(p){return {skin:DEFAULT_SKIN,hair:p.hair,eyes:'#1f2937',shirt:p.shirt,accent:p.accent,jacket:p.jacket,sleeves:p.shirt,pants:p.pants,pants2:p.pants2,shoes:p.shoes,sole:p.sole,acc1:p.acc1||'#ffffff',acc2:p.acc2||'#808080'}}
function makeAvatar(p, compact=false){
  const el=document.createElement('div');
  el.className=`avatar ${compact?'avatar-thumb':''} ${p.sex} ${p.style}`;
  el.innerHTML=`<i class="face-eye eye-l"></i><i class="face-eye eye-r"></i><i class="brow brow-l"></i><i class="brow brow-r"></i><i class="nose"></i><i class="mouth"></i><i class="neck"></i><i class="torso"></i><i class="outer"></i><i class="accent"></i><i class="arm arm-l"></i><i class="arm arm-r"></i><i class="hand hand-l"></i><i class="hand hand-r"></i><i class="hips"></i><i class="leg leg-l"></i><i class="leg leg-r"></i><i class="knee knee-l"></i><i class="knee knee-r"></i><i class="shoe shoe-l"></i><i class="shoe shoe-r"></i>`;
  applyColors(el,state.presetId===p.id?state.colors:presetColors(p));
  return el;
}
function applyColors(el,c){
  const vars={skin:'--skin',hair:'--hair',eyes:'--eyes',shirt:'--shirt',accent:'--accent',jacket:'--jacket',sleeves:'--sleeves',pants:'--pants',pants2:'--pants2',shoes:'--shoes',sole:'--sole',acc1:'--acc1',acc2:'--acc2'};
  Object.entries(vars).forEach(([k,v])=>el.style.setProperty(v,c[k]||presetColors(currentPreset())[k]));
}
function renderPresets(){
  presetGrid.innerHTML='';
  const list=CHARACTER_PRESETS.filter(p=>p.sex===state.sex);
  $('#presetCount').textContent=list.length;
  list.forEach((p,i)=>{
    const card=document.createElement('button');
    card.type='button'; card.className='preset-card'+(p.id===state.presetId?' selected':'');
    card.setAttribute('role','option'); card.setAttribute('aria-selected',p.id===state.presetId?'true':'false');
    card.innerHTML=`<div class="thumb-stage"></div><strong>${p.name}</strong><small>${String(i+1).padStart(2,'0')}</small>`;
    const stage=card.querySelector('.thumb-stage');
    // the flat figure first, so the grid is never empty, then the real one
    stage.appendChild(makeAvatar(p,true));
    card.addEventListener('click',()=>selectPreset(p.id));
    /* In the page before the picture is asked for.

       This used to be the other way round, and that is why the characters
       turned back into cut-outs the moment you chose one. A picture that has
       been drawn before comes back immediately, in the same breath as the
       asking — and at that moment the card was still a loose piece of markup
       that had not been put into the grid yet, so `isConnected` was false and
       the picture was thrown away. It only ever looked right on the very
       first render, when every picture had to be drawn from scratch and so
       arrived later, by which time the card had landed.

       The guard below is still needed for those later arrivals: choosing
       another character rebuilds the whole grid, and a picture finishing
       after that belongs to a card that no longer exists. */
    presetGrid.appendChild(card);
    const cols=(p.id===state.presetId)?state.colors:presetColors(p);
    Thumbs.want(p.id,cols,(shot)=>{
      if(!stage.isConnected) return;
      let img=stage.querySelector('canvas.thumb-3d');
      if(!img){img=document.createElement('canvas');img.className='thumb-3d';stage.appendChild(img);}
      img.width=shot.width;img.height=shot.height;
      img.getContext('2d').drawImage(shot,0,0);
      stage.classList.add('has-3d');
    });
  });
}
function renderLarge(){
  const p=currentPreset();
  const old=stageAvatar();
  const fresh=makeAvatar(p,false);
  fresh.id='largeAvatar';
  fresh.classList.add('avatar-large');
  if(rotated) fresh.classList.add('rotated');
  if(old) old.replaceWith(fresh);
  else { const st=document.querySelector('.avatar-stage'); if(st) st.appendChild(fresh); }
  $('#selectedName').textContent=p.name; $('#selectedId').textContent=p.id;
  $('#activeSexChip').textContent=p.sex[0].toUpperCase()+p.sex.slice(1); $('#activePresetChip').textContent=p.name;
  Preview3D.show(p.id, state.colors);
}
function renderColors(){
  colorGrid.innerHTML='';
  COLOR_FIELDS.forEach(([key,label])=>{
    const wrap=document.createElement('div');wrap.className='color-control';
    const color=document.createElement('input');color.type='color';color.value=state.colors[key];color.id=`color_${key}`;color.setAttribute('aria-label',`${label} color`);
    const text=document.createElement('input');text.type='text';text.value=state.colors[key];text.maxLength=7;text.setAttribute('aria-label',`${label} hex value`);
    const lab=document.createElement('label');lab.textContent=label;lab.htmlFor=color.id;
    color.addEventListener('input',()=>{state.colors[key]=color.value.toUpperCase();touched.add(key);text.value=state.colors[key];refreshAvatarColors()});
    text.addEventListener('change',()=>{if(/^#[0-9A-F]{6}$/i.test(text.value)){state.colors[key]=text.value.toUpperCase();touched.add(key);color.value=state.colors[key];refreshAvatarColors()}else{text.value=state.colors[key]}});
    wrap.append(color,lab,text);colorGrid.appendChild(wrap);
  });
}
/* Changing a colour repaints the one tile you are working on and the big
   preview. It used to rebuild the whole grid on every nudge of a colour
   picker, which threw away every picture and started them all again. */
function refreshAvatarColors(){
  document.querySelectorAll('.avatar').forEach(el=>{
    const card=el.closest('.preset-card');
    if(!card) applyColors(el,state.colors);
  });
  const mine=presetGrid.querySelector('.preset-card.selected');
  if(mine){
    const flat=mine.querySelector('.avatar');
    if(flat) applyColors(flat,state.colors);
    const stage=mine.querySelector('.thumb-stage');
    Thumbs.want(state.presetId,state.colors,(shot)=>{
      if(!stage||!stage.isConnected) return;
      let img=stage.querySelector('canvas.thumb-3d');
      if(!img){img=document.createElement('canvas');img.className='thumb-3d';stage.appendChild(img);}
      img.width=shot.width;img.height=shot.height;
      img.getContext('2d').drawImage(shot,0,0);
      stage.classList.add('has-3d');
    });
  }
  Preview3D.recolor(state.colors);
}
/* The new outfit's own colours, with anything the player chose kept on top. */
function rebase(p){
  const fresh=presetColors(p);
  for(const k of touched) if(state.colors[k]) fresh[k]=state.colors[k];
  return fresh;
}
function selectPreset(id){state.presetId=id;const p=currentPreset();state.sex=p.sex;state.colors=rebase(p);syncSexButtons();renderAll()}
function setSex(sex){state.sex=sex;const p=CHARACTER_PRESETS.find(p=>p.sex===sex);state.presetId=p.id;state.colors=rebase(p);syncSexButtons();renderAll()}
function syncSexButtons(){document.querySelectorAll('[data-sex]').forEach(btn=>{const active=btn.dataset.sex===state.sex;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))})}
function renderAll(){renderPresets();renderLarge();renderColors()}
function randomFrom(arr){return arr[Math.floor(Math.random()*arr.length)]}
function randomColors(){
  const palettes=[
    ['#2F80ED','#F2C94C','#223246','#40516B','#111827'],['#139E8F','#E4C988','#2A4C46','#30435C','#18212B'],['#8E3B46','#EAD7B7','#4B3444','#3B3C4A','#241D24'],['#6C5CE7','#48CAE4','#26364A','#384B67','#101820'],['#E76F51','#F4A261','#39444D','#5C6770','#20262D']
  ];
  const p=randomFrom(palettes);
  state.colors={...state.colors,shirt:p[0],accent:p[1],jacket:p[2],pants:p[3],pants2:p[2],shoes:p[4],sole:'#0E1116',sleeves:p[0],acc1:p[1],acc2:p[0]};
  ['shirt','accent','jacket','pants','pants2','shoes','sole','sleeves','acc1','acc2'].forEach(k=>touched.add(k));
  renderAll()
}
function randomCharacter(){touched.clear();const sex=Math.random()>.5?'male':'female';const list=CHARACTER_PRESETS.filter(p=>p.sex===sex);selectPreset(randomFrom(list).id);randomColors()}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2200)}
function payload(){return {characterVersion:2,sex:state.sex,presetId:state.presetId,name:state.name.trim()||'Player',colors:{skin:state.colors.skin,hair:state.colors.hair,eyes:state.colors.eyes,eyebrows:state.colors.hair,shirt:state.colors.shirt,shirtSecondary:state.colors.accent,jacket:state.colors.jacket,sleeves:state.colors.sleeves,pants:state.colors.pants,pantsSecondary:state.colors.pants2,shoes:state.colors.shoes,sole:state.colors.sole,accessoryPrimary:state.colors.acc1,accessorySecondary:state.colors.acc2},options:{glasses:currentPreset().style==='scholar'}}}

// Public integration API
window.VOXELIACharacterSelector={
  getSelection:()=>payload(),
  setSelection(config){if(!config||!config.presetId)return;const p=CHARACTER_PRESETS.find(x=>x.id===config.presetId);if(!p)return;state.sex=p.sex;state.presetId=p.id;state.name=config.name||'Player';state.colors={...presetColors(p),skin:config.colors?.skin||DEFAULT_SKIN,hair:config.colors?.hair||p.hair,eyes:config.colors?.eyes||'#1f2937',shirt:config.colors?.shirt||p.shirt,accent:config.colors?.shirtSecondary||p.accent,jacket:config.colors?.jacket||p.jacket,sleeves:config.colors?.sleeves||p.shirt,pants:config.colors?.pants||p.pants,pants2:config.colors?.pantsSecondary||p.pants2,shoes:config.colors?.shoes||p.shoes,sole:config.colors?.sole||p.sole,acc1:config.colors?.accessoryPrimary||'#fff',acc2:config.colors?.accessorySecondary||'#808080'};$('#playerName').value=state.name;syncSexButtons();renderAll()},
  presets:CHARACTER_PRESETS
};

document.querySelectorAll('[data-sex]').forEach(btn=>btn.addEventListener('click',()=>setSex(btn.dataset.sex)));
$('#playerName').addEventListener('input',e=>state.name=e.target.value.replace(/[<>]/g,''));
$('#randomColorsBtn').addEventListener('click',randomColors);
$('#randomCharacterBtn').addEventListener('click',randomCharacter);
$('#resetBtn').addEventListener('click',()=>{touched.clear();selectPreset(state.presetId);toast('Back to this character\u2019s own colours.')});
$('#rotatePreviewBtn').addEventListener('click',()=>{rotated=!rotated;document.querySelector('.avatar-stage .avatar').classList.toggle('rotated',rotated)});
$('#confirmBtn').addEventListener('click',()=>{const data=payload();localStorage.setItem('voxeliaCharacterV2',JSON.stringify(data));window.dispatchEvent(new CustomEvent('voxelia-character-confirmed',{detail:data}));
  // when this screen is opened inside the game, hand the choice back to it
  try{ if(window.parent && window.parent!==window) window.parent.postMessage({type:'voxelia-character',data},'*'); }catch(e){}toast('Character saved ✓');console.log('VOXELIA character config:',data)});

/* Opening "Make it yours" brings it into view.

   Sideways on a phone the drawer begins below the fold — the characters fill
   the panel and the colours start underneath them. Tapping the heading opened
   it correctly and nothing appeared to happen, because everything it opened
   was off the bottom of the panel. Unless you happened to swipe afterwards,
   the colours looked as though they had been taken away.

   Now opening it scrolls it up to where it can be seen, and the panel itself
   still scrolls, so nothing is ever reachable by luck alone. */
(function(){
  const drawer = document.querySelector('.customizer');
  const panel  = document.querySelector('.controls-panel');
  if(!drawer || !panel) return;
  const reveal = () => {
    if(!drawer.open) return;
    /* after the browser has laid the opened drawer out, not before */
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const d = drawer.getBoundingClientRect(), p = panel.getBoundingClientRect();
      /* put the drawer's top just inside the panel, but never scroll past
         the end of it */
      const want = panel.scrollTop + (d.top - p.top) - 8;
      const most = panel.scrollHeight - panel.clientHeight;
      const to   = Math.max(0, Math.min(want, most));
      try{ panel.scrollTo({top:to, behavior:'smooth'}); }catch(e){ panel.scrollTop = to; }
    }));
  };
  drawer.addEventListener('toggle', reveal);
})();

// Restore local selection if available
try{const saved=JSON.parse(localStorage.getItem('voxeliaCharacterV2'));if(saved)window.VOXELIACharacterSelector.setSelection(saved);else{state.colors=presetColors(currentPreset());renderAll()}}catch{state.colors=presetColors(currentPreset());renderAll()}
