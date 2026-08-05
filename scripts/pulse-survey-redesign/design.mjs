// ————————————————————————————————————————————————————————————————————————
// Pulse survey redesign (scorecard 11 only): landing + thank-you shells.
//
// This is the source of record for the Table Tennis Club Pulse Check's
// custom-designed pages. It is applied to scorecard 11's config in the
// database by apply.mjs; it deliberately does NOT touch the club survey
// template in lib/surveyTemplate.ts, so new scorecards created from the
// template keep the old look.
//
// Design system (2026 refresh): a clean, official look. White and cool
// grey sections, deep navy ink, one electric blue accent for every action,
// and a ball orange used only as a tiny detail. Space Grotesk display type
// over Inter body. No emojis anywhere: icons are inline SVG data URIs in
// the CSS. Photography is professional stock (Unsplash CDN, free licence)
// plus the club's own proof: real screenshots of the Devonport system
// (devtt.com.au) and Joel for the byline. Every line of copy is a slot,
// so the whole page stays editable in the admin's Custom Design editor.
// ————————————————————————————————————————————————————————————————————————

const IMG = 'https://lenicbvdsepyljntsnht.supabase.co/storage/v1/object/public/scorecard-images/pulse';

// Stock photography, hotlinked from the Unsplash CDN (their licence allows
// hotlinking and commercial use, no attribution required). Both are slots,
// so they can be swapped in Custom Design without touching code.
const PHOTO_HERO = 'https://images.unsplash.com/photo-1518928286447-dc161b7cd6fb?auto=format&fit=crop&w=1600&q=80';
const PHOTO_BAND = 'https://images.unsplash.com/photo-1659303388053-6078a001ea21?auto=format&fit=crop&w=2000&q=80';

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

