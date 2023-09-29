document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("openNewTabButton")
    .addEventListener("click", function () {
      chrome.tabs.create({
        url: "https://screenrec-ext.netlify.app/",
      });
    });
});
