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
    const primaryNavigation = document.getElementById("primary-navigation");

    function setMenuState(isOpen) {
      nav.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    toggle.addEventListener("click", function () {
      setMenuState(!nav.classList.contains("open"));
    });


    if (primaryNavigation) {
      const currentPage = window.location.pathname.split("/").pop() || "index.html";
      primaryNavigation.querySelectorAll("a[href]").forEach((link) => {
        const linkPage = link.getAttribute("href").split("#")[0];
        const isActive = linkPage === currentPage;
        link.classList.toggle("active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    if (primaryNavigation) {
      primaryNavigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", function () {
          if (window.innerWidth <= 720) {
            setMenuState(false);
          }
        });
      });
    }

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) {
        setMenuState(false);
      }
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
  const autoRevealTargets = document.querySelectorAll(
    "section .section-title, section .grid, section .card, section .map-container, section .map-info, .cta"
  );
  autoRevealTargets.forEach((element) => element.classList.add("fade-in"));

  const faders = document.querySelectorAll(".fade-in");

  if (faders.length > 0) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target); // stop observing once visible
        }
      });
    }, { threshold: 0.15 });

    faders.forEach(el => {
      const rect = el.getBoundingClientRect();

      // Show elements already in view on load
      if (rect.top < window.innerHeight) {
        el.classList.add("show");
      } else {
        observer.observe(el);
      }
    });
  }

  // ==========================
  // LUCIDE ICONS
  // ==========================
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  // ==========================
  // CONTACT FORM (DUAL PRIMARY + FALLBACK)
  // ==========================
  const contactForm = document.getElementById("contact-form");
  if (!contactForm || contactForm.dataset.ajax !== "true") {
    return;
  }

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const statusEl = document.getElementById("form-status");

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status form-status-" + type;
  }

  function submitForm(targetEndpoint, payload) {
    return fetch(targetEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload
    }).then((response) => {
      if (!response.ok) throw new Error("Request failed");
      return response.json().catch(() => ({}));
    });
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const endpoint = contactForm.getAttribute("action");
    const secondaryEndpoint = contactForm.dataset.secondaryAction || "";

    if (!endpoint) {
      setStatus("Form endpoint is not configured. Please try again later.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    setStatus("Sending your message...", "pending");

    const primaryPayload = new FormData(contactForm);
    let secondaryFailed = false;

    submitForm(endpoint, primaryPayload)
      .then(() => {
        if (!secondaryEndpoint || secondaryEndpoint === endpoint) return null;

        // Avoid duplicate CC sends on secondary
        const secondaryPayload = new FormData(contactForm);
        secondaryPayload.delete("_cc");

        return submitForm(secondaryEndpoint, secondaryPayload).catch(() => {
          secondaryFailed = true;
          return null;
        });
      })
      .then(() => {
        contactForm.reset();
        if (secondaryFailed) {
          setStatus("Message sent to primary inbox. Secondary primary recipient delivery failed this time.", "error");
        } else {
          setStatus("Thanks! Your message was sent successfully. We will contact you soon.", "success");
        }
      })
      .catch(() => {
        // Fallback to standard form submission
        setStatus("Network issue detected. Retrying with standard submit...", "pending");
        contactForm.dataset.ajax = "false";
        contactForm.submit();
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Message";
        }
      });
  });

});
