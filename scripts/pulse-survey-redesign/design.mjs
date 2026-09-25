// ————————————————————————————————————————————————————————————————————————
// Pulse survey redesign (scorecard 11 only): landing + thank-you shells.
//
// This is the source of record for the Table Tennis Club Pulse Check's
// custom-designed pages. It is applied to scorecard 11's config in the
// database by apply.mjs; it deliberately does NOT touch the club survey
// template in lib/surveyTemplate.ts, so new scorecards created from the
// template keep the old look.
//
// Landing page ("How does your club compare?", 2026): white and pale blue
// sections, deep navy type, one green for every action, Plus Jakarta Sans,
// and real photography (a player at the table, Joel at the club). Icons are
// SVG data URIs in the CSS. Every line of copy is a slot, so the whole page
// stays editable in the admin's Custom Design editor.
//
// Thank-you page: the earlier clean white and navy design, Space Grotesk
// display over Inter, icons as SVG data URIs in the CSS.
// ————————————————————————————————————————————————————————————————————————

const IMG = 'https://lenicbvdsepyljntsnht.supabase.co/storage/v1/object/public/scorecard-images/pulse';

// Stock photography, hotlinked from the Unsplash CDN (their licence allows
// hotlinking and commercial use, no attribution required). It is a slot, so
// it can be swapped in Custom Design without touching code.
const PHOTO_HERO = 'https://images.unsplash.com/photo-1518928286447-dc161b7cd6fb?auto=format&fit=crop&w=1600&q=80';

const slot = (key, label, value, type = 'text') => ({ key, type, label, value });

// ——— Shared foundations ————————————————————————————————————————————————

// @font-face instead of @import: the app injects this CSS after a base rule,
// and browsers ignore any @import that is not at the very top of a
// stylesheet. @font-face works from anywhere, so the display font loads.
const BASE_CSS = `
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:500 700;font-display:swap;
  src:url(https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2) format('woff2');
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:500 700;font-display:swap;
  src:url(https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPb94C-s0.woff2) format('woff2');
  unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
.ck{--ink:#0A1B2E;--mut:#51607A;--bg:#FFFFFF;--bg2:#F4F7FB;--line:#E3E9F2;
  --blue:#1D63ED;--blue-deep:#1348B8;--navy:#0C2240;--navy-deep:#081830;--tint:#EAF1FE;
  --orange:#F4732C;--green:#12A150;
  background:var(--bg);color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.5;overflow:hidden}
.ck h1,.ck h2,.ck h3,.ck .ck-display{font-family:'Space Grotesk',Inter,sans-serif;letter-spacing:-0.01em}
.ck h1,.ck h2{text-wrap:balance}
.ck-wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.ck-kicker{font-size:12.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--blue)}
.ck-btn{display:inline-block;border:0;cursor:pointer;font-family:'Space Grotesk',Inter,sans-serif;font-weight:700;
  text-decoration:none;text-align:center;border-radius:12px;transition:transform .15s ease,box-shadow .15s ease,filter .15s ease}
.ck-btn:hover{transform:translateY(-2px);filter:brightness(1.06)}
.ck-btn-blue{background:linear-gradient(120deg,var(--blue),var(--blue-deep));color:#fff;box-shadow:0 12px 28px rgba(29,99,237,.28)}
.ck-btn-white{background:#fff;color:var(--blue-deep);box-shadow:0 12px 28px rgba(4,14,32,.30)}
.ck-btn-xl{font-size:17px;padding:16px 38px}
.ck-ico{flex:none;width:46px;height:46px;border-radius:13px;background-color:var(--tint);
  background-repeat:no-repeat;background-position:center;background-size:24px 24px}
.ck-ico-users{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231D63ED' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E")}
.ck-ico-clock{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231D63ED' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 7v5l3 3'/%3E%3C/svg%3E")}
.ck-ico-dollar{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231D63ED' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2v20'/%3E%3Cpath d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/%3E%3C/svg%3E")}
.ck-ico-trend{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231D63ED' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 17l6-6 4 4 8-8'/%3E%3Cpath d='M14 7h7v7'/%3E%3C/svg%3E")}
.ck-ico-report{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B9D2FF' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpath d='M14 2v6h6'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3C/svg%3E")}
.ck-ico-percent{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B9D2FF' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='5' x2='5' y2='19'/%3E%3Ccircle cx='6.5' cy='6.5' r='2.5'/%3E%3Ccircle cx='17.5' cy='17.5' r='2.5'/%3E%3C/svg%3E")}
.ck-ico-shield{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B9D2FF' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3Cpath d='M9 12l2 2 4-4'/%3E%3C/svg%3E")}
.ck-tick{display:flex;gap:11px;align-items:flex-start}
.ck-tick::before{content:'';flex:none;width:22px;height:22px;margin-top:1px;border-radius:50%;background-color:#E5F5EC;
  background-repeat:no-repeat;background-position:center;background-size:13px 13px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2312A150' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E")}
`;

// ——— Landing page ——————————————————————————————————————————————————————
//
// "How does your club compare?" A light, plain spoken research page: white
// and pale blue sections, deep navy type, one green for every action, and
// real photography (the player serving, Joel at the club). Icons are SVG
// data URIs in the CSS because the sanitiser strips <svg>. Every line of
// copy is a slot so it stays editable in Custom Design. Desktop is a two
// column page; below 860px everything stacks to one column and buttons go
// full width.

const FONT_CSS = `
@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:200 800;font-display:swap;src:url(https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2) format('woff2')}
`;

