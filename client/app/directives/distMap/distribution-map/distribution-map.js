(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DMap = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*! =========================================================
 * bootstrap-slider.js
 *
 * Maintainers:
 *		Kyle Kemp
 *			- Twitter: @seiyria
 *			- Github:  seiyria
 *		Rohit Kalkur
 *			- Twitter: @Rovolutionary
 *			- Github:  rovolution
 *
 * =========================================================
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */


/**
 * Bridget makes jQuery widgets
 * v1.0.1
 * MIT license
 */

(function(root, factory) {
	if(typeof define === "function" && define.amd) {
		define(["jquery"], factory);
	}
	else if(typeof module === "object" && module.exports) {
		var jQuery;
		try {
			jQuery = require("jquery");
		}
		catch (err) {
			jQuery = null;
		}
		module.exports = factory(jQuery);
	}
	else {
		root.Slider = factory(root.jQuery);
	}
}(this, function($) {
	// Reference to Slider constructor
	var Slider;


	(function( $ ) {

		'use strict';

		// -------------------------- utils -------------------------- //

		var slice = Array.prototype.slice;

		function noop() {}

		// -------------------------- definition -------------------------- //

		function defineBridget( $ ) {

			// bail if no jQuery
			if ( !$ ) {
				return;
			}

			// -------------------------- addOptionMethod -------------------------- //

			/**
			 * adds option method -> $().plugin('option', {...})
			 * @param {Function} PluginClass - constructor class
			 */
			function addOptionMethod( PluginClass ) {
				// don't overwrite original option method
				if ( PluginClass.prototype.option ) {
					return;
				}

			  // option setter
			  PluginClass.prototype.option = function( opts ) {
			    // bail out if not an object
			    if ( !$.isPlainObject( opts ) ){
			      return;
			    }
			    this.options = $.extend( true, this.options, opts );
			  };
			}


			// -------------------------- plugin bridge -------------------------- //

			// helper function for logging errors
			// $.error breaks jQuery chaining
			var logError = typeof console === 'undefined' ? noop :
			  function( message ) {
			    console.error( message );
			  };

			/**
			 * jQuery plugin bridge, access methods like $elem.plugin('method')
			 * @param {String} namespace - plugin name
			 * @param {Function} PluginClass - constructor class
			 */
			function bridge( namespace, PluginClass ) {
			  // add to jQuery fn namespace
			  $.fn[ namespace ] = function( options ) {
			    if ( typeof options === 'string' ) {
			      // call plugin method when first argument is a string
			      // get arguments for method
			      var args = slice.call( arguments, 1 );

			      for ( var i=0, len = this.length; i < len; i++ ) {
			        var elem = this[i];
			        var instance = $.data( elem, namespace );
			        if ( !instance ) {
			          logError( "cannot call methods on " + namespace + " prior to initialization; " +
			            "attempted to call '" + options + "'" );
			          continue;
			        }
			        if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) {
			          logError( "no such method '" + options + "' for " + namespace + " instance" );
			          continue;
			        }

			        // trigger method with arguments
			        var returnValue = instance[ options ].apply( instance, args);

			        // break look and return first value if provided
			        if ( returnValue !== undefined && returnValue !== instance) {
			          return returnValue;
			        }
			      }
			      // return this if no return value
			      return this;
			    } else {
			      var objects = this.map( function() {
			        var instance = $.data( this, namespace );
			        if ( instance ) {
			          // apply options & init
			          instance.option( options );
			          instance._init();
			        } else {
			          // initialize new instance
			          instance = new PluginClass( this, options );
			          $.data( this, namespace, instance );
			        }
			        return $(this);
			      });

			      if(!objects || objects.length > 1) {
			      	return objects;
			      } else {
			      	return objects[0];
			      }
			    }
			  };

			}

			// -------------------------- bridget -------------------------- //

			/**
			 * converts a Prototypical class into a proper jQuery plugin
			 *   the class must have a ._init method
			 * @param {String} namespace - plugin name, used in $().pluginName
			 * @param {Function} PluginClass - constructor class
			 */
			$.bridget = function( namespace, PluginClass ) {
			  addOptionMethod( PluginClass );
			  bridge( namespace, PluginClass );
			};

			return $.bridget;

		}

	  	// get jquery from browser global
	  	defineBridget( $ );

	})( $ );


	/*************************************************

			BOOTSTRAP-SLIDER SOURCE CODE

	**************************************************/

	(function($) {

		var ErrorMsgs = {
			formatInvalidInputErrorMsg : function(input) {
				return "Invalid input value '" + input + "' passed in";
			},
			callingContextNotSliderInstance : "Calling context element does not have instance of Slider bound to it. Check your code to make sure the JQuery object returned from the call to the slider() initializer is calling the method"
		};

		var SliderScale = {
			linear: {
				toValue: function(percentage) {
					var rawValue = percentage/100 * (this.options.max - this.options.min);
					if (this.options.ticks_positions.length > 0) {
						var minv, maxv, minp, maxp = 0;
						for (var i = 0; i < this.options.ticks_positions.length; i++) {
							if (percentage <= this.options.ticks_positions[i]) {
								minv = (i > 0) ? this.options.ticks[i-1] : 0;
								minp = (i > 0) ? this.options.ticks_positions[i-1] : 0;
								maxv = this.options.ticks[i];
								maxp = this.options.ticks_positions[i];

								break;
							}
						}
						if (i > 0) {
							var partialPercentage = (percentage - minp) / (maxp - minp);
							rawValue = minv + partialPercentage * (maxv - minv);
						}
					}

					var value = this.options.min + Math.round(rawValue / this.options.step) * this.options.step;
					if (value < this.options.min) {
						return this.options.min;
					} else if (value > this.options.max) {
						return this.options.max;
					} else {
						return value;
					}
				},
				toPercentage: function(value) {
					if (this.options.max === this.options.min) {
						return 0;
					}

					if (this.options.ticks_positions.length > 0) {
						var minv, maxv, minp, maxp = 0;
						for (var i = 0; i < this.options.ticks.length; i++) {
							if (value  <= this.options.ticks[i]) {
								minv = (i > 0) ? this.options.ticks[i-1] : 0;
								minp = (i > 0) ? this.options.ticks_positions[i-1] : 0;
								maxv = this.options.ticks[i];
								maxp = this.options.ticks_positions[i];

								break;
							}
						}
						if (i > 0) {
							var partialPercentage = (value - minv) / (maxv - minv);
							return minp + partialPercentage * (maxp - minp);
						}
					}

					return 100 * (value - this.options.min) / (this.options.max - this.options.min);
				}
			},

			logarithmic: {
				/* Based on http://stackoverflow.com/questions/846221/logarithmic-slider */
				toValue: function(percentage) {
					var min = (this.options.min === 0) ? 0 : Math.log(this.options.min);
					var max = Math.log(this.options.max);
					var value = Math.exp(min + (max - min) * percentage / 100);
					value = this.options.min + Math.round((value - this.options.min) / this.options.step) * this.options.step;
					/* Rounding to the nearest step could exceed the min or
					 * max, so clip to those values. */
					if (value < this.options.min) {
						return this.options.min;
					} else if (value > this.options.max) {
						return this.options.max;
					} else {
						return value;
					}
				},
				toPercentage: function(value) {
					if (this.options.max === this.options.min) {
						return 0;
					} else {
						var max = Math.log(this.options.max);
						var min = this.options.min === 0 ? 0 : Math.log(this.options.min);
						var v = value === 0 ? 0 : Math.log(value);
						return 100 * (v - min) / (max - min);
					}
				}
			}
		};


		/*************************************************

							CONSTRUCTOR

		**************************************************/
		Slider = function(element, options) {
			createNewSlider.call(this, element, options);
			return this;
		};

		function createNewSlider(element, options) {

			/*
				The internal state object is used to store data about the current 'state' of slider.

				This includes values such as the `value`, `enabled`, etc...
			*/
			this._state = {
				value: null,
				enabled: null,
				offset: null,
				size: null,
				percentage: null,
				inDrag: null,
				over: null
			};


			if(typeof element === "string") {
				this.element = document.querySelector(element);
			} else if(element instanceof HTMLElement) {
				this.element = element;
			}

			/*************************************************

							Process Options

			**************************************************/
			options = options ? options : {};
			var optionTypes = Object.keys(this.defaultOptions);

			for(var i = 0; i < optionTypes.length; i++) {
				var optName = optionTypes[i];

				// First check if an option was passed in via the constructor
				var val = options[optName];
				// If no data attrib, then check data atrributes
				val = (typeof val !== 'undefined') ? val : getDataAttrib(this.element, optName);
				// Finally, if nothing was specified, use the defaults
				val = (val !== null) ? val : this.defaultOptions[optName];

				// Set all options on the instance of the Slider
				if(!this.options) {
					this.options = {};
				}
				this.options[optName] = val;
			}

			/*
				Validate `tooltip_position` against 'orientation`
				- if `tooltip_position` is incompatible with orientation, swith it to a default compatible with specified `orientation`
					-- default for "vertical" -> "right"
					-- default for "horizontal" -> "left"
			*/
			if(this.options.orientation === "vertical" && (this.options.tooltip_position === "top" || this.options.tooltip_position === "bottom")) {

				this.options.tooltip_position	= "right";

			}
			else if(this.options.orientation === "horizontal" && (this.options.tooltip_position === "left" || this.options.tooltip_position === "right")) {

				this.options.tooltip_position	= "top";

			}

			function getDataAttrib(element, optName) {
				var dataName = "data-slider-" + optName.replace(/_/g, '-');
				var dataValString = element.getAttribute(dataName);

				try {
					return JSON.parse(dataValString);
				}
				catch(err) {
					return dataValString;
				}
			}

			/*************************************************

							Create Markup

			**************************************************/

			var origWidth = this.element.style.width;
			var updateSlider = false;
			var parent = this.element.parentNode;
			var sliderTrackSelection;
			var sliderTrackLow, sliderTrackHigh;
			var sliderMinHandle;
			var sliderMaxHandle;

			if (this.sliderElem) {
				updateSlider = true;
			} else {
				/* Create elements needed for slider */
				this.sliderElem = document.createElement("div");
				this.sliderElem.className = "slider";

				/* Create slider track elements */
				var sliderTrack = document.createElement("div");
				sliderTrack.className = "slider-track";

				sliderTrackLow = document.createElement("div");
				sliderTrackLow.className = "slider-track-low";

				sliderTrackSelection = document.createElement("div");
				sliderTrackSelection.className = "slider-selection";

				sliderTrackHigh = document.createElement("div");
				sliderTrackHigh.className = "slider-track-high";

				sliderMinHandle = document.createElement("div");
				sliderMinHandle.className = "slider-handle min-slider-handle";

				sliderMaxHandle = document.createElement("div");
				sliderMaxHandle.className = "slider-handle max-slider-handle";

				sliderTrack.appendChild(sliderTrackLow);
				sliderTrack.appendChild(sliderTrackSelection);
				sliderTrack.appendChild(sliderTrackHigh);

				/* Create ticks */
				this.ticks = [];
				if (Array.isArray(this.options.ticks) && this.options.ticks.length > 0) {
					for (i = 0; i < this.options.ticks.length; i++) {
						var tick = document.createElement('div');
						tick.className = 'slider-tick';

						this.ticks.push(tick);
						sliderTrack.appendChild(tick);
					}

					sliderTrackSelection.className += " tick-slider-selection";
				}

				sliderTrack.appendChild(sliderMinHandle);
				sliderTrack.appendChild(sliderMaxHandle);

				this.tickLabels = [];
				if (Array.isArray(this.options.ticks_labels) && this.options.ticks_labels.length > 0) {
					this.tickLabelContainer = document.createElement('div');
					this.tickLabelContainer.className = 'slider-tick-label-container';

					for (i = 0; i < this.options.ticks_labels.length; i++) {
						var label = document.createElement('div');
						label.className = 'slider-tick-label';
						label.innerHTML = this.options.ticks_labels[i];

						this.tickLabels.push(label);
						this.tickLabelContainer.appendChild(label);
					}
				}


				var createAndAppendTooltipSubElements = function(tooltipElem) {
					var arrow = document.createElement("div");
					arrow.className = "tooltip-arrow";

					var inner = document.createElement("div");
					inner.className = "tooltip-inner";

					tooltipElem.appendChild(arrow);
					tooltipElem.appendChild(inner);

				};

				/* Create tooltip elements */
				var sliderTooltip = document.createElement("div");
				sliderTooltip.className = "tooltip tooltip-main";
				createAndAppendTooltipSubElements(sliderTooltip);

				var sliderTooltipMin = document.createElement("div");
				sliderTooltipMin.className = "tooltip tooltip-min";
				createAndAppendTooltipSubElements(sliderTooltipMin);

				var sliderTooltipMax = document.createElement("div");
				sliderTooltipMax.className = "tooltip tooltip-max";
				createAndAppendTooltipSubElements(sliderTooltipMax);


				/* Append components to sliderElem */
				this.sliderElem.appendChild(sliderTrack);
				this.sliderElem.appendChild(sliderTooltip);
				this.sliderElem.appendChild(sliderTooltipMin);
				this.sliderElem.appendChild(sliderTooltipMax);

				if (this.tickLabelContainer) {
					this.sliderElem.appendChild(this.tickLabelContainer);
				}

				/* Append slider element to parent container, right before the original <input> element */
				parent.insertBefore(this.sliderElem, this.element);

				/* Hide original <input> element */
				this.element.style.display = "none";
			}
			/* If JQuery exists, cache JQ references */
			if($) {
				this.$element = $(this.element);
				this.$sliderElem = $(this.sliderElem);
			}

			/*************************************************

								Setup

			**************************************************/
			this.eventToCallbackMap = {};
			this.sliderElem.id = this.options.id;

			this.touchCapable = 'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch);

			this.tooltip = this.sliderElem.querySelector('.tooltip-main');
			this.tooltipInner = this.tooltip.querySelector('.tooltip-inner');

			this.tooltip_min = this.sliderElem.querySelector('.tooltip-min');
			this.tooltipInner_min = this.tooltip_min.querySelector('.tooltip-inner');

			this.tooltip_max = this.sliderElem.querySelector('.tooltip-max');
			this.tooltipInner_max= this.tooltip_max.querySelector('.tooltip-inner');

			if (SliderScale[this.options.scale]) {
				this.options.scale = SliderScale[this.options.scale];
			}

			if (updateSlider === true) {
				// Reset classes
				this._removeClass(this.sliderElem, 'slider-horizontal');
				this._removeClass(this.sliderElem, 'slider-vertical');
				this._removeClass(this.tooltip, 'hide');
				this._removeClass(this.tooltip_min, 'hide');
				this._removeClass(this.tooltip_max, 'hide');

				// Undo existing inline styles for track
				["left", "top", "width", "height"].forEach(function(prop) {
					this._removeProperty(this.trackLow, prop);
					this._removeProperty(this.trackSelection, prop);
					this._removeProperty(this.trackHigh, prop);
				}, this);

				// Undo inline styles on handles
				[this.handle1, this.handle2].forEach(function(handle) {
					this._removeProperty(handle, 'left');
					this._removeProperty(handle, 'top');
				}, this);

				// Undo inline styles and classes on tooltips
				[this.tooltip, this.tooltip_min, this.tooltip_max].forEach(function(tooltip) {
					this._removeProperty(tooltip, 'left');
					this._removeProperty(tooltip, 'top');
					this._removeProperty(tooltip, 'margin-left');
					this._removeProperty(tooltip, 'margin-top');

					this._removeClass(tooltip, 'right');
					this._removeClass(tooltip, 'top');
				}, this);
			}

			if(this.options.orientation === 'vertical') {
				this._addClass(this.sliderElem,'slider-vertical');
				this.stylePos = 'top';
				this.mousePos = 'pageY';
				this.sizePos = 'offsetHeight';
			} else {
				this._addClass(this.sliderElem, 'slider-horizontal');
				this.sliderElem.style.width = origWidth;
				this.options.orientation = 'horizontal';
				this.stylePos = 'left';
				this.mousePos = 'pageX';
				this.sizePos = 'offsetWidth';

			}
			this._setTooltipPosition();
			/* In case ticks are specified, overwrite the min and max bounds */
			if (Array.isArray(this.options.ticks) && this.options.ticks.length > 0) {
					this.options.max = Math.max.apply(Math, this.options.ticks);
					this.options.min = Math.min.apply(Math, this.options.ticks);
			}

			if (Array.isArray(this.options.value)) {
				this.options.range = true;
				this._state.value = this.options.value;
			}
			else if (this.options.range) {
				// User wants a range, but value is not an array
				this._state.value = [this.options.value, this.options.max];
			}
			else {
				this._state.value = this.options.value;
			}

			this.trackLow = sliderTrackLow || this.trackLow;
			this.trackSelection = sliderTrackSelection || this.trackSelection;
			this.trackHigh = sliderTrackHigh || this.trackHigh;

			if (this.options.selection === 'none') {
				this._addClass(this.trackLow, 'hide');
				this._addClass(this.trackSelection, 'hide');
				this._addClass(this.trackHigh, 'hide');
			}

			this.handle1 = sliderMinHandle || this.handle1;
			this.handle2 = sliderMaxHandle || this.handle2;

			if (updateSlider === true) {
				// Reset classes
				this._removeClass(this.handle1, 'round triangle');
				this._removeClass(this.handle2, 'round triangle hide');

				for (i = 0; i < this.ticks.length; i++) {
					this._removeClass(this.ticks[i], 'round triangle hide');
				}
			}

			var availableHandleModifiers = ['round', 'triangle', 'custom'];
			var isValidHandleType = availableHandleModifiers.indexOf(this.options.handle) !== -1;
			if (isValidHandleType) {
				this._addClass(this.handle1, this.options.handle);
				this._addClass(this.handle2, this.options.handle);

				for (i = 0; i < this.ticks.length; i++) {
					this._addClass(this.ticks[i], this.options.handle);
				}
			}

			this._state.offset = this._offset(this.sliderElem);
			this._state.size = this.sliderElem[this.sizePos];
			this.setValue(this._state.value);

			/******************************************

						Bind Event Listeners

			******************************************/

			// Bind keyboard handlers
			this.handle1Keydown = this._keydown.bind(this, 0);
			this.handle1.addEventListener("keydown", this.handle1Keydown, false);

			this.handle2Keydown = this._keydown.bind(this, 1);
			this.handle2.addEventListener("keydown", this.handle2Keydown, false);

			this.mousedown = this._mousedown.bind(this);
			if (this.touchCapable) {
				// Bind touch handlers
				this.sliderElem.addEventListener("touchstart", this.mousedown, false);
			}
			this.sliderElem.addEventListener("mousedown", this.mousedown, false);


			// Bind tooltip-related handlers
			if(this.options.tooltip === 'hide') {
				this._addClass(this.tooltip, 'hide');
				this._addClass(this.tooltip_min, 'hide');
				this._addClass(this.tooltip_max, 'hide');
			}
			else if(this.options.tooltip === 'always') {
				this._showTooltip();
				this._alwaysShowTooltip = true;
			}
			else {
				this.showTooltip = this._showTooltip.bind(this);
				this.hideTooltip = this._hideTooltip.bind(this);

				this.sliderElem.addEventListener("mouseenter", this.showTooltip, false);
				this.sliderElem.addEventListener("mouseleave", this.hideTooltip, false);

				this.handle1.addEventListener("focus", this.showTooltip, false);
				this.handle1.addEventListener("blur", this.hideTooltip, false);

				this.handle2.addEventListener("focus", this.showTooltip, false);
				this.handle2.addEventListener("blur", this.hideTooltip, false);
			}

			if(this.options.enabled) {
				this.enable();
			} else {
				this.disable();
			}
		}



		/*************************************************

					INSTANCE PROPERTIES/METHODS

		- Any methods bound to the prototype are considered
		part of the plugin's `public` interface

		**************************************************/
		Slider.prototype = {
			_init: function() {}, // NOTE: Must exist to support bridget

			constructor: Slider,

			defaultOptions: {
				id: "",
			  min: 0,
				max: 10,
				step: 1,
				precision: 0,
				orientation: 'horizontal',
				value: 5,
				range: false,
				selection: 'before',
				tooltip: 'show',
				tooltip_split: false,
				handle: 'round',
				reversed: false,
				enabled: true,
				formatter: function(val) {
					if (Array.isArray(val)) {
						return val[0] + " : " + val[1];
					} else {
						return val;
					}
				},
				natural_arrow_keys: false,
				ticks: [],
				ticks_positions: [],
				ticks_labels: [],
				ticks_snap_bounds: 0,
				scale: 'linear',
				focus: false,
				tooltip_position: null
			},

			getElement: function() {
				return this.sliderElem;
			},

			getValue: function() {
				if (this.options.range) {
					return this._state.value;
				}
				else {
					return this._state.value[0];
				}
			},

			setValue: function(val, triggerSlideEvent, triggerChangeEvent) {
				if (!val) {
					val = 0;
				}
				var oldValue = this.getValue();
				this._state.value = this._validateInputValue(val);
				var applyPrecision = this._applyPrecision.bind(this);

				if (this.options.range) {
					this._state.value[0] = applyPrecision(this._state.value[0]);
					this._state.value[1] = applyPrecision(this._state.value[1]);

					this._state.value[0] = Math.max(this.options.min, Math.min(this.options.max, this._state.value[0]));
					this._state.value[1] = Math.max(this.options.min, Math.min(this.options.max, this._state.value[1]));
				}
				else {
					this._state.value = applyPrecision(this._state.value);
					this._state.value = [ Math.max(this.options.min, Math.min(this.options.max, this._state.value))];
					this._addClass(this.handle2, 'hide');
					if (this.options.selection === 'after') {
						this._state.value[1] = this.options.max;
					} else {
						this._state.value[1] = this.options.min;
					}
				}

				if (this.options.max > this.options.min) {
					this._state.percentage = [
						this._toPercentage(this._state.value[0]),
						this._toPercentage(this._state.value[1]),
						this.options.step * 100 / (this.options.max - this.options.min)
					];
				} else {
					this._state.percentage = [0, 0, 100];
				}

				this._layout();
				var newValue = this.options.range ? this._state.value : this._state.value[0];

				if(triggerSlideEvent === true) {
					this._trigger('slide', newValue);
				}
				if( (oldValue !== newValue) && (triggerChangeEvent === true) ) {
					this._trigger('change', {
						oldValue: oldValue,
						newValue: newValue
					});
				}
				this._setDataVal(newValue);

				return this;
			},

			destroy: function(){
				// Remove event handlers on slider elements
				this._removeSliderEventHandlers();

				// Remove the slider from the DOM
				this.sliderElem.parentNode.removeChild(this.sliderElem);
				/* Show original <input> element */
				this.element.style.display = "";

				// Clear out custom event bindings
				this._cleanUpEventCallbacksMap();

				// Remove data values
				this.element.removeAttribute("data");

				// Remove JQuery handlers/data
				if($) {
					this._unbindJQueryEventHandlers();
					this.$element.removeData('slider');
				}
			},

			disable: function() {
				this._state.enabled = false;
				this.handle1.removeAttribute("tabindex");
				this.handle2.removeAttribute("tabindex");
				this._addClass(this.sliderElem, 'slider-disabled');
				this._trigger('slideDisabled');

				return this;
			},

			enable: function() {
				this._state.enabled = true;
				this.handle1.setAttribute("tabindex", 0);
				this.handle2.setAttribute("tabindex", 0);
				this._removeClass(this.sliderElem, 'slider-disabled');
				this._trigger('slideEnabled');

				return this;
			},

			toggle: function() {
				if(this._state.enabled) {
					this.disable();
				} else {
					this.enable();
				}
				return this;
			},

			isEnabled: function() {
				return this._state.enabled;
			},

			on: function(evt, callback) {
				this._bindNonQueryEventHandler(evt, callback);
				return this;
			},

            off: function(evt, callback) {
                if($) {
                    this.$element.off(evt, callback);
                    this.$sliderElem.off(evt, callback);
                } else {
                    this._unbindNonQueryEventHandler(evt, callback);
                }
            },

			getAttribute: function(attribute) {
				if(attribute) {
					return this.options[attribute];
				} else {
					return this.options;
				}
			},

			setAttribute: function(attribute, value) {
				this.options[attribute] = value;
				return this;
			},

			refresh: function() {
				this._removeSliderEventHandlers();
				createNewSlider.call(this, this.element, this.options);
				if($) {
					// Bind new instance of slider to the element
					$.data(this.element, 'slider', this);
				}
				return this;
			},

			relayout: function() {
				this._layout();
				return this;
			},

			/******************************+

						HELPERS

			- Any method that is not part of the public interface.
			- Place it underneath this comment block and write its signature like so:

			  					_fnName : function() {...}

			********************************/
			_removeSliderEventHandlers: function() {
				// Remove event listeners from handle1
				this.handle1.removeEventListener("keydown", this.handle1Keydown, false);
				this.handle1.removeEventListener("focus", this.showTooltip, false);
				this.handle1.removeEventListener("blur", this.hideTooltip, false);

				// Remove event listeners from handle2
				this.handle2.removeEventListener("keydown", this.handle2Keydown, false);
				this.handle2.removeEventListener("focus", this.handle2Keydown, false);
				this.handle2.removeEventListener("blur", this.handle2Keydown, false);

				// Remove event listeners from sliderElem
				this.sliderElem.removeEventListener("mouseenter", this.showTooltip, false);
				this.sliderElem.removeEventListener("mouseleave", this.hideTooltip, false);
				this.sliderElem.removeEventListener("touchstart", this.mousedown, false);
				this.sliderElem.removeEventListener("mousedown", this.mousedown, false);
			},
			_bindNonQueryEventHandler: function(evt, callback) {
				if(this.eventToCallbackMap[evt] === undefined) {
					this.eventToCallbackMap[evt] = [];
				}
				this.eventToCallbackMap[evt].push(callback);
			},
            _unbindNonQueryEventHandler: function(evt, callback) {
                var callbacks = this.eventToCallbackMap[evt];
                if(callbacks !== undefined) {
                    for (var i = 0; i < callbacks.length; i++) {
                        if (callbacks[i] === callback) {
                            callbacks.splice(i, 1);
                            break;
                        }
                    }
                }
            },
			_cleanUpEventCallbacksMap: function() {
				var eventNames = Object.keys(this.eventToCallbackMap);
				for(var i = 0; i < eventNames.length; i++) {
					var eventName = eventNames[i];
					this.eventToCallbackMap[eventName] = null;
				}
			},
			_showTooltip: function() {
				if (this.options.tooltip_split === false ){
        	this._addClass(this.tooltip, 'in');
        	this.tooltip_min.style.display = 'none';
        	this.tooltip_max.style.display = 'none';
		    } else {
          this._addClass(this.tooltip_min, 'in');
          this._addClass(this.tooltip_max, 'in');
          this.tooltip.style.display = 'none';
		    }
				this._state.over = true;
			},
			_hideTooltip: function() {
				if (this._state.inDrag === false && this.alwaysShowTooltip !== true) {
					this._removeClass(this.tooltip, 'in');
					this._removeClass(this.tooltip_min, 'in');
					this._removeClass(this.tooltip_max, 'in');
				}
				this._state.over = false;
			},
			_layout: function() {
				var positionPercentages;

				if(this.options.reversed) {
					positionPercentages = [ 100 - this._state.percentage[0], this.options.range ? 100 - this._state.percentage[1] : this._state.percentage[1]];
				}
				else {
					positionPercentages = [ this._state.percentage[0], this._state.percentage[1] ];
				}

				this.handle1.style[this.stylePos] = positionPercentages[0]+'%';
				this.handle2.style[this.stylePos] = positionPercentages[1]+'%';

				/* Position ticks and labels */
				if (Array.isArray(this.options.ticks) && this.options.ticks.length > 0) {
					var maxTickValue = Math.max.apply(Math, this.options.ticks);
					var minTickValue = Math.min.apply(Math, this.options.ticks);

					var styleSize = this.options.orientation === 'vertical' ? 'height' : 'width';
					var styleMargin = this.options.orientation === 'vertical' ? 'marginTop' : 'marginLeft';
					var labelSize = this._state.size / (this.options.ticks.length - 1);

					if (this.tickLabelContainer) {
						var extraMargin = 0;
						if (this.options.ticks_positions.length === 0) {
							this.tickLabelContainer.style[styleMargin] = -labelSize/2 + 'px';
							extraMargin = this.tickLabelContainer.offsetHeight;
						} else {
							/* Chidren are position absolute, calculate height by finding the max offsetHeight of a child */
							for (i = 0 ; i < this.tickLabelContainer.childNodes.length; i++) {
								if (this.tickLabelContainer.childNodes[i].offsetHeight > extraMargin) {
									extraMargin = this.tickLabelContainer.childNodes[i].offsetHeight;
								}
							}
						}
						if (this.options.orientation === 'horizontal') {
							this.sliderElem.style.marginBottom = extraMargin + 'px';
						}
					}
					for (var i = 0; i < this.options.ticks.length; i++) {

						var percentage = this.options.ticks_positions[i] ||
							100 * (this.options.ticks[i] - minTickValue) / (maxTickValue - minTickValue);

						this.ticks[i].style[this.stylePos] = percentage + '%';

						/* Set class labels to denote whether ticks are in the selection */
						this._removeClass(this.ticks[i], 'in-selection');
						if (!this.options.range) {
							if (this.options.selection === 'after' && percentage >= positionPercentages[0]){
								this._addClass(this.ticks[i], 'in-selection');
							} else if (this.options.selection === 'before' && percentage <= positionPercentages[0]) {
								this._addClass(this.ticks[i], 'in-selection');
							}
						} else if (percentage >= positionPercentages[0] && percentage <= positionPercentages[1]) {
							this._addClass(this.ticks[i], 'in-selection');
						}

						if (this.tickLabels[i]) {
							this.tickLabels[i].style[styleSize] = labelSize + 'px';

							if (this.options.ticks_positions[i] !== undefined) {
								this.tickLabels[i].style.position = 'absolute';
								this.tickLabels[i].style[this.stylePos] = this.options.ticks_positions[i] + '%';
								this.tickLabels[i].style[styleMargin] = -labelSize/2 + 'px';
							}
						}
					}
				}

				if (this.options.orientation === 'vertical') {
					this.trackLow.style.top = '0';
					this.trackLow.style.height = Math.min(positionPercentages[0], positionPercentages[1]) +'%';

					this.trackSelection.style.top = Math.min(positionPercentages[0], positionPercentages[1]) +'%';
					this.trackSelection.style.height = Math.abs(positionPercentages[0] - positionPercentages[1]) +'%';

					this.trackHigh.style.bottom = '0';
					this.trackHigh.style.height = (100 - Math.min(positionPercentages[0], positionPercentages[1]) - Math.abs(positionPercentages[0] - positionPercentages[1])) +'%';
				}
				else {
					this.trackLow.style.left = '0';
					this.trackLow.style.width = Math.min(positionPercentages[0], positionPercentages[1]) +'%';

					this.trackSelection.style.left = Math.min(positionPercentages[0], positionPercentages[1]) +'%';
					this.trackSelection.style.width = Math.abs(positionPercentages[0] - positionPercentages[1]) +'%';

					this.trackHigh.style.right = '0';
					this.trackHigh.style.width = (100 - Math.min(positionPercentages[0], positionPercentages[1]) - Math.abs(positionPercentages[0] - positionPercentages[1])) +'%';

			        var offset_min = this.tooltip_min.getBoundingClientRect();
			        var offset_max = this.tooltip_max.getBoundingClientRect();

			        if (offset_min.right > offset_max.left) {
			            this._removeClass(this.tooltip_max, 'top');
			            this._addClass(this.tooltip_max, 'bottom');
			            this.tooltip_max.style.top = 18 + 'px';
			        } else {
			            this._removeClass(this.tooltip_max, 'bottom');
			            this._addClass(this.tooltip_max, 'top');
			            this.tooltip_max.style.top = this.tooltip_min.style.top;
			        }
				}

				var formattedTooltipVal;

				if (this.options.range) {
					formattedTooltipVal = this.options.formatter(this._state.value);
					this._setText(this.tooltipInner, formattedTooltipVal);
					this.tooltip.style[this.stylePos] = (positionPercentages[1] + positionPercentages[0])/2 + '%';

					if (this.options.orientation === 'vertical') {
						this._css(this.tooltip, 'margin-top', -this.tooltip.offsetHeight / 2 + 'px');
					} else {
						this._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
					}

					if (this.options.orientation === 'vertical') {
						this._css(this.tooltip, 'margin-top', -this.tooltip.offsetHeight / 2 + 'px');
					} else {
						this._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
					}

					var innerTooltipMinText = this.options.formatter(this._state.value[0]);
					this._setText(this.tooltipInner_min, innerTooltipMinText);

					var innerTooltipMaxText = this.options.formatter(this._state.value[1]);
					this._setText(this.tooltipInner_max, innerTooltipMaxText);

					this.tooltip_min.style[this.stylePos] = positionPercentages[0] + '%';

					if (this.options.orientation === 'vertical') {
						this._css(this.tooltip_min, 'margin-top', -this.tooltip_min.offsetHeight / 2 + 'px');
					} else {
						this._css(this.tooltip_min, 'margin-left', -this.tooltip_min.offsetWidth / 2 + 'px');
					}

					this.tooltip_max.style[this.stylePos] = positionPercentages[1] + '%';

					if (this.options.orientation === 'vertical') {
						this._css(this.tooltip_max, 'margin-top', -this.tooltip_max.offsetHeight / 2 + 'px');
					} else {
						this._css(this.tooltip_max, 'margin-left', -this.tooltip_max.offsetWidth / 2 + 'px');
					}
				} else {
					formattedTooltipVal = this.options.formatter(this._state.value[0]);
					this._setText(this.tooltipInner, formattedTooltipVal);

					this.tooltip.style[this.stylePos] = positionPercentages[0] + '%';
					if (this.options.orientation === 'vertical') {
						this._css(this.tooltip, 'margin-top', -this.tooltip.offsetHeight / 2 + 'px');
					} else {
						this._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
					}
				}
			},
			_removeProperty: function(element, prop) {
				if (element.style.removeProperty) {
				    element.style.removeProperty(prop);
				} else {
				    element.style.removeAttribute(prop);
				}
			},
			_mousedown: function(ev) {
				if(!this._state.enabled) {
					return false;
				}

				this._state.offset = this._offset(this.sliderElem);
				this._state.size = this.sliderElem[this.sizePos];

				var percentage = this._getPercentage(ev);

				if (this.options.range) {
					var diff1 = Math.abs(this._state.percentage[0] - percentage);
					var diff2 = Math.abs(this._state.percentage[1] - percentage);
					this._state.dragged = (diff1 < diff2) ? 0 : 1;
				} else {
					this._state.dragged = 0;
				}

				this._state.percentage[this._state.dragged] = percentage;
				this._layout();

				if (this.touchCapable) {
					document.removeEventListener("touchmove", this.mousemove, false);
					document.removeEventListener("touchend", this.mouseup, false);
				}

				if(this.mousemove){
					document.removeEventListener("mousemove", this.mousemove, false);
				}
				if(this.mouseup){
					document.removeEventListener("mouseup", this.mouseup, false);
				}

				this.mousemove = this._mousemove.bind(this);
				this.mouseup = this._mouseup.bind(this);

				if (this.touchCapable) {
					// Touch: Bind touch events:
					document.addEventListener("touchmove", this.mousemove, false);
					document.addEventListener("touchend", this.mouseup, false);
				}
				// Bind mouse events:
				document.addEventListener("mousemove", this.mousemove, false);
				document.addEventListener("mouseup", this.mouseup, false);

				this._state.inDrag = true;
				var newValue = this._calculateValue();

				this._trigger('slideStart', newValue);

				this._setDataVal(newValue);
				this.setValue(newValue, false, true);

				this._pauseEvent(ev);

				if (this.options.focus) {
					this._triggerFocusOnHandle(this._state.dragged);
				}

				return true;
			},
			_triggerFocusOnHandle: function(handleIdx) {
				if(handleIdx === 0) {
					this.handle1.focus();
				}
				if(handleIdx === 1) {
					this.handle2.focus();
				}
			},
			_keydown: function(handleIdx, ev) {
				if(!this._state.enabled) {
					return false;
				}

				var dir;
				switch (ev.keyCode) {
					case 37: // left
					case 40: // down
						dir = -1;
						break;
					case 39: // right
					case 38: // up
						dir = 1;
						break;
				}
				if (!dir) {
					return;
				}

				// use natural arrow keys instead of from min to max
				if (this.options.natural_arrow_keys) {
					var ifVerticalAndNotReversed = (this.options.orientation === 'vertical' && !this.options.reversed);
					var ifHorizontalAndReversed = (this.options.orientation === 'horizontal' && this.options.reversed);

					if (ifVerticalAndNotReversed || ifHorizontalAndReversed) {
						dir = -dir;
					}
				}

				var val = this._state.value[handleIdx] + dir * this.options.step;
				if (this.options.range) {
					val = [ (!handleIdx) ? val : this._state.value[0],
						    ( handleIdx) ? val : this._state.value[1]];
				}

				this._trigger('slideStart', val);
				this._setDataVal(val);
				this.setValue(val, true, true);

				this._setDataVal(val);
				this._trigger('slideStop', val);
				this._layout();

				this._pauseEvent(ev);

				return false;
			},
			_pauseEvent: function(ev) {
				if(ev.stopPropagation) {
					ev.stopPropagation();
				}
			    if(ev.preventDefault) {
			    	ev.preventDefault();
			    }
			    ev.cancelBubble=true;
			    ev.returnValue=false;
			},
			_mousemove: function(ev) {
				if(!this._state.enabled) {
					return false;
				}

				var percentage = this._getPercentage(ev);
				this._adjustPercentageForRangeSliders(percentage);
				this._state.percentage[this._state.dragged] = percentage;
				this._layout();

				var val = this._calculateValue(true);
				this.setValue(val, true, true);

				return false;
			},
			_adjustPercentageForRangeSliders: function(percentage) {
				if (this.options.range) {
					var precision = this._getNumDigitsAfterDecimalPlace(percentage);
					precision = precision ? precision - 1 : 0;
					var percentageWithAdjustedPrecision = this._applyToFixedAndParseFloat(percentage, precision);
					if (this._state.dragged === 0 && this._applyToFixedAndParseFloat(this._state.percentage[1], precision) < percentageWithAdjustedPrecision) {
						this._state.percentage[0] = this._state.percentage[1];
						this._state.dragged = 1;
					} else if (this._state.dragged === 1 && this._applyToFixedAndParseFloat(this._state.percentage[0], precision) > percentageWithAdjustedPrecision) {
						this._state.percentage[1] = this._state.percentage[0];
						this._state.dragged = 0;
					}
				}
			},
			_mouseup: function() {
				if(!this._state.enabled) {
					return false;
				}
				if (this.touchCapable) {
					// Touch: Unbind touch event handlers:
					document.removeEventListener("touchmove", this.mousemove, false);
					document.removeEventListener("touchend", this.mouseup, false);
				}
                // Unbind mouse event handlers:
                document.removeEventListener("mousemove", this.mousemove, false);
                document.removeEventListener("mouseup", this.mouseup, false);

				this._state.inDrag = false;
				if (this._state.over === false) {
					this._hideTooltip();
				}
				var val = this._calculateValue(true);

				this._layout();
				this._setDataVal(val);
				this._trigger('slideStop', val);

				return false;
			},
			_calculateValue: function(snapToClosestTick) {
				var val;
				if (this.options.range) {
					val = [this.options.min,this.options.max];
			        if (this._state.percentage[0] !== 0){
			            val[0] = this._toValue(this._state.percentage[0]);
			            val[0] = this._applyPrecision(val[0]);
			        }
			        if (this._state.percentage[1] !== 100){
			            val[1] = this._toValue(this._state.percentage[1]);
			            val[1] = this._applyPrecision(val[1]);
			        }
				} else {
		            val = this._toValue(this._state.percentage[0]);
					val = parseFloat(val);
					val = this._applyPrecision(val);
				}

				if (snapToClosestTick) {
					var min = [val, Infinity];
					for (var i = 0; i < this.options.ticks.length; i++) {
						var diff = Math.abs(this.options.ticks[i] - val);
						if (diff <= min[1]) {
							min = [this.options.ticks[i], diff];
						}
					}
					if (min[1] <= this.options.ticks_snap_bounds) {
						return min[0];
					}
				}

				return val;
			},
			_applyPrecision: function(val) {
				var precision = this.options.precision || this._getNumDigitsAfterDecimalPlace(this.options.step);
				return this._applyToFixedAndParseFloat(val, precision);
			},
			_getNumDigitsAfterDecimalPlace: function(num) {
				var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
				if (!match) { return 0; }
				return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
			},
			_applyToFixedAndParseFloat: function(num, toFixedInput) {
				var truncatedNum = num.toFixed(toFixedInput);
				return parseFloat(truncatedNum);
			},
			/*
				Credits to Mike Samuel for the following method!
				Source: http://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
			*/
			_getPercentage: function(ev) {
				if (this.touchCapable && (ev.type === 'touchstart' || ev.type === 'touchmove')) {
					ev = ev.touches[0];
				}

				var eventPosition = ev[this.mousePos];
				var sliderOffset = this._state.offset[this.stylePos];
				var distanceToSlide = eventPosition - sliderOffset;
				// Calculate what percent of the length the slider handle has slid
				var percentage = (distanceToSlide / this._state.size) * 100;
				percentage = Math.round(percentage / this._state.percentage[2]) * this._state.percentage[2];
				if (this.options.reversed) {
					percentage = 100 - percentage;
				}

				// Make sure the percent is within the bounds of the slider.
				// 0% corresponds to the 'min' value of the slide
				// 100% corresponds to the 'max' value of the slide
				return Math.max(0, Math.min(100, percentage));
			},
			_validateInputValue: function(val) {
				if (typeof val === 'number') {
					return val;
				} else if (Array.isArray(val)) {
					this._validateArray(val);
					return val;
				} else {
					throw new Error( ErrorMsgs.formatInvalidInputErrorMsg(val) );
				}
			},
			_validateArray: function(val) {
				for(var i = 0; i < val.length; i++) {
					var input =  val[i];
					if (typeof input !== 'number') { throw new Error( ErrorMsgs.formatInvalidInputErrorMsg(input) ); }
				}
			},
			_setDataVal: function(val) {
				var value = "value: '" + val + "'";
				this.element.setAttribute('data', value);
				this.element.setAttribute('value', val);
        this.element.value = val;
			},
			_trigger: function(evt, val) {
				val = (val || val === 0) ? val : undefined;

				var callbackFnArray = this.eventToCallbackMap[evt];
				if(callbackFnArray && callbackFnArray.length) {
					for(var i = 0; i < callbackFnArray.length; i++) {
						var callbackFn = callbackFnArray[i];
						callbackFn(val);
					}
				}

				/* If JQuery exists, trigger JQuery events */
				if($) {
					this._triggerJQueryEvent(evt, val);
				}
			},
			_triggerJQueryEvent: function(evt, val) {
				var eventData = {
					type: evt,
					value: val
				};
				this.$element.trigger(eventData);
				this.$sliderElem.trigger(eventData);
			},
			_unbindJQueryEventHandlers: function() {
				this.$element.off();
				this.$sliderElem.off();
			},
			_setText: function(element, text) {
				if(typeof element.innerText !== "undefined") {
			 		element.innerText = text;
			 	} else if(typeof element.textContent !== "undefined") {
			 		element.textContent = text;
			 	}
			},
			_removeClass: function(element, classString) {
				var classes = classString.split(" ");
				var newClasses = element.className;

				for(var i = 0; i < classes.length; i++) {
					var classTag = classes[i];
					var regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)");
					newClasses = newClasses.replace(regex, " ");
				}

				element.className = newClasses.trim();
			},
			_addClass: function(element, classString) {
				var classes = classString.split(" ");
				var newClasses = element.className;

				for(var i = 0; i < classes.length; i++) {
					var classTag = classes[i];
					var regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)");
					var ifClassExists = regex.test(newClasses);

					if(!ifClassExists) {
						newClasses += " " + classTag;
					}
				}

				element.className = newClasses.trim();
			},
			_offsetLeft: function(obj){
				return obj.getBoundingClientRect().left;
			},
			_offsetTop: function(obj){
				var offsetTop = obj.offsetTop;
				while((obj = obj.offsetParent) && !isNaN(obj.offsetTop)){
					offsetTop += obj.offsetTop;
				}
				return offsetTop;
			},
		    _offset: function (obj) {
				return {
					left: this._offsetLeft(obj),
					top: this._offsetTop(obj)
				};
		    },
			_css: function(elementRef, styleName, value) {
                if ($) {
                    $.style(elementRef, styleName, value);
                } else {
                    var style = styleName.replace(/^-ms-/, "ms-").replace(/-([\da-z])/gi, function (all, letter) {
                        return letter.toUpperCase();
                    });
                    elementRef.style[style] = value;
                }
			},
			_toValue: function(percentage) {
				return this.options.scale.toValue.apply(this, [percentage]);
			},
			_toPercentage: function(value) {
				return this.options.scale.toPercentage.apply(this, [value]);
			},
			_setTooltipPosition: function(){
				var tooltips = [this.tooltip, this.tooltip_min, this.tooltip_max];
				if (this.options.orientation === 'vertical'){
					var tooltipPos = this.options.tooltip_position || 'right';
					var oppositeSide = (tooltipPos === 'left') ? 'right' : 'left';
					tooltips.forEach(function(tooltip){
						this._addClass(tooltip, tooltipPos);
						tooltip.style[oppositeSide] = '100%';
					}.bind(this));
				} else if(this.options.tooltip_position === 'bottom') {
					tooltips.forEach(function(tooltip){
						this._addClass(tooltip, 'bottom');
						tooltip.style.top = 22 + 'px';
					}.bind(this));
				} else {
					tooltips.forEach(function(tooltip){
						this._addClass(tooltip, 'top');
						tooltip.style.top = -this.tooltip.outerHeight - 14 + 'px';
					}.bind(this));
				}
			}
		};

		/*********************************

			Attach to global namespace

		*********************************/
		if($) {
			var namespace = $.fn.slider ? 'bootstrapSlider' : 'slider';
			$.bridget(namespace, Slider);
		}

	})( $ );

	return Slider;
}));

},{"jquery":undefined}],2:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var div = document.createElement('div');
// Setup
div.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
// Make sure that link elements get serialized correctly by innerHTML
// This requires a wrapper element in IE
var innerHTMLBug = !div.getElementsByTagName('link').length;
div = undefined;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

},{}],3:[function(require,module,exports){
/*
	Leaflet.draw, a plugin that adds drawing and editing tools to Leaflet powered maps.
	(c) 2012-2013, Jacob Toye, Smartrak

	https://github.com/Leaflet/Leaflet.draw
	http://leafletjs.com
	https://github.com/jacobtoye
*/
!function(t,e){L.drawVersion="0.2.4-dev",L.drawLocal={draw:{toolbar:{actions:{title:"Cancel drawing",text:"Cancel"},undo:{title:"Delete last point drawn",text:"Delete last point"},buttons:{polyline:"Draw a polyline",polygon:"Draw a polygon",rectangle:"Draw a rectangle",circle:"Draw a circle",marker:"Draw a marker"}},handlers:{circle:{tooltip:{start:"Click and drag to draw circle."}},marker:{tooltip:{start:"Click map to place marker."}},polygon:{tooltip:{start:"Click to start drawing shape.",cont:"Click to continue drawing shape.",end:"Click first point to close this shape."}},polyline:{error:"<strong>Error:</strong> shape edges cannot cross!",tooltip:{start:"Click to start drawing line.",cont:"Click to continue drawing line.",end:"Click last point to finish line."}},rectangle:{tooltip:{start:"Click and drag to draw rectangle."}},simpleshape:{tooltip:{end:"Release mouse to finish drawing."}}}},edit:{toolbar:{actions:{save:{title:"Save changes.",text:"Save"},cancel:{title:"Cancel editing, discards all changes.",text:"Cancel"}},buttons:{edit:"Edit layers.",editDisabled:"No layers to edit.",remove:"Delete layers.",removeDisabled:"No layers to delete."}},handlers:{edit:{tooltip:{text:"Drag handles, or marker to edit feature.",subtext:"Click cancel to undo changes."}},remove:{tooltip:{text:"Click on a feature to remove"}}}}},L.Draw={},L.Draw.Feature=L.Handler.extend({includes:L.Mixin.Events,initialize:function(t,e){this._map=t,this._container=t._container,this._overlayPane=t._panes.overlayPane,this._popupPane=t._panes.popupPane,e&&e.shapeOptions&&(e.shapeOptions=L.Util.extend({},this.options.shapeOptions,e.shapeOptions)),L.setOptions(this,e)},enable:function(){this._enabled||(this.fire("enabled",{handler:this.type}),this._map.fire("draw:drawstart",{layerType:this.type}),L.Handler.prototype.enable.call(this))},disable:function(){this._enabled&&(L.Handler.prototype.disable.call(this),this._map.fire("draw:drawstop",{layerType:this.type}),this.fire("disabled",{handler:this.type}))},addHooks:function(){var t=this._map;t&&(L.DomUtil.disableTextSelection(),t.getContainer().focus(),this._tooltip=new L.Tooltip(this._map),L.DomEvent.on(this._container,"keyup",this._cancelDrawing,this))},removeHooks:function(){this._map&&(L.DomUtil.enableTextSelection(),this._tooltip.dispose(),this._tooltip=null,L.DomEvent.off(this._container,"keyup",this._cancelDrawing,this))},setOptions:function(t){L.setOptions(this,t)},_fireCreatedEvent:function(t){this._map.fire("draw:created",{layer:t,layerType:this.type})},_cancelDrawing:function(t){27===t.keyCode&&this.disable()}}),L.Draw.Polyline=L.Draw.Feature.extend({statics:{TYPE:"polyline"},Poly:L.Polyline,options:{allowIntersection:!0,repeatMode:!1,drawError:{color:"#b00b00",timeout:2500},icon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon"}),guidelineDistance:20,maxGuideLineLength:4e3,shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!1,clickable:!0},metric:!0,showLength:!0,zIndexOffset:2e3},initialize:function(t,e){this.options.drawError.message=L.drawLocal.draw.handlers.polyline.error,e&&e.drawError&&(e.drawError=L.Util.extend({},this.options.drawError,e.drawError)),this.type=L.Draw.Polyline.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._markers=[],this._markerGroup=new L.LayerGroup,this._map.addLayer(this._markerGroup),this._poly=new L.Polyline([],this.options.shapeOptions),this._tooltip.updateContent(this._getTooltipText()),this._mouseMarker||(this._mouseMarker=L.marker(this._map.getCenter(),{icon:L.divIcon({className:"leaflet-mouse-marker",iconAnchor:[20,20],iconSize:[40,40]}),opacity:0,zIndexOffset:this.options.zIndexOffset})),this._mouseMarker.on("mousedown",this._onMouseDown,this).addTo(this._map),this._map.on("mousemove",this._onMouseMove,this).on("mouseup",this._onMouseUp,this).on("zoomend",this._onZoomEnd,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._clearHideErrorTimeout(),this._cleanUpShape(),this._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers,this._map.removeLayer(this._poly),delete this._poly,this._mouseMarker.off("mousedown",this._onMouseDown,this).off("mouseup",this._onMouseUp,this),this._map.removeLayer(this._mouseMarker),delete this._mouseMarker,this._clearGuides(),this._map.off("mousemove",this._onMouseMove,this).off("zoomend",this._onZoomEnd,this)},deleteLastVertex:function(){if(!(this._markers.length<=1)){var t=this._markers.pop(),e=this._poly,i=this._poly.spliceLatLngs(e.getLatLngs().length-1,1)[0];this._markerGroup.removeLayer(t),e.getLatLngs().length<2&&this._map.removeLayer(e),this._vertexChanged(i,!1)}},addVertex:function(t){var e=this._markers.length;return e>0&&!this.options.allowIntersection&&this._poly.newLatLngIntersects(t)?(this._showErrorTooltip(),void 0):(this._errorShown&&this._hideErrorTooltip(),this._markers.push(this._createMarker(t)),this._poly.addLatLng(t),2===this._poly.getLatLngs().length&&this._map.addLayer(this._poly),this._vertexChanged(t,!0),void 0)},_finishShape:function(){var t=this._poly.newLatLngIntersects(this._poly.getLatLngs()[0],!0);return!this.options.allowIntersection&&t||!this._shapeIsValid()?(this._showErrorTooltip(),void 0):(this._fireCreatedEvent(),this.disable(),this.options.repeatMode&&this.enable(),void 0)},_shapeIsValid:function(){return!0},_onZoomEnd:function(){this._updateGuide()},_onMouseMove:function(t){var e=t.layerPoint,i=t.latlng;this._currentLatLng=i,this._updateTooltip(i),this._updateGuide(e),this._mouseMarker.setLatLng(i),L.DomEvent.preventDefault(t.originalEvent)},_vertexChanged:function(t,e){this._updateFinishHandler(),this._updateRunningMeasure(t,e),this._clearGuides(),this._updateTooltip()},_onMouseDown:function(t){var e=t.originalEvent;this._mouseDownOrigin=L.point(e.clientX,e.clientY)},_onMouseUp:function(e){if(this._mouseDownOrigin){var i=L.point(e.originalEvent.clientX,e.originalEvent.clientY).distanceTo(this._mouseDownOrigin);Math.abs(i)<9*(t.devicePixelRatio||1)&&this.addVertex(e.latlng)}this._mouseDownOrigin=null},_updateFinishHandler:function(){var t=this._markers.length;t>1&&this._markers[t-1].on("click",this._finishShape,this),t>2&&this._markers[t-2].off("click",this._finishShape,this)},_createMarker:function(t){var e=new L.Marker(t,{icon:this.options.icon,zIndexOffset:2*this.options.zIndexOffset});return this._markerGroup.addLayer(e),e},_updateGuide:function(t){var e=this._markers.length;e>0&&(t=t||this._map.latLngToLayerPoint(this._currentLatLng),this._clearGuides(),this._drawGuide(this._map.latLngToLayerPoint(this._markers[e-1].getLatLng()),t))},_updateTooltip:function(t){var e=this._getTooltipText();t&&this._tooltip.updatePosition(t),this._errorShown||this._tooltip.updateContent(e)},_drawGuide:function(t,e){var i,o,a,s=Math.floor(Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))),r=this.options.guidelineDistance,n=this.options.maxGuideLineLength,l=s>n?s-n:r;for(this._guidesContainer||(this._guidesContainer=L.DomUtil.create("div","leaflet-draw-guides",this._overlayPane));s>l;l+=this.options.guidelineDistance)i=l/s,o={x:Math.floor(t.x*(1-i)+i*e.x),y:Math.floor(t.y*(1-i)+i*e.y)},a=L.DomUtil.create("div","leaflet-draw-guide-dash",this._guidesContainer),a.style.backgroundColor=this._errorShown?this.options.drawError.color:this.options.shapeOptions.color,L.DomUtil.setPosition(a,o)},_updateGuideColor:function(t){if(this._guidesContainer)for(var e=0,i=this._guidesContainer.childNodes.length;i>e;e++)this._guidesContainer.childNodes[e].style.backgroundColor=t},_clearGuides:function(){if(this._guidesContainer)for(;this._guidesContainer.firstChild;)this._guidesContainer.removeChild(this._guidesContainer.firstChild)},_getTooltipText:function(){var t,e,i=this.options.showLength;return 0===this._markers.length?t={text:L.drawLocal.draw.handlers.polyline.tooltip.start}:(e=i?this._getMeasurementString():"",t=1===this._markers.length?{text:L.drawLocal.draw.handlers.polyline.tooltip.cont,subtext:e}:{text:L.drawLocal.draw.handlers.polyline.tooltip.end,subtext:e}),t},_updateRunningMeasure:function(t,e){var i,o,a=this._markers.length;1===this._markers.length?this._measurementRunningTotal=0:(i=a-(e?2:1),o=t.distanceTo(this._markers[i].getLatLng()),this._measurementRunningTotal+=o*(e?1:-1))},_getMeasurementString:function(){var t,e=this._currentLatLng,i=this._markers[this._markers.length-1].getLatLng();return t=this._measurementRunningTotal+e.distanceTo(i),L.GeometryUtil.readableDistance(t,this.options.metric)},_showErrorTooltip:function(){this._errorShown=!0,this._tooltip.showAsError().updateContent({text:this.options.drawError.message}),this._updateGuideColor(this.options.drawError.color),this._poly.setStyle({color:this.options.drawError.color}),this._clearHideErrorTimeout(),this._hideErrorTimeout=setTimeout(L.Util.bind(this._hideErrorTooltip,this),this.options.drawError.timeout)},_hideErrorTooltip:function(){this._errorShown=!1,this._clearHideErrorTimeout(),this._tooltip.removeError().updateContent(this._getTooltipText()),this._updateGuideColor(this.options.shapeOptions.color),this._poly.setStyle({color:this.options.shapeOptions.color})},_clearHideErrorTimeout:function(){this._hideErrorTimeout&&(clearTimeout(this._hideErrorTimeout),this._hideErrorTimeout=null)},_cleanUpShape:function(){this._markers.length>1&&this._markers[this._markers.length-1].off("click",this._finishShape,this)},_fireCreatedEvent:function(){var t=new this.Poly(this._poly.getLatLngs(),this.options.shapeOptions);L.Draw.Feature.prototype._fireCreatedEvent.call(this,t)}}),L.Draw.Polygon=L.Draw.Polyline.extend({statics:{TYPE:"polygon"},Poly:L.Polygon,options:{showArea:!1,shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){L.Draw.Polyline.prototype.initialize.call(this,t,e),this.type=L.Draw.Polygon.TYPE},_updateFinishHandler:function(){var t=this._markers.length;1===t&&this._markers[0].on("click",this._finishShape,this),t>2&&(this._markers[t-1].on("dblclick",this._finishShape,this),t>3&&this._markers[t-2].off("dblclick",this._finishShape,this))},_getTooltipText:function(){var t,e;return 0===this._markers.length?t=L.drawLocal.draw.handlers.polygon.tooltip.start:this._markers.length<3?t=L.drawLocal.draw.handlers.polygon.tooltip.cont:(t=L.drawLocal.draw.handlers.polygon.tooltip.end,e=this._getMeasurementString()),{text:t,subtext:e}},_getMeasurementString:function(){var t=this._area;return t?L.GeometryUtil.readableArea(t,this.options.metric):null},_shapeIsValid:function(){return this._markers.length>=3},_vertexChanged:function(t,e){var i;!this.options.allowIntersection&&this.options.showArea&&(i=this._poly.getLatLngs(),this._area=L.GeometryUtil.geodesicArea(i)),L.Draw.Polyline.prototype._vertexChanged.call(this,t,e)},_cleanUpShape:function(){var t=this._markers.length;t>0&&(this._markers[0].off("click",this._finishShape,this),t>2&&this._markers[t-1].off("dblclick",this._finishShape,this))}}),L.SimpleShape={},L.Draw.SimpleShape=L.Draw.Feature.extend({options:{repeatMode:!1},initialize:function(t,e){this._endLabelText=L.drawLocal.draw.handlers.simpleshape.tooltip.end,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._mapDraggable=this._map.dragging.enabled(),this._mapDraggable&&this._map.dragging.disable(),this._container.style.cursor="crosshair",this._tooltip.updateContent({text:this._initialLabelText}),this._map.on("mousedown",this._onMouseDown,this).on("mousemove",this._onMouseMove,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._mapDraggable&&this._map.dragging.enable(),this._container.style.cursor="",this._map.off("mousedown",this._onMouseDown,this).off("mousemove",this._onMouseMove,this),L.DomEvent.off(e,"mouseup",this._onMouseUp,this),this._shape&&(this._map.removeLayer(this._shape),delete this._shape)),this._isDrawing=!1},_onMouseDown:function(t){this._isDrawing=!0,this._startLatLng=t.latlng,L.DomEvent.on(e,"mouseup",this._onMouseUp,this).preventDefault(t.originalEvent)},_onMouseMove:function(t){var e=t.latlng;this._tooltip.updatePosition(e),this._isDrawing&&(this._tooltip.updateContent({text:this._endLabelText}),this._drawShape(e))},_onMouseUp:function(){this._shape&&this._fireCreatedEvent(),this.disable(),this.options.repeatMode&&this.enable()}}),L.Draw.Rectangle=L.Draw.SimpleShape.extend({statics:{TYPE:"rectangle"},options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){this.type=L.Draw.Rectangle.TYPE,this._initialLabelText=L.drawLocal.draw.handlers.rectangle.tooltip.start,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_drawShape:function(t){this._shape?this._shape.setBounds(new L.LatLngBounds(this._startLatLng,t)):(this._shape=new L.Rectangle(new L.LatLngBounds(this._startLatLng,t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){var t=new L.Rectangle(this._shape.getBounds(),this.options.shapeOptions);L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this,t)}}),L.Draw.Circle=L.Draw.SimpleShape.extend({statics:{TYPE:"circle"},options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0},showRadius:!0,metric:!0},initialize:function(t,e){this.type=L.Draw.Circle.TYPE,this._initialLabelText=L.drawLocal.draw.handlers.circle.tooltip.start,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_drawShape:function(t){this._shape?this._shape.setRadius(this._startLatLng.distanceTo(t)):(this._shape=new L.Circle(this._startLatLng,this._startLatLng.distanceTo(t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){var t=new L.Circle(this._startLatLng,this._shape.getRadius(),this.options.shapeOptions);L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this,t)},_onMouseMove:function(t){var e,i=t.latlng,o=this.options.showRadius,a=this.options.metric;this._tooltip.updatePosition(i),this._isDrawing&&(this._drawShape(i),e=this._shape.getRadius().toFixed(1),this._tooltip.updateContent({text:this._endLabelText,subtext:o?"Radius: "+L.GeometryUtil.readableDistance(e,a):""}))}}),L.Draw.Marker=L.Draw.Feature.extend({statics:{TYPE:"marker"},options:{icon:new L.Icon.Default,repeatMode:!1,zIndexOffset:2e3},initialize:function(t,e){this.type=L.Draw.Marker.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._tooltip.updateContent({text:L.drawLocal.draw.handlers.marker.tooltip.start}),this._mouseMarker||(this._mouseMarker=L.marker(this._map.getCenter(),{icon:L.divIcon({className:"leaflet-mouse-marker",iconAnchor:[20,20],iconSize:[40,40]}),opacity:0,zIndexOffset:this.options.zIndexOffset})),this._mouseMarker.on("click",this._onClick,this).addTo(this._map),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._marker&&(this._marker.off("click",this._onClick,this),this._map.off("click",this._onClick,this).removeLayer(this._marker),delete this._marker),this._mouseMarker.off("click",this._onClick,this),this._map.removeLayer(this._mouseMarker),delete this._mouseMarker,this._map.off("mousemove",this._onMouseMove,this))},_onMouseMove:function(t){var e=t.latlng;this._tooltip.updatePosition(e),this._mouseMarker.setLatLng(e),this._marker?(e=this._mouseMarker.getLatLng(),this._marker.setLatLng(e)):(this._marker=new L.Marker(e,{icon:this.options.icon,zIndexOffset:this.options.zIndexOffset}),this._marker.on("click",this._onClick,this),this._map.on("click",this._onClick,this).addLayer(this._marker))},_onClick:function(){this._fireCreatedEvent(),this.disable(),this.options.repeatMode&&this.enable()},_fireCreatedEvent:function(){var t=new L.Marker(this._marker.getLatLng(),{icon:this.options.icon});L.Draw.Feature.prototype._fireCreatedEvent.call(this,t)}}),L.Edit=L.Edit||{},L.Edit.Poly=L.Handler.extend({options:{icon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon"})},initialize:function(t,e){this._poly=t,L.setOptions(this,e)},addHooks:function(){this._poly._map&&(this._markerGroup||this._initMarkers(),this._poly._map.addLayer(this._markerGroup))},removeHooks:function(){this._poly._map&&(this._poly._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers)},updateMarkers:function(){this._markerGroup.clearLayers(),this._initMarkers()},_initMarkers:function(){this._markerGroup||(this._markerGroup=new L.LayerGroup),this._markers=[];var t,e,i,o,a=this._poly._latlngs;for(t=0,i=a.length;i>t;t++)o=this._createMarker(a[t],t),o.on("click",this._onMarkerClick,this),this._markers.push(o);var s,r;for(t=0,e=i-1;i>t;e=t++)(0!==t||L.Polygon&&this._poly instanceof L.Polygon)&&(s=this._markers[e],r=this._markers[t],this._createMiddleMarker(s,r),this._updatePrevNext(s,r))},_createMarker:function(t,e){var i=new L.Marker(t,{draggable:!0,icon:this.options.icon});return i._origLatLng=t,i._index=e,i.on("drag",this._onMarkerDrag,this),i.on("dragend",this._fireEdit,this),this._markerGroup.addLayer(i),i},_removeMarker:function(t){var e=t._index;this._markerGroup.removeLayer(t),this._markers.splice(e,1),this._poly.spliceLatLngs(e,1),this._updateIndexes(e,-1),t.off("drag",this._onMarkerDrag,this).off("dragend",this._fireEdit,this).off("click",this._onMarkerClick,this)},_fireEdit:function(){this._poly.edited=!0,this._poly.fire("edit")},_onMarkerDrag:function(t){var e=t.target;L.extend(e._origLatLng,e._latlng),e._middleLeft&&e._middleLeft.setLatLng(this._getMiddleLatLng(e._prev,e)),e._middleRight&&e._middleRight.setLatLng(this._getMiddleLatLng(e,e._next)),this._poly.redraw()},_onMarkerClick:function(t){var e=L.Polygon&&this._poly instanceof L.Polygon?4:3,i=t.target;this._poly._latlngs.length<e||(this._removeMarker(i),this._updatePrevNext(i._prev,i._next),i._middleLeft&&this._markerGroup.removeLayer(i._middleLeft),i._middleRight&&this._markerGroup.removeLayer(i._middleRight),i._prev&&i._next?this._createMiddleMarker(i._prev,i._next):i._prev?i._next||(i._prev._middleRight=null):i._next._middleLeft=null,this._fireEdit())},_updateIndexes:function(t,e){this._markerGroup.eachLayer(function(i){i._index>t&&(i._index+=e)})},_createMiddleMarker:function(t,e){var i,o,a,s=this._getMiddleLatLng(t,e),r=this._createMarker(s);r.setOpacity(.6),t._middleRight=e._middleLeft=r,o=function(){var o=e._index;r._index=o,r.off("click",i,this).on("click",this._onMarkerClick,this),s.lat=r.getLatLng().lat,s.lng=r.getLatLng().lng,this._poly.spliceLatLngs(o,0,s),this._markers.splice(o,0,r),r.setOpacity(1),this._updateIndexes(o,1),e._index++,this._updatePrevNext(t,r),this._updatePrevNext(r,e),this._poly.fire("editstart")},a=function(){r.off("dragstart",o,this),r.off("dragend",a,this),this._createMiddleMarker(t,r),this._createMiddleMarker(r,e)},i=function(){o.call(this),a.call(this),this._fireEdit()},r.on("click",i,this).on("dragstart",o,this).on("dragend",a,this),this._markerGroup.addLayer(r)},_updatePrevNext:function(t,e){t&&(t._next=e),e&&(e._prev=t)},_getMiddleLatLng:function(t,e){var i=this._poly._map,o=i.project(t.getLatLng()),a=i.project(e.getLatLng());return i.unproject(o._add(a)._divideBy(2))}}),L.Polyline.addInitHook(function(){this.editing||(L.Edit.Poly&&(this.editing=new L.Edit.Poly(this),this.options.editable&&this.editing.enable()),this.on("add",function(){this.editing&&this.editing.enabled()&&this.editing.addHooks()}),this.on("remove",function(){this.editing&&this.editing.enabled()&&this.editing.removeHooks()}))}),L.Edit=L.Edit||{},L.Edit.SimpleShape=L.Handler.extend({options:{moveIcon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-move"}),resizeIcon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-resize"})},initialize:function(t,e){this._shape=t,L.Util.setOptions(this,e)},addHooks:function(){this._shape._map&&(this._map=this._shape._map,this._markerGroup||this._initMarkers(),this._map.addLayer(this._markerGroup))},removeHooks:function(){if(this._shape._map){this._unbindMarker(this._moveMarker);for(var t=0,e=this._resizeMarkers.length;e>t;t++)this._unbindMarker(this._resizeMarkers[t]);this._resizeMarkers=null,this._map.removeLayer(this._markerGroup),delete this._markerGroup}this._map=null},updateMarkers:function(){this._markerGroup.clearLayers(),this._initMarkers()},_initMarkers:function(){this._markerGroup||(this._markerGroup=new L.LayerGroup),this._createMoveMarker(),this._createResizeMarker()},_createMoveMarker:function(){},_createResizeMarker:function(){},_createMarker:function(t,e){var i=new L.Marker(t,{draggable:!0,icon:e,zIndexOffset:10});return this._bindMarker(i),this._markerGroup.addLayer(i),i},_bindMarker:function(t){t.on("dragstart",this._onMarkerDragStart,this).on("drag",this._onMarkerDrag,this).on("dragend",this._onMarkerDragEnd,this)},_unbindMarker:function(t){t.off("dragstart",this._onMarkerDragStart,this).off("drag",this._onMarkerDrag,this).off("dragend",this._onMarkerDragEnd,this)},_onMarkerDragStart:function(t){var e=t.target;e.setOpacity(0),this._shape.fire("editstart")},_fireEdit:function(){this._shape.edited=!0,this._shape.fire("edit")},_onMarkerDrag:function(t){var e=t.target,i=e.getLatLng();e===this._moveMarker?this._move(i):this._resize(i),this._shape.redraw()},_onMarkerDragEnd:function(t){var e=t.target;e.setOpacity(1),this._fireEdit()},_move:function(){},_resize:function(){}}),L.Edit=L.Edit||{},L.Edit.Rectangle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getBounds(),e=t.getCenter();this._moveMarker=this._createMarker(e,this.options.moveIcon)},_createResizeMarker:function(){var t=this._getCorners();this._resizeMarkers=[];for(var e=0,i=t.length;i>e;e++)this._resizeMarkers.push(this._createMarker(t[e],this.options.resizeIcon)),this._resizeMarkers[e]._cornerIndex=e},_onMarkerDragStart:function(t){L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this,t);var e=this._getCorners(),i=t.target,o=i._cornerIndex;this._oppositeCorner=e[(o+2)%4],this._toggleCornerMarkers(0,o)},_onMarkerDragEnd:function(t){var e,i,o=t.target;o===this._moveMarker&&(e=this._shape.getBounds(),i=e.getCenter(),o.setLatLng(i)),this._toggleCornerMarkers(1),this._repositionCornerMarkers(),L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this,t)},_move:function(t){for(var e,i=this._shape.getLatLngs(),o=this._shape.getBounds(),a=o.getCenter(),s=[],r=0,n=i.length;n>r;r++)e=[i[r].lat-a.lat,i[r].lng-a.lng],s.push([t.lat+e[0],t.lng+e[1]]);this._shape.setLatLngs(s),this._repositionCornerMarkers()},_resize:function(t){var e;this._shape.setBounds(L.latLngBounds(t,this._oppositeCorner)),e=this._shape.getBounds(),this._moveMarker.setLatLng(e.getCenter())},_getCorners:function(){var t=this._shape.getBounds(),e=t.getNorthWest(),i=t.getNorthEast(),o=t.getSouthEast(),a=t.getSouthWest();return[e,i,o,a]},_toggleCornerMarkers:function(t){for(var e=0,i=this._resizeMarkers.length;i>e;e++)this._resizeMarkers[e].setOpacity(t)},_repositionCornerMarkers:function(){for(var t=this._getCorners(),e=0,i=this._resizeMarkers.length;i>e;e++)this._resizeMarkers[e].setLatLng(t[e])}}),L.Rectangle.addInitHook(function(){L.Edit.Rectangle&&(this.editing=new L.Edit.Rectangle(this),this.options.editable&&this.editing.enable())}),L.Edit=L.Edit||{},L.Edit.Circle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getLatLng();this._moveMarker=this._createMarker(t,this.options.moveIcon)},_createResizeMarker:function(){var t=this._shape.getLatLng(),e=this._getResizeMarkerPoint(t);this._resizeMarkers=[],this._resizeMarkers.push(this._createMarker(e,this.options.resizeIcon))},_getResizeMarkerPoint:function(t){var e=this._shape._radius*Math.cos(Math.PI/4),i=this._map.project(t);return this._map.unproject([i.x+e,i.y-e])},_move:function(t){var e=this._getResizeMarkerPoint(t);this._resizeMarkers[0].setLatLng(e),this._shape.setLatLng(t)},_resize:function(t){var e=this._moveMarker.getLatLng(),i=e.distanceTo(t);this._shape.setRadius(i)}}),L.Circle.addInitHook(function(){L.Edit.Circle&&(this.editing=new L.Edit.Circle(this),this.options.editable&&this.editing.enable()),this.on("add",function(){this.editing&&this.editing.enabled()&&this.editing.addHooks()}),this.on("remove",function(){this.editing&&this.editing.enabled()&&this.editing.removeHooks()})}),L.LatLngUtil={cloneLatLngs:function(t){for(var e=[],i=0,o=t.length;o>i;i++)e.push(this.cloneLatLng(t[i]));return e},cloneLatLng:function(t){return L.latLng(t.lat,t.lng)}},L.GeometryUtil=L.extend(L.GeometryUtil||{},{geodesicArea:function(t){var e,i,o=t.length,a=0,s=L.LatLng.DEG_TO_RAD;if(o>2){for(var r=0;o>r;r++)e=t[r],i=t[(r+1)%o],a+=(i.lng-e.lng)*s*(2+Math.sin(e.lat*s)+Math.sin(i.lat*s));a=6378137*a*6378137/2}return Math.abs(a)},readableArea:function(t,e){var i;return e?i=t>=1e4?(1e-4*t).toFixed(2)+" ha":t.toFixed(2)+" m&sup2;":(t*=.836127,i=t>=3097600?(t/3097600).toFixed(2)+" mi&sup2;":t>=4840?(t/4840).toFixed(2)+" acres":Math.ceil(t)+" yd&sup2;"),i},readableDistance:function(t,e){var i;return e?i=t>1e3?(t/1e3).toFixed(2)+" km":Math.ceil(t)+" m":(t*=1.09361,i=t>1760?(t/1760).toFixed(2)+" miles":Math.ceil(t)+" yd"),i}}),L.Util.extend(L.LineUtil,{segmentsIntersect:function(t,e,i,o){return this._checkCounterclockwise(t,i,o)!==this._checkCounterclockwise(e,i,o)&&this._checkCounterclockwise(t,e,i)!==this._checkCounterclockwise(t,e,o)},_checkCounterclockwise:function(t,e,i){return(i.y-t.y)*(e.x-t.x)>(e.y-t.y)*(i.x-t.x)}}),L.Polyline.include({intersects:function(){var t,e,i,o=this._originalPoints,a=o?o.length:0;if(this._tooFewPointsForIntersection())return!1;for(t=a-1;t>=3;t--)if(e=o[t-1],i=o[t],this._lineSegmentsIntersectsRange(e,i,t-2))return!0;return!1},newLatLngIntersects:function(t,e){return this._map?this.newPointIntersects(this._map.latLngToLayerPoint(t),e):!1},newPointIntersects:function(t,e){var i=this._originalPoints,o=i?i.length:0,a=i?i[o-1]:null,s=o-2;return this._tooFewPointsForIntersection(1)?!1:this._lineSegmentsIntersectsRange(a,t,s,e?1:0)},_tooFewPointsForIntersection:function(t){var e=this._originalPoints,i=e?e.length:0;return i+=t||0,!this._originalPoints||3>=i},_lineSegmentsIntersectsRange:function(t,e,i,o){var a,s,r=this._originalPoints;o=o||0;for(var n=i;n>o;n--)if(a=r[n-1],s=r[n],L.LineUtil.segmentsIntersect(t,e,a,s))return!0;return!1}}),L.Polygon.include({intersects:function(){var t,e,i,o,a,s=this._originalPoints;return this._tooFewPointsForIntersection()?!1:(t=L.Polyline.prototype.intersects.call(this))?!0:(e=s.length,i=s[0],o=s[e-1],a=e-2,this._lineSegmentsIntersectsRange(o,i,a,1))}}),L.Control.Draw=L.Control.extend({options:{position:"topleft",draw:{},edit:!1},initialize:function(t){if(L.version<"0.7")throw new Error("Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/");L.Control.prototype.initialize.call(this,t);var e,i;this._toolbars={},L.DrawToolbar&&this.options.draw&&(i=new L.DrawToolbar(this.options.draw),e=L.stamp(i),this._toolbars[e]=i,this._toolbars[e].on("enable",this._toolbarEnabled,this)),L.EditToolbar&&this.options.edit&&(i=new L.EditToolbar(this.options.edit),e=L.stamp(i),this._toolbars[e]=i,this._toolbars[e].on("enable",this._toolbarEnabled,this))},onAdd:function(t){var e,i=L.DomUtil.create("div","leaflet-draw"),o=!1,a="leaflet-draw-toolbar-top";for(var s in this._toolbars)this._toolbars.hasOwnProperty(s)&&(e=this._toolbars[s].addToolbar(t),e&&(o||(L.DomUtil.hasClass(e,a)||L.DomUtil.addClass(e.childNodes[0],a),o=!0),i.appendChild(e)));return i},onRemove:function(){for(var t in this._toolbars)this._toolbars.hasOwnProperty(t)&&this._toolbars[t].removeToolbar()},setDrawingOptions:function(t){for(var e in this._toolbars)this._toolbars[e]instanceof L.DrawToolbar&&this._toolbars[e].setOptions(t)},_toolbarEnabled:function(t){var e=""+L.stamp(t.target);for(var i in this._toolbars)this._toolbars.hasOwnProperty(i)&&i!==e&&this._toolbars[i].disable()}}),L.Map.mergeOptions({drawControlTooltips:!0,drawControl:!1}),L.Map.addInitHook(function(){this.options.drawControl&&(this.drawControl=new L.Control.Draw,this.addControl(this.drawControl))}),L.Toolbar=L.Class.extend({includes:[L.Mixin.Events],initialize:function(t){L.setOptions(this,t),this._modes={},this._actionButtons=[],this._activeMode=null},enabled:function(){return null!==this._activeMode},disable:function(){this.enabled()&&this._activeMode.handler.disable()},addToolbar:function(t){var e,i=L.DomUtil.create("div","leaflet-draw-section"),o=0,a=this._toolbarClass||"",s=this.getModeHandlers(t);for(this._toolbarContainer=L.DomUtil.create("div","leaflet-draw-toolbar leaflet-bar"),this._map=t,e=0;e<s.length;e++)s[e].enabled&&this._initModeHandler(s[e].handler,this._toolbarContainer,o++,a,s[e].title);return o?(this._lastButtonIndex=--o,this._actionsContainer=L.DomUtil.create("ul","leaflet-draw-actions"),i.appendChild(this._toolbarContainer),i.appendChild(this._actionsContainer),i):void 0},removeToolbar:function(){for(var t in this._modes)this._modes.hasOwnProperty(t)&&(this._disposeButton(this._modes[t].button,this._modes[t].handler.enable,this._modes[t].handler),this._modes[t].handler.disable(),this._modes[t].handler.off("enabled",this._handlerActivated,this).off("disabled",this._handlerDeactivated,this));this._modes={};for(var e=0,i=this._actionButtons.length;i>e;e++)this._disposeButton(this._actionButtons[e].button,this._actionButtons[e].callback,this);this._actionButtons=[],this._actionsContainer=null},_initModeHandler:function(t,e,i,o,a){var s=t.type;this._modes[s]={},this._modes[s].handler=t,this._modes[s].button=this._createButton({title:a,className:o+"-"+s,container:e,callback:this._modes[s].handler.enable,context:this._modes[s].handler}),this._modes[s].buttonIndex=i,this._modes[s].handler.on("enabled",this._handlerActivated,this).on("disabled",this._handlerDeactivated,this)},_createButton:function(t){var e=L.DomUtil.create("a",t.className||"",t.container);return e.href="#",t.text&&(e.innerHTML=t.text),t.title&&(e.title=t.title),L.DomEvent.on(e,"click",L.DomEvent.stopPropagation).on(e,"mousedown",L.DomEvent.stopPropagation).on(e,"dblclick",L.DomEvent.stopPropagation).on(e,"click",L.DomEvent.preventDefault).on(e,"click",t.callback,t.context),e},_disposeButton:function(t,e){L.DomEvent.off(t,"click",L.DomEvent.stopPropagation).off(t,"mousedown",L.DomEvent.stopPropagation).off(t,"dblclick",L.DomEvent.stopPropagation).off(t,"click",L.DomEvent.preventDefault).off(t,"click",e)},_handlerActivated:function(t){this.disable(),this._activeMode=this._modes[t.handler],L.DomUtil.addClass(this._activeMode.button,"leaflet-draw-toolbar-button-enabled"),this._showActionsToolbar(),this.fire("enable")},_handlerDeactivated:function(){this._hideActionsToolbar(),L.DomUtil.removeClass(this._activeMode.button,"leaflet-draw-toolbar-button-enabled"),this._activeMode=null,this.fire("disable")},_createActions:function(t){var e,i,o,a,s=this._actionsContainer,r=this.getActions(t),n=r.length;for(i=0,o=this._actionButtons.length;o>i;i++)this._disposeButton(this._actionButtons[i].button,this._actionButtons[i].callback);for(this._actionButtons=[];s.firstChild;)s.removeChild(s.firstChild);for(var l=0;n>l;l++)"enabled"in r[l]&&!r[l].enabled||(e=L.DomUtil.create("li","",s),a=this._createButton({title:r[l].title,text:r[l].text,container:e,callback:r[l].callback,context:r[l].context}),this._actionButtons.push({button:a,callback:r[l].callback}))},_showActionsToolbar:function(){var t=this._activeMode.buttonIndex,e=this._lastButtonIndex,i=this._activeMode.button.offsetTop-1;this._createActions(this._activeMode.handler),this._actionsContainer.style.top=i+"px",0===t&&(L.DomUtil.addClass(this._toolbarContainer,"leaflet-draw-toolbar-notop"),L.DomUtil.addClass(this._actionsContainer,"leaflet-draw-actions-top")),t===e&&(L.DomUtil.addClass(this._toolbarContainer,"leaflet-draw-toolbar-nobottom"),L.DomUtil.addClass(this._actionsContainer,"leaflet-draw-actions-bottom")),this._actionsContainer.style.display="block"
},_hideActionsToolbar:function(){this._actionsContainer.style.display="none",L.DomUtil.removeClass(this._toolbarContainer,"leaflet-draw-toolbar-notop"),L.DomUtil.removeClass(this._toolbarContainer,"leaflet-draw-toolbar-nobottom"),L.DomUtil.removeClass(this._actionsContainer,"leaflet-draw-actions-top"),L.DomUtil.removeClass(this._actionsContainer,"leaflet-draw-actions-bottom")}}),L.Tooltip=L.Class.extend({initialize:function(t){this._map=t,this._popupPane=t._panes.popupPane,this._container=t.options.drawControlTooltips?L.DomUtil.create("div","leaflet-draw-tooltip",this._popupPane):null,this._singleLineLabel=!1},dispose:function(){this._container&&(this._popupPane.removeChild(this._container),this._container=null)},updateContent:function(t){return this._container?(t.subtext=t.subtext||"",0!==t.subtext.length||this._singleLineLabel?t.subtext.length>0&&this._singleLineLabel&&(L.DomUtil.removeClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!1):(L.DomUtil.addClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!0),this._container.innerHTML=(t.subtext.length>0?'<span class="leaflet-draw-tooltip-subtext">'+t.subtext+"</span><br />":"")+"<span>"+t.text+"</span>",this):this},updatePosition:function(t){var e=this._map.latLngToLayerPoint(t),i=this._container;return this._container&&(i.style.visibility="inherit",L.DomUtil.setPosition(i,e)),this},showAsError:function(){return this._container&&L.DomUtil.addClass(this._container,"leaflet-error-draw-tooltip"),this},removeError:function(){return this._container&&L.DomUtil.removeClass(this._container,"leaflet-error-draw-tooltip"),this}}),L.DrawToolbar=L.Toolbar.extend({options:{polyline:{},polygon:{},rectangle:{},circle:{},marker:{}},initialize:function(t){for(var e in this.options)this.options.hasOwnProperty(e)&&t[e]&&(t[e]=L.extend({},this.options[e],t[e]));this._toolbarClass="leaflet-draw-draw",L.Toolbar.prototype.initialize.call(this,t)},getModeHandlers:function(t){return[{enabled:this.options.polyline,handler:new L.Draw.Polyline(t,this.options.polyline),title:L.drawLocal.draw.toolbar.buttons.polyline},{enabled:this.options.polygon,handler:new L.Draw.Polygon(t,this.options.polygon),title:L.drawLocal.draw.toolbar.buttons.polygon},{enabled:this.options.rectangle,handler:new L.Draw.Rectangle(t,this.options.rectangle),title:L.drawLocal.draw.toolbar.buttons.rectangle},{enabled:this.options.circle,handler:new L.Draw.Circle(t,this.options.circle),title:L.drawLocal.draw.toolbar.buttons.circle},{enabled:this.options.marker,handler:new L.Draw.Marker(t,this.options.marker),title:L.drawLocal.draw.toolbar.buttons.marker}]},getActions:function(t){return[{enabled:t.deleteLastVertex,title:L.drawLocal.draw.toolbar.undo.title,text:L.drawLocal.draw.toolbar.undo.text,callback:t.deleteLastVertex,context:t},{title:L.drawLocal.draw.toolbar.actions.title,text:L.drawLocal.draw.toolbar.actions.text,callback:this.disable,context:this}]},setOptions:function(t){L.setOptions(this,t);for(var e in this._modes)this._modes.hasOwnProperty(e)&&t.hasOwnProperty(e)&&this._modes[e].handler.setOptions(t[e])}}),L.EditToolbar=L.Toolbar.extend({options:{edit:{selectedPathOptions:{color:"#fe57a1",opacity:.6,dashArray:"10, 10",fill:!0,fillColor:"#fe57a1",fillOpacity:.1}},remove:{},featureGroup:null},initialize:function(t){t.edit&&("undefined"==typeof t.edit.selectedPathOptions&&(t.edit.selectedPathOptions=this.options.edit.selectedPathOptions),t.edit=L.extend({},this.options.edit,t.edit)),t.remove&&(t.remove=L.extend({},this.options.remove,t.remove)),this._toolbarClass="leaflet-draw-edit",L.Toolbar.prototype.initialize.call(this,t),this._selectedFeatureCount=0},getModeHandlers:function(t){var e=this.options.featureGroup;return[{enabled:this.options.edit,handler:new L.EditToolbar.Edit(t,{featureGroup:e,selectedPathOptions:this.options.edit.selectedPathOptions}),title:L.drawLocal.edit.toolbar.buttons.edit},{enabled:this.options.remove,handler:new L.EditToolbar.Delete(t,{featureGroup:e}),title:L.drawLocal.edit.toolbar.buttons.remove}]},getActions:function(){return[{title:L.drawLocal.edit.toolbar.actions.save.title,text:L.drawLocal.edit.toolbar.actions.save.text,callback:this._save,context:this},{title:L.drawLocal.edit.toolbar.actions.cancel.title,text:L.drawLocal.edit.toolbar.actions.cancel.text,callback:this.disable,context:this}]},addToolbar:function(t){var e=L.Toolbar.prototype.addToolbar.call(this,t);return this._checkDisabled(),this.options.featureGroup.on("layeradd layerremove",this._checkDisabled,this),e},removeToolbar:function(){this.options.featureGroup.off("layeradd layerremove",this._checkDisabled,this),L.Toolbar.prototype.removeToolbar.call(this)},disable:function(){this.enabled()&&(this._activeMode.handler.revertLayers(),L.Toolbar.prototype.disable.call(this))},_save:function(){this._activeMode.handler.save(),this._activeMode.handler.disable()},_checkDisabled:function(){var t,e=this.options.featureGroup,i=0!==e.getLayers().length;this.options.edit&&(t=this._modes[L.EditToolbar.Edit.TYPE].button,i?L.DomUtil.removeClass(t,"leaflet-disabled"):L.DomUtil.addClass(t,"leaflet-disabled"),t.setAttribute("title",i?L.drawLocal.edit.toolbar.buttons.edit:L.drawLocal.edit.toolbar.buttons.editDisabled)),this.options.remove&&(t=this._modes[L.EditToolbar.Delete.TYPE].button,i?L.DomUtil.removeClass(t,"leaflet-disabled"):L.DomUtil.addClass(t,"leaflet-disabled"),t.setAttribute("title",i?L.drawLocal.edit.toolbar.buttons.remove:L.drawLocal.edit.toolbar.buttons.removeDisabled))}}),L.EditToolbar.Edit=L.Handler.extend({statics:{TYPE:"edit"},includes:L.Mixin.Events,initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),this._selectedPathOptions=e.selectedPathOptions,this._featureGroup=e.featureGroup,!(this._featureGroup instanceof L.FeatureGroup))throw new Error("options.featureGroup must be a L.FeatureGroup");this._uneditedLayerProps={},this.type=L.EditToolbar.Edit.TYPE},enable:function(){!this._enabled&&this._hasAvailableLayers()&&(this.fire("enabled",{handler:this.type}),this._map.fire("draw:editstart",{handler:this.type}),L.Handler.prototype.enable.call(this),this._featureGroup.on("layeradd",this._enableLayerEdit,this).on("layerremove",this._disableLayerEdit,this))},disable:function(){this._enabled&&(this._featureGroup.off("layeradd",this._enableLayerEdit,this).off("layerremove",this._disableLayerEdit,this),L.Handler.prototype.disable.call(this),this._map.fire("draw:editstop",{handler:this.type}),this.fire("disabled",{handler:this.type}))},addHooks:function(){var t=this._map;t&&(t.getContainer().focus(),this._featureGroup.eachLayer(this._enableLayerEdit,this),this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:L.drawLocal.edit.handlers.edit.tooltip.text,subtext:L.drawLocal.edit.handlers.edit.tooltip.subtext}),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){this._map&&(this._featureGroup.eachLayer(this._disableLayerEdit,this),this._uneditedLayerProps={},this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove,this))},revertLayers:function(){this._featureGroup.eachLayer(function(t){this._revertLayer(t)},this)},save:function(){var t=new L.LayerGroup;this._featureGroup.eachLayer(function(e){e.edited&&(t.addLayer(e),e.edited=!1)}),this._map.fire("draw:edited",{layers:t})},_backupLayer:function(t){var e=L.Util.stamp(t);this._uneditedLayerProps[e]||(t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?this._uneditedLayerProps[e]={latlngs:L.LatLngUtil.cloneLatLngs(t.getLatLngs())}:t instanceof L.Circle?this._uneditedLayerProps[e]={latlng:L.LatLngUtil.cloneLatLng(t.getLatLng()),radius:t.getRadius()}:t instanceof L.Marker&&(this._uneditedLayerProps[e]={latlng:L.LatLngUtil.cloneLatLng(t.getLatLng())}))},_revertLayer:function(t){var e=L.Util.stamp(t);t.edited=!1,this._uneditedLayerProps.hasOwnProperty(e)&&(t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?t.setLatLngs(this._uneditedLayerProps[e].latlngs):t instanceof L.Circle?(t.setLatLng(this._uneditedLayerProps[e].latlng),t.setRadius(this._uneditedLayerProps[e].radius)):t instanceof L.Marker&&t.setLatLng(this._uneditedLayerProps[e].latlng))},_toggleMarkerHighlight:function(t){if(t._icon){var e=t._icon;e.style.display="none",L.DomUtil.hasClass(e,"leaflet-edit-marker-selected")?(L.DomUtil.removeClass(e,"leaflet-edit-marker-selected"),this._offsetMarker(e,-4)):(L.DomUtil.addClass(e,"leaflet-edit-marker-selected"),this._offsetMarker(e,4)),e.style.display=""}},_offsetMarker:function(t,e){var i=parseInt(t.style.marginTop,10)-e,o=parseInt(t.style.marginLeft,10)-e;t.style.marginTop=i+"px",t.style.marginLeft=o+"px"},_enableLayerEdit:function(t){var e,i=t.layer||t.target||t,o=i instanceof L.Marker;(!o||i._icon)&&(this._backupLayer(i),this._selectedPathOptions&&(e=L.Util.extend({},this._selectedPathOptions),o?this._toggleMarkerHighlight(i):(i.options.previousOptions=L.Util.extend({dashArray:null},i.options),i instanceof L.Circle||i instanceof L.Polygon||i instanceof L.Rectangle||(e.fill=!1),i.setStyle(e))),o?(i.dragging.enable(),i.on("dragend",this._onMarkerDragEnd)):i.editing.enable())},_disableLayerEdit:function(t){var e=t.layer||t.target||t;e.edited=!1,this._selectedPathOptions&&(e instanceof L.Marker?this._toggleMarkerHighlight(e):(e.setStyle(e.options.previousOptions),delete e.options.previousOptions)),e instanceof L.Marker?(e.dragging.disable(),e.off("dragend",this._onMarkerDragEnd,this)):e.editing.disable()},_onMarkerDragEnd:function(t){var e=t.target;e.edited=!0},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)},_hasAvailableLayers:function(){return 0!==this._featureGroup.getLayers().length}}),L.EditToolbar.Delete=L.Handler.extend({statics:{TYPE:"remove"},includes:L.Mixin.Events,initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),L.Util.setOptions(this,e),this._deletableLayers=this.options.featureGroup,!(this._deletableLayers instanceof L.FeatureGroup))throw new Error("options.featureGroup must be a L.FeatureGroup");this.type=L.EditToolbar.Delete.TYPE},enable:function(){!this._enabled&&this._hasAvailableLayers()&&(this.fire("enabled",{handler:this.type}),this._map.fire("draw:deletestart",{handler:this.type}),L.Handler.prototype.enable.call(this),this._deletableLayers.on("layeradd",this._enableLayerDelete,this).on("layerremove",this._disableLayerDelete,this))},disable:function(){this._enabled&&(this._deletableLayers.off("layeradd",this._enableLayerDelete,this).off("layerremove",this._disableLayerDelete,this),L.Handler.prototype.disable.call(this),this._map.fire("draw:deletestop",{handler:this.type}),this.fire("disabled",{handler:this.type}))},addHooks:function(){var t=this._map;t&&(t.getContainer().focus(),this._deletableLayers.eachLayer(this._enableLayerDelete,this),this._deletedLayers=new L.layerGroup,this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:L.drawLocal.edit.handlers.remove.tooltip.text}),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){this._map&&(this._deletableLayers.eachLayer(this._disableLayerDelete,this),this._deletedLayers=null,this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove,this))},revertLayers:function(){this._deletedLayers.eachLayer(function(t){this._deletableLayers.addLayer(t)},this)},save:function(){this._map.fire("draw:deleted",{layers:this._deletedLayers})},_enableLayerDelete:function(t){var e=t.layer||t.target||t;e.on("click",this._removeLayer,this)},_disableLayerDelete:function(t){var e=t.layer||t.target||t;e.off("click",this._removeLayer,this),this._deletedLayers.removeLayer(e)},_removeLayer:function(t){var e=t.layer||t.target||t;this._deletableLayers.removeLayer(e),this._deletedLayers.addLayer(e)},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)},_hasAvailableLayers:function(){return 0!==this._deletableLayers.getLayers().length}})}(window,document);
},{}],4:[function(require,module,exports){
/*
 Leaflet, a JavaScript library for mobile-friendly interactive maps. http://leafletjs.com
 (c) 2010-2013, Vladimir Agafonkin
 (c) 2010-2011, CloudMade
*/
(function (window, document, undefined) {
var oldL = window.L,
    L = {};

L.version = '0.7.2';

// define Leaflet for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
	module.exports = L;

// define Leaflet as an AMD module
} else if (typeof define === 'function' && define.amd) {
	define(L);
}

// define Leaflet as a global L variable, saving the original L to restore later if needed

L.noConflict = function () {
	window.L = oldL;
	return this;
};

window.L = L;


/*
 * L.Util contains various utility functions used throughout Leaflet code.
 */

L.Util = {
	extend: function (dest) { // (Object[, Object, ...]) ->
		var sources = Array.prototype.slice.call(arguments, 1),
		    i, j, len, src;

		for (j = 0, len = sources.length; j < len; j++) {
			src = sources[j] || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}
		return dest;
	},

	bind: function (fn, obj) { // (Function, Object) -> Function
		var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
		return function () {
			return fn.apply(obj, args || arguments);
		};
	},

	stamp: (function () {
		var lastId = 0,
		    key = '_leaflet_id';
		return function (obj) {
			obj[key] = obj[key] || ++lastId;
			return obj[key];
		};
	}()),

	invokeEach: function (obj, method, context) {
		var i, args;

		if (typeof obj === 'object') {
			args = Array.prototype.slice.call(arguments, 3);

			for (i in obj) {
				method.apply(context, [i, obj[i]].concat(args));
			}
			return true;
		}

		return false;
	},

	limitExecByInterval: function (fn, time, context) {
		var lock, execOnUnlock;

		return function wrapperFn() {
			var args = arguments;

			if (lock) {
				execOnUnlock = true;
				return;
			}

			lock = true;

			setTimeout(function () {
				lock = false;

				if (execOnUnlock) {
					wrapperFn.apply(context, args);
					execOnUnlock = false;
				}
			}, time);

			fn.apply(context, args);
		};
	},

	falseFn: function () {
		return false;
	},

	formatNum: function (num, digits) {
		var pow = Math.pow(10, digits || 5);
		return Math.round(num * pow) / pow;
	},

	trim: function (str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	},

	splitWords: function (str) {
		return L.Util.trim(str).split(/\s+/);
	},

	setOptions: function (obj, options) {
		obj.options = L.extend({}, obj.options, options);
		return obj.options;
	},

	getParamString: function (obj, existingUrl, uppercase) {
		var params = [];
		for (var i in obj) {
			params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
		}
		return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
	},
	template: function (str, data) {
		return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
			var value = data[key];
			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	},

	isArray: Array.isArray || function (obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	},

	emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

(function () {

	// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

	function getPrefixed(name) {
		var i, fn,
		    prefixes = ['webkit', 'moz', 'o', 'ms'];

		for (i = 0; i < prefixes.length && !fn; i++) {
			fn = window[prefixes[i] + name];
		}

		return fn;
	}

	var lastTime = 0;

	function timeoutDefer(fn) {
		var time = +new Date(),
		    timeToCall = Math.max(0, 16 - (time - lastTime));

		lastTime = time + timeToCall;
		return window.setTimeout(fn, timeToCall);
	}

	var requestFn = window.requestAnimationFrame ||
	        getPrefixed('RequestAnimationFrame') || timeoutDefer;

	var cancelFn = window.cancelAnimationFrame ||
	        getPrefixed('CancelAnimationFrame') ||
	        getPrefixed('CancelRequestAnimationFrame') ||
	        function (id) { window.clearTimeout(id); };


	L.Util.requestAnimFrame = function (fn, context, immediate, element) {
		fn = L.bind(fn, context);

		if (immediate && requestFn === timeoutDefer) {
			fn();
		} else {
			return requestFn.call(window, fn, element);
		}
	};

	L.Util.cancelAnimFrame = function (id) {
		if (id) {
			cancelFn.call(window, id);
		}
	};

}());

// shortcuts for most used utility functions
L.extend = L.Util.extend;
L.bind = L.Util.bind;
L.stamp = L.Util.stamp;
L.setOptions = L.Util.setOptions;


/*
 * L.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

L.Class = function () {};

L.Class.extend = function (props) {

	// extended class with the new prototype
	var NewClass = function () {

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}

		// call all constructor hooks
		if (this._initHooks) {
			this.callInitHooks();
		}
	};

	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		L.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		L.Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = L.extend({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	L.extend(proto, props);

	proto._initHooks = [];

	var parent = this;
	// jshint camelcase: false
	NewClass.__super__ = parent.prototype;

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parent.prototype.callInitHooks) {
			parent.prototype.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


// method for adding properties to prototype
L.Class.include = function (props) {
	L.extend(this.prototype, props);
};

// merge new default options to the Class
L.Class.mergeOptions = function (options) {
	L.extend(this.prototype.options, options);
};

// add a constructor hook
L.Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
};


/*
 * L.Mixin.Events is used to add custom events functionality to Leaflet classes.
 */

var eventsKey = '_leaflet_events';

L.Mixin = {};

L.Mixin.Events = {

	addEventListener: function (types, fn, context) { // (String, Function[, Object]) or (Object[, Object])

		// types can be a map of types/handlers
		if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey] = this[eventsKey] || {},
		    contextId = context && context !== this && L.stamp(context),
		    i, len, event, type, indexKey, indexLenKey, typeIndex;

		// types can be a string of space-separated words
		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			event = {
				action: fn,
				context: context || this
			};
			type = types[i];

			if (contextId) {
				// store listeners of a particular context in a separate hash (if it has an id)
				// gives a major performance boost when removing thousands of map layers

				indexKey = type + '_idx';
				indexLenKey = indexKey + '_len';

				typeIndex = events[indexKey] = events[indexKey] || {};

				if (!typeIndex[contextId]) {
					typeIndex[contextId] = [];

					// keep track of the number of keys in the index to quickly check if it's empty
					events[indexLenKey] = (events[indexLenKey] || 0) + 1;
				}

				typeIndex[contextId].push(event);


			} else {
				events[type] = events[type] || [];
				events[type].push(event);
			}
		}

		return this;
	},

	hasEventListeners: function (type) { // (String) -> Boolean
		var events = this[eventsKey];
		return !!events && ((type in events && events[type].length > 0) ||
		                    (type + '_idx' in events && events[type + '_idx_len'] > 0));
	},

	removeEventListener: function (types, fn, context) { // ([String, Function, Object]) or (Object[, Object])

		if (!this[eventsKey]) {
			return this;
		}

		if (!types) {
			return this.clearAllEventListeners();
		}

		if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) { return this; }

		var events = this[eventsKey],
		    contextId = context && context !== this && L.stamp(context),
		    i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

		types = L.Util.splitWords(types);

		for (i = 0, len = types.length; i < len; i++) {
			type = types[i];
			indexKey = type + '_idx';
			indexLenKey = indexKey + '_len';

			typeIndex = events[indexKey];

			if (!fn) {
				// clear all listeners for a type if function isn't specified
				delete events[type];
				delete events[indexKey];
				delete events[indexLenKey];

			} else {
				listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];

				if (listeners) {
					for (j = listeners.length - 1; j >= 0; j--) {
						if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
							removed = listeners.splice(j, 1);
							// set the old action to a no-op, because it is possible
							// that the listener is being iterated over as part of a dispatch
							removed[0].action = L.Util.falseFn;
						}
					}

					if (context && typeIndex && (listeners.length === 0)) {
						delete typeIndex[contextId];
						events[indexLenKey]--;
					}
				}
			}
		}

		return this;
	},

	clearAllEventListeners: function () {
		delete this[eventsKey];
		return this;
	},

	fireEvent: function (type, data) { // (String[, Object])
		if (!this.hasEventListeners(type)) {
			return this;
		}

		var event = L.Util.extend({}, data, { type: type, target: this });

		var events = this[eventsKey],
		    listeners, i, len, typeIndex, contextId;

		if (events[type]) {
			// make sure adding/removing listeners inside other listeners won't cause infinite loop
			listeners = events[type].slice();

			for (i = 0, len = listeners.length; i < len; i++) {
				listeners[i].action.call(listeners[i].context, event);
			}
		}

		// fire event for the context-indexed listeners as well
		typeIndex = events[type + '_idx'];

		for (contextId in typeIndex) {
			listeners = typeIndex[contextId].slice();

			if (listeners) {
				for (i = 0, len = listeners.length; i < len; i++) {
					listeners[i].action.call(listeners[i].context, event);
				}
			}
		}

		return this;
	},

	addOneTimeEventListener: function (types, fn, context) {

		if (L.Util.invokeEach(types, this.addOneTimeEventListener, this, fn, context)) { return this; }

		var handler = L.bind(function () {
			this
			    .removeEventListener(types, fn, context)
			    .removeEventListener(types, handler, context);
		}, this);

		return this
		    .addEventListener(types, fn, context)
		    .addEventListener(types, handler, context);
	}
};

