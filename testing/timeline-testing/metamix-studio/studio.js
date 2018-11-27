(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function Do(parent) {
	var listeners = [];
	this.do = function(callback) {
		listeners.push(callback);
	};
	this.undo = function(callback) {
		listeners.splice(listeners.indexOf(callback), 1);
	};
	this.fire = function() {
		for (var v = 0; v < listeners.length; v++) {
			listeners[v].apply(parent, arguments);
		}
	};
}

if (typeof(module) === 'object') module.exports = Do;

},{}],2:[function(require,module,exports){
(function(e){if(typeof define==="function"&&define.amd){define(["jquery"],e)}else{e(jQuery)}})(function(e){"use strict";var t={},n=Math.max,r=Math.min;t.c={};t.c.d=e(document);t.c.t=function(e){return e.originalEvent.touches.length-1};t.o=function(){var n=this;this.o=null;this.$=null;this.i=null;this.g=null;this.v=null;this.cv=null;this.x=0;this.y=0;this.w=0;this.h=0;this.$c=null;this.c=null;this.t=0;this.isInit=false;this.fgColor=null;this.pColor=null;this.dH=null;this.cH=null;this.eH=null;this.rH=null;this.scale=1;this.relative=false;this.relativeWidth=false;this.relativeHeight=false;this.$div=null;this.run=function(){var t=function(e,t){var r;for(r in t){n.o[r]=t[r]}n._carve().init();n._configure()._draw()};if(this.$.data("kontroled"))return;this.$.data("kontroled",true);this.extend();this.o=e.extend({min:this.$.data("min")!==undefined?this.$.data("min"):0,max:this.$.data("max")!==undefined?this.$.data("max"):100,stopper:true,readOnly:this.$.data("readonly")||this.$.attr("readonly")==="readonly",cursor:this.$.data("cursor")===true&&30||this.$.data("cursor")||0,thickness:this.$.data("thickness")&&Math.max(Math.min(this.$.data("thickness"),1),.01)||.35,lineCap:this.$.data("linecap")||"butt",width:this.$.data("width")||200,height:this.$.data("height")||200,displayInput:this.$.data("displayinput")==null||this.$.data("displayinput"),displayPrevious:this.$.data("displayprevious"),fgColor:this.$.data("fgcolor")||"#87CEEB",inputColor:this.$.data("inputcolor"),font:this.$.data("font")||"Arial",fontWeight:this.$.data("font-weight")||"bold",inline:false,step:this.$.data("step")||1,rotation:this.$.data("rotation"),draw:null,change:null,cancel:null,release:null,format:function(e){return e},parse:function(e){return parseFloat(e)}},this.o);this.o.flip=this.o.rotation==="anticlockwise"||this.o.rotation==="acw";if(!this.o.inputColor){this.o.inputColor=this.o.fgColor}if(this.$.is("fieldset")){this.v={};this.i=this.$.find("input");this.i.each(function(t){var r=e(this);n.i[t]=r;n.v[t]=n.o.parse(r.val());r.bind("change blur",function(){var e={};e[t]=r.val();n.val(n._validate(e))})});this.$.find("legend").remove()}else{this.i=this.$;this.v=this.o.parse(this.$.val());this.v===""&&(this.v=this.o.min);this.$.bind("change blur",function(){n.val(n._validate(n.o.parse(n.$.val())))})}!this.o.displayInput&&this.$.hide();this.$c=e(document.createElement("canvas")).attr({width:this.o.width,height:this.o.height});this.$div=e('<div style="'+(this.o.inline?"display:inline;":"")+"width:"+this.o.width+"px;height:"+this.o.height+"px;"+'"></div>');this.$.wrap(this.$div).before(this.$c);this.$div=this.$.parent();if(typeof G_vmlCanvasManager!=="undefined"){G_vmlCanvasManager.initElement(this.$c[0])}this.c=this.$c[0].getContext?this.$c[0].getContext("2d"):null;if(!this.c){throw{name:"CanvasNotSupportedException",message:"Canvas not supported. Please use excanvas on IE8.0.",toString:function(){return this.name+": "+this.message}}}this.scale=(window.devicePixelRatio||1)/(this.c.webkitBackingStorePixelRatio||this.c.mozBackingStorePixelRatio||this.c.msBackingStorePixelRatio||this.c.oBackingStorePixelRatio||this.c.backingStorePixelRatio||1);this.relativeWidth=this.o.width%1!==0&&this.o.width.indexOf("%");this.relativeHeight=this.o.height%1!==0&&this.o.height.indexOf("%");this.relative=this.relativeWidth||this.relativeHeight;this._carve();if(this.v instanceof Object){this.cv={};this.copy(this.v,this.cv)}else{this.cv=this.v}this.$.bind("configure",t).parent().bind("configure",t);this._listen()._configure()._xy().init();this.isInit=true;this.$.val(this.o.format(this.v));this._draw();return this};this._carve=function(){if(this.relative){var e=this.relativeWidth?this.$div.parent().width()*parseInt(this.o.width)/100:this.$div.parent().width(),t=this.relativeHeight?this.$div.parent().height()*parseInt(this.o.height)/100:this.$div.parent().height();this.w=this.h=Math.min(e,t)}else{this.w=this.o.width;this.h=this.o.height}this.$div.css({width:this.w+"px",height:this.h+"px"});this.$c.attr({width:this.w,height:this.h});if(this.scale!==1){this.$c[0].width=this.$c[0].width*this.scale;this.$c[0].height=this.$c[0].height*this.scale;this.$c.width(this.w);this.$c.height(this.h)}return this};this._draw=function(){var e=true;n.g=n.c;n.clear();n.dH&&(e=n.dH());e!==false&&n.draw()};this._touch=function(e){var r=function(e){var t=n.xy2val(e.originalEvent.touches[n.t].pageX,e.originalEvent.touches[n.t].pageY);if(t==n.cv)return;if(n.cH&&n.cH(t)===false)return;n.change(n._validate(t));n._draw()};this.t=t.c.t(e);r(e);t.c.d.bind("touchmove.k",r).bind("touchend.k",function(){t.c.d.unbind("touchmove.k touchend.k");n.val(n.cv)});return this};this._mouse=function(e){var r=function(e){var t=n.xy2val(e.pageX,e.pageY);if(t==n.cv)return;if(n.cH&&n.cH(t)===false)return;n.change(n._validate(t));n._draw()};r(e);t.c.d.bind("mousemove.k",r).bind("keyup.k",function(e){if(e.keyCode===27){t.c.d.unbind("mouseup.k mousemove.k keyup.k");if(n.eH&&n.eH()===false)return;n.cancel()}}).bind("mouseup.k",function(e){t.c.d.unbind("mousemove.k mouseup.k keyup.k");n.val(n.cv)});return this};this._xy=function(){var e=this.$c.offset();this.x=e.left;this.y=e.top;return this};this._listen=function(){if(!this.o.readOnly){this.$c.bind("mousedown",function(e){e.preventDefault();n._xy()._mouse(e)}).bind("touchstart",function(e){e.preventDefault();n._xy()._touch(e)});this.listen()}else{this.$.attr("readonly","readonly")}if(this.relative){e(window).resize(function(){n._carve().init();n._draw()})}return this};this._configure=function(){if(this.o.draw)this.dH=this.o.draw;if(this.o.change)this.cH=this.o.change;if(this.o.cancel)this.eH=this.o.cancel;if(this.o.release)this.rH=this.o.release;if(this.o.displayPrevious){this.pColor=this.h2rgba(this.o.fgColor,"0.4");this.fgColor=this.h2rgba(this.o.fgColor,"0.6")}else{this.fgColor=this.o.fgColor}return this};this._clear=function(){this.$c[0].width=this.$c[0].width};this._validate=function(e){var t=~~((e<0?-.5:.5)+e/this.o.step)*this.o.step;return Math.round(t*100)/100};this.listen=function(){};this.extend=function(){};this.init=function(){};this.change=function(e){};this.val=function(e){};this.xy2val=function(e,t){};this.draw=function(){};this.clear=function(){this._clear()};this.h2rgba=function(e,t){var n;e=e.substring(1,7);n=[parseInt(e.substring(0,2),16),parseInt(e.substring(2,4),16),parseInt(e.substring(4,6),16)];return"rgba("+n[0]+","+n[1]+","+n[2]+","+t+")"};this.copy=function(e,t){for(var n in e){t[n]=e[n]}}};t.Dial=function(){t.o.call(this);this.startAngle=null;this.xy=null;this.radius=null;this.lineWidth=null;this.cursorExt=null;this.w2=null;this.PI2=2*Math.PI;this.extend=function(){this.o=e.extend({bgColor:this.$.data("bgcolor")||"#EEEEEE",angleOffset:this.$.data("angleoffset")||0,angleArc:this.$.data("anglearc")||360,inline:true},this.o)};this.val=function(e,t){if(null!=e){e=this.o.parse(e);if(t!==false&&e!=this.v&&this.rH&&this.rH(e)===false){return}this.cv=this.o.stopper?n(r(e,this.o.max),this.o.min):e;this.v=this.cv;this.$.val(this.o.format(this.v));this._draw()}else{return this.v}};this.xy2val=function(e,t){var i,s;i=Math.atan2(e-(this.x+this.w2),-(t-this.y-this.w2))-this.angleOffset;if(this.o.flip){i=this.angleArc-i-this.PI2}if(this.angleArc!=this.PI2&&i<0&&i>-.5){i=0}else if(i<0){i+=this.PI2}s=i*(this.o.max-this.o.min)/this.angleArc+this.o.min;this.o.stopper&&(s=n(r(s,this.o.max),this.o.min));return s};this.listen=function(){var t=this,i,s,o=function(e){e.preventDefault();var o=e.originalEvent,u=o.detail||o.wheelDeltaX,a=o.detail||o.wheelDeltaY,f=t._validate(t.o.parse(t.$.val()))+(u>0||a>0?t.o.step:u<0||a<0?-t.o.step:0);f=n(r(f,t.o.max),t.o.min);t.val(f,false);if(t.rH){clearTimeout(i);i=setTimeout(function(){t.rH(f);i=null},100);if(!s){s=setTimeout(function(){if(i)t.rH(f);s=null},200)}}},u,a,f=1,l={37:-t.o.step,38:t.o.step,39:t.o.step,40:-t.o.step};this.$.bind("keydown",function(i){var s=i.keyCode;if(s>=96&&s<=105){s=i.keyCode=s-48}u=parseInt(String.fromCharCode(s));if(isNaN(u)){s!==13&&s!==8&&s!==9&&s!==189&&(s!==190||t.$.val().match(/\./))&&i.preventDefault();if(e.inArray(s,[37,38,39,40])>-1){i.preventDefault();var o=t.o.parse(t.$.val())+l[s]*f;t.o.stopper&&(o=n(r(o,t.o.max),t.o.min));t.change(t._validate(o));t._draw();a=window.setTimeout(function(){f*=2},30)}}}).bind("keyup",function(e){if(isNaN(u)){if(a){window.clearTimeout(a);a=null;f=1;t.val(t.$.val())}}else{t.$.val()>t.o.max&&t.$.val(t.o.max)||t.$.val()<t.o.min&&t.$.val(t.o.min)}});this.$c.bind("mousewheel DOMMouseScroll",o);this.$.bind("mousewheel DOMMouseScroll",o)};this.init=function(){if(this.v<this.o.min||this.v>this.o.max){this.v=this.o.min}this.$.val(this.v);this.w2=this.w/2;this.cursorExt=this.o.cursor/100;this.xy=this.w2*this.scale;this.lineWidth=this.xy*this.o.thickness;this.lineCap=this.o.lineCap;this.radius=this.xy-this.lineWidth/2;this.o.angleOffset&&(this.o.angleOffset=isNaN(this.o.angleOffset)?0:this.o.angleOffset);this.o.angleArc&&(this.o.angleArc=isNaN(this.o.angleArc)?this.PI2:this.o.angleArc);this.angleOffset=this.o.angleOffset*Math.PI/180;this.angleArc=this.o.angleArc*Math.PI/180;this.startAngle=1.5*Math.PI+this.angleOffset;this.endAngle=1.5*Math.PI+this.angleOffset+this.angleArc;var e=n(String(Math.abs(this.o.max)).length,String(Math.abs(this.o.min)).length,2)+2;this.o.displayInput&&this.i.css({width:(this.w/2+4>>0)+"px",height:(this.w/3>>0)+"px",position:"absolute","vertical-align":"middle","margin-top":(this.w/3>>0)+"px","margin-left":"-"+(this.w*3/4+2>>0)+"px",border:0,background:"none",font:this.o.fontWeight+" "+(this.w/e>>0)+"px "+this.o.font,"text-align":"center",color:this.o.inputColor||this.o.fgColor,padding:"0px","-webkit-appearance":"none"})||this.i.css({width:"0px",visibility:"hidden"})};this.change=function(e){this.cv=e;this.$.val(this.o.format(e))};this.angle=function(e){return(e-this.o.min)*this.angleArc/(this.o.max-this.o.min)};this.arc=function(e){var t,n;e=this.angle(e);if(this.o.flip){t=this.endAngle+1e-5;n=t-e-1e-5}else{t=this.startAngle-1e-5;n=t+e+1e-5}this.o.cursor&&(t=n-this.cursorExt)&&(n=n+this.cursorExt);return{s:t,e:n,d:this.o.flip&&!this.o.cursor}};this.draw=function(){var e=this.g,t=this.arc(this.cv),n,r=1;e.lineWidth=this.lineWidth;e.lineCap=this.lineCap;if(this.o.bgColor!=="none"){e.beginPath();e.strokeStyle=this.o.bgColor;e.arc(this.xy,this.xy,this.radius,this.endAngle-1e-5,this.startAngle+1e-5,true);e.stroke()}if(this.o.displayPrevious){n=this.arc(this.v);e.beginPath();e.strokeStyle=this.pColor;e.arc(this.xy,this.xy,this.radius,n.s,n.e,n.d);e.stroke();r=this.cv==this.v}e.beginPath();e.strokeStyle=r?this.o.fgColor:this.fgColor;e.arc(this.xy,this.xy,this.radius,t.s,t.e,t.d);e.stroke()};this.cancel=function(){this.val(this.v)}};e.fn.dial=e.fn.knob=function(n){return this.each(function(){var r=new t.Dial;r.o=n;r.$=e(this);r.run()}).parent()}})
},{}],3:[function(require,module,exports){
"use strict";

/**
 * ArrayBuffer adapter consumes binary waveform data (data format version 1).
 * It is used as a data abstraction layer by `WaveformData`.
 *
 * This is supposed to be the fastest adapter ever:
 * * **Pros**: working directly in memory, everything is done by reference
 *   (including the offsetting)
 * * **Cons**: binary data are hardly readable without data format knowledge
 *   (and this is why this adapter exists).
 *
 * Also, it is recommended to use the `fromResponseData` factory.
 *
 * @see WaveformDataArrayBufferAdapter.fromResponseData
 * @param {DataView} response_data
 * @constructor
 */

function WaveformDataArrayBufferAdapter(response_data) {
  this.data = response_data;
}

/**
 * Detects if a set of data is suitable for the ArrayBuffer adapter.
 * It is used internally by `WaveformData.create` so you should not bother using it.
 *
 * @static
 * @param {Mixed} data
 * @returns {boolean}
 */

WaveformDataArrayBufferAdapter.isCompatible = function isCompatible(data) {
  return data && typeof data === "object" && "byteLength" in data;
};

/**
 * Setup factory to create an adapter based on heterogeneous input formats.
 *
 * It is the preferred way to build an adapter instance.
 *
 * ```javascript
 * var arrayBufferAdapter = WaveformData.adapters.arraybuffer;
 * var xhr = new XMLHttpRequest();
 *
 * // .dat file generated by audiowaveform program
 * xhr.open("GET", "http://example.com/waveforms/track.dat");
 * xhr.responseType = "arraybuffer";
 * xhr.addEventListener("load", function onResponse(progressEvent){
 *  var responseData = progressEvent.target.response;
 *
 *  // doing stuff with the raw data ...
 *  // you only have access to WaveformDataArrayBufferAdapter API
 *  var adapter = arrayBufferAdapter.fromResponseData(responseData);
 *
 *  // or making things easy by using WaveformData ...
 *  // you have access WaveformData API
 *  var waveform = new WaveformData(responseData, arrayBufferAdapter);
 * });
 *
 * xhr.send();
 * ```

 * @static
 * @param {ArrayBuffer} response_data
 * @return {WaveformDataArrayBufferAdapter}
 */

WaveformDataArrayBufferAdapter.fromResponseData = function fromArrayBufferResponseData(response_data) {
  return new WaveformDataArrayBufferAdapter(new DataView(response_data));
};

/**
 * @namespace WaveformDataArrayBufferAdapter
 */

 WaveformDataArrayBufferAdapter.prototype = {
  /**
   * Returns the data format version number.
   *
   * @return {Integer} Version number of the consumed data format.
   */

  get version() {
    return this.data.getInt32(0, true);
  },

  /**
   * Indicates if the response body is encoded in 8bits.
   *
   * **Notice**: currently the adapter only deals with 8bits encoded data.
   * You should favor that too because of the smaller data network fingerprint.
   *
   * @return {boolean} True if data are declared to be 8bits encoded.
   */

  get is_8_bit() {
    return Boolean(this.data.getUint32(4, true));
  },

  /**
   * Indicates if the response body is encoded in 16bits.
   *
   * @return {boolean} True if data are declared to be 16bits encoded.
   */

  get is_16_bit() {
    return !this.is_8_bit;
  },

  /**
   * Returns the number of samples per second.
   *
   * @return {Integer} Number of samples per second.
   */

  get sample_rate() {
    return this.data.getInt32(8, true);
  },

  /**
   * Returns the scale (number of samples per pixel).
   *
   * @return {Integer} Number of samples per pixel.
   */

  get scale() {
    return this.data.getInt32(12, true);
  },

  /**
   * Returns the length of the waveform data (number of data points).
   *
   * @return {Integer} Length of the waveform data.
   */

  get length() {
    return this.data.getUint32(16, true);
  },

  /**
   * Returns a value at a specific offset.
   *
   * @param {Integer} index
   * @return {number} waveform value
   */

  at: function at_sample(index) {
    return this.data.getInt8(20 + index);
  }
};

module.exports = WaveformDataArrayBufferAdapter;

},{}],4:[function(require,module,exports){
"use strict";

module.exports = {
  arraybuffer: require("./arraybuffer"),
  object: require("./object")
};

},{"./arraybuffer":3,"./object":5}],5:[function(require,module,exports){
"use strict";

/**
 * Object adapter consumes stringified JSON or JSON waveform data (data format version 1).
 * It is used as a data abstraction layer by `WaveformData`.
 *
 * This is supposed to be a fallback for browsers not supporting ArrayBuffer:
 * * **Pros**: easy to debug response_data and quite self describing.
 * * **Cons**: slower than ArrayBuffer, more memory consumption.
 *
 * Also, it is recommended to use the `fromResponseData` factory.
 *
 * @see WaveformDataObjectAdapter.fromResponseData
 * @param {String|Object} response_data JSON or stringified JSON
 * @constructor
 */

function WaveformDataObjectAdapter(response_data) {
  this.data = response_data;
}

/**
 * Detects if a set of data is suitable for the Object adapter.
 * It is used internally by `WaveformData.create` so you should not bother using it.
 *
 * @static
 * @param {Mixed} data
 * @returns {boolean}
 */

WaveformDataObjectAdapter.isCompatible = function isCompatible(data) {
  return data && ((typeof data === "object" && "sample_rate" in data) ||
                  (typeof data === "string" && "sample_rate" in JSON.parse(data)));
};

/**
 * Setup factory to create an adapter based on heterogeneous input formats.
 *
 * It is the preferred way to build an adapter instance.
 *
 * ```javascript
 * var objectAdapter = WaveformData.adapters.object;
 * var xhr = new XMLHttpRequest();
 *
 * // .dat file generated by audiowaveform program
 * xhr.open("GET", "http://example.com/waveforms/track.json");
 * xhr.responseType = "json";
 * xhr.addEventListener("load", function onResponse(progressEvent){
 *  var responseData = progressEvent.target.response;
 *
 *  // doing stuff with the raw data ...
 *  // you only have access to WaveformDataObjectAdapter API
 *  var adapter = objectAdapter.fromResponseData(responseData);
 *
 *  // or making things easy by using WaveformData ...
 *  // you have access WaveformData API
 *  var waveform = new WaveformData(responseData, objectAdapter);
 * });
 *
 * xhr.send();
 * ```

 * @static
 * @param {String|Object} response_data JSON or stringified JSON
 * @return {WaveformDataObjectAdapter}
 */

WaveformDataObjectAdapter.fromResponseData = function fromJSONResponseData(response_data) {
  if (typeof response_data === "string") {
    return new WaveformDataObjectAdapter(JSON.parse(response_data));
  }
  else {
    return new WaveformDataObjectAdapter(response_data);
  }
};

/**
 * @namespace WaveformDataObjectAdapter
 */

WaveformDataObjectAdapter.prototype = {
  /**
   * Returns the data format version number.
   *
   * @return {Integer} Version number of the consumed data format.
   */

  get version() {
    return this.data.version || 1;
  },

  /**
   * Indicates if the response body is encoded in 8bits.
   *
   * **Notice**: currently the adapter only deals with 8bits encoded data.
   * You should favor that too because of the smaller data network fingerprint.
   *
   * @return {boolean} True if data are declared to be 8bits encoded.
   */

  get is_8_bit() {
    return this.data.bits === 8;
  },

  /**
   * Indicates if the response body is encoded in 16bits.
   *
   * @return {boolean} True if data are declared to be 16bits encoded.
   */

  get is_16_bit() {
    return !this.is_8_bit;
  },

  /**
   * Returns the number of samples per second.
   *
   * @return {Integer} Number of samples per second.
   */

  get sample_rate() {
    return this.data.sample_rate;
  },

  /**
   * Returns the scale (number of samples per pixel).
   *
   * @return {Integer} Number of samples per pixel.
   */

  get scale() {
    return this.data.samples_per_pixel;
  },

  /**
   * Returns the length of the waveform data (number of data points).
   *
   * @return {Integer} Length of the waveform data.
   */

  get length() {
    return this.data.length;
  },

  /**
   * Returns a value at a specific offset.
   *
   * @param {Integer} index
   * @return {number} waveform value
   */

  at: function at_sample(index) {
    return this.data.data[index];
  }
};

module.exports = WaveformDataObjectAdapter;

},{}],6:[function(require,module,exports){
"use strict";

var WaveformDataSegment = require("./segment");
var WaveformDataPoint = require("./point");

/**
 * Facade to iterate on audio waveform response.
 *
 * ```javascript
 * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
 *
 * var json_waveform = new WaveformData(xhr.responseText, WaveformData.adapters.object);
 *
 * var arraybuff_waveform = new WaveformData(
 *   getArrayBufferData(),
 *   WaveformData.adapters.arraybuffer
 * );
 * ```
 *
 * ## Offsets
 *
 * An **offset** is a non-destructive way to iterate on a subset of data.
 *
 * It is the easiest way to **navigate** through data without having to deal
 * with complex calculations. Simply iterate over the data to display them.
 *
 * *Notice*: the default offset is the entire set of data.
 *
 * @param {String|ArrayBuffer|Mixed} response_data Waveform data,
 *   to be consumed by the related adapter.
 * @param {WaveformData.adapter|Function} adapter Backend adapter used to manage
 *   access to the data.
 * @constructor
 */

function WaveformData(response_data, adapter) {
  /**
   * Backend adapter used to manage access to the data.
   *
   * @type {Object}
   */

  this.adapter = adapter.fromResponseData(response_data);

  /**
   * Defined segments.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   *
   * console.log(waveform.segments.speakerA); // -> undefined
   *
   * waveform.set_segment(30, 90, "speakerA");
   *
   * console.log(waveform.segments.speakerA.start); // -> 30
   * ```
   *
   * @type {Object} A hash of `WaveformDataSegment` objects.
   */

  this.segments = {};

  /**
   * Defined points.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   *
   * console.log(waveform.points.speakerA); // -> undefined
   *
   * waveform.set_point(30, "speakerA");
   *
   * console.log(waveform.points.speakerA.timeStamp); // -> 30
   * ```
   *
   * @type {Object} A hash of `WaveformDataPoint` objects.
   */

  this.points = {};

  this.offset(0, this.adapter.length);
}

/**
 * Creates an instance of WaveformData by guessing the adapter from the
 * data type. It can also accept an XMLHttpRequest response.
 *
 * ```javascript
 * var xhr = new XMLHttpRequest();
 * xhr.open("GET", "http://example.com/waveforms/track.dat");
 * xhr.responseType = "arraybuffer";
 *
 * xhr.addEventListener("load", function onResponse(progressEvent) {
 *   var waveform = WaveformData.create(progressEvent.target);
 *
 *   console.log(waveform.duration);
 * });
 *
 * xhr.send();
 * ```
 *
 * @static
 * @throws TypeError
 * @param {XMLHttpRequest|Mixed} data
 * @return {WaveformData}
 */

WaveformData.create = function createFromResponseData(data) {
  var adapter = null;
  var xhrData = null;

  if (data && typeof data === "object" && ("responseText" in data || "response" in data)) {
    xhrData = ("responseType" in data) ? data.response : (data.responseText || data.response);
  }

  Object.keys(WaveformData.adapters).some(function(adapter_id) {
    if (WaveformData.adapters[adapter_id].isCompatible(xhrData || data)) {
      adapter = WaveformData.adapters[adapter_id];
      return true;
    }
  });

  if (adapter === null) {
    throw new TypeError("Could not detect a WaveformData adapter from the input.");
  }

  return new WaveformData(xhrData || data, adapter);
};

/**
 * Public API for the Waveform Data manager.
 *
 * @namespace WaveformData
 */

WaveformData.prototype = {
  /**
   * Clamp an offset of data upon the whole response body.
   * Pros: it's just a reference, not a new array. So it's fast.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.offset_length);   // -> 150
   * console.log(waveform.min[0]);          // -> -12
   *
   * waveform.offset(20, 50);
   *
   * console.log(waveform.min.length);      // -> 30
   * console.log(waveform.min[0]);          // -> -9
   * ```
   *
   * @param {Integer} start New beginning of the offset. (inclusive)
   * @param {Integer} end New ending of the offset (exclusive)
   */

  offset: function(start, end) {
    var data_length = this.adapter.length;

    if (end < 0) {
      throw new RangeError("End point must be non-negative [" + Number(end) + " < 0]");
    }

    if (end < start) {
      throw new RangeError("End point must not be before the start point [" + Number(end) + " < " + Number(start) + "]");
    }

    if (start < 0) {
      throw new RangeError("Start point must be non-negative [" + Number(start) + " < 0]");
    }

    if (start >= data_length) {
      throw new RangeError("Start point must be within range [" + Number(start) + " >= " + data_length + "]");
    }

    if (end > data_length) {
      end = data_length;
    }

    this.offset_start = start;
    this.offset_end = end;
    this.offset_length = end - start;
  },

  /**
   * Creates a new segment of data.
   * Pretty handy if you need to bookmark a duration and display it according
   * to the current offset.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(Object.keys(waveform.segments));          // -> []
   *
   * waveform.set_segment(10, 120);
   * waveform.set_segment(30, 90, "speakerA");
   *
   * console.log(Object.keys(waveform.segments));          // -> ['default', 'speakerA']
   * console.log(waveform.segments.default.min.length);    // -> 110
   * console.log(waveform.segments.speakerA.min.length);   // -> 60
   * ```
   *
   * @param {Integer} start Beginning of the segment (inclusive)
   * @param {Integer} end Ending of the segment (exclusive)
   * @param {String*} identifier Unique identifier. If nothing is specified,
   *   *default* will be used as a value.
   * @return {WaveformDataSegment}
   */

  set_segment: function setSegment(start, end, identifier) {
    if (identifier === undefined || identifier === null || identifier.length === 0) {
      identifier = "default";
    }

    this.segments[identifier] = new WaveformDataSegment(this, start, end);

    return this.segments[identifier];
  },

  /**
   * Creates a new point of data.
   * Pretty handy if you need to bookmark a specific point and display it
   * according to the current offset.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(Object.keys(waveform.points)); // -> []
   *
   * waveform.set_point(10);
   * waveform.set_point(30, "speakerA");
   *
   * console.log(Object.keys(waveform.points)); // -> ['default', 'speakerA']
   * ```
   *
   * @param {Integer} timeStamp the time to place the bookmark
   * @param {String*} identifier Unique identifier. If nothing is specified,
   *   *default* will be used as a value.
   * @return {WaveformDataPoint}
   */

  set_point: function setPoint(timeStamp, identifier) {
    if (identifier === undefined || identifier === null || identifier.length === 0) {
      identifier = "default";
    }

    this.points[identifier] = new WaveformDataPoint(this, timeStamp);

    return this.points[identifier];
  },

  /**
   * Removes a point of data.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(Object.keys(waveform.points));          // -> []
   *
   * waveform.set_point(30, "speakerA");
   * console.log(Object.keys(waveform.points));          // -> ['speakerA']
   * waveform.remove_point("speakerA");
   * console.log(Object.keys(waveform.points));          // -> []
   * ```
   *
   * @param {String*} identifier Unique identifier. If nothing is specified,
   *   *default* will be used as a value.
   * @return null
   */

  remove_point: function removePoint(identifier) {
    if (this.points[identifier]) {
      delete this.points[identifier];
    }
  },

  /**
   * Creates a new WaveformData object with resampled data.
   * Returns a rescaled waveform, to either fit the waveform to a specific
   * width, or to a specific zoom level.
   *
   * **Note**: You may specify either the *width* or the *scale*, but not both.
   * The `scale` will be deduced from the `width` you want to fit the data into.
   *
   * Adapted from Sequence::GetWaveDisplay in Audacity, with permission.
   *
   * ```javascript
   * // ...
   * var waveform = WaveformData.create({ ... });
   *
   * // fitting the data in a 500px wide canvas
   * var resampled_waveform = waveform.resample({ width: 500 });
   *
   * console.log(resampled_waveform.min.length);   // -> 500
   *
   * // zooming out on a 3 times less precise scale
   * var resampled_waveform = waveform.resample({ scale: waveform.adapter.scale * 3 });
   *
   * // partial resampling (to perform fast animations involving a resampling
   * // per animation frame)
   * var partially_resampled_waveform = waveform.resample({ width: 500, from: 0, to: 500 });
   *
   * // ...
   * ```
   *
   * @see https://code.google.com/p/audacity/source/browse/audacity-src/trunk/src/Sequence.cpp
   * @param {Number|{width: Number, scale: Number}} options Either a constraint width or a constraint sample rate
   * @return {WaveformData} New resampled object
   */

  resample: function(options) {
    if (typeof options === "number") {
      options = {
        width: options
      };
    }

    options.input_index = typeof options.input_index === "number" ? options.input_index : null;
    options.output_index = typeof options.output_index === "number" ? options.output_index : null;
    options.scale = typeof options.scale === "number" ? options.scale : null;
    options.width = typeof options.width === "number" ? options.width : null;

    var is_partial_resampling = Boolean(options.input_index) || Boolean(options.output_index);

    if (options.input_index != null && (options.input_index < 0)) {
      throw new RangeError("options.input_index should be a positive integer value. [" + options.input_index + "]");
    }

    if (options.output_index != null && (options.output_index < 0)) {
      throw new RangeError("options.output_index should be a positive integer value. [" + options.output_index + "]");
    }

    if (options.width != null && (options.width <= 0)) {
      throw new RangeError("options.width should be a strictly positive integer value. [" + options.width + "]");
    }

    if (options.scale != null && (options.scale <= 0)) {
      throw new RangeError("options.scale should be a strictly positive integer value. [" + options.scale + "]");
    }

    if (!options.scale && !options.width) {
      throw new RangeError("You should provide either a resampling scale or a width in pixel the data should fit in.");
    }

    var definedPartialOptionsCount = ["width", "scale", "output_index", "input_index"].reduce(function(count, key) {
      return count + (options[key] === null ? 0 : 1);
    }, 0);

    if (is_partial_resampling && definedPartialOptionsCount !== 4) {
      throw new Error("Some partial resampling options are missing. You provided " + definedPartialOptionsCount + " of them over 4.");
    }

    var output_data = [];
    var samples_per_pixel = options.scale || Math.floor(this.duration * this.adapter.sample_rate / options.width); // scale we want to reach
    var scale = this.adapter.scale; // scale we are coming from
    var channel_count = 2;

    var input_buffer_size = this.adapter.length; // the amount of data we want to resample i.e. final zoom want to resample all data but for intermediate zoom we want to resample subset
    var input_index = options.input_index || 0; // is this start point? or is this the index at current scale
    var output_index = options.output_index || 0; // is this end point? or is this the index at scale we want to be?
    var min = input_buffer_size ? this.min_sample(input_index) : 0; // min value for peak in waveform
    var max = input_buffer_size ? this.max_sample(input_index) : 0; // max value for peak in waveform
    var min_value = -128;
    var max_value = 127;

    if (samples_per_pixel < scale) {
      throw new Error("Zoom level " + samples_per_pixel + " too low, minimum: " + scale);
    }

    var where, prev_where, stop, value, last_input_index;

    function sample_at_pixel(x) {
      return Math.floor(x * samples_per_pixel);
    }

    function add_sample(min, max) {
      output_data.push(min, max);
    }

    while (input_index < input_buffer_size) {
      while (Math.floor(sample_at_pixel(output_index) / scale) <= input_index) {
        if (output_index) {
          add_sample(min, max);
        }

        last_input_index = input_index;

        output_index++;

        where      = sample_at_pixel(output_index);
        prev_where = sample_at_pixel(output_index - 1);

        if (where !== prev_where) {
          min = max_value;
          max = min_value;
        }
      }

      where = sample_at_pixel(output_index);
      stop = Math.floor(where / scale);

      if (stop > input_buffer_size) {
        stop = input_buffer_size;
      }

      while (input_index < stop) {
        value = this.min_sample(input_index);

        if (value < min) {
          min = value;
        }

        value = this.max_sample(input_index);

        if (value > max) {
          max = value;
        }

        input_index++;
      }

      if (is_partial_resampling && (output_data.length / channel_count) >= options.width) {
        break;
      }
    }

    if (is_partial_resampling) {
      if ((output_data.length / channel_count) > options.width &&
          input_index !== last_input_index) {
        add_sample(min, max);
      }
    }
    else if (input_index !== last_input_index) {
      add_sample(min, max);
    }

    return new WaveformData({
      version: this.adapter.version,
      samples_per_pixel: samples_per_pixel,
      length: output_data.length / channel_count,
      data: output_data,
      sample_rate: this.adapter.sample_rate
    }, WaveformData.adapters.object);
  },

  /**
   * Returns all the min peaks values.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.min.length);      // -> 150
   * console.log(waveform.min[0]);          // -> -12
   *
   * waveform.offset(20, 50);
   *
   * console.log(waveform.min.length);      // -> 30
   * console.log(waveform.min[0]);          // -> -9
   * ```
   *
   * @api
   * @return {Array.<Integer>} Min values contained in the offset.
   */

  get min() {
    return this.offsetValues(this.offset_start, this.offset_length, 0);
  },

  /**
   * Returns all the max peaks values.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.max.length);      // -> 150
   * console.log(waveform.max[0]);          // -> 12
   *
   * waveform.offset(20, 50);
   *
   * console.log(waveform.max.length);      // -> 30
   * console.log(waveform.max[0]);          // -> 5
   * ```
   *
   * @api
   * @return {Array.<Integer>} Max values contained in the offset.
   */

  get max() {
    return this.offsetValues(this.offset_start, this.offset_length, 1);
  },

  /**
   * Return the unpacked values for a particular offset.
   *
   * @param {Integer} start
   * @param {Integer} length
   * @param {Integer} correction The step to skip for each iteration
   *   (as the response body is [min, max, min, max...])
   * @return {Array.<Integer>}
   */

  offsetValues: function getOffsetValues(start, length, correction) {
    var adapter = this.adapter;
    var values = [];

    correction += (start * 2); // offset the positioning query

    for (var i = 0; i < length; i++) {
      values.push(adapter.at((i * 2) + correction));
    }

    return values;
  },

  /**
   * Compute the duration in seconds of the audio file.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   * console.log(waveform.duration);    // -> 10.33333333333
   *
   * waveform.offset(20, 50);
   * console.log(waveform.duration);    // -> 10.33333333333
   * ```
   *
   * @api
   * @return {number} Duration of the audio waveform, in seconds.
   */

  get duration() {
    return (this.adapter.length * this.adapter.scale) / this.adapter.sample_rate;
  },

  /**
   * Return the duration in seconds of the current offset.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.offset_duration);    // -> 10.33333333333
   *
   * waveform.offset(20, 50);
   *
   * console.log(waveform.offset_duration);    // -> 2.666666666667
   * ```
   *
   * @api
   * @return {number} Duration of the offset, in seconds.
   */

  get offset_duration() {
    return (this.offset_length * this.adapter.scale) / this.adapter.sample_rate;
  },

  /**
   * Return the number of pixels per second.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.pixels_per_second);       // -> 93.75
   * ```
   *
   * @api
   * @return {number} Number of pixels per second.
   */

  get pixels_per_second() {
    return this.adapter.sample_rate / this.adapter.scale;
  },

  /**
   * Return the amount of time represented by a single pixel.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.seconds_per_pixel);       // -> 0.010666666666666666
   * ```
   *
   * @return {number} Amount of time (in seconds) contained in a pixel.
   */

  get seconds_per_pixel() {
    return this.adapter.scale / this.adapter.sample_rate;
  },

  /**
   * Returns a value at a specific offset.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.at(20));              // -> -7
   * console.log(waveform.at(21));              // -> 12
   * ```
   *
   * @proxy
   * @param {Integer} index
   * @return {number} Offset value
   */

  at: function at_sample_proxy(index) {
    return this.adapter.at(index);
  },

  /**
   * Return the pixel location for a certain time.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.at_time(0.0000000023));       // -> 10
   * ```
   * @param {number} time
   * @return {integer} Index location for a specific time.
   */

  at_time: function at_time(time) {
    return Math.floor(time * this.adapter.sample_rate / this.adapter.scale);
  },

  /**
   * Returns the time in seconds for a particular index
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.time(10));                    // -> 0.0000000023
   * ```
   *
   * @param {Integer} index
   * @return {number}
   */

  time: function time(index) {
    return index * this.adapter.scale / this.adapter.sample_rate;
  },

  /**
   * Return if a pixel lies within the current offset.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.in_offset(50));      // -> true
   * console.log(waveform.in_offset(120));     // -> true
   *
   * waveform.offset(100, 150);
   *
   * console.log(waveform.in_offset(50));      // -> false
   * console.log(waveform.in_offset(120));     // -> true
   * ```
   *
   * @param {number} pixel
   * @return {boolean} True if the pixel lies in the current offset, false otherwise.
   */

  in_offset: function isInOffset(pixel) {
    return pixel >= this.offset_start && pixel < this.offset_end;
  },

  /**
   * Returns a min value for a specific offset.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.min_sample(10));      // -> -7
   * ```
   *
   * @param {Integer} offset
   * @return {Number} Offset min value
   */

  min_sample: function getMinValue(offset) {
    return this.adapter.at(offset * 2);
  },

  /**
   * Returns a max value for a specific offset.
   *
   * ```javascript
   * var waveform = WaveformData.create({ ... });
   *
   * console.log(waveform.max_sample(10));      // -> 12
   * ```
   *
   * @param {Integer} offset
   * @return {Number} Offset max value
   */

  max_sample: function getMaxValue(offset) {
    return this.adapter.at((offset * 2) + 1);
  }
};

/**
 * Available adapters to manage the data backends.
 *
 * @type {Object}
 */

WaveformData.adapters = {};

/**
 * WaveformData Adapter Structure
 *
 * @typedef {{from: Number, to: Number, platforms: {}}}
 */

WaveformData.adapter = function WaveformDataAdapter(response_data) {
  this.data = response_data;
};

module.exports = WaveformData;

},{"./point":7,"./segment":8}],7:[function(require,module,exports){
"use strict";

/**
 * Points are an easy way to keep track bookmarks of the described audio file.
 *
 * They return values based on the actual offset. Which means if you change your offset and:
 *
 * * a point becomes **out of scope**, no data will be returned;
 * * a point is **fully included in the offset**, its whole content will be returned.
 *
 * Points are created with the `WaveformData.set_point(timeStamp, name?)` method.
 *
 * @see WaveformData.prototype.set_point
 * @param {WaveformData} context WaveformData instance
 * @param {Integer} start Initial start index
 * @param {Integer} end Initial end index
 * @constructor
 */

function WaveformDataPoint(context, timeStamp) {
  this.context = context;

  /**
   * Start index.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_point(10, "example");
   *
   * console.log(waveform.points.example.timeStamp);  // -> 10
   *
   * waveform.offset(20, 50);
   * console.log(waveform.points.example.timeStamp);  // -> 10
   *
   * waveform.offset(70, 100);
   * console.log(waveform.points.example.timeStamp);  // -> 10
   * ```
   * @type {Integer} Time Stamp of the point
   */

  this.timeStamp = timeStamp;
}

/**
 * @namespace WaveformDataPoint
 */

WaveformDataPoint.prototype = {
  /**
   * Indicates if the point has some visible part in the actual WaveformData offset.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_point(10, "example");
   *
   * console.log(waveform.points.example.visible);        // -> true
   *
   * waveform.offset(0, 50);
   * console.log(waveform.points.example.visible);        // -> true
   *
   * waveform.offset(70, 100);
   * console.log(waveform.points.example.visible);        // -> false
   * ```
   *
   * @return {Boolean} True if visible, false otherwise.
   */

  get visible() {
    return this.context.in_offset(this.timeStamp);
  }
};

module.exports = WaveformDataPoint;

},{}],8:[function(require,module,exports){
"use strict";

/**
 * Segments are an easy way to keep track of portions of the described
 * audio file.
 *
 * They return values based on the actual offset. Which means if you change your
 * offset and:
 *
 * * a segment becomes **out of scope**, no data will be returned;
 * * a segment is only **partially included in the offset**, only the visible
 *   parts will be returned;
 * * a segment is **fully included in the offset**, its whole content will be
 *   returned.
 *
 * Segments are created with the `WaveformData.set_segment(from, to, name?)`
 * method.
 *
 * @see WaveformData.prototype.set_segment
 * @param {WaveformData} context WaveformData instance
 * @param {Integer} start Initial start index
 * @param {Integer} end Initial end index
 * @constructor
 */

function WaveformDataSegment(context, start, end) {
  this.context = context;

  /**
   * Start index.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_segment(10, 50, "example");
   *
   * console.log(waveform.segments.example.start);  // -> 10
   *
   * waveform.offset(20, 50);
   * console.log(waveform.segments.example.start);  // -> 10
   *
   * waveform.offset(70, 100);
   * console.log(waveform.segments.example.start);  // -> 10
   * ```
   * @type {Integer} Initial starting point of the segment.
   */

  this.start = start;

  /**
   * End index.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_segment(10, 50, "example");
   *
   * console.log(waveform.segments.example.end);  // -> 50
   *
   * waveform.offset(20, 50);
   * console.log(waveform.segments.example.end);  // -> 50
   *
   * waveform.offset(70, 100);
   * console.log(waveform.segments.example.end);  // -> 50
   * ```
   * @type {Integer} Initial ending point of the segment.
   */

  this.end = end;
}

/**
 * @namespace WaveformDataSegment
 */

WaveformDataSegment.prototype = {
  /**
   * Dynamic starting point based on the WaveformData instance offset.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_segment(10, 50, "example");
   *
   * console.log(waveform.segments.example.offset_start);  // -> 10
   *
   * waveform.offset(20, 50);
   * console.log(waveform.segments.example.offset_start);  // -> 20
   *
   * waveform.offset(70, 100);
   * console.log(waveform.segments.example.offset_start);  // -> null
   * ```
   *
   * @return {number} Starting point of the segment within the waveform offset. (inclusive)
   */

  get offset_start() {
    if (this.start < this.context.offset_start && this.end > this.context.offset_start) {
      return this.context.offset_start;
    }

    if (this.start >= this.context.offset_start && this.start < this.context.offset_end) {
      return this.start;
    }

    return null;
  },

  /**
   * Dynamic ending point based on the WaveformData instance offset.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_segment(10, 50, "example");
   *
   * console.log(waveform.segments.example.offset_end);  // -> 50
   *
   * waveform.offset(20, 50);
   * console.log(waveform.segments.example.offset_end);  // -> 50
   *
   * waveform.offset(70, 100);
   * console.log(waveform.segments.example.offset_end);  // -> null
   * ```
   *
   * @return {number} Ending point of the segment within the waveform offset. (exclusive)
   */

  get offset_end() {
    if (this.end > this.context.offset_start && this.end <= this.context.offset_end) {
      return this.end;
    }

    if (this.end > this.context.offset_end && this.start < this.context.offset_end) {
      return this.context.offset_end;
    }

    return null;
  },

  /**
   * Dynamic segment length based on the WaveformData instance offset.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_segment(10, 50, "example");
   *
   * console.log(waveform.segments.example.offset_length);  // -> 40
   *
   * waveform.offset(20, 50);
   * console.log(waveform.segments.example.offset_length);  // -> 30
   *
   * waveform.offset(70, 100);
   * console.log(waveform.segments.example.offset_length);  // -> 0
   * ```
   *
   * @return {number} Visible length of the segment within the waveform offset.
   */

  get offset_length() {
    return this.offset_end - this.offset_start;
  },

  /**
   * Initial length of the segment.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_segment(10, 50, "example");
   *
   * console.log(waveform.segments.example.length);  // -> 40
   *
   * waveform.offset(20, 50);
   * console.log(waveform.segments.example.length);  // -> 40
   *
   * waveform.offset(70, 100);
   * console.log(waveform.segments.example.length);  // -> 40
   * ```
   *
   * @return {number} Initial length of the segment.
   */

  get length() {
    return this.end - this.start;
  },

  /**
   * Indicates if the segment has some visible part in the actual WaveformData offset.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_segment(10, 50, "example");
   *
   * console.log(waveform.segments.example.visible);        // -> true
   *
   * waveform.offset(20, 50);
   * console.log(waveform.segments.example.visible);        // -> true
   *
   * waveform.offset(70, 100);
   * console.log(waveform.segments.example.visible);        // -> false
   * ```
   *
   * @return {Boolean} True if at least partly visible, false otherwise.
   */

  get visible() {
    return this.context.in_offset(this.start) ||
           this.context.in_offset(this.end) ||
           (this.context.offset_start > this.start && this.context.offset_start < this.end);
  },

  /**
   * Return the minimum values for the segment.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_segment(10, 50, "example");
   *
   * console.log(waveform.segments.example.min.length);        // -> 40
   * console.log(waveform.segments.example.min.offset_length); // -> 40
   * console.log(waveform.segments.example.min[0]);            // -> -12
   *
   * waveform.offset(20, 50);
   *
   * console.log(waveform.segments.example.min.length);        // -> 40
   * console.log(waveform.segments.example.min.offset_length); // -> 30
   * console.log(waveform.segments.example.min[0]);            // -> -5
   * ```
   *
   * @return {Array.<Integer>} Min values of the segment.
   */

  get min() {
    return this.visible ? this.context.offsetValues(this.offset_start, this.offset_length, 0) : [];
  },

  /**
   * Return the maximum values for the segment.
   *
   * ```javascript
   * var waveform = new WaveformData({ ... }, WaveformData.adapters.object);
   * waveform.set_segment(10, 50, "example");
   *
   * console.log(waveform.segments.example.max.length);        // -> 40
   * console.log(waveform.segments.example.max.offset_length); // -> 40
   * console.log(waveform.segments.example.max[0]);            // -> 5
   *
   * waveform.offset(20, 50);
   *
   * console.log(waveform.segments.example.max.length);        // -> 40
   * console.log(waveform.segments.example.max.offset_length); // -> 30
   * console.log(waveform.segments.example.max[0]);            // -> 11
   * ```
   *
   * @return {Array.<Integer>} Max values of the segment.
   */

  get max() {
    return this.visible ? this.context.offsetValues(this.offset_start, this.offset_length, 1) : [];
  }
};

module.exports = WaveformDataSegment;

},{}],9:[function(require,module,exports){
"use strict";

var WaveformData = require("./lib/core");

WaveformData.adapters = require("./lib/adapters");

module.exports = WaveformData;

},{"./lib/adapters":4,"./lib/core":6}],10:[function(require,module,exports){
module.exports={
  "version": "0.0.1"
}
},{}],11:[function(require,module,exports){
var utils = require("./utils");
	Theme = require("./theme");
	effectUtils = require("./effects.js");

//AudioItem class? which is used to draw each audio item + x/y containing operations 
//AudioItem code should be moved to its own file - its getting huge and cluttering this file
function AudioItem() {
	
}

//Set variables for audio item
//This should be refactored to accept AudioItem object and then this variables set from getting values from this object - much cleaner than sending a bunch of paramters
AudioItem.prototype.setWaveForm = function(rawWaveForm, y, y2, x, x2, time_scale, frame_start, offset, dpr){
	this.rawWaveForm = rawWaveForm;
	this.rawWaveFormMin = [];
	this.rawWaveFormMax = [];
	this.y = y;
	this.y2 = y2;
	this.x = x;
	this.x2 = x2;
	this.xNormalized = this.x + (frame_start * time_scale);
	this.x2Normalized = this.x2 + (frame_start * time_scale);
	this.size = this.x2Normalized - this.xNormalized;

	if (this.rawWaveForm != null){
		const y = utils.interpolateHeight(this.y2-16);
		this.rawWaveForm = this.rawWaveForm.resample({ width: this.size })

		// for(var i=0; i<this.rawWaveForm.min.length; i++){
		// 	this.rawWaveFormMin.push([i + 0.5, y(this.rawWaveForm.min[i]) + 0.5])
		// }
		this.rawWaveForm.min.forEach((val, x) => {
		  this.rawWaveFormMin.push([x + 0.5, y(val)+8])
		});
		// this.rawWaveForm.max = this.rawWaveForm.max.reverse()
		// for(var i=0; i<this.rawWaveForm.max.length; i++){
		// 	this.rawWaveFormMax.push([(this.rawWaveForm.offset_length - y) + 0.5, y(this.rawWaveForm.max[i]) + 0.5]);
		// }
		this.rawWaveForm.max.reverse().forEach((val, x) => {
			this.rawWaveFormMax.push([(this.rawWaveForm.offset_length - x) + 0.5, y(val)+8]);
		});

	}
}

AudioItem.prototype.set = function(x, y, x2, y2, color, audioName, id, track, time_scale, frame_start, barMarkers, effects) {
	this.x = x;
	this.y = y;
	this.x2 = x2;
	this.y2 = y2;
	this.color = color;
	this.audioName = audioName;
	this.id = id;
	this.track = track;
	this.xNormalized = x + (frame_start * time_scale);
	this.x2Normalized = x2 + (frame_start * time_scale);
	this.size = this.x2Normalized - this.xNormalized;
	this.ySize = this.y2 - this.y;
	this.xMiddle = this.xNormalized + ((this.size) / 2);
	this.effects = effects;
	this.barMarkers = barMarkers;
	this.time_scale = time_scale;
	this.frame_start = frame_start;
	this.xOffset = this.frame_start * this.time_scale;
	this.ratio = this.y2 / 100;
	this.curveValues = [];
	this.drawSelectGlow = false;

	this.rounded1X = utils.round(this.xNormalized, 0.25);
	this.rounded1X2 = utils.round(this.x2Normalized, 0.25);

	this.rounded2X = utils.round(this.xNormalized, 0.5);
	this.rounded2X2 = utils.round(this.x2Normalized, 0.5);

	this.rounded3X = utils.round(this.xNormalized, 1);
	this.rounded3X2 = utils.round(this.x2Normalized, 1);
};

AudioItem.prototype.updateBars = function(startX, draggingx){
	this.barMarkersX, this.barMarkersXRounded = utils.increaseArray(this.barMarkersX, (startX-draggingx), true);
}

AudioItem.prototype.createBarDiff = function(){
	this.barMarkerDiff = {};
	for (var i=0; i<this.barMarkersX.length; i++){
		this.barMarkerDiff[this.barMarkersX[i]] = [this.barMarkersX[i]-this.xNormalized, this.x2Normalized-this.barMarkersX[i]];
	}
}

AudioItem.prototype.paintWaveform = function(ctx){
	if (this.rawWaveForm != undefined){
		// //console.log(this.rawWaveForm)
		//lets add some checking to this rendering which will check if X value is greater/less than canvas width -> if so then dont render only render what is in view
		//pre rendering?
		ctx.beginPath();
		// from 0 to 100
		//compute waveform min/max upon the setWaveForm function - so we dont need to recompute for each iteration over the min/max values
		for (var i=0; i<this.rawWaveFormMin.length; i++){
			ctx.lineTo(this.xNormalized+this.rawWaveFormMin[i][0] - this.xOffset, this.y+this.rawWaveFormMin[i][1])
		}
		// this.rawWaveForm.min.forEach((val, x) => {
		//   ctx.lineTo(x + 0.5, y(val) + 0.5);
		// });

		for (var i=0; i<this.rawWaveFormMax.length; i++){
			ctx.lineTo(this.xNormalized+this.rawWaveFormMax[i][0] - this.xOffset, this.y+this.rawWaveFormMax[i][1])
		}
		// then looping back from 100 to 0
		// this.rawWaveForm.max.reverse().forEach((val, x) => {
		//   ctx.lineTo((this.rawWaveForm.offset_length - x) + 0.5, y(val) + 0.5);
		// });

		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}
}

AudioItem.prototype.effectGlow = function(){
	this.drawSelectGlow = true;
}

AudioItem.prototype.paintEffects = function(ctx) {
	//Iterate over effects and paint them on the audio item - in theme define some basic temporary colour scheme/symbols which can signify different effects
	//So for example yellow = eq, red = volume. etc. Currently only two supported strength_curves on backend: continous and linear - just build these for now
	//Y position on the audio item should indicate the start/target values of the effect
	ctx.lineWidth = 2;
	for (var i=0; i<this.effects.length; i++){
		effect = this.effects[i];
		if (effect["endX"] - effect["startX"] > 5){
			//currently start/target only works for phase 1 of effect - this should be able to handle effects which have multiple start/targets - 
			//maybe this means drawing multiple curves?
			var effectStartRatio, effectEndRatio;
			out = effectUtils.computeHighLow(effect["params"]["start"], effect["params"]["target"], effect["type"]);
			effectStartRatio = out[0];
			effectEndRatio = out[1];
			effectStartY = this.y + this.y2 - effectStartRatio * this.ratio;
			effectEndY = this.y + this.y2 - effectEndRatio * this.ratio;

			ctx.strokeStyle = Theme.effectColours[effect["type"]];
			ctx.beginPath();
			ctx.moveTo(effect["startX"], this.y);
			ctx.lineTo(effect["startX"], this.y+this.y2);
			ctx.stroke();
			ctx.moveTo(effect["endX"], this.y);
			ctx.lineTo(effect["endX"], this.y+this.y2);
			ctx.stroke();

			if (effect["params"]["strength_curve"] == "linear"){
				this.curveValues.push({x0: effect["startX"], y0: effectStartY, x1: effect["endX"], y1: effectEndY});
				ctx.moveTo(effect["startX"], effectStartY);
				ctx.lineTo(effect["endX"], effectEndY)
				ctx.stroke();

			} else if (effect["params"]["strength_curve"] == "continous"){
				this.curveValues.push({x0: effect["startX"], y0: effectStartY, x1: effect["endX"], y1: effectEndY});
				ctx.moveTo(effect["startX"], effectEndY);
				ctx.lineTo(effect["endX"], effectEndY)
				ctx.stroke();
			}
		}
	}
	ctx.lineWidth = 1.0;
}

AudioItem.prototype.paintBarMarkers = function(ctx) {
	this.barMarkersX = [];
	this.barMarkersXRounded = [];
	ctx.strokeStyle = "grey";

	for (var i=0; i<this.barMarkers.length; i++){
		if (i % 4 == 0){ ctx.lineWidth = 2; } else { ctx.lineWidth = 1;}

		time = utils.time_to_x(this.barMarkers[i], this.time_scale, this.frame_start) + this.xNormalized;
		this.barMarkersX.push(time);
		this.barMarkersXRounded.push(utils.round(time, 0.5));
		ctx.beginPath();
		ctx.moveTo(time, this.y+1);
		ctx.lineTo(time, this.y+this.y2);
		ctx.fillText(i+1, time+5, this.y+this.y2-1);
		ctx.stroke();
	}
	this.createBarDiff();
	ctx.lineWidth = 1.0;
}

//Paint audio item in canvas
AudioItem.prototype.paint = function(ctx, outlineColor) {
	ctx.fillStyle = outlineColor;
	ctx.beginPath();
	ctx.rect(this.x, this.y, this.x2-this.x, this.y2);
	ctx.fill();
	if (this.drawSelectGlow == true){
		ctx.strokeStyle = "red";
	} else {
		ctx.strokeStyle = "black";
	}
	ctx.stroke();
	ctx.fillStyle = "black";
	txtWidth = ctx.measureText(this.audioName).width;
	if (txtWidth < this.x2-this.x){ctx.fillText(this.audioName, this.x+txtWidth, this.y+10);}
	this.paintWaveform(ctx);
	this.paintBarMarkers(ctx);
	this.paintEffects(ctx);
};

//Check if mouse at x/y is contained in audio
AudioItem.prototype.contains = function(x, y, time_scale, frame_start) {
	// console.log("X", this.x, "Y", this.y, "X2", this.x2, "y2", this.y2)
	// console.log("Comparison", x ," >= ", (this.x + (frame_start * time_scale)), y, " >= ", this.y, x, " <= ", (this.x2 + (frame_start * time_scale)), y, "<= ", this.y + this.y2, this.id)
	//X & X2 values of audio item are normalized in accordance with the timescale and framestart so we can effectively care againsy mouse position no matter where the scroll wheel is
	return x >= this.xNormalized && y >= this.y  && x <= this.x2Normalized && y <= this.y + this.y2;
};

AudioItem.prototype.containsEffect = function(x, y){
	for (var i=0; i<this.curveValues.length; i++){
		line = this.curveValues[i];
		// mouseX=parseInt(e.clientX-offsetX);
		// mouseY=parseInt(e.clientY-offsetY);
		if(x<line.x0 || y>line.x1){
		  return;          
		}
		var linepoint=utils.linepointNearestMouse(line,x,y);
		var dx=x-linepoint.x;
		var dy=y-linepoint.y;
		var distance=Math.abs(Math.sqrt(dx*dx+dy*dy));
		tolerance = 3;
		if(distance<tolerance){
			return true;

		} else {
			return false;
		}
	}
	return false;
}

//Change outline to red to notify user that they cannot slide audio over item in same track
AudioItem.prototype.alert = function(ctx, outlineColor){
	this.paint(ctx, outlineColor);
}

module.exports = {
	AudioItem: AudioItem
}

},{"./effects.js":14,"./theme":18,"./utils":24}],12:[function(require,module,exports){
var package_json = require('../package.json'),
	Settings = require('./settings'),
	Do = require('do.js');
	utils = require("./utils");
	WaveformData = require("waveform-data");

// Data Store with a source of truth
function DataStore() {
	this.data = undefined;
	this.ui = undefined;

	this.initData = function initData(audio, tracks){
		this.data = audio;

		// for(var i=0; i<this.data; i++){
		// 	this.data[i].original_length = (this.data[i].end)*Settings.time_scale - (this.data[i].start)*Settings.time_scale
		// }

		var lineWidth, lineHeight = utils.getDivSize("timeline");
		lineHeight = lineHeight * Settings.lineHeightProportion;

		this.ui = {
			currentTime: 0,
			totalTime: Settings.default_length,
			scrollTime: 0,
			timeScale: Settings.time_scale,
			tracks: tracks,
			trackTimelineOffset: Settings.trackTimelineOffset, //Offset between top of studio timeline and start of track items
			lineHeight: lineHeight, //Size of track items
			xScrollTime: 0
		};
		this.fetchWaveFormData();
	}

	this.updateData = function updateData(audioId, key, value) {
		for (var i in this.data) {
			if (this.data[i].id == audioId) {
				this.data[i][key] = value;
				break;
			}
		}
	}

	this.addEffect = function addEffect(audioId, effectObject) {
		for (var i in this.data) 
			if (this.data[i].id == audioId){
				this.data[i].effects.push(effectObject)
				break;
			}
	}

	this.updateEffect = function updateEffect(audioId, effectId, effectObject) {
		for (var i in this.data){
			if (this.data[i].id == audioId){
				for (var i2 in this.data[i].effects){
					if (this.data[i].effects[i2].id == effectId){
						this.data[i].effects[i2] = effectObject;
						break;
					}
				}
			}
		}
	}

	this.updateUi = function updateUi(key, value) {
		this.ui[key] = value
	}

	this.getData = function getData(type, key) {
		if (type == "data"){
			return this.data;

		} else if (type == "ui"){
			if (key == undefined) {
				return this.ui;

			} else {
				return this.ui[key];
			}
		}
	}

	this.deleteData = function deleteData(id){
		for (var i in this.data){
			if (this.data[i].id == id){
				this.data.splice(i, 1);
			}
		}
	}

	this.fetchWaveFormData = function fetchWaveFormData(){
		var dataTmp = this;
		console.log('Fetching wave form data');

		for (var i=0; i<this.data.length; i++){
			if (this.data[i].wave_form != null){
				console.log("Running for", this.data[i].id)
				var xhttp = new XMLHttpRequest();
				xhttp.open('GET', "http://localhost:8000/"+this.data[i].wave_form);
				xhttp.i = i;
				xhttp.responseType = 'arraybuffer';

				xhttp.onload = function(data) {
					dataTmp.data[0].raw_wave_form = WaveformData.create(data.target); //currently not updating dynamically because js fucking sucks
					dataTmp.data[1].raw_wave_form = WaveformData.create(data.target);
				};

				xhttp.send();
			}
		}
	}
}

module.exports = DataStore;

},{"../package.json":10,"./settings":16,"./utils":24,"do.js":1,"waveform-data":9}],13:[function(require,module,exports){
/**************************/
// Dispatcher
/**************************/

function Dispatcher() {

	var event_listeners = {

	};

	function on(type, listener) {
		if (!(type in event_listeners)) {
			event_listeners[type] = [];
		}
		var listeners = event_listeners[type];
		listeners.push(listener);
	}

	function fire(type) {
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		var listeners = event_listeners[type];
		if (!listeners) return;
		for (var i = 0; i < listeners.length; i++) {
			var listener = listeners[i];
			listener.apply(listener, args);
		}
	}

	this.on = on;
	this.fire = fire;

}

module.exports = Dispatcher;
},{}],14:[function(require,module,exports){
var Settings = require("./settings");
	utils = require("./utils");

function effectHandler(dataStore, renderItems, canvas, dpr, overwriteCursor, bounds){
	function makeCursorChange(type){
		switch (type){
			case "remove":
				canvas.style.cursor = "not-allowed";
				overwriteCursor = true;
		}
	}

	function effectClicker(type){
		// htmlElement = document.getElementById(type+"I");
		// htmlElement.setAttribute("text-shadow", "5px 5px 5px #ccc");
		// makeCursorChange(type);

		audioSelectCallback = function(e) {
			var time_scale = dataStore.getData("ui", "timeScale");
			var frame_start = dataStore.getData("ui", "scrollTime");
			currentX = ((e.clientX - bounds.left)/dpr + (frame_start * time_scale));
			currentY = (e.clientY - bounds.top)/dpr;
			hit = false;

			if (type != "cut"){
				for (var i=0; i<renderItems.length; i++){
					if (renderItems[i].contains(currentX, currentY, time_scale, frame_start)){
						renderItems[i].effectGlow();
						renderEffectView(type, renderItems[i], null);
						hit = true;

						if (type != "remove"){
							canvas.removeEventListener('click', audioSelectCallback, false);
						}
					}
				}
				if (hit == false){
					canvas.removeEventListener('click', audioSelectCallback, false);
					canvas.style.cursor = "default";
					overwriteCursor = false;
				}

			} else {
				renderEffectView(type, null, null)
			}
		}
		canvas.addEventListener("click", audioSelectCallback, false);
	}

	function updateEqKnobs(value1, value2, value3, value21, value22, value23, id, audioId){
		$('#eqKnob1').val(value1);
		$('#eqKnob2').val(value2);
		$('#eqKnob3').val(value3);
		$('#eqKnob21').val(value21);
		$('#eqKnob22').val(value22);
		$('#eqKnob23').val(value23);
		knob = document.getElementById("eqKnob1");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob2");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob3");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob21");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob22");
		knob.effectId = id;
		knob.audioId = audioId;
		knob = document.getElementById("eqKnob23");
		knob.effectId = id;
		knob.audioId = audioId;
	}

	function renderEffectView(type, audioItem, effect){
		switch(type){
			case "cut":
				cutEffect();
				break;

			case "eq":
				modal = document.getElementById("eqModal");
				modal.style.display = "block";

				if (effect != null){
					//Set inputs to values of effect 
					updateEqKnobs(effect["high"]["start"], effect["mid"]["start"], effect["low"]["start"], 
								  effect["high"]["target"], effect["mid"]["target"], effect["low"]["target"], 
								  effect["id"], audioItem.id);

					sc = document.getElementById("strengthCurveEQ");
					sc.value = effect["strength_curve"];
					sc.effectId = effect["id"];
					sc.audioId = audioItem.id;

					start = document.getElementById("eqStart");
					start.value = effect['start'];
					start.effectId = effect["id"];
					start.audioId = audioItem.id;

					end = document.getElementById("eqEnd");
					end.value = effect['end'];
					end.effectId = effect["id"];
					end.audioId = audioItem.id;

				} else {
					//Refresh inputs - this is a fresh effect
					var id = utils.guid();
					updateEqKnobs(0, 0, 0, 0, 0, 0, id, audioItem.id);

					sc = document.getElementById("strengthCurveEQ");
					sc.value = "continous";
					sc.effectId = id;
					sc.audioId = audioItem.id;

					start = document.getElementById("eqStart");
					start.value = 0;
					start.effectId = id;
					start.audioId = audioItem.id;

					end = document.getElementById("eqEnd");
					end.value = 0;
					end.effectId = id;
					end.audioId = audioItem.id;
				}

				break;

			case "volume":
				modal = document.getElementById("volumeModal");
				modal.style.display = "block";
				break;

			case "highPass":
				modal = document.getElementById("highPassModal");
				modal.style.display = "block";
				break;

			case "lowPass":
				modal = document.getElementById("lowPassModal");
				modal.style.display = "block";
				break;

			case "pitch":
				modal = document.getElementById("pitchModal");
				modal.style.display = "block";
				break;

			case "tempo":
				modal = document.getElementById("tempoModal");
				modal.style.display = "block";
				break;

			case "remove":
				removeAudio(audioItem); 
				break;
		}

	}

	function updateEffectStart(audioId, effectId, start){
		console.log("Effect update start req", audioId, effectId, start);
	}

	function updateEffectEnd(audioId, effectId, end){
		console.log("Effect end req", audioId, effectId, end);

	}

	function updateStrengthCurve(audioId, effectId, strengthCurve){
		console.log("Effect strengthCurve req", audioId, effectId, strengthCurve);
	}

	function eqEffect(audioId, effectId, value, type){
		console.log("Effect Knob update", audioId, effectId, value, type);
	}

	function volumeEffect(){

	}

	function highPassEffect(){

	}

	function lowPassEffect(){

	}

	function pitchEffect(){

	}

	function tempoEffect(){

	}

	function cutEffect(){
		//this should render any modal -> instead it should change cursor to sisors and split the track at highlighted position -> creating two tracks
		//cursor should snap to bar markers inside tracks
	}

	function removeAudio(audio){
		console.log("Removing audio with ID", audio.id);
		dataStore.deleteData(audio.id);
		renderItems = utils.removeFromArrayById(renderItems, audio.id);
	}

	this.renderEffectView = renderEffectView;
	this.effectClicker = effectClicker;
	this.eqEffect = eqEffect;
	this.updateEffectStart = updateEffectStart;
	this.updateEffectEnd = updateEffectEnd;
	this.updateStrengthCurve = updateStrengthCurve;
}

