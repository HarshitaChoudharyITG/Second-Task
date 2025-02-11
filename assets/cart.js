class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);
    this.globalfunctbopn();
    this.addEventListener('change', debouncedOnChange.bind(this));
    const singleTier =  document.getElementById('single-tier');
    if(singleTier){
     this.callMetier();
    }
    const multiTier =  document.getElementById('multi-tier');
    if(multiTier){
     this.multipleTeir();
    }
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    let message = '';

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      this.updateQuantity(
        index,
        inputValue,
        document.activeElement.getAttribute('name'),
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['.cust-rec', 'cart-drawer-items', '.cart-drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      },
    ];
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);
    this.globalfunctbopn();
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement =
          document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll('.cart-item');

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
        let message = '';
        if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined') {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'));
        }
  
        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });
        this.onCartUpdate();
      })
      .catch(() => {
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item__error-text').textContent = message;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }

  // tier 1
  
callMetier() {
  var this_ = this;
 const giftCardCheckbox = document.querySelector('.single-tiers');
 const removess = document.querySelector('.input-hidden').getAttribute("data-total");
    const removeButton = document.querySelector('.cart-remove-button[data-variant-id="42246635880583"]');
    if(removeButton){
      var indexItem = removeButton.closest('cart-remove-button').getAttribute("data-index");
    }
    if (removess < 5000) {
      this_.updateQuantity(indexItem, 0);
    }
   
    giftCardCheckbox.addEventListener('change', function () {
      if (this.checked) {
        checkIfGiftCardInCart();
        console.log("checked")
        
      } else {
        console.log("unchecked")
      }
    });

     function checkIfGiftCardInCart() {
    const giftCardProductId = 42246635880583;

    fetch('/cart.js')
      .then(response => response.json())
      .then(data => {
        const giftCardItem = data.items.find(item => item.id === giftCardProductId);
        if (!giftCardItem) {
          addGiftCardToCart();
        } else {
          console.log('Gift card already in cart');
        }
      })
      .catch(error => {
        console.error('Error checking cartfg:', error);
      });
  } 
  

  function addGiftCardToCart() {
        const giftCardProductId = 42246635880583;
        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [{
              id: giftCardProductId,
              quantity: 1
            }]
          })
        })
        .then(response => response.json())
        .then(data => {
          this_.onCartUpdate();
          console.log('Gift card added:', data);
        })
        .catch(error => {
          console.error('Error adding gift card:', error);
        });
  }
}

  // tier 2

