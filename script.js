const menuToggle = document.getElementById("menu-toggle");
const siteNav = document.getElementById("site-nav");

menuToggle?.addEventListener("click", () => {
  siteNav?.classList.toggle("open");
});

(function initNavDropdowns() {
  const dropdowns = document.querySelectorAll(".nav-dropdown");
  if (!dropdowns.length) return;

  /** Ignore stray scroll/mouseleave right after open (layout / sticky header can fire scroll once). */
  const OPEN_GUARD_MS = 320;
  let openGuardUntil = 0;

  function armOpenGuard() {
    openGuardUntil = Date.now() + OPEN_GUARD_MS;
  }

  function setExpanded(dd, expanded) {
    dd.querySelector(".nav-dropbtn")?.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function closeAll() {
    dropdowns.forEach((dd) => {
      dd.classList.remove("is-open");
      setExpanded(dd, false);
    });
  }

  dropdowns.forEach((dd) => {
    const btn = dd.querySelector(".nav-dropbtn");
    const menu = dd.querySelector(".nav-dropdown-menu");
    if (!btn || !menu) return;

    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (!dd.classList.contains("is-open")) armOpenGuard();
    });

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const opening = !dd.classList.contains("is-open");
      closeAll();
      if (opening) {
        dd.classList.add("is-open");
        setExpanded(dd, true);
        armOpenGuard();
      }
    });

    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        dd.classList.remove("is-open");
        setExpanded(dd, false);
        siteNav?.classList.remove("open");
      });
    });

    dd.addEventListener("mouseleave", () => {
      if (Date.now() < openGuardUntil) return;
      if (!dd.classList.contains("is-open")) return;
      dd.classList.remove("is-open");
      setExpanded(dd, false);
      /* Clicks leave focus inside the nav; :focus-within would keep the menu open until blur */
      const active = document.activeElement;
      if (active && typeof active.blur === "function" && dd.contains(active)) active.blur();
    });
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".nav-dropdown")) return;
    closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  window.addEventListener(
    "scroll",
    () => {
      if (Date.now() < openGuardUntil) return;
      closeAll();
    },
    { passive: true }
  );
})();

const CART_STORAGE_KEY = "nrocks_cart_v1";
const BOOKING_STORAGE_KEY = "nrocks_booking_slots_v1";
const PROMO_CODE_STORAGE_KEY = "nrocks_checkout_promo_code_v1";

const ACTIVITIES = [
  {
    key: "full-moon",
    name: "Via Ferrata Full Moon Tour",
    bookingCategory: "climbing",
    pricePerPerson: 139,
    image: "https://nrocks.com/wp-content/uploads/2024/03/Screenshot-2024-03-13-at-12.44.04-PM.jpeg",
    duration: "3.5-5 hours",
    description:
      "A special evening Via Ferrata climb under moonlight with guides, fixed-anchor routes, and dramatic nighttime views.",
    expect: [
      "Professional guides throughout your climb",
      "Moonlit route segments and suspension features",
      "A unique nighttime version of the signature climb"
    ],
    bring: [
      "Closed-toe shoes with good traction",
      "A refillable water bottle",
      "Warm layers for cooler evening temps"
    ],
    timeSlots: ["7:00 PM", "8:30 PM"],
    slotCapacity: 12
  },
  {
    key: "via-ferrata",
    name: "Via Ferrata",
    bookingCategory: "climbing",
    pricePerPerson: 129,
    image: "https://nrocks.com/wp-content/uploads/2023/12/via-ferrata-1.jpg",
    duration: "3.5-5 hours",
    description:
      "A guided route combining hiking, climbing, and dramatic rock exposure across fixed-anchor iron paths and suspension features.",
    expect: [
      "Professional guides throughout your climb",
      "Exposed rock sections and stunning valley views",
      "A memorable climb you’ll talk about for months"
    ],
    bring: [
      "Closed-toe shoes with good traction",
      "A refillable water bottle",
      "Weather-appropriate clothing (layer up!)"
    ],
    timeSlots: ["9:00 AM", "1:30 PM", "4:00 PM"],
    slotCapacity: 12
  },
  {
    key: "zip-line",
    name: "Zip Line Canopy Tour",
    bookingCategory: "zip",
    pricePerPerson: 89,
    image: "https://nrocks.com/wp-content/uploads/2024/03/canopy-tour-1.jpg",
    duration: "2-3 hours",
    description:
      "Fly above the trees on guided zip lines and scenic elevated platforms. Our guides handle setup and safety checks.",
    expect: ["Guided zip lines and platforms", "Safety checks before every line", "Scenic views overhead"],
    bring: ["Comfortable clothes", "Closed-toe shoes", "A positive attitude"],
    timeSlots: ["10:00 AM", "12:30 PM", "3:00 PM"],
    slotCapacity: 20
  },
  {
    key: "top-ropes",
    name: "Top Ropes Climbing",
    bookingCategory: "climbing",
    pricePerPerson: 69,
    image: "https://nrocks.com/wp-content/uploads/2024/03/smiley-dude-1024x642-1.jpg",
    duration: "2-4 hours",
    description:
      "Learn climbing fundamentals and enjoy guided routes on prepared top-rope lines, with belay support from our team.",
    expect: ["Routes selected for your group", "Belay support throughout", "Skill-building guidance"],
    bring: ["Closed-toe shoes", "Water bottle", "Light layers for comfort"],
    timeSlots: ["9:30 AM", "12:00 PM", "2:30 PM"],
    slotCapacity: 18
  }
];