function computeHighLow(start, end, type){
	//Computes high/low ratio (0-100) of where the start/target of the effects are compared to possible min/max
	//get min/max of start/end of given effect type
	//normalize min/max so -> min = 0 , max = max + offset of min to get to 0
	//then ratio will be max / (start/end) + offset of min to get to 0
	offset = 0;
	bounds = Settings.effectBounds[type];
	if (bounds["startMin"] <= 0){
		offset = +bounds["startMin"]
	} else {
		offset = -bounds["startMin"]
	}

	max = bounds["startMax"] + offset
	startOff = start + offset;
	endOffset = end + offset;

	if (startOff == 0){
		return [0, (endOffset / max)*100]

	} else if (endOffset == 0){
		return [(startOff / max)*100, 0]

	} else {
		return [(startOff / max)*100, (endOffset / max)*100]
	}
}

function computeEffectsX(effects, startX, time_scale, frame_start){
	for (var i=0; i<effects.length; i++){
		effects[i]["startX"] = startX + effects[i]["start"] * time_scale;
		effects[i]["endX"] = startX + effects[i]["end"] * time_scale;
	}
	return effects;
}

module.exports = {
	computeHighLow: computeHighLow,
	computeEffectsX: computeEffectsX,
	effectHandler: effectHandler
}
},{"./settings":16,"./utils":24}],15:[function(require,module,exports){
function itemClick (itemName) {
    switch(itemName) {
      case "test1":
        console.log("1")
        break;
    }
}

menuContent = [
    {title: "Copy Item", name: "copyItem"},
    "<hr>",
    {title: "Add Effect", name: "addEffect"},
    "<hr>",
    {title: "Create Clip", name: "createClip"},
    "<hr>",
    {title: "Delete Audio", name: "deleteAudio"},
    "<hr>",
    {title: "Adjust Bar Markers", name: "adjustBarMarkers"}
];


const __menuConf = {
    "menu": undefined,
    "item": undefined,
    "menuState": false,
    "oldContent": [],

    // Style of menu
    "menuStyle": {
        display: "none",
        fontFamily: "monospace",
        width: "min-width",
        height: "min-height",
        padding: "8px 0 8px 0",
        margin: 0,
        borderRadius: "5px",
        border: "1px solid #555",
        backgroundColor: "#222",
        position: "absolute",
        top: 0,
        left: 0,
        userSelect: "none"
    },

    // Style menu items
    "itemStyle": {
        fontSize: "16px",
        padding: "2px 11px 2px 10px",
        margin: 0,
        color: "#ccc"
    },

    // Add items to menu
    "addContent": () => {
        let temp;

        if (!window.hasOwnProperty("menuContent")) {
            window["menuContent"] = [{
                title: "Empty",
                name: "empty"
            }];
        }

        __menuConf.oldContent = menuContent.map(a => {
            return a
        });
        __menuConf.menu.innerHTML = "";

        for (let i = 0; i < __menuConf.oldContent.length; i++) {
            if (__menuConf.oldContent[i] !== "<hr>") {
                temp = __menuConf.item;
                temp.id = "__menuItem" + i;
                temp.setAttribute("onmouseover", `this.style.color="#fff"; this.style.backgroundColor="#333"`);
                temp.setAttribute("onmouseout", `this.style.color="#ccc"; this.style.backgroundColor="#222"`);
                temp.setAttribute("onclick", `itemClick("${__menuConf.oldContent[i].name}")`);
                temp.innerHTML = __menuConf.oldContent[i].title;
                __menuConf.menu.innerHTML += temp.outerHTML;
            } else {
                __menuConf.menu.innerHTML += `<hr style="border: none; height: 1px; background-color: #444">`;
            }
        }
    },

    // Run at lib-start
    "startMenu": () => {
        __menuConf.menu = document.createElement("div");
        Object.assign(__menuConf.menu.style, __menuConf.menuStyle);
        __menuConf.menuEvent();

        __menuConf.item = document.createElement("p");
        Object.assign(__menuConf.item.style, __menuConf.itemStyle);

        __menuConf.addContent();
        document.body.appendChild(__menuConf.menu);

        if (!window.hasOwnProperty("itemClick")) {
            // Triggered on click of an item
            window["itemClick"] = (name) => {
                itemClick(name);
                console.warn(`( Menu.js ):\nMenu-item ${name} was clicked.\n***`);
            }
        }
    },

    // Triggered on contextmenu event
    "menuEvent": (e, audioId) => {
        this.audioId = audioId;
        if (!window.hasOwnProperty("__menuEnabled")) {
            window["__menuEnabled"] = true;
        }

        if (__menuEnabled) {
            if (__menuConf.oldContent !== menuContent) {
                __menuConf.oldContent = menuContent.splice();
            }

            if (__menuConf.menuState) {
                //add check here that will confirm if mouse is over audio item
                openMenu(e);
            } else {
                closeMenu();
            }
        }
    },
};

// Open the menu
function openMenu(e) {
    __menuConf.menu.style.display = "block";
    __menuConf.menu.style.top = e.clientY + "px";
    __menuConf.menu.style.left = e.clientX + "px";
}

// Cleses the menu
function closeMenu() {
    __menuConf.menu.style.display = "none";
}

module.exports = {
    __menuConf: __menuConf,
    closeMenu: closeMenu
}

// // Starts the lib
// window.addEventListener("load", __menuConf.startMenu, false);
},{}],16:[function(require,module,exports){
//Time scale definitions
var DEFAULT_TIME_SCALE = 60;

//Timeline component sizes (% of screen size)
var timelineToolbarHeight = 0.05
var timelineToolbarWidth = 1

var trackColumnWidth = 0.2
var trackColumnHeight = 0.85

var timelineWidth = 0.8
var timelineHeight = 0.85

var topTimelineWidth = 0.8
var topTimelineHeight = 0.6

var lineHeightProportion = 0.22 //This value should be worked out on size of studio vs number of tracks so that we can fill the entire space
var trackTimelineOffset = 40;

//min/max bounds for start/end of effects - EQ is missing min/max bounds for start/target-decibels
var effectBounds = {"volume": {"startMin": 0, "startMax": 1, "endMin": 0, "endMax": 1}, 
                    "high_pass_filter": {"startMin": 20, "startMax": 15000, "endMin": 20, "endMax": 15000}, 
                    "low_pass_filter": {"startMin": 15000, "startMax": 20, "endMin": 15000, "endMax": 20}, 
                    "eq": {"startMin": -2, "startMax": 2, "endMin": -2, "endMax": 2}, 
                    "pitch": {"startMin": -12, "startMax": 12, "endMin": -12, "endMax": 12}, 
                    "tempo": {"startMin": 0, "startMax": 250, "endMin": 0, "endMax": 250}}
                    // "gain": {"startMin": , "startMax": , "endMin": , "endMax": }, "flanger": {"startMin": , "startMax": , "endMin": , "endMax": }, 
                    // "echo": {"startMin": , "startMax": , "endMin": , "endMax": }, "phaser": {"startMin": , "startMax": , "endMin": , "endMax": }, 
                    // "reverb": {"startMin": , "startMax": , "endMin": , "endMax": }}

var effectDefaults = {"eq": {"lowFreq": 200, 'midFreq': 1700, 'highFreq': 6500}}

// Dimensions
module.exports = {
	MARKER_TRACK_HEIGHT: 60,
	TIMELINE_SCROLL_HEIGHT: 0,
	time_scale: DEFAULT_TIME_SCALE, // number of pixels to 1 second
    default_length: 600, // seconds
    trackColumnWidth: trackColumnWidth,
    trackColumnHeight: trackColumnHeight,
    timelineWidth: timelineWidth,
    timelineHeight: timelineHeight,
    topTimelineWidth: topTimelineWidth,
    topTimelineHeight: topTimelineHeight,
    timelineToolbarHeight: timelineToolbarHeight,
    timelineToolbarWidth: timelineToolbarWidth,
    lineHeightProportion: lineHeightProportion,
    trackTimelineOffset: trackTimelineOffset,
    effectBounds: effectBounds
};

},{}],17:[function(require,module,exports){
var ui = require("./ui"),
	Dispatcher = require("./dispatcher"),
	dataStore = require("./data-store"),
	timelineScroll = require("./ui-scroll"),
	timeline = require("./ui-main-timeline");
	Settings = require("./settings");

function Studio(audio){
	//Accepts audio and tracks. Audio is a json array of objects of each audio item to be rendered into timeline view. 
	ui.initCanvas(); //Create intial divs with canvas items inside for drawing

	//Create event listeners here to update various variables so that when paint() is called the items are painted dynamically according to what 
	//the user is doing? 
	var tracks = Math.max.apply(Math, audio.map(function(o) { return o.track; }))+1; //Maximum number of tracks which audio occupies +1 to account for starting at 0
	var needsResize = false;
	var data = new dataStore();
	data.initData(audio, tracks);

	var dispatcher = new Dispatcher();
	var timelineObject = new timeline.timeline(data, dispatcher);

	//Setting dispatcher functions
	dispatcher.on('time.update', function(v) {
		v = Math.max(0, v);
		data.updateUi("currentTime", v);

		// if (start_play) start_play = performance.now() - v * 1000;
		// repaintAll();
		// layer_panel.repaint(s);
	});	
	dispatcher.on('update.scrollTime', function(v) {
		v = Math.max(0, v);
		data.updateUi("scrollTime", v);
		// repaintAll();
	});
	dispatcher.on('update.scale', function(v) {
		console.log('range', v);
		data.updateUi("timeScale", v);
	});

	dispatcher.on("update.audioTime", function(id, start, end){
		data.updateData(id, "start", start);
		data.updateData(id, "end", end);
	});

	dispatcher.on("update.audioTrack", function(id, track){
		data.updateData(id, "track", track);
	})

	//Registering event listeners
	window.addEventListener('resize', function() {
		needsResize = true;
	});

	//Core paint routines
	function paint() {
		requestAnimationFrame(paint);
		if (needsResize == true){
			timelineObject.resize();
			needsResize = false;

		}
		timelineObject.paint();
	}

	paint();
}

window.Studio = Studio;
},{"./data-store":12,"./dispatcher":13,"./settings":16,"./ui":23,"./ui-main-timeline":21,"./ui-scroll":22}],18:[function(require,module,exports){
module.exports = {
	// photoshop colors
	a: '#343434',
	b: '#535353',
	c: '#b8b8b8',
	d: '#d6d6d6',
	audioElement: '#4286f4',
	effectColours: {"volume": "#15a071", "high_pass_filter": "#ffff00", "low_pass_filter": "#ffae19", "eq": "#FF5733", "pitch": "#3933FF", 
					"tempo": "#FF33BB", "gain": "#FF3333", "flanger": "#1DFF2B", "echo": "#1DC8FF", "phaser": "#AD1DFF", 
					"reverb": "#FF1DA6"}
};
},{}],19:[function(require,module,exports){
require("jquery-knob");

function renderEqView(start, end, value1, value2, value3, value21, value22, value23, wrapper, effectHandler, dataStore){
	inputContainer = document.createElement("div");
	inputContainer.id = "eqInputContainer";
	inputContainer.classList.add("input-container");

	knobContainer = document.createElement("div");
	knobContainer.id = "knobsContainer";
	knobContainer.classList.add("knobs-container");

	eqContainer = document.createElement("div");
	eqContainer.id = "eqContainer1";
	eqContainer.classList.add("knob-container");

	eqContainer2 = document.createElement("div");
	eqContainer2.id = "eqContainer2";
	eqContainer2.classList.add("knob-container-hidden");
	knobContainer.appendChild(eqContainer);
	knobContainer.appendChild(eqContainer2);

	startInput = document.createElement("input");
	startInput.id = "eqStart";
	startInput.innerHTML = "<br>";
	startInput.value = start;
	startInput.oninput = function(){
		effectHandler.updateEffectStart(this.audioId, this.effectId, this.value);
		dataStore.updateUi("lastStart", this.value);
	}
	inputContainer.appendChild(startInput);

	endInput = document.createElement("input");
	endInput.id = "eqEnd";
	endInput.value = end;
	endInput.oninput = function(){
		effectHandler.updateEffectEnd(this.audioId, this.effectId, this.value);
		dataStore.updateUi("lastEnd", this.value);
	}
	inputContainer.appendChild(endInput);
	wrapper.appendChild(inputContainer);

	heading = document.createElement('h4');
	heading.innerHTML = "Highs";

	knob1 = document.createElement("input");
	knob1.id = "eqKnob1";
	knob1.setAttribute("data-cursor", true);
	knob1.setAttribute("value", value1);
	knob1.setAttribute("data-thickness", 0.25);
	// knob1.setAttribute("data-font", "Advanced LED Board-7")
	eqContainer.append(heading);
	eqContainer.appendChild(knob1);

	heading = document.createElement('h4');
	heading.innerHTML = "Mids";
	knob2 = document.createElement("input");
	knob2.id = "eqKnob2";
	knob2.setAttribute("data-cursor", true);
	knob2.setAttribute("value", value2);
	knob2.setAttribute("data-thickness", 0.25);
	eqContainer.appendChild(heading);
	eqContainer.appendChild(knob2);

	heading = document.createElement('h4');
	heading.innerHTML = "Lows";
	knob3 = document.createElement("input");
	knob3.id = "eqKnob3";
	knob3.setAttribute("data-cursor", true);
	knob3.setAttribute("value", value3);
	knob3.setAttribute("data-thickness", 0.25);
	eqContainer.appendChild(heading);
	eqContainer.appendChild(knob3);

	heading = document.createElement('h4');
	heading.innerHTML = "Highs";
	knob1 = document.createElement("input");
	knob1.id = "eqKnob21";
	knob1.setAttribute("data-cursor", true);
	knob1.setAttribute("value", value21);
	knob1.setAttribute("data-thickness", 0.25);
	eqContainer2.append(heading);
	eqContainer2.appendChild(knob1);

	heading = document.createElement('h4');
	heading.innerHTML = "Mids";
	knob2 = document.createElement("input");
	knob2.id = "eqKnob22";
	knob2.setAttribute("data-cursor", true);
	knob2.setAttribute("value", value22);
	knob2.setAttribute("data-thickness", 0.25);
	eqContainer2.appendChild(heading);
	eqContainer2.appendChild(knob2);

	heading = document.createElement('h4');
	heading.innerHTML = "Lows";
	knob3 = document.createElement("input");
	knob3.id = "eqKnob23";
	knob3.setAttribute("data-cursor", true);
	knob3.setAttribute("value", value23);
	knob3.setAttribute("data-thickness", 0.25);
	eqContainer2.appendChild(heading);
	eqContainer2.appendChild(knob3);
	wrapper.appendChild(knobContainer);

	knobParams = {
		'min':-2,
		'max':2,
		'step': 0.01,
		'angleArc': 250,
		'angleOffset': -125,
		'width': "300%",
		'height': "300%",
		'bgColor': "black",
		'fgColor': '#4286f4',
		'release' : function (v) { effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "highs")}
	}

	$("#eqKnob1").knob(knobParams);
	delete knobParams["release"];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "mids")};
	$("#eqKnob2").knob(knobParams);
	delete knobParams["release"];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "lows")};
	$("#eqKnob3").knob(knobParams);
	delete knobParams['release'];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "highsTarget")};
	$("#eqKnob21").knob(knobParams);
	delete knobParams['release'];
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "midsTarget")};
	$("#eqKnob22").knob(knobParams);
	delete knobParams['release']
	knobParams['release'] = function(v){ effectHandler.eqEffect(this.$.context.audioId, this.$.context.effectId, v, "lowsTarget")};
	$("#eqKnob23").knob(knobParams);
}

