class DeleteCartItemButton extends HTMLElement{
  constructor(){
      super();

      this.addEventListener("click", (event) => {
          event.preventDefault();
          const slideCart = this.closest("slide-cart");
          slideCart.updateQuantity(this.dataset.index, 0);
      });
  }
}

customElements.define("delete-cart-item-button", DeleteCartItemButton)

class SlideCart extends HTMLElement {
  constructor() {
    super();

    this.slider = document.getElementById("cartSlider");
    this.closeButton = document.getElementById("closeButton");
    this.openButton = document.getElementById("cart-icon-bubble");

    this.lineItemStatusElement =
    document.getElementById("shopping-cart-line-item-status");

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
        .reduce((total, quantityInput) => total + parseInt(quantityInput.value),0); 

    this.debouncedOnChange = debounce((event) => {
        this.onChange(event);
        }, 300); 
        
    this.addEventListener("change", this.debouncedOnChange.bind(this));

    this.slider.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.closeButton.addEventListener("click", this.close.bind(this));
    this.openButton.addEventListener("click", this.open.bind(this));
  }

  open() {
    this.slider.classList.add("active", "animate");

    this.slider.addEventListener(
      "transitionend",
      () => {
        this.slider.focus();
        trapFocus(this.slider);
      },
      { once: true }
    );
  }

  setActiveElement(element) {
    this.activeElement = element;
  }

  close() {
    this.slider.classList.remove("active");
    removeTrapFocus(this.activeElement);
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute("name")
    );
}

  renderContents(parsedState) {
    console.log('parsedState',parsedState)
    this.getSectionsToRender().forEach((section) => {
      document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
        section.selector
      );
    });
  }

  getSectionsToRender() {
    return [
      {
        id: "slide-cart",
        section: document.getElementById("slide-cart"),
        selector: ".cart-group",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
      {
        id: "slide-cart-subtotal",
        section: "slide-cart-subtotal",
        selector: ".shopify-section",
      },
      {
        id: "slide-cart-items",
        section: document.getElementById("slide-cart-items").dataset.id,
        selector: ".shopify-section",
      },
    ];
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
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

customElements.define("slide-cart", SlideCart);
