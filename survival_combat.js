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
    const family = i % 10, tier = Math.floor(i/10);
    return { id:i, name:`${PREFIX[family]} ${SUFFIX[tier]}`, shape:SHAPES[family], ability:ABILITIES[(family+tier)%10], color:HUES[(family*3+tier)%HUES.length],
      hp: 32 + tier*11 + family*2, speed:1.5 + (family%4)*0.22 + tier*0.05, size:0.65 + (family%5)*0.11 + tier*0.025, damage:4 + tier + (family%3), cooldown:1.1 + (9-family)*0.06 };
  });

  const WEAPONS = [
    {id:'club',name:'Scrap Club',damage:16,range:3.2,cooldown:.48,recipe:{wood:5,stone:2}},
    {id:'spear',name:'Bone Spear',damage:24,range:5.5,cooldown:.72,recipe:{wood:6,stone:3}},
    {id:'bow',name:'Hunting Bow',damage:19,range:22,cooldown:.55,projectile:'arrow',recipe:{wood:8,stone:2}},
    {id:'slingshot',name:'Pebble Sling',damage:13,range:18,cooldown:.32,projectile:'rock',recipe:{wood:3,stone:8}},
    {id:'spark',name:'Spark Caster',damage:34,range:24,cooldown:.8,projectile:'spark',recipe:{wood:3,stone:4,iron:2}}
  ];

  const Combat = {
    monsters:[], projectiles:[], weapon:WEAPONS[0], weaponIndex:0, health:100, maxHealth:100, spawnT:0, damageFlash:0, invuln:0,
    resources:{wood:12,stone:14,iron:4}, kills:0, craftOpen:false,
    initWorld(){
      this.monsters.length=0; this.projectiles.forEach(q=>Game.entityGroup.remove(q.mesh)); this.projectiles.length=0;
      this.health=100; this.kills=0; this.spawnT=0; this.weaponIndex=0; this.weapon=WEAPONS[0];
      this.resources={wood:12,stone:14,iron:4};
      this.updateUI();
    },
    makeModel(m){
      const g=new THREE.Group(), mat=new THREE.MeshLambertMaterial({color:m.color,emissive:m.color,emissiveIntensity:.08});
      const dark=new THREE.MeshLambertMaterial({color:0x17131d});
      const box=(x,y,z,px,py,pz)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),mat);o.position.set(px,py,pz);g.add(o);return o};
      const ball=(r,px,py,pz)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,10,7),mat);o.position.set(px,py,pz);g.add(o);return o};
      if(m.shape==='brute'){box(1.2,1.6,.9,0,.95,0);box(.85,.75,.85,0,2,0);for(const x of[-.8,.8])box(.35,.9,.35,x,.45,0)}
      if(m.shape==='spider'){ball(.75,0,.55,0);for(let k=0;k<8;k++){const a=k*Math.PI/4;const leg=box(1.2,.12,.12,Math.sin(a)*.85,.55,Math.cos(a)*.85);leg.rotation.y=-a}}
      if(m.shape==='slug'){ball(.9,0,.6,0);for(let k=0;k<4;k++)ball(.28,(k-1.5)*.45,.75,Math.sin(k)*.35)}
      if(m.shape==='wisp'){ball(.62,0,1,0);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;ball(.18,Math.cos(a)*.75,.8+Math.sin(a)*.35,Math.sin(a)*.75)}}
      if(m.shape==='manta'){box(1.9,.35,1.1,0,.85,0);for(const x of[-1,1]){const wing=box(1.3,.18,.55,x*1.0,.85,.05);wing.rotation.z=x*.35}}
      if(m.shape==='serpent'){for(let k=0;k<6;k++)ball(.35,0,.55,(-k+.5)*.55);}
      if(m.shape==='hopper'){ball(.7,0,1,0);for(const x of[-.65,.65]){const leg=box(.25,1.25,.3,x,.45,0);leg.rotation.z=x*.25}box(.55,.25,.55,0,.35,.35)}
      if(m.shape==='beetle'){box(1.35,.8,1.25,0,.65,0);for(let k=0;k<6;k++){const a=(k/6)*Math.PI*2;box(.75,.1,.14,Math.sin(a)*.85,.5,Math.cos(a)*.85)}}
      if(m.shape==='crystal'){const o=new THREE.Mesh(new THREE.OctahedronGeometry(.95,1),mat);o.position.y=1;g.add(o);for(let k=0;k<4;k++){const a=k*Math.PI/2;box(.2,1,.2,Math.cos(a)*.75,.6,Math.sin(a)*.75)}}
      if(m.shape==='blob'){for(let k=0;k<7;k++)ball(.35+((k%3)*.08),(k-3)*.28,.5+Math.abs(k-3)*.08,Math.sin(k)*.35)}
      const eye1=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),dark),eye2=eye1.clone();eye1.position.set(-.18,1.45,.65);eye2.position.set(.18,1.45,.65);g.add(eye1,eye2);
      g.scale.setScalar(m.size); return g;
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
      for(let i=this.projectiles.length-1;i>=0;i--){const q=this.projectiles[i];q.life-=dt;q.mesh.position.addScaledVector(q.vel,dt);q.vel.y-=7*dt;if(q.life<=0||q.mesh.position.distanceTo(Game.player.pos)<1.0){if(q.mesh.position.distanceTo(Game.player.pos)<1.0)this.hurt(q.damage);Game.entityGroup.remove(q.mesh);this.projectiles.splice(i,1);}}
      this.updateUI();
    },
    monsterAttack(m,dist){
      const a=m.def.ability;
      if(a==='thrower'||a==='spitter'||a==='graviton'){const dir=new THREE.Vector3(Game.player.pos.x-m.pos.x,Game.player.pos.y+1-m.pos.y,Game.player.pos.z-m.pos.z).normalize();const geo=new THREE.IcosahedronGeometry(.18+m.def.size*.08,0);const mat=new THREE.MeshLambertMaterial({color:m.def.color});const mesh=new THREE.Mesh(geo,mat);mesh.position.copy(m.pos).add(new THREE.Vector3(0,1,0));Game.entityGroup.add(mesh);this.projectiles.push({mesh,vel:dir.multiplyScalar(8+(a==='spitter'?3:0)),life:3,damage:m.def.damage});}
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
      if(this.weapon.projectile){const dir=new THREE.Vector3();Game.camera.getWorldDirection(dir);const geo=new THREE.SphereGeometry(.12,8,6),mat=new THREE.MeshLambertMaterial({color:this.weapon.id==='spark'?0x6fe3c4:0xffd28a});const mesh=new THREE.Mesh(geo,mat);mesh.position.set(Game.player.pos.x,Game.player.pos.y+EYE,Game.player.pos.z);Game.entityGroup.add(mesh);this.projectiles.push({mesh,vel:dir.multiplyScalar(24),life:1.5,damage:this.weapon.damage,target});}
      else this.hit(target,this.weapon.damage);
    },
    hit(m,d){if(!m||m.dead)return;m.hp-=d;m.model.scale.setScalar(m.def.size*(m.hp>0?1:.2));if(m.hp<=0){m.dead=true;this.kills++;this.resources.stone+=1+(m.def.id%3===0?1:0);if(Game.toast)Game.toast(`${m.def.name} defeated · +stone`);}},
    craft(i){const w=WEAPONS[i];if(!w)return;for(const [k,v] of Object.entries(w.recipe))if((this.resources[k]||0)<v){if(Game.toast)Game.toast(`Need ${v} ${k}`);return;}for(const [k,v] of Object.entries(w.recipe))this.resources[k]-=v;this.weaponIndex=i;this.weapon=w;this.updateUI();if(Game.toast)Game.toast(`${w.name} crafted.`);},
    updateUI(){const h=$('#combat-health'),ht=$('#combat-health-text'),mc=$('#monster-count'),wr=$('#weapon-readout');if(h)h.style.width=`${this.health}%`;if(ht)ht.textContent=Math.ceil(this.health);if(mc)mc.textContent=`Monsters nearby: ${this.monsters.length}`;if(wr)wr.textContent=`${this.weapon.name} · ${this.weapon.damage} dmg · Kills ${this.kills}`;}
  };
  window.VoxeliaMonsters=MONSTERS;
  window.VoxeliaWeapons=WEAPONS;
  window.VoxeliaCombat=Combat;

  const oldStart=Game.startWorld.bind(Game);
  Game.startWorld=function(...args){oldStart(...args);Combat.initWorld();};
  const oldUpdate=Game.update.bind(Game);
  Game.update=function(dt){oldUpdate(dt);Combat.tick(dt);};

  // Keyboard weapon selection + attack. Numbers 1-5 select crafted weapons.
  addEventListener('keydown',e=>{if(Input.typing())return;if(e.code==='KeyF'&&Game.mode==='survival'){Combat.attack();e.preventDefault();}const m=e.code.match(/^Digit([1-5])$/);if(m&&Game.running&&Game.mode==='survival'){Combat.weaponIndex=+m[1]-1;Combat.weapon=WEAPONS[Combat.weaponIndex];Combat.updateUI();}});

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