const LODGING_OPTIONS = [
  { key: "camping-tent", name: "Camping Tent", pricePerNight: 45 },
  { key: "cabin-rental", name: "Cabin Rental", pricePerNight: 135 },
  { key: "yellow-house-inn", name: "Yellow House Inn", pricePerNight: 185 },
  { key: "guest-room", name: "Guest Room", pricePerNight: 99 }
];

const activityCatalogEl = document.getElementById("activity-catalog");
const activityDetailsEl = document.getElementById("activity-details");
const calendarTitleEl = document.getElementById("calendar-title");
const calendarGridEl = document.getElementById("calendar-grid");
const timesPanelEl = document.getElementById("times-panel");
const timesHeadingEl = document.getElementById("times-heading");
const timesSubtitleEl = document.getElementById("times-subtitle");
const partySizeEl = document.getElementById("party-size");
const timesListEl = document.getElementById("times-list");
const bookingStatusEl = document.getElementById("booking-status");
const calPrevBtn = document.getElementById("cal-prev");
const calNextBtn = document.getElementById("cal-next");
const programCountEl = document.getElementById("program-count");
const programSortEl = document.getElementById("program-sort");
const bookingFilterResetBtn = document.getElementById("booking-filter-reset");
const bookingFilterApplyBtn = document.getElementById("booking-filter-apply");
const scheduleActivityLabelEl = document.getElementById("schedule-activity-label");
const cartLinesEl = document.getElementById("cart-lines");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartCheckoutBtn = document.getElementById("cart-checkout-btn");
const cartCodeWrapEl = document.getElementById("cart-code-wrap");

let bookings = [];
let cart = [];
let selectedActivityKey = "via-ferrata";
let selectedDateStr = null;
let viewDate = new Date();
viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
let cartPromoMessage = "";
let cartPromoMessageType = "";
let cartPromoInputVisible = false;

