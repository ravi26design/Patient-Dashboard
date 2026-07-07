/* ═══════════════════════════════════════════════════════════
   RudraHealth AI — OUD Recovery Companion (Patient App)
   Mobile-first web app. Same data & flows as prototype v1.3.
   ═══════════════════════════════════════════════════════════ */

/* ═══ NAV ═══ */
function goScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  var el=document.getElementById('screen-'+id);if(el)el.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  var m={home:0,tools:1,narcan:2,mat:3,rewards:4,workbook:1,profile:0,checkin:0,appointments:0};
  var tabs=document.querySelectorAll('.nav-tab');if(tabs[m[id]!=null?m[id]:0])tabs[m[id]!=null?m[id]:0].classList.add('active');
  document.querySelectorAll('#dnav .dn-item').forEach(function(i){i.classList.toggle('active',i.getAttribute('data-screen')===id);});
  document.body.setAttribute('data-screen', id);
  try{localStorage.setItem('rh_screen',id);}catch(e){}
  document.getElementById('screenArea').scrollTop=0;
  if(id==='mat'){ setTimeout(updatePatternChart,50); setTimeout(updateRecoveryHealthChart,50); }
  if(id==='home' && typeof scheduleCheckin==='function') scheduleCheckin();   /* daily check-in prompt 2s after landing on home */
  if(id==='profile' && typeof renderProfileLists==='function') renderProfileLists();   /* triggers / relief / contacts */
  if(id==='tools' && typeof actzPaintTiles==='function') actzPaintTiles();   /* mark completed activities */
}
function openOv(id){
  var el=document.getElementById('ov-'+id);if(!el)return;
  /* desktop: counter the page zoom so the fixed overlay covers the viewport at native scale */
  if(document.body.classList.contains('is-desktop') && window.__deskF){ var _vw=window.innerWidth; var _t=Math.min(1.3,(_vw-24)/620); el.style.zoom=_t/window.__deskF; }
  else { el.style.zoom=''; }
  el.classList.add('active');
  el.scrollTop=0; var b=el.querySelector('.ov-body'); if(b) b.scrollTop=0;
  if(id==='relief-breath' && typeof startBreath==='function') startBreath();           /* start 4-7-8 cycle */
  if(id==='relief-game'   && typeof gameInit==='function')   gameInit();               /* build distraction grid */
  if(id==='insights'){ if(typeof buildArcGauge==='function') buildArcGauge('insightsGauge', 44); if(typeof applyRecState==='function') applyRecState(); }   /* insights gauge + recommended completion state */
  if(id==='ifthen-detail' && typeof iftSync==='function') iftSync();   /* set Save button enabled/disabled from current selection */
  if(id==='threegood-detail' && typeof tgSync==='function') tgSync();   /* set Save button state from the three inputs */
  if(id==='location-checkin'){ el.querySelectorAll('.loc-opt.sel').forEach(function(o){o.classList.remove('sel');}); var _sb=document.getElementById('loc-submit'); if(_sb) _sb.classList.remove('ready'); }  /* fresh state each open */
  try{localStorage.setItem('rh_ov',id);}catch(e){}
}
function closeOv(){if(typeof stopBreath==='function')stopBreath();if(typeof stopUrgeBreath==='function')stopUrgeBreath();if(call911Timer){clearInterval(call911Timer);call911Timer=null;}document.querySelectorAll('.overlay').forEach(function(o){o.classList.remove('active');o.style.zoom='';});try{localStorage.removeItem('rh_ov');}catch(e){}}
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
var currentRHTf = 'W', rhWeekOffset = 0;

/* deterministic series generator (runs in the browser) */
function _gen(n, from, to, lo, hi, seed){
  var out=[];
  for(var i=0;i<n;i++){
    var t=n>1?i/(n-1):0, base=from+(to-from)*t;
    var w=Math.sin((i+seed)*1.7)*(hi-lo)*0.11 + Math.sin((i+seed)*0.6)*(hi-lo)*0.07;
    var v=Math.round((base+w)*10)/10;
    out.push(Math.max(lo,Math.min(hi,v)));
  }
  return out;
}
/* lighten a #hex toward white by amt (0..1) */
function _lighten(hex, amt){
  var n=parseInt(hex.slice(1),16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r=Math.round(r+(255-r)*amt); g=Math.round(g+(255-g)*amt); b=Math.round(b+(255-b)*amt);
  return 'rgb('+r+','+g+','+b+')';
}
/* vertical bar gradient: lighter at top → solid colour at the base */
function _barGrad(canvas, hex){
  var ctx=canvas.getContext('2d'); var g=ctx.createLinearGradient(0,12,0,150);
  g.addColorStop(0,_lighten(hex,0.30)); g.addColorStop(1,hex); return g;
}
var _DOW=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
var _MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/* slice a daily(84) + monthly(12) series for a time frame: W=1 week, M=4 weeks, 6M=6 months, Y=12 months */
function tfSeries(daily, monthly, tf, weekOffset){
  weekOffset=weekOffset||0;
  if(tf==='W'){
    var end=daily.length-7*weekOffset, start=Math.max(0,end-7);
    return { data:daily.slice(start,end), labels:_DOW.slice(0,end-start) };
  }
  if(tf==='M'){
    var d=daily.slice(-28), labs=[];
    for(var i=0;i<d.length;i++) labs.push(i%7===3?('Wk '+(Math.floor(i/7)+1)):'');   /* label the middle bar of each 7-day week so it centers under the group */
    return { data:d, labels:labs };
  }
  if(tf==='6M') return { data:monthly.slice(0,6), labels:_MON.slice(0,6) };
  return { data:monthly.slice(0,12), labels:_MON.slice(0,12) };   /* Y */
}
function _maxWeek(daily){ return Math.floor(daily.length/7)-1; }
function _weekLabel(off){ return off===0?'This week':off===1?'Last week':(off+' weeks ago'); }
/* show/disable the prev/next week controls for a chart */
function updateWeekNav(which, tf, offset, daily){
  var nav=document.getElementById(which+'-wknav'); if(!nav) return;
  nav.style.display = tf==='W' ? 'flex' : 'none';
  var lbl=document.getElementById(which+'-wklabel'); if(lbl) lbl.textContent=_weekLabel(offset);
  var prev=document.getElementById(which+'-wkprev'), next=document.getElementById(which+'-wknext');
  if(prev) prev.disabled = offset>=_maxWeek(daily);   /* further back */
  if(next) next.disabled = offset<=0;                 /* toward present */
}

var rhDaily = _gen(84,48,74,0,100,1);
var rhMonthly = _gen(12,46,76,0,100,7);

function updateRecoveryHealthChart(){
  var s = tfSeries(rhDaily, rhMonthly, currentRHTf, rhWeekOffset);
  var canvas = document.getElementById('recoveryHealthChart'); if(!canvas) return;
  var wrapper = document.getElementById('rh-scroll-wrapper');
  var containerW = wrapper ? (wrapper.clientWidth||320) : 320;
  var AXISW = 30;
  canvas.width = containerW; canvas.height = 160;
  canvas.style.width = containerW + 'px'; canvas.style.height = '160px';
  if(recoveryHealthChart){ recoveryHealthChart.destroy(); recoveryHealthChart = null; }
  recoveryHealthChart = new Chart(canvas, {
    type: 'bar',
    data: { labels: s.labels, datasets: [{ data: s.data, backgroundColor: _barGrad(canvas,'#6E9E80'), borderRadius: 6, borderWidth: 0, barPercentage: 0.62, categoryPercentage: 0.72 }] },
    options: {
      responsive: false,
      animation: { duration: 450 },
      layout: { padding: { left: AXISW } },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(c){ return 'Score: ' + c.parsed.y; } } } },
      scales: {
        y: { min: 0, max: 100, ticks: { stepSize: 25, display: false }, grid: { color: 'rgba(58,51,48,0.05)', drawTicks:false }, border: { display: false } },
        x: { ticks: { font: { size: 8 }, autoSkip: false, maxRotation: 0, color: '#8a7e76' }, grid: { display: false } }
      }
    }
  });
  drawFixedYAxis(recoveryHealthChart, 'rh-yaxis');
  updateWeekNav('rh', currentRHTf, rhWeekOffset, rhDaily);
}
function rhWeekStep(dir){ rhWeekOffset = Math.max(0, Math.min(_maxWeek(rhDaily), rhWeekOffset + dir)); updateRecoveryHealthChart(); }

function selectRHTf(tf, btn){
  currentRHTf = tf; if(tf==='W') rhWeekOffset = 0;
  document.querySelectorAll('.rh-tf').forEach(function(b){ b.classList.remove('on'); });
  btn.classList.add('on');
  updateRecoveryHealthChart();
}

/* ═══ PATTERN CHART ═══ */
var patternChart = null;
var currentPatternItem = 'urge';
var currentPatternTf = 'W', patternWeekOffset = 0;

var patternData = {
  urge:     { label:'Urge',             hex:'#D4736A', daily:_gen(84,4.1,2.4,1,5,1),  monthly:_gen(12,4.3,2.2,1,5,11) },
  pain:     { label:'Pain',             hex:'#C9A84C', daily:_gen(84,3.8,2.3,1,5,2),  monthly:_gen(12,4.0,2.1,1,5,12) },
  stress:   { label:'Stressful Events', hex:'#8B7EC8', daily:_gen(84,4.2,2.2,1,5,3),  monthly:_gen(12,4.4,2.0,1,5,13) },
  pleasant: { label:'Pleasant Events',  hex:'#4A7E5C', daily:_gen(84,1.8,3.7,1,5,4),  monthly:_gen(12,1.6,3.9,1,5,14) },
  risky:    { label:'Risky Situations', hex:'#D4612A', daily:_gen(84,4.5,2.1,1,5,5),  monthly:_gen(12,4.6,1.9,1,5,15) },
  sleep:    { label:'Sleep Quality',    hex:'#4A90D9', daily:_gen(84,2.0,3.8,1,5,6),  monthly:_gen(12,1.9,4.0,1,5,16) }
};
function patternWeekStep(dir){ patternWeekOffset = Math.max(0, Math.min(_maxWeek(patternData[currentPatternItem].daily), patternWeekOffset + dir)); updatePatternChart(); }

function updatePatternChart(){
  var item=patternData[currentPatternItem];
  var s=tfSeries(item.daily, item.monthly, currentPatternTf, patternWeekOffset);
  var _pt=document.getElementById('pattern-title'); if(_pt){ _pt.textContent=item.label; _pt.style.color=item.hex; }
  var canvas=document.getElementById('patternChart'); if(!canvas) return;
  var wrapper=document.getElementById('chart-scroll-wrapper');
  var containerW=wrapper?(wrapper.clientWidth||320):320, AXISW=30;
  canvas.width=containerW; canvas.height=160;
  canvas.style.width=containerW+'px'; canvas.style.height='160px';
  if(patternChart){patternChart.destroy();patternChart=null;}
  patternChart=new Chart(canvas,{
    type:'bar',
    data:{labels:s.labels,datasets:[{data:s.data,backgroundColor:_barGrad(canvas,item.hex),borderRadius:6,borderWidth:0,barPercentage:0.62,categoryPercentage:0.72}]},
    options:{
      responsive:false,
      animation:{duration:450},
      layout:{padding:{left:AXISW}},
      plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return 'Score: '+c.parsed.y;}}}},
      scales:{
        y:{min:1,max:5,ticks:{display:false},grid:{color:'rgba(58,51,48,0.05)',drawTicks:false},border:{display:false}},
        x:{ticks:{font:{size:8},autoSkip:false,maxRotation:0,color:'#8a7e76'},grid:{display:false}}
      }
    }
  });
  renderPatternYAxis();
  updateWeekNav('pattern', currentPatternTf, patternWeekOffset, item.daily);
}

/* Draw a chart's y-axis labels in a fixed left strip, aligned to the chart's
   real pixel positions so they stay put while the plot scrolls horizontally. */
function drawFixedYAxis(chart, elId){
  var yEl=document.getElementById(elId);
  if(!yEl||!chart||!chart.scales||!chart.scales.y) return;
  var ys=chart.scales.y, ticks=ys.ticks||[], html='';
  ticks.forEach(function(t){
    var py=Math.round(ys.getPixelForValue(t.value));
    html+='<span style="top:'+py+'px">'+t.value+'</span>';
  });
  yEl.innerHTML=html;
}
function renderPatternYAxis(){ drawFixedYAxis(patternChart, 'pattern-yaxis'); }

function selectPatternItem(key,btn){
  currentPatternItem=key;
  document.querySelectorAll('.pattern-item').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  updatePatternChart();
}

