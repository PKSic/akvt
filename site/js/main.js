/* АКВТ — интерактив и анимации (фьюжн-дизайн) */
(function () {
  "use strict";

  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------- Sticky header state */
  var header = document.querySelector(".hp-header");
  var burger = null;
  var mobileNav = null;
  var hpHeaderEl = null;
  var lastY = 0;

  function onScroll() {
    var y = window.scrollY;
    if (header) {
      if (y > 24) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    if (y > 600 && lastY - y > 6) {
      document.body.classList.add("nav-hidden");
    } else if (lastY - y < -6 || y < 600) {
      document.body.classList.remove("nav-hidden");
    }
    lastY = y;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------- Hover mega-dropdowns */
  var dropToggles = document.querySelectorAll(".hp-menu .has-drop");

  function closeDrops() {
    dropToggles.forEach(function (el) {
      el.classList.remove("open");
    });
  }

  /* ------------------------------------------------- Dropdown viewport clamp */
  var desktopMQ = window.matchMedia("(min-width: 768px)");

  function fitDropdown(dd) {
    if (!dd || dd.offsetParent === null) return;
    if (!desktopMQ.matches) return;
    var pad = 12;
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var item = dd.parentElement;
    if (!item) return;
    var itemRect = item.getBoundingClientRect();
    var w = dd.offsetWidth;
    var h = dd.offsetHeight;
    var center = itemRect.left + itemRect.width / 2;
    var desiredLeft = center - w / 2;
    if (desiredLeft < pad) desiredLeft = pad;
    if (desiredLeft + w > vw - pad) desiredLeft = vw - w - pad;
    dd.style.transform = "translateX(" + (desiredLeft - center) + "px) translateY(0)";
    var belowSpace = vh - pad - itemRect.bottom - 12;
    var aboveSpace = itemRect.top - pad - 12;
    if (h <= belowSpace || aboveSpace <= 0 || belowSpace >= aboveSpace) {
      dd.style.top = "calc(100% + 12px)";
      dd.style.bottom = "auto";
      dd.style.maxHeight = h > belowSpace ? Math.max(140, belowSpace) + "px" : "";
    } else {
      dd.style.top = "auto";
      dd.style.bottom = "calc(100% + 12px)";
      dd.style.maxHeight = h > aboveSpace ? Math.max(140, aboveSpace) + "px" : "";
    }
  }

  function fitOpenDropdowns() {
    document.querySelectorAll(".mega-panel, #access .sub-menu").forEach(fitDropdown);
  }

  dropToggles.forEach(function (el) {
    var link = el.querySelector(":scope > a");
    var panel = el.querySelector(".mega-panel");
    if (!link || !panel) return;

    if (window.matchMedia("(hover: hover)").matches) {
      el.addEventListener("mouseenter", function () {
        closeDrops();
        el.classList.add("open");
        fitDropdown(panel);
      });
      el.addEventListener("mouseleave", function () {
        el.classList.remove("open");
      });
      panel.addEventListener("mouseenter", function () {
        el.classList.add("open");
        fitDropdown(panel);
      });
    } else {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var wasOpen = el.classList.contains("open");
        closeDrops();
        if (!wasOpen) {
          el.classList.add("open");
          fitDropdown(panel);
        }
      });
    }
  });

  document.querySelectorAll("#access .menu > li").forEach(function (li) {
    var sub = li.querySelector("ul.sub-menu");
    if (!sub) return;
    li.addEventListener("mouseenter", function () { fitDropdown(sub); });
    li.addEventListener("focusin", function () { fitDropdown(sub); });
  });

  window.addEventListener("resize", fitOpenDropdowns);

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-drop")) closeDrops();
  });

  function syncMobileNavOffset() {
    if (!hpHeaderEl || !mobileNav) return;
    var bottom = hpHeaderEl.getBoundingClientRect().bottom;
    mobileNav.style.top = Math.max(0, bottom) + "px";
  }

  /* ------------------------------------------------- Legacy mobile menu (old branding header) */
  var hamburger = document.getElementById("hamburger-btn");
  var access = document.querySelector("nav#access");

  if (hamburger && access) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("is-open");
      access.classList.toggle("open");
      document.body.classList.toggle("legacy-menu-open", access.classList.contains("open"));
    });
  }

  /* ------------------------------------------------- Legacy submenus: touch accordion */
  document
    .querySelectorAll("nav#access .menu > li.menu-item-has-children")
    .forEach(function (li) {
      var link = li.querySelector(":scope > a");
      var sub = li.querySelector(":scope > ul.sub-menu");
      if (!link || !sub) return;

      var btn = document.createElement("button");
      btn.className = "sub-toggle";
      btn.type = "button";
      btn.setAttribute("aria-label", "Показать подразделы");
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "<span></span>";

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var open = li.classList.toggle("sub-open");
        btn.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        document
          .querySelectorAll("nav#access .menu > li.sub-open")
          .forEach(function (other) {
            if (other !== li) {
              other.classList.remove("sub-open");
              var ob = other.querySelector(":scope > .sub-toggle");
              if (ob) {
                ob.classList.remove("is-open");
                ob.setAttribute("aria-expanded", "false");
              }
            }
          });
      });

      link.insertAdjacentElement("afterend", btn);
    });

  /* Legacy search: русская надпись кнопки */
  var legacySubmit = document.querySelector("#searchform .submit");
  if (legacySubmit && legacySubmit.value === "Search") {
    legacySubmit.value = "Найти";
  }

  /* ------------------------------------------------- Scroll reveal */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------- Counters */
  var counters = document.querySelectorAll("[data-count]");

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var duration = 1600;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = target * eased;
      el.textContent = Math.round(val).toLocaleString("ru-RU");
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (reduced) {
    counters.forEach(function (el) {
      el.textContent = Math.round(parseFloat(el.getAttribute("data-count"))).toLocaleString("ru-RU");
    });
  } else if ("IntersectionObserver" in window) {
    var cObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      cObs.observe(el);
    });
  } else {
    counters.forEach(animateCount);
  }

  /* ------------------------------------------------- Ticker duplication */
  var ticker = document.querySelector(".hp-top .ticker");
  if (ticker && ticker.scrollWidth < ticker.parentElement.scrollWidth * 2) {
    ticker.innerHTML += ticker.innerHTML;
  }

  /* ------------------------------------------------- Таблицы: разметочные и плотные */
  document.querySelectorAll(".entry-content table").forEach(function (t) {
    var styleAttr = t.getAttribute("style") || "";
    var isLayout =
      t.classList.contains("rtb") ||
      t.getAttribute("border") === "0" ||
      /border:\s*0/i.test(styleAttr);
    if (isLayout) {
      t.classList.add("table-layout");
    } else {
      var firstRow = t.querySelector("tr");
      if (firstRow && firstRow.children.length >= 5) {
        t.classList.add("dense");
      }
    }
  });

  /* ------------------------------------------------- Current year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ------------------------------------------------- Shared partials include
      Header + footer live once in /partials/*.html. Pages use
      <div data-include="header|footer"></div>; absolute path so depth
      of the current page does not matter. Header is wired after insert. */
  function wireHeaderInteractions() {
    header = document.querySelector(".hp-header");
    dropToggles = document.querySelectorAll(".hp-menu .has-drop");
    burger = document.querySelector(".hp-burger");
    mobileNav = document.querySelector(".hp-mobile-nav");
    hpHeaderEl = header;

    dropToggles.forEach(function (el) {
      if (el.dataset.wired === "1") return;
      el.dataset.wired = "1";
      var link = el.querySelector(":scope > a");
      var panel = el.querySelector(".mega-panel");
      if (!link || !panel) return;

      if (window.matchMedia("(hover: hover)").matches) {
        el.addEventListener("mouseenter", function () {
          closeDrops();
          el.classList.add("open");
          fitDropdown(panel);
        });
        el.addEventListener("mouseleave", function () {
          el.classList.remove("open");
        });
        panel.addEventListener("mouseenter", function () {
          el.classList.add("open");
          fitDropdown(panel);
        });
      } else {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          var wasOpen = el.classList.contains("open");
          closeDrops();
          if (!wasOpen) {
            el.classList.add("open");
            fitDropdown(panel);
          }
        });
      }
    });

    if (burger && mobileNav && burger.dataset.wired !== "1") {
      burger.dataset.wired = "1";
      var lockScroll = function () {
        var y = window.scrollY || window.pageYOffset;
        document.body.dataset.scrollY = String(y);
        document.body.style.position = "fixed";
        document.body.style.top = "-" + y + "px";
        document.body.style.left = "0";
        document.body.style.right = "0";
      };
      var unlockScroll = function () {
        var y = parseInt(document.body.dataset.scrollY || "0", 10);
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        window.scrollTo(0, y);
      };

      burger.addEventListener("click", function () {
        var open = burger.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        mobileNav.classList.toggle("open", open);
        document.body.classList.toggle("legacy-menu-open", open);
        if (open) {
          syncMobileNavOffset();
          lockScroll();
        } else {
          unlockScroll();
        }
      });

      window.addEventListener("resize", function () {
        if (mobileNav.classList.contains("open")) syncMobileNavOffset();
      });

      mobileNav.querySelectorAll(".m-parent").forEach(function (p) {
        p.addEventListener("click", function (e) {
          var sub = p.nextElementSibling;
          if (sub && sub.classList.contains("m-sub")) {
            e.preventDefault();
            var isOpen = sub.classList.toggle("open");
            p.classList.toggle("open", isOpen);
            var caret = p.querySelector(".caret");
            if (caret) caret.style.transform = isOpen ? "rotate(180deg)" : "";
          }
        });
      });

      mobileNav.querySelectorAll("a:not(.m-parent)").forEach(function (a) {
        a.addEventListener("click", function () {
          burger.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          mobileNav.classList.remove("open");
          document.body.classList.remove("legacy-menu-open");
          unlockScroll();
        });
      });
    }

    onScroll();
  }

  /* Header/footer are baked into pages from /partials/*.html.
     If a page still has data-include slots, load them relative to main.js. */
  function partialsBase() {
    var s = document.querySelector('script[src*="main.js"]');
    if (s && s.src) {
      return s.src.replace(/[^/]*main\.js.*$/i, "").replace(/\/js\/?$/, "/");
    }
    return "/";
  }

  function loadPartial(name) {
    var slots = document.querySelectorAll('[data-include="' + name + '"]');
    if (!slots.length) return Promise.resolve();
    var url = partialsBase() + "partials/" + name + ".html";
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error(name + " partial HTTP " + r.status + " @ " + url);
        return r.text();
      })
      .then(function (html) {
        slots.forEach(function (slot) {
          slot.outerHTML = html;
        });
        if (name === "footer") {
          document.querySelectorAll("[data-year]").forEach(function (el) {
            el.textContent = new Date().getFullYear();
          });
        }
        if (name === "header") {
          wireHeaderInteractions();
        }
      })
      .catch(function (err) {
        console.error(name + " include failed:", err);
      });
  }

  // Wire header if already in DOM (baked-in); else fetch slots
  if (document.querySelector(".hp-header")) {
    wireHeaderInteractions();
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  } else {
    loadPartial("header").then(function () {
      return loadPartial("footer");
    });
  }

  /* A11y: Escape closes mobile menu / mega */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".hp-menu .has-drop.open").forEach(function (el) {
      el.classList.remove("open");
    });
    var b = document.querySelector(".hp-burger.is-open");
    var m = document.querySelector(".hp-mobile-nav.open");
    if (b && m) {
      b.classList.remove("is-open");
      b.setAttribute("aria-expanded", "false");
      m.classList.remove("open");
      document.body.classList.remove("legacy-menu-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
    }
    if (location.hash === "#openModal") {
      location.hash = "#close";
    }
  });

})();