// Stroke icons, navy unless noted. Keep them in one place so a colour change
// is a single edit.
const I = (paths, stroke = '%230B2A4A', w = 1.9) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${stroke}' stroke-width='${w}' stroke-linecap='round' stroke-linejoin='round'%3E${paths}%3C/svg%3E")`;
const P = {
  clock: "%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 7v5l3 2'/%3E",
  bars: "%3Cpath d='M4 20V14'/%3E%3Cpath d='M10 20V9'/%3E%3Cpath d='M16 20V4'/%3E%3Cpath d='M22 20H2'/%3E",
  people: "%3Ccircle cx='9' cy='8' r='3.5'/%3E%3Cpath d='M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6'/%3E%3Ccircle cx='17' cy='9' r='2.5'/%3E%3Cpath d='M16 14.2c3 .2 5.5 2.4 5.5 5.8'/%3E",
  lock: "%3Crect x='4' y='10' width='16' height='11' rx='2'/%3E%3Cpath d='M8 10V7a4 4 0 0 1 8 0v3'/%3E",
  doc: "%3Cpath d='M7 3h7l5 5v13H7z'/%3E%3Cpath d='M14 3v5h5'/%3E%3Cpath d='M10 13h6M10 17h6'/%3E",
  coins: "%3Cellipse cx='12' cy='6' rx='7' ry='3'/%3E%3Cpath d='M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6'/%3E%3Cpath d='M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6'/%3E",
  trend: "%3Cpath d='M3 17l6-6 4 4 8-8'/%3E%3Cpath d='M14 7h7v7'/%3E",
  tick: "%3Cpath d='M20 6L9 17l-5-5'/%3E",
  shield: "%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E",
  person: "%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M4 21c0-4 3.6-7 8-7s8 3 8 7'/%3E",
  hands: "%3Cpath d='M11 12l-3-3a2 2 0 0 0-3 3l5 5a4 4 0 0 0 6 0l4-4a2 2 0 0 0-3-3l-2 2'/%3E%3Cpath d='M12 11l3-3a2 2 0 0 1 3 3'/%3E",
  arrow: "%3Cpath d='M5 12h14M13 6l6 6-6 6'/%3E",
};

// Logo: Australia (with Tasmania) in navy, a red bat over the south east.
const LOGO_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 110 96'>" +
  "<path fill='#0B2A4A' d='M6 40 L10 31 L18 27 L24 21 L31 19 L35 13 L41 13 L43 8 L49 6 L51 10 L55 8 L59 4 L63 6 L61 12 L65 16 L67 22 L69 16 L71 8 L73 2 L75 6 L77 16 L81 22 L85 28 L89 34 L93 42 L95 50 L93 58 L89 66 L83 72 L77 76 L71 74 L67 70 L63 66 L59 62 L57 66 L51 62 L41 58 L31 60 L23 62 L15 66 L9 64 L7 56 L5 47 Z'/>" +
  "<path fill='#0B2A4A' d='M76 82 L83 81 L84 87 L79 90 L75 87 Z'/>" +
  "<path d='M91 80 L104 93' stroke='#FFFFFF' stroke-width='12' stroke-linecap='round'/>" +
  "<path d='M91 80 L104 93' stroke='#A8743F' stroke-width='7' stroke-linecap='round'/>" +
  "<circle cx='83' cy='67' r='18' fill='#D2333B' stroke='#FFFFFF' stroke-width='4'/>" +
  "<circle cx='58' cy='84' r='6.5' fill='#F4A11D' stroke='#FFFFFF' stroke-width='2.5'/>" +
  '</svg>';
const LOGO = `url("data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}")`;

