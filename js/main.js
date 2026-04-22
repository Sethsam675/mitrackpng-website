(function () {
  document.body.classList.add('page-ready');

  function initRevealAnimations() {
    var targets = document.querySelectorAll('.section, .cta, footer, .hero .hero-buttons, .hero h1, .hero p, .grid .card, .testimonial-card, .contact-form-card, .map-container, .motto-container, .about-card');
    if (!targets.length) return;

    for (var i = 0; i < targets.length; i += 1) {
      targets[i].classList.add('reveal');
    }

    if (!('IntersectionObserver' in window)) {
      for (var j = 0; j < targets.length; j += 1) {
        targets[j].classList.add('is-visible');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries, revealObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    });

    for (var k = 0; k < targets.length; k += 1) {
      observer.observe(targets[k]);
    }
  }

  initRevealAnimations();

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  var navBtn = document.getElementById('nav-toggle');
  if (navBtn) {
    navBtn.addEventListener('click', function () {
      var nav = document.querySelector('nav');
      if (!nav) return;

      var isOpen = nav.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setStatus(statusEl, message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status form-status-' + type;
  }

  function bindAjaxContactForm(form, options) {
    if (!form || form.dataset.ajax !== 'true' || form.dataset.bound === 'true') return;

    var submitBtn = form.querySelector('button[type="submit"]');
    var statusEl = options && options.statusEl ? options.statusEl : form.querySelector('.form-status');

    form.dataset.bound = 'true';

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var endpoint = form.getAttribute('action');
      if (!endpoint) {
        setStatus(statusEl, 'Form endpoint is not configured. Please try again later.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      setStatus(statusEl, 'Sending your message...', 'pending');

      fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: new FormData(form)
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Request failed');
          }
          return response.json().catch(function () {
            return {};
          });
        })
        .then(function () {
          form.reset();
          setStatus(statusEl, 'Thanks! Your message was sent successfully. We will contact you soon.', 'success');
        })
        .catch(function () {
          setStatus(statusEl, 'Network issue detected. Retrying with standard submit...', 'pending');
          form.dataset.ajax = 'false';
          form.submit();
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }
        });
    });
  }

  function createContactModal() {
    var modal = document.createElement('div');
    modal.className = 'contact-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = [
      '<div class="contact-modal__backdrop" data-contact-close></div>',
      '<div class="contact-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">',
      '<button type="button" class="contact-modal__close" aria-label="Close contact form" data-contact-close>&times;</button>',
      '<div class="section-title contact-modal__title">',
      '<h2 id="contact-modal-title">Request Consultation</h2>',
      '<p>Tell us what you need and our team will get back to you.</p>',
      '</div>',
      '<form id="contact-modal-form" action="https://formsubmit.co/ajax/mitrack@mitrack.com.au" method="POST" class="contact-form" data-ajax="true">',
      '<input type="hidden" name="_subject" value="New enquiry from MiTrack PNG website">',
      '<input type="hidden" name="_template" value="table">',
      '<input type="text" name="_honey" class="form-honeypot" tabindex="-1" autocomplete="off">',
      '<div class="form-grid">',
      '<div class="form-group"><label for="modal-full-name">Full Name</label><input id="modal-full-name" type="text" name="name" placeholder="Enter your full name" autocomplete="name" required></div>',
      '<div class="form-group"><label for="modal-email-address">Email Address</label><input id="modal-email-address" type="email" name="email" placeholder="name@company.com" autocomplete="email" required></div>',
      '<div class="form-group"><label for="modal-phone-number">Phone Number</label><input id="modal-phone-number" type="tel" name="phone" placeholder="+675 ..." autocomplete="tel" required></div>',
      '<div class="form-group"><label for="modal-service-select">Service Needed</label><select id="modal-service-select" name="service" required><option value="" selected disabled>Select a service</option><option value="gps">GPS Tracking</option><option value="cctv">CCTV Installation</option><option value="monitoring">24/7 Monitoring</option><option value="fleet">Fleet Management</option><option value="alarm">Alarm Systems</option><option value="personal-tracking">Personal Tracking Devices</option></select></div>',
      '<div class="form-group form-group-full"><label for="modal-message">Your Message</label><textarea id="modal-message" name="message" placeholder="Tell us about your security or tracking needs" rows="5" required></textarea></div>',
      '</div>',
      '<div class="form-actions"><p class="form-note">Our team usually responds within one business day.</p><button type="submit" class="btn btn-primary">Send Message</button></div>',
      '<p class="form-status" aria-live="polite"></p>',
      '</form>',
      '</div>'
    ].join('');

    document.body.appendChild(modal);
    return modal;
  }

  var pageContactForm = document.getElementById('contact-form');
  bindAjaxContactForm(pageContactForm, {
    statusEl: document.getElementById('form-status')
  });

  var modalEl = null;
  var lastFocusedEl = null;

  function closeContactModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function openContactModal(event) {
    if (event) event.preventDefault();
    if (!modalEl) {
      modalEl = createContactModal();
      bindAjaxContactForm(modalEl.querySelector('form'), {
        statusEl: modalEl.querySelector('.form-status')
      });
      modalEl.addEventListener('click', function (clickEvent) {
        if (clickEvent.target.hasAttribute('data-contact-close')) {
          closeContactModal();
        }
      });
    }

    lastFocusedEl = document.activeElement;
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    var firstInput = modalEl.querySelector('input[name="name"]');
    if (firstInput) firstInput.focus();
  }

  var contactButtons = document.querySelectorAll('a.btn[href="contact.html"]');
  for (var buttonIndex = 0; buttonIndex < contactButtons.length; buttonIndex += 1) {
    contactButtons[buttonIndex].addEventListener('click', openContactModal);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modalEl && modalEl.classList.contains('is-open')) {
      closeContactModal();
    }
  });
})();
