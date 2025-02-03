"use strict";L.LeafletGeotiff.VectorArrows=L.LeafletGeotiffRenderer.extend({options:{arrowSize:20},initialize:function(e){this.name="Vector",L.setOptions(this,e)},setArrowSize:function(e){this.options.colorScale=e,this.parent._reset()},render:function(e,w,t,a){for(var o=this.options.arrowSize,f=(a.rasterPixelBounds.max.x-a.rasterPixelBounds.min.x)/e.width,n=Math.max(1,Math.floor(1.2*o/f)),i=0;i<e.height;i=i+n)for(var r=0;r<e.width;r=r+n){var s=i*e.width+r;if(e.data[0][s]>=0){var h=this.parent._rasterBounds._southWest.lng+(r+.5)*a.lngSpan,v=this.parent._rasterBounds._northEast.lat-(i+.5)*a.latSpan,l=this.parent._map.latLngToContainerPoint(L.latLng(v,h)),d=l.x,u=l.y;t.save(),t.translate(d,u),t.rotate((90+e.data[0][s])*Math.PI/180),t.beginPath(),t.moveTo(-o/2,0),t.lineTo(+o/2,0),t.moveTo(o*.25,-o*.25),t.lineTo(+o/2,0),t.lineTo(o*.25,o*.25),t.stroke(),t.restore()}}}});L.LeafletGeotiff.vectorArrows=function(e){return new L.LeafletGeotiff.VectorArrows(e)};
