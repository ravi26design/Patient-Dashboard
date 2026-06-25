/* ═══════════════════════════════════════════════════════════
   RudraHealth AI — OUD Recovery Companion (Patient App)
   Mobile-first web app. Same data & flows as prototype v1.3.
   ═══════════════════════════════════════════════════════════ */

/* ═══ NAV ═══ */
function goScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  var el=document.getElementById('screen-'+id);if(el)el.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  var m={home:0,tools:1,mat:2,rewards:4,narcan:4,workbook:1,profile:0,checkin:0,appointments:0};
  var tabs=document.querySelectorAll('.nav-tab');if(tabs[m[id]!=null?m[id]:0])tabs[m[id]!=null?m[id]:0].classList.add('active');
  document.querySelectorAll('#dnav .dn-item').forEach(function(i){i.classList.toggle('active',i.getAttribute('data-screen')===id);});
  try{localStorage.setItem('rh_screen',id);}catch(e){}
  document.getElementById('screenArea').scrollTop=0;
  if(id==='mat'){ setTimeout(updatePatternChart,50); setTimeout(updateRecoveryHealthChart,50); }
}
function openOv(id){
  var el=document.getElementById('ov-'+id);if(!el)return;
  /* desktop: counter the page zoom so the fixed overlay covers the viewport at native scale */
  if(document.body.classList.contains('is-desktop') && window.__deskF){ var _vw=window.innerWidth; var _t=Math.min(1.3,(_vw-24)/620); el.style.zoom=_t/window.__deskF; }
  else { el.style.zoom=''; }
  el.classList.add('active');
  el.scrollTop=0; var b=el.querySelector('.ov-body'); if(b) b.scrollTop=0;
  try{localStorage.setItem('rh_ov',id);}catch(e){}
}
function closeOv(){document.querySelectorAll('.overlay').forEach(function(o){o.classList.remove('active');o.style.zoom='';});try{localStorage.removeItem('rh_ov');}catch(e){}}
function closeTopOv(id){var el=document.getElementById('ov-'+id);if(el){el.classList.remove('active');el.style.zoom='';}try{localStorage.removeItem('rh_ov');}catch(e){}}

/* ═══ FIND PROVIDER — engagement-instrumented ═══ */
window.FP_ANALYTICS={opens:0,searches:0,calls:0,directions:0,bySource:{home:0,tools:0,profile:0}};
function openFindProvider(source){
  FP_ANALYTICS.opens++;
  if(source && FP_ANALYTICS.bySource[source]!==undefined) FP_ANALYTICS.bySource[source]++;
  openOv('find-provider');
  updateFPDashboard();
}
function fpSearch(){
  FP_ANALYTICS.searches++;
  var zip=document.getElementById('fp-zip').value||'your area';
  document.getElementById('fp-results-label').textContent='5 Providers Near '+zip;
  updateFPDashboard();
}
function fpUseLocation(){
  document.getElementById('fp-zip').value='91501';
  fpSearch();
}
function fpToggleChip(el){
  document.querySelectorAll('.fp-chip').forEach(function(c){c.classList.remove('fp-chip-on');c.style.background='#fff';c.style.color='var(--muted)';c.style.border='1px solid var(--border)';});
  el.classList.add('fp-chip-on');el.style.background='var(--blue)';el.style.color='#fff';el.style.border='none';
}
function fpCall(name){
  FP_ANALYTICS.calls++;
  updateFPDashboard();
  showXPPopup(25);
}
function fpDirections(name){
  FP_ANALYTICS.directions++;
  updateFPDashboard();
}
function updateFPDashboard(){
  var n=document.getElementById('fp-kpi-calls');if(n)n.textContent=42+FP_ANALYTICS.calls;
  var s=document.getElementById('fp-kpi-searches');if(s)s.textContent=128+FP_ANALYTICS.searches;
  var o=document.getElementById('fp-kpi-opens');if(o)o.textContent=186+FP_ANALYTICS.opens;
}
function updateCraving(){
  var v=document.getElementById('cravingSlider').value,d=document.getElementById('cravingVal'),a=document.getElementById('cravingAlert');
  d.textContent=v+'/10';d.style.color=v>=7?'var(--coral)':v>=4?'var(--gold-dk)':'var(--sage)';
  a.style.display=v>=7?'block':'none';
}
function confirmFocus(card){
  var check = document.getElementById('focus-check');
  var time  = document.getElementById('focus-time');
  check.style.display = 'block';
  time.textContent  = 'Today \u2713';
  time.style.color  = 'var(--hb-teal)';
  updateTodayProgress();
  openOv('insights');
}
function confirmConnect(card){
  var check = document.getElementById('connect-check');
  var label = document.getElementById('connect-label');
  var time  = document.getElementById('connect-time');
  if(check.style.display === 'none'){
    check.style.display = 'block';
    time.textContent  = 'Today \u2713';
    time.style.color  = 'var(--hb-teal)';
  }
  updateTodayProgress();
  openOv('connect');
}
function confirmCheckin(card){
  var icon = document.getElementById('checkin-icon');
  var check = document.getElementById('checkin-check');
  var label = document.getElementById('checkin-label');
  var time = document.getElementById('checkin-time');
  if(check.style.display === 'none'){
    check.style.display = 'block';
    time.textContent = 'Today \u2713';
    time.style.color = 'var(--hb-teal)';
    window.open('https://uwmadison.co1.qualtrics.com/jfe/form/SV_4TlrmLvYyPnB9cO?practice=true&subid=9999', '_blank');
  } else {
    check.style.display = 'none';
    time.textContent = '5:00 PM';
    time.style.color = '';
  }
  updateTodayProgress();
}
/* Daily ritual progress \u2014 reflects how many of the 3 tasks are done */
function updateTodayProgress(){
  var keys=['focus','checkin','connect','log'], done=0;
  keys.forEach(function(k){
    var chk=document.getElementById(k+'-check');
    var card=document.getElementById(k+'-card');
    var on=chk && chk.style.display && chk.style.display!=='none';
    if(card) card.classList.toggle('done', !!on);
    if(on) done++;
  });
  var t=document.getElementById('rt-done'); if(t) t.textContent=done;
  var f=document.getElementById('rt-bar-fill'); if(f) f.style.width=(done/keys.length*100)+'%';
}
/* Log Use — optional, anytime (not part of the daily 3) */
function logUse(card){
  var check=document.getElementById('log-check');
  var time=document.getElementById('log-time');
  if(check.style.display==='none'){
    check.style.display='block';
    time.textContent='Logged ✓';
    time.style.color='var(--hb-teal)';
  } else {
    check.style.display='none';
    time.textContent='Anytime';
    time.style.color='';
  }
}
/* ═══ RECOVERY HEALTH CHART ═══ */
var recoveryHealthChart = null;
var currentRHTf = 'month';

