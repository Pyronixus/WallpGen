import {
  setLanguage,
  getLanguage,
  t,
  getAvailableLanguages,
} from "./assets/js/translate.js";

function updateDOMText() {
  document.querySelectorAll("[data-translate]").forEach((el) => {
    const key = el.getAttribute("data-translate");
    el.textContent = t(key);
  });
}

function initializeLanguageSelector() {
  const languageBtn = document.getElementById("languageBtn");
  const languageMenu = document.getElementById("languageMenu");
  const currentLang = getLanguage();
  const languages = getAvailableLanguages();

  languageBtn.textContent =
    languages.find((l) => l.code === currentLang)?.flag || "🌐";

  languages.forEach((lang) => {
    const option = document.createElement("button");
    option.className =
      "language-option" + (lang.code === currentLang ? " active" : "");
    option.innerHTML = `
        <span class="language-option-flag">${lang.flag}</span>
        <span class="language-option-name">${lang.name}</span>
      `;
    option.onclick = () => {
      setLanguage(lang.code);
      updateDOMText();
      languageBtn.textContent = lang.flag;
      document
        .querySelectorAll(".language-option")
        .forEach((o) => o.classList.remove("active"));
      option.classList.add("active");
      languageMenu.style.display = "none";
    };
    languageMenu.appendChild(option);
  });

  languageBtn.onclick = (e) => {
    e.stopPropagation();
    languageMenu.style.display =
      languageMenu.style.display === "none" ? "grid" : "none";
  };

  document.addEventListener("click", () => {
    languageMenu.style.display = "none";
  });
}

setLanguage(getLanguage());
updateDOMText();
initializeLanguageSelector();

function applyTheme(isDark) {
  const r = document.documentElement.style;
  if (isDark) {
    r.setProperty("--bg", "#0a0a0a");
    r.setProperty("--bg-card", "#151515");
    r.setProperty("--bg-hover", "#1e1e1e");
    r.setProperty("--bg-nav", "rgba(15,15,15,0.85)");
    r.setProperty("--text", "#f0f0f0");
    r.setProperty("--text-muted", "#888");
    r.setProperty("--border", "#222");
    r.setProperty("--bg-image", 'url("../assets/img/background-d.png")');
  } else {
    r.setProperty("--bg", "#f0f0f0");
    r.setProperty("--bg-card", "#ffffff");
    r.setProperty("--bg-hover", "#e4e4e4");
    r.setProperty("--bg-nav", "rgba(240,240,240,0.85)");
    r.setProperty("--text", "#111");
    r.setProperty("--text-muted", "#666");
    r.setProperty("--border", "#ddd");
    r.setProperty("--bg-image", 'url("../assets/img/background-l.png")');
  }
}

const saved = localStorage.getItem("wllpr-theme") || "dark";
applyTheme(saved === "dark");
if (saved === "light") {
  document.getElementById("themeLight").classList.add("active");
  document.getElementById("themeDark").classList.remove("active");
}

document.getElementById("themeDark").onclick = () => {
  localStorage.setItem("wllpr-theme", "dark");
  applyTheme(true);
  document.getElementById("themeDark").classList.add("active");
  document.getElementById("themeLight").classList.remove("active");
};

document.getElementById("themeLight").onclick = () => {
  localStorage.setItem("wllpr-theme", "light");
  applyTheme(false);
  document.getElementById("themeLight").classList.add("active");
  document.getElementById("themeDark").classList.remove("active");
};
