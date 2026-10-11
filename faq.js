
document.addEventListener("DOMContentLoaded", () => {
  const faqSection = document.getElementById("faq-list");
  if (!faqSection) return;

  const supabaseUrl = "https://siiysnvzwjoyvmxqjruz.supabase.co";
  const supabaseKey = "sb_publishable_jT9aTC0gXSYO8sel2kDVtQ_HmsSI3Q4";

  if (!window.supabase) {
    console.error("Supabase did not load. Keeping existing FAQs.");
    initialiseAccordions();
    return;
  }

  const db = window.supabase.createClient(supabaseUrl, supabaseKey);
  loadPublishedFAQs();

  async function loadPublishedFAQs() {
    try {
      const { data, error } = await db
        .from("faq_items")
        .select("id, question, answer, category, display_order")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .order("id", { ascending: true });

      if (error) throw error;

      // Keep the existing website FAQs until database content is available.
      if (!Array.isArray(data) || data.length === 0) {
        initialiseAccordions();
        return;
      }

      renderFAQs(data);
      initialiseAccordions();
    } catch (error) {
      console.error("Could not load published FAQs:", error);
      initialiseAccordions();
    }
  }

  function renderFAQs(items) {
    const container = faqSection.querySelector(".container");
    if (!container) return;

    const groups = new Map();

    items.forEach((item) => {
      const category = (item.category || "General").trim() || "General";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(item);
    });

    container.replaceChildren();

    let categoryNumber = 0;

    groups.forEach((questions, category) => {
      categoryNumber++;

      const heading = document.createElement("div");
      heading.className = "section-heading";

      const label = document.createElement("span");
      label.className = "section-label";
      label.textContent =
        String(categoryNumber).padStart(2, "0") + " · " + category;

      const title = document.createElement("h2");
      title.textContent = category;

      heading.append(label, title);

      const list = document.createElement("div");
      list.className = "faq-list";

      questions.forEach((item) => {
        const article = document.createElement("article");
        article.className = "faq-item";

        const button = document.createElement("button");
        button.className = "faq-question";
        button.type = "button";
        button.setAttribute("aria-expanded", "false");

        const questionText = document.createElement("span");
        questionText.textContent = item.question;

        const icon = document.createElement("span");
        icon.className = "faq-icon";
        icon.setAttribute("aria-hidden", "true");

        button.append(questionText, icon);

        const answer = document.createElement("div");
        answer.className = "faq-answer";

        String(item.answer || "")
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .forEach((paragraphText) => {
            const paragraph = document.createElement("p");
            appendSafeTextAndLinks(paragraph, paragraphText);
            answer.appendChild(paragraph);
          });

        article.append(button, answer);
        list.appendChild(article);
      });

      container.append(heading, list);
    });
  }

  // Supports safe links written as:
  // [Join the Circle](https://example.com)
  // All other content is inserted as plain text, not HTML.

function appendSafeTextAndLinks(element, text) {
  // Supports **bold text** and [link text](URL).
  // Keeps content as text unless it is a recognized safe link.

  const pattern =
    /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    element.appendChild(
      document.createTextNode(text.slice(lastIndex, match.index))
    );

    // Bold Markdown: **important text**
    if (match[1] !== undefined) {
      const bold = document.createElement("strong");
      bold.textContent = match[1];
      element.appendChild(bold);
    } else {
      // Markdown link: [Join us](circle.html)
      try {
        const url = new URL(match[3], window.location.href);

        if (
          url.protocol === "https:" ||
          url.protocol === "http:"
        ) {
         
const link = document.createElement("a");
link.href = url.href;
link.textContent = match[2];

// Restore the original purple button style
if (/join the (whatsapp|circle|sisterhood)/i.test(match[2])) {
  link.className = "btn btn-secondary";
}

if (url.origin !== window.location.origin) {
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}


          if (url.origin !== window.location.origin) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
          }

          element.appendChild(link);
        } else {
          element.appendChild(document.createTextNode(match[0]));
        }
      } catch {
        element.appendChild(document.createTextNode(match[0]));
      }
    }

    lastIndex = pattern.lastIndex;
  }

  element.appendChild(
    document.createTextNode(text.slice(lastIndex))
  );
}

       

  function initialiseAccordions() {
    faqSection.querySelectorAll(".faq-item").forEach((item) => {
      const question = item.querySelector(".faq-question");
      if (!question || question.dataset.faqReady === "true") return;

      question.dataset.faqReady = "true";
      question.setAttribute("aria-expanded", "false");

      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");
        item.classList.toggle("active", !isOpen);
        question.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }
});