multipleTeir() {
  var this_ = this;
   var multipleTierId ;
  removePriceItm();
 const giftCardCheckbox = document.querySelector('.multiple-tier');
    giftCardCheckbox.addEventListener('change', function () {
      let check = this.getAttribute('data-check');
      
      if(check == 1){
        multipleTierId = 42247032766599;
        removeItm(42247033520263, 42247034011783);
      }
      else if(check == 2){
          multipleTierId = 42247033520263;
          removeItm(42247032766599, 42247034011783);
      }
      else if(check == 3){
         multipleTierId = 42247034011783;
         removeItm(42247033520263, 42247032766599);
      }

     if (this.checked) {
        checkIfGiftCardInCart(multipleTierId);
      } 

    });
  

     function checkIfGiftCardInCart(multipleTierId) {
    const giftCardProductId = multipleTierId;

    fetch('/cart.js')
      .then(response => response.json())
      .then(data => {
        const giftCardItem = data.items.find(item => item.id === giftCardProductId);
        if (!giftCardItem) {
          addGiftCardToCart(giftCardProductId);
        } else {
          console.log('Gift card already in cart');
        }
      })
      .catch(error => {
        console.error('Error checking cartfg:', error);
      });
  } 
  

  function addGiftCardToCart(giftCardProductId) {
        const giftCardProductIds = giftCardProductId;
        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [{
              id: giftCardProductIds,
              quantity: 1
            }]
          })
        })
        .then(response => response.json())
        .then(data => {
          this_.onCartUpdate();
          console.log('Gift card added:', data);
        })
        .catch(error => {
          console.error('Error adding gift card:', error);
        });
  }

  function removeItm(data, data2){
    const removeButton1 = document.querySelector(`.cart-remove-button[data-variant-id="${data}"]`);
     const removeButton2 = document.querySelector(`.cart-remove-button[data-variant-id="${data2}"]`);
    if(removeButton1){
      var indexItem1 = removeButton1.closest('cart-remove-button').getAttribute("data-index");
      this_.updateQuantity(indexItem1, 0);
    }
    if(removeButton2){
      var indexItem2 = removeButton2.closest('cart-remove-button').getAttribute("data-index");
      this_.updateQuantity(indexItem2, 0);
    }
  }

  function removePriceItm(){
   let removess = document.querySelector('.input-hidden').getAttribute("data-total");
    if (removess < 5000) {
      const removeButton = document.querySelector(`.cart-remove-button[data-variant-id="42247032766599"]`);
    if(removeButton){
      var indexItem = removeButton.closest('cart-remove-button').getAttribute("data-index");
    }
      this_.updateQuantity(indexItem, 0);
    }
    else if(removess < 10000){
    const removeButton = document.querySelector(`.cart-remove-button[data-variant-id="42247033520263"]`);
    if(removeButton){
      var indexItem = removeButton.closest('cart-remove-button').getAttribute("data-index");
    }
      this_.updateQuantity(indexItem, 0);
    }
   else if(removess < 15000){
    const removeButton = document.querySelector(`.cart-remove-button[data-variant-id="42247034011783"]`);
    if(removeButton){
      var indexItem = removeButton.closest('cart-remove-button').getAttribute("data-index");
    }
      this_.updateQuantity(indexItem, 0);
    }
  }

  }

  // tier cart page
  
 globalfunctbopn(){
// document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const cartItemsMainEl = document.querySelector('#main-cart-items');
    const proDetail = document.querySelector('#itg-details');
    const product1 = proDetail?.dataset.pro1;
    const product2 = proDetail?.dataset.pro2;
    const progressBar = document.querySelector('#shipping-bar');
    const firstExpectPrice = Number(progressBar?.dataset.firstprice);
    const secondExpectPrice = Number(progressBar?.dataset.secondprice);
    let cartPriceEl = document.querySelector('#itg-totals__total-value');
    let cartPrice = cartPriceEl?.dataset.total;
    let progresser = document.querySelector('.progressBar-workInside');
    let shippingMsg = document.querySelector('#shipping-message');
    let progresserPriceChange = document.querySelector('.priceChange');
    let percentageShow = document.querySelector('.percentageShow');
    let cartPage =  document.querySelector('.cart-template');
  
    cartPage?.addEventListener('click', function(event) {
      if (event.target && (event.target.matches('.quantity__button') || event.target.matches('.quantity__input') || event.target.matches('cart-remove-button'))) {
        priceCompare();
      }
    });
    let proPriceChangeVariable = progresserPriceChange?.innerHTML;
    proPriceChangeVariable = firstExpectPrice;
    function priceCompare() {
      setTimeout(() => {
        cartPriceEl = document.querySelector('#itg-totals__total-value');
        cartPrice = cartPriceEl.dataset.total;
        progresser = document.querySelector('.progressBar-workInside');
        
        let progress = (cartPrice / secondExpectPrice) * 100;
        progresser.style.width = progress + '%';
        let progressCondition = progress <= 100 ? progress : 100;
        percentageShow.innerHTML = Math.round(progressCondition) + '%'
        
        console.log('cartPrice =',cartPrice,  firstExpectPrice, secondExpectPrice, 'first =',cartPrice >= firstExpectPrice && cartPrice < secondExpectPrice,'second =', cartPrice >= secondExpectPrice);
        let proPriceChangeVariable = progresserPriceChange?.innerHTML;
        proPriceChangeVariable = firstExpectPrice;
        
        if (cartPrice >= firstExpectPrice && cartPrice < secondExpectPrice) {
          let proPriceChangeVariable = progresserPriceChange?.innerHTML;
          proPriceChangeVariable = secondExpectPrice;
          const productData = {
            items: [{ id: product1, quantity: 1 }]
          };
          addToCart(productData, product1);
          removeFromCart(product2);
        } else if (cartPrice >= secondExpectPrice) {
          shippingMsg.innerHTML = 'Congrats you get largest free gift!'
          const productData = {
            items: [{ id: product2, quantity: 1 }]
          };
          addToCart(productData, product2);
          removeFromCart(product1);
        } else {
          shippingMsg.innerHTML = `Add items worth Rs. <span class="priceChange">50</span> to get a free gift!`
          console.log('else');
          removeFromCart(product1);
          removeFromCart(product2);
        }
      },1500)
    }

    if(cartPage){
      priceCompare();
      window.priceCompare = priceCompare;
    }
    // Function to append new content and keep event delegation intact
    function appendData() {
      var myDiv = document.querySelector("cart-items .page-width");
      fetch(window.location.href)
      .then(response => response.text())
      .then(data => {
        var newDivContent = new DOMParser().parseFromString(data, 'text/html').querySelector('cart-items .page-width').innerHTML;
        myDiv.innerHTML = newDivContent;
        
        // After updating the content, event delegation will still work since it's on the parent element
      })
      .catch(error => {
        console.error('Error loading content:', error);
      });
    }

    // Function to add product to the cart
    function addToCart(productData, productVariId) {
      fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const existingProduct = cart.items.find(item => item.variant_id == productVariId);
        if (existingProduct) {
          return;
        } else {
          fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
          })
          .then(response => response.json())
          .then(data => {
            appendData();
            console.log('Product added to cart');
          })
          .catch(error => {
            console.error('Error adding product to cart:', error);
          });
        }
      })
      .catch(error => {
        console.error('Error fetching cart data:', error);
      });
    }

    // Function to remove product from the cart
    function removeFromCart(variantId) {
      fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const lineItem = cart.items.find(item => item.variant_id == variantId);
        if(cart.total_price == 0){
          location.reload();
        }
        if (lineItem) {
        const removeData = { id: lineItem.key, quantity: 0 };
          fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(removeData)
          })
          .then(response => response.json())
          .then(data => {
            appendData();
            console.log('Product removed from cart');
          })
          .catch(error => {
            console.error('Error removing product from cart:', error);
          });
        }
      })
      .catch(error => {
      console.error('Error fetching cart data:', error);
      });
    }
// });
  }
  
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}