var rhData = {
  month:   [49,51,48,53,55,52,57,56,59,58,61,60,58,62,64,63,61,65,64,67,66,68,65,69,70,68,71,70,72,73],
  weekly:  [50,54,58,62,66,70,73],
  monthly: [52,62,73]
};

function updateRecoveryHealthChart(){
  var tf = currentRHTf;
  var data = rhData[tf];
  var labels = getPatternLabels(tf);
  var wrapper = document.getElementById('rh-scroll-wrapper');
  var containerW = wrapper ? wrapper.clientWidth : 320;
  var ptSpacing = tf==='month' ? 13 : 60;
  var chartW = Math.max(containerW, labels.length * ptSpacing);
  var canvas = document.getElementById('recoveryHealthChart');
  if(!canvas) return;
  canvas.width = chartW; canvas.height = 160;
  canvas.style.width = chartW + 'px'; canvas.style.height = '160px';
  if(recoveryHealthChart){ recoveryHealthChart.destroy(); recoveryHealthChart = null; }
  recoveryHealthChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderColor: '#6E9E80',
        backgroundColor: 'rgba(110,158,128,0.10)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#6E9E80'
      }]
    },
    options: {
      responsive: false,
      animation: { duration: 300 },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(c){ return 'Score: ' + c.parsed.y; } } } },
      scales: {
        y: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 8 }, color: '#8a7e76' }, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } },
        x: { ticks: { font: { size: 7 }, maxRotation: 45, color: '#8a7e76' }, grid: { display: false } }
      }
    }
  });
}

function selectRHTf(tf, btn){
  currentRHTf = tf;
  document.querySelectorAll('.rh-tf').forEach(function(b){ b.style.background='#fff'; b.style.color='var(--muted)'; b.style.borderColor='var(--border)'; });
  btn.style.background = 'var(--espresso)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--espresso)';
  updateRecoveryHealthChart();
}

/* ═══ PATTERN CHART ═══ */
var patternChart = null;
var currentPatternItem = 'urge';
var currentPatternTf = 'month';

var patternData = {
  urge:     { label:'Urge',             hex:'#D4736A', bg:'rgba(212,115,106,0.08)', month:[4,3,5,4,3,4,2,3,4,3,2,3,4,3,2,3,2,3,2,1,3,2,3,2,1,2,3,2,1,2], weekly:[4.1,3.8,3.5,3.2,2.9,2.7,2.4], monthly:[3.8,3.2,2.5] },
  pain:     { label:'Pain',             hex:'#C9A84C', bg:'rgba(201,168,76,0.08)',  month:[3,4,3,4,2,3,4,3,2,3,4,2,3,2,3,2,4,3,2,3,2,2,3,2,1,2,3,2,1,2], weekly:[3.8,3.5,3.2,2.9,2.7,2.5,2.3], monthly:[3.5,2.9,2.4] },
  stress:   { label:'Stressful Events', hex:'#8B7EC8', bg:'rgba(139,126,200,0.08)', month:[4,5,3,4,3,4,3,2,3,4,2,3,4,3,2,3,2,3,2,3,2,3,2,1,2,3,2,2,1,2], weekly:[4.2,3.8,3.5,3.1,2.8,2.5,2.2], monthly:[4.0,3.2,2.5] },
  pleasant: { label:'Pleasant Events',  hex:'#4A7E5C', bg:'rgba(74,126,92,0.08)',   month:[2,1,2,3,2,3,2,3,2,3,3,2,3,3,4,3,2,3,4,3,4,3,4,4,3,4,4,5,4,4], weekly:[1.8,2.1,2.5,2.8,3.1,3.4,3.7], monthly:[1.8,2.6,3.6] },
  risky:    { label:'Risky Situations', hex:'#D4612A', bg:'rgba(212,97,42,0.08)',   month:[5,4,5,4,3,4,3,4,3,2,3,4,3,2,3,2,3,2,3,2,2,3,2,1,2,2,1,2,1,2], weekly:[4.5,4.0,3.5,3.1,2.8,2.4,2.1], monthly:[4.2,3.2,2.1] },
  sleep:    { label:'Sleep Quality',    hex:'#4A90D9', bg:'rgba(74,144,217,0.08)',  month:[2,2,3,2,3,2,3,3,2,3,3,4,3,3,4,3,4,3,4,4,4,3,4,4,5,4,4,5,4,5], weekly:[2.0,2.3,2.8,3.0,3.2,3.5,3.8], monthly:[2.0,2.8,3.8] }
};

function getPatternLabels(tf){
  if(tf==='month'){
    var out=[],d=new Date(2026,3,19),mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for(var i=0;i<30;i++){out.push(mn[d.getMonth()]+' '+d.getDate());d.setDate(d.getDate()+1);}
    return out;
  }
  if(tf==='weekly') return ['Wk 1','Wk 2','Wk 3','Wk 4','Wk 5','Wk 6','Wk 7'];
  return ['Mar','Apr','May'];
}

function updatePatternChart(){
  var item=patternData[currentPatternItem];
  var tf=currentPatternTf;
  var data=tf==='month'?item.month:tf==='weekly'?item.weekly:item.monthly;
  var labels=getPatternLabels(tf);
  document.getElementById('pattern-title').textContent=item.label;
  var wrapper=document.getElementById('chart-scroll-wrapper');
  var containerW=wrapper.clientWidth||320;
  var ptSpacing=tf==='month'?13:60;
  var chartW=Math.max(containerW,labels.length*ptSpacing);
  var canvas=document.getElementById('patternChart');
  canvas.width=chartW; canvas.height=160;
  canvas.style.width=chartW+'px'; canvas.style.height='160px';
  if(patternChart){patternChart.destroy();patternChart=null;}
  patternChart=new Chart(canvas,{
    type:'line',
    data:{labels:labels,datasets:[{data:data,borderColor:item.hex,backgroundColor:item.bg,borderWidth:2,fill:true,tension:0.4,pointRadius:3,pointHoverRadius:5,pointBackgroundColor:item.hex}]},
    options:{
      responsive:false,
      animation:{duration:300},
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return 'Score: '+c.parsed.y;}}}},
      scales:{
        y:{min:1,max:5,ticks:{stepSize:1,font:{size:8},color:'#8a7e76'},grid:{color:'rgba(0,0,0,0.04)'},border:{display:false}},
        x:{ticks:{font:{size:7},maxRotation:45,color:'#8a7e76'},grid:{display:false}}
      }
    }
  });
}

