(function() {
  class PowerConsExtension extends window.Extension {
    constructor() {
      super('power-cons-extension');
      this.addMenuEntry('Power Consumption');

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

      const pre = document.getElementById('extension-power-cons-extension-result-response');
      const start_button = document.getElementById('extension-power-cons-extension-start-button');
      const reset_button = document.getElementById('extension-power-cons-extension-reset-button');


      start_button.addEventListener('click', () => {
        let sum = 0;
        let plugs = 0;

        window.API.getThings().then((res) => {
          const jsonstring = JSON.stringify(res, null, 2);
          const jsonarray = JSON.parse(jsonstring);  // facendo il parse di res non funziona
          
          for (let n = 0; n < jsonarray.length; n++) {
            let obj = jsonarray[n];

            if (obj.properties.instantaneousPower !== undefined) {
              let uri = obj.id + "/properties/instantaneousPower";

              window.API.getJson(uri).then((res) => {
                let value = res.instantaneousPower;
                value = parseFloat(value);
                //console.log(`Received value is ${value}W`);
                sum += value;
                plugs++;
              }).then(() => {
                if(n === jsonarray.length-1) {
                  pre.innerText = `Current power consumption: ${(sum/plugs*1000).toFixed(2)}mW`;
                }
              }).catch((e) => {
                console.error('Failed to get `Power` property:', e);
              });  
            }
          }
        });
      });

      reset_button.addEventListener('click', () => {
        pre.innerText = "";
      });
    }
  }

  new PowerConsExtension();
})();
