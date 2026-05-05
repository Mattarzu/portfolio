(function () {
  const DEFAULT_LANGUAGE = "es-AR";
  const STORAGE_KEY = "mmlab_language";

  const SUPPORTED_LANGUAGES = [
    "es-AR",
    "en-GB",
    "es-ES",
    "ca",
    "it",
    "pt",
    "fr",
    "ru",
    "zh-CN"
  ];

  function getTranslations() {
    return window.MMLAB_TRANSLATIONS || {};
  }

  function normalizeLanguage(language) {
    if (!language) return DEFAULT_LANGUAGE;

    if (SUPPORTED_LANGUAGES.includes(language)) {
      return language;
    }

    const normalized = String(language).toLowerCase();
    const exact = SUPPORTED_LANGUAGES.find((item) => item.toLowerCase() === normalized);

    if (exact) return exact;

    const shortLanguage = normalized.split("-")[0];

    if (shortLanguage === "zh") return "zh-CN";
    if (shortLanguage === "en") return "en-GB";
    if (shortLanguage === "es") return DEFAULT_LANGUAGE;

    const partial = SUPPORTED_LANGUAGES.find((item) => {
      return item.toLowerCase().split("-")[0] === shortLanguage;
    });

    return partial || DEFAULT_LANGUAGE;
  }

  function getDictionary(language) {
    const translations = getTranslations();
    return translations[language] || translations[DEFAULT_LANGUAGE] || {};
  }

  function translate(key, language) {
    const currentLanguage = normalizeLanguage(language || getCurrentLanguage());
    const dictionary = getDictionary(currentLanguage);
    const fallbackDictionary = getDictionary(DEFAULT_LANGUAGE);

    return dictionary[key] || fallbackDictionary[key] || key;
  }

  function getCurrentLanguage() {
    return document.documentElement.getAttribute("lang") || DEFAULT_LANGUAGE;
  }

  function getInitialLanguage() {
    const params = new URLSearchParams(window.location.search);
    const urlLanguage = params.get("lang");

    if (urlLanguage) {
      return normalizeLanguage(urlLanguage);
    }

    const savedLanguage = localStorage.getItem(STORAGE_KEY);

    if (savedLanguage) {
      return normalizeLanguage(savedLanguage);
    }

    return normalizeLanguage(navigator.language || DEFAULT_LANGUAGE);
  }

  function setTextContent(node, dictionary, fallbackDictionary) {
    const key = node.getAttribute("data-i18n");
    const value = dictionary[key] || fallbackDictionary[key];

    if (value) {
      node.textContent = value;
    }
  }

  function setAttributes(node, dictionary, fallbackDictionary) {
    const config = node.getAttribute("data-i18n-attr");

    if (!config) return;

    config.split(",").forEach((pair) => {
      const parts = pair.split(":");
      const attr = parts[0] ? parts[0].trim() : "";
      const key = parts[1] ? parts[1].trim() : "";

      if (!attr || !key) return;

      const value = dictionary[key] || fallbackDictionary[key];

      if (value) {
        node.setAttribute(attr, value);
      }
    });
  }

  function getPageKey() {
    return (
      document.documentElement.getAttribute("data-i18n-page") ||
      document.body?.getAttribute("data-i18n-page") ||
      ""
    );
  }

  function setMeta(dictionary, fallbackDictionary) {
    const pageKey = getPageKey();
    const pagePrefix = pageKey ? `${pageKey}.` : "";
    const title =
      dictionary[`${pagePrefix}meta.title`] ||
      fallbackDictionary[`${pagePrefix}meta.title`] ||
      dictionary["meta.title"] ||
      fallbackDictionary["meta.title"];

    const description =
      dictionary[`${pagePrefix}meta.description`] ||
      fallbackDictionary[`${pagePrefix}meta.description`] ||
      dictionary["meta.description"] ||
      fallbackDictionary["meta.description"];

    const ogLocale = dictionary["meta.ogLocale"] || fallbackDictionary["meta.ogLocale"];

    if (title) {
      document.title = title;
      setMetaAttribute("meta[property='og:title']", "content", title);
      setMetaAttribute("meta[name='twitter:title']", "content", title);
    }

    if (description) {
      setMetaAttribute("meta[name='description']", "content", description);
      setMetaAttribute("meta[property='og:description']", "content", description);
      setMetaAttribute("meta[name='twitter:description']", "content", description);
    }

    if (ogLocale) {
      setMetaAttribute("meta[property='og:locale']", "content", ogLocale);
    }
  }
  function setMetaAttribute(selector, attr, value) {
    const node = document.querySelector(selector);

    if (node && value) {
      node.setAttribute(attr, value);
    }
  }

  function syncUrl(language) {
    const url = new URL(window.location.href);

    if (language === DEFAULT_LANGUAGE) {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", language);
    }

    window.history.replaceState({}, "", url.toString());
  }

  function setLanguage(language, options) {
    const nextLanguage = normalizeLanguage(language);
    const dictionary = getDictionary(nextLanguage);
    const fallbackDictionary = getDictionary(DEFAULT_LANGUAGE);
    const shouldSyncUrl = !options || options.syncUrl !== false;

    document.documentElement.setAttribute("lang", nextLanguage);
    document.documentElement.setAttribute("dir", "ltr");

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      setTextContent(node, dictionary, fallbackDictionary);
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((node) => {
      setAttributes(node, dictionary, fallbackDictionary);
    });

    document.querySelectorAll("[data-language-selector]").forEach((select) => {
      select.value = nextLanguage;
    });

    setMeta(dictionary, fallbackDictionary);
    localStorage.setItem(STORAGE_KEY, nextLanguage);

    if (shouldSyncUrl) {
      syncUrl(nextLanguage);
    }

    window.dispatchEvent(
      new CustomEvent("mmlab:languagechange", {
        detail: {
          language: nextLanguage
        }
      })
    );
  }

  function buildLanguageSelector(select) {
    select.innerHTML = "";

    SUPPORTED_LANGUAGES.forEach((language) => {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = translate("language.name", language);
      select.appendChild(option);
    });
  }

  function initLanguageSelectors() {
    document.querySelectorAll("[data-language-selector]").forEach((select) => {
      buildLanguageSelector(select);

      select.addEventListener("change", function () {
        setLanguage(select.value);
      });
    });
  }

  function init() {
    initLanguageSelectors();
    setLanguage(getInitialLanguage(), { syncUrl: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.MMLAB_I18N = {
    defaultLanguage: DEFAULT_LANGUAGE,
    supportedLanguages: SUPPORTED_LANGUAGES.slice(),
    getCurrentLanguage,
    setLanguage,
    translate
  };
})();
