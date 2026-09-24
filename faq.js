document.addEventListener("DOMContentLoaded", function () {

  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqItems.length) return;

  faqItems.forEach(function (item) {

    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!question || !answer) return;

    // Start closed
    answer.hidden = true;
    question.setAttribute("aria-expanded", "false");

    question.addEventListener("click", function () {

      const isOpen = item.classList.contains("active");

      if (isOpen) {

        item.classList.remove("active");
        question.setAttribute("aria-expanded", "false");
        answer.hidden = true;

      } else {

        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
        answer.hidden = false;

      }

    });

  });

});
