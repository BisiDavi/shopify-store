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
        return [
          {
            id: "main-cart-items",
            section: document.getElementById("main-cart-items").dataset.id,
            selector: ".js-contents",
          },
          {
            id: "cart-icon-bubble",
            section: "cart-icon-bubble",
            selector: ".shopify-section",
          },
          {
            id: "item-price",
            section: "amount",
            selector: ".amount",
          },
          {
            id: "cart-live-region-text",
            section: "cart-live-region-text",
            selector: ".shopify-section",
          },
           {
            id: "slide-cart-subtotal",
            section: "slide-cart-subtotal",
            selector: ".subtotal",
          }
        ];
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
        response.json().then((d) => console.log('response-dt', d))
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        this.classList.toggle("is-empty", parsedState.item_count === 0);
        const cartFooter = document.getElementById("main-cart-footer");

        if (cartFooter){
          cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
        }
        if (cartDrawerWrapper){
          cartDrawerWrapper.classList.toggle("is-empty", parsedState.item_count === 0);
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
        const lineItem = document.getElementById(`cartItem-${line}`);

        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(
                cartDrawerWrapper,
                lineItem.querySelector(`[name="${name}"]`)
              )
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(
            cartDrawerWrapper.querySelector(".drawer__inner-empty"),
            cartDrawerWrapper.querySelector("a")
          );
        } else if (document.querySelector(".cart-item") && cartDrawerWrapper) {
          trapFocus(
            cartDrawerWrapper,
            document.querySelector(".cart-item__name")
          );
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
          document.getElementById("main-cart-items") ||
          mainCartItems.classList.add("cart__items--disabled");
    
        const cartItemElements = this.querySelectorAll(
          `#cartItem-${line} .loading-overlay`
        );
   
        [...cartItemElements].forEach((overlay) => overlay.classList.remove("hidden"));
    
        document.activeElement.blur();
        this.lineItemStatusElement.setAttribute("aria-hidden", false);
    }

    disableLoading() {
        const mainCartItems = document.getElementById("main-cart-items");
        mainCartItems.classList.remove("cart__items--disabled");
    }
}

customElements.define("cart-items", CartItems);