function selectPatternItem(key,btn){
  currentPatternItem=key;
  document.querySelectorAll('.pattern-item').forEach(function(b){b.style.background='#fff';b.style.color='var(--muted)';b.style.borderColor='var(--border)';});
  btn.style.background='var(--espresso)';btn.style.color='#fff';btn.style.borderColor='var(--espresso)';
  updatePatternChart();
}

function selectPatternTf(tf,btn){
  currentPatternTf=tf;
  document.querySelectorAll('.pattern-tf').forEach(function(b){b.style.background='#fff';b.style.color='var(--muted)';b.style.borderColor='var(--border)';});
  btn.style.background='var(--espresso)';btn.style.color='#fff';btn.style.borderColor='var(--espresso)';
  updatePatternChart();
}

function toggleChk(check, btn){
  if(!check) return;
  var on = check.classList.toggle('on');
  if(btn) btn.style.borderColor = on ? 'var(--hb-teal)' : 'var(--border)';
}
function confirmAttended(id){ toggleChk(document.getElementById('attended-check-'+id), document.getElementById('attended-btn-'+id)); }
function confirmTaken(){ toggleChk(document.getElementById('taken-check'), document.getElementById('taken-btn')); }
function confirmMoudDose(card){
  var pill = document.getElementById('moud-pill-icon');
  var check = document.getElementById('moud-check');
  var label = document.getElementById('moud-label');
  var time = document.getElementById('moud-time');
  if(check.style.display === 'none'){
    check.style.display = 'block';
    label.style.color = 'var(--sage-dk)';
    label.textContent = 'TAKEN';
    time.textContent = 'Today ✓';
    time.style.color = 'var(--sage)';
  } else {
    check.style.display = 'none';
    label.style.color = 'var(--purple-dk)';
    label.textContent = 'IMPROVE';
    time.textContent = '9:00 AM';
    time.style.color = '';
  }
}
function confirmMat(b){
  var multi=Math.random();
  var xp=50, label='Confirmed! +50 XP';
  if(multi>.85){xp=250;label='🎉 5× MYSTERY BONUS! +250 XP!';}
  else if(multi>.65){xp=150;label='✨ 3× BONUS! +150 XP!';}
  else if(multi>.45){xp=100;label='⚡ 2× BONUS! +100 XP!';}
  b.textContent=label;b.style.background=multi>.45?'var(--gold)':'var(--sage)';b.style.color='#fff';b.disabled=true;
  if(multi>.45)showXPPopup(xp);
}

/* ═══ MYSTERY XP POPUP ═══ */
function showXPPopup(xp){
  var bg=document.createElement('div');bg.className='xp-popup-bg';
  var pop=document.createElement('div');pop.className='xp-popup';
  pop.innerHTML='<div style="font-size:32px;margin-bottom:8px">✨</div><div style="font-family:Fraunces,serif;font-size:36px;font-weight:700;color:#C9A84C">+'+xp+' XP</div><div class="ui" style="font-size:12px;color:rgba(255,255,255,.6);margin-top:4px;letter-spacing:1px">MYSTERY BONUS!</div><div class="ui" style="font-size:9px;color:rgba(255,255,255,.3);margin-top:8px">Variable rewards keep recovery exciting</div>';
  document.body.appendChild(bg);document.body.appendChild(pop);
  bg.onclick=function(){bg.remove();pop.remove()};
  setTimeout(function(){bg.remove();pop.remove()},3000);
}

function showMysteryXP(){
  var bg=document.createElement('div');bg.className='xp-popup-bg';
  var pop=document.createElement('div');pop.className='xp-popup';
  pop.innerHTML='<div class="treasure-chest" style="margin:0 auto 12px;width:56px;height:56px;font-size:28px;border-radius:10px">🎁</div><div style="font-family:Cormorant Garamond,serif;font-size:22px;color:#fff;margin-bottom:4px">Daily Treasure Chest</div><div class="ui" style="font-size:10px;color:rgba(255,255,255,.5);margin-bottom:12px">Complete 2 more quests to unlock!</div><div class="ui" style="font-size:9px;color:#C9A84C;margin-bottom:4px">Today\'s mystery could be:</div><div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"><span class="tag" style="background:rgba(201,168,76,.2);color:#C9A84C">5× XP Boost</span><span class="tag" style="background:rgba(139,126,200,.2);color:#8B7EC8">Sage Meditation</span><span class="tag" style="background:rgba(196,160,136,.2);color:#C4A088">Family Surprise</span></div>';
  document.body.appendChild(bg);document.body.appendChild(pop);
  bg.onclick=function(){bg.remove();pop.remove()};
}

/* ═══ RESPONSIVE SHELL — mobile · tablet · desktop ═══
   The whole UI is authored at a narrow "design width" and uniformly
   scaled UP so the prototype's tiny 6–10px type renders at readable
   sizes on every device, without distorting any component.
     • Phones (≤640px): scale to fill the entire viewport.
     • Tablet/Desktop (>640px): render a clean, centered app surface
       sized to the window (capped), comfortably readable.
   A body class (is-mobile / is-framed) lets CSS handle the framing. */
