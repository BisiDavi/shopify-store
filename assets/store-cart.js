class CartRemoveButton extends HTMLElement{
  constructor(){
      super();

      this.addEventListener("click", (event) => {
          event.preventDefault();
          const cartItems = this.closest("cart-items");
          cartItems.updateQuantity(this.dataset.index, 0);
      });
  }
}

customElements.define("cart-remove-button", CartRemoveButton)

class CartItems extends HTMLElement{
  constructor(){
      super();

      this.lineItemStatusElement =
      document.getElementById("shopping-cart-line-item-status");

      this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
          .reduce((total, quantityInput) => total + parseInt(quantityInput.value),0); 

      this.debouncedOnChange = debounce((event) => {
          this.onChange(event);
          }, 300); 
          
      this.addEventListener("change", this.debouncedOnChange.bind(this));
  }

  onChange(event) {
      this.updateQuantity(
        event.target.dataset.index,
        event.target.value,
        document.activeElement.getAttribute("name")
      );
  }

  
  getSectionsToRender() {
    const cartItems = window.location.pathname === "/cart" ? [{
      id: "main-cart-items",
      section: document.getElementById("main-cart-items").dataset.id,
      selector: ".js-contents",
    }, {
      id: "main-cart-footer",
      section: document.getElementById("main-cart-footer").dataset.id,
      selector: ".js-contents",
    },{
      id: "cart-live-region-text",
      section: "cart-live-region-text",
      selector: ".shopify-section",
    }]: ""
      console.log(' window.location.pathname', window.location.pathname)
      const sections = [
        ...cartItems,
        {
          id: "slide-cart-items",
          section: document.getElementById("slide-cart-items").dataset.id,
          selector: ".js-contents",
        },
      ];
      console.log('sections',sections)
      return sections
  }


  updateQuantity(line, quantity, name) {
  console.log('line',line, "quantity",quantity, "name",name);
  this.enableLoading(line);

  const body = JSON.stringify({
    line,
    quantity,
    sections: this.getSectionsToRender().map((section) => section.section),
    sections_url: window.location.pathname,
  });

  console.log('body',body,'name',name)

  fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
    .then((response) => {
      response.json().then((d) => {
      console.log('response-dt', d)
    });
    return response.text();
    })
    .then((state) => {
      const parsedState = JSON.parse(state);
      this.classList.toggle("is-empty", parsedState.item_count === 0);
      const cartFooter = document.getElementById("main-cart-footer");

      if (cartFooter){
        cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
      }

      this.getSectionsToRender().forEach((section) => {
        const elementToReplace =
          document
            .getElementById(section.id)
            .querySelector(section.selector) ||
          document.getElementById(section.id);
        elementToReplace.innerHTML = this.getSectionInnerHTML(
          parsedState.sections[section.section],
          section.selector
        );
      });


      this.updateLiveRegions(line, parsedState.item_count);
      const lineItem = document.getElementById(`cartItem-${line}`) ||  document.getElementById(`CartItem-${line}`);
      console.log('lineItem',lineItem);

      if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
        lineItem.querySelector(`[name="${name}"]`).focus();
      }  

      this.disableLoading();
    })
    .catch(() => {
      this.querySelectorAll(".loading-overlay").forEach((overlay) =>
        overlay.classList.add("hidden")
      );
      const errors = document.getElementById("cart-errors");

      if (errors) {
        errors.textContent = window.cartStrings.error;
      }
      this.disableLoading();
    });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError = document.getElementById(`Line-item-error-${line}`);

        const quantityElement = document.getElementById(`Quantity-${line}`);

      lineItemError.querySelector(".cart-item__error-text").innerHTML =
        window.cartStrings.quantityError.replace(
          "[quantity]",
          quantityElement.value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute("aria-hidden", true);

    const cartStatus = document.getElementById("cart-live-region-text");

    cartStatus.setAttribute("aria-hidden", false);

    setTimeout(() => {
      cartStatus.setAttribute("aria-hidden", true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
      const mainCartItems =
        document.getElementById("main-cart-items") || document.getElementById("slide-cart-items");
      mainCartItems.classList.add("cart__items--disabled");
  
      const slideCartItemElements = this.querySelectorAll(
        `#cartItem-${line} .loading-overlay`
      );

      const cartItemElements = window.location.pathname === "/cart" ?  
      this.querySelectorAll(`#CartItem-${line} .loading-overlay`) : "";

      [...cartItemElements,...slideCartItemElements].forEach((overlay) => overlay.classList.remove("hidden"));
  
      document.activeElement.blur();
      this.lineItemStatusElement.setAttribute("aria-hidden", false);
  }

  disableLoading() {
      const mainCartItems = document.getElementById("main-cart-items") || document.getElementById("slide-cart-items");
      mainCartItems.classList.remove("cart__items--disabled");
  }
}

customElements.define("cart-items", CartItems);
