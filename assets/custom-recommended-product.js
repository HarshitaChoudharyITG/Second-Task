
const productRecommendationsSection = document.querySelector('.custom-product-recommendations');
let url = productRecommendationsSection.getAttribute('data-url');
let sectionId = productRecommendationsSection.getAttribute('data-section-id');
let productId = productRecommendationsSection.getAttribute('data-product-id');
let limit = productRecommendationsSection.getAttribute('data-limit');

fetch(window.Shopify.routes.root + `recommendations/products?product_id=${productId}&limit=${limit}&section_id=${sectionId}&intent=related`)
 .then(response => response.text())
 .then((text) => {
    const html = document.createElement('div');
    html.innerHTML = text;
    const recommendations = html.querySelector('.custom-product-recommendations');
    if (recommendations && recommendations.innerHTML.trim().length) {
      productRecommendationsSection.innerHTML = recommendations.innerHTML;
    }
 });
