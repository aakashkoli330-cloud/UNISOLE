/* ==========================================================
   UNISOLE — TOAST NOTIFICATIONS JS
   Global toast system
   ========================================================== */

(function () {
  const CONTAINER_ID = "toast-container";

  function getContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement("div");
      container.id = CONTAINER_ID;
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  function createToastIcon(type) {
    const icons = {
      success: '<i class="fas fa-check"></i>',
      error: '<i class="fas fa-times"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>',
      info: '<i class="fas fa-info-circle"></i>',
    };
    return icons[type] || icons.info;
  }

  window.showToast = function (options = {}) {
    const {
      type = "info",
      title = "",
      message = "",
      duration = 4000,
      dismissible = true,
    } = options;

    const container = getContainer();

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.style.setProperty("--toast-duration", `${duration}ms`);

    toast.innerHTML = `
      <div class="toast-icon">${createToastIcon(type)}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ""}
        ${message ? `<div class="toast-message">${message}</div>` : ""}
      </div>
      ${dismissible ? '<button class="toast-close"><i class="fas fa-times"></i></button>' : ""}
      <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    if (dismissible) {
      toast.querySelector(".toast-close").addEventListener("click", () => {
        dismissToast(toast);
      });
    }

    setTimeout(() => {
      dismissToast(toast);
    }, duration);

    return toast;
  };

  function dismissToast(toast) {
    if (!toast || toast.classList.contains("toast-exit")) return;

    toast.classList.add("toast-exit");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  window.showToast.success = function (message, title = "Success") {
    return window.showToast({ type: "success", title, message });
  };

  window.showToast.error = function (message, title = "Error") {
    return window.showToast({ type: "error", title, message });
  };

  window.showToast.warning = function (message, title = "Warning") {
    return window.showToast({ type: "warning", title, message });
  };

  window.showToast.info = function (message, title = "Info") {
    return window.showToast({ type: "info", title, message });
  };
})();