const LANDING_CSS = FONT_CSS + `
.cp{--navy:#0B2A4A;--ink:#12213A;--mut:#4A5A70;--bg:#FFFFFF;--bg2:#F3F7FB;--line:#DCE5EF;--green:#1E9E4A;--green-deep:#177F3B;--green-tint:#E8F6EC;
  background:var(--bg);color:var(--ink);font-family:'Plus Jakarta Sans',Inter,system-ui,sans-serif;font-size:17px;line-height:1.55;overflow:hidden}
.cp *{box-sizing:border-box}
.cp h1,.cp h2,.cp h3{font-family:'Plus Jakarta Sans',Inter,sans-serif;font-weight:800;letter-spacing:-0.02em;line-height:1.08;margin:0;color:var(--navy);text-wrap:balance}
.cp :where(p){margin:0}
.cp-wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.cp-kicker{font-size:12.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--green)}
.cp-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:17px;
  color:#fff;background:var(--green);border-radius:10px;padding:16px 26px;min-height:56px;text-decoration:none;transition:background .15s ease}
.cp-btn:hover{background:var(--green-deep)}
.cp-btn:focus-visible{outline:3px solid var(--navy);outline-offset:3px}
.cp-btn::after{content:'';width:18px;height:18px;background:no-repeat center/18px ${I(P.arrow, 'white', 2.4)}}

/* top bar */
.cp-top{display:flex;align-items:center;justify-content:space-between;gap:16px;max-width:1120px;margin:0 auto;padding:16px 24px;border-bottom:1px solid var(--line)}
.cp-brand{display:flex;align-items:center;gap:12px}
.cp-paddle{width:46px;height:42px;flex:none;background:no-repeat center/contain ${LOGO}}
.cp-brand b{font-weight:800;font-size:17px;color:var(--navy)}
.cp-brand-tag{display:block;font-size:12px;color:var(--mut);line-height:1.3;border-left:1px solid var(--line);padding-left:12px}
.cp-top-right{font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--mut);white-space:nowrap}

/* hero */
.cp-hero{max-width:1120px;margin:0 auto;padding:48px 24px 56px;display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center}
.cp-h1{font-size:clamp(38px,5vw,60px)}
.cp-h1 b{color:var(--green);font-weight:800}
.cp-lede{font-size:18px;color:var(--ink);margin-top:24px;max-width:520px}
.cp-lede2{font-size:16.5px;color:var(--mut);margin-top:16px;max-width:520px}
.cp-hero .cp-btn{margin-top:30px}
.cp-facts{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin:32px 0 0;padding:0}
.cp-facts li{display:flex;gap:10px;align-items:flex-start;font-size:14.5px;line-height:1.45;color:var(--ink);font-weight:500}
.cp-facts li b{font-weight:700}
.cp-facts i{flex:none;width:30px;height:30px;background:no-repeat center/26px}
.cp-facts .cp-i-clock{background-image:${I(P.clock)}}
.cp-facts .cp-i-bars{background-image:${I(P.bars)}}
.cp-facts .cp-i-people{background-image:${I(P.people)}}
.cp-lockline{display:flex;gap:8px;align-items:center;margin-top:28px;padding-top:18px;border-top:1px solid var(--line);font-size:13px;color:var(--mut)}
.cp-lockline::before{content:'';flex:none;width:14px;height:14px;background:no-repeat center/14px ${I(P.lock, '%234A5A70', 2.2)}}
.cp-photo{position:relative;min-height:320px;border-radius:18px;overflow:hidden;background:var(--navy)}
.cp-photo img{display:block;width:100%;height:100%;min-height:320px;aspect-ratio:4/3.6;object-fit:cover;object-position:center top}
.cp-photo::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.35),transparent 40%)}

/* asked */
.cp-asked{background:var(--bg2);padding:56px 0 60px}
.cp-asked h2,.cp-back h2,.cp-who h2,.cp-few h2{font-size:clamp(28px,3.4vw,40px);margin-top:8px}
.cp-sub{font-size:17px;color:var(--mut);margin-top:12px;max-width:640px}
.cp-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:28px}
.cp-card{border-radius:16px;padding:24px 22px 26px}
.cp-card i{display:block;width:40px;height:40px;background:no-repeat left center/38px}
.cp-card h3{font-size:19px;margin-top:18px}
.cp-card p{font-size:14.5px;color:var(--mut);margin-top:8px;line-height:1.5}
.cp-card-blue{background:#E6F0FA}.cp-card-blue i{background-image:${I(P.people, '%231A4F86', 1.8)}}
.cp-card-green{background:#E7F6EC}.cp-card-green i{background-image:${I(P.doc, '%23177F3B', 1.8)}}
.cp-card-yellow{background:#FBF3DC}.cp-card-yellow i{background-image:${I(P.coins, '%23A87814', 1.8)}}
.cp-card-red{background:#FBE9E9}.cp-card-red i{background-image:${I(P.trend, '%23B4342E', 1.8)}}
.cp-note{display:flex;gap:10px;align-items:center;margin-top:20px;background:var(--green-tint);border:1px solid #CBE9D4;border-radius:12px;padding:14px 18px;font-size:15px;color:var(--ink)}
.cp-note::before{content:'';flex:none;width:20px;height:20px;border-radius:50%;background:var(--green) no-repeat center/12px ${I(P.tick, 'white', 3)}}
.cp-note b{font-weight:700}

/* back */
.cp-back{padding:60px 0 64px}
.cp-back-grid{display:grid;grid-template-columns:1fr .9fr;gap:40px;align-items:center}
.cp-ticks{list-style:none;padding:0;margin:20px 0 0;display:grid;gap:9px}
.cp-ticks li{display:flex;gap:10px;align-items:flex-start;font-size:15.5px;color:var(--ink)}
.cp-ticks li::before{content:'';flex:none;width:20px;height:20px;margin-top:1px;border-radius:50%;background:var(--green) no-repeat center/12px ${I(P.tick, 'white', 3)}}
.cp-agg{font-size:13.5px;color:var(--mut);margin-top:18px}
.cp-back .cp-btn{margin-top:22px}
/* the report, drawn in CSS: three sheets, the front one titled */
.cp-report{position:relative;height:380px}
.cp-sheet{position:absolute;background:#fff;border:1px solid var(--line);border-radius:6px;box-shadow:0 20px 50px rgba(11,42,74,.14)}
.cp-sheet-1{left:6%;top:26px;width:52%;height:320px;transform:rotate(-4deg);padding:26px 22px;z-index:3}
.cp-sheet-1 small{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--green)}
.cp-sheet-1 h3{font-size:22px;line-height:1.1;margin-top:8px}
.cp-sheet-1 p{font-size:11.5px;color:var(--mut);margin-top:8px;line-height:1.4}
.cp-dots{position:absolute;left:22px;right:22px;bottom:22px;height:110px;border-radius:8px;background:var(--bg2);overflow:hidden}
.cp-dots span{position:absolute;width:9px;height:9px;border-radius:50%;background:var(--green)}
.cp-dots span:nth-child(1){left:18%;top:28%}.cp-dots span:nth-child(2){left:34%;top:60%}.cp-dots span:nth-child(3){left:55%;top:22%}
.cp-dots span:nth-child(4){left:70%;top:48%}.cp-dots span:nth-child(5){left:80%;top:75%}.cp-dots span:nth-child(6){left:44%;top:82%}.cp-dots span:nth-child(7){left:62%;top:66%}
.cp-sheet-2{left:44%;top:0;width:40%;height:300px;transform:rotate(5deg);padding:20px 18px;z-index:2}
.cp-bars{display:flex;align-items:flex-end;gap:8px;height:120px;margin-top:40px;padding-bottom:0;border-bottom:2px solid var(--line)}
.cp-bars span{flex:1;background:#2F6FB2;border-radius:3px 3px 0 0}
.cp-bars span:nth-child(1){height:35%}.cp-bars span:nth-child(2){height:55%}.cp-bars span:nth-child(3){height:48%}.cp-bars span:nth-child(4){height:80%}.cp-bars span:nth-child(5){height:100%}
.cp-sheet-3{left:62%;top:150px;width:36%;height:210px;transform:rotate(9deg);padding:18px;z-index:1}
.cp-donut{width:110px;height:110px;border-radius:50%;margin:16px auto 0;background:conic-gradient(#D2333B 0 68%,#2F6FB2 68% 100%);position:relative}
.cp-donut::after{content:'68%';position:absolute;inset:26px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;color:var(--navy)}
.cp-sheet-line{height:7px;border-radius:4px;background:var(--line);margin-top:8px}
.cp-sheet-line.w1{width:70%}.cp-sheet-line.w2{width:45%}

/* who */
.cp-who{background:var(--bg2);padding:56px 0 60px}
.cp-who-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:44px;align-items:center}
.cp-portrait{border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(11,42,74,.14);background:var(--navy)}
.cp-portrait img{display:block;width:100%;height:auto;aspect-ratio:4/3.6;object-fit:cover;object-position:center top}
.cp-who p.cp-body{font-size:16.5px;color:var(--ink);margin-top:14px}
.cp-sig{margin-top:22px;font-size:15px}
.cp-sig b{display:block;font-weight:800;color:var(--navy);font-size:16px}
.cp-sig i{color:var(--mut)}

/* few */
.cp-few{padding:56px 0 64px}
.cp-few-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;margin-top:28px}
.cp-few-item{display:grid;grid-template-columns:40px 1fr;gap:12px;align-items:start}
.cp-few-item i{width:40px;height:40px;background:no-repeat center/34px}
.cp-few-item h3{font-size:16.5px;line-height:1.25}
.cp-few-item p{font-size:14px;color:var(--mut);margin-top:8px;line-height:1.5}
.cp-i-shield{background-image:${I(P.shield, '%231A4F86')}}
.cp-i-person{background-image:${I(P.person, '%231A4F86')}}
.cp-i-clock2{background-image:${I(P.clock, '%231A4F86')}}
.cp-i-hands{background-image:${I(P.hands, '%231A4F86')}}

/* final */
.cp-final{background:linear-gradient(120deg,#0B2A4A,#153E68 70%,#1A4F86);color:#fff;padding:64px 0 70px;position:relative;overflow:hidden}
.cp-final::before{content:'';position:absolute;right:-60px;bottom:-40px;width:520px;height:220px;background:linear-gradient(180deg,#1B3F66,#0E2B4B);border-radius:12px;transform:rotate(-8deg);opacity:.9}
.cp-final::after{content:'';position:absolute;right:120px;bottom:64px;width:84px;height:84px;border-radius:50%;background:radial-gradient(circle at 35% 32%,#FFFFFF,#E9EDF2 60%,#B8C1CC);box-shadow:0 18px 30px rgba(0,0,0,.45)}
.cp-final .cp-wrap{position:relative;z-index:1}
.cp-final h2{color:#fff;font-size:clamp(28px,3.4vw,40px);max-width:620px}
.cp-final p{margin-top:14px;font-size:17px;color:#D6E2F0;max-width:560px}
.cp-final p b{color:#fff}
.cp-final .cp-btn{margin-top:24px}
.cp-final .cp-small{font-size:13px;color:#B9C9DC;margin-top:14px}
.cp-foot{text-align:center;font-size:13px;color:var(--mut);padding:22px 24px}

@media (max-width:860px){
  .cp-top{padding:14px 20px}
  .cp-brand-tag,.cp-top-right{display:none}
  .cp-hero{grid-template-columns:1fr;gap:28px;padding:28px 20px 40px}
  .cp-h1{font-size:clamp(34px,9.5vw,44px)}
  .cp-lede{font-size:17px}
  .cp-hero .cp-btn,.cp-back .cp-btn,.cp-final .cp-btn{width:100%}
  .cp-facts{grid-template-columns:1fr;gap:14px;margin-top:28px}
  .cp-facts li{font-size:15px}
  .cp-photo{min-height:0;order:-1}
  .cp-photo img{min-height:0;aspect-ratio:16/11}
  .cp-photo::after{display:none}
  .cp-wrap{padding:0 20px}
  .cp-cards{grid-template-columns:1fr 1fr;gap:12px}
  .cp-card{padding:20px 18px}
  .cp-back-grid,.cp-who-grid{grid-template-columns:1fr;gap:32px}
  .cp-report{width:100%;height:300px;max-width:420px;margin:0 auto}
  .cp-sheet-1{height:260px}.cp-sheet-2{height:240px}.cp-sheet-3{top:120px;height:170px}
  .cp-portrait{max-width:420px}
  .cp-few-grid{grid-template-columns:1fr 1fr;gap:22px}
  .cp-final{padding:52px 0 60px}
  .cp-final::before,.cp-final::after{display:none}
}
@media (max-width:520px){
  .cp-cards,.cp-few-grid{grid-template-columns:1fr}
  .cp-report{height:260px}
  .cp-sheet-1{height:250px;padding:20px 18px}.cp-sheet-1 h3{font-size:18px}.cp-dots{height:70px;left:18px;right:18px;bottom:18px}.cp-sheet-2{height:210px}.cp-sheet-3{display:none}
}
`;

const LANDING_HTML = `
<div class="cp-page cp">
  <header class="cp-top">
    <div class="cp-brand"><span class="cp-paddle"></span><div><b>{{text:brand}}</b></div><span class="cp-brand-tag">{{text:brand_tag}}</span></div>
    <span class="cp-top-right">{{text:top_right}}</span>
  </header>

  <section class="cp-hero">
    <div>
      <h1 class="cp-h1">{{rich:hero_title}}</h1>
      <p class="cp-lede">{{text:hero_p1}}</p>
      <p class="cp-lede2">{{text:hero_p2}}</p>
      <button class="cp-btn" data-start-scorecard>{{text:hero_cta}}</button>
      <ul class="cp-facts">
        <li><i class="cp-i-clock"></i><span>{{rich:fact1}}</span></li>
        <li><i class="cp-i-bars"></i><span>{{rich:fact2}}</span></li>
        <li><i class="cp-i-people"></i><span>{{rich:fact3}}</span></li>
      </ul>
      <p class="cp-lockline">{{text:lockline}}</p>
    </div>
    <div class="cp-photo"><img src="{{image:hero_photo}}" alt="A table tennis player at the table, mid rally"></div>
  </section>

  <section class="cp-asked"><div class="cp-wrap">
    <p class="cp-kicker">{{text:asked_kicker}}</p>
    <h2>{{text:asked_title}}</h2>
    <p class="cp-sub">{{text:asked_sub}}</p>
    <div class="cp-cards">
      <div class="cp-card cp-card-blue"><i></i><h3>{{text:c1_title}}</h3><p>{{text:c1_body}}</p></div>
      <div class="cp-card cp-card-green"><i></i><h3>{{text:c2_title}}</h3><p>{{text:c2_body}}</p></div>
      <div class="cp-card cp-card-yellow"><i></i><h3>{{text:c3_title}}</h3><p>{{text:c3_body}}</p></div>
      <div class="cp-card cp-card-red"><i></i><h3>{{text:c4_title}}</h3><p>{{text:c4_body}}</p></div>
    </div>
    <p class="cp-note"><span>{{rich:asked_note}}</span></p>
  </div></section>

  <section class="cp-back"><div class="cp-wrap cp-back-grid">
    <div>
      <p class="cp-kicker">{{text:back_kicker}}</p>
      <h2>{{text:back_title}}</h2>
      <p class="cp-sub">{{text:back_sub}}</p>
      <ul class="cp-ticks">
        <li>{{text:r1}}</li><li>{{text:r2}}</li><li>{{text:r3}}</li><li>{{text:r4}}</li><li>{{text:r5}}</li><li>{{text:r6}}</li>
      </ul>
      <p class="cp-agg">{{text:back_agg}}</p>
      <button class="cp-btn" data-start-scorecard>{{text:back_cta}}</button>
    </div>
    <div class="cp-report" aria-hidden="true">
      <div class="cp-sheet cp-sheet-1"><small>{{text:report_eyebrow}}</small><h3>{{text:report_title}}</h3><p>{{text:report_sub}}</p>
        <div class="cp-dots"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div>
      <div class="cp-sheet cp-sheet-2"><div class="cp-sheet-line w1"></div><div class="cp-sheet-line w2"></div><div class="cp-bars"><span></span><span></span><span></span><span></span><span></span></div></div>
      <div class="cp-sheet cp-sheet-3"><div class="cp-sheet-line w1"></div><div class="cp-donut"></div></div>
    </div>
  </div></section>

  <section class="cp-who"><div class="cp-wrap cp-who-grid">
    <div class="cp-portrait"><img src="{{image:joel_portrait}}" alt="Joel Badcock at the Devonport club"></div>
    <div>
      <p class="cp-kicker">{{text:who_kicker}}</p>
      <h2>{{text:who_title}}</h2>
      <p class="cp-body">{{text:who_p1}}</p>
      <p class="cp-body">{{text:who_p2}}</p>
      <p class="cp-sig"><b>{{text:sig_name}}</b><i>{{text:sig_role}}</i></p>
    </div>
  </div></section>

  <section class="cp-few"><div class="cp-wrap">
    <p class="cp-kicker">{{text:few_kicker}}</p>
    <h2>{{text:few_title}}</h2>
    <div class="cp-few-grid">
      <div class="cp-few-item"><i class="cp-i-shield"></i><div><h3>{{text:k1_title}}</h3><p>{{text:k1_body}}</p></div></div>
      <div class="cp-few-item"><i class="cp-i-person"></i><div><h3>{{text:k2_title}}</h3><p>{{text:k2_body}}</p></div></div>
      <div class="cp-few-item"><i class="cp-i-clock2"></i><div><h3>{{text:k3_title}}</h3><p>{{text:k3_body}}</p></div></div>
      <div class="cp-few-item"><i class="cp-i-hands"></i><div><h3>{{text:k4_title}}</h3><p>{{text:k4_body}}</p></div></div>
    </div>
  </div></section>

  <section class="cp-final"><div class="cp-wrap">
    <h2>{{text:cta_title}}</h2>
    <p>{{rich:cta_sub}}</p>
    <button class="cp-btn" data-start-scorecard>{{text:cta_btn}}</button>
    <p class="cp-small">{{text:cta_note}}</p>
  </div></section>

  <footer class="cp-foot">{{text:footer1}} {{text:footer2}}</footer>
</div>`;