L.Mixin.Events.on = L.Mixin.Events.addEventListener;
L.Mixin.Events.off = L.Mixin.Events.removeEventListener;
L.Mixin.Events.once = L.Mixin.Events.addOneTimeEventListener;
L.Mixin.Events.fire = L.Mixin.Events.fireEvent;


/*
 * L.Browser handles different browser and feature detections for internal Leaflet use.
 */

(function () {

	var ie = 'ActiveXObject' in window,
		ielt9 = ie && !document.addEventListener,

	    // terrible browser detection to work around Safari / iOS / Android browser bugs
	    ua = navigator.userAgent.toLowerCase(),
	    webkit = ua.indexOf('webkit') !== -1,
	    chrome = ua.indexOf('chrome') !== -1,
	    phantomjs = ua.indexOf('phantom') !== -1,
	    android = ua.indexOf('android') !== -1,
	    android23 = ua.search('android [23]') !== -1,
		gecko = ua.indexOf('gecko') !== -1,

	    mobile = typeof orientation !== undefined + '',
	    msPointer = window.navigator && window.navigator.msPointerEnabled &&
	              window.navigator.msMaxTouchPoints && !window.PointerEvent,
		pointer = (window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints) ||
				  msPointer,
	    retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1) ||
	             ('matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') &&
	              window.matchMedia('(min-resolution:144dpi)').matches),

	    doc = document.documentElement,
	    ie3d = ie && ('transition' in doc.style),
	    webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
	    gecko3d = 'MozPerspective' in doc.style,
	    opera3d = 'OTransition' in doc.style,
	    any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d || opera3d) && !phantomjs;


	// PhantomJS has 'ontouchstart' in document.documentElement, but doesn't actually support touch.
	// https://github.com/Leaflet/Leaflet/pull/1434#issuecomment-13843151

	var touch = !window.L_NO_TOUCH && !phantomjs && (function () {

		var startName = 'ontouchstart';

		// IE10+ (We simulate these into touch* events in L.DomEvent and L.DomEvent.Pointer) or WebKit, etc.
		if (pointer || (startName in doc)) {
			return true;
		}

		// Firefox/Gecko
		var div = document.createElement('div'),
		    supported = false;

		if (!div.setAttribute) {
			return false;
		}
		div.setAttribute(startName, 'return;');

		if (typeof div[startName] === 'function') {
			supported = true;
		}

		div.removeAttribute(startName);
		div = null;

		return supported;
	}());


	L.Browser = {
		ie: ie,
		ielt9: ielt9,
		webkit: webkit,
		gecko: gecko && !webkit && !window.opera && !ie,

		android: android,
		android23: android23,

		chrome: chrome,

		ie3d: ie3d,
		webkit3d: webkit3d,
		gecko3d: gecko3d,
		opera3d: opera3d,
		any3d: any3d,

		mobile: mobile,
		mobileWebkit: mobile && webkit,
		mobileWebkit3d: mobile && webkit3d,
		mobileOpera: mobile && window.opera,

		touch: touch,
		msPointer: msPointer,
		pointer: pointer,

		retina: retina
	};

}());