function selectPatternTf(tf,btn){
  currentPatternTf=tf; if(tf==='W') patternWeekOffset=0;
  document.querySelectorAll('.pattern-tf').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
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
  var MOBILE=640, DESIGN_W=312;
  function clamp(v,lo,hi){return Math.min(Math.max(v,lo),hi);}
  function vh(){ return (window.visualViewport && window.visualViewport.height) || window.innerHeight; }
  function apply(){
    var vw=window.innerWidth, H=vh();
    if(vw<=MOBILE){
      /* phones — fill the viewport edge to edge */
      b.classList.add('is-mobile'); b.classList.remove('is-framed'); b.classList.remove('is-desktop'); b.classList.remove('is-tablet');
      window.__deskF=null;
      var F=clamp(vw/DESIGN_W,1.22,1.62);
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

/* Returning users stay on their last screen (rh_screen / rh_ov persist) */

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
/* Fixed 7-step Daily Check-In. Order & content mirror the reference app's
   streamlined check-in (ds-step-0 … ds-step-6), rendered in OUR sage/cream
   design. Step types: 'text' (heading + textarea + voice toggle),
   'multi' (option cards), 'sliders' (group of 0–10 sliders on one page). */
var REFLECT_Q=[
  /* 0 — opening reflection, optional free-text + voice */
  {type:'text', q:'How are you, really?',
    sub:'No right answer — just be honest.',
    placeholder:'A sentence or two about how today felt… (optional)',
    starters:['Grateful','Anxious','Tired','Hopeful','Overwhelmed','Proud','Calm','Lonely']},
  /* 1 — drug use multi-select (reuse our substance list + emoji icons) */
  {type:'multi', q:'Which of these drugs have you used in the past 24 hours?', lucideIcons:true,
    icons:['beer','leaf','zap','wind','pill','sparkles','syringe','circle-check'], options:[
    'Alcohol','Cannabis (marijuana, pot, hash, K2, spice, etc.)','Stimulants (cocaine, meth, speed, ecstasy, molly, Adderall, etc.)',
    'Inhalants (nitrous, glue, petrol, paint thinner, etc.)','Sedatives or sleeping pills (Valium, Serepax, Rohypnol, etc.)',
    'Hallucinogens (LSD, acid, mushrooms, PCP, special K, etc.)','Opioids (heroin, fentanyl, oxycodone, etc.)','None — I did not use any substances']},
  /* 2 — past 24 hours: craving / risk / stress / pleasant */
  {type:'sliders', q:'Thinking about the past 24 hours…', sliders:[
    {key:'craving', label:'How strong was your greatest craving to use opioids over the past 24 hours?', lo:'No craving', hi:'Extreme craving'},
    {key:'risk', label:'How risky was the riskiest situation (people, places, or things that interfere with your recovery) you experienced over the past 24 hours?', lo:'No risk', hi:'Extreme risk'},
    {key:'stress', label:'How stressful was the biggest hassle or stressful event you experienced over the past 24 hours?', lo:'No stress', hi:'Extreme stress'},
    {key:'pleasant', label:'How pleasant was the most pleasant or positive event you experienced over the past 24 hours?', lo:'Not at all pleasant', hi:'Extremely pleasant'}
  ]},
  /* 3 — emotion strength */
  {type:'sliders', q:'Rate the strength of each of these emotions', sliders:[
    {key:'dep', label:'Depressed', lo:'Not at all', hi:'Extremely'},
    {key:'ang', label:'Angry', lo:'Not at all', hi:'Extremely'},
    {key:'anx', label:'Anxious', lo:'Not at all', hi:'Extremely'},
    {key:'rel', label:'Relaxed', lo:'Not at all', hi:'Extremely'},
    {key:'hap', label:'Happy', lo:'Not at all', hi:'Extremely'}
  ]},
  /* 4 — body: sleep & pain */
  {type:'sliders', q:'Your body, the past 24 hours', sliders:[
    {key:'sleep', label:'How well did you sleep over the past 24 hours?', lo:'Very poor', hi:'Excellent'},
    {key:'pain', label:'How painful was your most intense pain over the past 24 hours?', lo:'No pain', hi:'Worst pain'}
  ]},
  /* 5 — next week: motivation & confidence */
  {type:'sliders', q:'Thinking about the next week…', sliders:[
    {key:'motivation', label:'How motivated are you to avoid using opioids for non-medical reasons within the next week?', lo:'Not motivated', hi:'Extremely motivated'},
    {key:'confidence', label:'How confident are you in your ability to avoid using opioids for non-medical reasons within the next week?', lo:'Not confident', hi:'Extremely confident'}
  ]},
  /* 6 — medication taken (single-choice, reuse our option-card style) */
  {type:'multi', single:true, q:'Have you taken your medication today?', lucideIcons:true,
    icons:['circle-check','clock'], options:['Yes — I’ve taken it today','Not yet']}
];
var REFLECT_TOTAL=REFLECT_Q.length;   /* 7 */
var reflectStep=0, reflectAnswers={}, reflectVoiceMode=false;
function openReflect(){ reflectStep=0; reflectAnswers={}; reflectVoiceMode=false;
  renderReflect(); openOv('reflect'); }
function reflectNext(){ if(reflectStep<REFLECT_TOTAL){ reflectStep++; renderReflect(); } }   /* REFLECT_TOTAL = completion screen */
function reflectBack(){ if(reflectStep<=0){ closeOv(); return; } reflectStep--; renderReflect(); }
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function reflectAns(){ return reflectAnswers[reflectStep]||(reflectAnswers[reflectStep]={}); }
function reflectText(el){ reflectAns().text=el.value; }
function reflectStarter(w){
  var ta=document.querySelector('#rf-type-cap .rf-textarea'); if(!ta) return;
  var stub='I felt '+String(w).toLowerCase()+' today because ';
  ta.value=stub; reflectAns().text=stub; ta.focus();
  try{ ta.setSelectionRange(stub.length, stub.length); }catch(e){}
}
function reflectToggleOpt(btn,i){
  var a=reflectAns(); var item=REFLECT_Q[reflectStep];
  if(item.single){
    a.selected=[i];
    var p=btn.parentElement;
    if(p) p.querySelectorAll('.reflect-opt').forEach(function(b){ b.classList.remove('opt-sel'); });
    btn.classList.add('opt-sel');
    var fb=document.getElementById('rf-finish'); if(fb) fb.disabled=false;   /* enable Finish once a choice is made */
    return;
  }
  var sel=a.selected||(a.selected=[]); var idx=sel.indexOf(i);
  if(idx>=0){ sel.splice(idx,1); btn.classList.remove('opt-sel'); }
  else{ sel.push(i); btn.classList.add('opt-sel'); }
}
function reflectSlider(key,v){
  var a=reflectAns(); a.sliders=a.sliders||{}; a.sliders[key]=+v;
  var el=document.getElementById('rf-sv-'+key); if(el) el.textContent=v;
}
/* Voice toggle: switch between typing and the live listening waveform (no mic orb). */
function reflectToggleVoice(){
  reflectVoiceMode=!reflectVoiceMode;
  var b=document.getElementById('rf-voice-btn');
  if(b){ b.classList.toggle('rf-voice-on', reflectVoiceMode);
    var lbl=b.querySelector('.rf-vt-label'); if(lbl) lbl.textContent=reflectVoiceMode?'Voice on':'Speak'; }
  var tc=document.getElementById('rf-type-cap'), vc=document.getElementById('rf-voice-cap');
  if(tc) tc.style.display=reflectVoiceMode?'none':'block';
  if(vc) vc.style.display=reflectVoiceMode?'block':'none';
  if(reflectVoiceMode) rfStartListening(); else rfStopListening();
}
function rfStartListening(){
  var st=document.getElementById('rf-vr-status'); var s=0;
  if(st) st.textContent='Listening… 0:00';
  if(window._rfVrTimer) clearInterval(window._rfVrTimer);
  window._rfVrTimer=setInterval(function(){ s++; if(st) st.textContent='Listening… 0:'+(s<10?'0':'')+s; },1000);
}
function rfStopListening(){
  if(window._rfVrTimer){ clearInterval(window._rfVrTimer); window._rfVrTimer=null; }
  var stub='Today was hard but I made it through.';   /* stubbed transcription drops into the textarea */
  reflectAns().text=stub;
  var ta=document.querySelector('#rf-type-cap .rf-textarea'); if(ta) ta.value=stub;
}
/* voice waveform bars (blue left → orange right); the strip scrolls right→left while listening */
function rfWaveBars(){
  var h=[22,38,55,32,68,46,26,58,78,44,64,84,52,72,92,74,54,82,62,42,78,56,28,48,66,34,52,38,22,44], s='';
  for(var i=0;i<h.length;i++){ s+='<span class="rf-bar '+(i<h.length/2?'rf-bar-l':'rf-bar-r')+'" style="height:'+h[i]+'%;animation-delay:'+(i*0.045).toFixed(2)+'s"></span>'; }
  return s;
}
function renderReflect(){
  if(window._rfVrTimer){ clearInterval(window._rfVrTimer); window._rfVrTimer=null; }   /* stop any listening timer before re-render */
  var body=document.getElementById('reflect-body');
  var foot=document.getElementById('reflect-footer');
  body.classList.toggle('rf-body-center', reflectStep>=REFLECT_TOTAL);   /* center the celebration */
  var _ov=document.getElementById('ov-reflect'); if(_ov) _ov.classList.toggle('rf-modal', reflectStep>=REFLECT_TOTAL);   /* dim backdrop = modal */
  if(reflectStep>=REFLECT_TOTAL){   /* ═══ completion screen (modal) ═══ */
    body.innerHTML=
      '<div class="rf-complete">'+
        '<div class="rf-yg">'+
          '<div class="rf-yg-ribbon">🎉 You got!</div>'+
          '<div class="rf-yg-title">Check-in complete!</div>'+
          '<div class="rf-yg-tiles">'+
            '<div class="rf-yg-tile"><div class="rf-yg-ic rf-yg-ic-gold"><i data-lucide="sparkles"></i></div><div class="rf-yg-amt" style="color:#B98A2E">+20</div><div class="rf-yg-lbl">Check-in</div></div>'+
            '<div class="rf-yg-tile"><div class="rf-yg-ic rf-yg-ic-sage"><i data-lucide="gift"></i></div><div class="rf-yg-amt" style="color:#5E8560">+50</div><div class="rf-yg-lbl">Bonus</div></div>'+
            '<div class="rf-yg-tile"><div class="rf-yg-ic rf-yg-ic-coral"><i data-lucide="flame"></i></div><div class="rf-yg-amt" style="color:#C25445">+1</div><div class="rf-yg-lbl">Streak</div></div>'+
          '</div>'+
          '<button class="rf-yg-confirm" onclick="reflectDone()">Confirm · 70 XP</button>'+
        '</div>'+
      '</div>';
    foot.innerHTML='';
    if(window.lucide && lucide.createIcons) lucide.createIcons();
    return;
  }
  var n=reflectStep, item=REFLECT_Q[n], total=REFLECT_TOTAL;
  var pct=Math.round((n+1)/total*100), inner='';
  var a=reflectAnswers[n]||{};
  if(item.type==='text'){
    var txt=a.text||'';
    inner='<div class="rf-card rf-textcard" style="margin-top:6px">'+
        '<div class="rf-tc-head">'+
          '<span class="rf-tc-k">In your own words</span>'+
          '<button id="rf-voice-btn" class="rf-voice-toggle'+(reflectVoiceMode?' rf-voice-on':'')+'" onclick="reflectToggleVoice()">'+
            '<span class="rf-vt-ic"><i data-lucide="mic"></i></span><span class="rf-vt-label">'+(reflectVoiceMode?'Type':'Speak')+'</span></button>'+
        '</div>'+
        '<div id="rf-type-cap" style="display:'+(reflectVoiceMode?'none':'block')+'">'+
          '<textarea class="rf-textarea" oninput="reflectText(this)" placeholder="'+esc(item.placeholder||'')+'">'+esc(txt)+'</textarea>'+
          (item.starters?'<div class="rf-starter-lbl">Not sure where to start? Tap a feeling</div>'+
            '<div class="rf-starters">'+item.starters.map(function(w){return '<button type="button" class="rf-starter" onclick="reflectStarter(\''+jsStr(w)+'\')">'+esc(w)+'</button>';}).join('')+'</div>':'')+
        '</div>'+
        '<div id="rf-voice-cap" class="rf-voice-cap" style="display:'+(reflectVoiceMode?'block':'none')+'">'+
          '<div class="rf-wave" aria-hidden="true"><div class="rf-wave-track">'+rfWaveBars()+rfWaveBars()+'</div></div>'+
          '<div class="rf-vr-status" id="rf-vr-status">Listening…</div>'+
        '</div>'+
      '</div>';
  } else if(item.type==='multi'){
    var sel=a.selected||[]; var icons=item.icons||[]; var lu=item.lucideIcons;
    inner='<div class="reflect-opts">'+item.options.map(function(o,i){
      var ic=lu?'<i data-lucide="'+(icons[i]||'circle')+'"></i>':(icons[i]||'•');
      return '<button class="reflect-opt'+(sel.indexOf(i)>=0?' opt-sel':'')+'" onclick="reflectToggleOpt(this,'+i+')">'+
        '<span class="ro-ic">'+ic+'</span><span class="ro-txt">'+esc(o)+'</span></button>';
    }).join('')+'</div>';
  } else if(item.type==='sliders'){
    var vals=a.sliders||{};
    inner='<div class="rf-sliders">'+item.sliders.map(function(s){
      var v=vals[s.key]!=null?vals[s.key]:5;
      return '<div class="rf-card rf-scard">'+
        '<div class="rf-srow-label">'+esc(s.label)+'</div>'+
        '<div id="rf-sv-'+s.key+'" class="rf-srow-num">'+v+'</div>'+
        '<div class="rf-srow-track"><span class="rf-srow-end">0</span>'+
          '<input type="range" min="0" max="10" value="'+v+'" class="reflect-range" oninput="reflectSlider(\''+s.key+'\',this.value)">'+
          '<span class="rf-srow-end">10</span></div>'+
        '<div class="rf-srow-ends"><span>'+esc(s.lo)+'</span><span>'+esc(s.hi)+'</span></div>'+
      '</div>';
    }).join('')+'</div>';
  }
  body.innerHTML=
    '<div class="onb-top"><button class="onb-back" type="button" onclick="reflectBack()" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>'+
      '<div class="onb-steps"><div class="onb-steps-fill" style="width:'+pct+'%"></div></div>'+
      '<div class="onb-count">'+(n+1)+'<span>/'+total+'</span></div></div>'+
    '<h2 class="reflect-q">'+esc(item.q)+'</h2>'+
    (item.sub?'<div class="reflect-qsub">'+esc(item.sub)+'</div>':'')+
    inner;
  if(n===total-1){
    var msel=(a.selected&&a.selected.length)?'':' disabled';
    foot.innerHTML='<button id="rf-finish" class="rf-btn rf-primary rf-full" onclick="reflectNext()"'+msel+'>Finish · +70 XP 🎉</button>';
  } else {
    foot.innerHTML='<button class="rf-btn rf-primary rf-full" onclick="reflectNext()">'+(n===0?'Continue':'Next')+' →</button>';
  }
  if(window.lucide && lucide.createIcons) lucide.createIcons();   /* render any data-lucide icons in the step */
  if(item && item.type==='text' && reflectVoiceMode) rfStartListening();   /* resume listening if voice mode is on */
}
function reflectDone(){
  closeOv();
  var check=document.getElementById('checkin-check'), time=document.getElementById('checkin-time');
  if(check){ check.style.display='block'; }
  if(time){ time.textContent='Today ✓'; time.style.color='var(--hb-teal)'; }
  updateTodayProgress();
  if(typeof showXPPopup==='function') showXPPopup(70);
}

/* ═══════════════════════════════════════════════════════════
   FIND RELIEF — urge surfing / grounding / breathing / game
   + the "Having an urge right now?" toolkit. Ported from the
   reference app, restyled into our sage/cream system.
   ═══════════════════════════════════════════════════════════ */

/* small inline toast fallback (reference used toast()) */
function rlToast(msg){
  try{
    var t=document.createElement('div');
    t.className='rl-toast';
    t.innerHTML='<span class="rl-toast-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span class="rl-toast-tx"></span>';
    t.querySelector('.rl-toast-tx').textContent=msg;
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); },340); },2400);
  }catch(e){}
}

