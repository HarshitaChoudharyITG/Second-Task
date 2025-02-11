
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("product-info")) {
  updateJs();
  }
});

// select option
function updateJs(){
  
  let open = document.querySelectorAll('.custom-slect');
  let option = document.querySelectorAll('.custom-slect-option');
  let current = document.querySelector('.custom-slect-current');

       open.forEach(function(click) { 
       click.addEventListener("click", function(){   
         this.classList.toggle("open");
         });
        });

  
  option.forEach(function(selected){
    selected.addEventListener("click", function(){   
        option.forEach(function(option) { 
            option.classList.remove("selected");
        });
        var text = this.getAttribute('value');
        if(text == ''){
        current.value = 'Gender';
        }else{
         current.value = text;
        }
        this.classList.add("selected");
    });
});

// slider
class Slider {
  constructor(sliderElement, prevButton, nextButton, dotsContainer) {
    this.sliderElement = sliderElement;
    this.slides = sliderElement.children;
    this.prevButton = prevButton;
    this.nextButton = nextButton;
    this.dotsContainer = dotsContainer;
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;    
    
    this.createDots();
    this.updateSlider();

    this.prevButton.addEventListener('click', () => this.moveSlide(-1));
    this.nextButton.addEventListener('click', () => this.moveSlide(1));
    this.dotsContainer.addEventListener('click', (e) => this.dotClick(e));
  }

  createDots() {
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      this.dotsContainer.appendChild(dot);
    }
    this.dots = this.dotsContainer.children;
  }

  updateSlider() {
    this.sliderElement.style.transform = `translateY(-${this.currentIndex * 10}%)`;

    for (let i = 0; i < this.totalSlides; i++) {
      if (i === this.currentIndex) {
        this.dots[i].classList.add('active');
      } else {
        this.dots[i].classList.remove('active');
      }
    }
  }


  moveSlide(step) {
    this.currentIndex += step;

    if (this.currentIndex < 0) {
      this.currentIndex = this.totalSlides - 1;
    } else if (this.currentIndex >= this.totalSlides) {
      this.currentIndex = 0;
    }
    this.updateSlider();
  }

  dotClick(e) {
    if (e.target.classList.contains('dot')) {
      let index;
      for (let i = 0; i < this.dots.length; i++) {
        if (this.dots[i] === e.target) {
          index = i;
          break;
        }
      }
      this.currentIndex = index;
      this.updateSlider();
    }
  }
}

const sliderElement = document.querySelector('.custom-slider-product');
  console.log(sliderElement)
const prevButton = document.querySelector('.custom-arrow.left');
const nextButton = document.querySelector('.custom-arrow.right');
const dotsContainer = document.querySelector('.dots');

const customSlider = new Slider(sliderElement, prevButton, nextButton, dotsContainer);

// accoridan
  document.querySelectorAll('.accordion-item').forEach(function (item) {
  item.addEventListener('toggle', function () {
    const icon = item.querySelector('.accordion-icon');
    if (item.open) {
      icon.textContent = '-';
    } else {
      icon.textContent = '+';
    }
  });
});

// image


  const thumbnailImages = document.querySelectorAll('.product-thumbnail');
  const mainImage = document.getElementById('main-product-image');
  thumbnailImages.forEach(function(thumbnail) {
    thumbnail.addEventListener('click', function() {
      const fullImageSrc = thumbnail.getAttribute('data-full-src');
      mainImage.src = fullImageSrc;
    });
  });


// Drawer
// class CustomDrawer {
//   constructor(openId, closeButtonId, drawerId, overlay) {
//     this.openButton = document.getElementById(openId);
//     this.closeButton = document.getElementById(closeButtonId);
//     this.drawer = document.getElementById(drawerId);
//     this.overlay = document.getElementById(overlay);
    
//     this.addEventListeners();
//   }

//   addEventListeners() {
//     this.openButton.addEventListener('click', (e) => {
//       e.preventDefault();  
//       this.openDrawer(); 
//     });
//     this.closeButton.addEventListener('click', () => this.closeDrawer());
//   }

//   openDrawer() {
//     this.drawer.classList.add('open');
//     this.overlay.classList.add('show');
//   }

//   closeDrawer() {
//     this.drawer.classList.remove('open');
//     this.overlay.classList.remove('show');
//   }
// }

// const customDrawer = new CustomDrawer('view-cart', 'closeDrawerBtn', 'customDrawer', "overlay");


// add to cart


  let selectedOptions = {};

  function updateSelectedOption(optionName, optionValue) {

    selectedOptions[optionName] = optionValue;
    findMatchingVariant();
  }