/*
 * L.Point represents a point with x and y coordinates.
 */

L.Point = function (/*Number*/ x, /*Number*/ y, /*Boolean*/ round) {
	this.x = (round ? Math.round(x) : x);
	this.y = (round ? Math.round(y) : y);
};

L.Point.prototype = {

	clone: function () {
		return new L.Point(this.x, this.y);
	},

	// non-destructive, returns a new point
	add: function (point) {
		return this.clone()._add(L.point(point));
	},

	// destructive, used directly for performance in situations where it's safe to modify existing point
	_add: function (point) {
		this.x += point.x;
		this.y += point.y;
		return this;
	},

	subtract: function (point) {
		return this.clone()._subtract(L.point(point));
	},

	_subtract: function (point) {
		this.x -= point.x;
		this.y -= point.y;
		return this;
	},

	divideBy: function (num) {
		return this.clone()._divideBy(num);
	},

	_divideBy: function (num) {
		this.x /= num;
		this.y /= num;
		return this;
	},

	multiplyBy: function (num) {
		return this.clone()._multiplyBy(num);
	},

	_multiplyBy: function (num) {
		this.x *= num;
		this.y *= num;
		return this;
	},

	round: function () {
		return this.clone()._round();
	},

	_round: function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	},

	floor: function () {
		return this.clone()._floor();
	},

	_floor: function () {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	},

	distanceTo: function (point) {
		point = L.point(point);

		var x = point.x - this.x,
		    y = point.y - this.y;

		return Math.sqrt(x * x + y * y);
	},

	equals: function (point) {
		point = L.point(point);

		return point.x === this.x &&
		       point.y === this.y;
	},

	contains: function (point) {
		point = L.point(point);

		return Math.abs(point.x) <= Math.abs(this.x) &&
		       Math.abs(point.y) <= Math.abs(this.y);
	},

	toString: function () {
		return 'Point(' +
		        L.Util.formatNum(this.x) + ', ' +
		        L.Util.formatNum(this.y) + ')';
	}
};

L.point = function (x, y, round) {
	if (x instanceof L.Point) {
		return x;
	}
	if (L.Util.isArray(x)) {
		return new L.Point(x[0], x[1]);
	}
	if (x === undefined || x === null) {
		return x;
	}
	return new L.Point(x, y, round);
};


/*
 * L.Bounds represents a rectangular area on the screen in pixel coordinates.
 */

L.Bounds = function (a, b) { //(Point, Point) or Point[]
	if (!a) { return; }

	var points = b ? [a, b] : a;

	for (var i = 0, len = points.length; i < len; i++) {
		this.extend(points[i]);
	}
};

L.Bounds.prototype = {
	// extend the bounds to contain the given point
	extend: function (point) { // (Point)
		point = L.point(point);

		if (!this.min && !this.max) {
			this.min = point.clone();
			this.max = point.clone();
		} else {
			this.min.x = Math.min(point.x, this.min.x);
			this.max.x = Math.max(point.x, this.max.x);
			this.min.y = Math.min(point.y, this.min.y);
			this.max.y = Math.max(point.y, this.max.y);
		}
		return this;
	},

	getCenter: function (round) { // (Boolean) -> Point
		return new L.Point(
		        (this.min.x + this.max.x) / 2,
		        (this.min.y + this.max.y) / 2, round);
	},

	getBottomLeft: function () { // -> Point
		return new L.Point(this.min.x, this.max.y);
	},

	getTopRight: function () { // -> Point
		return new L.Point(this.max.x, this.min.y);
	},

	getSize: function () {
		return this.max.subtract(this.min);
	},

	contains: function (obj) { // (Bounds) or (Point) -> Boolean
		var min, max;

		if (typeof obj[0] === 'number' || obj instanceof L.Point) {
			obj = L.point(obj);
		} else {
			obj = L.bounds(obj);
		}

		if (obj instanceof L.Bounds) {
			min = obj.min;
			max = obj.max;
		} else {
			min = max = obj;
		}

		return (min.x >= this.min.x) &&
		       (max.x <= this.max.x) &&
		       (min.y >= this.min.y) &&
		       (max.y <= this.max.y);
	},

	intersects: function (bounds) { // (Bounds) -> Boolean
		bounds = L.bounds(bounds);

		var min = this.min,
		    max = this.max,
		    min2 = bounds.min,
		    max2 = bounds.max,
		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

		return xIntersects && yIntersects;
	},

	isValid: function () {
		return !!(this.min && this.max);
	}
};

L.bounds = function (a, b) { // (Bounds) or (Point, Point) or (Point[])
	if (!a || a instanceof L.Bounds) {
		return a;
	}
	return new L.Bounds(a, b);
};


/*
 * L.Transformation is an utility class to perform simple point transformations through a 2d-matrix.
 */

L.Transformation = function (a, b, c, d) {
	this._a = a;
	this._b = b;
	this._c = c;
	this._d = d;
};

L.Transformation.prototype = {
	transform: function (point, scale) { // (Point, Number) -> Point
		return this._transform(point.clone(), scale);
	},

	// destructive transform (faster)
	_transform: function (point, scale) {
		scale = scale || 1;
		point.x = scale * (this._a * point.x + this._b);
		point.y = scale * (this._c * point.y + this._d);
		return point;
	},

	untransform: function (point, scale) {
		scale = scale || 1;
		return new L.Point(
		        (point.x / scale - this._b) / this._a,
		        (point.y / scale - this._d) / this._c);
	}
};


/*
 * L.DomUtil contains various utility functions for working with DOM.
 */

