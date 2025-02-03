import * as d from "geotiff";
try {
  new window.ImageData(new Uint8ClampedArray([0, 0, 0, 0]), 1, 1);
} catch {
  var D = function() {
    var e = [].concat(Array.prototype.slice.call(arguments)), i = void 0;
    if (e.length < 2)
      throw new TypeError(
        'Failed to construct "ImageData": 2 arguments required, but only ' + e.length + " present."
      );
    if (e.length > 2) {
      if (i = e.shift(), !(i instanceof Uint8ClampedArray))
        throw new TypeError(
          'Failed to construct "ImageData": parameter 1 is not of type "Uint8ClampedArray"'
        );
      if (i.length !== 4 * e[0] * e[1])
        throw new Error(
          'Failed to construct "ImageData": The input data byte length is not a multiple of (4 * width * height)'
        );
    }
    var s = e[0], o = e[1], r = document.createElement("canvas"), n = r.getContext("2d"), h = n.createImageData(s, o);
    return i && h.data.set(i), h;
  };
  window.ImageData = D;
}
L.LeafletGeotiff = L.ImageOverlay.extend({
  options: {
    arrayBuffer: null,
    arrowSize: 20,
    band: 0,
    image: 0,
    renderer: null,
    rBand: 0,
    gBand: 1,
    bBand: 2,
    alphaBand: 0,
    // band to use for (generating) alpha channel
    transpValue: 0,
    // original band value to interpret as transparent
    pane: "overlayPane",
    onError: null,
    sourceFunction: null,
    noDataValue: void 0,
    noDataKey: void 0,
    useWorker: !1
  },
  initialize(t, a) {
    if (typeof d > "u")
      throw new Error("GeoTIFF not defined");
    this._url = t, this.raster = {}, this.sourceFunction = d.fromUrl, this._blockSize = 65536, this.x_min = null, this.x_max = null, this.y_min = null, this.y_max = null, this.min = null, this.max = null, L.Util.setOptions(this, a), this.options.bounds && (this._rasterBounds = L.latLngBounds(a.bounds)), this.options.renderer && this.options.renderer.setParent(this), this.options.sourceFunction && (this.sourceFunction = this.options.sourceFunction), this.options.blockSize && (this._blockSize = this.options.blockSize), this._getData();
  },
  setURL(t) {
    this._url = t, this._getData();
  },
  onAdd(t) {
    this._map = t, this._image || this._initImage(), this._image.style.opacity = this.options.opacity || 1, t._panes[this.options.pane].appendChild(this._image), t.on("moveend", this._reset, this), this.options.clearBeforeMove && t.on("movestart", this._moveStart, this), t.options.zoomAnimation && L.Browser.any3d && t.on("zoomanim", this._animateZoom, this), this._reset();
  },
  onRemove(t) {
    t.getPanes()[this.options.pane].removeChild(this._image), t.off("moveend", this._reset, this), this.options.clearBeforeMove && t.off("movestart", this._moveStart, this), t.options.zoomAnimation && t.off("zoomanim", this._animateZoom, this);
  },
  async _getData() {
    let t;
    return this.sourceFunction !== d.fromArrayBuffer ? t = await this.sourceFunction(this._url, {
      blockSize: this._blockSize
    }).catch((a) => {
      if (this.options.onError)
        this.options.onError(a);
      else
        return console.error(`Failed to load from url or blob ${this._url}`, a), !1;
    }) : t = await d.fromArrayBuffer(this.options.arrayBuffer, {
      blockSize: this._blockSize
    }).catch((a) => {
      if (this.options.onError)
        this.options.onError(a);
      else
        return console.error(`Failed to load from array buffer ${this._url}`, a), !1;
    }), this._processTIFF(t), !0;
  },
  async _processTIFF(t) {
    if (this.tiff = t, await this.setBand(this.options.band).catch((a) => {
      console.error("this.setBand threw error", a);
    }), !this.options.bounds) {
      const a = await this.tiff.getImage(this.options.image).catch((e) => {
        console.error("this.tiff.getImage threw error", e);
      });
      await a.getFileDirectory();
      try {
        const e = a.getBoundingBox();
        this.x_min = e[0], this.x_max = e[2], this.y_min = e[1], this.y_max = e[3];
      } catch (e) {
        console.debug(
          "No bounds supplied, and unable to parse bounding box from metadata."
        ), this.options.onError && this.options.onError(e);
      }
      if (this.options.noDataKey && (this.options.noDataValue = this.getDescendantProp(
        a,
        this.options.noDataKey
      )), this._rasterBounds = L.latLngBounds([
        [this.y_min, this.x_min],
        [this.y_max, this.x_max]
      ]), this._reset(), window.Worker && this.options.useWorker) {
        const e = "onmessage = function(e){let data = e.data.data; let noDataValue = e.data.noDataValue; let min = data.filter(val=> val !== noDataValue).reduce((a,b)=>Math.min(a,b)); let max = data.filter(val => val !== noDataValue).reduce((a,b)=>Math.max(a,b)); postMessage({min:min, max:max});}", i = new Blob([e], { type: "application/javascript" }), s = new Worker(URL.createObjectURL(i));
        s.onmessage = (o) => {
          this.min = o.data.min, this.max = o.data.max, console.log("worker terminated", o), s.terminate();
        }, s.postMessage({ data: this.raster.data[0], noDataValue: this.options.noDataValue });
      } else
        this.min = this.raster.data[0].reduce((e, i) => i === this.options.noDataValue ? e : Math.min(e, i)), this.max = this.raster.data[0].reduce((e, i) => i == this.options.noDataValue ? e : Math.max(e, i));
    }
  },
  async setBand(t) {
    this.options.band = t;
    const a = await this.tiff.getImage(this.options.image).catch((n) => {
      console.error("this.tiff.getImage threw error", n);
    }), e = await a.readRasters({ samples: this.options.samples }).catch((n) => {
      console.error("image.readRasters threw error", n);
    }), i = e[this.options.rBand], s = e[this.options.gBand], o = e[this.options.bBand], r = this.options.transpValue ? e[this.options.alphaBand].map((n) => n == this.options.transpValue ? 0 : 255) : e[this.options.alphaBand];
    return this.raster.data = [i, s, o, r].filter(function(n) {
      return n;
    }), this.raster.width = a.getWidth(), this.raster.height = a.getHeight(), this._reset(), !0;
  },
  getRasterArray() {
    return this.raster.data;
  },
  getRasterCols() {
    return this.raster.width;
  },
  getRasterRows() {
    return this.raster.height;
  },
  getBounds() {
    return this._rasterBounds;
  },
  getMinMax() {
    return { min: this.min, max: this.max };
  },
  getValueAtLatLng(t, a) {
    try {
      var e = Math.floor(
        this.raster.width * (a - this._rasterBounds._southWest.lng) / (this._rasterBounds._northEast.lng - this._rasterBounds._southWest.lng)
      ), i = this.raster.height - Math.ceil(
        this.raster.height * (t - this._rasterBounds._southWest.lat) / (this._rasterBounds._northEast.lat - this._rasterBounds._southWest.lat)
      );
      if (e < 0 || e > this.raster.width || i < 0 || i > this.raster.height)
        return null;
      const s = i * this.raster.width + e, o = this.raster.data[0][s];
      if (this.options.noDataValue === void 0) return o;
      const r = parseInt(this.options.noDataValue);
      return o !== r ? o : null;
    } catch {
      return;
    }
  },
  _animateZoom(t) {
    if (L.version >= "1.0") {
      var a = this._map.getZoomScale(t.zoom), e = this._map._latLngBoundsToNewLayerBounds(
        this._map.getBounds(),
        t.zoom,
        t.center
      ).min;
      L.DomUtil.setTransform(this._image, e, a);
    } else {
      var a = this._map.getZoomScale(t.zoom), i = this._map.getBounds().getNorthWest(), s = this._map.getBounds().getSouthEast(), o = this._map._latLngToNewLayerPoint(i, t.zoom, t.center);
      this._map._latLngToNewLayerPoint(s, t.zoom, t.center)._subtract(o), this._image.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(o) + " scale(" + a + ") ";
    }
  },
  _moveStart() {
    this._image.style.display = "none";
  },
  _reset() {
    if (this.hasOwnProperty("_map") && this._map && this._rasterBounds) {
      var t = this._map.latLngToLayerPoint(
        this._map.getBounds().getNorthWest()
      ), a = this._map.latLngToLayerPoint(this._map.getBounds().getSouthEast())._subtract(t);
      L.DomUtil.setPosition(this._image, t), this._image.style.width = a.x + "px", this._image.style.height = a.y + "px", this._drawImage(), this._image.style.display = "block";
    }
  },
  setClip(t) {
    this.options.clip = t, this._reset();
  },
  _getPixelByLatLng(t) {
    var a = this._map.latLngToLayerPoint(
      this._map.getBounds().getNorthWest()
    ), e = this._map.latLngToLayerPoint(t);
    return L.point(e.x - a.x, e.y - a.y);
  },
  _clipMaskToPixelPoints(t) {
    if (this.options.clip) {
      var a = this._map.latLngToLayerPoint(
        this._map.getBounds().getNorthWest()
      ), e = [];
      const r = this.options.clip[t];
      for (var i = 0; i < r.length; i++) {
        var s = this._map.latLngToLayerPoint(r[i]), o = L.point(s.x - a.x, s.y - a.y);
        e.push(o);
      }
      this._pixelClipPoints = e;
    } else
      this._pixelClipPoints = void 0;
  },
  _drawImage() {
    if (this.raster.hasOwnProperty("data")) {
      var t = {}, a = this._map.latLngToLayerPoint(
        this._map.getBounds().getNorthWest()
      ), e = this._map.latLngToLayerPoint(this._map.getBounds().getSouthEast())._subtract(a);
      if (t.rasterPixelBounds = L.bounds(
        this._map.latLngToContainerPoint(this._rasterBounds.getNorthWest()),
        this._map.latLngToContainerPoint(this._rasterBounds.getSouthEast())
      ), t.rasterPixelBounds.max.x = parseInt(t.rasterPixelBounds.max.x), t.rasterPixelBounds.min.x = parseInt(t.rasterPixelBounds.min.x), t.rasterPixelBounds.max.y = parseInt(t.rasterPixelBounds.max.y), t.rasterPixelBounds.min.y = parseInt(t.rasterPixelBounds.min.y), t.xStart = t.rasterPixelBounds.min.x > 0 ? t.rasterPixelBounds.min.x : 0, t.xFinish = t.rasterPixelBounds.max.x < e.x ? t.rasterPixelBounds.max.x : e.x, t.yStart = t.rasterPixelBounds.min.y > 0 ? t.rasterPixelBounds.min.y : 0, t.yFinish = t.rasterPixelBounds.max.y < e.y ? t.rasterPixelBounds.max.y : e.y, t.plotWidth = t.xFinish - t.xStart, t.plotHeight = t.yFinish - t.yStart, t.plotWidth <= 0 || t.plotHeight <= 0) {
        var i = document.createElement("canvas");
        i.width = e.x, i.height = e.y;
        var s = i.getContext("2d");
        s.clearRect(0, 0, i.width, i.height), this._image.src = i.toDataURL();
        return;
      }
      t.xOrigin = this._map.getPixelBounds().min.x + t.xStart, t.yOrigin = this._map.getPixelBounds().min.y + t.yStart, t.lngSpan = (this._rasterBounds._northEast.lng - this._rasterBounds._southWest.lng) / this.raster.width, t.latSpan = (this._rasterBounds._northEast.lat - this._rasterBounds._southWest.lat) / this.raster.height;
      var i = document.createElement("canvas");
      i.width = e.x, i.height = e.y;
      var s = i.getContext("2d");
      s.clearRect(0, 0, i.width, i.height), this.options.renderer.render(this.raster, i, s, t), this._image.src = String(i.toDataURL());
    }
  },
  createSubmask(t, a, e) {
    var i = document.createElement("canvas");
    i.width = t.x, i.height = t.y;
    var s = i.getContext("2d");
    s.clearRect(0, 0, i.width, i.height);
    for (var o = 0; o < e.length; o++) {
      var r = e[o];
      o > 0 && (s.globalCompositeOperation = "destination-out"), s.beginPath();
      for (var n = 0; n < r.length; n++) {
        var h = this._getPixelByLatLng(r[n]);
        s.lineTo(h.x, h.y);
      }
      s.fill();
    }
    return i;
  },
  createMask(t, a) {
    var e = document.createElement("canvas");
    e.width = t.x, e.height = t.y;
    var i = e.getContext("2d");
    i.clearRect(0, 0, e.width, e.height), i.fillRect(a.xStart, a.yStart, a.plotWidth, a.plotHeight);
    const s = this.options.clip;
    if (s) {
      i.globalCompositeOperation = "destination-out";
      for (var o = 0; o < s.length; o++) {
        var r = this.createSubmask(t, a, s[o]);
        i.drawImage(r, 0, 0);
      }
    }
    return e;
  },
  transform(t, a) {
    var e = new ImageData(a.plotWidth, a.plotHeight), i = e.data, s = new Uint32Array(i.buffer), o = t.data, r = new Uint32Array(o.buffer), n = this._map.getZoom(), h = this._map.options.crs.scale(n), p = 57.29577951308232, u = this._map.options.crs.transformation._a, _ = this._map.options.crs.transformation._b, c = this._map.options.crs.transformation._c, f = this._map.options.crs.transformation._d;
    L.version >= "1.0" && (u = u * this._map.options.crs.projection.R, c = c * this._map.options.crs.projection.R);
    for (var l = 0; l < a.plotHeight; l++)
      for (var g = ((a.yOrigin + l) / h - f) / c, x = (2 * Math.atan(Math.exp(g)) - Math.PI / 2) * p, y = this.raster.height - Math.ceil(
        (x - this._rasterBounds._southWest.lat) / a.latSpan
      ), m = 0; m < a.plotWidth; m++) {
        var v = l * a.plotWidth + m, B = ((a.xOrigin + m) / h - _) / u, w = B * p, P = Math.floor(
          (w - this._rasterBounds._southWest.lng) / a.lngSpan
        ), b = y * this.raster.width + P;
        s[v] = r[b];
      }
    return e;
  },
  /**
   * Supports retreival of nested properties via
   * dot notation, e.g. foo.bar.baz
   */
  getDescendantProp(t, a) {
    const e = a.split(".");
    for (; e.length && (t = t[e.shift()]); ) ;
    return t;
  }
});
L.LeafletGeotiffRenderer = L.Class.extend({
  initialize(t) {
    L.setOptions(this, t);
  },
  setParent(t) {
    this.parent = t;
  },
  render(t, a, e, i) {
    throw new Error("Abstract class");
  }
});
L.leafletGeotiff = function(t, a) {
  return new L.LeafletGeotiff(t, a);
};
