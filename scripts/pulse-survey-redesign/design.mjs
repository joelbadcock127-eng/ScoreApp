// ————————————————————————————————————————————————————————————————————————
// Pulse survey redesign (scorecard 11 only): landing + thank-you shells.
//
// This is the source of record for the Table Tennis Club Pulse Check's
// custom-designed pages. It is applied to scorecard 11's config in the
// database by apply.mjs; it deliberately does NOT touch the club survey
// template in lib/surveyTemplate.ts, so new scorecards created from the
// template keep the old look.
//
// Design system: warm paper white, Devonport navy and paddle red, Bricolage
// Grotesque display type. Photography does the talking: real screenshots of
// the club site we built (desktop + mobile, hosted in the scorecard-images
// storage bucket) and real people from the Devonport club.
// Every line of copy is a slot, so the whole page stays editable in the
// admin's Custom Design editor.
// ————————————————————————————————————————————————————————————————————————

const IMG = 'https://lenicbvdsepyljntsnht.supabase.co/storage/v1/object/public/scorecard-images/pulse';

const slot = (key, label, value, type = 'text') => ({ key, type, label, value });

// ——— Shared foundations ————————————————————————————————————————————————

// @font-face instead of @import: the app injects this CSS after a base rule,
// and browsers ignore any @import that is not at the very top of a stylesheet.
// @font-face works from anywhere, so the display font actually loads.
const BASE_CSS = `
@font-face{font-family:'Bricolage Grotesque';font-style:normal;font-weight:500 800;font-stretch:100%;font-display:swap;
  src:url(https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMlGIInE.woff2) format('woff2');
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Bricolage Grotesque';font-style:normal;font-weight:500 800;font-stretch:100%;font-display:swap;
  src:url(https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMlGGInHEVA.woff2) format('woff2');
  unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
.pv{--ink:#16243D;--navy:#1D4E89;--navy-deep:#14355C;--red:#E8482B;--red-deep:#C93A20;--paper:#F7F5EF;--card:#FFFFFF;
  --line:#E6E0D4;--mut:#5C6779;--tint:#EDF2F9;--green:#1F9D63;--ball:#FFF4D8;
  background:var(--paper);color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.5;overflow:hidden}
.pv h1,.pv h2,.pv h3,.pv .pv-display{font-family:'Bricolage Grotesque',Inter,sans-serif;letter-spacing:-0.015em}
.pv-wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.pv-btn{display:inline-block;border:0;cursor:pointer;font-family:'Bricolage Grotesque',Inter,sans-serif;font-weight:700;
  text-decoration:none;text-align:center;border-radius:14px;transition:transform .15s ease,box-shadow .15s ease,filter .15s ease}
.pv-btn:hover{transform:translateY(-2px);filter:brightness(1.05)}
.pv-btn-red{background:linear-gradient(105deg,var(--red),var(--red-deep));color:#fff;box-shadow:0 14px 30px rgba(232,72,43,.30)}
.pv-btn-white{background:#fff;color:var(--red-deep);box-shadow:0 14px 30px rgba(0,0,0,.18)}
.pv-btn-xl{font-size:18px;padding:17px 40px}
.pv-kicker{font-size:13px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--red)}
`;

// ——— Landing page ——————————————————————————————————————————————————————

