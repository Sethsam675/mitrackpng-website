document.addEventListener("DOMContentLoaded", function () {
  const feedbackForm = document.getElementById("feedback-form");
  const feedbackList = document.getElementById("feedback-list");
  const statusEl = document.getElementById("feedback-status");
  const starRating = document.getElementById("star-rating");
  const ratingInput = document.getElementById("rating-input");
  const ratingText = document.getElementById("rating-text");
  const stars = starRating ? Array.from(starRating.querySelectorAll(".star")) : [];
  const storageKey = "mitrack-feedback-submissions";

  if (!feedbackForm || !feedbackList || !starRating || !ratingInput || !ratingText) return;

  const ratingLabels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = "form-status form-status-" + type;
  }

  function renderStars(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  function updateStarUI(rating) {
    stars.forEach((star) => {
      const value = Number(star.dataset.value);
      star.classList.toggle("active", value <= rating);
    });

    if (rating > 0) {
      ratingText.textContent = rating + "/5 — " + ratingLabels[rating];
    } else {
      ratingText.textContent = "Click to rate";
    }
  }

  function formatServiceName(rawService) {
    return rawService
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function createFeedbackCard(entry) {
    const safeName = escapeHtml(entry.name);
    const safeService = escapeHtml(formatServiceName(entry.service));
    const safeComment = escapeHtml(entry.comments);

    const card = document.createElement("article");
    card.className = "feedback-card";
    card.innerHTML = `
      <div class="feedback-header">
        <h4>${safeService}</h4>
        <div class="feedback-rating">
          <span class="rating-stars">${renderStars(entry.rating)}</span>
          <span class="rating-value">${entry.rating}/5</span>
        </div>
      </div>
      <p class="feedback-text">"${safeComment}"</p>
      <footer class="feedback-footer">
        <span class="feedback-author">${safeName}</span>
        <span class="feedback-date">Posted ${new Date(entry.createdAt).toLocaleDateString()}</span>
      </footer>
    `;

    return card;
  }

  function readSavedEntries() {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveEntry(entry) {
    const entries = readSavedEntries();
    entries.unshift(entry);
    localStorage.setItem(storageKey, JSON.stringify(entries.slice(0, 20)));
  }

  function renderSavedEntries() {
    const entries = readSavedEntries();
    if (entries.length === 0) return;

    const fragment = document.createDocumentFragment();
    entries.forEach((entry) => fragment.appendChild(createFeedbackCard(entry)));
    feedbackList.prepend(fragment);
  }

  function postFeedback(payload) {
    return fetch(feedbackForm.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload
    }).then((response) => {
      if (!response.ok) throw new Error("Feedback submission failed");
      return response.json().catch(() => ({}));
    });
  }

  stars.forEach((star) => {
    star.setAttribute("role", "button");
    star.setAttribute("tabindex", "0");

    star.addEventListener("click", function () {
      const rating = Number(this.dataset.value);
      ratingInput.value = String(rating);
      updateStarUI(rating);
    });

    star.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      this.click();
    });
  });

  feedbackForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const rating = Number(ratingInput.value);
    if (!rating || rating < 1 || rating > 5) {
      setStatus("Please select a star rating before submitting.", "error");
      return;
    }

    const submitButton = feedbackForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    const formData = new FormData(feedbackForm);
    const newEntry = {
      name: formData.get("name") || "Anonymous",
      service: formData.get("service_used") || "Service",
      comments: formData.get("comments") || "",
      rating,
      createdAt: new Date().toISOString()
    };

    setStatus("Submitting your feedback...", "pending");

    postFeedback(formData)
      .then(() => {
        saveEntry(newEntry);
        feedbackList.prepend(createFeedbackCard(newEntry));
        feedbackForm.reset();
        ratingInput.value = "0";
        updateStarUI(0);
        setStatus("Thank you! Your feedback has been posted.", "success");
      })
      .catch(() => {
        setStatus("Network issue detected. Trying standard form submit...", "pending");
        feedbackForm.submit();
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Submit Feedback";
        }
      });
  });

  renderSavedEntries();
  updateStarUI(0);
});
