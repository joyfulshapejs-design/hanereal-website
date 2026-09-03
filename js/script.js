// HaneReal shared site behavior: mobile nav, FAQ accordion, consultation form, project gallery lightbox, scroll reveal

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initFaqAccordion();
  initConsultForm();
  initLightbox();
  initScrollReveal();
});

function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      items.forEach((other) => other.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

function initConsultForm() {
  const form = document.getElementById("consultForm");
  const status = document.getElementById("formStatus");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const accessKey = form.access_key ? form.access_key.value : "";

    status.className = "form-status";
    status.textContent = "";

    if (!accessKey || accessKey.startsWith("PLACEHOLDER")) {
      status.textContent = "Form is not connected yet. Add a real Web3Forms access key to start receiving requests.";
      status.classList.add("error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const formData = new FormData(form);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        status.textContent = "Thanks, your request is in. We'll follow up within 1-2 business days, and you should also get a confirmation email shortly.";
        status.classList.add("success");
        form.reset();
      } else {
        status.textContent = "Something went wrong sending your request. Please try again, or email us directly.";
        status.classList.add("error");
      }
    } catch (err) {
      status.textContent = "Something went wrong sending your request. Please check your connection and try again.";
      status.classList.add("error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Request a Consultation";
    }
  });
}

function initLightbox() {
  const grid = document.getElementById("galleryGrid");
  const lightbox = document.getElementById("lightbox");
  if (!grid || !lightbox) return;

  const items = Array.from(grid.querySelectorAll(".gallery-item"));
  const image = document.getElementById("lightboxImage");
  const title = document.getElementById("lightboxTitle");
  const desc = document.getElementById("lightboxDesc");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  let currentIndex = 0;

  function renderItem(index) {
    const item = items[index];
    if (!item) return;
    const img = item.querySelector("img");
    image.src = img ? img.src : "";
    image.alt = img ? img.alt : "";
    title.textContent = item.dataset.title || "";
    desc.textContent = item.dataset.desc || "";
  }

  function openLightbox(index) {
    currentIndex = index;
    renderItem(currentIndex);
    lightbox.classList.add("open");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
  }

  function showNext(step) {
    currentIndex = (currentIndex + step + items.length) % items.length;
    renderItem(currentIndex);
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => showNext(-1));
  nextBtn.addEventListener("click", () => showNext(1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showNext(-1);
    if (event.key === "ArrowRight") showNext(1);
  });
}

function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("in-view"));
    return;
  }

  // Stagger delay resets per sibling group, so cards in the same row
  // cascade in together instead of drifting out of sync with page position.
  const groupCounts = new Map();
  items.forEach((item) => {
    const parent = item.parentElement;
    const position = groupCounts.get(parent) || 0;
    item.style.transitionDelay = `${Math.min(position, 4) * 70}ms`;
    groupCounts.set(parent, position + 1);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((item) => observer.observe(item));
}