const readBookings = () => {
  try {
    return JSON.parse(localStorage.getItem(BOOKING_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveBookings = (next) => {
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(next));
};

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveCart = (next) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
};

const readPromoCode = () => {
  try {
    return String(localStorage.getItem(PROMO_CODE_STORAGE_KEY) || "").trim().toUpperCase();
  } catch {
    return "";
  }
};

const savePromoCode = (code) => {
  const next = String(code || "").trim().toUpperCase();
  localStorage.setItem(PROMO_CODE_STORAGE_KEY, next);
};

const newLineId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const phoneDigits = (raw) => String(raw || "").replace(/\D/g, "");

const isValidEmailString = (raw) => {
  const v = String(raw || "").trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

const isValidBookingPhone = (raw) => {
  const d = phoneDigits(raw);
  return d.length >= 10 && d.length <= 15;
};

const formatDateKey = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseDateKey = (key) => {
  const [y, m, d] = key.split("-").map((x) => Number(x));
  return new Date(y, m - 1, d);
};

const formatNiceDate = (dateKey) => {
  const d = parseDateKey(dateKey);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const activityByKey = (key) =>
  ACTIVITIES.find((a) => a.key === key) || ACTIVITIES.find((a) => a.key === "via-ferrata") || ACTIVITIES[0];

const lodgingByKey = (key) => LODGING_OPTIONS.find((l) => l.key === key) || null;
const lodgingByName = (name) => LODGING_OPTIONS.find((l) => l.name === name) || null;

const toDateOnly = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const nightsBetween = (checkin, checkout) => {
  const start = toDateOnly(checkin);
  const end = toDateOnly(checkout);
  if (!start || !end) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / 86400000));
};

const lineType = (line) => (line?.type === "lodging" ? "lodging" : "activity");

const resolveRequestedActivity = (requested) => {
  if (!requested) return "";
  const r = String(requested).toLowerCase();
  // If we were passed the canonical key (e.g. `full-moon`) use it directly.
  if (["full-moon", "via-ferrata", "zip-line", "top-ropes"].includes(r)) {
    return r;
  }
  if ((r.includes("full") && r.includes("moon")) || r.includes("moon tour")) return "full-moon";
  if (r.includes("via") || r.includes("ferrata")) return "via-ferrata";
  if (r.includes("zip") || r.includes("canopy")) return "zip-line";
  if (r.includes("top ropes") || r.includes("ropes")) return "top-ropes";
  return "";
};

const getSlotCapacity = (activityKey) => {
  const a = activityByKey(activityKey);
  return a.slotCapacity;
};

const getBookedPartySize = (activityKey, dateStr, time) => {
  return bookings
    .filter((b) => b.activityKey === activityKey && b.date === dateStr && b.time === time)
    .reduce((sum, b) => sum + Number(b.partySize || 0), 0);
};

const getCartPartyForSlot = (activityKey, dateStr, time) => {
  return cart
    .filter((c) => c.activityKey === activityKey && c.date === dateStr && c.time === time)
    .reduce((sum, c) => sum + Number(c.partySize || 0), 0);
};

const getRemaining = (activityKey, dateStr, time) => {
  const capacity = getSlotCapacity(activityKey);
  const booked = getBookedPartySize(activityKey, dateStr, time);
  const inCart = getCartPartyForSlot(activityKey, dateStr, time);
  return Math.max(0, capacity - booked - inCart);
};

const anyRemainingForDate = (activityKey, dateStr) => {
  const a = activityByKey(activityKey);
  return a.timeSlots.some((t) => getRemaining(activityKey, dateStr, t) > 0);
};

const linePrice = (line) => {
  if (lineType(line) === "lodging") {
    const nights = Number(line.nights || nightsBetween(line.checkin, line.checkout) || 0);
    const nightlyRate = Number(line.unitPrice || 0);
    return nights * nightlyRate;
  }
  const a = activityByKey(line.activityKey);
  return Number(line.partySize || 0) * Number(a.pricePerPerson || 0);
};

const cartSubtotal = () => cart.reduce((sum, line) => sum + linePrice(line), 0);

const resolvePromo = (subtotal, rawCode) => {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return { code: "", amount: 0, label: "" };

  const pctByCode = {
    NROCKS10: 10,
    SAVE10: 10,
    NROCKS15: 15
  };
  const pct = pctByCode[code];
  if (!pct) return { code, amount: 0, label: "" };

  const amount = Math.round((subtotal * (pct / 100)) * 100) / 100;
  return { code, amount, label: `${pct}% off (${code})` };
};

const updateScheduleHeading = () => {
  if (!scheduleActivityLabelEl) return;
  const a = activityByKey(selectedActivityKey);
  scheduleActivityLabelEl.textContent = `Scheduling: ${a.name} · $${a.pricePerPerson} per person`;
};

const renderCart = () => {
  if (!cartLinesEl || !cartSubtotalEl) return;
  if (!cart.length) {
    cartLinesEl.innerHTML = `<p class="cart-empty muted-help">No times added yet. Pick a date and add a slot to your cart.</p>`;
  } else {
    cartLinesEl.innerHTML = "";
    cart.forEach((line) => {
      const isLodging = lineType(line) === "lodging";
      const row = document.createElement("div");
      row.className = "cart-line";
      if (isLodging) {
        row.innerHTML = `
        <div class="cart-line-main">
          <strong>${line.lodgingName || "Lodging"}</strong>
          <div class="cart-line-meta">${formatNiceDate(line.checkin)} → ${formatNiceDate(line.checkout)} · ${line.nights} night(s) · ${line.guests} guest(s)</div>
        </div>
        <div class="cart-line-actions">
          <span class="cart-line-price">$${linePrice(line).toFixed(2)}</span>
          <button type="button" class="btn btn-small btn-muted cart-remove" data-line-id="${line.id}">Remove</button>
        </div>
      `;
      } else {
        const a = activityByKey(line.activityKey);
        row.innerHTML = `
        <div class="cart-line-main">
          <strong>${a.name}</strong>
          <div class="cart-line-meta">${formatNiceDate(line.date)} · ${line.time} · Party of ${line.partySize}</div>
        </div>
        <div class="cart-line-actions">
          <span class="cart-line-price">$${linePrice(line)}</span>
          <button type="button" class="btn btn-small btn-muted cart-remove" data-line-id="${line.id}">Remove</button>
        </div>
      `;
      }
      cartLinesEl.appendChild(row);
    });
    cartLinesEl.querySelectorAll(".cart-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-line-id");
        cart = cart.filter((c) => c.id !== id);
        saveCart(cart);
        renderCart();
        renderCalendar();
        if (selectedDateStr) renderTimesForDate(selectedDateStr);
      });
    });
  }
  const subtotal = cartSubtotal();
  const promo = resolvePromo(subtotal, readPromoCode());
  const totalWithPromo = Math.max(0, subtotal - promo.amount);
  cartSubtotalEl.textContent = `$${totalWithPromo.toFixed(2)}`;

  if (cartCodeWrapEl) {
    cartCodeWrapEl.innerHTML = `
      <button id="cart-code-toggle" type="button" class="checkout-code-toggle">Have a code?</button>
      <div id="cart-code-panel" class="checkout-code-panel" ${cartPromoInputVisible ? "" : "hidden"}>
        <div class="checkout-code-row">
          <input
            id="cart-code-input"
            type="text"
            value="${readPromoCode()}"
            placeholder="Enter discount code"
            autocomplete="off"
          />
          <button id="cart-code-apply" type="button" class="btn btn-small">Apply</button>
        </div>
        <p class="checkout-code-message ${cartPromoMessageType}">${cartPromoMessage}</p>
      </div>
    `;

    const cartCodeToggleBtn = document.getElementById("cart-code-toggle");
    const cartCodeApplyBtn = document.getElementById("cart-code-apply");
    const cartCodeInputEl = document.getElementById("cart-code-input");

    cartCodeToggleBtn?.addEventListener("click", () => {
      cartPromoInputVisible = !cartPromoInputVisible;
      renderCart();
    });

    cartCodeApplyBtn?.addEventListener("click", () => {
      const entered = String(cartCodeInputEl?.value || "").trim().toUpperCase();
      if (!entered) {
        savePromoCode("");
        cartPromoMessage = "Enter a code to apply a discount.";
        cartPromoMessageType = "err";
        cartPromoInputVisible = true;
        renderCart();
        return;
      }

      const nextPromo = resolvePromo(subtotal, entered);
      if (nextPromo.amount > 0) {
        savePromoCode(nextPromo.code);
        cartPromoMessage = `Code ${nextPromo.code} applied.`;
        cartPromoMessageType = "ok";
      } else {
        savePromoCode("");
        cartPromoMessage = "That code is not valid for this booking.";
        cartPromoMessageType = "err";
      }
      cartPromoInputVisible = true;
      renderCart();
    });
  }

  if (cartCheckoutBtn) {
    if (cart.length === 0) {
      cartCheckoutBtn.classList.add("is-disabled");
      cartCheckoutBtn.setAttribute("aria-disabled", "true");
    } else {
      cartCheckoutBtn.classList.remove("is-disabled");
      cartCheckoutBtn.removeAttribute("aria-disabled");
    }
  }
};

const activityHref = (a) =>
  `booking-schedule.html?activity=${encodeURIComponent(a.key)}`;

const getBookingClassificationFilter = () => {
  const el = document.querySelector('input[name="booking-classification"]:checked');
  const v = el?.value || "all";
  if (v === "climbing" || v === "zip" || v === "youth" || v === "all") return v;
  return "all";
};

