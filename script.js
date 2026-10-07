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

window.animateStatCounter = animateCounter;

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


function updateHomepageSection(contentKey, content) {

  if (!content) return;


  /* ======================================
     HELPERS
  ====================================== */

  const setText = (selector, value) => {

    const element = document.querySelector(selector);

    if (
      element &&
      value !== undefined &&
      value !== null
    ) {
      element.textContent = value;
    }

  };


  const setLink = (selector, value) => {

    const element = document.querySelector(selector);

    if (
      element &&
      value
    ) {
      element.href = value;
    }

  };


  /* ======================================
     HERO
  ====================================== */

  if (contentKey === "hero") {

    setText(
      ".hero-text .section-label",
      content.eyebrow
    );

    const heading =
      document.querySelector(".hero-text h1");

    if (heading) {

      const highlight =
        heading.querySelector(".hero-highlight");

      heading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `\n            ${content.headline || ""}\n            `;
        }

      });

      if (highlight) {
        highlight.textContent =
          content.highlight || "";
      }

    }

    setText(
      ".hero-description",
      content.description
    );


    const heroButtons =
      document.querySelectorAll(
        ".hero-buttons .btn"
      );


    if (heroButtons[0]) {

      heroButtons[0].textContent =
        content.primary?.text ||
        content.primary ||
        "Join the Sisterhood";

      heroButtons[0].href =
        content.primary?.url ||
        "get-involved.html";

    }


    if (heroButtons[1]) {

      heroButtons[1].textContent =
        content.secondary?.text ||
        content.secondary ||
        "Explore the Circle";

      heroButtons[1].href =
        content.secondary?.url ||
        "circle.html";

    }


    setText(
      ".hero-note > .hero-note > span:last-child",
      content.note
    );

  }


  /* ======================================
     WELCOME
  ====================================== */

  if (contentKey === "welcome") {

    const section =
      document.querySelector("#welcome");

    if (!section) return;


    setText(
      "#welcome .section-label",
      content.label
    );


    const heading =
      section.querySelector("h2");

    if (heading) {

      const highlight =
        heading.querySelector("span");

      if (highlight) {
        highlight.textContent =
          content.highlight || "";
      }

      heading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `${content.heading || ""} `;
        }

      });

    }


    setText(
      "#welcome .section-heading > p",
      content.intro
    );


    const paragraphs =
      section.querySelectorAll(
        ".welcome-text > p"
      );


    if (paragraphs[0]) {
      paragraphs[0].textContent =
        content.paragraph1 || "";
    }

    if (paragraphs[1]) {
      paragraphs[1].textContent =
        content.paragraph2 || "";
    }

    if (paragraphs[2]) {
      paragraphs[2].textContent =
        content.paragraph3 || "";
    }


    setText(
      "#welcome .welcome-text .btn",
      content.button?.text ||
      content.button
    );


    setLink(
      "#welcome .welcome-text .btn",
      content.button?.url ||
      "circle.html"
    );


    if (Array.isArray(content.cards)) {

      const cards =
        section.querySelectorAll(
          ".welcome-card"
        );


      content.cards.forEach(
        (card, index) => {

          const element = cards[index];

          if (!element) return;


          setText(
            element.querySelector("h3"),
            card.title
          );

          setText(
            element.querySelector("p"),
            card.description
          );

        }
      );

    }

  }


  /* ======================================
     WHY WE EXIST
  ====================================== */

  if (contentKey === "why_we_exist") {

    const section =
      document.querySelector(
        "#why-we-exist"
      );

    if (!section) return;


    setText(
      "#why-we-exist .section-label",
      content.label
    );


    const heading =
      section.querySelector("h2");

    if (heading) {

      const highlight =
        heading.querySelector("span");

      if (highlight) {
        highlight.textContent =
          content.highlight || "";
      }

      heading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `\n            ${content.heading || ""}\n            `;
        }

      });

    }


    const paragraphs =
      section.querySelectorAll(
        ".why-intro > p"
      );


    if (paragraphs[0]) {
      paragraphs[0].textContent =
        content.paragraph1 || "";
    }

    if (paragraphs[1]) {
      paragraphs[1].textContent =
        content.paragraph2 || "";
    }


    if (Array.isArray(content.cards)) {

      const cards =
        section.querySelectorAll(
          ".why-card"
        );


      content.cards.forEach(
        (card, index) => {

          const element = cards[index];

          if (!element) return;


          setText(
            element.querySelector(".why-number"),
            card.number
          );

          setText(
            element.querySelector("h3"),
            card.title
          );

          setText(
            element.querySelector("p"),
            card.description
          );

        }
      );

    }

  }


  /* ======================================
     VALUES
  ====================================== */

  if (contentKey === "values") {

    const section =
      document.querySelector(
        "#what-we-believe"
      );

    if (!section) return;


    setText(
      "#what-we-believe .section-label",
      content.label
    );


    const heading =
      section.querySelector("h2");

    if (heading) {

      const highlight =
        heading.querySelector("span");

      if (highlight) {
        highlight.textContent =
          content.highlight || "";
      }

      heading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `\n            ${content.heading || ""}\n            `;
        }

      });

    }


    setText(
      "#what-we-believe .section-heading > p",
      content.description
    );


    if (Array.isArray(content.values)) {

      const cards =
        section.querySelectorAll(
          ".value-card"
        );


      content.values.forEach(
        (value, index) => {

          const element = cards[index];

          if (!element) return;


          setText(
            element.querySelector("h3"),
            value.title
          );

          setText(
            element.querySelector("p"),
            value.description
          );

        }
      );

    }

  }


  /* ======================================
     INSIDE THE CIRCLE
  ====================================== */

  if (contentKey === "circle_preview") {

    const section =
      document.querySelector(
        "#bloom-glow"
      );

    if (!section) return;


    setText(
      "#bloom-glow .section-label",
      content.label
    );


    const heading =
      section.querySelector("h2");

    if (heading) {

      const highlight =
        heading.querySelector("span");

      if (highlight) {
        highlight.textContent =
          content.highlight || "";
      }

      heading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `\n            ${content.heading || ""}\n            `;
        }

      });

    }


    setText(
      "#bloom-glow .section-heading > p",
      content.description
    );


    if (Array.isArray(content.days)) {

      const cards =
        section.querySelectorAll(
          ".circle-day"
        );


      content.days.forEach(
        (day, index) => {

          const element = cards[index];

          if (!element) return;


          setText(
            element.querySelector(
              ".circle-day-number"
            ),
            day.number
          );

          setText(
            element.querySelector(
              ".circle-day-label"
            ),
            day.day
          );

          setText(
            element.querySelector("h3"),
            day.title
          );

          setText(
            element.querySelector("p"),
            day.description
          );

          setText(
            element.querySelector(".circle-tag"),
            day.tag
          );

        }
      );

    }


    setText(
      "#bloom-glow .circle-preview-footer p",
      content.footer
    );

  }


  /* ======================================
     SISTERHOOD WITHOUT BORDERS
  ====================================== */

  if (contentKey === "borders") {

    const section =
      document.querySelector(
        ".borders-section"
      );

    if (!section) return;


    setText(
      ".borders-section .section-label",
      content.label
    );


    const heading =
      section.querySelector("h2");

    if (heading) {

      const highlight =
        heading.querySelector("span");

      if (highlight) {
        highlight.textContent =
          content.highlight || "";
      }

      heading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `\n            ${content.heading || ""}\n            `;
        }

      });

    }


    setText(
      ".borders-section .section-heading > p",
      content.description
    );


    const stats =
      section.querySelectorAll(
        ".border-stat"
      );


    if (Array.isArray(content.stats)) {

      content.stats.forEach(
        (stat, index) => {

          const element = stats[index];

          if (!element) return;


          const number =
            element.querySelector(".stat-number");

          if (number) {

  number.dataset.target =
    stat.value;

  number.dataset.suffix =
    stat.suffix || "";

  number.textContent =
    `0${stat.suffix || ""}`;

  number.dataset.counted = "false";

  number.classList.remove("counted");

  if (window.animateStatCounter) {
    window.animateStatCounter(number);
  }

}

          setText(
            element.querySelector(".stat-label"),
            stat.label
          );

          setText(
            element.querySelector("small"),
            stat.description
          );

        }
      );

    }


    setText(
      ".borders-message .section-label",
      content.message_label
    );

    setText(
      ".borders-message h3",
      content.message_heading
    );

  }


  /* ======================================
     IMPACT PREVIEW
  ====================================== */

  if (contentKey === "impact_preview") {

    const section =
      document.querySelector(
        "#impact-preview"
      );

    if (!section) return;


    setText(
      "#impact-preview .section-label",
      content.label
    );


    const heading =
      section.querySelector("h2");

    if (heading) {

      const highlight =
        heading.querySelector("span");

      if (highlight) {
        highlight.textContent =
          content.highlight || "";
      }

      heading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `\n            ${content.heading || ""}\n            `;
        }

      });

    }


    setText(
      "#impact-preview .section-heading > p",
      content.description
    );


    if (Array.isArray(content.cards)) {

      const cards =
        section.querySelectorAll(
          ".impact-preview-card"
        );


      content.cards.forEach(
        (card, index) => {

          const element = cards[index];

          if (!element) return;


          setText(
            element.querySelector("h3"),
            card.title
          );

          setText(
            element.querySelector("p"),
            card.description
          );

          setText(
            element.querySelector(
              ".impact-preview-link"
            ),
            card.link
          );

        }
      );

    }


    setText(
      "#impact-preview .impact-preview-cta .section-label",
      content.cta?.label
    );

    const ctaHeading =
      document.querySelector(
        "#impact-preview .impact-preview-cta h3"
      );

    if (ctaHeading) {

      const highlight =
        ctaHeading.querySelector("span");

      if (highlight) {
        highlight.textContent =
          content.cta?.highlight || "";
      }

      ctaHeading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `\n            ${content.cta?.heading || ""}\n            `;
        }

      });

    }


    setText(
      "#impact-preview .impact-preview-cta .btn",
      content.cta?.button?.text
    );

    setLink(
      "#impact-preview .impact-preview-cta .btn",
      content.cta?.button?.url
    );

  }


  /* ======================================
     VOICES
  ====================================== */

  if (contentKey === "voices") {

    const section =
      document.querySelector(
        "#voices"
      );

    if (!section) return;


    setText(
      "#voices .section-label",
      content.label
    );


    const heading =
      section.querySelector("h2");

    if (heading) {

      const highlight =
        heading.querySelector("span");

      if (highlight) {
        highlight.textContent =
          content.highlight || "";
      }

      heading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `\n            ${content.heading || ""}\n            `;
        }

      });

    }


    setText(
      "#voices .voices-heading > p",
      content.description
    );


    setText(
      "#voices .voices-message h3",
      content.message_heading
    );


    const paragraphs =
      section.querySelectorAll(
        ".voices-message > p"
      );


    if (paragraphs[0]) {
      paragraphs[0].textContent =
        content.paragraph1 || "";
    }

    if (paragraphs[1]) {
      paragraphs[1].textContent =
        content.paragraph2 || "";
    }


    setText(
      "#voices .text-link",
      content.button?.text
    );

    setLink(
      "#voices .text-link",
      content.button?.url
    );


    setText(
      "#voices .voices-placeholder-label",
      content.placeholder?.label
    );


    setText(
      "#voices .voices-placeholder-card h3",
      content.placeholder?.heading
    );


    setText(
      "#voices .voices-placeholder-card p",
      content.placeholder?.description
    );

  }


  /* ======================================
     FINAL CTA
  ====================================== */

  if (contentKey === "final_cta") {

    const section =
      document.querySelector(
        "#join"
      );

    if (!section) return;


    setText(
      "#join .section-label",
      content.eyebrow
    );


    const heading =
      section.querySelector("h2");

    if (heading) {

      const highlight =
        heading.querySelector("span");

      if (highlight) {
        highlight.textContent =
          content.highlight || "";
      }

      heading.childNodes.forEach((node) => {

        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent =
            `\n            ${content.headline || ""}\n            `;
        }

      });

    }


    const paragraphs =
      section.querySelectorAll(
        ".final-cta-content > p"
      );


    if (paragraphs[0]) {
      paragraphs[0].textContent =
        content.description ||
        content.paragraph1 ||
        "";
    }

    if (paragraphs[1]) {
      paragraphs[1].textContent =
        content.paragraph2 ||
        "";
    }


    const buttons =
      section.querySelectorAll(
        ".final-cta-buttons .btn"
      );


    if (buttons[0]) {

      buttons[0].textContent =
        content.primary?.text ||
        content.primary ||
        "Join the Sisterhood";

      buttons[0].href =
        content.primary?.url ||
        "get-involved.html";

    }


    if (buttons[1]) {

      buttons[1].textContent =
        content.secondary?.text ||
        content.secondary ||
        "Explore the Circle";

      buttons[1].href =
        content.secondary?.url ||
        "circle.html";

    }


    setText(
      "#join .final-cta-note span:nth-child(2)",
      content.note
    );

  }

}