/* completing any relief exercise: close, award XP, gentle confirm */
function reliefDone(label){
  if(typeof stopBreath==='function') stopBreath();
  closeOv();
  if(typeof showXPPopup==='function') showXPPopup(20);
  else rlToast((label||'Exercise')+' complete — well done 🌿');
}

/* open the urge toolkit: populate "why", relief actions and contacts */
function openUrge(){
  var why=document.getElementById('urge-why');
  if(why){ var w=(window.__profile&&window.__profile.why)||''; why.textContent = w ? 'Remember: '+w : ''; }
  var acts=document.getElementById('urge-acts');
  if(acts){
    acts.innerHTML = RH_PF.activities.slice(0,4).map(function(a){
      return '<div class="rl-act" onclick="urgeAct(\''+jsStr(a)+'\')"><div class="rl-act-ic"><i data-lucide="'+actLucide(a)+'"></i></div><div class="rl-act-lb">'+esc(a)+'</div></div>';
    }).join('') || '<div class="rl-act-empty">Add relief activities in your profile to see them here.</div>';
  }
  var contacts=document.getElementById('urge-contacts');
  if(contacts) contacts.innerHTML = contactsHTML();
  openOv('urge');
  startUrgeBreath();
  if(window.lucide && lucide.createIcons) lucide.createIcons();
}
function urgeAct(a){ rlToast('Nice — '+String(a).toLowerCase()+'. Stay with it.'); }
/* Urge page breathe ring — same 4-7-8 cycle as the breathing screen (fill/hold/empty + phase text) */
var urgeBreathTimer=null;
function startUrgeBreath(){
  stopUrgeBreath();
  var ring=document.querySelector('#ov-urge .rl-urge-ring'); if(!ring) return;
  var fg=ring.querySelector('.ru-ring-fg'), span=ring.querySelector('span');
  var reduce=false; try{ reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  if(reduce){ if(fg) fg.style.strokeDashoffset='72'; if(span) span.textContent='Breathe'; return; }
  var seq=[['Breathe in',4000,0,'1.06'],['Hold',7000,0,'1.06'],['Breathe out',8000,289,'.9']];
  var i=0;
  function run(){ var s=seq[i%3];
    if(span) span.textContent=s[0];
    if(fg){ fg.style.transition='stroke-dashoffset '+(s[1]/1000)+'s '+(i%3===1?'linear':'ease-in-out'); fg.style.strokeDashoffset=s[2]; }
    ring.style.transition='transform '+(s[1]/1000)+'s ease-in-out'; ring.style.transform='scale('+s[3]+')';
    i++; urgeBreathTimer=setTimeout(run,s[1]);
  }
  run();
}
function stopUrgeBreath(){ if(urgeBreathTimer){ clearTimeout(urgeBreathTimer); urgeBreathTimer=null; } }
/* open a relief tool from the urge page (drop the urge overlay so the tool shows on top) */
function urgeTool(id){ var u=document.getElementById('ov-urge'); if(u){ u.classList.remove('active'); u.style.zoom=''; } stopUrgeBreath(); openOv(id); if(window.lucide&&lucide.createIcons) lucide.createIcons(); }
/* finished riding out the urge */
function urgeDone(){ closeOv(); if(typeof showXPPopup==='function') showXPPopup(30); rlToast('You rode it out — that took real strength.'); }
/* Simulated Emergency 911 call screen */
var call911Timer=null;
function call911Open(){
  openOv('call911');
  var st=document.getElementById('call911-status');
  if(st) st.textContent='connecting…';
  if(call911Timer){ clearInterval(call911Timer); call911Timer=null; }
  setTimeout(function(){
    var ov=document.getElementById('ov-call911'); if(!ov||!ov.classList.contains('active')) return;
    var n=0; if(st) st.textContent='connected · 00:00';
    call911Timer=setInterval(function(){
      n++; var m=Math.floor(n/60), s=n%60;
      if(st) st.textContent='connected · '+(m<10?'0'+m:m)+':'+(s<10?'0'+s:s);
    },1000);
  },1300);
  if(window.lucide&&lucide.createIcons) lucide.createIcons();
}
function endCall911(){ if(call911Timer){ clearInterval(call911Timer); call911Timer=null; } closeOv(); }

/* ═══ Distraction mini-game: tap 1→9 in order, track best time ═══ */
var rlGameNext=1, rlGameStart=0, rlGameBest=null;
function gameInit(){
  var nums=[1,2,3,4,5,6,7,8,9];
  for(var i=nums.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=nums[i]; nums[i]=nums[j]; nums[j]=t; }
  var colors=['#9C8FC4','#8A6FB0','#B3A6D6','#7A6AA8','#8A6FB0','#C0B5DF','#9C8FC4','#8A6FB0','#B3A6D6'];
  var g=document.getElementById('game-grid'); if(!g) return;
  g.innerHTML=nums.map(function(n,i){
    return '<button class="game-cell" data-n="'+n+'" onclick="gameTap('+n+',this)" style="background:'+colors[i%colors.length]+'">'+n+'</button>';
  }).join('');
  rlGameNext=1; rlGameStart=0;
  var nx=document.getElementById('game-next'); if(nx) nx.textContent='1';
}
function gameTap(n,el){
  if(n!==rlGameNext){
    if(el&&el.animate) el.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:200});
    return;
  }
  if(rlGameNext===1) rlGameStart=Date.now();
  if(el) el.style.visibility='hidden';
  rlGameNext++;
  var nx=document.getElementById('game-next'); if(nx) nx.textContent=rlGameNext<=9?rlGameNext:'✓';
  if(rlGameNext>9){
    var secs=((Date.now()-rlGameStart)/1000).toFixed(1);
    if(rlGameBest===null || +secs<rlGameBest) rlGameBest=+secs;
    var bb=document.getElementById('game-best'); if(bb) bb.textContent=rlGameBest+'s';
    rlToast('Done in '+secs+'s · Mind busy, craving quiet');
    setTimeout(gameInit,900);
  }
}

/* ═══ 4-7-8 breathing cycle — animate #breath-orb + #breath-phase ═══ */
var breathTimer=null;
function startBreath(){
  stopBreath();
  /* phase: [orb label, caption, ms, orb transform, ring stroke-dashoffset (0=full ring, 578=empty)] */
  var phases=[
    ['Breathe in','Inhale through your nose · 4',4000,'scale(1.12)',0],
    ['Hold','Hold · 7',7000,'scale(1.12)',0],
    ['Breathe out','Exhale slowly · 8',8000,'scale(.78)',578]
  ];
  var i=0;
  function run(){
    var p=phases[i%3];
    var orb=document.getElementById('breath-orb'), ph=document.getElementById('breath-phase'), ring=document.getElementById('breath-ring');
    if(!orb||!ph){ stopBreath(); return; }
    orb.textContent=p[0].toUpperCase();
    ph.textContent=p[1];
    orb.style.transition='transform '+(p[2]/1000)+'s ease-in-out';
    orb.style.transform=p[3];
    if(ring){ ring.style.transition='stroke-dashoffset '+(p[2]/1000)+'s '+(i%3===1?'linear':'ease-in-out'); ring.style.strokeDashoffset=p[4]; }
    i++;
    breathTimer=setTimeout(run,p[2]);
  }
  run();
}
function stopBreath(){ if(breathTimer){ clearTimeout(breathTimer); breathTimer=null; } }

