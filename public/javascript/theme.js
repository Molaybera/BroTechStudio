// --- Updated Portfolio Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Find the two empty <span> elements we just created in the HTML
    const basicPriceElement = document.getElementById('basic-price');
    const premiumPriceElement = document.getElementById('premium-price');

    // 2. Fetch the price data from our server's API endpoint
    fetch('/api/book/getPrice')
        .then(response => response.json())
        .then(priceInfo => {
            // This is the data from our server, e.g., { symbol: '₹', plans: { basic: 999, premium: 2000 } }

            // 3. Update the HTML elements with the correct prices
            if (basicPriceElement) {
                basicPriceElement.textContent = `(${priceInfo.symbol}${priceInfo.plans.basic})`;
            }

            if (premiumPriceElement) {
                premiumPriceElement.textContent = `(${priceInfo.symbol}${priceInfo.plans.premium})`;
            }
        })
        .catch(error => {
            // If there's an error, we'll log it to the console and the prices won't be displayed
            console.error('Failed to fetch prices:', error);
        });
    // -------------------------------------------------------- //
    // Select ALL buttons with the .project-btn class, across both tiers
    const allProjectButtons = document.querySelectorAll('.project-btn');
    const portfolioViewer = document.getElementById('portfolio-viewer');

    // Set the initial view on page load to the first button
    const defaultButton = allProjectButtons[0];
    if (defaultButton) {
        defaultButton.classList.add('active');
        portfolioViewer.src = defaultButton.getAttribute('data-src');
    }

    // Add a click listener TO EACH BUTTON
    allProjectButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. When a button is clicked, first remove 'active' from ALL buttons
            allProjectButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // 2. Then, add 'active' ONLY to the one that was just clicked
            button.classList.add('active');

            // 3. Update the iframe to show the selected project
            const newSrc = button.getAttribute('data-src');
            if (newSrc) {
                portfolioViewer.src = newSrc;
            }
        });
    });
});