export function landingPage() {
  return {
    html: LANDING_HTML,
    css: LANDING_CSS,
    slots: [
      slot('brand', 'Wordmark', 'Club Pulse Check'),
      slot('brand_tag', 'Tagline beside the wordmark', 'Help shape the future of table tennis in Australia'),
      slot('top_right', 'Top right label', 'National club survey'),
      slot('hero_title', 'Headline', 'How does your club <b>compare?</b>', 'rich'),
      slot(
        'hero_p1',
        'Hero paragraph 1',
        'We are asking table tennis clubs across Australia the same short set of questions about volunteers, admin, money and membership.'
      ),
      slot(
        'hero_p2',
        'Hero paragraph 2',
        'If you help run your club, you can answer based on what you know. You do not need committee approval or perfectly exact figures.'
      ),
      slot('hero_cta', 'Hero button', 'Start the Club Pulse Check'),
      slot('fact1', 'Fact 1', 'Takes about <b>5 minutes</b>', 'rich'),
      slot('fact2', 'Fact 2', '<b>National results</b> for every club', 'rich'),
      slot('fact3', 'Fact 3', '<b>One response</b> per club', 'rich'),
      slot('lockline', 'Line under the facts', 'No commitment. Your club will never be singled out in the results.'),
      slot('hero_photo', 'Hero photo', PHOTO_HERO, 'image'),
      slot('asked_kicker', 'Asked section kicker', 'What you will be asked'),
      slot('asked_title', 'Asked section title', 'Nothing you need to prepare'),
      slot('asked_sub', 'Asked section subline', 'We are looking for a practical picture of how clubs actually run. You will be asked about four things:'),
      slot('c1_title', 'Card 1 title', 'Volunteers'),
      slot('c1_body', 'Card 1 body', 'How many people keep the club running and whether too much depends on one or two people.'),
      slot('c2_title', 'Card 2 title', 'Admin'),
      slot('c2_body', 'Card 2 body', 'Where time goes across registrations, fixtures, results, communication and other club work.'),
      slot('c3_title', 'Card 3 title', 'Money'),
      slot('c3_body', 'Card 3 body', 'How fees, grants and everyday finances are handled.'),
      slot('c4_title', 'Card 4 title', 'Members'),
      slot('c4_body', 'Card 4 body', 'Whether the club is growing, shrinking or staying about the same.'),
      slot('asked_note', 'Green note', '<b>Best estimates</b> are completely fine. We know every club is different.', 'rich'),
      slot('back_kicker', 'Report section kicker', 'What you get back'),
      slot('back_title', 'Report section title', 'The National Club Pulse Report'),
      slot('back_sub', 'Report section subline', 'When the survey closes, every participating club receives a summary of the national results.'),
      slot('r1', 'Report line 1', 'How many volunteers clubs rely on'),
      slot('r2', 'Report line 2', 'Where committee time is being spent'),
      slot('r3', 'Report line 3', 'Which jobs create the most admin'),
      slot('r4', 'Report line 4', 'How clubs handle fees and funding'),
      slot('r5', 'Report line 5', 'Whether membership is growing or declining'),
      slot('r6', 'Report line 6', 'How your club compares with the wider national picture'),
      slot('back_agg', 'Aggregate note', 'The results will be reported in aggregate. Individual clubs will not be named or ranked.'),
      slot('back_cta', 'Report section button', 'Add your club to the national picture'),
      slot('report_eyebrow', 'Report cover eyebrow', 'National survey'),
      slot('report_title', 'Report cover title', 'The National Club Pulse Report'),
      slot('report_sub', 'Report cover subline', 'Insights from table tennis clubs across Australia'),
      slot('who_kicker', 'Who section kicker', 'Who is asking'),
      slot('who_title', 'Who section title', 'From one club committee to another'),
      slot('joel_portrait', 'Portrait photo', `${IMG}/joel.jpg`, 'image'),
      slot(
        'who_p1',
        'Who paragraph 1',
        'I am Joel Badcock, treasurer of the Devonport Table Tennis Association in Tasmania. Like most clubs, we have seen how much work can end up sitting with a handful of volunteers.'
      ),
      slot(
        'who_p2',
        'Who paragraph 2',
        'We started improving the way our own club operates, which made me curious about whether clubs around Australia face the same problems. This survey is designed to find out, and everyone who contributes gets the results back.'
      ),
      slot('sig_name', 'Signature name', 'Joel Badcock'),
      slot('sig_role', 'Signature role', 'Treasurer, Devonport Table Tennis Association'),
      slot('few_kicker', 'Important things kicker', 'A few important things'),
      slot('few_title', 'Important things title', 'Straightforward, confidential and no commitment'),
      slot('k1_title', 'Point 1 title', 'Your club stays anonymous'),
      slot('k1_body', 'Point 1 body', 'Results are reported in aggregate only. No individual club is ever singled out.'),
      slot('k2_title', 'Point 2 title', 'You can answer yourself'),
      slot('k2_body', 'Point 2 body', 'If you are involved in running the club, you can complete it based on what you know. No committee approval needed.'),
      slot('k3_title', 'Point 3 title', 'One response per club'),
      slot('k3_body', 'Point 3 body', 'Just one person needs to complete the survey for your club.'),
      slot('k4_title', 'Point 4 title', 'No commitment'),
      slot('k4_body', 'Point 4 body', 'This is research, not a sales funnel. You will always receive the national results, and there is no obligation to buy anything.'),
      slot('cta_title', 'Bottom CTA title', 'Help build a clearer picture of how table tennis clubs really run'),
      slot('cta_sub', 'Bottom CTA subline', 'A few minutes now. The full <b>national results</b> when they land.', 'rich'),
      slot('cta_btn', 'Bottom CTA button', 'Start the Club Pulse Check'),
      slot('cta_note', 'Bottom CTA note', 'No commitment. Your club will never be singled out in the results.'),
      slot('footer1', 'Footer line 1', 'The Club Pulse Check is run by Joel Badcock, treasurer of the Devonport Table Tennis Association.'),
      slot('footer2', 'Footer line 2', 'Questions? Just reply to the email that brought you here.'),
    ],
  };
}

