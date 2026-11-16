/* referans-vaka-metrik — Referans Vaka Metrik — öncesi/sonrası ölçülü vaka kartları (16 Kas 2026 · mcp:webmaker/20261116-113510-tlwf · D17).
   Koyu zeminde iki sütun vaka kartı: künyede baş harf rozeti, müşteri adı, sektör · yıl ve vaka bağlantısı; altında kısa iş özeti ve «önce → sonra» ölçüleri (dev sonuç sayısı + oran çubuğu). Kart görünür olunca çubuk önceki değerden sonrakine akar; Önce/Sonra anahtarıyla elle çevrilir. Ölçüsü olmayan kart yalnız künye + özettir.
   Üretici: scripts/modul-fabrika (aile referans) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ ad, img?, url?, sektor?, metin?, kisi?, yil? }] — metinler dil sözlüğü (marka adı düz metin de olur); görsel yoksa ad yazı logosu olarak basılır; adı da görseli de olmayan satır atlanır. */
const P = "modulex-referans-vaka-metrik";
const IMG_KOK = `/img/${json.id}/`;
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: referans --- */
/* eski logo-bandi: showTitle=false → başlık bölümü yok */
if (!dogru(des.showTitle, true)) ["ust", "badge", "kicker", "baslik", "title", "metin", "description"].forEach((k) => { des[k] = ""; });
const kayitlar = veri.map((o) => {
  o = o || {};
  return {
    ad: metinAl(o, ["ad", "name", "baslik", "title"]), img: medyaUrl(ilk(o, ["img", "logo", "image"])), url: href(ilk(o, ["url", "link"])),
    sektor: metinAl(o, ["sektor", "sector", "kat", "category"]), metin: metinAl(o, ["metin", "text", "description", "yorum", "quote"]),
    kisi: metinAl(o, ["kisi", "person", "author"]), yil: metinAl(o, ["yil", "year", "since"]), ikon: ikonAd(ilk(o, ["ikon", "icon"])),
  };
}).filter((k) => k.ad || k.img);
const listeAd = metinAl(des, ["listeEtiket", "listLabel"]);
const listeA = () => (listeAd ? ` aria-label="${esc(listeAd)}"` : "");
/* baş harf rozeti (yazı logosu yanında süs): ilk iki sözcüğün ilk harfi */
const harf = (s) => { const p = String(s || "").trim().split(/\s+/).filter(Boolean); const a = (x) => [...(x || "")][0] || ""; return (p.length > 1 ? a(p[0]) + a(p[1]) : [...(p[0] || "")].slice(0, 2).join("")).toLocaleUpperCase(dil || undefined); };
const disBag = (u) => /^(https?:)?\/\//i.test(u);
/* logo: görsel varsa img (alt = ad), yoksa ad yazı logosu olarak basılır */
const lH = (k, s) => (k.img ? `<img class="${P}-${s || "logo"}" src="${esc(k.img)}" alt="${esc(k.ad)}" width="200" height="80" loading="lazy" decoding="async" />` : `<span class="${P}-${s || "kelime"}">${esc(k.ad)}</span>`);
/* tüm kartı saran bağlantı (dış bağlantı yeni sekmede) */
/* kartın içeriği tek sarmalayıcıda: url varsa bağlantı (dış → yeni sekme), yoksa div — CSS her iki hâlde aynı kutuyu biçimler */
const bag = (k, ic, s) => (k.url ? `<a class="${P}-${s || "bag"}" href="${esc(k.url)}"${disBag(k.url) ? ' target="_blank" rel="noopener noreferrer"' : ""}${k.img ? ` aria-label="${esc(k.ad)}"` : ""}>${ic}</a>` : `<div class="${P}-${s || "bag"}">${ic}</div>`);
const adH = (k, s, t) => (k.ad ? `<${t || "h3"} class="${P}-${s || "ad"}">${esc(k.ad)}</${t || "h3"}>` : "");
const sH = (k, s) => (k.sektor ? `<p class="${P}-${s || "sektor"}">${esc(k.sektor)}</p>` : "");
const mH = (k, s) => (k.metin ? `<p class="${P}-${s || "kmetin"}">${satirlar(k.metin)}</p>` : "");
const yH = (k, s) => (k.yil ? `<p class="${P}-${s || "yil"}">${esc(k.yil)}</p>` : "");
const rH = (k, s) => `<span class="${P}-${s || "harf"}" aria-hidden="true">${k.img ? `<img src="${esc(k.img)}" alt="" width="64" height="64" loading="lazy" decoding="async" />` : esc(harf(k.ad))}</span>`;
/* --- modül: referans-vaka-metrik --- */
const kart = (k, i) => {
    const o = veri.filter((x) => metinAl(x, ["ad", "name", "baslik", "title"]) || medyaUrl(ilk(x, ["img", "logo", "image"])))[i] || {};
    const sayi = (v) => {
      let t = String(v).replace(/[^\d.,]/g, "");
      if (/[.,]\d{3}$/.test(t)) t = t.replace(/[.,]/g, "");
      else { const p = Math.max(t.lastIndexOf("."), t.lastIndexOf(",")); if (p > -1) t = t.slice(0, p).replace(/[.,]/g, "") + "." + t.slice(p + 1); }
      const n = parseFloat(t);
      return Number.isFinite(n) ? n : NaN;
    };
    const liste = Array.isArray(o.metrikler) ? o.metrikler : (Array.isArray(o.metrics) ? o.metrics : (ilk(o, ["once", "before"]) !== "" ? [o] : []));
    const ms = liste.map((m) => ({ e: metinAl(m, ["etiket", "label", "metrik", "metric"]), o: metinAl(m, ["once", "before"]), s: metinAl(m, ["sonra", "after"]) })).filter((m) => m.o && m.s).slice(0, 4);
    const oe = metinAl(des, ["onceEtiket"]);
    const se = metinAl(des, ["sonraEtiket"]);
    const olcu = ms.map((m) => {
      const a = sayi(m.o);
      const b = sayi(m.s);
      const en = Math.max(a, b);
      const st = en > 0 ? ` style="--o: ${(a / en).toFixed(3)}; --s: ${(b / en).toFixed(3)}"` : "";
      return `<div class="${P}-metrik"${st}><dt class="${P}-me">${esc(m.e)}</dt><dd class="${P}-md"><span class="${P}-once">${esc(m.o)}</span><span class="material-symbols-outlined mx-flip ${P}-mok" aria-hidden="true">arrow_forward</span><span class="${P}-sonra">${esc(m.s)}</span></dd>${st ? `<dd class="${P}-cubuk" aria-hidden="true"><span class="${P}-dolu"></span></dd>` : ""}</div>`;
    }).join("");
    const anahtar = olcu && oe && se ? `<p class="${P}-efsane">${esc(oe)} → ${esc(se)}</p><div class="${P}-anahtar" role="group" aria-label="${esc(k.ad)}"><button type="button" class="${P}-gec" data-vaka-gec="once" aria-pressed="false">${esc(oe)}</button><button type="button" class="${P}-gec" data-vaka-gec="sonra" aria-pressed="true">${esc(se)}</button></div>` : "";
    const alt = [k.sektor, k.yil].filter(Boolean).join(" · ");
    return `<li class="${P}-vaka"${olcu ? " data-vaka" : ""}><div class="${P}-kunye">${rH(k)}<div class="${P}-kad">${k.ad ? `<h3 class="${P}-vad">${esc(k.ad)}</h3>` : lH(k)}${alt ? `<p class="${P}-valt">${esc(alt)}</p>` : ""}</div>${k.url ? `<a class="${P}-git" href="${esc(k.url)}"${disBag(k.url) ? ' target="_blank" rel="noopener noreferrer"' : ""} aria-label="${esc(k.ad)}"><span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_outward</span></a>` : ""}</div>${mH(k)}${olcu ? `${anahtar}<dl class="${P}-olcum">${olcu}</dl>` : ""}${k.kisi ? `<p class="${P}-kisi">${esc(k.kisi)}</p>` : ""}</li>`;
  };
const sar = (ic) => `<ul class="${P}-vakalar" role="list"${listeA()}>${ic}</ul>`;
const B = { ust: metinAl(des, ["ust","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !kayitlar.length;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = basHtml(B, "");
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