const filterActivitiesForBookingPage = () => {
  const classification = getBookingClassificationFilter();
  if (classification === "all") return [...ACTIVITIES];
  return ACTIVITIES.filter((a) => a.bookingCategory === classification);
};

const sortActivitiesList = (list) => {
  const mode = programSortEl?.value || "default";
  if (mode === "name") {
    return [...list].sort((x, y) => x.name.localeCompare(y.name));
  }
  const order = ["via-ferrata", "full-moon", "zip-line", "top-ropes"];
  return [...list].sort((x, y) => order.indexOf(x.key) - order.indexOf(y.key));
};

const renderActivityCatalog = () => {
  if (!activityCatalogEl) return;
  activityCatalogEl.innerHTML = "";

  const useProgramLayout = document.body.classList.contains("booking-programs-page");
  const source = useProgramLayout ? filterActivitiesForBookingPage() : [...ACTIVITIES];
  const list = sortActivitiesList(source);

  if (programCountEl) {
    const noun = list.length === 1 ? "program" : "programs";
    programCountEl.textContent = `Showing ${list.length} ${noun}`;
  }

  list.forEach((a) => {
    const href = activityHref(a);
    const card = document.createElement("a");
    card.href = href;
    card.setAttribute("role", "listitem");

    if (useProgramLayout) {
      card.className = `program-card program-card-rich${a.key === selectedActivityKey ? " active" : ""}`;
      card.innerHTML = `
        <img class="program-thumb" src="${a.image}" alt="" />
        <div class="program-card-body">
          <strong>${a.name}</strong>
          <div class="program-meta">${a.duration} · $${a.pricePerPerson}/person</div>
        </div>
        <span class="program-chevron" aria-hidden="true">›</span>
      `;
    } else {
      card.className = `activity-catalog-card${a.key === selectedActivityKey ? " active" : ""}`;
      card.innerHTML = `
        <img class="thumb" src="${a.image}" alt="${a.name}" />
        <div class="card-title">${a.name}</div>
      `;
    }
    activityCatalogEl.appendChild(card);
  });
};

const wireBookingPageFilters = () => {
  if (!document.body.classList.contains("booking-programs-page")) return;

  const refresh = () => renderActivityCatalog();

  bookingFilterResetBtn?.addEventListener("click", () => {
    document.querySelectorAll('input[name="booking-classification"]').forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = input.value === "all";
      }
    });
    if (programSortEl) programSortEl.value = "default";
    refresh();
  });

  bookingFilterApplyBtn?.addEventListener("click", refresh);

  document.querySelectorAll('input[name="booking-classification"]').forEach((input) => {
    input.addEventListener("change", refresh);
  });

  programSortEl?.addEventListener("change", refresh);
};

const renderActivityDetails = () => {
  if (!activityDetailsEl) return;
  const a = activityByKey(selectedActivityKey);

  const bringItems = a.bring.map((x) => `<li>${x}</li>`).join("");
  const expectItems = a.expect.map((x) => `<li>${x}</li>`).join("");

  activityDetailsEl.innerHTML = `
    <h3>${a.name}</h3>
    <p>${a.description}</p>
    <div><strong>Duration:</strong> ${a.duration}</div>
    <div style="margin-top:0.9rem;">
      <strong>What to expect</strong>
      <ul>${expectItems}</ul>
      <strong>What to bring</strong>
      <ul>${bringItems}</ul>
    </div>
    <p class="muted-help" style="margin:0;">
      Tip: choose a date below to see all available time slots and remaining spots.
    </p>
  `;
};

const renderTimesForDate = (dateStr) => {
  if (!timesPanelEl || !timesListEl) return;
  const a = activityByKey(selectedActivityKey);

  if (timesHeadingEl) timesHeadingEl.textContent = `Available times`;
  if (timesSubtitleEl) timesSubtitleEl.textContent = `${a.name} on ${formatNiceDate(dateStr)}`;
  timesListEl.innerHTML = "";

  const capacity = getSlotCapacity(selectedActivityKey);

  a.timeSlots.forEach((time) => {
    const remaining = getRemaining(selectedActivityKey, dateStr, time);
    const disabled = remaining <= 0;

    const wrapper = document.createElement("div");
    wrapper.className = "time-slot";
    wrapper.innerHTML = `
      <div class="time-row">
        <div style="font-weight:900;color:#243138;">${time}</div>
        <div class="meta">Capacity: ${capacity}</div>
      </div>
      <div class="spots">Spots left: ${remaining}</div>
      <button class="btn btn-small" type="button" data-time="${time}" ${disabled ? "disabled" : ""}>
        ${disabled ? "Full" : "Add to cart"}
      </button>
    `;
    timesListEl.appendChild(wrapper);
  });

  timesPanelEl.hidden = false;

  timesListEl.querySelectorAll("button[data-time]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const time = btn.getAttribute("data-time");
      const partySize = Number(partySizeEl?.value || "1");
      const remaining = getRemaining(selectedActivityKey, dateStr, time);

      if (partySize < 1) {
        if (bookingStatusEl) {
          bookingStatusEl.textContent = "Party size must be at least 1.";
          bookingStatusEl.className = "booking-status err";
        }
        return;
      }
      if (partySize > remaining) {
        if (bookingStatusEl) {
          bookingStatusEl.textContent = `Only ${remaining} spot(s) left for ${time}. Reduce party size or pick another time.`;
          bookingStatusEl.className = "booking-status err";
        }
        return;
      }

      const dup = cart.some(
        (c) =>
          c.activityKey === selectedActivityKey && c.date === dateStr && c.time === time
      );
      if (dup) {
        if (bookingStatusEl) {
          bookingStatusEl.textContent =
            "That time is already in your cart. Remove it first if you need to change party size.";
          bookingStatusEl.className = "booking-status err";
        }
        return;
      }

      cart.push({
        id: newLineId(),
        activityKey: selectedActivityKey,
        date: dateStr,
        time,
        partySize
      });
      saveCart(cart);

      if (bookingStatusEl) {
        bookingStatusEl.innerHTML = `Added ${partySize} spot(s) at ${time} to your cart. <span class="booking-status-extra"><a class="text-link" href="booking.html">Add another activity</a> or keep choosing times below.</span>`;
        bookingStatusEl.className = "booking-status ok";
      }

      renderCart();
    });
  });
};

