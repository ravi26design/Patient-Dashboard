/* ═══════════════════════════════════════════════════════════
   RudraHealth AI — OUD Recovery Companion (Patient App)
   Mobile-first web app. Same data & flows as prototype v1.3.
   ═══════════════════════════════════════════════════════════ */

/* ═══ NAV ═══ */
function goScreen(id){
  if(typeof closeOv==='function') closeOv();   /* switching a main tab dismisses any open overlay (e.g. Community) */
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
  if(id==='tools' && typeof applyRecState==='function') applyRecState();   /* Today's Activity done-state */
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
  if(id==='insights'){ if(typeof buildArcGauge==='function') buildArcGauge('insightsGauge', 74); if(typeof applyRecState==='function') applyRecState(); var _rn=document.getElementById('rhName'), _ri=document.getElementById('rhNameIns'); if(_rn&&_ri) _ri.textContent=_rn.textContent; }   /* insights gauge + greeting name + recommended completion state */
  if(id==='relief-detail' && typeof applyRecState==='function') applyRecState();   /* reflect today's done-state on the Mark-as-done button */
  if(id==='ifthen-detail' && typeof iftSync==='function') iftSync();   /* set Save button enabled/disabled from current selection */
  if(id==='threegood-detail' && typeof tgSync==='function') tgSync();   /* set Save button state from the three inputs */
  if(id==='urge' && typeof populateUrge==='function') populateUrge();   /* fill relief activities + contacts (e.g. after refresh-restore) */
  if(id==='manage-team' && typeof renderTeam==='function') renderTeam();   /* render the support-team list */
  if(id==='friends' && typeof frRender==='function') frRender();   /* followers & friends list */
  if(id==='rooms'){   /* Community is a nav destination — light up its nav tab */
    document.querySelectorAll('.bottom-nav .nav-tab, #dnav .dn-item').forEach(function(t){ t.classList.toggle('active', ((t.getAttribute('onclick')||'').indexOf("'rooms'")>=0)); });
  }
  if(id==='location-checkin'){ el.querySelectorAll('.loc-opt.sel').forEach(function(o){o.classList.remove('sel');}); var _sb=document.getElementById('loc-submit'); if(_sb) _sb.classList.remove('ready'); }  /* fresh state each open */
  try{localStorage.setItem('rh_ov',id);}catch(e){}
}
function closeOv(){if(typeof stopBreath==='function')stopBreath();if(typeof stopUrgeBreath==='function')stopUrgeBreath();if(call911Timer){clearInterval(call911Timer);call911Timer=null;}document.querySelectorAll('.overlay').forEach(function(o){o.classList.remove('active');o.style.zoom='';});try{localStorage.removeItem('rh_ov');}catch(e){}}
/* keep rh_ov pointing at the topmost overlay still open (or clear it) so a refresh restores the real current view */
function syncOv(){var a=document.querySelectorAll('.overlay.active');var top=a.length?a[a.length-1].id:'';try{if(top)localStorage.setItem('rh_ov',top.replace(/^ov-/,''));else localStorage.removeItem('rh_ov');}catch(e){}}
/* close a single detail overlay and re-sync rh_ov to whatever is left underneath */
function closeDetail(id){var el=document.getElementById('ov-'+id);if(el){el.classList.remove('active');el.style.zoom='';}syncOv();}
function closeTopOv(id){var el=document.getElementById('ov-'+id);if(el){el.classList.remove('active');el.style.zoom='';}syncOv();}

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
  showXPPopup(25, 'Call Logged!');
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
  openOv('rooms');
}
function confirmSchedule(card){
  var check = document.getElementById('schedule-check');
  var time  = document.getElementById('schedule-time');
  if(check && check.style.display === 'none'){
    check.style.display = 'block';
    time.textContent  = 'Today ✓';
    time.style.color  = 'var(--hb-teal)';
  }
  updateTodayProgress();
  if(typeof openOv==='function') openOv('schedule');
}
/* Activities — same flow as Tx Schedule: mark the card done, then open the activities list */
function confirmActivities(card){
  var check = document.getElementById('activities-check');
  var time  = document.getElementById('activities-time');
  if(check && check.style.display === 'none'){
    check.style.display = 'block';
    if(time){ time.textContent = 'Done ✓'; time.style.color = 'var(--hb-teal)'; }
  }
  updateTodayProgress();
  goScreen('tools');
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
  var keys=['focus','checkin','schedule','activities'], done=0;
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
function _hexToRgb(hex){ hex=String(hex).replace('#',''); if(hex.length===3) hex=hex.split('').map(function(c){return c+c;}).join(''); var n=parseInt(hex,16); return [(n>>16)&255,(n>>8)&255,n&255]; }
/* soft translucent area fill under a line chart */
function _lineFill(canvas, hex){
  var ctx=canvas.getContext('2d'); var g=ctx.createLinearGradient(0,12,0,155);
  var c=_hexToRgb(hex);
  g.addColorStop(0,'rgba('+c[0]+','+c[1]+','+c[2]+',0.26)');
  g.addColorStop(1,'rgba('+c[0]+','+c[1]+','+c[2]+',0.02)');
  return g;
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
    type: 'line',
    data: { labels: s.labels, datasets: [{ data: s.data, borderColor:'#6E9E80', backgroundColor:_lineFill(canvas,'#6E9E80'), fill:true, tension:0.35, borderWidth:2.5, pointRadius:(s.data.length>14?0:3), pointHoverRadius:5, pointBackgroundColor:'#fff', pointBorderColor:'#6E9E80', pointBorderWidth:2 }] },
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
    type:'line',
    data:{labels:s.labels,datasets:[{data:s.data,borderColor:item.hex,backgroundColor:_lineFill(canvas,item.hex),fill:true,tension:0.35,borderWidth:2.5,pointRadius:(s.data.length>14?0:3),pointHoverRadius:5,pointBackgroundColor:'#fff',pointBorderColor:item.hex,pointBorderWidth:2}]},
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
  if(multi>.85){xp=250;label='🎉 Confirmed! +250 XP';}
  else if(multi>.65){xp=150;label='✨ Confirmed! +150 XP';}
  else if(multi>.45){xp=100;label='⚡ Confirmed! +100 XP';}
  b.textContent=label;b.style.background=multi>.45?'var(--gold)':'var(--sage)';b.style.color='#fff';b.disabled=true;
  if(multi>.45)showXPPopup(xp, 'Medication Logged!');
}

/* ═══ XP REWARD POPUP — sparkle + XP value + "<Action> Complete!" (no confirm button) ═══ */
function showXPPopup(xp, label){
  var bg=document.createElement('div');bg.className='xp-popup-bg';
  var pop=document.createElement('div');pop.className='xp-popup';
  pop.innerHTML='<div style="font-size:34px;margin-bottom:6px;line-height:1">✨</div>'+
    '<div style="font-family:Fraunces,serif;font-size:40px;font-weight:700;color:#C9A84C;line-height:1">+'+xp+' XP</div>'+
    '<div class="ui" style="font-size:15px;font-weight:700;color:#fff;margin-top:12px;letter-spacing:.4px">'+(label||'Complete!')+'</div>';
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
  /* drug use multi-select (reuse our substance list + emoji icons) — Page 1 & Page 7 hidden for focus group */
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
  /* next week: motivation & confidence — final page (Finish here) */
  {type:'sliders', q:'Thinking about the next week…', sliders:[
    {key:'motivation', label:'How motivated are you to avoid using opioids for non-medical reasons within the next week?', lo:'Not motivated', hi:'Extremely motivated'},
    {key:'confidence', label:'How confident are you in your ability to avoid using opioids for non-medical reasons within the next week?', lo:'Not confident', hi:'Extremely confident'}
  ]}
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
  if(reflectStep>=REFLECT_TOTAL){   /* ═══ completion → unified reward popup (no confirm button) ═══ */
    reflectDone();
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
    /* only a multi-select final page needs a choice before Finish; sliders are always valid */
    var msel=(item.type==='multi' && !(a.selected&&a.selected.length))?' disabled':'';
    foot.innerHTML='<button id="rf-finish" class="rf-btn rf-primary rf-full" onclick="reflectNext()"'+msel+'>Finish · +30 XP 🎉</button>';
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
  if(typeof showXPPopup==='function') showXPPopup(30, 'Reflect Complete!');
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
  if(typeof showXPPopup==='function') showXPPopup(20, 'Activity Complete!');
  else rlToast((label||'Exercise')+' complete — well done 🌿');
}

/* open the urge toolkit: populate "why", relief actions and contacts */
/* fill the Ride-out-the-urge page — relief activities + "reach your people" contacts */
function populateUrge(){
  /* Guard: the refresh-restore can call this (via the openOv('urge') hook) during
     initial script execution, before RH_PF is assigned. Bail quietly to avoid
     aborting the script (which would leave RH_PF undefined for the whole session). */
  if(typeof RH_PF==='undefined' || RH_PF==null) return;
  var why=document.getElementById('urge-why');
  if(why){ var w=(window.__profile&&window.__profile.why)||''; why.textContent = w ? 'Remember: '+w : ''; }
  var acts=document.getElementById('urge-acts');
  if(acts){
    var ACT_COLORS=['#5E8B6E','#4E7FA8','#C58A5E','#8A6DAF','#C0748A','#3F7D6F'];
    acts.innerHTML = RH_PF.activities.filter(function(a){ return !/^call\b/i.test(a); }).slice(0,4).map(function(a,i){
      var c=ACT_COLORS[i%ACT_COLORS.length];
      var rec=(i===0)?' <span class="rl-act-rec">Recommended</span>':'';
      return '<div class="rl-act" onclick="urgeAct(\''+jsStr(a)+'\')"><div class="rl-act-ic" style="background:'+c+';color:#fff"><i data-lucide="'+actLucide(a)+'"></i></div><div class="rl-act-lb">'+esc(a)+rec+'</div></div>';
    }).join('') || '<div class="rl-act-empty">Add relief activities in your profile to see them here.</div>';
  }
  var contacts=document.getElementById('urge-contacts');
  if(contacts) contacts.innerHTML = contactsHTML();
  if(window.lucide && lucide.createIcons) lucide.createIcons();
}
function openUrge(){
  populateUrge();
  openOv('urge');
  startUrgeBreath();
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
function urgeDone(){ closeOv(); rlToast('You rode it out — that took real strength.'); }
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
  s+='<text x="12" y="185" font-size="13" font-weight="600" fill="#C56A5E">Low</text>';
  s+='<text x="288" y="185" text-anchor="end" font-size="13" font-weight="600" fill="#5E8B6E">HIGH</text>';
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
  s+='<text x="12" y="185" font-size="13" font-weight="600" fill="#C56A5E">Low</text>';
  s+='<text x="288" y="185" text-anchor="end" font-size="13" font-weight="600" fill="#5E8B6E">HIGH</text>';
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
/* daily completion flags — a task counts as "done" only for the current calendar
   day, so streak buttons reset each day and can't be farmed for repeat XP */
function _rhToday(){ try{ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }catch(e){ return 'na'; } }
function rhDayDone(key){ try{ return localStorage.getItem(key)===_rhToday(); }catch(e){ return false; } }
function rhSetDayDone(key){ try{ localStorage.setItem(key,_rhToday()); }catch(e){} }
/* Insights: reflect the "reviewed" state on the bottom button */
function setInsightReviewedBtn(done){
  var b=document.getElementById('ins-review-btn'); if(!b) return;
  if(done){ b.textContent='Reviewed ✓'; b.disabled=true; b.classList.add('is-done'); }
  else { b.textContent='Mark insight reviewed · +20 XP'; b.disabled=false; b.classList.remove('is-done'); }
}
/* Insights: mark reviewed → award XP once per day, then lock the button as checked */
function markInsightReviewed(){
  if(rhDayDone('rh_insight_reviewed')) return;   /* already reviewed today — no repeat XP */
  rhSetDayDone('rh_insight_reviewed');
  setInsightReviewedBtn(true);
  if(typeof showXPPopup==='function') showXPPopup(20, 'Insights Reviewed!');
}
/* Insights: recommended-activity completion, driven from the detail page */
function updateRecCount(){
  var grid=document.querySelector('.ins-rec-grid'); if(!grid) return;
  var total=grid.querySelectorAll('.ins-rec-card').length;
  var done=grid.querySelectorAll('.ins-rec-card.is-done').length;
  var el=document.querySelector('.ins-rec-prog'); if(el) el.textContent=done+' of '+total+' done';
}
/* reflect saved completion state on the recommended cards (called when Insights opens) */
function applyRecState(){
  /* relief activity (resets daily) */
  var reliefDone=rhDayDone('rh_relief_done');
  var rc=document.getElementById('rec-relief'); if(rc) rc.classList.toggle('is-done', reliefDone);
  var arc=document.getElementById('act-rec-relief'); if(arc) arc.classList.toggle('is-done', reliefDone);   /* Activities-screen Today's Activity card */
  var rb=document.getElementById('rd-done-btn');
  if(rb){ if(reliefDone){ rb.textContent='Completed ✓'; rb.disabled=true; rb.classList.add('is-done'); }
          else { rb.textContent='Mark as done · +10 XP'; rb.disabled=false; rb.classList.remove('is-done'); } }
  /* Recovery Today — the "Activities" task card mirrors the relief-activity state */
  var achk=document.getElementById('activities-check'); if(achk) achk.style.display=reliefDone?'block':'none';
  var atime=document.getElementById('activities-time');
  if(atime){ if(reliefDone){ atime.textContent='Today ✓'; atime.style.color='var(--hb-teal)'; } else { atime.textContent='Anytime'; atime.style.color=''; } }
  /* Insights — bottom "reviewed" button state (resets daily) */
  setInsightReviewedBtn(rhDayDone('rh_insight_reviewed'));
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
  if(typeof updateTodayProgress==='function') updateTodayProgress();   /* keep the Recovery Today Activities card in sync */
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
  if(!already && typeof showXPPopup==='function') showXPPopup(15, 'Gratitude Complete!');
  closeDetail('threegood-detail');
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
  var txt=t.value.trim(); if(!txt) return;
  /* which circle is selected in the composer */
  var chip=document.querySelector('#ov-connect .cm-chip.sel');
  var label=chip?chip.textContent.trim():'Wins & Milestones';
  var MAP={'Wins & Milestones':{cls:'wins',ic:'star'},'Cravings & Coping':{cls:'cravings',ic:'waves'},'Sleep & Self-Care':{cls:'sleep',ic:'moon'}};
  var m=MAP[label]||MAP['Wins & Milestones'];
  /* handle + initials from the signed-in profile (falls back to "you") */
  var uname=(window.__profile&&(window.__profile.username||window.__profile.name))||'you';
  var handle='@'+String(uname).toLowerCase().replace(/\s+/g,'_');
  var initials=(String(uname).trim().slice(0,2)||'ME').toUpperCase();
  /* build the post */
  var post=document.createElement('div');
  post.className='cm-post cm-post-mine';
  post.setAttribute('data-circle', m.cls);
  post.innerHTML=
    '<div class="cm-post-head">'+
      '<div class="cm-avatar" style="background:#5E8B6E">'+cmEsc(initials)+'</div>'+
      '<div class="cm-post-id"><div class="cm-handle">'+cmEsc(handle)+'</div><div class="cm-time">Just now</div></div>'+
      '<span class="cm-tag cm-tag--'+m.cls+'"><i data-lucide="'+m.ic+'"></i> '+cmEsc(label)+'</span>'+
    '</div>'+
    '<div class="cm-post-txt">'+cmEsc(txt)+'</div>'+
    '<div class="cm-actions">'+
      '<button class="cm-act" onclick="event.stopPropagation();cmSupport(this)"><i data-lucide="heart"></i> <span class="cm-act-n">0</span> <span class="cm-act-lbl">support</span></button>'+
      '<button class="cm-act"><i data-lucide="message-circle"></i> <span class="cm-act-n">0</span> <span class="cm-act-lbl">comment</span></button>'+
      '<button class="cm-act" onclick="event.stopPropagation();cmFollow(this)"><i data-lucide="bell-plus"></i> <span class="cm-act-lbl">Follow</span></button>'+
    '</div>';
  /* insert at the top of the feed, just under the circle tabs */
  var tabs=document.querySelector('#ov-connect .cm-tabs');
  if(tabs && tabs.parentNode){ tabs.parentNode.insertBefore(post, tabs.nextSibling); }
  else { var body=document.querySelector('#ov-connect .ov-body'); if(body) body.appendChild(post); }
  /* respect the currently active circle filter */
  var activeTab=document.querySelector('#ov-connect .cm-tab.on');
  var key='all'; if(activeTab){ var km=(activeTab.getAttribute('onclick')||'').match(/cmTab\(this,'([^']+)'\)/); if(km) key=km[1]; }
  if(!(key==='all'||key===m.cls)) post.style.display='none';
  /* bump the All + matching-circle tab counts */
  document.querySelectorAll('#ov-connect .cm-tab').forEach(function(tab){
    var c=tab.querySelector('.cm-tab-count'); if(!c) return;
    var oc=tab.getAttribute('onclick')||'';
    if(/cmTab\(this,'all'\)/.test(oc) || tab.textContent.indexOf(label)>=0){ c.textContent=(parseInt(c.textContent,10)||0)+1; }
  });
  if(typeof lucide!=='undefined' && lucide.createIcons) lucide.createIcons();
  t.value=''; cmComposeSync();
  if(typeof showXPPopup==='function') showXPPopup(10, 'Posted to Community!');
}
/* mic button — toggle a listening/recording state (voice-to-text placeholder) */
function cmMic(btn){ if(btn) btn.classList.toggle('rec'); }
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
function openActivity(id, forceDone){
  var a=ACTS[id]; if(!a) return;
  try{ localStorage.setItem('rh_act_current', id); }catch(e){}
  var done=!!forceDone || actDone(id);
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
    n.style.cursor=done?'default':'pointer';
    n.disabled=!!done;
    n.textContent=done?'Completed ✓':'I did it · +'+a.pts+' XP';
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
  closeDetail('activity');
  if(first && typeof showXPPopup==='function') showXPPopup(a.pts, 'Activity Complete!');
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
  if(!already && typeof showXPPopup==='function') showXPPopup(20, 'Connect Complete!');
  closeDetail('community-detail');
  if(typeof openOv==='function') openOv('rooms');
}
/* user taps "Mark as done" on the relief detail page */
function markReliefDone(){
  var already=rhDayDone('rh_relief_done');
  rhSetDayDone('rh_relief_done');
  applyRecState();
  if(!already && typeof showXPPopup==='function') showXPPopup(10, 'Activities Reviewed!');
  closeDetail('relief-detail');
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
  if(!already && typeof showXPPopup==='function') showXPPopup(20, 'Plan Saved!');
  closeDetail('ifthen-detail');
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
  showDetailsScreen();                        /* combined details + mobile-number page */
  var w=document.getElementById('welcome');
  if(w){ w.classList.add('hide'); setTimeout(function(){ w.style.display='none'; }, 520); }
}
/* Guest: skip onboarding and drop straight onto the home screen */
function loginAsGuest(){
  if(window.__wc && __wc.stop) __wc.stop();
  window.__profile = { name:'Guest' };
  var _rn=document.getElementById('rhName'); if(_rn) _rn.textContent='Guest';
  var _ri=document.getElementById('rhNameIns'); if(_ri) _ri.textContent='Guest';
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
  var uname=document.getElementById('dtUsername');
  var unameVal=((uname&&uname.value)||'').trim();
  if(!unameVal){ dtErr('dtUsernameField'); if(uname) uname.focus(); return; }
  var emailVal=((email&&email.value)||'').trim();
  if(emailVal && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal)){ dtErr('dtEmailField'); if(email) email.focus(); return; }
  /* validate the mobile number (now collected on this same screen) */
  var pinp=document.getElementById('phoneInput');
  var pd=((pinp&&pinp.value)||'').replace(/\D/g,'');
  if(pd.length<10){ dtErr('dtPhoneField'); var prow=document.getElementById('phRow'); if(prow){ prow.classList.add('err'); setTimeout(function(){ prow.classList.remove('err'); }, 1200); } if(pinp) pinp.focus(); return; }
  window.__phone=(typeof __cc!=='undefined'&&__cc?__cc.d:'+1')+pd;
  window.__profile={name:nameVal, username:unameVal, email:emailVal, phone:window.__phone, dob:(window.__dob||null), age:(window.__dob?window.__dob.age:null)};
  var rn=document.getElementById('rhName'); if(rn) rn.textContent=nameVal.split(' ')[0];   /* greet by first name */
  try{ localStorage.setItem('rh_profile', JSON.stringify(window.__profile)); }catch(e){}
  showOtpScreen();   /* verify the number next; onboarding steps continue after OTP */
}
/* ═══ ONBOARDING STEP FORM (MOUD -> triggers -> relief -> care -> reminders -> privacy -> done) ═══ */
function onbShow(id){ var e=document.getElementById(id); if(e){ e.style.display=''; e.classList.remove('hide'); e.classList.add('show'); e.scrollTop=0; } }
function onbHide(id){ var e=document.getElementById(id); if(!e) return; e.classList.add('hide');
  setTimeout(function(){ e.style.display='none'; e.classList.remove('show','hide'); }, 420); }
function onbStep(from,to){ onbShow(to); onbHide(from); }
var ONB_ORDER=['reliefScreen','connectCareScreen','privacyScreen'];   /* onboarding: Relief → clinic → privacy (Triggers moved to the daily check-in) */
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
    if(window.__ciMode){
      if(onbSelected('trigChips').length===0) return;   /* must pick at least one */
      onbSave('triggers', onbSelected('trigChips'));
      window.__ciMode=false; onbHide('triggersScreen');
      setTimeout(function(){ if(typeof openReflect==='function') openReflect(); }, 460);   /* then the check-in */
      return; }
    onbSave('triggers', onbSelected('trigChips')); onbStep('triggersScreen','reliefScreen'); }
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
function ciConfig(id, num, pct, ctaHtml, hideSkip, total){ var s=document.getElementById(id); if(!s) return;
  var cnt=s.querySelector('.onb-count'); if(cnt) cnt.innerHTML=num+'<span>/'+(total||2)+'</span>';
  var fill=s.querySelector('.onb-steps-fill'); if(fill) fill.style.width=pct;
  var cta=s.querySelector('.onb-continue'); if(cta) cta.innerHTML=ctaHtml;
  var skip=s.querySelector('.onb-skip-link'); if(skip) skip.style.display=hideSkip?'none':''; }
/* daily check-in prelude = triggers only (relief is collected during onboarding) */
function ciConfigTriggers(){ ciConfig('triggersScreen','1','100%','Start my check-in <span aria-hidden="true">&rarr;</span>', true, 1); }
function ciConfigRelief(){ ciConfig('reliefScreen','2','100%','Start my check-in <span aria-hidden="true">&rarr;</span>', true); }
function ciGate(){ if(!window.__ciMode) return;
  var t=document.getElementById('triggersScreen'), r=document.getElementById('reliefScreen');
  if(t && t.classList.contains('show')){ var bt=t.querySelector('.onb-continue'); if(bt) bt.disabled=(onbSelected('trigChips').length===0); }
  if(r && r.classList.contains('show')){ var br=r.querySelector('.onb-continue'); if(br) br.disabled=(onbSelected('reliefChips').length===0); } }
function ciProfile(){ var pf=window.__profile; if(!pf){ try{ pf=JSON.parse(localStorage.getItem('rh_profile')||'null'); }catch(e){} } return pf||{}; }
function checkinBegin(){ hideCheckinModal();
  /* no prelude — go straight to the survey (triggers collected via profile, relief during onboarding) */
  window.__ciMode=false;
  if(typeof openReflect==='function') openReflect(); }
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
    /* read the last overlay BEFORE goScreen — goScreen now closes overlays and clears rh_ov */
    var lastOv=null; try{ lastOv=localStorage.getItem('rh_ov'); }catch(e){}
    if(last && document.getElementById('screen-'+last)) goScreen(last); else goScreen('home');
    /* reopen the overlay/detail page the user was viewing before the refresh */
    if(lastOv && document.getElementById('ov-'+lastOv) && typeof openOv==='function'){
      if(lastOv==='relief-detail' || lastOv==='ifthen-detail' || lastOv==='community-detail' || lastOv==='threegood-detail' || lastOv==='insights-yesterday') openOv('insights');   /* keep the parent Insights screen beneath the detail */
      if(lastOv==='post-detail'){
        openOv('rooms');
        var pid=null; try{ pid=localStorage.getItem('rh_post'); }catch(e){}
        if(pid && typeof openPost==='function') openPost(pid);
      } else if(lastOv==='activity'){
        var aid=null; try{ aid=localStorage.getItem('rh_act_current'); }catch(e){}
        if(aid && typeof openActivity==='function') openActivity(aid);
      } else if(lastOv==='reflect' || lastOv==='edit-activities' || lastOv==='edit-triggers' || lastOv==='urge'){
        /* transient flows whose body is only built on demand — don't restore (would be an empty/stuck overlay); land on the screen instead */
        try{ localStorage.removeItem('rh_ov'); }catch(e){}
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
    hideDetailsScreen();           /* reveal the home dashboard behind */
    scheduleCheckin();             /* daily check-in prompt 2s after landing on home */
    return;
  }
  /* new user: details were already collected before OTP → go straight to the onboarding steps */
  try{ localStorage.setItem('rh_onboarded','1'); if(window.__profile) localStorage.setItem('rh_profile', JSON.stringify(window.__profile)); }catch(e){}
  onbShow('reliefScreen');
  hideOtpScreen();
  hideDetailsScreen();
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
  /* Guard: the refresh-restore runs goScreen() during initial script execution,
     which can call this before RH_PF is assigned further down. Bail quietly —
     the window.load handler re-runs this once everything is initialised. */
  if(typeof RH_PF==='undefined' || RH_PF==null) return;
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

/* ═══ MY SUPPORT TEAM (add / remove) ═══ */
function contactIsClinical(c){ return /therapist|doctor|lcsw|prescriber|psychiat|physician|\bmd\b/i.test((c&&c.role)||''); }
function openManageTeam(){ mtCancelAdd(); renderTeam(); openOv('manage-team'); }
function renderTeam(){
  var el=document.getElementById('mt-list'); if(!el) return;
  el.innerHTML = RH_PF.contacts.map(function(c,i){
    var clinical=contactIsClinical(c);
    var perm = clinical ? '<div class="mt-perm"><i data-lucide="stethoscope"></i><span>Part of your <b>clinical team</b></span></div>' : '';
    return '<div class="mt-row"><div class="mt-head">'+
      '<div class="mt-av" style="background:'+(c.color||'#6E9E80')+'">'+esc(pfInitials(c.name))+'</div>'+
      '<div class="mt-main"><div class="mt-name">'+esc(c.name)+'</div><div class="mt-meta">'+esc(c.role||'')+(c.num?' · '+esc(c.num):'')+'</div></div>'+
      (clinical?'':'<button class="mt-del" type="button" onclick="mtDelete('+i+')" aria-label="Remove '+esc(c.name)+'"><i data-lucide="x"></i></button>')+
      '</div>'+perm+'</div>';
  }).join('');
  if(window.lucide && lucide.createIcons) lucide.createIcons();
}
function mtDelete(i){ if(i<0||i>=RH_PF.contacts.length) return; RH_PF.contacts.splice(i,1); renderTeam(); if(typeof renderProfileLists==='function') renderProfileLists(); if(typeof pfPersist==='function') pfPersist(); }
function mtOpenAdd(){ var f=document.getElementById('mt-addform'), b=document.getElementById('mt-addbtn'); if(f){ f.style.display='block'; f.scrollIntoView({behavior:'smooth',block:'center'}); } if(b) b.style.display='none'; }
function mtCancelAdd(){ var f=document.getElementById('mt-addform'), b=document.getElementById('mt-addbtn'); if(f) f.style.display='none'; if(b) b.style.display='block'; var n=document.getElementById('mt-name'), num=document.getElementById('mt-num'); if(n) n.value=''; if(num) num.value=''; }
function mtSaveAdd(){
  var nel=document.getElementById('mt-name'); var name=((nel&&nel.value)||'').trim();
  var kind=((document.getElementById('mt-kind')||{}).value)||'Family';
  var num=(((document.getElementById('mt-num')||{}).value)||'').trim();
  if(!name){ if(nel) nel.focus(); return; }
  var colors=['#6E9E80','#4A90D9','#C97B6F','#8A6FB0','#D8AD63','#5E8560','#7BA47E'];
  RH_PF.contacts.push({ name:name, role:kind, num:num||'—', color:colors[RH_PF.contacts.length%colors.length], icon:'' });
  mtCancelAdd(); renderTeam();
  if(typeof renderProfileLists==='function') renderProfileLists();
  if(typeof pfPersist==='function') pfPersist();
}

/* Frequent Location Check-in: pick a place type, award XP, close */
function locAnswer(btn){
  var opts=btn.parentNode.querySelectorAll('.loc-opt');
  for(var i=0;i<opts.length;i++) opts[i].classList.remove('sel');
  btn.classList.add('sel');
  var sb=document.getElementById('loc-submit'); if(sb) sb.classList.add('ready');  /* enable the Submit CTA */
}
function locSubmit(){ closeOv(); if(typeof showXPPopup==='function') showXPPopup(30, 'Check-in Complete!'); }
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

/* ===== COMMUNITY FLOW (ported from Ravi V2) ===== */
/* ══════════════════════════════════════════════════════════════════
   COMMUNITY  ·  ported from rudra-app_v22.html
   Self-contained: runs inside its own closure so nothing here can
   collide with js/app.js. External helpers from the v22 app are
   re-implemented locally, or delegated to app.js when it provides
   a global of the same name.
   ══════════════════════════════════════════════════════════════════ */
(function(){
"use strict";

var ROOT = document.getElementById("s-community");
if(!ROOT) return;

/* ── local helpers (v22 originals) ── */
var $  = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

var CURRENT_USERNAME = (typeof window.CURRENT_USERNAME === "string" && window.CURRENT_USERNAME) || "you";

/* XP table — uses app.js's if it exposes one, otherwise the v22 values */
var XP = window.XP || { task:15, wellness:25, checkin:75, mood:10, cpost:30, creply:15, creact:5, croom:40 };

/* toast — index.html has no #toast node, so the port brings its own */
var __toastEl = null;
function toast(msg){
  if(!__toastEl){
    __toastEl = document.createElement("div");
    __toastEl.className = "rc-toast";
    // must live inside the phone frame — on <body> it renders at the bottom
    // of the browser window, over whatever else is on the page
    (document.getElementById("phone") || document.body).appendChild(__toastEl);
  }
  __toastEl.textContent = msg;
  __toastEl.classList.add("on");
  clearTimeout(__toastEl._x);
  __toastEl._x = setTimeout(function(){ __toastEl.classList.remove("on"); }, 2200);
}
window.rcToast = toast;

function chipVal(groupId, dflt){ var b=$("#"+groupId+" .chip.on"); return b ? b.dataset.val : dflt; }

/* v22 used data-go="…" for tab navigation; map the few the Community
   screen uses onto index.html's own navigation, if it is available. */
ROOT.addEventListener("click", function(e){
  var g = e.target.closest("[data-go]");
  if(!g) return;
  var dest = g.dataset.go;
  if(dest === "emergency"){
    if(typeof window.openSOS === "function"){ if(typeof window.closeOv==="function") window.closeOv(); window.openSOS(); }
    return;
  }
  if(dest === "findcoach"){
    // opens the coach & peer finder ported from v22
    if(typeof window.openOv === "function"){ window.openOv("support-team"); }
    return;
  }
  if(dest === "rewards"){
    if(typeof window.goScreen === "function"){ if(typeof window.closeOv==="function") window.closeOv(); window.goScreen("rewards"); }
    return;
  }
});

/* ── community ── */
const CHANNEL_LABEL = {
  // engagement rooms
  daily:"Today's question", welcome:"Welcome",
  // by how you're doing
  checkin:"Check-in", wins:"Win", questions:"Question", struggling:"Struggling today", latenight:"Late night",
  // recovery pathways (the method you follow)
  na:"NA · 12-Step", smart:"SMART Recovery", dharma:"Recovery Dharma", spirituality:"Spirituality & Faith", mat:"MAT & meds", harm:"Harm reduction",
  // who you are
  parents:"Parents", lgbtq:"LGBTQ+", veterans:"Veterans", women:"Women", men:"Men", youngadults:"Young adults",
  // life alongside recovery
  work:"Work & money", grief:"Grief & loss", relationships:"Relationships", sober_fun:"Sober fun"
};
let POSTS = [
  {id:9, user:"northstar", badge:"peer", tint:"gold", avatar:"⭐", channel:"lgbtq", time:"12m ago",
   text:"If today's your first day back after a hard stretch — that's not a demotion. Recovery isn't linear for anyone in here. Proud of you for showing up.",
   hearts:41, supports:19, heartedByMe:false, supportedByMe:false, replies:[]},
  {id:8, user:"tidewalker", badge:null, tint:"blue", avatar:"🌊", channel:"latenight", time:"38m ago",
   text:"Anyone else awake at 2am white-knuckling it? Just needed to say it somewhere.",
   hearts:27, supports:8, heartedByMe:false, supportedByMe:false, replies:[
     {user:"riverbend", text:"Here. Not going anywhere. What's the loudest thought right now?"}
   ]},
  {id:7, user:"Denise R.", badge:"coach", tint:"blue", avatar:"D", channel:"parents", time:"1h ago",
   text:"Question from a few of you this week: yes, it's normal for cravings to spike around custody visits. It's a trigger, not a setback. Plan the hour before and the hour after, not just the visit itself.",
   hearts:63, supports:22, heartedByMe:false, supportedByMe:false, replies:[]},
  {id:6, user:"emberly", badge:null, tint:"coral", avatar:"🔥", channel:"questions", time:"2h ago",
   text:"Does buprenorphine make anyone else feel foggy in the mornings, or is that just me still adjusting?",
   hearts:9, supports:4, heartedByMe:false, supportedByMe:false, replies:[
     {user:"James O.", text:"Common in the first few weeks — worth mentioning your dose timing to your prescriber. Mine moved mine to bedtime and it helped a lot."}
   ]},
  {id:5, user:"quietpine", badge:"peer", tint:"sage", avatar:"🌲", channel:"wins", time:"3h ago",
   text:"Took my kid to school again this morning. Eight years ago I couldn't have named her teacher. Small, but it's mine.",
   hearts:118, supports:54, heartedByMe:false, supportedByMe:false, replies:[]},
  {id:4, user:"riverbend", badge:null, tint:"sage", avatar:"🪵", channel:"struggling", time:"5h ago", quiet:true,
   text:"Nearest meeting is two counties over and today's harder than usual. Anyone from a rural area have tips for the in-between days?",
   hearts:14, supports:11, heartedByMe:false, supportedByMe:false, replies:[]},

  // ── recovery-pathway rooms ──
  {id:104, user:"stepbystep", badge:null, tint:"blue", avatar:"🔵", channel:"na", time:"40m ago",
   text:"90 days today. Working Step 4 with my sponsor this week — the searching-and-fearless part is no joke. Anyone got a gentle way to think about the resentment list?",
   hearts:52, supports:31, heartedByMe:false, supportedByMe:false, replies:[
     {user:"Marcus T.", text:"Peer specialist here — a lot of people write the resentment first and the 'my part' column last, on a different day. You don't have to do it all in one sitting."}
   ]},
  {id:103, user:"toolbox", badge:null, tint:"gold", avatar:"🧠", channel:"smart", time:"1h ago",
   text:"Used the SMART cost-benefit worksheet on my 5pm craving instead of just white-knuckling. Writing down what using would actually cost me tomorrow killed most of the urge. Weird how well it works.",
   hearts:38, supports:16, heartedByMe:false, supportedByMe:false, replies:[]},
  {id:102, user:"stillwater", badge:"peer", tint:"sage", avatar:"🪷", channel:"dharma", time:"2h ago",
   text:"Reminder for anyone sitting with a craving right now: you can watch it rise and pass without acting on it. It's a wave, not a command. Ten slow breaths — I'll sit with you.",
   hearts:74, supports:29, heartedByMe:false, supportedByMe:false, replies:[]},
  {id:101, user:"dawnlight", badge:null, tint:"blue", avatar:"🕊️", channel:"spirituality", time:"3h ago",
   text:"Faith is the thing that gets me to my morning meeting some days. Not preaching to anyone — just grateful there's a room here where I can say that without it being weird. What keeps you grounded?",
   hearts:61, supports:24, heartedByMe:false, supportedByMe:false, replies:[
     {user:"quietpine", text:"Same. Different faith than you probably, but the 'something bigger than the craving' part is the same. Glad you're here."}
   ]},
  {id:100, user:"steady", badge:null, tint:"coral", avatar:"🧡", channel:"harm", time:"4h ago",
   text:"No shame here — I'm not fully abstinent yet but I carry naloxone now and never use alone. Every safer choice counts. Anyone else building up slowly?",
   hearts:43, supports:27, heartedByMe:false, supportedByMe:false, replies:[]},
  {id:99, user:"nightshift", badge:null, tint:"gold", avatar:"💼", channel:"work", time:"6h ago", quiet:true,
   text:"Do I tell a new employer I'm in recovery? Leaning toward no. Curious how others have handled it without it backfiring.",
   hearts:19, supports:9, heartedByMe:false, supportedByMe:false, replies:[]},
  {id:98, user:"holdingon", badge:null, tint:"blue", avatar:"🤍", channel:"grief", time:"8h ago",
   text:"Lost someone in my home group last month. Grief and recovery at the same time is a lot. Just needed to put that somewhere people would understand.",
   hearts:88, supports:47, heartedByMe:false, supportedByMe:false, replies:[]}
];
const REPLY_DRAFT = {};
const OPEN_REPLIES = new Set();       // which posts have their reply zone expanded
const NUDGED = new Set();             // post ids you've sent a silent nudge to
const DISMISSED = new Set();          // banner ids you've closed this session
document.addEventListener("input", e=>{
  const inp = e.target.closest('[id^="replyinput-"]');
  if(inp) REPLY_DRAFT[inp.id.replace("replyinput-","")] = inp.value;
});

/* ── community standing: streak, support earned, rank, room badges ── */
const CSTATE = {
  streak: 4,                 // seeded demo value; days shown up in Community
  supportEarned: 0,          // 🙌 + ❤️ your own posts have collected this session
  postedRooms: new Set(),    // rooms you've contributed to → earns a room badge
};
// warm, non-competitive ranks — earned by showing up, never taken away
const C_RANKS = [
  {min:0,   name:"Neighbor"},
  {min:60,  name:"Regular"},
  {min:180, name:"Encourager"},
  {min:400, name:"Anchor"},
];
function communityRank(){
  const s = CSTATE.supportEarned + CSTATE.postedRooms.size*20 + CSTATE.streak*5;
  let r = C_RANKS[0]; C_RANKS.forEach(x=>{ if(s>=x.min) r=x; }); return r.name;
}
function renderCommunityStrip(){
  const st=$("#csStreak"), su=$("#csSupport"), rk=$("#csRank");
  if(st) st.textContent = CSTATE.streak;
  if(su) su.textContent = CSTATE.supportEarned;
  if(rk) rk.textContent = communityRank();
}
/* render a stored room-icon token: a Lucide name (ascii) -> <i data-lucide>,
   otherwise treat it as a legacy emoji glyph (preset rooms still use emoji) */
function commIcon(tok){ tok=tok||"💬"; return /^[a-z0-9-]+$/.test(tok) ? '<i data-lucide="'+tok+'"></i>' : tok; }
function renderRoomBadges(){
  const box=$("#communityRoomBadges"); if(!box) return;
  const badges=[...CSTATE.postedRooms].map(v=>{
    const m=ROOM_META[v]||{emoji:"💬",name:CHANNEL_LABEL[v]||v};
    return '<span class="roombadge"><em>'+commIcon(m.emoji)+'</em>'+(m.name||v)+'</span>';
  });
  if(!badges.length){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  box.innerHTML = '<div style="width:100%;font:800 9px var(--font-ui, Manrope);letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:1px">Rooms you\'ve shown up in</div>'+badges.join("");
}
function creditRoomBadge(room){
  if(room==="all") return;
  if(!CSTATE.postedRooms.has(room)){
    CSTATE.postedRooms.add(room);
    renderRoomBadges();
    const m=ROOM_META[room]||{name:CHANNEL_LABEL[room]||room};
    setTimeout(()=>{ if(typeof showReward==="function") showReward({emoji:"🏅", title:"New room badge — "+(m.name||room), body:"First time you've posted here. Showing up in a new room is worth a badge."}); }, 650);
  }
}
/* ── third pass: top-of-feed banners (weekly digest + on-this-day) ── */
function buildFeedBanners(){
  // banners only appear in "All rooms" so they don't clutter a focused room
  const on = $("#communityChannels .chip.on");
  const filter = on ? on.dataset.val : "all";
  if(filter!=="all") return "";
  let html = "";
  // 1) WEEKLY DIGEST — what happened in your rooms, to pull you back in
  if(!DISMISSED.has("digest")){
    html += `<div class="feedbanner digest" data-banner="digest">
      <button class="fb-x" data-dismiss="digest" aria-label="Dismiss"><i data-lucide="x"></i></button>
      <div class="hub-card-head">
        <div class="hub-ic" style="background:linear-gradient(135deg,#6DA0CC,#3F6E99)"><i data-lucide="sparkles"></i></div>
        <div class="hub-card-tt">
          <div class="hub-title">3 rooms you follow were busy</div>
          <div class="hub-sub">Your week in the community</div>
        </div>
      </div>
      <ul class="fb-digest">
        <li><span class="fb-di c-na"><i data-lucide="footprints"></i></span><div><b>NA · 12-Step</b> — 14 new posts. stepbystep hit 90 days.</div></li>
        <li><span class="fb-di c-faith"><i data-lucide="heart-handshake"></i></span><div><b>Faith</b> — someone asked what keeps you grounded (24 replies).</div></li>
        <li><span class="fb-di c-wins"><i data-lucide="trophy"></i></span><div><b>Wins</b> — quietpine's school-run post got 118 hearts.</div></li>
      </ul>
      <button class="fb-cta ghost" data-digestopen="na"><span>Jump back into NA</span><i data-lucide="arrow-right"></i></button>
    </div>`;
  }
  return html;
}
function renderCommunityFeed(){
  const on = $("#communityChannels .chip.on");
  const filter = on ? on.dataset.val : "all";
  const list = POSTS.filter(p=> filter==="all" || p.channel===filter);
  const box = $("#communityFeed"); if(!box) return;
  const banners = buildFeedBanners();
  if(!list.length){ box.innerHTML = banners + '<div class="emptybox"><b>Quiet in this room right now.</b>Be the first to say something — someone will see it.</div>'; if(window.lucide&&lucide.createIcons) lucide.createIcons(); positionComposeBar(); return; }
  box.innerHTML = banners + list.map(p=>{
    const badge = p.badge ? `<span class="kind ${p.badge==='coach'?'coach':'peer'}">${p.badge==='coach'?'Recovery Coach':'Peer Specialist'}</span>` : "";
    const repliesHTML = p.replies.length
      ? `<div class="creplies"><div class="crephead">${p.replies.length} ${p.replies.length===1?"reply":"replies"}</div>${p.replies.map(r=>`<div class="creply"><b>${r.user}</b>${r.text}</div>`).join("")}</div>`
      : "";
    const roomLabel = CHANNEL_LABEL[p.channel] || (ROOM_META[p.channel]?ROOM_META[p.channel].name:"");
    const memtag = (ROOM_META[p.channel] && ROOM_META[p.channel].member) ? '<span class="memtag">member room</span>' : "";
    const supportTotal = (p.hearts||0) + (p.supports||0);
    // a quiet post (few reactions, no replies) gets a gentle nudge affordance
    const nudged = NUDGED.has(p.id);
    const quietTag = (p.quiet && !p.mine) ? `<span class="quiet-tag" title="This person hasn't heard back yet">🌾 quiet</span>` : "";
    const nudgeBtn = (p.quiet && !p.mine)
      ? `<button class="nudgebtn ${nudged?"done":""}" data-nudge="${p.id}" ${nudged?"disabled":""} title="Send a silent 'thinking of you'">${nudged?"✓ Nudged":"👋 Nudge"}</button>`
      : "";
    const mileCls = p.milestone ? " milestone"+(p.mine?" mine":"") : "";
    const mileCrown = p.milestone ? `<span class="mile-crown"><i data-lucide="crown"></i></span>` : "";
    const mileBadge = p.milestone ? `<div class="mile-badge"><i data-lucide="party-popper"></i><span class="mile-num">${p.mileLabel}</span> in recovery</div>` : "";
    return `<div class="cpost${p.quiet&&!p.mine?" isquiet":""}${mileCls}" data-pid="${p.id}">
      ${mileCrown}
      <div class="top">
        <div class="pic" style="background:var(--${p.tint}-tint);color:var(--${p.tint}-ink)">${p.avatar}</div>
        <div style="flex:1;min-width:0">
          <div class="cname">${p.user}${badge}${quietTag}</div>
          <div class="csub">${p.time} · ${roomLabel}${memtag}</div>
        </div>
        ${supportTotal ? `<span class="csupport" title="Support this post has received"><em>🙌</em>${supportTotal}</span>` : ""}
      </div>
      ${mileBadge}
      <p class="ctext">${p.text}</p>
      <div class="creact">
        <button class="react1 ${p.r_heart?"on":""}" data-react="heart" data-id="${p.id}" aria-label="Been there">❤️<span>${p.hearts}</span></button>
        <button class="react1 ${p.r_support?"on":""}" data-react="support" data-id="${p.id}" aria-label="Proud of you">🙌<span>${p.supports}</span></button>
        <button class="react1 ${p.r_strong?"on":""}" data-react="strong" data-id="${p.id}" aria-label="Stay strong">💪<span>${p.strong||0}</span></button>
        <button class="react1 ${p.r_pray?"on":""}" data-react="pray" data-id="${p.id}" aria-label="Holding you">🙏<span>${p.pray||0}</span></button>
        <button class="react1 replytoggle" data-replytoggle="${p.id}" aria-label="Reply">💬<span>${p.replies.length||""}</span></button>
      </div>
      ${repliesHTML}
      <div class="creply-zone" id="replyzone-${p.id}" ${OPEN_REPLIES.has(p.id)?"":"hidden"}>
        <div class="quickreplies">
          <button class="qr" data-quickreply="${p.id}" data-text="Proud of you 🙌">Proud of you</button>
          <button class="qr" data-quickreply="${p.id}" data-text="Been there. You've got this.">Been there</button>
          <button class="qr" data-quickreply="${p.id}" data-text="Same here 🫂">Same here</button>
          <button class="qr" data-quickreply="${p.id}" data-text="Here with you.">Here with you</button>
        </div>
        <div class="creplybox">
          <input placeholder="Write a reply…" id="replyinput-${p.id}" value="${(REPLY_DRAFT[p.id]||"").replace(/"/g,"&quot;")}">
          <button class="reply-mic" data-replymic="${p.id}" aria-label="Speak your reply" title="Speak your reply">
            <svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
          </button>
          <button class="reply-send" data-sendreply="${p.id}" aria-label="Send reply">Send</button>
        </div>
      </div>
    </div>`;
  }).join("");
  if(window.lucide&&lucide.createIcons) lucide.createIcons();
  // place the "Share something…" composer bar directly under the
  // "Your week in the community" banner (falls back to top of feed)
  positionComposeBar();
}
function positionComposeBar(){
  const bar = $("#composeBar"), card = $("#composeCard"), box = $("#communityFeed");
  if(!bar || !box) return;
  const banner = box.querySelector('[data-banner="digest"]');
  if(banner){ banner.insertAdjacentElement("afterend", bar); }
  else { box.insertAdjacentElement("afterbegin", bar); }
  // keep the expanded composer right beneath the bar so it opens in-place
  if(card) bar.insertAdjacentElement("afterend", card);
}
function updateCommunityIdentity(){
  const nameEl = $("#communityMeName");
  const initial = (CURRENT_USERNAME.trim()[0]||"Y").toUpperCase();
  if(nameEl) nameEl.textContent = CURRENT_USERNAME;
  ["#communityMeAvatar","#communityMeAvatar2"].forEach(sel=>{ const a=$(sel); if(a) a.textContent=initial; });
  // the peer rooms post under the same anonymous handle.
  // guarded: this runs during boot, before PEER_ROOMS is initialised further down.
  try{ renderPeerRooms(); }catch(e){}
  const prMe = $("#prMeName"); if(prMe) prMe.textContent = CURRENT_USERNAME;
}
const REACTIONS = {
  heart:   {flag:"r_heart",   count:"hearts",  reason:"Sent a heart"},
  support: {flag:"r_support", count:"supports",reason:"Told someone you're proud"},
  strong:  {flag:"r_strong",  count:"strong",  reason:"Sent strength"},
  pray:    {flag:"r_pray",    count:"pray",    reason:"Held someone in mind"},
};
function sendReplyTo(id, text){
  text = (text||"").trim(); if(!text) return false;
  const p = POSTS.find(x=>x.id===id); if(!p) return false;
  p.replies.push({user:CURRENT_USERNAME, text});
  delete REPLY_DRAFT[id];
  OPEN_REPLIES.add(id);              // keep the thread open after sending
  renderCommunityFeed();
  if(typeof awardXP==="function") awardXP(XP.creply, "Replied with support");
  toast("Reply sent 💬");
  return true;
}
document.addEventListener("click", e=>{
  if(!e.target.closest("#s-community")) return;
  if(e.target.closest("#communityChannels .chip")){ renderCommunityFeed(); return; }

  const react = e.target.closest("[data-react]");
  if(react){
    const id = +react.dataset.id, kind = react.dataset.react;
    const cfg = REACTIONS[kind]; if(!cfg) return;
    const p = POSTS.find(x=>x.id===id); if(!p) return;
    const now = !p[cfg.flag];
    p[cfg.flag] = now;
    p[cfg.count] = (p[cfg.count]||0) + (now?1:-1);
    if(now){
      react.classList.add("pop");
      if(typeof awardXP==="function") awardXP(XP.creact, cfg.reason);
      if(p.mine){ CSTATE.supportEarned += 1; renderCommunityStrip(); }
    }
    renderCommunityFeed();
    return;
  }

  // toggle the reply zone open/closed
  const rt = e.target.closest("[data-replytoggle]");
  if(rt){
    const id = +rt.dataset.replytoggle;
    if(OPEN_REPLIES.has(id)) OPEN_REPLIES.delete(id); else OPEN_REPLIES.add(id);
    renderCommunityFeed();
    if(OPEN_REPLIES.has(id)) setTimeout(()=>$("#replyinput-"+id)?.focus(), 40);
    return;
  }

  // one-tap suggested reply
  const qr = e.target.closest("[data-quickreply]");
  if(qr){ sendReplyTo(+qr.dataset.quickreply, qr.dataset.text); return; }

  const sendReply = e.target.closest("[data-sendreply]");
  if(sendReply){
    const id = +sendReply.dataset.sendreply;
    const inp = $("#replyinput-"+id);
    sendReplyTo(id, inp ? inp.value : "");
    return;
  }

  // ── NUDGE: silent encouragement to a quiet member ──
  const nudge = e.target.closest("[data-nudge]");
  if(nudge){
    const id = +nudge.dataset.nudge;
    if(NUDGED.has(id)) return;
    NUDGED.add(id);
    const p = POSTS.find(x=>x.id===id);
    // it counts as supporting someone — small XP, keeps the "help others" loop
    if(typeof awardXP==="function") awardXP(XP.creact, "Nudged someone quiet");
    renderCommunityFeed();
    if(typeof showReward==="function"){
      showReward({emoji:"👋", title:"Nudge sent to "+(p?p.user:"them"),
        body:"They'll see “someone's thinking of you” — no reply needed. Sometimes that's the thing that keeps a person here."});
    } else { toast("Nudge sent 👋"); }
    return;
  }

  // ── BANNER: dismiss ──
  const dis = e.target.closest("[data-dismiss]");
  if(dis){ DISMISSED.add(dis.dataset.dismiss); renderCommunityFeed(); return; }

  // ── ON THIS DAY: share this year's version → opens composer in Wins ──
  if(e.target.closest("[data-onthisday]")){
    DISMISSED.add("onthisday");
    if(typeof openComposer==="function") openComposer();
    // preselect the Wins room + a warm starter
    const grid=$("#communityPostTag");
    if(grid){ grid.querySelectorAll(".chip").forEach(c=>c.classList.remove("on")); grid.querySelector('.chip[data-val="wins"]')?.classList.add("on"); }
    const ta=$("#communityText");
    if(ta){ ta.value="One year on from that first weekend — "; ta.dispatchEvent(new Event("input",{bubbles:true})); ta.focus(); }
    renderCommunityFeed();
    return;
  }

  // ── DIGEST: jump into a highlighted room ──
  const dj = e.target.closest("[data-digestopen]");
  if(dj){ setRoom(dj.dataset.digestopen); $("#communityFeed")?.scrollIntoView({behavior:"smooth",block:"start"}); return; }
});
(function(){
  const ta=$("#communityText"), btn=$("#communityPostBtn"), cnt=$("#communityCount");
  if(!ta||!btn) return;
  function sync(){
    const n=(ta.value||"").trim().length;
    btn.disabled = n===0;
    if(cnt){
      cnt.textContent = n===0 ? "Anything counts — even one line." : "Ready to post · "+n+" characters";
      cnt.classList.toggle("ready", n>0);
    }
  }
  ta.addEventListener("input", sync);
  ta.addEventListener("keydown", e=>{ if(e.key==="Enter" && (e.metaKey||e.ctrlKey)) btn.click(); });
  window.__composeSync = sync;
  sync();
})();

/* ── collapsed composer bar → expands the full box (feed-first, cleaner) ── */
function openComposer(focus){
  const bar=$("#composeBar"), card=$("#composeCard");
  if(bar) bar.hidden=true;
  if(card){ card.hidden=false; card.classList.add("just-opened"); setTimeout(()=>card.classList.remove("just-opened"),260); }
  if(focus!==false) setTimeout(()=>$("#communityText")?.focus(), 60);
}
function closeComposer(){
  const bar=$("#composeBar"), card=$("#composeCard");
  if(card) card.hidden=true;
  if(bar) bar.hidden=false;
}
$("#composeBar")?.addEventListener("click", e=>{
  // tapping the little mic on the bar opens + starts dictation straight away
  const wantMic = !!e.target.closest("#composeBarMic");
  openComposer();
  if(wantMic) setTimeout(()=> startDictation($("#communityText"), $("#communityMic")), 260);
});
$("#composeClose")?.addEventListener("click", closeComposer);
$("#communityPostBtn").addEventListener("click", ()=>{
  const text = ($("#communityText").value||"").trim();
  if(!text){ $("#communityText").focus(); toast('Write something first — even just "here" counts.'); return; }
  const tag = chipVal("communityPostTag","checkin");
  const initial = (CURRENT_USERNAME.trim()[0]||"y").toUpperCase();
  const newPost = {
    id: Date.now(), user: CURRENT_USERNAME, badge:null, tint:"blue", avatar: initial,
    channel: tag, time:"Just now", text,
    hearts:0, supports:0, strong:0, pray:0,
    r_heart:false, r_support:false, r_strong:false, r_pray:false,
    replies:[], mine:true
  };
  POSTS.unshift(newPost);
  $("#communityText").value = "";
  $("#communityText").placeholder = "Anything counts — even one line.";
  const cnt=$("#communityCount");
  if(cnt){ cnt.textContent="Anything counts — even one line."; cnt.classList.remove("ready"); }
  $("#communityPostBtn").disabled = true;
  closeComposer();
  if(typeof awardXP==="function") awardXP(XP.cpost, "Posted in the community");
  creditRoomBadge(tag);
  renderCommunityStrip();

  // ── engagement-loop hooks ──
  // answering today's question flips the prompt into its "thank you" state
  if(window.__answeringDaily || tag==="daily"){ DAILY_ANSWERED = true; renderDailyPrompt(); }
  window.__answeringDaily = false;
  // a first post means we no longer need the "new here" nudge
  renderWelcome();
  // welcome-room posts get a guaranteed peer-specialist reply
  if(tag==="welcome"){ guaranteeWelcomeReply(newPost); }
  window.__welcomePost = false;

  setRoom(tag);
  toast("Posted anonymously as "+CURRENT_USERNAME+".");
});

/* ══════════════ VOICE INPUT ══════════════
   Real Web Speech API where the browser supports it; a gentle simulated
   fallback (so the feature always demos) everywhere else. Works for the
   composer AND every reply box. */
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let __activeRec = null;
function stopDictation(){
  if(__activeRec){ try{__activeRec.stop();}catch(e){} __activeRec=null; }
  document.querySelectorAll(".mic-btn.listening,.reply-mic.listening,.compose-bar-mic.listening")
    .forEach(b=>b.classList.remove("listening"));
}
function appendToField(field, chunk){
  if(!field) return;
  const sep = field.value && !/\s$/.test(field.value) ? " " : "";
  field.value = (field.value + sep + chunk).replace(/\s+/g," ").trimStart();
  field.dispatchEvent(new Event("input",{bubbles:true}));
}
function startDictation(field, btn){
  if(!field) return;
  if(__activeRec){ stopDictation(); return; }         // tap again = stop
  if(btn) btn.classList.add("listening");
  toast("Listening… speak now 🎤");

  if(SpeechRec){
    const rec = new SpeechRec();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
    let finalText = "";
    rec.onresult = ev=>{
      let interim="";
      for(let i=ev.resultIndex;i<ev.results.length;i++){
        const t=ev.results[i][0].transcript;
        if(ev.results[i].isFinal) finalText += t; else interim += t;
      }
      // show interim live in the placeholder-ish way via a data attr
      field.setAttribute("data-interim", interim);
    };
    rec.onerror = ()=>{ simulateDictation(field); stopDictation(); };
    rec.onend = ()=>{
      if(finalText.trim()) appendToField(field, finalText.trim());
      field.removeAttribute("data-interim");
      stopDictation();
    };
    __activeRec = rec;
    try{ rec.start(); }catch(e){ simulateDictation(field); stopDictation(); }
  } else {
    // graceful fallback for browsers without the API
    setTimeout(()=>{ simulateDictation(field); stopDictation(); }, 1400);
  }
}
function simulateDictation(field){
  const samples = [
    "Just wanted to say I'm still here today.",
    "Rough morning but I made it to my meeting.",
    "Thank you all — reading this room helps more than you know.",
    "Day at a time. Showing up counts.",
    "Feeling shaky but I didn't use. That's a win."
  ];
  appendToField(field, samples[Math.floor(Math.random()*samples.length)]);
  toast("Voice added (demo). You can edit before posting.");
}
// composer mic
$("#communityMic")?.addEventListener("click", ()=> startDictation($("#communityText"), $("#communityMic")));
// reply mics (delegated — they're re-rendered with the feed)
document.addEventListener("click", e=>{
  const rm = e.target.closest("[data-replymic]");
  if(!rm) return;
  const id = rm.dataset.replymic;
  startDictation($("#replyinput-"+id), rm);
});

/* ── community room filter: one clean, comprehensive dropdown ── */
const ROOM_OPTIONS = [
  {group:"Browse", items:[
    {val:"all",         emoji:"🌐", name:"All Rooms",        meta:"everything"},
  ]},
  {group:"How you're doing", items:[
    {val:"checkin",     emoji:"✅", name:"Daily check-in",   meta:"just say you're here"},
    {val:"wins",        emoji:"🎉", name:"Wins",             meta:"celebrations"},
    {val:"questions",   emoji:"❓", name:"Questions",        meta:"ask anything"},
    {val:"struggling",  emoji:"🫂", name:"Struggling today", meta:"hard days"},
    {val:"latenight",   emoji:"🌙", name:"Late night",       meta:"awake at 3 AM"},
  ]},
  {group:"Your recovery path", items:[
    {val:"na",          emoji:"🔵", name:"NA · 12-Step",     meta:"Narcotics Anonymous"},
    {val:"smart",       emoji:"🧠", name:"SMART Recovery",   meta:"science-based tools"},
    {val:"dharma",      emoji:"🪷", name:"Recovery Dharma",  meta:"Buddhist / mindfulness"},
    {val:"spirituality",emoji:"🕊️", name:"Spirituality & Faith", meta:"any faith welcome"},
    {val:"mat",         emoji:"💊", name:"MAT & meds",       meta:"bupe · methadone · naltrexone"},
    {val:"harm",        emoji:"🧡", name:"Harm reduction",   meta:"safety first, no judgment"},
  ]},
  {group:"Who you are", items:[
    {val:"parents",     emoji:"👨‍👧", name:"Parents",          meta:"raising kids"},
    {val:"lgbtq",       emoji:"🏳️‍🌈", name:"LGBTQ+",           meta:"affirming space"},
    {val:"veterans",    emoji:"🎖️", name:"Veterans",         meta:"served & recovering"},
    {val:"women",       emoji:"🌸", name:"Women",            meta:"women's space"},
    {val:"men",         emoji:"🌾", name:"Men",              meta:"men's space"},
    {val:"youngadults", emoji:"🌱", name:"Young adults",     meta:"18–25"},
  ]},
  {group:"Life alongside recovery", items:[
    {val:"work",        emoji:"💼", name:"Work & money",     meta:"jobs, bills, stability"},
    {val:"grief",       emoji:"🤍", name:"Grief & loss",     meta:"holding it together"},
    {val:"relationships",emoji:"💬", name:"Relationships",   meta:"family, partners, trust"},
    {val:"sober_fun",   emoji:"🎈", name:"Sober fun",        meta:"joy without using"},
  ]}
];
const ROOM_META = {};
ROOM_OPTIONS.forEach(g=>g.items.forEach(o=> ROOM_META[o.val]=o));

function currentRoom(){ const c=$("#communityChannels .chip.on"); return c?c.dataset.val:"all"; }
function roomCount(val){ return val==="all" ? POSTS.length : POSTS.filter(p=>p.channel===val).length; }

function buildRoomMenu(){
  const menu=$("#communityDDMenu"); if(!menu) return;
  const cur=currentRoom();
  menu.innerHTML = ROOM_OPTIONS.map(g=>
    '<div class="dd-group">'+g.group+'</div>'+
    g.items.map(o=>{
      const n=roomCount(o.val);
      return '<div class="dd-opt'+(o.val===cur?' sel':'')+'" role="option" data-room="'+o.val+'">'+
        '<span class="dd-emoji">'+commIcon(o.emoji)+'</span>'+
        '<span class="dd-name">'+o.name+(o.member?'<span class="dd-member">yours</span>':'')+'</span>'+
        '<span class="dd-meta">'+(n===1?'1 post':n+' posts')+'</span>'+
        '<svg class="dd-check" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>'+
      '</div>';
    }).join("")
  ).join("");
}
function reflectRoomButton(){
  const o=ROOM_META[currentRoom()]||ROOM_META.all;
  const em=$("#communityDDEmoji"), lb=$("#communityDDLabel"), ct=$("#communityDDCount");
  if(em){ em.innerHTML=commIcon(o.emoji); if(window.lucide&&lucide.createIcons) lucide.createIcons(); }
  if(lb) lb.textContent=o.name;
  if(ct){ const n=roomCount(o.val); ct.textContent = o.val==="all" ? "" : "· "+(n===1?"1 post":n+" posts"); }
}
function setRoom(val){
  const mirror=$("#communityChannels");
  if(mirror){ const chip=mirror.querySelector(".chip"); if(chip){ chip.dataset.val=val; chip.classList.add("on"); } }
  reflectRoomButton();
  renderCommunityFeed();
}
function openRoomDD(open){
  const dd=$("#communityDD"), btn=$("#communityDDBtn");
  if(!dd) return;
  if(open){ buildRoomMenu(); dd.classList.add("open"); btn.setAttribute("aria-expanded","true"); }
  else{ dd.classList.remove("open"); btn.setAttribute("aria-expanded","false"); }
}
(function(){
  const btn=$("#communityDDBtn"), menu=$("#communityDDMenu"), dd=$("#communityDD");
  if(!btn) return;
  btn.addEventListener("click", e=>{ e.stopPropagation(); openRoomDD(!dd.classList.contains("open")); });
  menu.addEventListener("click", e=>{
    const opt=e.target.closest("[data-room]"); if(!opt) return;
    setRoom(opt.dataset.room); openRoomDD(false);
  });
  document.addEventListener("click", e=>{ if(dd.classList.contains("open") && !e.target.closest("#communityDD")) openRoomDD(false); });
})();

/* ── All Rooms · full-list bottom sheet (replaces the inline dropdown that
      could render behind the feed banner) ── */
(function(){
  const scrim=$("#allRoomsScrim"), openBtn=$("#allRoomsBtn"),
        list=$("#allRoomsList"), closeX=$("#allRoomsClose");
  if(!scrim || !openBtn) return;
  function buildList(){
    if(!list) return;
    const cur=currentRoom();
    list.innerHTML = ROOM_OPTIONS.map(g=>
      '<div class="ar-group">'+g.group+'</div>'+
      g.items.map(o=>{
        const n=roomCount(o.val);
        return '<button type="button" class="ar-opt'+(o.val===cur?' sel':'')+'" data-room="'+o.val+'">'+
          '<span class="ar-emoji">'+commIcon(o.emoji)+'</span>'+
          '<span class="ar-main"><span class="ar-name">'+o.name+(o.member?'<span class="ar-member">yours</span>':'')+'</span>'+
          '<span class="ar-meta">'+o.meta+'</span></span>'+
          '<span class="ar-count">'+(o.val==="all"?"":(n===1?"1 post":n+" posts"))+'</span>'+
        '</button>';
      }).join("")
    ).join("");
    if(window.lucide&&lucide.createIcons) lucide.createIcons();
  }
  function show(v){
    if(v) buildList();
    scrim.classList.toggle("on",v);
    scrim.setAttribute("aria-hidden", v?"false":"true");
  }
  openBtn.addEventListener("click", ()=> show(true));
  if(closeX) closeX.addEventListener("click", ()=> show(false));
  scrim.addEventListener("click", e=>{ if(e.target===scrim) show(false); });
  list.addEventListener("click", e=>{
    const opt=e.target.closest("[data-room]"); if(!opt) return;
    setRoom(opt.dataset.room);
    $("#communityFeed")?.scrollIntoView({behavior:"smooth",block:"start"});
    show(false);
  });
})();

/* ── compose "More rooms": pick any room to post into, using a compact sheet ── */
(function(){
  const btn=$("#composeMoreRooms"); if(!btn) return;
  function setComposeTag(val){
    const grid=$("#communityPostTag");
    if(!grid) return;
    // if a chip for this room already exists, select it; otherwise add a temporary one
    let chip=grid.querySelector('.chip[data-val="'+val+'"]');
    if(!chip){
      const m=ROOM_META[val]||{emoji:"💬",name:CHANNEL_LABEL[val]||val};
      chip=document.createElement("button");
      chip.className="chip"; chip.dataset.val=val;
      chip.innerHTML='<em>'+commIcon(m.emoji)+'</em><span>'+(m.name||val).replace(/ .*/,'').slice(0,10)+'</span>';
      grid.appendChild(chip);
      if(window.lucide&&lucide.createIcons) lucide.createIcons();
    }
    grid.querySelectorAll(".chip").forEach(c=>c.classList.remove("on"));
    chip.classList.add("on");
    chip.scrollIntoView({block:"nearest"});
    $("#communityText")?.focus();
  }
  // reuse the room dropdown as the picker, in "compose mode"
  btn.addEventListener("click", e=>{
    e.stopPropagation();
    const dd=$("#communityDD"); if(!dd) return;
    dd.dataset.mode="compose";
    openRoomDD(true);
    $("#communityDDBtn")?.scrollIntoView({block:"center", behavior:"smooth"});
    toast("Pick any room to post into.");
  });
  // intercept selections while in compose mode
  const menu=$("#communityDDMenu");
  if(menu) menu.addEventListener("click", e=>{
    const dd=$("#communityDD");
    if(dd && dd.dataset.mode==="compose"){
      const opt=e.target.closest("[data-room]");
      if(opt){
        e.stopImmediatePropagation();
        const val=opt.dataset.room;
        dd.dataset.mode="";
        openRoomDD(false);
        if(val!=="all") setComposeTag(val);
      }
    }
  }, true);
})();

/* ══════════════════════════════════════════════════════════════════
   ENGAGEMENT LOOP  ·  daily prompt → welcome flow → milestone celebration
   Three additions that share one goal: get people to post, make the first
   post safe, and reward the ones who stay. All state is in-memory (demo).
   ══════════════════════════════════════════════════════════════════ */

/* ── 1) DAILY PROMPT ─────────────────────────────────────────────────
   One rotating question, pinned above the feed. A blank composer is
   intimidating; a specific question is the single biggest lever for
   first-time posting. Answers all land in the "Today's question" room,
   so they cluster into one warm, scannable thread. */
const DAILY_PROMPTS = [
  {q:"What's one small thing getting you through today?", meta:"Even a cup of coffee counts."},
  {q:"What are you grateful for right now — however tiny?", meta:"Name just one."},
  {q:"What's a craving trigger you've learned to see coming?", meta:"Your heads-up might help someone else."},
  {q:"Who or what are you leaning on this week?", meta:"A person, a habit, a place."},
  {q:"What would you tell yourself on day one?", meta:"Someone here is on day one today."},
  {q:"What's a win from this week that no one else would notice?", meta:"The quiet ones matter most."},
  {q:"How are you, actually? One honest line.", meta:"No need to be okay."},
];
// pick a stable prompt for "today" so it doesn't change on every re-render
function dailyIndex(){
  const d = new Date();
  const dayNum = Math.floor(Date.parse(d.toDateString())/8.64e7);
  return ((dayNum % DAILY_PROMPTS.length) + DAILY_PROMPTS.length) % DAILY_PROMPTS.length;
}
let DAILY_ANSWERED = false;
function renderDailyPrompt(){
  const box = $("#communityDaily"); if(box){ box.hidden = true; box.innerHTML=""; }
  return; // Today's Question removed from Community
}
// tapping the prompt opens the composer pre-set to the "daily" room + a hint
document.addEventListener("click", e=>{
  const btn = e.target.closest("#dailyAnswerBtn"); if(!btn) return;
  const p = DAILY_PROMPTS[dailyIndex()];
  openComposer();
  // preselect the "daily" room via the compose tag grid (adds a temp chip if needed)
  const grid = $("#communityPostTag");
  if(grid){
    grid.querySelectorAll(".chip.on").forEach(c=>c.classList.remove("on"));
    let chip = grid.querySelector('.chip[data-val="daily"]');
    if(!chip){
      chip = document.createElement("button");
      chip.className="chip"; chip.dataset.val="daily";
      chip.innerHTML='<em>💬</em><span>Today</span>';
      grid.prepend(chip);
    }
    chip.classList.add("on");
  }
  const ta = $("#communityText");
  if(ta){ ta.placeholder = p.q; setTimeout(()=>ta.focus(), 80); }
  // remember this compose is answering the prompt, so we can flip the card on post
  window.__answeringDaily = true;
});

/* ── 2) NEW-HERE WELCOME ─────────────────────────────────────────────
   The first post is the scariest and the most predictive of whether a
   newcomer stays. This routes them to a dedicated welcome room where a
   peer specialist is GUARANTEED to reply — the warm first reception that
   keeps people coming back. Shown until they've posted at least once. */
function renderWelcome(){
  const el = $("#communityWelcome"); if(!el) return;
  // hide once the person has posted anything themselves
  const hasPosted = POSTS.some(p=>p.mine);
  el.hidden = hasPosted;
}
document.addEventListener("click", e=>{
  const w = e.target.closest("#communityWelcome"); if(!w) return;
  openComposer();
  const grid = $("#communityPostTag");
  if(grid){
    grid.querySelectorAll(".chip.on").forEach(c=>c.classList.remove("on"));
    let chip = grid.querySelector('.chip[data-val="welcome"]');
    if(!chip){
      chip = document.createElement("button");
      chip.className="chip"; chip.dataset.val="welcome";
      chip.innerHTML='<em>👋</em><span>Welcome</span>';
      grid.prepend(chip);
    }
    chip.classList.add("on");
  }
  const ta = $("#communityText");
  if(ta){ ta.placeholder = "Hi — I'm new here. You don't have to say more than that."; setTimeout(()=>ta.focus(), 80); }
  window.__welcomePost = true;
});
// when someone posts into the welcome room, a peer specialist replies within moments
function guaranteeWelcomeReply(post){
  if(!post || post.channel!=="welcome") return;
  post.replies = post.replies || [];
  setTimeout(()=>{
    post.replies.push({
      user:"Marcus T.",
      text:"Welcome — really glad you're here. There's no wrong way to do this and you don't owe anyone your story. I'll be around; reply any time. 🫂"
    });
    // make the peer's reply visible immediately
    if(typeof OPEN_REPLIES!=="undefined") OPEN_REPLIES.add(post.id);
    renderCommunityFeed();
    toast("A peer specialist replied to your welcome 💬");
    if(typeof showReward==="function"){
      showReward({emoji:"👋", title:"Welcome to the community",
        body:"Marcus, a certified peer specialist, replied to your first post. You can message back any time."});
    }
  }, 1600);
}

/* ── 3) MILESTONE CELEBRATIONS ───────────────────────────────────────
   You already track streaks + milestones privately in Rewards. This
   surfaces them, opt-in, as celebration posts the whole room can pile
   onto — public recognition is one of the strongest retention hooks.
   Uses the app's real numbers (VictoryWarrior, 47 days, next at 60). */
function makeMilestonePost({user, avatar, tint, badge, channel, time, days, label, text, hearts, supports, mine}){
  return {
    id: 700000 + Math.floor(Math.random()*99999),   // numeric so react/reply handlers work
    user, avatar, tint: tint||"gold", badge: badge||null,
    channel: channel||"wins", time: time||"Just now",
    milestone:true, mileDays:days, mileLabel:label||(days+" days"),
    text,
    hearts:hearts||0, supports:supports||0, strong:0, pray:0,
    r_heart:false, r_support:false, r_strong:false, r_pray:false,
    replies:[], mine:!!mine
  };
}
// seed a couple of community milestones so the room feels alive on first view
(function seedMilestones(){
  if(POSTS.some(p=>p.milestone)) return;
  POSTS.unshift(makeMilestonePost({
    user:"stepbystep", avatar:"🔵", tint:"blue", channel:"na", time:"35m ago",
    days:90, label:"90 days", hearts:96, supports:61,
    text:"Ninety days today. Ninety. If you're reading this on a hard day — it's built one ordinary day at a time, and every one of them counted. Thank you for being here for it."
  }));
})();
// public API: fire when the current user crosses a milestone (opt-in share).
// Hooked to the real app state: 47 today, next celebration at 60.
function celebrateMyMilestone(days, label){
  const initial = (CURRENT_USERNAME.trim()[0]||"Y").toUpperCase();
  const post = makeMilestonePost({
    user:CURRENT_USERNAME, avatar:initial, tint:"gold", channel:"wins",
    time:"Just now", days, label:label||(days+" days"), mine:true,
    text:"Hit "+days+" days today. Sharing it here because this room saw the hard ones too. 🙏"
  });
  POSTS.unshift(post);
  setRoom("wins");
  renderCommunityFeed();
  renderWelcome();
  if(typeof awardXP==="function") awardXP(XP.cpost, "Shared a milestone");
  toast("Milestone shared — the room can celebrate with you 🎉");
  if(typeof showReward==="function"){
    showReward({emoji:"🎉", title:days+"-day milestone shared",
      body:"Your community can now cheer you on. Public recognition helps the next person believe it's possible too."});
  }
}
window.celebrateMyMilestone = celebrateMyMilestone;

updateCommunityIdentity();
reflectRoomButton();
renderCommunityStrip();
renderRoomBadges();
renderDailyPrompt();
renderWelcome();
renderCommunityFeed();


/* ── start a room: member-created discussion group ── */
(function(){
  const scrim=$("#startRoomScrim"), open=$("#startRoomBtn"),
        name=$("#srName"), desc=$("#srDesc"), create=$("#srCreate"),
        cancel=$("#srCancel"), emojis=$("#srEmojis");
  if(!scrim||!open) return;
  let chosenEmoji="sparkles";
  function show(v){ scrim.classList.toggle("on",v); scrim.setAttribute("aria-hidden", v?"false":"true"); if(v) setTimeout(()=>name.focus(),240); }
  function sync(){ create.disabled = (name.value||"").trim().length<3; }
  open.addEventListener("click", ()=> show(true));
  cancel.addEventListener("click", ()=> show(false));
  const closeX=$("#srClose"); if(closeX) closeX.addEventListener("click", ()=> show(false));
  scrim.addEventListener("click", e=>{ if(e.target===scrim) show(false); });
  name.addEventListener("input", sync);
  emojis.addEventListener("click", e=>{
    const b=e.target.closest("[data-emoji]"); if(!b) return;
    emojis.querySelectorAll("button").forEach(x=>x.classList.remove("on"));
    b.classList.add("on"); chosenEmoji=b.dataset.emoji;
  });
  create.addEventListener("click", ()=>{
    const nm=(name.value||"").trim(); if(nm.length<3) return;
    const val="room_"+Date.now();
    const meta={val, emoji:chosenEmoji, name:nm, meta:(desc.value||"").trim()||"a room you started", member:true};
    // register the room so it appears in the filter + compose paths
    ROOM_META[val]=meta;
    CHANNEL_LABEL[val]=nm;
    let grp=ROOM_OPTIONS.find(g=>g.group==="Rooms members started");
    if(!grp){ grp={group:"Rooms members started", items:[]}; ROOM_OPTIONS.push(grp); }
    grp.items.unshift(meta);
    // seed a warm welcome post from a peer specialist so the room isn't empty
    POSTS.unshift({
      id:Date.now()+1, user:"riverguide", badge:"peer", tint:"sage", avatar:"🕯️",
      channel:val, time:"Just now",
      text:"Welcome to “"+nm+".” You made a place for people to find each other — that matters. I'll be checking in here. First question: what made you want to start this room?",
      hearts:3, supports:1, heartedByMe:false, supportedByMe:false, replies:[]
    });
    // reset + close + jump into the new room
    name.value=""; desc.value=""; sync();
    show(false);
    creditRoomBadge(val);
    if(typeof awardXP==="function") awardXP(XP.croom, "Started a room");
    renderCommunityStrip();
    setRoom(val);
    toast("Room “"+nm+"” is live. A peer specialist will review it.");
    $("#s-community")?.scrollIntoView({behavior:"smooth"});
  });
})();

/* ── entry point for index.html: called whenever the Connect/Community
      overlay is opened, so the feed is fresh and the dropdown is closed. ── */
window.rcRefreshCommunity = function(){
  openRoomDD(false);
  reflectRoomButton();
  renderCommunityStrip();
  renderRoomBadges();
  renderCommunityFeed();
};

})();


/* ===== COMMUNITY HUB: Followers/Friends + Request-a-room ===== */
var FR_FRIENDS=[
  {n:'Daniel Ruiz',h:'@steady_dan',c:'#6E9E80'},{n:'Tasha Brooks',h:'@tasha_b',c:'#4A90D9'},
  {n:'Mike R.',h:'@mike_r',c:'#C97B6F'},{n:'Emily M.',h:'@em_sun',c:'#8A6FB0'},
  {n:'Jack P.',h:'@jackp',c:'#5E8560'},{n:'Sarah M.',h:'@sarah_m',c:'#D8AD63'}
];
var FR_FOLLOWERS=[
  {n:'Phoenix123',h:'@phoenix123',c:'#7BA47E'},{n:'RisingTide',h:'@risingtide',c:'#9C8FC4'},
  {n:'KindredSpirit',h:'@kindred',c:'#7FAAC4'},{n:'NewDawn44',h:'@newdawn44',c:'#D49A78'}
];
var FR_TAB='friends';
function frInitials(n){ return String(n).trim().split(/\s+/).map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase()||'ME'; }
function frRender(){
  var list=document.getElementById('fr-list'); if(!list) return;
  var data=FR_TAB==='friends'?FR_FRIENDS:FR_FOLLOWERS;
  var esf=(typeof esc==='function')?esc:function(s){return s;};
  if(!data.length){ list.innerHTML='<div class="fr-empty">No '+FR_TAB+' yet.</div>'; }
  else { list.innerHTML=data.map(function(p){
    var btn=FR_TAB==='friends'?'<button class="fr-btn on" type="button">Friends</button>'
      :'<button class="fr-btn" type="button" onclick="frFollowBack(this)">Follow back</button>';
    return '<div class="fr-row"><span class="fr-av" style="background:'+p.c+'">'+esf(frInitials(p.n))+'</span>'+
      '<div class="fr-main"><div class="fr-name">'+esf(p.n)+'</div><div class="fr-handle">'+esf(p.h)+'</div></div>'+btn+'</div>';
  }).join(''); }
  var fc=document.getElementById('fr-friends-count'); if(fc) fc.textContent=FR_FRIENDS.length;
  var lc=document.getElementById('fr-followers-count'); if(lc) lc.textContent=FR_FOLLOWERS.length;
}
function frTab(which){
  FR_TAB=which;
  var tabs=document.querySelectorAll('#ov-friends .fr-tab');
  for(var i=0;i<tabs.length;i++) tabs[i].classList.toggle('on',(i===0)===(which==='friends'));
  frRender();
}
function frAddFriend(){
  var inp=document.getElementById('friend-add-input'); if(!inp) return;
  var v=(inp.value||'').trim().replace(/^@/,''); if(!v){ inp.focus(); return; }
  var handle='@'+v.toLowerCase().replace(/\s+/g,'_');
  FR_FRIENDS.unshift({n:v,h:handle,c:'#5B92CE'});
  inp.value=''; frTab('friends');
  if(typeof showXPPopup==='function') showXPPopup(5,'Friend Added!');
}
function frFollowBack(btn){ if(btn){ btn.classList.add('on'); btn.textContent='Following'; btn.onclick=null; } }
function rrSubmit(){
  var name=document.getElementById('rr-name'); var v=((name&&name.value)||'').trim();
  if(!v){ if(name){ name.style.borderColor='#D4736A'; setTimeout(function(){name.style.borderColor='';},1200); name.focus(); } return; }
  var why=document.getElementById('rr-why'); if(name) name.value=''; if(why) why.value='';
  if(typeof closeDetail==='function') closeDetail('request-room');
  if(typeof showXPPopup==='function') showXPPopup(10,'Room Requested!');
}

/* ===== toast shims for ported community subsystems ===== */
window.toast = window.toast || (typeof rlToast==='function' ? rlToast : function(){});
window.rcToast = window.rcToast || window.toast;

/* ===== 1:1 SUPPORT coach finder (ported) ===== */

/* ══════════════════════════════════════════════════════════════════
   FIND SOMEONE TO TALK WITH · coach & peer finder, ported from
   rudra-app_v22.html. Replaces the old "Reach my support team".
   Own closure so nothing here collides with js/app.js.
   ══════════════════════════════════════════════════════════════════ */
(function(){
"use strict";

if(!document.getElementById("s-findcoach")) return;

var $  = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
var toast = function(m){
  if(typeof window.rcToast === "function") return window.rcToast(m);
  console.log(m);
};

/* ── the two panes: results list ⇄ provider profile ── */
function showProviderPane(on){
  var find=$("#s-findcoach"), prov=$("#s-provider"), title=$("#fcTitle");
  if(find) find.hidden = !!on;
  if(prov) prov.hidden = !on;
  if(title) title.textContent = on ? "Profile" : "1:1 Support";
  var b=$(".ov-body", $("#ov-find-coach")); if(b) b.scrollTop = 0;
}
/* header back: profile → list, list → close the overlay */
$("#fcBack").addEventListener("click", function(){
  if(!$("#s-provider").hidden){ showProviderPane(false); return; }
  if(typeof window.closeOv === "function") window.closeOv();
});

/* v22 toggled these from a global controls handler; scoped equivalent.
   Registered first so the finder's re-render below sees the new state. */
document.addEventListener("click", function(e){
  if(!e.target.closest("#s-findcoach")) return;
  var chip = e.target.closest(".chip");
  if(chip) chip.classList.toggle("on");
  var seg = e.target.closest(".seg button");
  if(seg){
    $$("button", seg.parentElement).forEach(function(b){ b.classList.remove("on"); });
    seg.classList.add("on");
  }
});

/* ══════════════ COACH & PEER FINDER ══════════════ */
// tint → hex used to seed matching avatar backgrounds
const TINT_HEX = {blue:"DEEAF4", gold:"FAEFD6", sage:"E1ECE2", coral:"F8E5E2"};
function photoFor(p){
  const style = p.kind==="coach" ? "avataaars" : "identicon"; // coaches: personable illustrated face · peers: abstract, anonymous by design
  const bg = TINT_HEX[p.tint] || "EEEDE8";
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=${bg}&radius=14`;
}
// deterministic demo phone number so Call/Text have something to act on
function phoneFor(p){
  let h=0; for(let i=0;i<p.name.length;i++){ h=(h*31 + p.name.charCodeAt(i))>>>0; }
  const mid = 200 + (h % 800);           // 200–999
  const last = String(h % 10000).padStart(4,"0");
  return `(310) ${mid}-${last}`;
}
const PROVIDERS = [
  {name:"Denise R.", kind:"coach", avatar:"D", tint:"blue", dist:1.4, formats:["inperson","virtual"], cost:["insurance","sliding"], awake:false,
   cred:"CADC-II · 9 yrs · in recovery herself", specs:["mat","parents","trauma"], tags:["Buprenorphine","Moms","Trauma-informed"],
   years:9, langs:["English"], rating:4.9, reviews:112, price:"$70–110 / session · insurance & sliding scale", sessionLen:"50 min, video or in person",
   response:"Usually replies within 3 hours", availability:["Mon–Thu, 9am–6pm","Sat mornings by request"],
   bio:"Denise has been a certified alcohol and drug counselor for nine years and has been in her own recovery for fourteen. She specializes in buprenorphine support and works mostly with parents rebuilding routines around a program — not around perfection.",
   approach:"Structured, plan-first sessions: what worked this week, what didn't, one small adjustment for next week. Homework is optional but she'll ask about it.",
   testimonials:[{text:"She never made me feel behind. Just asked what Tuesday actually looked like.", tag:"Client, 8 months in"}]},
  {name:"quietpine", kind:"peer", avatar:"🌲", tint:"sage", dist:2.1, formats:["virtual","inperson"], cost:["free"], awake:true,
   cred:"Certified peer specialist · 5 yrs · dad of two", specs:["parents","pain","mat"], tags:["Free","Back surgery","Parents"],
   years:5, langs:["English"], rating:4.8, reviews:64, price:"Free — always", sessionLen:"Flexible, 20–45 min, video or in person",
   response:"Usually online within the hour", availability:["Evenings, most nights","Weekend afternoons"],
   bio:"In long-term recovery himself after a back surgery led to a five-year opioid dependence. Now a certified peer specialist who mostly supports other parents juggling work, kids, and a program that has to fit around both.",
   approach:"No worksheets. Just conversation — what's actually hard this week, and what's helped before. He'll share his own story only if it's useful to you.",
   testimonials:[{text:"He gets the 2am kind of hard. Never once made me feel like a case.", tag:"Peer match, 6 months"}]},
  {name:"Marcus T.", kind:"coach", avatar:"M", tint:"coral", dist:3.8, formats:["inperson"], cost:["insurance"], awake:false,
   cred:"Recovery coach · specializes in return-to-work", specs:["mat","veterans"], tags:["Employment","MAT","Veterans"],
   years:11, langs:["English"], rating:4.7, reviews:89, price:"$60–95 / session · most insurance accepted", sessionLen:"45 min, in person only",
   response:"Usually replies within a day", availability:["Tue/Thu afternoons","Fri mornings"],
   bio:"Eleven years coaching people back into steady work after treatment — resumes, disclosure conversations with employers, and the confidence part nobody prepares you for. Veteran-friendly practice.",
   approach:"Practical and goal-oriented. Sessions often end with one concrete task for the week, not just a feeling to sit with.",
   testimonials:[{text:"He helped me figure out what to say to my manager. That conversation had been the whole block.", tag:"Client, 1 year in"}]},
  {name:"tidewalker", kind:"peer", avatar:"🌊", tint:"blue", dist:4.6, formats:["virtual"], cost:["free"], awake:true,
   cred:"Peer specialist · 14 mo · works nights", specs:["mat","youth"], tags:["Free","Night shift","Young adults"],
   years:1, langs:["English"], rating:4.6, reviews:21, price:"Free — always", sessionLen:"Quick check-ins, 15–30 min, video or text",
   response:"Usually online within 15 minutes, overnight", availability:["Overnight, 10pm–6am","Weekend evenings"],
   bio:"Fourteen months into recovery and works a night shift, so he's built his peer support hours around the hours nobody else covers — the 2am kind of hard.",
   approach:"Low-pressure, text-first if that's easier. He'll stay on a call in silence if that's what's needed.",
   testimonials:[{text:"Only person awake at 3am who didn't make it weird that I texted.", tag:"Peer match, 2 months"}]},
  {name:"Carla M.", kind:"coach", avatar:"C", tint:"gold", dist:6.2, formats:["inperson","virtual"], cost:["sliding","free"], awake:false,
   cred:"Bilingüe · CPRS · 7 yrs", specs:["spanish","parents","trauma"], tags:["Español","Sliding scale","Familias"],
   years:7, langs:["English","Español"], rating:4.9, reviews:73, price:"Sliding scale $0–60 / session", sessionLen:"50 min, video or in person",
   response:"Usually replies within 4 hours", availability:["Mon/Wed/Fri, 10am–4pm"],
   bio:"Bilingual certified peer recovery specialist working mostly with parents and families navigating trauma alongside substance use. Sessions run in English or Español, whichever feels like home.",
   approach:"Family-systems informed — she'll ask who else is in the picture, not just what you're carrying alone.",
   testimonials:[{text:"Habla conmigo en español y eso cambió todo. Por fin no tuve que traducirme a mí misma.", tag:"Client, 5 months"}]},
  {name:"emberly", kind:"peer", avatar:"🔥", tint:"coral", dist:7.0, formats:["virtual"], cost:["free"], awake:false,
   cred:"Peer specialist in training · newer than you", specs:["youth","lgbtq"], tags:["Free","LGBTQ+","Early recovery"],
   years:0.5, langs:["English"], rating:4.5, reviews:9, price:"Free — always", sessionLen:"20–30 min, video",
   response:"Usually replies within a day", availability:["Weekday evenings"],
   bio:"Six months into her own recovery and newly training as a peer specialist under supervision. Works mostly with LGBTQ+ young adults early in the process, because she remembers exactly how that felt.",
   approach:"No pressure to have language for anything yet — she didn't either, six months ago.",
   testimonials:[{text:"She's newer, and honestly that's why it felt safe — she wasn't miles ahead of where I am.", tag:"Peer match, 3 weeks"}]},
  {name:"James O.", kind:"coach", avatar:"J", tint:"sage", dist:9.5, formats:["inperson"], cost:["insurance","sliding"], awake:false,
   cred:"LADC · pain-and-recovery focus · 12 yrs", specs:["pain","mat","veterans"], tags:["Chronic pain","Veterans","MAT"],
   years:12, langs:["English"], rating:4.8, reviews:134, price:"$80–120 / session · insurance & sliding scale", sessionLen:"50 min, in person only",
   response:"Usually replies within a day", availability:["Mon–Fri, 8am–2pm"],
   bio:"Twelve years as a licensed alcohol and drug counselor with a focus on chronic pain and MAT — the population most likely to get bounced between providers who won't touch both issues at once.",
   approach:"Coordinates directly with prescribers when a client wants that, so pain management and recovery aren't fighting each other.",
   testimonials:[{text:"First counselor who didn't treat my pain and my recovery like they were in competition.", tag:"Client, 2 years in"}]},
  {name:"northstar", kind:"peer", avatar:"⭐", tint:"gold", dist:11.4, formats:["virtual","inperson"], cost:["free"], awake:true,
   cred:"Certified peer specialist · 3 yrs · LGBTQ+ focus", specs:["lgbtq","trauma","youth"], tags:["Free","LGBTQ+","Trauma"],
   years:3, langs:["English"], rating:5.0, reviews:47, price:"Free — always", sessionLen:"30–45 min, video or in person",
   response:"Usually online within 30 minutes", availability:["Most evenings","Sunday afternoons"],
   bio:"Three years certified, works almost entirely with LGBTQ+ folks whose trauma and substance use are tangled together — often because past providers didn't know how to hold both.",
   approach:"Goes at your pace. Will name the elephant in the room if you want that, or leave it be if you don't.",
   testimonials:[{text:"First person in this whole process who didn't need me to explain myself first.", tag:"Peer match, 10 months"}]},
  {name:"Sofia L.", kind:"coach", avatar:"S", tint:"blue", dist:18.9, formats:["virtual"], cost:["insurance","sliding"], awake:false,
   cred:"Bilingüe · CADC-I · telehealth only", specs:["spanish","parents","mat"], tags:["Español","Virtual","Moms"],
   years:4, langs:["English","Español"], rating:4.7, reviews:38, price:"$50–85 / session · insurance & sliding scale", sessionLen:"45 min, video only",
   response:"Usually replies within a day", availability:["Tue–Thu, 4pm–8pm"],
   bio:"Telehealth-only practice built for people who can't easily get to an office — new moms especially. Sessions run in English or Español.",
   approach:"Short, frequent check-ins rather than one long weekly session, since that's what actually fits around a newborn's schedule.",
   testimonials:[{text:"The only provider who could work around a 2-month-old's nap schedule.", tag:"Client, 3 months"}]},
  {name:"riverbend", kind:"peer", avatar:"🪵", tint:"sage", dist:34.0, formats:["virtual"], cost:["free"], awake:true,
   cred:"Peer specialist · 6 yrs · rural outreach", specs:["mat","pain","veterans"], tags:["Free","Veterans","Chronic pain"],
   years:6, langs:["English"], rating:4.9, reviews:56, price:"Free — always", sessionLen:"30–60 min, video only",
   response:"Usually online within 20 minutes", availability:["Most days, 6am–9pm"],
   bio:"Six years in recovery, focused on rural outreach for people who don't have a single provider within an hour's drive. Works entirely over video, often with veterans managing chronic pain and MAT.",
   approach:"Understands what it's like when the nearest meeting is ninety minutes away — builds a plan around distance, not around an ideal you can't reach.",
   testimonials:[{text:"Nearest peer group is two counties over. He's the reason I didn't have to drive there.", tag:"Peer match, 1 year"}]}
];

function fState(){
  const root = $("#s-findcoach"), sel = s=> $(s, root);
  const on = s=> $$(s+" .on, "+s+" button.on", root);
  return {
    type:   (sel("#fType button.on")||{}).dataset ? sel("#fType button.on").dataset.val : "both",
    format: (sel("#fFormat button.on")||{}).dataset ? sel("#fFormat button.on").dataset.val : "either",
    radius: +((sel("#fRadius .rpill.on")||{}).dataset||{mi:999}).mi,
    cost:   $$("#fCost .chip.on", root).map(b=>b.dataset.val),
    specs:  $$("#fSpec .chip.on", root).map(b=>b.dataset.val),
    langs:  $$("#fLang .chip.on", root).map(b=>b.dataset.val),
    sort:   (sel("#fSort button.on")||{}).dataset ? sel("#fSort button.on").dataset.val : "match",
    awake:  $("#fAwake", root).classList.contains("on")
  };
}
function renderCoaches(){
  const f = fState();
  let list = PROVIDERS.filter(p=>{
    if(f.type!=="both" && p.kind!==f.type) return false;
    if(f.radius!==999 && p.dist>f.radius) return false;
    if(f.format!=="either" && !p.formats.includes(f.format)) return false;
    if(f.cost.length && !f.cost.some(c=>p.cost.includes(c))) return false;
    if(f.awake && !p.awake) return false;
    if(f.specs.length && !f.specs.some(s=>p.specs.includes(s))) return false;
    if(f.langs.length && !f.langs.some(l=>p.langs.includes(l))) return false;
    return true;
  });
  if(f.sort==="near"){ list.sort((a,b)=> a.dist-b.dist); }
  else if(f.sort==="rating"){ list.sort((a,b)=> b.rating-a.rating || a.dist-b.dist); }
  else{
    list.sort((a,b)=>{
      const am=f.specs.filter(s=>a.specs.includes(s)).length, bm=f.specs.filter(s=>b.specs.includes(s)).length;
      return bm-am || a.dist-b.dist;
    });
  }
  const box = $("#coachResults");
  $("#fCount").textContent = list.length + (list.length===1?" match":" matches");
  if(typeof updateFilterMeta==="function") updateFilterMeta();
  if(!list.length){
    box.innerHTML = '<div class="emptybox"><b>No one fits all of that within range.</b>Widen the radius, or drop a filter. Free peer specialists work over video from anywhere — try setting distance to Anywhere.</div>';
    return;
  }
  box.innerHTML = list.map(p=>{
    const ph = phoneFor(p);
    const fmt = p.formats.map(x=> x==="inperson"?"In person":"Virtual").join(" · ");
    const distTxt = p.dist>=999 ? "Video" : (p.dist<50 ? p.dist.toFixed(1)+" mi" : "Far");
    return `<div class="result ${p.kind==="peer"?"peerkind":""}" data-name="${p.name}" tabindex="0" role="button" aria-label="View ${p.name}'s profile">
      <div class="rpic"><img src="${photoFor(p)}" alt="" loading="lazy">${p.awake?'<span class="live"></span>':''}</div>
      <div style="flex:1;min-width:0">
        <div class="rnm">${p.name}<span class="kind ${p.kind==="peer"?"peer":"coach"}">${p.kind==="peer"?"Peer":"Coach"}</span></div>
        <div class="cred">${p.cred}</div>
        <div class="starrow">${starHTML(p.rating)}<span class="rn">${p.rating.toFixed(1)} · ${p.reviews} reviews</span></div>
        <div class="rtags">${p.tags.map(t=>`<span class="rtag">${t}</span>`).join("")}</div>
        <div class="ct-btns" style="display:flex;gap:8px;margin-top:10px">
          <button class="ct-btn ct-call" type="button" onclick="event.stopPropagation();callContact('${p.name.replace(/'/g,"\\'")}','${ph}')"><i data-lucide="phone"></i>Call</button>
          <button class="ct-btn ct-text" type="button" onclick="event.stopPropagation();textContact('${p.name.replace(/'/g,"\\'")}','${ph}')"><i data-lucide="message-circle"></i>Text</button>
        </div>
      </div>
      <div class="rmeta">${distTxt}<s>${fmt}</s>${p.awake?'<s style="color:var(--sage-ink)">Awake now</s>':''}</div>
    </div>`;
  }).join("");
  if(window.lucide && lucide.createIcons) lucide.createIcons();
}
function starHTML(r){
  const full=Math.floor(r), half=(r-full)>=0.5;
  let s="";
  for(let i=0;i<5;i++){ s += `<span class="star ${i<full?'full':(i===full&&half?'half':'')}">★</span>`; }
  return `<span class="stars">${s}</span>`;
}

// one-sentence explainer: what a coach is vs. what a peer specialist is
const TYPE_INFO = {
  coach: "A recovery coach is a trained (often certified) professional you can hire to help build and keep your recovery plan — no lived experience with substance use required.",
  peer:  "A peer support specialist is someone in their own long-term recovery, trained and certified to walk beside you because they've lived what you're living — and it's free."
};
function updateTypeInfo(){
  const box = $("#fTypeExplain"), btn = $("#fType button.on");
  if(!box || !btn) return;
  const val = btn.dataset.val;
  if(val==="both"){ box.classList.remove("on","peer"); box.textContent=""; return; }
  box.textContent = TYPE_INFO[val];
  box.classList.add("on");
  box.classList.toggle("peer", val==="peer");
}

// re-render whenever a finder control changes (runs after generic toggle handlers)
document.addEventListener("click", e=>{
  const root = $("#s-findcoach");
  if(!root || !e.target.closest("#s-findcoach")) return;
  const pill = e.target.closest("#fRadius .rpill");
  if(pill){ $$("#fRadius .rpill", root).forEach(x=>x.classList.remove("on")); pill.classList.add("on"); }
  const srt = e.target.closest("#fSort button");
  if(srt){ $$("#fSort button", root).forEach(x=>x.classList.remove("on")); srt.classList.add("on"); }
  if(e.target.closest("#fType")) updateTypeInfo();
  if(e.target.closest("#fType, #fFormat, #fCost, #fSpec, #fAvail, #fRadius, #fLang, #fSort")) renderCoaches();
});
/* ── collapsible filter card ── */
function setFiltersOpen(open){
  var card=$(".fcard", $("#s-findcoach")), body=$("#fBody"), btn=$("#fToggle");
  if(!card||!body||!btn) return;
  body.hidden = !open;
  card.classList.toggle("closed", !open);
  btn.setAttribute("aria-expanded", open ? "true" : "false");
}
(function(){
  var t=$("#fToggle");
  if(t) t.addEventListener("click", function(){ setFiltersOpen($("#fBody").hidden); });
  setFiltersOpen(false);
})();

// how many filters are on, in words, plus a Clear that only shows when it can do something
function updateFilterMeta(){
  const root=$("#s-findcoach"); if(!root) return;
  const f=fState();
  let n = f.cost.length + f.specs.length + f.langs.length
        + (f.awake?1:0)
        + (f.format!=="either"?1:0) + (f.type!=="both"?1:0);
  const pill=$("#fActive"), clear=$("#fClear");
  if(pill){
    pill.textContent = n ? n+" filter"+(n===1?"":"s")+" on" : "Showing everyone";
    pill.classList.toggle("on", n>0);
  }
  if(clear) clear.classList.toggle("on", n>0);
}
(function(){
  const clear=$("#fClear"); if(!clear) return;
  clear.addEventListener("click", ()=>{
    const root=$("#s-findcoach");
    $$("#fCost .chip, #fSpec .chip, #fLang .chip, #fAvail .chip", root).forEach(c=>c.classList.remove("on"));
    $$("#fFormat button", root).forEach((b,i)=> b.classList.toggle("on", i===0));
    $$("#fType button", root).forEach((b,i)=> b.classList.toggle("on", i===0));
    updateTypeInfo(); renderCoaches();
    toast("Filters cleared");
  });
})();
$("#fUseLoc").addEventListener("click", ()=>{
  $("#fLoc").value = "Near you · Los Angeles";
  $("#fResultLabel").textContent = "Matches near you";
  toast("Using your location. City only — never a precise pin.");
  renderCoaches();
});
$("#fLoc").addEventListener("input", ()=>{
  const v = $("#fLoc").value.trim();
  $("#fResultLabel").textContent = v ? "Matches near "+v.replace(/,.*$/,"") : "Matches near you";
});
// connect buttons (delegated, since results are dynamic)
const circleAdded = new Set();
function addToCircle(name, kind){
  if(circleAdded.has(name)) return; circleAdded.add(name);
  const roster=$("#circleRoster"), inv=$("#circleInviteRow");
  if(!roster||!inv) return;
  const tint = kind==="peer" ? "sage" : "blue";
  const perm = kind==="peer" ? "Anonymous" : "Sessions only";
  const role = kind==="peer" ? "Peer specialist · new" : "Recovery coach · new";
  const av = (name.trim()[0]||"?").toUpperCase();
  const row=document.createElement("div"); row.className="row";
  row.innerHTML='<div class="pic" style="background:var(--'+tint+'-tint);color:var(--'+tint+'-ink)">'+av+'</div>'+
    '<div><div class="nm">'+name+'</div><div class="rl">'+role+'</div></div><div class="perm">'+perm+'</div>';
  roster.insertBefore(row, inv);
}
document.addEventListener("click", e=>{
  const c = e.target.closest(".connect[data-nm]");
  if(!c) return;
  e.stopPropagation();
  const done = c.classList.toggle("done");
  if(done){
    c.textContent = c.dataset.kind==="peer" ? "Message sent" : "Intro requested";
    addToCircle(c.dataset.nm, c.dataset.kind);
    toast((c.dataset.kind==="peer"?"Said hi to ":"Intro requested with ")+c.dataset.nm+" · added to your circle");
  } else c.textContent = c.dataset.label;
});

/* ── open a full profile when a result card (not its connect button) is tapped ── */
function openProfile(name){
  const p = PROVIDERS.find(x=>x.name===name);
  if(!p) return;
  $("#provBody").innerHTML = renderProfileHTML(p);
  if(window.lucide && lucide.createIcons) lucide.createIcons();
  showProviderPane(true);
}
document.addEventListener("click", e=>{
  const card = e.target.closest("#coachResults .result");
  if(!card || e.target.closest(".connect")) return;
  openProfile(card.dataset.name);
});
document.addEventListener("keydown", e=>{
  if(e.key!=="Enter" && e.key!==" ") return;
  const card = e.target.closest && e.target.closest("#coachResults .result");
  if(!card) return;
  e.preventDefault(); openProfile(card.dataset.name);
});
function renderProfileHTML(p){
  const kindLab = p.kind==="peer" ? "Peer support specialist" : "Recovery coach";
  const fmt = p.formats.map(x=> x==="inperson"?"In person":"Virtual").join(" · ");
  const distTxt = p.dist>=999 ? "Video only" : p.dist.toFixed(1)+" mi away";
  return `
    <div class="provhero">
      <img src="${photoFor(p)}" alt="" class="provphoto">
      <div class="provname">${p.name}${p.awake?'<span class="live" style="position:static;display:inline-block;margin-left:8px;vertical-align:middle"></span>':''}</div>
      <span class="kind ${p.kind==="peer"?"peer":"coach"}" style="margin-top:4px">${kindLab}</span>
      <div class="starrow" style="margin-top:9px;justify-content:center">${starHTML(p.rating)}<span class="rn">${p.rating.toFixed(1)} · ${p.reviews} reviews</span></div>
    </div>
    <div class="provstats">
      <div class="pstat"><b>${distTxt}</b><span>${fmt}</span></div>
      <div class="pstat"><b>${p.cred.split("·")[0].trim()}</b><span>${p.years<1?Math.round(p.years*12)+" mo":p.years+" yrs"} experience</span></div>
      <div class="pstat"><b>${p.price.split("·")[0].trim()}</b><span>${p.sessionLen}</span></div>
    </div>
    <div class="card">
      <span class="tag" style="color:var(--blue-ink)"><i style="background:var(--blue)"></i>About</span>
      <p style="margin-top:9px">${p.bio}</p>
    </div>
    <div class="card">
      <span class="tag" style="color:var(--sage-ink)"><i style="background:var(--sage)"></i>How sessions work</span>
      <p style="margin-top:9px">${p.approach}</p>
    </div>
    <div class="card">
      <span class="tag" style="color:var(--gold-ink)"><i style="background:var(--gold-ink)"></i>Details</span>
      <div class="provdetail"><b>Focus areas</b><div class="rtags" style="margin-top:6px">${p.tags.map(t=>`<span class="rtag">${t}</span>`).join("")}</div></div>
      <div class="provdetail"><b>Languages</b><span>${p.langs.join(", ")}</span></div>
      <div class="provdetail"><b>Cost</b><span>${p.price}</span></div>
      <div class="provdetail"><b>Response time</b><span>${p.response}</span></div>
      <div class="provdetail"><b>Typical availability</b><span>${p.availability.join(" · ")}</span></div>
    </div>
    ${p.testimonials.map(t=>`<div class="card blue">
      <p style="font-style:italic;color:var(--blue-ink)">"${t.text}"</p>
      <p style="margin-top:6px;font-size:11.5px;color:var(--blue-ink);font-weight:700">— ${t.tag}</p>
    </div>`).join("")}
    <div class="ct-btns" style="display:flex;gap:10px;margin-top:4px">
      <button class="ct-btn ct-call" type="button" style="flex:1" onclick="callContact('${p.name.replace(/'/g,"\\'")}','${phoneFor(p)}')"><i data-lucide="phone"></i>Call</button>
      <button class="ct-btn ct-text" type="button" style="flex:1" onclick="textContact('${p.name.replace(/'/g,"\\'")}','${phoneFor(p)}')"><i data-lucide="message-circle"></i>Text</button>
    </div>
    <div class="card ink" style="margin-top:14px">
      <p style="font-size:12.2px">Only your city and filters are shared to make this match — never your name, check-ins, or journal, until you choose to share them yourself.</p>
    </div>`;
}
renderCoaches();


/* let index.html refresh the list whenever the overlay is opened */
window.fcRefresh = function(){ showProviderPane(false); renderCoaches(); };

})();



/* ===== FIND A MEETING (NA, ported) ===== */

/* NOTE for engineering handoff:
   Real NA meeting data comes from NA World Services' meeting search, built on
   BMLT (Basic Meeting List Toolkit) — the open-source root-server system NA and
   most regions run (see na.org/meetingsearch). A production build would call a
   BMLT root server's GetSearchResults endpoint (JSON) with the same filters
   below (day, time range, service body/location, formats, weekday) instead of
   reading MOCK_MEETINGS. The data shape here matches BMLT's real fields
   (name, day, time, duration, address/city/state/zip, virtual meeting link/
   phone, and "format" tags like Open/Closed/Discussion/Speaker/etc.) so swapping
   in a live fetch is a drop-in replacement for loadMeetings(). */
(function(){
  "use strict";

  var MOCK_MEETINGS = [
    { id:"m1", name:"Way Out Group", day:2, time:"19:00", dur:60, format:"in-person",
      venue:"St. Andrew's Community Hall", address:"412 5th Ave", city:"New York", state:"NY", zip:"10018", distance:1.2,
      types:["Open","Discussion","Beginner"], lang:"English",
      contact:{name:"Marcus T.", phone:"(212) 555-0143"} },
    { id:"m2", name:"Midnight Serenity", day:5, time:"23:30", dur:60, format:"virtual",
      virtual:{platform:"Zoom", link:"https://zoom.us/j/8813347210", id:"881 334 7210", pw:"9214", phone:"(929) 205-6099,,881334721#"},
      types:["Open","Speaker"], lang:"English",
      contact:{name:"Renee K.", phone:"(646) 555-0110"} },
    { id:"m3", name:"New Freedom Group", day:0, time:"10:00", dur:75, format:"hybrid",
      venue:"Grace Fellowship Church", address:"88 Riverside Dr", city:"Brooklyn", state:"NY", zip:"11201", distance:3.8,
      virtual:{platform:"Zoom", link:"https://zoom.us/j/5567012399", id:"556 701 2399", pw:"4471", phone:"(646) 558-8656,,556701239#"},
      types:["Closed","Step Study"], lang:"English",
      contact:{name:"Diane P.", phone:"(718) 555-0199"} },
    { id:"m4", name:"Keep It Simple", day:1, time:"12:15", dur:45, format:"in-person",
      venue:"Downtown Recovery Center", address:"210 Main St", city:"Los Angeles", state:"CA", zip:"90012", distance:6.4,
      types:["Open","Discussion","Wheelchair"], lang:"English",
      contact:{name:"J. Alvarez", phone:"(213) 555-0122"} },
    { id:"m5", name:"Sunrise Warriors", day:1, time:"06:30", dur:60, format:"virtual",
      virtual:{platform:"Zoom", link:"https://zoom.us/j/2290187744", id:"229 018 7744", pw:"6630", phone:"(669) 900-6833,,229018774#"},
      types:["Open","Men","Beginner"], lang:"English",
      contact:{name:"Coach Dee", phone:"(310) 555-0187"} },
    { id:"m6", name:"Women in the Solution", day:3, time:"18:30", dur:60, format:"hybrid",
      venue:"Hope Chapel Annex", address:"75 Ocean Blvd", city:"Long Beach", state:"CA", zip:"90802", distance:9.1,
      virtual:{platform:"Zoom", link:"https://zoom.us/j/7742210056", id:"774 221 0056", pw:"5581", phone:"(669) 900-6833,,774221005#"},
      types:["Closed","Women","Discussion"], lang:"English",
      contact:{name:"Sandra L.", phone:"(562) 555-0166"} },
    { id:"m7", name:"Loop Lunchtime", day:4, time:"12:00", dur:45, format:"in-person",
      venue:"First Congregational Church", address:"126 Wabash Ave", city:"Chicago", state:"IL", zip:"60603", distance:2.0,
      types:["Open","Literature Study"], lang:"English",
      contact:{name:"Big Mike", phone:"(312) 555-0177"} },
    { id:"m8", name:"Windy City Young People", day:5, time:"20:00", dur:60, format:"virtual",
      virtual:{platform:"Zoom", link:"https://zoom.us/j/3391027744", id:"339 102 7744", pw:"7720", phone:"(312) 626-6799,,339102774#"},
      types:["Open","Young People"], lang:"English",
      contact:{name:"Priya S.", phone:"(773) 555-0140"} },
    { id:"m9", name:"Bayou Beginnings", day:6, time:"09:00", dur:60, format:"in-person",
      venue:"Trinity Recovery House", address:"900 Louisiana St", city:"Houston", state:"TX", zip:"77002", distance:4.5,
      types:["Open","Beginner","Discussion"], lang:"English",
      contact:{name:"Ray O.", phone:"(713) 555-0155"} },
    { id:"m10", name:"Desert Renewal", day:2, time:"17:30", dur:60, format:"hybrid",
      venue:"Sonoran Wellness Center", address:"33 Camelback Rd", city:"Phoenix", state:"AZ", zip:"85013", distance:5.7,
      virtual:{platform:"Zoom", link:"https://zoom.us/j/6612209983", id:"661 220 9983", pw:"3308", phone:"(669) 900-6833,,661220998#"},
      types:["Open","Discussion"], lang:"English",
      contact:{name:"Nadia F.", phone:"(602) 555-0133"} },
    { id:"m11", name:"Liberty Bell Group", day:0, time:"19:00", dur:60, format:"in-person",
      venue:"Old Pine Presbyterian", address:"412 Pine St", city:"Philadelphia", state:"PA", zip:"19107", distance:2.6,
      types:["Closed","Step Study","LGBTQ+"], lang:"English",
      contact:{name:"Aiden R.", phone:"(215) 555-0161"} },
    { id:"m12", name:"Anywhere, Anytime", day:3, time:"14:00", dur:60, format:"virtual",
      virtual:{platform:"Zoom", link:"https://zoom.us/j/1123456789", id:"112 345 6789", pw:"2024", phone:"(646) 558-8656,,112345678#"},
      types:["Open","Discussion","Wheelchair"], lang:"English",
      contact:{name:"NA Helpline Volunteer", phone:"(800) 555-0198"} },
    { id:"m13", name:"Rebuilding Bridges", day:4, time:"18:00", dur:75, format:"hybrid",
      venue:"Riverside Recovery Hall", address:"14 Market St", city:"Newark", state:"NJ", zip:"07102", distance:8.9,
      virtual:{platform:"Zoom", link:"https://zoom.us/j/9945102277", id:"994 510 2277", pw:"1187", phone:"(646) 558-8656,,994510227#"},
      types:["Open","Speaker","Beginner"], lang:"English",
      contact:{name:"Teresa V.", phone:"(973) 555-0121"} },
    { id:"m14", name:"Clean & Serene Sunday", day:0, time:"08:00", dur:45, format:"virtual",
      virtual:{platform:"Zoom", link:"https://zoom.us/j/4471029983", id:"447 102 9983", pw:"8801", phone:"(929) 205-6099,,447102998#"},
      types:["Open","Meditation".replace("Meditation","Discussion")], lang:"Spanish",
      contact:{name:"Lucía M.", phone:"(305) 555-0109"} }
  ];

  var DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var DAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  var state = { format:["all"], days:[], time:["all"], types:[], dist:25, loc:"", sort:"soonest" };
  var addedIds = {}; // meetings the user has added to their plan
  var lastRendered = [];

  function timeSlot(hhmm){
    var h = parseInt(hhmm.split(":")[0],10);
    if(h>=4 && h<12) return "morning";
    if(h>=12 && h<17) return "afternoon";
    if(h>=17 && h<21) return "evening";
    return "late";
  }
  function fmt12(hhmm){
    var p = hhmm.split(":"); var h=parseInt(p[0],10), m=p[1];
    var ap = h>=12 ? "PM" : "AM"; var h12 = h%12; if(h12===0) h12=12;
    return h12+":"+m+" "+ap;
  }
  function minutesUntilNext(day, hhmm){
    var now = new Date();
    var target = new Date(now);
    var p = hhmm.split(":");
    target.setHours(+p[0], +p[1], 0, 0);
    var diffDays = (day - now.getDay() + 7) % 7;
    if(diffDays===0 && target.getTime() < now.getTime()) diffDays = 7;
    target.setDate(target.getDate()+diffDays);
    return Math.round((target.getTime()-now.getTime())/60000);
  }
  function whenLabel(day, hhmm){
    var mins = minutesUntilNext(day, hhmm);
    var lead = mins < 60*20 ? (mins<60*3 && mins>=0 ? "Soon · " : (mins<60*24 ? "Today · " : (mins<60*48 ? "Tomorrow · " : "")))
             : "";
    if(mins>=60*48) lead = DAY_NAMES[day]+"s · ";
    return lead + fmt12(hhmm);
  }

  function matches(m){
    // format
    if(state.format.indexOf("all")<0 && state.format.indexOf(m.format)<0) return false;
    // day
    if(state.days.length && state.days.indexOf(m.day)<0) return false;
    // time of day
    if(state.time.indexOf("all")<0 && state.time.indexOf(timeSlot(m.time))<0) return false;
    // distance — only meaningful for in-person/hybrid
    if(m.format!=="virtual" && m.distance!=null && m.distance>state.dist) return false;
    // location text — matches city/state/zip; virtual meetings always pass (nationwide)
    if(state.loc.trim() && m.format!=="virtual"){
      var q = state.loc.trim().toLowerCase();
      var hay = ((m.city||"")+" "+(m.state||"")+" "+(m.zip||"")).toLowerCase();
      if(hay.indexOf(q)<0) return false;
    }
    // type tags (AND — meeting must include every selected tag)
    if(state.types.length){
      for(var i=0;i<state.types.length;i++){ if(m.types.indexOf(state.types[i])<0) return false; }
    }
    return true;
  }

  function sortList(list){
    if(state.sort==="nearest"){
      return list.slice().sort(function(a,b){
        var da = a.format==="virtual" ? -1 : (a.distance||999);
        var db = b.format==="virtual" ? -1 : (b.distance||999);
        return da-db;
      });
    }
    return list.slice().sort(function(a,b){ return minutesUntilNext(a.day,a.time)-minutesUntilNext(b.day,b.time); });
  }

  function fmtIcon(format){ return format==="in-person" ? "📍" : format==="virtual" ? "💻" : "🔀"; }

  function renderList(){
    var listEl = document.getElementById("naList");
    var countEl = document.getElementById("naCount");
    if(!listEl) return;
    var filtered = sortList(MOCK_MEETINGS.filter(matches));
    lastRendered = filtered;
    countEl.textContent = filtered.length + (filtered.length===1 ? " meeting found" : " meetings found");
    if(!filtered.length){
      listEl.innerHTML = '<div class="na-empty"><b>No meetings match yet</b>Try widening your distance or clearing a filter.</div>';
      return;
    }
    listEl.innerHTML = filtered.map(function(m){
      var where = m.format==="virtual" ? "Virtual · Zoom" : (m.format==="hybrid" ? m.city+", "+m.state+" + Zoom" : m.city+", "+m.state)
                + (m.format!=="virtual" ? " · "+m.distance+" mi" : "");
      var tags = m.types.slice(0,3).map(function(t){ return '<span class="na-tag">'+t+'</span>'; }).join("");
      var extra = m.types.length>3 ? '<span class="na-tag">+'+(m.types.length-3)+'</span>' : "";
      var added = addedIds[m.id] ? '<span class="na-added-pill on">✓ On your plan</span>' : "";
      return '<div class="na-card" data-id="'+m.id+'">'
        + '<div class="na-card-top"><span class="na-fmt '+m.format+'">'+fmtIcon(m.format)+' '+m.format.replace("-"," ")+'</span>'
        + '<span class="na-card-name">'+m.name+'</span></div>'
        + '<div class="na-card-when">'+whenLabel(m.day,m.time)+' · '+m.dur+' min</div>'
        + '<div class="na-card-where">'+where+'</div>'
        + '<div class="na-card-tags">'+tags+extra+'</div>'
        + '<div class="na-card-foot">'+added+'</div>'
        + '</div>';
    }).join("");
  }

  // ── filter wiring ──
  function toggleGroup(containerId, key, exclusive){
    var el = document.getElementById(containerId);
    if(!el) return;
    el.addEventListener("click", function(e){
      var b = e.target.closest("button"); if(!b) return;
      var val = b.dataset.val;
      if(exclusive && val==="all"){
        el.querySelectorAll("button").forEach(function(x){ x.classList.remove("on"); });
        b.classList.add("on"); state[key]=["all"]; renderList(); return;
      }
      if(exclusive) el.querySelector('[data-val="all"]').classList.remove("on");
      b.classList.toggle("on");
      var picked = [].slice.call(el.querySelectorAll("button.on")).map(function(x){return x.dataset.val;});
      if(exclusive && !picked.length){ el.querySelector('[data-val="all"]').classList.add("on"); picked=["all"]; }
      state[key] = picked;
      renderList();
    });
  }
  function toggleDays(){
    var el = document.getElementById("naDays"); if(!el) return;
    el.addEventListener("click", function(e){
      var b = e.target.closest(".na-day"); if(!b) return;
      b.classList.toggle("on");
      state.days = [].slice.call(el.querySelectorAll(".na-day.on")).map(function(x){return +x.dataset.val;});
      renderList();
    });
  }

  function init(){
    toggleGroup("naFormat","format",true);
    toggleGroup("naTime","time",true);
    toggleGroup("naType","types",false);
    toggleDays();

    var loc = document.getElementById("naLoc");
    if(loc) loc.addEventListener("input", function(){ state.loc = loc.value; renderList(); });
    var useLoc = document.getElementById("naUseLoc");
    if(useLoc) useLoc.addEventListener("click", function(){
      if(!navigator.geolocation){ loc.placeholder="Location unavailable — type a city"; return; }
      useLoc.innerHTML = '<i data-lucide="loader-2" style="animation:spin 1s linear infinite"></i>';
      navigator.geolocation.getCurrentPosition(function(){
        loc.value = "Near me"; state.loc=""; // no geocoding in this mock; show all + note
        useLoc.innerHTML = '<i data-lucide="crosshair"></i>'; icons(); renderList();
      }, function(){ useLoc.innerHTML = '<i data-lucide="crosshair"></i>'; icons(); });
    });

    var dist = document.getElementById("naDist"), distVal = document.getElementById("naDistVal");
    if(dist) dist.addEventListener("input", function(){
      state.dist = +dist.value; distVal.textContent = dist.value+" mi";
      dist.style.setProperty("--pct", ((dist.value-dist.min)/(dist.max-dist.min)*100)+"%");
      renderList();
    });

    var moreBtn = document.getElementById("naMoreBtn"), moreBody = document.getElementById("naMoreBody");
    if(moreBtn) moreBtn.addEventListener("click", function(){
      var open = moreBody.hidden;
      moreBody.hidden = !open;
      moreBtn.setAttribute("aria-expanded", open ? "true":"false");
    });

    document.querySelectorAll(".na-sort").forEach(function(b){
      b.addEventListener("click", function(){
        document.querySelectorAll(".na-sort").forEach(function(x){x.classList.remove("on");});
        b.classList.add("on"); state.sort=b.dataset.val; renderList();
      });
    });

    document.getElementById("naList").addEventListener("click", function(e){
      var card = e.target.closest(".na-card"); if(!card) return;
      openDetail(card.dataset.id);
    });

    renderList();
  }

  function icons(){ if(window.lucide && lucide.createIcons) lucide.createIcons(); }

  // ── detail view ──
  function openDetail(id){
    var m = MOCK_MEETINGS.find(function(x){return x.id===id;});
    if(!m) return;
    var box = document.getElementById("naDetail");
    var fmtClass = m.format, fmtLbl = m.format.replace("-"," ");
    var tags = m.types.map(function(t){return '<span class="na-tag">'+t+'</span>';}).join("");

    var whereSection = "";
    if(m.format!=="virtual"){
      whereSection =
        '<div class="na-d-section"><div class="na-d-lbl"><i data-lucide="map-pin"></i>Location</div>'
        + '<div class="na-d-row"><div class="na-d-row-main"><div class="na-d-row-t">'+m.venue+'</div>'
        + '<div class="na-d-row-s">'+m.address+', '+m.city+', '+m.state+' '+m.zip+' · '+m.distance+' mi away</div></div></div>'
        + '<div class="na-d-btnrow"><button class="na-d-btn call" onclick="window.open(\'https://maps.google.com/?q='+encodeURIComponent(m.address+", "+m.city+", "+m.state+" "+m.zip)+'\',\'_blank\')"><i data-lucide="navigation"></i>Directions</button></div>'
        + '</div>';
    }
    var virtualSection = "";
    if(m.virtual){
      virtualSection =
        '<div class="na-d-section"><div class="na-d-lbl"><i data-lucide="video"></i>Join virtually · '+m.virtual.platform+'</div>'
        + '<div class="na-d-row"><div class="na-d-row-main"><div class="na-d-row-t">Meeting link</div><div class="na-d-row-s">'+m.virtual.link+'</div></div>'
        + '<button class="na-d-copy" onclick="naCopy(\''+m.virtual.link+'\',this)"><i data-lucide="copy"></i></button></div>'
        + '<div class="na-d-row"><div class="na-d-row-main"><div class="na-d-row-t">Meeting ID</div><div class="na-d-row-s">'+m.virtual.id+' · Password: '+m.virtual.pw+'</div></div>'
        + '<button class="na-d-copy" onclick="naCopy(\''+m.virtual.id+'\',this)"><i data-lucide="copy"></i></button></div>'
        + '<div class="na-d-row"><div class="na-d-row-main"><div class="na-d-row-t">Phone dial-in</div><div class="na-d-row-s">'+m.virtual.phone+'</div></div>'
        + '<button class="na-d-copy" onclick="naCopy(\''+m.virtual.phone+'\',this)"><i data-lucide="copy"></i></button></div>'
        + '<div class="na-d-btnrow"><a class="na-d-btn join" style="text-decoration:none" href="'+m.virtual.link+'" target="_blank"><i data-lucide="video"></i>Join Zoom</a></div>'
        + '</div>';
    }

    box.innerHTML =
      '<span class="na-d-fmt na-fmt '+fmtClass+'">'+fmtIcon(m.format)+' '+fmtLbl+'</span>'
      + '<h2 class="na-d-title">'+m.name+'</h2>'
      + '<div class="na-d-tags">'+tags+'</div>'
      + '<div class="na-d-section"><div class="na-d-lbl"><i data-lucide="clock"></i>When</div>'
      + '<div class="na-d-row-t">'+DAY_NAMES[m.day]+'s · '+fmt12(m.time)+'</div>'
      + '<div class="na-d-row-s">'+m.dur+' minutes · '+whenLabel(m.day,m.time)+'</div></div>'
      + whereSection + virtualSection
      + '<div class="na-d-section"><div class="na-d-lbl"><i data-lucide="user-round"></i>Host / contact</div>'
      + '<div class="na-d-row"><div class="na-d-row-main"><div class="na-d-row-t">'+m.contact.name+'</div><div class="na-d-row-s">'+m.contact.phone+' · '+m.lang+'</div></div></div>'
      + '<div class="na-d-btnrow">'
      + '<a class="na-d-btn call" style="text-decoration:none" href="tel:'+m.contact.phone.replace(/[^\d+]/g,"")+'"><i data-lucide="phone"></i>Call</a>'
      + '<a class="na-d-btn text" style="text-decoration:none" href="sms:'+m.contact.phone.replace(/[^\d+]/g,"")+'"><i data-lucide="message-circle"></i>Text</a>'
      + '</div></div>'
      + '<button class="na-d-addbtn'+(addedIds[m.id]?" added":"")+'" id="naAddBtn">'
      + (addedIds[m.id] ? '<i data-lucide="check"></i>On your plan · reminder set' : '<i data-lucide="calendar-plus"></i>Add to my plan')
      + '</button>'
      + '<p class="na-d-note">We\'ll remind you before it starts — whether it\'s virtual, hybrid, or in-person.</p>';

    icons();
    document.getElementById("naAddBtn").addEventListener("click", function(){ addToPlan(m); });
    if(typeof window.openOv === "function") window.openOv("na-meeting-detail");
  }

  window.naCopy = function(text, btn){
    if(navigator.clipboard) navigator.clipboard.writeText(text).catch(function(){});
    var orig = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="check"></i>'; icons();
    setTimeout(function(){ btn.innerHTML = orig; icons(); }, 1200);
  };

  // ── add to plan: injects into the matching Today's Plan time slot + sets a reminder ──
  function addToPlan(m){
    if(addedIds[m.id]) return;
    addedIds[m.id] = true;

    var slot = timeSlot(m.time);
    var todKey = slot==="late" ? "evening" : slot; // fold "late" into the evening/tonight bucket
    var host = document.querySelector('.tod[data-tod="'+todKey+'"] .plan');
    if(host){
      var li = document.createElement("li");
      li.className = "na-plan-item";
      li.innerHTML = '<span class="box"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></span>'
        + '<span class="txt">🧭 '+m.name+' (NA)</span>'
        + '<span class="meta">'+fmt12(m.time)+' 🔔</span>';
      li.addEventListener("click", function(){ li.classList.toggle("done"); });
      host.appendChild(li);
    }

    // update card badges + detail button live
    renderList();
    var btn = document.getElementById("naAddBtn");
    if(btn){ btn.classList.add("added"); btn.innerHTML = '<i data-lucide="check"></i>On your plan · reminder set'; icons(); }

    if(typeof window.toast === "function") window.toast("Added to your plan · reminder set");
    try{ document.dispatchEvent(new CustomEvent("rudra:meeting-added", {detail:m})); }catch(_){}
  }

  window.addEventListener("load", init);

  /* ── safety net: guarantee the Meeting details back button works ──
     If the app's closeTopOv isn't available (or leaves the detail on top),
     directly close the detail overlay so the meetings list shows underneath. */
  window.addEventListener("load", function(){
    var origCloseTop = window.closeTopOv;
    window.closeTopOv = function(name){
      if(typeof origCloseTop === "function"){
        try{ origCloseTop.apply(this, arguments); }catch(_){}
      }
      if(name === "na-meeting-detail"){
        var d = document.getElementById("ov-na-meeting-detail");
        if(d){ d.classList.remove("open"); d.setAttribute("aria-hidden","true"); }
        var list = document.getElementById("ov-na-meetings");
        if(list && !list.classList.contains("open")){
          if(typeof window.openOv === "function") window.openOv("na-meetings");
          else { list.classList.add("open"); list.setAttribute("aria-hidden","false"); }
        }
      }
    };
  });
})();