/* ═══ Recovery Health — segmented fan gauge ═══ */
function buildHealthGauge(){
  var el=document.getElementById('healthGauge'); if(!el) return;
  if(el.querySelector('.speedo')) return;        /* build once */
  var val=74;
  var cx=150, cy=158, r=112, sw=22;
  function pt(deg){ var a=deg*Math.PI/180; return [(cx+r*Math.cos(a)).toFixed(1),(cy-r*Math.sin(a)).toFixed(1)]; }
  function arc(d1,d2,col){ var p1=pt(d1),p2=pt(d2);
    return '<path d="M'+p1[0]+','+p1[1]+' A'+r+','+r+' 0 0 1 '+p2[0]+','+p2[1]+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round"/>'; }
  var s='<svg class="speedo" viewBox="0 0 300 192" xmlns="http://www.w3.org/2000/svg">';
  s+=arc(180,144,'#D98279')+arc(144,108,'#E5A05F')+arc(108,72,'#E8C76A')+arc(72,36,'#AECB96')+arc(36,0,'#84B27F');
  s+='<text x="12" y="185" font-size="13" font-weight="600" fill="#C56A5E">Needs care</text>';
  s+='<text x="288" y="185" text-anchor="end" font-size="13" font-weight="600" fill="#5E8B6E">Thriving</text>';
  var th=(180-(val/100)*180)*Math.PI/180, L=84, bw=6;
  var tx=(cx+L*Math.cos(th)).toFixed(1), ty=(cy-L*Math.sin(th)).toFixed(1);
  var sinT=Math.sin(th), cosT=Math.cos(th);
  var b1x=(cx+sinT*bw).toFixed(1), b1y=(cy+cosT*bw).toFixed(1);
  var b2x=(cx-sinT*bw).toFixed(1), b2y=(cy-cosT*bw).toFixed(1);
  var reduce=false; try{ reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  var needle='<polygon points="'+b1x+','+b1y+' '+tx+','+ty+' '+b2x+','+b2y+'" fill="#2A2421"/>';
  if(reduce){ s+=needle; }
  else {
    /* sweep the needle from 0 (leftmost) up to the value */
    var startA=(-(val/100)*180).toFixed(1);
    s+='<g>'+needle+'<animateTransform attributeName="transform" type="rotate" from="'+startA+' '+cx+' '+cy+'" to="0 '+cx+' '+cy+'" dur="1.2s" begin="0s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.3 0.9 0.35 1"/></g>';
  }
  s+='<circle cx="'+cx+'" cy="'+cy+'" r="11" fill="#2A2421"/><circle cx="'+cx+'" cy="'+cy+'" r="4" fill="#fff"/>';
  s+='</svg>';
  el.insertAdjacentHTML('afterbegin', s);
  var card=el.closest('.gauge-card')||document;
  var num=card.querySelector('.rh-num b');
  if(num){ if(reduce){ num.textContent=val; } else { num.textContent='0'; rhCountUp(num, val, 1200); } }
  var pill=card.querySelector('.rh-pill'); if(pill) pill.textContent = val>=85?'Excellent':val>=70?'Above Average':val>=55?'Good':'Needs Care';
}
/* reusable arc gauge (0–100) with an animated needle — used by the Insights screen */
function buildArcGauge(elId, val){
  var el=document.getElementById(elId); if(!el || el.querySelector('.speedo')) return;
  var cx=150, cy=158, r=112, sw=22;
  function pt(deg){ var a=deg*Math.PI/180; return [(cx+r*Math.cos(a)).toFixed(1),(cy-r*Math.sin(a)).toFixed(1)]; }
  function arc(d1,d2,col){ var p1=pt(d1),p2=pt(d2); return '<path d="M'+p1[0]+','+p1[1]+' A'+r+','+r+' 0 0 1 '+p2[0]+','+p2[1]+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round"/>'; }
  var s='<svg class="speedo" viewBox="0 0 300 192" xmlns="http://www.w3.org/2000/svg">';
  s+=arc(180,144,'#D98279')+arc(144,108,'#E5A05F')+arc(108,72,'#E8C76A')+arc(72,36,'#AECB96')+arc(36,0,'#84B27F');
  s+='<text x="12" y="185" font-size="13" font-weight="600" fill="#C56A5E">Needs care</text>';
  s+='<text x="288" y="185" text-anchor="end" font-size="13" font-weight="600" fill="#5E8B6E">Thriving</text>';
  var th=(180-(val/100)*180)*Math.PI/180, L=84, bw=6;
  var tx=(cx+L*Math.cos(th)).toFixed(1), ty=(cy-L*Math.sin(th)).toFixed(1);
  var sinT=Math.sin(th), cosT=Math.cos(th);
  var needle='<polygon points="'+(cx+sinT*bw).toFixed(1)+','+(cy+cosT*bw).toFixed(1)+' '+tx+','+ty+' '+(cx-sinT*bw).toFixed(1)+','+(cy-cosT*bw).toFixed(1)+'" fill="#2A2421"/>';
  var reduce=false; try{ reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  if(reduce){ s+=needle; }
  else { var startA=(-(val/100)*180).toFixed(1); s+='<g>'+needle+'<animateTransform attributeName="transform" type="rotate" from="'+startA+' '+cx+' '+cy+'" to="0 '+cx+' '+cy+'" dur="1.1s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.3 0.9 0.35 1"/></g>'; }
  s+='<circle cx="'+cx+'" cy="'+cy+'" r="11" fill="#2A2421"/><circle cx="'+cx+'" cy="'+cy+'" r="4" fill="#fff"/></svg>';
  el.insertAdjacentHTML('afterbegin', s);
  var numEl=document.getElementById('insightsGaugeNum');
  if(numEl){ if(reduce){ numEl.textContent=val; } else { numEl.textContent='0'; rhCountUp(numEl, val, 1100); } }
}
/* Insights: mark the daily insight reviewed → award XP and close */
function markInsightReviewed(){ if(typeof showXPPopup==='function') showXPPopup(20); closeOv(); }
/* Insights: recommended-activity completion, driven from the detail page */
function updateRecCount(){
  var grid=document.querySelector('.ins-rec-grid'); if(!grid) return;
  var total=grid.querySelectorAll('.ins-rec-card').length;
  var done=grid.querySelectorAll('.ins-rec-card.is-done').length;
  var el=document.querySelector('.ins-rec-prog'); if(el) el.textContent=done+' of '+total+' done';
}
/* reflect saved completion state on the recommended cards (called when Insights opens) */
function applyRecState(){
  /* relief activity */
  var reliefDone=false; try{ reliefDone=localStorage.getItem('rh_relief_done')==='1'; }catch(e){}
  var rc=document.getElementById('rec-relief'); if(rc) rc.classList.toggle('is-done', reliefDone);
  var rb=document.getElementById('rd-done-btn');
  if(rb){ if(reliefDone){ rb.textContent='Completed ✓'; rb.disabled=true; rb.classList.add('is-done'); }
          else { rb.textContent='Mark as done · +20 pts'; rb.disabled=false; rb.classList.remove('is-done'); } }
  /* if-then plan */
  var iftDone=false; try{ iftDone=localStorage.getItem('rh_ifthen_done')==='1'; }catch(e){}
  var ic=document.getElementById('rec-ifthen'); if(ic) ic.classList.toggle('is-done', iftDone);
  var ib=document.getElementById('ift-save-btn');
  if(ib){ if(iftDone){ ib.textContent='Saved ✓'; ib.disabled=true; ib.classList.add('is-done'); }
          else { ib.textContent='Save my if-then plan · +20 pts'; ib.classList.remove('is-done'); iftSync(); } }
  /* encourage someone in community */
  var commDone=false; try{ commDone=localStorage.getItem('rh_community_done')==='1'; }catch(e){}
  var cc=document.getElementById('rec-community'); if(cc) cc.classList.toggle('is-done', commDone);
  /* three good things */
  var tgDone=false; try{ tgDone=localStorage.getItem('rh_threegood_done')==='1'; }catch(e){}
  var tc=document.getElementById('rec-threegood'); if(tc) tc.classList.toggle('is-done', tgDone);
  var tb=document.getElementById('tg-save-btn');
  if(tb){ if(tgDone){ tb.textContent='Saved ✓'; tb.disabled=true; tb.classList.add('is-done'); }
          else { tb.textContent='Save my three good things · +15 pts'; tb.classList.remove('is-done'); tgSync(); } }
  updateRecCount();
}
/* three good things: enable Save once all three are filled */
function tgSync(){
  var a=document.getElementById('tg1'), b=document.getElementById('tg2'), c=document.getElementById('tg3');
  var ready=a&&b&&c&&a.value.trim()&&b.value.trim()&&c.value.trim();
  var btn=document.getElementById('tg-save-btn');
  if(btn && !btn.classList.contains('is-done')) btn.disabled=!ready;
}
/* user taps "Save my three good things" */
function markThreeGoodDone(){
  var already=false; try{ already=localStorage.getItem('rh_threegood_done')==='1'; }catch(e){}
  try{ localStorage.setItem('rh_threegood_done','1'); }catch(e){}
  applyRecState();
  if(!already && typeof showXPPopup==='function') showXPPopup(15);
  var d=document.getElementById('ov-threegood-detail'); if(d) d.classList.remove('active');
}
/* ===== Community feed (Connect) interactions ===== */
/* composer: single-select a circle chip */
function cmPick(btn){
  var g=btn.parentElement; if(g) g.querySelectorAll('.cm-chip').forEach(function(c){ c.classList.remove('sel'); });
  btn.classList.add('sel');
}
/* filter the feed by circle */
function cmTab(btn,key){
  var tabs=btn.parentElement; if(tabs) tabs.querySelectorAll('.cm-tab').forEach(function(t){ t.classList.remove('on'); });
  btn.classList.add('on');
  document.querySelectorAll('#ov-connect .cm-post').forEach(function(p){
    p.style.display=(key==='all'||p.getAttribute('data-circle')===key)?'':'none';
  });
}
/* toggle support (heart) on a post */
function cmSupport(btn){
  var n=btn.querySelector('.cm-act-n'); if(!n) return;
  var v=parseInt(n.textContent,10)||0;
  if(btn.classList.toggle('on')){ n.textContent=v+1; } else { n.textContent=Math.max(0,v-1); }
}
/* enable Share only when there's something to post */
function cmComposeSync(){
  var t=document.getElementById('cm-text'), b=document.getElementById('cm-share-btn');
  if(t&&b) b.disabled=!t.value.trim();
}
/* post a new conversation from the composer */
function cmShare(){
  var t=document.getElementById('cm-text'); if(!t) return;
  if(!t.value.trim()) return;
  t.value=''; cmComposeSync();
  if(typeof showXPPopup==='function') showXPPopup(20);
}
/* toggle follow on a post */
function cmFollow(btn){
  var lbl=btn.querySelector('.cm-act-lbl');
  if(btn.classList.toggle('following')){ if(lbl) lbl.textContent='Following'; }
  else { if(lbl) lbl.textContent='Follow'; }
}
/* ============ GUIDED ACTIVITY PLAYER (Activities screen) ============
   Content adapted from the RudraHealth clinician-designed micro-interventions. */
var ACTS={
  crave:{name:'Managing Cravings',icon:'life-buoy',mins:4,pts:20,ac:'#4E7FA8',tint:'#E3EDF6',sub:'Surf the urge until it passes',
    why:'A craving is a brain signal, not a command — it builds, peaks within about 15–20 minutes, and fades whether or not you act on it. This 5-D sequence (Delay · Distance · Distract · Dial · Decide) buys time, and time is what dissolves a craving.',
    steps:[
      ['Name it and rate it','Say it plainly: “I’m having a craving.” Rate it 1–10. Naming it moves it from the driver’s seat to the passenger seat — you’re observing it now, not obeying it.'],
      ['Delay — set a 15-minute deal','You don’t have to promise forever, just 15 minutes. Tell yourself “I can revisit this in 15 minutes” and set an actual timer. Almost every craving loses its grip inside that window.'],
      ['Distance — change your surroundings','Leave the room, step outside, put physical space between you and the cue. Cravings feed on cues; starve this one.'],
      ['Distract — give your hands and mind a job','Splash cold water on your face, do 10 slow squats, play the number game, make tea. Strong sensation + simple task = the craving loses your attention.'],
      ['Dial — reach one person','Text or call someone from your support list, even just: “Rough moment, riding it out.” Saying it out loud cuts a craving’s intensity more than almost anything else.'],
      ['Decide and review','When the timer ends, re-rate it 1–10. Notice it dropped — that’s proof, not luck. Jot one line about what triggered it; every craving you outlast makes the next one weaker.']
    ]},
  stress:{name:'Coping with Stressors',icon:'heart-pulse',mins:5,pts:20,ac:'#B5893E',tint:'#FBF0D3',sub:"Calm your body's stress response",
    why:'Stress is the most common relapse trigger there is — not because stress itself is dangerous, but because a stressed body screams for fast relief. This sequence calms the body first, then sorts what you can control from what you can’t, and ends with one small doable step.',
    steps:[
      ['Calm the body first — two sighs','Breathe in through the nose, then a second short sip of air on top, then a long slow exhale through the mouth. Do it twice. This “physiological sigh” is the fastest known way to lower the body’s alarm.'],
      ['Name the stressor — one sentence','“The thing stressing me right now is …” Be specific: not “everything,” but “rent is due Friday.” Vague stress feels infinite; named stress has edges.'],
      ['Sort it — my hands or not my hands?','Draw the line: what part can I actually influence, and what part is out of my control? Energy spent on the second pile is stolen from the first.'],
      ['Take one small step','Not the whole problem — one 10-minute step: send the email, make the call, ask for the extension. Action, however small, is the antidote to the helpless feeling stress feeds on.'],
      ['Release the rest — unclench on purpose','Squeeze your shoulders up to your ears for 5 seconds, then drop them. Fists tight, then open. Tell the uncontrollable pile: “not mine to carry tonight.”'],
      ['Close with kindness','One sentence to yourself, the way you’d talk to a friend: “This is hard, and I’m handling it without using. That counts.”']
    ]},
  breathe:{name:'Mindful Breathing',icon:'wind',mins:1,pts:15,ac:'#5E8B6E',tint:'#E7F0EA',sub:'One quiet minute to reset',
    why:'Slow, extended exhales activate your parasympathetic nervous system — the body’s natural brake. In under a minute this quiets the stress response that cravings ride on.',
    steps:[
      ['Get comfortable','Sit or stand somewhere you can be still for one minute. Soften your shoulders and let your jaw unclench.'],
      ['Breathe in — 4 counts','Inhale slowly through your nose for a count of four. Let your belly, not your chest, do the work.'],
      ['Hold — 2 counts','A gentle pause at the top. Nothing forced.'],
      ['Breathe out — 6 counts','Exhale slowly through your mouth for six. The long exhale is where the calm happens.'],
      ['Repeat × 5','Five more rounds. If your mind wanders — that’s normal — just return to the count.']
    ]},
  map:{name:'Trigger Mapping',icon:'map',mins:6,pts:20,ac:'#8A6DAF',tint:'#EDE8F4',sub:'Know your cues before they hit',
    why:'Cravings rarely come out of nowhere — they follow a chain: trigger → thought → feeling → urge. Mapping the chain while you’re calm makes it far easier to interrupt when it’s live. This is the heart of CBT for substance use.',
    steps:[
      ['Pick one recent urge','Think of the last time a craving showed up. Just one moment — recent and specific.'],
      ['Name the trigger','Where were you? Who was there? What time was it? (Evenings and stress are two of the most common.)'],
      ['Catch the thought','What went through your mind right before the urge? “Just once won’t hurt” and “I can’t handle this feeling” are the classics.'],
      ['Name the feeling','Under the thought there’s usually a feeling — bored, lonely, anxious, in pain. Naming it takes away some of its power.'],
      ['Plan your exit','Finish this sentence: “Next time that trigger shows up, I will…” — text someone, leave the room, breathe, open this app. Deciding now makes the moment easier.']
    ]},
  surf:{name:'Urge Surfing',icon:'waves',mins:3,pts:20,ac:'#C0748A',tint:'#F6E4E7',sub:"Ride the wave — don't fight it",
    why:'An urge behaves like a wave: it rises, crests, and — if you don’t feed it — falls, usually within 15–20 minutes. Fighting it or obeying it both make it stronger next time. Riding it teaches your brain that urges pass on their own.',
    steps:[
      ['Notice it without judgment','Say to yourself: “An urge is here.” Not “I’m weak” — just a wave arriving. You are the surfer, not the wave.'],
      ['Find it in your body','Where do you feel it — chest, stomach, hands, jaw? Get curious about it like a scientist.'],
      ['Breathe into that spot','Slow breaths, aimed right at the sensation. Notice how it shifts, pulses, changes shape.'],
      ['Watch it crest','Rate it 1–10 every minute or so. Watch the number climb… then — always — begin to fall.'],
      ['Ride it down','Stay with it until it drops. Every wave you ride makes the next one smaller. That’s not a metaphor — it’s how the brain relearns.']
    ]},
  sleep:{name:'Sleep Hygiene',icon:'moon',mins:5,pts:20,ac:'#5A7A9A',tint:'#E7ECF2',sub:'Set yourself up for real rest',
    why:'Poor sleep is one of the strongest next-day predictors of craving intensity — a tired brain reaches for fast relief. Building a steady wind-down routine protects tomorrow’s recovery tonight.',
    steps:[
      ['Set a screens-down time','Pick a time 30–60 minutes before bed when the phone goes face-down. Blue light and doom-scrolling both delay sleep.'],
      ['Dim and cool the room','Lower the lights, crack a window or set the thermostat cooler. Your body reads darkness and cool as “sleep now.”'],
      ['Do one quiet thing','Warm shower, herbal tea, a few pages of a book, or the 4-7-8 breath. The same thing nightly — routine is the signal.'],
      ['Park tomorrow’s worries','Keep paper by the bed. If your mind starts listing problems, write them down — they’ll keep until morning.'],
      ['Same wake time, every day','Even after a rough night. A steady wake time is the single most powerful lever for better sleep.']
    ]}
};
function actDone(id){ try{ return localStorage.getItem('rh_act_'+id)==='1'; }catch(e){ return false; } }
/* open the guided player for an activity */
function openActivity(id){
  var a=ACTS[id]; if(!a) return;
  try{ localStorage.setItem('rh_act_current', id); }catch(e){}
  var done=actDone(id);
  function set(el,fn){ var n=document.getElementById(el); if(n) fn(n); }
  set('act-title',function(n){ n.textContent=a.name; });
  set('act-name', function(n){ n.textContent=a.name; });
  set('act-sub',  function(n){ n.textContent=a.sub; });
  set('act-ic',   function(n){ n.style.background=a.ac; n.style.color='#fff'; n.innerHTML='<i data-lucide="'+a.icon+'"></i>'; });
  set('act-earn', function(n){ n.textContent=done?'Completed today ✓':'Earn +'+a.pts+' pts'; });
  set('act-why',  function(n){ n.textContent=a.why; });
  set('act-why-card', function(n){ n.style.background=a.tint; n.style.borderColor=a.ac+'33'; });
  set('act-why-h',function(n){ n.style.color=a.ac; });
  set('act-steps',function(n){
    var h='';
    a.steps.forEach(function(sp,i){
      h+='<div class="act-step" onclick="this.classList.toggle(\'done\')">'+
         '<span class="act-step-n" style="--ac:'+a.ac+';border-color:'+a.ac+'66;color:'+a.ac+'">'+(i+1)+'</span>'+
         '<span class="act-step-b"><span class="act-step-t">'+cmEsc(sp[0])+'</span><span class="act-step-d">'+cmEsc(sp[1])+'</span></span></div>';
    });
    n.innerHTML=h;
  });
  set('act-complete',function(n){
    n.style.background=done?'#E7F0EA':a.ac;
    n.style.color=done?'#3C6B4E':'#fff';
    n.style.boxShadow=done?'none':'0 8px 20px -8px '+a.ac+'99';
    n.textContent=done?'Completed today ✓ · do it again anytime':'I did it · +'+a.pts+' XP';
  });
  if(typeof lucide!=='undefined' && lucide.createIcons) lucide.createIcons();
  openOv('activity');
  var b=document.querySelector('#ov-activity .ov-body'); if(b) b.scrollTop=0;
}
/* mark the current activity complete */
function activityComplete(){
  var id=null; try{ id=localStorage.getItem('rh_act_current'); }catch(e){}
  var a=ACTS[id]; if(!a) return;
  var first=!actDone(id);
  try{ localStorage.setItem('rh_act_'+id,'1'); }catch(e){}
  actzPaintTiles();
  document.getElementById('ov-activity').classList.remove('active');
  if(first && typeof showXPPopup==='function') showXPPopup(a.pts);
}
/* paint completed tiles on the Activities screen */
function actzPaintTiles(){
  Object.keys(ACTS).forEach(function(id){
    var tile=document.getElementById('actz-tile-'+id), go=document.getElementById('actz-go-'+id);
    if(!tile||!go) return;
    if(actDone(id)){ tile.classList.add('actz-done'); go.innerHTML='<i data-lucide="check"></i> Done · +'+ACTS[id].pts+' XP'; }
    else { tile.classList.remove('actz-done'); }
  });
  if(typeof lucide!=='undefined' && lucide.createIcons) lucide.createIcons();
}
/* ---- Post detail (full post + all comments) ---- */
var CM_POSTS={
  gentle_tide:{av:'GE',avc:'#8FA9C7',handle:'@gentle_tide',time:'1d ago',tag:'Sleep & Self-Care',tagIcon:'moon',circle:'sleep',support:11,
    text:'Third night in a row of actual sleep after months of tossing. The wind-down routine from the workbook (no phone + tea + the 4-7-8 breath) is quietly changing my life.',
    comments:[
      {av:'ML',avc:'#7FB08A',handle:'@morning_light',time:'20h ago',text:'Trying this tonight. Thank you for sharing.'}
    ]},
  steady_climb:{av:'SC',avc:'#7FB08A',handle:'@steady_climb',time:'3h ago',tag:'Wins & Milestones',tagIcon:'star',circle:'wins',support:24,
    text:"90 days today. Didn't think I'd make it past week one. To anyone in the early days — it does get easier, and you're not doing it alone.",
    comments:[
      {av:'RS',avc:'#C39078',handle:'@river_stone',time:'2h ago',text:'90 days is huge. Congratulations — that is real work.'},
      {av:'FL',avc:'#8FA9C7',handle:'@first_light',time:'2h ago',text:'This gave me hope today. Thank you.'},
      {av:'SO',avc:'#6E9E80',handle:'@steady_on',time:'1h ago',text:'Week one was the hardest for me too. So proud of you.'},
      {av:'QH',avc:'#C0748A',handle:'@quiet_harbor',time:'1h ago',text:'Needed to read this. One day at a time.'},
      {av:'ML',avc:'#7FB08A',handle:'@morning_light',time:'40m ago',text:"That's amazing. Keep going."}
    ]},
  quiet_harbor:{av:'QH',avc:'#C39078',handle:'@quiet_harbor',time:'6h ago',tag:'Cravings & Coping',tagIcon:'waves',circle:'cravings',support:8,
    text:"Rough afternoon — a big craving hit out of nowhere. Tried the urge-surfing exercise and it passed in about 15 minutes. Still a little shaky, but I didn't act on it.",
    comments:[
      {av:'RS',avc:'#8FA9C7',handle:'@river_stone',time:'5h ago',text:"Proud of you for riding it out. That's the hardest part."},
      {av:'GE',avc:'#6E9E80',handle:'@gentle_tide',time:'4h ago',text:'Urge surfing saved me last week too. It really does pass.'},
      {av:'FL',avc:'#C0748A',handle:'@first_light',time:'3h ago',text:"You didn't act on it — that's the whole win. Well done."}
    ]}
};
function cmEsc(s){ return String(s).replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];}); }
function cmCommentHTML(c){
  return '<div class="cm-cmt"><div class="cm-cmt-av" style="background:'+c.avc+'">'+cmEsc(c.av)+'</div>'+
         '<div class="cm-cmt-body"><div class="cm-cmt-top"><span class="cm-cmt-handle">'+cmEsc(c.handle)+'</span><span class="cm-cmt-time">'+cmEsc(c.time)+'</span></div>'+
         '<div class="cm-cmt-txt">'+cmEsc(c.text)+'</div></div></div>';
}
/* open the full post page with all comments */
function openPost(id){
  var p=CM_POSTS[id]; if(!p) return;
  try{ localStorage.setItem('rh_post', id); }catch(e){}
  var b=document.getElementById('cm-detail-body'); if(!b) return;
  var h='<div class="cm-post" style="margin-bottom:12px">'+
    '<div class="cm-post-head"><div class="cm-avatar" style="background:'+p.avc+'">'+cmEsc(p.av)+'</div>'+
    '<div class="cm-post-id"><div class="cm-handle">'+cmEsc(p.handle)+'</div><div class="cm-time">'+cmEsc(p.time)+'</div></div>'+
    '<span class="cm-tag cm-tag--'+(p.circle||'')+'"><i data-lucide="'+p.tagIcon+'"></i> '+cmEsc(p.tag)+'</span></div>'+
    '<div class="cm-post-txt">'+cmEsc(p.text)+'</div>'+
    '<div class="cm-actions"><button class="cm-act" onclick="cmSupport(this)"><i data-lucide="heart"></i> <span class="cm-act-n">'+p.support+'</span> <span class="cm-act-lbl">support</span></button>'+
    '<button class="cm-act"><i data-lucide="message-circle"></i> <span class="cm-act-n">'+p.comments.length+'</span> <span class="cm-act-lbl">comments</span></button>'+
    '<button class="cm-act" onclick="cmFollow(this)"><i data-lucide="bell-plus"></i> <span class="cm-act-lbl">Follow</span></button></div></div>'+
    '<div class="cm-cmt-head">Comments <span id="cm-detail-count">'+p.comments.length+'</span></div><div id="cm-cmt-list">';
  p.comments.forEach(function(c){ h+=cmCommentHTML(c); });
  h+='</div>';
  b.innerHTML=h;
  if(typeof lucide!=='undefined' && lucide.createIcons) lucide.createIcons();
  openOv('post-detail');
  b.scrollTop=0;
}
/* post a comment on the open post */
function cmDetailSend(){
  var inp=document.getElementById('cm-detail-input'); if(!inp || !inp.value.trim()) return;
  var list=document.getElementById('cm-cmt-list'); if(!list) return;
  list.insertAdjacentHTML('beforeend', cmCommentHTML({av:'JO',avc:'#6DA0CC',handle:'@john',time:'now',text:inp.value.trim()}));
  var cnt=document.getElementById('cm-detail-count'); if(cnt) cnt.textContent=(parseInt(cnt.textContent,10)||0)+1;
  inp.value=''; inp.blur();
  if(typeof lucide!=='undefined' && lucide.createIcons) lucide.createIcons();
  var b=document.getElementById('cm-detail-body'); if(b) b.scrollTop=b.scrollHeight;
}
/* user taps "Take me to Community" — mark done, award XP, open Community */
function markCommunityDone(){
  var already=false; try{ already=localStorage.getItem('rh_community_done')==='1'; }catch(e){}
  try{ localStorage.setItem('rh_community_done','1'); }catch(e){}
  applyRecState();
  if(!already && typeof showXPPopup==='function') showXPPopup(20);
  var d=document.getElementById('ov-community-detail'); if(d) d.classList.remove('active');
  if(typeof openOv==='function') openOv('connect');
}
/* user taps "Mark as done" on the relief detail page */
function markReliefDone(){
  var already=false; try{ already=localStorage.getItem('rh_relief_done')==='1'; }catch(e){}
  try{ localStorage.setItem('rh_relief_done','1'); }catch(e){}
  applyRecState();
  if(!already && typeof showXPPopup==='function') showXPPopup(20);
  var d=document.getElementById('ov-relief-detail'); if(d) d.classList.remove('active');
}
/* if-then builder: single-select a chip within its group */
function iftPick(btn){
  var group=btn.parentElement; if(group) group.querySelectorAll('.ift-chip').forEach(function(c){ c.classList.remove('sel'); });
  btn.classList.add('sel');
  /* picking a THEN chip clears any typed-your-own text (they're mutually exclusive) */
  if(group && group.classList.contains('ift-then')){ var own=document.getElementById('ift-own'); if(own) own.value=''; }
  iftSync();
}
/* typing your own "then" clears the selected THEN chip */
function iftOwn(){
  var ov=document.getElementById('ov-ifthen-detail');
  if(ov) ov.querySelectorAll('.ift-then .ift-chip.sel').forEach(function(c){ c.classList.remove('sel'); });
  iftSync();
}
/* enable Save once an IF and a THEN are chosen — and mirror it in the live sentence */
function iftSync(){
  var ov=document.getElementById('ov-ifthen-detail'); if(!ov) return;
  var ifSel=ov.querySelector('.ift-if .ift-chip.sel');
  var thenSel=ov.querySelector('.ift-then .ift-chip.sel');
  var own=document.getElementById('ift-own'); var typed=own && own.value.trim();
  var thenText=typed || (thenSel? thenSel.textContent : '');
  var ifText=ifSel? ifSel.textContent : '';
  var pvIf=document.getElementById('ift-pv-if');
  if(pvIf){ pvIf.textContent=ifText||'this happens'; pvIf.classList.toggle('set', !!ifText); }
  var pvThen=document.getElementById('ift-pv-then');
  if(pvThen){ pvThen.textContent=thenText||'my tiny step'; pvThen.classList.toggle('set', !!thenText); }
  var btn=document.getElementById('ift-save-btn');
  if(btn && !btn.classList.contains('is-done')) btn.disabled=!(ifText && thenText);
}
/* user taps "Save my if-then plan" */
function markIfThenDone(){
  var already=false; try{ already=localStorage.getItem('rh_ifthen_done')==='1'; }catch(e){}
  try{ localStorage.setItem('rh_ifthen_done','1'); }catch(e){}
  applyRecState();
  if(!already && typeof showXPPopup==='function') showXPPopup(20);
  var d=document.getElementById('ov-ifthen-detail'); if(d) d.classList.remove('active');
}
/* count a number up to `to` over `dur` ms, ease-out */
function rhCountUp(node, to, dur){
  var start=null;
  function step(ts){ if(start==null) start=ts; var p=Math.min(1,(ts-start)/dur); var e=1-Math.pow(1-p,3);
    node.textContent=Math.round(e*to); if(p<1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
/* home stats: count numbers up from 0 (and sweep the Recovery Journey bar) on load */
function animateHomeStats(){
  var reduce=false; try{ reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
  if(reduce) return;
  var sf=document.querySelectorAll('.sf-num');
  for(var i=0;i<sf.length;i++){ var t=parseInt(sf[i].textContent,10)||0; sf[i].textContent='0'; rhCountUp(sf[i], t, 1100); }
  var rb=document.querySelector('.rj-big');
  if(rb){ var rt=parseInt((rb.textContent||'').replace(/[^\d]/g,''),10)||0; rb.textContent='0'; rhCountUp(rb, rt, 1200); }
  var rf=document.querySelector('.rj-fill');
  if(rf){ var w=rf.style.width||'78%'; rf.style.width='0%';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ rf.style.width=w; }); }); }
}
animateHomeStats();
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
  showPhoneScreen();                         /* mobile-number page */
  var w=document.getElementById('welcome');
  if(w){ w.classList.add('hide'); setTimeout(function(){ w.style.display='none'; }, 520); }
}
/* Guest: skip onboarding and drop straight onto the home screen */
function loginAsGuest(){
  if(window.__wc && __wc.stop) __wc.stop();
  window.__profile = window.__profile || { name:'Guest' };
  try{ localStorage.setItem('rh_onboarded','1'); localStorage.setItem('rh_profile', JSON.stringify(window.__profile)); }catch(e){}
  var w=document.getElementById('welcome');
  if(w){ w.classList.add('hide'); setTimeout(function(){ w.style.display='none'; }, 420); }
  if(typeof goScreen==='function') goScreen('home');
  if(typeof scheduleCheckin==='function') scheduleCheckin();
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
  showOtpScreen();       /* OTP slides up as a bottom sheet over the (dimmed) phone screen */
}
/* ═══ DETAILS (name / email / age) ═══ */
function showDetailsScreen(){ var d=document.getElementById('detailsScreen'); if(d) d.classList.add('show'); }
function hideDetailsScreen(){ var d=document.getElementById('detailsScreen'); if(!d) return;
  d.classList.add('hide'); setTimeout(function(){ d.style.display='none'; }, 420); }