const renderCalendar = () => {
  if (!calendarGridEl || !calendarTitleEl) return;
  calendarGridEl.innerHTML = "";

  const monthLabel = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  calendarTitleEl.textContent = monthLabel;

  const today = new Date();
  const rangeStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeStart.getDate() + 60);

  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - startOffset);

  const cells = 42;
  for (let i = 0; i < cells; i += 1) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const inMonth = d.getMonth() === viewDate.getMonth();
    const inRange = d >= rangeStart && d <= rangeEnd;
    const dateStr = formatDateKey(d);

    const disabled = !inMonth || !inRange;
    const dot = !disabled && anyRemainingForDate(selectedActivityKey, dateStr);

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `cal-cell${disabled ? " disabled" : ""}${dateStr === selectedDateStr ? " active" : ""}`;
    cell.dataset.date = dateStr;
    cell.setAttribute("aria-disabled", disabled ? "true" : "false");
    cell.innerHTML = `
      <div class="date-num">${d.getDate()}</div>
      ${dot ? '<div class="avail-dot" aria-hidden="true"></div>' : ""}
    `;

    if (!disabled) {
      cell.addEventListener("click", () => {
        selectedDateStr = dateStr;
        renderCalendar();
        renderTimesForDate(dateStr);
        timesPanelEl?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    calendarGridEl.appendChild(cell);
  }
};

const initBookingFlow = () => {
  bookings = readBookings();
  cart = readCart();

  const requested = new URLSearchParams(window.location.search).get("activity");
  const requestedKey = resolveRequestedActivity(requested);

  if (document.getElementById("calendar-grid") && !requestedKey) {
    window.location.replace("booking.html");
    return;
  }

  let pathKey = "";
  const path = window.location.pathname || "";
  if (path.includes("activity-via-ferrata")) pathKey = "via-ferrata";
  else if (path.includes("activity-zip-line")) pathKey = "zip-line";
  else if (path.includes("activity-top-ropes")) pathKey = "top-ropes";

  selectedActivityKey = requestedKey || pathKey || "via-ferrata";

  renderCart();
  wireBookingPageFilters();

  updateScheduleHeading();
  renderActivityCatalog();
  renderActivityDetails();
  renderCalendar();

  const today = new Date();
  const rangeStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeStart.getDate() + 14);
  if (!selectedDateStr) {
    for (let offset = 0; offset <= 14; offset += 1) {
      const d = new Date(rangeStart);
      d.setDate(rangeStart.getDate() + offset);
      const dateStr = formatDateKey(d);
      if (d <= rangeEnd && anyRemainingForDate(selectedActivityKey, dateStr)) {
        selectedDateStr = dateStr;
        break;
      }
    }
    if (selectedDateStr) {
      renderCalendar();
      renderTimesForDate(selectedDateStr);
    }
  }

  calPrevBtn?.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCalendar();
    if (selectedDateStr) {
      const d = parseDateKey(selectedDateStr);
      if (
        d.getMonth() === viewDate.getMonth() &&
        d.getFullYear() === viewDate.getFullYear()
      ) {
        renderTimesForDate(selectedDateStr);
      }
    }
  });

  calNextBtn?.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
    if (selectedDateStr) {
      const d = parseDateKey(selectedDateStr);
      if (
        d.getMonth() === viewDate.getMonth() &&
        d.getFullYear() === viewDate.getFullYear()
      ) {
        renderTimesForDate(selectedDateStr);
      }
    }
  });

  cartCheckoutBtn?.addEventListener("click", (e) => {
    if (!cart.length) {
      e.preventDefault();
      if (bookingStatusEl) {
        bookingStatusEl.textContent = "Your cart is empty. Add a time before checkout.";
        bookingStatusEl.className = "booking-status err";
      }
    }
  });
};

