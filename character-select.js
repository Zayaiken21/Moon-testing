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

const $ = s => document.querySelector(s);
const presetGrid = $('#presetGrid');
const colorGrid = $('#colorGrid');
const largeAvatar = $('#largeAvatar');

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
    card.querySelector('.thumb-stage').appendChild(makeAvatar(p,true));
    card.addEventListener('click',()=>selectPreset(p.id));
    presetGrid.appendChild(card);
  });
}
function renderLarge(){
  const p=currentPreset();
  largeAvatar.replaceWith(makeAvatar(p,false));
  const fresh=document.querySelector('.avatar-stage .avatar'); fresh.id='largeAvatar';
  if(rotated) fresh.classList.add('rotated');
  $('#selectedName').textContent=p.name; $('#selectedId').textContent=p.id;
  $('#activeSexChip').textContent=p.sex[0].toUpperCase()+p.sex.slice(1); $('#activePresetChip').textContent=p.name;
}
function renderColors(){
  colorGrid.innerHTML='';
  COLOR_FIELDS.forEach(([key,label])=>{
    const wrap=document.createElement('div');wrap.className='color-control';
    const color=document.createElement('input');color.type='color';color.value=state.colors[key];color.id=`color_${key}`;color.setAttribute('aria-label',`${label} color`);
    const text=document.createElement('input');text.type='text';text.value=state.colors[key];text.maxLength=7;text.setAttribute('aria-label',`${label} hex value`);
    const lab=document.createElement('label');lab.textContent=label;lab.htmlFor=color.id;
    color.addEventListener('input',()=>{state.colors[key]=color.value.toUpperCase();text.value=state.colors[key];refreshAvatarColors()});
    text.addEventListener('change',()=>{if(/^#[0-9A-F]{6}$/i.test(text.value)){state.colors[key]=text.value.toUpperCase();color.value=state.colors[key];refreshAvatarColors()}else{text.value=state.colors[key]}});
    wrap.append(color,lab,text);colorGrid.appendChild(wrap);
  });
}
function refreshAvatarColors(){document.querySelectorAll('.avatar').forEach(el=>{const card=el.closest('.preset-card');if(!card) applyColors(el,state.colors)});renderPresets()}
function selectPreset(id){state.presetId=id;const p=currentPreset();state.sex=p.sex;state.colors=presetColors(p);syncSexButtons();renderAll()}
function setSex(sex){state.sex=sex;const p=CHARACTER_PRESETS.find(p=>p.sex===sex);state.presetId=p.id;state.colors=presetColors(p);syncSexButtons();renderAll()}
function syncSexButtons(){document.querySelectorAll('[data-sex]').forEach(btn=>{const active=btn.dataset.sex===state.sex;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))})}
function renderAll(){renderPresets();renderLarge();renderColors()}
function randomFrom(arr){return arr[Math.floor(Math.random()*arr.length)]}
function randomColors(){
  const palettes=[
    ['#2F80ED','#F2C94C','#223246','#40516B','#111827'],['#139E8F','#E4C988','#2A4C46','#30435C','#18212B'],['#8E3B46','#EAD7B7','#4B3444','#3B3C4A','#241D24'],['#6C5CE7','#48CAE4','#26364A','#384B67','#101820'],['#E76F51','#F4A261','#39444D','#5C6770','#20262D']
  ];
  const p=randomFrom(palettes);state.colors={...state.colors,shirt:p[0],accent:p[1],jacket:p[2],pants:p[3],pants2:p[2],shoes:p[4],sole:'#0E1116',sleeves:p[0],acc1:p[1],acc2:p[0]};renderAll()
}
function randomCharacter(){const sex=Math.random()>.5?'male':'female';const list=CHARACTER_PRESETS.filter(p=>p.sex===sex);selectPreset(randomFrom(list).id);randomColors()}
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
$('#resetBtn').addEventListener('click',()=>selectPreset(state.presetId));
$('#rotatePreviewBtn').addEventListener('click',()=>{rotated=!rotated;document.querySelector('.avatar-stage .avatar').classList.toggle('rotated',rotated)});
$('#confirmBtn').addEventListener('click',()=>{const data=payload();localStorage.setItem('voxeliaCharacterV2',JSON.stringify(data));window.dispatchEvent(new CustomEvent('voxelia-character-confirmed',{detail:data}));
  // when this screen is opened inside the game, hand the choice back to it
  try{ if(window.parent && window.parent!==window) window.parent.postMessage({type:'voxelia-character',data},'*'); }catch(e){}toast('Character saved ✓');console.log('VOXELIA character config:',data)});

// Restore local selection if available
try{const saved=JSON.parse(localStorage.getItem('voxeliaCharacterV2'));if(saved)window.VOXELIACharacterSelector.setSelection(saved);else{state.colors=presetColors(currentPreset());renderAll()}}catch{state.colors=presetColors(currentPreset());renderAll()}
