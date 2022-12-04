class SlideCart extends HTMLElement {
  constructor() {
    super();

    this.slider = document.getElementById("cart-slider");
    this.onBodyClick = this.handleBodyClick.bind(this);

    this.notification.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
  }
}