function dtErr(id){ var f=document.getElementById(id); if(f){ f.classList.add('err'); setTimeout(function(){ f.classList.remove('err'); }, 1200); } }
function submitDetails(){
  var name=document.getElementById('dtName'), email=document.getElementById('dtEmail');
  var nameVal=((name&&name.value)||'').trim();
  if(!nameVal){ dtErr('dtNameField'); if(name) name.focus(); return; }
  var emailVal=((email&&email.value)||'').trim();
  if(emailVal && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal)){ dtErr('dtEmailField'); if(email) email.focus(); return; }
  window.__profile={name:nameVal, email:emailVal, phone:(window.__phone||null), dob:(window.__dob||null), age:(window.__dob?window.__dob.age:null)};
  var rn=document.getElementById('rhName'); if(rn) rn.textContent=nameVal.split(' ')[0];   /* greet by first name */
  try{ localStorage.setItem('rh_onboarded','1'); localStorage.setItem('rh_profile', JSON.stringify(window.__profile)); }catch(e){}
  onbShow('connectCareScreen');   /* next step: connect to clinic (MOUD/Triggers/Relief removed) */
  hideDetailsScreen();
}
/* ═══ ONBOARDING STEP FORM (MOUD -> triggers -> relief -> care -> reminders -> privacy -> done) ═══ */
function onbShow(id){ var e=document.getElementById(id); if(e){ e.style.display=''; e.classList.remove('hide'); e.classList.add('show'); e.scrollTop=0; } }
function onbHide(id){ var e=document.getElementById(id); if(!e) return; e.classList.add('hide');
  setTimeout(function(){ e.style.display='none'; e.classList.remove('show','hide'); }, 420); }
