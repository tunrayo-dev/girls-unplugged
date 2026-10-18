
(() => {
  "use strict";

  const SUPABASE_URL = "https://siiysnvzwjoyvmxqjruz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_jT9aTC0gXSYO8sel2kDVtQ_HmsSI3Q4";

  async function loadPageContent() {
    const pageSlug = location.pathname.split("/").pop()
      .replace(/\.html$/, "") || "index";

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/page_content_items?select=page_slug,section_key,title,description,metadata,display_order&published=eq.true&page_slug=eq.${encodeURIComponent(pageSlug)}&order=display_order.asc`,
        {
          headers: { apikey: SUPABASE_KEY },
          cache: "no-cache"
        }
      );

      if (!response.ok) throw new Error("Could not load published content.");

      const items = await response.json();

      items.forEach((item) => {
        const section = document.getElementById(item.section_key);
        if (!section) return;

        const data = item.metadata && typeof item.metadata === "object"
          ? item.metadata : {};

        const heading = section.querySelector(".section-heading h2");
        if (heading && (item.title || data.heading)) {
          heading.textContent = data.heading || item.title;
        }

        const intro = section.querySelector(".section-heading > p");
        const introText = data.intro || item.description || data.description;
        if (intro && introText) intro.textContent = introText;

        const label = section.querySelector(".section-label");
        if (label && data.label) label.textContent = data.label;

        if (Array.isArray(data.bodyParagraphs)) {
          let paragraphs = [];

          if (item.section_key === "our-story") {
            paragraphs = [
              ...section.querySelectorAll(".welcome-grid > div:first-child > p")
            ];
          } else if (item.section_key === "founder-message") {
            paragraphs = [
              ...section.querySelectorAll(".founder-message-body > p")
            ];
          }

          data.bodyParagraphs.forEach((text, index) => {
            if (paragraphs[index] && typeof text === "string") {
              paragraphs[index].textContent = text;
            }
          });
        }

        
const cardSelector = {
  "our-story": ".welcome-card",
  "why-we-exist": ".why-card",
  "what-we-are-building": ".why-card",
  "our-values": ".value-card"
}[item.section_key];

if (cardSelector && Array.isArray(data.cards)) {
  const containerSelector = {
    "our-story": ".welcome-cards",
    "why-we-exist": ".why-grid",
    "our-values": ".values-grid"
  }[item.section_key];

  const container = section.querySelector(containerSelector);
  if (!container) return;

  let cards = Array.from(container.querySelectorAll(cardSelector));

  while (cards.length > data.cards.length) {
    cards.pop().remove();
  }

  while (cards.length < data.cards.length && cards.length > 0) {
    const newCard = cards[0].cloneNode(true);
    container.appendChild(newCard);
    cards.push(newCard);
  }

  data.cards.forEach((cardData, index) => {
    const card = cards[index];
    if (!card || !cardData) return;

    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    const icon = card.querySelector(
      ".welcome-icon, .why-icon, .value-icon"
    );
    const number = card.querySelector(".why-number");
const footer = card.querySelector(".why-card-footer");

    if (title && typeof cardData.title === "string") {
      title.textContent = cardData.title;
    }

    if (description && typeof cardData.description === "string") {
      description.textContent = cardData.description;
    }

    if (icon && typeof cardData.icon === "string" && cardData.icon.trim()) {
      icon.textContent = cardData.icon;
    }
    if (number && typeof cardData.number === "string") {
  number.textContent = cardData.number;
}

if (footer && typeof cardData.footer === "string") {
  footer.textContent = cardData.footer;
}
  });
}
 
        

        if (item.section_key === "founder-message") {
          const subheading = section.querySelector(".founder-message-intro h3");
          const name = section.querySelector(".founder-signature strong");
          const role = section.querySelector(".founder-signature span:not(.founder-signature-line)");

          if (subheading && data.subheading) {
            subheading.textContent = data.subheading;
          }
          if (name && data.founderName) name.textContent = data.founderName;
          if (role && data.founderRole) role.textContent = data.founderRole;
        }
      });
    } catch (error) {
      console.error("Page content CMS:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", loadPageContent);
})();