/* =========================================================
   TEAM PREVIEW
   ========================================================= */

async function loadTeamPreview() {

  if (typeof supabaseClient === "undefined") {
    return;
  }

  const section =
    document.querySelector("#team-preview");

  if (!section) {
    return;
  }

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("team_members")
      .select("*")
      .eq("published", true)
      .order("display_order", {
        ascending: true
      })
      .order("id", {
        ascending: true
      })
      .limit(4);

    if (error) {

      console.error(
        "Team preview error:",
        error
      );

      return;
    }

    const cards =
      section.querySelectorAll(
        ".team-preview-card"
      );

    (data || []).forEach(
      (member, index) => {

        const card =
          cards[index];

        if (!card) {
          return;
        }

        const image =
          card.querySelector(
            "[data-team-preview-image]"
          );

        const fallback =
          card.querySelector(
            ".team-image-fallback"
          );

        if (
          image &&
          member.image_url
        ) {

          image.src =
            member.image_url;

          image.alt =
            member.name
              ? `${member.name} — ${
                  member.role ||
                  "Girls Unplugged team member"
                }`
              : "Girls Unplugged team member";

          image.classList.add(
            "loaded"
          );

          if (fallback) {
            fallback.hidden = true;
          }

        }

        const role =
          card.querySelector(
            ".team-role"
          );

        const name =
          card.querySelector(
            "h3"
          );

        const bio =
          card.querySelector(
            ".team-preview-content > p"
          );

        if (
          role &&
          member.role
        ) {
          role.textContent =
            member.role;
        }

        if (
          name &&
          member.name
        ) {
          name.textContent =
            member.name;
        }

        if (
          bio &&
          member.bio
        ) {
          bio.textContent =
            member.bio;
        }

      }
    );

  } catch (error) {

    console.error(
      "Could not load team preview:",
      error
    );

  }

}


