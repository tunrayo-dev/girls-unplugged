/* ========================================
   GIRLS UNPLUGGED
   MAIN JAVASCRIPT
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ======================================
     REDUCED MOTION
  ====================================== */

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ======================================
     SCROLL REVEAL
  ====================================== */

  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger, .timeline-item, .section-transition"
  );

  if (prefersReducedMotion) {

    revealElements.forEach((element) => {
      element.classList.add("active");
    });

  } else {

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add("active");

            observer.unobserve(entry.target);
          }

        });

      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
      }
    );


    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  }


  /* ======================================
     STAT COUNTERS
  ====================================== */

  const statNumbers = document.querySelectorAll(
    ".stat-number[data-target]"
  );


  function animateCounter(element) {

    const target = Number(element.dataset.target);

    if (Number.isNaN(target)) {
      return;
    }


    /* Already counted */

    if (element.dataset.counted === "true") {
      return;
    }


    element.dataset.counted = "true";


    /* Reduced motion */

    if (prefersReducedMotion) {

      element.textContent = formatNumber(target);

      element.classList.add("counted");

      return;
    }


    const duration = 1800;
    const startTime = performance.now();


    function updateCounter(currentTime) {

      const elapsed = currentTime - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );


      /*
        Ease-out effect.

        Starts quickly and slows down
        as it reaches the final number.
      */

      const easedProgress =
        1 - Math.pow(1 - progress, 3);


      const currentValue =
        Math.floor(target * easedProgress);


      element.textContent =
        formatNumber(currentValue);


      if (progress < 1) {

        requestAnimationFrame(updateCounter);

      } else {

        element.textContent =
          formatNumber(target);

        element.classList.add("counted");
      }

    }


    requestAnimationFrame(updateCounter);
  }


  function formatNumber(number) {

    return new Intl.NumberFormat("en-US").format(number);

  }


  if (statNumbers.length > 0) {

    if (prefersReducedMotion) {

      statNumbers.forEach((element) => {
        animateCounter(element);
      });

    } else {

      const counterObserver =
        new IntersectionObserver(
          (entries, observer) => {

            entries.forEach((entry) => {

              if (entry.isIntersecting) {

                animateCounter(entry.target);

                observer.unobserve(entry.target);
              }

            });

          },
          {
            threshold: 0.5
          }
        );


      statNumbers.forEach((element) => {
        counterObserver.observe(element);
      });

    }

  }


  /* ======================================
     SMOOTH INTERNAL LINKS
  ====================================== */

  const internalLinks =
    document.querySelectorAll('a[href^="#"]');


  internalLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

      const targetId =
        link.getAttribute("href");


      if (
        !targetId ||
        targetId === "#"
      ) {
        return;
      }


      const target =
        document.querySelector(targetId);


      if (!target) {
        return;
      }


      event.preventDefault();


      target.scrollIntoView({
        behavior:
          prefersReducedMotion
            ? "auto"
            : "smooth",
        block: "start"
      });

    });

  });


  /* ======================================
     CURRENT YEAR
  ====================================== */

  const yearElements =
    document.querySelectorAll("[data-current-year]");


  yearElements.forEach((element) => {

    element.textContent =
      new Date().getFullYear();

  });


  /* ======================================
     IMAGE LOAD HANDLING
  ====================================== */

  const images =
    document.querySelectorAll("img");


  images.forEach((image) => {

    if (image.complete) {

      image.classList.add("loaded");

    } else {

      image.addEventListener(
        "load",
        () => {
          image.classList.add("loaded");
        },
        {
          once: true
        }
      );

    }

  });


  /* ======================================
     EXTERNAL LINKS
  ====================================== */

  const externalLinks =
    document.querySelectorAll(
      'a[href^="http"]'
    );


  externalLinks.forEach((link) => {

    const currentHost =
      window.location.hostname;


    try {

      const linkUrl =
        new URL(link.href);


      if (
        linkUrl.hostname !== currentHost
      ) {

        link.setAttribute(
          "target",
          "_blank"
        );

        link.setAttribute(
          "rel",
          "noopener noreferrer"
        );

      }

    } catch (error) {

      /* Ignore invalid URLs */

    }

  });


  /* ======================================
     BACK TO TOP
  ====================================== */

  const backToTop =
    document.querySelector(".back-to-top");


  if (backToTop) {

    window.addEventListener(
      "scroll",
      () => {

        if (window.scrollY > 600) {

          backToTop.classList.add("show");

        } else {

          backToTop.classList.remove("show");

        }

      },
      {
        passive: true
      }
    );


    backToTop.addEventListener(
      "click",
      () => {

        window.scrollTo({
          top: 0,
          behavior:
            prefersReducedMotion
              ? "auto"
              : "smooth"
        });

      }
    );

  }

});



async function loadImpactStats() {
  const statsContainer = document.getElementById("impact-stats");

  if (!statsContainer) return;

  try {
    const response = await fetch("impact.json");

    if (!response.ok) {
      throw new Error("Could not load impact data.");
    }

    const data = await response.json();

    if (!data.stats || !Array.isArray(data.stats)) {
      throw new Error("Impact data is not in the expected format.");
    }

    const statElements = document.querySelectorAll("[data-stat]");

    statElements.forEach((element) => {
      const statId = element.dataset.stat;

      const stat = data.stats.find((item) => {
        return item.label
          .toLowerCase()
          .replace(/\s+/g, "-") === statId;
      });

      if (!stat) return;

      const target = Number(stat.value);

      if (!Number.isFinite(target) || target < 0) {
        element.textContent = "0";
        return;
      }

      element.dataset.target = target;
      element.textContent = "0";

      const duration = 1600;
      const startTime = performance.now();

      function animateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(target * easedProgress);

        element.textContent = currentValue.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(animateCounter);
        } else {
          element.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(animateCounter);
    });

    const updatedElement = document.getElementById("impact-last-updated");

    if (updatedElement && data.lastUpdated) {
      updatedElement.textContent =
        `Impact data last updated: ${data.lastUpdated}`;
    }

  } catch (error) {
    console.error("Impact data could not be loaded:", error);
  }
}

loadImpactStats();