module.exports = {
	renderEqView: renderEqView
}
},{"jquery-knob":2}],20:[function(require,module,exports){
var Settings = require("./settings");
	utils = require("./utils");
	Theme = require("./theme");
	uiEffect = require("./ui-effect");

function Rect() {
	
}

Rect.prototype.set = function(x, y, w, h, color, outline) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.color = color;
	this.outline = outline;
};

Rect.prototype.paint = function(ctx) {
	ctx.fillStyle = Theme.b;  // // 'yellow';
	ctx.strokeStyle = Theme.c;

	this.shape(ctx);

	ctx.stroke();
	ctx.fill();
};

Rect.prototype.shape = function(ctx) {
	ctx.beginPath();
	ctx.rect(this.x, this.y, this.w, this.h);
};

Rect.prototype.contains = function(x, y) {
	return x >= this.x && y >= this.y
	 && x <= this.x + this.w && y <= this.y + this.h;
};

function zoom(dataStore, dispatcher){
	var div = document.getElementById("zoomColumn");
	
	this.resize = function () {
		var range = document.getElementById("rangeSlider");
		utils.style(range, {
			width: (div.offsetWidth-20).toString() + "px",
		});
	}

	function changeRange() {
		dispatcher.fire('update.scale', range.value);
	}

	var range = document.createElement('input');
	range.setAttribute("id", "rangeSlider");
	range.type = "range";
	range.value = Settings.time_scale;
	range.min = 1;
	range.max = 100;
	range.step = 0.5;
	range.steps = 10;

	utils.style(range, {
		width: (div.offsetWidth-20).toString() + "px"
	});

	var draggingRange = 0;

	range.addEventListener('mousedown', function() {
		draggingRange = 1;
	});

	range.addEventListener('mouseup', function() {
		draggingRange = 0;
		changeRange();
	});

	range.addEventListener('mousemove', function() {
		if (!draggingRange) return;
		changeRange();
	});

	div.appendChild(range)

}

function trackCanvas(dataStore, dispatcher){
	var canvas = document.getElementById("left-column-canvas");
	var width = canvas.width;
	var height = canvas.height;
	var dpr = window.devicePixelRatio; 
	var ctx = canvas.getContext('2d');
	var zoomBar = new zoom(dataStore, dispatcher);

	this.resize = function() {
		parentDiv = document.getElementById("left-column")
		canvas.width = parentDiv.offsetWidth;
		canvas.height = parentDiv.offsetHeight;
		height = canvas.height;
		width = canvas.width;
		zoomBar.resize();
	}

	this.paint = function() {
		var trackLayers = dataStore.getData("ui", "tracks");
		var lineHeight = dataStore.getData("ui", "lineHeight"); //TODO line height should be updated as more track layers are added - if track layers extend view
		var offset = dataStore.getData("ui", "trackTimelineOffset");

		ctx.fillStyle = Theme.a;
		ctx.fillRect(0, 0, width, height);
		ctx.save();
		ctx.scale(dpr, dpr);

		for (var i = 0; i <= trackLayers; i++){
			ctx.strokeStyle = Theme.b;
			ctx.beginPath();
			ctx.moveTo(0, ((offset + i*lineHeight)/dpr)+i);
			ctx.lineTo(width, ((offset + i*lineHeight)/dpr)+i);
			ctx.stroke();

			if (i != 0){
				ctx.fillStyle = Theme.d;
				ctx.textAlign = 'center';
				ctx.fillText(i.toString(), width/4, ((offset + i*lineHeight)/dpr)-(lineHeight/4));
			}
		}
		ctx.restore();
	}
}

//Function which renders effect icons and their modals
function renderEffects(effectHandler, dataStore){
	//Effect icons rendering
	var effectDiv = document.getElementById("top-toolbar");
	effectDiv.style.backgroundColor = Theme.a;
	effectDiv.classList.add("flex-container");

	var cutDiv = document.createElement('div');
	cutDiv.id = "cut";
	cutDiv.onclick = function() {effectHandler.effectClicker("cut")};
	cutDiv.classList.add("flex-item");
	cutDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">content_cut</i><p>Cut</p>';

	var eqDiv = document.createElement('div');
	eqDiv.id = "eq";
	eqDiv.onclick = function() {effectHandler.effectClicker("eq")};
	eqDiv.classList.add("flex-item");
	eqDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">tune</i><p>EQ</p>';

	var volumeDiv = document.createElement('div');
	volumeDiv.id = "volume";
	volumeDiv.onclick = function() {effectHandler.effectClicker("volume")};
	volumeDiv.classList.add("flex-item");
	volumeDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">volume_up</i><p>Volume Modulation</p>';

	var highPassDiv = document.createElement('div');
	highPassDiv.id = "highPass";
	highPassDiv.onclick = function() {effectHandler.effectClicker("highPass")};
	highPassDiv.classList.add("flex-item");
	highPassDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">blur_linear</i><p>High Pass Filter</p>';

	var lowPassDiv = document.createElement('div');
	lowPassDiv.id = "lowPass";
	lowPassDiv.onclick = function() {effectHandler.effectClicker("lowPass")};
	lowPassDiv.classList.add("flex-item");
	lowPassDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem; moz-transform: scaleX(-1); -o-transform: scaleX(-1); -webkit-transform: scaleX(-1); transform: scaleX(-1); filter: FlipH -ms-filter: "FlipH";">blur_linear</i><p>Low Pass Filter</p>';

	var pitchDiv = document.createElement('div');
	pitchDiv.id = "pitch";
	pitchDiv.onclick = function() {effectHandler.effectClicker("pitch")};
	pitchDiv.classList.add("flex-item");
	pitchDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">trending_up</i><p>Pitch Shift</p>';

	var tempoDiv = document.createElement('div');
	tempoDiv.id = "tempo";
	tempoDiv.onclick = function() {effectHandler.effectClicker("tempo")};
	tempoDiv.classList.add("flex-item");
	tempoDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem">fast_rewind</i><i class="material-icons" style="font-size: 5rem">fast_forward</i><p>Tempo Modulation</p>';

	var removeDiv = document.createElement('div');
	removeDiv.id = "remove";
	removeDiv.onclick = function() {effectHandler.effectClicker("remove")};
	removeDiv.classList.add("flex-item");
	removeDiv.innerHTML = '<i class="material-icons" style="font-size: 5rem" id="removeI">cancel</i><p>Remove Audio</p>';

	effectDiv.appendChild(cutDiv);
	effectDiv.appendChild(eqDiv);
	effectDiv.appendChild(volumeDiv);
	effectDiv.appendChild(highPassDiv);
	effectDiv.appendChild(lowPassDiv);
	effectDiv.appendChild(pitchDiv);
	effectDiv.appendChild(tempoDiv);
	effectDiv.appendChild(removeDiv);

	//
	//
	//
	//Effect modal rendering
	//EQ Modal rendering
	var eqModal = document.createElement('div'); //create core EQ Modal
	eqModal.id = "eqModal";
	eqModal.classList.add("modal");
	document.body.appendChild(eqModal);

	eqDragDiv = document.createElement('div'); //create the drag div for the modal 
	eqDragDiv.id = "eqDragDiv";
	eqDragDiv.classList.add("drag-div")

	modalContent = document.createElement("div") //Create modal content div
	modalContent.classList.add("modal-content");
	modalContent.id = "eqModalContent";
	modalSpan = document.createElement("span");
	modalSpan.innerHTML = "&times;"
	modalSpan.classList.add("close");
	modalSpan.id = "modalClose";
	modalSpan.onclick = function() {
		eqModal.style.display = "none"; //On click of close put eqModal's style to none
		targetDivContainer = document.getElementById("eqContainer2");
		targetDivContainer.style.display = 'none'; //Set the display of the target container element to none so when modal is opened again on a fresh effect it has the correct view
	}

	eqModal.appendChild(eqDragDiv); //add drag div as child of eq modal
	modalContent.appendChild(modalSpan); //add modal content of child of modal main
	eqModal.appendChild(modalContent); //add modal content to eqModal main

	$( function() {
		$( "#eqModal" ).draggable({handle: '#eqDragDiv'}); //Make draggable div draggable - effects parent div
  	});

	titleDiv = document.createElement("div"); //Create title div to hold title, strength curve etc
	titleDiv.classList.add("titleDiv");
	eqHeader = document.createElement("h3"); //Create title of modal
	eqHeader.innerHTML = "EQ Effect";
	titleDiv.appendChild(eqHeader);
	curveHeader = document.createElement("h4"); //Add curve text to explain what the drop down below does
	curveHeader.innerHTML = "Strength Curve";
  	strengthCurve = document.createElement("select"); //Create strength curve select element
  	strengthCurve.id = "strengthCurveEQ";
  	strengthCurve.name = "Strength Curve";
  	strengthCurve.innerHTML = "<option value=\"continous\">Continous</option><option value=\"linear\">Linear</option><br><br>"; //Set strength curve options
  	strengthCurve.oninput = function() {
  		div = document.getElementById("eqContainer2");
  		effectHandler.updateStrengthCurve(this.audioId, this.effectId, this.value); //update strengthCurve for given effect and audio item
  		if (this.value != "continous"){
  			div.style.display = 'block';

  		} else {
			div.style.display = 'none';
  		}
  	}
  	titleDiv.appendChild(curveHeader); 
  	titleDiv.appendChild(strengthCurve);
  	modalContent.appendChild(titleDiv); //add title content to modal div

  	knobWrapper = document.createElement("div"); //create wrapper for knobs
  	knobWrapper.classList.add("knob-wrapper");
  	modalContent.appendChild(knobWrapper); //add div to modal content
  	uiEffect.renderEqView(0, 0, 0, 0, 0, 0, 0, 0, knobWrapper, effectHandler, dataStore); //render sub knob divs and their associated knobs

	//

	//Volume Modal
	var volumeModal = document.createElement('div');
	volumeModal.id = "volumeModal";
	volumeModal.classList.add("modal");

	modalContent = document.createElement("div")
	modalContent.classList.add("modal-content");
	modalSpan = document.createElement("span");
	modalSpan.innerHTML = "&times;"
	modalSpan.classList.add("close")
	modalSpan.onclick = function() {
		volumeModal.style.display = "none";
	}
	modalContent.appendChild(modalSpan);
	volumeModal.appendChild(modalContent);

	$( function() {
    	$( "#volumeModal" ).draggable();
  	});
  	curveHeader = document.createElement("h3");
	curveHeader.innerHTML = "Strength Curve";
	modalContent.appendChild(curveHeader);
  	strengthCurve = document.createElement("select");
  	strengthCurve.name = "Strength Curve";
  	strengthCurve.innerHTML = "<option value=\"continous\">Continous</option><option value=\"linear\">Linear</option>";
  	modalContent.appendChild(strengthCurve);
	//

	var highPassModal = document.createElement('div');
	highPassModal.id = "highPassModal";
	highPassModal.classList.add("modal");

	modalContent = document.createElement("div")
	modalContent.classList.add("modal-content");
	modalSpan = document.createElement("span");
	modalSpan.innerHTML = "&times;"
	modalSpan.classList.add("close")
	modalSpan.onclick = function() {
		highPassModal.style.display = "none";
	}
	modalContent.appendChild(modalSpan);
	highPassModal.appendChild(modalContent);

	$( function() {
    	$( "#highPassModal" ).draggable();
  	});
  	curveHeader = document.createElement("h3");
	curveHeader.innerHTML = "Strength Curve";
	modalContent.appendChild(curveHeader);
  	strengthCurve = document.createElement("select");
  	strengthCurve.name = "Strength Curve";
  	strengthCurve.innerHTML = "<option value=\"continous\">Continous</option><option value=\"linear\">Linear</option>";
  	modalContent.appendChild(strengthCurve);

	//

	var lowPassModal = document.createElement('div');
	lowPassModal.id = "lowPassModal";
	lowPassModal.classList.add("modal");

	modalContent = document.createElement("div")
	modalContent.classList.add("modal-content");
	modalSpan = document.createElement("span");
	modalSpan.innerHTML = "&times;"
	modalSpan.classList.add("close")
	modalSpan.onclick = function() {
		lowPassModal.style.display = "none";
	}
	modalContent.appendChild(modalSpan);
	lowPassModal.appendChild(modalContent);

	$( function() {
    	$( "#lowPassModal" ).draggable();
  	});
  	curveHeader = document.createElement("h3");
	curveHeader.innerHTML = "Strength Curve";
	modalContent.appendChild(curveHeader);
  	strengthCurve = document.createElement("select");
  	strengthCurve.name = "Strength Curve";
  	strengthCurve.innerHTML = "<option value=\"continous\">Continous</option><option value=\"linear\">Linear</option>";
  	modalContent.appendChild(strengthCurve);

	//

	var pitchModal = document.createElement('div');
	pitchModal.id = "pitchModal";
	pitchModal.classList.add("modal");

	modalContent = document.createElement("div")
	modalContent.classList.add("modal-content");
	modalSpan = document.createElement("span");
	modalSpan.innerHTML = "&times;"
	modalSpan.classList.add("close")
	modalSpan.onclick = function() {
		pitchModal.style.display = "none";
	}
	modalContent.appendChild(modalSpan);
	pitchModal.appendChild(modalContent);

	$( function() {
    	$( "#pitchModal" ).draggable();
  	});
  	curveHeader = document.createElement("h3");
	curveHeader.innerHTML = "Strength Curve";
	modalContent.appendChild(curveHeader);
  	strengthCurve = document.createElement("select");
  	strengthCurve.name = "Strength Curve";
  	strengthCurve.innerHTML = "<option value=\"continous\">Continous</option><option value=\"linear\">Linear</option>";
  	modalContent.appendChild(strengthCurve);

	//

	var tempoModal = document.createElement('div');
	tempoModal.id = "tempoModal";
	tempoModal.classList.add("modal");

	modalContent = document.createElement("div")
	modalContent.classList.add("modal-content");
	modalSpan = document.createElement("span");
	modalSpan.innerHTML = "&times;"
	modalSpan.classList.add("close")
	modalSpan.onclick = function() {
		tempoModal.style.display = "none";
	}
	modalContent.appendChild(modalSpan);
	tempoModal.appendChild(modalContent);

	$( function() {
    	$( "#tempoModal" ).draggable();
  	});
  	curveHeader = document.createElement("h3");
	curveHeader.innerHTML = "Strength Curve";
	modalContent.appendChild(curveHeader);
  	strengthCurve = document.createElement("select");
  	strengthCurve.name = "Strength Curve";
  	strengthCurve.innerHTML = "<option value=\"continous\">Continous</option><option value=\"linear\">Linear</option>";
  	modalContent.appendChild(strengthCurve);

	document.body.appendChild(volumeModal);
	document.body.appendChild(highPassModal);
	document.body.appendChild(lowPassModal);
	document.body.appendChild(pitchModal);
	document.body.appendChild(tempoModal);
}

module.exports = {
	trackCanvas: trackCanvas,
	renderEffects: renderEffects
};
},{"./settings":16,"./theme":18,"./ui-effect":19,"./utils":24}],21:[function(require,module,exports){
var Settings = require("./settings");
	utils = require("./utils");
	Theme = require("./theme");
	timelineScroll = require("./ui-scroll");
	uiExterior = require("./ui-exterior");
	effectUtils = require("./effects.js");
	menu = require("./menu.js");
	audio = require("./audio.js");
	AudioItem = audio.AudioItem;

var tickMark1;
var tickMark2;
var tickMark3;
var frame_start;

//Gets the timescale values for each tick
function time_scaled(time_scale) {
	/*
	 * Subdivison LOD
	 * time_scale refers to number of pixels per unit
	 * Eg. 1 inch - 60s, 1 inch - 60fps, 1 inch - 6 mins
	 */
	var div = 60;

	tickMark1 = time_scale / div;
	tickMark2 = 2 * tickMark1;
	tickMark3 = 10 * tickMark1;

}

function timeline(dataStore, dispatcher) {
	var canvas = document.getElementById("timeline-canvas");
	var ctx = canvas.getContext('2d');
	var dpr = window.devicePixelRatio; 
	var scroll_canvas = new timelineScroll.timelineScroll(dataStore, dispatcher); //Creates timeline scroll and gets object of timeline scroll
	var track_canvas = new uiExterior.trackCanvas(dataStore, dispatcher); //Creates exterior track canvas and gets object
	var time_scale;
	var renderItems = [];
	var renderedItems = false;
	var drawSnapMarker = 0;
	var trackLayers = dataStore.getData("ui", "tracks");
	var lineHeight = dataStore.getData("ui", "lineHeight");
	var offset = dataStore.getData("ui", "trackTimelineOffset");
	var trackBounds = {};
	var height = canvas.height;
	var width = canvas.width;
	var audioData = dataStore.getData("data", "data");
	var time_scale = dataStore.getData("ui", "timeScale");
	var lastTimeScale = time_scale;
	var resetWaveForm = false;
	var bounds = canvas.getBoundingClientRect();
	var overwriteCursor = false;
	var draggingx = null;
	var currentDragging = null;
	var holdTick = 0; //Handles snapping of items on y axis to assist with moving tracks together
	var block = false;
	var lastX = 0;
	var startX;
	var endX;
	var trackSave = null; //Saves state of audio items on timeline - to be used if audioItem Y position is put back to previous state - should save
	var trackSave2 = null;
	var blockNumber = 0;

	effectHandler = new effectUtils.effectHandler(dataStore, renderItems, canvas, dpr, overwriteCursor, bounds);
	uiExterior.renderEffects(effectHandler, dataStore);

	//Create array of objects which defines the pixel bounds for each track element
	for (var i=0; i<trackLayers; i++){
		trackBounds[i] = [(offset + i*lineHeight)/dpr, (offset + (i+1)*lineHeight)/dpr];
	}

	//Resize function called upon window resize - will resize canvas so that future paint operations can be correctly painted according to resize
	function resize() {
		parentDiv = document.getElementById("timeline")
		height = parentDiv.offsetHeight;
		width = parentDiv.offsetWidth;
		canvas.height = height;
		canvas.width = width;
		dataStore.updateUi("lineHeight", height*Settings.lineHeightProportion); //Update lineHeight in accordance to window height + proportion of track to window
		scroll_canvas.resize();
		track_canvas.resize();
		resetWaveForm = true;
		bounds = canvas.getBoundingClientRect();

		//Redefine track bounds after resize
		for (var i=0; i<trackLayers; i++){
			trackBounds[i] = [(offset + i*lineHeight)/dpr, (offset + i+1*lineHeight)/dpr];
		}
	}

	//Core paint routine for studio view
	function paint() {
		//Paint other canvas items
		scroll_canvas.paint();
		track_canvas.paint();

		var time_scale = dataStore.getData("ui", "timeScale");
		time_scaled(time_scale);
		currentTime = dataStore.getData("ui", "currentTime"); // of marker
		frame_start = dataStore.getData("ui", "scrollTime"); //Starting time value of timeline view

		var units = time_scale / tickMark1; //For now timescale is taken from settings - this should be updated later as user zooms into timeline
		var offsetUnits = (frame_start * time_scale) % units;
		var count = (canvas.width + offsetUnits) / tickMark1; //Amount of possible main tick markers across window width

		//TODO: Lines and text size should scale relative to size of canvas
		ctx.fillStyle = Theme.a;
		ctx.fillRect(0, 0, width, height);
		ctx.save();
		ctx.scale(dpr, dpr);

		ctx.lineWidth = 1;

		//Iterate over count and draw main tick markers along with second(s) timestamp related to this
		for (i = 0; i < count; i++) {
			x = (i * units) - offsetUnits;

			// vertical lines
			ctx.strokeStyle = Theme.b;
			ctx.beginPath();
			ctx.moveTo(x, 5);
			ctx.lineTo(x, height);
			ctx.stroke();

			ctx.fillStyle = Theme.d;
			ctx.textAlign = 'center';

			//Get time at current tick with accordance to timescale and scroll wheel position
			var t = (i * units - offsetUnits) / time_scale + frame_start;
			if (t != 0){
				t = utils.format_friendly_seconds(t);
				ctx.fillText(t, x, 15);
			}
		}
		units = time_scale / tickMark2;
		count = (width + offsetUnits) / units;

		// marker lines - main
		for (i = 0; i < count; i++) {
			ctx.strokeStyle = Theme.d;
			ctx.beginPath();
			x = i * units - offsetUnits;
			ctx.moveTo(x, 0);
			ctx.lineTo(x, 8);
			ctx.stroke();
		}

		var mul = tickMark3 / tickMark2;
		units = time_scale / tickMark3;
		count = (width + offsetUnits) / units;

		// small ticks
		for (i = 0; i < count; i++) {
			if (i % mul === 0) continue;
			ctx.strokeStyle = Theme.c;
			ctx.beginPath();
			x = i * units - offsetUnits;
			ctx.moveTo(x, 0);
			ctx.lineTo(x, 5);
			ctx.stroke();
		}

		drawAudioElements(); //Draw audio elements
		ctx.restore();

		//Begin drawing marker
		var lineHeight = dataStore.getData("ui", "lineHeight");
		ctx.strokeStyle = 'red'; // Theme.c
		x = ((currentTime - (frame_start)) * time_scale)*dpr;

		//Get currentTime to input into marker
		var txt = utils.format_friendly_seconds(currentTime);
		var textWidth = ctx.measureText(txt).width;

		var base_line = (lineHeight, half_rect = textWidth / dpr);

		//Draw main line 
		ctx.beginPath();
		ctx.moveTo(x, base_line);
		ctx.lineTo(x, height);
		ctx.stroke();

		//Draw main marker body
		ctx.fillStyle = 'red'; // black
		ctx.textAlign = 'center';
		ctx.beginPath();
		ctx.moveTo(x, base_line + 5);
		ctx.lineTo(x + 5, base_line);
		ctx.lineTo(x + half_rect, base_line);
		ctx.lineTo(x + half_rect, base_line - 14);
		ctx.lineTo(x - half_rect, base_line - 14);
		ctx.lineTo(x - half_rect, base_line);
		ctx.lineTo(x - 5, base_line);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = 'white';
		ctx.fillText(txt, x, base_line - 4);

		ctx.restore();

		needsRepaint = false;

	}

	function drawAudioElements() {
		var trackLayers = dataStore.getData("ui", "tracks");
		var lineHeight = dataStore.getData("ui", "lineHeight"); //TODO line height should be updated as more track layers are added - if track layers extend view
		var offset = dataStore.getData("ui", "trackTimelineOffset");
		var audioData = dataStore.getData("data", "data");
		var time_scale = dataStore.getData("ui", "timeScale");
		var y;

		//Draw track lines
		for (var i = 0; i <= trackLayers; i++){
			y = (offset + i*lineHeight)/dpr;
			ctx.strokeStyle = Theme.b;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
		//console.log(audioData);
		//Iterate over audioData and paint componenets on timeline - along will all effects associated on them
		for (var i = 0; i < audioData.length; i++){
			audioItem = audioData[i];
			x = utils.time_to_x(audioItem.start, time_scale, frame_start); //Starting x value for audio item
			x2 = utils.time_to_x(audioItem.end, time_scale, frame_start); //Ending x value for audio item
			audioItem.effects = effectUtils.computeEffectsX(audioItem.effects, x, time_scale, frame_start);
			var y1 = (offset + audioItem.track * lineHeight)/dpr; //Starting y value for audio item
			var y2 = (lineHeight)/dpr; //Ending y value for audio item

			if (renderedItems == false){
				AudioRect = new AudioItem();
				AudioRect.setWaveForm(audioItem.raw_wave_form, y1, y2, x, x2, frame_start, time_scale, offset, dpr);
				AudioRect.set(x, y1, x2, y2, Theme.audioElement, audioItem.name, audioItem.id, audioItem.track, time_scale, frame_start, audioItem.beat_markers, audioItem.effects);
				AudioRect.paint(ctx, Theme.audioElement);
				renderItems.push(AudioRect);

			} else {
				currentItem = renderItems[i];
				if (audioItem.raw_wave_form != null && currentItem.rawWaveForm == undefined || lastTimeScale != time_scale || resetWaveForm == true){
					currentItem.setWaveForm(audioItem.raw_wave_form, y1, y2, x, x2, frame_start, time_scale, offset, dpr);
				}
				currentItem.set(x, y1, x2, y2, Theme.audioElement, audioItem.name, audioItem.id, audioItem.track, time_scale, frame_start, audioItem.beat_markers, audioItem.effects);
				currentItem.paint(ctx, Theme.audioElement);
			}
		}
		lastTimeScale = time_scale;
		renderedItems = true;
		resetWaveForm = false;

		if (drawSnapMarker != false){
			ctx.strokeStyle = "red";
			ctx.beginPath();
			ctx.moveTo(drawSnapMarker - frame_start * time_scale, 0);
			ctx.lineTo(drawSnapMarker - frame_start * time_scale, height);
			ctx.stroke();
		}
	}

	//Handle Y axis track movement
	function move_y(audioItems, currentDragging, yPosition){
		var track = currentDragging.track;
		renderItemsTracks = {};

		for (var i=0; i<audioItems.length; i++){
			currentItem = audioItems[i];

			if (renderItemsTracks.hasOwnProperty(currentItem.track)){
				renderItemsTracks[currentItem.track].push(currentItem);

			} else {
				renderItemsTracks[currentItem.track] = [currentItem];
			}
		}

		for (var i=0; i<trackLayers; i++){
			//Cursor has moved to a new track - update Y track
			if (yPosition > trackBounds[i][0] && yPosition < trackBounds[i][1] && currentDragging.track != i){
				//Write code to ensure track cant change if position will be inside another audio on Y track
				track = i;
			}
		}
		return track;
	}

	function move_x(renderItems, currentDragging, e, draggingx, lastX){
		startX = (draggingx + e.dx/dpr); //tickOffset must be calculated based on diffence between current x value and last x value
		currentDragging.updateBars(startX, draggingx);
		endX = (startX + currentDragging.size)
		rendX = utils.round(endX, 0.5);
		rstartX = utils.round(startX, 0.5);

		audioItemLoop:
		for (var i = 0; i < renderItems.length; i++){
			item = renderItems[i];
			if (item.track == currentDragging.track && item.id != currentDragging.id){ //If to check if comparison items are on same track 
				if (item.xNormalized >= currentDragging.xNormalized){ //If start of current comparison audio is before dragging audio start
					if (endX >= item.xNormalized){ //Check that computed end is greater than comparison audio start 
						if (e.offsetx/dpr <= item.x2){
							endX = item.xNormalized;
							startX = endX - currentDragging.size;
						} else {
							startX = item.x2Normalized;
							endX = startX + currentDragging.size;
						}
					}
				} else if (item.x2Normalized <= currentDragging.xNormalized){
					if (startX <= item.x2Normalized){
						if (e.offsetx/dpr >= item.x){
							startX = item.x2Normalized;
							endX = startX + currentDragging.size;

						} else {
							endX = item.xNormalized;
							startX = endX - currentDragging.size;
						}
					}
				}
			} else if (item.id != currentDragging.id && lastX != 0) { //Run Y aligment - will hold currently dragged audio item at snapped location for x movement ticks
				//Rounding values should change based on time_scale value - when we are far zoomed out 0.5 is too small each scroll steps much larger than 0.5
				//Items should not be able to snap inside other pieces of audio by being close 
				// console.log("Comparing", rstartX, rendX, "With", item.rounded2X, 
				// 	item.rounded2X2, "ID", item.id, "and", currentDragging.id,
				// 	"original values", startX, endX, item.xNormalized, item.x2Normalized)
				if (rendX == item.rounded2X){ //end2start
					block = true;
					blockNumber = 10;
					startX = item.xNormalized - currentDragging.size;
					endX = item.xNormalized;
					drawSnapMarker = item.xNormalized;
					break audioItemLoop;

				} else if (rendX == item.rounded2X2) { //end2end
					block = true;
					blockNumber = 10;
					startX = item.x2Normalized - currentDragging.size;
					endX = item.x2Normalized;
					drawSnapMarker = item.x2Normalized;
					break audioItemLoop;

				} else if (rstartX == item.rounded2X) { //start2/start
					block = true;
					blockNumber = 10;
					startX = item.xNormalized;
					endX = item.xNormalized + currentDragging.size;
					drawSnapMarker = item.xNormalized;
					break audioItemLoop;

				} else if (rstartX == item.rounded2X2) { //start2end
					block = true;
					blockNumber = 10;
					startX = item.x2Normalized;
					endX = item.x2Normalized + currentDragging.size;
					drawSnapMarker = item.x2Normalized;
					break audioItemLoop;

				} else {
					if (startX >= item.xNormalized && startX <= item.x2Normalized || endX >= item.xNormalized && endX <= item.x2Normalized || item.xNormalized >= startX && item.x2Normalized <= endX){
						if (item.barMarkersX.length > 0){
							for (var i2=0; i2<item.barMarkersXRounded.length; i2++){
								if (rendX == item.barMarkersXRounded[i2]){ //end2start
									block = true;
									blockNumber = 4;
									startX = item.barMarkersX[i2] - currentDragging.size;
									endX = item.barMarkersX[i2];
									drawSnapMarker = item.barMarkersX[i2];
									break audioItemLoop;

								} else if (rstartX == item.barMarkersXRounded[i2]) { //start2/start
									block = true;
									blockNumber = 4;
									startX = item.barMarkersX[i2];
									endX = item.barMarkersX[i2] + currentDragging.size;
									drawSnapMarker = item.barMarkersX[i2];
									break audioItemLoop;

								} else {
									for (var bi=0; bi<currentDragging.barMarkersXRounded.length; bi++){
										if (currentDragging.barMarkersXRounded[bi] == item.barMarkersXRounded[i2]){
											startX = item.barMarkersX[i2] - currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][0];
											endX = item.barMarkersX[i2] + currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][1];
											block = true;
											blockNumber = 4;
											drawSnapMarker = item.barMarkersX[i2];
											break audioItemLoop;

										} else if (currentDragging.barMarkersXRounded[bi] == item.rounded2X) {
											startX = item.xNormalized - currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][0];
											endX = item.xNormalized + currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][1];
											block = true;
											blockNumber = 4;
											drawSnapMarker = item.xNormalized;
											break audioItemLoop;

										} else if (currentDragging.barMarkersXRounded[bi] == item.rounded2X2) {
											startX = item.x2Normalized - currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][0];
											endX = item.x2Normalized + currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][1];
											block = true;
											blockNumber = 4;
											drawSnapMarker = item.x2Normalized;
											break audioItemLoop;
										}
									}
								}
							}
						} else {
							for (var bi=0; bi<currentDragging.barMarkersXRounded.length; bi++){
								if (currentDragging.barMarkersXRounded[bi] == item.rounded2X) {
									startX = item.xNormalized - currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][0];
									endX = item.xNormalized + currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][1];
									block = true;
									blockNumber = 4;
									drawSnapMarker = item.xNormalized;
									break audioItemLoop;

								} else if (currentDragging.barMarkersXRounded[bi] == item.rounded2X2) {
									startX = item.x2Normalized - currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][0];
									endX = item.x2Normalized + currentDragging.barMarkerDiff[currentDragging.barMarkersX[bi]][1];
									block = true;
									blockNumber = 4;
									drawSnapMarker = item.x2Normalized;
									break audioItemLoop;
								}
							}
						}
					}
				}
			}
		}

		//Mouse should not be able to go past 0 - thus if mouse go pasts 0 starts will be updated to 0 and end values will be increased by negative start value to ensure we dont loose length of audio
		if (startX < 0){
			end = end - start;
			endX = endX - startX;
			startX = 0;
			start = 0;
		}
		return startX, endX, block, drawSnapMarker, blockNumber;
	}

	__menuConf = menu.__menuConf;
	__menuConf.startMenu();

	// Contextmenu-eventlistener
	canvas.addEventListener("contextmenu", function(e){
		currentX = ((e.clientX - bounds.left)/dpr + (frame_start * time_scale));
		currentY = (e.clientY - bounds.top)/dpr;

		for (var i = 0; i < renderItems.length; i++){
			if (renderItems[i].contains(currentX, currentY, time_scale, frame_start)) {
			    e.preventDefault();
			    __menuConf.menuState = !__menuConf.menuState;
			    __menuConf.menuEvent(e, renderItems[i].id);
			}
		}
	}, false);

	// Click-eventlistener
	document.addEventListener("click", () => {
	    __menuConf.menuState = false;
	    menu.closeMenu(); //lets move this function insde __menuConf
	}, false);

	//mousemove eventListener to handle cursor changing to pointer upon hovering over a draggable item
	canvas.addEventListener("mousemove", function(e){
		var time_scale = dataStore.getData("ui", "timeScale");
		frame_start = dataStore.getData("ui", "scrollTime");
		currentX = ((e.clientX - bounds.left)/dpr + (frame_start * time_scale));
		currentY = (e.clientY - bounds.top)/dpr;
		console.log(overwriteCursor);

		for (var i = 0; i < renderItems.length; i++){
			if (renderItems[i].contains(currentX, currentY, time_scale, frame_start)) {
				if (overwriteCursor == false){
					canvas.style.cursor = 'pointer';
				}
				return;
			}
		}
		if (overwriteCursor == false){
			canvas.style.cursor = 'default';
		}
	});


	//Handles "wheel" zoom events - trackpad zoom or scroll wheel zoom - also includes scroll left and right
	//Handle scroll left and right - moves timeline left and right - scroll up and down zooms into/out of timeline - then two finger 
	canvas.addEventListener("wheel", function(e){
		xMove = e.deltaX/4;
		var frame_start = dataStore.getData("ui", "scrollTime")
		if (frame_start != 0){
			e.preventDefault();
		}
		dispatcher.fire('update.scrollTime', frame_start + xMove);
	});

	canvas.addEventListener("keydown", function(e){
		console.log("Event called");
		if (e.keyCode == 37){ //left arrow key
			dispatcher.fire('update.scrollTime', frame_start -5);

		} else if (e.keyCode == 39){ //right arrow key
			dispatcher.fire('update.scrollTime', frame_start +5);

		} else if (e.keyCode == 38){ //up arrow key
			var time_scale = dataStore.getData("ui", "timeScale");
			dispatcher.fire('update.scale', time_scale +5);

		} else if (e.keyCode == 40){ //down arrow key
			var time_scale = dataStore.getData("ui", "timeScale");
			dispatcher.fire('update.scale', time_scale +5);

		}
	});

	//Handles dragging of movable items
	utils.handleDrag(canvas,
		function down(e){
			var time_scale = dataStore.getData("ui", "timeScale");
			frame_start = dataStore.getData("ui", "scrollTime");
			currentX = ((e.offsetx)/dpr + (frame_start * time_scale));
			currentY = (e.offsety)/dpr;

			for (var i = 0; i < renderItems.length; i++){
				item = renderItems[i];
				if (item.contains(currentX, currentY, time_scale, frame_start)) {
					if (item.containsEffect(currentX, currentY) == false){
						draggingx = item.x + frame_start * time_scale
						currentDragging = item;
						if (overwriteCursor == false){
							canvas.style.cursor = 'grabbing';
						}
						return;

					} else {
						//Open effect modal
						return;
					}
				}
			}
			dispatcher.fire('time.update', utils.x_to_time((e.offsetx)/dpr, time_scale, frame_start));
		},
		function move(e){
			var time_scale = dataStore.getData("ui", "timeScale");
			frame_start = dataStore.getData("ui", "scrollTime");

			if (draggingx != null) {
				if (block == false){
					canvas.style.cursor = 'grabbing';
					track = move_y(renderItems, currentDragging, e.offsety/dpr);
					currentDragging.track = track;
					startX, endX, block, drawSnapMarker, blockNumber = move_x(renderItems, currentDragging, e, draggingx, lastX);

					//Update x/x2 value of current dragging item so we can use for future compuations
					currentDragging.x = startX;
					currentDragging.x2 = endX;
					currentDragging.xNormalized = startX;
					currentDragging.x2Normalized = endX;
					currentDragging.updateBars(startX, draggingx);
					lastX = startX;
					start = (startX / time_scale);
					end = (endX / time_scale);
					dispatcher.fire('update.audioTime', currentDragging.id, start, end);
					dispatcher.fire('update.audioTrack', currentDragging.id, track);
					//console.log("Post move data", dataStore.getData("data"));

				} else {
					if (holdTick == blockNumber){
						block = false;
						holdTick = 0;
						drawSnapMarker = false;

					} else {
						holdTick += 1;
					}
				}

			} else {
				dispatcher.fire('time.update', utils.x_to_time((e.offsetx)/dpr, time_scale, frame_start));
			}
		},
		function up(e){
			//Reset drag related variables
			draggingx = null;
			currentDragging = null;
			if (overwriteCursor == false){
				canvas.style.cursor = 'pointer';
			}
			holdTick = 0;
			block = false;
			drawSnapMarker = false;
			blockNumber = 0;
		});

	this.paint = paint;
	this.resize = resize;
}

