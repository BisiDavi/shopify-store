class SlideCart extends HTMLElement {
  constructor() {
    super();

    this.slider = document.getElementById("cartSlider");
    this.closeButton = document.getElementById("closeButton");
    this.openButton = document.getElementById("cart-icon-bubble");

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

  getSectionsToRender() {
   return [
      {
        id: "cartSlider",
        section: "cartSlider",
        selector: "#cartSlider",
      },
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items").dataset.id,
        selector: ".js-contents",
      },
    ];
  }

  renderContents(parsedState) {
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
      }
    ];
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }
}

customElements.define("slide-cart", SlideCart);
