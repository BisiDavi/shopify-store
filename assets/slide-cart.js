class SlideCart extends HTMLElement {
  constructor() {
    super();

    this.slider = document.getElementById("cart-slider");
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

  getSectionsToRender() {
    return [
      {
        id: "cart-drawer",
        selector: "#CartDrawer",
      },
      {
        id: "cart-icon-bubble",
      },
    ];
  }

  renderContents(parsedState) {
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);
      sectionElement.innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
        section.selector
      );
    });

    setTimeout(() => {
      this.querySelector("#CartDrawer-Overlay").addEventListener(
        "click",
        this.close.bind(this)
      );
      this.open();
    });
  }

  getSectionsToRender() {
    return [
      {
        id: "cart-slider",
        selector: "cart-slider",
      },
      {
        id: "cart-icon-bubble",
      },
    ];
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
