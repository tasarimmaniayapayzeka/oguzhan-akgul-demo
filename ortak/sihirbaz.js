/* Ortak sihirbaz katmanı (demo). Bilgi hiçbir yere gönderilmez, ağ isteği yoktur.
   Canlı sürümde WordPress kısa koduna ve asistan platformuna bağlanır. */
(function () {
  'use strict';

  var KONULAR = ['Mimik çizgileri', 'Yüz hatları', 'Dudak', 'Göz çevresi', 'Cilt', 'Cilt sıkılaştırma', 'İp askı', 'Saç', 'Erkek estetiği', 'Henüz emin değilim'];
  var SEKILLER = ['Muayenehanede', 'Online ön görüşme'];
  var ZAMANLAR = ['Sabah', 'Öğleden sonra', 'Akşama doğru'];

  function kacis(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function secenekler(ad, liste, secili) {
    return '<div class="sb-sec">' + liste.map(function (v) {
      return '<label><input type="radio" name="' + ad + '" value="' + kacis(v) + '"' + (secili === v ? ' checked' : '') + '><span>' + kacis(v) + '</span></label>';
    }).join('') + '</div>';
  }

  /* ---------- Randevu Sihirbazı ---------- */
  var dlg = document.createElement('dialog');
  dlg.className = 'sb-dlg';
  dlg.setAttribute('aria-labelledby', 'sb-dlg-baslik');
  document.body.appendChild(dlg);
  var v = {}, adim = 1, hatalar = {};

  function ciz() {
    var ilerleme = adim < 4 ? '<ul class="sb-ilerleme" aria-hidden="true">' + [1, 2, 3].map(function (n) {
      return '<li class="' + (n <= adim ? 'dolu' : '') + '"></li>';
    }).join('') + '</ul>' : '';
    var baslik = '', govde = '', eylem = '';

    if (adim === 1) {
      baslik = 'Hangi konuda görüşmek istersiniz?';
      govde = '<fieldset class="sb-grup"><legend class="sb-gizli">Konu</legend>' + secenekler('konu', KONULAR, v.konu) + hataYaz('konu') + '</fieldset>';
      eylem = '<div class="sb-eylem sb-eylem--sag"><button type="submit" class="sb-dgm sb-dgm--bir">Devam edin</button></div>';
    } else if (adim === 2) {
      baslik = 'Görüşme nasıl olsun?';
      govde = '<fieldset class="sb-grup"><legend>Görüşme şekli</legend>' + secenekler('sekil', SEKILLER, v.sekil) + hataYaz('sekil') + '</fieldset>' +
        '<fieldset class="sb-grup"><legend>Size uygun zaman</legend>' + secenekler('zaman', ZAMANLAR, v.zaman) + hataYaz('zaman') + '</fieldset>';
      eylem = '<div class="sb-eylem"><button type="button" class="sb-dgm sb-dgm--iki" data-geri>Geri</button><button type="submit" class="sb-dgm sb-dgm--bir">Devam edin</button></div>';
    } else if (adim === 3) {
      baslik = 'Size nasıl ulaşalım?';
      govde = alan('ad', 'Ad soyad', 'text', 'name') + alan('tel', 'Telefon', 'tel', 'tel') + alan('eposta', 'E-posta (isteğe bağlı)', 'email', 'email') +
        '<label class="sb-onay"><input type="checkbox" name="aydinlatma"' + (v.aydinlatma ? ' checked' : '') + '><span><a href="#kvkk">Aydınlatma metnini</a> okudum.</span></label>' + hataYaz('aydinlatma') +
        '<label class="sb-onay"><input type="checkbox" name="riza"' + (v.riza ? ' checked' : '') + '><span>Talebimdeki sağlık bilgilerinin randevu planlaması için işlenmesine açık rıza veriyorum.</span></label>' + hataYaz('riza');
      eylem = '<div class="sb-eylem"><button type="button" class="sb-dgm sb-dgm--iki" data-geri>Geri</button><button type="submit" class="sb-dgm sb-dgm--bir">Talebi gönderin</button></div>';
    } else {
      baslik = 'Talebiniz alındı';
      govde = '<p>Teşekkürler, ' + kacis(v.ad) + '. Ekibimiz sizi tercih ettiğiniz zaman aralığında arayarak görüşmeyi planlayacak.</p>' +
        '<p class="sb-not">Bu sayfa demodur, bilgileriniz gönderilmedi. Canlı sitede talep yönetim paneline düşer.</p>';
      eylem = '<div class="sb-eylem sb-eylem--sag"><button type="button" class="sb-dgm sb-dgm--iki" data-kapat>Kapatın</button></div>';
    }

    dlg.innerHTML = '<form class="sb-dlg__ic" novalidate><div class="sb-dlg__ust"><h2 class="sb-dlg__baslik" id="sb-dlg-baslik">' + baslik + '</h2>' +
      '<button type="button" class="sb-kapat" data-kapat aria-label="Kapatın"><i class="ph-light ph-x" aria-hidden="true"></i></button></div>' +
      ilerleme + govde + eylem + '</form>';
    var ilkHata = dlg.querySelector('[aria-invalid="true"]');
    if (ilkHata) ilkHata.focus();
  }
  function hataYaz(ad) { return hatalar[ad] ? '<p class="sb-hata" id="h-' + ad + '" role="alert">' + hatalar[ad] + '</p>' : ''; }
  function alan(ad, etiket, tur, oto) {
    var h = hatalar[ad];
    return '<div class="sb-alan"><label for="f-' + ad + '">' + etiket + '</label><input id="f-' + ad + '" name="' + ad + '" type="' + tur + '" autocomplete="' + oto + '" value="' + kacis(v[ad]) + '"' +
      (h ? ' aria-invalid="true" aria-describedby="h-' + ad + '"' : '') + '>' + hataYaz(ad) + '</div>';
  }
  function topla() {
    var f = dlg.querySelector('form');
    ['konu', 'sekil', 'zaman', 'ad', 'tel', 'eposta'].forEach(function (k) {
      if (!f.elements[k]) return;
      var d = f.elements[k].value;
      if (d) v[k] = d; else if (f.elements[k].type !== undefined && f.elements[k].tagName === 'INPUT') v[k] = '';
    });
    ['aydinlatma', 'riza'].forEach(function (k) { if (f.elements[k]) v[k] = f.elements[k].checked; });
  }
  function dogrula() {
    hatalar = {};
    if (adim === 1 && !v.konu) hatalar.konu = 'Lütfen bir konu seçiniz.';
    if (adim === 2) {
      if (!v.sekil) hatalar.sekil = 'Lütfen görüşme şeklini seçiniz.';
      if (!v.zaman) hatalar.zaman = 'Lütfen size uygun zamanı seçiniz.';
    }
    if (adim === 3) {
      if (!v.ad || v.ad.trim().length < 3) hatalar.ad = 'Lütfen adınızı ve soyadınızı yazınız.';
      if ((v.tel || '').replace(/\D/g, '').length < 10) hatalar.tel = 'Lütfen telefon numaranızı yazınız.';
      if (!v.aydinlatma) hatalar.aydinlatma = 'Devam etmek için aydınlatma metnini okuduğunuzu işaretleyiniz.';
      if (!v.riza) hatalar.riza = 'Talebinizi alabilmemiz için açık rızanız gereklidir.';
    }
    return !Object.keys(hatalar).length;
  }
  dlg.addEventListener('submit', function (e) {
    e.preventDefault(); topla();
    if (dogrula()) adim += 1;
    ciz();
  });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg) { dlg.close(); return; }
    var hedef = e.target.closest('[data-kapat],[data-geri]');
    if (!hedef) return;
    if (hedef.hasAttribute('data-kapat')) { dlg.close(); return; }
    topla(); hatalar = {}; adim -= 1; ciz();
  });
  function randevuAc(on) {
    v = on || {}; hatalar = {};
    adim = v.ad || v.tel ? 3 : 1;
    ciz(); dlg.showModal();
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-randevu]');
    if (t) { e.preventDefault(); randevuAc(t.dataset.randevu ? { konu: t.dataset.randevu } : {}); }
  });

  /* Girişteki tek satırlık form (Yön C) */
  document.querySelectorAll('form[data-hizli]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      randevuAc({ konu: f.elements.konu.value || undefined, zaman: f.elements.zaman.value || undefined, sekil: SEKILLER[0], ad: f.elements.ad.value, tel: f.elements.tel.value });
      if (!f.elements.ad.value && !f.elements.tel.value) { adim = v.konu ? 2 : 1; ciz(); }
    });
    f.elements.konu && (f.elements.konu.innerHTML = '<option value="">Seçiniz</option>' + KONULAR.map(function (k) { return '<option>' + k + '</option>'; }).join(''));
    f.elements.zaman && (f.elements.zaman.innerHTML = '<option value="">Seçiniz</option>' + ZAMANLAR.map(function (k) { return '<option>' + k + '</option>'; }).join(''));
  });

  /* ---------- Cilt Tipi Testi (örnek, 4 soru) ---------- */
  var SORULAR = [
    { s: 'Yüzünüzü yıkadıktan bir saat sonra cildiniz nasıl hissediyor?', c: [['Gergin ve kuru', { k: 2 }], ['Rahat ve dengeli', {}], ['Alın ve burunda hafif parlama var', { t: 1 }], ['Yüzümün tamamı parlıyor', { y: 2 }]] },
    { s: 'Öğleden sonra alın, burun ve çene bölgeniz parlıyor mu?', c: [['Hayır', { k: 1 }], ['Bazen', { t: 1 }], ['Evet, belirgin biçimde', { t: 2, y: 1 }]] },
    { s: 'Yanaklarınız genellikle nasıl?', c: [['Kuru, bazen pul pul', { k: 2 }], ['Dengeli', { t: 1 }], ['Yağlı', { y: 2 }]] },
    { s: 'Yeni bir üründe batma ya da kızarıklık olur mu?', c: [['Sık sık', { h: 2 }], ['Nadiren', { h: 1 }], ['Hayır', {}]] }
  ];
  var SONUCLAR = {
    kuru: ['Kuru eğilimli cilt', 'Cildiniz gün içinde gerginlik hissi verebilir. Nazik temizleyiciler ve nem bariyerini destekleyen ürünler genellikle uygun bir başlangıçtır.'],
    dengeli: ['Dengeli cilt', 'Cildinizde belirgin kuruluk ya da parlama görünmüyor. Düzenli temizlik, nemlendirme ve güneş koruması genel olarak yeterli bir düzendir.'],
    karma: ['Karma cilt eğilimi', 'Alın, burun ve çenede parlama, yanaklarda daha dengeli bir yapı olabilir. Hafif dokulu nemlendiriciler ve bölgeye göre bakım düşünülebilir.'],
    yagli: ['Yağlı eğilimli cilt', 'Gün içinde parlama belirgin olabilir. Gözenek tıkamayan ürünler ve düzenli temizlik genel olarak önerilen bir yaklaşımdır.']
  };
  document.querySelectorAll('[data-cilt-testi]').forEach(function (kok) {
    var i = 0, secim = [];
    function basla() { i = 0; secim = []; soru(); }
    function soru() {
      var q = SORULAR[i];
      kok.innerHTML = '<div class="sb-test"><h3 class="sb-test__baslik">Cilt Tipi Testi</h3><p class="sb-test__sayac">Soru ' + (i + 1) + ' / ' + SORULAR.length + '</p>' +
        '<p class="sb-test__soru" id="ct-s' + i + '">' + q.s + '</p><div class="sb-sec" role="radiogroup" aria-labelledby="ct-s' + i + '">' + q.c.map(function (c, n) {
          return '<label><input type="radio" name="ct" value="' + n + '"' + (secim[i] === n ? ' checked' : '') + '><span>' + c[0] + '</span></label>';
        }).join('') + '</div>' + (i ? '<div class="sb-test__alt"><button type="button" class="sb-geri" data-t-geri>Önceki soru</button></div>' : '') + '</div>';
    }
    function sonuc() {
      var p = { k: 0, y: 0, t: 0, h: 0 };
      secim.forEach(function (n, q) { var o = SORULAR[q].c[n][1]; Object.keys(o).forEach(function (a) { p[a] += o[a]; }); });
      var tur = p.y >= 3 ? 'yagli' : p.k >= 3 ? 'kuru' : p.t >= 2 ? 'karma' : 'dengeli';
      var r = SONUCLAR[tur];
      kok.innerHTML = '<div class="sb-test sb-sonuc"><p class="sb-test__sayac">Sonucunuz</p><p class="sb-sonuc__ad">' + r[0] + '</p><p>' + r[1] + '</p>' +
        (p.h >= 2 ? '<p>Yanıtlarınız hassasiyet eğilimi de gösteriyor. Yeni ürünleri önce küçük bir bölgede denemek faydalı olabilir.</p>' : '') +
        '<p class="sb-uyari">Sonuç bilgilendirme amaçlıdır, tanı yerine geçmez. Tanı ve tedavi için mutlaka doktorunuza başvurunuz. Demoda 4 soru vardır; tam sürüm 10 ila 15 sorudur ve metinleri hekim onaylar.</p>' +
        '<div class="sb-test__alt"><button type="button" class="sb-dgm sb-dgm--iki" data-t-yazdir><i class="ph-light ph-printer" aria-hidden="true"></i>Sonucu yazdırın</button><button type="button" class="sb-geri" data-t-basa>Yeniden başlayın</button></div></div>';
    }
    kok.addEventListener('change', function (e) {
      if (e.target.name !== 'ct') return;
      secim[i] = +e.target.value;
      setTimeout(function () { i += 1; if (i < SORULAR.length) soru(); else sonuc(); }, 160);
    });
    kok.addEventListener('click', function (e) {
      if (e.target.closest('[data-t-geri]')) { i -= 1; soru(); }
      if (e.target.closest('[data-t-basa]')) basla();
      if (e.target.closest('[data-t-yazdir]')) {
        var b = document.createElement('div'); b.className = 'sb-baski'; b.innerHTML = kok.innerHTML;
        b.querySelectorAll('.sb-test__alt').forEach(function (x) { x.remove(); });
        document.body.appendChild(b); document.documentElement.classList.add('baski');
        window.addEventListener('afterprint', function s() { b.remove(); document.documentElement.classList.remove('baski'); window.removeEventListener('afterprint', s); });
        window.print();
      }
    });
    basla();
  });

  /* ---------- Asistan (demo: hazır sorular; izin penceresi bir kez) ---------- */
  var IZIN = 'oa_yz_izin';
  function izinOku() { try { return localStorage.getItem(IZIN); } catch (e) { return null; } }
  function izinYaz(d) { try { localStorage.setItem(IZIN, d); } catch (e) { /* tarayıcı izin vermiyorsa bu oturumda kalır */ } hafiza = d; }
  var hafiza = izinOku();
  var CEVAP = [
    ['Konsültasyonda neler konuşulur?', 'Hekim beklentinizi dinler, sağlık geçmişinizi sorar ve yüzünüzü değerlendirir. Uygulanabilecek seçenekleri, risklerini ve iyileşme sürecini anlatır. Karar vermek için ayrıca düşünebilirsiniz.'],
    ['Uygulamadan sonra ne zaman işe dönebilirim?', 'Bu, uygulamanın türüne ve bölgesine göre değişir. Size özel süreyi hekim muayenede söyler. Hangi uygulamayı merak ediyorsunuz?'],
    ['Fiyat öğrenebilir miyim?', 'Fiyat bilgisi paylaşamıyorum. Plan kişiye göre değiştiği için bu konu muayenede görüşülür. İsterseniz randevu talebi oluşturmanıza yardımcı olabilirim.']
  ];
  var ac = document.createElement('button');
  ac.type = 'button'; ac.className = 'sb-as-ac'; ac.setAttribute('data-asistan', ''); ac.setAttribute('aria-expanded', 'false');
  ac.innerHTML = '<i class="ph-light ph-chat-text" aria-hidden="true"></i>Soru sorun';
  var pano = document.createElement('section');
  pano.className = 'sb-as'; pano.setAttribute('aria-label', 'Yapay zekâ danışma asistanı');
  document.body.appendChild(ac); document.body.appendChild(pano);
  var konusma = [];
  function asistanCiz() {
    var ust = '<div class="sb-as__ust"><b>Danışma asistanı</b><button type="button" class="sb-kapat" data-as-kapat aria-label="Asistanı kapatın"><i class="ph-light ph-x" aria-hidden="true"></i></button></div>';
    var govde, alt = '';
    if (!hafiza) {
      govde = '<div class="sb-as__izin"><p>Bu asistan yapay zekâ ile çalışır. Yazdıklarınız yanıt üretmek için yurt dışındaki bir yapay zekâ sağlayıcısına iletilir. Lütfen sağlık ve kimlik bilgisi yazmayınız.</p><p>Tercihiniz bu tarayıcıda hatırlanır.</p><div class="sb-eylem"><button type="button" class="sb-dgm sb-dgm--bir" data-as-evet>Onaylıyorum</button><button type="button" class="sb-dgm sb-dgm--iki" data-as-hayir>Onaylamıyorum</button></div></div>';
    } else if (hafiza === 'hayir') {
      govde = '<div class="sb-as__izin"><p>Asistan kapalı. Bize telefonla ya da WhatsApp üzerinden ulaşabilirsiniz.</p><div class="sb-eylem"><button type="button" class="sb-dgm sb-dgm--iki" data-as-evet>Yapay zekâ onayı verin</button></div></div>';
    } else {
      govde = '<p class="sb-balon">Merhaba, uygulamalar ve süreç hakkındaki sorularınızı yanıtlayabilirim. Teşhis koymam ve fiyat bilgisi veremem.</p>' +
        konusma.map(function (m) { return '<p class="sb-balon' + (m[0] ? ' sb-balon--ben' : '') + '">' + kacis(m[1]) + '</p>'; }).join('') +
        '<div class="sb-cipler">' + CEVAP.map(function (c, n) { return '<button type="button" class="sb-cip" data-as-soru="' + n + '">' + c[0] + '</button>'; }).join('') + '</div>';
      alt = '<p class="sb-as__alt" style="margin:0">Demoda hazır sorular görünür. Canlı asistan sekiz dilde sohbet eder.</p>';
    }
    pano.innerHTML = ust + '<div class="sb-as__govde">' + govde + '</div>' + alt;
    var g = pano.querySelector('.sb-as__govde'); g.scrollTop = g.scrollHeight;
  }
  function asistanDurum(a) { pano.classList.toggle('acik', a); ac.setAttribute('aria-expanded', a ? 'true' : 'false'); if (a) asistanCiz(); }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-asistan]')) { e.preventDefault(); asistanDurum(!pano.classList.contains('acik')); return; }
    if (e.target.closest('[data-as-kapat]')) asistanDurum(false);
    if (e.target.closest('[data-as-evet]')) { izinYaz('evet'); asistanCiz(); }
    if (e.target.closest('[data-as-hayir]')) { izinYaz('hayir'); asistanCiz(); }
    var s = e.target.closest('[data-as-soru]');
    if (s) { var c = CEVAP[+s.dataset.asSoru]; konusma.push([1, c[0]], [0, c[1]]); asistanCiz(); }
  });

  /* ---------- Tam sürümde çalışacak araçlar ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-yakinda]');
    if (!t) return;
    e.preventDefault();
    var not = document.querySelector('[data-yakinda-not]');
    if (not) not.textContent = t.textContent.trim() + ' tam sürümde çalışır. Demoda Randevu Sihirbazı, Cilt Tipi Testi ve asistan açıktır.';
  });

  /* ---------- Menü ---------- */
  document.querySelectorAll('[data-menu-ac]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = document.documentElement.classList.toggle('menu-acik');
      b.setAttribute('aria-expanded', a ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('.menu a')) document.documentElement.classList.remove('menu-acik');
  });

  /* ---------- Sekmeler (Yön C) ---------- */
  document.querySelectorAll('[role="tablist"]').forEach(function (l) {
    var sek = Array.prototype.slice.call(l.querySelectorAll('[role="tab"]'));
    function sec(b, odak) {
      sek.forEach(function (x) {
        var a = x === b;
        x.setAttribute('aria-selected', a ? 'true' : 'false'); x.tabIndex = a ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !a;
      });
      if (odak) b.focus();
    }
    l.addEventListener('click', function (e) { var b = e.target.closest('[role="tab"]'); if (b) sec(b); });
    l.addEventListener('keydown', function (e) {
      var i = sek.indexOf(document.activeElement), d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (d && i > -1) { e.preventDefault(); sec(sek[(i + d + sek.length) % sek.length], true); }
    });
  });
})();
