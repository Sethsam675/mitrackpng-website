document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".navbar");
  const collapse = document.getElementById("nav");

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 20) nav.classList.add("glass");
    else nav.classList.remove("glass");
  }
  onScroll();
  window.addEventListener("scroll", onScroll);

  document.querySelectorAll("#nav .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (collapse && collapse.classList.contains("show") && window.bootstrap) {
        new bootstrap.Collapse(collapse).hide();
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal,.fade-in").forEach((el) => observer.observe(el));

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
    return fetch(targetEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: payload })
      .then((response) => { if (!response.ok) throw new Error("Request failed"); return response.json().catch(() => ({})); });
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let invalidField = null;
    requiredFields.forEach((field) => {
      const valid = field.checkValidity();
      field.setAttribute("aria-invalid", valid ? "false" : "true");
      if (!valid && !invalidField) invalidField = field;
    });
    if (invalidField) { setStatus("Please complete all required fields correctly before submitting.", "error"); invalidField.focus(); return; }

    const endpoint = contactForm.getAttribute("action");
    const secondaryEndpoint = contactForm.dataset.secondaryAction || "";
    if (!endpoint) { setStatus("Form endpoint is not configured. Please try again later.", "error"); return; }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending..."; }
    setStatus("Sending your message...", "pending");

    const primaryPayload = new FormData(contactForm);
    let secondaryFailed = false;
    submitForm(endpoint, primaryPayload)
      .then(() => {
        if (!secondaryEndpoint || secondaryEndpoint === endpoint) return null;
        const secondaryPayload = new FormData(contactForm);
        secondaryPayload.delete("_cc");
        return submitForm(secondaryEndpoint, secondaryPayload).catch(() => { secondaryFailed = true; return null; });
      })
      .then(() => {
        contactForm.reset();
        requiredFields.forEach((field) => field.setAttribute("aria-invalid", "false"));
        setStatus(secondaryFailed ? "Message sent to primary inbox. Secondary primary recipient delivery failed this time." : "Thanks! Your message was sent successfully. We will contact you soon.", secondaryFailed ? "error" : "success");
      })
      .catch(() => {
        setStatus("Network issue detected. Retrying with standard submit...", "pending");
        contactForm.dataset.ajax = "false";
        contactForm.submit();
      })
      .finally(() => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send Message"; }
      });
  });
});
