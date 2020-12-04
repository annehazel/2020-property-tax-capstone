import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
import define from "https://api.observablehq.com/@d3/color-legend.js?v=3";
(new Runtime).module(define, name => {
  if (name === "legend") return Inspector.into(".legend")();
  if (name === "swatches") return Inspector.into(".swatches")();
});
