(function() {
  class LightsOffExtension extends window.Extension {
    constructor() {
      super('lights-off-extension');
      this.addMenuEntry('Lights OFF');

      if (!window.Extension.prototype.hasOwnProperty('load')) {
        this.load();
      }
    }

    load() {
      this.content = '';
      return fetch(`/extensions/${this.id}/views/content.html`)
        .then((res) => res.text())
        .then((text) => {
          this.content = text;
        })
        .catch((e) => console.error('Failed to fetch content:', e));
    }

    show() {
      this.view.innerHTML = this.content;

      const pre = document.getElementById('extension-lights-off-extension-status-response');
      const off_button = document.getElementById('extension-lights-off-extension-off-button');

      off_button.addEventListener('click', () => {
        window.API.getThings().then((res) => {
          const jsonarray = res;  // Array of Things in JSON format

          /* l'id dell'i-esimo json object avente tra le proprietà `on` e il cui valore è true` */
          for (let n = 0; n < jsonarray.length; n++) {
            let obj = jsonarray[n];
            /* obj.properties.on.value viene preso dal db e quindi non è il valore effettivo.
             * per evitare di spegnere qualcosa che è già spento, si potrebbe fare una GET del
             * valore effettivo di quella proprietà e poi fare la PUT solo se il valore è true.
             * ma a 'sto punto diventa più efficiente fare semplicemnte la put per spegnere tutto
             * e basta. */
            if (obj.properties.on !== undefined) {
              let uri = obj.id + "/properties/on";
              const body = {on: false};
              window.API.putJson(uri, body).catch((e) => {
                console.error('Failed to fetch `on` property:', e);
              });      
            }
          }
          pre.innerText = "Now it is everything off";
        }).catch((e) => {
          console.error('Failed to fetch things:', e);
        });
      });
    }
  }

  new LightsOffExtension();
})();