const initCheckoutPage = () => {
  const form = document.getElementById("checkout-form");
  const summaryEl = document.getElementById("checkout-summary");
  const checkoutStatusEl = document.getElementById("checkout-status");
  if (!form || !summaryEl || !checkoutStatusEl) return;

  cart = readCart();
  bookings = readBookings();

  let checkoutPromoCode = readPromoCode();
  let checkoutPromoMessage = "";
  let checkoutPromoMessageType = "";
  let promoInputVisible = false;

  const renderCheckoutSummary = () => {
    if (!cart.length) {
      summaryEl.innerHTML = `
        <p class="muted-help">Your cart is empty.</p>
        <p><a class="text-link" href="booking.html">Return to choose an activity</a>, then pick your date and time.</p>
      `;
      form.hidden = true;
      return;
    }

    const subtotal = cartSubtotal();
    const promo = resolvePromo(subtotal, checkoutPromoCode);
    const totalDue = Math.max(0, subtotal - promo.amount);

    let html = '<div class="checkout-lines">';
    cart.forEach((line) => {
      if (lineType(line) === "lodging") {
        html += `
        <div class="checkout-line">
          <div>
            <strong>${line.lodgingName || "Lodging"}</strong>
            <div class="muted-help">${formatNiceDate(line.checkin)} → ${formatNiceDate(line.checkout)} · ${line.nights} night(s) · ${line.guests} guest(s) · $${Number(line.unitPrice || 0)}/night</div>
          </div>
          <div class="checkout-line-price">$${linePrice(line).toFixed(2)}</div>
        </div>
      `;
      } else {
        const a = activityByKey(line.activityKey);
        html += `
        <div class="checkout-line">
          <div>
            <strong>${a.name}</strong>
            <div class="muted-help">${formatNiceDate(line.date)} · ${line.time} · ${line.partySize} × $${a.pricePerPerson}</div>
          </div>
          <div class="checkout-line-price">$${linePrice(line)}</div>
        </div>
      `;
      }
    });
    html += "</div>";
    if (promo.amount > 0) {
      html += `
        <p class="checkout-discount-line">
          <strong>Discount</strong>
          <span>-${promo.amount.toFixed(2)} <span class="muted-help">(${promo.label})</span></span>
        </p>
      `;
    }
    html += `<p class="checkout-total"><strong>Total due</strong> <span>$${totalDue.toFixed(2)}</span></p>`;
    html += `
      <div class="checkout-code-wrap">
        <button id="checkout-code-toggle" type="button" class="checkout-code-toggle">Have a code?</button>
        <div id="checkout-code-panel" class="checkout-code-panel" ${promoInputVisible ? "" : "hidden"}>
          <div class="checkout-code-row">
            <input
              id="checkout-code-input"
              type="text"
              value="${checkoutPromoCode}"
              placeholder="Enter discount code"
              autocomplete="off"
            />
            <button id="checkout-code-apply" type="button" class="btn btn-small">Apply</button>
          </div>
          <p class="checkout-code-message ${checkoutPromoMessageType}">${checkoutPromoMessage}</p>
        </div>
      </div>
    `;
    summaryEl.innerHTML = html;
    form.hidden = false;

    const codeToggleBtn = document.getElementById("checkout-code-toggle");
    const codeInputEl = document.getElementById("checkout-code-input");
    const codeApplyBtn = document.getElementById("checkout-code-apply");

    codeToggleBtn?.addEventListener("click", () => {
      promoInputVisible = !promoInputVisible;
      renderCheckoutSummary();
    });

    codeApplyBtn?.addEventListener("click", () => {
      const entered = String(codeInputEl?.value || "").trim().toUpperCase();
      if (!entered) {
        checkoutPromoCode = "";
        checkoutPromoMessage = "Enter a code to apply a discount.";
        checkoutPromoMessageType = "err";
        promoInputVisible = true;
        renderCheckoutSummary();
        return;
      }

      const nextPromo = resolvePromo(subtotal, entered);
      if (nextPromo.amount > 0) {
        checkoutPromoCode = nextPromo.code;
        savePromoCode(nextPromo.code);
        checkoutPromoMessage = `Code ${nextPromo.code} applied.`;
        checkoutPromoMessageType = "ok";
      } else {
        checkoutPromoCode = "";
        savePromoCode("");
        checkoutPromoMessage = "That code is not valid for this booking.";
        checkoutPromoMessageType = "err";
      }
      promoInputVisible = true;
      renderCheckoutSummary();
    });
  };

  renderCheckoutSummary();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    cart = readCart();
    if (!cart.length) {
      checkoutStatusEl.textContent = "Your cart is empty.";
      checkoutStatusEl.className = "booking-status err";
      return;
    }

    const guestName = document.getElementById("checkout-name")?.value?.trim() || "";
    const guestPhone = document.getElementById("checkout-phone")?.value?.trim() || "";
    const guestEmail = document.getElementById("checkout-email")?.value?.trim() || "";
    const marketingOptIn = Boolean(document.getElementById("checkout-marketing")?.checked);
    const cardName = document.getElementById("checkout-card-name")?.value?.trim() || "";
    const cardNumber = document.getElementById("checkout-card-number")?.value?.replace(/\s/g, "") || "";
    const cardExp = document.getElementById("checkout-card-exp")?.value?.trim() || "";
    const cardCvv = document.getElementById("checkout-card-cvv")?.value?.trim() || "";
    const billingZip = document.getElementById("checkout-billing-zip")?.value?.trim() || "";

    if (!guestName) {
      checkoutStatusEl.textContent = "Please enter your full name.";
      checkoutStatusEl.className = "booking-status err";
      return;
    }
    if (!isValidBookingPhone(guestPhone)) {
      checkoutStatusEl.textContent = "Please enter a valid phone number (at least 10 digits).";
      checkoutStatusEl.className = "booking-status err";
      return;
    }
    if (!isValidEmailString(guestEmail)) {
      checkoutStatusEl.textContent = "Please enter a valid email for your confirmation.";
      checkoutStatusEl.className = "booking-status err";
      return;
    }
    if (!cardName) {
      checkoutStatusEl.textContent = "Please enter the name on the card.";
      checkoutStatusEl.className = "booking-status err";
      return;
    }
    if (cardNumber.length < 13 || cardNumber.length > 19 || /\D/.test(cardNumber)) {
      checkoutStatusEl.textContent = "Please enter a valid card number.";
      checkoutStatusEl.className = "booking-status err";
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExp)) {
      checkoutStatusEl.textContent = "Enter expiration as MM/YY.";
      checkoutStatusEl.className = "booking-status err";
      return;
    }
    if (!/^\d{3,4}$/.test(cardCvv)) {
      checkoutStatusEl.textContent = "Enter a valid CVV.";
      checkoutStatusEl.className = "booking-status err";
      return;
    }
    if (!/^\d{5}(-\d{4})?$/.test(billingZip)) {
      checkoutStatusEl.textContent = "Enter a valid billing ZIP code.";
      checkoutStatusEl.className = "booking-status err";
      return;
    }

    const orderId = `ORD-${Date.now()}`;
    const paymentLast4 = cardNumber.slice(-4);
    const createdAt = new Date().toISOString();
    const subtotal = cartSubtotal();
    const promo = resolvePromo(subtotal, checkoutPromoCode);
    const totalPaid = Math.max(0, subtotal - promo.amount);

    cart.forEach((line) => {
      if (lineType(line) === "lodging") {
        bookings.push({
          type: "lodging",
          lodgingKey: line.lodgingKey,
          lodgingName: line.lodgingName,
          checkin: line.checkin,
          checkout: line.checkout,
          nights: line.nights,
          guests: line.guests,
          guestName,
          guestPhone,
          guestEmail,
          marketingOptIn,
          orderId,
          paymentLast4,
          createdAt
        });
        return;
      }
      bookings.push({
        type: "activity",
        activityKey: line.activityKey,
        date: line.date,
        time: line.time,
        partySize: line.partySize,
        guestName,
        guestPhone,
        guestEmail,
        marketingOptIn,
        orderId,
        paymentLast4,
        createdAt
      });
    });

    saveBookings(bookings);
    saveCart([]);
    savePromoCode("");
    cart = [];

    form.hidden = true;
    summaryEl.innerHTML = `
      <div class="checkout-success">
        <h3>Reservation confirmed</h3>
        <p>Order <strong>${orderId}</strong> — total charged: <strong>$${totalPaid.toFixed(2)}</strong> (demo; no real payment processed).</p>
        ${promo.amount > 0 ? `<p class="muted-help">Discount applied: <strong>${promo.label}</strong> (saved $${promo.amount.toFixed(2)}).</p>` : ""}
        <p>A confirmation would be sent to <strong>${guestEmail}</strong>${marketingOptIn ? " — you’ve opted in to promotional emails and surveys." : "."}</p>
        <p class="muted-help">Card ending in ${paymentLast4} · Receipt on file for this demo session only.</p>
        <p><a class="btn" href="booking.html">Book another visit</a></p>
      </div>
    `;
    checkoutStatusEl.textContent = "";
    checkoutStatusEl.className = "booking-status";
  });
};

