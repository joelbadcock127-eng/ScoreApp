// ————————————————————————————————————————————————————————————————————————
// Pulse survey redesign (scorecard 11 only): landing + thank-you shells.
//
// This is the source of record for the Table Tennis Club Pulse Check's
// custom-designed pages. It is applied to scorecard 11's config in the
// database by apply.mjs; it deliberately does NOT touch the club survey
// template in lib/surveyTemplate.ts, so new scorecards created from the
// template keep the old look.
//
// Landing page (2026 "Federation" look): official table blue with white
// boundary lines, condensed uppercase headings, a study facts panel, big
// type and 64px buttons for older readers on phones. Proof is the club's
// own: Joel's photo and a real screenshot of the Devonport system
// (devtt.com.au). Every line of copy is a slot, so the whole page stays
// editable in the admin's Custom Design editor.
//
// Thank-you page: the earlier clean white and navy design, Space Grotesk
// display over Inter, icons as SVG data URIs in the CSS.
// ————————————————————————————————————————————————————————————————————————

const IMG = 'https://lenicbvdsepyljntsnht.supabase.co/storage/v1/object/public/scorecard-images/pulse';

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
// "Federation" look: official table blue with white boundary lines as the
// rule system, condensed uppercase headings the way sporting bodies set
// them, and a study facts panel straight under the hero (conducted by, who
// it is for, time required, what you receive) the way research invitations
// state them. Built for older readers on phones: 19px body, 64px buttons,
// and a start bar fixed to the bottom of the screen. The only motion is a
// single fade as the hero appears.
//
// Fonts load with @font-face (see the note on BASE_CSS). Icons would be
// stripped as <svg>, so the page uses none: the table lines and the ball
// orange carry the theme.

const FONT_CSS = `
@font-face{font-family:'Barlow';font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/barlow/v13/7cHpv4kjgoGqM7E_DMs5.woff2) format('woff2')}
@font-face{font-family:'Barlow';font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/barlow/v13/7cHqv4kjgoGqM7E3_-gs51os.woff2) format('woff2')}
@font-face{font-family:'Barlow';font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/barlow/v13/7cHqv4kjgoGqM7E30-8s51os.woff2) format('woff2')}
@font-face{font-family:'Barlow Condensed';font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3bWuQ.woff2) format('woff2')}
@font-face{font-family:'Barlow Condensed';font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2z3bWuQ.woff2) format('woff2')}
`;

