(function(){
"use strict";
const BRANDS = window.BRANDS;

/* ---------- data ---------- */

const TOTAL = BRANDS.length;

/* every line a brand has used, tagged */
const ENTRIES = [];
BRANDS.forEach((b,i)=>{
  ENTRIES.push({bi:i, t:b.l, k:b.k||"", main:true});
  (b.also||[]).forEach(a=>ENTRIES.push({bi:i, t:a[0], k:a[1], main:false}));
});

const STOP = new Set("the a an to of for with and on at is it its it's we you your our that what what's where here there be by in this let are 1 accenture".split(" "));
const LEMMA = {building:"build",realized:"realize",reinvented:"reinvent",reinventing:"reinvent",engineered:"engineer",engineering:"engineer",
  transformation:"transform",changing:"change",shaping:"shape",making:"make",working:"work","life's":"life",solved:"solve",solving:"solve",
  technologies:"technology",accelerating:"accelerate",supercharging:"supercharge",trusted:"trust",helping:"help",smarter:"smart",
  ambitions:"ambition",powered:"power",invented:"invent",happens:"happen","world's":"world",matters:"matter"};

function tokens(text){
  return text.toLowerCase().replace(/[#_.,!?:;“”"]/g," ").split(/[\s\-]+/).filter(Boolean);
}
const ROOTS = new Map(); // root -> {brands:Set, variants:Set}
ENTRIES.forEach(e=>{
  tokens(e.t).forEach(w=>{
    if(STOP.has(w)) return;
    const r = LEMMA[w] || w;
    if(!ROOTS.has(r)) ROOTS.set(r,{brands:new Set(), variants:new Set()});
    const o = ROOTS.get(r); o.brands.add(e.bi); o.variants.add(w);
  });
});
const brandCount = r => ROOTS.has(r) ? ROOTS.get(r).brands.size : 0;
const SHARED_WORDS = [...ROOTS.entries()].filter(([,o])=>o.brands.size>1)
  .sort((a,b)=>b[1].brands.size-a[1].brands.size || a[0].localeCompare(b[0])).map(([r])=>r);

const PHRASES = [
 {d:"… what’s next.", re:/what's next|your next|the next/i},
 {d:"… the future …", re:/the future/i},
 {d:"Get … the future …", re:/\bget\b[^.]*?future/i},
 {d:"… progress.", re:/progress/i},
 {d:"… possible.", re:/possible/i},
 {d:"The … Company.", re:/\bthe\b.*company/i},
 {d:"… AI …", re:/\bAI\b/},
 {d:"Engineered …", re:/engineer\w*/i},
 {d:"… Together.", re:/together/i},
 {d:"… for life.", re:/\blife('s)?\b/i},
 {d:"Build …", re:/\bbuild\w*/i},
 {d:"… better …", re:/better/i},
 {d:"Make it …", re:/\bmak(e|ing)\b/i},
 {d:"Shape …", re:/\bshap\w*/i},
 {d:"Reinvent …", re:/reinvent\w*/i},
 {d:"Transform …", re:/transform\w*/i},
 {d:"… change.", re:/\bchang\w*/i},
 {d:"… work …", re:/\bwork(ing)?\b/i},
 {d:"… happens here.", re:/happens/i},
 {d:"Consider it solv…", re:/\bsolv\w*/i},
 {d:"Realize …", re:/reali[sz]\w*/i},
 {d:"Let’s …", re:/let's/i},
 {d:"… every …", re:/\bevery\b/i},
 {d:"We create …", re:/\bcreate\b/i}
].map(p=>{
  const hits = ENTRIES.filter(e=>p.re.test(e.t));
  return {...p, hits, brands:new Set(hits.map(h=>h.bi))};
}).filter(p=>p.brands.size>1)
  .sort((a,b)=>b.brands.size-a.brands.size);

/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const shuffleArr = a => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function highlight(text, re){
  const g = new RegExp(re.source, re.flags.includes("g")?re.flags:re.flags+"g");
  return esc(text).replace(g, m=>`<mark>${m}</mark>`);
}
function wordRegex(root){
  const v = [...ROOTS.get(root).variants].sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  return new RegExp(`(?<![\\w'])(${v.join("|")})(?![\\w'])`,"i");
}

/* ---------- intro stat ---------- */
(function(){
  const shared = new Set(); SHARED_WORDS.forEach(r=>ROOTS.get(r).brands.forEach(b=>shared.add(b)));
  $("intro").innerHTML = `Fifty B2B brands. Fifty chances to say something only they could say. <strong>${shared.size} of them</strong> share at least one word with someone else on this list.`;
})();

/* ---------- room ---------- */
$("room").innerHTML = BRANDS.map((b,i)=>`<span data-i="${i}">${esc(b.n)}</span>`).join("");
const roomSpans = [...$("room").children];
function lightRoom(set){
  roomSpans.forEach((s,i)=>s.classList.toggle("on", set.has(i)));
  $("roomCount").textContent = `${set.size} of ${TOTAL} lit`;
}

/* ---------- hero ---------- */
let mode = "lines", current = null;

function fmt(t){ return esc(t).replace(/…/g,'<span class="gap">…</span>'); }
function renderEcho(text, n){
  const stage = $("stage"), g = $("ghosts");
  const layers = Math.min(Math.max(n-1,0), 9);
  const w = window.innerWidth;
  const step = w < 600 ? 7 : w < 1000 ? 11 : 16;
  g.innerHTML = "";
  for(let i=layers;i>=1;i--){
    const d = document.createElement("div");
    d.className = "ph ghost";
    d.innerHTML = fmt(text);
    d.dataset.tx = (i*step)+"px"; d.dataset.ty = (i*step*0.62)+"px";
    d.style.opacity = String(Math.max(0.3, 1 - (i-1)*0.1));
    g.appendChild(d);
  }
  $("phrase").innerHTML = fmt(text);
  if(reduced){
    [...g.children].forEach(d=>d.style.transform=`translate(${d.dataset.tx},${d.dataset.ty})`);
    stage.classList.remove("fresh"); return;
  }
  stage.classList.add("fresh");
  void stage.offsetWidth;
  requestAnimationFrame(()=>{
    stage.classList.remove("fresh");
    [...g.children].forEach(d=>d.style.transform=`translate(${d.dataset.tx},${d.dataset.ty})`);
  });
}

function showLine(p){
  current = p;
  renderEcho(p.d, p.brands.size);
  $("count").innerHTML = `<b>${p.brands.size}</b> of ${TOTAL} brands have used this line`;
  $("evHead").innerHTML = `Who said it <span>(${p.hits.length} line${p.hits.length>1?"s":""})</span>`;
  $("evidence").innerHTML = p.hits.map(h=>lineItem(h, p.re)).join("");
  lightRoom(p.brands);
  markStrip();
}
function showWord(root){
  current = root;
  const o = ROOTS.get(root); const re = wordRegex(root);
  const hits = ENTRIES.filter(e=>re.test(e.t));
  renderEcho(root, o.brands.size);
  $("count").innerHTML = `<b>${o.brands.size}</b> of ${TOTAL} brands have claimed this word`;
  $("evHead").innerHTML = `Who said it <span>(${hits.length} line${hits.length>1?"s":""})</span>`;
  $("evidence").innerHTML = hits.map(h=>lineItem(h, re)).join("");
  lightRoom(o.brands);
  markStrip();
}
function lineItem(h, re){
  return `<li><span class="b">${esc(BRANDS[h.bi].n)}</span><span class="t">${highlight(h.t, re)}${h.k?`<span class="k">${esc(h.k)}</span>`:""}</span></li>`;
}

function buildStrip(){
  const strip = $("strip");
  if(mode==="lines"){
    strip.innerHTML = PHRASES.map((p,i)=>`<button type="button" data-p="${i}" style="font-size:${(1+p.brands.size*0.09).toFixed(2)}rem">${esc(p.d)}<sup>${p.brands.size}</sup></button>`).join("");
  } else {
    strip.innerHTML = SHARED_WORDS.map(r=>`<button type="button" data-w="${esc(r)}" style="font-size:${(1+brandCount(r)*0.1).toFixed(2)}rem">${esc(r)}<sup>${brandCount(r)}</sup></button>`).join("");
  }
}
function markStrip(){
  [...$("strip").children].forEach(b=>{
    const on = mode==="lines" ? PHRASES[+b.dataset.p]===current : b.dataset.w===current;
    b.setAttribute("aria-current", on?"true":"false");
  });
}
$("strip").addEventListener("click", e=>{
  const b = e.target.closest("button"); if(!b) return;
  if(b.dataset.p!==undefined) showLine(PHRASES[+b.dataset.p]); else showWord(b.dataset.w);
});

function setMode(m, value){
  mode = m;
  $("mLines").setAttribute("aria-pressed", m==="lines");
  $("mWords").setAttribute("aria-pressed", m==="words");
  buildStrip();
  if(m==="lines") showLine(value || PHRASES[0]);
  else showWord(value || SHARED_WORDS[0]);
}
$("mLines").addEventListener("click", ()=>setMode("lines"));
$("mWords").addEventListener("click", ()=>setMode("words"));
$("shuffle").addEventListener("click", ()=>{
  if(mode==="lines"){ let p; do{p=pick(PHRASES);}while(p===current && PHRASES.length>1); showLine(p); }
  else { let w; do{w=pick(SHARED_WORDS);}while(w===current && SHARED_WORDS.length>1); showWord(w); }
});
let rz; window.addEventListener("resize", ()=>{ clearTimeout(rz); rz=setTimeout(()=>{ mode==="lines"?showLine(current):showWord(current); },200); });

/* ---------- territories ---------- */
const TERR = [
 {n:"Forward", g:"The future, what’s next, tomorrow, beyond.", r:["future","next","tomorrow","beyond"]},
 {n:"Makers", g:"Build, make, create, engineer, shape, invent.", r:["build","make","create","engineer","shape","invent","write","ingenuity","outcreate"]},
 {n:"Momentum", g:"Speed, progress, acceleration, outrunning.", r:["speed","faster","accelerate","outrun","advance","progress","supercharge","drive","rise","scale","grow"]},
 {n:"Better world", g:"Life, people, impact, a better everything.", r:["better","impact","difference","life","world","human","people","person","planet","safer"]},
 {n:"Change", g:"Transform, reinvent, change.", r:["transform","reinvent","change","new","imagine"]},
 {n:"Reassurance", g:"Belief, trust, confidence, it’s solved.", r:["belief","confidence","trust","certainty","solve","realize","ambition"]},
 {n:"AI and data", g:"The new default noun.", r:["ai","data","cloud","intuition","smart"]}
].map(t=>{
  const brands = new Set(); t.r.forEach(r=>{ if(ROOTS.has(r)) ROOTS.get(r).brands.forEach(b=>brands.add(b)); });
  const res = t.r.filter(r=>ROOTS.has(r)).map(r=>wordRegex(r).source);
  const re = new RegExp(res.join("|"),"i");
  return {...t, brands, re, hits:ENTRIES.filter(e=>re.test(e.t))};
}).sort((a,b)=>b.brands.size-a.brands.size);

$("terr").innerHTML = TERR.map((t,i)=>{
  const ticks = BRANDS.map((_,bi)=>`<i class="${t.brands.has(bi)?"on":""}"></i>`).join("");
  return `<li><button type="button" class="trow" aria-expanded="false" aria-controls="tb${i}" data-t="${i}">
      <span class="nm">${esc(t.n)}</span><span class="gl">${esc(t.g)}</span><span class="ct">${t.brands.size}</span>
      <span class="ticks" aria-hidden="true">${ticks}</span>
    </button>
    <div class="tbody" id="tb${i}" hidden><ul class="lines">${t.hits.map(h=>lineItem(h,t.re)).join("")}</ul></div></li>`;
}).join("");
$("terr").addEventListener("click", e=>{
  const b = e.target.closest(".trow"); if(!b) return;
  const open = b.getAttribute("aria-expanded")==="true";
  b.setAttribute("aria-expanded", String(!open));
  $("tb"+b.dataset.t).hidden = open;
});

/* ---------- generator ---------- */
const V = [["build","Build"],["shape","Shape"],["transform","Transform"],["reinvent","Reinvent"],["realize","Realize"],["make","Make"],["create","Create"],["accelerate","Accelerate"],["navigate","Navigate"],["inspire","Inspire"],["empower","Empower"],["get","Get"],["engineer","Engineer"]];
const O = [["future","future"],["everyday","everyday"],["world","world"]];
const C = [["together","Together."],["faster","Faster."],["speed","At speed."],["confidence","With confidence."],["life","For life."],["all","For all."],["scale","At scale."],["better","Better."],["progress","Progress."]];
const ADJ = [["engineer","Engineered"],["invent","Invented"],["build","Built"],["make","Made"]];
const O2 = [["life","life"],["progress","progress"],["people","people"],["change","change"],["all","all"],["work","work"]];
const ok = list => list.filter(x=>brandCount(x[0])>0);

function tok(root, text){ return {r:root, t:text}; }
function splitCloser(c){ // "With confidence." -> plain "With " + token "confidence."
  const parts = c[1].split(" ");
  if(parts.length===1) return [tok(c[0], c[1])];
  return [{t:parts.slice(0,-1).join(" ")+" "}, tok(c[0], parts[parts.length-1])];
}
let lastGen = "";
function writeTagline(){
  let seq, key;
  do{
    const t = Math.random();
    if(t < .45){
      const v=pick(ok(V)), o=pick(ok(O)), c=pick(ok(C));
      seq=[tok(v[0],v[1]),{t:" the "},tok(o[0],o[1]+"."),{t:" "},...splitCloser(c)];
    } else if(t < .75){
      const v=pick(ok(V)), c=pick(ok(C));
      seq=[tok(v[0],v[1]),{t:" what’s "},tok("next","next."),{t:" "},...splitCloser(c)];
    } else {
      const a=pick(ok(ADJ)), o=pick(ok(O2));
      seq=[tok(a[0],a[1]),{t:" for "},tok(o[0],o[1]+".")];
    }
    key = seq.map(s=>s.t).join("");
  } while(key===lastGen);
  lastGen = key;
  $("gen").innerHTML = seq.map(s=> s.r
    ? `<button type="button" class="tok" data-w="${esc(s.r)}" aria-label="${esc(s.t)} — used by ${brandCount(s.r)} brand${brandCount(s.r)>1?"s":""}">${esc(s.t)}<sup>${brandCount(s.r)}</sup></button>`
    : esc(s.t)).join("");
}
$("genBtn").addEventListener("click", writeTagline);
$("gen").addEventListener("click", e=>{
  const b = e.target.closest(".tok"); if(!b) return;
  setMode("words", b.dataset.w);
  $("stage").scrollIntoView({block:"start"});
});

/* ---------- quiz ---------- */
let qScore=0, qTotal=0, qDeck=shuffleArr(BRANDS.map((_,i)=>i)), qPos=0;
function mask(b){ return b.l.replace(new RegExp(b.n,"gi"),"_____"); }
function nextQuestion(){
  if(qPos>=qDeck.length){ qDeck=shuffleArr(qDeck); qPos=0; }
  const bi = qDeck[qPos++], b = BRANDS[bi];
  const same = shuffleArr(BRANDS.map((_,i)=>i).filter(i=>i!==bi && BRANDS[i].s===b.s)).slice(0,2);
  const rest = shuffleArr(BRANDS.map((_,i)=>i).filter(i=>i!==bi && !same.includes(i))).slice(0,3-same.length);
  const opts = shuffleArr([bi,...same,...rest]);
  $("qline").textContent = `“${mask(b)}”`;
  $("opts").innerHTML = opts.map(i=>`<button type="button" data-i="${i}">${esc(BRANDS[i].n)}</button>`).join("");
  $("opts").dataset.answer = bi;
  $("fb").textContent = ""; $("qNext").hidden = true;
}
$("opts").addEventListener("click", e=>{
  const btn = e.target.closest("button"); if(!btn || btn.disabled) return;
  const ans = +$("opts").dataset.answer, chose = +btn.dataset.i, b = BRANDS[ans];
  qTotal++; if(chose===ans) qScore++;
  [...$("opts").children].forEach(x=>{
    x.disabled = true;
    if(+x.dataset.i===ans) x.classList.add("right");
    else if(x===btn) x.classList.add("wrong");
  });
  // who else shares a word with this line
  const cousins = new Set();
  tokens(b.l).forEach(w=>{ if(STOP.has(w)) return; const r=LEMMA[w]||w; if(ROOTS.has(r)) ROOTS.get(r).brands.forEach(x=>{ if(x!==ans) cousins.add(x); }); });
  const cl = [...cousins].slice(0,4).map(i=>BRANDS[i].n);
  const lead = chose===ans ? "<b>Right.</b> " : `<b>It was ${esc(b.n)}.</b> `;
  $("fb").innerHTML = lead + (cl.length ? `Easy to mix up: ${esc(cl.join(", "))} use${cl.length===1?"s":""} some of the same words.` : "Nobody else on the list shares a word with this one.");
  $("qNext").hidden = false;
  $("score").textContent = `${qScore} of ${qTotal} right`;
  $("qNext").focus({preventScroll:true});
});
$("qNext").addEventListener("click", nextQuestion);

/* ---------- loners ---------- */
(function(){
  const out=[]; const DULL=new Set(["keep","put","see","time","want","help","global","power"]);
  ROOTS.forEach((o,r)=>{
    if(o.brands.size!==1 || DULL.has(r)) return;
    const bi=[...o.brands][0], b=BRANDS[bi];
    if(b.k) return; // skip mission/purpose/earlier-only brands
    if(!tokens(b.l).some(w=>(LEMMA[w]||w)===r)) return; // current line only
    out.push([r,b.n]);
  });
  out.sort((a,b)=>a[0].localeCompare(b[0]));
  $("loners").innerHTML = out.map(([w,n])=>`<span><em>${esc(w)}</em><small>${esc(n)}</small></span>`).join("");
})();

/* ---------- start ---------- */
setMode("lines", PHRASES[0]);
writeTagline();
nextQuestion();
})();
