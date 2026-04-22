// ==========================
// DOM READY
// ==========================
document.addEventListener("DOMContentLoaded", function () {

  // ==========================
  // NAV TOGGLE (MOBILE)
  // ==========================
  const toggle = document.getElementById("nav-toggle");
  const nav = document.querySelector("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  // ==========================
  // SCROLL EFFECT (NAVBAR)
  // ==========================
  if (nav) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    });
  }

  // ==========================
  // FADE-IN ANIMATION (FIXED)
  // ==========================
  const faders = document.querySelectorAll('.fade-in');

  if (faders.length > 0) {

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target); // stop observing once visible
        }
      });
    }, { threshold: 0.15 });

    faders.forEach(el => {
      const rect = el.getBoundingClientRect();

      // 👇 FIX: show elements already in view on load
      if (rect.top < window.innerHeight) {
        el.classList.add('show');
      } else {
        observer.observe(el);
      }
    });
  }

});
