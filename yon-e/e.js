/* Yön E'ye özel: yüz haritası, uygulama akışı, soru süzgeci. Demo, ağ isteği yok.
   Metinler hekim onayına sunulacak taslaktır. */
(function () {
  'use strict';

  /* ---------- Yüz haritası ---------- */
  var BOLGE = {
    mimik: { ad: 'Mimik çizgileri', metin: 'Alın ve kaş arasındaki çizgiler çoğunlukla kas hareketiyle ilgilidir. Önce çizginin türü, hareket sırasında ve dururken incelenir.', uyg: ['Botulinum toksin uygulamaları'], arac: null },
    goz: { ad: 'Göz çevresi', metin: 'Göz altı koyuluğunun damar, pigment ya da hacim gibi farklı nedenleri olabilir. Seçenek, nedene göre değişir.', uyg: ['Göz çevresi uygulamaları', 'Mezoterapi'], arac: 'Göz Altı Morluk Tipi' },
    cilt: { ad: 'Cilt', metin: 'Cildin yapısı, leke ve hassasiyet eğilimi birlikte konuşulur. Günlük bakım alışkanlıkları da değerlendirmeye dahildir.', uyg: ['Mezoterapi', 'Lazerle cilt sıkılaştırma'], arac: 'Cilt Tipi Testi' },
    dudak: { ad: 'Dudak', metin: 'Dudak oranları yüzün geri kalanıyla birlikte değerlendirilir. Beklentiniz ve yüz yapınız birlikte konuşulur.', uyg: ['Dudak uygulamaları'], arac: null },
    hat: { ad: 'Yüz hatları', metin: 'Elmacık, çene ve çene hattında kemik yapısı, cilt ve hacim bir arada ele alınır.', uyg: ['Hiyalüronik asit dolgu', 'İp askı'], arac: null },
    sac: { ad: 'Saç', metin: 'Dökülmenin süresi, biçimi ve olası nedenleri sorulur. Gerekirse tetkik istenebilir.', uyg: ['Saç tedavileri'], arac: 'Saç Dökülmesi Anketi' },
    erkek: { ad: 'Erkek estetiği', metin: 'Erkek yüz yapısının oranları ve beklentileri farklıdır. Plan bu farkları gözeterek konuşulur.', uyg: ['Botulinum toksin uygulamaları', 'Hiyalüronik asit dolgu', 'Saç tedavileri'], arac: null }
  };
  var kart = document.querySelector('[data-bolge-kart]');
  var dugmeler = Array.prototype.slice.call(document.querySelectorAll('.konular [data-bolge]'));
  var noktalar = Array.prototype.slice.call(document.querySelectorAll('.nokta'));
  function bolgeSec(k) {
    var b = BOLGE[k];
    dugmeler.forEach(function (d) { var a = d.dataset.bolge === k; d.setAttribute('aria-selected', a ? 'true' : 'false'); d.tabIndex = a ? 0 : -1; });
    noktalar.forEach(function (n) { n.classList.toggle('etkin', n.dataset.bolge === k); n.setAttribute('aria-pressed', n.dataset.bolge === k ? 'true' : 'false'); });
    kart.innerHTML = '<h3>' + b.ad + '</h3><p>' + b.metin + '</p><p class="bolge-kart__bas">Görüşmede konuşulabilecek uygulamalar</p><div class="bolge-kart__bag">' +
      b.uyg.map(function (u) { return '<a href="#">' + u + ' <i class="ph-light ph-arrow-right" aria-hidden="true"></i></a>'; }).join('') + '</div>' +
      (b.arac ? '<p class="bolge-kart__arac">İsterseniz önce deneyin: <a href="#araclar">' + b.arac + '</a></p>' : '') +
      '<p class="bolge-kart__not">Bilgilendirme amaçlıdır. Size uygun olan seçenek görüşmede netleşir.</p>';
  }
  dugmeler.concat(noktalar).forEach(function (d) { d.addEventListener('click', function () { bolgeSec(d.dataset.bolge); }); });
  var liste = document.querySelector('.konular');
  liste.addEventListener('keydown', function (e) {
    var i = dugmeler.indexOf(document.activeElement);
    var yon = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!yon || i < 0) return;
    e.preventDefault();
    var y = dugmeler[(i + yon + dugmeler.length) % dugmeler.length];
    bolgeSec(y.dataset.bolge); y.focus();
  });
  bolgeSec('mimik');

  /* ---------- Uygulama akışı ---------- */
  var YOL = {
    'Botulinum toksin': ['Mimik çizgileri hareket hâlinde incelenir; sağlık geçmişiniz ve kullandığınız ilaçlar sorulur.', 'Hangi bölgelerin ele alınacağı ve beklenti birlikte konuşulur, riskler anlatılır.', 'İnce iğneyle yapılan kısa bir uygulamadır. Sonrasında dikkat edilecekler yazılı verilir.', 'Etkinin oturduğu dönemde kontrol zamanı planlanır.'],
    'Hiyalüronik asit dolgu': ['Yüz bir bütün olarak değerlendirilir; önceki uygulamalar ve alerjiler sorulur.', 'Hacim gereken bölgeler ve sıralama konuşulur, riskler anlatılır, onam alınır.', 'Uygulamayı hekim yapar. Kısa süreli şişlik ve kızarıklık olabileceği önceden söylenir.', 'Şişlik geçtikten sonra sonuç birlikte değerlendirilir.'],
    'Mezoterapi': ['Cildinizin durumu ve bakım alışkanlıklarınız konuşulur.', 'Seans aralığı ve hedefiniz birlikte belirlenir.', 'Cilde ince iğnelerle uygulanır. Kısa süreli kızarıklık olabilir.', 'Seanslar arasında durum değerlendirilir, plan gerekirse değiştirilir.'],
    'İp askı': ['Dokunun durumu değerlendirilir; bu yöntemin size uygun olup olmadığı açıkça konuşulur.', 'Bölge, beklenti ve sınırlar birlikte belirlenir, riskler anlatılır, onam alınır.', 'Uygulamayı hekim yapar. Sonraki günler için dikkat edilecekler yazılı verilir.', 'İyileşme sürecinde kontrol zamanı planlanır.']
  };
  var sec = document.querySelector('[data-yol-sec]');
  var adimlar = Array.prototype.slice.call(document.querySelectorAll('[data-yol-adim] li'));
  function yolYaz() {
    var m = YOL[sec.value];
    adimlar.forEach(function (li, i) { li.querySelector('p').textContent = m[i]; });
  }
  sec.addEventListener('change', yolYaz);
  yolYaz();
  var sayac = null, oynat = document.querySelector('[data-yol-oynat]');
  function temizle() { clearTimeout(sayac); adimlar.forEach(function (a) { a.classList.remove('etkin'); }); }
  oynat.addEventListener('click', function () {
    temizle();
    var az = window.matchMedia('(prefers-reduced-motion: reduce)').matches, i = 0;
    (function ileri() {
      adimlar.forEach(function (a, n) { a.classList.toggle('etkin', n === i); });
      i += 1;
      sayac = setTimeout(function () { if (i < adimlar.length) ileri(); else temizle(); }, az ? 900 : 1500);
    })();
  });

  /* ---------- Soru süzgeci ---------- */
  var suzgec = Array.prototype.slice.call(document.querySelectorAll('[data-suz]'));
  var sorular = Array.prototype.slice.call(document.querySelectorAll('.soru-liste details'));
  suzgec.forEach(function (d) {
    d.addEventListener('click', function () {
      suzgec.forEach(function (x) { x.setAttribute('aria-pressed', x === d ? 'true' : 'false'); });
      sorular.forEach(function (s) { s.hidden = !(d.dataset.suz === 'hepsi' || s.dataset.tur === d.dataset.suz); });
    });
  });
})();
