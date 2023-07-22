# T5 - Things Off V2 Extension

Extension that should turn off every thing having the `on` property. It is implemented in such a way that updates the `uri` to fetch only if the thing in the array of things has the property `on` but, at each `for` cycle, if `uri !== ""` it sends the `putJson` to set the property `on` to `false` using the last `uri` that has beeen setted. 
This implies that the last thing that was shut down shut keeps to be shut down until the `uri` is updated again or until the end of the array is reached. Consequentely, if in the array after a thing having the `on` property there are a lot of things that do not have it, trying to switch on that thing again, while it is bombed of `PUT` request to keep it off, will imply some delay. 

To test this extension, rename the folder in `things-off-extension`.

Tested on things provided by the `virtual-things-adapter`.