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
          const jsonstring = JSON.stringify(res, null, 2);
          const jsonarray = JSON.parse(jsonstring)
            .filter(obj => obj['@type'].includes('Light'));

          for (let n = 0; n < jsonarray.length; n++) {
            let obj = jsonarray[n];
            let uri = obj.id + "/properties/on";
            const body = {on: false};
            window.API.putJson(uri, body).catch((e) => {
              console.error('Failed to fetch `on` property:', e);
            });      
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
