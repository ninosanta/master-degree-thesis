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
      const calc_button = document.getElementById('extension-power-cons-extension-calc-button');
      const reset_button = document.getElementById('extension-power-cons-extension-reset-button');


      calc_button.addEventListener('click', () => {
        let sum = 0;
        let plugs = 0;

        window.API.getThings().then((res) => {
          const jsonarray = res;  // Array of Things in JSON format
          
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
                if(n === jsonarray.length-1) {
                  pre.innerText = `Current power consumption: ${(sum/plugs*1000).toFixed(2)}mW`;
                }
              })
              .catch((e) => {
                console.error('Failed to get `Power` property:', e);
              });  
            }
          }
        });
      });

      reset_button.addEventListener('click', () => {
        window.API.getThings().then((res) => {
          const jsonarray = res;  // Array of Things in JSON format
          
          for (let n = 0; n < jsonarray.length; n++) {
            let obj = jsonarray[n];

            if (obj.properties.instantaneousPower !== undefined) {
              let uri = obj.id + "/properties/instantaneousPower";

              const body = {instantaneousPower: 0};
              window.API.putJson(uri, body).then((res) => {
                console.log(res);
              }).catch((e) => {
                console.error('Failed to fetch `instantaneousPower` property:', e);
              });  
            }
          }
        });
        pre.innerText = "0mW";
      });
    }
  }

  new PowerConsExtension();
})();
