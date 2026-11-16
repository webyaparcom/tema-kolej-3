/* hafta-zaman-cizelgesi — Hafta Zaman Çizelgesi — numaralı hafta pisti ve seçilen haftanın detay paneli (16 Kas 2026 · mcp:webmaker/20261116-113510-tlwf · D17).
   Yatay kaydırılabilir bir pist üzerinde kayıtların `hafta` numaralı daire işaretleri (altında kısa başlık); pist dolgusu seçilen haftaya kadar uzar. Hafta seçilince altındaki panel o haftanın dev numarası, ikonu, başlığı ve metnini gösterir; ok tuşları, Home/End, önceki/sonraki düğmeleri ve «3 / 8» konumu. Açılış haftası `aktifHafta`. JS yokken tüm haftalar numaralı paneller hâlinde alt alta, işaretler panellere bağlantı.
   Üretici: scripts/modul-fabrika (aile module) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: desing: ust · baslik · metin · img · img2 · cta_ad/cta_url · cta2_ad/cta2_url; data (maddeler): [{ ikon?, baslik, metin?, url? }] — metinler dil sözlüğü. */
const P = "modulex-hafta-zaman-cizelgesi";
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
/* --- aile: module --- */
const yeniMadde = veri.map((o) => ({
  ikon: ikonAd(ilk(o, ["ikon", "icon"])), baslik: metinAl(o, ["baslik", "name", "title"]),
  metin: metinAl(o, ["metin", "text", "description", "spot"]), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
/* module-1 eski şeması: name2/spot2/icon2 … name4 → madde */
const eskiMadde = [2, 3, 4].map((n) => ({ ikon: ikonAd(des["icon" + n]), baslik: metinAl(des, ["name" + n]), metin: metinAl(des, ["spot" + n]), url: "" })).filter((k) => k.baslik);
const kayitlar = yeniMadde.length ? yeniMadde : eskiMadde;
const G1 = medyaUrl(ilk(des, ["img", "image"]));
const G2 = medyaUrl(ilk(des, ["img2", "image2"]));
const gH = (src, s, w, h) => (src ? `<img class="${P}-${s}" src="${esc(src)}" alt="" width="${w || 1200}" height="${h || 900}" loading="lazy" decoding="async" />` : "");
const ustH = (B) => (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "");
const basH = (B) => (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "");
const metH = (B) => (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "");
const listeH = (ic) => (ic ? `<ul class="${P}-maddeler" role="list">${ic}</ul>` : "");
const maddeVar = (k, i) => `<li class="${P}-madde">${ikonH(k.ikon || "check_circle", `${P}-mikon`)}<div class="${P}-myazi"><h3 class="${P}-mbaslik">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</h3>${k.metin ? `<p class="${P}-mmetin">${satirlar(k.metin)}</p>` : ""}</div></li>`;
/* --- modül: hafta-zaman-cizelgesi --- */
const kart = () => "";
const sar = (ic, A, B) => {
    const R = yeniMadde.length ? veri.filter((o) => metinAl(o, ["baslik", "name", "title"])) : [];
    const HA = metinAl(des, ["haftaAd"]);
    const W = A.map((k, i) => { const h = Number(metinAl(R[i] || {}, ["hafta", "week", "no"])); return { k, h: Number.isFinite(h) && h > 0 ? h : i + 1 }; }).sort((a, b) => a.h - b.h);
    const ak = Math.max(0, W.findIndex((w) => w.h === Number(metinAl(des, ["aktifHafta"]))));
    const id = (t, i) => `${P}-{{id}}-${t}${i}`;
    const isaret = W.map((w, i) => `<li class="${P}-isaret" role="presentation"><a class="${P}-nokta" role="tab" href="#${id("p", i)}" id="${id("t", i)}" aria-controls="${id("p", i)}" aria-selected="${i === ak}"${i === ak ? "" : ' tabindex="-1"'} data-hi="${i}"><span class="${P}-hno"><bdi>${sayiBicim(w.h, 0)}</bdi></span><span class="${P}-hkisa">${esc(w.k.baslik)}</span></a></li>`).join("");
    const detay = W.map((w, i) => `<article class="${P}-detay" role="tabpanel" id="${id("p", i)}" aria-labelledby="${id("t", i)}" tabindex="0"><p class="${P}-dno">${HA ? `<span>${esc(HA)}</span>` : ""}<strong><bdi>${sayiBicim(w.h, 0)}</bdi></strong></p><div class="${P}-dyazi">${ikonH(w.k.ikon, `${P}-dikon`)}<h3 class="${P}-dbaslik">${w.k.url ? `<a class="${P}-bag" href="${esc(w.k.url)}">${esc(w.k.baslik)}</a>` : esc(w.k.baslik)}</h3>${w.k.metin ? `<p class="${P}-dmetin">${satirlar(w.k.metin)}</p>` : ""}</div></article>`).join("");
    return `<div class="${P}-cizelge"><div class="${P}-giris">${ustH(B)}${basH(B)}${metH(B)}</div><div class="${P}-pist" data-pist style="--dolu: ${(((ak + 0.5) / W.length) * 100).toFixed(2)}%"><ol class="${P}-isaretler" role="tablist" aria-label="${esc(HA || B.baslik)}">${isaret}</ol></div><div class="${P}-detaylar">${detay}</div><div class="${P}-gezinti" data-gezinti hidden><button type="button" class="${P}-gok" data-hy="-1" aria-label="@previous@"><span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_back</span></button><span class="${P}-konum" data-konum aria-live="polite"></span><button type="button" class="${P}-gok" data-hy="1" aria-label="@next@"><span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></button></div>${ctaHtml()}</div>`;
  };
const B = { ust: metinAl(des, ["ust","title","badge"]), baslik: metinAl(des, ["baslik","name"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !B.baslik && !B.metin;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = "";
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