const LANDING_CSS = BASE_CSS + `
.pv-top{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:1120px;margin:0 auto;padding:20px 24px}
.pv-mark{display:flex;align-items:center;gap:9px;font-family:'Bricolage Grotesque',Inter,sans-serif;font-weight:800;font-size:17px}
.pv-dot{width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#FF7A5C,var(--red) 60%,var(--red-deep));box-shadow:0 2px 6px rgba(232,72,43,.45)}
.pv-top-pill{font-size:12.5px;font-weight:700;color:var(--navy);background:var(--tint);border:1px solid #D9E4F2;border-radius:99px;padding:7px 14px;white-space:nowrap}

.pv-hero{max-width:1120px;margin:0 auto;padding:40px 24px 84px;display:grid;grid-template-columns:1.04fr .96fr;gap:56px;align-items:center}
.pv-h1{font-size:clamp(38px,5.6vw,62px);font-weight:800;line-height:1.04;margin:16px 0 0}
.pv-h1 b{color:var(--red);font-weight:800}
.pv-lede{font-size:18px;line-height:1.65;color:var(--mut);max-width:540px;margin:20px 0 0}
.pv-cta-row{display:flex;align-items:center;flex-wrap:wrap;gap:18px;margin-top:30px}
.pv-meta{font-size:14px;font-weight:600;color:var(--mut)}
.pv-from{display:flex;align-items:center;gap:12px;margin-top:34px;padding-top:24px;border-top:1px solid var(--line)}
.pv-from img{width:46px;height:46px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #fff;box-shadow:0 4px 12px rgba(22,36,61,.18)}
.pv-from p{margin:0;font-size:14px;color:var(--mut);line-height:1.45}
.pv-from p b{display:block;color:var(--ink);font-size:14.5px}

.pv-shot{position:relative;padding:0 0 56px 34px}
.pv-laptop{background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 30px 70px rgba(22,36,61,.18);overflow:hidden}
.pv-laptop-bar{display:flex;align-items:center;gap:6px;padding:11px 14px;background:#F2EFE8;border-bottom:1px solid var(--line)}
.pv-laptop-bar span{width:9px;height:9px;border-radius:50%}
.pv-laptop img{display:block;width:100%}
.pv-phone{position:absolute;left:0;bottom:0;width:31%;max-width:190px;background:#fff;border:1px solid var(--line);border-radius:22px;padding:7px;box-shadow:0 26px 60px rgba(22,36,61,.28);transform:rotate(-3deg)}
.pv-phone img{display:block;width:100%;border-radius:16px}
.pv-shot-tag{position:absolute;right:0;bottom:16px;background:var(--ink);color:#fff;font-size:13px;font-weight:600;line-height:1.4;border-radius:14px;padding:12px 16px;max-width:250px;box-shadow:0 16px 36px rgba(22,36,61,.30)}

.pv-who{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:84px 0}
.pv-who-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:64px;align-items:center}
.pv-portrait{position:relative;max-width:360px;margin:0 auto}
.pv-portrait::before{content:'';position:absolute;inset:18px -14px -14px 18px;border-radius:24px;background:linear-gradient(135deg,var(--red),#F08A5C);opacity:.9}
.pv-portrait img{position:relative;display:block;width:100%;aspect-ratio:4/4.6;object-fit:cover;object-position:top;border-radius:24px;box-shadow:0 24px 54px rgba(22,36,61,.22)}
.pv-who h2{font-size:clamp(30px,4vw,44px);font-weight:800;line-height:1.08;margin:14px 0 0}
.pv-who p{font-size:16.5px;line-height:1.7;color:var(--mut);margin:18px 0 0}
.pv-sig{margin-top:26px}
.pv-sig b{font-family:'Bricolage Grotesque',Inter,sans-serif;font-size:21px;font-weight:700;color:var(--ink)}
.pv-sig span{display:block;font-size:14px;color:var(--mut);margin-top:3px}

.pv-built{padding:88px 0 92px}
.pv-built-head{text-align:center;max-width:660px;margin:0 auto}
.pv-built h2{font-size:clamp(28px,4vw,42px);font-weight:800;line-height:1.1;margin:14px 0 0}
.pv-built-sub{font-size:17px;line-height:1.65;color:var(--mut);margin:16px 0 0}
.pv-feats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:48px}
.pv-feat{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px 24px;transition:transform .18s ease,box-shadow .18s ease}
.pv-feat:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(22,36,61,.10)}
.pv-feat-ico{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;font-size:23px;background:var(--tint)}
.pv-feat h3{font-size:18px;font-weight:700;margin:15px 0 7px}
.pv-feat p{font-size:14.5px;line-height:1.6;color:var(--mut);margin:0}
.pv-built-punch{text-align:center;font-size:17.5px;font-weight:600;color:var(--ink);max-width:560px;margin:44px auto 0}

.pv-deal{padding:0 24px}
.pv-deal-panel{max-width:1120px;margin:0 auto;background:linear-gradient(150deg,var(--navy) 0%,var(--navy-deep) 100%);border-radius:32px;padding:64px 48px 56px;text-align:center;position:relative;overflow:hidden}
.pv-deal-panel::before{content:'';position:absolute;right:-90px;top:-90px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.14),rgba(255,255,255,.02) 70%)}
.pv-deal-panel::after{content:'';position:absolute;left:-70px;bottom:-110px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(232,72,43,.35),rgba(232,72,43,.05) 70%)}
.pv-deal .pv-kicker{color:#FFB4A3}
.pv-deal h2{color:#fff;font-size:clamp(28px,4vw,42px);font-weight:800;margin:14px 0 0;position:relative;z-index:1}
.pv-deal-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:44px;position:relative;z-index:1}
.pv-deal-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:20px;padding:28px 24px;text-align:left}
.pv-deal-ico{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;font-size:23px;background:rgba(255,255,255,.12)}
.pv-deal-card h3{color:#fff;font-size:18.5px;font-weight:700;margin:15px 0 8px}
.pv-deal-card p{color:#C3D2E6;font-size:14.5px;line-height:1.65;margin:0}
.pv-deadline{display:inline-block;margin-top:36px;font-size:13.5px;font-weight:700;color:var(--ink);background:var(--ball);border-radius:99px;padding:10px 20px;position:relative;z-index:1}

.pv-club{padding:92px 0}
.pv-club-grid{display:grid;grid-template-columns:.95fr 1.05fr;gap:60px;align-items:center}
.pv-club figure{margin:0;position:relative}
.pv-club img{display:block;width:100%;border-radius:22px;box-shadow:0 24px 54px rgba(22,36,61,.18)}
.pv-club figcaption{font-size:13.5px;color:var(--mut);margin-top:12px}
.pv-quote{font-family:'Bricolage Grotesque',Inter,sans-serif;font-size:clamp(24px,3.2vw,33px);font-weight:700;line-height:1.3;margin:16px 0 0}
.pv-quote b{color:var(--red)}
.pv-club-note{font-size:16.5px;line-height:1.7;color:var(--mut);margin:20px 0 0;max-width:480px}

.pv-cta{padding:0 24px 96px}
.pv-cta-panel{max-width:1120px;margin:0 auto;background:linear-gradient(120deg,var(--red) 0%,var(--red-deep) 100%);border-radius:32px;text-align:center;padding:72px 32px;position:relative;overflow:hidden}
.pv-cta-panel::before{content:'';position:absolute;left:8%;top:-56px;width:130px;height:130px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff,var(--ball) 55%,#EFD9A0);opacity:.22}
.pv-cta-panel::after{content:'';position:absolute;right:6%;bottom:-70px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff,var(--ball) 55%,#EFD9A0);opacity:.16}
.pv-cta h2{color:#fff;font-size:clamp(30px,4.4vw,46px);font-weight:800;margin:0;position:relative;z-index:1}
.pv-cta p{color:rgba(255,255,255,.92);font-size:17px;line-height:1.6;max-width:520px;margin:16px auto 0;position:relative;z-index:1}
.pv-cta .pv-btn{margin-top:32px;position:relative;z-index:1}
.pv-cta-note{font-size:14px;color:rgba(255,255,255,.85);margin-top:18px;position:relative;z-index:1}

.pv-foot{text-align:center;padding:30px 24px 36px}
.pv-foot p{margin:0;font-size:13.5px;color:var(--mut);line-height:1.7}

@media (max-width:920px){
  .pv-hero{grid-template-columns:1fr;gap:48px;padding-top:16px;padding-bottom:64px}
  .pv-lede{max-width:none}
  .pv-shot{padding-left:20px}
  .pv-who-grid,.pv-club-grid{grid-template-columns:1fr;gap:44px}
  .pv-portrait{max-width:300px}
  .pv-who{padding:64px 0}
  .pv-built{padding:64px 0 72px}
  .pv-club{padding:72px 0}
  .pv-deal-panel{padding:48px 24px 44px;border-radius:26px}
  .pv-cta-panel{padding:56px 24px;border-radius:26px}
}
@media (max-width:560px){
  .pv-top-pill{display:none}
  .pv-cta-row .pv-btn-xl{width:100%}
}
`;