function onbStep(from,to){ onbShow(to); onbHide(from); }
var ONB_ORDER=['connectCareScreen','privacyScreen'];   /* MOUD/Triggers/Relief removed from onboarding (Triggers/Relief still used by daily check-in) */
function onbBack(curId){
  if(window.__ciMode){   /* check-in intro: relief -> triggers -> cancel to home */
    if(curId==='reliefScreen'){ onbStep('reliefScreen','triggersScreen'); ciConfigTriggers(); ciGate(); return; }
    if(curId==='triggersScreen'){ ciCancel(); return; }
  }
  var i=ONB_ORDER.indexOf(curId);
  if(i<=0){ onbShow('detailsScreen'); onbHide(curId); return; }   /* first step back -> details */
  onbStep(curId, ONB_ORDER[i-1]);
}
function onbSkip(step){ if(step==='relief'){ onbStep('reliefScreen','connectCareScreen'); } }
function connectCheck(){ var cn=document.getElementById('clinicName'), cc=document.getElementById('clinicCode'), btn=document.getElementById('connectContinue');
  if(btn) btn.disabled=!((cn&&cn.value.trim()) || (cc&&cc.value.trim())); }
function onbToggle(el){ el.classList.toggle('sel'); if(window.__ciMode) ciGate(); }
function onbAdd(containerId, inputId){
  var inp=document.getElementById(inputId), c=document.getElementById(containerId); if(!inp||!c) return;
  var v=(inp.value||'').trim(); if(!v) return;
  var b=document.createElement('button'); b.type='button'; b.className='onb-chip onb-chip-custom sel'; b.setAttribute('data-val', v);
  var t=document.createElement('span'); t.className='onb-chip-t'; t.textContent=v;
  var x=document.createElement('span'); x.className='onb-chip-x'; x.setAttribute('aria-label','Remove'); x.innerHTML='&times;';
  x.addEventListener('click', function(e){ e.stopPropagation(); b.parentNode&&b.parentNode.removeChild(b); if(window.__ciMode) ciGate(); });
  b.appendChild(t); b.appendChild(x);
  b.addEventListener('click', function(){ onbToggle(b); });
  c.insertBefore(b, c.firstChild); inp.value=''; inp.focus();
  if(window.__ciMode) ciGate();
}
function onbSelected(containerId){ var c=document.getElementById(containerId); if(!c) return [];
  var out=[], ch=c.querySelectorAll('.onb-chip.sel'); for(var i=0;i<ch.length;i++) out.push((ch[i].getAttribute('data-val')||ch[i].textContent).trim()); return out; }
function onbSave(k,v){ try{ var pf=window.__profile||{}; pf[k]=v; window.__profile=pf; localStorage.setItem('rh_profile', JSON.stringify(pf)); }catch(e){} window['__'+k]=v; }
/* registered-number registry: a returning number only needs OTP, then straight to home */
function rhUsers(){ try{ return JSON.parse(localStorage.getItem('rh_users')||'{}'); }catch(e){ return {}; } }
function rhRegisterUser(prof){ if(!prof||!prof.phone) return; var u=rhUsers(); u[prof.phone]=prof; try{ localStorage.setItem('rh_users', JSON.stringify(u)); }catch(e){} }
function rhGetUser(num){ if(!num) return null; var u=rhUsers(); return u[num]||null; }
/* MOUD */
function showMoudScreen(){ onbShow('moudScreen'); }
function hideMoudScreen(){ onbHide('moudScreen'); }
function selectMoud(opt){ onbSave('moud',opt); onbStep('moudScreen','triggersScreen'); }
/* steps */
function pvToggle(el){ el.classList.toggle('on');
  var c1=document.getElementById('pvCheck1'), c2=document.getElementById('pvCheck2'), btn=document.getElementById('pvContinue');
  if(btn) btn.disabled=!(c1&&c1.classList.contains('on') && c2&&c2.classList.contains('on')); }
function onbNext(step){
  if(step==='triggers'){
    if(window.__ciMode && onbSelected('trigChips').length===0) return;   /* must pick at least one */
    onbSave('triggers', onbSelected('trigChips')); onbStep('triggersScreen','reliefScreen');
    if(window.__ciMode){ ciConfigRelief(); ciGate(); } }
  else if(step==='relief'){
    if(window.__ciMode){
      if(onbSelected('reliefChips').length===0) return;                  /* must pick at least one */
      onbSave('relief', onbSelected('reliefChips'));
      window.__ciMode=false; onbHide('reliefScreen');
      setTimeout(function(){ if(typeof openReflect==='function') openReflect(); }, 460);   /* then the check-in */
      return; }
    onbSave('relief', onbSelected('reliefChips')); onbStep('reliefScreen','connectCareScreen'); }
  else if(step==='connect'){ var cn=document.getElementById('clinicName'), cc=document.getElementById('clinicCode');
    var nm=cn&&cn.value.trim(), cd=cc&&cc.value.trim();
    if(!nm && !cd) return;   /* mandatory: need clinic name or code */
    if(nm) onbSave('clinicName', nm); if(cd) onbSave('clinicCode', cd); onbStep('connectCareScreen','privacyScreen'); }
  else if(step==='privacy'){
    var c1=document.getElementById('pvCheck1'), c2=document.getElementById('pvCheck2');
    if(!(c1&&c1.classList.contains('on') && c2&&c2.classList.contains('on'))) return;
    onbSave('contactOptIn', true);
    var pf=window.__profile||{}; var first=(pf.name||'there').split(' ')[0];
    rhRegisterUser(pf);                 /* remember this number so it skips onboarding next time */
    var dn=document.getElementById('doneName'); if(dn) dn.textContent=first;
    onbHide('privacyScreen');           /* reveal home behind */
    showDoneModal();                    /* confirmation first */
    if(window.__doneTimer) clearTimeout(window.__doneTimer);
    window.__doneTimer=setTimeout(doneThenLocation, 2600);   /* ...then ask for location */
  }
}
function showDoneModal(){ var m=document.getElementById('doneModal'); if(m){ m.classList.remove('hide'); m.classList.add('show'); } }
function finishOnb(){ if(window.__doneTimer){ clearTimeout(window.__doneTimer); window.__doneTimer=null; }
  var m=document.getElementById('doneModal'); if(!m) return;
  m.classList.add('hide'); setTimeout(function(){ m.classList.remove('show','hide'); m.style.display='none'; }, 400);
  scheduleCheckin();   /* prompt daily check-in shortly after landing on home */
}
/* confirmation is shown first; dismiss it, then ask for location permission */
function doneThenLocation(){ if(window.__doneTimer){ clearTimeout(window.__doneTimer); window.__doneTimer=null; }
  var m=document.getElementById('doneModal');
  if(m){ m.classList.add('hide'); setTimeout(function(){ m.classList.remove('show','hide'); m.style.display='none'; }, 400); }
  setTimeout(showLocModal, 460);   /* location permission after the confirmation */
}
function scheduleCheckin(){ if(window.__checkinTimer) clearTimeout(window.__checkinTimer);
  window.__checkinTimer=setTimeout(showCheckinModal, 2000); }   /* every time home is shown, after 2s */
function showCheckinModal(){ var m=document.getElementById('checkinModal'); if(!m) return;
  if((document.body.getAttribute('data-screen')||'home')!=='home') return;   /* daily check-in prompt only on the home page */
  m.classList.remove('hide'); m.classList.add('show'); if(window.lucide&&lucide.createIcons) lucide.createIcons(); }
function hideCheckinModal(){ if(window.__checkinTimer){ clearTimeout(window.__checkinTimer); window.__checkinTimer=null; }
  var m=document.getElementById('checkinModal'); if(!m) return;
  m.classList.add('hide'); setTimeout(function(){ m.classList.remove('show','hide'); m.style.display='none'; }, 340); }
/* ═══ CHECK-IN INTRO: Let's Begin -> triggers -> relief -> reflection ═══ */
function ciResetChips(cid){ var c=document.getElementById(cid); if(!c) return; var s=c.querySelectorAll('.onb-chip.sel'); for(var i=0;i<s.length;i++) s[i].classList.remove('sel'); }
function ciConfig(id, num, pct, ctaHtml, hideSkip){ var s=document.getElementById(id); if(!s) return;
  var cnt=s.querySelector('.onb-count'); if(cnt) cnt.innerHTML=num+'<span>/2</span>';
  var fill=s.querySelector('.onb-steps-fill'); if(fill) fill.style.width=pct;
  var cta=s.querySelector('.onb-continue'); if(cta) cta.innerHTML=ctaHtml;
  var skip=s.querySelector('.onb-skip-link'); if(skip) skip.style.display=hideSkip?'none':''; }
function ciConfigTriggers(){ ciConfig('triggersScreen','1','50%','Next <span aria-hidden="true">&rarr;</span>', false); }
function ciConfigRelief(){ ciConfig('reliefScreen','2','100%','Start my check-in <span aria-hidden="true">&rarr;</span>', true); }
function ciGate(){ if(!window.__ciMode) return;
  var t=document.getElementById('triggersScreen'), r=document.getElementById('reliefScreen');
  if(t && t.classList.contains('show')){ var bt=t.querySelector('.onb-continue'); if(bt) bt.disabled=(onbSelected('trigChips').length===0); }
  if(r && r.classList.contains('show')){ var br=r.querySelector('.onb-continue'); if(br) br.disabled=(onbSelected('reliefChips').length===0); } }