L.DomUtil = {
	get: function (id) {
		return (typeof id === 'string' ? document.getElementById(id) : id);
	},

	getStyle: function (el, style) {

		var value = el.style[style];

		if (!value && el.currentStyle) {
			value = el.currentStyle[style];
		}

		if ((!value || value === 'auto') && document.defaultView) {
			var css = document.defaultView.getComputedStyle(el, null);
			value = css ? css[style] : null;
		}

		return value === 'auto' ? null : value;
	},

	getViewportOffset: function (element) {

		var top = 0,
		    left = 0,
		    el = element,
		    docBody = document.body,
		    docEl = document.documentElement,
		    pos;

		do {
			top  += el.offsetTop  || 0;
			left += el.offsetLeft || 0;

			//add borders
			top += parseInt(L.DomUtil.getStyle(el, 'borderTopWidth'), 10) || 0;
			left += parseInt(L.DomUtil.getStyle(el, 'borderLeftWidth'), 10) || 0;

			pos = L.DomUtil.getStyle(el, 'position');

			if (el.offsetParent === docBody && pos === 'absolute') { break; }

			if (pos === 'fixed') {
				top  += docBody.scrollTop  || docEl.scrollTop  || 0;
				left += docBody.scrollLeft || docEl.scrollLeft || 0;
				break;
			}

			if (pos === 'relative' && !el.offsetLeft) {
				var width = L.DomUtil.getStyle(el, 'width'),
				    maxWidth = L.DomUtil.getStyle(el, 'max-width'),
				    r = el.getBoundingClientRect();

				if (width !== 'none' || maxWidth !== 'none') {
					left += r.left + el.clientLeft;
				}

				//calculate full y offset since we're breaking out of the loop
				top += r.top + (docBody.scrollTop  || docEl.scrollTop  || 0);

				break;
			}

			el = el.offsetParent;

		} while (el);

		el = element;

		do {
			if (el === docBody) { break; }

			top  -= el.scrollTop  || 0;
			left -= el.scrollLeft || 0;

			el = el.parentNode;
		} while (el);

		return new L.Point(left, top);
	},

	documentIsLtr: function () {
		if (!L.DomUtil._docIsLtrCached) {
			L.DomUtil._docIsLtrCached = true;
			L.DomUtil._docIsLtr = L.DomUtil.getStyle(document.body, 'direction') === 'ltr';
		}
		return L.DomUtil._docIsLtr;
	},

	create: function (tagName, className, container) {

		var el = document.createElement(tagName);
		el.className = className;

		if (container) {
			container.appendChild(el);
		}

		return el;
	},

	hasClass: function (el, name) {
		if (el.classList !== undefined) {
			return el.classList.contains(name);
		}
		var className = L.DomUtil._getClass(el);
		return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
	},

	addClass: function (el, name) {
		if (el.classList !== undefined) {
			var classes = L.Util.splitWords(name);
			for (var i = 0, len = classes.length; i < len; i++) {
				el.classList.add(classes[i]);
			}
		} else if (!L.DomUtil.hasClass(el, name)) {
			var className = L.DomUtil._getClass(el);
			L.DomUtil._setClass(el, (className ? className + ' ' : '') + name);
		}
	},

	removeClass: function (el, name) {
		if (el.classList !== undefined) {
			el.classList.remove(name);
		} else {
			L.DomUtil._setClass(el, L.Util.trim((' ' + L.DomUtil._getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
		}
	},

	_setClass: function (el, name) {
		if (el.className.baseVal === undefined) {
			el.className = name;
		} else {
			// in case of SVG element
			el.className.baseVal = name;
		}
	},

	_getClass: function (el) {
		return el.className.baseVal === undefined ? el.className : el.className.baseVal;
	},

	setOpacity: function (el, value) {

		if ('opacity' in el.style) {
			el.style.opacity = value;

		} else if ('filter' in el.style) {

			var filter = false,
			    filterName = 'DXImageTransform.Microsoft.Alpha';

			// filters collection throws an error if we try to retrieve a filter that doesn't exist
			try {
				filter = el.filters.item(filterName);
			} catch (e) {
				// don't set opacity to 1 if we haven't already set an opacity,
				// it isn't needed and breaks transparent pngs.
				if (value === 1) { return; }
			}

			value = Math.round(value * 100);

			if (filter) {
				filter.Enabled = (value !== 100);
				filter.Opacity = value;
			} else {
				el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
			}
		}
	},

	testProp: function (props) {

		var style = document.documentElement.style;

		for (var i = 0; i < props.length; i++) {
			if (props[i] in style) {
				return props[i];
			}
		}
		return false;
	},

	getTranslateString: function (point) {
		// on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
		// makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
		// (same speed either way), Opera 12 doesn't support translate3d

		var is3d = L.Browser.webkit3d,
		    open = 'translate' + (is3d ? '3d' : '') + '(',
		    close = (is3d ? ',0' : '') + ')';

		return open + point.x + 'px,' + point.y + 'px' + close;
	},

	getScaleString: function (scale, origin) {

		var preTranslateStr = L.DomUtil.getTranslateString(origin.add(origin.multiplyBy(-1 * scale))),
		    scaleStr = ' scale(' + scale + ') ';

		return preTranslateStr + scaleStr;
	},

	setPosition: function (el, point, disable3D) { // (HTMLElement, Point[, Boolean])

		// jshint camelcase: false
		el._leaflet_pos = point;

		if (!disable3D && L.Browser.any3d) {
			el.style[L.DomUtil.TRANSFORM] =  L.DomUtil.getTranslateString(point);
		} else {
			el.style.left = point.x + 'px';
			el.style.top = point.y + 'px';
		}
	},

	getPosition: function (el) {
		// this method is only used for elements previously positioned using setPosition,
		// so it's safe to cache the position for performance

		// jshint camelcase: false
		return el._leaflet_pos;
	}
};


// prefix style property names

L.DomUtil.TRANSFORM = L.DomUtil.testProp(
        ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

// webkitTransition comes first because some browser versions that drop vendor prefix don't do
// the same for the transitionend event, in particular the Android 4.1 stock browser

L.DomUtil.TRANSITION = L.DomUtil.testProp(
        ['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

L.DomUtil.TRANSITION_END =
        L.DomUtil.TRANSITION === 'webkitTransition' || L.DomUtil.TRANSITION === 'OTransition' ?
        L.DomUtil.TRANSITION + 'End' : 'transitionend';

(function () {
    if ('onselectstart' in document) {
        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                L.DomEvent.on(window, 'selectstart', L.DomEvent.preventDefault);
            },

            enableTextSelection: function () {
                L.DomEvent.off(window, 'selectstart', L.DomEvent.preventDefault);
            }
        });
    } else {
        var userSelectProperty = L.DomUtil.testProp(
            ['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

        L.extend(L.DomUtil, {
            disableTextSelection: function () {
                if (userSelectProperty) {
                    var style = document.documentElement.style;
                    this._userSelect = style[userSelectProperty];
                    style[userSelectProperty] = 'none';
                }
            },

            enableTextSelection: function () {
                if (userSelectProperty) {
                    document.documentElement.style[userSelectProperty] = this._userSelect;
                    delete this._userSelect;
                }
            }
        });
    }

	L.extend(L.DomUtil, {
		disableImageDrag: function () {
			L.DomEvent.on(window, 'dragstart', L.DomEvent.preventDefault);
		},

		enableImageDrag: function () {
			L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);
		}
	});
})();


/*
 * L.LatLng represents a geographical point with latitude and longitude coordinates.
 */

L.LatLng = function (lat, lng, alt) { // (Number, Number, Number)
	lat = parseFloat(lat);
	lng = parseFloat(lng);

	if (isNaN(lat) || isNaN(lng)) {
		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	}

	this.lat = lat;
	this.lng = lng;

	if (alt !== undefined) {
		this.alt = parseFloat(alt);
	}
};

L.extend(L.LatLng, {
	DEG_TO_RAD: Math.PI / 180,
	RAD_TO_DEG: 180 / Math.PI,
	MAX_MARGIN: 1.0E-9 // max margin of error for the "equals" check
});

L.LatLng.prototype = {
	equals: function (obj) { // (LatLng) -> Boolean
		if (!obj) { return false; }

		obj = L.latLng(obj);

		var margin = Math.max(
		        Math.abs(this.lat - obj.lat),
		        Math.abs(this.lng - obj.lng));

		return margin <= L.LatLng.MAX_MARGIN;
	},

	toString: function (precision) { // (Number) -> String
		return 'LatLng(' +
		        L.Util.formatNum(this.lat, precision) + ', ' +
		        L.Util.formatNum(this.lng, precision) + ')';
	},

	// Haversine distance formula, see http://en.wikipedia.org/wiki/Haversine_formula
	// TODO move to projection code, LatLng shouldn't know about Earth
	distanceTo: function (other) { // (LatLng) -> Number
		other = L.latLng(other);

		var R = 6378137, // earth radius in meters
		    d2r = L.LatLng.DEG_TO_RAD,
		    dLat = (other.lat - this.lat) * d2r,
		    dLon = (other.lng - this.lng) * d2r,
		    lat1 = this.lat * d2r,
		    lat2 = other.lat * d2r,
		    sin1 = Math.sin(dLat / 2),
		    sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	},

	wrap: function (a, b) { // (Number, Number) -> LatLng
		var lng = this.lng;

		a = a || -180;
		b = b ||  180;

		lng = (lng + b) % (b - a) + (lng < a || lng === b ? b : a);

		return new L.LatLng(this.lat, lng);
	}
};

L.latLng = function (a, b) { // (LatLng) or ([Number, Number]) or (Number, Number)
	if (a instanceof L.LatLng) {
		return a;
	}
	if (L.Util.isArray(a)) {
		if (typeof a[0] === 'number' || typeof a[0] === 'string') {
			return new L.LatLng(a[0], a[1], a[2]);
		} else {
			return null;
		}
	}
	if (a === undefined || a === null) {
		return a;
	}
	if (typeof a === 'object' && 'lat' in a) {
		return new L.LatLng(a.lat, 'lng' in a ? a.lng : a.lon);
	}
	if (b === undefined) {
		return null;
	}
	return new L.LatLng(a, b);
};



/*
 * L.LatLngBounds represents a rectangular area on the map in geographical coordinates.
 */

L.LatLngBounds = function (southWest, northEast) { // (LatLng, LatLng) or (LatLng[])
	if (!southWest) { return; }

	var latlngs = northEast ? [southWest, northEast] : southWest;

	for (var i = 0, len = latlngs.length; i < len; i++) {
		this.extend(latlngs[i]);
	}
};

L.LatLngBounds.prototype = {
	// extend the bounds to contain the given point or bounds
	extend: function (obj) { // (LatLng) or (LatLngBounds)
		if (!obj) { return this; }

		var latLng = L.latLng(obj);
		if (latLng !== null) {
			obj = latLng;
		} else {
			obj = L.latLngBounds(obj);
		}

		if (obj instanceof L.LatLng) {
			if (!this._southWest && !this._northEast) {
				this._southWest = new L.LatLng(obj.lat, obj.lng);
				this._northEast = new L.LatLng(obj.lat, obj.lng);
			} else {
				this._southWest.lat = Math.min(obj.lat, this._southWest.lat);
				this._southWest.lng = Math.min(obj.lng, this._southWest.lng);

				this._northEast.lat = Math.max(obj.lat, this._northEast.lat);
				this._northEast.lng = Math.max(obj.lng, this._northEast.lng);
			}
		} else if (obj instanceof L.LatLngBounds) {
			this.extend(obj._southWest);
			this.extend(obj._northEast);
		}
		return this;
	},

	// extend the bounds by a percentage
	pad: function (bufferRatio) { // (Number) -> LatLngBounds
		var sw = this._southWest,
		    ne = this._northEast,
		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

		return new L.LatLngBounds(
		        new L.LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
		        new L.LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
	},

	getCenter: function () { // -> LatLng
		return new L.LatLng(
		        (this._southWest.lat + this._northEast.lat) / 2,
		        (this._southWest.lng + this._northEast.lng) / 2);
	},

	getSouthWest: function () {
		return this._southWest;
	},

	getNorthEast: function () {
		return this._northEast;
	},

	getNorthWest: function () {
		return new L.LatLng(this.getNorth(), this.getWest());
	},

	getSouthEast: function () {
		return new L.LatLng(this.getSouth(), this.getEast());
	},

	getWest: function () {
		return this._southWest.lng;
	},

	getSouth: function () {
		return this._southWest.lat;
	},

	getEast: function () {
		return this._northEast.lng;
	},

	getNorth: function () {
		return this._northEast.lat;
	},

	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
		if (typeof obj[0] === 'number' || obj instanceof L.LatLng) {
			obj = L.latLng(obj);
		} else {
			obj = L.latLngBounds(obj);
		}

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof L.LatLngBounds) {
			sw2 = obj.getSouthWest();
			ne2 = obj.getNorthEast();
		} else {
			sw2 = ne2 = obj;
		}

		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
	},

	intersects: function (bounds) { // (LatLngBounds)
		bounds = L.latLngBounds(bounds);

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.getSouthWest(),
		    ne2 = bounds.getNorthEast(),

		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

		return latIntersects && lngIntersects;
	},

	toBBoxString: function () {
		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
	},

	equals: function (bounds) { // (LatLngBounds)
		if (!bounds) { return false; }

		bounds = L.latLngBounds(bounds);

		return this._southWest.equals(bounds.getSouthWest()) &&
		       this._northEast.equals(bounds.getNorthEast());
	},

	isValid: function () {
		return !!(this._southWest && this._northEast);
	}
};

//TODO International date line?

L.latLngBounds = function (a, b) { // (LatLngBounds) or (LatLng, LatLng)
	if (!a || a instanceof L.LatLngBounds) {
		return a;
	}
	return new L.LatLngBounds(a, b);
};


/*
 * L.Projection contains various geographical projections used by CRS classes.
 */

L.Projection = {};


/*
 * Spherical Mercator is the most popular map projection, used by EPSG:3857 CRS used by default.
 */

L.Projection.SphericalMercator = {
	MAX_LATITUDE: 85.0511287798,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    x = latlng.lng * d,
		    y = lat * d;

		y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    lng = point.x * d,
		    lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;

		return new L.LatLng(lat, lng);
	}
};


/*
 * Simple equirectangular (Plate Carree) projection, used by CRS like EPSG:4326 and Simple.
 */

L.Projection.LonLat = {
	project: function (latlng) {
		return new L.Point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return new L.LatLng(point.y, point.x);
	}
};


/*
 * L.CRS is a base object for all defined CRS (Coordinate Reference Systems) in Leaflet.
 */

L.CRS = {
	latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
		var projectedPoint = this.projection.project(latlng),
		    scale = this.scale(zoom);

		return this.transformation._transform(projectedPoint, scale);
	},

	pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
		var scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);

		return this.projection.unproject(untransformedPoint);
	},

	project: function (latlng) {
		return this.projection.project(latlng);
	},

	scale: function (zoom) {
		return 256 * Math.pow(2, zoom);
	},

	getSize: function (zoom) {
		var s = this.scale(zoom);
		return L.point(s, s);
	}
};


/*
 * A simple CRS that can be used for flat non-Earth maps like panoramas or game maps.
 */

L.CRS.Simple = L.extend({}, L.CRS, {
	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1, 0, -1, 0),

	scale: function (zoom) {
		return Math.pow(2, zoom);
	}
});


/*
 * L.CRS.EPSG3857 (Spherical Mercator) is the most common CRS for web mapping
 * and is used by Leaflet by default.
 */

L.CRS.EPSG3857 = L.extend({}, L.CRS, {
	code: 'EPSG:3857',

	projection: L.Projection.SphericalMercator,
	transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),

	project: function (latlng) { // (LatLng) -> Point
		var projectedPoint = this.projection.project(latlng),
		    earthRadius = 6378137;
		return projectedPoint.multiplyBy(earthRadius);
	}
});

L.CRS.EPSG900913 = L.extend({}, L.CRS.EPSG3857, {
	code: 'EPSG:900913'
});


/*
 * L.CRS.EPSG4326 is a CRS popular among advanced GIS specialists.
 */

L.CRS.EPSG4326 = L.extend({}, L.CRS, {
	code: 'EPSG:4326',

	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1 / 360, 0.5, -1 / 360, 0.5)
});


/*
 * L.Map is the central class of the API - it is used to create a map.
 */

L.Map = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		crs: L.CRS.EPSG3857,

		/*
		center: LatLng,
		zoom: Number,
		layers: Array,
		*/

		fadeAnimation: L.DomUtil.TRANSITION && !L.Browser.android23,
		trackResize: true,
		markerZoomAnimation: L.DomUtil.TRANSITION && L.Browser.any3d
	},

	initialize: function (id, options) { // (HTMLElement or String, Object)
		options = L.setOptions(this, options);


		this._initContainer(id);
		this._initLayout();

		// hack for https://github.com/Leaflet/Leaflet/issues/1980
		this._onResize = L.bind(this._onResize, this);

		this._initEvents();

		if (options.maxBounds) {
			this.setMaxBounds(options.maxBounds);
		}

		if (options.center && options.zoom !== undefined) {
			this.setView(L.latLng(options.center), options.zoom, {reset: true});
		}

		this._handlers = [];

		this._layers = {};
		this._zoomBoundLayers = {};
		this._tileLayersNum = 0;

		this.callInitHooks();

		this._addLayers(options.layers);
	},


	// public methods that modify map state

	// replaced by animation-powered implementation in Map.PanAnimation.js
	setView: function (center, zoom) {
		zoom = zoom === undefined ? this.getZoom() : zoom;
		this._resetView(L.latLng(center), this._limitZoom(zoom));
		return this;
	},

	setZoom: function (zoom, options) {
		if (!this._loaded) {
			this._zoom = this._limitZoom(zoom);
			return this;
		}
		return this.setView(this.getCenter(), zoom, {zoom: options});
	},

	zoomIn: function (delta, options) {
		return this.setZoom(this._zoom + (delta || 1), options);
	},

	zoomOut: function (delta, options) {
		return this.setZoom(this._zoom - (delta || 1), options);
	},

	setZoomAround: function (latlng, zoom, options) {
		var scale = this.getZoomScale(zoom),
		    viewHalf = this.getSize().divideBy(2),
		    containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng),

		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

		return this.setView(newCenter, zoom, {zoom: options});
	},

	fitBounds: function (bounds, options) {

		options = options || {};
		bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);

		var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),

		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR)),
		    paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

		    swPoint = this.project(bounds.getSouthWest(), zoom),
		    nePoint = this.project(bounds.getNorthEast(), zoom),
		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

		zoom = options && options.maxZoom ? Math.min(options.maxZoom, zoom) : zoom;

		return this.setView(center, zoom, options);
	},

	fitWorld: function (options) {
		return this.fitBounds([[-90, -180], [90, 180]], options);
	},

	panTo: function (center, options) { // (LatLng)
		return this.setView(center, this._zoom, {pan: options});
	},

	panBy: function (offset) { // (Point)
		// replaced with animated panBy in Map.PanAnimation.js
		this.fire('movestart');

		this._rawPanBy(L.point(offset));

		this.fire('move');
		return this.fire('moveend');
	},

	setMaxBounds: function (bounds) {
		bounds = L.latLngBounds(bounds);

		this.options.maxBounds = bounds;

		if (!bounds) {
			return this.off('moveend', this._panInsideMaxBounds, this);
		}

		if (this._loaded) {
			this._panInsideMaxBounds();
		}

		return this.on('moveend', this._panInsideMaxBounds, this);
	},

	panInsideBounds: function (bounds, options) {
		var center = this.getCenter(),
			newCenter = this._limitCenter(center, this._zoom, bounds);

		if (center.equals(newCenter)) { return this; }

		return this.panTo(newCenter, options);
	},

	addLayer: function (layer) {
		// TODO method is too big, refactor

		var id = L.stamp(layer);

		if (this._layers[id]) { return this; }

		this._layers[id] = layer;

		// TODO getMaxZoom, getMinZoom in ILayer (instead of options)
		if (layer.options && (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom))) {
			this._zoomBoundLayers[id] = layer;
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor!!!
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum++;
			this._tileLayersToLoad++;
			layer.on('load', this._onTileLayerLoad, this);
		}

		if (this._loaded) {
			this._layerAdd(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);

		if (!this._layers[id]) { return this; }

		if (this._loaded) {
			layer.onRemove(this);
		}

		delete this._layers[id];

		if (this._loaded) {
			this.fire('layerremove', {layer: layer});
		}

		if (this._zoomBoundLayers[id]) {
			delete this._zoomBoundLayers[id];
			this._updateZoomLevels();
		}

		// TODO looks ugly, refactor
		if (this.options.zoomAnimation && L.TileLayer && (layer instanceof L.TileLayer)) {
			this._tileLayersNum--;
			this._tileLayersToLoad--;
			layer.off('load', this._onTileLayerLoad, this);
		}

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (L.stamp(layer) in this._layers);
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	invalidateSize: function (options) {
		if (!this._loaded) { return this; }

		options = L.extend({
			animate: false,
			pan: true
		}, options === true ? {animate: true} : options);

		var oldSize = this.getSize();
		this._sizeChanged = true;
		this._initialCenter = null;

		var newSize = this.getSize(),
		    oldCenter = oldSize.divideBy(2).round(),
		    newCenter = newSize.divideBy(2).round(),
		    offset = oldCenter.subtract(newCenter);

		if (!offset.x && !offset.y) { return this; }

		if (options.animate && options.pan) {
			this.panBy(offset);

		} else {
			if (options.pan) {
				this._rawPanBy(offset);
			}

			this.fire('move');

			if (options.debounceMoveend) {
				clearTimeout(this._sizeTimer);
				this._sizeTimer = setTimeout(L.bind(this.fire, this, 'moveend'), 200);
			} else {
				this.fire('moveend');
			}
		}

		return this.fire('resize', {
			oldSize: oldSize,
			newSize: newSize
		});
	},

	// TODO handler.addTo
	addHandler: function (name, HandlerClass) {
		if (!HandlerClass) { return this; }

		var handler = this[name] = new HandlerClass(this);

		this._handlers.push(handler);

		if (this.options[name]) {
			handler.enable();
		}

		return this;
	},

	remove: function () {
		if (this._loaded) {
			this.fire('unload');
		}

		this._initEvents('off');

		try {
			// throws error in IE6-8
			delete this._container._leaflet;
		} catch (e) {
			this._container._leaflet = undefined;
		}

		this._clearPanes();
		if (this._clearControlPos) {
			this._clearControlPos();
		}

		this._clearHandlers();

		return this;
	},


	// public methods for getting map state

	getCenter: function () { // (Boolean) -> LatLng
		this._checkIfLoaded();

		if (this._initialCenter && !this._moved()) {
			return this._initialCenter;
		}
		return this.layerPointToLatLng(this._getCenterLayerPoint());
	},

	getZoom: function () {
		return this._zoom;
	},

	getBounds: function () {
		var bounds = this.getPixelBounds(),
		    sw = this.unproject(bounds.getBottomLeft()),
		    ne = this.unproject(bounds.getTopRight());

		return new L.LatLngBounds(sw, ne);
	},

	getMinZoom: function () {
		return this.options.minZoom === undefined ?
			(this._layersMinZoom === undefined ? 0 : this._layersMinZoom) :
			this.options.minZoom;
	},

	getMaxZoom: function () {
		return this.options.maxZoom === undefined ?
			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
			this.options.maxZoom;
	},

	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
		bounds = L.latLngBounds(bounds);

		var zoom = this.getMinZoom() - (inside ? 1 : 0),
		    maxZoom = this.getMaxZoom(),
		    size = this.getSize(),

		    nw = bounds.getNorthWest(),
		    se = bounds.getSouthEast(),

		    zoomNotFound = true,
		    boundsSize;

		padding = L.point(padding || [0, 0]);

		do {
			zoom++;
			boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)).add(padding);
			zoomNotFound = !inside ? size.contains(boundsSize) : boundsSize.x < size.x || boundsSize.y < size.y;

		} while (zoomNotFound && zoom <= maxZoom);

		if (zoomNotFound && inside) {
			return null;
		}

		return inside ? zoom : zoom - 1;
	},

	getSize: function () {
		if (!this._size || this._sizeChanged) {
			this._size = new L.Point(
				this._container.clientWidth,
				this._container.clientHeight);

			this._sizeChanged = false;
		}
		return this._size.clone();
	},

	getPixelBounds: function () {
		var topLeftPoint = this._getTopLeftPoint();
		return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
	},

	getPixelOrigin: function () {
		this._checkIfLoaded();
		return this._initialTopLeftPoint;
	},

	getPanes: function () {
		return this._panes;
	},

	getContainer: function () {
		return this._container;
	},


	// TODO replace with universal implementation after refactoring projections

	getZoomScale: function (toZoom) {
		var crs = this.options.crs;
		return crs.scale(toZoom) / crs.scale(this._zoom);
	},

	getScaleZoom: function (scale) {
		return this._zoom + (Math.log(scale) / Math.LN2);
	},


	// conversion methods

	project: function (latlng, zoom) { // (LatLng[, Number]) -> Point
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.latLngToPoint(L.latLng(latlng), zoom);
	},

	unproject: function (point, zoom) { // (Point[, Number]) -> LatLng
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.pointToLatLng(L.point(point), zoom);
	},

	layerPointToLatLng: function (point) { // (Point)
		var projectedPoint = L.point(point).add(this.getPixelOrigin());
		return this.unproject(projectedPoint);
	},

	latLngToLayerPoint: function (latlng) { // (LatLng)
		var projectedPoint = this.project(L.latLng(latlng))._round();
		return projectedPoint._subtract(this.getPixelOrigin());
	},

	containerPointToLayerPoint: function (point) { // (Point)
		return L.point(point).subtract(this._getMapPanePos());
	},

	layerPointToContainerPoint: function (point) { // (Point)
		return L.point(point).add(this._getMapPanePos());
	},

	containerPointToLatLng: function (point) {
		var layerPoint = this.containerPointToLayerPoint(L.point(point));
		return this.layerPointToLatLng(layerPoint);
	},

	latLngToContainerPoint: function (latlng) {
		return this.layerPointToContainerPoint(this.latLngToLayerPoint(L.latLng(latlng)));
	},

	mouseEventToContainerPoint: function (e) { // (MouseEvent)
		return L.DomEvent.getMousePosition(e, this._container);
	},

	mouseEventToLayerPoint: function (e) { // (MouseEvent)
		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
	},

	mouseEventToLatLng: function (e) { // (MouseEvent)
		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
	},


	// map initialization methods

	_initContainer: function (id) {
		var container = this._container = L.DomUtil.get(id);

		if (!container) {
			throw new Error('Map container not found.');
		} else if (container._leaflet) {
			throw new Error('Map container is already initialized.');
		}

		container._leaflet = true;
	},

	_initLayout: function () {
		var container = this._container;

		L.DomUtil.addClass(container, 'leaflet-container' +
			(L.Browser.touch ? ' leaflet-touch' : '') +
			(L.Browser.retina ? ' leaflet-retina' : '') +
			(L.Browser.ielt9 ? ' leaflet-oldie' : '') +
			(this.options.fadeAnimation ? ' leaflet-fade-anim' : ''));

		var position = L.DomUtil.getStyle(container, 'position');

		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
			container.style.position = 'relative';
		}

		this._initPanes();

		if (this._initControlPos) {
			this._initControlPos();
		}
	},

	_initPanes: function () {
		var panes = this._panes = {};

		this._mapPane = panes.mapPane = this._createPane('leaflet-map-pane', this._container);

		this._tilePane = panes.tilePane = this._createPane('leaflet-tile-pane', this._mapPane);
		panes.objectsPane = this._createPane('leaflet-objects-pane', this._mapPane);
		panes.shadowPane = this._createPane('leaflet-shadow-pane');
		panes.overlayPane = this._createPane('leaflet-overlay-pane');
		panes.markerPane = this._createPane('leaflet-marker-pane');
		panes.popupPane = this._createPane('leaflet-popup-pane');

		var zoomHide = ' leaflet-zoom-hide';

		if (!this.options.markerZoomAnimation) {
			L.DomUtil.addClass(panes.markerPane, zoomHide);
			L.DomUtil.addClass(panes.shadowPane, zoomHide);
			L.DomUtil.addClass(panes.popupPane, zoomHide);
		}
	},

	_createPane: function (className, container) {
		return L.DomUtil.create('div', className, container || this._panes.objectsPane);
	},

	_clearPanes: function () {
		this._container.removeChild(this._mapPane);
	},

	_addLayers: function (layers) {
		layers = layers ? (L.Util.isArray(layers) ? layers : [layers]) : [];

		for (var i = 0, len = layers.length; i < len; i++) {
			this.addLayer(layers[i]);
		}
	},


	// private methods that modify map state

	_resetView: function (center, zoom, preserveMapOffset, afterZoomAnim) {

		var zoomChanged = (this._zoom !== zoom);

		if (!afterZoomAnim) {
			this.fire('movestart');

			if (zoomChanged) {
				this.fire('zoomstart');
			}
		}

		this._zoom = zoom;
		this._initialCenter = center;

		this._initialTopLeftPoint = this._getNewTopLeftPoint(center);

		if (!preserveMapOffset) {
			L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));
		} else {
			this._initialTopLeftPoint._add(this._getMapPanePos());
		}

		this._tileLayersToLoad = this._tileLayersNum;

		var loading = !this._loaded;
		this._loaded = true;

		this.fire('viewreset', {hard: !preserveMapOffset});

		if (loading) {
			this.fire('load');
			this.eachLayer(this._layerAdd, this);
		}

		this.fire('move');

		if (zoomChanged || afterZoomAnim) {
			this.fire('zoomend');
		}

		this.fire('moveend', {hard: !preserveMapOffset});
	},

	_rawPanBy: function (offset) {
		L.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
	},

	_getZoomSpan: function () {
		return this.getMaxZoom() - this.getMinZoom();
	},

	_updateZoomLevels: function () {
		var i,
			minZoom = Infinity,
			maxZoom = -Infinity,
			oldZoomSpan = this._getZoomSpan();

		for (i in this._zoomBoundLayers) {
			var layer = this._zoomBoundLayers[i];
			if (!isNaN(layer.options.minZoom)) {
				minZoom = Math.min(minZoom, layer.options.minZoom);
			}
			if (!isNaN(layer.options.maxZoom)) {
				maxZoom = Math.max(maxZoom, layer.options.maxZoom);
			}
		}

		if (i === undefined) { // we have no tilelayers
			this._layersMaxZoom = this._layersMinZoom = undefined;
		} else {
			this._layersMaxZoom = maxZoom;
			this._layersMinZoom = minZoom;
		}

		if (oldZoomSpan !== this._getZoomSpan()) {
			this.fire('zoomlevelschange');
		}
	},

	_panInsideMaxBounds: function () {
		this.panInsideBounds(this.options.maxBounds);
	},

	_checkIfLoaded: function () {
		if (!this._loaded) {
			throw new Error('Set map center and zoom first.');
		}
	},

	// map events

	_initEvents: function (onOff) {
		if (!L.DomEvent) { return; }

		onOff = onOff || 'on';

		L.DomEvent[onOff](this._container, 'click', this._onMouseClick, this);

		var events = ['dblclick', 'mousedown', 'mouseup', 'mouseenter',
		              'mouseleave', 'mousemove', 'contextmenu'],
		    i, len;

		for (i = 0, len = events.length; i < len; i++) {
			L.DomEvent[onOff](this._container, events[i], this._fireMouseEvent, this);
		}

		if (this.options.trackResize) {
			L.DomEvent[onOff](window, 'resize', this._onResize, this);
		}
	},

	_onResize: function () {
		L.Util.cancelAnimFrame(this._resizeRequest);
		this._resizeRequest = L.Util.requestAnimFrame(
		        function () { this.invalidateSize({debounceMoveend: true}); }, this, false, this._container);
	},

	_onMouseClick: function (e) {
		if (!this._loaded || (!e._simulated &&
		        ((this.dragging && this.dragging.moved()) ||
		         (this.boxZoom  && this.boxZoom.moved()))) ||
		            L.DomEvent._skipped(e)) { return; }

		this.fire('preclick');
		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this._loaded || L.DomEvent._skipped(e)) { return; }

		var type = e.type;

		type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

		if (!this.hasEventListeners(type)) { return; }

		if (type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}

		var containerPoint = this.mouseEventToContainerPoint(e),
		    layerPoint = this.containerPointToLayerPoint(containerPoint),
		    latlng = this.layerPointToLatLng(layerPoint);

		this.fire(type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});
	},

	_onTileLayerLoad: function () {
		this._tileLayersToLoad--;
		if (this._tileLayersNum && !this._tileLayersToLoad) {
			this.fire('tilelayersload');
		}
	},

	_clearHandlers: function () {
		for (var i = 0, len = this._handlers.length; i < len; i++) {
			this._handlers[i].disable();
		}
	},

	whenReady: function (callback, context) {
		if (this._loaded) {
			callback.call(context || this, this);
		} else {
			this.on('load', callback, context);
		}
		return this;
	},

	_layerAdd: function (layer) {
		layer.onAdd(this);
		this.fire('layeradd', {layer: layer});
	},


	// private methods for getting map state

	_getMapPanePos: function () {
		return L.DomUtil.getPosition(this._mapPane);
	},

	_moved: function () {
		var pos = this._getMapPanePos();
		return pos && !pos.equals([0, 0]);
	},

	_getTopLeftPoint: function () {
		return this.getPixelOrigin().subtract(this._getMapPanePos());
	},

	_getNewTopLeftPoint: function (center, zoom) {
		var viewHalf = this.getSize()._divideBy(2);
		// TODO round on display, not calculation to increase precision?
		return this.project(center, zoom)._subtract(viewHalf)._round();
	},

	_latLngToNewLayerPoint: function (latlng, newZoom, newCenter) {
		var topLeft = this._getNewTopLeftPoint(newCenter, newZoom).add(this._getMapPanePos());
		return this.project(latlng, newZoom)._subtract(topLeft);
	},

	// layer point of the current center
	_getCenterLayerPoint: function () {
		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
	},

	// offset of the specified place to the current center in pixels
	_getCenterOffset: function (latlng) {
		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
	},

	// adjust center for view to get inside bounds
	_limitCenter: function (center, zoom, bounds) {

		if (!bounds) { return center; }

		var centerPoint = this.project(center, zoom),
		    viewHalf = this.getSize().divideBy(2),
		    viewBounds = new L.Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

		return this.unproject(centerPoint.add(offset), zoom);
	},

	// adjust offset for view to get inside bounds
	_limitOffset: function (offset, bounds) {
		if (!bounds) { return offset; }

		var viewBounds = this.getPixelBounds(),
		    newBounds = new L.Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

		return offset.add(this._getBoundsOffset(newBounds, bounds));
	},

	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
		var nwOffset = this.project(maxBounds.getNorthWest(), zoom).subtract(pxBounds.min),
		    seOffset = this.project(maxBounds.getSouthEast(), zoom).subtract(pxBounds.max),

		    dx = this._rebound(nwOffset.x, -seOffset.x),
		    dy = this._rebound(nwOffset.y, -seOffset.y);

		return new L.Point(dx, dy);
	},

	_rebound: function (left, right) {
		return left + right > 0 ?
			Math.round(left - right) / 2 :
			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
	},

	_limitZoom: function (zoom) {
		var min = this.getMinZoom(),
		    max = this.getMaxZoom();

		return Math.max(min, Math.min(max, zoom));
	}
});

L.map = function (id, options) {
	return new L.Map(id, options);
};


/*
 * Mercator projection that takes into account that the Earth is not a perfect sphere.
 * Less popular than spherical mercator; used by projections like EPSG:3395.
 */

L.Projection.Mercator = {
	MAX_LATITUDE: 85.0840591556,

	R_MINOR: 6356752.314245179,
	R_MAJOR: 6378137,

	project: function (latlng) { // (LatLng) -> Point
		var d = L.LatLng.DEG_TO_RAD,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    x = latlng.lng * d * r,
		    y = lat * d,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1.0 - tmp * tmp),
		    con = eccent * Math.sin(y);

		con = Math.pow((1 - con) / (1 + con), eccent * 0.5);

		var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
		y = -r * Math.log(ts);

		return new L.Point(x, y);
	},

	unproject: function (point) { // (Point, Boolean) -> LatLng
		var d = L.LatLng.RAD_TO_DEG,
		    r = this.R_MAJOR,
		    r2 = this.R_MINOR,
		    lng = point.x * d / r,
		    tmp = r2 / r,
		    eccent = Math.sqrt(1 - (tmp * tmp)),
		    ts = Math.exp(- point.y / r),
		    phi = (Math.PI / 2) - 2 * Math.atan(ts),
		    numIter = 15,
		    tol = 1e-7,
		    i = numIter,
		    dphi = 0.1,
		    con;

		while ((Math.abs(dphi) > tol) && (--i > 0)) {
			con = eccent * Math.sin(phi);
			dphi = (Math.PI / 2) - 2 * Math.atan(ts *
			            Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
			phi += dphi;
		}

		return new L.LatLng(phi * d, lng);
	}
};



L.CRS.EPSG3395 = L.extend({}, L.CRS, {
	code: 'EPSG:3395',

	projection: L.Projection.Mercator,

	transformation: (function () {
		var m = L.Projection.Mercator,
		    r = m.R_MAJOR,
		    scale = 0.5 / (Math.PI * r);

		return new L.Transformation(scale, 0.5, -scale, 0.5);
	}())
});


/*
 * L.TileLayer is used for standard xyz-numbered tile layers.
 */