(function(){
  var p=document.getElementById('phone');if(!p)return;
  var b=document.body;
  var MOBILE=640, DESIGN_W=290;
  function clamp(v,lo,hi){return Math.min(Math.max(v,lo),hi);}
  function vh(){ return (window.visualViewport && window.visualViewport.height) || window.innerHeight; }
  function apply(){
    var vw=window.innerWidth, H=vh();
    if(vw<=MOBILE){
      /* phones — fill the viewport edge to edge */
      b.classList.add('is-mobile'); b.classList.remove('is-framed'); b.classList.remove('is-desktop'); b.classList.remove('is-tablet');
      window.__deskF=null;
      var F=clamp(vw/DESIGN_W,1.35,1.7);
      p.style.width=(vw/F)+'px';
      p.style.height=(H/F)+'px';
      p.style.transform='scale('+F+')';
      p.style.transformOrigin='top left';
      p.style.margin='0';
      p.style.zoom='';
    } else if(vw<900){
      /* tablet (and large-phone landscape) — bigger-mobile: edge-to-edge,
         2-column cards, floating bottom nav */
      b.classList.add('is-tablet'); b.classList.remove('is-mobile'); b.classList.remove('is-framed'); b.classList.remove('is-desktop');
      window.__deskF=null;
      var WT=680, FT=clamp(vw/WT,0.85,1.5);
      p.style.width=WT+'px';
      p.style.height=(H/FT)+'px';
      p.style.transform='scale('+FT.toFixed(4)+')';
      p.style.transformOrigin='top left';
      p.style.margin='0';
      p.style.marginTop='';p.style.marginBottom='';
      p.style.zoom='';
    } else {
      /* desktop — natural page scroll. Use CSS zoom (which reflows, unlike
         transform) so the whole page scrolls normally; cards flow 2-up. */
      b.classList.add('is-framed'); b.classList.add('is-desktop'); b.classList.remove('is-mobile'); b.classList.remove('is-tablet');
      var DW=680, F=clamp(Math.min((vw-72)/DW, H/700), 1.0, 1.55);
      window.__deskF=F;
      p.style.transform='none';
      p.style.transformOrigin='';
      p.style.margin='0 auto';
      p.style.marginTop='';
      p.style.marginBottom='';
      p.style.width=DW+'px';
      p.style.height='auto';
      p.style.zoom=F;
    }
  }
  apply();
  window.addEventListener('resize',apply);
  if(window.visualViewport) window.visualViewport.addEventListener('resize',apply);
})();

/* ═══ LUCIDE ICONS ═══
   Replace every <i data-lucide="…"> with a clean, consistent stroke icon. */
