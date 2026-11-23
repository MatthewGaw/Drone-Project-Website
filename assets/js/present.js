/* Presenting mode: builds slides from data.js */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const D = window.DRONE, S = D.S, esc = D.esc;
    const cur = D.currentPhase(), cs = D.taskStats([cur]), all = D.taskStats(S.phases), b = D.budgetStats();
    const days = D.daysBetween(D.today(), D.parse(S.config.goalDate));
    const latest = S.updates[0];

    const slides = [
      // 1. Title
      `<div class="split">
        <div style="display:grid;gap:1.5rem">
          <p class="kicker">${esc(S.config.owner)}'s project</p>
          <h1>Building a drone from nothing</h1>
          <p class="big">${esc(S.config.tagline)}</p>
        </div>
        ${D.quadSVG({ hot: false, idPrefix: "t" })}
      </div>`,
      // 2. Goal
      `<p class="kicker">The goal</p>
       <h2>${esc(S.goal.headline)}</h2>
       <div class="s-points">${S.goal.points.map((g) => `<div><h3>${esc(g.title)}</h3><p>${esc(g.text)}</p></div>`).join("")}</div>`,
      // 3. Specs
      `<div class="split">
        <div style="display:grid;gap:1.5rem">
          <p class="kicker">What I'm building</p>
          <h2>A 5-inch quad of about half a kilo</h2>
          <dl class="s-specs">${S.specs.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join("")}</dl>
        </div>
        ${D.quadSVG({ hot: false, idPrefix: "s" })}
      </div>`,
      // 4. Architecture
      `<p class="kicker">How it fits together</p>
       <h2 style="max-width:none">My board flies it. The laptop only sends commands.</h2>
       <div class="s-diagram">${D.archSVG()}</div>`,
      // 5. Control loop
      `<p class="kicker">Staying level</p>
       <h2>1,000 corrections every second</h2>
       <p class="big">A quad would flip over in a fraction of a second on its own. The flight controller reads the motion sensor, works out the tilt and adjusts all four motors, every millisecond.</p>
       <ol class="s-loop"><li>Read sensor</li><li>Work out tilt</li><li>Compare with target</li><li>Mix into 4 motors</li><li>Motors out</li></ol>`,
      // 6. Roadmap
      `<p class="kicker">The plan</p>
       <h2 style="max-width:none">Eight phases, first hover in ${days > 0 ? days + " days" : "the bag"}</h2>
       <div id="deck-gantt"></div>`,
      // 7. Now
      `<p class="kicker">Where I am now</p>
       <div class="s-now">
         <div style="display:grid;gap:1.2rem">
           <h2>Phase ${D.phaseIndex(cur)}: ${esc(cur.name)}</h2>
           <p class="big">${esc(cur.summary)}</p>
           <p class="big" style="color:var(--silk)"><b>${all.done} of ${all.total}</b> milestones done across the whole build.</p>
         </div>
         <div>
           <div class="meter"><span style="width:${cs.pct}%"></span></div>
           <ul class="checklist">${cur.tasks.map((t) => `<li class="${t.done ? "done" : ""}">${esc(t.text)}</li>`).join("")}</ul>
         </div>
       </div>`,
      // 8. Budget
      (() => {
        const max = Math.max(S.config.budget, b.planned) * 1.04, w = (n) => (n / max) * 100;
        return `<p class="kicker">The money</p>
         <h2>Built for under ${D.money(S.config.budget)}, spread out</h2>
         <div class="s-money">
           <div><b>${D.money(b.arrived + b.ordered)}</b>spent so far</div>
           <div><b>${D.money(b.needed)}</b>still to buy</div>
           <div><b>${D.money(S.config.budget)}</b>budget</div>
         </div>
         <div class="budget-bar"><span class="b-arrived" style="width:${w(b.arrived)}%"></span><span class="b-ordered" style="width:${w(b.ordered)}%"></span><span class="b-needed" style="width:${w(b.needed)}%"></span><span class="b-limit" style="left:${w(S.config.budget)}%"></span></div>
         <div class="s-batches">${S.batches.map((bt) => `<div><b>${D.money(bt.items.reduce((a, i) => a + i.price, 0))}</b>${esc(bt.name)}<br><span>${esc(bt.when)}</span></div>`).join("")}</div>`;
      })(),
      // 9. Safety
      `<p class="kicker">Flying safely</p>
       <h2>Real rules, taken seriously</h2>
       <div class="s-rules">
         <div><b>150 m</b><span>from houses and parks, so no free flight at home. Testing happens on a rig.</span></div>
         <div><b>120 m</b><span>maximum height. My own software ceiling starts at 30 m.</span></div>
         <div><b>0.5 s</b><span>without radio and the drone lands itself. A kill button stops it instantly.</span></div>
       </div>`,
      // 10. Latest update
      latest ? `<div class="s-update" style="display:grid;gap:1rem">
         <p class="kicker">Latest update</p>
         <h2>${esc(latest.title)}</h2>
         <time>${D.fmtDate(latest.date)}</time>
         <div>${latest.body.slice(0, 2).map((p) => `<p>${esc(p)}</p>`).join("")}</div>
       </div>` : "",
      // 11. Thanks
      `<div class="split">
        <div style="display:grid;gap:1.5rem">
          <h1>Thanks for following along</h1>
          <p class="big">${S.config.siteUrl ? `Updates, parts and photos at <b style="color:var(--copper-bright)">${esc(S.config.siteUrl)}</b>` : "Updates, parts and photos are all on this site."}</p>
          <p class="big">Questions are welcome.</p>
        </div>
        ${D.quadSVG({ hot: false, idPrefix: "e" })}
      </div>`,
    ].filter(Boolean);

    const deck = document.getElementById("deck");
    deck.innerHTML = slides.map((s, i) => `<section class="slide" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}">${s}</section>`).join("");
    const els = [...deck.querySelectorAll(".slide")];
    let idx = 0;

    function go(n, fromHash) {
      n = Math.max(0, Math.min(els.length - 1, n));
      els.forEach((el, i) => { el.classList.toggle("on", i === n); el.classList.toggle("back", i < n); el.setAttribute("aria-hidden", i !== n); });
      idx = n;
      document.getElementById("count").textContent = `${n + 1} / ${els.length}`;
      document.getElementById("progress").style.width = (els.length > 1 ? (n / (els.length - 1)) * 100 : 100) + "%";
      if (!fromHash) history.replaceState(null, "", "#" + (n + 1));
      const q = els[n].querySelector(".quad");
      if (q) { q.classList.remove("spin"); void q.getBoundingClientRect(); q.classList.add("spin"); }
      const g = els[n].querySelector("#deck-gantt");
      if (g) D.gantt(g);
    }
    function exit() {
      document.getElementById("exit").setAttribute("aria-pressed", "false");
      let to = "index.html";
      try { to = sessionStorage.getItem("returnTo") || to; } catch (e) {}
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setTimeout(() => (location.href = to), 180);
    }
    function fullscreen() {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.().catch(() => {});
    }

    document.getElementById("prev").addEventListener("click", () => go(idx - 1));
    document.getElementById("next").addEventListener("click", () => go(idx + 1));
    document.getElementById("fs").addEventListener("click", fullscreen);
    document.getElementById("exit").addEventListener("click", exit);
    document.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); go(idx + 1); }
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go(idx - 1); }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(els.length - 1);
      else if (e.key === "f" || e.key === "F") fullscreen();
      else if (e.key === "Escape" && !document.fullscreenElement) exit();
      else if (e.key === "p" || e.key === "P") exit();
    });
    // click right/left half of the slide to move
    deck.addEventListener("click", (e) => { if (e.target.closest("a,button")) return; go(idx + (e.clientX > innerWidth / 3 ? 1 : -1)); });
    // swipe
    let sx = null;
    deck.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    deck.addEventListener("touchend", (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1)); sx = null; });
    // hide the bar and cursor when idle
    let t;
    const wake = () => { document.body.classList.remove("idle"); clearTimeout(t); t = setTimeout(() => document.body.classList.add("idle"), 2500); };
    ["mousemove", "touchstart", "keydown"].forEach((ev) => document.addEventListener(ev, wake, { passive: true }));
    wake();
    window.addEventListener("hashchange", () => go((parseInt(location.hash.slice(1), 10) || 1) - 1, true));
    window.addEventListener("resize", () => { const g = els[idx].querySelector("#deck-gantt"); if (g) D.gantt(g); });

    go((parseInt(location.hash.slice(1), 10) || 1) - 1);
  });
})();
