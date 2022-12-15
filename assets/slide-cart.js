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
    const slideCartSections = [
      {
        id: "cart-drawer",
        selector: "#CartDrawer",
      },
      {
        id: "cart-slider",
        selector: "#cartSlider",
      },
      {
        id: "cart-icon-bubble",
      },
    ];
    console.log("slideCartSections", slideCartSections);
    return slideCartSections;
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
