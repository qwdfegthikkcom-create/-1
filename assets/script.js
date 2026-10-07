(() => {
  const WHATSAPP = "9647737999944";

  /* ---------- Gallery content ----------
     The "من أعمالنا" section stays hidden until at least one item is added.
     INSTAGRAM_POSTS: post links copied from the clinic's Instagram (Share → Copy link),
       e.g. "https://www.instagram.com/p/XXXXXXXX/". Shown with Instagram's official embed.
     GALLERY_IMAGES: photos supplied by the clinic, placed in assets/gallery/,
       e.g. { src: "assets/gallery/case-1.jpg", alt: "ابتسامة هوليود – زركون" }. */
  const INSTAGRAM_POSTS = [];
  const GALLERY_IMAGES = [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Sticky nav shadow ---------- */
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  const setMenu = (open) => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
  };
  toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  $$("a", links).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 6) * 70}ms`;
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Count-up stats ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counters = $$("[data-count]");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased).toLocaleString("en-US") + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- Service cards → preselect service in form ---------- */
  const serviceSelect = $("#fService");
  $$(".svc").forEach((card) => {
    $(".svc__link", card).addEventListener("click", () => {
      const wanted = card.dataset.service;
      const opt = [...serviceSelect.options].find((o) => o.text === wanted);
      if (opt) serviceSelect.value = opt.value;
    });
  });

  /* ---------- Before / After illustration ---------- */
  function smileSVG(variant) {
    const after = variant === "after";
    const id = variant;
    const ns = (d) => ((d / 120) ** 2);
    // deterministic jitter for the "before" smile
    const jitter = [0.6, -0.8, 0.3, -0.5, 0.9, -0.2, 0.7, -0.6, 0.4, -0.9, 0.2, 0.5];
    const upperW = [30, 24, 22, 20, 18, 16];
    const lowerW = [17, 17, 19, 20, 19, 17];

    const row = (widths, isUpper) => {
      let out = "";
      [1, -1].forEach((side) => {
        let x = 200 + (side === 1 ? (after ? 0.8 : 2) : -(after ? 0.8 : 2));
        widths.forEach((w, i) => {
          const gap = after ? 1.6 : 2.4 + (i === 1 ? 1.5 : 0);
          const cx = x + side * (w / 2);
          const d = Math.abs(cx - 200);
          let top, bottom;
          if (isUpper) {
            top = 92 + ns(d) * 6;
            bottom = 140 - ns(d) * 22 + (i === 2 ? 3 : 0);
          } else {
            top = 141 - ns(d) * 18;
            bottom = 178;
          }
          const j = jitter[(i + (side === 1 ? 0 : 6)) % jitter.length];
          const rot = after ? 0 : j * 5;
          const dy = after ? 0 : j * 3;
          const fill = after
            ? `url(#t-${id})`
            : (i === 2 && side === -1) || (i === 4 && side === 1) ? `url(#ts-${id})` : `url(#t-${id})`;
          out += `<rect x="${(cx - w / 2).toFixed(1)}" y="${(top + dy).toFixed(1)}" width="${w}" height="${(bottom - top).toFixed(1)}" rx="${isUpper ? 6 : 5}" fill="${fill}" stroke="${after ? "#dfe7e6" : "#c7ae73"}" stroke-width="0.8" transform="rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${((top + bottom) / 2).toFixed(1)})"/>`;
          if (after && isUpper && i < 3) {
            out += `<path d="M${(cx - w / 4).toFixed(1)} ${(top + 10).toFixed(1)} q2 -3 ${(w / 3).toFixed(1)} -3" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".9"/>`;
          }
          x += side * (w + gap);
        });
      });
      return out;
    };

    const mouth = "M84 112 C130 92 170 88 200 92 C230 88 270 92 316 112 C280 150 240 168 200 168 C160 168 120 150 84 112 Z";
    const lips = "M70 112 C110 70 160 62 200 76 C240 62 290 70 330 112 C290 175 240 192 200 192 C160 192 110 175 70 112 Z";

    return `
<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${after ? "ابتسامة بعد العلاج" : "ابتسامة قبل العلاج"}">
  <defs>
    <linearGradient id="t-${id}" x1="0" y1="0" x2="0" y2="1">
      ${after
        ? '<stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef4f3"/>'
        : '<stop offset="0" stop-color="#efe0b4"/><stop offset="1" stop-color="#d8bf82"/>'}
    </linearGradient>
    <linearGradient id="ts-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9c08a"/><stop offset="1" stop-color="#b89a5a"/>
    </linearGradient>
    <linearGradient id="lip-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9777a"/><stop offset="1" stop-color="#a95a60"/>
    </linearGradient>
    <clipPath id="m-${id}"><path d="${mouth}"/></clipPath>
  </defs>
  <ellipse cx="200" cy="200" rx="150" ry="12" fill="#0b2530" opacity=".06"/>
  <path d="${lips}" fill="url(#lip-${id})"/>
  <path d="M110 92 C150 74 180 74 200 82" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="${mouth}" fill="#4a1c25"/>
  <g clip-path="url(#m-${id})">
    <rect x="80" y="84" width="240" height="22" fill="#d9878c"/>
    <rect x="80" y="160" width="240" height="20" fill="#c9767c"/>
    ${row(lowerW, false)}
    ${row(upperW, true)}
  </g>
  <path d="${mouth}" fill="none" stroke="#8e4249" stroke-width="2"/>
</svg>`;
  }

  const ba = $("#ba");
  if (ba) {
    $("#baBefore").innerHTML = smileSVG("before");
    $("#baAfter").innerHTML = smileSVG("after");
    const range = $("#baRange");
    const update = () => ba.style.setProperty("--pos", `${range.value}%`);
    range.addEventListener("input", update);
    update();
  }

  /* ---------- Gallery ---------- */
  const gallery = $("#gallery");
  const grid = $("#galleryGrid");
  const posts = INSTAGRAM_POSTS
    .map((u) => String(u).trim().match(/^https:\/\/(?:www\.)?instagram\.com\/(p|reel)\/([\w-]+)/))
    .filter(Boolean)
    .map(([, kind, code]) => `https://www.instagram.com/${kind}/${code}/`);

  if (posts.length || GALLERY_IMAGES.length) {
    GALLERY_IMAGES.forEach(({ src, alt = "" }) => {
      const fig = document.createElement("figure");
      fig.className = "gallery__item";
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      img.loading = "lazy";
      fig.append(img);
      if (alt) {
        const cap = document.createElement("figcaption");
        cap.textContent = alt;
        fig.append(cap);
      }
      grid.append(fig);
    });
    posts.forEach((url) => {
      const q = document.createElement("blockquote");
      q.className = "instagram-media";
      q.dataset.instgrmPermalink = url;
      q.dataset.instgrmVersion = "14";
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "عرض المنشور على إنستغرام";
      q.append(a);
      grid.append(q);
    });
    gallery.hidden = false;
    if (posts.length) {
      const s = document.createElement("script");
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      document.body.append(s);
    }
  }

  /* ---------- Booking form → WhatsApp ---------- */
  const form = $("#bookForm");
  const err = $("#formError");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const digits = phone.replace(/\D/g, "");

    $$(".field", form).forEach((f) => f.classList.remove("is-invalid"));
    if (name.length < 2) {
      $("#fName").closest(".field").classList.add("is-invalid");
      err.textContent = "يرجى كتابة الاسم.";
      $("#fName").focus();
      return;
    }
    if (digits.length < 10) {
      $("#fPhone").closest(".field").classList.add("is-invalid");
      err.textContent = "يرجى كتابة رقم هاتف صحيح.";
      $("#fPhone").focus();
      return;
    }
    err.textContent = "";

    const note = String(data.get("note") || "").trim();
    const lines = [
      "مرحبًا مركز البصرة لطب وتجميل الأسنان 👋",
      "أرغب بحجز موعد:",
      `• الاسم: ${name}`,
      `• الهاتف: ${phone}`,
      `• الخدمة: ${data.get("service")}`,
      `• الوقت المفضّل: ${data.get("time")}`,
    ];
    if (note) lines.push(`• ملاحظات: ${note}`);
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