const LANDING_CSS = BASE_CSS + `
.ck-top{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:1120px;margin:0 auto;padding:22px 24px}
.ck-mark{display:flex;align-items:center;gap:10px;font-family:'Space Grotesk',Inter,sans-serif;font-weight:700;font-size:17px}
.ck-dot{width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#FF9A63,var(--orange) 60%,#D45A19);box-shadow:0 2px 6px rgba(244,115,44,.4)}
.ck-top-pill{font-size:12.5px;font-weight:600;color:var(--blue-deep);background:var(--tint);border:1px solid #D6E4FC;border-radius:99px;padding:7px 15px;white-space:nowrap}

.ck-hero{max-width:1120px;margin:0 auto;padding:40px 24px 84px;display:grid;grid-template-columns:1.02fr .98fr;gap:56px;align-items:center}
.ck-h1{font-size:clamp(38px,5.2vw,58px);font-weight:700;line-height:1.06;margin:16px 0 0}
.ck-h1 b{color:var(--blue);font-weight:700}
.ck-lede{font-size:17.5px;line-height:1.65;color:var(--mut);max-width:540px;margin:20px 0 0}
.ck-cta-row{display:flex;align-items:center;flex-wrap:wrap;gap:18px;margin-top:30px}
.ck-meta{font-size:13.5px;font-weight:600;color:var(--mut);max-width:260px;line-height:1.5}
.ck-from{display:flex;align-items:center;gap:12px;margin-top:34px;padding-top:24px;border-top:1px solid var(--line)}
.ck-from img{width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #fff;box-shadow:0 4px 12px rgba(10,27,46,.18)}
.ck-from p{margin:0;font-size:13.5px;color:var(--mut);line-height:1.45}
.ck-from p b{display:block;color:var(--ink);font-size:14.5px}

.ck-photo{position:relative}
.ck-photo>img{display:block;width:100%;aspect-ratio:4/3.4;object-fit:cover;border-radius:20px;box-shadow:0 30px 70px rgba(10,27,46,.22)}
.ck-photo-card{position:absolute;left:-26px;bottom:-30px;background:#fff;border:1px solid var(--line);border-radius:16px;
  padding:18px 22px;box-shadow:0 22px 50px rgba(10,27,46,.18);max-width:300px}
.ck-photo-card p{margin:0}
.ck-photo-card .ck-tick{padding:6px 0;font-size:13.5px;font-weight:600;color:#33415C}
.ck-photo-caption{position:absolute;right:14px;top:14px;font-size:11.5px;font-weight:600;color:#fff;background:rgba(8,24,48,.55);border-radius:8px;padding:6px 11px;backdrop-filter:blur(4px)}

.ck-covers{background:var(--bg2);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:80px 0 84px}
.ck-covers-head{text-align:center;max-width:660px;margin:0 auto}
.ck-covers h2{font-size:clamp(27px,3.8vw,40px);font-weight:700;line-height:1.12;margin:14px 0 0}
.ck-covers-sub{font-size:16.5px;line-height:1.65;color:var(--mut);margin:16px 0 0}
.ck-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:16px;margin-top:46px}
.ck-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:26px 24px;transition:transform .18s ease,box-shadow .18s ease}
.ck-card:hover{transform:translateY(-4px);box-shadow:0 16px 38px rgba(10,27,46,.09)}
.ck-card h3{font-size:17.5px;font-weight:700;line-height:1.3;margin:16px 0 7px}
.ck-card p{font-size:14.5px;line-height:1.6;color:var(--mut);margin:0}

.ck-back{padding:88px 24px 0}
.ck-back-panel{max-width:1120px;margin:0 auto;background:linear-gradient(155deg,var(--navy) 0%,var(--navy-deep) 100%);border-radius:28px;
  padding:64px 56px;position:relative;overflow:hidden}
.ck-back-panel::before{content:'';position:absolute;right:-120px;top:-120px;width:340px;height:340px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,rgba(29,99,237,.35),rgba(29,99,237,.02) 70%)}
.ck-back-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:center;position:relative;z-index:1}
.ck-back .ck-kicker{color:#7FA9F7}
.ck-back h2{color:#fff;font-size:clamp(27px,3.8vw,40px);font-weight:700;line-height:1.12;margin:14px 0 0}
.ck-back-sub{color:#B9C8DF;font-size:16px;line-height:1.7;margin:16px 0 0}
.ck-report{background:#fff;border-radius:18px;padding:30px 30px 24px;box-shadow:0 30px 70px rgba(0,0,0,.35)}
.ck-report-eyebrow{font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--blue);margin:0}
.ck-report-title{font-family:'Space Grotesk',Inter,sans-serif;font-size:24px;font-weight:700;line-height:1.15;margin:9px 0 0;color:var(--ink)}
.ck-report-sub{font-size:13.5px;color:var(--mut);margin:8px 0 0}
.ck-report-list{list-style:none;margin:16px 0 0;padding:0}
.ck-report-list li{display:flex;gap:11px;align-items:flex-start;padding:10px 0;border-bottom:1px dashed var(--line);font-size:14px;font-weight:600;color:#33415C;line-height:1.45}
.ck-report-list li:last-of-type{border-bottom:0}
.ck-report-list li::before{content:'';flex:none;width:8px;height:8px;border-radius:50%;margin-top:6px;background:linear-gradient(135deg,var(--blue),#6D9BF5)}
.ck-deals{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin-top:44px;position:relative;z-index:1}
.ck-deal{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:24px 22px}
.ck-deal .ck-ico{background-color:rgba(255,255,255,.10)}
.ck-deal h3{color:#fff;font-size:17px;font-weight:700;margin:14px 0 7px}
.ck-deal p{color:#B9C8DF;font-size:14px;line-height:1.65;margin:0}
.ck-deadline{display:inline-block;margin-top:32px;font-size:13px;font-weight:700;color:var(--navy-deep);background:#FFE9D8;border-radius:99px;padding:9px 18px;position:relative;z-index:1}

.ck-who{padding:96px 0 88px}
.ck-who-grid{display:grid;grid-template-columns:.82fr 1.18fr;gap:64px;align-items:center}
.ck-portrait{position:relative;max-width:340px;margin:0 auto}
.ck-portrait::before{content:'';position:absolute;inset:20px -16px -16px 20px;border-radius:22px;background:var(--tint)}
.ck-portrait img{position:relative;display:block;width:100%;aspect-ratio:4/4.5;object-fit:cover;object-position:top;border-radius:22px;box-shadow:0 24px 54px rgba(10,27,46,.18)}
.ck-who h2{font-size:clamp(28px,3.8vw,40px);font-weight:700;line-height:1.1;margin:14px 0 0}
.ck-who p{font-size:16px;line-height:1.75;color:var(--mut);margin:18px 0 0}
.ck-sig{margin-top:26px}
.ck-sig b{font-family:'Space Grotesk',Inter,sans-serif;font-size:19px;font-weight:700;color:var(--ink)}
.ck-sig span{display:block;font-size:13.5px;color:var(--mut);margin-top:3px}

.ck-built{background:var(--bg2);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:84px 0}
.ck-built-grid{display:grid;grid-template-columns:1.02fr .98fr;gap:60px;align-items:center}
.ck-shot{position:relative;padding:0 0 52px 30px}
.ck-laptop{background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 30px 70px rgba(10,27,46,.16);overflow:hidden}
.ck-laptop-bar{display:flex;align-items:center;gap:6px;padding:10px 14px;background:#EDF1F7;border-bottom:1px solid var(--line)}
.ck-laptop-bar span{width:8px;height:8px;border-radius:50%;background:#C9D3E2}
.ck-laptop img{display:block;width:100%}
.ck-phone{position:absolute;left:0;bottom:0;width:30%;max-width:175px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:7px;box-shadow:0 26px 60px rgba(10,27,46,.24);transform:rotate(-2deg)}
.ck-phone img{display:block;width:100%;border-radius:14px}
.ck-shot-tag{position:absolute;right:0;bottom:12px;background:var(--navy-deep);color:#fff;font-size:12.5px;font-weight:600;line-height:1.45;border-radius:12px;padding:12px 16px;max-width:250px;box-shadow:0 16px 36px rgba(8,24,48,.30)}
.ck-built h2{font-size:clamp(27px,3.8vw,38px);font-weight:700;line-height:1.12;margin:14px 0 0}
.ck-built-body{font-size:16px;line-height:1.7;color:var(--mut);margin:18px 0 0}
.ck-ticks{list-style:none;margin:22px 0 0;padding:0}
.ck-ticks li{padding:7px 0;font-size:15px;font-weight:600;color:#33415C;line-height:1.5}
.ck-built-punch{font-size:15.5px;font-weight:700;color:var(--ink);margin:24px 0 0}

.ck-band{position:relative;margin-top:0}
.ck-band img{display:block;width:100%;height:440px;object-fit:cover}
.ck-band-shade{position:absolute;inset:0;background:linear-gradient(100deg,rgba(8,24,48,.86) 0%,rgba(8,24,48,.55) 48%,rgba(8,24,48,.18) 100%)}
.ck-band-inner{position:absolute;inset:0;display:flex;align-items:center}
.ck-band-copy{max-width:1120px;margin:0 auto;padding:0 24px;width:100%}
.ck-band-quote{font-family:'Space Grotesk',Inter,sans-serif;color:#fff;font-size:clamp(23px,3.2vw,32px);font-weight:700;line-height:1.3;max-width:560px;margin:0}
.ck-band-quote b{color:#8FB4F9}
.ck-band-note{color:#C6D4E8;font-size:14.5px;line-height:1.6;max-width:460px;margin:16px 0 0}

.ck-cta{padding:88px 24px 96px}
.ck-cta-panel{max-width:1120px;margin:0 auto;background:linear-gradient(130deg,var(--blue) 0%,var(--blue-deep) 100%);border-radius:28px;text-align:center;padding:68px 32px;position:relative;overflow:hidden}
.ck-cta-panel::before{content:'';position:absolute;left:6%;top:-60px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.10)}
.ck-cta-panel::after{content:'';position:absolute;right:5%;bottom:-80px;width:210px;height:210px;border-radius:50%;background:rgba(255,255,255,.07)}
.ck-cta h2{color:#fff;font-size:clamp(28px,4.2vw,44px);font-weight:700;margin:0;position:relative;z-index:1}
.ck-cta p{color:rgba(255,255,255,.92);font-size:16.5px;line-height:1.6;max-width:540px;margin:16px auto 0;position:relative;z-index:1}
.ck-cta .ck-btn{margin-top:30px;position:relative;z-index:1}
.ck-cta-note{font-size:13.5px;color:rgba(255,255,255,.85);margin-top:18px;position:relative;z-index:1}

.ck-foot{text-align:center;padding:28px 24px 36px}
.ck-foot p{margin:0;font-size:13px;color:var(--mut);line-height:1.7}

@media (max-width:920px){
  .ck-hero{grid-template-columns:1fr;gap:56px;padding-top:12px;padding-bottom:64px}
  .ck-lede{max-width:none}
  .ck-photo{margin:0 0 26px}
  .ck-photo-card{left:12px;bottom:-26px}
  .ck-who-grid,.ck-built-grid{grid-template-columns:1fr;gap:44px}
  .ck-portrait{max-width:290px}
  .ck-covers{padding:62px 0 66px}
  .ck-who{padding:72px 0 64px}
  .ck-built{padding:64px 0}
  .ck-back{padding-top:66px}
  .ck-back-panel{padding:48px 26px}
  .ck-back-grid{grid-template-columns:1fr;gap:40px}
  .ck-band img{height:380px}
  .ck-cta{padding:66px 24px 72px}
  .ck-cta-panel{padding:54px 24px;border-radius:24px}
  .ck-shot{padding-left:16px}
}
@media (max-width:560px){
  .ck-top-pill{display:none}
  .ck-cta-row .ck-btn-xl{width:100%}
  .ck-photo-card{position:static;margin:-34px 14px 0;max-width:none}
  .ck-band img{height:430px}
}
`;