function ciProfile(){ var pf=window.__profile; if(!pf){ try{ pf=JSON.parse(localStorage.getItem('rh_profile')||'null'); }catch(e){} } return pf||{}; }
function checkinBegin(){ hideCheckinModal();
  var pf=ciProfile();
  if((pf.triggers&&pf.triggers.length) && (pf.relief&&pf.relief.length)){
    if(typeof openReflect==='function') openReflect(); return;   /* already set during onboarding -> straight to check-in */
  }
  window.__ciMode=true;
  ciResetChips('trigChips'); ciResetChips('reliefChips');
  ciConfigTriggers(); ciConfigRelief();
  onbShow('triggersScreen');
  ciGate(); }
function ciCancel(){ window.__ciMode=false; onbHide('triggersScreen'); onbHide('reliefScreen'); }
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
  setTimeout(scheduleCheckin, 360);            /* confirmation already shown -> land on home */
}
function skipLocation(){ hideLocModal(); setTimeout(scheduleCheckin, 360); }
function showPushModal(){ var m=document.getElementById('pushModal'); if(!m) return;
  m.style.display=''; m.classList.remove('hide'); m.classList.add('show');
  if(window.lucide&&lucide.createIcons) lucide.createIcons(); }
function hidePushModal(){ var m=document.getElementById('pushModal'); if(!m) return;
  m.classList.add('hide'); setTimeout(function(){ m.style.display='none'; m.classList.remove('show','hide'); }, 320); }