// ——— Thank-you page ————————————————————————————————————————————————————

const THANKS_CSS = BASE_CSS + `
.ck-t-hero{text-align:center;padding:84px 24px 60px}
.ck-t-mark{width:82px;height:82px;margin:0 auto;border-radius:50%;background-color:#E5F5EC;
  background-repeat:no-repeat;background-position:center;background-size:38px 38px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2312A150' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E");
  box-shadow:0 16px 36px rgba(18,161,80,.22);animation:ckPop .7s cubic-bezier(.22,1.5,.36,1) both}
@keyframes ckPop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
.ck-t-hero .ck-kicker{margin-top:28px}
.ck-t-hero h1{font-size:clamp(34px,5.6vw,54px);font-weight:700;line-height:1.08;margin:14px auto 0;max-width:760px}
.ck-t-lede{font-size:17px;line-height:1.7;color:var(--mut);max-width:580px;margin:20px auto 0}
.ck-t-lede b{color:var(--ink)}
.ck-steps-wrap{padding:26px 0 40px}
.ck-steps-head{text-align:center;font-size:clamp(23px,3.2vw,32px);font-weight:700;margin:0 0 32px}
.ck-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
.ck-step{background:#fff;border:1px solid var(--line);border-radius:18px;padding:26px 24px}
.ck-step-num{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;
  font-family:'Space Grotesk',Inter,sans-serif;font-weight:700;font-size:15px;color:#fff;background:linear-gradient(135deg,var(--blue),#4E86F2)}
.ck-step h3{font-size:16.5px;font-weight:700;margin:14px 0 7px}
.ck-step p{font-size:14px;line-height:1.65;color:var(--mut);margin:0}
.ck-joel{padding:44px 24px 0}
.ck-joel-card{max-width:880px;margin:0 auto;background:linear-gradient(155deg,var(--navy),var(--navy-deep));border-radius:24px;
  display:grid;grid-template-columns:230px 1fr;overflow:hidden;position:relative}
.ck-joel-card::after{content:'';position:absolute;right:-60px;top:-60px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(29,99,237,.35),rgba(29,99,237,.02) 70%)}
.ck-joel-card img{width:100%;height:100%;object-fit:cover;object-position:top}
.ck-joel-body{padding:34px 36px;position:relative;z-index:1}
.ck-joel-body h2{color:#fff;font-size:clamp(21px,2.8vw,26px);font-weight:700;margin:0}
.ck-joel-body p{color:#B9C8DF;font-size:15px;line-height:1.7;margin:14px 0 0}
.ck-joel-sig{margin-top:20px}
.ck-joel-sig b{font-family:'Space Grotesk',Inter,sans-serif;color:#fff;font-size:17px}
.ck-joel-sig span{display:block;color:#7E95B6;font-size:13px;margin-top:3px}
.ck-peek{padding:56px 24px 0}
.ck-peek-card{max-width:880px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:24px;
  display:grid;grid-template-columns:1fr 230px;overflow:hidden;box-shadow:0 20px 50px rgba(10,27,46,.08)}
.ck-peek-body{padding:36px 38px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
.ck-peek-body h2{font-size:clamp(21px,2.8vw,26px);font-weight:700;margin:8px 0 0}
.ck-peek-body p{font-size:15px;line-height:1.7;color:var(--mut);margin:12px 0 0}
.ck-peek-body .ck-btn{margin-top:22px;font-size:15px;padding:13px 28px}
.ck-peek-shot{background:var(--tint);display:flex;align-items:flex-end;justify-content:center;padding:28px 28px 0}
.ck-peek-shot img{display:block;width:100%;max-width:172px;border-radius:14px 14px 0 0;border:1px solid var(--line);border-bottom:0;box-shadow:0 -10px 30px rgba(10,27,46,.10)}
.ck-share{text-align:center;padding:64px 24px 36px}
.ck-share p{margin:0;font-size:15px;color:var(--mut)}
.ck-share .ck-share-head{font-family:'Space Grotesk',Inter,sans-serif;font-size:clamp(21px,2.8vw,26px);font-weight:700;color:var(--ink);margin:0 0 10px}
.ck-share-btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:22px}
.ck-share-btn{display:inline-flex;align-items:center;gap:9px;font-family:'Space Grotesk',Inter,sans-serif;font-weight:700;font-size:14px;color:var(--ink);
  background:#fff;border:1px solid var(--line);border-radius:99px;padding:8px 18px 8px 9px;text-decoration:none;
  transition:transform .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease}
.ck-share-btn:hover{transform:translateY(-2px);border-color:var(--blue);color:var(--blue-deep);box-shadow:0 10px 24px rgba(29,99,237,.14)}
.ck-share-badge{display:inline-flex;align-items:center;justify-content:center;width:27px;height:27px;border-radius:50%;
  background:var(--navy-deep);color:#fff;font-size:11.5px;font-weight:700}
.ck-share-copy{margin-top:22px}
.ck-share-url{display:inline-block;margin-top:10px;font-family:'Space Grotesk',Inter,sans-serif;font-weight:700;font-size:16px;
  color:var(--blue-deep);background:var(--tint);border:1px solid #D6E4FC;border-radius:11px;padding:13px 24px}
.ck-foot{text-align:center;padding:18px 24px 40px}
.ck-foot p{margin:0;font-size:13px;color:var(--mut);line-height:1.7}
@media (max-width:760px){
  .ck-t-hero{padding:64px 20px 44px}
  .ck-joel-card{grid-template-columns:1fr}
  .ck-joel-card img{max-height:300px}
  .ck-peek-card{grid-template-columns:1fr}
  .ck-peek-shot{order:2}
  .ck-peek-body{padding:28px 26px}
  .ck-joel-body{padding:28px 26px}
}
`;

