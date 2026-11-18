(function () {
  var d = document;

  // menu mobilne
  var menu = d.getElementById('menu'), bur = d.querySelector('.burger');
  function zamknij() { menu.hidden = true; bur.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; }
  bur.addEventListener('click', function () { menu.hidden = false; bur.setAttribute('aria-expanded', 'true'); d.body.style.overflow = 'hidden'; menu.querySelector('.x').focus(); });
  menu.querySelector('.x').addEventListener('click', zamknij);
  menu.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', zamknij); });

  // ladowanie kolejnych zdjec w karcie
  function laduj(img) {
    if (img && img.dataset.src) { img.srcset = img.dataset.srcset; img.src = img.dataset.src; delete img.dataset.src; }
  }

  // karuzele w kartach: palec, mysz, strzalki, licznik
  d.querySelectorAll('.pas').forEach(function (pas) {
    var tor = pas.querySelector('.pas-tor'), sl = tor.children, n = sl.length;
    var ruszony = false;
    tor.addEventListener('scroll', function () { ruszony = true; }, { passive: true, once: true });
    pas.addEventListener('pointerenter', function () { if (!ruszony) { ruszony = true; stan(); } });
    var l = pas.querySelector('.strz.l'), p = pas.querySelector('.strz.p'), licz = pas.querySelector('.licz');
    function idx() { return Math.round(tor.scrollLeft / tor.clientWidth); }
    function stan() {
      var i = idx();
      l.disabled = i <= 0; p.disabled = i >= n - 1;
      licz.textContent = (i + 1) + ' / ' + n;
      if (ruszony) { laduj(sl[i] && sl[i].querySelector('img')); laduj(sl[i + 1] && sl[i + 1].querySelector('img')); }
    }
    function idz(i) { tor.scrollTo({ left: Math.max(0, Math.min(n - 1, i)) * tor.clientWidth, behavior: 'smooth' }); }
    l.addEventListener('click', function () { idz(idx() - 1); });
    p.addEventListener('click', function () { idz(idx() + 1); });
    tor.addEventListener('scroll', function () { requestAnimationFrame(stan); }, { passive: true });
    tor.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { idz(idx() + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { idz(idx() - 1); e.preventDefault(); } });
    // przeciaganie mysza
    var x0 = 0, s0 = 0, ciag = false, ruch = false;
    tor.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; ciag = true; ruch = false; x0 = e.clientX; s0 = tor.scrollLeft; tor.classList.add('ciag'); });
    addEventListener('pointermove', function (e) { if (!ciag) return; var dx = e.clientX - x0; if (Math.abs(dx) > 5) ruch = true; tor.scrollLeft = s0 - dx; });
    addEventListener('pointerup', function (e) {
      if (!ciag) return; ciag = false; tor.classList.remove('ciag');
      var dx = e.clientX - x0, i = Math.round(s0 / tor.clientWidth);
      if (dx < -40) i++; else if (dx > 40) i--;
      idz(i);
    });
    tor.addEventListener('click', function (e) { if (ruch) { e.stopPropagation(); e.preventDefault(); ruch = false; } }, true);
    stan();
  });

  // lightbox
  var lb = d.getElementById('lb'), lbImg = lb.querySelector('img'), lbLicz = lb.querySelector('.lb-licz'), lbDol = lb.querySelector('.lb-dol');
  var lista = [], poz = 0, ostatni = null;
  function pokaz() {
    var el = lista[poz], im = el.querySelector('img');
    lbImg.src = im.currentSrc || im.dataset.src || im.src; lbImg.alt = im.alt;
    var duzy = el.dataset.lb;
    setTimeout(function () { var t = new Image(); t.onload = function () { if (lista[poz] === el) lbImg.src = duzy; }; t.src = duzy; }, 180);
    lbLicz.textContent = lista.length > 1 ? (poz + 1) + ' / ' + lista.length : '';
    lbDol.textContent = el.dataset.podpis || (el.closest('.karta') ? el.closest('.karta').querySelector('h3').textContent : im.alt);
    lb.querySelector('.strz.l').disabled = poz <= 0; lb.querySelector('.strz.p').disabled = poz >= lista.length - 1;
  }
  function otworz(el) {
    var gr = el.closest('.pas-tor');
    lista = gr ? Array.prototype.slice.call(gr.children) : Array.prototype.slice.call(d.querySelectorAll('.kafel button'));
    poz = lista.indexOf(el); ostatni = el; lb.hidden = false; d.body.style.overflow = 'hidden'; pokaz(); lb.querySelector('.lb-x').focus();
  }
  function zamknijLb() { lb.hidden = true; lbImg.removeAttribute('src'); d.body.style.overflow = ''; if (ostatni) ostatni.focus(); }
  d.querySelectorAll('[data-lb]').forEach(function (b) { b.addEventListener('click', function () { otworz(b); }); });
  lb.querySelector('.lb-x').addEventListener('click', zamknijLb);
  lb.querySelector('.strz.l').addEventListener('click', function () { if (poz > 0) { poz--; pokaz(); } });
  lb.querySelector('.strz.p').addEventListener('click', function () { if (poz < lista.length - 1) { poz++; pokaz(); } });
  d.addEventListener('keydown', function (e) {
    if (lb.hidden) { if (e.key === 'Escape' && !menu.hidden) zamknij(); return; }
    if (e.key === 'Escape') zamknijLb();
    if (e.key === 'ArrowRight' && poz < lista.length - 1) { poz++; pokaz(); }
    if (e.key === 'ArrowLeft' && poz > 0) { poz--; pokaz(); }
  });
  var tx = 0, sc = lb.querySelector('.lb-scena');
  sc.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  sc.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    if (dx < -50 && poz < lista.length - 1) { poz++; pokaz(); } else if (dx > 50 && poz > 0) { poz--; pokaz(); }
  });

  // "zapytaj o ten model" -> ustawia model w formularzu
  var sel = d.getElementById('f-model');
  d.querySelectorAll('[data-model]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.dataset.model;
      for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === v) sel.selectedIndex = i;
    });
  });

  // formularz pokazowy
  d.getElementById('form').addEventListener('submit', function (e) { e.preventDefault(); this.querySelector('.f-info').hidden = false; });
})();
