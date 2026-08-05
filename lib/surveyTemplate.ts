import { CustomPage, ScorecardConfig } from './types';

// ————————————————————————————————————————————————————————————————————————
// Hand-designed custom pages for the club survey: a bold table-tennis
// identity (ink navy, paddle red/blue, ball cream) instead of the standard
// component layout. Authored as sanitiser-clean HTML/CSS shells; every line
// of copy is a slot, so it stays fully editable in Custom Design.
// ————————————————————————————————————————————————————————————————————————

const SURVEY_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&display=swap');
.pc{--ink:#0B1220;--panel:#101B31;--paper:#FAF7F2;--red:#E63946;--orange:#FF7A45;--blue:#3A6FF7;--ball:#FFF3D6;--mut:#93A1BC;
  background:var(--ink);color:#fff;font-family:Inter,system-ui,sans-serif;overflow:hidden}
.pc h1,.pc h2,.pc h3,.pt h1,.pt h2,.pt h3{font-family:Sora,Inter,sans-serif;letter-spacing:-0.02em}
.pc-wrap{max-width:1080px;margin:0 auto;padding:0 24px}
.pc-top{display:flex;align-items:center;justify-content:space-between;max-width:1080px;margin:0 auto;padding:20px 24px}
.pc-mark{font-family:Sora,Inter,sans-serif;font-weight:700;font-size:17px;letter-spacing:-0.01em}
.pc-pill{font-size:13px;font-weight:600;color:var(--ball);background:rgba(255,243,214,.08);border:1px solid rgba(255,243,214,.25);border-radius:99px;padding:7px 14px}
.pc-hero{position:relative;text-align:center;padding:72px 24px 90px}
.pc-glow{position:absolute;left:50%;top:-140px;transform:translateX(-50%);width:720px;height:520px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(58,111,247,.28),rgba(230,57,70,.12) 55%,transparent 75%);pointer-events:none}
.pc-ball{position:absolute;border-radius:50%;background:radial-gradient(circle at 32% 30%,#fff,var(--ball) 55%,#E8D9A8);opacity:.9;pointer-events:none}
.pc-ball.b1{width:56px;height:56px;left:8%;top:110px;animation:pcFloat 7s ease-in-out infinite}
.pc-ball.b2{width:26px;height:26px;right:12%;top:80px;animation:pcFloat 5.5s ease-in-out 1s infinite}
.pc-ball.b3{width:38px;height:38px;right:20%;bottom:60px;animation:pcFloat 8s ease-in-out .5s infinite}
.pc-ball.b4{width:18px;height:18px;left:22%;bottom:120px;animation:pcFloat 6s ease-in-out 1.6s infinite}
@keyframes pcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
.pc-kicker{position:relative;font-size:14px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--orange)}
.pc-h1{position:relative;font-size:clamp(40px,7vw,76px);font-weight:800;line-height:1.02;margin:18px auto 0;max-width:880px}
.pc-h1 b{background:linear-gradient(100deg,var(--red),var(--orange));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:var(--orange)}
.pc-lede{position:relative;font-size:19px;line-height:1.65;color:var(--mut);max-width:640px;margin:24px auto 0}
.pc-btn{display:inline-block;border:0;cursor:pointer;font-family:Sora,Inter,sans-serif;font-weight:700;border-radius:14px;transition:transform .15s ease,box-shadow .15s ease,filter .15s ease;text-decoration:none;text-align:center}
.pc-btn:hover{transform:translateY(-2px);filter:brightness(1.06)}
.pc-btn-primary{background:linear-gradient(100deg,var(--red),var(--orange));color:#fff;box-shadow:0 12px 30px rgba(230,57,70,.35)}
.pc-btn-light{background:#fff;color:var(--ink)}
.pc-btn-ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.35);font-size:14px;padding:9px 18px}
.pc-btn-xl{font-size:18px;padding:18px 44px;position:relative}
.pc-meta{position:relative;margin-top:16px;font-size:14px;color:var(--mut)}
.pc-chips{position:relative;display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:760px;margin:44px auto 0}
.pc-chip{font-size:13.5px;font-weight:600;color:#E7ECF6;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:99px;padding:8px 15px}
.pc-byline{position:relative;display:flex;gap:22px;align-items:flex-start;max-width:720px;margin:56px auto 0;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:28px 30px;text-align:left}
.pc-avatar{flex:none;width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Sora,Inter,sans-serif;font-weight:800;font-size:22px;color:#fff;background:linear-gradient(135deg,var(--red),var(--orange));box-shadow:0 10px 24px rgba(230,57,70,.35)}
.pc-byline h3{font-size:17px;margin:0}
.pc-byline .pc-role{font-size:13.5px;color:var(--orange);font-weight:600;margin:3px 0 10px}
.pc-byline p{font-size:15px;line-height:1.65;color:#C4CEE0;margin:0}
.pc-feat{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;max-width:900px;margin:36px auto 0}
.pc-feat-item{display:flex;gap:12px;align-items:flex-start;background:#fff;border:1px solid #ECE6DA;border-radius:16px;padding:16px 18px;text-align:left}
.pc-tick{flex:none;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;background:linear-gradient(135deg,#2AA971,#5BC98F)}
.pc-feat-item p{font-size:14.5px;line-height:1.5;color:#3A4354;margin:0;font-weight:600}
.pc-gets{list-style:none;max-width:640px;margin:40px auto 0;padding:0;text-align:left}
.pc-gets li{display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-bottom:1px dashed #DED6C6}
.pc-gets li:last-of-type{border-bottom:0}
.pc-gets .pc-gift{flex:none;width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:22px;background:var(--ball)}
.pc-gets h3{font-size:17.5px;margin:2px 0 5px}
.pc-gets p{font-size:15px;line-height:1.6;color:#5B6472;margin:0}
.pc-deadline{display:inline-block;margin-top:22px;font-size:13.5px;font-weight:700;color:#fff;background:rgba(11,18,32,.28);border:1px solid rgba(255,255,255,.35);border-radius:99px;padding:8px 18px}
.pc-points{background:var(--paper);color:var(--ink);padding:84px 0 90px;border-radius:44px 44px 0 0}
.pc-points h2,.pc-how h2,.pc-cta h2{font-size:clamp(28px,4vw,44px);font-weight:800;line-height:1.12;text-align:center;margin:0}
.pc-sub{text-align:center;color:#5B6472;font-size:17px;line-height:1.6;max-width:620px;margin:16px auto 0}
.pc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;margin-top:48px}
.pc-card{background:#fff;border:1px solid #ECE6DA;border-radius:22px;padding:28px 24px;transition:transform .18s ease,box-shadow .18s ease}
.pc-card:hover{transform:translateY(-6px);box-shadow:0 18px 40px rgba(11,18,32,.10)}
.pc-emoji{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:15px;font-size:26px;background:var(--ball)}
.pc-card h3{font-size:19px;margin:16px 0 8px}
.pc-card p{font-size:15px;line-height:1.6;color:#5B6472;margin:0}
.pc-how{background:var(--paper);color:var(--ink);padding:10px 0 90px}
.pc-quote{max-width:720px;margin:0 auto 56px;background:var(--ink);color:#fff;border-radius:26px;padding:36px 40px;position:relative;text-align:center}
.pc-quote p{font-family:Sora,Inter,sans-serif;font-size:clamp(19px,2.6vw,25px);font-weight:600;line-height:1.4;margin:0}
.pc-quote::after{content:'🏓';position:absolute;right:-8px;top:-18px;font-size:38px;transform:rotate(12deg)}
.pc-steps{list-style:none;margin:0 auto;padding:0;max-width:680px}
.pc-steps li{display:flex;gap:20px;align-items:flex-start;padding:22px 0;border-bottom:1px dashed #DED6C6}
.pc-steps li:last-of-type{border-bottom:0}
.pc-num{flex:none;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Sora,Inter,sans-serif;font-weight:800;font-size:18px;color:#fff;background:linear-gradient(135deg,var(--blue),#6D95FF)}
.pc-steps h3{font-size:18px;margin:6px 0 6px}
.pc-steps p{font-size:15px;line-height:1.6;color:#5B6472;margin:0}
.pc-cta{background:linear-gradient(120deg,var(--red),var(--orange));text-align:center;padding:78px 24px}
.pc-cta h2{color:#fff}
.pc-cta p{color:rgba(255,255,255,.92);font-size:17px;max-width:560px;margin:14px auto 0;line-height:1.6}
.pc-cta .pc-btn{margin-top:30px}
.pc-cta .pc-note{font-size:14px;color:rgba(255,255,255,.85);margin-top:16px}
.pc-foot{text-align:center;font-size:13px;color:var(--mut);padding:26px 24px;background:var(--ink)}
@media (max-width:640px){.pc-hero{padding:48px 20px 64px}.pc-chips{margin-top:32px}.pc-points{border-radius:28px 28px 0 0}}
`;

const THANKS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&display=swap');
.pt{--ink:#0B1220;--paper:#FAF7F2;--red:#E63946;--orange:#FF7A45;--blue:#3A6FF7;--ball:#FFF3D6;--mut:#93A1BC;
  background:var(--ink);color:#fff;font-family:Inter,system-ui,sans-serif;overflow:hidden}
.pt h1,.pt h2,.pt h3{font-family:Sora,Inter,sans-serif;letter-spacing:-0.02em}
.pt-hero{position:relative;text-align:center;padding:84px 24px 76px}
.pt-glow{position:absolute;left:50%;top:-160px;transform:translateX(-50%);width:680px;height:500px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(58,111,247,.25),rgba(255,122,69,.12) 55%,transparent 75%);pointer-events:none}
.pt-ball{position:relative;width:96px;height:96px;margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:46px;
  background:radial-gradient(circle at 32% 30%,#fff,var(--ball) 60%,#E8D9A8);box-shadow:0 18px 40px rgba(0,0,0,.35);animation:ptDrop .9s cubic-bezier(.22,1.4,.36,1) both}
@keyframes ptDrop{0%{transform:translateY(-90px) scale(.8);opacity:0}60%{transform:translateY(8px) scale(1.02);opacity:1}100%{transform:translateY(0) scale(1)}}
.pt-kicker{position:relative;font-size:14px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--orange);margin-top:30px}
.pt-hero h1{position:relative;font-size:clamp(38px,6.5vw,68px);font-weight:800;line-height:1.05;margin:14px auto 0;max-width:760px}
.pt-lede{position:relative;font-size:18px;line-height:1.65;color:var(--mut);max-width:600px;margin:20px auto 0}
.pt-lede b{color:#fff}
.pt-next{background:var(--paper);color:var(--ink);border-radius:44px 44px 0 0;padding:76px 24px 40px}
.pt-next h2{font-size:clamp(26px,3.6vw,38px);font-weight:800;text-align:center;margin:0}
.pt-steps{list-style:none;max-width:640px;margin:40px auto 0;padding:0}
.pt-steps li{display:flex;gap:20px;align-items:flex-start;padding:20px 0;border-bottom:1px dashed #DED6C6}
.pt-steps li:last-of-type{border-bottom:0}
.pt-num{flex:none;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Sora,Inter,sans-serif;font-weight:800;font-size:17px;color:#fff;background:linear-gradient(135deg,var(--blue),#6D95FF)}
.pt-steps h3{font-size:17.5px;margin:6px 0 6px}
.pt-steps p{font-size:15px;line-height:1.6;color:#5B6472;margin:0}
.pt-offer{background:var(--paper);padding:20px 24px 84px}
.pt-offer-card{max-width:680px;margin:0 auto;background:var(--ink);color:#fff;border-radius:26px;padding:40px 42px;text-align:center;position:relative;overflow:hidden}
.pt-offer-card::before{content:'';position:absolute;right:-70px;top:-70px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.16),rgba(255,255,255,.03) 70%)}
.pt-offer-card h3{font-size:clamp(21px,2.8vw,27px);margin:0}
.pt-offer-card p{color:#B9C3D8;font-size:15.5px;line-height:1.65;max-width:520px;margin:14px auto 0}
.pt-btn{display:inline-block;margin-top:26px;font-family:Sora,Inter,sans-serif;font-weight:700;font-size:16px;color:#fff;text-decoration:none;
  background:linear-gradient(100deg,var(--red),var(--orange));border-radius:13px;padding:15px 36px;box-shadow:0 12px 30px rgba(230,57,70,.35);transition:transform .15s ease,filter .15s ease}
.pt-btn:hover{transform:translateY(-2px);filter:brightness(1.06)}
.pt-share{background:var(--paper);color:var(--ink);text-align:center;padding:0 24px 70px}
.pt-share p{margin:0;font-size:15.5px;color:#5B6472}
.pt-share .pt-url{margin-top:10px;display:inline-block;font-family:Sora,Inter,sans-serif;font-weight:700;font-size:16px;color:var(--blue);background:#fff;border:1px solid #ECE6DA;border-radius:12px;padding:12px 22px}
.pt-foot{text-align:center;font-size:13px;color:var(--mut);padding:26px 24px;background:var(--ink)}
@media (max-width:640px){.pt-hero{padding:60px 20px 56px}.pt-next{border-radius:28px 28px 0 0}.pt-offer-card{padding:32px 24px}}
`;

function slot(key: string, label: string, value: string, type: 'text' | 'rich' | 'image' = 'text') {
  return { key, type, label, value };
}

export function surveyLandingPage(): CustomPage {
  const html = `
<div class="cp-page pc">
  <header class="pc-top">
    <span class="pc-mark">🏓 {{text:brand}}</span>
    <span class="pc-pill">{{text:top_pill}}</span>
  </header>

  <section class="pc-hero">
    <div class="pc-glow"></div>
    <div class="pc-ball b1"></div><div class="pc-ball b2"></div><div class="pc-ball b3"></div><div class="pc-ball b4"></div>
    <p class="pc-kicker">{{text:kicker}}</p>
    <h1 class="pc-h1">{{rich:hero_title}}</h1>
    <p class="pc-lede">{{text:hero_sub}}</p>
    <p style="position:relative;margin:34px 0 0;"><button class="pc-btn pc-btn-primary pc-btn-xl" data-start-scorecard>{{text:hero_cta}}</button></p>
    <p class="pc-meta">{{text:hero_meta}}</p>
    <div class="pc-byline">
      <span class="pc-avatar">{{text:byline_initials}}</span>
      <div>
        <h3>{{text:byline_name}}</h3>
        <p class="pc-role">{{text:byline_role}}</p>
        <p>{{text:byline_note}}</p>
      </div>
    </div>
    <div class="pc-chips">
      <span class="pc-chip">{{text:chip1}}</span>
      <span class="pc-chip">{{text:chip2}}</span>
      <span class="pc-chip">{{text:chip3}}</span>
      <span class="pc-chip">{{text:chip4}}</span>
      <span class="pc-chip">{{text:chip5}}</span>
      <span class="pc-chip">{{text:chip6}}</span>
    </div>
  </section>

  <section class="pc-points">
    <div class="pc-wrap" style="text-align:center;">
      <h2>{{text:why_title}}</h2>
      <p class="pc-sub">{{text:why_sub}}</p>
      <div class="pc-feat">
        <div class="pc-feat-item"><span class="pc-tick">✓</span><p>{{text:f1}}</p></div>
        <div class="pc-feat-item"><span class="pc-tick">✓</span><p>{{text:f2}}</p></div>
        <div class="pc-feat-item"><span class="pc-tick">✓</span><p>{{text:f3}}</p></div>
        <div class="pc-feat-item"><span class="pc-tick">✓</span><p>{{text:f4}}</p></div>
      </div>
      <p class="pc-sub" style="margin-top:34px;"><b>{{text:why_punch}}</b></p>
    </div>
  </section>

  <section class="pc-how">
    <div class="pc-wrap">
      <div class="pc-quote"><p>{{text:quote}}</p></div>
      <h2>{{text:gets_title}}</h2>
      <ul class="pc-gets">
        <li><span class="pc-gift">📊</span><div><h3>{{text:g1_title}}</h3><p>{{text:g1_body}}</p></div></li>
        <li><span class="pc-gift">🎟️</span><div><h3>{{text:g2_title}}</h3><p>{{text:g2_body}}</p></div></li>
        <li><span class="pc-gift">🤝</span><div><h3>{{text:g3_title}}</h3><p>{{text:g3_body}}</p></div></li>
      </ul>
    </div>
  </section>

  <section class="pc-cta">
    <h2>{{text:cta_title}}</h2>
    <p>{{text:cta_sub}}</p>
    <button class="pc-btn pc-btn-light pc-btn-xl" data-start-scorecard>{{text:cta_btn}}</button>
    <p class="pc-note">{{text:cta_note}}</p>
    <p><span class="pc-deadline">{{text:deadline}}</span></p>
  </section>

  <footer class="pc-foot">{{text:footer}}</footer>
</div>`;

  return {
    html,
    css: SURVEY_CSS,
    slots: [
      slot('brand', 'Wordmark', 'Club Pulse Check'),
      slot('top_pill', 'Top-right pill', 'Surveying every club in Australia'),
      slot('kicker', 'Kicker line', 'A quick survey for Australian table tennis clubs'),
      slot('hero_title', 'Headline', 'Does running your club feel <b>heavier</b> than it should?', 'rich'),
      slot(
        'hero_sub',
        'Hero subline',
        'I’m asking every club in the country the same few questions about the jobs behind the tables — the rego, the fee chasing, the paperwork. Answer honestly, and I’ll send you what everyone said.'
      ),
      slot('hero_cta', 'Hero button', 'Take the 1-minute survey'),
      slot('hero_meta', 'Under-button note', 'No commitment · results shared with every participating club'),
      slot('byline_initials', 'Byline avatar initials', 'JB'),
      slot('byline_name', 'Byline name', 'Joel Badcock'),
      slot('byline_role', 'Byline role line', 'Treasurer, Devonport Table Tennis Club · playing in Tasmania for 8 years'),
      slot(
        'byline_note',
        'Byline personal note',
        'I do the fee chasing and the grant paperwork at our club, so I know exactly where the evenings go. We built software that now handles most of it for us — and before taking it any further, I want to know honestly whether other clubs deal with the same headaches.'
      ),
      slot('chip1', 'Pain chip 1', 'Registrations'),
      slot('chip2', 'Pain chip 2', 'Chasing fees'),
      slot('chip3', 'Pain chip 3', 'Fixtures & grading'),
      slot('chip4', 'Pain chip 4', 'Grant paperwork'),
      slot('chip5', 'Pain chip 5', 'Newsletters & socials'),
      slot('chip6', 'Pain chip 6', 'Committee burnout'),
      slot('why_title', 'Why-I’m-asking title', 'Why I’m asking'),
      slot(
        'why_sub',
        'Why-I’m-asking subline',
        'At Devonport we got tired of the committee spending more time on paperwork than table tennis, so we built a system that takes the worst of it off our plate:'
      ),
      slot('f1', 'Feature 1', 'Registrations & memberships that handle themselves'),
      slot('f2', 'Feature 2', 'Fee reminders that do the chasing for you'),
      slot('f3', 'Feature 3', 'Fixtures, results and ladders in one place'),
      slot('f4', 'Feature 4', 'Club comms without the Sunday-night newsletter slog'),
      slot(
        'why_punch',
        'Why-I’m-asking punchline',
        'It works for us. This survey is me finding out if it’s just us — or if every club is carrying the same load.'
      ),
      slot('quote', 'Quote card', '“Most clubs aren’t run by a committee. They’re run by three people and a group chat.”'),
      slot('gets_title', 'What-you-get title', 'What you get for a minute of honesty'),
      slot('g1_title', 'Get 1 title', 'The national results'),
      slot(
        'g1_body',
        'Get 1 body',
        'Every participating club receives the full summary — see how clubs across Australia handle the same jobs, and steal what works.'
      ),
      slot('g2_title', 'Get 2 title', '15% off, locked in'),
      slot(
        'g2_body',
        'Get 2 body',
        'Complete the survey within 2 days and if you ever buy anything we make, 15% comes off — no strings, no expiry pressure, just a thank-you.'
      ),
      slot('g3_title', 'Get 3 title', 'Zero commitment'),
      slot(
        'g3_body',
        'Get 3 body',
        'This is research, not a sales trap. Take the results and run — you’ll have helped another club in the table tennis community either way.'
      ),
      slot('cta_title', 'Bottom CTA title', 'Help a fellow committee out'),
      slot(
        'cta_sub',
        'Bottom CTA subline',
        'One response per club is plenty — from whoever knows where the admin hours really go.'
      ),
      slot('cta_btn', 'Bottom CTA button', 'Take the survey'),
      slot('cta_note', 'Bottom CTA note', 'About a minute · no commitment · results shared with participants'),
      slot('deadline', 'Deadline pill', 'Closing soon — complete within 2 days of your invite to lock in the 15%'),
      slot('footer', 'Footer line', '© Club Pulse Check · run by Joel Badcock, Devonport Table Tennis Club'),
    ],
  };
}

export function surveyThanksPage(): CustomPage {
  const html = `
<div class="cp-page pt">
  <section class="pt-hero">
    <div class="pt-glow"></div>
    <div class="pt-ball">🏓</div>
    <p class="pt-kicker">{{text:kicker}}</p>
    <h1>{{text:title}}</h1>
    <p class="pt-lede">{{text:lede}}</p>
  </section>

  <section class="pt-next">
    <h2>{{text:next_title}}</h2>
    <ol class="pt-steps">
      <li><span class="pt-num">1</span><div><h3>{{text:n1_title}}</h3><p>{{text:n1_body}}</p></div></li>
      <li><span class="pt-num">2</span><div><h3>{{text:n2_title}}</h3><p>{{text:n2_body}}</p></div></li>
      <li><span class="pt-num">3</span><div><h3>{{text:n3_title}}</h3><p>{{text:n3_body}}</p></div></li>
    </ol>
  </section>

  <section class="pt-offer">
    <div class="pt-offer-card">
      <h3>{{text:offer_title}}</h3>
      <p>{{text:offer_body}}</p>
      <a class="pt-btn" href="{{text:offer_url}}" target="_blank">{{text:offer_btn}}</a>
    </div>
  </section>

  <section class="pt-share">
    <p>{{text:share_line}}</p>
    <span class="pt-url">{{text:share_url}}</span>
  </section>

  <footer class="pt-foot">{{text:footer}}</footer>
</div>`;

  return {
    html,
    css: THANKS_CSS,
    slots: [
      slot('kicker', 'Kicker line', 'Response recorded'),
      slot('title', 'Headline', 'You’re a legend — that’s it.'),
      slot(
        'lede',
        'Subline (merge tags work here)',
        'Thanks {{lead.first_name}} — your answers are in, your 15% is locked in, and a copy of what you told us has been emailed to {{lead.email}}. Genuinely appreciate the minute.'
      ),
      slot('next_title', 'Next steps title', 'What happens next'),
      slot('n1_title', 'Step 1 title', 'Your answers join clubs from all over Australia'),
      slot('n1_body', 'Step 1 body', 'Responses are combined into one national picture — no individual club is ever singled out.'),
      slot('n2_title', 'Step 2 title', 'The results come back to you'),
      slot(
        'n2_body',
        'Step 2 body',
        'Once the survey closes, the full summary — plus your 15% discount confirmation — lands at {{lead.email}}.'
      ),
      slot('n3_title', 'Step 3 title', 'And it’s really me on the other end'),
      slot(
        'n3_body',
        'Step 3 body',
        'Reply to any email from us and it comes straight to Joel at the Devonport club — questions, war stories and corrections all welcome.'
      ),
      slot('offer_title', 'Offer card title', 'Curious what we built for Devonport?'),
      slot(
        'offer_body',
        'Offer card body',
        'The system that does our rego, fee reminders, fixtures and comms is the reason this survey exists. No obligation ever — but if you’d like an early look, I’ll happily show you around it.'
      ),
      slot('offer_btn', 'Offer button label', 'Show me around'),
      slot('offer_url', 'Offer button link', 'https://accesoai.com.au'),
      slot('share_line', 'Share line', 'Know another committee whose voice belongs in this? Send them the link:'),
      slot('share_url', 'Share URL shown', 'score.accesoai.com.au/s/11'),
      slot('footer', 'Footer line', '© Club Pulse Check · run by Joel Badcock, Devonport Table Tennis Club'),
    ],
  };
}

// A complete, ready-to-send survey scorecard for table tennis / sports club
// committees: mode 'survey', so respondents get a thank-you page instead of
// scores, while the owner still sees internal triage scores and every answer.
// Everything here is standard builder-editable config — no special-case pages.
const placeholderTier = {
  low: 'Internal note: this respondent’s answers suggest the club is under real pressure here.',
  medium: 'Internal note: this respondent’s answers suggest the club is managing but stretched here.',
  high: 'Internal note: this respondent’s answers suggest the club is in good shape here.',
};

export function clubSurveyConfig(name: string): ScorecardConfig {
  return {
    title: name,
    copyright: '© Copyright',
    mode: 'survey',
    // The public pages use the hand-designed custom shells above; the
    // component-based landing/results configs below stay as an editable
    // fallback if the owner ever switches back to standard mode.
    landingMode: 'custom',
    resultsMode: 'custom',
    customPages: {
      landing: surveyLandingPage(),
      results: surveyThanksPage(),
    },
    branding: {
      logoUrl: '',
      iconUrl: '',
      primaryColor: '#1c78fe',
      secondaryColor: '#152042',
    },
    shareAppearance: {
      title: name,
      description:
        'A 3-minute survey on what it really takes to run a table tennis club — volunteers, admin, money and growth. Add your club’s voice and receive the national summary.',
      image: '',
    },
    notifications: {
      enabled: true,
      recipients: '',
      subject: '{first_name} {last_name} completed the {scorecard_name}',
      content:
        '<p><b>New survey response</b></p><p>Name: {first_name} {last_name}<br>Email: {email}</p><p>Their answers:</p>{answers_summary}',
    },
    resultEmail: {
      enabled: true,
      fromAddress: '',
      fromName: '',
      replyTo: '',
      subject: 'Thanks {first_name} — your {scorecard_name} responses',
      content:
        '<p>Hi {first_name},</p>' +
        '<p>Thanks for taking a few minutes to complete the {scorecard_name} — your responses have been recorded.</p>' +
        '<p>For your records, here’s what you told us:</p>' +
        '{answers_summary}' +
        '<p>We’ll email you the summary of results from clubs across the country once responses are in. ' +
        'And if any of the jobs above are ones you’d like off your plate sooner, just reply to this email — happy to chat.</p>',
    },
    landing: {
      heroImage: '',
      sectionOrder: ['banner', 'categories', 'cta'],
      heroCtaAction: { type: 'lead-form' },
      bottomCtaAction: { type: 'lead-form' },
      imagePosition: 'right',
      categoriesPerRow: 2,
      showHeader: false,
      showFooter: true,
      heroTitle: 'The Table Tennis Club Pulse Check',
      heroSubtitle: '12 quick questions about what it really takes to run your club',
      heroBody:
        'Table tennis in Australia runs on committee volunteers — and at most clubs, a handful of people carry the registrations, the fees, the fixtures and the paperwork. This short survey is building a picture of where that load sits across clubs. Tell us how it looks at yours, and we’ll send you the summary so you can see how other clubs handle the same jobs.',
      heroBullets: [
        'Takes about 3 minutes',
        'Results shared back with every club that takes part',
        'Written for committee members — presidents, secretaries, treasurers',
      ],
      heroCta: 'Start the survey',
      howItWorksLabel: 'What we ask about',
      howItWorksTitle: 'Four pressure points every committee knows',
      howItWorksBody:
        'Every question comes from the realities of running a club: the reliance on one or two key people, the admin that eats up evenings, the money jobs nobody loves, and keeping members coming through the door.',
      categoryCards: [
        {
          key: 'people',
          title: 'Volunteers & key people',
          body: 'How much rests on one or two sets of shoulders — and what happens when they need a break.',
          image: '/images/card-4.png',
        },
        {
          key: 'admin',
          title: 'Admin & time',
          body: 'Registrations, fixtures, minutes and newsletters — where the volunteer hours actually go.',
          image: '/images/card-3.png',
        },
        {
          key: 'money',
          title: 'Money & funding',
          body: 'Collecting fees, chasing grants and knowing where the club stands financially.',
          image: '/images/card-2.png',
        },
        {
          key: 'growth',
          title: 'Members & growth',
          body: 'Membership trends, junior pathways and what’s working at growing clubs.',
          image: '/images/card-1.png',
        },
      ],
      bottomTitle: 'Add your club’s voice',
      bottomBody:
        'The more clubs take part, the more useful the picture becomes. Results are reported in aggregate — no individual club is singled out — and every participating club receives the summary.',
      bottomCta: 'Take the survey',
      bottomNote: 'About 3 minutes — one response per club is plenty',
    },
    leadForm: {
      heading: 'A few details so we can send you the results summary',
      fields: [
        { key: 'first_name', label: 'First name', type: 'text', required: true, enabled: true },
        { key: 'last_name', label: 'Last name', type: 'text', required: true, enabled: true },
        { key: 'email', label: 'Email', type: 'email', required: true, enabled: true },
        { key: 'business', label: 'Club name', type: 'text', required: true, enabled: true },
        {
          key: 'contact_opt_in',
          label: 'Happy to be contacted about the survey results',
          type: 'checkbox',
          required: false,
          enabled: true,
        },
      ],
      submitLabel: 'Start the survey',
      buttonColor: '#E63946',
    },
    // Internal triage only — respondents never see tiers in survey mode.
    tiers: [
      { key: 'low', label: 'Under pressure', color: '#d41f34', from: 0, to: 40 },
      { key: 'medium', label: 'Stretched', color: '#f26527', from: 41, to: 70 },
      { key: 'high', label: 'Healthy', color: '#66bc46', from: 71, to: 100 },
    ],
    categories: [
      { key: 'people', label: 'Volunteers & Key People' },
      { key: 'admin', label: 'Admin & Time' },
      { key: 'money', label: 'Money & Funding' },
      { key: 'growth', label: 'Members & Growth' },
    ],
    // Question screens match the custom pages: ink background, ball-cream
    // text, paddle-red actions. Header off (no logo needed for a survey).
    questionsPage: {
      header: { show: false, align: 'center', maxWidth: 250, topMargin: 13, bottomMargin: 13 },
      questions: {
        align: 'center',
        showBack: true,
        showCategory: true,
        optionTextColor: '#D7E0EF',
        // Open-text boxes are white, so typed answers need ink, not the
        // light option colour used on the dark page background.
        inputTextColor: '#152042',
        buttonColor: '#E63946',
        questionTextColor: '#FFFFFF',
        backgroundColor: '#0B1220',
      },
      progress: { show: true },
      footer: { show: false },
    },
    questions: [
      // Volunteers & key people
      {
        id: 'q1',
        category: 'people',
        type: 'radio',
        required: true,
        text: 'How much does your club rely on one or two key people to keep everything running?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Everything would stop without them', score: 1 },
          { label: 'They carry most of it, others help a bit', score: 2 },
          { label: 'The load is shared, but they’d be hard to replace', score: 3 },
          { label: 'We could hand things over smoothly', score: 5 },
        ],
      },
      {
        id: 'q2',
        category: 'people',
        type: 'buttons',
        required: true,
        text: 'If your secretary or treasurer stepped away tomorrow, how quickly could someone take over?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Within a week — it’s all documented', score: 5 },
          { label: 'Within a season, with some pain', score: 3 },
          { label: 'Honestly, we don’t know', score: 1 },
        ],
      },
      {
        id: 'q3',
        category: 'people',
        type: 'scale',
        text: 'How is your committee travelling for energy right now?',
        min: 1, max: 5, start: 3,
        labels: { left: 'Running on fumes', center: 'Managing, but stretched', right: 'Fresh and well supported' },
      },
      // Admin & time
      {
        id: 'q4',
        category: 'admin',
        type: 'checkboxes',
        required: true,
        instruction: 'Tick all that apply',
        text: 'Which jobs soak up the most volunteer time at your club?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Registrations & memberships', score: 0 },
          { label: 'Chasing fees & payments', score: 0 },
          { label: 'Fixtures, results & grading', score: 0 },
          { label: 'Grant applications & reporting', score: 0 },
          { label: 'Newsletters, website & social media', score: 0 },
          { label: 'Venue & equipment bookings', score: 0 },
          { label: 'Committee paperwork — minutes, agendas, compliance', score: 0 },
        ],
      },
      {
        id: 'q5',
        category: 'admin',
        type: 'radio',
        required: true,
        text: 'How are your membership records kept?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Paper, memory, or one person’s laptop', score: 1 },
          { label: 'Spreadsheets that mostly work', score: 3 },
          { label: 'A proper system, but only one person can drive it', score: 4 },
          { label: 'A system the whole committee can use', score: 5 },
        ],
      },
      {
        id: 'q6',
        category: 'admin',
        type: 'scale',
        text: 'Out of every 10 hours your committee puts in, how much goes to paperwork rather than actual table tennis?',
        min: 1, max: 5, start: 3,
        labels: { left: 'Almost all paperwork', center: 'About half and half', right: 'Mostly table tennis' },
      },
      // Money & funding
      {
        id: 'q7',
        category: 'money',
        type: 'radio',
        required: true,
        text: 'How does collecting fees and memberships actually go each season?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'We chase people for months', score: 1 },
          { label: 'Most pay on time, some need chasing', score: 3 },
          { label: 'Smooth — it mostly takes care of itself', score: 5 },
        ],
      },
      {
        id: 'q8',
        category: 'money',
        type: 'buttons',
        required: true,
        text: 'Do you know, today, whether the club will be better or worse off financially this year?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Yes — we have clear, current numbers', score: 5 },
          { label: 'Roughly', score: 3 },
          { label: 'We’ll find out at the AGM', score: 1 },
        ],
      },
      // Members & growth
      {
        id: 'q9',
        category: 'growth',
        type: 'radio',
        required: true,
        text: 'Which best describes your membership over the last three seasons?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
        options: [
          { label: 'Growing', score: 5 },
          { label: 'Holding steady', score: 3 },
          { label: 'Slowly shrinking', score: 2 },
          { label: 'Shrinking fast', score: 1 },
        ],
      },
      {
        id: 'q10',
        category: 'growth',
        type: 'scale',
        text: 'How strong is your junior pathway right now?',
        min: 1, max: 5, start: 3,
        labels: { left: 'No juniors coming through', center: 'A few, but patchy', right: 'Strong and growing' },
      },
      // Open answers — often the most valuable part of a survey
      {
        id: 'q11',
        category: 'admin',
        type: 'text',
        required: true,
        text: 'If you could hand one club job to someone (or something) else tomorrow, which job would it be?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
      },
      {
        id: 'q12',
        category: 'admin',
        type: 'text',
        required: false,
        instruction: 'Optional',
        text: 'Anything else about running the club you wish took less time?',
        min: 1, max: 5, start: 3,
        labels: { left: '', center: '', right: '' },
      },
    ],
    results: {
      thanksPrefix: 'Thanks for completing the',
      overallHeading: 'Overall',
      surveyThanks: {
        headline: 'Your responses have been recorded.',
        body: [
          'Every response builds a clearer picture of what it takes to keep a table tennis club running in Australia — and where the load sits heaviest.',
          'We’ll compile the results and email you the summary as soon as it’s ready, so you can see how your club compares with others juggling the same jobs.',
        ],
      },
      tierIntros: {
        low: { headline: 'Thanks for your honesty.', body: [placeholderTier.low] },
        medium: { headline: 'Thanks for taking part.', body: [placeholderTier.medium] },
        high: { headline: 'Thanks for taking part.', body: [placeholderTier.high] },
      },
      categoryScoresNote: '',
      emailedNote: 'A copy of your responses has been emailed to',
      changeEmailLabel: 'Change email address',
      categoryHeading: 'Where clubs feel it most',
      categorySub: ['Internal view — respondents never see these scores.'],
      categoryTexts: {
        people: { ...placeholderTier },
        admin: { ...placeholderTier },
        money: { ...placeholderTier },
        growth: { ...placeholderTier },
      },
      cta: {
        heading: 'While you’re here',
        leftTitle: 'Get the summary first',
        leftBody:
          'We send the results summary to every club that takes part. Take a second to check your details are right so it reaches you.',
        leftButton: 'Check my details',
        leftAction: { type: 'details' },
        rightTitle: 'Want the admin load lighter sooner?',
        rightBody:
          'We build simple tools that take club admin off volunteers’ plates — registrations, fee reminders, comms and more. If today’s questions hit close to home, we’d be glad to show you what that looks like.',
        rightButton: 'Get in touch',
        rightAction: { type: 'url', url: 'https://accesoai.com.au' },
      },
      share: 'Know another club committee whose voice belongs in this? Share the survey with them.',
      changeDetails: {
        heading: 'Update your details',
        subheading: 'We’ll send the results summary to your updated email address',
        submitLabel: 'Update',
      },
    },
    resultsPage: {
      order: ['speedChart', 'cta', 'share'],
      hidden: [],
      speedChart: { chartPosition: 'right', showOverall: false, scoreFormat: 'percent', showTiers: false },
      categories: { itemsPerRow: 2, showScores: false, showTier: false },
      share: { facebook: true, twitter: false, linkedin: true, background: '#152042', linksColor: '#ffffff' },
    },
    // Required by the config shape; the respondent-facing report is disabled in
    // survey mode, so this stays placeholder until the owner ever needs it.
    pdf: {
      coverTitle: `${name} — Summary`,
      howToReadTitle: 'How to read this report',
      howToRead: ['Surveys don’t send respondents a PDF report. This section is unused while the scorecard is in survey mode.'],
      keysHeading: 'Survey themes:',
      categories: {
        people: {
          low: { intro: [placeholderTier.low], exampleTitle: 'Example', example: ['—'] },
          medium: { intro: [placeholderTier.medium], exampleTitle: 'Example', example: ['—'] },
          high: { intro: [placeholderTier.high], exampleTitle: 'Example', example: ['—'] },
        },
        admin: {
          low: { intro: [placeholderTier.low], exampleTitle: 'Example', example: ['—'] },
          medium: { intro: [placeholderTier.medium], exampleTitle: 'Example', example: ['—'] },
          high: { intro: [placeholderTier.high], exampleTitle: 'Example', example: ['—'] },
        },
        money: {
          low: { intro: [placeholderTier.low], exampleTitle: 'Example', example: ['—'] },
          medium: { intro: [placeholderTier.medium], exampleTitle: 'Example', example: ['—'] },
          high: { intro: [placeholderTier.high], exampleTitle: 'Example', example: ['—'] },
        },
        growth: {
          low: { intro: [placeholderTier.low], exampleTitle: 'Example', example: ['—'] },
          medium: { intro: [placeholderTier.medium], exampleTitle: 'Example', example: ['—'] },
          high: { intro: [placeholderTier.high], exampleTitle: 'Example', example: ['—'] },
        },
      },
      closingTitle: 'Next steps',
      closing: ['Unused in survey mode.'],
      images: {},
      hidden: [],
    },
  };
}