module.exports = {
	timeline: timeline
};
},{"./audio.js":11,"./effects.js":14,"./menu.js":15,"./settings":16,"./theme":18,"./ui-exterior":20,"./ui-scroll":22,"./utils":24}],22:[function(require,module,exports){
var Theme = require("./theme")
	utils = require("./utils")

function Rect() {
	
}

Rect.prototype.set = function(x, y, w, h, color, outline) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.color = color;
	this.outline = outline;
};

Rect.prototype.paint = function(ctx) {
	ctx.fillStyle = Theme.b;  // // 'yellow';
	ctx.strokeStyle = Theme.c;

	this.shape(ctx);

	ctx.stroke();
	ctx.fill();
};

Rect.prototype.shape = function(ctx) {
	ctx.beginPath();
	ctx.rect(this.x, this.y, this.w, this.h);
};

Rect.prototype.contains = function(x, y) {
	return x >= this.x && y >= this.y
	 && x <= this.x + this.w && y <= this.y + this.h;
};

function timelineScroll(dataStore, dispatcher){
	var canvas = document.getElementById("top-timeline-canvas");
	var ctx = canvas.getContext('2d');
	var dpr = window.devicePixelRatio; 
	var scrollTop = 0, scrollLeft = 0, SCROLL_HEIGHT;
	var layers = dataStore.getData("ui", "layers");

	var TOP_SCROLL_TRACK = 20;
	var MARGINS = 0;

	var scroller = {
		left: 0,
		grip_length: 0,
		k: 1
	};

	var scrollRect = new Rect();
	var height = canvas.height;
	var width = canvas.width;

	this.repaint = function(){
		paint(ctx);
	}

	this.scrollTo = function(s, y) {
		console.log('Scroll to function called arguments are below ')
		console.log(s)
		console.log(y)
		scrollTop = s * Math.max(layers.length * LINE_HEIGHT - SCROLL_HEIGHT, 0);
		repaint();
	};

	this.resize = function resize() {
		parentDiv = document.getElementById("top-timeline")
		canvas.width = parentDiv.offsetWidth;
		canvas.height = parentDiv.offsetHeight;
		height = canvas.height;
		width = canvas.width;
	}

	this.paint = function() {
		var totalTime = dataStore.getData("ui", "totalTime")
		var scrollTime = dataStore.getData("ui", "scrollTime")
		var currentTime = dataStore.getData("ui", "currentTime")
		
		var pixels_per_second = dataStore.getData("ui", "timeScale")

		ctx.save();

		var w = width;
		var h = 16; // TOP_SCROLL_TRACK;
		var h2 = h;

		ctx.fillStyle = Theme.a;
		ctx.fillRect(0, 0, width, height);
		ctx.translate(MARGINS, 5);

		// outline scroller
		ctx.beginPath();
		ctx.strokeStyle = Theme.b;
		ctx.rect(0, height/4, w, height/3);
		ctx.stroke();
		
		var totalTimePixels = totalTime * pixels_per_second;
		var k = w / totalTimePixels;
		scroller.k = k;

		var grip_length = (w * k)/dpr;

		scroller.grip_length = grip_length;

		scroller.left = scrollTime / totalTime * w;
		
		scrollRect.set(scroller.left, height/4, scroller.grip_length, height/3);
		scrollRect.paint(ctx);

		var r = currentTime / totalTime * w;		

		ctx.fillStyle = Theme.c;
		ctx.lineWidth = 2;
		
		ctx.beginPath();
		
		// circle
		// ctx.arc(r, h2 / 2, h2 / 1.5, 0, Math.PI * 2);

		// line
		ctx.rect(r, height/4, 2, height/3);
		ctx.fill()

		ctx.restore();

	}

	/** Handles dragging for scroll bar **/

	var draggingx = null;

	utils.handleDrag(canvas,
		function down(e) {
			console.log("DOWN")
			if (scrollRect.contains(e.offsetx, e.offsety)) {
				draggingx = scroller.left;
				console.log("Dragging x")
				console.log(draggingx);
				return;
			}
			
			var totalTime = dataStore.getData("ui", "totalTime")
			var pixels_per_second = dataStore.getData("ui", "timeScale")
			var frame_start = dataStore.getData("ui", "scrollTime")
			var w = width;

			var t = (e.offsetx) / w * totalTime;

			// data.get('ui:currentTime').value = t;
			dispatcher.fire('time.update', t);
				
		},
		function move (e) {
			if (draggingx != null) {
				console.log("Move");
				var totalTime = dataStore.getData("ui", "totalTime")
				var w = width;

				if ((e.offsetx) < w){ //Check currently does not work - this should check if scroller.start + scroller.length < total width of slider
					dispatcher.fire('update.scrollTime', (draggingx + e.dx)  / w * totalTime);
				}

			} else {
				console.log("DOWN")
				if (scrollRect.contains(e.offsetx, e.offsety)) {
					draggingx = scroller.left;
					console.log("Dragging x")
					console.log(draggingx);
					return;
				}
				
				var totalTime = dataStore.getData("ui", "totalTime")
				var pixels_per_second = dataStore.getData("ui", "timeScale")
				var frame_start = dataStore.getData("ui", "scrollTime")
				var w = width;

				var t = (e.offsetx) / w * totalTime;
				dispatcher.fire('time.update', t);	
			}
		},
		function up(e){
			draggingx = null;
		}
		// function hit(e) {
		// 	if (child.onHit) { child.onHit(e) };
		// }
	);

	canvas.addEventListener("mousedown", function (e){
		bounds = canvas.getBoundingClientRect();
		var currentx = e.clientX - bounds.left, currenty = e.clientY;
	})

	/*** End handling for scrollbar ***/
}

module.exports = {
	timelineScroll: timelineScroll
};
},{"./theme":18,"./utils":24}],23:[function(require,module,exports){
var utils = require("./utils");
	Theme = require("./theme")

function initCanvas () {
	console.log("Running canvas init");
	topToolbar = document.createElement('div');
	topToolbar.setAttribute("id", "top-toolbar");
	utils.style(topToolbar, {position: "fixed", width: "100%", height: "10%"});
	document.body.appendChild(topToolbar);

	topToolbar = document.createElement('div');
	topToolbar.setAttribute("id", "top-timeline");
	utils.style(topToolbar, {position: "fixed", width: "90%", left: "10%", height: "5%", top: "10%"});
	document.body.appendChild(topToolbar);

	canvas = document.createElement('canvas');
	canvas.setAttribute("id", "top-timeline-canvas");
	canvas.style.width ='100%';
	canvas.style.height='100%';
	canvas.width = topToolbar.offsetWidth;
	canvas.height = topToolbar.offsetHeight;
	topToolbar.appendChild(canvas);

	timeline = document.createElement('div');
	timeline.setAttribute("id", "timeline");
	utils.style(timeline, {position: "fixed", left: "10%", top: "15%", width: "90%", height: "85%"});
	document.body.appendChild(timeline);

	canvas = document.createElement('canvas');
	canvas.setAttribute("id", "timeline-canvas");
	canvas.style.width ='101%';
	canvas.style.height='101%';
	canvas.width = timeline.offsetWidth;
	canvas.height = timeline.offsetHeight;
	timeline.appendChild(canvas);

	leftColumn = document.createElement('div');
	leftColumn.setAttribute("id", "left-column");
	utils.style(leftColumn, {position: "fixed", width: "10%", top: "15%", height: "85%"});
	document.body.appendChild(leftColumn);

	canvas = document.createElement('canvas');
	canvas.setAttribute("id", "left-column-canvas");
	canvas.style.width ='100%';
	canvas.style.height='100%';
	canvas.width = leftColumn.offsetWidth;
	canvas.height = leftColumn.offsetHeight;
	leftColumn.appendChild(canvas);

	zoomColumn = document.createElement('div');
	zoomColumn.setAttribute("id", "zoomColumn");
	utils.style(zoomColumn, {position: "fixed", top: "10%", width: "10%", height: "5%", backgroundColor: Theme.a});
	document.body.appendChild(zoomColumn);
}

function paintTrackColumn() {

}

module.exports = {
	initCanvas: initCanvas,
	paintTrackColumn: paintTrackColumn
};
},{"./theme":18,"./utils":24}],24:[function(require,module,exports){
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const interpolateHeight = (total_height, offset) => {
  const amplitude = 256;
  return (size) => total_height - ((size + 128) * total_height) / amplitude;
};

function linepointNearestMouse(line,x,y) {
    //
    lerp=function(a,b,x){ return(a+x*(b-a)); };
    var dx=line.x1-line.x0;
    var dy=line.y1-line.y0;
    var t=((x-line.x0)*dx+(y-line.y0)*dy)/(dx*dx+dy*dy);
    var lineX=lerp(line.x0, line.x1, t);
    var lineY=lerp(line.y0, line.y1, t);
    return({x:lineX,y:lineY});
};

function increaseArray(array, increase, roundFlag){
	out = [];
	outRounded = [];

	for (var i=0; i<array.length; i++){
		if (roundFlag == true){
			v = array[i]+increase;
			out.push(v)
			outRounded.push(round(v));
		}
		out.push(array[i]+increase)
	}
	return out, outRounded;
}

//Convert time in seconds to x value given a timescale
function time_to_x(s, time_scale, frame_start) {
	var ds = s - frame_start;
	ds = ds * time_scale;
	return ds;
}

//Convert x to time given frame start and current time scale
function x_to_time(x, time_scale, frame_start) {
	return frame_start + (x) / time_scale
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function removeFromArrayById(array, id) {
	for (var i=0; i<array.length; i++) {
		if (array[i].id == id) {
			array.splice(i,1);
		}
	}
	return array;
}

function round(value, step) {
	step || (step = 1.0);
	var inv = 1.0 / step;
	return Math.round(value * inv) / inv;
}

function getDivSize(id){
	parentDiv = document.getElementById(id);
	return parentDiv.offsetWidth, parentDiv.offsetHeight;
}

function style(element, var_args) {
	for (var i = 1; i < arguments.length; ++i) {
		var styles = arguments[i];
		for (var s in styles) {
			element.style[s] = styles[s];
		}
	}
}

function format_friendly_seconds(s, type) {
	// TODO Refactor to 60fps???
	// 20 mins * 60 sec = 1080 
	// 1080s * 60fps = 1080 * 60 < Number.MAX_SAFE_INTEGER

	var raw_secs = s | 0;
	var secs_micro = s % 60;
	var secs = raw_secs % 60;
	var raw_mins = raw_secs / 60 | 0;
	var mins = raw_mins % 60;
	var hours = raw_mins / 60 | 0;

	var secs_str = (secs / 100).toFixed(2).substring(2);

	var str = mins + ':' + secs_str;

	if (s % 1 > 0) {
		var t2 = (s % 1) * 60;
		if (type === 'frames') str = secs + '+' + t2.toFixed(0) + 'f';
		else str += ((s % 1).toFixed(2)).substring(1);
		// else str = mins + ':' + secs_micro;
		// else str = secs_micro + 's'; /// .toFixed(2)
	}
	return str;	
}

function proxy_ctx(ctx) {
	// Creates a proxy 2d context wrapper which 
	// allows the fluent / chaining API.
	var wrapper = {};

	function proxy_function(c) {
		return function() {
			// Warning: this doesn't return value of function call
			ctx[c].apply(ctx, arguments);
			return wrapper;
		};
	}

	function proxy_property(c) {
		return function(v) {
			ctx[c] = v;
			return wrapper;
		};
	}

	wrapper.run = function(args) {
		args(wrapper);
		return wrapper;
	};

	for (var c in ctx) {
		// if (!ctx.hasOwnProperty(c)) continue;
		// console.log(c, typeof(ctx[c]), ctx.hasOwnProperty(c));
		// string, number, boolean, function, object

		var type = typeof(ctx[c]);
		switch(type) {
			case 'object':
				break;
			case 'function':
				wrapper[c] = proxy_function(c);
				break;
			default:
				wrapper[c] = proxy_property(c);
				break;
		}
	}

	return wrapper;
}

function handleDrag(element, ondown, onmove, onup, down_criteria) {
	var pointer = null;
	var bounds = element.getBoundingClientRect();
	
	element.addEventListener('mousedown', onMouseDown);

	function onMouseDown(e) {
		handleStart(e);

		if (down_criteria && !down_criteria(pointer)) {
			pointer = null;
			return;
		}

		
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		
		ondown(pointer);

		e.preventDefault();
	}
	
	function onMouseMove(e) {
		handleMove(e);
		onmove(pointer);
	}

	function handleStart(e) {
		bounds = element.getBoundingClientRect();
		var currentx = e.clientX, currenty = e.clientY;
		pointer = {
			startx: currentx,
			starty: currenty,
			x: currentx,
			y: currenty,
			dx: 0,
			dy: 0,
			offsetx: currentx - bounds.left,
			offsety: currenty - bounds.top,
			moved: false
		};
	}
	
	function handleMove(e) {
		bounds = element.getBoundingClientRect();
		var currentx = e.clientX,
		currenty = e.clientY,
		offsetx = currentx - bounds.left,
		offsety = currenty - bounds.top;
		pointer.x = currentx;
		pointer.y = currenty;
		pointer.dx = e.clientX - pointer.startx;
		pointer.dy = e.clientY - pointer.starty;
		pointer.offsetx = offsetx;
		pointer.offsety = offsety;

		// If the pointer dx/dy is _ever_ non-zero, then it's moved
		pointer.moved = pointer.moved || pointer.dx !== 0 || pointer.dy !== 0;
	}
	
	function onMouseUp(e) {
		handleMove(e);
		onup(pointer);
		pointer = null;
		
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
	}

	element.addEventListener('touchstart', onTouchStart);

	function onTouchStart(te) {
		
		if (te.touches.length == 1) {
			
			var e = te.touches[0];
			if (down_criteria && !down_criteria(e)) return;
			te.preventDefault();
			handleStart(e);
			ondown(pointer);
		}
		
		element.addEventListener('touchmove', onTouchMove);
		element.addEventListener('touchend', onTouchEnd);
	}
	
	function onTouchMove(te) {
		var e = te.touches[0];
		onMouseMove(e);
	}

	function onTouchEnd(e) {
		// var e = e.touches[0];
		onMouseUp(e);
		element.removeEventListener('touchmove', onTouchMove);
		element.removeEventListener('touchend', onTouchEnd);
	}


	this.release = function() {
		element.removeEventListener('mousedown', onMouseDown);
		element.removeEventListener('touchstart', onTouchStart);
	};
}

module.exports = {
	style: style,
	format_friendly_seconds: format_friendly_seconds,
	handleDrag: handleDrag,
	getDivSize: getDivSize,
	proxy_ctx: proxy_ctx,
	round: round,
	sortByKey: sortByKey,
	removeFromArrayById: removeFromArrayById,
	time_to_x: time_to_x,
	increaseArray: increaseArray,
	x_to_time: x_to_time,
	linepointNearestMouse: linepointNearestMouse,
	interpolateHeight: interpolateHeight,
	guid: guid
};
},{}]},{},[17]);