const LANDING_HTML = `
<div class="cp-page pv">
  <header class="pv-top">
    <span class="pv-mark"><span class="pv-dot"></span>{{text:brand}}</span>
    <span class="pv-top-pill">{{text:top_pill}}</span>
  </header>

  <section class="pv-hero">
    <div>
      <p class="pv-kicker">{{text:kicker}}</p>
      <h1 class="pv-h1">{{rich:hero_title}}</h1>
      <p class="pv-lede">{{text:hero_sub}}</p>
      <div class="pv-cta-row">
        <button class="pv-btn pv-btn-red pv-btn-xl" data-start-scorecard>{{text:hero_cta}}</button>
        <span class="pv-meta">{{text:hero_meta}}</span>
      </div>
      <div class="pv-from">
        <img src="{{image:joel_photo}}" alt="Joel Badcock">
        <p><b>{{text:from_name}}</b>{{text:from_role}}</p>
      </div>
    </div>
    <div class="pv-shot">
      <div class="pv-laptop">
        <div class="pv-laptop-bar"><span style="background:#E8482B"></span><span style="background:#F0B429"></span><span style="background:#1F9D63"></span></div>
        <img src="{{image:shot_desktop}}" alt="The Devonport Table Tennis club website on desktop">
      </div>
      <div class="pv-phone"><img src="{{image:shot_mobile}}" alt="Live fixtures and ladders on a phone"></div>
      <div class="pv-shot-tag">{{text:shot_tag}}</div>
    </div>
  </section>

  <section class="pv-who">
    <div class="pv-wrap pv-who-grid">
      <div class="pv-portrait"><img src="{{image:joel_portrait}}" alt="Joel Badcock at the table"></div>
      <div>
        <p class="pv-kicker">{{text:who_kicker}}</p>
        <h2>{{text:who_title}}</h2>
        <p>{{text:who_p1}}</p>
        <p>{{text:who_p2}}</p>
        <p>{{text:who_p3}}</p>
        <div class="pv-sig"><b>{{text:sig_name}}</b><span>{{text:sig_role}}</span></div>
      </div>
    </div>
  </section>

  <section class="pv-built">
    <div class="pv-wrap">
      <div class="pv-built-head">
        <p class="pv-kicker">{{text:built_kicker}}</p>
        <h2>{{text:built_title}}</h2>
        <p class="pv-built-sub">{{text:built_sub}}</p>
      </div>
      <div class="pv-feats">
        <div class="pv-feat"><span class="pv-feat-ico">🗂️</span><h3>{{text:f1_title}}</h3><p>{{text:f1_body}}</p></div>
        <div class="pv-feat"><span class="pv-feat-ico">💳</span><h3>{{text:f2_title}}</h3><p>{{text:f2_body}}</p></div>
        <div class="pv-feat"><span class="pv-feat-ico">🏓</span><h3>{{text:f3_title}}</h3><p>{{text:f3_body}}</p></div>
        <div class="pv-feat"><span class="pv-feat-ico">📣</span><h3>{{text:f4_title}}</h3><p>{{text:f4_body}}</p></div>
      </div>
      <p class="pv-built-punch">{{text:built_punch}}</p>
    </div>
  </section>

  <section class="pv-deal">
    <div class="pv-deal-panel">
      <p class="pv-kicker">{{text:deal_kicker}}</p>
      <h2>{{text:deal_title}}</h2>
      <div class="pv-deal-cards">
        <div class="pv-deal-card"><span class="pv-deal-ico">📊</span><h3>{{text:d1_title}}</h3><p>{{text:d1_body}}</p></div>
        <div class="pv-deal-card"><span class="pv-deal-ico">🎟️</span><h3>{{text:d2_title}}</h3><p>{{text:d2_body}}</p></div>
        <div class="pv-deal-card"><span class="pv-deal-ico">🤝</span><h3>{{text:d3_title}}</h3><p>{{text:d3_body}}</p></div>
      </div>
      <span class="pv-deadline">{{text:deadline}}</span>
    </div>
  </section>

  <section class="pv-club">
    <div class="pv-wrap pv-club-grid">
      <figure>
        <img src="{{image:club_photo}}" alt="Juniors and senior members playing at the Devonport clubrooms">
        <figcaption>{{text:club_caption}}</figcaption>
      </figure>
      <div>
        <p class="pv-kicker">{{text:club_kicker}}</p>
        <p class="pv-quote">{{rich:club_quote}}</p>
        <p class="pv-club-note">{{text:club_note}}</p>
      </div>
    </div>
  </section>

  <section class="pv-cta">
    <div class="pv-cta-panel">
      <h2>{{text:cta_title}}</h2>
      <p>{{text:cta_sub}}</p>
      <button class="pv-btn pv-btn-white pv-btn-xl" data-start-scorecard>{{text:cta_btn}}</button>
      <p class="pv-cta-note">{{text:cta_note}}</p>
    </div>
  </section>

  <footer class="pv-foot">
    <p>{{text:footer1}}<br>{{text:footer2}}</p>
  </footer>
</div>`;

