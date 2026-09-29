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


  function formatNumber(number) {
    return new Intl.NumberFormat("en-US").format(number);
  }


  function getSuffix(element) {

    const suffix =
      element.getAttribute("data-suffix");

    return suffix === "+" ? "+" : "";

  }


  function updateStat(element, number) {

  const suffix =
    element.querySelector(".stat-suffix");

  element.firstChild.textContent =
    formatNumber(number);

  if (suffix) {
    suffix.textContent = "+";
  }

}


  function animateCounter(element) {

    const target =
      Number(element.getAttribute("data-target"));

    if (!Number.isFinite(target)) {
      return;
    }


    /* Prevent duplicate animation */

    if (element.dataset.counted === "true") {
      return;
    }

    element.dataset.counted = "true";


    /* Reduced motion */

    if (prefersReducedMotion) {

      updateStat(element, target);

      element.classList.add("counted");

      return;
    }


    const duration = 1800;
    const startTime = performance.now();


    function updateCounter(currentTime) {

      const elapsed =
        currentTime - startTime;

      const progress =
        Math.min(
          elapsed / duration,
          1
        );


      const easedProgress =
        1 - Math.pow(
          1 - progress,
          3
        );


      const currentValue =
        Math.floor(
          target * easedProgress
        );


      updateStat(
        element,
        currentValue
      );


      if (progress < 1) {

        requestAnimationFrame(
          updateCounter
        );

      } else {

        /* Always show the final suffix */

        updateStat(
          element,
          target
        );

        element.classList.add("counted");

      }

    }


    requestAnimationFrame(
      updateCounter
    );

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

                animateCounter(
                  entry.target
                );

                observer.unobserve(
                  entry.target
                );

              }

            });

          },
          {
            threshold: 0.5
          }
        );


      statNumbers.forEach((element) => {

        counterObserver.observe(
          element
        );

      });

    }

  }


  /* ======================================
     SMOOTH INTERNAL LINKS
  ====================================== */

  const internalLinks =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  internalLinks.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        const targetId =
          link.getAttribute("href");


        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }


        const target =
          document.querySelector(
            targetId
          );


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

      }
    );

  });


  /* ======================================
     CURRENT YEAR
  ====================================== */

  const yearElements =
    document.querySelectorAll(
      "[data-current-year]"
    );


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
    document.querySelector(
      ".back-to-top"
    );


  if (backToTop) {

    window.addEventListener(
      "scroll",
      () => {

        if (window.scrollY > 600) {

          backToTop.classList.add(
            "show"
          );

        } else {

          backToTop.classList.remove(
            "show"
          );

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


/* =========================================================
   HOMEPAGE CMS
   ========================================================= */

async function loadHomepageContent() {

  if (
    typeof supabaseClient === "undefined" ||
    !document.querySelector("main")
  ) {
    return;
  }

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("homepage_content")
      .select("*")
      .eq("published", true)
      .order("display_order", {
        ascending: true
      });

    if (error) {
      console.error(
        "Homepage CMS error:",
        error
      );
      return;
    }

    if (!data || !data.length) {
      return;
    }

    data.forEach((section) => {
      updateHomepageSection(
        section.content_key,
        section.content
      );
    });

  } catch (error) {

    console.error(
      "Could not load homepage content:",
      error
    );

  }

}


function updateHomepageSection(
  contentKey,
  content
) {

  if (!content) {
    return;
  }

  console.log(
    "Homepage section loaded:",
    contentKey
  );

}


document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadHomepageContent();

  }
);