// src/utils/modal.js
document.addEventListener("DOMContentLoaded", () => {
  // Get all elements with data-toggle="modal" attribute
  const modalTogglers = document.querySelectorAll('[data-toggle="modal"]');

  // Get all elements with data-dismiss="modal" attribute
  const modalDismissers = document.querySelectorAll('[data-dismiss="modal"]');

  // Add click event listeners to modal togglers
  modalTogglers.forEach((toggler) => {
    toggler.addEventListener("click", (e) => {
      e.preventDefault();

      // Get the target modal ID
      const modalId = toggler.getAttribute("data-target");

      // Show the modal
      const modal = document.querySelector(modalId);
      if (modal) {
        modal.style.display = "block";
      }
    });
  });

  // Add click event listeners to modal dismissers
  modalDismissers.forEach((dismisser) => {
    dismisser.addEventListener("click", (e) => {
      e.preventDefault();

      // Find the parent modal
      const modal = dismisser.closest(".modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  });

  // Close modal when clicking outside the modal content
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });

  // Close modal with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModals = document.querySelectorAll(
        '.modal[style*="display: block"]'
      );
      openModals.forEach((modal) => {
        modal.style.display = "none";
      });
    }
  });
});