function findMatchingVariant() {
  const allVariants = document.querySelectorAll('.product_hidden_variants ul li');
  let matchedVariantId = null;

  const selectedCombo = Object.keys(selectedOptions)
    .map((key) => selectedOptions[key])
    .join(' / ') 
    .trim();
  
const mainImage = document.getElementById('main-product-image');
const price = document.querySelector('.product-price');
const sold = document.querySelector('.sold-out-msg');
  
  allVariants.forEach(function (variant) {
    const variantTitle = variant.dataset.value.trim(); 
    const variantPrice = variant.dataset.variantPrice; 
    const variantImage = variant.dataset.variantImage;
    const disable = variant.dataset.variantDisable;
    if (variantTitle === selectedCombo) {
      if(disable == 'false'){
      matchedVariantId = variant.dataset.variantId; 
      price.innerHTML = variantPrice;
       mainImage.src = variantImage;
         sold.style.display = "none"
    }else{
        sold.style.display = "block"
    }      
    }
  });


  const addToCartButton = document.getElementById('add-to-cart-button');
  if (matchedVariantId) {
    addToCartButton.disabled = false;
    addToCartButton.dataset.variantId = matchedVariantId;
  } else {
    addToCartButton.disabled = true;
    addToCartButton.dataset.variantId = '';
  }
}

  document.querySelectorAll('.custom-slect-option').forEach(function (option) {
    option.addEventListener('click', function () {
      const optionName = this.closest('.custom-slect').dataset.option;
      const optionValue = this.textContent.trim();
      updateSelectedOption(optionName, optionValue);
    });
  });


   document.querySelectorAll('.custom-slect').forEach(function (selectElement) {
    const optionNam = selectElement.getAttribute('data-option');
     const optionVal = '$10'
     updateSelectedOption(optionNam, optionVal);
  });

    document.querySelectorAll('.custom-size').forEach(function (radios) {
    if (radios.checked) {
      const optionName = radios.name.replace('options[', '').replace(']', ''); 
      const optionValue = radios.id; 
      updateSelectedOption(optionName, optionValue);
    }
  });


  
  document.querySelectorAll('.custom-size').forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (this.checked) {
        const optionName = this.name.replace('options[', '').replace(']', ''); // Extract option name
        const optionValue = this.id;
        updateSelectedOption(optionName, optionValue);
      }
    });
  });


  document.getElementById('add-to-cart-button').addEventListener('click', function (event) {
    event.preventDefault();

    const matchedVariantId = this.dataset.variantId; 
    const quantity = document.querySelector('.quantity__input').value;
    if (matchedVariantId) {
      let formData = {
        items: [{
          id: matchedVariantId,
          quantity: quantity
        }]
      };

      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
        setTimeout(function(){          
        onCartUpdate();
        }, 1000)
        showMsg();
         buble();
    setTimeout(function () {
      customCartUpdate(); 
    }, 1000);
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
      });
    } else {
      console.log('Please select valid options before adding to the cart.');
    }
  });
  
    function onCartUpdate() {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {  
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['cart-drawer-items', '.drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        document.querySelector('cart-drawer').classList.remove("is-empty");
        })
        .catch((e) => {
          console.error(e);
        });  
  }
  
  function showMsg(){
    document.querySelector('.msg-added-cart').style.display = "block";
    setTimeout(function(){
     document.querySelector('.msg-added-cart').style.display = "none";
    }, 2000);
  }
  
function buble(){
      const container = document.getElementById("cart-icon-bubble");
    fetch(location.href)
        .then(response => response.text())
        .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const newContent = doc.getElementById("cart-icon-bubble").innerHTML;
            container.innerHTML = newContent;
        })
        .catch(error => console.error("Error loading content: ", error));
}

  function customCartUpdate() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cartData => {
      fetch('/cart')
        .then(response => response.text())
        .then(responseText => {
          const parser = new DOMParser();
          const responseDoc = parser.parseFromString(responseText, 'text/html');
          const updatedDrawerContent = responseDoc.querySelector('.cart__drawer').innerHTML;
          const cartDrawer = document.querySelector('.cart__drawer');
          if (cartDrawer) {
            cartDrawer.innerHTML = updatedDrawerContent;
          }
          console.log('Cart drawer successfully updated!');
        })
        .catch(error => {
          console.error('Error fetching updated cart drawer:', error);
        });
    })
    .catch(error => {
      console.error('Error fetching cart data:', error);
    });
}
}
document.addEventListener('DOMContentLoaded', function () {
updateJs();
 });
//  const cstdata = document.querySelectorAll(".quick-add button");
//  cstdata.forEach(function(e){
//   e.addEventListener("click", function(){
//     updateJs();
//   });
// });


