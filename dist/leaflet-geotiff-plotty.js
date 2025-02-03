import * as e from "plotty";
L.LeafletGeotiff.Plotty = L.LeafletGeotiffRenderer.extend({
  options: {
    applyDisplayRange: !0,
    colorScale: "viridis",
    clampLow: !0,
    clampHigh: !0,
    displayMin: 0,
    displayMax: 1,
    noDataValue: -9999,
    useWebGL: !1
  },
  initialize: function(t) {
    if (typeof e > "u")
      throw new Error("plotty not defined");
    this.name = "Plotty", L.setOptions(this, t), this._preLoadColorScale();
  },
  setColorScale: function(t) {
    this.options.colorScale = t, this.parent._reset();
  },
  setDisplayRange: function(t, a) {
    this.options.displayMin = t, this.options.displayMax = a, this.parent._reset();
  },
  setClamps: function(t, a) {
    this.options.clampLow = t, this.options.clampHigh = a, this.parent._reset();
  },
  getColorbarOptions() {
    return Object.keys(e.colorscales);
  },
  getColourbarDataUrl(t) {
    const a = document.createElement("canvas"), i = new e.plot({
      canvas: a,
      data: [0],
      width: 1,
      height: 1,
      domain: [0, 1],
      colorScale: t,
      clampLow: !0,
      clampHigh: !0,
      useWebGL: this.options.useWebGL
    });
    return dataUrl = i.colorScaleCanvas.toDataURL(), a.remove(), dataUrl;
  },
  _preLoadColorScale: function() {
    var t = document.createElement("canvas"), a = new e.plot({
      canvas: t,
      data: [0],
      width: 1,
      height: 1,
      domain: [this.options.displayMin, this.options.displayMax],
      colorScale: this.options.colorScale,
      clampLow: this.options.clampLow,
      clampHigh: this.options.clampHigh,
      useWebGL: this.options.useWebGL
    });
    this.colorScaleData = a.colorScaleCanvas.toDataURL();
  },
  render: function(t, a, i, s) {
    var o = document.createElement("canvas");
    let c = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ];
    this.options.useWebGL && (c = [
      1,
      0,
      0,
      0,
      -1,
      0,
      0,
      t.height,
      1
    ]);
    var n = new e.plot({
      data: t.data[0],
      // fix for use with rgb conversion (appending alpha channel)
      width: t.width,
      height: t.height,
      domain: [this.options.displayMin, this.options.displayMax],
      displayRange: [this.options.displayMin, this.options.displayMax],
      applyDisplayRange: this.options.applyDisplayRange,
      colorScale: this.options.colorScale,
      clampLow: this.options.clampLow,
      clampHigh: this.options.clampHigh,
      canvas: o,
      matrix: c,
      useWebGL: this.options.useWebGL
    });
    n.setNoDataValue(this.options.noDataValue), n.render(), this.colorScaleData = n.colorScaleCanvas.toDataURL();
    var l;
    if (this.options.useWebGL) {
      let h = new Uint8ClampedArray(t.width * t.height * 4), p = o.getContext("webgl");
      p.readPixels(0, 0, t.width, t.height, p.RGBA, p.UNSIGNED_BYTE, h), l = new ImageData(h, t.width, t.height);
    } else
      l = o.getContext("2d").getImageData(0, 0, o.width, o.height);
    var r = this.parent.transform(l, s);
    i.putImageData(r, s.xStart, s.yStart);
  }
});
L.LeafletGeotiff.plotty = function(t) {
  return new L.LeafletGeotiff.Plotty(t);
};