const initLodgingBookingPage = () => {
  const form = document.getElementById("lodging-booking-form");
  const statusEl = document.getElementById("lodging-booking-status");
  const summaryEl = document.getElementById("lodging-booking-summary");
  const lodgingTypeEl = document.getElementById("lodging-type");
  if (!form || !statusEl || !summaryEl || !lodgingTypeEl) return;

  const requestedType = new URLSearchParams(window.location.search).get("type");
  const requestedMap = {
    "camping-tent": "Camping Tent",
    "cabin-rental": "Cabin Rental",
    "yellow-house-inn": "Yellow House Inn",
    "guest-room": "Guest Room"
  };
  if (requestedType && requestedMap[requestedType]) {
    lodgingTypeEl.value = requestedMap[requestedType];
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const lodgingType = lodgingTypeEl.value?.trim() || "";
    const checkin = document.getElementById("lodging-checkin")?.value?.trim() || "";
    const checkout = document.getElementById("lodging-checkout")?.value?.trim() || "";
    const guests = Number(document.getElementById("lodging-guests")?.value || "0");
    const guestName = document.getElementById("lodging-name")?.value?.trim() || "";
    const guestEmail = document.getElementById("lodging-email")?.value?.trim() || "";
    const guestPhone = document.getElementById("lodging-phone")?.value?.trim() || "";
    const notes = document.getElementById("lodging-notes")?.value?.trim() || "";

    if (!lodgingType) {
      statusEl.textContent = "Please select a lodging type.";
      statusEl.className = "booking-status err";
      return;
    }
    if (!checkin || !checkout) {
      statusEl.textContent = "Please select check-in and check-out dates.";
      statusEl.className = "booking-status err";
      return;
    }
    if (new Date(checkout) <= new Date(checkin)) {
      statusEl.textContent = "Check-out must be after check-in.";
      statusEl.className = "booking-status err";
      return;
    }
    if (!Number.isFinite(guests) || guests < 1) {
      statusEl.textContent = "Please enter at least 1 guest.";
      statusEl.className = "booking-status err";
      return;
    }
    if (!guestName) {
      statusEl.textContent = "Please enter your full name.";
      statusEl.className = "booking-status err";
      return;
    }
    if (!isValidEmailString(guestEmail)) {
      statusEl.textContent = "Please enter a valid email.";
      statusEl.className = "booking-status err";
      return;
    }
    if (!isValidBookingPhone(guestPhone)) {
      statusEl.textContent = "Please enter a valid phone number (at least 10 digits).";
      statusEl.className = "booking-status err";
      return;
    }

    const option = lodgingByName(lodgingType);
    const nights = nightsBetween(checkin, checkout);
    if (!option || nights < 1) {
      statusEl.textContent = "Please select valid lodging dates (minimum 1 night).";
      statusEl.className = "booking-status err";
      return;
    }

    cart = readCart();
    cart.push({
      id: newLineId(),
      type: "lodging",
      lodgingKey: option.key,
      lodgingName: option.name,
      checkin,
      checkout,
      nights,
      guests,
      unitPrice: option.pricePerNight,
      notes,
      contactName: guestName,
      contactEmail: guestEmail,
      contactPhone: guestPhone
    });
    saveCart(cart);

    summaryEl.hidden = false;
    summaryEl.innerHTML = `
      <h3>Added to cart</h3>
      <p>
        <strong>${option.name}</strong> for <strong>${nights}</strong> night(s)
        (${formatNiceDate(checkin)} → ${formatNiceDate(checkout)}) has been added to your cart.
      </p>
      <p><strong>Total for this stay:</strong> $${(nights * option.pricePerNight).toFixed(2)}</p>
      ${notes ? `<p class="muted-help">Notes saved: ${notes}</p>` : ""}
      <p><a class="btn" href="checkout.html">Go to checkout</a></p>
    `;

    statusEl.textContent = "Lodging stay added to cart. Continue to checkout to book.";
    statusEl.className = "booking-status ok";
    form.hidden = true;
  });
};