function renderIcons(){ if(window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }
renderIcons();
if(typeof updateTodayProgress==='function') updateTodayProgress();
window.addEventListener('load', renderIcons);

/* Fresh state on every refresh (no page restore) */
try{localStorage.removeItem("rh_ov");localStorage.removeItem("rh_screen");}catch(e){}

/* ═══ LOG OPIOID USE ═══ */
var LOG_TODAY={y:2026,m:5,d:22};   /* June 22, 2026 — demo "today" */
var logState={y:2026,m:5,selDay:null,selPeriod:null,entries:[]};
var LOG_PERIODS=[
  {e:'moon',label:'Midnight – 6 AM'},
  {e:'sunrise',label:'6 AM – Noon'},
  {e:'sun',label:'Noon – 6 PM'},
  {e:'sunset',label:'6 PM – Midnight'}
];
var LOG_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var LOG_SMO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var LOG_WD=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var LOG_SWD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var LOG_DOW=['Su','Mo','Tu','We','Th','Fr','Sa'];

function openLogUse(){
  logState.y=LOG_TODAY.y; logState.m=LOG_TODAY.m; logState.selDay=null; logState.selPeriod=null;
  renderLogCalendar(); renderLogTime(); renderLogEntries();
  openOv('log-use');
}
function changeLogMonth(d){
  logState.m+=d;
  if(logState.m<0){logState.m=11;logState.y--;}
  if(logState.m>11){logState.m=0;logState.y++;}
  logState.selDay=null; logState.selPeriod=null;
  renderLogCalendar(); renderLogTime();
}
function logIsFuture(y,m,d){
  if(y!==LOG_TODAY.y) return y>LOG_TODAY.y;
  if(m!==LOG_TODAY.m) return m>LOG_TODAY.m;
  return d>LOG_TODAY.d;
}
function renderLogCalendar(){
  document.getElementById('log-month').textContent=LOG_MONTHS[logState.m]+' '+logState.y;
  var cal=document.getElementById('log-cal'); cal.innerHTML='';
  LOG_DOW.forEach(function(d){var c=document.createElement('div');c.className='dow';c.textContent=d;cal.appendChild(c);});
  var first=new Date(logState.y,logState.m,1).getDay();
  var days=new Date(logState.y,logState.m+1,0).getDate();
  for(var i=0;i<first;i++){var e=document.createElement('div');e.className='log-day empty';cal.appendChild(e);}
  for(var day=1;day<=days;day++){
    var b=document.createElement('button'); b.className='log-day'; b.textContent=day;
    if(logIsFuture(logState.y,logState.m,day)){ b.className+=' future'; }
    else { (function(dd){ b.onclick=function(){selectLogDate(dd);}; })(day); }
    if(logState.y===LOG_TODAY.y&&logState.m===LOG_TODAY.m&&day===LOG_TODAY.d&&logState.selDay!==day) b.className+=' today';
    if(logState.selDay===day) b.className+=' sel';
    cal.appendChild(b);
  }
}
function selectLogDate(d){ logState.selDay=d; logState.selPeriod=null; renderLogCalendar(); renderLogTime(); }
function renderLogTime(){
  var empty=document.getElementById('log-time-empty'), body=document.getElementById('log-time-body');
  if(logState.selDay==null){ empty.style.display='block'; body.style.display='none'; return; }
  empty.style.display='none'; body.style.display='block';
  var dt=new Date(logState.y,logState.m,logState.selDay);
  document.getElementById('log-day-label').textContent=LOG_WD[dt.getDay()]+', '+LOG_MONTHS[logState.m]+' '+logState.selDay;
  var pc=document.getElementById('log-periods'); pc.innerHTML='';
  LOG_PERIODS.forEach(function(p,i){
    var b=document.createElement('button');
    b.className='log-period'+(logState.selPeriod===i?' sel':'');
    b.innerHTML='<span class="pe"><i data-lucide="'+p.e+'"></i></span><span>'+p.label+'</span>';
    (function(idx){ b.onclick=function(){ logState.selPeriod=idx; renderLogTime(); }; })(i);
    pc.appendChild(b);
  });
  if(window.lucide&&lucide.createIcons)lucide.createIcons();
  var add=document.getElementById('log-add-btn');
  if(logState.selPeriod!=null){ add.disabled=false; add.style.background='var(--hb-gold)'; add.style.color='#fff'; add.style.cursor='pointer'; }
  else { add.disabled=true; add.style.background='#E3DED6'; add.style.color='#9A938B'; add.style.cursor='not-allowed'; }
}
function addLogEntry(){
  if(logState.selDay==null||logState.selPeriod==null) return;
  var dt=new Date(logState.y,logState.m,logState.selDay), p=LOG_PERIODS[logState.selPeriod];
  logState.entries.unshift({label:LOG_SWD[dt.getDay()]+', '+LOG_SMO[logState.m]+' '+logState.selDay, period:p.label, e:p.e});
  logState.selPeriod=null; renderLogTime(); renderLogEntries(); updateLogTileState();
}
function removeLogEntry(i){ logState.entries.splice(i,1); renderLogEntries(); updateLogTileState(); }
function updateLogTileState(){
  var lc=document.getElementById('log-check'), lt=document.getElementById('log-time');
  var done=logState.entries.length>0;
  if(lc) lc.style.display=done?'block':'none';
  if(lt){ lt.textContent=done?'Logged \u2713':'Anytime'; lt.style.color=done?'var(--hb-teal)':''; }
  if(typeof updateTodayProgress==='function') updateTodayProgress();
}
function renderLogEntries(){
  var c=document.getElementById('log-entries'); c.innerHTML='';
  if(!logState.entries.length){ c.innerHTML='<div class="log-empty-note">No entries logged yet</div>'; return; }
  logState.entries.forEach(function(en,i){
    var d=document.createElement('div'); d.className='log-entry';
    d.innerHTML='<span class="pe"><i data-lucide="'+en.e+'"></i></span><div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--ink)">'+en.label+'</div><div style="font-size:11px;color:var(--ink-soft)">'+en.period+'</div></div>';
    var x=document.createElement('button'); x.className='log-entry-x'; x.innerHTML='&times;';
    (function(idx){ x.onclick=function(){removeLogEntry(idx);}; })(i);
    d.appendChild(x); c.appendChild(d);
  });
  if(window.lucide&&lucide.createIcons)lucide.createIcons();
}

/* ═══ DAILY REFLECTION ═══ */
var REFLECT_Q=[
  {type:'multi', q:'Which of these drugs have you used in the past 24 hours?', sub:'Select all that apply', options:[
    'Alcohol','Cannabis (marijuana, pot, hash, K2, spice, etc.)','Stimulants (cocaine, meth, speed, ecstasy, molly, Adderall, etc.)',
    'Inhalants (nitrous, glue, petrol, paint thinner, etc.)','Sedatives or sleeping pills (Valium, Serepax, Rohypnol, etc.)',
    'Hallucinogens (LSD, acid, mushrooms, PCP, special K, etc.)','Opioids (heroin, fentanyl, oxycodone, etc.)','None — I did not use any substances']},
  {type:'slider', q:'How strong was your greatest craving to use opioids over the past 24 hours?', lo:'No craving', hi:'Extreme craving'},
  {type:'slider', q:'How risky was the riskiest situation (people, places, or things that interfere with your recovery) you experienced over the past 24 hours?', lo:'No risk', hi:'Extreme risk'},
  {type:'slider', q:'How stressful was the biggest hassle or stressful event you experienced over the past 24 hours?', lo:'No stress', hi:'Extreme stress'},
  {type:'slider', q:'How much pain did you experience over the past 24 hours?', lo:'No pain', hi:'Extreme pain'},
  {type:'slider', q:'How would you rate your sleep quality last night?', lo:'Very poor', hi:'Excellent'},
  {type:'slider', q:'How would you describe your overall mood over the past 24 hours?', lo:'Very low', hi:'Very good'},
  {type:'slider', q:'How many pleasant or rewarding moments did you experience over the past 24 hours?', lo:'None', hi:'Many'},
  {type:'slider', q:'How confident are you in staying on track with your recovery today?', lo:'Not confident', hi:'Very confident'},
  {type:'slider', q:'How supported and connected did you feel over the past 24 hours?', lo:'Isolated', hi:'Well supported'}
];
var reflectStep=0, reflectAnswers={}, reflectQs=[];
function openReflect(){ reflectStep=0; reflectAnswers={}; reflectQs=REFLECT_Q.slice().sort(function(){return Math.random()-0.5;}).slice(0,5); renderReflect(); openOv('reflect'); }
function reflectNext(){ reflectStep++; renderReflect(); }
function reflectBack(){ if(reflectStep<=0){ closeOv(); return; } reflectStep--; renderReflect(); }
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function reflectToggleOpt(btn,i){
  var a=reflectAnswers[reflectStep]||(reflectAnswers[reflectStep]=[]);
  var idx=a.indexOf(i);
  if(idx>=0){ a.splice(idx,1); btn.classList.remove('opt-sel'); }
  else{ a.push(i); btn.classList.add('opt-sel'); }
}
function reflectSlider(v){ reflectAnswers[reflectStep]=+v; var el=document.getElementById('reflect-slider-val'); if(el) el.textContent=v; }
function renderReflect(){
  var body=document.getElementById('reflect-body');
  var foot=document.getElementById('reflect-footer');
  if(!reflectQs.length) reflectQs=REFLECT_Q.slice(0,5);
  var total=reflectQs.length;
  if(reflectStep===0){
    body.innerHTML=
      '<div class="rf-card" style="text-align:center;padding:26px 20px">'+
        '<div style="font-size:36px;margin-bottom:12px">\ud83e\ude9e</div>'+
        '<div style="font-family:var(--font-display);font-size:19px;font-weight:600;color:var(--ink);margin-bottom:8px">Daily Reflection</div>'+
        '<div style="font-size:13px;color:var(--ink-soft);line-height:1.55">A few short questions about your experiences and mood.</div>'+
      '</div>'+
      '<div class="rf-card">'+
        '<div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#5E8560;margin-bottom:8px">Section 1 of 2</div>'+
        '<div style="font-family:var(--font-display);font-size:15px;font-weight:500;color:var(--ink)">Thinking about the past 24 hours\u2026</div>'+
        '<div style="margin-top:16px"><span style="display:inline-block;font-size:12px;font-weight:700;color:#9A6B16;background:#FFF1D6;padding:6px 14px;border-radius:999px">+20 XP</span></div>'+
      '</div>';
    foot.innerHTML='<button class="rf-btn rf-primary rf-full" onclick="reflectNext()">Begin \u2192</button>';
    return;
  }
  if(reflectStep>total){
    body.innerHTML=
      '<div class="rf-card" style="text-align:center;padding:34px 22px">'+
        '<div style="width:92px;height:92px;border-radius:50%;background:#EAF1E9;border:2px solid #7BA47E;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:38px;color:#5E8560">\u2713</div>'+
        '<div style="font-family:var(--font-display);font-size:19px;font-weight:600;color:var(--ink);margin-bottom:12px">Reflection complete</div>'+
        '<div style="font-size:13px;color:var(--ink-soft);line-height:1.65">Your responses have been recorded. Thank you for taking time to reflect \u2014 it matters for your recovery.</div>'+
      '</div>';
    foot.innerHTML='<button class="rf-btn rf-primary rf-full" onclick="reflectDone()">Done</button>';
    return;
  }
  var n=reflectStep, item=reflectQs[n-1], pct=Math.round(n/total*100), inner='';
  if(item.type==='multi'){
    var sel=reflectAnswers[n]||[];
    inner='<div style="margin-top:16px">'+item.options.map(function(o,i){
      return '<button class="reflect-opt'+(sel.indexOf(i)>=0?' opt-sel':'')+'" onclick="reflectToggleOpt(this,'+i+')">'+esc(o)+'</button>';
    }).join('')+'</div>';
  } else {
    var val=reflectAnswers[n]!=null?reflectAnswers[n]:5; reflectAnswers[n]=val;
    inner='<div style="text-align:center;margin-top:14px"><span id="reflect-slider-val" style="font-family:var(--font-display);font-size:40px;font-weight:700;color:#7BA47E;line-height:1">'+val+'</span><div style="font-size:13px;color:var(--ink-soft);margin-top:2px">out of 10</div></div>'+
      '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-soft);margin:16px 2px 8px"><span>'+esc(item.lo)+'</span><span>'+esc(item.hi)+'</span></div>'+
      '<input type="range" min="0" max="10" value="'+val+'" oninput="reflectSlider(this.value)" class="reflect-range">';
  }
  body.innerHTML=
    '<div style="text-align:center;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink-soft);margin-bottom:9px">Question '+n+' of '+total+'</div>'+
    '<div class="reflect-prog" style="margin-bottom:16px"><div class="reflect-prog-fill" style="width:'+pct+'%"></div></div>'+
    '<div class="rf-card">'+
      '<div style="font-size:15px;font-weight:700;color:var(--ink);line-height:1.45">'+esc(item.q)+'</div>'+
      (item.sub?'<div style="font-size:13px;color:var(--ink-soft);margin-top:4px">'+esc(item.sub)+'</div>':'')+
      inner+
    '</div>';
  foot.innerHTML=
    '<button class="rf-btn rf-back" onclick="reflectBack()">\u2190 Back</button>'+
    '<button class="rf-btn rf-primary" onclick="reflectNext()">Next \u2192</button>';
}
function reflectDone(){
  closeOv();
  var check=document.getElementById('checkin-check'), time=document.getElementById('checkin-time');
  if(check){ check.style.display='block'; }
  if(time){ time.textContent='Today ✓'; time.style.color='var(--hb-teal)'; }
  updateTodayProgress();
  if(typeof showXPPopup==='function') showXPPopup(20);
}

/* ═══ Recovery Health — segmented fan gauge ═══ */
function buildHealthGauge(){
  var el=document.getElementById('healthGauge'); if(!el) return;
  if(el.querySelector('.speedo')) return;        /* build once */
  var val=74, N=10, filled=Math.round(val/10);
  var s='<svg class="speedo" viewBox="14 24 272 158" xmlns="http://www.w3.org/2000/svg">';
  for(var i=0;i<N;i++){
    var a=(-80 + i*(160/(N-1))).toFixed(2);
    s+='<rect x="137" y="124" width="26" height="44" rx="13" fill="'+(i<filled?'#6E9E80':'#E6E1D8')+'" transform="rotate('+a+' 150 168) translate(0 -88)"/>';
  }
  var na=(-80 + (val/100)*160)*Math.PI/180, L=64, bw=5;
  var tx=(150+L*Math.sin(na)).toFixed(1), ty=(168-L*Math.cos(na)).toFixed(1);
  var px=Math.cos(na), py=Math.sin(na);
  var blx=(150+bw*px).toFixed(1), bly=(168+bw*py).toFixed(1), brx=(150-bw*px).toFixed(1), bry=(168-bw*py).toFixed(1);
  s+='<polygon points="'+blx+','+bly+' '+brx+','+bry+' '+tx+','+ty+'" fill="#3F6650"/>';
  s+='<circle cx="150" cy="168" r="10" fill="#3F6650"/><circle cx="150" cy="168" r="4.5" fill="#fff"/>';
  s+='</svg>';
  el.insertAdjacentHTML('afterbegin', s);
  var num=el.querySelector('.gauge-num'); if(num) num.innerHTML=val+'<small>/100</small>';
  var cap=el.querySelector('.gauge-cap'); if(cap) cap.textContent = val>=85?'Excellent':val>=70?'Above Average':val>=55?'Good':'Needs care';
}
buildHealthGauge();

/* Recovery Today starts empty (0/4) */

/* ═══ CONNECT THREADS — like + post your own experience ═══ */
function toggleHelpful(btn){
  if(!btn.dataset.base) btn.dataset.base = (btn.textContent.match(/\d+/)||['0'])[0];
  var liked = btn.classList.toggle('liked');
  var n = (+btn.dataset.base) + (liked ? 1 : 0);
  btn.innerHTML = (liked ? '&#10084;' : '&#9825;') + ' ' + n + ' &nbsp;Helpful';
}
function postThread(el){
  var bar = el.closest('.thread-reply'); if(!bar) return;
  var input = bar.querySelector('.thread-reply-input');
  var text = (input.value||'').trim();
  if(!text){ input.focus(); return; }
  var body = bar.closest('.overlay').querySelector('.ov-body'); if(!body) return;
  var card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'border-color:var(--rose);border-left:3px solid var(--rose)';
  card.innerHTML =
    '<div class="card-pad">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
        '<div class="ic-xl" style="background:var(--rose);color:#fff;font-size:9px;font-weight:600;flex-shrink:0">ME</div>'+
        '<div style="flex:1">'+
          '<div class="ui" style="font-size:10px;font-weight:500;color:var(--espresso)">VictoryWarrior <span style="color:var(--rose);font-weight:400">(you)</span></div>'+
          '<div class="ui" style="font-size:8px;color:var(--muted)">Level 4 · Bloom · just now</div>'+
        '</div>'+
      '</div>'+
      '<div class="ui thread-msg" style="font-size:12px;color:var(--t1);line-height:1.6"></div>'+
      '<div style="display:flex;align-items:center;gap:12px;margin-top:8px">'+
        '<button class="thread-like" onclick="toggleHelpful(this)" style="background:none;border:none;cursor:pointer;font-family:\'Josefin Sans\',sans-serif;font-size:8px;color:var(--muted);letter-spacing:.5px;padding:0;display:flex;align-items:center;gap:4px">&#9825; 0 &nbsp;Helpful</button>'+
      '</div>'+
    '</div>';
  card.querySelector('.thread-msg').textContent = text;
  var spacer = body.lastElementChild;
  if(spacer && spacer.children.length===0 && spacer.offsetHeight<=12){ body.insertBefore(card, spacer); }
  else { body.appendChild(card); }
  input.value = '';
  card.scrollIntoView({behavior:'smooth', block:'center'});
  if(window.lucide && lucide.createIcons) lucide.createIcons();
}

/* ═══ SPLASH → WELCOME CAROUSEL → APP ═══ */
var __wc={start:function(){},stop:function(){}};
(function(){
  var track=document.getElementById('wcTrack'); if(!track) return;
  var slidesEl=document.querySelector('#welcome .wc-slides');
  var n=track.children.length, i=0, timer=null;
  var dots=document.querySelectorAll('#wcDots .wc-dot');
  function go(k){ i=(k+n)%n; track.style.transition=''; track.style.transform='translateX('+(-i*100)+'%)';
    for(var d=0;d<dots.length;d++) dots[d].classList.toggle('active', d===i); }
  function start(){ stop(); timer=setInterval(function(){ go(i+1); }, 3800); }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } }
  for(var d=0;d<dots.length;d++){ (function(k){ dots[k].addEventListener('click', function(){ go(k); start(); }); })(d); }

  /* manual swipe / drag */
  var startX=0, dx=0, dragging=false, w=1;
  function down(x){ dragging=true; startX=x; dx=0; w=(slidesEl&&slidesEl.clientWidth)||window.innerWidth||1; track.style.transition='none'; stop(); }
  function move(x){ if(!dragging) return; dx=x-startX; track.style.transform='translateX('+(-i*100 + dx/w*100)+'%)'; }
  function up(){ if(!dragging) return; dragging=false; var th=w*0.16;
    if(dx<=-th) go(i+1); else if(dx>=th) go(i-1); else go(i);
    start(); }
  if(slidesEl){
    slidesEl.addEventListener('touchstart', function(e){ down(e.touches[0].clientX); }, {passive:true});
    slidesEl.addEventListener('touchmove',  function(e){ move(e.touches[0].clientX); }, {passive:true});
    slidesEl.addEventListener('touchend',   up);
    slidesEl.addEventListener('touchcancel',up);
    slidesEl.addEventListener('pointerdown',function(e){ if(e.pointerType==='mouse'){ e.preventDefault(); down(e.clientX); } });
    slidesEl.addEventListener('pointermove',function(e){ if(e.pointerType==='mouse') move(e.clientX); });
    window.addEventListener('pointerup',     function(e){ if(e.pointerType==='mouse') up(); });
    slidesEl.style.cursor='grab';
  }
  go(0); __wc.start=start; __wc.stop=stop;
})();
function enterApp(){
  __wc.stop();
  showPhoneScreen();                         /* mobile-number page underneath */
  showLocModal();                            /* location modal OVER the mobile-number page */
  var w=document.getElementById('welcome');
  if(w){ w.classList.add('hide'); setTimeout(function(){ w.style.display='none'; }, 520); }
}
/* ═══ MOBILE NUMBER ═══ */
function showPhoneScreen(){ var p=document.getElementById('phoneScreen'); if(p) p.classList.add('show'); }
function hidePhoneScreen(){ var p=document.getElementById('phoneScreen'); if(!p) return;
  p.classList.add('hide'); setTimeout(function(){ p.style.display='none'; }, 420); }
