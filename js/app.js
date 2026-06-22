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
  document.getElementById('screenArea').scrollTop=0;
  if(id==='mat'){ setTimeout(updatePatternChart,50); setTimeout(updateRecoveryHealthChart,50); }
}
function openOv(id){var el=document.getElementById('ov-'+id);if(el)el.classList.add('active')}
function closeOv(){document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active'))}
function closeTopOv(id){var el=document.getElementById('ov-'+id);if(el)el.classList.remove('active')}

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
  var keys=['focus','checkin','connect'], done=0;
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
        borderColor: '#5B9E6F',
        backgroundColor: 'rgba(91,158,111,0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#5B9E6F'
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

function confirmAttended(id){
  var check = document.getElementById('attended-check-' + id);
  var btn = document.getElementById('attended-btn-' + id);
  if(check.style.display === 'none' || check.style.display === ''){
    check.style.display = 'flex';
    btn.style.borderColor = 'var(--sage)';
  } else {
    check.style.display = 'none';
    btn.style.borderColor = 'var(--border)';
  }
}
function confirmTaken(){
  var check = document.getElementById('taken-check');
  var btn = document.getElementById('taken-btn');
  if(check.style.display === 'none' || check.style.display === ''){
    check.style.display = 'flex';
    btn.style.borderColor = 'var(--sage)';
  } else {
    check.style.display = 'none';
    btn.style.borderColor = 'var(--border)';
  }
}
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
      b.classList.add('is-mobile'); b.classList.remove('is-framed');
      var F=clamp(vw/DESIGN_W,1.35,1.7);
      p.style.width=(vw/F)+'px';
      p.style.height=(H/F)+'px';
      p.style.transform='scale('+F+')';
      p.style.transformOrigin='top left';
      p.style.margin='0';
    } else {
      /* tablet & desktop — centered, readable app surface that grows with the window */
      b.classList.add('is-framed'); b.classList.remove('is-mobile');
      var pad=vw>=1024?64:40;
      var dispW=Math.round(clamp(vw-pad*2,320,600));
      var dispH=Math.round(Math.min(H-56,1000));
      var F2=clamp(dispW/DESIGN_W,1.4,1.95);
      p.style.width=Math.round(dispW/F2)+'px';
      p.style.height=Math.round(dispH/F2)+'px';
      p.style.transform='scale('+F2.toFixed(4)+')';
      p.style.transformOrigin='top center';
      p.style.marginTop=Math.max(0,Math.round((H-dispH)/2))+'px';
      p.style.marginBottom=Math.round(dispH*(1-1/F2))+'px';
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