L.TileLayer = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		zoomOffset: 0,
		opacity: 1,
		/*
		maxNativeZoom: null,
		zIndex: null,
		tms: false,
		continuousWorld: false,
		noWrap: false,
		zoomReverse: false,
		detectRetina: false,
		reuseTiles: false,
		bounds: false,
		*/
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: L.Browser.mobile
	},

	initialize: function (url, options) {
		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			if (options.minZoom > 0) {
				options.minZoom--;
			}
			this.options.maxZoom--;
		}

		if (options.bounds) {
			options.bounds = L.latLngBounds(options.bounds);
		}

		this._url = url;

		var subdomains = this.options.subdomains;

		if (typeof subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
	},

	onAdd: function (map) {
		this._map = map;
		this._animated = map._zoomAnimated;

		// create a container div for tiles
		this._initContainer();

		// set up events
		map.on({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.on({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
			map.on('move', this._limitedUpdate, this);
		}

		this._reset();
		this._update();
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		this._container.parentNode.removeChild(this._container);

		map.off({
			'viewreset': this._reset,
			'moveend': this._update
		}, this);

		if (this._animated) {
			map.off({
				'zoomanim': this._animateZoom,
				'zoomend': this._endZoomAnim
			}, this);
		}

		if (!this.options.updateWhenIdle) {
			map.off('move', this._limitedUpdate, this);
		}

		this._container = null;
		this._map = null;
	},

	bringToFront: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.appendChild(this._container);
			this._setAutoZIndex(pane, Math.max);
		}

		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.tilePane;

		if (this._container) {
			pane.insertBefore(this._container, pane.firstChild);
			this._setAutoZIndex(pane, Math.min);
		}

		return this;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	getContainer: function () {
		return this._container;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	setZIndex: function (zIndex) {
		this.options.zIndex = zIndex;
		this._updateZIndex();

		return this;
	},

	setUrl: function (url, noRedraw) {
		this._url = url;

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}
		return this;
	},

	_updateZIndex: function () {
		if (this._container && this.options.zIndex !== undefined) {
			this._container.style.zIndex = this.options.zIndex;
		}
	},

	_setAutoZIndex: function (pane, compare) {

		var layers = pane.children,
		    edgeZIndex = -compare(Infinity, -Infinity), // -Infinity for max, Infinity for min
		    zIndex, i, len;

		for (i = 0, len = layers.length; i < len; i++) {

			if (layers[i] !== this._container) {
				zIndex = parseInt(layers[i].style.zIndex, 10);

				if (!isNaN(zIndex)) {
					edgeZIndex = compare(edgeZIndex, zIndex);
				}
			}
		}

		this.options.zIndex = this._container.style.zIndex =
		        (isFinite(edgeZIndex) ? edgeZIndex : 0) + compare(1, -1);
	},

	_updateOpacity: function () {
		var i,
		    tiles = this._tiles;

		if (L.Browser.ielt9) {
			for (i in tiles) {
				L.DomUtil.setOpacity(tiles[i], this.options.opacity);
			}
		} else {
			L.DomUtil.setOpacity(this._container, this.options.opacity);
		}
	},

	_initContainer: function () {
		var tilePane = this._map._panes.tilePane;

		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-layer');

			this._updateZIndex();

			if (this._animated) {
				var className = 'leaflet-tile-container';

				this._bgBuffer = L.DomUtil.create('div', className, this._container);
				this._tileContainer = L.DomUtil.create('div', className, this._container);

			} else {
				this._tileContainer = this._container;
			}

			tilePane.appendChild(this._container);

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}
	},

	_reset: function (e) {
		for (var key in this._tiles) {
			this.fire('tileunload', {tile: this._tiles[key]});
		}

		this._tiles = {};
		this._tilesToLoad = 0;

		if (this.options.reuseTiles) {
			this._unusedTiles = [];
		}

		this._tileContainer.innerHTML = '';

		if (this._animated && e && e.hard) {
			this._clearBgBuffer();
		}

		this._initContainer();
	},

	_getTileSize: function () {
		var map = this._map,
		    zoom = map.getZoom() + this.options.zoomOffset,
		    zoomN = this.options.maxNativeZoom,
		    tileSize = this.options.tileSize;

		if (zoomN && zoom > zoomN) {
			tileSize = Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN) * tileSize);
		}

		return tileSize;
	},

	_update: function () {

		if (!this._map) { return; }

		var map = this._map,
		    bounds = map.getPixelBounds(),
		    zoom = map.getZoom(),
		    tileSize = this._getTileSize();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var tileBounds = L.bounds(
		        bounds.min.divideBy(tileSize)._floor(),
		        bounds.max.divideBy(tileSize)._floor());

		this._addTilesFromCenterOut(tileBounds);

		if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
			this._removeOtherTiles(tileBounds);
		}
	},

	_addTilesFromCenterOut: function (bounds) {
		var queue = [],
		    center = bounds.getCenter();

		var j, i, point;

		for (j = bounds.min.y; j <= bounds.max.y; j++) {
			for (i = bounds.min.x; i <= bounds.max.x; i++) {
				point = new L.Point(i, j);

				if (this._tileShouldBeLoaded(point)) {
					queue.push(point);
				}
			}
		}

		var tilesToLoad = queue.length;

		if (tilesToLoad === 0) { return; }

		// load tiles in order of their distance to center
		queue.sort(function (a, b) {
			return a.distanceTo(center) - b.distanceTo(center);
		});

		var fragment = document.createDocumentFragment();

		// if its the first batch of tiles to load
		if (!this._tilesToLoad) {
			this.fire('loading');
		}

		this._tilesToLoad += tilesToLoad;

		for (i = 0; i < tilesToLoad; i++) {
			this._addTile(queue[i], fragment);
		}

		this._tileContainer.appendChild(fragment);
	},

	_tileShouldBeLoaded: function (tilePoint) {
		if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
			return false; // already loaded
		}

		var options = this.options;

		if (!options.continuousWorld) {
			var limit = this._getWrapTileNum();

			// don't load if exceeds world bounds
			if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) ||
				tilePoint.y < 0 || tilePoint.y >= limit.y) { return false; }
		}

		if (options.bounds) {
			var tileSize = options.tileSize,
			    nwPoint = tilePoint.multiplyBy(tileSize),
			    sePoint = nwPoint.add([tileSize, tileSize]),
			    nw = this._map.unproject(nwPoint),
			    se = this._map.unproject(sePoint);

			// TODO temporary hack, will be removed after refactoring projections
			// https://github.com/Leaflet/Leaflet/issues/1618
			if (!options.continuousWorld && !options.noWrap) {
				nw = nw.wrap();
				se = se.wrap();
			}

			if (!options.bounds.intersects([nw, se])) { return false; }
		}

		return true;
	},

	_removeOtherTiles: function (bounds) {
		var kArr, x, y, key;

		for (key in this._tiles) {
			kArr = key.split(':');
			x = parseInt(kArr[0], 10);
			y = parseInt(kArr[1], 10);

			// remove tile if it's out of bounds
			if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
				this._removeTile(key);
			}
		}
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];

		this.fire('tileunload', {tile: tile, url: tile.src});

		if (this.options.reuseTiles) {
			L.DomUtil.removeClass(tile, 'leaflet-tile-loaded');
			this._unusedTiles.push(tile);

		} else if (tile.parentNode === this._tileContainer) {
			this._tileContainer.removeChild(tile);
		}

		// for https://github.com/CloudMade/Leaflet/issues/137
		if (!L.Browser.android) {
			tile.onload = null;
			tile.src = L.Util.emptyImageUrl;
		}

		delete this._tiles[key];
	},

	_addTile: function (tilePoint, container) {
		var tilePos = this._getTilePos(tilePoint);

		// get unused tile - or create a new tile
		var tile = this._getTile();

		/*
		Chrome 20 layouts much faster with top/left (verify with timeline, frames)
		Android 4 browser has display issues with top/left and requires transform instead
		(other browsers don't currently care) - see debug/hacks/jitter.html for an example
		*/
		L.DomUtil.setPosition(tile, tilePos, L.Browser.chrome);

		this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

		this._loadTile(tile, tilePoint);

		if (tile.parentNode !== this._tileContainer) {
			container.appendChild(tile);
		}
	},

	_getZoomForUrl: function () {

		var options = this.options,
		    zoom = this._map.getZoom();

		if (options.zoomReverse) {
			zoom = options.maxZoom - zoom;
		}

		zoom += options.zoomOffset;

		return options.maxNativeZoom ? Math.min(zoom, options.maxNativeZoom) : zoom;
	},

	_getTilePos: function (tilePoint) {
		var origin = this._map.getPixelOrigin(),
		    tileSize = this._getTileSize();

		return tilePoint.multiplyBy(tileSize).subtract(origin);
	},

	// image-specific code (override to implement e.g. Canvas or SVG tile layer)

	getTileUrl: function (tilePoint) {
		return L.Util.template(this._url, L.extend({
			s: this._getSubdomain(tilePoint),
			z: tilePoint.z,
			x: tilePoint.x,
			y: tilePoint.y
		}, this.options));
	},

	_getWrapTileNum: function () {
		var crs = this._map.options.crs,
		    size = crs.getSize(this._map.getZoom());
		return size.divideBy(this._getTileSize())._floor();
	},

	_adjustTilePoint: function (tilePoint) {

		var limit = this._getWrapTileNum();

		// wrap tile coordinates
		if (!this.options.continuousWorld && !this.options.noWrap) {
			tilePoint.x = ((tilePoint.x % limit.x) + limit.x) % limit.x;
		}

		if (this.options.tms) {
			tilePoint.y = limit.y - tilePoint.y - 1;
		}

		tilePoint.z = this._getZoomForUrl();
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	_getTile: function () {
		if (this.options.reuseTiles && this._unusedTiles.length > 0) {
			var tile = this._unusedTiles.pop();
			this._resetTile(tile);
			return tile;
		}
		return this._createTile();
	},

	// Override if data stored on a tile needs to be cleaned up before reuse
	_resetTile: function (/*tile*/) {},

	_createTile: function () {
		var tile = L.DomUtil.create('img', 'leaflet-tile');
		tile.style.width = tile.style.height = this._getTileSize() + 'px';
		tile.galleryimg = 'no';

		tile.onselectstart = tile.onmousemove = L.Util.falseFn;

		if (L.Browser.ielt9 && this.options.opacity !== undefined) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}
		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.mobileWebkit3d) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer  = this;
		tile.onload  = this._tileOnLoad;
		tile.onerror = this._tileOnError;

		this._adjustTilePoint(tilePoint);
		tile.src     = this.getTileUrl(tilePoint);

		this.fire('tileloadstart', {
			tile: tile,
			url: tile.src
		});
	},

	_tileLoaded: function () {
		this._tilesToLoad--;

		if (this._animated) {
			L.DomUtil.addClass(this._tileContainer, 'leaflet-zoom-animated');
		}

		if (!this._tilesToLoad) {
			this.fire('load');

			if (this._animated) {
				// clear scaled tiles after all new tiles are loaded (for performance)
				clearTimeout(this._clearBgBufferTimer);
				this._clearBgBufferTimer = setTimeout(L.bind(this._clearBgBuffer, this), 500);
			}
		}
	},

	_tileOnLoad: function () {
		var layer = this._layer;

		//Only if we are loading an actual image
		if (this.src !== L.Util.emptyImageUrl) {
			L.DomUtil.addClass(this, 'leaflet-tile-loaded');

			layer.fire('tileload', {
				tile: this,
				url: this.src
			});
		}

		layer._tileLoaded();
	},

	_tileOnError: function () {
		var layer = this._layer;

		layer.fire('tileerror', {
			tile: this,
			url: this.src
		});

		var newUrl = layer.options.errorTileUrl;
		if (newUrl) {
			this.src = newUrl;
		}

		layer._tileLoaded();
	}
});

L.tileLayer = function (url, options) {
	return new L.TileLayer(url, options);
};


/*
 * L.TileLayer.WMS is used for putting WMS tile layers on the map.
 */

L.TileLayer.WMS = L.TileLayer.extend({

	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'image/jpeg',
		transparent: false
	},

	initialize: function (url, options) { // (String, Object)

		this._url = url;

		var wmsParams = L.extend({}, this.defaultWmsParams),
		    tileSize = options.tileSize || this.options.tileSize;

		if (options.detectRetina && L.Browser.retina) {
			wmsParams.width = wmsParams.height = tileSize * 2;
		} else {
			wmsParams.width = wmsParams.height = tileSize;
		}

		for (var i in options) {
			// all keys that are not TileLayer options go to WMS params
			if (!this.options.hasOwnProperty(i) && i !== 'crs') {
				wmsParams[i] = options[i];
			}
		}

		this.wmsParams = wmsParams;

		L.setOptions(this, options);
	},

	onAdd: function (map) {

		this._crs = this.options.crs || map.options.crs;

		this._wmsVersion = parseFloat(this.wmsParams.version);

		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
		this.wmsParams[projectionKey] = this._crs.code;

		L.TileLayer.prototype.onAdd.call(this, map);
	},

	getTileUrl: function (tilePoint) { // (Point, Number) -> String

		var map = this._map,
		    tileSize = this.options.tileSize,

		    nwPoint = tilePoint.multiplyBy(tileSize),
		    sePoint = nwPoint.add([tileSize, tileSize]),

		    nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)),
		    se = this._crs.project(map.unproject(sePoint, tilePoint.z)),
		    bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
		        [se.y, nw.x, nw.y, se.x].join(',') :
		        [nw.x, se.y, se.x, nw.y].join(','),

		    url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});

		return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
	},

	setParams: function (params, noRedraw) {

		L.extend(this.wmsParams, params);

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	}
});

L.tileLayer.wms = function (url, options) {
	return new L.TileLayer.WMS(url, options);
};


/*
 * L.TileLayer.Canvas is a class that you can use as a base for creating
 * dynamically drawn Canvas-based tile layers.
 */

L.TileLayer.Canvas = L.TileLayer.extend({
	options: {
		async: false
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	redraw: function () {
		if (this._map) {
			this._reset({hard: true});
			this._update();
		}

		for (var i in this._tiles) {
			this._redrawTile(this._tiles[i]);
		}
		return this;
	},

	_redrawTile: function (tile) {
		this.drawTile(tile, tile._tilePoint, this._map._zoom);
	},

	_createTile: function () {
		var tile = L.DomUtil.create('canvas', 'leaflet-tile');
		tile.width = tile.height = this.options.tileSize;
		tile.onselectstart = tile.onmousemove = L.Util.falseFn;
		return tile;
	},

	_loadTile: function (tile, tilePoint) {
		tile._layer = this;
		tile._tilePoint = tilePoint;

		this._redrawTile(tile);

		if (!this.options.async) {
			this.tileDrawn(tile);
		}
	},

	drawTile: function (/*tile, tilePoint*/) {
		// override with rendering code
	},

	tileDrawn: function (tile) {
		this._tileOnLoad.call(tile);
	}
});


L.tileLayer.canvas = function (options) {
	return new L.TileLayer.Canvas(options);
};


/*
 * L.ImageOverlay is used to overlay images over the map (to specific geographical bounds).
 */

L.ImageOverlay = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		opacity: 1
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = L.latLngBounds(bounds);

		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._image) {
			this._initImage();
		}

		map._panes.overlayPane.appendChild(this._image);

		map.on('viewreset', this._reset, this);

		if (map.options.zoomAnimation && L.Browser.any3d) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._reset();
	},

	onRemove: function (map) {
		map.getPanes().overlayPane.removeChild(this._image);

		map.off('viewreset', this._reset, this);

		if (map.options.zoomAnimation) {
			map.off('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		this._updateOpacity();
		return this;
	},

	// TODO remove bringToFront/bringToBack duplication from TileLayer/Path
	bringToFront: function () {
		if (this._image) {
			this._map._panes.overlayPane.appendChild(this._image);
		}
		return this;
	},

	bringToBack: function () {
		var pane = this._map._panes.overlayPane;
		if (this._image) {
			pane.insertBefore(this._image, pane.firstChild);
		}
		return this;
	},

	setUrl: function (url) {
		this._url = url;
		this._image.src = this._url;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	_initImage: function () {
		this._image = L.DomUtil.create('img', 'leaflet-image-layer');

		if (this._map.options.zoomAnimation && L.Browser.any3d) {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
		} else {
			L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
		}

		this._updateOpacity();

		//TODO createImage util method to remove duplication
		L.extend(this._image, {
			galleryimg: 'no',
			onselectstart: L.Util.falseFn,
			onmousemove: L.Util.falseFn,
			onload: L.bind(this._onImageLoad, this),
			src: this._url
		});
	},

	_animateZoom: function (e) {
		var map = this._map,
		    image = this._image,
		    scale = map.getZoomScale(e.zoom),
		    nw = this._bounds.getNorthWest(),
		    se = this._bounds.getSouthEast(),

		    topLeft = map._latLngToNewLayerPoint(nw, e.zoom, e.center),
		    size = map._latLngToNewLayerPoint(se, e.zoom, e.center)._subtract(topLeft),
		    origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));

		image.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(origin) + ' scale(' + scale + ') ';
	},

	_reset: function () {
		var image   = this._image,
		    topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		    size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);

		L.DomUtil.setPosition(image, topLeft);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_onImageLoad: function () {
		this.fire('load');
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	}
});

L.imageOverlay = function (url, bounds, options) {
	return new L.ImageOverlay(url, bounds, options);
};


/*
 * L.Icon is an image-based icon class that you can use with L.Marker for custom markers.
 */

L.Icon = L.Class.extend({
	options: {
		/*
		iconUrl: (String) (required)
		iconRetinaUrl: (String) (optional, used for retina devices if detected)
		iconSize: (Point) (can be set through CSS)
		iconAnchor: (Point) (centered by default, can be set in CSS with negative margins)
		popupAnchor: (Point) (if not specified, popup opens in the anchor point)
		shadowUrl: (String) (no shadow by default)
		shadowRetinaUrl: (String) (optional, used for retina devices if detected)
		shadowSize: (Point)
		shadowAnchor: (Point)
		*/
		className: ''
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	createIcon: function (oldIcon) {
		return this._createIcon('icon', oldIcon);
	},

	createShadow: function (oldIcon) {
		return this._createIcon('shadow', oldIcon);
	},

	_createIcon: function (name, oldIcon) {
		var src = this._getIconUrl(name);

		if (!src) {
			if (name === 'icon') {
				throw new Error('iconUrl not set in Icon options (see the docs).');
			}
			return null;
		}

		var img;
		if (!oldIcon || oldIcon.tagName !== 'IMG') {
			img = this._createImg(src);
		} else {
			img = this._createImg(src, oldIcon);
		}
		this._setIconStyles(img, name);

		return img;
	},

	_setIconStyles: function (img, name) {
		var options = this.options,
		    size = L.point(options[name + 'Size']),
		    anchor;

		if (name === 'shadow') {
			anchor = L.point(options.shadowAnchor || options.iconAnchor);
		} else {
			anchor = L.point(options.iconAnchor);
		}

		if (!anchor && size) {
			anchor = size.divideBy(2, true);
		}

		img.className = 'leaflet-marker-' + name + ' ' + options.className;

		if (anchor) {
			img.style.marginLeft = (-anchor.x) + 'px';
			img.style.marginTop  = (-anchor.y) + 'px';
		}

		if (size) {
			img.style.width  = size.x + 'px';
			img.style.height = size.y + 'px';
		}
	},

	_createImg: function (src, el) {
		el = el || document.createElement('img');
		el.src = src;
		return el;
	},

	_getIconUrl: function (name) {
		if (L.Browser.retina && this.options[name + 'RetinaUrl']) {
			return this.options[name + 'RetinaUrl'];
		}
		return this.options[name + 'Url'];
	}
});

L.icon = function (options) {
	return new L.Icon(options);
};


/*
 * L.Icon.Default is the blue marker icon used by default in Leaflet.
 */

L.Icon.Default = L.Icon.extend({

	options: {
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],

		shadowSize: [41, 41]
	},

	_getIconUrl: function (name) {
		var key = name + 'Url';

		if (this.options[key]) {
			return this.options[key];
		}

		if (L.Browser.retina && name === 'icon') {
			name += '-2x';
		}

		var path = L.Icon.Default.imagePath;

		if (!path) {
			throw new Error('Couldn\'t autodetect L.Icon.Default.imagePath, set it manually.');
		}

		return path + '/marker-' + name + '.png';
	}
});

L.Icon.Default.imagePath = (function () {
	var scripts = document.getElementsByTagName('script'),
	    leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;

	var i, len, src, matches, path;

	for (i = 0, len = scripts.length; i < len; i++) {
		src = scripts[i].src;
		matches = src.match(leafletRe);

		if (matches) {
			path = src.split(leafletRe)[0];
			return (path ? path + '/' : '') + 'images';
		}
	}
}());


/*
 * L.Marker is used to display clickable/draggable icons on the map.
 */

L.Marker = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		icon: new L.Icon.Default(),
		title: '',
		alt: '',
		clickable: true,
		draggable: false,
		keyboard: true,
		zIndexOffset: 0,
		opacity: 1,
		riseOnHover: false,
		riseOffset: 250
	},

	initialize: function (latlng, options) {
		L.setOptions(this, options);
		this._latlng = L.latLng(latlng);
	},

	onAdd: function (map) {
		this._map = map;

		map.on('viewreset', this.update, this);

		this._initIcon();
		this.update();
		this.fire('add');

		if (map.options.zoomAnimation && map.options.markerZoomAnimation) {
			map.on('zoomanim', this._animateZoom, this);
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		if (this.dragging) {
			this.dragging.disable();
		}

		this._removeIcon();
		this._removeShadow();

		this.fire('remove');

		map.off({
			'viewreset': this.update,
			'zoomanim': this._animateZoom
		}, this);

		this._map = null;
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);

		this.update();

		return this.fire('move', { latlng: this._latlng });
	},

	setZIndexOffset: function (offset) {
		this.options.zIndexOffset = offset;
		this.update();

		return this;
	},

	setIcon: function (icon) {

		this.options.icon = icon;

		if (this._map) {
			this._initIcon();
			this.update();
		}

		if (this._popup) {
			this.bindPopup(this._popup);
		}

		return this;
	},

	update: function () {
		if (this._icon) {
			var pos = this._map.latLngToLayerPoint(this._latlng).round();
			this._setPos(pos);
		}

		return this;
	},

	_initIcon: function () {
		var options = this.options,
		    map = this._map,
		    animation = (map.options.zoomAnimation && map.options.markerZoomAnimation),
		    classToAdd = animation ? 'leaflet-zoom-animated' : 'leaflet-zoom-hide';

		var icon = options.icon.createIcon(this._icon),
			addIcon = false;

		// if we're not reusing the icon, remove the old one and init new one
		if (icon !== this._icon) {
			if (this._icon) {
				this._removeIcon();
			}
			addIcon = true;

			if (options.title) {
				icon.title = options.title;
			}
			
			if (options.alt) {
				icon.alt = options.alt;
			}
		}

		L.DomUtil.addClass(icon, classToAdd);

		if (options.keyboard) {
			icon.tabIndex = '0';
		}

		this._icon = icon;

		this._initInteraction();

		if (options.riseOnHover) {
			L.DomEvent
				.on(icon, 'mouseover', this._bringToFront, this)
				.on(icon, 'mouseout', this._resetZIndex, this);
		}

		var newShadow = options.icon.createShadow(this._shadow),
			addShadow = false;

		if (newShadow !== this._shadow) {
			this._removeShadow();
			addShadow = true;
		}

		if (newShadow) {
			L.DomUtil.addClass(newShadow, classToAdd);
		}
		this._shadow = newShadow;


		if (options.opacity < 1) {
			this._updateOpacity();
		}


		var panes = this._map._panes;

		if (addIcon) {
			panes.markerPane.appendChild(this._icon);
		}

		if (newShadow && addShadow) {
			panes.shadowPane.appendChild(this._shadow);
		}
	},

	_removeIcon: function () {
		if (this.options.riseOnHover) {
			L.DomEvent
			    .off(this._icon, 'mouseover', this._bringToFront)
			    .off(this._icon, 'mouseout', this._resetZIndex);
		}

		this._map._panes.markerPane.removeChild(this._icon);

		this._icon = null;
	},

	_removeShadow: function () {
		if (this._shadow) {
			this._map._panes.shadowPane.removeChild(this._shadow);
		}
		this._shadow = null;
	},

	_setPos: function (pos) {
		L.DomUtil.setPosition(this._icon, pos);

		if (this._shadow) {
			L.DomUtil.setPosition(this._shadow, pos);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	},

	_updateZIndex: function (offset) {
		this._icon.style.zIndex = this._zIndex + offset;
	},

	_animateZoom: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	_initInteraction: function () {

		if (!this.options.clickable) { return; }

		// TODO refactor into something shared with Map/Path/etc. to DRY it up

		var icon = this._icon,
		    events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.addClass(icon, 'leaflet-clickable');
		L.DomEvent.on(icon, 'click', this._onMouseClick, this);
		L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
		}

		if (L.Handler.MarkerDrag) {
			this.dragging = new L.Handler.MarkerDrag(this);

			if (this.options.draggable) {
				this.dragging.enable();
			}
		}
	},

	_onMouseClick: function (e) {
		var wasDragged = this.dragging && this.dragging.moved();

		if (this.hasEventListeners(e.type) || wasDragged) {
			L.DomEvent.stopPropagation(e);
		}

		if (wasDragged) { return; }

		if ((!this.dragging || !this.dragging._enabled) && this._map.dragging && this._map.dragging.moved()) { return; }

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});
	},

	_onKeyPress: function (e) {
		if (e.keyCode === 13) {
			this.fire('click', {
				originalEvent: e,
				latlng: this._latlng
			});
		}
	},

	_fireMouseEvent: function (e) {

		this.fire(e.type, {
			originalEvent: e,
			latlng: this._latlng
		});

		// TODO proper custom event propagation
		// this line will always be called if marker is in a FeatureGroup
		if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousedown') {
			L.DomEvent.stopPropagation(e);
		} else {
			L.DomEvent.preventDefault(e);
		}
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._icon, this.options.opacity);
		if (this._shadow) {
			L.DomUtil.setOpacity(this._shadow, this.options.opacity);
		}
	},

	_bringToFront: function () {
		this._updateZIndex(this.options.riseOffset);
	},

	_resetZIndex: function () {
		this._updateZIndex(0);
	}
});

L.marker = function (latlng, options) {
	return new L.Marker(latlng, options);
};


/*
 * L.DivIcon is a lightweight HTML-based icon class (as opposed to the image-based L.Icon)
 * to use with L.Marker.
 */

L.DivIcon = L.Icon.extend({
	options: {
		iconSize: [12, 12], // also can be set through CSS
		/*
		iconAnchor: (Point)
		popupAnchor: (Point)
		html: (String)
		bgPos: (Point)
		*/
		className: 'leaflet-div-icon',
		html: false
	},

	createIcon: function (oldIcon) {
		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;

		if (options.html !== false) {
			div.innerHTML = options.html;
		} else {
			div.innerHTML = '';
		}

		if (options.bgPos) {
			div.style.backgroundPosition =
			        (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
		}

		this._setIconStyles(div, 'icon');
		return div;
	},

	createShadow: function () {
		return null;
	}
});

L.divIcon = function (options) {
	return new L.DivIcon(options);
};


/*
 * L.Popup is used for displaying popups on the map.
 */

L.Map.mergeOptions({
	closePopupOnClick: true
});

L.Popup = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minWidth: 50,
		maxWidth: 300,
		// maxHeight: null,
		autoPan: true,
		closeButton: true,
		offset: [0, 7],
		autoPanPadding: [5, 5],
		// autoPanPaddingTopLeft: null,
		// autoPanPaddingBottomRight: null,
		keepInView: false,
		className: '',
		zoomAnimation: true
	},

	initialize: function (options, source) {
		L.setOptions(this, options);

		this._source = source;
		this._animated = L.Browser.any3d && this.options.zoomAnimation;
		this._isOpen = false;
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initLayout();
		}

		var animFade = map.options.fadeAnimation;

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 0);
		}
		map._panes.popupPane.appendChild(this._container);

		map.on(this._getEvents(), this);

		this.update();

		if (animFade) {
			L.DomUtil.setOpacity(this._container, 1);
		}

		this.fire('open');

		map.fire('popupopen', {popup: this});

		if (this._source) {
			this._source.fire('popupopen', {popup: this});
		}
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	openOn: function (map) {
		map.openPopup(this);
		return this;
	},

	onRemove: function (map) {
		map._panes.popupPane.removeChild(this._container);

		L.Util.falseFn(this._container.offsetWidth); // force reflow

		map.off(this._getEvents(), this);

		if (map.options.fadeAnimation) {
			L.DomUtil.setOpacity(this._container, 0);
		}

		this._map = null;

		this.fire('close');

		map.fire('popupclose', {popup: this});

		if (this._source) {
			this._source.fire('popupclose', {popup: this});
		}
	},

	getLatLng: function () {
		return this._latlng;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		if (this._map) {
			this._updatePosition();
			this._adjustPan();
		}
		return this;
	},

	getContent: function () {
		return this._content;
	},

	setContent: function (content) {
		this._content = content;
		this.update();
		return this;
	},

	update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updateLayout();
		this._updatePosition();

		this._container.style.visibility = '';

		this._adjustPan();
	},

	_getEvents: function () {
		var events = {
			viewreset: this._updatePosition
		};

		if (this._animated) {
			events.zoomanim = this._zoomAnimation;
		}
		if ('closeOnClick' in this.options ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
			events.preclick = this._close;
		}
		if (this.options.keepInView) {
			events.moveend = this._adjustPan;
		}

		return events;
	},

	_close: function () {
		if (this._map) {
			this._map.closePopup(this);
		}
	},

	_initLayout: function () {
		var prefix = 'leaflet-popup',
			containerClass = prefix + ' ' + this.options.className + ' leaflet-zoom-' +
			        (this._animated ? 'animated' : 'hide'),
			container = this._container = L.DomUtil.create('div', containerClass),
			closeButton;

		if (this.options.closeButton) {
			closeButton = this._closeButton =
			        L.DomUtil.create('a', prefix + '-close-button', container);
			closeButton.href = '#close';
			closeButton.innerHTML = '&#215;';
			L.DomEvent.disableClickPropagation(closeButton);

			L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
		}

		var wrapper = this._wrapper =
		        L.DomUtil.create('div', prefix + '-content-wrapper', container);
		L.DomEvent.disableClickPropagation(wrapper);

		this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

		L.DomEvent.disableScrollPropagation(this._contentNode);
		L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

		this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
		this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
	},

	_updateContent: function () {
		if (!this._content) { return; }

		if (typeof this._content === 'string') {
			this._contentNode.innerHTML = this._content;
		} else {
			while (this._contentNode.hasChildNodes()) {
				this._contentNode.removeChild(this._contentNode.firstChild);
			}
			this._contentNode.appendChild(this._content);
		}
		this.fire('contentupdate');
	},

	_updateLayout: function () {
		var container = this._contentNode,
		    style = container.style;

		style.width = '';
		style.whiteSpace = 'nowrap';

		var width = container.offsetWidth;
		width = Math.min(width, this.options.maxWidth);
		width = Math.max(width, this.options.minWidth);

		style.width = (width + 1) + 'px';
		style.whiteSpace = '';

		style.height = '';

		var height = container.offsetHeight,
		    maxHeight = this.options.maxHeight,
		    scrolledClass = 'leaflet-popup-scrolled';

		if (maxHeight && height > maxHeight) {
			style.height = maxHeight + 'px';
			L.DomUtil.addClass(container, scrolledClass);
		} else {
			L.DomUtil.removeClass(container, scrolledClass);
		}

		this._containerWidth = this._container.offsetWidth;
	},

	_updatePosition: function () {
		if (!this._map) { return; }

		var pos = this._map.latLngToLayerPoint(this._latlng),
		    animated = this._animated,
		    offset = L.point(this.options.offset);

		if (animated) {
			L.DomUtil.setPosition(this._container, pos);
		}

		this._containerBottom = -offset.y - (animated ? 0 : pos.y);
		this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (animated ? 0 : pos.x);

		// bottom position the popup in case the height of the popup changes (images loading etc)
		this._container.style.bottom = this._containerBottom + 'px';
		this._container.style.left = this._containerLeft + 'px';
	},

	_zoomAnimation: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center);

		L.DomUtil.setPosition(this._container, pos);
	},

	_adjustPan: function () {
		if (!this.options.autoPan) { return; }

		var map = this._map,
		    containerHeight = this._container.offsetHeight,
		    containerWidth = this._containerWidth,

		    layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);

		if (this._animated) {
			layerPos._add(L.DomUtil.getPosition(this._container));
		}

		var containerPos = map.layerPointToContainerPoint(layerPos),
		    padding = L.point(this.options.autoPanPadding),
		    paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
		    paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
		    size = map.getSize(),
		    dx = 0,
		    dy = 0;

		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
		}
		if (containerPos.x - dx - paddingTL.x < 0) { // left
			dx = containerPos.x - paddingTL.x;
		}
		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
		}
		if (containerPos.y - dy - paddingTL.y < 0) { // top
			dy = containerPos.y - paddingTL.y;
		}

		if (dx || dy) {
			map
			    .fire('autopanstart')
			    .panBy([dx, dy]);
		}
	},

	_onCloseButtonClick: function (e) {
		this._close();
		L.DomEvent.stop(e);
	}
});

L.popup = function (options, source) {
	return new L.Popup(options, source);
};


L.Map.include({
	openPopup: function (popup, latlng, options) { // (Popup) or (String || HTMLElement, LatLng[, Object])
		this.closePopup();

		if (!(popup instanceof L.Popup)) {
			var content = popup;

			popup = new L.Popup(options)
			    .setLatLng(latlng)
			    .setContent(content);
		}
		popup._isOpen = true;

		this._popup = popup;
		return this.addLayer(popup);
	},

	closePopup: function (popup) {
		if (!popup || popup === this._popup) {
			popup = this._popup;
			this._popup = null;
		}
		if (popup) {
			this.removeLayer(popup);
			popup._isOpen = false;
		}
		return this;
	}
});


/*
 * Popup extension to L.Marker, adding popup-related methods.
 */

L.Marker.include({
	openPopup: function () {
		if (this._popup && this._map && !this._map.hasLayer(this._popup)) {
			this._popup.setLatLng(this._latlng);
			this._map.openPopup(this._popup);
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	togglePopup: function () {
		if (this._popup) {
			if (this._popup._isOpen) {
				this.closePopup();
			} else {
				this.openPopup();
			}
		}
		return this;
	},

	bindPopup: function (content, options) {
		var anchor = L.point(this.options.icon.options.popupAnchor || [0, 0]);

		anchor = anchor.add(L.Popup.prototype.options.offset);

		if (options && options.offset) {
			anchor = anchor.add(options.offset);
		}

		options = L.extend({offset: anchor}, options);

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this.togglePopup, this)
			    .on('remove', this.closePopup, this)
			    .on('move', this._movePopup, this);
			this._popupHandlersAdded = true;
		}

		if (content instanceof L.Popup) {
			L.setOptions(content, options);
			this._popup = content;
		} else {
			this._popup = new L.Popup(options, this)
				.setContent(content);
		}

		return this;
	},

	setPopupContent: function (content) {
		if (this._popup) {
			this._popup.setContent(content);
		}
		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this.togglePopup, this)
			    .off('remove', this.closePopup, this)
			    .off('move', this._movePopup, this);
			this._popupHandlersAdded = false;
		}
		return this;
	},

	getPopup: function () {
		return this._popup;
	},

	_movePopup: function (e) {
		this._popup.setLatLng(e.latlng);
	}
});


/*
 * L.LayerGroup is a class to combine several layers into one so that
 * you can manipulate the group (e.g. add/remove it) as one layer.
 */

L.LayerGroup = L.Class.extend({
	initialize: function (layers) {
		this._layers = {};

		var i, len;

		if (layers) {
			for (i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		}
	},

	addLayer: function (layer) {
		var id = this.getLayerId(layer);

		this._layers[id] = layer;

		if (this._map) {
			this._map.addLayer(layer);
		}

		return this;
	},

	removeLayer: function (layer) {
		var id = layer in this._layers ? layer : this.getLayerId(layer);

		if (this._map && this._layers[id]) {
			this._map.removeLayer(this._layers[id]);
		}

		delete this._layers[id];

		return this;
	},

	hasLayer: function (layer) {
		if (!layer) { return false; }

		return (layer in this._layers || this.getLayerId(layer) in this._layers);
	},

	clearLayers: function () {
		this.eachLayer(this.removeLayer, this);
		return this;
	},

	invoke: function (methodName) {
		var args = Array.prototype.slice.call(arguments, 1),
		    i, layer;

		for (i in this._layers) {
			layer = this._layers[i];

			if (layer[methodName]) {
				layer[methodName].apply(layer, args);
			}
		}

		return this;
	},

	onAdd: function (map) {
		this._map = map;
		this.eachLayer(map.addLayer, map);
	},

	onRemove: function (map) {
		this.eachLayer(map.removeLayer, map);
		this._map = null;
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	getLayer: function (id) {
		return this._layers[id];
	},

	getLayers: function () {
		var layers = [];

		for (var i in this._layers) {
			layers.push(this._layers[i]);
		}
		return layers;
	},

	setZIndex: function (zIndex) {
		return this.invoke('setZIndex', zIndex);
	},

	getLayerId: function (layer) {
		return L.stamp(layer);
	}
});

L.layerGroup = function (layers) {
	return new L.LayerGroup(layers);
};


/*
 * L.FeatureGroup extends L.LayerGroup by introducing mouse events and additional methods
 * shared between a group of interactive layers (like vectors or markers).
 */

L.FeatureGroup = L.LayerGroup.extend({
	includes: L.Mixin.Events,

	statics: {
		EVENTS: 'click dblclick mouseover mouseout mousemove contextmenu popupopen popupclose'
	},

	addLayer: function (layer) {
		if (this.hasLayer(layer)) {
			return this;
		}

		if ('on' in layer) {
			layer.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);
		}

		L.LayerGroup.prototype.addLayer.call(this, layer);

		if (this._popupContent && layer.bindPopup) {
			layer.bindPopup(this._popupContent, this._popupOptions);
		}

		return this.fire('layeradd', {layer: layer});
	},

	removeLayer: function (layer) {
		if (!this.hasLayer(layer)) {
			return this;
		}
		if (layer in this._layers) {
			layer = this._layers[layer];
		}

		layer.off(L.FeatureGroup.EVENTS, this._propagateEvent, this);

		L.LayerGroup.prototype.removeLayer.call(this, layer);

		if (this._popupContent) {
			this.invoke('unbindPopup');
		}

		return this.fire('layerremove', {layer: layer});
	},

	bindPopup: function (content, options) {
		this._popupContent = content;
		this._popupOptions = options;
		return this.invoke('bindPopup', content, options);
	},

	openPopup: function (latlng) {
		// open popup on the first layer
		for (var id in this._layers) {
			this._layers[id].openPopup(latlng);
			break;
		}
		return this;
	},

	setStyle: function (style) {
		return this.invoke('setStyle', style);
	},

	bringToFront: function () {
		return this.invoke('bringToFront');
	},

	bringToBack: function () {
		return this.invoke('bringToBack');
	},

	getBounds: function () {
		var bounds = new L.LatLngBounds();

		this.eachLayer(function (layer) {
			bounds.extend(layer instanceof L.Marker ? layer.getLatLng() : layer.getBounds());
		});

		return bounds;
	},

	_propagateEvent: function (e) {
		e = L.extend({
			layer: e.target,
			target: this
		}, e);
		this.fire(e.type, e);
	}
});

L.featureGroup = function (layers) {
	return new L.FeatureGroup(layers);
};


/*
 * L.Path is a base class for rendering vector paths on a map. Inherited by Polyline, Circle, etc.
 */

L.Path = L.Class.extend({
	includes: [L.Mixin.Events],

	statics: {
		// how much to extend the clip area around the map view
		// (relative to its size, e.g. 0.5 is half the screen in each direction)
		// set it so that SVG element doesn't exceed 1280px (vectors flicker on dragend if it is)
		CLIP_PADDING: (function () {
			var max = L.Browser.mobile ? 1280 : 2000,
			    target = (max / Math.max(window.outerWidth, window.outerHeight) - 1) / 2;
			return Math.max(0, Math.min(0.5, target));
		})()
	},

	options: {
		stroke: true,
		color: '#0033ff',
		dashArray: null,
		lineCap: null,
		lineJoin: null,
		weight: 5,
		opacity: 0.5,

		fill: false,
		fillColor: null, //same as color by default
		fillOpacity: 0.2,

		clickable: true
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		if (!this._container) {
			this._initElements();
			this._initEvents();
		}

		this.projectLatlngs();
		this._updatePath();

		if (this._container) {
			this._map._pathRoot.appendChild(this._container);
		}

		this.fire('add');

		map.on({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	onRemove: function (map) {
		map._pathRoot.removeChild(this._container);

		// Need to fire remove event before we set _map to null as the event hooks might need the object
		this.fire('remove');
		this._map = null;

		if (L.Browser.vml) {
			this._container = null;
			this._stroke = null;
			this._fill = null;
		}

		map.off({
			'viewreset': this.projectLatlngs,
			'moveend': this._updatePath
		}, this);
	},

	projectLatlngs: function () {
		// do all projection stuff here
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._container) {
			this._updateStyle();
		}

		return this;
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._updatePath();
		}
		return this;
	}
});

L.Map.include({
	_updatePathViewport: function () {
		var p = L.Path.CLIP_PADDING,
		    size = this.getSize(),
		    panePos = L.DomUtil.getPosition(this._mapPane),
		    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
		    max = min.add(size.multiplyBy(1 + p * 2)._round());

		this._pathViewport = new L.Bounds(min, max);
	}
});


/*
 * Extends L.Path with SVG-specific rendering code.
 */

L.Path.SVG_NS = 'http://www.w3.org/2000/svg';

L.Browser.svg = !!(document.createElementNS && document.createElementNS(L.Path.SVG_NS, 'svg').createSVGRect);

L.Path = L.Path.extend({
	statics: {
		SVG: L.Browser.svg
	},

	bringToFront: function () {
		var root = this._map._pathRoot,
		    path = this._container;

		if (path && root.lastChild !== path) {
			root.appendChild(path);
		}
		return this;
	},

	bringToBack: function () {
		var root = this._map._pathRoot,
		    path = this._container,
		    first = root.firstChild;

		if (path && first !== path) {
			root.insertBefore(path, first);
		}
		return this;
	},

	getPathString: function () {
		// form path string here
	},

	_createElement: function (name) {
		return document.createElementNS(L.Path.SVG_NS, name);
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._initPath();
		this._initStyle();
	},

	_initPath: function () {
		this._container = this._createElement('g');

		this._path = this._createElement('path');

		if (this.options.className) {
			L.DomUtil.addClass(this._path, this.options.className);
		}

		this._container.appendChild(this._path);
	},

	_initStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke-linejoin', 'round');
			this._path.setAttribute('stroke-linecap', 'round');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill-rule', 'evenodd');
		}
		if (this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', this.options.pointerEvents);
		}
		if (!this.options.clickable && !this.options.pointerEvents) {
			this._path.setAttribute('pointer-events', 'none');
		}
		this._updateStyle();
	},

	_updateStyle: function () {
		if (this.options.stroke) {
			this._path.setAttribute('stroke', this.options.color);
			this._path.setAttribute('stroke-opacity', this.options.opacity);
			this._path.setAttribute('stroke-width', this.options.weight);
			if (this.options.dashArray) {
				this._path.setAttribute('stroke-dasharray', this.options.dashArray);
			} else {
				this._path.removeAttribute('stroke-dasharray');
			}
			if (this.options.lineCap) {
				this._path.setAttribute('stroke-linecap', this.options.lineCap);
			}
			if (this.options.lineJoin) {
				this._path.setAttribute('stroke-linejoin', this.options.lineJoin);
			}
		} else {
			this._path.setAttribute('stroke', 'none');
		}
		if (this.options.fill) {
			this._path.setAttribute('fill', this.options.fillColor || this.options.color);
			this._path.setAttribute('fill-opacity', this.options.fillOpacity);
		} else {
			this._path.setAttribute('fill', 'none');
		}
	},

	_updatePath: function () {
		var str = this.getPathString();
		if (!str) {
			// fix webkit empty string parsing bug
			str = 'M0 0';
		}
		this._path.setAttribute('d', str);
	},

	// TODO remove duplication with L.Map
	_initEvents: function () {
		if (this.options.clickable) {
			if (L.Browser.svg || !L.Browser.vml) {
				L.DomUtil.addClass(this._path, 'leaflet-clickable');
			}

			L.DomEvent.on(this._container, 'click', this._onMouseClick, this);

			var events = ['dblclick', 'mousedown', 'mouseover',
			              'mouseout', 'mousemove', 'contextmenu'];
			for (var i = 0; i < events.length; i++) {
				L.DomEvent.on(this._container, events[i], this._fireMouseEvent, this);
			}
		}
	},

	_onMouseClick: function (e) {
		if (this._map.dragging && this._map.dragging.moved()) { return; }

		this._fireMouseEvent(e);
	},

	_fireMouseEvent: function (e) {
		if (!this.hasEventListeners(e.type)) { return; }

		var map = this._map,
		    containerPoint = map.mouseEventToContainerPoint(e),
		    layerPoint = map.containerPointToLayerPoint(containerPoint),
		    latlng = map.layerPointToLatLng(layerPoint);

		this.fire(e.type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: e
		});

		if (e.type === 'contextmenu') {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousemove') {
			L.DomEvent.stopPropagation(e);
		}
	}
});

