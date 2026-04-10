const SEARCH_API = "/api/products/search";
let searchTimeout = null;

function initSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    clearTimeout(searchTimeout);

    if (query.length < 2) {
      searchResults.classList.remove("active");
      return;
    }

    searchTimeout = setTimeout(() => {
      searchProducts(query);
    }, 300);
  });

  searchInput.addEventListener("focus", () => {
    const query = searchInput.value.trim();
    if (query.length >= 2) {
      searchResults.classList.add("active");
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      searchResults.classList.remove("active");
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        window.location.href = `product.html?search=${encodeURIComponent(query)}`;
      }
    }
    if (e.key === "Escape") {
      searchResults.classList.remove("active");
      searchInput.blur();
    }
  });
}

async function searchProducts(query) {
  const searchResults = document.getElementById("searchResults");

  try {
    const res = await fetch(`${SEARCH_API}?q=${encodeURIComponent(query)}`);

    if (!res.ok) throw new Error("Search failed");

    const products = await res.json();

    displaySearchResults(products, query);
  } catch (err) {
    console.error("Search error:", err);
    searchResults.innerHTML = `<div class="search-error">Search failed. Try again.</div>`;
    searchResults.classList.add("active");
  }
}

function displaySearchResults(products, query) {
  const searchResults = document.getElementById("searchResults");

  if (products.length === 0) {
    searchResults.innerHTML = `
      <div class="search-no-results">
        <i class="fas fa-search"></i>
        <span>No products found for "${escapeHtml(query)}"</span>
      </div>
    `;
    searchResults.classList.add("active");
    return;
  }

  let html = "";

  products.forEach((product) => {
    const imageSrc = getProductImage(product.image);
    const price = product.price.toLocaleString("en-IN");

    html += `
      <a href="product.html?id=${product._id}" class="search-result-item">
        <img src="${imageSrc}" alt="${escapeHtml(product.name)}" class="search-result-img">
        <div class="search-result-info">
          <span class="search-result-name">${highlightMatch(product.name, query)}</span>
          <span class="search-result-category">${escapeHtml(product.category)}</span>
          <span class="search-result-price">₹${price}</span>
        </div>
        <i class="fas fa-arrow-right search-result-arrow"></i>
      </a>
    `;
  });

  searchResults.innerHTML = html;
  searchResults.classList.add("active");
}

function getProductImage(image) {
  if (!image) return "/images/placeholder.png";
  if (image.startsWith("http")) return image;
  if (image.includes("cloudinary")) return image;
  return `/images/${image}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function highlightMatch(text, query) {
  if (!query) return escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return escapeHtml(text).replace(regex, "<strong>$1</strong>");
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

document.addEventListener("DOMContentLoaded", initSearch);
