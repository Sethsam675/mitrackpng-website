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
  // PRODUCT INFINITE CAROUSEL
  // ==========================
  const productCarousel = document.querySelector(".product-carousel");
  const productGrid = document.querySelector(".product-grid");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 769px)");

  if (productCarousel && productGrid) {
    const originalCards = Array.from(productGrid.querySelectorAll(".product-card"));
    const canUseMotion = !reduceMotion.matches && desktopPointer.matches;

    if (originalCards.length > 0 && canUseMotion) {
      originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("role", "presentation");
        clone.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((element) => {
          element.setAttribute("tabindex", "-1");
        });
        productGrid.appendChild(clone);
      });

      const minPointerSpeed = 18;
      const maxPointerSpeed = 92;
      const centerPauseRadius = 0.12;
      const smoothing = 0.12;
      let carouselDistance = 0;
      let carouselOffset = 0;
      let carouselVelocity = 0;
      let targetCarouselVelocity = 28;
      let lastFrameTime = null;
      let pointerIsInsideCarousel = false;
      let interactionPauseActive = false;

      function setCarouselDistance() {
        const firstClone = productGrid.querySelectorAll(".product-card")[originalCards.length];
        if (!firstClone) return;
        carouselDistance = firstClone.offsetLeft;
        productGrid.style.setProperty("--product-carousel-distance", carouselDistance + "px");
        carouselOffset = wrapCarouselOffset(carouselOffset);
        updateCarouselTransform();
      }

      function setCarouselIntent(intent) {
        productCarousel.dataset.carouselIntent = intent;
      }

      function wrapCarouselOffset(offset) {
        if (carouselDistance <= 0) return 0;
        return ((offset % carouselDistance) + carouselDistance) % carouselDistance;
      }

      function updateCarouselTransform() {
        productGrid.style.transform = "translate3d(" + (-carouselOffset).toFixed(2) + "px, 0, 0)";
      }

      function setTargetCarouselVelocity(velocity, intent) {
        targetCarouselVelocity = velocity;
        productGrid.classList.toggle("is-paused", velocity === 0);
        setCarouselIntent(intent);
      }

      function getPointerVelocity(event) {
        const rect = productCarousel.getBoundingClientRect();
        const pointerRatio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const distanceFromCenter = Math.abs(pointerRatio - 0.5);

        if (distanceFromCenter <= centerPauseRadius) {
          return { velocity: 0, intent: "paused" };
        }

        // Convert center-to-edge distance into a gradual speed curve:
        // center stays still, mid-edge starts slow, and the outer edge reaches max speed.
        const edgeStrength = (distanceFromCenter - centerPauseRadius) / (0.5 - centerPauseRadius);
        const easedStrength = edgeStrength * edgeStrength;
        const speed = minPointerSpeed + ((maxPointerSpeed - minPointerSpeed) * easedStrength);
        const direction = pointerRatio < 0.5 ? -1 : 1;

        return {
          velocity: speed * direction,
          intent: direction < 0 ? "backward" : "forward"
        };
      }

      function updateDesktopPointerNavigation(event) {
        pointerIsInsideCarousel = true;
        const pointerState = getPointerVelocity(event);
        setTargetCarouselVelocity(pointerState.velocity, pointerState.intent);
      }

      function pauseCarouselBriefly() {
        interactionPauseActive = true;
        setTargetCarouselVelocity(0, "paused");
        window.clearTimeout(productGrid.carouselPauseTimer);
        productGrid.carouselPauseTimer = window.setTimeout(() => {
          interactionPauseActive = false;
          if (!pointerIsInsideCarousel) {
            setTargetCarouselVelocity(28, "auto");
          }
        }, 1800);
      }

      function resetDesktopPointerNavigation() {
        pointerIsInsideCarousel = false;
        if (!interactionPauseActive) {
          setTargetCarouselVelocity(28, "auto");
        }
      }

      function animateCarousel(frameTime) {
        if (lastFrameTime === null) {
          lastFrameTime = frameTime;
        }

        const elapsedSeconds = Math.min((frameTime - lastFrameTime) / 1000, 0.05);
        lastFrameTime = frameTime;
        // Ease toward the target velocity so crossing the center or changing sides does not jump.
        carouselVelocity += (targetCarouselVelocity - carouselVelocity) * smoothing;

        if (Math.abs(carouselVelocity) < 0.01 && targetCarouselVelocity === 0) {
          carouselVelocity = 0;
        }

        carouselOffset = wrapCarouselOffset(carouselOffset + (carouselVelocity * elapsedSeconds));
        updateCarouselTransform();
        window.requestAnimationFrame(animateCarousel);
      }

      setCarouselDistance();
      productCarousel.classList.add("has-infinite");
      productCarousel.dataset.carouselIntent = "auto";
      productGrid.classList.add("is-infinite", "is-cursor-driven");
      window.addEventListener("resize", setCarouselDistance);
      window.addEventListener("orientationchange", setCarouselDistance);
      productCarousel.addEventListener("pointermove", updateDesktopPointerNavigation, { passive: true });
      productCarousel.addEventListener("pointerleave", resetDesktopPointerNavigation);
      productCarousel.addEventListener("focusin", () => setTargetCarouselVelocity(0, "paused"));
      productCarousel.addEventListener("focusout", () => {
        if (!pointerIsInsideCarousel && !interactionPauseActive) {
          setTargetCarouselVelocity(28, "auto");
        }
      });
      window.requestAnimationFrame(animateCarousel);

      ["pointerdown", "touchstart", "wheel"].forEach((eventName) => {
        productGrid.addEventListener(eventName, pauseCarouselBriefly, { passive: true });
      });
    } else {
      productCarousel.classList.add("is-touch-scroll");
    }
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