const LANDING_HTML = `
<div class="cp-page ck">
  <header class="ck-top">
    <span class="ck-mark"><span class="ck-dot"></span>{{text:brand}}</span>
    <span class="ck-top-pill">{{text:top_pill}}</span>
  </header>

  <section class="ck-hero">
    <div>
      <p class="ck-kicker">{{text:kicker}}</p>
      <h1 class="ck-h1">{{rich:hero_title}}</h1>
      <p class="ck-lede">{{text:hero_sub}}</p>
      <div class="ck-cta-row">
        <button class="ck-btn ck-btn-blue ck-btn-xl" data-start-scorecard>{{text:hero_cta}}</button>
        <span class="ck-meta">{{text:hero_meta}}</span>
      </div>
      <div class="ck-from">
        <img src="{{image:joel_photo}}" alt="Joel Badcock">
        <p><b>{{text:from_name}}</b>{{text:from_role}}</p>
      </div>
    </div>
    <div class="ck-photo">
      <img src="{{image:hero_photo}}" alt="A table tennis player serving during a competitive match">
      <span class="ck-photo-caption">{{text:hero_caption}}</span>
      <div class="ck-photo-card">
        <p class="ck-tick">{{text:stat1}}</p>
        <p class="ck-tick">{{text:stat2}}</p>
        <p class="ck-tick">{{text:stat3}}</p>
      </div>
    </div>
  </section>

  <section class="ck-covers">
    <div class="ck-wrap">
      <div class="ck-covers-head">
        <p class="ck-kicker">{{text:covers_kicker}}</p>
        <h2>{{text:covers_title}}</h2>
        <p class="ck-covers-sub">{{text:covers_sub}}</p>
      </div>
      <div class="ck-cards">
        <div class="ck-card"><span class="ck-ico ck-ico-users"></span><h3>{{text:c1_title}}</h3><p>{{text:c1_body}}</p></div>
        <div class="ck-card"><span class="ck-ico ck-ico-clock"></span><h3>{{text:c2_title}}</h3><p>{{text:c2_body}}</p></div>
        <div class="ck-card"><span class="ck-ico ck-ico-dollar"></span><h3>{{text:c3_title}}</h3><p>{{text:c3_body}}</p></div>
        <div class="ck-card"><span class="ck-ico ck-ico-trend"></span><h3>{{text:c4_title}}</h3><p>{{text:c4_body}}</p></div>
      </div>
    </div>
  </section>

  <section class="ck-back">
    <div class="ck-back-panel">
      <div class="ck-back-grid">
        <div>
          <p class="ck-kicker">{{text:back_kicker}}</p>
          <h2>{{text:back_title}}</h2>
          <p class="ck-back-sub">{{text:back_sub}}</p>
        </div>
        <div class="ck-report">
          <p class="ck-report-eyebrow">{{text:report_eyebrow}}</p>
          <p class="ck-report-title">{{text:report_title}}</p>
          <p class="ck-report-sub">{{text:report_sub}}</p>
          <ul class="ck-report-list">
            <li>{{text:report_li1}}</li>
            <li>{{text:report_li2}}</li>
            <li>{{text:report_li3}}</li>
            <li>{{text:report_li4}}</li>
            <li>{{text:report_li5}}</li>
          </ul>
        </div>
      </div>
      <div class="ck-deals">
        <div class="ck-deal"><span class="ck-ico ck-ico-report"></span><h3>{{text:d1_title}}</h3><p>{{text:d1_body}}</p></div>
        <div class="ck-deal"><span class="ck-ico ck-ico-percent"></span><h3>{{text:d2_title}}</h3><p>{{text:d2_body}}</p></div>
        <div class="ck-deal"><span class="ck-ico ck-ico-shield"></span><h3>{{text:d3_title}}</h3><p>{{text:d3_body}}</p></div>
      </div>
      <span class="ck-deadline">{{text:deadline}}</span>
    </div>
  </section>

  <section class="ck-who">
    <div class="ck-wrap ck-who-grid">
      <div class="ck-portrait"><img src="{{image:joel_portrait}}" alt="Joel Badcock at the table"></div>
      <div>
        <p class="ck-kicker">{{text:who_kicker}}</p>
        <h2>{{text:who_title}}</h2>
        <p>{{text:who_p1}}</p>
        <p>{{text:who_p2}}</p>
        <div class="ck-sig"><b>{{text:sig_name}}</b><span>{{text:sig_role}}</span></div>
      </div>
    </div>
  </section>

  <section class="ck-built">
    <div class="ck-wrap ck-built-grid">
      <div class="ck-shot">
        <div class="ck-laptop">
          <div class="ck-laptop-bar"><span></span><span></span><span></span></div>
          <img src="{{image:shot_desktop}}" alt="The Devonport Table Tennis club website on desktop">
        </div>
        <div class="ck-phone"><img src="{{image:shot_mobile}}" alt="Live fixtures and ladders on a phone"></div>
        <div class="ck-shot-tag">{{text:shot_tag}}</div>
      </div>
      <div>
        <p class="ck-kicker">{{text:built_kicker}}</p>
        <h2>{{text:built_title}}</h2>
        <p class="ck-built-body">{{text:built_body}}</p>
        <ul class="ck-ticks">
          <li class="ck-tick">{{text:t1}}</li>
          <li class="ck-tick">{{text:t2}}</li>
          <li class="ck-tick">{{text:t3}}</li>
          <li class="ck-tick">{{text:t4}}</li>
        </ul>
        <p class="ck-built-punch">{{text:built_punch}}</p>
      </div>
    </div>
  </section>

  <section class="ck-band">
    <img src="{{image:band_photo}}" alt="A table tennis rally in progress">
    <div class="ck-band-shade"></div>
    <div class="ck-band-inner">
      <div class="ck-band-copy">
        <p class="ck-band-quote">{{rich:band_quote}}</p>
        <p class="ck-band-note">{{text:band_note}}</p>
      </div>
    </div>
  </section>

  <section class="ck-cta">
    <div class="ck-cta-panel">
      <h2>{{text:cta_title}}</h2>
      <p>{{text:cta_sub}}</p>
      <button class="ck-btn ck-btn-white ck-btn-xl" data-start-scorecard>{{text:cta_btn}}</button>
      <p class="ck-cta-note">{{text:cta_note}}</p>
    </div>
  </section>

  <footer class="ck-foot">
    <p>{{text:footer1}}<br>{{text:footer2}}</p>
  </footer>
</div>`;