const THANKS_HTML = `
<div class="cp-page ck">
  <section class="ck-t-hero">
    <div class="ck-t-mark"></div>
    <p class="ck-kicker">{{text:kicker}}</p>
    <h1>{{text:title}}</h1>
    <p class="ck-t-lede">{{rich:lede}}</p>
  </section>

  <section class="ck-steps-wrap">
    <div class="ck-wrap">
      <h2 class="ck-steps-head">{{text:next_title}}</h2>
      <div class="ck-steps">
        <div class="ck-step"><span class="ck-step-num">1</span><h3>{{text:n1_title}}</h3><p>{{text:n1_body}}</p></div>
        <div class="ck-step"><span class="ck-step-num">2</span><h3>{{text:n2_title}}</h3><p>{{text:n2_body}}</p></div>
        <div class="ck-step"><span class="ck-step-num">3</span><h3>{{text:n3_title}}</h3><p>{{text:n3_body}}</p></div>
      </div>
    </div>
  </section>

  <section class="ck-joel">
    <div class="ck-joel-card">
      <img src="{{image:joel_photo}}" alt="Joel Badcock at the table">
      <div class="ck-joel-body">
        <h2>{{text:joel_title}}</h2>
        <p>{{text:joel_body}}</p>
        <div class="ck-joel-sig"><b>{{text:joel_sig}}</b><span>{{text:joel_role}}</span></div>
      </div>
    </div>
  </section>

  <section class="ck-peek">
    <div class="ck-peek-card">
      <div class="ck-peek-body">
        <p class="ck-kicker">{{text:peek_kicker}}</p>
        <h2>{{text:peek_title}}</h2>
        <p>{{text:peek_body}}</p>
        <a class="ck-btn ck-btn-blue" href="{{text:peek_url}}" target="_blank">{{text:peek_btn}}</a>
      </div>
      <div class="ck-peek-shot"><img src="{{image:peek_shot}}" alt="The Devonport club site on a phone"></div>
    </div>
  </section>

  <section class="ck-share">
    <p class="ck-share-head">{{text:share_title}}</p>
    <p>{{text:share_line}}</p>
    <div class="ck-share-btns">
      <a class="ck-share-btn" href="{{text:share_fb}}" target="_blank"><span class="ck-share-badge">f</span>Facebook</a>
      <a class="ck-share-btn" href="{{text:share_x}}" target="_blank"><span class="ck-share-badge">X</span>X</a>
      <a class="ck-share-btn" href="{{text:share_li}}" target="_blank"><span class="ck-share-badge">in</span>LinkedIn</a>
      <a class="ck-share-btn" href="{{text:share_wa}}" target="_blank"><span class="ck-share-badge">wa</span>WhatsApp</a>
      <a class="ck-share-btn" href="{{text:share_mail}}"><span class="ck-share-badge">@</span>Email</a>
    </div>
    <p class="ck-share-copy">{{text:share_copy}}</p>
    <span class="ck-share-url">{{text:share_url}}</span>
  </section>

  <footer class="ck-foot">
    <p>{{text:footer1}}<br>{{text:footer2}}</p>
  </footer>
</div>`;

export function thanksPage() {
  return {
    html: THANKS_HTML,
    css: THANKS_CSS,
    slots: [
      slot('kicker', 'Kicker line', 'Response recorded'),
      slot('title', 'Headline', 'Thank you, {{lead.first_name}}. Your club is in.'),
      slot(
        'lede',
        'Subline (merge tags work here)',
        'Your answers are now part of the national picture. The full report is <b>reserved for {{lead.email}}</b>, your club’s <b>15% discount is locked in</b>, and a confirmation is on its way to your inbox.',
        'rich'
      ),
      slot('next_title', 'Next steps title', 'What happens from here'),
      slot('n1_title', 'Step 1 title', 'Clubs across Australia weigh in'),
      slot(
        'n1_body',
        'Step 1 body',
        'Your answers join responses from clubs in every state. Nothing is reported club by club, only the national picture.'
      ),
      slot('n2_title', 'Step 2 title', 'The full report lands in your inbox'),
      slot(
        'n2_body',
        'Step 2 body',
        'When the survey closes, the complete national summary goes to {{lead.email}}, along with confirmation of your 15% discount. Taking part is the only way to get it.'
      ),
      slot('n3_title', 'Step 3 title', 'That is it, unless you want more'),
      slot(
        'n3_body',
        'Step 3 body',
        'There is nothing to buy and nobody will call you. If you ever do want the admin load lighter, the discount will be waiting.'
      ),
      slot('joel_photo', 'Joel photo', `${IMG}/joel.jpg`, 'image'),
      slot('joel_title', 'Joel card title', 'It really is me on the other end'),
      slot(
        'joel_body',
        'Joel card body',
        'Every reply comes straight to me at the Devonport club. If you have war stories about rego nights, fee chasing or grant paperwork, I genuinely want to hear them. Thank you for the few minutes, your answers make the results better for every club that receives them.'
      ),
      slot('joel_sig', 'Joel signature', 'Joel Badcock'),
      slot('joel_role', 'Joel role line', 'Treasurer, Devonport Table Tennis Association'),
      slot('peek_kicker', 'Peek card kicker', 'While you wait for the results'),
      slot('peek_title', 'Peek card title', 'See the system this survey grew out of'),
      slot(
        'peek_body',
        'Peek card body',
        'The operating software we built runs our club right now. Fixtures, results, ladders and player stats, all keeping themselves up to date on the Devonport Table Tennis website.'
      ),
      slot('peek_btn', 'Peek button label', 'Visit devtt.com.au'),
      slot('peek_url', 'Peek button link', 'https://devtt.com.au'),
      slot('peek_shot', 'Peek screenshot', `${IMG}/dtta-mobile.jpg`, 'image'),
      slot('share_title', 'Share section title', 'Pass it down the table'),
      slot('share_line', 'Share line', 'The more clubs take part, the better the results get. Know a committee who should be in them?'),
      slot(
        'share_fb',
        'Facebook share link',
        'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Ftabletennis.accesoai.com.au'
      ),
      slot(
        'share_x',
        'X share link',
        'https://twitter.com/intent/tweet?text=How%20do%20table%20tennis%20clubs%20across%20Australia%20really%20run%3F%20Add%20your%20club%20and%20the%20national%20results%20come%20back%20to%20you%2C%20free.&url=https%3A%2F%2Ftabletennis.accesoai.com.au'
      ),
      slot(
        'share_li',
        'LinkedIn share link',
        'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Ftabletennis.accesoai.com.au'
      ),
      slot(
        'share_wa',
        'WhatsApp share link',
        'https://api.whatsapp.com/send?text=How%20do%20table%20tennis%20clubs%20across%20Australia%20really%20run%3F%20Add%20your%20club%20to%20the%20national%20survey%20and%20the%20results%20come%20back%20to%20you%2C%20free%3A%20https%3A%2F%2Ftabletennis.accesoai.com.au'
      ),
      slot(
        'share_mail',
        'Email share link',
        'mailto:?subject=The%20Table%20Tennis%20Club%20Pulse%20Check&body=A%20quick%20survey%20for%20Australian%20table%20tennis%20club%20committees.%20Add%20your%20club%20and%20the%20national%20results%20come%20back%20to%20you%2C%20free%3A%0A%0Ahttps%3A%2F%2Ftabletennis.accesoai.com.au'
      ),
      slot('share_copy', 'Copy-link line', 'Or copy the link and send it however you like:'),
      slot('share_url', 'Share URL shown', 'tabletennis.accesoai.com.au'),
      slot('footer1', 'Footer line 1', 'The Club Pulse Check is run by Joel Badcock, treasurer of the Devonport Table Tennis Association.'),
      slot('footer2', 'Footer line 2', 'Questions? Just reply to any email from us and it comes straight to Joel.'),
    ],
  };
}

