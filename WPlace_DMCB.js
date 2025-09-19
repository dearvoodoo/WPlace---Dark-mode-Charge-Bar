// ==UserScript==
// @name         WPlace Dark Mode + Charge Bar
// @namespace    http://tampermonkey.net/
// @version      1.0.007
// @description  Dark mode + timer + barre de progression charges
// @author       VooDoo
// @match        *://*.wplace.live/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @downloadURL  https://raw.githubusercontent.com/dearvoodoo/WPlace---Dark-mode-Charge-Bar/refs/heads/main/WPlace_DMCB.js
// ==/UserScript==

(function() {
    'use strict';

    // === DARK MODE ===
    const darkModeEnabled = GM_getValue('darkModeEnabled', true);

    if (darkModeEnabled) {
        const style = Object.assign(document.createElement("style"), {
            type: "text/css",
            textContent: `
                :where(:root), :root:has(input.theme-controller[value=custom-winter]:checked), [data-theme=custom-winter] {
                    color-scheme: light;
                    --color-base-100: #161616;
                    --color-base-200: #121212;
                    --color-base-300: #080808;
                    --color-base-content: #ffffff;
                    --color-primary: #0069ff;
                    --color-primary-content: white;
                    --color-secondary: #463aa2;
                }
            `
        });
        document.head.insertBefore(style, document.head.firstChild);
    }

    function reduceNoiseOpacity() {
        setTimeout(() => {
            const noiseValue = getComputedStyle(document.documentElement)
                .getPropertyValue('--fx-noise');

            if (noiseValue) {
                document.documentElement.style.setProperty(
                    '--fx-noise',
                    noiseValue.replace('opacity=\'0.2\'', 'opacity=\'0.07\''),
                    'important'
                );
            }
        }, 50);
    }

    if (darkModeEnabled) {
        reduceNoiseOpacity();
    }

    function createDarkModeButton() {
        const leftContainer = document.querySelector('.absolute.left-2.top-2.z-30.flex.flex-col.gap-3');
        if (!leftContainer) {
            setTimeout(createDarkModeButton, 1000);
            return;
        }

        const refreshButton = leftContainer.querySelector('button[title="Refresh"]');
        if (!refreshButton) {
            setTimeout(createDarkModeButton, 1000);
            return;
        }

        const darkModeButton = document.createElement('button');
        darkModeButton.className = 'btn btn-sm btn-circle';
        darkModeButton.title = darkModeEnabled ? 'Désactiver le mode sombre' : 'Activer le mode sombre';
        darkModeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="size-3.5">
                <path d="${darkModeEnabled ? 'M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z' : 'M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 56-52 100 96-59 57ZM664-650l-56-52 100-96 57 59-101 97Zm-496 492-59-57 97-101 52 56-96 100Z'}"></path>
            </svg>
        `;

        darkModeButton.addEventListener('click', toggleDarkMode);
        refreshButton.parentNode.insertBefore(darkModeButton, refreshButton.nextSibling);
    }

    function toggleDarkMode() {
        const isCurrentlyEnabled = GM_getValue('darkModeEnabled', true);
        GM_setValue('darkModeEnabled', !isCurrentlyEnabled);
        window.location.reload();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(createDarkModeButton, 1000));
    } else {
        setTimeout(createDarkModeButton, 1000);
    }
})();

(async function() {
    'use strict';

    function format(sec) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        return `${h > 0 ? h+"h " : ""}${m > 0 ? m+"m " : ""}${s}s`;
    }

    // Box principale
    let infoBox = document.createElement("div");
    infoBox.id = "chargeInfo";
    infoBox.style.position = "fixed";
    infoBox.style.bottom = "12px";
    infoBox.style.right = "80px";
    infoBox.style.width = "225px";
    infoBox.style.height = "56px";
    infoBox.style.background = "rgba(0,0,0,0.7)";
    infoBox.style.color = "white";
    infoBox.style.borderRadius = "50px";
    infoBox.style.zIndex = 9999;
    infoBox.style.display = "flex";
    infoBox.style.alignItems = "center";
    infoBox.style.justifyContent = "center";
    infoBox.style.pointerEvents = "none";
    infoBox.style.fontSize = "14px";
    infoBox.style.fontWeight = "bold";
    infoBox.style.overflow = "hidden";
    document.body.appendChild(infoBox);

    // Ajout d'un style pour animation fade
    const styleTag = document.createElement("style");
    styleTag.textContent = `
        @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 0.3; }
            100% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(styleTag);

    // Barre de progression horizontale
    let chargeBar = document.createElement("div");
    chargeBar.style.position = "absolute";
    chargeBar.style.top = "0";
    chargeBar.style.left = "0";
    chargeBar.style.height = "100%";
    chargeBar.style.width = "0%";
    chargeBar.style.background = "rgba(0,255,76,0.7)";
    chargeBar.style.transition = "width 0.5s";
    chargeBar.style.animation = "pulse 1.5s infinite";
    infoBox.appendChild(chargeBar);

    // Texte centré
    let textSpan = document.createElement("span");
    textSpan.style.position = "absolute";
    textSpan.style.width = "100%";
    textSpan.style.textAlign = "center";
    textSpan.style.zIndex = "1";
    infoBox.appendChild(textSpan);

    let originalTitle = document.title;
    let chargesData = null;

    async function fetchCharges() {
        const res = await fetch("https://backend.wplace.live/me", { credentials: "include" });
        chargesData = await res.json();
    }

    await fetchCharges();
    setInterval(fetchCharges, 30000);

    setInterval(() => {
        if (!chargesData) return;

        const timerSpan = document.querySelector("span.w-7.text-xs");
        if (!timerSpan) return;

        const match = timerSpan.textContent.match(/\((\d+):(\d+)\)/);
        if (!match) return;

        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const currentTimerSec = minutes * 60 + seconds;

        const cooldown = chargesData.charges.cooldownMs / 1000;
        const count = Math.floor(chargesData.charges.count);
        const max = chargesData.charges.max;
        const missing = max - count;

        const fullSec = currentTimerSec + (missing - 1) * cooldown;

        let progress = (count + (1 - currentTimerSec / cooldown)) / max;
        progress = Math.min(Math.max(progress, 0), 1);

        // Largeur de la barre
        chargeBar.style.width = `${progress * 100}%`;

        // Texte centré
        textSpan.textContent = `🔋 Full points: ${format(fullSec)}`;

        document.title = `(${format(fullSec)}) ${originalTitle}`;
    }, 1000);
})();





