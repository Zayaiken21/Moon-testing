/**
 * voxelia-avatars.js — the rigged character models, in the game's own three.js.
 *
 * The model pack was written as an ES module for a newer three.js. The game runs
 * three r128 as a plain script, so this is the same loader and animation state
 * machine, written against the global THREE, pulling r128's own GLTFLoader and
 * SkeletonUtils. Nothing else in the game needs to change to use it.
 *
 * Models load only when a character actually needs them (about 0.8 MB each), so
 * a phone never downloads the whole pack of twenty.
 *
 *   VoxeliaAvatars.create(config).then(avatar => scene.add(avatar.object));
 *   avatar.update(dt, { speed, grounded, flying, inVehicle, mining });
 *   avatar.recolor(config.colors);
 */
(function () {
  'use strict';

  const BASE = 'models/';
  const LOADERS = [
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js'
  ];

  const IDS = [
    'male_01_explorer', 'female_01_explorer', 'male_02_ranger', 'female_02_ranger',
    'male_03_builder', 'female_03_builder', 'male_04_scout', 'female_04_scout',
    'male_05_pilot', 'female_05_pilot', 'male_06_scholar', 'female_06_scholar',
    'male_07_farmhand', 'female_07_gardener', 'male_08_coastwalker', 'female_08_coastwalker',
    'male_09_starfarer', 'female_09_starfarer', 'male_10_wanderer', 'female_10_wanderer'
  ];
  const ONE_SHOT = new Set(['jumpAnticipation', 'land', 'place', 'interact']);

  /* The palette each model was baked with. Recolouring works by finding which of
     these a vertex was painted from, then repainting it in the new colour while
     keeping the shading that was baked into it. */
  const BAKED = {
    male_01_explorer:     { hair: '#3A261B', shirt: '#315fca', accent: '#F4C247', jacket: '#55412f', pants: '#59604c', pants2: '#3c4236', shoes: '#2d2928', sole: '#161616' },
    male_02_ranger:       { hair: '#4a2f20', shirt: '#315b38', accent: '#cdb58a', jacket: '#7c6644', pants: '#3e5144', pants2: '#2d3c32', shoes: '#4a3425', sole: '#231a14' },
    male_03_builder:      { hair: '#3a271e', shirt: '#b14f2d', accent: '#e1b57a', jacket: '#333941', pants: '#37404a', pants2: '#262d34', shoes: '#514031', sole: '#28231f' },
    male_04_scout:        { hair: '#3d281e', shirt: '#18aeb0', accent: '#d7f4ef', jacket: '#1e4258', pants: '#24364e', pants2: '#17263b', shoes: '#27b9bd', sole: '#e8f0ec' },
    male_05_pilot:        { hair: '#3b241c', shirt: '#722a31', accent: '#f4dfc3', jacket: '#722a31', pants: '#34312f', pants2: '#262422', shoes: '#3b2c27', sole: '#191715' },
    male_06_scholar:      { hair: '#3a2a25', shirt: '#384f76', accent: '#e6e8eb', jacket: '#304765', pants: '#555b63', pants2: '#41464c', shoes: '#2b2d31', sole: '#17191c' },
    male_07_farmhand:     { hair: '#74482c', shirt: '#ede1ca', accent: '#c99a45', jacket: '#6e7650', pants: '#6e7650', pants2: '#596043', shoes: '#6c4a2c', sole: '#3e2d1f' },
    male_08_coastwalker:  { hair: '#6b3d29', shirt: '#6ec4cf', accent: '#f6f1e7', jacket: '#6ec4cf', pants: '#e8dfcf', pants2: '#c9c0b0', shoes: '#6ec4cf', sole: '#f9f7f2' },
    male_09_starfarer:    { hair: '#18243c', shirt: '#1d2739', accent: '#42dfff', jacket: '#dee8f2', pants: '#20293b', pants2: '#101724', shoes: '#223046', sole: '#111827' },
    male_10_wanderer:     { hair: '#4a2f28', shirt: '#4c4655', accent: '#7d3f67', jacket: '#393742', pants: '#3b3941', pants2: '#29272f', shoes: '#423832', sole: '#231e1b' },
    female_01_explorer:   { hair: '#5a3426', shirt: '#315fca', accent: '#F4C247', jacket: '#55412f', pants: '#59604c', pants2: '#3c4236', shoes: '#2d2928', sole: '#161616' },
    female_02_ranger:     { hair: '#4a2f20', shirt: '#315b38', accent: '#cdb58a', jacket: '#7c6644', pants: '#3e5144', pants2: '#2d3c32', shoes: '#4a3425', sole: '#231a14' },
    female_03_builder:    { hair: '#4b2a22', shirt: '#b14f2d', accent: '#e1b57a', jacket: '#333941', pants: '#37404a', pants2: '#262d34', shoes: '#514031', sole: '#28231f' },
    female_04_scout:      { hair: '#4a2b23', shirt: '#18aeb0', accent: '#d7f4ef', jacket: '#1e4258', pants: '#24364e', pants2: '#17263b', shoes: '#27b9bd', sole: '#e8f0ec' },
    female_05_pilot:      { hair: '#4a2e25', shirt: '#722a31', accent: '#f4dfc3', jacket: '#722a31', pants: '#34312f', pants2: '#262422', shoes: '#3b2c27', sole: '#191715' },
    female_06_scholar:    { hair: '#4c322a', shirt: '#384f76', accent: '#e6e8eb', jacket: '#304765', pants: '#555b63', pants2: '#41464c', shoes: '#2b2d31', sole: '#17191c' },
    female_07_gardener:   { hair: '#6a412a', shirt: '#ede1ca', accent: '#c99a45', jacket: '#6e7650', pants: '#6e7650', pants2: '#596043', shoes: '#6c4a2c', sole: '#3e2d1f' },
    female_08_coastwalker:{ hair: '#70432f', shirt: '#6ec4cf', accent: '#f6f1e7', jacket: '#6ec4cf', pants: '#e8dfcf', pants2: '#c9c0b0', shoes: '#6ec4cf', sole: '#f9f7f2' },
    female_09_starfarer:  { hair: '#1b2038', shirt: '#1d2739', accent: '#42dfff', jacket: '#dee8f2', pants: '#20293b', pants2: '#101724', shoes: '#223046', sole: '#111827' },
    female_10_wanderer:   { hair: '#58313f', shirt: '#4c4655', accent: '#7d3f67', jacket: '#393742', pants: '#3b3941', pants2: '#29272f', shoes: '#423832', sole: '#231e1b' }
  };
  const SKIN = '#E8BF96';
  const EYES = '#1f2937';

  /* ------------------------------------------------------------ helpers */

  const HEX = /^#[0-9a-fA-F]{6}$/;
  const safeHex = (h, fallback) => (typeof h === 'string' && HEX.test(h)) ? h : fallback;


  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = res; s.onerror = () => rej(new Error('could not load ' + src));
      document.head.appendChild(s);
    });
  }

  let ready = null;
  function whenReady() {
    if (ready) return ready;
    ready = (async () => {
      if (!window.THREE) throw new Error('three.js is not loaded');
      for (const src of LOADERS) await loadScript(src);
      if (!THREE.GLTFLoader) throw new Error('GLTFLoader did not register');
    })();
    return ready;
  }

  /* one download per model, shared by every player wearing it */
  const templates = new Map();
  function template(id) {
    if (!templates.has(id)) {
      templates.set(id, whenReady().then(() => new Promise((res, rej) => {
        new THREE.GLTFLoader().load(BASE + id + '.glb', (g) => {
          res(g);
        }, undefined, rej);
      })));
    }
    return templates.get(id);
  }

  /* Recolouring. These models store one material and baked, shaded vertex
     colours, and the shading is not a simple multiply of a base colour, so the
     regions cannot be told apart reliably from colour alone (tested: it read
     a large share of shoes and trousers as skin). Rather than paint shoes as
     skin, the model keeps the colours it was made with, which are the preset's
     defaults. If the models are re-exported with one material per region, named
     skin / hair / shirt / accent / jacket / sleeves / pants / pants2 / shoes /
     sole / eyes, recolouring below picks them up with no other change. */
  function prepareRegions() {}

  /* ------------------------------------------------------------ one avatar */

  function Avatar(gltf, id) {
    this.id = id;
    this.object = (THREE.SkeletonUtils && THREE.SkeletonUtils.clone)
      ? THREE.SkeletonUtils.clone(gltf.scene) : gltf.scene.clone(true);
    this.object.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;                       // skinned bounds do not follow the pose
      if (o.material) { o.material = o.material.clone(); o.material.vertexColors = true; }
    });
    this.mixer = new THREE.AnimationMixer(this.object);
    this.actions = {};
    for (const clip of gltf.animations) {
      const a = this.mixer.clipAction(clip);
      if (ONE_SHOT.has(clip.name)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
      this.actions[clip.name] = a;
    }
    this.state = null;
    this.oneShot = null;
    this.wasGrounded = true;
    this.mixer.addEventListener('finished', (e) => {
      if (this.oneShot && e.action === this.actions[this.oneShot]) {
        this.oneShot = null;
        this.fadeTo(this.state || 'idle', 0.12, true);
      }
    });
    this.fadeTo('idle', 0);
  }

  Avatar.prototype.fadeTo = function (name, secs, force) {
    const next = this.actions[name];
    if (!next) return;
    if (!force && this.current === next) return;
    next.reset().setEffectiveWeight(1).fadeIn(secs || 0.2).play();
    if (this.current && this.current !== next) this.current.fadeOut(secs || 0.2);
    this.current = next;
  };

  Avatar.prototype.play = function (oneShot) {
    if (!this.actions[oneShot]) return;
    this.oneShot = oneShot;
    this.fadeTo(oneShot, 0.08, true);
  };

  /** Which loop to be in, from compact state the network already carries. */
  Avatar.prototype.choose = function (s) {
    if (s.inVehicle) return 'sitVehicle';
    if (s.flying) return 'fly';
    if (s.swimming) return 'swim';
    if (s.grounded === false) return 'airborne';
    const sp = s.speed || 0;
    if (s.mining && sp <= 0.2) return 'mine';
    if (sp > 6.5) return 'sprint';
    if (sp > 4.5) return 'run';
    if (sp > 0.4) return 'walk';
    return 'idle';
  };

  Avatar.prototype.update = function (dt, s) {
    s = s || {};
    const want = this.choose(s);
    // a landing gets its own little crouch
    if (s.grounded !== false && this.wasGrounded === false && this.actions.land) this.play('land');
    this.wasGrounded = s.grounded !== false;
    if (!this.oneShot && want !== this.state) { this.state = want; this.fadeTo(want, 0.18); }
    else this.state = want;
    // walk and run speed up with the player, so feet do not slide
    const loco = this.actions[this.state];
    if (loco && (this.state === 'walk' || this.state === 'run' || this.state === 'sprint')) {
      const ref = this.state === 'walk' ? 2.2 : this.state === 'run' ? 5 : 7;
      loco.timeScale = Math.max(0.6, Math.min(1.6, (s.speed || ref) / ref));
    }
    this.mixer.update(Math.min(0.1, dt));
  };

  /** Repaint every region the model names as its own material. */
  Avatar.prototype.recolor = function (colors) {
    const c = colors || {};
    const map = {
      skin: c.skin, hair: c.hair, eyes: c.eyes, eyebrows: c.eyebrows || c.hair,
      shirt: c.shirt, accent: c.shirtSecondary || c.accent, jacket: c.jacket,
      sleeves: c.sleeves || c.shirt, pants: c.pants, pants2: c.pantsSecondary || c.pants2,
      shoes: c.shoes, sole: c.sole, acc1: c.accessoryPrimary, acc2: c.accessorySecondary
    };
    let changed = 0;
    this.object.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (!m || !m.name) continue;
        const key = String(m.name).toLowerCase().replace(/^voxelia_?/, '');
        const hex = map[key];
        if (hex && HEX.test(hex)) { m.color.set(hex); changed++; }
      }
    });
    this.recolorable = changed > 0;
    return changed;
  };

  Avatar.prototype.dispose = function () {
    this.mixer.stopAllAction();
    this.object.traverse((o) => {
      if (!o.isMesh) return;
      // geometry is shared by everyone wearing this model; only our materials are ours
      if (o.material && o.material.dispose) o.material.dispose();
    });
    if (this.object.parent) this.object.parent.remove(this.object);
  };

  /* ------------------------------------------------------------ public */

  /** Check a character config from anywhere (a save, a network packet). */
  function validate(cfg) {
    if (!cfg || typeof cfg !== 'object') return null;
    const id = IDS.indexOf(cfg.presetId) >= 0 ? cfg.presetId : null;
    if (!id) return null;
    const colors = {};
    const src = cfg.colors || {};
    for (const k of ['skin', 'hair', 'eyes', 'eyebrows', 'shirt', 'shirtSecondary', 'jacket', 'sleeves',
                     'pants', 'pantsSecondary', 'shoes', 'sole', 'accessoryPrimary', 'accessorySecondary']) {
      if (HEX.test(src[k] || '')) colors[k] = src[k];
    }
    return {
      characterVersion: 2,
      sex: id.indexOf('female') === 0 ? 'female' : 'male',
      presetId: id,
      name: String(cfg.name || 'Player').replace(/[<>&"']/g, '').slice(0, 24) || 'Player',
      colors,
      options: { glasses: !!(cfg.options && cfg.options.glasses) }
    };
  }

  async function create(cfg) {
    const c = validate(cfg);
    if (!c) throw new Error('not a valid character');
    const gltf = await template(c.presetId);
    const a = new Avatar(gltf, c.presetId);
    a.recolor(c.colors);
    return a;
  }

  window.VoxeliaAvatars = { create, validate, ids: IDS, ready: whenReady };
})();