export function landingPage() {
  return {
    html: LANDING_HTML,
    css: LANDING_CSS,
    slots: [
      slot('brand', 'Wordmark', 'Club Pulse Check'),
      slot('top_pill', 'Top-right pill', 'Surveying every table tennis club in Australia'),
      slot('kicker', 'Hero kicker', 'The Table Tennis Club Pulse Check'),
      slot('hero_title', 'Headline', 'The hardest match at most clubs is the <b>admin</b>', 'rich'),
      slot(
        'hero_sub',
        'Hero subline',
        'I am asking every table tennis club in Australia about the real work of keeping a club going: the rego, the fees, the fixtures, the paperwork. It takes about a minute, and every club that takes part gets the national results.'
      ),
      slot('hero_cta', 'Hero button', 'Start the survey'),
      slot('hero_meta', 'Next to hero button', '12 quick questions, about a minute'),
      slot('joel_photo', 'Small avatar photo (hero)', `${IMG}/joel.jpg`, 'image'),
      slot('from_name', 'Hero byline name', 'Joel Badcock'),
      slot('from_role', 'Hero byline role', 'Treasurer, Devonport Table Tennis Association'),
      slot('shot_desktop', 'Desktop screenshot', `${IMG}/dtta-desktop.jpg`, 'image'),
      slot('shot_mobile', 'Phone screenshot', `${IMG}/dtta-mobile.jpg`, 'image'),
      slot('shot_tag', 'Screenshot caption card', 'The system we built for our own club. It runs the lot, live, today.'),
      slot('who_kicker', 'Who section kicker', 'Who is asking'),
      slot('who_title', 'Who section title', "G'day, I'm Joel"),
      slot(
        'who_p1',
        'Who paragraph 1',
        'I have played table tennis in Tasmania for 8 years, and I am the treasurer of the Devonport Table Tennis Association. I know exactly what it takes to keep a club running, because at our place I am one of the people it takes it out of.'
      ),
      slot(
        'who_p2',
        'Who paragraph 2',
        'Our committee got tired of doing more paperwork than playing. So we built a system that now runs the club for us: registrations, fees, fixtures, results, ladders, even the scoresheets are scanned and entered automatically.'
      ),
      slot(
        'who_p3',
        'Who paragraph 3',
        'It works for us. What I do not know is whether the same headaches exist at every club, or whether it is just us. That is what this survey is for. Nobody is selling you anything today, I am trying to understand the need before we take it any further.'
      ),
      slot('sig_name', 'Signature name', 'Joel Badcock'),
      slot('sig_role', 'Signature role', 'Treasurer, Devonport Table Tennis Association'),
      slot('joel_portrait', 'Large portrait photo', `${IMG}/joel.jpg`, 'image'),
      slot('built_kicker', 'Built section kicker', 'Built at Devonport'),
      slot('built_title', 'Built section title', 'One system instead of six spreadsheets'),
      slot('built_sub', 'Built section subline', 'These are the jobs it took off our committee, the same ones the survey asks about:'),
      slot('f1_title', 'Feature 1 title', 'Registrations and memberships'),
      slot('f1_body', 'Feature 1 body', 'Players sign up and renew themselves, and the records keep themselves current.'),
      slot('f2_title', 'Feature 2 title', 'Fees without the chasing'),
      slot('f2_body', 'Feature 2 body', 'Reminders go out on their own, and the treasurer can see who has paid at a glance.'),
      slot('f3_title', 'Feature 3 title', 'Fixtures, results and ladders'),
      slot('f3_body', 'Feature 3 body', 'The draw lives online, scoresheets are scanned in, and the ladders update themselves.'),
      slot('f4_title', 'Feature 4 title', 'Club comms in one place'),
      slot('f4_body', 'Feature 4 body', 'News, events and announcements without the Sunday night newsletter shift.'),
      slot(
        'built_punch',
        'Built section punchline',
        'This survey tells me whether that load is ours alone, or every club’s. Either way, you will see the answer.'
      ),
      slot('deal_kicker', 'Deal section kicker', 'The deal'),
      slot('deal_title', 'Deal section title', 'What your club gets for one minute'),
      slot('d1_title', 'Deal card 1 title', 'The national results'),
      slot(
        'd1_body',
        'Deal card 1 body',
        'Every participating club receives the full summary. See how clubs across Australia handle the same jobs, and borrow what works.'
      ),
      slot('d2_title', 'Deal card 2 title', '15% off, locked in'),
      slot(
        'd2_body',
        'Deal card 2 body',
        'Complete the survey within 2 days of your invite and your club keeps 15% off anything we ever release. There is no obligation to buy a thing.'
      ),
      slot('d3_title', 'Deal card 3 title', 'Zero commitment'),
      slot(
        'd3_body',
        'Deal card 3 body',
        'This is research, not a sales funnel. Worst case, you have spent a minute helping the table tennis community understand itself.'
      ),
      slot('deadline', 'Deadline pill', 'The 15% locks in when you finish within 2 days of your invite'),
      slot('club_kicker', 'Community section kicker', 'Why it matters'),
      slot(
        'club_quote',
        'Community quote',
        'Most clubs are run by a handful of people who love the game. This is about giving them their <b>evenings back</b>.',
        'rich'
      ),
      slot(
        'club_note',
        'Community note',
        'Your answers are reported in aggregate only. No club is ever singled out, and every club that takes part sees the full picture.'
      ),
      slot('club_photo', 'Community photo', `${IMG}/club-doubles.jpg`, 'image'),
      slot('club_caption', 'Community photo caption', 'Pennant night at the Devonport clubrooms. Every club has nights like this, and volunteers behind them.'),
      slot('cta_title', 'Bottom CTA title', 'Add your club’s voice'),
      slot('cta_sub', 'Bottom CTA subline', 'One response per club is plenty, from whoever knows where the volunteer hours really go.'),
      slot('cta_btn', 'Bottom CTA button', 'Start the survey'),
      slot('cta_note', 'Bottom CTA note', 'About a minute. No commitment. Results shared with every participating club.'),
      slot('footer1', 'Footer line 1', 'The Club Pulse Check is run by Joel Badcock, treasurer of the Devonport Table Tennis Association.'),
      slot('footer2', 'Footer line 2', 'Questions? Just reply to the email that brought you here.'),
    ],
  };
}

