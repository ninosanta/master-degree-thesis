(function() {
  class ThingsOffExtension extends window.Extension {
    constructor() {
      super('things-off-extension');
      this.addMenuEntry('Things OFF');

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

      const pre = document.getElementById('extension-things-off-extension-status-response');
      const off_button = document.getElementById('extension-things-off-extension-off-button');

      off_button.addEventListener('click', () => {
        window.API.getThings().then((res) => {
          const jsonarray = res;  // Array of Things in JSON format

          let uri = "";
          const body = {on: false};
          for (let n = 0; n < /*2000 */jsonarray.length; n++) {
            let obj = jsonarray[n];
            if (/*obj !== undefined && */obj.properties.on !== undefined) { 
              uri = obj.id + "/properties/on";
            }
            if (uri !== "") {
              window.API.putJson(uri, body)
                .then(() => {
                  if (n === jsonarray.length - 1) {
                    pre.innerText = "Now it is everything off";
                  }
                  //console.log(`Turning off the thing`);
                })
                .catch((e) => {
                  console.error('Failed to fetch `on` property:', e);
                });
            }
          }
        }).catch((e) => {
          console.error('Failed to fetch things:', e);
        });
      });
    }
  }

  new ThingsOffExtension();
})();
