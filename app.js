/*
  Simulazione schermata di blocco per un numero di mentalismo.

  PRIVACY — come funziona il conteggio:
  I tasti del tastierino NON sanno quale numero rappresentano: il codice qui sotto
  non legge mai la cifra premuta. Ogni pressione aumenta soltanto un contatore
  (quanti pallini sono pieni). Non esiste alcuna variabile che contenga le cifre,
  quindi non c'è niente da salvare, copiare o inviare. In più la pagina ha una
  regola di sicurezza (Content-Security-Policy, in index.html) che blocca
  qualsiasi richiesta di rete. Nessun localStorage, nessun cookie, nessun analytics.
*/
(() => {
  'use strict';

  const C = window.CONFIG;
  const W = 393, H = 852;
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage');
  const wall = $('#wall'), dim = $('#dim'), lock = $('#lock'), quick = $('#quick');
  const pass = $('#pass'), home = $('#home'), island = $('#island');
  const dotsEl = $('#dots'), keysEl = $('#keys');
  const DIM_MAX = 0.40;          // oscuramento sfondo col tastierino (misurato dagli screenshot)
  const TRAVEL = 300;            // punti di trascinamento per aprire del tutto

  /* ---------------- adattamento allo schermo ---------------- */
  let scale = 1, offX = 0, offY = 0;
  function fitStage() {
    const vw = window.innerWidth, vh = window.innerHeight;
    scale = Math.min(vw / W, vh / H);
    if (Math.abs(vw - W) < 2 && vh >= H - 2) scale = 1;   // iPhone 15 Pro a schermo intero
    offX = (vw - W * scale) / 2;
    offY = scale === 1 ? 0 : (vh - H * scale) / 2;
    stage.style.transform = `translate(${offX}px, ${offY}px) scale(${scale})`;
  }
  window.addEventListener('resize', fitStage);
  fitStage();
  const toStage = (e) => ({ x: (e.clientX - offX) / scale, y: (e.clientY - offY) / scale });

  /* ---------------- misura del testo (per replicare le larghezze degli screenshot) ---------------- */
  const FONT = '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif';
  const cv = document.createElement('canvas').getContext('2d');
  function measure(text, size, weight) {
    cv.font = `${weight} ${size}px ${FONT}`;
    const m = cv.measureText(text);
    const ink = (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width);
    return { adv: m.width, ink: ink || m.width };
  }
  function factor(refText, size, weight, targetInk) {
    const s = targetInk / measure(refText, size, weight).ink;
    return Math.min(1.35, Math.max(0.72, s));
  }
  function setFitted(els, text, size, weight, s) {
    const len = (measure(text, size, weight).adv * s).toFixed(2);
    els.forEach((el) => {
      el.textContent = text;
      el.setAttribute('textLength', len);
      el.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    });
  }

  /* ---------------- orologio e data ---------------- */
  const GG = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const MM = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  const GGL = ['DOMENICA', 'LUNEDÌ', 'MARTEDÌ', 'MERCOLEDÌ', 'GIOVEDÌ', 'VENERDÌ', 'SABATO'];
  const clockEls = [$('#clkClip'), $('#clkShadowT'), $('#clkRim')];
  const dateEl = $('#dateText'), dowEl = $('#homeDow'), dayEl = $('#homeDay');

  function applyTypeSettings() {
    const o = C.orologio, d = C.data;
    clockEls.forEach((el) => {
      el.style.fontSize = o.dimensione + 'px';
      el.style.fontWeight = o.peso;
    });
    $('#clkClip').setAttribute('y', o.baseline);
    $('#clkRim').setAttribute('y', o.baseline);
    $('#clkShadowT').setAttribute('y', o.baseline + 1.8);
    const b = o.baseline;
    $('#clockG').setAttribute('transform', `translate(0 ${b}) scale(1 ${o.altezza}) translate(0 ${-b})`);
    dateEl.style.fontSize = d.dimensione + 'px';
    dateEl.style.fontWeight = d.peso;
    dateEl.setAttribute('y', d.baseline);
    lastKey = '';
    tick();
  }

  let lastKey = '';
  function tick() {
    const now = new Date();
    const h = C.zeroIniziale ? String(now.getHours()).padStart(2, '0') : String(now.getHours());
    const t = h + ':' + String(now.getMinutes()).padStart(2, '0');
    const key = t + now.getDate();
    if (key === lastKey) return;
    lastKey = key;
    const o = C.orologio, d = C.data;
    setFitted(clockEls, t, o.dimensione, o.peso, factor('22:50', o.dimensione, o.peso, o.larghezza));
    const ds = `${GG[now.getDay()]} ${now.getDate()} ${MM[now.getMonth()]}`;
    setFitted([dateEl], ds, d.dimensione, d.peso, factor('Mar 29 set', d.dimensione, d.peso, d.larghezza));
    if (C.dataDinamicaHome) {
      setFitted([dowEl], GGL[now.getDay()], 11.6, 600, factor('MARTEDÌ', 11.6, 600, 48.3));
      setFitted([dayEl], String(now.getDate()), 34.5, 400, factor('29', 34.5, 400, 36.3));
    }
  }
  setInterval(tick, 1000);

  /* ---------------- tastierino ---------------- */
  const LABELS = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ', ''];
  const COLS = [95, 196.7, 298], ROWS = [332, 427.7, 523.3, 619];
  const R = 76.3 / 2, MAG = 1.18, EDGE = 0.72, PAD = 9;   // ingrandimento e sfocatura stimati dagli screenshot
  const NS = 'http://www.w3.org/2000/svg';

  LABELS.forEach((letters, i) => {
    // L'etichetta è solo grafica: il tasto non memorizza il proprio numero.
    const glyph = String((i + 1) % 10);
    const cx = i === 9 ? COLS[1] : COLS[i % 3];
    const cy = i === 9 ? ROWS[3] : ROWS[Math.floor(i / 3)];
    const k = document.createElement('div');
    k.className = 'key';
    k.style.left = cx + 'px';
    k.style.top = cy + 'px';
    const lens = document.createElement('div');
    lens.className = 'lens';
    lens.style.backgroundSize = `${W * MAG}px ${H * MAG}px`;
    lens.style.backgroundPosition = `${R + PAD - cx * MAG}px ${R + PAD - cy * MAG}px`;
    k.appendChild(lens);
    // bordo: rifrazione del vetro, mostra compresso ciò che sta appena fuori dal tasto
    const edge = document.createElement('div');
    edge.className = 'edge';
    edge.style.backgroundSize = `${W * EDGE}px ${H * EDGE}px`;
    edge.style.backgroundPosition = `${R + PAD - cx * EDGE}px ${R + PAD - cy * EDGE}px`;
    k.appendChild(edge);
    ['tint', 'rim', 'flash'].forEach((c) => { const d = document.createElement('div'); d.className = c; k.appendChild(d); });
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 76.3 76.3');
    const t1 = document.createElementNS(NS, 'text');
    t1.setAttribute('class', 'kd');
    t1.setAttribute('x', R);
    t1.setAttribute('y', i === 9 ? R + 13.2 : R + 6.5);
    t1.setAttribute('text-anchor', 'middle');
    t1.textContent = glyph;
    svg.appendChild(t1);
    if (letters) {
      const t2 = document.createElementNS(NS, 'text');
      t2.setAttribute('class', 'kl');
      t2.setAttribute('x', R + 1.5);
      t2.setAttribute('y', R + 20.4);
      t2.setAttribute('text-anchor', 'middle');
      t2.textContent = letters;
      svg.appendChild(t2);
    }
    k.appendChild(svg);
    keysEl.appendChild(k);
    k.addEventListener('pointerdown', onKeyDown);
  });

  let digits = C.cifreIniziali === 6 ? 6 : 4;
  let filled = 0;      // quanti pallini sono pieni: è l'UNICA informazione che teniamo
  let attempts = 0;    // tentativi completati in questa sessione
  let busy = false;
  let hapticPending = false;

  function buildDots() {
    dotsEl.innerHTML = '';
    const gap = C.spaziaturaPallini[digits];
    const start = 196.2 - gap * (digits - 1) / 2;
    for (let i = 0; i < digits; i++) {
      const d = document.createElement('div');
      d.className = 'dot';
      d.style.left = (start + gap * i) + 'px';
      dotsEl.appendChild(d);
    }
  }
  function renderDots() {
    [...dotsEl.children].forEach((d, i) => d.classList.toggle('on', i < filled));
    updateCancel();
  }

  const cancelEl = $('#btnCancel');
  let cancelS = 1;
  function updateCancel() {
    const txt = filled > 0 ? 'Elimina' : 'Annulla';
    if (cancelEl.textContent !== txt || !cancelEl.hasAttribute('textLength')) setFitted([cancelEl], txt, 15.5, 400, cancelS);
  }

  function onKeyDown(e) {
    e.stopPropagation();
    if (state !== 'pass' || busy) return;
    const k = e.currentTarget;
    k.classList.add('down');
    const up = () => { k.classList.remove('down'); fireHaptic(); };
    k.addEventListener('pointerup', up, { once: true });
    k.addEventListener('pointercancel', up, { once: true });
    k.addEventListener('pointerleave', up, { once: true });

    if (filled >= digits) return;
    filled++;
    renderDots();
    if (filled === digits) {
      busy = true;
      attempts++;
      if (attempts <= C.tentativiFalliti) {
        hapticPending = true;
        setTimeout(fail, 110);
      } else {
        setTimeout(unlock, 140);
      }
    }
  }

  function fireHaptic() {
    if (!hapticPending) return;
    hapticPending = false;
    if (!C.vibrazione) return;
    try { $('#hapLabel').click(); } catch (_) {}
  }

  function fail() {
    const a = dotsEl.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-22px)', offset: 0.12 },
      { transform: 'translateX(19px)', offset: 0.27 },
      { transform: 'translateX(-14px)', offset: 0.42 },
      { transform: 'translateX(9px)', offset: 0.57 },
      { transform: 'translateX(-5px)', offset: 0.72 },
      { transform: 'translateX(2px)', offset: 0.86 },
      { transform: 'translateX(0)' }
    ], { duration: 600, easing: 'ease-out' });
    a.onfinish = () => { filled = 0; renderDots(); busy = false; };
  }

  // Elimina / Annulla
  $('#hitCancel').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (state !== 'pass' || busy) return;
    cancelEl.classList.add('dim');
    const up = () => cancelEl.classList.remove('dim');
    e.currentTarget.addEventListener('pointerup', up, { once: true });
    e.currentTarget.addEventListener('pointercancel', up, { once: true });
    if (filled > 0) { filled--; renderDots(); }
    else backToLock();
  });
  // Emergenza: solo feedback visivo
  $('#hitEmergency').addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (state !== 'pass') return;
    const el = $('#btnEmergency');
    el.classList.add('dim');
    const up = () => el.classList.remove('dim');
    e.currentTarget.addEventListener('pointerup', up, { once: true });
    e.currentTarget.addEventListener('pointercancel', up, { once: true });
  });

  /* ---------------- transizione blocco ↔ tastierino ---------------- */
  let state = 'lock';        // lock | drag | pass | unlocking | home
  let curP = 0, rafId = 0;
  const easeOut = (k) => 1 - Math.pow(1 - k, 3);
  const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  function render(p) {
    const q = Math.max(0, Math.min(1, p));
    lock.style.transform = `translate3d(0, ${-p * TRAVEL}px, 0)`;
    lock.style.opacity = Math.max(0, 1 - q * 1.35);
    quick.style.opacity = Math.max(0, 1 - q * 2.2);
    quick.style.transform = `scale(${1 - q * 0.08})`;
    dim.style.opacity = q * DIM_MAX;
    const pq = Math.max(0, (q - 0.12) / 0.88);
    pass.style.opacity = pq;
    pass.style.transform = `scale(${1.1 - 0.1 * easeOut(pq)})`;
  }
  function tween(to, dur, ease, done) {
    cancelAnimationFrame(rafId);
    const from = curP, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      curP = from + (to - from) * ease(k);
      render(curP);
      if (k < 1) rafId = requestAnimationFrame(step);
      else if (done) done();
    };
    rafId = requestAnimationFrame(step);
  }

  function openPass() {
    state = 'unlocking';
    tween(1, 320, easeOut, () => {
      state = 'pass';
      pass.style.pointerEvents = 'auto';
    });
    islandExpand();
  }
  function backToLock() {
    state = 'unlocking';
    pass.style.pointerEvents = 'none';
    islandCollapse();
    tween(0, 380, easeInOut, () => { state = 'lock'; filled = 0; renderDots(); });
  }

  /* ---------------- Dynamic Island ---------------- */
  let islTimers = [];
  const later = (fn, ms) => islTimers.push(setTimeout(fn, ms));
  function islandClear() { islTimers.forEach(clearTimeout); islTimers = []; }
  function islandExpand() {
    islandClear();
    island.className = 'show';
    requestAnimationFrame(() => requestAnimationFrame(() => island.classList.add('expanded')));
    later(() => island.classList.add('content'), 230);
  }
  function islandCollapse() {
    islandClear();
    island.classList.remove('content');
    later(() => island.classList.remove('expanded'), 120);
    later(() => { island.className = ''; }, 700);
  }

  /* ---------------- sblocco → Home ---------------- */
  function unlock() {
    state = 'unlocking';
    island.classList.add('open');
    setTimeout(() => {
      pass.style.pointerEvents = 'none';
      pass.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.08)' }],
        { duration: 260, easing: 'ease-in', fill: 'forwards' });
      home.style.pointerEvents = 'auto';
      home.animate([{ opacity: 0, transform: 'scale(1.16)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 520, easing: 'cubic-bezier(.2,.85,.25,1)', fill: 'forwards' });
      islandCollapse();
      setTimeout(() => { state = 'home'; busy = false; }, 520);
    }, 330);
  }

  function resetAll() {
    cancelAnimationFrame(rafId);
    islandClear();
    island.className = '';
    home.getAnimations().forEach((a) => a.cancel());
    pass.getAnimations().forEach((a) => a.cancel());
    home.style.pointerEvents = 'none';
    pass.style.pointerEvents = 'none';
    filled = 0; attempts = 0; busy = false; hapticPending = false;
    renderDots();
    curP = 0; render(0);
    state = 'lock';
  }

  /* ---------------- gesti sulla schermata di blocco ---------------- */
  let drag = null, lpTimer = 0;
  const CLOCK = { x0: 45, x1: 348, y0: 110, y1: 206 };

  stage.addEventListener('pointerdown', (e) => {
    requestWakeLock();
    if (state !== 'lock' || drag) return;
    const p = toStage(e);
    if (p.y < 60) return;                         // lascia stare la barra di stato
    drag = { id: e.pointerId, y0: p.y, t0: performance.now(), lastY: p.y, lastT: performance.now(), moved: false, v: 0 };
    // Gesto segreto: pressione lunga sull'orologio
    if (p.x > CLOCK.x0 && p.x < CLOCK.x1 && p.y > CLOCK.y0 && p.y < CLOCK.y1) {
      const want = p.x < 196.5 ? 4 : 6;
      lpTimer = setTimeout(() => { setDigits(want); pulseHint(want === 4 ? 1 : 2); }, C.pressioneLunga);
    }
    const btn = e.target.closest && e.target.closest('.qbtn');
    if (btn) { btn.classList.add('down'); drag.btn = btn; }
  });

  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const p = toStage(e);
    const dy = p.y - drag.y0;
    if (Math.abs(dy) > 8) { clearTimeout(lpTimer); drag.moved = true; }
    if (drag.moved && drag.btn) { drag.btn.classList.remove('down'); drag.btn = null; }
    const now = performance.now();
    drag.v = (p.y - drag.lastY) / Math.max(1, now - drag.lastT);
    drag.lastY = p.y; drag.lastT = now;
    if (drag.moved && (state === 'lock' || state === 'drag')) {
      state = 'drag';
      cancelAnimationFrame(rafId);
      // verso l'alto segue il dito 1:1, verso il basso fa solo un piccolo "elastico"
      curP = dy < 0 ? -dy / TRAVEL : -Math.min(20, dy * 0.15) / TRAVEL;
      render(curP);
    }
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    clearTimeout(lpTimer);
    if (drag.btn) drag.btn.classList.remove('down');
    if (state === 'drag') {
      if (curP > 0.22 || drag.v < -0.35) openPass();
      else { state = 'unlocking'; tween(0, 300, easeOut, () => { state = 'lock'; }); }
    }
    drag = null;
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  function setDigits(n) {
    if (digits === n) return;
    digits = n;
    filled = 0;
    buildDots();
    renderDots();
  }
  // Conferma discreta per il mentalista: la lineetta in alto a destra pulsa 1 volta (4 cifre) o 2 (6 cifre)
  function pulseHint(times) {
    const cc = $('.cc');
    const kf = [];
    for (let i = 0; i < times; i++) kf.push({ opacity: 1 }, { opacity: 0.15 }, { opacity: 1 });
    cc.animate(kf, { duration: 260 * times });
  }

  /* ---------------- Home: tocchi sulle icone e reset segreto ---------------- */
  const SPOTS = [];
  [19.3, 112.7, 206, 299.3].forEach((x) => [360.7, 453.3].forEach((y) => SPOTS.push([x, y, 73.3, 73.3, 16.5])));
  [28, 116, 204, 292].forEach((x) => SPOTS.push([x, 750, 73.3, 73.3, 16.5]));
  SPOTS.push([19.3, 81, 353.4, 167.7, 30]);            // widget Calendario
  SPOTS.push([161.3, 687.3, 70.7, 29.4, 14.7, 'cerca']); // pulsante Cerca
  const hsWrap = $('#hotspots');
  SPOTS.forEach(([x, y, w, h, r, id]) => {
    const d = document.createElement('div');
    d.className = 'hs';
    d.style.left = x + 'px'; d.style.top = y + 'px';
    d.style.width = w + 'px'; d.style.height = h + 'px';
    d.style.borderRadius = r + 'px';
    let t = 0;
    d.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (state !== 'home') return;
      d.classList.add('down');
      if (id === 'cerca') t = setTimeout(resetAll, 900);   // tieni premuto "Cerca" ~1 s → torna al blocco
    });
    const up = () => { d.classList.remove('down'); clearTimeout(t); };
    d.addEventListener('pointerup', up);
    d.addEventListener('pointercancel', up);
    d.addEventListener('pointerleave', up);
    hsWrap.appendChild(d);
  });

  // Quando l'app va in background o si chiude, al rientro riparte dalla schermata di blocco.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') resetAll();
    else { wakeLock = null; requestWakeLock(); }
  });

  /* ---------------- blocchi dei gesti di sistema del browser ---------------- */
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  /* ---------------- schermo sempre acceso durante il numero ---------------- */
  let wakeLock = null;
  async function requestWakeLock() {
    if (wakeLock || !('wakeLock' in navigator)) return;
    try { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
    catch (_) { wakeLock = null; }
  }

  /* ---------------- avvio ---------------- */
  setFitted([$('#passTitle')], 'Inserisci codice', 21.7, 400, factor('Inserisci codice', 21.7, 400, 144));
  setFitted([$('#btnEmergency')], 'Emergenza', 15.5, 400, factor('Emergenza', 15.5, 400, 78));
  cancelS = factor('Annulla', 15.5, 400, 51.3);
  buildDots();
  renderDots();
  applyTypeSettings();
  render(0);

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  /* ---------------- modalità confronto (apri l'indirizzo con ?confronto) ---------------- */
  if (/[?&]confronto/.test(location.search)) {
    const ov = document.createElement('img');
    ov.id = 'refOverlay';
    stage.appendChild(ov);
    const refFor = () => state === 'home' ? 'ref-home' : (state === 'pass' ? 'ref-codice' : 'ref-blocco');
    const levels = [0, 0.5, 1];
    let lv = 1;
    const panel = document.createElement('div');
    panel.id = 'panel';
    panel.innerHTML = `
      <div class="always"><button id="bRef">Riferimento 50%</button><button id="bMin">Riduci</button><button id="bReset">Ricomincia</button></div>
      <label>Orologio dimensione <input type="range" id="sDim" min="100" max="150" step="0.1"></label>
      <label>Orologio spessore <input type="range" id="sPeso" min="300" max="900" step="10"></label>
      <label>Orologio larghezza <input type="range" id="sLarg" min="260" max="340" step="0.5"></label>
      <label>Orologio allungamento <input type="range" id="sAlt" min="0.85" max="1.25" step="0.005"></label>
      <label>Orologio posizione <input type="range" id="sBase" min="185" max="215" step="0.1"></label>
      <pre id="vals"></pre>`;
    stage.appendChild(panel);
    panel.addEventListener('pointerdown', (e) => e.stopPropagation());
    panel.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
    const map = { sDim: 'dimensione', sPeso: 'peso', sLarg: 'larghezza', sAlt: 'altezza', sBase: 'baseline' };
    const showVals = () => {
      $('#vals').textContent = 'Copia in config.js → orologio:\n' + JSON.stringify(C.orologio, null, 1).replace(/"(\w+)":/g, '$1:');
    };
    Object.entries(map).forEach(([id, k]) => {
      const s = $('#' + id);
      s.value = C.orologio[k];
      s.addEventListener('input', () => { C.orologio[k] = parseFloat(s.value); applyTypeSettings(); showVals(); });
    });
    showVals();
    const upd = () => {
      ov.src = 'riferimenti/' + refFor() + '.jpg';
      ov.style.opacity = levels[lv];
      $('#bRef').textContent = 'Riferimento ' + Math.round(levels[lv] * 100) + '%';
    };
    $('#bRef').addEventListener('click', () => { lv = (lv + 1) % 3; upd(); });
    $('#bMin').addEventListener('click', () => { panel.classList.toggle('min'); });
    $('#bReset').addEventListener('click', resetAll);
    setInterval(upd, 300);
    upd();
  }
})();