const LANDING_CSS = FONT_CSS + `
.fd{--blue:#1552A3;--blue-deep:#0E3C7A;--tline:rgba(255,255,255,.7);
  --bg:#F5F7FA;--card:#FFFFFF;--ink:#0F1B2D;--soft:#4B586B;--rule:#D6DEE8;--ball:#F3901B;--ball-dark:#D97A0E;
  background:var(--bg);color:var(--ink);font-family:Barlow,system-ui,-apple-system,'Segoe UI',sans-serif;font-size:19px;line-height:1.55;
  padding-bottom:100px}
.fd *{box-sizing:border-box}
.fd h1,.fd h2,.fd h3{font-family:'Barlow Condensed',Barlow,sans-serif;font-weight:700;line-height:1;margin:0;text-transform:uppercase;letter-spacing:.005em;text-wrap:balance}
.fd p{margin:0}
.fd-col{max-width:960px;margin:0 auto;padding:0 20px}

.fd-strip{background:var(--blue-deep);color:#fff;font-size:15px;letter-spacing:.06em;text-transform:uppercase;font-weight:600}
.fd-strip .fd-col{display:flex;justify-content:space-between;gap:12px;padding-top:10px;padding-bottom:10px}
.fd-strip span:last-child{color:#BFD3F2;text-align:right}

.fd-hero{background:var(--blue);color:#fff;padding:20px 0 28px}
.fd-table{border:3px solid var(--tline);position:relative;padding:44px 22px 40px;animation:fdIn .7s ease-out both}
.fd-table::before{content:'';position:absolute;left:-3px;right:-3px;top:50%;height:3px;background:var(--tline);opacity:.35}
@keyframes fdIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fd-eyebrow{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:18px;letter-spacing:.12em;text-transform:uppercase;color:#FFD9AE;position:relative}
.fd-hero h1{font-size:clamp(50px,12vw,104px);margin-top:14px;max-width:820px;position:relative}
.fd-lede{margin-top:20px;font-size:clamp(19px,2.3vw,22px);max-width:600px;color:#E8F0FB;position:relative}
.fd-btn{display:flex;align-items:center;justify-content:center;width:100%;min-height:64px;margin-top:30px;padding:14px 30px;border:0;cursor:pointer;
  background:var(--ball);color:#1A1204;border-radius:6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:26px;text-transform:uppercase;letter-spacing:.04em;
  text-decoration:none;transition:background .2s;position:relative}
.fd-btn:hover{background:var(--ball-dark)}
.fd-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
.fd-meta{margin-top:14px;font-size:17px;color:#C9DAF3;font-weight:500;position:relative}

.fd-facts{background:var(--card);border-bottom:1px solid var(--rule)}
.fd-facts .fd-col{display:grid;grid-template-columns:1fr 1fr}
.fd-facts div{padding:20px 0;border-bottom:1px solid var(--rule)}
.fd-facts div:nth-child(odd){padding-right:16px;border-right:1px solid var(--rule)}
.fd-facts div:nth-child(even){padding-left:16px}
.fd-facts small{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:var(--soft)}
.fd-facts b{display:block;font-weight:600;font-size:19px;margin-top:4px;color:var(--ink)}

.fd-s{padding:52px 0}
.fd-s-tight{padding-top:0}
.fd-s h2{font-size:clamp(32px,6vw,44px);color:var(--blue-deep)}
.fd-sub{margin-top:12px;color:var(--soft);max-width:620px}

.fd-who{display:grid;grid-template-columns:88px 1fr;gap:20px;align-items:start;background:var(--card);border-top:6px solid var(--blue);padding:24px 20px;margin-top:20px;box-shadow:0 1px 0 var(--rule)}
.fd-who img{width:88px;height:88px;object-fit:cover;object-position:top;display:block;background:#C7D2E0}
.fd-who h3{font-size:30px;color:var(--ink)}
.fd-who-title{font-weight:600;color:var(--blue);margin-top:2px;font-size:18px}
.fd-who-note{margin-top:12px}
.fd-who-reply{margin-top:12px;font-size:17px;color:var(--soft)}

.fd-ask{list-style:none;padding:0;margin:24px 0 0;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fd-ask li{background:var(--card);border:1px solid var(--rule);padding:18px 16px}
.fd-ask h3{font-size:24px;color:var(--ink)}
.fd-ask small{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);margin-top:6px}

.fd-two{display:grid;gap:40px}
.fd-plain{list-style:none;padding:0;margin:18px 0 0;border-top:2px solid var(--blue)}
.fd-plain li{padding:14px 0;border-bottom:1px solid var(--rule)}
.fd-plain b{display:block;font-weight:600;font-size:19px}
.fd-plain span{color:var(--soft);font-size:18px}

.fd-built{background:var(--card);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.fd-built .fd-col{display:grid;gap:28px;padding-top:52px;padding-bottom:52px}
.fd-built .fd-sub{margin-top:12px}
.fd-ticks{list-style:none;padding:0;margin:18px 0 0}
.fd-ticks li{padding:9px 0 9px 30px;position:relative;font-weight:500}
.fd-ticks li::before{content:'';position:absolute;left:0;top:15px;width:14px;height:14px;border-radius:50%;background:var(--ball)}
.fd-shot{border:3px solid var(--blue);background:var(--blue);padding:0;position:relative}
.fd-shot img{display:block;width:100%;height:auto}
.fd-shot span{display:block;padding:10px 14px;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:16px;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--blue)}

.fd-final{background:var(--blue);color:#fff;padding:48px 0}
.fd-final .fd-table{padding:36px 22px;animation:none}
.fd-final h2{font-size:clamp(36px,7vw,56px);color:#fff;position:relative}
.fd-final p{margin-top:12px;color:#E8F0FB;position:relative}
.fd-deadline{margin-top:16px;font-size:17px;color:#FFD9AE;font-weight:600}
.fd-foot{padding:26px 0 30px;font-size:16px;color:var(--soft)}
.fd-foot a{color:var(--blue);font-weight:600}

.fd-stick{position:fixed;left:0;right:0;bottom:0;z-index:20;background:rgba(245,247,250,.97);border-top:1px solid var(--rule);padding:12px 20px calc(12px + env(safe-area-inset-bottom,0px))}
.fd-stick .fd-btn{margin:0 auto;min-height:58px;max-width:920px}

@media (prefers-reduced-motion:reduce){.fd-table{animation:none}}
@media (min-width:720px){
  .fd{font-size:20px}
  .fd-table{padding:72px 56px 64px}
  .fd-btn{width:auto;display:inline-flex;min-width:300px}
  .fd-facts .fd-col{grid-template-columns:repeat(4,1fr)}
  .fd-facts div{border-bottom:0;padding:24px 20px}
  .fd-facts div:nth-child(odd),.fd-facts div:nth-child(even){padding-left:20px;padding-right:20px;border-right:1px solid var(--rule)}
  .fd-facts div:first-child{padding-left:0}
  .fd-facts div:last-child{border-right:0}
  .fd-who{grid-template-columns:120px 1fr;padding:32px}
  .fd-who img{width:120px;height:120px}
  .fd-ask{grid-template-columns:repeat(4,1fr)}
  .fd-two{grid-template-columns:1fr 1fr;gap:56px}
  .fd-built .fd-col{grid-template-columns:1fr 1fr;gap:48px;align-items:center;padding-top:64px;padding-bottom:64px}
  .fd-s{padding:64px 0}
  .fd-s-tight{padding-top:0}
}
@media (min-width:960px){.fd-stick{display:none}.fd{padding-bottom:0}}
`;