/* =========================================================
   GUEST SPEAKERS PREVIEW
   ========================================================= */

async function loadSpeakerPreview() {

  if (typeof supabaseClient === "undefined") {
    return;
  }

  const section =
    document.querySelector(
      "#speakers-preview"
    );

  if (!section) {
    return;
  }

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("speakers")
      .select("*")
      .eq("published", true)
      .order("display_order", {
        ascending: true
      })
      .order("id", {
        ascending: true
      })
      .limit(3);

    if (error) {

      console.error(
        "Speaker preview error:",
        error
      );

      return;
    }

    const cards =
      section.querySelectorAll(
        ".speaker-preview-card"
      );

    (data || []).forEach(
      (speaker, index) => {

        const card =
          cards[index];

        if (!card) {
          return;
        }

        const image =
          card.querySelector(
            "[data-speaker-preview-image]"
          );

        const fallback =
          card.querySelector(
            ".speaker-image-fallback"
          );

        if (
          image &&
          speaker.image_url
        ) {

          image.src =
            speaker.image_url;

          image.alt =
            speaker.name
              ? `${speaker.name} — ${
                  speaker.role ||
                  "Guest speaker"
                }`
              : "Girls Unplugged guest speaker";

          image.classList.add(
            "loaded"
          );

          if (fallback) {
            fallback.hidden = true;
          }

        }

        const tag =
          card.querySelector(
            ".speaker-preview-tag"
          );

        const heading =
          card.querySelector(
            "h3"
          );

        const bio =
          card.querySelector(
            ".speaker-preview-content > p"
          );

        if (
          tag &&
          speaker.role
        ) {
          tag.textContent =
            speaker.role;
        }

        if (
          heading &&
          speaker.name
        ) {
          heading.textContent =
            speaker.name;
        }

        if (
          bio &&
          speaker.bio
        ) {
          bio.textContent =
            speaker.bio;
        }

      }
    );

  } catch (error) {

    console.error(
      "Could not load speaker preview:",
      error
    );

  }

}


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadHomepageContent();

    loadTeamPreview();

    loadSpeakerPreview();

  }
);