L.Map.include({
	_initPathRoot: function () {
		if (!this._pathRoot) {
			this._pathRoot = L.Path.prototype._createElement('svg');
			this._panes.overlayPane.appendChild(this._pathRoot);

			if (this.options.zoomAnimation && L.Browser.any3d) {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-animated');

				this.on({
					'zoomanim': this._animatePathZoom,
					'zoomend': this._endPathZoom
				});
			} else {
				L.DomUtil.addClass(this._pathRoot, 'leaflet-zoom-hide');
			}

			this.on('moveend', this._updateSvgViewport);
			this._updateSvgViewport();
		}
	},

	_animatePathZoom: function (e) {
		var scale = this.getZoomScale(e.zoom),
		    offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);

		this._pathRoot.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';

		this._pathZooming = true;
	},

	_endPathZoom: function () {
		this._pathZooming = false;
	},

	_updateSvgViewport: function () {

		if (this._pathZooming) {
			// Do not update SVGs while a zoom animation is going on otherwise the animation will break.
			// When the zoom animation ends we will be updated again anyway
			// This fixes the case where you do a momentum move and zoom while the move is still ongoing.
			return;
		}

		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    max = vp.max,
		    width = max.x - min.x,
		    height = max.y - min.y,
		    root = this._pathRoot,
		    pane = this._panes.overlayPane;

		// Hack to make flicker on drag end on mobile webkit less irritating
		if (L.Browser.mobileWebkit) {
			pane.removeChild(root);
		}

		L.DomUtil.setPosition(root, min);
		root.setAttribute('width', width);
		root.setAttribute('height', height);
		root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));

		if (L.Browser.mobileWebkit) {
			pane.appendChild(root);
		}
	}
});


/*
 * Popup extension to L.Path (polylines, polygons, circles), adding popup-related methods.
 */

L.Path.include({

	bindPopup: function (content, options) {

		if (content instanceof L.Popup) {
			this._popup = content;
		} else {
			if (!this._popup || options) {
				this._popup = new L.Popup(options, this);
			}
			this._popup.setContent(content);
		}

		if (!this._popupHandlersAdded) {
			this
			    .on('click', this._openPopup, this)
			    .on('remove', this.closePopup, this);

			this._popupHandlersAdded = true;
		}

		return this;
	},

	unbindPopup: function () {
		if (this._popup) {
			this._popup = null;
			this
			    .off('click', this._openPopup)
			    .off('remove', this.closePopup);

			this._popupHandlersAdded = false;
		}
		return this;
	},

	openPopup: function (latlng) {

		if (this._popup) {
			// open the popup from one of the path's points if not specified
			latlng = latlng || this._latlng ||
			         this._latlngs[Math.floor(this._latlngs.length / 2)];

			this._openPopup({latlng: latlng});
		}

		return this;
	},

	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	_openPopup: function (e) {
		this._popup.setLatLng(e.latlng);
		this._map.openPopup(this._popup);
	}
});


/*
 * Vector rendering for IE6-8 through VML.
 * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
 */

L.Browser.vml = !L.Browser.svg && (function () {
	try {
		var div = document.createElement('div');
		div.innerHTML = '<v:shape adj="1"/>';

		var shape = div.firstChild;
		shape.style.behavior = 'url(#default#VML)';

		return shape && (typeof shape.adj === 'object');

	} catch (e) {
		return false;
	}
}());

L.Path = L.Browser.svg || !L.Browser.vml ? L.Path : L.Path.extend({
	statics: {
		VML: true,
		CLIP_PADDING: 0.02
	},

	_createElement: (function () {
		try {
			document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
			return function (name) {
				return document.createElement('<lvml:' + name + ' class="lvml">');
			};
		} catch (e) {
			return function (name) {
				return document.createElement(
				        '<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
			};
		}
	}()),

	_initPath: function () {
		var container = this._container = this._createElement('shape');

		L.DomUtil.addClass(container, 'leaflet-vml-shape' +
			(this.options.className ? ' ' + this.options.className : ''));

		if (this.options.clickable) {
			L.DomUtil.addClass(container, 'leaflet-clickable');
		}

		container.coordsize = '1 1';

		this._path = this._createElement('path');
		container.appendChild(this._path);

		this._map._pathRoot.appendChild(container);
	},

	_initStyle: function () {
		this._updateStyle();
	},

	_updateStyle: function () {
		var stroke = this._stroke,
		    fill = this._fill,
		    options = this.options,
		    container = this._container;

		container.stroked = options.stroke;
		container.filled = options.fill;

		if (options.stroke) {
			if (!stroke) {
				stroke = this._stroke = this._createElement('stroke');
				stroke.endcap = 'round';
				container.appendChild(stroke);
			}
			stroke.weight = options.weight + 'px';
			stroke.color = options.color;
			stroke.opacity = options.opacity;

			if (options.dashArray) {
				stroke.dashStyle = L.Util.isArray(options.dashArray) ?
				    options.dashArray.join(' ') :
				    options.dashArray.replace(/( *, *)/g, ' ');
			} else {
				stroke.dashStyle = '';
			}
			if (options.lineCap) {
				stroke.endcap = options.lineCap.replace('butt', 'flat');
			}
			if (options.lineJoin) {
				stroke.joinstyle = options.lineJoin;
			}

		} else if (stroke) {
			container.removeChild(stroke);
			this._stroke = null;
		}

		if (options.fill) {
			if (!fill) {
				fill = this._fill = this._createElement('fill');
				container.appendChild(fill);
			}
			fill.color = options.fillColor || options.color;
			fill.opacity = options.fillOpacity;

		} else if (fill) {
			container.removeChild(fill);
			this._fill = null;
		}
	},

	_updatePath: function () {
		var style = this._container.style;

		style.display = 'none';
		this._path.v = this.getPathString() + ' '; // the space fixes IE empty path string bug
		style.display = '';
	}
});

L.Map.include(L.Browser.svg || !L.Browser.vml ? {} : {
	_initPathRoot: function () {
		if (this._pathRoot) { return; }

		var root = this._pathRoot = document.createElement('div');
		root.className = 'leaflet-vml-container';
		this._panes.overlayPane.appendChild(root);

		this.on('moveend', this._updatePathViewport);
		this._updatePathViewport();
	}
});


/*
 * Vector rendering for all browsers that support canvas.
 */

L.Browser.canvas = (function () {
	return !!document.createElement('canvas').getContext;
}());

L.Path = (L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? L.Path : L.Path.extend({
	statics: {
		//CLIP_PADDING: 0.02, // not sure if there's a need to set it to a small value
		CANVAS: true,
		SVG: false
	},

	redraw: function () {
		if (this._map) {
			this.projectLatlngs();
			this._requestUpdate();
		}
		return this;
	},

	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._map) {
			this._updateStyle();
			this._requestUpdate();
		}
		return this;
	},

	onRemove: function (map) {
		map
		    .off('viewreset', this.projectLatlngs, this)
		    .off('moveend', this._updatePath, this);

		if (this.options.clickable) {
			this._map.off('click', this._onClick, this);
			this._map.off('mousemove', this._onMouseMove, this);
		}

		this._requestUpdate();
		
		this.fire('remove');
		this._map = null;
	},

	_requestUpdate: function () {
		if (this._map && !L.Path._updateRequest) {
			L.Path._updateRequest = L.Util.requestAnimFrame(this._fireMapMoveEnd, this._map);
		}
	},

	_fireMapMoveEnd: function () {
		L.Path._updateRequest = null;
		this.fire('moveend');
	},

	_initElements: function () {
		this._map._initPathRoot();
		this._ctx = this._map._canvasCtx;
	},

	_updateStyle: function () {
		var options = this.options;

		if (options.stroke) {
			this._ctx.lineWidth = options.weight;
			this._ctx.strokeStyle = options.color;
		}
		if (options.fill) {
			this._ctx.fillStyle = options.fillColor || options.color;
		}
	},

	_drawPath: function () {
		var i, j, len, len2, point, drawMethod;

		this._ctx.beginPath();

		for (i = 0, len = this._parts.length; i < len; i++) {
			for (j = 0, len2 = this._parts[i].length; j < len2; j++) {
				point = this._parts[i][j];
				drawMethod = (j === 0 ? 'move' : 'line') + 'To';

				this._ctx[drawMethod](point.x, point.y);
			}
			// TODO refactor ugly hack
			if (this instanceof L.Polygon) {
				this._ctx.closePath();
			}
		}
	},

	_checkIfEmpty: function () {
		return !this._parts.length;
	},

	_updatePath: function () {
		if (this._checkIfEmpty()) { return; }

		var ctx = this._ctx,
		    options = this.options;

		this._drawPath();
		ctx.save();
		this._updateStyle();

		if (options.fill) {
			ctx.globalAlpha = options.fillOpacity;
			ctx.fill();
		}

		if (options.stroke) {
			ctx.globalAlpha = options.opacity;
			ctx.stroke();
		}

		ctx.restore();

		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	},

	_initEvents: function () {
		if (this.options.clickable) {
			// TODO dblclick
			this._map.on('mousemove', this._onMouseMove, this);
			this._map.on('click', this._onClick, this);
		}
	},

	_onClick: function (e) {
		if (this._containsPoint(e.layerPoint)) {
			this.fire('click', e);
		}
	},

	_onMouseMove: function (e) {
		if (!this._map || this._map._animatingZoom) { return; }

		// TODO don't do on each move
		if (this._containsPoint(e.layerPoint)) {
			this._ctx.canvas.style.cursor = 'pointer';
			this._mouseInside = true;
			this.fire('mouseover', e);

		} else if (this._mouseInside) {
			this._ctx.canvas.style.cursor = '';
			this._mouseInside = false;
			this.fire('mouseout', e);
		}
	}
});

L.Map.include((L.Path.SVG && !window.L_PREFER_CANVAS) || !L.Browser.canvas ? {} : {
	_initPathRoot: function () {
		var root = this._pathRoot,
		    ctx;

		if (!root) {
			root = this._pathRoot = document.createElement('canvas');
			root.style.position = 'absolute';
			ctx = this._canvasCtx = root.getContext('2d');

			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			this._panes.overlayPane.appendChild(root);

			if (this.options.zoomAnimation) {
				this._pathRoot.className = 'leaflet-zoom-animated';
				this.on('zoomanim', this._animatePathZoom);
				this.on('zoomend', this._endPathZoom);
			}
			this.on('moveend', this._updateCanvasViewport);
			this._updateCanvasViewport();
		}
	},

	_updateCanvasViewport: function () {
		// don't redraw while zooming. See _updateSvgViewport for more details
		if (this._pathZooming) { return; }
		this._updatePathViewport();

		var vp = this._pathViewport,
		    min = vp.min,
		    size = vp.max.subtract(min),
		    root = this._pathRoot;

		//TODO check if this works properly on mobile webkit
		L.DomUtil.setPosition(root, min);
		root.width = size.x;
		root.height = size.y;
		root.getContext('2d').translate(-min.x, -min.y);
	}
});


/*
 * L.LineUtil contains different utility functions for line segments
 * and polylines (clipping, simplification, distances, etc.)
 */

/*jshint bitwise:false */ // allow bitwise operations for this file

L.LineUtil = {

	// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
	// Improves rendering performance dramatically by lessening the number of points to draw.

	simplify: function (/*Point[]*/ points, /*Number*/ tolerance) {
		if (!tolerance || !points.length) {
			return points.slice();
		}

		var sqTolerance = tolerance * tolerance;

		// stage 1: vertex reduction
		points = this._reducePoints(points, sqTolerance);

		// stage 2: Douglas-Peucker simplification
		points = this._simplifyDP(points, sqTolerance);

		return points;
	},

	// distance from a point to a segment between two points
	pointToSegmentDistance:  function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return Math.sqrt(this._sqClosestPointOnSegment(p, p1, p2, true));
	},

	closestPointOnSegment: function (/*Point*/ p, /*Point*/ p1, /*Point*/ p2) {
		return this._sqClosestPointOnSegment(p, p1, p2);
	},

	// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
	_simplifyDP: function (points, sqTolerance) {

		var len = points.length,
		    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
		    markers = new ArrayConstructor(len);

		markers[0] = markers[len - 1] = 1;

		this._simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

		var i,
		    newPoints = [];

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i]);
			}
		}

		return newPoints;
	},

	_simplifyDPStep: function (points, markers, sqTolerance, first, last) {

		var maxSqDist = 0,
		    index, i, sqDist;

		for (i = first + 1; i <= last - 1; i++) {
			sqDist = this._sqClosestPointOnSegment(points[i], points[first], points[last], true);

			if (sqDist > maxSqDist) {
				index = i;
				maxSqDist = sqDist;
			}
		}

		if (maxSqDist > sqTolerance) {
			markers[index] = 1;

			this._simplifyDPStep(points, markers, sqTolerance, first, index);
			this._simplifyDPStep(points, markers, sqTolerance, index, last);
		}
	},

	// reduce points that are too close to each other to a single point
	_reducePoints: function (points, sqTolerance) {
		var reducedPoints = [points[0]];

		for (var i = 1, prev = 0, len = points.length; i < len; i++) {
			if (this._sqDist(points[i], points[prev]) > sqTolerance) {
				reducedPoints.push(points[i]);
				prev = i;
			}
		}
		if (prev < len - 1) {
			reducedPoints.push(points[len - 1]);
		}
		return reducedPoints;
	},

	// Cohen-Sutherland line clipping algorithm.
	// Used to avoid rendering parts of a polyline that are not currently visible.

	clipSegment: function (a, b, bounds, useLastCode) {
		var codeA = useLastCode ? this._lastCode : this._getBitCode(a, bounds),
		    codeB = this._getBitCode(b, bounds),

		    codeOut, p, newCode;

		// save 2nd code to avoid calculating it on the next segment
		this._lastCode = codeB;

		while (true) {
			// if a,b is inside the clip window (trivial accept)
			if (!(codeA | codeB)) {
				return [a, b];
			// if a,b is outside the clip window (trivial reject)
			} else if (codeA & codeB) {
				return false;
			// other cases
			} else {
				codeOut = codeA || codeB;
				p = this._getEdgeIntersection(a, b, codeOut, bounds);
				newCode = this._getBitCode(p, bounds);

				if (codeOut === codeA) {
					a = p;
					codeA = newCode;
				} else {
					b = p;
					codeB = newCode;
				}
			}
		}
	},

	_getEdgeIntersection: function (a, b, code, bounds) {
		var dx = b.x - a.x,
		    dy = b.y - a.y,
		    min = bounds.min,
		    max = bounds.max;

		if (code & 8) { // top
			return new L.Point(a.x + dx * (max.y - a.y) / dy, max.y);
		} else if (code & 4) { // bottom
			return new L.Point(a.x + dx * (min.y - a.y) / dy, min.y);
		} else if (code & 2) { // right
			return new L.Point(max.x, a.y + dy * (max.x - a.x) / dx);
		} else if (code & 1) { // left
			return new L.Point(min.x, a.y + dy * (min.x - a.x) / dx);
		}
	},

	_getBitCode: function (/*Point*/ p, bounds) {
		var code = 0;

		if (p.x < bounds.min.x) { // left
			code |= 1;
		} else if (p.x > bounds.max.x) { // right
			code |= 2;
		}
		if (p.y < bounds.min.y) { // bottom
			code |= 4;
		} else if (p.y > bounds.max.y) { // top
			code |= 8;
		}

		return code;
	},

	// square distance (to avoid unnecessary Math.sqrt calls)
	_sqDist: function (p1, p2) {
		var dx = p2.x - p1.x,
		    dy = p2.y - p1.y;
		return dx * dx + dy * dy;
	},

	// return closest point on segment or distance to that point
	_sqClosestPointOnSegment: function (p, p1, p2, sqDist) {
		var x = p1.x,
		    y = p1.y,
		    dx = p2.x - x,
		    dy = p2.y - y,
		    dot = dx * dx + dy * dy,
		    t;

		if (dot > 0) {
			t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

			if (t > 1) {
				x = p2.x;
				y = p2.y;
			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = p.x - x;
		dy = p.y - y;

		return sqDist ? dx * dx + dy * dy : new L.Point(x, y);
	}
};


/*
 * L.Polyline is used to display polylines on a map.
 */

L.Polyline = L.Path.extend({
	initialize: function (latlngs, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlngs = this._convertLatLngs(latlngs);
	},

	options: {
		// how much to simplify the polyline on each zoom level
		// more = better performance and smoother look, less = more accurate
		smoothFactor: 1.0,
		noClip: false
	},

	projectLatlngs: function () {
		this._originalPoints = [];

		for (var i = 0, len = this._latlngs.length; i < len; i++) {
			this._originalPoints[i] = this._map.latLngToLayerPoint(this._latlngs[i]);
		}
	},

	getPathString: function () {
		for (var i = 0, len = this._parts.length, str = ''; i < len; i++) {
			str += this._getPathPartStr(this._parts[i]);
		}
		return str;
	},

	getLatLngs: function () {
		return this._latlngs;
	},

	setLatLngs: function (latlngs) {
		this._latlngs = this._convertLatLngs(latlngs);
		return this.redraw();
	},

	addLatLng: function (latlng) {
		this._latlngs.push(L.latLng(latlng));
		return this.redraw();
	},

	spliceLatLngs: function () { // (Number index, Number howMany)
		var removed = [].splice.apply(this._latlngs, arguments);
		this._convertLatLngs(this._latlngs, true);
		this.redraw();
		return removed;
	},

	closestLayerPoint: function (p) {
		var minDistance = Infinity, parts = this._parts, p1, p2, minPoint = null;

		for (var j = 0, jLen = parts.length; j < jLen; j++) {
			var points = parts[j];
			for (var i = 1, len = points.length; i < len; i++) {
				p1 = points[i - 1];
				p2 = points[i];
				var sqDist = L.LineUtil._sqClosestPointOnSegment(p, p1, p2, true);
				if (sqDist < minDistance) {
					minDistance = sqDist;
					minPoint = L.LineUtil._sqClosestPointOnSegment(p, p1, p2);
				}
			}
		}
		if (minPoint) {
			minPoint.distance = Math.sqrt(minDistance);
		}
		return minPoint;
	},

	getBounds: function () {
		return new L.LatLngBounds(this.getLatLngs());
	},

	_convertLatLngs: function (latlngs, overwrite) {
		var i, len, target = overwrite ? latlngs : [];

		for (i = 0, len = latlngs.length; i < len; i++) {
			if (L.Util.isArray(latlngs[i]) && typeof latlngs[i][0] !== 'number') {
				return;
			}
			target[i] = L.latLng(latlngs[i]);
		}
		return target;
	},

	_initEvents: function () {
		L.Path.prototype._initEvents.call(this);
	},

	_getPathPartStr: function (points) {
		var round = L.Path.VML;

		for (var j = 0, len2 = points.length, str = '', p; j < len2; j++) {
			p = points[j];
			if (round) {
				p._round();
			}
			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
		}
		return str;
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    len = points.length,
		    i, k, segment;

		if (this.options.noClip) {
			this._parts = [points];
			return;
		}

		this._parts = [];

		var parts = this._parts,
		    vp = this._map._pathViewport,
		    lu = L.LineUtil;

		for (i = 0, k = 0; i < len - 1; i++) {
			segment = lu.clipSegment(points[i], points[i + 1], vp, i);
			if (!segment) {
				continue;
			}

			parts[k] = parts[k] || [];
			parts[k].push(segment[0]);

			// if segment goes out of screen, or it's the last one, it's the end of the line part
			if ((segment[1] !== points[i + 1]) || (i === len - 2)) {
				parts[k].push(segment[1]);
				k++;
			}
		}
	},

	// simplify each clipped part of the polyline
	_simplifyPoints: function () {
		var parts = this._parts,
		    lu = L.LineUtil;

		for (var i = 0, len = parts.length; i < len; i++) {
			parts[i] = lu.simplify(parts[i], this.options.smoothFactor);
		}
	},

	_updatePath: function () {
		if (!this._map) { return; }

		this._clipPoints();
		this._simplifyPoints();

		L.Path.prototype._updatePath.call(this);
	}
});

L.polyline = function (latlngs, options) {
	return new L.Polyline(latlngs, options);
};


/*
 * L.PolyUtil contains utility functions for polygons (clipping, etc.).
 */

/*jshint bitwise:false */ // allow bitwise operations here

L.PolyUtil = {};

/*
 * Sutherland-Hodgeman polygon clipping algorithm.
 * Used to avoid rendering parts of a polygon that are not currently visible.
 */
L.PolyUtil.clipPolygon = function (points, bounds) {
	var clippedPoints,
	    edges = [1, 4, 2, 8],
	    i, j, k,
	    a, b,
	    len, edge, p,
	    lu = L.LineUtil;

	for (i = 0, len = points.length; i < len; i++) {
		points[i]._code = lu._getBitCode(points[i], bounds);
	}

	// for each edge (left, bottom, right, top)
	for (k = 0; k < 4; k++) {
		edge = edges[k];
		clippedPoints = [];

		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
			a = points[i];
			b = points[j];

			// if a is inside the clip window
			if (!(a._code & edge)) {
				// if b is outside the clip window (a->b goes out of screen)
				if (b._code & edge) {
					p = lu._getEdgeIntersection(b, a, edge, bounds);
					p._code = lu._getBitCode(p, bounds);
					clippedPoints.push(p);
				}
				clippedPoints.push(a);

			// else if b is inside the clip window (a->b enters the screen)
			} else if (!(b._code & edge)) {
				p = lu._getEdgeIntersection(b, a, edge, bounds);
				p._code = lu._getBitCode(p, bounds);
				clippedPoints.push(p);
			}
		}
		points = clippedPoints;
	}

	return points;
};


/*
 * L.Polygon is used to display polygons on a map.
 */

L.Polygon = L.Polyline.extend({
	options: {
		fill: true
	},

	initialize: function (latlngs, options) {
		L.Polyline.prototype.initialize.call(this, latlngs, options);
		this._initWithHoles(latlngs);
	},

	_initWithHoles: function (latlngs) {
		var i, len, hole;
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._latlngs = this._convertLatLngs(latlngs[0]);
			this._holes = latlngs.slice(1);

			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = this._holes[i] = this._convertLatLngs(this._holes[i]);
				if (hole[0].equals(hole[hole.length - 1])) {
					hole.pop();
				}
			}
		}

		// filter out last point if its equal to the first one
		latlngs = this._latlngs;

		if (latlngs.length >= 2 && latlngs[0].equals(latlngs[latlngs.length - 1])) {
			latlngs.pop();
		}
	},

	projectLatlngs: function () {
		L.Polyline.prototype.projectLatlngs.call(this);

		// project polygon holes points
		// TODO move this logic to Polyline to get rid of duplication
		this._holePoints = [];

		if (!this._holes) { return; }

		var i, j, len, len2;

		for (i = 0, len = this._holes.length; i < len; i++) {
			this._holePoints[i] = [];

			for (j = 0, len2 = this._holes[i].length; j < len2; j++) {
				this._holePoints[i][j] = this._map.latLngToLayerPoint(this._holes[i][j]);
			}
		}
	},

	setLatLngs: function (latlngs) {
		if (latlngs && L.Util.isArray(latlngs[0]) && (typeof latlngs[0][0] !== 'number')) {
			this._initWithHoles(latlngs);
			return this.redraw();
		} else {
			return L.Polyline.prototype.setLatLngs.call(this, latlngs);
		}
	},

	_clipPoints: function () {
		var points = this._originalPoints,
		    newParts = [];

		this._parts = [points].concat(this._holePoints);

		if (this.options.noClip) { return; }

		for (var i = 0, len = this._parts.length; i < len; i++) {
			var clipped = L.PolyUtil.clipPolygon(this._parts[i], this._map._pathViewport);
			if (clipped.length) {
				newParts.push(clipped);
			}
		}

		this._parts = newParts;
	},

	_getPathPartStr: function (points) {
		var str = L.Polyline.prototype._getPathPartStr.call(this, points);
		return str + (L.Browser.svg ? 'z' : 'x');
	}
});

L.polygon = function (latlngs, options) {
	return new L.Polygon(latlngs, options);
};


/*
 * Contains L.MultiPolyline and L.MultiPolygon layers.
 */

(function () {
	function createMulti(Klass) {

		return L.FeatureGroup.extend({

			initialize: function (latlngs, options) {
				this._layers = {};
				this._options = options;
				this.setLatLngs(latlngs);
			},

			setLatLngs: function (latlngs) {
				var i = 0,
				    len = latlngs.length;

				this.eachLayer(function (layer) {
					if (i < len) {
						layer.setLatLngs(latlngs[i++]);
					} else {
						this.removeLayer(layer);
					}
				}, this);

				while (i < len) {
					this.addLayer(new Klass(latlngs[i++], this._options));
				}

				return this;
			},

			getLatLngs: function () {
				var latlngs = [];

				this.eachLayer(function (layer) {
					latlngs.push(layer.getLatLngs());
				});

				return latlngs;
			}
		});
	}

	L.MultiPolyline = createMulti(L.Polyline);
	L.MultiPolygon = createMulti(L.Polygon);

	L.multiPolyline = function (latlngs, options) {
		return new L.MultiPolyline(latlngs, options);
	};

	L.multiPolygon = function (latlngs, options) {
		return new L.MultiPolygon(latlngs, options);
	};
}());


/*
 * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
 */

L.Rectangle = L.Polygon.extend({
	initialize: function (latLngBounds, options) {
		L.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
	},

	setBounds: function (latLngBounds) {
		this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	},

	_boundsToLatLngs: function (latLngBounds) {
		latLngBounds = L.latLngBounds(latLngBounds);
		return [
			latLngBounds.getSouthWest(),
			latLngBounds.getNorthWest(),
			latLngBounds.getNorthEast(),
			latLngBounds.getSouthEast()
		];
	}
});

L.rectangle = function (latLngBounds, options) {
	return new L.Rectangle(latLngBounds, options);
};


/*
 * L.Circle is a circle overlay (with a certain radius in meters).
 */

L.Circle = L.Path.extend({
	initialize: function (latlng, radius, options) {
		L.Path.prototype.initialize.call(this, options);

		this._latlng = L.latLng(latlng);
		this._mRadius = radius;
	},

	options: {
		fill: true
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		return this.redraw();
	},

	setRadius: function (radius) {
		this._mRadius = radius;
		return this.redraw();
	},

	projectLatlngs: function () {
		var lngRadius = this._getLngRadius(),
		    latlng = this._latlng,
		    pointLeft = this._map.latLngToLayerPoint([latlng.lat, latlng.lng - lngRadius]);

		this._point = this._map.latLngToLayerPoint(latlng);
		this._radius = Math.max(this._point.x - pointLeft.x, 1);
	},

	getBounds: function () {
		var lngRadius = this._getLngRadius(),
		    latRadius = (this._mRadius / 40075017) * 360,
		    latlng = this._latlng;

		return new L.LatLngBounds(
		        [latlng.lat - latRadius, latlng.lng - lngRadius],
		        [latlng.lat + latRadius, latlng.lng + lngRadius]);
	},

	getLatLng: function () {
		return this._latlng;
	},

	getPathString: function () {
		var p = this._point,
		    r = this._radius;

		if (this._checkIfEmpty()) {
			return '';
		}

		if (L.Browser.svg) {
			return 'M' + p.x + ',' + (p.y - r) +
			       'A' + r + ',' + r + ',0,1,1,' +
			       (p.x - 0.1) + ',' + (p.y - r) + ' z';
		} else {
			p._round();
			r = Math.round(r);
			return 'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r + ' 0,' + (65535 * 360);
		}
	},

	getRadius: function () {
		return this._mRadius;
	},

	// TODO Earth hardcoded, move into projection code!

	_getLatRadius: function () {
		return (this._mRadius / 40075017) * 360;
	},

	_getLngRadius: function () {
		return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
	},

	_checkIfEmpty: function () {
		if (!this._map) {
			return false;
		}
		var vp = this._map._pathViewport,
		    r = this._radius,
		    p = this._point;

		return p.x - r > vp.max.x || p.y - r > vp.max.y ||
		       p.x + r < vp.min.x || p.y + r < vp.min.y;
	}
});

L.circle = function (latlng, radius, options) {
	return new L.Circle(latlng, radius, options);
};


/*
 * L.CircleMarker is a circle overlay with a permanent pixel radius.
 */

L.CircleMarker = L.Circle.extend({
	options: {
		radius: 10,
		weight: 2
	},

	initialize: function (latlng, options) {
		L.Circle.prototype.initialize.call(this, latlng, null, options);
		this._radius = this.options.radius;
	},

	projectLatlngs: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
	},

	_updateStyle : function () {
		L.Circle.prototype._updateStyle.call(this);
		this.setRadius(this.options.radius);
	},

	setLatLng: function (latlng) {
		L.Circle.prototype.setLatLng.call(this, latlng);
		if (this._popup && this._popup._isOpen) {
			this._popup.setLatLng(latlng);
		}
		return this;
	},

	setRadius: function (radius) {
		this.options.radius = this._radius = radius;
		return this.redraw();
	},

	getRadius: function () {
		return this._radius;
	}
});

L.circleMarker = function (latlng, options) {
	return new L.CircleMarker(latlng, options);
};


/*
 * Extends L.Polyline to be able to manually detect clicks on Canvas-rendered polylines.
 */

L.Polyline.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p, closed) {
		var i, j, k, len, len2, dist, part,
		    w = this.options.weight / 2;

		if (L.Browser.touch) {
			w += 10; // polyline click tolerance on touch devices
		}

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];
			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				if (!closed && (j === 0)) {
					continue;
				}

				dist = L.LineUtil.pointToSegmentDistance(p, part[k], part[j]);

				if (dist <= w) {
					return true;
				}
			}
		}
		return false;
	}
});


/*
 * Extends L.Polygon to be able to manually detect clicks on Canvas-rendered polygons.
 */

L.Polygon.include(!L.Path.CANVAS ? {} : {
	_containsPoint: function (p) {
		var inside = false,
		    part, p1, p2,
		    i, j, k,
		    len, len2;

		// TODO optimization: check if within bounds first

		if (L.Polyline.prototype._containsPoint.call(this, p, true)) {
			// click on polygon border
			return true;
		}

		// ray casting algorithm for detecting if point is in polygon

		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				p1 = part[j];
				p2 = part[k];

				if (((p1.y > p.y) !== (p2.y > p.y)) &&
						(p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
					inside = !inside;
				}
			}
		}

		return inside;
	}
});


/*
 * Extends L.Circle with Canvas-specific code.
 */

L.Circle.include(!L.Path.CANVAS ? {} : {
	_drawPath: function () {
		var p = this._point;
		this._ctx.beginPath();
		this._ctx.arc(p.x, p.y, this._radius, 0, Math.PI * 2, false);
	},

	_containsPoint: function (p) {
		var center = this._point,
		    w2 = this.options.stroke ? this.options.weight / 2 : 0;

		return (p.distanceTo(center) <= this._radius + w2);
	}
});


/*
 * CircleMarker canvas specific drawing parts.
 */

L.CircleMarker.include(!L.Path.CANVAS ? {} : {
	_updateStyle: function () {
		L.Path.prototype._updateStyle.call(this);
	}
});


/*
 * L.GeoJSON turns any GeoJSON data into a Leaflet layer.
 */

L.GeoJSON = L.FeatureGroup.extend({

	initialize: function (geojson, options) {
		L.setOptions(this, options);

		this._layers = {};

		if (geojson) {
			this.addData(geojson);
		}
	},

	addData: function (geojson) {
		var features = L.Util.isArray(geojson) ? geojson : geojson.features,
		    i, len, feature;

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// Only add this if geometry or geometries are set and not null
				feature = features[i];
				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(features[i]);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(geojson)) { return; }

		var layer = L.GeoJSON.geometryToLayer(geojson, options.pointToLayer, options.coordsToLatLng, options);
		layer.feature = L.GeoJSON.asFeature(geojson);

		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(geojson, layer);
		}

		return this.addLayer(layer);
	},

	resetStyle: function (layer) {
		var style = this.options.style;
		if (style) {
			// reset any custom styles
			L.Util.extend(layer.options, layer.defaultOptions);

			this._setLayerStyle(layer, style);
		}
	},

	setStyle: function (style) {
		this.eachLayer(function (layer) {
			this._setLayerStyle(layer, style);
		}, this);
	},

	_setLayerStyle: function (layer, style) {
		if (typeof style === 'function') {
			style = style(layer.feature);
		}
		if (layer.setStyle) {
			layer.setStyle(style);
		}
	}
});

L.extend(L.GeoJSON, {
	geometryToLayer: function (geojson, pointToLayer, coordsToLatLng, vectorOptions) {
		var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
		    coords = geometry.coordinates,
		    layers = [],
		    latlng, latlngs, i, len;

		coordsToLatLng = coordsToLatLng || this.coordsToLatLng;

		switch (geometry.type) {
		case 'Point':
			latlng = coordsToLatLng(coords);
			return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);

		case 'MultiPoint':
			for (i = 0, len = coords.length; i < len; i++) {
				latlng = coordsToLatLng(coords[i]);
				layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
			}
			return new L.FeatureGroup(layers);

		case 'LineString':
			latlngs = this.coordsToLatLngs(coords, 0, coordsToLatLng);
			return new L.Polyline(latlngs, vectorOptions);

		case 'Polygon':
			if (coords.length === 2 && !coords[1].length) {
				throw new Error('Invalid GeoJSON object.');
			}
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.Polygon(latlngs, vectorOptions);

		case 'MultiLineString':
			latlngs = this.coordsToLatLngs(coords, 1, coordsToLatLng);
			return new L.MultiPolyline(latlngs, vectorOptions);

		case 'MultiPolygon':
			latlngs = this.coordsToLatLngs(coords, 2, coordsToLatLng);
			return new L.MultiPolygon(latlngs, vectorOptions);

		case 'GeometryCollection':
			for (i = 0, len = geometry.geometries.length; i < len; i++) {

				layers.push(this.geometryToLayer({
					geometry: geometry.geometries[i],
					type: 'Feature',
					properties: geojson.properties
				}, pointToLayer, coordsToLatLng, vectorOptions));
			}
			return new L.FeatureGroup(layers);

		default:
			throw new Error('Invalid GeoJSON object.');
		}
	},

	coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
		return new L.LatLng(coords[1], coords[0], coords[2]);
	},

	coordsToLatLngs: function (coords, levelsDeep, coordsToLatLng) { // (Array[, Number, Function]) -> Array
		var latlng, i, len,
		    latlngs = [];

		for (i = 0, len = coords.length; i < len; i++) {
			latlng = levelsDeep ?
			        this.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
			        (coordsToLatLng || this.coordsToLatLng)(coords[i]);

			latlngs.push(latlng);
		}

		return latlngs;
	},

	latLngToCoords: function (latlng) {
		var coords = [latlng.lng, latlng.lat];

		if (latlng.alt !== undefined) {
			coords.push(latlng.alt);
		}
		return coords;
	},

	latLngsToCoords: function (latLngs) {
		var coords = [];

		for (var i = 0, len = latLngs.length; i < len; i++) {
			coords.push(L.GeoJSON.latLngToCoords(latLngs[i]));
		}

		return coords;
	},

	getFeature: function (layer, newGeometry) {
		return layer.feature ? L.extend({}, layer.feature, {geometry: newGeometry}) : L.GeoJSON.asFeature(newGeometry);
	},

	asFeature: function (geoJSON) {
		if (geoJSON.type === 'Feature') {
			return geoJSON;
		}

		return {
			type: 'Feature',
			properties: {},
			geometry: geoJSON
		};
	}
});

var PointToGeoJSON = {
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'Point',
			coordinates: L.GeoJSON.latLngToCoords(this.getLatLng())
		});
	}
};

L.Marker.include(PointToGeoJSON);
L.Circle.include(PointToGeoJSON);
L.CircleMarker.include(PointToGeoJSON);

L.Polyline.include({
	toGeoJSON: function () {
		return L.GeoJSON.getFeature(this, {
			type: 'LineString',
			coordinates: L.GeoJSON.latLngsToCoords(this.getLatLngs())
		});
	}
});

L.Polygon.include({
	toGeoJSON: function () {
		var coords = [L.GeoJSON.latLngsToCoords(this.getLatLngs())],
		    i, len, hole;

		coords[0].push(coords[0][0]);

		if (this._holes) {
			for (i = 0, len = this._holes.length; i < len; i++) {
				hole = L.GeoJSON.latLngsToCoords(this._holes[i]);
				hole.push(hole[0]);
				coords.push(hole);
			}
		}

		return L.GeoJSON.getFeature(this, {
			type: 'Polygon',
			coordinates: coords
		});
	}
});

(function () {
	function multiToGeoJSON(type) {
		return function () {
			var coords = [];

			this.eachLayer(function (layer) {
				coords.push(layer.toGeoJSON().geometry.coordinates);
			});

			return L.GeoJSON.getFeature(this, {
				type: type,
				coordinates: coords
			});
		};
	}

	L.MultiPolyline.include({toGeoJSON: multiToGeoJSON('MultiLineString')});
	L.MultiPolygon.include({toGeoJSON: multiToGeoJSON('MultiPolygon')});

	L.LayerGroup.include({
		toGeoJSON: function () {

			var geometry = this.feature && this.feature.geometry,
				jsons = [],
				json;

			if (geometry && geometry.type === 'MultiPoint') {
				return multiToGeoJSON('MultiPoint').call(this);
			}

			var isGeometryCollection = geometry && geometry.type === 'GeometryCollection';

			this.eachLayer(function (layer) {
				if (layer.toGeoJSON) {
					json = layer.toGeoJSON();
					jsons.push(isGeometryCollection ? json.geometry : L.GeoJSON.asFeature(json));
				}
			});

			if (isGeometryCollection) {
				return L.GeoJSON.getFeature(this, {
					geometries: jsons,
					type: 'GeometryCollection'
				});
			}

			return {
				type: 'FeatureCollection',
				features: jsons
			};
		}
	});
}());

L.geoJson = function (geojson, options) {
	return new L.GeoJSON(geojson, options);
};


/*
 * L.DomEvent contains functions for working with DOM events.
 */

