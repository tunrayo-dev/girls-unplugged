
(() => {
  "use strict";

  const SUPABASE_URL = "https://siiysnvzwjoyvmxqjruz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_jT9aTC0gXSYO8sel2kDVtQ_HmsSI3Q4";

  async function loadPageContent() {
    const pageSlug = location.pathname
      .split("/")
      .pop()
      .replace(/\.html$/, "") || "index";

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/page_content_items?select=page_slug,section_key,title,description,metadata,display_order&published=eq.true&page_slug=eq.${encodeURIComponent(pageSlug)}&order=display_order.asc`,
        {
          headers: { apikey: SUPABASE_KEY },
          cache: "no-cache"
        }
      );

      if (!response.ok) {
        throw new Error("Could not load published page content.");
      }

      const items = await response.json();

      items.forEach((item) => {
        const section = document.getElementById(item.section_key);
        if (!section) return;

        if (item.title) {
          const heading = section.querySelector("h2");
          if (heading) heading.textContent = item.title;
        }

        if (item.description) {
          const paragraph = section.querySelector(
            ".section-heading > p, p"
          );
          if (paragraph) paragraph.textContent = item.description;
        }
      });
    } catch (error) {
      console.error("Page content CMS:", error);
    }
  }

  document.addEventListener("DOMContentLoaded", loadPageContent);
})();