function allowPush(){ hidePushModal(); try{ if('Notification' in window && Notification.requestPermission) Notification.requestPermission(); }catch(e){} finishOnbFlow(); }
function skipPush(){ hidePushModal(); finishOnbFlow(); }
function finishOnbFlow(){ setTimeout(function(){ showDoneModal(); if(window.__doneTimer) clearTimeout(window.__doneTimer); window.__doneTimer=setTimeout(finishOnb, 3400); }, 360); }
(function(){
  var sp=document.getElementById('splash'); if(!sp) return;
  var onboarded=false; try{ onboarded=localStorage.getItem('rh_onboarded')==='1'; }catch(e){}
  if(onboarded){
    /* already logged in — refresh restores the page; no splash/onboarding (only logout restarts it) */
    sp.classList.add('hide'); sp.style.display='none';
    try{ var pf=JSON.parse(localStorage.getItem('rh_profile')||'null'); if(pf){ window.__profile=pf; if(pf.phone) window.__phone=pf.phone;
      var rn=document.getElementById('rhName'); if(rn && pf.name) rn.textContent=String(pf.name).split(' ')[0]; } }catch(e){}
    var last=null; try{ last=localStorage.getItem('rh_screen'); }catch(e){}
    if(last && document.getElementById('screen-'+last)) goScreen(last); else goScreen('home');
    /* reopen the overlay/detail page the user was viewing before the refresh */
    var lastOv=null; try{ lastOv=localStorage.getItem('rh_ov'); }catch(e){}
    if(lastOv && document.getElementById('ov-'+lastOv) && typeof openOv==='function'){
      if(lastOv==='relief-detail' || lastOv==='ifthen-detail' || lastOv==='community-detail' || lastOv==='threegood-detail') openOv('insights');   /* keep the parent Insights screen beneath the detail */
      if(lastOv==='post-detail'){
        openOv('connect');
        var pid=null; try{ pid=localStorage.getItem('rh_post'); }catch(e){}
        if(pid && typeof openPost==='function') openPost(pid);
      } else if(lastOv==='activity'){
        var aid=null; try{ aid=localStorage.getItem('rh_act_current'); }catch(e){}
        if(aid && typeof openActivity==='function') openActivity(aid);
      } else {
        openOv(lastOv);
      }
    }
    return;
  }
  /* new user — run the full flow: splash -> intro -> mobile number -> OTP -> details -> location -> home */
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

/* ═══ OTP VERIFICATION ═══ */
var __otpTimer=null;
function startOtpTimer(secs){
  var btn=document.getElementById('otpResend'); if(!btn) return;
  if(__otpTimer){ clearInterval(__otpTimer); __otpTimer=null; }
  var t=secs;
  function tick(){
    if(t<=0){ clearInterval(__otpTimer); __otpTimer=null;
      btn.textContent='Resend code'; btn.disabled=false; btn.classList.remove('disabled'); return; }
    btn.textContent='Resend code in '+t+'s'; btn.disabled=true; btn.classList.add('disabled'); t--;
  }
  tick(); __otpTimer=setInterval(tick,1000);
}
function genOtp(){ var c=''; for(var i=0;i<6;i++) c+=Math.floor(Math.random()*10);
  window.__otpCode=c; var el=document.getElementById('otpDemoCode'); if(el) el.textContent=c; return c; }
function otpFilled(){ var b=otpBoxes(); if(!b.length) return false; for(var i=0;i<b.length;i++){ if(!b[i].value) return false; } return true; }
var __otpHideTimer=null;
function showOtpScreen(){ var o=document.getElementById('otpScreen'); if(!o) return;
  if(__otpHideTimer){ clearTimeout(__otpHideTimer); __otpHideTimer=null; }
  var num=document.getElementById('otpNum'); if(num && window.__phone) num.textContent=window.__phone;
  var boxes=otpBoxes(); for(var i=0;i<boxes.length;i++) boxes[i].value='';
  genOtp();
  o.style.display=''; o.classList.remove('hide'); o.classList.add('show');   /* reset any leftover state from a prior close */
  startOtpTimer(30);
  setTimeout(function(){ var b=document.querySelector('#otpRow .otp-box'); if(b) b.focus(); }, 420); }
function hideOtpScreen(){ var o=document.getElementById('otpScreen'); if(!o) return;
  if(__otpTimer){ clearInterval(__otpTimer); __otpTimer=null; }
  o.classList.add('hide');
  if(__otpHideTimer) clearTimeout(__otpHideTimer);
  __otpHideTimer=setTimeout(function(){ o.style.display='none'; o.classList.remove('show','hide'); __otpHideTimer=null; }, 420); }
function closeOtpSheet(){ hideOtpScreen(); }   /* dismiss sheet -> back to the phone-number screen behind it */
function otpBackdrop(e){ if(e && e.target && e.target.id==='otpScreen') closeOtpSheet(); }   /* tap outside the sheet closes it */
function otpBoxes(){ var r=document.getElementById('otpRow'); return r?r.querySelectorAll('.otp-box'):[]; }
function otpError(){
  var r=document.getElementById('otpRow'); if(!r) return;
  r.classList.add('err'); setTimeout(function(){ r.classList.remove('err'); }, 1200);
  var boxes=otpBoxes();
  setTimeout(function(){ for(var j=0;j<boxes.length;j++) boxes[j].value=''; if(boxes[0]) boxes[0].focus(); }, 650);
}
function verifyOtp(){
  var boxes=otpBoxes(), code='';
  for(var i=0;i<boxes.length;i++) code+=boxes[i].value;
  if(code.length<6){ otpError(); return; }
  if(window.__otpCode && code!==window.__otpCode){ otpError(); return; }   /* wrong code */
  window.__otp=code;                /* correct -> auto-verify */
  var existing=rhGetUser(window.__phone);
  if(existing){                     /* returning number -> straight to home, skip onboarding */
    window.__profile=existing;
    try{ localStorage.setItem('rh_profile', JSON.stringify(existing)); localStorage.setItem('rh_onboarded','1'); }catch(e){}
    var rn=document.getElementById('rhName'); if(rn && existing.name) rn.textContent=String(existing.name).split(' ')[0];
    hideOtpScreen();
    hidePhoneScreen();              /* reveal the home dashboard behind */
    scheduleCheckin();             /* daily check-in prompt 2s after landing on home */
    return;
  }
  showDetailsScreen();
  hideOtpScreen();
  hidePhoneScreen();                /* dismiss the phone screen sitting behind the sheet */
}
function resendOtp(){
  var btn=document.getElementById('otpResend'); if(btn && btn.disabled) return;   /* still counting down */
  var boxes=otpBoxes(); for(var i=0;i<boxes.length;i++) boxes[i].value=''; if(boxes[0]) boxes[0].focus();
  genOtp();             /* fresh code */
  startOtpTimer(30);    /* restart countdown */
}
(function otpInit(){
  var boxes=otpBoxes(); if(!boxes.length) return;
  for(var i=0;i<boxes.length;i++){ (function(idx){
    var b=boxes[idx];
    b.addEventListener('input', function(){
      b.value=b.value.replace(/\D/g,'').slice(0,1);
      var r=document.getElementById('otpRow'); if(r) r.classList.remove('err');
      if(b.value && idx<boxes.length-1) boxes[idx+1].focus();
      if(otpFilled()) verifyOtp();   /* auto-verify once all six are in */
    });
    b.addEventListener('keydown', function(e){ if(e.key==='Backspace' && !b.value && idx>0) boxes[idx-1].focus(); });
    b.addEventListener('paste', function(e){
      e.preventDefault();
      var t=((e.clipboardData||window.clipboardData).getData('text')||'').replace(/\D/g,'').slice(0,boxes.length);
      for(var k=0;k<t.length;k++) boxes[k].value=t[k];
      boxes[Math.min(t.length,boxes.length-1)].focus();
      if(otpFilled()) verifyOtp();   /* auto-verify on full paste */
    });
  })(i); }
})();

/* ═══ DATE OF BIRTH WHEEL PICKER ═══ */
var DOB_ITEMH=44;
var DOB_DAYS=[], DOB_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'], DOB_YEARS=[];
(function(){ for(var d=1;d<=31;d++) DOB_DAYS.push(d); for(var y=1940;y<=2026;y++) DOB_YEARS.push(y); })();
var __dobBuilt=false, __dobSel=null;
function dobCols(){ return [document.getElementById('dobDay'),document.getElementById('dobMonth'),document.getElementById('dobYear')]; }
function dobFill(col,arr){ var h=''; for(var i=0;i<arr.length;i++) h+='<div class="dob-item" data-i="'+i+'">'+arr[i]+'</div>'; col.innerHTML=h; }
function dobIdx(col){ return Math.max(0, Math.round(col.scrollTop/DOB_ITEMH)); }
function dobSel(col){ if(!col) return; var idx=dobIdx(col), items=col.children; for(var i=0;i<items.length;i++) items[i].classList.toggle('sel', i===idx); }
function dobTo(col,idx){ if(col){ col.scrollTop=idx*DOB_ITEMH; dobSel(col); } }
function openDob(){
  var p=document.getElementById('dobPicker'); if(!p) return;
  var cols=dobCols();
  if(!__dobBuilt){
    dobFill(cols[0],DOB_DAYS); dobFill(cols[1],DOB_MONTHS); dobFill(cols[2],DOB_YEARS);
    cols.forEach(function(c){ if(!c) return; var t=null;
      c.addEventListener('scroll', function(){ dobSel(c); if(t) clearTimeout(t); t=setTimeout(function(){ dobSel(c); }, 60); });
      c.addEventListener('click', function(e){ var it=e.target.closest&&e.target.closest('.dob-item'); if(it) c.scrollTo({top:(+it.getAttribute('data-i'))*DOB_ITEMH, behavior:'smooth'}); });
    });
    __dobBuilt=true;
  }
  p.classList.add('show');
  var sel=__dobSel||{d:0,m:0,y:DOB_YEARS.indexOf(2000)};
  setTimeout(function(){ dobTo(cols[0],sel.d); dobTo(cols[1],sel.m); dobTo(cols[2],sel.y); }, 40);
}
function closeDob(){ var p=document.getElementById('dobPicker'); if(p) p.classList.remove('show'); }
function confirmDob(){
  var cols=dobCols(); var di=dobIdx(cols[0]), mi=dobIdx(cols[1]), yi=dobIdx(cols[2]);
  di=Math.min(di,DOB_DAYS.length-1); mi=Math.min(mi,DOB_MONTHS.length-1); yi=Math.min(yi,DOB_YEARS.length-1);
  __dobSel={d:di,m:mi,y:yi};
  var day=DOB_DAYS[di], month=mi, year=DOB_YEARS[yi];
  var str=day+' '+DOB_MONTHS[month]+' '+year;
  var inp=document.getElementById('dtDob'); if(inp) inp.value=str;
  var t=new Date(), age=t.getFullYear()-year; if(t.getMonth()<month || (t.getMonth()===month && t.getDate()<day)) age--;
  window.__dob={date:str, day:day, month:month+1, year:year, age:age};
  closeDob();
}

/* ═══ PROFILE SHEET ═══ */
function pfInitials(name){ var p=(name||'').replace(/[^A-Za-z\s]+/g,' ').trim().split(/\s+/).filter(Boolean); var s=((p[0]||'')[0]||'')+((p[1]||'')[0]||''); return (s||'U').toUpperCase(); }
function pfSet(id,v){ var el=document.getElementById(id); if(el) el.textContent=(v&&String(v).trim())?v:'—'; }
function openProfile(){
  var p=document.getElementById('profileSheet'); if(!p) return;
  var pf=window.__profile; if(!pf){ try{ pf=JSON.parse(localStorage.getItem('rh_profile')||'null'); }catch(e){} } pf=pf||{};
  var name=pf.name||'There';
  pfSet('pfName', name);
  var av=document.getElementById('pfAvatar'); if(av) av.textContent=pfInitials(name);
  pfSet('pfPhone', window.__phone || pf.phone || '');
  pfSet('pfEmail', pf.email);
  pfSet('pfDob', (pf.dob && pf.dob.date) ? pf.dob.date : (typeof pf.dob==='string' ? pf.dob : ''));
  if(document.body.classList.contains('is-desktop') && window.__deskF){ var _vw=window.innerWidth; var _t=Math.min(1.3,(_vw-24)/620); p.style.zoom=_t/window.__deskF; }
  else { p.style.zoom=''; }
  p.classList.add('show');
}
function closeProfile(){ var p=document.getElementById('profileSheet'); if(p) p.classList.remove('show'); }
/* Full-page profile with back arrow (from the home-header avatar) */
function openProfileFull(){
  try{ window.__pfBackTo=document.body.getAttribute('data-screen')||'home'; }catch(e){ window.__pfBackTo='home'; }
  if(window.__pfBackTo==='profile') window.__pfBackTo='home';
  closeProfile();
  goScreen('profile');
}
function pfBack(){ goScreen(window.__pfBackTo||'home'); }
/* Full-page SOS with back arrow (no top/bottom bars) */
function openSOS(){
  try{ window.__sosBackTo=document.body.getAttribute('data-screen')||'home'; }catch(e){ window.__sosBackTo='home'; }
  if(window.__sosBackTo==='narcan') window.__sosBackTo='home';
  goScreen('narcan');
}
function sosBack(){ goScreen(window.__sosBackTo||'home'); }
function logout(){
  try{ localStorage.removeItem('rh_onboarded'); localStorage.removeItem('rh_profile');
       localStorage.removeItem('rh_screen'); localStorage.removeItem('rh_ov'); }catch(e){}
  location.reload();   /* restart onboarding */
}

/* ═══════════════════════════════════════════════════════════
   PROFILE FEATURES — My Triggers · What Helps Me · My People
   Ported/adapted from reference app. Namespaced RH_PF to avoid
   clashing with onboarding's onb* helpers and window.__profile.
   ═══════════════════════════════════════════════════════════ */
var RH_PF = {
  triggers:   ['Stress','Evenings / nighttime','Physical pain','Old neighborhood'],
  activities: ['Go for a walk','Call someone I trust','Listen to music','Breathing exercise'],
  contacts: [
    {name:'Daniel Ruiz',      role:'Your recovery coach',  num:'(310) 555-0142', color:'#6E9E80', icon:'🎧'},
    {name:'Tasha Brooks',     role:'Your peer specialist', num:'(310) 555-0188', color:'#4A90D9', icon:'🤝'},
    {name:'Mike R.',          role:'Sponsor · CPRS',       num:'(323) 555-0117', color:'#C97B6F', icon:'🧭'},
    {name:'Dr. Elena Rivera', role:'Therapist · LCSW',     num:'(310) 555-0164', color:'#8A6FB0', icon:'🛋️'},
    {name:'Mom (Sarah M.)',   role:'Family',               num:'(562) 555-0193', color:'#D8AD63', icon:'❤️'},
    {name:'Jack P.',          role:'Supportive friend',    num:'(213) 555-0175', color:'#5E8560', icon:'👋'}
  ]
};
var TRIGGER_SUGG = ['Payday','Stress','Loneliness','Certain people','Old neighborhood','Boredom','Physical pain','Arguments','Parties','Anxiety','Can’t sleep','Seeing paraphernalia'];
var ACTIVITY_SUGG = ['Go for a walk','Call a friend','Listen to music','Workout','Cold shower','Play a game','Cook something','Pray / meditate','Journal','Watch a show','Deep breathing','Pet my dog'];
/* soft pastel palette for the What-Helps-Me idea cards (bg + matching icon accent) */
var HELPS_COLORS = [
  {bg:'#F6DDCD',ic:'#C1744C'},{bg:'#CFDCEC',ic:'#5E7CA6'},{bg:'#F3D0D9',ic:'#C06E82'},{bg:'#CFE6F3',ic:'#5591B6'},
  {bg:'#D7E7C2',ic:'#6E9B57'},{bg:'#F4E1B2',ic:'#C0973B'},{bg:'#DED2EC',ic:'#8A6FB0'},{bg:'#E6D3C7',ic:'#A97C64'}
];
var ACT_ICONS = {
  'Go for a walk':'🚶','Call someone I trust':'📞','Call someone':'📞','Call a friend':'📞',
  'Listen to music':'🎵','Music':'🎵','Take a hot shower':'🚿','Hot shower':'🚿','Cold shower':'🚿',
  'Breathing exercise':'🌬️','Breathe':'🌬️','Deep breathing':'🌬️','Play a game':'🎮',
  'Pray or meditate':'🧘','Pray / meditate':'🧘','Work out':'💪','Workout':'💪',
  'Drink cold water':'💧','Cold water':'💧','Pet my dog':'🐶','My pet':'🐶','Pet my cat':'🐱',
  'Journal':'📓','Cook something':'🍳','Watch a show':'📺'
};
function actIcon(a){ return ACT_ICONS[a] || '✨'; }
/* Lucide-icon equivalents (design-system icons instead of emoji) */
var ACT_LUCIDE = {
  'Go for a walk':'footprints','Call someone I trust':'phone','Call someone':'phone','Call a friend':'phone',
  'Listen to music':'music','Music':'music','Take a hot shower':'shower-head','Hot shower':'shower-head','Cold shower':'shower-head',
  'Breathing exercise':'wind','Breathe':'wind','Deep breathing':'wind','Play a game':'gamepad-2',
  'Pray or meditate':'sparkles','Pray / meditate':'sparkles','Work out':'dumbbell','Workout':'dumbbell',
  'Drink cold water':'droplet','Cold water':'droplet','Pet my dog':'dog','My pet':'dog','Pet my cat':'cat',
  'Journal':'pen-line','Cook something':'utensils-crossed','Watch a show':'tv'
};
function actLucide(a){ return ACT_LUCIDE[a] || 'sparkles'; }

/* persist into our existing rh_profile blob (alongside onboarding fields) */
function pfPersist(){
  try{
    var pf=window.__profile||{};
    pf.triggers=RH_PF.triggers.slice();
    pf.relief=RH_PF.activities.slice();
    window.__profile=pf;
    localStorage.setItem('rh_profile', JSON.stringify(pf));
  }catch(e){}
}

/* seed from onboarding answers (window.__profile.triggers / .relief) if present */
function pfSeedFromProfile(){
  var pf=window.__profile;
  if(!pf){ try{ pf=JSON.parse(localStorage.getItem('rh_profile')||'null'); }catch(e){} }
  if(pf){
    if(Array.isArray(pf.triggers) && pf.triggers.length) RH_PF.triggers=pf.triggers.slice();
    if(Array.isArray(pf.relief)   && pf.relief.length)   RH_PF.activities=pf.relief.slice();
  }
}

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function jsStr(s){ return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

/* render the 3 profile-screen containers */
function renderProfileLists(){
  pfSeedFromProfile();
  /* only overwrite when we actually have content, so a refresh never blanks a section */
  var t=document.getElementById('pf-triggers');
  if(t){ var th=RH_PF.triggers.map(function(x,i){var c=HELPS_COLORS[i%HELPS_COLORS.length];return '<button class="helps-card helps-card-plain hp-scrollcard" style="background:'+c.bg+';color:'+c.ic+'" type="button" onclick="renderProfileEdit();openOv(\'edit-triggers\')"><span class="helps-card-t">'+esc(x)+'</span></button>';}).join(''); if(th) t.innerHTML=th; }
  var a=document.getElementById('pf-activities');
  if(a){ var ah=RH_PF.activities.map(function(x,i){var c=HELPS_COLORS[i%HELPS_COLORS.length];return '<button class="helps-card hp-scrollcard" style="background:'+c.bg+';color:'+c.ic+'" type="button" onclick="renderProfileEdit();openOv(\'edit-activities\')"><span class="helps-card-ic"><i data-lucide="'+actLucide(x)+'"></i></span><span class="helps-card-t">'+esc(x)+'</span></button>';}).join(''); if(ah) a.innerHTML=ah; }
  var c=document.getElementById('pf-contacts');
  if(c){ var ch=contactsHTML(); if(ch) c.innerHTML=ch; }
  if(window.lucide && lucide.createIcons) lucide.createIcons();
}

function contactsHTML(){
  return RH_PF.contacts.map(function(c){
    return '<div class="pf-contact">'+
      '<div class="pf-contact-av" style="background:'+c.color+';color:#fff">'+esc(pfInitials(c.name))+'</div>'+
      '<div class="pf-contact-main"><div class="pf-contact-name">'+esc(c.name)+'</div><div class="pf-contact-role">'+esc(c.role)+'</div></div>'+
      '<div class="pf-contact-btns">'+
        '<button class="pf-cbtn call" type="button" aria-label="Call '+esc(c.name)+'" onclick="callContact(\''+jsStr(c.name)+'\',\''+jsStr(c.num)+'\')"><i data-lucide="phone"></i></button>'+
        '<button class="pf-cbtn text" type="button" aria-label="Text '+esc(c.name)+'" onclick="textContact(\''+jsStr(c.name)+'\',\''+jsStr(c.num)+'\')"><i data-lucide="message-circle"></i></button>'+
      '</div></div>';
  }).join('');
}
/* Frequent Location Check-in: pick a place type, award XP, close */
function locAnswer(btn){
  var opts=btn.parentNode.querySelectorAll('.loc-opt');
  for(var i=0;i<opts.length;i++) opts[i].classList.remove('sel');
  btn.classList.add('sel');
  var sb=document.getElementById('loc-submit'); if(sb) sb.classList.add('ready');  /* enable the Submit CTA */
}
function locSubmit(){ closeOv(); if(typeof showXPPopup==='function') showXPPopup(30); }
function pfTelHref(num){ return 'tel:'+String(num).replace(/[^\d+]/g,''); }
function callContact(name,num){ try{ window.location.href=pfTelHref(num); }catch(e){} }
function textContact(name,num){ try{ window.location.href='sms:'+String(num).replace(/[^\d+]/g,''); }catch(e){} }

/* edit-overlay rendering: live chip list (with remove) + suggestion strip */
function renderProfileEdit(){
  /* One unified grid of check/uncheck cards (selected first, then remaining suggestions) */
  var es=document.getElementById('et-sugg');
  if(es){
    var optsT=RH_PF.triggers.concat(TRIGGER_SUGG.filter(function(s){return RH_PF.triggers.indexOf(s)<0;}));
    es.innerHTML='<div class="helps-grid">'+optsT.map(function(s,i){var c=HELPS_COLORS[i%HELPS_COLORS.length];var on=RH_PF.triggers.indexOf(s)>=0;return '<button class="helps-card helps-card-plain'+(on?' is-sel':'')+'" style="background:'+c.bg+';color:'+c.ic+'" type="button" onclick="pfToggleTrigger(\''+jsStr(s)+'\')"><span class="helps-card-t">'+esc(s)+'</span><i data-lucide="'+(on?'check':'plus')+'" class="helps-card-plus"></i></button>';}).join('')+'</div>';
  }
  var eas=document.getElementById('ea-sugg');
  if(eas){
    var optsA=RH_PF.activities.concat(ACTIVITY_SUGG.filter(function(s){return RH_PF.activities.indexOf(s)<0;}));
    eas.innerHTML='<div class="helps-grid">'+optsA.map(function(s,i){var c=HELPS_COLORS[i%HELPS_COLORS.length];var on=RH_PF.activities.indexOf(s)>=0;return '<button class="helps-card'+(on?' is-sel':'')+'" style="background:'+c.bg+';color:'+c.ic+'" type="button" onclick="pfToggleActivity(\''+jsStr(s)+'\')"><span class="helps-card-ic"><i data-lucide="'+actLucide(s)+'"></i></span><span class="helps-card-t">'+esc(s)+'</span><i data-lucide="'+(on?'check':'plus')+'" class="helps-card-plus"></i></button>';}).join('')+'</div>';
  }
  if(window.lucide && lucide.createIcons) lucide.createIcons();
}
function pfRefresh(){ renderProfileEdit(); renderProfileLists(); pfPersist(); if(window.lucide && lucide.createIcons) lucide.createIcons(); }
/* tap a card to check/uncheck (select or deselect) */
function pfToggleTrigger(v){ v=(v||'').trim(); if(!v) return; var i=RH_PF.triggers.indexOf(v); if(i>=0) RH_PF.triggers.splice(i,1); else RH_PF.triggers.push(v); pfRefresh(); }
function pfToggleActivity(v){ v=(v||'').trim(); if(!v) return; var i=RH_PF.activities.indexOf(v); if(i>=0) RH_PF.activities.splice(i,1); else RH_PF.activities.push(v); pfRefresh(); }
function pfAddTriggerVal(v){ v=(v||'').trim(); if(!v) return; if(RH_PF.triggers.indexOf(v)<0) RH_PF.triggers.push(v); pfRefresh(); }
function pfAddTrigger(){ var i=document.getElementById('et-input'); if(!i) return; pfAddTriggerVal(i.value); i.value=''; i.focus(); }
function pfRemoveTrigger(i){ RH_PF.triggers.splice(i,1); pfRefresh(); }
function pfAddActivityVal(v){ v=(v||'').trim(); if(!v) return; if(RH_PF.activities.indexOf(v)<0) RH_PF.activities.push(v); pfRefresh(); }
function pfAddActivity(){ var i=document.getElementById('ea-input'); if(!i) return; pfAddActivityVal(i.value); i.value=''; i.focus(); }
function pfRemoveActivity(i){ RH_PF.activities.splice(i,1); pfRefresh(); }

/* render once on load (in case profile is the restored screen) */
window.addEventListener('load', function(){ try{ renderProfileLists(); }catch(e){} });