export function landingPage() {
  return {
    html: LANDING_HTML,
    css: LANDING_CSS,
    slots: [
      slot('brand', 'Wordmark', 'Club Pulse Check'),
      slot('top_pill', 'Top-right pill', 'The national table tennis club survey'),
      slot('kicker', 'Hero kicker', 'For committee members at Australian clubs'),
      slot('hero_title', 'Headline', 'How do table tennis clubs across Australia <b>really run?</b>', 'rich'),
      slot(
        'hero_sub',
        'Hero subline',
        'We are asking committees at every club in the country the same questions about volunteers, admin, money and growth. Answer for your club in a few minutes, and the full national results come back to you, free.'
      ),
      slot('hero_cta', 'Hero button', 'Start the survey'),
      slot('hero_meta', 'Next to hero button', 'Takes a few minutes. No commitment. Every participating club receives the national results.'),
      slot('joel_photo', 'Small avatar photo (hero)', `${IMG}/joel.jpg`, 'image'),
      slot('from_name', 'Hero byline name', 'Joel Badcock'),
      slot('from_role', 'Hero byline role', 'Treasurer, Devonport Table Tennis Association'),
      slot('hero_photo', 'Hero photo', PHOTO_HERO, 'image'),
      slot('hero_caption', 'Hero photo caption', 'Australian Open, table tennis'),
      slot('stat1', 'Hero card line 1', 'One survey for every state'),
      slot('stat2', 'Hero card line 2', 'Results shared with every participating club'),
      slot('stat3', 'Hero card line 3', 'Free, and one response per club is plenty'),
      slot('covers_kicker', 'Covers section kicker', 'What we ask'),
      slot('covers_title', 'Covers section title', 'Four pressure points every committee knows'),
      slot(
        'covers_sub',
        'Covers section subline',
        'Every question comes from the day to day reality of running a club. Answer from wherever you sit on the committee, president, secretary, treasurer or the person who simply does the lot.'
      ),
      slot('c1_title', 'Card 1 title', 'Volunteers and key people'),
      slot('c1_body', 'Card 1 body', 'How much rests on one or two people, and what happens when they need a break.'),
      slot('c2_title', 'Card 2 title', 'Admin and time'),
      slot('c2_body', 'Card 2 body', 'Registrations, fixtures, minutes and newsletters. Where the volunteer hours actually go.'),
      slot('c3_title', 'Card 3 title', 'Money and funding'),
      slot('c3_body', 'Card 3 body', 'Collecting fees, chasing grants and knowing where the club stands financially.'),
      slot('c4_title', 'Card 4 title', 'Members and growth'),
      slot('c4_body', 'Card 4 body', 'Whether membership is growing or shrinking, and what growing clubs do differently.'),
      slot('back_kicker', 'Report section kicker', 'What you get back'),
      slot('back_title', 'Report section title', 'One national report, sent to every club that takes part'),
      slot(
        'back_sub',
        'Report section subline',
        'You know how your club runs. The report shows you how everyone else does it, with real answers from clubs across the country. It is not published anywhere else, taking part is the only way to see it.'
      ),
      slot('report_eyebrow', 'Report card eyebrow', 'Yours when you take part'),
      slot('report_title', 'Report card title', 'The National Club Pulse Report'),
      slot('report_sub', 'Report card subtitle', 'Answers from clubs in every state, in one clear summary:'),
      slot('report_li1', 'Report line 1', 'How many people it really takes to run a club'),
      slot('report_li2', 'Report line 2', 'Where the volunteer hours actually go'),
      slot('report_li3', 'Report line 3', 'How clubs collect fees and chase grants'),
      slot('report_li4', 'Report line 4', 'Whether membership is growing or shrinking'),
      slot('report_li5', 'Report line 5', 'What the strongest clubs do differently'),
      slot('d1_title', 'Deal card 1 title', 'The full national report'),
      slot(
        'd1_body',
        'Deal card 1 body',
        'Every answer from every state in one summary, emailed to every participating club as soon as the survey closes.'
      ),
      slot('d2_title', 'Deal card 2 title', '15% off, locked in'),
      slot(
        'd2_body',
        'Deal card 2 body',
        'Complete the survey and your club keeps 15% off anything we ever release. There is no obligation to buy a thing.'
      ),
      slot('d3_title', 'Deal card 3 title', 'Zero commitment'),
      slot(
        'd3_body',
        'Deal card 3 body',
        'This is research, not a sales funnel. Worst case, you have spent a few minutes and the national results land in your inbox anyway.'
      ),
      slot('deadline', 'Deadline pill', 'Complete the survey within 2 days of your invite to lock in the 15%'),
      slot('who_kicker', 'Who section kicker', 'Who is asking'),
      slot('who_title', 'Who section title', 'From one committee to another'),
      slot(
        'who_p1',
        'Who paragraph 1',
        'I am Joel Badcock, treasurer of the Devonport Table Tennis Association in Tasmania. Like most clubs, ours runs on a handful of dedicated people, and I am one of them. I know exactly where the evenings go, because plenty of them were mine.'
      ),
      slot(
        'who_p2',
        'Who paragraph 2',
        'This survey exists because I want the same answers you probably do. Is every club carrying the same load, or are some doing it smarter? Answer the questions and everything we learn comes straight back to you. Nobody is selling you anything today.'
      ),
      slot('sig_name', 'Signature name', 'Joel Badcock'),
      slot('sig_role', 'Signature role', 'Treasurer, Devonport Table Tennis Association'),
      slot('joel_portrait', 'Large portrait photo', `${IMG}/joel.jpg`, 'image'),
      slot('built_kicker', 'Built section kicker', 'Why you can trust the questions'),
      slot('built_title', 'Built section title', 'We built our way out of the paperwork'),
      slot(
        'built_body',
        'Built section body',
        'Our committee got tired of relying on one or two key people for everything, so we built operating software that runs the club for us. It powers Devonport today, live at devtt.com.au:'
      ),
      slot('t1', 'Tick 1', 'Registrations and memberships that handle themselves'),
      slot('t2', 'Tick 2', 'Fee reminders that do the chasing for us'),
      slot('t3', 'Tick 3', 'Fixtures, results and ladders that update on their own'),
      slot('t4', 'Tick 4', 'Scoresheets scanned and entered automatically'),
      slot(
        'built_punch',
        'Built section punchline',
        'The survey tells us whether other clubs carry the same load. The results show you how your club compares. Fair trade.'
      ),
      slot('shot_desktop', 'Desktop screenshot', `${IMG}/dtta-desktop.jpg`, 'image'),
      slot('shot_mobile', 'Phone screenshot', `${IMG}/dtta-mobile.jpg`, 'image'),
      slot('shot_tag', 'Screenshot caption card', 'The system we built for our own club, live today at devtt.com.au'),
      slot('band_photo', 'Full-width photo', PHOTO_BAND, 'image'),
      slot(
        'band_quote',
        'Band quote',
        'The clearer the picture of how clubs really run, the easier it gets to give volunteers their <b>evenings back</b>.',
        'rich'
      ),
      slot(
        'band_note',
        'Band note',
        'Results are reported in aggregate only. No individual club is ever singled out, and every participating club receives the summary.'
      ),
      slot('cta_title', 'Bottom CTA title', 'Add your club to the national picture'),
      slot('cta_sub', 'Bottom CTA subline', 'A few minutes now. The full national results when they land. One response per club is plenty.'),
      slot('cta_btn', 'Bottom CTA button', 'Start the survey'),
      slot('cta_note', 'Bottom CTA note', 'Free. No commitment. 15% off anything we release, locked in for participating clubs.'),
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
  primaryColor: '#1D63ED',
  secondaryColor: '#0A1B2E',
};

export const questionColorsPatch = {
  backgroundColor: '#0A1B2E',
  buttonColor: '#1D63ED',
  questionTextColor: '#FFFFFF',
  optionTextColor: '#C9D6E8',
  inputTextColor: '#0A1B2E',
};

export const leadFormButtonColor = '#1D63ED';

export const shareDescription =
  'A short survey on what it really takes to run a table tennis club: volunteers, admin, money and growth. Add your club, and receive the national results free.';
