
/* =========================================================
   GIRLS UNPLUGGED — COUNTRY BUBBLES CMS
   Country names and codes are stored in homepage_content.
========================================================= */

(function () {
  "use strict";

  /*
   * These are initial values for the admin editor only.
   * Once saved, homepage_content in Supabase is the source
   * of truth and can be changed through the admin dashboard.
   */
  const INITIAL_COUNTRIES = [
    { name: "Nigeria", code: "ng" },
    { name: "Ghana", code: "gh" },
    { name: "Kenya", code: "ke" },
    { name: "Zambia", code: "zm" },
    { name: "Sierra Leone", code: "sl" },
    { name: "Uganda", code: "ug" }
  ];

  const BUBBLE_POSITIONS = [
    "border-dot-one",
    "border-dot-two",
    "border-dot-three",
    "border-dot-four",
    "border-dot-five",
    "border-dot-six"
  ];

  function getBordersRecord(records) {
    return records.find((record) =>
      record.content_key === "borders" ||
      String(record.section || "")
        .toLowerCase()
        .includes("border")
    );
  }

  function renderCountryBubbles(countries) {
    const container = document.querySelector(
      "[data-country-bubbles]"
    );

    if (!container || !Array.isArray(countries)) return;

    container.replaceChildren();

    countries.slice(0, BUBBLE_POSITIONS.length).forEach(
      (country, index) => {
        const name = String(country.name || "").trim();
        const code = String(country.code || "")
          .trim()
          .toLowerCase();

        // Only accept two-letter country codes.
        if (!name || !/^[a-z]{2}$/.test(code)) return;

        const bubble = document.createElement("span");
        bubble.className =
          `border-dot ${BUBBLE_POSITIONS[index]}`;
        bubble.title = name;
        bubble.setAttribute("role", "img");
        bubble.setAttribute("aria-label", name);

        const flag = document.createElement("img");
        flag.src = `https://flagcdn.com/w80/${code}.png`;
        flag.alt = `Flag of ${name}`;
        flag.loading = "lazy";
        flag.decoding = "async";

        // Never replace a missing flag with country initials.
        flag.addEventListener("error", () => {
          bubble.remove();
        }, { once: true });

        bubble.appendChild(flag);
        container.appendChild(bubble);
      }
    );
  }

  async function loadCountryBubbles() {
    const container = document.querySelector(
      "[data-country-bubbles]"
    );

    if (!container || typeof supabaseClient === "undefined") return;

    try {
      const { data, error } = await supabaseClient
        .from("homepage_content")
        .select("*")
        .eq("published", true);

      if (error) throw error;

      const record = getBordersRecord(data || []);
      const countries = record?.content?.countries;

      if (Array.isArray(countries)) {
        renderCountryBubbles(countries);
      } else {
        console.warn(
          "Country bubbles need to be saved in the admin dashboard."
        );
      }
    } catch (error) {
      console.error("Could not load country flags:", error);
    }
  }

  /*
   * Admin integration:
   * Add the initial country list to the Borders section only
   * when the CMS has no country list yet. The admin can then
   * edit the names and two-letter codes and save them.
   */
  if (
    document.querySelector("#homepage-editor") &&
    typeof window.loadHomepage === "function"
  ) {
    const originalLoadHomepage = window.loadHomepage;

    window.loadHomepage = async function () {
      await originalLoadHomepage();

      if (
        typeof homepageContent === "undefined" ||
        typeof renderHomepage !== "function"
      ) {
        return;
      }

      const record = getBordersRecord(homepageContent);

      if (!record) return;

      if (!record.content || typeof record.content !== "object") {
        record.content = {};
      }

      if (!Array.isArray(record.content.countries)) {
        record.content.countries = INITIAL_COUNTRIES.map(
          (country) => ({ ...country })
        );

        renderHomepage();
      }
    };
  }

  document.addEventListener(
    "DOMContentLoaded",
    loadCountryBubbles
  );
})();