const LANDING_HTML = `
<div class="cp-page fd">
  <div class="fd-strip"><div class="fd-col"><span>{{text:strip_left}}</span><span>{{text:strip_right}}</span></div></div>

  <section class="fd-hero"><div class="fd-col"><div class="fd-table">
    <p class="fd-eyebrow">{{text:kicker}}</p>
    <h1>{{rich:hero_title}}</h1>
    <p class="fd-lede">{{text:hero_sub}}</p>
    <button class="fd-btn" data-start-scorecard>{{text:hero_cta}}</button>
    <p class="fd-meta">{{text:hero_meta}}</p>
  </div></div></section>

  <div class="fd-facts"><div class="fd-col">
    <div><small>{{text:f1_label}}</small><b>{{text:f1_value}}</b></div>
    <div><small>{{text:f2_label}}</small><b>{{text:f2_value}}</b></div>
    <div><small>{{text:f3_label}}</small><b>{{text:f3_value}}</b></div>
    <div><small>{{text:f4_label}}</small><b>{{text:f4_value}}</b></div>
  </div></div>

  <section class="fd-s"><div class="fd-col">
    <h2>{{text:who_title}}</h2>
    <div class="fd-who">
      <img src="{{image:joel_photo}}" alt="Joel Badcock">
      <div>
        <h3>{{text:who_name}}</h3>
        <p class="fd-who-title">{{text:who_role}}</p>
        <p class="fd-who-note">{{text:who_note}}</p>
        <p class="fd-who-reply">{{text:who_reply}}</p>
      </div>
    </div>
  </div></section>

  <section class="fd-s fd-s-tight"><div class="fd-col">
    <h2>{{text:covers_title}}</h2>
    <p class="fd-sub">{{text:covers_sub}}</p>
    <ul class="fd-ask">
      <li><h3>{{text:c1_title}}</h3><small>{{text:c1_count}}</small></li>
      <li><h3>{{text:c2_title}}</h3><small>{{text:c2_count}}</small></li>
      <li><h3>{{text:c3_title}}</h3><small>{{text:c3_count}}</small></li>
      <li><h3>{{text:c4_title}}</h3><small>{{text:c4_count}}</small></li>
    </ul>
  </div></section>

  <section class="fd-s fd-s-tight"><div class="fd-col fd-two">
    <div>
      <h2>{{text:get_title}}</h2>
      <ul class="fd-plain">
        <li><b>{{text:g1_title}}</b><span>{{text:g1_body}}</span></li>
        <li><b>{{text:g2_title}}</b><span>{{text:g2_body}}</span></li>
        <li><b>{{text:g3_title}}</b><span>{{text:g3_body}}</span></li>
      </ul>
    </div>
    <div>
      <h2>{{text:safe_title}}</h2>
      <ul class="fd-plain">
        <li><b>{{text:s1_title}}</b><span>{{text:s1_body}}</span></li>
        <li><b>{{text:s2_title}}</b><span>{{text:s2_body}}</span></li>
        <li><b>{{text:s3_title}}</b><span>{{text:s3_body}}</span></li>
      </ul>
    </div>
  </div></section>

  <section class="fd-built"><div class="fd-col">
    <div>
      <h2>{{text:built_title}}</h2>
      <p class="fd-sub">{{text:built_body}}</p>
      <ul class="fd-ticks">
        <li>{{text:t1}}</li>
        <li>{{text:t2}}</li>
        <li>{{text:t3}}</li>
        <li>{{text:t4}}</li>
      </ul>
    </div>
    <div class="fd-shot">
      <img src="{{image:shot_desktop}}" alt="The Devonport club system, home page" loading="lazy">
      <span>{{text:shot_tag}}</span>
    </div>
  </div></section>

  <section class="fd-final"><div class="fd-col"><div class="fd-table">
    <h2>{{text:cta_title}}</h2>
    <p>{{text:cta_sub}}</p>
    <button class="fd-btn" data-start-scorecard>{{text:cta_btn}}</button>
    <p class="fd-deadline">{{text:deadline}}</p>
  </div></div></section>

  <footer class="fd-foot"><div class="fd-col">{{text:footer1}} {{text:footer2}}</div></footer>

  <div class="fd-stick"><button class="fd-btn" data-start-scorecard>{{text:stick_btn}}</button></div>
</div>`;