function fmtPhone(el){
  var d=el.value.replace(/\D/g,'').slice(0,10), out='';
  if(d.length===0){ el.value=''; return; }
  out='('+d.slice(0,3);
  if(d.length>3) out+=') '+d.slice(3,6);
  if(d.length>6) out+='-'+d.slice(6,10);
  el.value=out;
}
function sendCode(){
  var inp=document.getElementById('phoneInput');
  var d=((inp&&inp.value)||'').replace(/\D/g,'');
  if(d.length<10){
    var row=document.getElementById('phRow');
    if(row){ row.classList.add('err'); setTimeout(function(){ row.classList.remove('err'); }, 1200); }
    if(inp) inp.focus();
    return;
  }
  window.__phone=(typeof __cc!=='undefined'&&__cc?__cc.d:'+1')+d;
  showDetailsScreen();   /* next step: name / email / age */
  hidePhoneScreen();
}
/* ═══ DETAILS (name / email / age) ═══ */
function showDetailsScreen(){ var d=document.getElementById('detailsScreen'); if(d) d.classList.add('show'); }
function hideDetailsScreen(){ var d=document.getElementById('detailsScreen'); if(!d) return;
  d.classList.add('hide'); setTimeout(function(){ d.style.display='none'; }, 420); }
function dtErr(id){ var f=document.getElementById(id); if(f){ f.classList.add('err'); setTimeout(function(){ f.classList.remove('err'); }, 1200); } }
function submitDetails(){
  var name=document.getElementById('dtName'), email=document.getElementById('dtEmail'), age=document.getElementById('dtAge');
  var nameVal=((name&&name.value)||'').trim();
  if(!nameVal){ dtErr('dtNameField'); if(name) name.focus(); return; }
  var emailVal=((email&&email.value)||'').trim();
  if(emailVal && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal)){ dtErr('dtEmailField'); if(email) email.focus(); return; }
  window.__profile={name:nameVal, email:emailVal, age:((age&&age.value)||'').trim()};
  hideDetailsScreen();   /* -> dashboard */
}
/* ═══ LOCATION PERMISSION ═══ */
function showLocModal(){ var m=document.getElementById('locModal'); if(m) m.classList.add('show'); }
function hideLocModal(){ var m=document.getElementById('locModal'); if(!m) return;
  m.classList.add('hide'); setTimeout(function(){ m.style.display='none'; }, 320); }
