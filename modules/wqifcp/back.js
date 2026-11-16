/* surec-kayit-kontrol — Süreç Kayıt Kontrol — işaretlenebilir kayıt listesi + belge bağlantıları (16 Kas 2026 · mcp:webmaker/20261116-113510-tlwf · D17).
   Solda yapışkan ilerleme panosu (halka gösterge, «n / t adım tamamlandı», sıfırla düğmesi, saklama notu), sağda gerçek onay kutulu adım kartları: etiket, başlık, süre rozeti, açıklama, gerekli belgeler (indirme bağlantılı çipler) ve ayrıntı bağlantısı. İşaretler cihazda (localStorage) kalır; JS yokken kutular yine işaretlenir, pano gizlenir.
   Üretici: scripts/modul-fabrika (aile surec) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ baslik, metin?, ikon?, sure?, no?, img?, url? }] — metinler dil sözlüğü; başlıksız adım atlanır. desing `adimEtiket` (eski `stepLabel`) «Adım {n}» kalıbı. */
const P = "modulex-surec-kayit-kontrol";
const IMG_KOK = "/img/";
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
/* --- aile: surec --- */
const kaynak = veri.length ? veri : (json.data && Array.isArray(json.data.adimlar) ? json.data.adimlar : (Array.isArray(des.adimlar) ? des.adimlar : []));
const adimKalip = metinAl(des, ["adimEtiket", "stepLabel"]);
const kayitlar = kaynak.map((o) => ({
  no: String(ilk(o, ["no", "numara"]) || "").trim(), baslik: metinAl(o, ["baslik", "title", "name", "ad"]),
  metin: metinAl(o, ["metin", "text", "description", "aciklama", "ozet"]), ikon: ikonAd(ilk(o, ["ikon", "icon"])),
  sure: metinAl(o, ["sure", "duration", "zaman"]), img: medyaUrl(ilk(o, ["img", "image", "gorsel"])), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
kayitlar.forEach((k, i) => { k.sira = k.no || no(i); k.etiket = adimKalip ? adimKalip.replace(/\{n\}/g, k.no || String(i + 1)) : ""; });
const bH = (k, s, t) => `<${t || "h3"} class="${P}-${s || "kbaslik"}">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</${t || "h3"}>`;
const mH = (k, s) => (k.metin ? `<p class="${P}-${s || "kmetin"}">${satirlar(k.metin)}</p>` : "");
const eH = (k, s) => (k.etiket ? `<p class="${P}-${s || "etiket"}">${esc(k.etiket)}</p>` : "");
const sH = (k) => (k.sure ? `<p class="${P}-sure"><span class="material-symbols-outlined" aria-hidden="true">schedule</span>${esc(k.sure)}</p>` : "");
const gH = (k, s) => (k.img ? `<img class="${P}-${s || "gorsel"}" src="${esc(k.img)}" alt="" width="800" height="560" loading="lazy" decoding="async" />` : "");
/* --- modül: surec-kayit-kontrol --- */
const kart = (k, i) => {
    const o = kaynak.filter((x) => metinAl(x, ["baslik", "title", "name", "ad"]))[i] || {};
    const bl = (Array.isArray(o.belgeler) ? o.belgeler : (Array.isArray(o.documents) ? o.documents : [])).map((b) => ({ ad: metinAl(b, ["ad", "baslik", "name", "title"]), url: href(ilk(b, ["url", "link", "dosya", "file"])) })).filter((b) => b.ad);
    const be = metinAl(des, ["belgeEtiket"]);
    const id = `${P}-{{id}}-c${i}`;
    const belge = bl.length ? `<div class="${P}-belge">${be ? `<p class="${P}-betk">${esc(be)}</p>` : ""}<ul class="${P}-blist">${bl.map((b) => `<li>${b.url ? `<a class="${P}-bbag" href="${esc(b.url)}"${/^(https?:)?\/\//i.test(b.url) ? ' target="_blank" rel="noopener noreferrer"' : ""}><span class="material-symbols-outlined" aria-hidden="true">download</span>${esc(b.ad)}</a>` : `<span class="${P}-bbag ${P}-bbag--yalin"><span class="material-symbols-outlined" aria-hidden="true">description</span>${esc(b.ad)}</span>`}</li>`).join("")}</ul></div>` : "";
    const git = k.url ? `<a class="${P}-git" href="${esc(k.url)}">@read-more@<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "";
    return `<li class="${P}-madde" data-kk-madde><div class="${P}-mbas"><input class="${P}-kutu" type="checkbox" id="${id}" data-kk="${i}" /><label class="${P}-metk" for="${id}"><span class="${P}-isaret" aria-hidden="true"><span class="material-symbols-outlined">check</span></span><span class="${P}-myazi">${k.etiket ? `<span class="${P}-etiket">${esc(k.etiket)}</span>` : ""}<span class="${P}-kbaslik">${esc(k.baslik)}</span></span></label>${sH(k)}</div>${k.metin || belge || git ? `<div class="${P}-mgovde">${mH(k)}${belge}${git}</div>` : ""}</li>`;
  };
const sar = (ic, A) => {
    const kalip = metinAl(des, ["ilerlemeEtiket"]);
    const sf = metinAl(des, ["sifirlaEtiket"]);
    const notM = metinAl(des, ["kayitNot"]);
    const t = A.length;
    const yaz = (n) => (kalip ? kalip.split("{n}").join(sayiBicim(n, 0)).split("{t}").join(sayiBicim(t, 0)) : `${sayiBicim(n, 0)} / ${sayiBicim(t, 0)}`);
    return `<div class="${P}-duzen"><aside class="${P}-pano" data-kk-pano data-kk-kalip="${esc(kalip)}"><div class="${P}-olcer" data-kk-olcer><span class="${P}-oic"><strong class="${P}-osay" data-kk-sayi>${sayiBicim(0, 0)}</strong><span class="${P}-otop">/ ${sayiBicim(t, 0)}</span></span></div><p class="${P}-durum" aria-live="polite" data-kk-durum>${esc(yaz(0))}</p>${sf ? `<button type="button" class="${P}-sifirla" data-kk-sifirla><span class="material-symbols-outlined" aria-hidden="true">restart_alt</span>${esc(sf)}</button>` : ""}${notM ? `<p class="${P}-not">${esc(notM)}</p>` : ""}</aside><ol class="${P}-liste">${ic}</ol></div>`;
  };
const B = { ust: metinAl(des, ["ust","eyebrow","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description","aciklama"]) };
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
