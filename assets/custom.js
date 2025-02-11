document.addEventListener('DOMContentLoaded', function() {
  let cartItems = [];

  function updateCart() {
    const cartContainer = document.getElementById('top-cart');
    const finalizeButton = document.getElementById('finalize-cart');
    
    cartContainer.innerHTML = '';

    cartItems.forEach(item => {
      const productElement = document.createElement('div');
      productElement.classList.add('custom-cart-item');
      productElement.setAttribute("product-data", `${item.variantId}`);
      productElement.setAttribute("product-price", `${item.price}`);
      productElement.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <span>${item.title} - ${item.variantTitle}</span>
        <button data-product-id="${item.id}" class="remove-from-cart">x</button>
      `;
      cartContainer.appendChild(productElement);
    });

    finalizeButton.style.display = (cartItems.length === 4) ? 'block' : 'none';

    if (cartItems.length > 4) {
      alert("You can only add 4 products to the cart.");
    }

    addRemoveButtonListeners();
  }

  function addToCart(productId, variantId, title, image, variantTitle, price) {
    if (cartItems.length >= 4) return;

    const product = {
      id: productId,
      variantId: variantId,
      title: title,
      image: image,
      variantTitle: variantTitle,
      price: price
    };

    cartItems.push(product);
    updateCart();
  }

  let formData = {};
  formData.items = [];

  function finalizeCart() {
    const cartItems = document.querySelectorAll('.custom-cart-item');
    cartItems.forEach(function(item) {
      const productId = item.getAttribute('product-data');
      if (productId) {
        formData.items.push({ id: productId, quantity: 1 });
      }
    });

    addToCartss(formData);
  }

  function addToCartss(data) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Cart updated successfully:', data);
      setTimeout(function() {
        onCartUpdate();      
      }, 100);
    })
    .catch(error => {
      console.log('Error:', error);
      alert('There was an error updating your cart.');
    });
  }
    const finalizeButton = document.getElementById('finalize-cart');
  if (finalizeButton) {
    finalizeButton.addEventListener('click', finalizeCart);
  }

  document.querySelectorAll('.add-to-top').forEach(button => {
    button.addEventListener('click', function() {
      const productCard = this.closest('.product-card');
      const productId = this.dataset.productId;
      
      const selectedColor = productCard.querySelector('.custom-color:checked');
      const selectedSize = productCard.querySelector('.custom-size:checked');

      if (selectedColor) {
        let variantId;
        let variantTitle;
        const productTitle = productCard.querySelector('.product-title').textContent;
        const productImage = productCard.querySelector('.product-image').src;
        const priceText = productCard.querySelector('.product-price').textContent;
        const price = parseFloat(priceText.replace('$', '').trim()); // Get price (with currency removed)

        if (selectedSize) {
          variantId = selectedSize.value;  
          variantTitle = `${productTitle} - ${selectedColor.value} - ${selectedSize.value}`;
        } else {
          variantId = selectedColor.value;  
          variantTitle = `${productTitle} - ${selectedColor.value}`;
        }

        console.log('Adding to cart with Variant ID:', variantId);  // Debugging log

        addToCart(productId, variantId, productTitle, productImage, variantTitle, price);
        updateCount();
      } else {
        alert("Please select at least a color variant.");
      }
    });
  });

  function addRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productId = button.dataset.productId;
        removeFromCart(productId);
      });
    });
    updateCount();
  }

  function updateCount() {
    let count = document.querySelector('.count-data');
    const countData = count.getAttribute('data-count');
    let data = cartItems.length;
    count.innerText = countData - data;

    if (data == 0) {
      document.querySelector('.bundle-count').style.display = "none";
      totalPrice();
    } else {
      document.querySelector('.bundle-count').style.display = "block";
      document.querySelector('.total-prices').style.display = "none";
    }
  }

  function totalPrice() {
    document.querySelector('.total-prices').style.display = "block";
    const cartItemPrice = document.querySelectorAll('.custom-cart-item');
    let total = 0;

    cartItemPrice.forEach(function(item) {
      const productPrice = parseFloat(item.getAttribute('product-price'));
      total += productPrice;
    });
    document.querySelector('.total-prce').innerText = total.toFixed(2);
  }

});

// search task js

// first
const openSearchBtn = document.getElementById('open-search-btn');
const closeSearchBtn = document.getElementById('close-search-btn');
const searchPopup = document.getElementById('search-popup');
const searchInput = document.getElementById('custom-search');
const searchResultsContainer = document.getElementById('search-results');
const searchResults = document.getElementById('search-results');

openSearchBtn.addEventListener('click', function() {
    searchPopup.style.display = 'flex';
    searchInput.focus();
});

closeSearchBtn.addEventListener('click', function() {
    searchPopup.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === searchPopup) {
        searchPopup.style.display = 'none';
    }
});

searchInput.addEventListener('input', handleSearchInput);

function handleSearchInput(event) {
  const searchTerm = event.target.value.trim();

 if (searchTerm.length === 0) {
    closeSearchResults();
    return;
  }
  fetchSearchResults(searchTerm);
}

function fetchSearchResults(searchTerm) {
  fetch(`/search/suggest?q=${searchTerm}&section_id=predictive-search`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      return response.text();
    })
    .then((text) => {
      const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML;
      searchResultsContainer.innerHTML = resultsMarkup;
      openSearchResults();
    })
    .catch((error) => {
      console.error('Error fetching search results:', error);
      closeSearchResults();
    });
}

function openSearchResults() {
  searchResultsContainer.style.display = 'block';
}

function closeSearchResults() {
  searchResultsContainer.style.display = 'none';
}



// second

const openSearchBtnSec = document.getElementById('open-search-btn-second');
const closeSearchBtnSec = document.getElementById('close-search-btn-sec');
const searchPopupSec = document.getElementById('search-popup-sec');
const searchInputSec = document.getElementById('custom-search-sec');
const searchResultsContainerSec = document.getElementById('sec-search-results');

openSearchBtnSec.addEventListener('click', function() {
  searchPopupSec.style.display = 'flex';
  searchInputSec.focus();
});


closeSearchBtnSec.addEventListener('click', function() {
  searchPopupSec.style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target === searchPopupSec) {
    searchPopupSec.style.display = 'none';
  }
});

let debounceTimer;
searchInputSec.addEventListener('input', function(event) {
  clearTimeout(debounceTimer); 
  debounceTimer = setTimeout(function() {
    handleSearchInputSec(event); 
  }, 300); 
});

function handleSearchInputSec(event) {
  const searchTerm = event.target.value.trim();

  if (searchTerm.length === 0) {
    closeSearchResultsSec(); 
    return;
  }

  fetchSearchResultsSec(searchTerm); 
}


function fetchSearchResultsSec(searchTerm) {
  fetch(`/search?q=${searchTerm}&section_id=main-search`) 
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      return response.text(); 
    })
    .then((text) => {
      const resultsMarkup = generateResultsMarkup(text); 
      openSearchResultsSec(); 
    })
    .catch((error) => {
      console.error('Error fetching search results:', error);
      closeSearchResultsSec(); 
    });
}

function generateResultsMarkup(responseText) {
  const results = new DOMParser().parseFromString(responseText, 'text/html').querySelector('#shopify-section-main-search #ProductGridContainer').innerHTML; // Adjust selector based on Shopify HTML structure
   searchResultsContainerSec.innerHTML = results;
}

function openSearchResultsSec() {
  searchResultsContainerSec.style.display = 'flex';
}

function closeSearchResultsSec() {
  searchResultsContainerSec.style.display = 'none';
}


// Wishlist


document.addEventListener('DOMContentLoaded', function () {
  const wishlistButtons = document.querySelectorAll('.wishlist-icon');
  const wishlistCount = document.querySelector('.header-wishlist-count');

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
     updateWishlistCount();
    wishlistButtons.forEach(button => {
        const productHandle = button.dataset.productHandle;
      
        const isInWishlist = wishlist.some(item => item.handle === productHandle);
        if (isInWishlist) {
            button.classList.add('added');
        }

        button.addEventListener('click', function() {
           event.preventDefault();
            fetch(`/products/${productHandle}.js`)
                .then(response => response.json())
                .then(product => {
                    const productData = {
                        handle: product.handle,
                        title: product.title,
                        image: product.images[0],
                        price: (product.price / 100).toFixed(2),
                        productId: product.variants[0].id 
                    };

                    const productIndex = wishlist.findIndex(item => item.handle === productData.handle);

                    if (productIndex === -1) {
                        wishlist.push(productData);
                        this.classList.add('added');
                        document.querySelector('.remove-popup').classList.remove('open');
                        document.querySelector('.add-popup').classList.add('open');
                        setTimeout(function() {
                            document.querySelector('.add-popup').classList.remove('open');
                        }, 2000);
                    } else {
                        wishlist.splice(productIndex, 1);
                        this.classList.remove('added');
                       document.querySelector('.add-popup').classList.remove('open');
                       document.querySelector('.remove-popup').classList.add('open');
                        setTimeout(function() {
                             document.querySelector('.remove-popup').classList.remove('open');
                        }, 2000);
                    }

                    localStorage.setItem('wishlist', JSON.stringify(wishlist));
                  updateWishlistCount();
                })
                .catch(error => console.error('Error fetching product data:', error));
        });
    });

    function updateWishlistCount() {
        const totalWishlistItems = wishlist.length;
        wishlistCount.textContent = totalWishlistItems;
        wishlistCount.setAttribute('totalwishlistitems', totalWishlistItems);
    }
});

document.addEventListener('DOMContentLoaded', function () {
 const wishlistContainer = document.getElementById('wishlist-container');

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.length > 0 && wishlistContainer) {
        wishlist.forEach(product => {
            const productItem = document.createElement('li');
            productItem.classList.add('wishlist-item');
            productItem.innerHTML = `
                <div class="wishlist-item-inner">
                    <img src="${product.image}" alt="${product.title}" width="">
                    <div class="product-details">
                        <h3>${product.title}</h3>
                        <p class="price">
                            ${product.comparePrice ? `<span class="original-price">$${product.comparePrice}</span>` : ''}
                            <span class="current-price">$${product.price}</span>
                        </p>
                    </div>
                    
                <div class="addToCart_button">
                  <form method="post" action="/cart/add">
                    <input type="hidden" name="id" value="${product.productId}" />
                    <input min="1" type="hidden" id="quantity" name="quantity" value="1"/>
                    <input type="submit" value="Move To Cart" class="btn" />
                  </form>
                  </div>  
                </div>
            `;
            wishlistContainer.appendChild(productItem);
        });
    } else {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
    }
});

// addon product

function updateSelectedProducts() {
  let totalPrice = 0; 
  let appendContainer = document.querySelector('.append');
  let totalPriceElement = document.getElementById('total-price');
  
  document.querySelectorAll('.product-checkbox').forEach(function(checkbox) {
    let productPrice = parseFloat(checkbox.getAttribute('data-price'));
    let productElement = checkbox.closest('li');
    let productImage = productElement.querySelector('.product-image').src;
    
    let productDisplay = document.createElement('div');
    productDisplay.classList.add('selected-product');

    if (checkbox.checked) {
      productDisplay.innerHTML = `
        <div class="selected-product-item">
          <img src="${productImage}" alt="image" class="selected-product-image">
        </div>
      `;
      appendContainer.appendChild(productDisplay);
      totalPrice += productPrice;
    }
  });

  totalPriceElement.innerText = totalPrice.toFixed(2);
}


document.querySelectorAll('.product-checkbox').forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {
    let productPrice = parseFloat(checkbox.getAttribute('data-price'));
    let productElement = checkbox.closest('li');
    let productImage = productElement.querySelector('.product-image').src;
    
    let appendContainer = document.querySelector('.append');
    let totalPriceElement = document.getElementById('total-price');

    let currentTotalPrice = parseFloat(totalPriceElement.innerText.replace('$', '').replace(',', '').trim());

    if (checkbox.checked) {
      let productDisplay = document.createElement('div');
      productDisplay.classList.add('selected-product');
      productDisplay.innerHTML = `
        <div class="selected-product-item">
          <img src="${productImage}" alt="image" class="selected-product-image">
        </div>
      `;
      appendContainer.appendChild(productDisplay);
      currentTotalPrice += productPrice;
    } else {
      let selectedProductItem = appendContainer.querySelector(`.selected-product-item img[src="${productImage}"]`);
      if (selectedProductItem) {
        selectedProductItem.closest('.selected-product').remove();
        currentTotalPrice -= productPrice;
      }
    }

    totalPriceElement.innerText = currentTotalPrice.toFixed(2);
  });
});

window.onload = function() {
  updateSelectedProducts();
};


  // To close popup cookie

  let popupConstant = document.querySelector('.sticky-btn');
console.log(popupConstant)
   document.getElementById("closePopup").addEventListener('click',function (){
      document.getElementById("myPopup").style.display = 'none';
     setCookie("cookieConsent", "accepted", 1);
  });
  popupConstant.addEventListener('click',function (){
    document.getElementById("myPopup").style.display = 'flex';
      });
    // Check if the cookie has been set already
    if (!getCookie("cookieConsent")) {
      setTimeout(()=>{
        document.getElementById("myPopup").style.display = 'flex';
      },5000)
    }
   setCookie("cookieConsent", "accepted", 1)

  // Function to get a cookie value by name
  function getCookie(name) {
    let nameEq = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEq) == 0) return c.substring(nameEq.length, c.length);
    }
    return "";
  }

  // Function to set a cookie
  function setCookie(name, value, days) {
    let d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }