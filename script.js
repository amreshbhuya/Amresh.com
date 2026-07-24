(function () {
  "use strict";

  /* ---------------------------------------------------------
     Theme controller (light / dark) — with safe fallback
     if localStorage is unavailable (e.g. sandboxed preview)
  --------------------------------------------------------- */
  const root = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  let memoryTheme = null;

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return memoryTheme; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { memoryTheme = value; }
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "light_mode" : "dark_mode";
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    storageSet("ab-theme", theme);
  }

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = storageGet("ab-theme");
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  themeToggle.addEventListener("click", function () {
    const current = root.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ---------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------- */
  const navBurger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  const burgerIcon = document.getElementById("burgerIcon");

  navBurger.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");
    navBurger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    burgerIcon.textContent = isOpen ? "close" : "menu";
  });

  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
      navBurger.setAttribute("aria-expanded", "false");
      burgerIcon.textContent = "menu";
    });
  });

  /* ---------------------------------------------------------
     Navbar scroll state + active link + back-to-top
  --------------------------------------------------------- */
  const siteNav = document.getElementById("siteNav");
  const backToTop = document.getElementById("backToTop");
  const sections = document.querySelectorAll("section[id], header[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  function onScroll() {
    const y = window.scrollY;
    siteNav.classList.toggle("scrolled", y > 40);
    backToTop.classList.toggle("show", y > 500);

    let currentId = "home";
    sections.forEach(function (sec) {
      const top = sec.offsetTop - 140;
      if (y >= top) currentId = sec.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------------------------------------------------------
     Hero role rotator
  --------------------------------------------------------- */
  const roles = [
    "Founder & CEO, AediaX Tech Pvt. Ltd.",
    "Full-Stack Software Developer",
    "AI & Enterprise Systems Engineer",
    "Mentor to Full-Stack Interns"
  ];
  const roleEl = document.getElementById("roleText");
  let roleIndex = 0, charIndex = 0, deleting = false;

  function typeRole() {
    const current = roles[roleIndex];
    charIndex += deleting ? -1 : 1;
    roleEl.textContent = current.slice(0, charIndex);

    let delay = deleting ? 35 : 55;
    if (!deleting && charIndex === current.length) { delay = 1600; deleting = true; }
    else if (deleting && charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = 300; }

    setTimeout(typeRole, delay);
  }
  typeRole();

  /* ---------------------------------------------------------
     Skill bars (data-driven)
  --------------------------------------------------------- */
  const techSkills = [
    ["HTML", 95], ["CSS", 90], ["JavaScript", 88], ["TypeScript", 75],
    ["React", 88], ["React Native", 85], ["Node.js", 85], ["Express.js", 82],
    ["Python", 88], ["MySQL", 82], ["MongoDB", 78], ["Firebase", 80],
    ["Bootstrap", 90], ["Material UI", 85], ["Expo", 80], ["Git / GitHub", 90]
  ];
  const proSkills = [
    ["Creativity", 90], ["Problem Solving", 85], ["Teamwork", 88],
    ["Communication", 80], ["Time Management", 85], ["Leadership", 80], ["Adaptability", 90]
  ];

  function buildSkillList(container, data) {
    data.forEach(function (item) {
      const wrap = document.createElement("div");
      wrap.className = "skill-item";
      wrap.innerHTML =
        '<div class="skill-top"><span>' + item[0] + '</span><span class="pct">' + item[1] + '%</span></div>' +
        '<div class="skill-bar clay-inset"><div class="skill-fill" data-target="' + item[1] + '"></div></div>';
      container.appendChild(wrap);
    });
  }
  buildSkillList(document.getElementById("techSkills"), techSkills);
  buildSkillList(document.getElementById("proSkills"), proSkills);

  /* ---------------------------------------------------------
     Reveal-on-scroll + skill bar fill (IntersectionObserver)
  --------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });

  const skillObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".skill-fill").forEach(function (fill) {
          fill.style.width = fill.getAttribute("data-target") + "%";
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll(".skill-block").forEach(function (block) { skillObserver.observe(block); });

  /* ---------------------------------------------------------
     Contact form (client-side validation + mailto handoff)
  --------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("fName").value.trim();
    const email = document.getElementById("fEmail").value.trim();
    const subject = document.getElementById("fSubject").value.trim();
    const message = document.getElementById("fMessage").value.trim();

    if (!name || !email || !message) {
      status.textContent = "Please fill in your name, email and message.";
      status.classList.remove("ok");
      return;
    }

    const body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
    const mailto = "mailto:amreshbhuyan@aediax.com?subject=" +
      encodeURIComponent(subject || "Portfolio inquiry from " + name) +
      "&body=" + encodeURIComponent(body);

    window.location.href = mailto;
    status.textContent = "Opening your email client to send this message...";
    status.classList.add("ok");
  });

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