const initLodgingImageGalleries = () => {
  const path = String(window.location.pathname || "");
  const isLodgingPage = path.includes("lodging-");
  const isActivityPage = path.includes("activity-");
  if (!isLodgingPage && !isActivityPage) return;

  document.querySelectorAll(".activity-main-photo").forEach((img, idx) => {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.closest(".lodging-photo-gallery")) return;

    const images = String(img.getAttribute("data-gallery-images") || img.src || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (!images.length) return;

    let activeIndex = 0;
    const wrapper = document.createElement("div");
    wrapper.className = "lodging-photo-gallery";
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "Lodging photo gallery");
    wrapper.dataset.galleryIndex = String(idx + 1);

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "lodging-gallery-arrow prev";
    prevBtn.setAttribute("aria-label", "Previous photo");
    prevBtn.innerHTML = "&#8249;";

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "lodging-gallery-arrow next";
    nextBtn.setAttribute("aria-label", "Next photo");
    nextBtn.innerHTML = "&#8250;";

    const update = (delta) => {
      activeIndex = (activeIndex + delta + images.length) % images.length;
      img.src = images[activeIndex];
    };

    prevBtn.addEventListener("click", () => update(-1));
    nextBtn.addEventListener("click", () => update(1));

    img.parentNode?.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);
  });
};

const initJustBookedBadges = () => {
  const countsByName = {
    "Via Ferrata": 10,
    "Via Ferrata Full Moon Tour": 6,
    "Zip Line Canopy Tour": 8,
    "Top Ropes Climbing": 7,
    "Camping Tent": 5,
    "Cabin Rental": 4,
    "Yellow House Inn": 3,
    "Guest Room": 9
  };
  const activityLowSpotPool = [
    { name: "Via Ferrata", spots: 4 },
    { name: "Via Ferrata Full Moon Tour", spots: 3 },
    { name: "Zip Line Canopy Tour", spots: 5 },
    { name: "Top Ropes Climbing", spots: 6 }
  ];
  const daySeed = Math.floor(Date.now() / 86400000);
  const firstIdx = daySeed % activityLowSpotPool.length;
  const secondIdx = (daySeed + 2) % activityLowSpotPool.length;
  const lowSpotsByName = {
    [activityLowSpotPool[firstIdx].name]: activityLowSpotPool[firstIdx].spots,
    [activityLowSpotPool[secondIdx].name]: activityLowSpotPool[secondIdx].spots
  };

  const path = String(window.location.pathname || "");
  const isActivityDetail = path.includes("activity-");
  if (isActivityDetail) {
    const heroContainer = document.querySelector(".activity-hero .container");
    const title = heroContainer?.querySelector("h1")?.textContent?.trim() || "";
    if (heroContainer && !heroContainer.querySelector(".just-booked-badge")) {
      const count = countsByName[title] || 10;
      const badge = document.createElement("p");
      badge.className = "just-booked-badge";
      badge.textContent = `${count} people just booked!`;
      heroContainer.appendChild(badge);
    }
    if (heroContainer && lowSpotsByName[title] && !heroContainer.querySelector(".low-spots-badge")) {
      const lowSpots = lowSpotsByName[title];
      const lowBadge = document.createElement("p");
      lowBadge.className = "low-spots-badge";
      lowBadge.textContent = `Low availability: only ${lowSpots} spots remaining`;
      heroContainer.appendChild(lowBadge);
    }
  }

  if (document.body.classList.contains("booking-activities-page")) {
    document.querySelectorAll(".booking-activity-card").forEach((card) => {
      if (card.classList.contains("booking-lodging-card")) return;
      if (card.querySelector(".card-just-booked")) return;
      const title = card.querySelector(".card-title")?.textContent?.trim() || "";
      const count = countsByName[title] || 10;
      const note = document.createElement("p");
      note.className = "card-just-booked";
      note.textContent = `${count} people just booked!`;
      const titleEl = card.querySelector(".card-title");
      if (titleEl) {
        titleEl.insertAdjacentElement("afterend", note);
        const lowSpots = lowSpotsByName[title];
        if (lowSpots && !card.querySelector(".card-low-spots")) {
          const lowNote = document.createElement("p");
          lowNote.className = "card-low-spots";
          lowNote.textContent = `Low spots remaining: ${lowSpots}`;
          note.insertAdjacentElement("afterend", lowNote);
        }
      }
    });
  }
};

const hasBookingUI =
  document.getElementById("activity-catalog") ||
  document.getElementById("calendar-grid") ||
  document.getElementById("checkout-form");

if (document.getElementById("checkout-form")) {
  initCheckoutPage();
} else if (document.getElementById("lodging-booking-form")) {
  initLodgingBookingPage();
} else if (hasBookingUI) {
  initBookingFlow();
}

initLodgingImageGalleries();
initJustBookedBadges();
