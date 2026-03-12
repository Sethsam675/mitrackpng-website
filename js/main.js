(function () {
  var navBtn = document.getElementById('nav-toggle');
  if (navBtn) {
    navBtn.addEventListener('click', function () {
      var nav = document.querySelector('nav');
      if (nav) nav.classList.toggle('open');
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
    if (!endpoint) {
      setStatus('Form endpoint is not configured. Please try again later.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    setStatus('Sending your message...', 'pending');

    fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: new FormData(contactForm)
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
        contactForm.reset();
        setStatus('Thanks! Your message was sent successfully. We will contact you soon.', 'success');
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
