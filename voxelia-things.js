/**
 * voxelia-things.js — the little 3D models of the things in the world.
 *
 * The pack holds a real model for every block: a bluebell that is actually a
 * bluebell, a door that is actually a door. They are used in two places, both
 * of which used to be a flat square of colour:
 *
 *   • the picture in your hotbar and your bag
 *   • the thing in your hand, in first person
 *
 * Nothing here is required. If the pack is missing, or the browser will not
 * give us a second drawing surface, every one of these quietly returns nothing
 * and the game keeps the pictures it already had.
 *
 * The models are drawn standing up along Z, which is the way modelling tools
 * usually work; three.js stands things up along Y, so each one is turned a
 * quarter turn as it loads and then never thought about again.
 *
 *   Things.ready()                  -> promise, resolves when the list is in
 *   Things.has(id)                  -> is there a model for this?
 *   Things.icon(id, size)           -> a canvas with the model drawn in it
 *   Things.mesh(id)                 -> an Object3D to put in someone's hand
 */
(function () {
  'use strict';

  var BASE = 'models/things/';
  var LOADER = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';

  var manifest = null;
  var listReady = null;
  var loaderReady = null;
  var models = new Map();        // id -> promise of a template Object3D
  var icons = new Map();         // id@size -> canvas
  var painter = null;            // the little offscreen renderer
  var broken = false;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (window.THREE && THREE.GLTFLoader) { res(); return; }
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = res;
      s.onerror = function () { rej(new Error('could not fetch ' + src)); };
      document.head.appendChild(s);
    });
  }

  function ready() {
    if (listReady) return listReady;
    listReady = fetch(BASE + 'manifest.json')
      .then(function (r) { if (!r.ok) throw new Error('no manifest'); return r.json(); })
      .then(function (j) { manifest = j; return j; })
      .catch(function (e) {
        broken = true;
        console.info('thing models unavailable:', e.message);
        manifest = { things: {} };
        return manifest;
      });
    return listReady;
  }

  function has(id) {
    return !!(manifest && manifest.things && manifest.things[id]);
  }

  function entry(id) {
    return (manifest && manifest.things && manifest.things[id]) || null;
  }

  /* ---------------------------------------------------------- one model */

  function template(id) {
    if (models.has(id)) return models.get(id);
    var e = entry(id);
    if (!e) return Promise.reject(new Error('no model for ' + id));

    if (!loaderReady) {
      loaderReady = (window.THREE && THREE.GLTFLoader)
        ? Promise.resolve()
        : loadScript(LOADER);
    }

    var job = loaderReady.then(function () {
      if (!window.THREE || !THREE.GLTFLoader) throw new Error('no GLTFLoader');
      return new Promise(function (res, rej) {
        new THREE.GLTFLoader().load(BASE + e.f, function (g) {
          var root = new THREE.Group();
          root.add(g.scene);
          // stand it up: the pack builds along Z, the game along Y
          g.scene.rotation.x = -Math.PI / 2;

          // the models carry no colours of their own, so each one is painted
          // in the colour the game says the thing is
          var colour = /^#[0-9a-fA-F]{6}$/.test(e.c || '') ? e.c : '#B0AAC0';
          var mat = new THREE.MeshLambertMaterial({ color: colour });
          root.traverse(function (o) {
            if (!o.isMesh) return;
            /* Work out which way each face points, because the model does
               not say.

               Not one model in the pack carries normals. A normal is what
               tells a lit material which way a surface faces, and without
               one every face is lit as though it faces away from every lamp
               — which is to say, not lit at all. So every block in the
               hotbar, in the bag and held in your hand came out as a flat
               black silhouette, and the only ones that looked right were
               the handful with no model at all, quietly falling back to the
               old flat picture. None of the colours were ever wrong; the
               light had nothing to bounce off.

               Computing them from the geometry is exact for shapes like
               these, and it happens once per model, as it loads. */
            if (o.geometry && o.geometry.attributes && !o.geometry.attributes.normal) {
              try { o.geometry.computeVertexNormals(); } catch (err) {}
            }
            o.material = mat;
            o.castShadow = false;
            o.receiveShadow = false;
          });

          // sit it on the floor and shrink it to fit a one-block space
          var box = new THREE.Box3().setFromObject(root);
          var size = new THREE.Vector3();
          box.getSize(size);
          var widest = Math.max(size.x, size.y, size.z) || 1;
          var scale = 1 / widest;
          root.scale.setScalar(scale);
          var mid = new THREE.Vector3();
          box.getCenter(mid);
          g.scene.position.set(-mid.x, -box.min.y, -mid.z);

          root.userData.tall = size.y * scale;
          res(root);
        }, undefined, rej);
      });
    });

    models.set(id, job);
    return job;
  }

  /** A copy of the model, ready to be put somewhere. */
  function mesh(id) {
    if (broken || !has(id)) return Promise.reject(new Error('no model'));
    return template(id).then(function (t) {
      var copy = t.clone(true);
      copy.traverse(function (o) { if (o.isMesh) o.material = t.children[0] ? o.material : o.material; });
      return copy;
    });
  }

  /* ------------------------------------------------- the picture of it */

  function makePainter() {
    if (painter !== null) return painter;
    try {
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 128;
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(1);
      renderer.setSize(128, 128, false);
      var scene = new THREE.Scene();
      var camera = new THREE.OrthographicCamera(-0.72, 0.72, 0.72, -0.72, 0.01, 10);
      // looked at from the front and a little above, the way a thing sits on a shelf
      camera.position.set(1.05, 0.95, 1.35);
      camera.lookAt(0, 0.42, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x4a4560, 1.25));
      var key = new THREE.DirectionalLight(0xffffff, 0.75);
      key.position.set(2, 3, 2.2);
      scene.add(key);
      var fill = new THREE.DirectionalLight(0x9fd8ff, 0.3);
      fill.position.set(-2, 1, -1.5);
      scene.add(fill);
      painter = { renderer: renderer, scene: scene, camera: camera, canvas: canvas };
    } catch (e) {
      painter = false;                 // no second drawing surface: never try again
      console.info('thing pictures unavailable:', e.message);
    }
    return painter;
  }

  /**
   * The picture of a thing, drawn once and kept.
   * Returns a canvas at once; it fills in as soon as the model arrives, and
   * `onReady` is called then so whatever is showing it can be refreshed.
   */
  function icon(id, size, onReady) {
    size = size || 40;
    var key = id + '@' + size;
    if (icons.has(key)) return icons.get(key);
    if (broken || !has(id)) return null;

    var out = document.createElement('canvas');
    out.width = out.height = size;
    out.dataset.thing = String(id);
    icons.set(key, out);

    template(id).then(function (t) {
      var p = makePainter();
      if (!p) return;
      var copy = t.clone(true);
      p.scene.add(copy);
      try {
        p.renderer.render(p.scene, p.camera);
        var g = out.getContext('2d');
        if (g) {
          g.clearRect(0, 0, size, size);
          g.imageSmoothingEnabled = true;
          g.drawImage(p.canvas, 0, 0, size, size);
        }
        out.dataset.drawn = '1';
        if (onReady) onReady(out);
      } catch (e) {
        icons.delete(key);
      } finally {
        p.scene.remove(copy);
      }
    }).catch(function () { icons.delete(key); });

    return out;
  }

  /** Warm up the pictures for a handful of things, so the bag opens full. */
  function warm(ids, size) {
    if (broken) return;
    var n = 0;
    for (var i = 0; i < ids.length && n < 40; i++) {
      if (has(ids[i])) { icon(ids[i], size || 40); n++; }
    }
  }

  window.VoxeliaThings = {
    ready: ready, has: has, icon: icon, mesh: mesh, warm: warm,
    count: function () { return manifest ? Object.keys(manifest.things).length : 0; }
  };
})();
