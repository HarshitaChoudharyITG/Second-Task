
function displayRecentlyViewed() {
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    if (recentlyViewed.length === 0) {
        return;
    }
    let productListHTML = '';
if(recentlyViewed.length > 0){
    recentlyViewed.forEach(productHandle => {
        fetch(`/products/${productHandle}.js`)
            .then(response => response.json())
            .then(product => {
                productListHTML += `
                <li class="grid__item">
                    <div class="card__information">
                        <a class="full-unstyled-link" href="/products/${product.handle}">
                            <img src="${product.images[0]}" alt="${product.title}">
                            <h3 class="card__heading h5">${product.title}</h3>
                            <span class="price-item price-item--regular">$${product.price}</span>
                        </a>
                        </div>
                    </li>
                `;
                if (recentlyViewed.indexOf(productHandle) === recentlyViewed.length - 1) { 
                   document.getElementById('recently-viewed-products').innerHTML = productListHTML;
                }
            });
    });
}
}

document.addEventListener('DOMContentLoaded', function() {
    displayRecentlyViewed();
 });