// ——— Thank-you page ————————————————————————————————————————————————————

const THANKS_CSS = BASE_CSS + `
.pv-t-hero{text-align:center;padding:84px 24px 64px}
.pv-tick{width:86px;height:86px;margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#25B573,var(--green));color:#fff;font-size:40px;font-weight:800;
  box-shadow:0 18px 40px rgba(31,157,99,.35);animation:pvPop .7s cubic-bezier(.22,1.5,.36,1) both}
@keyframes pvPop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
.pv-t-hero .pv-kicker{margin-top:28px}
.pv-t-hero h1{font-size:clamp(36px,6vw,58px);font-weight:800;line-height:1.06;margin:14px auto 0;max-width:760px}
.pv-t-lede{font-size:17.5px;line-height:1.7;color:var(--mut);max-width:560px;margin:20px auto 0}
.pv-t-lede b{color:var(--ink)}
.pv-steps-wrap{padding:24px 0 40px}
.pv-steps-head{text-align:center;font-size:clamp(24px,3.4vw,34px);font-weight:800;margin:0 0 34px}
.pv-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px}
.pv-step{background:#fff;border:1px solid var(--line);border-radius:20px;padding:26px 24px}
.pv-step-num{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;
  font-family:'Bricolage Grotesque',Inter,sans-serif;font-weight:800;font-size:16px;color:#fff;background:linear-gradient(135deg,var(--navy),#3D77BE)}
.pv-step h3{font-size:17.5px;font-weight:700;margin:14px 0 7px}
.pv-step p{font-size:14.5px;line-height:1.65;color:var(--mut);margin:0}
.pv-joel{padding:48px 24px 0}
.pv-joel-card{max-width:880px;margin:0 auto;background:linear-gradient(150deg,var(--navy),var(--navy-deep));border-radius:26px;
  display:grid;grid-template-columns:230px 1fr;gap:0;overflow:hidden;position:relative}
.pv-joel-card::after{content:'';position:absolute;right:-60px;top:-60px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.14),rgba(255,255,255,.02) 70%)}
.pv-joel-card img{width:100%;height:100%;object-fit:cover;object-position:top}
.pv-joel-body{padding:34px 36px;position:relative;z-index:1}
.pv-joel-body h2{color:#fff;font-size:clamp(22px,3vw,28px);font-weight:800;margin:0}
.pv-joel-body p{color:#C3D2E6;font-size:15.5px;line-height:1.7;margin:14px 0 0}
.pv-joel-sig{margin-top:20px}
.pv-joel-sig b{font-family:'Bricolage Grotesque',Inter,sans-serif;color:#fff;font-size:18px}
.pv-joel-sig span{display:block;color:#8FA9CC;font-size:13.5px;margin-top:3px}
.pv-peek{padding:56px 24px 0}
.pv-peek-card{max-width:880px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:26px;
  display:grid;grid-template-columns:1fr 230px;gap:0;overflow:hidden}
.pv-peek-body{padding:36px 38px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
.pv-peek-body h2{font-size:clamp(22px,3vw,28px);font-weight:800;margin:8px 0 0}
.pv-peek-body p{font-size:15.5px;line-height:1.7;color:var(--mut);margin:12px 0 0}
.pv-peek-body .pv-btn{margin-top:22px;font-size:15.5px;padding:13px 28px}
.pv-peek-shot{background:var(--tint);display:flex;align-items:flex-end;justify-content:center;padding:28px 28px 0}
.pv-peek-shot img{display:block;width:100%;max-width:175px;border-radius:16px 16px 0 0;border:1px solid var(--line);border-bottom:0;box-shadow:0 -10px 30px rgba(22,36,61,.12)}
.pv-share{text-align:center;padding:64px 24px 40px}
.pv-share p{margin:0;font-size:15.5px;color:var(--mut)}
.pv-share-url{display:inline-block;margin-top:14px;font-family:'Bricolage Grotesque',Inter,sans-serif;font-weight:700;font-size:16.5px;
  color:var(--navy);background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px 24px}
.pv-foot{text-align:center;padding:20px 24px 40px}
.pv-foot p{margin:0;font-size:13.5px;color:var(--mut);line-height:1.7}
@media (max-width:760px){
  .pv-t-hero{padding:64px 20px 48px}
  .pv-joel-card{grid-template-columns:1fr}
  .pv-joel-card img{max-height:300px}
  .pv-peek-card{grid-template-columns:1fr}
  .pv-peek-shot{order:2}
  .pv-peek-body{padding:28px 26px}
  .pv-joel-body{padding:28px 26px}
}
`;

