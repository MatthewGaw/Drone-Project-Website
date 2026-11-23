/* Shared rendering for every page. Content comes from data.js. */
(function () {
  "use strict";
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- helpers (also used by present.js) ---------- */
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parse = (d) => { const [y, m, dd] = d.split("-").map(Number); return new Date(y, m - 1, dd); };
  const fmtDate = (d, withYear = true) => { const x = parse(d); return `${x.getDate()} ${MONTHS[x.getMonth()]}${withYear ? " " + x.getFullYear() : ""}`; };
  const money = (n) => "£" + (Number.isInteger(n) ? n : n.toFixed(2));
  const today = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
  const daysBetween = (a, b) => Math.round((b - a) / 86400000);

  function currentPhase() {
    return S.phases.find((p) => p.status === "active") || S.phases.find((p) => p.status === "planned") || S.phases[S.phases.length - 1];
  }
  function phaseIndex(p) { return S.phases.indexOf(p) + 1; }
  function taskStats(list) {
    const tasks = list.flatMap((p) => p.tasks);
    const done = tasks.filter((t) => t.done).length;
    return { done, total: tasks.length, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
  }
  function budgetStats() {
    const items = S.batches.flatMap((b) => b.items);
    const core = items.filter((i) => !i.optional);
    const sum = (arr) => arr.reduce((a, i) => a + i.price, 0);
    return {
      planned: sum(core),
      optional: sum(items.filter((i) => i.optional)),
      arrived: sum(items.filter((i) => i.status === "arrived")),
      ordered: sum(items.filter((i) => i.status === "ordered")),
      needed: sum(core.filter((i) => i.status === "needed")),
      counts: {
        all: items.length,
        needed: items.filter((i) => i.status === "needed").length,
        ordered: items.filter((i) => i.status === "ordered").length,
        arrived: items.filter((i) => i.status === "arrived").length,
      },
    };
  }

  /* ---------- the quad drawing ---------- */
  const PARTS = {
    M1: { name: "Motor 1 (of 4)", code: "Emax ECO II 2207 1900 KV", text: "Brushless motors. Diagonal pairs spin the same way so the drone doesn't twist. The flight code changes each motor's speed hundreds of times a second to stay level." },
    U1: { name: "Flight controller", code: "RP2350 (Pico 2), with LSM6DSOX IMU", text: "The brain, on a board I'm designing, with the motion sensor right in the middle. One core runs the 1 kHz balance loop; the other handles the radio, logging and failsafes." },
    U2: { name: "Motion sensor (IMU)", code: "LSM6DSOX", text: "A gyroscope and accelerometer that measure tilt and rotation. It sits in the middle of the board, away from noisy power parts." },
    ESC1: { name: "Speed controller", code: "4-in-1 ESC, 45 A", text: "Turns the flight controller's signals into the high current that drives the four motors. Bought, because high-current switching is its own project." },
    BT1: { name: "Battery", code: "4S 1300 mAh LiPo", text: "About 15 V. Strapped on top of the frame. Always charged inside a LiPo-safe bag." },
    ANT1: { name: "Radio", code: "nRF24L01+, 2.4 GHz", text: "Two-way link to my laptop: commands go up, live telemetry comes down. If the link drops for half a second, the drone lands itself." },
  };

  function quadSVG({ hot = true, idPrefix = "q" } = {}) {
    const C = 300, A = 150, B = 450, R = 120; // motor centres at (A|B, A|B)
    // Betaflight-style numbering: M1 rear right CW, M2 front right CCW, M3 rear left CCW, M4 front left CW
    const motors = [
      { n: 1, x: B, y: B, dir: "cw" }, { n: 2, x: B, y: A, dir: "ccw" },
      { n: 3, x: A, y: B, dir: "ccw" }, { n: 4, x: A, y: A, dir: "cw" },
    ];
    const blade = `M0 -6 C 30 -12 80 -10 ${R - 6} -3 L ${R - 6} 3 C 80 8 30 10 0 6 Z`;
    const blades = (m) => `<g class="blades ${m.dir}"><g transform="translate(${m.x} ${m.y})">
        ${[0, 120, 240].map((r) => `<path d="${blade}" transform="rotate(${r})" fill="rgba(243,245,239,.12)" stroke="var(--silk)" stroke-width="1.2"/>`).join("")}
      </g></g>`;
    const arm = (m) => {
      const ang = Math.atan2(m.y - C, m.x - C) * 180 / Math.PI;
      const len = Math.hypot(m.x - C, m.y - C);
      return `<rect x="0" y="-17" width="${len}" height="34" rx="17" transform="translate(${C} ${C}) rotate(${ang})" class="silk" stroke-width="2"/>`;
    };
    const arrow = (m) => {
      // small arc outside the disc showing spin direction
      const r = R + 14, cw = m.dir === "cw";
      const base = Math.atan2(m.y - C, m.x - C); // point outward
      const a0 = base - 0.42, a1 = base + 0.42;
      const p = (a) => [m.x + r * Math.cos(a), m.y + r * Math.sin(a)];
      const [x0, y0] = p(cw ? a0 : a1), [x1, y1] = p(cw ? a1 : a0);
      const end = cw ? a1 : a0, t = cw ? 1 : -1;
      const hx = x1 - 9 * Math.cos(end + t * Math.PI / 2) , hy = y1 - 9 * Math.sin(end + t * Math.PI / 2);
      const ox = 5 * Math.cos(end), oy = 5 * Math.sin(end);
      return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 ${cw ? 1 : 0} ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="var(--copper)" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M${(hx + ox).toFixed(1)} ${(hy + oy).toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)} L${(hx - ox).toFixed(1)} ${(hy - oy).toFixed(1)}" fill="none" stroke="var(--copper)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    };
    const motor = (m) => `<circle cx="${m.x}" cy="${m.y}" r="${R}" class="silk" stroke-width="1.3" stroke-dasharray="3 6" opacity=".7"/>
        <circle cx="${m.x}" cy="${m.y}" r="27" fill="var(--mask-deep)" stroke="var(--silk)" stroke-width="2"/>
        <circle cx="${m.x}" cy="${m.y}" r="9" fill="none" stroke="var(--copper)" stroke-width="2.5"/>
        ${[45, 135, 225, 315].map((a) => `<circle cx="${(m.x + 18 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(m.y + 18 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="2.2" fill="var(--silk)"/>`).join("")}
        <text x="${m.x + (m.x > C ? 34 : -34)}" y="${m.y + (m.y > C ? 46 : -36)}" class="des" text-anchor="${m.x > C ? "start" : "end"}">M${m.n}</text>`;
    const hotspot = (key, px, py, lx, ly, anchor, text = key) => hot ? `<g class="hot" tabindex="0" role="button" aria-label="${esc(PARTS[key].name)}" data-part="${key}">
        <line x1="${px}" y1="${py}" x2="${lx}" y2="${ly}" stroke="var(--copper)" stroke-width="1.5"/>
        <circle class="pad" cx="${px}" cy="${py}" r="9"/>
        <circle cx="${lx}" cy="${ly}" r="18" fill="transparent"/>
        <text x="${lx + (anchor === "end" ? -6 : anchor === "start" ? 6 : 0)}" y="${ly + 5}" class="des" text-anchor="${anchor}" style="font-weight:500">${text}</text>
      </g>` : "";

    return `<svg class="quad" viewBox="0 0 600 600" role="img" aria-label="Top-down technical drawing of the quadcopter">
      <defs><clipPath id="${idPrefix}c"><rect width="600" height="600"/></clipPath></defs>
      <g clip-path="url(#${idPrefix}c)">
      ${motors.map(arm).join("")}
      ${motors.map(motor).join("")}
      ${motors.map(blades).join("")}
      ${motors.map(arrow).join("")}
      <!-- body plate -->
      <rect x="236" y="214" width="128" height="172" rx="14" fill="var(--mask)" stroke="var(--silk)" stroke-width="2"/>
      <!-- battery outline (dashed, on top) -->
      <rect x="252" y="232" width="96" height="136" rx="6" class="silk" stroke-width="1.5" stroke-dasharray="6 5" opacity=".8"/>
      <!-- stack: 30.5 mm pattern -->
      <rect x="268" y="268" width="64" height="64" rx="4" fill="var(--mask-deep)" stroke="var(--copper)" stroke-width="2"/>
      ${[[274, 274], [326, 274], [274, 326], [326, 326]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="none" stroke="var(--silk)" stroke-width="1.5"/>`).join("")}
      <rect x="288" y="288" width="24" height="24" fill="none" stroke="var(--silk)" stroke-width="1.5"/>
      <circle cx="291.5" cy="291.5" r="1.6" fill="var(--silk)"/>
      <!-- antenna at the rear -->
      <line x1="300" y1="386" x2="300" y2="430" stroke="var(--silk)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="300" cy="434" r="5" fill="none" stroke="var(--silk)" stroke-width="2"/>
      <!-- front marker -->
      <path d="M288 196 L300 178 L312 196 Z" fill="var(--copper)"/>
      <text x="300" y="168" text-anchor="middle" class="des" style="font-size:13px;opacity:.75">front</text>
      ${hotspot("U1", 300, 300, 410, 300, "start")}
      ${hotspot("BT1", 252, 240, 196, 240, "end")}
      ${hotspot("ESC1", 268, 330, 196, 362, "end")}
      ${hotspot("ANT1", 300, 434, 360, 470, "start")}
      ${hotspot("M1", B + 19, B - 19, 540, 372, "middle", "motor")}
      </g>
    </svg>`;
  }

  function wireQuad(stage) {
    const svg = stage.querySelector("svg");
    let pop = null;
    const close = () => { if (pop) { pop.remove(); pop = null; } svg.querySelectorAll(".hot.on").forEach((h) => h.classList.remove("on")); };
    const open = (g) => {
      close();
      const p = PARTS[g.dataset.part];
      g.classList.add("on");
      pop = document.createElement("div");
      pop.className = "part-pop";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-label", p.name);
      pop.innerHTML = `<button type="button" aria-label="Close">×</button><strong>${esc(p.name)}</strong><span class="mono">${esc(p.code)}</span><p style="margin:.4rem 0 0">${esc(p.text)}</p>`;
      stage.appendChild(pop);
      const pad = g.querySelector(".pad").getBoundingClientRect(), box = stage.getBoundingClientRect();
      let left = pad.left - box.left + 20, top = pad.top - box.top + 20;
      left = Math.min(left, box.width - pop.offsetWidth - 4); left = Math.max(4, left);
      if (top + pop.offsetHeight > box.height) top = pad.top - box.top - pop.offsetHeight - 10;
      pop.style.left = left + "px"; pop.style.top = Math.max(4, top) + "px";
      pop.querySelector("button").addEventListener("click", close);
    };
    svg.querySelectorAll(".hot").forEach((g) => {
      g.addEventListener("click", (e) => { e.stopPropagation(); g.classList.contains("on") ? close() : open(g); });
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(g); } });
    });
    document.addEventListener("click", (e) => { if (pop && !pop.contains(e.target)) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    requestAnimationFrame(() => svg.classList.add("spin"));
  }

  /* ---------- system diagram ---------- */
  function archSVG() {
    const box = (x, y, w, h, title, lines = [], hl = false) => `
      <g>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${hl ? "rgba(199,136,61,.16)" : "var(--mask-deep)"}" stroke="${hl ? "var(--copper)" : "rgba(243,245,239,.55)"}" stroke-width="${hl ? 2.5 : 1.5}"/>
        <text x="${x + 16}" y="${y + 28}" fill="var(--silk)" font-weight="700" font-size="17">${title}</text>
        ${lines.map((l, i) => `<text x="${x + 16}" y="${y + 52 + i * 21}" fill="rgba(243,245,239,.7)" font-size="14.5">${l}</text>`).join("")}
      </g>`;
    const via = (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="var(--mask)" stroke="var(--copper)" stroke-width="2"/>`;
    const tr = (d) => `<path d="${d}" fill="none" stroke="var(--copper)" stroke-width="2.5" stroke-linejoin="round"/>`;
    return `<svg viewBox="0 0 960 650" role="img" aria-label="System diagram: the laptop talks over radio to the custom flight controller board, which drives the ESC and motors" font-family="Archivo, system-ui, sans-serif">
      <text x="20" y="40" fill="rgba(243,245,239,.65)" font-size="15" font-weight="600">On the ground</text>
      ${box(20, 60, 240, 112, "Laptop (Python)", ["Live graphs and controls", "Gamepad with kill button", "Logs and mission upload"])}
      ${tr("M140 172 V230")} ${via(140, 172)} ${via(140, 230)}
      <text x="150" y="206" fill="rgba(243,245,239,.65)" font-size="13.5">USB</text>
      ${box(20, 230, 240, 78, "Ground Pico + radio", ["USB-to-radio bridge"])}
      <text x="20" y="345" fill="rgba(243,245,239,.65)" font-size="14">Two-way 2.4 GHz link:</text>
      <text x="20" y="366" fill="rgba(243,245,239,.65)" font-size="14">commands up, telemetry down</text>
      <path d="M260 268 C 300 268, 290 115, 330 115" fill="none" stroke="var(--silk)" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>

      <rect x="302" y="30" width="638" height="400" rx="10" fill="none" stroke="rgba(243,245,239,.5)" stroke-width="1.5" stroke-dasharray="8 6"/>
      <text x="324" y="60" fill="var(--silk)" font-size="15" font-weight="700">My flight controller PCB</text>

      ${box(330, 80, 270, 72, "Radio", ["nRF24L01+, SPI"])}
      ${box(330, 190, 270, 100, "RP2350 (Pico 2)", ["Core 0: 1 kHz balance loop", "Core 1: radio, logs, failsafes"], true)}
      ${box(330, 330, 270, 76, "Power", ["4S in, 5 V buck, 3.3 V LDO"])}
      ${box(640, 80, 276, 100, "Sensors", ["IMU (gyro + accel), SPI", "Barometer, I2C", "Downward range, I2C"])}
      ${box(640, 205, 276, 72, "microSD logger", ["Every loop, for replays"])}
      ${box(640, 302, 276, 104, "Expansion ports", ["GPS + compass (later)", "Camera power + UART (later)"])}

      ${tr("M465 152 V190")} ${via(465, 152)} ${via(465, 190)}
      ${tr("M465 330 V290")} ${via(465, 330)} ${via(465, 290)}
      ${tr("M640 130 H620 V225 H600")} ${via(640, 130)} ${via(600, 225)}
      ${tr("M600 245 H640")} ${via(640, 245)}
      ${tr("M600 270 H620 V448 H720 V470")} ${via(600, 270)} ${via(720, 470)}
      <text x="732" y="462" fill="rgba(243,245,239,.75)" font-size="13.5">PWM × 4</text>

      ${box(330, 470, 270, 64, "4S 1300 mAh LiPo")}
      ${box(640, 470, 276, 64, "4-in-1 ESC (bought)")}
      ${box(640, 570, 276, 64, "4 motors + 5-inch props")}
      ${tr("M465 470 V406")} ${via(465, 470)} ${via(465, 406)}
      ${tr("M600 502 H640")} ${via(640, 502)}
      ${tr("M778 534 V570")} ${via(778, 534)} ${via(778, 570)}
    </svg>`;
  }

  /* ---------- gantt ---------- */
  function gantt(el, { compact = false } = {}) {
    const start = parse(S.phases.reduce((a, p) => (p.start < a ? p.start : a), S.phases[0].start));
    const end = parse(S.phases.reduce((a, p) => (p.end > a ? p.end : a), S.phases[0].end));
    start.setDate(1);
    const endPad = new Date(end.getFullYear(), end.getMonth() + 1, 1);
    const span = endPad - start;
    const pos = (d) => ((d - start) / span) * 100;
    const months = [];
    for (let d = new Date(start); d < endPad; d.setMonth(d.getMonth() + 1)) months.push(new Date(d));
    const grid = months.map((m) => `<div class="g-grid" style="left:${pos(m)}%"></div>`).join("");
    const t = today();
    const todayLine = t >= start && t <= endPad ? `<div class="g-today" style="left:${pos(t)}%" aria-hidden="true"></div>` : "";
    const rows = S.phases.map((p, i) => {
      const s = parse(p.start), e = parse(p.end);
      e.setDate(e.getDate() + 1);
      const mile = p.milestone ? `<div class="g-mile" style="left:${pos(e)}%" title="${esc(p.milestone)}"></div>` : "";
      return `<div class="gantt-row">
        <a class="g-name" href="roadmap.html#${p.id}">${compact ? "" : `<span class="muted">${i + 1}.</span> `}${esc(p.name)}</a>
        <div class="g-track">${grid}${i === 0 ? todayLine : ""}
          <div class="g-bar ${p.status}" style="left:${pos(s)}%;width:${pos(e) - pos(s)}%" title="${esc(p.name)}: ${fmtDate(p.start, false)} to ${fmtDate(p.end)}"></div>${mile}
        </div></div>`;
    }).join("");
    el.innerHTML = `<div class="g-months"><div></div><div class="g-scale">${months.map((m) => `<span style="left:${pos(m)}%">${MONTHS[m.getMonth()]}${m.getMonth() === 0 ? " ’" + String(m.getFullYear()).slice(2) : ""}</span>`).join("")}</div></div>
      <div class="gantt" role="img" aria-label="Timeline of the build phases">${rows}</div>`;
    // stretch the today line through every row
    const line = el.querySelector(".g-today");
    if (line) { const rowsH = el.querySelector(".gantt").offsetHeight; line.style.bottom = "auto"; line.style.height = rowsH + 4 + "px"; }
  }

  /* ---------- header / footer ---------- */
  const NAV = [
    ["index.html", "Home"], ["roadmap.html", "Roadmap"], ["parts.html", "Parts"], ["updates.html", "Updates"],
    ["how-it-works.html", "How it works"], ["gallery.html", "Gallery"], ["flying-safely.html", "Flying safely"],
  ];
  const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><g fill="none" stroke="var(--silk)" stroke-width="2"><path d="M8 8l16 16M24 8L8 24"/><circle cx="7" cy="7" r="4.5"/><circle cx="25" cy="7" r="4.5"/><circle cx="7" cy="25" r="4.5"/><circle cx="25" cy="25" r="4.5"/></g><rect x="12.5" y="12.5" width="7" height="7" rx="1" fill="var(--copper)"/></svg>`;

  function header() {
    const here = location.pathname.split("/").pop() || "index.html";
    const el = $("#site-header");
    if (!el) return;
    el.outerHTML = `<a class="skip" href="#main">Skip to content</a>
    <header class="site-header"><div class="wrap">
      <a class="brand" href="index.html">${LOGO}<span>${esc(S.config.shortTitle)}</span></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav class="nav" id="nav" aria-label="Main">
        ${NAV.map(([h, l]) => `<a href="${h}"${h === here ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
        <button class="present-toggle" type="button" aria-pressed="false" title="Switch to presenting mode (P)"><span class="switch" aria-hidden="true"></span>Presenting</button>
      </nav>
    </div></header>`;
    const btn = $(".menu-btn"), nav = $("#nav");
    btn.addEventListener("click", () => { const o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
    $(".present-toggle").addEventListener("click", goPresent);
  }
  function goPresent() {
    const t = $(".present-toggle");
    if (t) t.setAttribute("aria-pressed", "true");
    try { sessionStorage.setItem("returnTo", location.pathname.split("/").pop() || "index.html"); } catch (e) {}
    setTimeout(() => (location.href = "present.html"), 180);
  }
  document.addEventListener("keydown", (e) => {
    if (document.body.dataset.page === "present") return;
    if ((e.key === "p" || e.key === "P") && !e.metaKey && !e.ctrlKey && !e.altKey && !/input|textarea|select/i.test(e.target.tagName)) goPresent();
  });

  function footer() {
    const el = $("#site-footer");
    if (!el) return;
    el.outerHTML = `<footer class="site-footer"><div class="wrap">
      <p>${esc(S.config.title)}. Last updated ${fmtDate(S.config.lastUpdated)}.</p>
      <p>${S.config.githubUrl ? `<a href="${esc(S.config.githubUrl)}">Code on GitHub</a> &nbsp; ` : ""}Press <span class="kbd">P</span> for presenting mode</p>
    </div></footer>`;
  }

  const trace = `<svg class="trace" viewBox="0 0 1000 26" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20 H600 L614 6 H1000" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;

  /* ---------- page renderers ---------- */
  const pages = {};

  pages.home = () => {
    const cur = currentPhase(), all = taskStats(S.phases), bud = budgetStats();
    const days = daysBetween(today(), parse(S.config.goalDate));
    $("#quad-stage").innerHTML = quadSVG();
    wireQuad($("#quad-stage"));
    $("#hero-title").textContent = "Building a drone from nothing.";
    $("#hero-lede").textContent = S.config.tagline;
    $("#readout").innerHTML = `
      <div><dt>Current phase</dt><dd>${phaseIndex(cur)}. ${esc(cur.name)}<small>of ${S.phases.length} phases</small></dd></div>
      <div><dt>Milestones done</dt><dd>${all.done} of ${all.total}<small>${all.pct}% of the whole build</small></dd></div>
      <div><dt>Spent so far</dt><dd>${money(bud.arrived + bud.ordered)}<small>of a ${money(S.config.budget)} budget</small></dd></div>
      <div><dt>First 2-minute hover</dt><dd>${days > 0 ? `${days} days` : days === 0 ? "Today" : "Reached"}<small>target ${fmtDate(S.config.goalDate)}</small></dd></div>`;

    $("#goal-head").textContent = S.goal.headline;
    $("#goal-list").innerHTML = S.goal.points.map((g) => `<div><h3>${esc(g.title)}</h3><p>${esc(g.text)}</p></div>`).join("");

    const cs = taskStats([cur]);
    $("#now-panel").innerHTML = `<span class="pill active">Phase ${phaseIndex(cur)} in progress</span>
      <h3 style="margin-top:.8rem">${esc(cur.name)}</h3>
      <p class="muted" style="margin:0">${fmtDate(cur.start, false)} to ${fmtDate(cur.end)}</p>
      <p style="margin:.8rem 0 0">${esc(cur.summary)}</p>
      <div class="meter" aria-label="${cs.done} of ${cs.total} done"><span style="width:${cs.pct}%"></span></div>
      <ul class="checklist">${cur.tasks.map((t) => `<li class="${t.done ? "done" : ""}">${esc(t.text)}</li>`).join("")}</ul>`;
    $("#spec").innerHTML = S.specs.map((s) => `<tr><th scope="row">${esc(s.label)}</th><td>${esc(s.value)}</td></tr>`).join("");
    gantt($("#home-gantt"), { compact: true });
    $("#home-updates").innerHTML = S.updates.slice(0, 2).map((u) => updateHTML(u, true)).join("");
  };

  function updateHTML(u, compact) {
    const ph = S.phases.find((p) => p.id === u.phase);
    const id = "u-" + u.date + "-" + u.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const body = compact ? `<p>${esc(u.body[0])}</p><a href="updates.html#${id}">Read the full update</a>` : u.body.map((p) => `<p>${esc(p)}</p>`).join("");
    return `<article class="update${compact ? " compact" : ""}" id="${id}">
      <time datetime="${u.date}">${fmtDate(u.date)}</time>
      <div>${ph && !compact ? `<a class="tag" href="roadmap.html#${ph.id}">Phase ${phaseIndex(ph)}: ${esc(ph.name)}</a>` : ""}
        <h3>${esc(u.title)}</h3>
        ${u.image && !compact ? `<img src="${esc(u.image)}" alt="${esc(u.imageAlt || u.title)}" loading="lazy">` : ""}
        ${body}
      </div></article>`;
  }

  pages.roadmap = () => {
    gantt($("#gantt"));
    $("#phases").innerHTML = S.phases.map((p, i) => {
      const st = taskStats([p]);
      const label = p.status === "done" ? "Done" : p.status === "active" ? "In progress" : "Planned";
      return `<li class="phase ${p.status}" id="${p.id}">
        <div class="phase-num" aria-hidden="true">${i + 1}</div>
        <div class="phase-body">
          <div class="phase-top"><h3>${esc(p.name)}</h3><span class="pill ${p.status}">${label}</span></div>
          <div class="phase-dates">${fmtDate(p.start, false)} to ${fmtDate(p.end)}${p.milestone ? `, ending with the ${esc(p.milestone)}` : ""}</div>
          <p style="margin:.6rem 0 0">${esc(p.summary)}</p>
          <p class="muted" style="margin:.8rem 0 0;font-size:.92rem">Done when (${st.done} of ${st.total}):</p>
          <ul class="checklist" style="margin-top:.3rem">${p.tasks.map((t) => `<li class="${t.done ? "done" : ""}">${esc(t.text)}</li>`).join("")}</ul>
        </div></li>`;
    }).join("");
  };

  pages.parts = () => {
    const b = budgetStats(), B = S.config.budget;
    const max = Math.max(B, b.planned) * 1.04;
    const w = (n) => (n / max) * 100;
    $("#budget").innerHTML = `
      <div class="budget-figs">
        <div><b>${money(b.arrived + b.ordered)}</b>spent or ordered</div>
        <div><b>${money(b.needed)}</b>still to buy</div>
        <div><b>${money(b.planned)}</b>planned in total</div>
        <div><b>${money(B)}</b>budget</div>
      </div>
      <div class="budget-bar" role="img" aria-label="${money(b.arrived)} arrived, ${money(b.ordered)} ordered, ${money(b.needed)} still needed, against a ${money(B)} budget">
        <span class="b-arrived" style="width:${w(b.arrived)}%"></span><span class="b-ordered" style="width:${w(b.ordered)}%"></span><span class="b-needed" style="width:${w(b.needed)}%"></span>
        <span class="b-limit" style="left:${w(B)}%" title="Budget"></span>
      </div>
      <div class="legend"><span><i style="background:var(--mask)"></i>Arrived</span><span><i style="background:var(--copper)"></i>Ordered</span><span><i style="background:repeating-linear-gradient(135deg, rgba(20,33,27,.3) 0 2px, transparent 2px 5px)"></i>Still to buy</span><span><i style="background:var(--ink);width:2px"></i>Budget limit</span><span>Optional parts (${money(b.optional)}) aren't counted.</span></div>`;

    const chips = [["all", "Everything"], ["needed", "Still to buy"], ["ordered", "Ordered"], ["arrived", "Arrived"]];
    $("#filters").innerHTML = chips.map(([k, l], i) => `<button class="chip" type="button" data-f="${k}" aria-pressed="${i === 0}">${l} (${b.counts[k]})</button>`).join("");

    $("#batches").innerHTML = S.batches.map((bt, i) => {
      const sub = bt.items.reduce((a, it) => a + it.price, 0);
      return `<section class="batch" id="${bt.id}">
        <div class="batch-head"><h3><span class="num">Batch ${i + 1}</span>${esc(bt.name)}</h3><span><span class="when">${esc(bt.when)}</span> &nbsp; <span class="sub">${money(sub)}</span></span></div>
        <p>${esc(bt.about)}</p>
        <table class="parts"><thead><tr><th>Part</th><th>Why</th><th>Where</th><th class="num">Qty</th><th class="num">Approx.</th><th>Status</th></tr></thead><tbody>
        ${bt.items.map((it) => `<tr data-status="${it.status}" class="${it.optional ? "optional" : ""}">
            <td class="p-name">${esc(it.name)}${it.part ? `<span class="mono">${esc(it.part)}</span>` : ""}</td>
            <td class="p-note">${esc(it.note || "")}</td>
            <td class="p-links"><div>${(it.links || []).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("") || '<span class="muted">Shop not picked yet</span>'}</div></td>
            <td class="num p-qty">${it.qty}</td>
            <td class="num p-price">${money(it.price)}</td>
            <td class="p-status"><span class="pill ${it.status}">${it.status[0].toUpperCase() + it.status.slice(1)}</span></td>
          </tr>`).join("")}
        </tbody></table></section>`;
    }).join("");

    $("#filters").addEventListener("click", (e) => {
      const c = e.target.closest(".chip"); if (!c) return;
      document.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === c));
      const f = c.dataset.f;
      document.querySelectorAll(".parts tbody tr").forEach((tr) => (tr.hidden = f !== "all" && tr.dataset.status !== f));
      document.querySelectorAll(".batch").forEach((s) => (s.hidden = ![...s.querySelectorAll("tbody tr")].some((tr) => !tr.hidden)));
    });
    $("#have").innerHTML = S.alreadyHave.map((h) => `<li>${esc(h)}</li>`).join("");
  };

  pages.updates = () => {
    $("#updates").innerHTML = S.updates.map((u) => updateHTML(u, false)).join("");
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  };

  pages.how = () => { $("#arch").innerHTML = archSVG(); };

  pages.gallery = () => {
    const items = S.gallery;
    const photos = items.filter((g) => g.kind !== "drawing").length;
    $("#gallery-note").innerHTML = photos ? "" : `<div class="empty-photos">
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="11" width="38" height="28" rx="3"/><circle cx="24" cy="25" r="7"/><path d="M16 11l3-5h10l3 5"/></svg>
      <p><b>Photos start when the parts arrive.</b> Until then, here are the drawings I'm working from.</p></div>`;
    $("#gallery").innerHTML = items.map((g, i) => `<figure class="g-item">
      <button type="button" data-i="${i}" aria-label="Open image: ${esc(g.caption)}"><img src="${esc(g.src)}" alt="${esc(g.alt || g.caption)}" loading="lazy"></button>
      <figcaption>${g.date ? `<b>${fmtDate(g.date)}.</b> ` : g.kind === "drawing" ? "<b>Drawing.</b> " : ""}${esc(g.caption)}</figcaption></figure>`).join("");
    const lb = $("#lightbox"), img = $("#lb-img"), cap = $("#lb-cap");
    let idx = 0, lastFocus = null;
    const show = (i) => { idx = (i + items.length) % items.length; img.src = items[idx].src; img.alt = items[idx].alt || items[idx].caption; cap.textContent = items[idx].caption; };
    const open = (i) => { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lb-close").focus(); };
    const close = () => { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
    $("#gallery").addEventListener("click", (e) => { const b = e.target.closest("button[data-i]"); if (b) open(+b.dataset.i); });
    $("#lb-close").addEventListener("click", close);
    $("#lb-prev").addEventListener("click", () => show(idx - 1));
    $("#lb-next").addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-stage")) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(idx - 1); else if (e.key === "ArrowRight") show(idx + 1);
    });
  };

  /* ---------- boot ---------- */
  window.DRONE = { S, quadSVG, archSVG, gantt, fmtDate, money, parse, today, daysBetween, currentPhase, phaseIndex, taskStats, budgetStats, MONTHS, esc };

  document.addEventListener("DOMContentLoaded", () => {
    header(); footer();
    document.querySelectorAll("[data-trace]").forEach((el) => (el.innerHTML = trace));
    const p = document.body.dataset.page;
    if (pages[p]) pages[p]();
    document.title = (document.title ? document.title + " | " : "") + S.config.title;
  });
})();
