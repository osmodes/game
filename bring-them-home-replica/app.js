const screens=[...document.querySelectorAll('.screen')];
let callsign=localStorage.getItem('bth_callsign')||'';
let selectedOperation='ROADBLOCK', saved=0, seconds=360, timerId=null, paused=false, trainingStep=0, sound=true;

function showScreen(id){
  clearInterval(timerId);
  screens.forEach(s=>s.classList.toggle('active',s.id===id));
  if(id==='settings') document.getElementById('settingsCallsign').value=callsign;
  if(id==='profile') document.getElementById('profileTitle').textContent=callsign||'RECRUIT';
  if(id==='leaderboard') document.getElementById('lbName').textContent=callsign||'YOU';
  window.scrollTo({top:0,behavior:'smooth'});
}
function saveCallsign(){
  const v=document.getElementById('callsignInput').value.trim()||'Rookie';
  callsign=v; localStorage.setItem('bth_callsign',v);
  document.getElementById('operatorName').textContent=v.toUpperCase();
  showScreen('operations');
}
function randomCallsign(){
  const names=['Eagle One','River Six','QuietOne','Kachiri','Night Hawk','Delta 7','GhostKola','Scout 9'];
  document.getElementById('callsignInput').value=names[Math.floor(Math.random()*names.length)];
}
function openMission(name){
  selectedOperation=name;
  document.getElementById('briefName').textContent=name;
  document.getElementById('briefMeta').textContent=(name==='ROADBLOCK'?'06:14 · KACHIRI HIGHWAY · KOFA STATE':name==='IROKO'?'05:48 · IROKO FOREST · KOFA STATE':'19:12 · NEW KORO CREEK · KOFA STATE');
  showScreen('brief');
}
function startMission(){
  saved=0; seconds=360; paused=false;
  document.getElementById('saved').textContent='0 / 8';
  document.getElementById('timer').textContent='06:00';
  document.querySelectorAll('.civilian').forEach(x=>x.style.opacity='1');
  showScreen('game'); startClock();
  toast('Locate the missing passengers.');
}
function startClock(){
  clearInterval(timerId);
  timerId=setInterval(()=>{
    if(paused)return;
    seconds--;
    const m=String(Math.floor(seconds/60)).padStart(2,'0'), s=String(seconds%60).padStart(2,'0');
    document.getElementById('timer').textContent=`${m}:${s}`;
    if(seconds<=0){clearInterval(timerId); endMission();}
  },1000);
}
function endMission(){
  clearInterval(timerId);
  document.getElementById('finalSaved').textContent=`${saved} / 8`;
  document.getElementById('finalTime').textContent=document.getElementById('timer').textContent;
  document.getElementById('finalScore').textContent=(saved*1050 + Math.max(0,seconds)*12).toLocaleString();
  showScreen('complete');
}
function restartMission(){closeOverlay('pauseOverlay');startMission()}
function pauseGame(){paused=true;document.getElementById('pauseOverlay').classList.add('open')}
function resumeGame(){paused=false;closeOverlay('pauseOverlay')}
function closeOverlay(id){document.getElementById(id).classList.remove('open')}
function toggleMap(){document.getElementById('mapOverlay').classList.toggle('open')}
function toggleSound(){sound=!sound;document.getElementById('soundBtn').textContent=sound?'🔊':'🔇'}
function toast(msg){const el=document.getElementById('gameToast');el.textContent=msg;el.style.opacity=1;setTimeout(()=>el.style.opacity=.75,1600)}
function fire(){
  const hostiles=[...document.querySelectorAll('.hostile')];
  if(hostiles.length){hostiles[Math.floor(Math.random()*hostiles.length)].style.opacity=.2;toast('Contact suppressed. Keep moving.')}
}
function movePlayer(dir){
  const p=document.getElementById('player'), r=p.getBoundingClientRect(), w=document.getElementById('gameWorld').getBoundingClientRect();
  let x=r.left-w.left,y=r.top-w.top,step=25;
  if(dir==='left')x-=step;if(dir==='right')x+=step;if(dir==='up')y-=step;if(dir==='down')y+=step;
  x=Math.max(10,Math.min(w.width-45,x));y=Math.max(70,Math.min(w.height-120,y));
  p.style.left=x+'px';p.style.top=y+'px';
  checkRescue(x,y,w);
}
function checkRescue(x,y,w){
  const civilians=[...document.querySelectorAll('.civilian')].filter(c=>getComputedStyle(c).opacity!=='0');
  for(const c of civilians){
    const cr=c.getBoundingClientRect(), wr=document.getElementById('gameWorld').getBoundingClientRect();
    const cx=cr.left-wr.left,cy=cr.top-wr.top;
    if(Math.hypot(x-cx,y-cy)<55){
      c.style.opacity='0';saved++;document.getElementById('saved').textContent=`${saved} / 8`;
      toast(`Passenger secured. ${8-saved} remaining.`);
      if(saved===8){toast('All civilians located. Get to Eagle Two!');}
      break;
    }
  }
}
document.addEventListener('keydown',e=>{
  const map={w:'up',a:'left',s:'down',d:'right',ArrowUp:'up',ArrowLeft:'left',ArrowDown:'down',ArrowRight:'right'};
  if(document.getElementById('game').classList.contains('active')&&!paused){
    if(map[e.key])movePlayer(map[e.key]);
    if(e.key==='m'||e.key==='M')toggleMap();
    if(e.key==='Escape')pauseGame();
    if(e.key===' ')fire();
  }
});
function startTraining(){showScreen('training');trainingStep=0;updateTraining()}
function trainingNext(){trainingStep++;if(trainingStep>=4){showScreen('howto');alert('TRAINING COMPLETE — You are ready.');return}updateTraining()}
function updateTraining(){
  const texts=['Use WASD or the arrows to move.','Click to fire. Right-click to aim.','Press E near a captive to free them.','Reach Eagle Two before extraction.'];
  document.getElementById('trainingText').textContent=texts[trainingStep];
  document.querySelectorAll('.training-steps span').forEach((x,i)=>x.classList.toggle('active',i===trainingStep));
}
document.querySelectorAll('.mission-type-btn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mission-type-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
document.querySelectorAll('.count').forEach(b=>b.onclick=()=>{document.querySelectorAll('.count').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
if(callsign) document.getElementById('settingsCallsign').value=callsign;
