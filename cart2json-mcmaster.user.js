// ==UserScript==
// @name         McMaster-Carr Cart to JSON Extractor
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Extracts McMaster-Carr order items to a JSON array of objects.
// @author       You
// @match        *://www.mcmaster.com/orders*
// @match        *://www.mcmaster.com/*
// @grant        GM_setClipboard
// @updateURL    https://github.com/TechplexEngineer/userscript-mcmaster-cart-export/raw/refs/heads/main/cart2json-mcmaster.user.js
// @downloadURL  https://github.com/TechplexEngineer/userscript-mcmaster-cart-export/raw/refs/heads/main/cart2json-mcmaster.user.js
// ==/UserScript==

(function() {
    'use strict';

    function extractCart() {
        const items = [];

        // Select every item line in the order pad
        const cartItems = document.querySelectorAll('.order-pad-line');

        cartItems.forEach(item => {
            // Get Title and Details
            const titleEl = item.querySelector('.title-text');
            if (!titleEl) return; // Skip if it's an empty line or header

            const title = titleEl.innerText.trim();
            const detailsEl = item.querySelector('.details-web--view');
            const details = detailsEl ? detailsEl.innerText.trim() : '';
            const product_name = details ? `${title} - ${details}` : title;

            // Get Catalog Link
            const linkEl = item.querySelector('a.line-catalog-link');
            const link = linkEl ? linkEl.href.split('?')[0] : '';

            // Get Part Number (Extracted from the input value)
            const partNumInput = item.querySelector('.line-part-number-input');
            const part_number = partNumInput ? partNumInput.value.trim() : '';

            // Get Unit Price (First div inside .line-unit-price)
            const priceEl = item.querySelector('.line-unit-price div:first-child');
            const cost = priceEl ? priceEl.innerText.trim() : '';

            // Get Quantity (Extracted from the input value)
            const qtyInput = item.querySelector('.line-quantity-input');
            const qty = qtyInput && qtyInput.value ? qtyInput.value.trim() : "1";

            // Add to array if we successfully parsed a product name and cost
            if (product_name && cost) {
                items.push({
                    part_number,
                    product_name,
                    link,
                    cost,
                    qty
                });
            }
        });

        const jsonOutput = JSON.stringify(items, null, 2);
        console.log("Extracted Cart JSON:", jsonOutput);

        // Copy to clipboard using Tampermonkey's API
        if (typeof GM_setClipboard !== "undefined") {
            GM_setClipboard(jsonOutput);
            alert(`Successfully extracted ${items.length} items to your clipboard!`);
        } else {
            alert(`Successfully extracted ${items.length} items! Please check your browser's Developer Console.`);
        }
    }

    // Create and style the floating extraction button (McMaster Green)
    const btn = document.createElement('button');
    btn.innerText = "Extract Cart to JSON";
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = "999999";
    btn.style.padding = "12px 18px";
    btn.style.backgroundColor = "#005C2B"; // McMaster dark green
    btn.style.color = "#FFFFFF";
    btn.style.border = "1px solid #00401E";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "bold";
    btn.style.fontSize = "14px";
    btn.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";

    // Hover effects
    btn.onmouseover = () => btn.style.backgroundColor = "#007A3E";
    btn.onmouseout = () => btn.style.backgroundColor = "#005C2B";

    btn.onclick = (e) => {
        e.preventDefault();
        extractCart();
    };

    document.body.appendChild(btn);
})();
