class SlideCart extends HTMLElement {
  constructor() {
    super();

    this.slider = document.getElementById("cart-slider");
    this.closeButton = document.getElementById("closeButton");
    this.openButton = document.getElementById("cart-icon-bubble");
    this.addToCartButton = document.querySelector(".quick-add__submit");

    this.slider.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.closeButton.addEventListener("click", this.close.bind(this));
    this.openButton.addEventListener("click", this.open.bind(this));
    this.addToCartButton.addEventListener("click", this.open.bind(this));
  }

  open() {
    this.slider.classList.add("active");

    this.slider.addEventListener(
      "transitionend",
      () => {
        this.slider.focus();
        trapFocus(this.slider);
      },
      { once: true }
    );
  }

  close() {
    this.slider.classList.remove("active");

    removeTrapFocus(this.activeElement);
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define("slide-cart", SlideCart);