function allowLocation(){
  hideLocModal();
  /* trigger the real browser/system location prompt */
  try{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        function(pos){ window.__loc={lat:pos.coords.latitude,lng:pos.coords.longitude}; },
        function(err){ /* denied or unavailable — the app still works without it */ },
        {enableHighAccuracy:false, timeout:10000, maximumAge:600000}
      );
    }
  }catch(e){}
}
function skipLocation(){ hideLocModal(); }
(function(){
  var sp=document.getElementById('splash'); if(!sp) return;
  var hidden=false;
  function hide(){ if(hidden) return; hidden=true;
    var w=document.getElementById('welcome'); if(w){ w.classList.add('show'); __wc.start(); } /* show welcome BEHIND the splash first */
    sp.classList.add('hide');                                                                 /* then fade the splash to reveal it (no dashboard flash) */
    setTimeout(function(){ sp.style.display='none'; }, 650); }
  setTimeout(hide, 1900);            /* auto-dismiss splash */
  sp.addEventListener('click', hide); /* tap to skip */
})();

/* ═══ COUNTRY CODE PICKER ═══ */
var CC_LIST=[
 {n:'United States',d:'+1',f:'🇺🇸'},{n:'Canada',d:'+1',f:'🇨🇦'},{n:'United Kingdom',d:'+44',f:'🇬🇧'},
 {n:'Australia',d:'+61',f:'🇦🇺'},{n:'India',d:'+91',f:'🇮🇳'},{n:'Ireland',d:'+353',f:'🇮🇪'},
 {n:'Germany',d:'+49',f:'🇩🇪'},{n:'France',d:'+33',f:'🇫🇷'},{n:'Spain',d:'+34',f:'🇪🇸'},
 {n:'Italy',d:'+39',f:'🇮🇹'},{n:'Netherlands',d:'+31',f:'🇳🇱'},{n:'Portugal',d:'+351',f:'🇵🇹'},
 {n:'Sweden',d:'+46',f:'🇸🇪'},{n:'Norway',d:'+47',f:'🇳🇴'},{n:'Denmark',d:'+45',f:'🇩🇰'},
 {n:'Switzerland',d:'+41',f:'🇨🇭'},{n:'Poland',d:'+48',f:'🇵🇱'},{n:'Mexico',d:'+52',f:'🇲🇽'},
 {n:'Brazil',d:'+55',f:'🇧🇷'},{n:'Argentina',d:'+54',f:'🇦🇷'},{n:'New Zealand',d:'+64',f:'🇳🇿'},
 {n:'United Arab Emirates',d:'+971',f:'🇦🇪'},{n:'Saudi Arabia',d:'+966',f:'🇸🇦'},{n:'Turkey',d:'+90',f:'🇹🇷'},
 {n:'South Africa',d:'+27',f:'🇿🇦'},{n:'Nigeria',d:'+234',f:'🇳🇬'},{n:'Kenya',d:'+254',f:'🇰🇪'},
 {n:'Egypt',d:'+20',f:'🇪🇬'},{n:'Pakistan',d:'+92',f:'🇵🇰'},{n:'Bangladesh',d:'+880',f:'🇧🇩'},
 {n:'Sri Lanka',d:'+94',f:'🇱🇰'},{n:'Nepal',d:'+977',f:'🇳🇵'},{n:'China',d:'+86',f:'🇨🇳'},
 {n:'Japan',d:'+81',f:'🇯🇵'},{n:'South Korea',d:'+82',f:'🇰🇷'},{n:'Singapore',d:'+65',f:'🇸🇬'},
 {n:'Malaysia',d:'+60',f:'🇲🇾'},{n:'Indonesia',d:'+62',f:'🇮🇩'},{n:'Philippines',d:'+63',f:'🇵🇭'},
 {n:'Thailand',d:'+66',f:'🇹🇭'},{n:'Vietnam',d:'+84',f:'🇻🇳'}
];
var __cc=CC_LIST[0];
function ccItem(c,i){ return '<button class="cc-item" type="button" onclick="pickCC('+i+')">'+
  '<span class="cc-i-flag">'+c.f+'</span><span class="cc-i-name">'+c.n+'</span><span class="cc-i-dial">'+c.d+'</span></button>'; }
function renderCC(q){
  q=(q||'').toLowerCase().trim(); var nq=q.replace('+','');
  var html='', any=false;
  for(var i=0;i<CC_LIST.length;i++){ var c=CC_LIST[i];
    if(!q || c.n.toLowerCase().indexOf(q)>=0 || c.d.replace('+','').indexOf(nq)>=0){ html+=ccItem(c,i); any=true; } }
  var el=document.getElementById('ccList'); if(el) el.innerHTML=any?html:'<div class="cc-empty">No matches</div>';
}
function filterCC(q){ renderCC(q); }
function openCC(){ var p=document.getElementById('ccPicker'); if(!p) return;
  var s=document.getElementById('ccSearch'); if(s) s.value=''; renderCC(''); p.classList.add('show'); }
function closeCC(){ var p=document.getElementById('ccPicker'); if(p) p.classList.remove('show'); }
function pickCC(i){ var c=CC_LIST[i]; if(!c) return; __cc=c;
  var f=document.getElementById('ccFlag'); if(f) f.textContent=c.f;
  var d=document.getElementById('ccDial'); if(d) d.textContent=c.d;
  closeCC(); var inp=document.getElementById('phoneInput'); if(inp) inp.focus(); }
