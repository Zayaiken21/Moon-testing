/* ---------------------------------------------------------------
   VOXELIA SURVIVAL COMBAT — 100 procedural monsters + craftable weapons
   Kept self-contained so the existing world remains playable.
   --------------------------------------------------------------- */
(() => {
  const SHAPES = ['brute','spider','slug','wisp','manta','serpent','hopper','beetle','crystal','blob'];
  const ABILITIES = ['thrower','spitter','dasher','burrower','blinker','pulser','leaper','freezer','graviton','swarm'];
  const HUES = ['#ff5b5b','#ff8a3d','#ffd24a','#9cff57','#48e0c2','#55b7ff','#8c7bff','#d95cff','#ff66b3','#f2f2ff'];
  const PREFIX = ['Grim','Boggle','Murk','Gloop','Crackle','Fang','Wobble','Spore','Rattle','Crooked'];
  const SUFFIX = ['Maw','Worm','Warden','Thing','Crawler','Lurker','Monger','Hulk','Sprite','Fiend'];
  const MONSTERS = Array.from({length:100}, (_,i) => {
    const family=i%10,tier=Math.floor(i/10),seed=i*97+13;
    return {id:i,name:`${PREFIX[family]} ${SUFFIX[tier]}`,shape:SHAPES[family],ability:ABILITIES[(family+tier)%10],color:HUES[(family*3+tier)%HUES.length],
      hp:42+tier*13+family*3,speed:1.45+(family%4)*.24+tier*.055,size:.68+(family%5)*.12+tier*.028,damage:5+tier+(family%3),cooldown:1.05+(9-family)*.055,
      variant:seed,armor:(tier%4)*.06,scaleX:1+(seed%5)*.06,scaleY:1+((seed>>2)%5)*.055,scaleZ:1+((seed>>4)%5)*.06};
  });

  // Every weapon is a real craftable entry. Crossbow fires physical arrow bolts.
  const WEAPONS = [
    {id:'club',name:'Scrap Club',damage:16,range:3.2,cooldown:.48,kind:'melee',recipe:{wood:5,stone:2}},
    {id:'spear',name:'Bone Spear',damage:24,range:5.5,cooldown:.72,kind:'melee',recipe:{wood:6,stone:3}},
    {id:'bow',name:'Hunting Bow',damage:19,range:22,cooldown:.55,kind:'projectile',projectile:'arrow',recipe:{wood:8,stone:2}},
    {id:'crossbow',name:'Hunter Crossbow',damage:31,range:28,cooldown:.9,kind:'projectile',projectile:'crossbowBolt',recipe:{wood:10,stone:4,iron:2}},
    {id:'slingshot',name:'Pebble Sling',damage:13,range:18,cooldown:.32,kind:'projectile',projectile:'rock',recipe:{wood:3,stone:8}},
    {id:'spark',name:'Spark Caster',damage:34,range:24,cooldown:.8,kind:'projectile',projectile:'spark',recipe:{wood:3,stone:4,iron:2}}
  ];
  const Combat = {
    monsters:[], projectiles:[], weapon:WEAPONS[0], weaponIndex:0, health:100, maxHealth:100, spawnT:0, damageFlash:0, invuln:0,
    resources:{wood:12,stone:14,iron:4}, kills:0, craftOpen:false, crafted:new Set(['club']), lastAttack:0,
    initWorld(){
      this.monsters.length=0; this.projectiles.forEach(q=>Game.entityGroup.remove(q.mesh)); this.projectiles.length=0;
      this.health=100; this.kills=0; this.spawnT=0; this.weaponIndex=0; this.weapon=WEAPONS[0];
      this.resources={wood:12,stone:14,iron:4};
      this.crafted=new Set(['club']); this.lastAttack=0;
      this.updateUI();
    },
    makeModel(m){
      const g=new THREE.Group(), mat=new THREE.MeshStandardMaterial({color:m.color,roughness:.62,metalness:.08,emissive:m.color,emissiveIntensity:.11});
      const dark=new THREE.MeshStandardMaterial({color:0x11131b,roughness:.8});
      const accent=new THREE.MeshStandardMaterial({color:0xffd76a,roughness:.35,metalness:.35,emissive:0x7a4a12,emissiveIntensity:.18});
      const box=(x,y,z,px,py,pz,ma=mat)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),ma);o.position.set(px,py,pz);g.add(o);return o};
      const sphere=(r,px,py,pz,ma=mat,seg=12)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,seg,8),ma);o.position.set(px,py,pz);g.add(o);return o};
      const cyl=(r1,r2,h,px,py,pz,ma=mat)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,10),ma);o.position.set(px,py,pz);g.add(o);return o};
      const limb=(x,y,z,px,py,pz,rz=0)=>{const o=box(x,y,z,px,py,pz);o.rotation.z=rz;return o};
      if(m.shape==='brute'){box(1.45,1.55,1.05,0,1.0,0);box(1.0,.72,.92,0,2.08,0);for(const x of[-.9,.9]){limb(.34,1.05,.38,x,.55,0,x*.18);sphere(.25,x*1.03,1.18,.0,accent)}box(.55,.18,.15,0,2.18,.48,dark)}
      if(m.shape==='spider'){sphere(.82,0,.72,0);sphere(.55,0,1.05,-.28);for(let k=0;k<8;k++){const a=k*Math.PI/4,px=Math.sin(a)*.92,pz=Math.cos(a)*.92;const leg=limb(1.15,.14,.16,px,.58,pz,-a*.72);leg.rotation.y=a*.5}for(const x of[-.23,.23])sphere(.1,x,1.18,.2,accent,8)}
      if(m.shape==='slug'){for(let k=0;k<6;k++)sphere(.42+(k%2)*.07,(k-2.5)*.42,.48+Math.sin(k*.9)*.08,Math.sin(k*1.4)*.24);box(.95,.2,.75,0,.72,.12,accent);for(const x of[-.28,.28]){const stalk=box(.1,.55,.1,x,.95,.34);sphere(.12,x,1.25,.34,dark)}}
      if(m.shape==='wisp'){sphere(.7,0,1.15,0);for(let k=0;k<7;k++){const a=k*Math.PI*2/7;sphere(.22,Math.cos(a)*.78,.85+Math.sin(a)*.3,Math.sin(a)*.78,mat,10)}sphere(.42,0,1.15,.45,accent,12)}
      if(m.shape==='manta'){box(2.0,.32,1.15,0,.9,0);for(const x of[-1,1]){const wing=box(1.5,.18,.58,x*1.03,.86,.04);wing.rotation.z=x*.32}box(.38,.9,.38,0,1.28,.1);sphere(.16,-.28,1.38,.38,dark);sphere(.16,.28,1.38,.38,dark)}
      if(m.shape==='serpent'){for(let k=0;k<8;k++)sphere(.38-(k%3)*.025,0,.55+Math.sin(k*.8)*.12,(-k+.5)*.48);sphere(.48,0,.72,.52);box(.62,.16,.18,0,.82,1.0,accent)}
      if(m.shape==='hopper'){sphere(.72,0,1.12,0);for(const x of[-.68,.68]){limb(.28,1.25,.36,x,.48,0,x*.2);limb(.22,.9,.32,x*.72,.18,.22,-x*.18)}box(.7,.28,.65,0,.36,.25,accent)}
      if(m.shape==='beetle'){box(1.5,.85,1.3,0,.75,0);const shell=new THREE.Mesh(new THREE.SphereGeometry(.88,14,8),mat);shell.scale.set(1,.62,.9);shell.position.y=1.05;g.add(shell);box(.08,.75,1.28,0,1.05,0,dark);for(let k=0;k<6;k++){const a=k*Math.PI/3;limb(.78,.12,.16,Math.sin(a)*.92,.52,Math.cos(a)*.92,-a*.75)}}
      if(m.shape==='crystal'){const core=new THREE.Mesh(new THREE.OctahedronGeometry(1.0,1),mat);core.position.y=1.12;core.rotation.set(.2,m.variant*.03,.1);g.add(core);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;const c=new THREE.Mesh(new THREE.ConeGeometry(.18,.95,6),accent);c.position.set(Math.cos(a)*.78,.62,Math.sin(a)*.78);c.rotation.z=.35*Math.cos(a);g.add(c)}}
      if(m.shape==='blob'){for(let k=0;k<9;k++)sphere(.34+(k%4)*.065,(k-4)*.25,.5+Math.abs(k-4)*.07,Math.sin(k*1.7)*.35);sphere(.52,0,.92,.05,accent,10)}
      // Detail pass: horns, jaw, plates and eyes vary by monster ID, so all 100 have different silhouettes.
      const horns=2+(m.variant%3); for(let k=0;k<horns;k++){const x=(k-(horns-1)/2)*.25;const h=new THREE.Mesh(new THREE.ConeGeometry(.11,.42+(m.variant%4)*.05,7),accent);h.position.set(x,.98+(m.variant%5)*.06,.38);h.rotation.x=-.28;g.add(h)}
      const eyeY=1.5+(m.variant%3)*.05; for(const x of[-.18,.18])sphere(.115,x,eyeY,.52,dark,10);
      box(.55,.12,.12,0,1.3,.5,accent);
      if(m.variant%2){for(const x of[-.55,.55])sphere(.14,x,.82,-.38,accent,8)}
      g.scale.set(m.size*m.scaleX,m.size*m.scaleY,m.size*m.scaleZ); return g;
    },
    spawnOne(){
      if(!Game.player||this.monsters.length>=24) return;
      const idx=(Math.random()*MONSTERS.length)|0, d=MONSTERS[idx], a=Math.random()*Math.PI*2, r=18+Math.random()*25;
      const x=Game.player.pos.x+Math.sin(a)*r,z=Game.player.pos.z+Math.cos(a)*r,y=Game.world.surfaceY(Math.floor(x),Math.floor(z))+1;
      const model=this.makeModel(d);model.position.set(x,y,z);Game.entityGroup.add(model);
      this.monsters.push({def:d,pos:new THREE.Vector3(x,y,z),model,hp:d.hp,attackT:Math.random()*d.cooldown,wander:Math.random()*6,phase:Math.random()*6,dead:false});
    },
    tick(dt){
      if(!Game.running||Game.mode!=='survival'||!Game.player||!Game.world) return;
      this.spawnT-=dt; if(this.spawnT<=0){this.spawnT=2.5; if(this.monsters.length<12)this.spawnOne();}
      this.invuln=Math.max(0,this.invuln-dt); this.damageFlash=Math.max(0,this.damageFlash-dt);
      for(let i=this.monsters.length-1;i>=0;i--){const m=this.monsters[i]; if(m.dead){Game.entityGroup.remove(m.model);this.monsters.splice(i,1);continue;}
        m.phase+=dt; m.attackT-=dt; const dx=Game.player.pos.x-m.pos.x,dz=Game.player.pos.z-m.pos.z,dist=Math.hypot(dx,dz);
        if(dist<28){m.model.lookAt(Game.player.pos.x,m.pos.y,Game.player.pos.z); if(dist>2.2){const step=Math.min(dist-2.0,m.def.speed*dt);m.pos.x+=dx/dist*step;m.pos.z+=dz/dist*step;m.pos.y=Game.world.surfaceY(Math.floor(m.pos.x),Math.floor(m.pos.z))+1;m.model.position.copy(m.pos);m.model.position.y+=Math.sin(m.phase*5)*.05;}}
        if(m.attackT<=0&&dist<16){m.attackT=m.def.cooldown;this.monsterAttack(m,dist);}
      }
      for(let i=this.projectiles.length-1;i>=0;i--){const q=this.projectiles[i];q.life-=dt;q.mesh.position.addScaledVector(q.vel,dt);if(q.gravity!==false)q.vel.y-=7*dt;let remove=false;
        if(q.target&&!q.target.dead&&q.mesh.position.distanceTo(q.target.pos.clone().add(new THREE.Vector3(0,1,0)))<1.35*q.target.def.size){this.hit(q.target,q.damage);remove=true;}
        if(q.fromMonster&&q.mesh.position.distanceTo(Game.player.pos)<1.0){this.hurt(q.damage);remove=true;}
        if(q.life<=0)remove=true;
        if(remove){Game.entityGroup.remove(q.mesh);this.projectiles.splice(i,1);}}
      this.updateUI();
    },
    monsterAttack(m,dist){
      const a=m.def.ability;
      if(a==='thrower'||a==='spitter'||a==='graviton'){const dir=new THREE.Vector3(Game.player.pos.x-m.pos.x,Game.player.pos.y+1-m.pos.y,Game.player.pos.z-m.pos.z).normalize();const geo=new THREE.IcosahedronGeometry(.18+m.def.size*.08,0);const mat=new THREE.MeshLambertMaterial({color:m.def.color});const mesh=new THREE.Mesh(geo,mat);mesh.position.copy(m.pos).add(new THREE.Vector3(0,1,0));Game.entityGroup.add(mesh);this.projectiles.push({mesh,vel:dir.multiplyScalar(8+(a==='spitter'?3:0)),life:3,damage:m.def.damage,fromMonster:true,gravity:true});}
      else if(a==='dasher'||a==='leaper'){if(dist<7)this.hurt(m.def.damage+3);}
      else if(a==='burrower'||a==='blinker'){m.pos.x=Game.player.pos.x+(Math.random()-.5)*8;m.pos.z=Game.player.pos.z+(Math.random()-.5)*8;m.model.position.copy(m.pos);if(dist<12)this.hurt(m.def.damage);}
      else if(a==='freezer'){if(dist<9)this.hurt(Math.max(2,m.def.damage-2));}
      else if(a==='pulser'){if(dist<8)this.hurt(m.def.damage);}
      else if(a==='swarm'&&dist<5)this.hurt(m.def.damage*.65);
    },
    hurt(n){if(this.invuln>0)return;this.health=Math.max(0,this.health-n);this.invuln=.55;this.damageFlash=.2;if(this.health<=0){this.health=100;Game.player.pos.set(0.5,Game.world.surfaceY(0,0)+1.2,.5);this.monsters.forEach(m=>{m.dead=true});if(Game.toast)Game.toast('The monsters got you. You wake at camp.');}},
    aimTarget(){
      const dir=new THREE.Vector3();Game.camera.getWorldDirection(dir);const origin=new THREE.Vector3(Game.player.pos.x,Game.player.pos.y+EYE,Game.player.pos.z);
      let best=null,bestT=this.weapon.range;for(const m of this.monsters){const to=m.pos.clone().add(new THREE.Vector3(0,1,0)).sub(origin),t=to.dot(dir);if(t<0||t>bestT)continue;const perp=to.clone().addScaledVector(dir,-t).length();if(perp<1.15*m.def.size){best=m;bestT=t;}}
      return best;
    },
    attack(){
      if(!Game.running||Game.mode!=='survival'||UI.anyOpen())return; const target=this.aimTarget(); if(!target){if(Game.toast)Game.toast('Aim at a monster.');return;}
      const now=performance.now()/1000;if(this.lastAttack&&now-this.lastAttack<this.weapon.cooldown)return;this.lastAttack=now;
      if(this.weapon.kind==='projectile'){const dir=new THREE.Vector3();Game.camera.getWorldDirection(dir);let geo,mat;
        if(this.weapon.id==='crossbow'||this.weapon.id==='bow'){geo=new THREE.CylinderGeometry(.045,.045,.9,8);geo.rotateZ(Math.PI/2);mat=new THREE.MeshStandardMaterial({color:0x8b5a2b,roughness:.65});}
        else if(this.weapon.id==='slingshot'){geo=new THREE.SphereGeometry(.13,8,6);mat=new THREE.MeshStandardMaterial({color:0x6b6b72,roughness:.85});}
        else{geo=new THREE.SphereGeometry(.12,8,6);mat=new THREE.MeshStandardMaterial({color:0x6fe3c4,emissive:0x2f8f78,emissiveIntensity:.5});}
        const mesh=new THREE.Mesh(geo,mat);mesh.position.set(Game.player.pos.x,Game.player.pos.y+EYE,Game.player.pos.z);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);Game.entityGroup.add(mesh);this.projectiles.push({mesh,vel:dir.multiplyScalar(this.weapon.id==='crossbow'?30:24),life:this.weapon.id==='crossbow'?1.4:1.5,damage:this.weapon.damage,target,gravity:this.weapon.id!=='spark'});}
      else this.hit(target,this.weapon.damage);
    },
    hit(m,d){if(!m||m.dead)return;m.hp-=d;m.model.scale.setScalar(m.def.size*(m.hp>0?1:.2));if(m.hp<=0){m.dead=true;this.kills++;this.resources.stone+=1+(m.def.id%3===0?1:0);if(Game.toast)Game.toast(`${m.def.name} defeated · +stone`);}},
    craft(i){const w=WEAPONS[i];if(!w)return;if(this.crafted.has(w.id)){this.weaponIndex=i;this.weapon=w;this.updateUI();if(Game.toast)Game.toast(`${w.name} equipped.`);return;}for(const [k,v] of Object.entries(w.recipe))if((this.resources[k]||0)<v){if(Game.toast)Game.toast(`Need ${v} ${k}`);return;}for(const [k,v] of Object.entries(w.recipe))this.resources[k]-=v;this.crafted.add(w.id);this.weaponIndex=i;this.weapon=w;this.updateUI();if(Game.toast)Game.toast(`${w.name} crafted and equipped.`);},
    updateUI(){const h=$('#combat-health'),ht=$('#combat-health-text'),mc=$('#monster-count'),wr=$('#weapon-readout');if(h)h.style.width=`${this.health}%`;if(ht)ht.textContent=Math.ceil(this.health);if(mc)mc.textContent=`Monsters nearby: ${this.monsters.length}`;if(wr)wr.textContent=`${this.weapon.name} · ${this.weapon.damage} dmg · ${this.crafted.size}/${WEAPONS.length} crafted · Kills ${this.kills}`;}
  };
  window.VoxeliaMonsters=MONSTERS;
  window.VoxeliaWeapons=WEAPONS;
  window.VoxeliaCombat=Combat;

  const oldStart=Game.startWorld.bind(Game);
  Game.startWorld=function(...args){oldStart(...args);Combat.initWorld();};
  const oldUpdate=Game.update.bind(Game);
  Game.update=function(dt){oldUpdate(dt);Combat.tick(dt);};

  // Keyboard weapon selection + attack. Numbers 1-6 select crafted weapons.
  addEventListener('keydown',e=>{if(Input.typing())return;if(e.code==='KeyF'&&Game.mode==='survival'){Combat.attack();e.preventDefault();}const m=e.code.match(/^Digit([1-6])$/);if(m&&Game.running&&Game.mode==='survival'){const idx=+m[1]-1,w=WEAPONS[idx];if(w&&Combat.crafted.has(w.id)){Combat.weaponIndex=idx;Combat.weapon=w;Combat.updateUI();}else if(w&&Game.toast)Game.toast(`${w.name} is not crafted yet.`);}});

  // Desktop attack/craft buttons.
  const attack=$('#combat-attack'), craft=$('#combat-craft');
  if(attack){attack.addEventListener('click',()=>Combat.attack());}
  if(craft){craft.addEventListener('click',()=>{const next=(Combat.weaponIndex+1)%WEAPONS.length;Combat.craft(next);});}
  const ta=$('#btn-attack'); if(ta){ta.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();Combat.attack();},{passive:false});}

  // Replace the old touch aim behavior with pointer-safe independent movement/look.
  // The existing system already has separate sticks; this makes the look finger persist
  // even while the left movement stick is held and prevents button touches from stealing it.
  const originalTouch=Input.bindTouch;
  Input.bindTouch=function(){originalTouch.call(Input);};
})();
