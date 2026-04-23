(function () {
  document.body.classList.add('page-ready');

  var nav = document.querySelector('nav');
  var navBtn = document.getElementById('nav-toggle');
  var navRevealTimer;
  var navHideTimer;
  var navReminderTimer;
  var navReminderVisibleTimer;

  function isNavLockedOpen() {
    return !!(nav && (nav.matches(':hover, :focus-within') || nav.classList.contains('open')));
  }

  function clearNavTimers() {
    clearTimeout(navRevealTimer);
    clearTimeout(navHideTimer);
    clearTimeout(navReminderTimer);
    clearTimeout(navReminderVisibleTimer);
  }

  function showNav(withReminderMotion) {
    if (!nav) return;
    nav.classList.remove('nav-hidden');
    nav.classList.add('nav-visible');
    if (withReminderMotion) {
      nav.classList.remove('nav-reminder');
      void nav.offsetWidth;
      nav.classList.add('nav-reminder');
    } else {
      nav.classList.remove('nav-reminder');
    }
  }

  function hideNav() {
    if (!nav || isNavLockedOpen()) return;
    nav.classList.remove('nav-visible', 'nav-reminder');
    nav.classList.add('nav-hidden');
  }

  function scheduleNavReminder() {
    clearTimeout(navReminderTimer);
    clearTimeout(navReminderVisibleTimer);
    navReminderTimer = setTimeout(function () {
      if (!nav || isNavLockedOpen()) return;
      showNav(true);
      navReminderVisibleTimer = setTimeout(function () {
        if (!isNavLockedOpen()) hideNav();
      }, 6000);
    }, 20000);
  }

  function handleScrollActivity() {
    if (!nav) return;
    hideNav();
    clearTimeout(navRevealTimer);
    clearTimeout(navHideTimer);
    clearTimeout(navReminderVisibleTimer);

    navRevealTimer = setTimeout(function () {
      showNav(false);
      navHideTimer = setTimeout(function () {
        if (!isNavLockedOpen()) hideNav();
      }, 3500);
    }, 180);

    scheduleNavReminder();
  }

  if (nav) {
    showNav(false);
    scheduleNavReminder();
    window.addEventListener('scroll', handleScrollActivity, { passive: true });
    window.addEventListener('beforeunload', clearNavTimers);
  }

  function initRevealAnimations() {
    var targets = document.querySelectorAll('.section, .cta, footer, .hero .hero-buttons, .hero h1, .hero p, .grid .card, .contact-form-card');
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

  if (navBtn) {
    navBtn.addEventListener('click', function () {
      if (nav) nav.classList.toggle('open');
      if (nav && nav.classList.contains('open')) {
        showNav(false);
      }
    });
  }

  var contactForm = document.getElementById('contact-form');
  if (!contactForm || contactForm.dataset.ajax !== 'true') return;

  var submitBtn = contactForm.querySelector('button[type="submit"]');
  var statusEl = document.getElementById('form-status');

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status form-status-' + type;
  }

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var endpoint = contactForm.getAttribute('action');
    var secondaryEndpoint = contactForm.dataset.secondaryAction || '';
    if (!endpoint) {
      setStatus('Form endpoint is not configured. Please try again later.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    setStatus('Sending your message...', 'pending');

    function submitForm(targetEndpoint, payload) {
      return fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: payload
      }).then(function (response) {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        return response.json().catch(function () {
          return {};
        });
      });
    }

    var primaryPayload = new FormData(contactForm);
    var secondaryFailed = false;

    submitForm(endpoint, primaryPayload)
      .then(function () {
        if (!secondaryEndpoint || secondaryEndpoint === endpoint) {
          return null;
        }

        var secondaryPayload = new FormData(contactForm);
        secondaryPayload.delete('_cc');

        return submitForm(secondaryEndpoint, secondaryPayload).catch(function () {
          secondaryFailed = true;
          return null;
        });
      })
      .then(function () {
        contactForm.reset();
        if (secondaryFailed) {
          setStatus('Message sent to primary inbox. Secondary primary recipient delivery failed this time.', 'error');
        } else {
          setStatus('Thanks! Your message was sent successfully. We will contact you soon.', 'success');
        }
      })
      .catch(function () {
        setStatus('Network issue detected. Retrying with standard submit...', 'pending');
        contactForm.dataset.ajax = 'false';
        contactForm.submit();
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      });
  });
})();
