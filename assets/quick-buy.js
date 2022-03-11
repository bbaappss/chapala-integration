if (!customElements.get('quickbuy-modal')) {
  customElements.define('quickbuy-modal', class QuickBuyModal extends ModalDialog {
    constructor() {
      super();
      this.modalContent = this.querySelector('[id^="QuickBuyInfo-"]');
    }

    hide(preventFocus = false) {
      const cartNotification = document.querySelector('cart-notification');
      if (cartNotification) cartNotification.setActiveElement(this.openedBy);
      this.modalContent.innerHTML = '';
      
      if (preventFocus) this.openedBy = null;
      super.hide();
    }

    show(opener) {
      opener.setAttribute('aria-disabled', true);
      opener.classList.add('loading');
      opener.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      fetch(opener.getAttribute('data-product-url'))
        .then((response) => response.text())
        .then((responseText) => {
          const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
          const productInfo = responseHTML.querySelector('section[id^="MainProduct-"]');

          this.setInnerHTML(this.modalContent, productInfo.innerHTML);
          
          if (window.Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }
          
          this.removeGalleryListSemantic();
          this.preventVariantSwitching();
          super.show(opener);
        })
        .finally(() => {
          opener.removeAttribute('aria-disabled');
          opener.classList.remove('loading');
          opener.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    setInnerHTML(element, html) {
      element.innerHTML = html;
      element.querySelectorAll("script").forEach( oldScript => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach(attribute => newScript.setAttribute(attribute.name, attribute.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }

    preventVariantSwitching() {
      this.modalContent.querySelector('variant-radios,variant-selects').setAttribute('data-update-url', 'false');
    }

    removeGalleryListSemantic() {
      const galleryList = this.modalContent.querySelector('[id^="Slider-Gallery"]');
      if (!galleryList) return;

      galleryList.setAttribute('role', 'presentation');
      galleryList.querySelectorAll('[id^="Slide-"]').forEach(li => li.setAttribute('role', 'presentation'));
    }
  });
}