L.DomEvent = {
	/* inspired by John Resig, Dean Edwards and YUI addEvent implementations */
	addListener: function (obj, type, fn, context) { // (HTMLElement, String, Function[, Object])

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler, originalHandler, newType;

		if (obj[key]) { return this; }

		handler = function (e) {
			return fn.call(context || obj, e || L.DomEvent._getEvent());
		};

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			return this.addPointerListener(obj, type, handler, id);
		}
		if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
			this.addDoubleTapListener(obj, handler, id);
		}

		if ('addEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.addEventListener('DOMMouseScroll', handler, false);
				obj.addEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {

				originalHandler = handler;
				newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');

				handler = function (e) {
					if (!L.DomEvent._checkMouse(obj, e)) { return; }
					return originalHandler(e);
				};

				obj.addEventListener(newType, handler, false);

			} else if (type === 'click' && L.Browser.android) {
				originalHandler = handler;
				handler = function (e) {
					return L.DomEvent._filterClick(e, originalHandler);
				};

				obj.addEventListener(type, handler, false);
			} else {
				obj.addEventListener(type, handler, false);
			}

		} else if ('attachEvent' in obj) {
			obj.attachEvent('on' + type, handler);
		}

		obj[key] = handler;

		return this;
	},

	removeListener: function (obj, type, fn) {  // (HTMLElement, String, Function)

		var id = L.stamp(fn),
		    key = '_leaflet_' + type + id,
		    handler = obj[key];

		if (!handler) { return this; }

		if (L.Browser.pointer && type.indexOf('touch') === 0) {
			this.removePointerListener(obj, type, id);
		} else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
			this.removeDoubleTapListener(obj, id);

		} else if ('removeEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.removeEventListener('DOMMouseScroll', handler, false);
				obj.removeEventListener(type, handler, false);

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
				obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
			} else {
				obj.removeEventListener(type, handler, false);
			}
		} else if ('detachEvent' in obj) {
			obj.detachEvent('on' + type, handler);
		}

		obj[key] = null;

		return this;
	},

	stopPropagation: function (e) {

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
		L.DomEvent._skipped(e);

		return this;
	},

	disableScrollPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		return L.DomEvent
			.on(el, 'mousewheel', stop)
			.on(el, 'MozMousePixelScroll', stop);
	},

	disableClickPropagation: function (el) {
		var stop = L.DomEvent.stopPropagation;

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(el, L.Draggable.START[i], stop);
		}

		return L.DomEvent
			.on(el, 'click', L.DomEvent._fakeStop)
			.on(el, 'dblclick', stop);
	},

	preventDefault: function (e) {

		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		return this;
	},

	stop: function (e) {
		return L.DomEvent
			.preventDefault(e)
			.stopPropagation(e);
	},

	getMousePosition: function (e, container) {
		if (!container) {
			return new L.Point(e.clientX, e.clientY);
		}

		var rect = container.getBoundingClientRect();

		return new L.Point(
			e.clientX - rect.left - container.clientLeft,
			e.clientY - rect.top - container.clientTop);
	},

	getWheelDelta: function (e) {

		var delta = 0;

		if (e.wheelDelta) {
			delta = e.wheelDelta / 120;
		}
		if (e.detail) {
			delta = -e.detail / 3;
		}
		return delta;
	},

	_skipEvents: {},

	_fakeStop: function (e) {
		// fakes stopPropagation by setting a special event flag, checked/reset with L.DomEvent._skipped(e)
		L.DomEvent._skipEvents[e.type] = true;
	},

	_skipped: function (e) {
		var skipped = this._skipEvents[e.type];
		// reset when checking, as it's only used in map container and propagates outside of the map
		this._skipEvents[e.type] = false;
		return skipped;
	},

	// check if element really left/entered the event target (for mouseenter/mouseleave)
	_checkMouse: function (el, e) {

		var related = e.relatedTarget;

		if (!related) { return true; }

		try {
			while (related && (related !== el)) {
				related = related.parentNode;
			}
		} catch (err) {
			return false;
		}
		return (related !== el);
	},

	_getEvent: function () { // evil magic for IE
		/*jshint noarg:false */
		var e = window.event;
		if (!e) {
			var caller = arguments.callee.caller;
			while (caller) {
				e = caller['arguments'][0];
				if (e && window.Event === e.constructor) {
					break;
				}
				caller = caller.caller;
			}
		}
		return e;
	},

	// this is a horrible workaround for a bug in Android where a single touch triggers two click events
	_filterClick: function (e, handler) {
		var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
			elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);

		// are they closer together than 500ms yet more than 100ms?
		// Android typically triggers them ~300ms apart while multiple listeners
		// on the same event should be triggered far faster;
		// or check if click is simulated on the element, and if it is, reject any non-simulated events

		if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
			L.DomEvent.stop(e);
			return;
		}
		L.DomEvent._lastClick = timeStamp;

		return handler(e);
	}
};

L.DomEvent.on = L.DomEvent.addListener;
L.DomEvent.off = L.DomEvent.removeListener;


/*
 * L.Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
 */

L.Draggable = L.Class.extend({
	includes: L.Mixin.Events,

	statics: {
		START: L.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
		END: {
			mousedown: 'mouseup',
			touchstart: 'touchend',
			pointerdown: 'touchend',
			MSPointerDown: 'touchend'
		},
		MOVE: {
			mousedown: 'mousemove',
			touchstart: 'touchmove',
			pointerdown: 'touchmove',
			MSPointerDown: 'touchmove'
		}
	},

	initialize: function (element, dragStartTarget) {
		this._element = element;
		this._dragStartTarget = dragStartTarget || element;
	},

	enable: function () {
		if (this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.on(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = true;
	},

	disable: function () {
		if (!this._enabled) { return; }

		for (var i = L.Draggable.START.length - 1; i >= 0; i--) {
			L.DomEvent.off(this._dragStartTarget, L.Draggable.START[i], this._onDown, this);
		}

		this._enabled = false;
		this._moved = false;
	},

	_onDown: function (e) {
		this._moved = false;

		if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

		L.DomEvent.stopPropagation(e);

		if (L.Draggable._disabled) { return; }

		L.DomUtil.disableImageDrag();
		L.DomUtil.disableTextSelection();

		if (this._moving) { return; }

		var first = e.touches ? e.touches[0] : e;

		this._startPoint = new L.Point(first.clientX, first.clientY);
		this._startPos = this._newPos = L.DomUtil.getPosition(this._element);

		L.DomEvent
		    .on(document, L.Draggable.MOVE[e.type], this._onMove, this)
		    .on(document, L.Draggable.END[e.type], this._onUp, this);
	},

	_onMove: function (e) {
		if (e.touches && e.touches.length > 1) {
			this._moved = true;
			return;
		}

		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
		    newPoint = new L.Point(first.clientX, first.clientY),
		    offset = newPoint.subtract(this._startPoint);

		if (!offset.x && !offset.y) { return; }
		if (L.Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) { return; }

		L.DomEvent.preventDefault(e);

		if (!this._moved) {
			this.fire('dragstart');

			this._moved = true;
			this._startPos = L.DomUtil.getPosition(this._element).subtract(offset);

			L.DomUtil.addClass(document.body, 'leaflet-dragging');
			this._lastTarget = e.target || e.srcElement;
			L.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
		}

		this._newPos = this._startPos.add(offset);
		this._moving = true;

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
	},

	_updatePosition: function () {
		this.fire('predrag');
		L.DomUtil.setPosition(this._element, this._newPos);
		this.fire('drag');
	},

	_onUp: function () {
		L.DomUtil.removeClass(document.body, 'leaflet-dragging');

		if (this._lastTarget) {
			L.DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
			this._lastTarget = null;
		}

		for (var i in L.Draggable.MOVE) {
			L.DomEvent
			    .off(document, L.Draggable.MOVE[i], this._onMove)
			    .off(document, L.Draggable.END[i], this._onUp);
		}

		L.DomUtil.enableImageDrag();
		L.DomUtil.enableTextSelection();

		if (this._moved && this._moving) {
			// ensure drag is not fired after dragend
			L.Util.cancelAnimFrame(this._animRequest);

			this.fire('dragend', {
				distance: this._newPos.distanceTo(this._startPos)
			});
		}

		this._moving = false;
	}
});


/*
	L.Handler is a base class for handler classes that are used internally to inject
	interaction features like dragging to classes like Map and Marker.
*/

L.Handler = L.Class.extend({
	initialize: function (map) {
		this._map = map;
	},

	enable: function () {
		if (this._enabled) { return; }

		this._enabled = true;
		this.addHooks();
	},

	disable: function () {
		if (!this._enabled) { return; }

		this._enabled = false;
		this.removeHooks();
	},

	enabled: function () {
		return !!this._enabled;
	}
});


/*
 * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
 */

L.Map.mergeOptions({
	dragging: true,

	inertia: !L.Browser.android23,
	inertiaDeceleration: 3400, // px/s^2
	inertiaMaxSpeed: Infinity, // px/s
	inertiaThreshold: L.Browser.touch ? 32 : 18, // ms
	easeLinearity: 0.25,

	// TODO refactor, move to CRS
	worldCopyJump: false
});

L.Map.Drag = L.Handler.extend({
	addHooks: function () {
		if (!this._draggable) {
			var map = this._map;

			this._draggable = new L.Draggable(map._mapPane, map._container);

			this._draggable.on({
				'dragstart': this._onDragStart,
				'drag': this._onDrag,
				'dragend': this._onDragEnd
			}, this);

			if (map.options.worldCopyJump) {
				this._draggable.on('predrag', this._onPreDrag, this);
				map.on('viewreset', this._onViewReset, this);

				map.whenReady(this._onViewReset, this);
			}
		}
		this._draggable.enable();
	},

	removeHooks: function () {
		this._draggable.disable();
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		var map = this._map;

		if (map._panAnim) {
			map._panAnim.stop();
		}

		map
		    .fire('movestart')
		    .fire('dragstart');

		if (map.options.inertia) {
			this._positions = [];
			this._times = [];
		}
	},

	_onDrag: function () {
		if (this._map.options.inertia) {
			var time = this._lastTime = +new Date(),
			    pos = this._lastPos = this._draggable._newPos;

			this._positions.push(pos);
			this._times.push(time);

			if (time - this._times[0] > 200) {
				this._positions.shift();
				this._times.shift();
			}
		}

		this._map
		    .fire('move')
		    .fire('drag');
	},

	_onViewReset: function () {
		// TODO fix hardcoded Earth values
		var pxCenter = this._map.getSize()._divideBy(2),
		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
		this._worldWidth = this._map.project([0, 180]).x;
	},

	_onPreDrag: function () {
		// TODO refactor to be able to adjust map pane position after zoom
		var worldWidth = this._worldWidth,
		    halfWidth = Math.round(worldWidth / 2),
		    dx = this._initialWorldOffset,
		    x = this._draggable._newPos.x,
		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

		this._draggable._newPos.x = newX;
	},

	_onDragEnd: function (e) {
		var map = this._map,
		    options = map.options,
		    delay = +new Date() - this._lastTime,

		    noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];

		map.fire('dragend', e);

		if (noInertia) {
			map.fire('moveend');

		} else {

			var direction = this._lastPos.subtract(this._positions[0]),
			    duration = (this._lastTime + delay - this._times[0]) / 1000,
			    ease = options.easeLinearity,

			    speedVector = direction.multiplyBy(ease / duration),
			    speed = speedVector.distanceTo([0, 0]),

			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

			if (!offset.x || !offset.y) {
				map.fire('moveend');

			} else {
				offset = map._limitOffset(offset, map.options.maxBounds);

				L.Util.requestAnimFrame(function () {
					map.panBy(offset, {
						duration: decelerationDuration,
						easeLinearity: ease,
						noMoveStart: true
					});
				});
			}
		}
	}
});

L.Map.addInitHook('addHandler', 'dragging', L.Map.Drag);


/*
 * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
 */

L.Map.mergeOptions({
	doubleClickZoom: true
});

L.Map.DoubleClickZoom = L.Handler.extend({
	addHooks: function () {
		this._map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this._map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		var map = this._map,
		    zoom = map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1);

		if (map.options.doubleClickZoom === 'center') {
			map.setZoom(zoom);
		} else {
			map.setZoomAround(e.containerPoint, zoom);
		}
	}
});

L.Map.addInitHook('addHandler', 'doubleClickZoom', L.Map.DoubleClickZoom);


/*
 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
 */

L.Map.mergeOptions({
	scrollWheelZoom: true
});

L.Map.ScrollWheelZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'mousewheel', this._onWheelScroll, this);
		L.DomEvent.on(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
		this._delta = 0;
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'mousewheel', this._onWheelScroll);
		L.DomEvent.off(this._map._container, 'MozMousePixelScroll', L.DomEvent.preventDefault);
	},

	_onWheelScroll: function (e) {
		var delta = L.DomEvent.getWheelDelta(e);

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(40 - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(L.bind(this._performZoom, this), left);

		L.DomEvent.preventDefault(e);
		L.DomEvent.stopPropagation(e);
	},

	_performZoom: function () {
		var map = this._map,
		    delta = this._delta,
		    zoom = map.getZoom();

		delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
		delta = Math.max(Math.min(delta, 4), -4);
		delta = map._limitZoom(zoom + delta) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			map.setZoomAround(this._lastMousePos, zoom + delta);
		}
	}
});

L.Map.addInitHook('addHandler', 'scrollWheelZoom', L.Map.ScrollWheelZoom);


/*
 * Extends the event handling code with double tap support for mobile browsers.
 */

L.extend(L.DomEvent, {

	_touchstart: L.Browser.msPointer ? 'MSPointerDown' : L.Browser.pointer ? 'pointerdown' : 'touchstart',
	_touchend: L.Browser.msPointer ? 'MSPointerUp' : L.Browser.pointer ? 'pointerup' : 'touchend',

	// inspired by Zepto touch code by Thomas Fuchs
	addDoubleTapListener: function (obj, handler, id) {
		var last,
		    doubleTap = false,
		    delay = 250,
		    touch,
		    pre = '_leaflet_',
		    touchstart = this._touchstart,
		    touchend = this._touchend,
		    trackedTouches = [];

		function onTouchStart(e) {
			var count;

			if (L.Browser.pointer) {
				trackedTouches.push(e.pointerId);
				count = trackedTouches.length;
			} else {
				count = e.touches.length;
			}
			if (count > 1) {
				return;
			}

			var now = Date.now(),
				delta = now - (last || now);

			touch = e.touches ? e.touches[0] : e;
			doubleTap = (delta > 0 && delta <= delay);
			last = now;
		}

		function onTouchEnd(e) {
			if (L.Browser.pointer) {
				var idx = trackedTouches.indexOf(e.pointerId);
				if (idx === -1) {
					return;
				}
				trackedTouches.splice(idx, 1);
			}

			if (doubleTap) {
				if (L.Browser.pointer) {
					// work around .type being readonly with MSPointer* events
					var newTouch = { },
						prop;

					// jshint forin:false
					for (var i in touch) {
						prop = touch[i];
						if (typeof prop === 'function') {
							newTouch[i] = prop.bind(touch);
						} else {
							newTouch[i] = prop;
						}
					}
					touch = newTouch;
				}
				touch.type = 'dblclick';
				handler(touch);
				last = null;
			}
		}
		obj[pre + touchstart + id] = onTouchStart;
		obj[pre + touchend + id] = onTouchEnd;

		// on pointer we need to listen on the document, otherwise a drag starting on the map and moving off screen
		// will not come through to us, so we will lose track of how many touches are ongoing
		var endElement = L.Browser.pointer ? document.documentElement : obj;

		obj.addEventListener(touchstart, onTouchStart, false);
		endElement.addEventListener(touchend, onTouchEnd, false);

		if (L.Browser.pointer) {
			endElement.addEventListener(L.DomEvent.POINTER_CANCEL, onTouchEnd, false);
		}

		return this;
	},

	removeDoubleTapListener: function (obj, id) {
		var pre = '_leaflet_';

		obj.removeEventListener(this._touchstart, obj[pre + this._touchstart + id], false);
		(L.Browser.pointer ? document.documentElement : obj).removeEventListener(
		        this._touchend, obj[pre + this._touchend + id], false);

		if (L.Browser.pointer) {
			document.documentElement.removeEventListener(L.DomEvent.POINTER_CANCEL, obj[pre + this._touchend + id],
				false);
		}

		return this;
	}
});


/*
 * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
 */

L.extend(L.DomEvent, {

	//static
	POINTER_DOWN: L.Browser.msPointer ? 'MSPointerDown' : 'pointerdown',
	POINTER_MOVE: L.Browser.msPointer ? 'MSPointerMove' : 'pointermove',
	POINTER_UP: L.Browser.msPointer ? 'MSPointerUp' : 'pointerup',
	POINTER_CANCEL: L.Browser.msPointer ? 'MSPointerCancel' : 'pointercancel',

	_pointers: [],
	_pointerDocumentListener: false,

	// Provides a touch events wrapper for (ms)pointer events.
	// Based on changes by veproza https://github.com/CloudMade/Leaflet/pull/1019
	//ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

	addPointerListener: function (obj, type, handler, id) {

		switch (type) {
		case 'touchstart':
			return this.addPointerListenerStart(obj, type, handler, id);
		case 'touchend':
			return this.addPointerListenerEnd(obj, type, handler, id);
		case 'touchmove':
			return this.addPointerListenerMove(obj, type, handler, id);
		default:
			throw 'Unknown touch event type';
		}
	},

	addPointerListenerStart: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    pointers = this._pointers;

		var cb = function (e) {

			L.DomEvent.preventDefault(e);

			var alreadyInArray = false;
			for (var i = 0; i < pointers.length; i++) {
				if (pointers[i].pointerId === e.pointerId) {
					alreadyInArray = true;
					break;
				}
			}
			if (!alreadyInArray) {
				pointers.push(e);
			}

			e.touches = pointers.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchstart' + id] = cb;
		obj.addEventListener(this.POINTER_DOWN, cb, false);

		// need to also listen for end events to keep the _pointers list accurate
		// this needs to be on the body and never go away
		if (!this._pointerDocumentListener) {
			var internalCb = function (e) {
				for (var i = 0; i < pointers.length; i++) {
					if (pointers[i].pointerId === e.pointerId) {
						pointers.splice(i, 1);
						break;
					}
				}
			};
			//We listen on the documentElement as any drags that end by moving the touch off the screen get fired there
			document.documentElement.addEventListener(this.POINTER_UP, internalCb, false);
			document.documentElement.addEventListener(this.POINTER_CANCEL, internalCb, false);

			this._pointerDocumentListener = true;
		}

		return this;
	},

	addPointerListenerMove: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		function cb(e) {

			// don't fire touch moves when mouse isn't down
			if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches[i] = e;
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		}

		obj[pre + 'touchmove' + id] = cb;
		obj.addEventListener(this.POINTER_MOVE, cb, false);

		return this;
	},

	addPointerListenerEnd: function (obj, type, handler, id) {
		var pre = '_leaflet_',
		    touches = this._pointers;

		var cb = function (e) {
			for (var i = 0; i < touches.length; i++) {
				if (touches[i].pointerId === e.pointerId) {
					touches.splice(i, 1);
					break;
				}
			}

			e.touches = touches.slice();
			e.changedTouches = [e];

			handler(e);
		};

		obj[pre + 'touchend' + id] = cb;
		obj.addEventListener(this.POINTER_UP, cb, false);
		obj.addEventListener(this.POINTER_CANCEL, cb, false);

		return this;
	},

	removePointerListener: function (obj, type, id) {
		var pre = '_leaflet_',
		    cb = obj[pre + type + id];

		switch (type) {
		case 'touchstart':
			obj.removeEventListener(this.POINTER_DOWN, cb, false);
			break;
		case 'touchmove':
			obj.removeEventListener(this.POINTER_MOVE, cb, false);
			break;
		case 'touchend':
			obj.removeEventListener(this.POINTER_UP, cb, false);
			obj.removeEventListener(this.POINTER_CANCEL, cb, false);
			break;
		}

		return this;
	}
});


/*
 * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
 */

L.Map.mergeOptions({
	touchZoom: L.Browser.touch && !L.Browser.android23,
	bounceAtZoomLimits: true
});

L.Map.TouchZoom = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	_onTouchStart: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]),
		    viewCenter = map._getCenterLayerPoint();

		this._startCenter = p1.add(p2)._divideBy(2);
		this._startDist = p1.distanceTo(p2);

		this._moved = false;
		this._zooming = true;

		this._centerOffset = viewCenter.subtract(this._startCenter);

		if (map._panAnim) {
			map._panAnim.stop();
		}

		L.DomEvent
		    .on(document, 'touchmove', this._onTouchMove, this)
		    .on(document, 'touchend', this._onTouchEnd, this);

		L.DomEvent.preventDefault(e);
	},

	_onTouchMove: function (e) {
		var map = this._map;

		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

		var p1 = map.mouseEventToLayerPoint(e.touches[0]),
		    p2 = map.mouseEventToLayerPoint(e.touches[1]);

		this._scale = p1.distanceTo(p2) / this._startDist;
		this._delta = p1._add(p2)._divideBy(2)._subtract(this._startCenter);

		if (this._scale === 1) { return; }

		if (!map.options.bounceAtZoomLimits) {
			if ((map.getZoom() === map.getMinZoom() && this._scale < 1) ||
			    (map.getZoom() === map.getMaxZoom() && this._scale > 1)) { return; }
		}

		if (!this._moved) {
			L.DomUtil.addClass(map._mapPane, 'leaflet-touching');

			map
			    .fire('movestart')
			    .fire('zoomstart');

			this._moved = true;
		}

		L.Util.cancelAnimFrame(this._animRequest);
		this._animRequest = L.Util.requestAnimFrame(
		        this._updateOnMove, this, true, this._map._container);

		L.DomEvent.preventDefault(e);
	},

	_updateOnMove: function () {
		var map = this._map,
		    origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),
		    zoom = map.getScaleZoom(this._scale);

		map._animateZoom(center, zoom, this._startCenter, this._scale, this._delta, false, true);
	},

	_onTouchEnd: function () {
		if (!this._moved || !this._zooming) {
			this._zooming = false;
			return;
		}

		var map = this._map;

		this._zooming = false;
		L.DomUtil.removeClass(map._mapPane, 'leaflet-touching');
		L.Util.cancelAnimFrame(this._animRequest);

		L.DomEvent
		    .off(document, 'touchmove', this._onTouchMove)
		    .off(document, 'touchend', this._onTouchEnd);

		var origin = this._getScaleOrigin(),
		    center = map.layerPointToLatLng(origin),

		    oldZoom = map.getZoom(),
		    floatZoomDelta = map.getScaleZoom(this._scale) - oldZoom,
		    roundZoomDelta = (floatZoomDelta > 0 ?
		            Math.ceil(floatZoomDelta) : Math.floor(floatZoomDelta)),

		    zoom = map._limitZoom(oldZoom + roundZoomDelta),
		    scale = map.getZoomScale(zoom) / this._scale;

		map._animateZoom(center, zoom, origin, scale);
	},

	_getScaleOrigin: function () {
		var centerOffset = this._centerOffset.subtract(this._delta).divideBy(this._scale);
		return this._startCenter.add(centerOffset);
	}
});

L.Map.addInitHook('addHandler', 'touchZoom', L.Map.TouchZoom);


/*
 * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
 */

L.Map.mergeOptions({
	tap: true,
	tapTolerance: 15
});

L.Map.Tap = L.Handler.extend({
	addHooks: function () {
		L.DomEvent.on(this._map._container, 'touchstart', this._onDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._map._container, 'touchstart', this._onDown, this);
	},

	_onDown: function (e) {
		if (!e.touches) { return; }

		L.DomEvent.preventDefault(e);

		this._fireClick = true;

		// don't simulate click or track longpress if more than 1 touch
		if (e.touches.length > 1) {
			this._fireClick = false;
			clearTimeout(this._holdTimeout);
			return;
		}

		var first = e.touches[0],
		    el = first.target;

		this._startPos = this._newPos = new L.Point(first.clientX, first.clientY);

		// if touching a link, highlight it
		if (el.tagName && el.tagName.toLowerCase() === 'a') {
			L.DomUtil.addClass(el, 'leaflet-active');
		}

		// simulate long hold but setting a timeout
		this._holdTimeout = setTimeout(L.bind(function () {
			if (this._isTapValid()) {
				this._fireClick = false;
				this._onUp();
				this._simulateEvent('contextmenu', first);
			}
		}, this), 1000);

		L.DomEvent
			.on(document, 'touchmove', this._onMove, this)
			.on(document, 'touchend', this._onUp, this);
	},

	_onUp: function (e) {
		clearTimeout(this._holdTimeout);

		L.DomEvent
			.off(document, 'touchmove', this._onMove, this)
			.off(document, 'touchend', this._onUp, this);

		if (this._fireClick && e && e.changedTouches) {

			var first = e.changedTouches[0],
			    el = first.target;

			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
				L.DomUtil.removeClass(el, 'leaflet-active');
			}

			// simulate click if the touch didn't move too much
			if (this._isTapValid()) {
				this._simulateEvent('click', first);
			}
		}
	},

	_isTapValid: function () {
		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
	},

	_onMove: function (e) {
		var first = e.touches[0];
		this._newPos = new L.Point(first.clientX, first.clientY);
	},

	_simulateEvent: function (type, e) {
		var simulatedEvent = document.createEvent('MouseEvents');

		simulatedEvent._simulated = true;
		e.target._simulatedClick = true;

		simulatedEvent.initMouseEvent(
		        type, true, true, window, 1,
		        e.screenX, e.screenY,
		        e.clientX, e.clientY,
		        false, false, false, false, 0, null);

		e.target.dispatchEvent(simulatedEvent);
	}
});

if (L.Browser.touch && !L.Browser.pointer) {
	L.Map.addInitHook('addHandler', 'tap', L.Map.Tap);
}


/*
 * L.Handler.ShiftDragZoom is used to add shift-drag zoom interaction to the map
  * (zoom to a selected bounding box), enabled by default.
 */

L.Map.mergeOptions({
	boxZoom: true
});

L.Map.BoxZoom = L.Handler.extend({
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
		this._moved = false;
	},

	addHooks: function () {
		L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
	},

	removeHooks: function () {
		L.DomEvent.off(this._container, 'mousedown', this._onMouseDown);
		this._moved = false;
	},

	moved: function () {
		return this._moved;
	},

	_onMouseDown: function (e) {
		this._moved = false;

		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

		L.DomUtil.disableTextSelection();
		L.DomUtil.disableImageDrag();

		this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

		L.DomEvent
		    .on(document, 'mousemove', this._onMouseMove, this)
		    .on(document, 'mouseup', this._onMouseUp, this)
		    .on(document, 'keydown', this._onKeyDown, this);
	},

	_onMouseMove: function (e) {
		if (!this._moved) {
			this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
			L.DomUtil.setPosition(this._box, this._startLayerPoint);

			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';
			this._map.fire('boxzoomstart');
		}

		var startPoint = this._startLayerPoint,
		    box = this._box,

		    layerPoint = this._map.mouseEventToLayerPoint(e),
		    offset = layerPoint.subtract(startPoint),

		    newPos = new L.Point(
		        Math.min(layerPoint.x, startPoint.x),
		        Math.min(layerPoint.y, startPoint.y));

		L.DomUtil.setPosition(box, newPos);

		this._moved = true;

		// TODO refactor: remove hardcoded 4 pixels
		box.style.width  = (Math.max(0, Math.abs(offset.x) - 4)) + 'px';
		box.style.height = (Math.max(0, Math.abs(offset.y) - 4)) + 'px';
	},

	_finish: function () {
		if (this._moved) {
			this._pane.removeChild(this._box);
			this._container.style.cursor = '';
		}

		L.DomUtil.enableTextSelection();
		L.DomUtil.enableImageDrag();

		L.DomEvent
		    .off(document, 'mousemove', this._onMouseMove)
		    .off(document, 'mouseup', this._onMouseUp)
		    .off(document, 'keydown', this._onKeyDown);
	},

	_onMouseUp: function (e) {

		this._finish();

		var map = this._map,
		    layerPoint = map.mouseEventToLayerPoint(e);

		if (this._startLayerPoint.equals(layerPoint)) { return; }

		var bounds = new L.LatLngBounds(
		        map.layerPointToLatLng(this._startLayerPoint),
		        map.layerPointToLatLng(layerPoint));

		map.fitBounds(bounds);

		map.fire('boxzoomend', {
			boxZoomBounds: bounds
		});
	},

	_onKeyDown: function (e) {
		if (e.keyCode === 27) {
			this._finish();
		}
	}
});

L.Map.addInitHook('addHandler', 'boxZoom', L.Map.BoxZoom);


/*
 * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
 */

L.Map.mergeOptions({
	keyboard: true,
	keyboardPanOffset: 80,
	keyboardZoomOffset: 1
});

L.Map.Keyboard = L.Handler.extend({

	keyCodes: {
		left:    [37],
		right:   [39],
		down:    [40],
		up:      [38],
		zoomIn:  [187, 107, 61, 171],
		zoomOut: [189, 109, 173]
	},

	initialize: function (map) {
		this._map = map;

		this._setPanOffset(map.options.keyboardPanOffset);
		this._setZoomOffset(map.options.keyboardZoomOffset);
	},

	addHooks: function () {
		var container = this._map._container;

		// make the container focusable by tabbing
		if (container.tabIndex === -1) {
			container.tabIndex = '0';
		}

		L.DomEvent
		    .on(container, 'focus', this._onFocus, this)
		    .on(container, 'blur', this._onBlur, this)
		    .on(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .on('focus', this._addHooks, this)
		    .on('blur', this._removeHooks, this);
	},

	removeHooks: function () {
		this._removeHooks();

		var container = this._map._container;

		L.DomEvent
		    .off(container, 'focus', this._onFocus, this)
		    .off(container, 'blur', this._onBlur, this)
		    .off(container, 'mousedown', this._onMouseDown, this);

		this._map
		    .off('focus', this._addHooks, this)
		    .off('blur', this._removeHooks, this);
	},

	_onMouseDown: function () {
		if (this._focused) { return; }

		var body = document.body,
		    docEl = document.documentElement,
		    top = body.scrollTop || docEl.scrollTop,
		    left = body.scrollLeft || docEl.scrollLeft;

		this._map._container.focus();

		window.scrollTo(left, top);
	},

	_onFocus: function () {
		this._focused = true;
		this._map.fire('focus');
	},

	_onBlur: function () {
		this._focused = false;
		this._map.fire('blur');
	},

	_setPanOffset: function (pan) {
		var keys = this._panKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.left.length; i < len; i++) {
			keys[codes.left[i]] = [-1 * pan, 0];
		}
		for (i = 0, len = codes.right.length; i < len; i++) {
			keys[codes.right[i]] = [pan, 0];
		}
		for (i = 0, len = codes.down.length; i < len; i++) {
			keys[codes.down[i]] = [0, pan];
		}
		for (i = 0, len = codes.up.length; i < len; i++) {
			keys[codes.up[i]] = [0, -1 * pan];
		}
	},

	_setZoomOffset: function (zoom) {
		var keys = this._zoomKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
			keys[codes.zoomIn[i]] = zoom;
		}
		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
			keys[codes.zoomOut[i]] = -zoom;
		}
	},

	_addHooks: function () {
		L.DomEvent.on(document, 'keydown', this._onKeyDown, this);
	},

	_removeHooks: function () {
		L.DomEvent.off(document, 'keydown', this._onKeyDown, this);
	},

	_onKeyDown: function (e) {
		var key = e.keyCode,
		    map = this._map;

		if (key in this._panKeys) {

			if (map._panAnim && map._panAnim._inProgress) { return; }

			map.panBy(this._panKeys[key]);

			if (map.options.maxBounds) {
				map.panInsideBounds(map.options.maxBounds);
			}

		} else if (key in this._zoomKeys) {
			map.setZoom(map.getZoom() + this._zoomKeys[key]);

		} else {
			return;
		}

		L.DomEvent.stop(e);
	}
});

L.Map.addInitHook('addHandler', 'keyboard', L.Map.Keyboard);


/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */

L.Handler.MarkerDrag = L.Handler.extend({
	initialize: function (marker) {
		this._marker = marker;
	},

	addHooks: function () {
		var icon = this._marker._icon;
		if (!this._draggable) {
			this._draggable = new L.Draggable(icon, icon);
		}

		this._draggable
			.on('dragstart', this._onDragStart, this)
			.on('drag', this._onDrag, this)
			.on('dragend', this._onDragEnd, this);
		this._draggable.enable();
		L.DomUtil.addClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	removeHooks: function () {
		this._draggable
			.off('dragstart', this._onDragStart, this)
			.off('drag', this._onDrag, this)
			.off('dragend', this._onDragEnd, this);

		this._draggable.disable();
		L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		this._marker
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart');
	},

	_onDrag: function () {
		var marker = this._marker,
		    shadow = marker._shadow,
		    iconPos = L.DomUtil.getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos);

		// update shadow position
		if (shadow) {
			L.DomUtil.setPosition(shadow, iconPos);
		}

		marker._latlng = latlng;

		marker
		    .fire('move', {latlng: latlng})
		    .fire('drag');
	},

	_onDragEnd: function (e) {
		this._marker
		    .fire('moveend')
		    .fire('dragend', e);
	}
});


/*
 * L.Control is a base class for implementing map controls. Handles positioning.
 * All other controls extend from this class.
 */

L.Control = L.Class.extend({
	options: {
		position: 'topright'
	},

	initialize: function (options) {
		L.setOptions(this, options);
	},

	getPosition: function () {
		return this.options.position;
	},

	setPosition: function (position) {
		var map = this._map;

		if (map) {
			map.removeControl(this);
		}

		this.options.position = position;

		if (map) {
			map.addControl(this);
		}

		return this;
	},

	getContainer: function () {
		return this._container;
	},

	addTo: function (map) {
		this._map = map;

		var container = this._container = this.onAdd(map),
		    pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		L.DomUtil.addClass(container, 'leaflet-control');

		if (pos.indexOf('bottom') !== -1) {
			corner.insertBefore(container, corner.firstChild);
		} else {
			corner.appendChild(container);
		}

		return this;
	},

	removeFrom: function (map) {
		var pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		corner.removeChild(this._container);
		this._map = null;

		if (this.onRemove) {
			this.onRemove(map);
		}

		return this;
	},

	_refocusOnMap: function () {
		if (this._map) {
			this._map.getContainer().focus();
		}
	}
});

L.control = function (options) {
	return new L.Control(options);
};


// adds control-related methods to L.Map

L.Map.include({
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	removeControl: function (control) {
		control.removeFrom(this);
		return this;
	},

	_initControlPos: function () {
		var corners = this._controlCorners = {},
		    l = 'leaflet-',
		    container = this._controlContainer =
		            L.DomUtil.create('div', l + 'control-container', this._container);

		function createCorner(vSide, hSide) {
			var className = l + vSide + ' ' + l + hSide;

			corners[vSide + hSide] = L.DomUtil.create('div', className, container);
		}

		createCorner('top', 'left');
		createCorner('top', 'right');
		createCorner('bottom', 'left');
		createCorner('bottom', 'right');
	},

	_clearControlPos: function () {
		this._container.removeChild(this._controlContainer);
	}
});


/*
 * L.Control.Zoom is used for the default zoom buttons on the map.
 */

L.Control.Zoom = L.Control.extend({
	options: {
		position: 'topleft',
		zoomInText: '+',
		zoomInTitle: 'Zoom in',
		zoomOutText: '-',
		zoomOutTitle: 'Zoom out'
	},

	onAdd: function (map) {
		var zoomName = 'leaflet-control-zoom',
		    container = L.DomUtil.create('div', zoomName + ' leaflet-bar');

		this._map = map;

		this._zoomInButton  = this._createButton(
		        this.options.zoomInText, this.options.zoomInTitle,
		        zoomName + '-in',  container, this._zoomIn,  this);
		this._zoomOutButton = this._createButton(
		        this.options.zoomOutText, this.options.zoomOutTitle,
		        zoomName + '-out', container, this._zoomOut, this);

		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	_zoomIn: function (e) {
		this._map.zoomIn(e.shiftKey ? 3 : 1);
	},

	_zoomOut: function (e) {
		this._map.zoomOut(e.shiftKey ? 3 : 1);
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
		    .on(link, 'click', stop)
		    .on(link, 'mousedown', stop)
		    .on(link, 'dblclick', stop)
		    .on(link, 'click', L.DomEvent.preventDefault)
		    .on(link, 'click', fn, context)
		    .on(link, 'click', this._refocusOnMap, context);

		return link;
	},

	_updateDisabled: function () {
		var map = this._map,
			className = 'leaflet-disabled';

		L.DomUtil.removeClass(this._zoomInButton, className);
		L.DomUtil.removeClass(this._zoomOutButton, className);

		if (map._zoom === map.getMinZoom()) {
			L.DomUtil.addClass(this._zoomOutButton, className);
		}
		if (map._zoom === map.getMaxZoom()) {
			L.DomUtil.addClass(this._zoomInButton, className);
		}
	}
});

L.Map.mergeOptions({
	zoomControl: true
});

L.Map.addInitHook(function () {
	if (this.options.zoomControl) {
		this.zoomControl = new L.Control.Zoom();
		this.addControl(this.zoomControl);
	}
});

L.control.zoom = function (options) {
	return new L.Control.Zoom(options);
};



/*
 * L.Control.Attribution is used for displaying attribution on the map (added by default).
 */

L.Control.Attribution = L.Control.extend({
	options: {
		position: 'bottomright',
		prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this._attributions = {};
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-attribution');
		L.DomEvent.disableClickPropagation(this._container);

		for (var i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution());
			}
		}
		
		map
		    .on('layeradd', this._onLayerAdd, this)
		    .on('layerremove', this._onLayerRemove, this);

		this._update();

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerAdd)
		    .off('layerremove', this._onLayerRemove);

	},

	setPrefix: function (prefix) {
		this.options.prefix = prefix;
		this._update();
		return this;
	},

	addAttribution: function (text) {
		if (!text) { return; }

		if (!this._attributions[text]) {
			this._attributions[text] = 0;
		}
		this._attributions[text]++;

		this._update();

		return this;
	},

	removeAttribution: function (text) {
		if (!text) { return; }

		if (this._attributions[text]) {
			this._attributions[text]--;
			this._update();
		}

		return this;
	},

	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' | ');
	},

	_onLayerAdd: function (e) {
		if (e.layer.getAttribution) {
			this.addAttribution(e.layer.getAttribution());
		}
	},

	_onLayerRemove: function (e) {
		if (e.layer.getAttribution) {
			this.removeAttribution(e.layer.getAttribution());
		}
	}
});

L.Map.mergeOptions({
	attributionControl: true
});

L.Map.addInitHook(function () {
	if (this.options.attributionControl) {
		this.attributionControl = (new L.Control.Attribution()).addTo(this);
	}
});

L.control.attribution = function (options) {
	return new L.Control.Attribution(options);
};


/*
 * L.Control.Scale is used for displaying metric/imperial scale on the map.
 */

