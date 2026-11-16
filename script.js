(() => {
  const WEDDING_DATE = new Date("2027-06-12T15:00:00");
  const pad = (n) => String(n).padStart(2, "0");

  const updateCountdown = () => {
    let diff = Math.max(0, WEDDING_DATE - Date.now());
    const days = Math.floor(diff / 86400000);
    diff %= 86400000;
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    diff %= 60000;
    const seconds = Math.floor(diff / 1000);
    const map = { days, hours, minutes, seconds };
    document.querySelectorAll("[data-unit]").forEach((el) => {
      const key = el.dataset.unit;
      el.textContent = key === "days" ? String(days) : pad(map[key]);
    });
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const sections = ["top", "story", "program", "place", "rsvp"];
  const navLinks = document.querySelectorAll(".nav__link");

  const onScroll = () => {
    const y = window.scrollY + 130;
    let current = "top";
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= y) current = id;
    }
    navLinks.forEach((link) => {
      const href = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-active", href === current);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");

  const setNavOpen = (open) => {
    nav?.classList.toggle("is-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  };

  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    setNavOpen(!nav?.classList.contains("is-open"));
  });

  nav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("click", (e) => {
    if (!nav?.classList.contains("is-open")) return;
    if (nav.contains(e.target) || toggle?.contains(e.target)) return;
    setNavOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNavOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) setNavOpen(false);
  });

  const form = document.getElementById("rsvpForm");
  const thanks = document.getElementById("rsvpThanks");
  const guestSelect = document.getElementById("guests");
  const guestCountRow = document.getElementById("guestCountRow");

  const syncAttendance = () => {
    const declined = form?.querySelector('input[name="attend"]:checked')?.value === "no";
    if (guestSelect) {
      guestSelect.disabled = Boolean(declined);
      if (declined) guestSelect.value = "1";
    }
    guestCountRow?.classList.toggle("is-declined", Boolean(declined));
  };

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    form.hidden = true;
    if (thanks) thanks.hidden = false;
  });

  form?.querySelectorAll('input[name="attend"]').forEach((input) => {
    input.addEventListener("change", syncAttendance);
  });
  syncAttendance();

  const mapEl = document.getElementById("placeMap");
  if (mapEl && window.maplibregl) {
    const venue = [25.955834, 53.135015];
    const map = new maplibregl.Map({
      container: mapEl,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: venue,
      zoom: 14.2,
      attributionControl: false,
      scrollZoom: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

    const pin = document.createElement("div");
    pin.className = "place__pin-inner";
    pin.innerHTML = `
      <svg width="42" height="52" viewBox="0 0 42 52" fill="none" aria-hidden="true">
        <path d="M21 50s16-14.2 16-27.2C37 13.2 30 6 21 6S5 13.2 5 22.8C5 35.8 21 50 21 50Z" fill="#6F754F"/>
        <circle cx="21" cy="22" r="9.5" fill="#FFFEF9"/>
        <path d="M21 28.2c-2.4-3.2-4.8-4.5-6.8-3.6-1.5.7-2 2.5-1.2 4.1.6 1.2 2.4 2.3 8 5.5 5.6-3.2 7.4-4.3 8-5.5.8-1.6.3-3.4-1.2-4.1-2-.9-4.4.4-6.8 3.6Z" fill="#6F754F"/>
      </svg>
      <span class="place__pin-label">Дубовая Столовая</span>
    `;

    new maplibregl.Marker({ element: pin, anchor: "bottom" })
      .setLngLat(venue)
      .addTo(map);

    const refreshMap = () => map.resize();
    window.addEventListener("load", refreshMap);
    setTimeout(refreshMap, 200);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) refreshMap();
      }, { threshold: 0.2 }).observe(mapEl);
    }
  }
})();
