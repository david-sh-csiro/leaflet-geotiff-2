L.LeafletGeotiff.RGB = L.LeafletGeotiffRenderer.extend({
  options: {
    cutoffBrightest: 0
  },
  initialize: function(t) {
    L.setOptions(this, t), this.name = "Canvas Renderer";
  },
  render: function(t, g, h, o) {
    var n = h.createImageData(t.width, t.height), f = t.data.length < 3;
    if (!this.options.bandMaxVal) {
      let a = 0;
      for (let e = 0; e < t.data.length; e++) {
        let i = t.data[e].filter(function(u, c, p) {
          return !isNaN(u);
        }).sort(), s = i[i.length - 1];
        this.options.cutoffBrightest && this.options.cutoffBrightest > 0 && this.options.cutoffBrightest < 1 && (s = i[i.length - 1 - Math.round(i.length * this.options.cutoffBrightest)]), s > a && (a = s), console.log(
          "min value for band" + e + ": " + i[0] + ", max value for band" + e + ": " + i[i.length - 1]
        ), this.options.bandMaxVal = a;
      }
    }
    var d = this.options.bandMaxVal > 0 ? this.options.bandMaxVal : 255;
    function l(a) {
      return Math.round(a / d * 255);
    }
    for (let a = 0, e = 0; a < n.data.length; a += 4, e += 1)
      n.data[a] = l(t.data[0][e]), n.data[a + 1] = l(t.data[f ? 0 : 1][e]), n.data[a + 2] = l(t.data[f ? 0 : 2][e]), n.data[a + 3] = f || !t.data[3] ? 255 : t.data[3][e];
    var r = this.parent.transform(n, o);
    h.putImageData(r, o.xStart, o.yStart);
  }
});
L.LeafletGeotiff.rgb = function(t) {
  return new L.LeafletGeotiff.RGB(t);
};