L.Control.Scale = L.Control.extend({
	options: {
		position: 'bottomleft',
		maxWidth: 100,
		metric: true,
		imperial: true,
		updateWhenIdle: false
	},

	onAdd: function (map) {
		this._map = map;

		var className = 'leaflet-control-scale',
		    container = L.DomUtil.create('div', className),
		    options = this.options;

		this._addScales(options, className, container);

		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		map.whenReady(this._update, this);

		return container;
	},

	onRemove: function (map) {
		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = L.DomUtil.create('div', className + '-line', container);
		}
		if (options.imperial) {
			this._iScale = L.DomUtil.create('div', className + '-line', container);
		}
	},

	_update: function () {
		var bounds = this._map.getBounds(),
		    centerLat = bounds.getCenter().lat,
		    halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),
		    dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,

		    size = this._map.getSize(),
		    options = this.options,
		    maxMeters = 0;

		if (size.x > 0) {
			maxMeters = dist * (options.maxWidth / size.x);
		}

		this._updateScales(options, maxMeters);
	},

	_updateScales: function (options, maxMeters) {
		if (options.metric && maxMeters) {
			this._updateMetric(maxMeters);
		}

		if (options.imperial && maxMeters) {
			this._updateImperial(maxMeters);
		}
	},

	_updateMetric: function (maxMeters) {
		var meters = this._getRoundNum(maxMeters);

		this._mScale.style.width = this._getScaleWidth(meters / maxMeters) + 'px';
		this._mScale.innerHTML = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';
	},

	_updateImperial: function (maxMeters) {
		var maxFeet = maxMeters * 3.2808399,
		    scale = this._iScale,
		    maxMiles, miles, feet;

		if (maxFeet > 5280) {
			maxMiles = maxFeet / 5280;
			miles = this._getRoundNum(maxMiles);

			scale.style.width = this._getScaleWidth(miles / maxMiles) + 'px';
			scale.innerHTML = miles + ' mi';

		} else {
			feet = this._getRoundNum(maxFeet);

			scale.style.width = this._getScaleWidth(feet / maxFeet) + 'px';
			scale.innerHTML = feet + ' ft';
		}
	},

	_getScaleWidth: function (ratio) {
		return Math.round(this.options.maxWidth * ratio) - 10;
	},

	_getRoundNum: function (num) {
		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10;

		d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;

		return pow10 * d;
	}
});

L.control.scale = function (options) {
	return new L.Control.Scale(options);
};


/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.
 */

L.Control.Layers = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		autoZIndex: true
	},

	initialize: function (baseLayers, overlays, options) {
		L.setOptions(this, options);

		this._layers = {};
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		map
		    .on('layeradd', this._onLayerChange, this)
		    .on('layerremove', this._onLayerChange, this);

		return this._container;
	},

	onRemove: function (map) {
		map
		    .off('layeradd', this._onLayerChange, this)
		    .off('layerremove', this._onLayerChange, this);
	},

	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		this._update();
		return this;
	},

	addOverlay: function (layer, name) {
		this._addLayer(layer, name, true);
		this._update();
		return this;
	},

	removeLayer: function (layer) {
		var id = L.stamp(layer);
		delete this._layers[id];
		this._update();
		return this;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}
			//Work around for Firefox android issue https://github.com/Leaflet/Leaflet/issues/2033
			L.DomEvent.on(form, 'click', function () {
				setTimeout(L.bind(this._onInputClick, this), 0);
			}, this);

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_addLayer: function (layer, name, overlay) {
		var id = L.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay
		};

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}
	},

	_update: function () {
		if (!this._container) {
			return;
		}

		this._baseLayersList.innerHTML = '';
		this._overlaysList.innerHTML = '';

		var baseLayersPresent = false,
		    overlaysPresent = false,
		    i, obj;

		for (i in this._layers) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
		}

		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';
	},

	_onLayerChange: function (e) {
		var obj = this._layers[L.stamp(e.layer)];

		if (!obj) { return; }

		if (!this._handlingClick) {
			this._update();
		}

		var type = obj.overlay ?
			(e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'layeradd' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var label = document.createElement('label'),
		    input,
		    checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		label.appendChild(input);
		label.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
	}
});

L.control.layers = function (baseLayers, overlays, options) {
	return new L.Control.Layers(baseLayers, overlays, options);
};


/*
 * L.PosAnimation is used by Leaflet internally for pan animations.
 */

L.PosAnimation = L.Class.extend({
	includes: L.Mixin.Events,

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._newPos = newPos;

		this.fire('start');

		el.style[L.DomUtil.TRANSITION] = 'all ' + (duration || 0.25) +
		        's cubic-bezier(0,0,' + (easeLinearity || 0.5) + ',1)';

		L.DomEvent.on(el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);
		L.DomUtil.setPosition(el, newPos);

		// toggle reflow, Chrome flickers for some reason if you don't do this
		L.Util.falseFn(el.offsetWidth);

		// there's no native way to track value updates of transitioned properties, so we imitate this
		this._stepTimer = setInterval(L.bind(this._onStep, this), 50);
	},

	stop: function () {
		if (!this._inProgress) { return; }

		// if we just removed the transition property, the element would jump to its final position,
		// so we need to make it stay at the current position

		L.DomUtil.setPosition(this._el, this._getPos());
		this._onTransitionEnd();
		L.Util.falseFn(this._el.offsetWidth); // force reflow in case we are about to start a new animation
	},

	_onStep: function () {
		var stepPos = this._getPos();
		if (!stepPos) {
			this._onTransitionEnd();
			return;
		}
		// jshint camelcase: false
		// make L.DomUtil.getPosition return intermediate position value during animation
		this._el._leaflet_pos = stepPos;

		this.fire('step');
	},

	// you can't easily get intermediate values of properties animated with CSS3 Transitions,
	// we need to parse computed style (in case of transform it returns matrix string)

	_transformRe: /([-+]?(?:\d*\.)?\d+)\D*, ([-+]?(?:\d*\.)?\d+)\D*\)/,

	_getPos: function () {
		var left, top, matches,
		    el = this._el,
		    style = window.getComputedStyle(el);

		if (L.Browser.any3d) {
			matches = style[L.DomUtil.TRANSFORM].match(this._transformRe);
			if (!matches) { return; }
			left = parseFloat(matches[1]);
			top  = parseFloat(matches[2]);
		} else {
			left = parseFloat(style.left);
			top  = parseFloat(style.top);
		}

		return new L.Point(left, top, true);
	},

	_onTransitionEnd: function () {
		L.DomEvent.off(this._el, L.DomUtil.TRANSITION_END, this._onTransitionEnd, this);

		if (!this._inProgress) { return; }
		this._inProgress = false;

		this._el.style[L.DomUtil.TRANSITION] = '';

		// jshint camelcase: false
		// make sure L.DomUtil.getPosition returns the final position value after animation
		this._el._leaflet_pos = this._newPos;

		clearInterval(this._stepTimer);

		this.fire('step').fire('end');
	}

});


/*
 * Extends L.Map to handle panning animations.
 */

L.Map.include({

	setView: function (center, zoom, options) {

		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
		center = this._limitCenter(L.latLng(center), zoom, this.options.maxBounds);
		options = options || {};

		if (this._panAnim) {
			this._panAnim.stop();
		}

		if (this._loaded && !options.reset && options !== true) {

			if (options.animate !== undefined) {
				options.zoom = L.extend({animate: options.animate}, options.zoom);
				options.pan = L.extend({animate: options.animate}, options.pan);
			}

			// try animating pan or zoom
			var animated = (this._zoom !== zoom) ?
				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
				this._tryAnimatedPan(center, options.pan);

			if (animated) {
				// prevent resize handler call, the view will refresh after animation anyway
				clearTimeout(this._sizeTimer);
				return this;
			}
		}

		// animation didn't start, just reset the map view
		this._resetView(center, zoom);

		return this;
	},

	panBy: function (offset, options) {
		offset = L.point(offset).round();
		options = options || {};

		if (!offset.x && !offset.y) {
			return this;
		}

		if (!this._panAnim) {
			this._panAnim = new L.PosAnimation();

			this._panAnim.on({
				'step': this._onPanTransitionStep,
				'end': this._onPanTransitionEnd
			}, this);
		}

		// don't fire movestart if animating inertia
		if (!options.noMoveStart) {
			this.fire('movestart');
		}

		// animate pan unless animate: false specified
		if (options.animate !== false) {
			L.DomUtil.addClass(this._mapPane, 'leaflet-pan-anim');

			var newPos = this._getMapPanePos().subtract(offset);
			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
		} else {
			this._rawPanBy(offset);
			this.fire('move').fire('moveend');
		}

		return this;
	},

	_onPanTransitionStep: function () {
		this.fire('move');
	},

	_onPanTransitionEnd: function () {
		L.DomUtil.removeClass(this._mapPane, 'leaflet-pan-anim');
		this.fire('moveend');
	},

	_tryAnimatedPan: function (center, options) {
		// difference between the new and current centers in pixels
		var offset = this._getCenterOffset(center)._floor();

		// don't animate too far unless animate: true specified in options
		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

		this.panBy(offset, options);

		return true;
	}
});


/*
 * L.PosAnimation fallback implementation that powers Leaflet pan animations
 * in browsers that don't support CSS3 Transitions.
 */

L.PosAnimation = L.DomUtil.TRANSITION ? L.PosAnimation : L.PosAnimation.extend({

	run: function (el, newPos, duration, easeLinearity) { // (HTMLElement, Point[, Number, Number])
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._duration = duration || 0.25;
		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

		this._startPos = L.DomUtil.getPosition(el);
		this._offset = newPos.subtract(this._startPos);
		this._startTime = +new Date();

		this.fire('start');

		this._animate();
	},

	stop: function () {
		if (!this._inProgress) { return; }

		this._step();
		this._complete();
	},

	_animate: function () {
		// animation loop
		this._animId = L.Util.requestAnimFrame(this._animate, this);
		this._step();
	},

	_step: function () {
		var elapsed = (+new Date()) - this._startTime,
		    duration = this._duration * 1000;

		if (elapsed < duration) {
			this._runFrame(this._easeOut(elapsed / duration));
		} else {
			this._runFrame(1);
			this._complete();
		}
	},

	_runFrame: function (progress) {
		var pos = this._startPos.add(this._offset.multiplyBy(progress));
		L.DomUtil.setPosition(this._el, pos);

		this.fire('step');
	},

	_complete: function () {
		L.Util.cancelAnimFrame(this._animId);

		this._inProgress = false;
		this.fire('end');
	},

	_easeOut: function (t) {
		return 1 - Math.pow(1 - t, this._easeOutPower);
	}
});


/*
 * Extends L.Map to handle zoom animations.
 */

L.Map.mergeOptions({
	zoomAnimation: true,
	zoomAnimationThreshold: 4
});

if (L.DomUtil.TRANSITION) {

	L.Map.addInitHook(function () {
		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
		this._zoomAnimated = this.options.zoomAnimation && L.DomUtil.TRANSITION &&
				L.Browser.any3d && !L.Browser.android23 && !L.Browser.mobileOpera;

		// zoom transitions run with the same duration for all layers, so if one of transitionend events
		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
		if (this._zoomAnimated) {
			L.DomEvent.on(this._mapPane, L.DomUtil.TRANSITION_END, this._catchTransitionEnd, this);
		}
	});
}

L.Map.include(!L.DomUtil.TRANSITION ? {} : {

	_catchTransitionEnd: function (e) {
		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
			this._onZoomTransitionEnd();
		}
	},

	_nothingToAnimate: function () {
		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
	},

	_tryAnimatedZoom: function (center, zoom, options) {

		if (this._animatingZoom) { return true; }

		options = options || {};

		// don't animate if disabled, not supported or zoom difference is too large
		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

		// offset is the pixel coords of the zoom origin relative to the current center
		var scale = this.getZoomScale(zoom),
		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale),
			origin = this._getCenterLayerPoint()._add(offset);

		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

		this
		    .fire('movestart')
		    .fire('zoomstart');

		this._animateZoom(center, zoom, origin, scale, null, true);

		return true;
	},

	_animateZoom: function (center, zoom, origin, scale, delta, backwards, forTouchZoom) {

		if (!forTouchZoom) {
			this._animatingZoom = true;
		}

		// put transform transition on all layers with leaflet-zoom-animated class
		L.DomUtil.addClass(this._mapPane, 'leaflet-zoom-anim');

		// remember what center/zoom to set after animation
		this._animateToCenter = center;
		this._animateToZoom = zoom;

		// disable any dragging during animation
		if (L.Draggable) {
			L.Draggable._disabled = true;
		}

		L.Util.requestAnimFrame(function () {
			this.fire('zoomanim', {
				center: center,
				zoom: zoom,
				origin: origin,
				scale: scale,
				delta: delta,
				backwards: backwards
			});
		}, this);
	},

	_onZoomTransitionEnd: function () {

		this._animatingZoom = false;

		L.DomUtil.removeClass(this._mapPane, 'leaflet-zoom-anim');

		this._resetView(this._animateToCenter, this._animateToZoom, true, true);

		if (L.Draggable) {
			L.Draggable._disabled = false;
		}
	}
});


/*
	Zoom animation logic for L.TileLayer.
*/

L.TileLayer.include({
	_animateZoom: function (e) {
		if (!this._animating) {
			this._animating = true;
			this._prepareBgBuffer();
		}

		var bg = this._bgBuffer,
		    transform = L.DomUtil.TRANSFORM,
		    initialTransform = e.delta ? L.DomUtil.getTranslateString(e.delta) : bg.style[transform],
		    scaleStr = L.DomUtil.getScaleString(e.scale, e.origin);

		bg.style[transform] = e.backwards ?
				scaleStr + ' ' + initialTransform :
				initialTransform + ' ' + scaleStr;
	},

	_endZoomAnim: function () {
		var front = this._tileContainer,
		    bg = this._bgBuffer;

		front.style.visibility = '';
		front.parentNode.appendChild(front); // Bring to fore

		// force reflow
		L.Util.falseFn(bg.offsetWidth);

		this._animating = false;
	},

	_clearBgBuffer: function () {
		var map = this._map;

		if (map && !map._animatingZoom && !map.touchZoom._zooming) {
			this._bgBuffer.innerHTML = '';
			this._bgBuffer.style[L.DomUtil.TRANSFORM] = '';
		}
	},

	_prepareBgBuffer: function () {

		var front = this._tileContainer,
		    bg = this._bgBuffer;

		// if foreground layer doesn't have many tiles but bg layer does,
		// keep the existing bg layer and just zoom it some more

		var bgLoaded = this._getLoadedTilesPercentage(bg),
		    frontLoaded = this._getLoadedTilesPercentage(front);

		if (bg && bgLoaded > 0.5 && frontLoaded < 0.5) {

			front.style.visibility = 'hidden';
			this._stopLoadingImages(front);
			return;
		}

		// prepare the buffer to become the front tile pane
		bg.style.visibility = 'hidden';
		bg.style[L.DomUtil.TRANSFORM] = '';

		// switch out the current layer to be the new bg layer (and vice-versa)
		this._tileContainer = bg;
		bg = this._bgBuffer = front;

		this._stopLoadingImages(bg);

		//prevent bg buffer from clearing right after zoom
		clearTimeout(this._clearBgBufferTimer);
	},

	_getLoadedTilesPercentage: function (container) {
		var tiles = container.getElementsByTagName('img'),
		    i, len, count = 0;

		for (i = 0, len = tiles.length; i < len; i++) {
			if (tiles[i].complete) {
				count++;
			}
		}
		return count / len;
	},

	// stops loading all tiles in the background layer
	_stopLoadingImages: function (container) {
		var tiles = Array.prototype.slice.call(container.getElementsByTagName('img')),
		    i, len, tile;

		for (i = 0, len = tiles.length; i < len; i++) {
			tile = tiles[i];

			if (!tile.complete) {
				tile.onload = L.Util.falseFn;
				tile.onerror = L.Util.falseFn;
				tile.src = L.Util.emptyImageUrl;

				tile.parentNode.removeChild(tile);
			}
		}
	}
});


/*
 * Provides L.Map with convenient shortcuts for using browser geolocation features.
 */

L.Map.include({
	_defaultLocateOptions: {
		watch: false,
		setView: false,
		maxZoom: Infinity,
		timeout: 10000,
		maximumAge: 0,
		enableHighAccuracy: false
	},

	locate: function (/*Object*/ options) {

		options = this._locateOptions = L.extend(this._defaultLocateOptions, options);

		if (!navigator.geolocation) {
			this._handleGeolocationError({
				code: 0,
				message: 'Geolocation not supported.'
			});
			return this;
		}

		var onResponse = L.bind(this._handleGeolocationResponse, this),
			onError = L.bind(this._handleGeolocationError, this);

		if (options.watch) {
			this._locationWatchId =
			        navigator.geolocation.watchPosition(onResponse, onError, options);
		} else {
			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
		}
		return this;
	},

	stopLocate: function () {
		if (navigator.geolocation) {
			navigator.geolocation.clearWatch(this._locationWatchId);
		}
		if (this._locateOptions) {
			this._locateOptions.setView = false;
		}
		return this;
	},

	_handleGeolocationError: function (error) {
		var c = error.code,
		    message = error.message ||
		            (c === 1 ? 'permission denied' :
		            (c === 2 ? 'position unavailable' : 'timeout'));

		if (this._locateOptions.setView && !this._loaded) {
			this.fitWorld();
		}

		this.fire('locationerror', {
			code: c,
			message: 'Geolocation error: ' + message + '.'
		});
	},

	_handleGeolocationResponse: function (pos) {
		var lat = pos.coords.latitude,
		    lng = pos.coords.longitude,
		    latlng = new L.LatLng(lat, lng),

		    latAccuracy = 180 * pos.coords.accuracy / 40075017,
		    lngAccuracy = latAccuracy / Math.cos(L.LatLng.DEG_TO_RAD * lat),

		    bounds = L.latLngBounds(
		            [lat - latAccuracy, lng - lngAccuracy],
		            [lat + latAccuracy, lng + lngAccuracy]),

		    options = this._locateOptions;

		if (options.setView) {
			var zoom = Math.min(this.getBoundsZoom(bounds), options.maxZoom);
			this.setView(latlng, zoom);
		}

		var data = {
			latlng: latlng,
			bounds: bounds,
			timestamp: pos.timestamp
		};

		for (var i in pos.coords) {
			if (typeof pos.coords[i] === 'number') {
				data[i] = pos.coords[i];
			}
		}

		this.fire('locationfound', data);
	}
});


}(window, document));
},{}],5:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var debounce = require('lodash.debounce');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed invocations. Provide an options object to indicate
 * that `func` should be invoked on the leading and/or trailing edge of the
 * `wait` timeout. Subsequent calls to the throttled function return the
 * result of the last `func` call.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the throttled function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=true] Specify invoking on the leading
 *  edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // avoid excessively updating the position while scrolling
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
 * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
 *   'trailing': false
 * }));
 *
 * // cancel a trailing throttled call
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (options === false) {
    leading = false;
  } else if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, { 'leading': leading, 'maxWait': +wait, 'trailing': trailing });
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = throttle;

},{"lodash.debounce":6}],6:[function(require,module,exports){
/**
 * lodash 3.1.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var getNative = require('lodash._getnative');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeNow = getNative(Date, 'now');

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Date
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => logs the number of milliseconds it took for the deferred function to be invoked
 */
var now = nativeNow || function() {
  return new Date().getTime();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed invocations. Provide an options object to indicate that `func`
 * should be invoked on the leading and/or trailing edge of the `wait` timeout.
 * Subsequent calls to the debounced function return the result of the last
 * `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify invoking on the leading
 *  edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be
 *  delayed before it is invoked.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // ensure `batchLog` is invoked once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }));
 *
 * // cancel a debounced call
 * var todoChanges = _.debounce(batchLog, 1000);
 * Object.observe(models.todo, todoChanges);
 *
 * Object.observe(models, function(changes) {
 *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
 *     todoChanges.cancel();
 *   }
 * }, ['delete']);
 *
 * // ...at some point `models.todo` is changed
 * models.todo.completed = true;
 *
 * // ...before 1 second has passed `models.todo` is deleted
 * // which cancels the debounced `todoChanges` call
 * delete models.todo;
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = wait < 0 ? 0 : (+wait || 0);
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = !!options.leading;
    maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
    }
    lastCalled = 0;
    maxTimeoutId = timeoutId = trailingCall = undefined;
  }

  function complete(isCalled, id) {
    if (id) {
      clearTimeout(id);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (isCalled) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = undefined;
      }
    }
  }

  function delayed() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0 || remaining > wait) {
      complete(trailingCall, maxTimeoutId);
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  }

  function maxDelayed() {
    complete(trailing, timeoutId);
  }

  function debounced() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0 || remaining > maxWait;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      }
      else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    }
    else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = undefined;
    }
    return result;
  }
  debounced.cancel = cancel;
  return debounced;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = debounce;

},{"lodash._getnative":7}],7:[function(require,module,exports){
/**
 * lodash 3.9.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = getNative;

},{}],8:[function(require,module,exports){
module.exports = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

},{}],9:[function(require,module,exports){
'use strict';

/* global XMLHttpRequest */

var L = require('leaflet');
var throttle = require('lodash.throttle');
var pointInPolygon = require('point-in-polygon');
var SpecieLayer = require('./specieLayer');
var groupMethods = require('./groupMethods');


module.exports = L.TileLayer.Canvas.extend({
  options: {
    opacity: 0.5,
    async: true,
    species: [],
    size: 0.0083333333,
    factors: [128, 128, 64, 64, 32, 16, 16, 8, 4, 2],
    probRange: [0, 100],
    visibleSpecies: [],
    groupMethod: 'max'
  },

  initialize: function(options) {
    L.Util.setOptions(this, options);

    this._initColors();

    this.options.visibleSpecies = this.options.species.slice();
    this.specieLayers = {};

    this.on('loading', function() {
      this.status = 'loading';
    }, this);

    this.on('load', function() {
      this.status = 'loaded';
    }, this);

    this.selectedRectangles = [];
  },

  setProbRange: function(range) {
    this.options.probRange = range;
    this.rerender();
  },

  setSelection: function(geom) {
    var tile, rectangles, rect, i, j, m;

    this.options.selection = null;
    this.selectedRectangles = [];

    if (!geom || !this.options.visibleSpecies.length) {
      return;
    }

    if (geom.type !== 'Polygon') {
      throw new Error('geometry type ' + geom.type + ' is not supported');
    }

    if (this.status !== 'loaded') {
      this.options.selection = null;
      return;
    }

    this.options.selection = geom.coordinates[0];

    for (i in this._tiles) {
      tile = this._tiles[i];
      rectangles = tile._cachedRectangles;
      for (j = 0, m = rectangles.length; j < m; j++) {
        rect = rectangles[j];
        if (this._insideSelection(rect)) {
          this.selectedRectangles.push(rect);
        }
      }
    }

    this.rerender();
  },

  setSpecies: function(species) {
    var specie, layer,  i, n, k;

    this.options.species = species;
    this.options.visibleSpecies = species.slice();

    this._removeSpecieLayers();

    for (i = 0, n = species.length; i < n; i++) {
      specie = species[i];
      layer = new SpecieLayer(specie);
      this.specieLayers[specie] = layer;
    }

    this._addSpecieLayers();

    // remove selection
    this.setSelection(null);

    this.redraw();

    this.rerender = throttle(this.rerender.bind(this), 100, {leading: true});
  },

  getSpecieLayers: function() {
    return this.specieLayers;
  },

  show: function(name) {
    var opts = this.options,
        visibles = opts.visibleSpecies,
        idx;

    if (groupMethods[name]) {
      opts.groupMethod = name;
      opts.visibleSpecies = opts.species.slice();
    } else if (visibles[0] !== name || visibles.length !== 1) {
      opts.visibleSpecies = [name];
    } else {
      return;
    }

    this._updateSpecieLayers();
    this.rerender();
  },

  drawTile: function(tile, tilePoint, zoom) {
    var self = this,
        ctx, url, xhr;

    if (!this.options.species.length) {
      this.tileDrawn(tile);
      return;
    }

    ctx = {
      canvas: tile,
      tilePoint: tilePoint,
      zoom: zoom
    };

    if (tile._cachedRectangles) {
      this._updateProb(tile._cachedRectangles);
      this._drawRectangles(ctx, tile._cachedRectangles);
      return;
    }

    url = L.Util.template(this.options.url, {
      z: zoom,
      x: tilePoint.x,
      y: tilePoint.y,
      species: this.options.species.join(',')
    });

    xhr = new XMLHttpRequest();

    xhr.onload = function() {
      var data, rectangles;

      if (xhr.status === 200) {
        if (!xhr.response) {
          return;
        }

        //Check the current map layer zoom.  If fast zooming is occurring, then short circuit tiles that are for a different zoom level than we're currently on.
        if (self.map && self.map.getZoom() !== ctx.zoom) {
          return;
        }

        data = JSON.parse(xhr.responseText);
        rectangles = self._getRectangles(ctx, data);
        self._drawRectangles(ctx, rectangles);
      }
    };

    xhr.onerror = function() {
      console.error('xhr error: ' + xhr.status);
    };

    xhr.open('GET', url, true); //async is true
    xhr.send();
  },

  rerender: function() {
    if (!this._map) {
      return;
    }

    for (var i in this._tiles) {
      this._redrawTile(this._tiles[i]);
    }

    this._emitSelectionChange();
    return this;
  },


  onAdd: function(map) {
    var self = this;

    L.TileLayer.Canvas.prototype.onAdd.apply(this, arguments);
    this._addSpecieLayers();

    map.on('specieAdded', function(e) {
      if (!self.resetting) {
        self.showSpecies([e.specie]);
      }
    });

    map.on('specieRemoved', function(e) {
      if (!self.resetting) {
        self.hideSpecies([e.specie]);
      }
    });

  },

  onRemove: function(map) {
    L.TileLayer.Canvas.prototype.onRemove.apply(this, arguments);
    this._removeSpecieLayers();

    map.off('specieAdded');
    map.off('specieRemoved');
  },


  _initColors: function() {
    var colors = {},
        hue, i;

    for (i = 0; i <= 100; i++) {
      hue = 240 * (1 - i / 100);
      colors[i] = 'hsl(' + hue + ',70%,50%)';
    }

    this.colors = colors;
  },


  _latlngToTilePoint: function(ctx, latlng) {
    var s, p;

    // start coords to tile 'space'
    s = ctx.tilePoint.multiplyBy(this.options.tileSize);

    // actual coords to tile 'space'
    p = this._map.project(latlng);

    // point to draw
    return {
      x: Math.round(p.x - s.x),
      y: Math.round(p.y - s.y)
    };
  },

  _getRectFromFeature: function(ctx, feature) {
    var opts = this.options,
        s = opts.size * (opts.factors[ctx.zoom] || 1),
        lng = feature[0] * s,
        lat = feature[1] * s,
        latlng1 = new L.LatLng(lat + s, lng),
        latlng2 = new L.LatLng(lat, lng + s),
        xy1 = this._latlngToTilePoint(ctx, latlng1),
        xy2 = this._latlngToTilePoint(ctx, latlng2),
        species = {},
        rect, i, n;

    for (i = 0, n = opts.species.length; i < n; i++) {
      species[opts.species[i]] = feature[2 + i];
    }

    rect = {
      x: xy1.x,
      y: xy1.y,
      center: [lng + s / 2, lat + s / 2],
      width: xy2.x - xy1.x,
      height: xy2.y - xy1.y,
      species: species
    };

    rect.prob = this._calculeProb(rect);
    rect.color = this.colors[rect.prob];

    return rect;
  },

  _calculeProb: function(rect) {
    var visibles = this.options.visibleSpecies,
        values = [],
        i, n;

    for (i = 0, n = visibles.length; i < n; i++) {
      values.push(rect.species[visibles[i]]);
    }

    return groupMethods[this.options.groupMethod](values);
  },

  _updateProb: function(rectangles) {
    var rect, i, n;

    for (i = 0, n = rectangles.length; i < n; i++) {
      rect = rectangles[i];
      rect.prob = this._calculeProb(rect);
      rect.color = this.colors[rect.prob];
    }
  },

  _insideRange: function(rect) {
    var prob = rect.prob;
    var range = this.options.probRange;
    return prob >= range[0] && prob <= range[1];
  },

  _insideSelection: function(rect) {
    var selection = this.options.selection;
    return selection && pointInPolygon(rect.center, selection);
  },

  _getRectangles: function(ctx, layer) {
    var c = ctx.canvas,
        rectangles, feature, i, n, r;

    if (!c._cachedRectangles) {
      rectangles = [];

      for (i = 0, n = layer.length; i < n; i++) {
        feature = layer[i];

        r = this._getRectFromFeature(ctx, feature);

        if (r.width < 1 || r.height < 1) {
          continue;
        }

        rectangles.push(r);
      }

      c._cachedRectangles = rectangles;
    }

    return c._cachedRectangles;
  },

  _drawRectangles: function(ctx, rectangles) {
    var c = ctx.canvas,
        g = c.getContext('2d'),
        feature, r, i, n;


    g.strokeStyle = 'rgba(255,255,255,0.2)';
    g.lineWidth = 1;

    g.fillStyle = 'rgba(0,0,0,0)';
    g.clearRect (0 , 0 , c.width, c.height);

    for (i = 0, n = rectangles.length; i < n; i++) {
      r = rectangles[i];

      if (!this._insideRange(r)) {
        continue;
      }

      /* draw the rect */
      g.beginPath();
      g.rect(r.x, r.y, r.width, r.height);
      g.fillStyle = r.color;
      g.fill();

      /* include probability value inside the rect */
      if (ctx.zoom >= 12) {
        g.font =  (ctx.zoom - 4) + 'px Verdana';
        g.fillStyle = 'white';
        g.strokeStyle = '#fff';
        g.textAlign = 'center';
        g.fillText(String(r.prob) + '%', r.x + r.width / 2, r.y + r.height / 2);
      }

      /* add white border after zoom 10 */
      if (ctx.zoom >= 10) {
        g.stroke();
      }
    }

    if (ctx.zoom >= 10) {
      for (i = 0, n = rectangles.length; i < n; i++) {
        r = rectangles[i];

        if (!this._insideRange(r)) {
          continue;
        }

        if (!this._insideSelection(r)) {
          continue;
        }

        /* draw the rect */
        g.strokeStyle = '#fff';
        g.lineWidth = 2;
        g.beginPath();
        g.rect(r.x, r.y, r.width, r.height);
        g.stroke();
      }
    }

    this.tileDrawn(ctx.canvas);
  },

  _addSpecieLayers: function() {
    var k;

    this.resetting = true;

    if (this._map) {
      for (k in this.specieLayers) {
        this._map.addLayer(this.specieLayers[k]);
      }
    }

    this.resetting = false;
  },

  _removeSpecieLayers: function() {
    var k;

    this.resetting = true;

    if (this._map) {
      for (k in this.specieLayers) {
        this._map.removeLayer(this.specieLayers[k]);
      }
    }

    this.specieLayers = {};
    this.resetting = false;
  },

  _updateSpecieLayers: function() {
    var visibleSpecies = this.options.visibleSpecies,
        k;

    this.resetting = true;

    if (this._map) {
      for (k in this.specieLayers) {
        if (visibleSpecies.indexOf(k) >= 0) {
          this._map.addLayer(this.specieLayers[k]);
        } else {
          this._map.removeLayer(this.specieLayers[k]);
        }
      }
    }

    this.resetting = false;
  },

  _emitSelectionChange: function() {
    var speciesProb, visibles, rectangles, values, rect, sp, i, j, n, m;

    if (!this._map) {
      return;
    }

    if (!this.options.selection) {
      return;
    }

    rectangles = this.selectedRectangles;
    visibles = this.options.visibleSpecies;

    values = {};
    for (i = 0, n = visibles.length; i < n; i++) {
      values[visibles[i]] = [];
    }

    for (i = 0, n = rectangles.length; i < n; i++) {
      rect = rectangles[i];
      speciesProb = rect.species;
      for (j = 0, m = visibles.length; j < m; j++) {
        sp = visibles[j];
        values[sp].push(speciesProb[sp]);
      }
    }

    for (sp in values) {
      values[sp] = groupMethods[this.options.groupMethod](values[sp]);
    }

    var geom  = {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [this.options.selection]
      },
      "properties": {}
    };

    this.fire('selectionChange', {species: values, geom: geom});
  }
});

},{"./groupMethods":10,"./specieLayer":13,"leaflet":4,"lodash.throttle":5,"point-in-polygon":8}],10:[function(require,module,exports){
'use strict';

function median(values) {
  var half;

  values.sort(function(a, b) {return a - b;});

  half = Math.floor(values.length / 2);

  if (values.length % 2) {
    return values[half];
  } else {
    return Math.round((values[half - 1] + values[half]) / 2);
  }
}

function mean(values) {
  var sum = 0,
      i, n;

  if (!values.length) {
    return 0;
  }

  for (i = 0, n = values.length; i < n; i++) {
    sum += values[i];
  }

  return Math.round(sum / values.length);
}

function max(values) {
  return Math.max.apply(Math, values);
}


module.exports = {
  median: median,
  max: max,
  mean: mean
};

},{}],11:[function(require,module,exports){
'use strict';
var L = require('leaflet');
var GridLayer = require('./gridLayer');
var RangeSelector = require('./rangeSelector');

require('leaflet-draw');

var Map = L.Class.extend({

  options: {
    container: 'map',
    zoom: 8,
    center: [-33.4, -70.4],
    probRange: [0, 100],
    controls: {
      rangeSelector: true,
      draw: true
    },
    host: ''
  },

  includes: L.Mixin.Events,

  initialize: function(options) {
    // si solo recibe un string, corresponde al id del contenedor
    if (typeof options === 'string') {
      options = {container: options};
    }

    // conservar las propiedades de this.options.controls no modificadas
    if (options.controls) {
      options.controls = L.extend({}, this.options.controls, options.controls);
    }

    L.Util.setOptions(this, options);

    this._initMap();
  },

  setSpecies: function(names) {
    var specieLayers;

    names = Array.isArray(names) ? names : [names];

    // set species
    this.grid.setSpecies(names);
  },

  show: function(name) {
    this.grid.show(name);
  },

  setProbRange: function(range) {
    this.grid.setProbRange(range);
  },

  _initMap: function() {
    var ops = this.options;

    this.map = L.map(ops.container).setView(ops.center, ops.zoom);
    this._defineBaseLayers();
    this._defineControls();

    this.grid = new GridLayer({
      url: ops.host + '/distributions/{z}/{x}/{y}.json?especies={species}',
      range: ops.probRange
    }).addTo(this.map);

    // propagar selectionChange event
    this.grid.on('selectionChange', function(e) {
      this.fire('selectionChange', e);
    }, this);
  },

  _defineBaseLayers: function() {
    var mapbox = L.tileLayer('http://{s}.tiles.mapbox.com/v3/sebapcarroza.map-9p93qwso/{z}/{x}/{y}.png'/*'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png'*/, {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
          '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'examples.map-i875mjb7'
      });

    // set default
    mapbox.addTo(this.map);

    // save reference
    this._baseLayers = {
      mapbox: mapbox
    };
  },

  _defineControls: function() {
    var controls = this.options.controls;

    this.controls = {};

    /* inicializar selector de probabilidades */
    this._initRangeSelectorControl();

    /* inicializar selector de area */
    this._initDrawControl();

    if (controls.rangeSelector) {
      this.controls.rangeSelector.enable();
    }

    if (controls.draw) {
      this.controls.draw.enable();
    }


    /* layer selector, descomentar si se agrega bing
    this.layerControl = L.control.layers(this._baseLayers, {}, {
      collapsed: false,
      autoZIndex: false
    }).addTo(this.map);
    */
  },

  _initRangeSelectorControl: function() {
    var self = this,
        rangeSelector = new RangeSelector();

    rangeSelector.on('change', function(e) {
      self.setProbRange(e.range);
    });

    this.controls.rangeSelector = {
      enable: function() {
        rangeSelector.addTo(self.map);
      },
      disable: function() {
        rangeSelector.removeFrom(self.map);
      }
    };
  },

  _initDrawControl: function() {
    var self = this,
        pathOpts, drawControl;

    pathOpts = {
      weight: 2,
      stroke: true,
      color: '#fff',
      opacity: 0.5,
    };

    drawControl = new L.Control.Draw({
      edit: false,
      draw: {
        polygon: {
          shapeOptions: pathOpts
        },
        rectangle: {
          shapeOptions: pathOpts
        },
        polyline: false,
        marker: false,
        circle: false
      }
    });

    this.map.on('draw:drawstart', function() {
      // Disable drag and zoom handlers.
      self.map.dragging.disable();
      self.map.touchZoom.disable();
      self.map.doubleClickZoom.disable();
      self.map.scrollWheelZoom.disable();

      setTimeout(function() {
        if (self.map.getZoom() < 10) {
          for (var k in drawControl._toolbars) {
            drawControl._toolbars[k].disable();
          }
        }
      }, 0);
    });

    this.map.on('draw:drawstop', function() {
      // Enable drag and zoom handlers.
      self.map.dragging.enable();
      self.map.touchZoom.enable();
      self.map.doubleClickZoom.enable();
      self.map.scrollWheelZoom.enable();
    });

    this.map.on('draw:created', function(e) {
      var layer = e.layer,
          geometry = layer.toGeoJSON().geometry;

      self.grid.setSelection(geometry);
    });

    this.controls.draw = {
      enable: function() {
        drawControl.addTo(self.map);
      },
      disable: function() {
        drawControl.removeFrom(self.map);
      }
    };
  }

});

module.exports = Map;

},{"./gridLayer":9,"./rangeSelector":12,"leaflet":4,"leaflet-draw":3}],12:[function(require,module,exports){
'use strict';

var L = require('leaflet');
var Slider = require('bootstrap-slider');
var domify = require('domify');


var RangeSelector = L.Control.extend({

  options: {
    position: 'bottomright'
  },

  includes: L.Mixin.Events,

  onAdd: function(map) {
    var self = this,
        container, rangeInput;

    container = domify('<div class="range-selector"></div>');

    container.appendChild(domify('<h5>Probabilidad de presencia:</h5>'));
    container.appendChild(domify('<b>%0</b>'));

    rangeInput = domify('<input type="text" class="span2" value="" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="[0,100]"/>');

    container.appendChild(rangeInput);
    container.appendChild(domify('<b>%100</b>'));

    var slider = new Slider(rangeInput);

    slider.on('slide', function(range) {
      self.fire('change', {range: range});
    });

    return container;
  }

});

module.exports = RangeSelector;

},{"bootstrap-slider":1,"domify":2,"leaflet":4}],13:[function(require,module,exports){
'use strict';

var L = require('leaflet');

module.exports = L.Class.extend({
  includes: L.Mixin.Events,

  initialize: function(specie) {
    this._specie = specie;
  },

  onAdd: function(map) {
    map.fire('specieAdded', {specie: this._specie});
  },

  onRemove: function(map) {
    map.fire('specieRemoved', {specie: this._specie});
  }
});

},{"leaflet":4}]},{},[11])(11)
});