document.addEventListener("DOMContentLoaded", function () {
  // Set basePath depending on current folder (adjusts for pages/ folder)
  let basePath = "";
  if (window.location.pathname.includes("/pages/")) {
    basePath = "../";
  }

  // loadHTML returns a Promise so we can wait for the content to load
  function loadHTML(selector, url) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${url}: ${response.statusText}`);
        }
        return response.text();
      })
      .then((data) => {
        document.querySelector(selector).innerHTML = data;
        // When the navbar is loaded, update the logo and set up transitions.
        if (selector === "#navbar-container") {
          updateLogo();
          setupPageTransition();
        }
        return true;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  }

  // Update the logo based on the current theme
  function updateLogo() {
    const logo = document.getElementById("logo");
    if (logo) {
      const newSrc =
        basePath +
        "assets/images/" +
        (document.body.classList.contains("dark-mode") ? "logob.png" : "logo.png");
      logo.src = newSrc;
      console.log("Logo source set to:", newSrc);
    } else {
      console.error("Logo element not found");
    }
  }

  // Set up sliding transition on navbar links
  function setupPageTransition() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        document.body.classList.add('slide-out');
        setTimeout(() => {
          window.location.href = target;
        }, 500);
      });
    });
  }

  // Initialize dark/light theme toggle functionality
  function initThemeToggle() {
    const toggleButton = document.getElementById("theme-toggle");
    if (!toggleButton) return;
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.body.classList.add("dark-mode");
      toggleButton.textContent = "Light Mode";
    } else {
      document.body.classList.remove("dark-mode");
      toggleButton.textContent = "Dark Mode";
    }
    updateLogo();
    toggleButton.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      toggleButton.textContent = isDark ? "Light Mode" : "Dark Mode";
      localStorage.setItem("theme", isDark ? "dark" : "light");
      updateLogo();
    });
  }

  // Optional: Initialize sidebar functionality if defined in sidebar.js
  function initSidebar() {
    if (typeof window.initSidebar === "function") {
      window.initSidebar();
    } else {
      console.log("initSidebar not defined; ensure sidebar.js is loaded if needed.");
    }
  }

  // Load the common components in parallel, then initialize everything
  Promise.all([
    loadHTML("#sidebar-container", basePath + "components/sidebar.html"),
    loadHTML("#navbar-container", basePath + "components/navbar.html"),
    loadHTML("#footer-container", basePath + "components/footer.html")
  ]).then(() => {
    initThemeToggle();
    initSidebar(); // Initialize sidebar events after injection
    // Apply slide-in animation on page load
    document.body.classList.add('slide-in');
    setTimeout(() => {
      document.body.classList.remove('slide-in');
    }, 500);
  });
});