const THANKS_HTML = `
<div class="cp-page pv">
  <section class="pv-t-hero">
    <div class="pv-tick">✓</div>
    <p class="pv-kicker">{{text:kicker}}</p>
    <h1>{{text:title}}</h1>
    <p class="pv-t-lede">{{rich:lede}}</p>
  </section>

  <section class="pv-steps-wrap">
    <div class="pv-wrap">
      <h2 class="pv-steps-head">{{text:next_title}}</h2>
      <div class="pv-steps">
        <div class="pv-step"><span class="pv-step-num">1</span><h3>{{text:n1_title}}</h3><p>{{text:n1_body}}</p></div>
        <div class="pv-step"><span class="pv-step-num">2</span><h3>{{text:n2_title}}</h3><p>{{text:n2_body}}</p></div>
        <div class="pv-step"><span class="pv-step-num">3</span><h3>{{text:n3_title}}</h3><p>{{text:n3_body}}</p></div>
      </div>
    </div>
  </section>

  <section class="pv-joel">
    <div class="pv-joel-card">
      <img src="{{image:joel_photo}}" alt="Joel Badcock at the table">
      <div class="pv-joel-body">
        <h2>{{text:joel_title}}</h2>
        <p>{{text:joel_body}}</p>
        <div class="pv-joel-sig"><b>{{text:joel_sig}}</b><span>{{text:joel_role}}</span></div>
      </div>
    </div>
  </section>

  <section class="pv-peek">
    <div class="pv-peek-card">
      <div class="pv-peek-body">
        <p class="pv-kicker">{{text:peek_kicker}}</p>
        <h2>{{text:peek_title}}</h2>
        <p>{{text:peek_body}}</p>
        <a class="pv-btn pv-btn-red" href="{{text:peek_url}}" target="_blank">{{text:peek_btn}}</a>
      </div>
      <div class="pv-peek-shot"><img src="{{image:peek_shot}}" alt="The Devonport club site on a phone"></div>
    </div>
  </section>

  <section class="pv-share">
    <p>{{text:share_line}}</p>
    <span class="pv-share-url">{{text:share_url}}</span>
  </section>

  <footer class="pv-foot">
    <p>{{text:footer1}}<br>{{text:footer2}}</p>
  </footer>
</div>`;

