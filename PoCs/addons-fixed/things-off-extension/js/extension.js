(function() {
  sleep = function(time) {
    const stop = new Date().getTime() + time;
    while(new Date().getTime() < stop); 
  }

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
        pre.innerText = "TURNING OFF...";
        window.API.getThings().then((res) => {
          const jsonstring = JSON.stringify(res, null, 2);
          const jsonarray = JSON.parse(jsonstring)
            .filter(obj => obj.properties.on !== undefined);
          
          let uri = "";
          const body = {on: false};
          for (let i = 0; i < jsonarray.length; i++) {
            let obj = jsonarray[i];          
            uri = obj.id + "/properties/on";
            window.API.putJson(uri, body).catch((e) => {
              console.error('Failed to fetch `on` property:', e);
            });
            sleep(2000);
          }
        }).catch((e) => {
          console.error('Failed to fetch things:', e);
        });
      });
    }
  }

  new ThingsOffExtension();
})();