// ——— Emails + matching config touches ——————————————————————————————————
//
// Both emails are written in Joel's voice, no emojis, no long dashes, and
// neither repeats the respondent's answers. The account signature is
// appended automatically at send time, so neither email signs off by hand.

// The invite (Distribution) email: selfless and for the greater good. It
// leads with the reader's reality, mentions what Devonport has managed only
// in passing, and sells the national picture, not a product.
//
// Deliverability note: this is written to read (and score) like a personal
// letter, because Gmail files campaign-shaped email under Promotions. No
// styled button ({invite_link} as a plain link instead), no bullet list of
// benefits, no percent-off or "free" offer language. The 15% still greets
// respondents on the landing page and in the result email.
export const inviteEmail = {
  subject: 'A question from the committee at Devonport table tennis',
  content:
    '<p>Hi {first_name},</p>' +
    '<p>I am Joel Badcock, the treasurer at the Devonport Table Tennis Association in Tasmania, writing to committee people at clubs around the country with a small ask.</p>' +
    '<p>If you help run a club, you know the drill. A few dedicated people, evenings that disappear into registrations, fee chasing and fixtures, and the quiet worry about what happens if one key person ever steps away. At Devonport we have slowly handed most of that work to systems instead of people, and it changed what running the club feels like. It also left us wondering how other clubs are getting on, and whether what we learned could be useful beyond our own hall.</p>' +
    '<p>So we are running one short survey across every club in Australia: the same few questions about volunteers, admin, money and growth. It takes a few minutes, and one response per club is plenty. Every participating club receives the full national results, so all of us can see where the load really sits and what the strongest clubs do differently. No club is ever singled out.</p>' +
    '<p>Here is your club’s link: {invite_link}</p>' +
    '<p>There is nothing to buy and nobody will call you. This is one committee asking another to help build a clearer picture for everyone. If you have questions, just reply and it comes straight to me.</p>' +
    '<p>Thanks for reading, and good luck for the season.</p>',
};

// The result email a respondent receives right after completing the survey.
export const resultEmail = {
  subject: 'Thanks {first_name}, your club is in the national picture',
  content:
    '<p>Hi {first_name},</p>' +
    '<p>Thank you for completing the {scorecard_name}. Your responses are in, and your club is now part of the national picture.</p>' +
    '<p>A quick word on why this survey exists. I am Joel Badcock, treasurer of the Devonport Table Tennis Association in Tasmania. Like most clubs, ours runs on a handful of dedicated people, so we know how heavy the registrations, fee chasing and fixture nights can get. Over time we have been able to hand most of that work to operating software we built for our own club, and it runs Devonport day to day. You can see it live at <a href="https://devtt.com.au" target="_blank" rel="noopener noreferrer">devtt.com.au</a>.</p>' +
    '<p>The survey is the next step, for everyone. By asking every club the same questions, we can build a clear picture of the issues table tennis clubs across the country face, reliance on key people included, and share it back so every club benefits.</p>' +
    '<p><b>What happens next:</b></p>' +
    '<ul>' +
    '<li>Once responses are in from clubs across the country, the full national summary will be emailed to you. Every participating club receives it.</li>' +
    '<li>Your 15% discount is locked in. There is no commitment and nothing you need to buy, but if your club ever purchases anything we release, 15% comes off. A thank-you for the few minutes.</li>' +
    '</ul>' +
    '<p>Questions, war stories or corrections, just reply to this email and it comes straight to me.</p>',
};

// Applied alongside the pages so the whole flow matches the new palette.
export const brandingPatch = {
  primaryColor: '#1E9E4A',
  secondaryColor: '#0B2A4A',
};

export const questionColorsPatch = {
  backgroundColor: '#0B2A4A',
  buttonColor: '#1E9E4A',
  questionTextColor: '#FFFFFF',
  optionTextColor: '#C9D6E8',
  inputTextColor: '#0B2A4A',
};

export const leadFormButtonColor = '#1E9E4A';

export const shareDescription =
  'A short survey on what it really takes to run a table tennis club: volunteers, admin, money and growth. Add your club, and receive the national results free.';
