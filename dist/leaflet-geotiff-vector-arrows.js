L.LeafletGeotiff.VectorArrows = L.LeafletGeotiffRenderer.extend({
  options: {
    arrowSize: 20
  },
  initialize: function(e) {
    this.name = "Vector", L.setOptions(this, e);
  },
  setArrowSize: function(e) {
    this.options.colorScale = e, this.parent._reset();
  },
  render: function(e, p, t, r) {
    for (var o = this.options.arrowSize, f = (r.rasterPixelBounds.max.x - r.rasterPixelBounds.min.x) / e.width, n = Math.max(1, Math.floor(1.2 * o / f)), a = 0; a < e.height; a = a + n)
      for (var i = 0; i < e.width; i = i + n) {
        var s = a * e.width + i;
        if (e.data[0][s] >= 0) {
          var h = this.parent._rasterBounds._southWest.lng + (i + 0.5) * r.lngSpan, v = this.parent._rasterBounds._northEast.lat - (a + 0.5) * r.latSpan, l = this.parent._map.latLngToContainerPoint(
            L.latLng(v, h)
          ), d = l.x, w = l.y;
          t.save(), t.translate(d, w), t.rotate((90 + e.data[0][s]) * Math.PI / 180), t.beginPath(), t.moveTo(-o / 2, 0), t.lineTo(+o / 2, 0), t.moveTo(o * 0.25, -o * 0.25), t.lineTo(+o / 2, 0), t.lineTo(o * 0.25, o * 0.25), t.stroke(), t.restore();
        }
      }
  }
});
L.LeafletGeotiff.vectorArrows = function(e) {
  return new L.LeafletGeotiff.VectorArrows(e);
};