export function thanksPage() {
  return {
    html: THANKS_HTML,
    css: THANKS_CSS,
    slots: [
      slot('kicker', 'Kicker line', 'Response recorded'),
      slot('title', 'Headline', 'Done. Thanks, {{lead.first_name}}.'),
      slot(
        'lede',
        'Subline (merge tags work here)',
        'That was the whole thing. Your answers are in, your club’s <b>15% is locked in</b>, and a copy of what you told us is on its way to <b>{{lead.email}}</b>.',
        'rich'
      ),
      slot('next_title', 'Next steps title', 'What happens from here'),
      slot('n1_title', 'Step 1 title', 'Clubs across Australia weigh in'),
      slot(
        'n1_body',
        'Step 1 body',
        'Your answers join responses from clubs in every state. Nothing is reported club by club, only the national picture.'
      ),
      slot('n2_title', 'Step 2 title', 'The results come back to you'),
      slot(
        'n2_body',
        'Step 2 body',
        'When the survey closes, the full summary lands at {{lead.email}}, along with confirmation of your 15% discount.'
      ),
      slot('n3_title', 'Step 3 title', 'That is it, unless you want more'),
      slot(
        'n3_body',
        'Step 3 body',
        'There is nothing to buy and nobody will call you. If you ever do want the admin load lighter, the discount will be waiting.'
      ),
      slot('joel_photo', 'Joel photo', 'https://lenicbvdsepyljntsnht.supabase.co/storage/v1/object/public/scorecard-images/pulse/joel.jpg', 'image'),
      slot('joel_title', 'Joel card title', 'It really is me on the other end'),
      slot(
        'joel_body',
        'Joel card body',
        'Every reply comes straight to me at the Devonport club. If you have war stories about rego nights, fee chasing or grant paperwork, I genuinely want to hear them. Thank you for the minute, it helps more than you would think.'
      ),
      slot('joel_sig', 'Joel signature', 'Joel Badcock'),
      slot('joel_role', 'Joel role line', 'Treasurer, Devonport Table Tennis Association'),
      slot('peek_kicker', 'Peek card kicker', 'While you wait'),
      slot('peek_title', 'Peek card title', 'Curious what we built?'),
      slot(
        'peek_body',
        'Peek card body',
        'This is the system that runs our club right now: fixtures, results, ladders and player averages, all keeping themselves up to date.'
      ),
      slot('peek_btn', 'Peek button label', 'See it live'),
      slot('peek_url', 'Peek button link', 'https://dtta.vercel.app'),
      slot('peek_shot', 'Peek screenshot', 'https://lenicbvdsepyljntsnht.supabase.co/storage/v1/object/public/scorecard-images/pulse/dtta-mobile.jpg', 'image'),
      slot('share_line', 'Share line', 'Know another committee whose voice belongs in this? Send them the link:'),
      slot('share_url', 'Share URL shown', 'score.accesoai.com.au/s/11'),
      slot('footer1', 'Footer line 1', 'The Club Pulse Check is run by Joel Badcock, treasurer of the Devonport Table Tennis Association.'),
      slot('footer2', 'Footer line 2', 'Questions? Just reply to any email from us and it comes straight to Joel.'),
    ],
  };
}