export function landingPage() {
  return {
    html: LANDING_HTML,
    css: LANDING_CSS,
    slots: [
      slot('strip_left', 'Top strip, left', 'National club committee survey · 2026'),
      slot('strip_right', 'Top strip, right', 'Devonport Table Tennis Association'),
      slot('kicker', 'Hero eyebrow', 'For Australian table tennis club committees'),
      slot('hero_title', 'Headline', 'Does running your club feel heavier than it should?', 'rich'),
      slot(
        'hero_sub',
        'Hero subline',
        'Twelve questions about the jobs behind the tables: registrations, fee chasing, fixtures, grants and paperwork. Every club that takes part receives the national results.'
      ),
      slot('hero_cta', 'Hero button', 'Start the survey'),
      slot('hero_meta', 'Under the hero button', '12 questions · about 3 minutes · no club is named in the results'),
      slot('f1_label', 'Facts panel, label 1', 'Conducted by'),
      slot('f1_value', 'Facts panel, value 1', 'Joel Badcock, Treasurer, Devonport TTA'),
      slot('f2_label', 'Facts panel, label 2', 'Who it is for'),
      slot('f2_value', 'Facts panel, value 2', 'One committee member per club'),
      slot('f3_label', 'Facts panel, label 3', 'Time required'),
      slot('f3_value', 'Facts panel, value 3', 'About 3 minutes'),
      slot('f4_label', 'Facts panel, label 4', 'What you receive'),
      slot('f4_value', 'Facts panel, value 4', 'The national summary, by email'),
      slot('who_title', 'Who section title', 'Who is asking'),
      slot('joel_photo', 'Photo of Joel', `${IMG}/joel.jpg`, 'image'),
      slot('who_name', 'Name', 'Joel Badcock'),
      slot('who_role', 'Role line', 'Treasurer, Devonport Table Tennis Association · playing in Tasmania for 8 years'),
      slot(
        'who_note',
        'Personal note',
        'I do the fee chasing and the grant paperwork at our club, so I know where the evenings go. We built software that now handles most of it for us. Before taking it any further, I want to know honestly whether other clubs carry the same load.'
      ),
      slot('who_reply', 'Reply line', 'Reply to any email from this survey and it comes straight to me.'),
      slot('covers_title', 'Covers section title', 'What the survey covers'),
      slot('covers_sub', 'Covers section subline', 'Ten questions are a single tap. Two let you type an answer in your own words.'),
      slot('c1_title', 'Area 1', 'Volunteers and key people'),
      slot('c1_count', 'Area 1 count', '3 questions'),
      slot('c2_title', 'Area 2', 'Admin and time'),
      slot('c2_count', 'Area 2 count', '5 questions'),
      slot('c3_title', 'Area 3', 'Money and funding'),
      slot('c3_count', 'Area 3 count', '2 questions'),
      slot('c4_title', 'Area 4', 'Members and growth'),
      slot('c4_count', 'Area 4 count', '2 questions'),
      slot('get_title', 'What you get title', 'What you get'),
      slot('g1_title', 'Get 1 title', 'The national results'),
      slot('g1_body', 'Get 1 body', 'How clubs across Australia handle the same jobs, sent to every participating club.'),
      slot('g2_title', 'Get 2 title', '15% off, locked in'),
      slot('g2_body', 'Get 2 body', 'Complete within 2 days of your invite and 15% comes off anything we ever make. No strings.'),
      slot('g3_title', 'Get 3 title', 'No obligation'),
      slot('g3_body', 'Get 3 body', 'This is research. Take the results and run.'),
      slot('safe_title', 'How answers are handled title', 'How answers are handled'),
      slot('s1_title', 'Handling 1 title', 'Reported in aggregate only'),
      slot('s1_body', 'Handling 1 body', 'One national picture. No individual club is ever named.'),
      slot('s2_title', 'Handling 2 title', 'Your details, one use'),
      slot('s2_body', 'Handling 2 body', 'Name and email are used to send you the results. Never sold or passed on.'),
      slot('s3_title', 'Handling 3 title', 'Nothing sent until you finish'),
      slot('s3_body', 'Handling 3 body', 'Close the page at any point and nothing is recorded.'),
      slot('built_title', 'Built section title', 'We built our way out of the paperwork'),
      slot(
        'built_body',
        'Built section body',
        'Our committee got tired of relying on one or two people for everything, so we built software that runs the club for us. It powers Devonport today, live at devtt.com.au:'
      ),
      slot('t1', 'Tick 1', 'Registrations and memberships that handle themselves'),
      slot('t2', 'Tick 2', 'Fee reminders that do the chasing for us'),
      slot('t3', 'Tick 3', 'Fixtures, results and ladders that update on their own'),
      slot('t4', 'Tick 4', 'Scoresheets scanned and entered automatically'),
      slot('shot_desktop', 'Screenshot of the club system', `${IMG}/dtta-desktop.jpg`, 'image'),
      slot('shot_tag', 'Screenshot caption', 'Live today at devtt.com.au'),
      slot('cta_title', 'Bottom CTA title', 'Add your club’s voice'),
      slot('cta_sub', 'Bottom CTA subline', 'One response per club is plenty, from whoever knows where the admin hours really go.'),
      slot('cta_btn', 'Bottom CTA button', 'Start the survey'),
      slot('deadline', 'Deadline line', 'Complete within 2 days of your invite to lock in the 15%'),
      slot('footer1', 'Footer line 1', '© Club Pulse Check · Joel Badcock, Treasurer, Devonport Table Tennis Association.'),
      slot('footer2', 'Footer line 2', 'Questions? Just reply to the email that brought you here.'),
      slot('stick_btn', 'Fixed phone bar button', 'Start the survey'),
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
// Table blue for every action (white text sits on it cleanly; the orange
// ball button on the landing page carries dark text, which the form and
// question buttons cannot).
export const brandingPatch = {
  primaryColor: '#1552A3',
  secondaryColor: '#0F1B2D',
};

export const questionColorsPatch = {
  backgroundColor: '#0F1B2D',
  buttonColor: '#1552A3',
  questionTextColor: '#FFFFFF',
  optionTextColor: '#C9D6E8',
  inputTextColor: '#0F1B2D',
};

export const leadFormButtonColor = '#1552A3';

export const shareDescription =
  'A short survey on what it really takes to run a table tennis club: volunteers, admin, money and growth. Add your club, and receive the national results free.';
