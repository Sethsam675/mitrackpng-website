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
      toggle.setAttribute("aria-expanded", String(nav.classList.contains("open")));
    });
  }

  const navLinks = document.querySelectorAll('#primary-navigation a');
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

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
  // CONTACT FORM (DUAL PRIMARY + FALLBACK)
  // ==========================
  const contactForm = document.getElementById("contact-form");
  if (!contactForm || contactForm.dataset.ajax !== "true") return;

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const statusEl = document.getElementById("form-status");
  const requiredFields = contactForm.querySelectorAll("input[required], select[required], textarea[required]");

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

    let invalidField = null;
    requiredFields.forEach((field) => {
      const valid = field.checkValidity();
      field.setAttribute("aria-invalid", valid ? "false" : "true");
      if (!valid && !invalidField) invalidField = field;
    });

    if (invalidField) {
      setStatus("Please complete all required fields correctly before submitting.", "error");
      invalidField.focus();
      return;
    }

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
        requiredFields.forEach((field) => field.setAttribute("aria-invalid", "false"));
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
