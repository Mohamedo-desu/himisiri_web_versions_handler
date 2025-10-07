(function () {
  const CONVEX_URL = "https://elegant-whale-471.convex.site";
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  const fullPath = currentPath + currentSearch;
  const deepLink = `himisiri:/${fullPath}`;
  const webFallback = window.location.href;

  async function fetchLatestApk() {
    try {
      const res = await fetch(`${CONVEX_URL}/appVersions/latest`);
      if (!res.ok) throw new Error("Failed to fetch latest app version");
      const data = await res.json();

      const downloadBtn = document.getElementById("downloadApkBtn");
      const versionSpan = document.getElementById("version");
      const releaseNotesList = document.getElementById("release-notes");

      // ✅ Update APK download link
      if (downloadBtn && data?.downloadUrl) {
        downloadBtn.setAttribute("href", data.downloadUrl);
      }

      // ✅ Update version info
      if (versionSpan) versionSpan.textContent = data.version || "N/A";

      // ✅ Update release notes list
      if (releaseNotesList) {
        releaseNotesList.innerHTML = "";
        const notes = (data.releaseNotes || "")
          .split("\n")
          .filter((note) => note.trim().length > 0);
        if (notes.length > 0) {
          notes.forEach((note) => {
            const li = document.createElement("li");
            li.textContent = note.trim();
            releaseNotesList.appendChild(li);
          });
        } else {
          releaseNotesList.innerHTML = "<li>No release notes available.</li>";
        }
      }

      console.log("✅ Found latest download:", data.downloadUrl);
    } catch (err) {
      console.error("⚠️ Could not fetch latest APK:", err);
      const versionSpan = document.getElementById("version");
      const releaseNotesList = document.getElementById("release-notes");
      if (versionSpan) versionSpan.textContent = "Unavailable";
      if (releaseNotesList)
        releaseNotesList.innerHTML = "<li>Unable to load release notes.</li>";
    }
  }

  function openApp() {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      window.location.href = deepLink;
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          updateContent("app-not-installed");
        }
      }, 2000);
    } else if (/Android/.test(navigator.userAgent)) {
      const intentUrl = `intent:/${fullPath}#Intent;scheme=himisiri;package=com.mohamedodesu.himisiri;S.browser_fallback_url=${encodeURIComponent(
        webFallback
      )};end`;
      try {
        window.location.href = intentUrl;
      } catch (e) {
        window.location.href = deepLink;
        setTimeout(() => {
          if (document.visibilityState === "visible") {
            updateContent("app-not-installed");
          }
        }, 2000);
      }
    } else {
      updateContent("desktop");
    }
  }

  function updateContent(state) {
    const content = document.getElementById("content");
    const openAppBtn = document.getElementById("openAppBtn");

    switch (state) {
      case "app-not-installed":
        content.innerHTML = `
          <p>It looks like you don't have the Himisiri app installed.</p>
          <div class="loading">Download it below to continue!</div>
        `;
        openAppBtn.style.display = "none";
        break;
      case "desktop":
        content.innerHTML = `
          <p>Himisiri is designed for mobile devices.</p>
          <div class="loading">Scan the QR code or visit on your phone to get started!</div>
        `;
        openAppBtn.style.display = "none";
        break;
    }
  }

  // ✅ Manual “Open in App” button only
  const openAppBtn = document.getElementById("openAppBtn");
  if (openAppBtn) {
    openAppBtn.href = deepLink;
    openAppBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openApp();
    });
  }

  // Detect if app opened
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      console.log("Page became hidden - app likely opened");
    }
  });

  // ✅ Only fetch version + notes — no auto open
  fetchLatestApk();
})();
