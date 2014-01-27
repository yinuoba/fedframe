define(function(require, exports, module) {
	require('jqueryui/jqueryui');
	require('widget/widget');

	/*!
	 * jQuery UI Mouse 1.8.18
	 *
	 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * http://docs.jquery.com/UI/Mouse
	 *
	 * Depends:
	 *	jquery.ui.widget.js
	 */
	;(function($, undefined) {

		var mouseHandled = false;
		$(document).mouseup(function(e) {
			mouseHandled = false;
		});

		$.widget("ui.mouse", {
			options: {
				cancel: ':input,option',
				distance: 1,
				delay: 0
			},
			_mouseInit: function() {
				var self = this;

				this.element
					.bind('mousedown.' + this.widgetName, function(event) {
						return self._mouseDown(event);
					})
					.bind('click.' + this.widgetName, function(event) {
						if (true === $.data(event.target, self.widgetName + '.preventClickEvent')) {
							$.removeData(event.target, self.widgetName + '.preventClickEvent');
							event.stopImmediatePropagation();
							return false;
						}
					});

				this.started = false;
			},

			// TODO: make sure destroying one instance of mouse doesn't mess with
			// other instances of mouse
			_mouseDestroy: function() {
				this.element.unbind('.' + this.widgetName);
			},

			_mouseDown: function(event) {
				// don't let more than one widget handle mouseStart
				if (mouseHandled) {
					return
				};

				// we may have missed mouseup (out of window)
				(this._mouseStarted && this._mouseUp(event));

				this._mouseDownEvent = event;

				var self = this,
					btnIsLeft = (event.which == 1),
					// event.target.nodeName works around a bug in IE 8 with
					// disabled inputs (#7620)
					elIsCancel = (typeof this.options.cancel == "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
				if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
					return true;
				}

				this.mouseDelayMet = !this.options.delay;
				if (!this.mouseDelayMet) {
					this._mouseDelayTimer = setTimeout(function() {
						self.mouseDelayMet = true;
					}, this.options.delay);
				}

				if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
					this._mouseStarted = (this._mouseStart(event) !== false);
					if (!this._mouseStarted) {
						event.preventDefault();
						return true;
					}
				}

				// Click event may never have fired (Gecko & Opera)
				if (true === $.data(event.target, this.widgetName + '.preventClickEvent')) {
					$.removeData(event.target, this.widgetName + '.preventClickEvent');
				}

				// these delegates are required to keep context
				this._mouseMoveDelegate = function(event) {
					return self._mouseMove(event);
				};
				this._mouseUpDelegate = function(event) {
					return self._mouseUp(event);
				};
				$(document)
					.bind('mousemove.' + this.widgetName, this._mouseMoveDelegate)
					.bind('mouseup.' + this.widgetName, this._mouseUpDelegate);

				event.preventDefault();

				mouseHandled = true;
				return true;
			},

			_mouseMove: function(event) {
				// IE mouseup check - mouseup happened when mouse was out of window
				if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
					return this._mouseUp(event);
				}

				if (this._mouseStarted) {
					this._mouseDrag(event);
					return event.preventDefault();
				}

				if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
					this._mouseStarted =
						(this._mouseStart(this._mouseDownEvent, event) !== false);
					(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
				}

				return !this._mouseStarted;
			},

			_mouseUp: function(event) {
				$(document)
					.unbind('mousemove.' + this.widgetName, this._mouseMoveDelegate)
					.unbind('mouseup.' + this.widgetName, this._mouseUpDelegate);

				if (this._mouseStarted) {
					this._mouseStarted = false;

					if (event.target == this._mouseDownEvent.target) {
						$.data(event.target, this.widgetName + '.preventClickEvent', true);
					}

					this._mouseStop(event);
				}

				return false;
			},

			_mouseDistanceMet: function(event) {
				return (Math.max(
					Math.abs(this._mouseDownEvent.pageX - event.pageX),
					Math.abs(this._mouseDownEvent.pageY - event.pageY)
				) >= this.options.distance);
			},

			_mouseDelayMet: function(event) {
				return this.mouseDelayMet;
			},

			// These are placeholder methods, to be overriden by extending plugin
			_mouseStart: function(event) {},
			_mouseDrag: function(event) {},
			_mouseStop: function(event) {},
			_mouseCapture: function(event) {
				return true;
			}
		});
	})(jQuery);

	/*
	 * jQuery UI Slider 1.8.18
	 *
	 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * http://docs.jquery.com/UI/Slider
	 *
	 * Depends:
	 *	jquery.ui.core.js
	 *	jquery.ui.mouse.js
	 *	jquery.ui.widget.js
	 */
	;(function($, undefined) {

		// number of pages in a slider
		// (how many times can you page up/down to go through the whole range)
		var numPages = 5;

		$.widget("ui.slider", $.ui.mouse, {

			widgetEventPrefix: "slide",

			options: {
				animate: false,
				distance: 0,
				max: 100,
				min: 0,
				orientation: "horizontal",
				range: false,
				step: 1,
				value: 0,
				values: null
			},

			_create: function() {
				var self = this,
					o = this.options,
					existingHandles = this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),
					handle = "<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",
					handleCount = (o.values && o.values.length) || 1,
					handles = [];

				this._keySliding = false;
				this._mouseSliding = false;
				this._animateOff = true;
				this._handleIndex = null;
				this._detectOrientation();
				this._mouseInit();

				this.element
					.addClass("ui-slider" +
						" ui-slider-" + this.orientation +
						" ui-widget" +
						" ui-widget-content" +
						" ui-corner-all" +
						(o.disabled ? " ui-slider-disabled ui-disabled" : ""));

				this.range = $([]);

				if (o.range) {
					if (o.range === true) {
						if (!o.values) {
							o.values = [this._valueMin(), this._valueMin()];
						}
						if (o.values.length && o.values.length !== 2) {
							o.values = [o.values[0], o.values[0]];
						}
					}

					this.range = $("<div></div>")
						.appendTo(this.element)
						.addClass("ui-slider-range" +
							// note: this isn't the most fittingly semantic framework class for this element,
							// but worked best visually with a variety of themes
							" ui-widget-header" +
							((o.range === "min" || o.range === "max") ? " ui-slider-range-" + o.range : ""));
				}

				for (var i = existingHandles.length; i < handleCount; i += 1) {
					handles.push(handle);
				}

				this.handles = existingHandles.add($(handles.join("")).appendTo(self.element));

				this.handle = this.handles.eq(0);

				this.handles.add(this.range).filter("a")
					.click(function(event) {
						event.preventDefault();
					})
					.hover(function() {
						if (!o.disabled) {
							$(this).addClass("ui-state-hover");
						}
					}, function() {
						$(this).removeClass("ui-state-hover");
					})
					.focus(function() {
						if (!o.disabled) {
							$(".ui-slider .ui-state-focus").removeClass("ui-state-focus");
							$(this).addClass("ui-state-focus");
						} else {
							$(this).blur();
						}
					})
					.blur(function() {
						$(this).removeClass("ui-state-focus");
					});

				this.handles.each(function(i) {
					$(this).data("index.ui-slider-handle", i);
				});

				this.handles
					.keydown(function(event) {
						var index = $(this).data("index.ui-slider-handle"),
							allowed,
							curVal,
							newVal,
							step;

						if (self.options.disabled) {
							return;
						}

						switch (event.keyCode) {
							case $.ui.keyCode.HOME:
							case $.ui.keyCode.END:
							case $.ui.keyCode.PAGE_UP:
							case $.ui.keyCode.PAGE_DOWN:
							case $.ui.keyCode.UP:
							case $.ui.keyCode.RIGHT:
							case $.ui.keyCode.DOWN:
							case $.ui.keyCode.LEFT:
								event.preventDefault();
								if (!self._keySliding) {
									self._keySliding = true;
									$(this).addClass("ui-state-active");
									allowed = self._start(event, index);
									if (allowed === false) {
										return;
									}
								}
								break;
						}

						step = self.options.step;
						if (self.options.values && self.options.values.length) {
							curVal = newVal = self.values(index);
						} else {
							curVal = newVal = self.value();
						}

						switch (event.keyCode) {
							case $.ui.keyCode.HOME:
								newVal = self._valueMin();
								break;
							case $.ui.keyCode.END:
								newVal = self._valueMax();
								break;
							case $.ui.keyCode.PAGE_UP:
								newVal = self._trimAlignValue(curVal + ((self._valueMax() - self._valueMin()) / numPages));
								break;
							case $.ui.keyCode.PAGE_DOWN:
								newVal = self._trimAlignValue(curVal - ((self._valueMax() - self._valueMin()) / numPages));
								break;
							case $.ui.keyCode.UP:
							case $.ui.keyCode.RIGHT:
								if (curVal === self._valueMax()) {
									return;
								}
								newVal = self._trimAlignValue(curVal + step);
								break;
							case $.ui.keyCode.DOWN:
							case $.ui.keyCode.LEFT:
								if (curVal === self._valueMin()) {
									return;
								}
								newVal = self._trimAlignValue(curVal - step);
								break;
						}

						self._slide(event, index, newVal);
					})
					.keyup(function(event) {
						var index = $(this).data("index.ui-slider-handle");

						if (self._keySliding) {
							self._keySliding = false;
							self._stop(event, index);
							self._change(event, index);
							$(this).removeClass("ui-state-active");
						}

					});

				this._refreshValue();

				this._animateOff = false;
			},

			destroy: function() {
				this.handles.remove();
				this.range.remove();

				this.element
					.removeClass("ui-slider" +
						" ui-slider-horizontal" +
						" ui-slider-vertical" +
						" ui-slider-disabled" +
						" ui-widget" +
						" ui-widget-content" +
						" ui-corner-all")
					.removeData("slider")
					.unbind(".slider");

				this._mouseDestroy();

				return this;
			},

			_mouseCapture: function(event) {
				var o = this.options,
					position,
					normValue,
					distance,
					closestHandle,
					self,
					index,
					allowed,
					offset,
					mouseOverHandle;

				if (o.disabled) {
					return false;
				}

				this.elementSize = {
					width: this.element.outerWidth(),
					height: this.element.outerHeight()
				};
				this.elementOffset = this.element.offset();

				position = {
					x: event.pageX,
					y: event.pageY
				};
				normValue = this._normValueFromMouse(position);
				distance = this._valueMax() - this._valueMin() + 1;
				self = this;
				this.handles.each(function(i) {
					var thisDistance = Math.abs(normValue - self.values(i));
					if (distance > thisDistance) {
						distance = thisDistance;
						closestHandle = $(this);
						index = i;
					}
				});

				// workaround for bug #3736 (if both handles of a range are at 0,
				// the first is always used as the one with least distance,
				// and moving it is obviously prevented by preventing negative ranges)
				if (o.range === true && this.values(1) === o.min) {
					index += 1;
					closestHandle = $(this.handles[index]);
				}

				allowed = this._start(event, index);
				if (allowed === false) {
					return false;
				}
				this._mouseSliding = true;

				self._handleIndex = index;

				closestHandle
					.addClass("ui-state-active")
					.focus();

				offset = closestHandle.offset();
				mouseOverHandle = !$(event.target).parents().andSelf().is(".ui-slider-handle");
				this._clickOffset = mouseOverHandle ? {
					left: 0,
					top: 0
				} : {
					left: event.pageX - offset.left - (closestHandle.width() / 2),
					top: event.pageY - offset.top -
						(closestHandle.height() / 2) -
						(parseInt(closestHandle.css("borderTopWidth"), 10) || 0) -
						(parseInt(closestHandle.css("borderBottomWidth"), 10) || 0) +
						(parseInt(closestHandle.css("marginTop"), 10) || 0)
				};

				if (!this.handles.hasClass("ui-state-hover")) {
					this._slide(event, index, normValue);
				}
				this._animateOff = true;
				return true;
			},

			_mouseStart: function(event) {
				return true;
			},

			_mouseDrag: function(event) {
				var position = {
					x: event.pageX,
					y: event.pageY
				},
					normValue = this._normValueFromMouse(position);

				this._slide(event, this._handleIndex, normValue);

				return false;
			},

			_mouseStop: function(event) {
				this.handles.removeClass("ui-state-active");
				this._mouseSliding = false;

				this._stop(event, this._handleIndex);
				this._change(event, this._handleIndex);

				this._handleIndex = null;
				this._clickOffset = null;
				this._animateOff = false;

				return false;
			},

			_detectOrientation: function() {
				this.orientation = (this.options.orientation === "vertical") ? "vertical" : "horizontal";
			},

			_normValueFromMouse: function(position) {
				var pixelTotal,
					pixelMouse,
					percentMouse,
					valueTotal,
					valueMouse;

				if (this.orientation === "horizontal") {
					pixelTotal = this.elementSize.width;
					pixelMouse = position.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0);
				} else {
					pixelTotal = this.elementSize.height;
					pixelMouse = position.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0);
				}

				percentMouse = (pixelMouse / pixelTotal);
				if (percentMouse > 1) {
					percentMouse = 1;
				}
				if (percentMouse < 0) {
					percentMouse = 0;
				}
				if (this.orientation === "vertical") {
					percentMouse = 1 - percentMouse;
				}

				valueTotal = this._valueMax() - this._valueMin();
				valueMouse = this._valueMin() + percentMouse * valueTotal;

				return this._trimAlignValue(valueMouse);
			},

			_start: function(event, index) {
				var uiHash = {
					handle: this.handles[index],
					value: this.value()
				};
				if (this.options.values && this.options.values.length) {
					uiHash.value = this.values(index);
					uiHash.values = this.values();
				}
				return this._trigger("start", event, uiHash);
			},

			_slide: function(event, index, newVal) {
				var otherVal,
					newValues,
					allowed;

				if (this.options.values && this.options.values.length) {
					otherVal = this.values(index ? 0 : 1);

					if ((this.options.values.length === 2 && this.options.range === true) &&
						((index === 0 && newVal > otherVal) || (index === 1 && newVal < otherVal))
					) {
						newVal = otherVal;
					}

					if (newVal !== this.values(index)) {
						newValues = this.values();
						newValues[index] = newVal;
						// A slide can be canceled by returning false from the slide callback
						allowed = this._trigger("slide", event, {
							handle: this.handles[index],
							value: newVal,
							values: newValues
						});
						otherVal = this.values(index ? 0 : 1);
						if (allowed !== false) {
							this.values(index, newVal, true);
						}
					}
				} else {
					if (newVal !== this.value()) {
						// A slide can be canceled by returning false from the slide callback
						allowed = this._trigger("slide", event, {
							handle: this.handles[index],
							value: newVal
						});
						if (allowed !== false) {
							this.value(newVal);
						}
					}
				}
			},

			_stop: function(event, index) {
				var uiHash = {
					handle: this.handles[index],
					value: this.value()
				};
				if (this.options.values && this.options.values.length) {
					uiHash.value = this.values(index);
					uiHash.values = this.values();
				}

				this._trigger("stop", event, uiHash);
			},

			_change: function(event, index) {
				if (!this._keySliding && !this._mouseSliding) {
					var uiHash = {
						handle: this.handles[index],
						value: this.value()
					};
					if (this.options.values && this.options.values.length) {
						uiHash.value = this.values(index);
						uiHash.values = this.values();
					}

					this._trigger("change", event, uiHash);
				}
			},

			value: function(newValue) {
				if (arguments.length) {
					this.options.value = this._trimAlignValue(newValue);
					this._refreshValue();
					this._change(null, 0);
					return;
				}

				return this._value();
			},

			values: function(index, newValue) {
				var vals,
					newValues,
					i;

				if (arguments.length > 1) {
					this.options.values[index] = this._trimAlignValue(newValue);
					this._refreshValue();
					this._change(null, index);
					return;
				}

				if (arguments.length) {
					if ($.isArray(arguments[0])) {
						vals = this.options.values;
						newValues = arguments[0];
						for (i = 0; i < vals.length; i += 1) {
							vals[i] = this._trimAlignValue(newValues[i]);
							this._change(null, i);
						}
						this._refreshValue();
					} else {
						if (this.options.values && this.options.values.length) {
							return this._values(index);
						} else {
							return this.value();
						}
					}
				} else {
					return this._values();
				}
			},

			_setOption: function(key, value) {
				var i,
					valsLength = 0;

				if ($.isArray(this.options.values)) {
					valsLength = this.options.values.length;
				}

				$.Widget.prototype._setOption.apply(this, arguments);

				switch (key) {
					case "disabled":
						if (value) {
							this.handles.filter(".ui-state-focus").blur();
							this.handles.removeClass("ui-state-hover");
							this.handles.propAttr("disabled", true);
							this.element.addClass("ui-disabled");
						} else {
							this.handles.propAttr("disabled", false);
							this.element.removeClass("ui-disabled");
						}
						break;
					case "orientation":
						this._detectOrientation();
						this.element
							.removeClass("ui-slider-horizontal ui-slider-vertical")
							.addClass("ui-slider-" + this.orientation);
						this._refreshValue();
						break;
					case "value":
						this._animateOff = true;
						this._refreshValue();
						this._change(null, 0);
						this._animateOff = false;
						break;
					case "values":
						this._animateOff = true;
						this._refreshValue();
						for (i = 0; i < valsLength; i += 1) {
							this._change(null, i);
						}
						this._animateOff = false;
						break;
				}
			},

			//internal value getter
			// _value() returns value trimmed by min and max, aligned by step
			_value: function() {
				var val = this.options.value;
				val = this._trimAlignValue(val);

				return val;
			},

			//internal values getter
			// _values() returns array of values trimmed by min and max, aligned by step
			// _values( index ) returns single value trimmed by min and max, aligned by step
			_values: function(index) {
				var val,
					vals,
					i;

				if (arguments.length) {
					val = this.options.values[index];
					val = this._trimAlignValue(val);

					return val;
				} else {
					// .slice() creates a copy of the array
					// this copy gets trimmed by min and max and then returned
					vals = this.options.values.slice();
					for (i = 0; i < vals.length; i += 1) {
						vals[i] = this._trimAlignValue(vals[i]);
					}

					return vals;
				}
			},

			// returns the step-aligned value that val is closest to, between (inclusive) min and max
			_trimAlignValue: function(val) {
				if (val <= this._valueMin()) {
					return this._valueMin();
				}
				if (val >= this._valueMax()) {
					return this._valueMax();
				}
				var step = (this.options.step > 0) ? this.options.step : 1,
					valModStep = (val - this._valueMin()) % step,
					alignValue = val - valModStep;

				if (Math.abs(valModStep) * 2 >= step) {
					alignValue += (valModStep > 0) ? step : (-step);
				}

				// Since JavaScript has problems with large floats, round
				// the final value to 5 digits after the decimal point (see #4124)
				return parseFloat(alignValue.toFixed(5));
			},

			_valueMin: function() {
				return this.options.min;
			},

			_valueMax: function() {
				return this.options.max;
			},

			_refreshValue: function() {
				var oRange = this.options.range,
					o = this.options,
					self = this,
					animate = (!this._animateOff) ? o.animate : false,
					valPercent,
					_set = {},
					lastValPercent,
					value,
					valueMin,
					valueMax;

				if (this.options.values && this.options.values.length) {
					this.handles.each(function(i, j) {
						valPercent = (self.values(i) - self._valueMin()) / (self._valueMax() - self._valueMin()) * 100;
						_set[self.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
						$(this).stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);
						if (self.options.range === true) {
							if (self.orientation === "horizontal") {
								if (i === 0) {
									self.range.stop(1, 1)[animate ? "animate" : "css"]({
										left: valPercent + "%"
									}, o.animate);
								}
								if (i === 1) {
									self.range[animate ? "animate" : "css"]({
										width: (valPercent - lastValPercent) + "%"
									}, {
										queue: false,
										duration: o.animate
									});
								}
							} else {
								if (i === 0) {
									self.range.stop(1, 1)[animate ? "animate" : "css"]({
										bottom: (valPercent) + "%"
									}, o.animate);
								}
								if (i === 1) {
									self.range[animate ? "animate" : "css"]({
										height: (valPercent - lastValPercent) + "%"
									}, {
										queue: false,
										duration: o.animate
									});
								}
							}
						}
						lastValPercent = valPercent;
					});
				} else {
					value = this.value();
					valueMin = this._valueMin();
					valueMax = this._valueMax();
					valPercent = (valueMax !== valueMin) ?
						(value - valueMin) / (valueMax - valueMin) * 100 :
						0;
					_set[self.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
					this.handle.stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);

					if (oRange === "min" && this.orientation === "horizontal") {
						this.range.stop(1, 1)[animate ? "animate" : "css"]({
							width: valPercent + "%"
						}, o.animate);
					}
					if (oRange === "max" && this.orientation === "horizontal") {
						this.range[animate ? "animate" : "css"]({
							width: (100 - valPercent) + "%"
						}, {
							queue: false,
							duration: o.animate
						});
					}
					if (oRange === "min" && this.orientation === "vertical") {
						this.range.stop(1, 1)[animate ? "animate" : "css"]({
							height: valPercent + "%"
						}, o.animate);
					}
					if (oRange === "max" && this.orientation === "vertical") {
						this.range[animate ? "animate" : "css"]({
							height: (100 - valPercent) + "%"
						}, {
							queue: false,
							duration: o.animate
						});
					}
				}
			}

		});

		$.extend($.ui.slider, {
			version: "1.8.18"
		});

	}(jQuery));

	/*
	 * jQuery UI Datepicker 1.8.18
	 *
	 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * http://docs.jquery.com/UI/Datepicker
	 *
	 * Depends:
	 *	jquery.ui.core.js
	 */
	;(function($, undefined) {

		$.extend($.ui, {
			datepicker: {
				version: "1.8.18"
			}
		});

		var PROP_NAME = 'datepicker';
		var dpuuid = new Date().getTime();
		var instActive;

		/* Date picker manager.
   Use the singleton instance of this class, $.datepicker, to interact with the date picker.
   Settings for (groups of) date pickers are maintained in an instance object,
   allowing multiple different settings on the same page. */

		function Datepicker() {
			this.debug = false; // Change this to true to start debugging
			this._curInst = null; // The current instance in use
			this._keyEvent = false; // If the last event was a key event
			this._disabledInputs = []; // List of date picker inputs that have been disabled
			this._datepickerShowing = false; // True if the popup picker is showing , false if not
			this._inDialog = false; // True if showing within a "dialog", false if not
			this._mainDivId = 'ui-datepicker-div'; // The ID of the main datepicker division
			this._inlineClass = 'ui-datepicker-inline'; // The name of the inline marker class
			this._appendClass = 'ui-datepicker-append'; // The name of the append marker class
			this._triggerClass = 'ui-datepicker-trigger'; // The name of the trigger marker class
			this._dialogClass = 'ui-datepicker-dialog'; // The name of the dialog marker class
			this._disableClass = 'ui-datepicker-disabled'; // The name of the disabled covering marker class
			this._unselectableClass = 'ui-datepicker-unselectable'; // The name of the unselectable cell marker class
			this._currentClass = 'ui-datepicker-current-day'; // The name of the current day marker class
			this._dayOverClass = 'ui-datepicker-days-cell-over'; // The name of the day hover marker class
			this.regional = []; // Available regional settings, indexed by language code
			this.regional[''] = { // Default regional settings
				closeText: 'Done', // Display text for close link
				prevText: 'Prev', // Display text for previous month link
				nextText: 'Next', // Display text for next month link
				currentText: 'Today', // Display text for current month link
				monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
					'July', 'August', 'September', 'October', 'November', 'December'
				], // Names of months for drop-down and formatting
				monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // For formatting
				dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // For formatting
				dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // For formatting
				dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // Column headings for days starting at Sunday
				weekHeader: 'Wk', // Column header for week of the year
				dateFormat: 'mm/dd/yy', // See format options on parseDate
				firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
				isRTL: false, // True if right-to-left language, false if left-to-right
				showMonthAfterYear: false, // True if the year select precedes month, false for month then year
				yearSuffix: '' // Additional text to append to the year in the month headers
			};
			this._defaults = { // Global defaults for all the date picker instances
				showOn: 'focus', // 'focus' for popup on focus,
				// 'button' for trigger button, or 'both' for either
				showAnim: 'fadeIn', // Name of jQuery animation for popup
				showOptions: {}, // Options for enhanced animations
				defaultDate: null, // Used when field is blank: actual date,
				// +/-number for offset from today, null for today
				appendText: '', // Display text following the input box, e.g. showing the format
				buttonText: '...', // Text for trigger button
				buttonImage: '', // URL for trigger button image
				buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
				hideIfNoPrevNext: false, // True to hide next/previous month links
				// if not applicable, false to just disable them
				navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
				gotoCurrent: false, // True if today link goes back to current selection instead
				changeMonth: false, // True if month can be selected directly, false if only prev/next
				changeYear: false, // True if year can be selected directly, false if only prev/next
				yearRange: 'c-10:c+10', // Range of years to display in drop-down,
				// either relative to today's year (-nn:+nn), relative to currently displayed year
				// (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
				showOtherMonths: false, // True to show dates in other months, false to leave blank
				selectOtherMonths: false, // True to allow selection of dates in other months, false for unselectable
				showWeek: false, // True to show week of the year, false to not show it
				calculateWeek: this.iso8601Week, // How to calculate the week of the year,
				// takes a Date and returns the number of the week for it
				shortYearCutoff: '+10', // Short year values < this are in the current century,
				// > this are in the previous century,
				// string value starting with '+' for current year + value
				minDate: null, // The earliest selectable date, or null for no limit
				maxDate: null, // The latest selectable date, or null for no limit
				duration: 'fast', // Duration of display/closure
				beforeShowDay: null, // Function that takes a date and returns an array with
				// [0] = true if selectable, false if not, [1] = custom CSS class name(s) or '',
				// [2] = cell title (optional), e.g. $.datepicker.noWeekends
				beforeShow: null, // Function that takes an input field and
				// returns a set of custom settings for the date picker
				onSelect: null, // Define a callback function when a date is selected
				onChangeMonthYear: null, // Define a callback function when the month or year is changed
				onClose: null, // Define a callback function when the datepicker is closed
				numberOfMonths: 1, // Number of months to show at a time
				showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
				stepMonths: 1, // Number of months to step back/forward
				stepBigMonths: 12, // Number of months to step back/forward for the big links
				altField: '', // Selector for an alternate field to store selected dates into
				altFormat: '', // The date format to use for the alternate field
				constrainInput: true, // The input is constrained by the current date format
				showButtonPanel: false, // True to show button panel, false to not show it
				autoSize: false, // True to size the input for the date format, false to leave as is
				disabled: false // The initial disabled state
			};
			$.extend(this._defaults, this.regional['']);
			this.dpDiv = bindHover($('<div id="' + this._mainDivId + '" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'));
		}

		$.extend(Datepicker.prototype, {
			/* Class name added to elements to indicate already configured with a date picker. */
			markerClassName: 'hasDatepicker',

			//Keep track of the maximum number of rows displayed (see #7043)
			maxRows: 4,

			/* Debug logging (if enabled). */
			log: function() {
				if (this.debug)
					console.log.apply('', arguments);
			},

			// TODO rename to "widget" when switching to widget factory
			_widgetDatepicker: function() {
				return this.dpDiv;
			},

			/* Override the default settings for all instances of the date picker.
	   @param  settings  object - the new settings to use as defaults (anonymous object)
	   @return the manager object */
			setDefaults: function(settings) {
				extendRemove(this._defaults, settings || {});
				return this;
			},

			/* Attach the date picker to a jQuery selection.
	   @param  target    element - the target input field or division or span
	   @param  settings  object - the new settings to use for this date picker instance (anonymous) */
			_attachDatepicker: function(target, settings) {
				// check for settings on the control itself - in namespace 'date:'
				var inlineSettings = null;
				for (var attrName in this._defaults) {
					var attrValue = target.getAttribute('date:' + attrName);
					if (attrValue) {
						inlineSettings = inlineSettings || {};
						try {
							inlineSettings[attrName] = eval(attrValue);
						} catch (err) {
							inlineSettings[attrName] = attrValue;
						}
					}
				}
				var nodeName = target.nodeName.toLowerCase();
				var inline = (nodeName == 'div' || nodeName == 'span');
				if (!target.id) {
					this.uuid += 1;
					target.id = 'dp' + this.uuid;
				}
				var inst = this._newInst($(target), inline);
				inst.settings = $.extend({}, settings || {}, inlineSettings || {});
				if (nodeName == 'input') {
					this._connectDatepicker(target, inst);
				} else if (inline) {
					this._inlineDatepicker(target, inst);
				}
			},

			/* Create a new instance object. */
			_newInst: function(target, inline) {
				var id = target[0].id.replace(/([^A-Za-z0-9_-])/g, '\\\\$1'); // escape jQuery meta chars
				return {
					id: id,
					input: target, // associated target
					selectedDay: 0,
					selectedMonth: 0,
					selectedYear: 0, // current selection
					drawMonth: 0,
					drawYear: 0, // month being drawn
					inline: inline, // is datepicker inline or not
					dpDiv: (!inline ? this.dpDiv : // presentation div
						bindHover($('<div class="' + this._inlineClass + ' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>')))
				};
			},

			/* Attach the date picker to an input field. */
			_connectDatepicker: function(target, inst) {
				var input = $(target);
				inst.append = $([]);
				inst.trigger = $([]);
				if (input.hasClass(this.markerClassName))
					return;
				this._attachments(input, inst);
				input.addClass(this.markerClassName).keydown(this._doKeyDown).
				keypress(this._doKeyPress).keyup(this._doKeyUp).
				bind("setData.datepicker", function(event, key, value) {
					inst.settings[key] = value;
				}).bind("getData.datepicker", function(event, key) {
					return this._get(inst, key);
				});
				this._autoSize(inst);
				$.data(target, PROP_NAME, inst);
				//If disabled option is true, disable the datepicker once it has been attached to the input (see ticket #5665)
				if (inst.settings.disabled) {
					this._disableDatepicker(target);
				}
			},

			/* Make attachments based on settings. */
			_attachments: function(input, inst) {
				var appendText = this._get(inst, 'appendText');
				var isRTL = this._get(inst, 'isRTL');
				if (inst.append)
					inst.append.remove();
				if (appendText) {
					inst.append = $('<span class="' + this._appendClass + '">' + appendText + '</span>');
					input[isRTL ? 'before' : 'after'](inst.append);
				}
				input.unbind('focus', this._showDatepicker);
				if (inst.trigger)
					inst.trigger.remove();
				var showOn = this._get(inst, 'showOn');
				if (showOn == 'focus' || showOn == 'both') // pop-up date picker when in the marked field
					input.focus(this._showDatepicker);
				if (showOn == 'button' || showOn == 'both') { // pop-up date picker when button clicked
					var buttonText = this._get(inst, 'buttonText');
					var buttonImage = this._get(inst, 'buttonImage');
					inst.trigger = $(this._get(inst, 'buttonImageOnly') ?
						$('<img/>').addClass(this._triggerClass).attr({
							src: buttonImage,
							alt: buttonText,
							title: buttonText
						}) :
						$('<button type="button"></button>').addClass(this._triggerClass).html(buttonImage == '' ? buttonText : $('<img/>').attr({
							src: buttonImage,
							alt: buttonText,
							title: buttonText
						})));
					input[isRTL ? 'before' : 'after'](inst.trigger);
					inst.trigger.click(function() {
						if ($.datepicker._datepickerShowing && $.datepicker._lastInput == input[0])
							$.datepicker._hideDatepicker();
						else if ($.datepicker._datepickerShowing && $.datepicker._lastInput != input[0]) {
							$.datepicker._hideDatepicker();
							$.datepicker._showDatepicker(input[0]);
						} else
							$.datepicker._showDatepicker(input[0]);
						return false;
					});
				}
			},

			/* Apply the maximum length for the date format. */
			_autoSize: function(inst) {
				if (this._get(inst, 'autoSize') && !inst.inline) {
					var date = new Date(2009, 12 - 1, 20); // Ensure double digits
					var dateFormat = this._get(inst, 'dateFormat');
					if (dateFormat.match(/[DM]/)) {
						var findMax = function(names) {
							var max = 0;
							var maxI = 0;
							for (var i = 0; i < names.length; i++) {
								if (names[i].length > max) {
									max = names[i].length;
									maxI = i;
								}
							}
							return maxI;
						};
						date.setMonth(findMax(this._get(inst, (dateFormat.match(/MM/) ?
							'monthNames' : 'monthNamesShort'))));
						date.setDate(findMax(this._get(inst, (dateFormat.match(/DD/) ?
							'dayNames' : 'dayNamesShort'))) + 20 - date.getDay());
					}
					inst.input.attr('size', this._formatDate(inst, date).length);
				}
			},

			/* Attach an inline date picker to a div. */
			_inlineDatepicker: function(target, inst) {
				var divSpan = $(target);
				if (divSpan.hasClass(this.markerClassName))
					return;
				divSpan.addClass(this.markerClassName).append(inst.dpDiv).
				bind("setData.datepicker", function(event, key, value) {
					inst.settings[key] = value;
				}).bind("getData.datepicker", function(event, key) {
					return this._get(inst, key);
				});
				$.data(target, PROP_NAME, inst);
				this._setDate(inst, this._getDefaultDate(inst), true);
				this._updateDatepicker(inst);
				this._updateAlternate(inst);
				//If disabled option is true, disable the datepicker before showing it (see ticket #5665)
				if (inst.settings.disabled) {
					this._disableDatepicker(target);
				}
				// Set display:block in place of inst.dpDiv.show() which won't work on disconnected elements
				// http://bugs.jqueryui.com/ticket/7552 - A Datepicker created on a detached div has zero height
				inst.dpDiv.css("display", "block");
			},

			/* Pop-up the date picker in a "dialog" box.
	   @param  input     element - ignored
	   @param  date      string or Date - the initial date to display
	   @param  onSelect  function - the function to call when a date is selected
	   @param  settings  object - update the dialog date picker instance's settings (anonymous object)
	   @param  pos       int[2] - coordinates for the dialog's position within the screen or
	                     event - with x/y coordinates or
	                     leave empty for default (screen centre)
	   @return the manager object */
			_dialogDatepicker: function(input, date, onSelect, settings, pos) {
				var inst = this._dialogInst; // internal instance
				if (!inst) {
					this.uuid += 1;
					var id = 'dp' + this.uuid;
					this._dialogInput = $('<input type="text" id="' + id +
						'" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');
					this._dialogInput.keydown(this._doKeyDown);
					$('body').append(this._dialogInput);
					inst = this._dialogInst = this._newInst(this._dialogInput, false);
					inst.settings = {};
					$.data(this._dialogInput[0], PROP_NAME, inst);
				}
				extendRemove(inst.settings, settings || {});
				date = (date && date.constructor == Date ? this._formatDate(inst, date) : date);
				this._dialogInput.val(date);

				this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
				if (!this._pos) {
					var browserWidth = document.documentElement.clientWidth;
					var browserHeight = document.documentElement.clientHeight;
					var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
					var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
					this._pos = // should use actual width/height below
					[(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
				}

				// move input on screen for focus, but hidden behind dialog
				this._dialogInput.css('left', (this._pos[0] + 20) + 'px').css('top', this._pos[1] + 'px');
				inst.settings.onSelect = onSelect;
				this._inDialog = true;
				this.dpDiv.addClass(this._dialogClass);
				this._showDatepicker(this._dialogInput[0]);
				if ($.blockUI)
					$.blockUI(this.dpDiv);
				$.data(this._dialogInput[0], PROP_NAME, inst);
				return this;
			},

			/* Detach a datepicker from its control.
	   @param  target    element - the target input field or division or span */
			_destroyDatepicker: function(target) {
				var $target = $(target);
				var inst = $.data(target, PROP_NAME);
				if (!$target.hasClass(this.markerClassName)) {
					return;
				}
				var nodeName = target.nodeName.toLowerCase();
				$.removeData(target, PROP_NAME);
				if (nodeName == 'input') {
					inst.append.remove();
					inst.trigger.remove();
					$target.removeClass(this.markerClassName).
					unbind('focus', this._showDatepicker).
					unbind('keydown', this._doKeyDown).
					unbind('keypress', this._doKeyPress).
					unbind('keyup', this._doKeyUp);
				} else if (nodeName == 'div' || nodeName == 'span')
					$target.removeClass(this.markerClassName).empty();
			},

			/* Enable the date picker to a jQuery selection.
	   @param  target    element - the target input field or division or span */
			_enableDatepicker: function(target) {
				var $target = $(target);
				var inst = $.data(target, PROP_NAME);
				if (!$target.hasClass(this.markerClassName)) {
					return;
				}
				var nodeName = target.nodeName.toLowerCase();
				if (nodeName == 'input') {
					target.disabled = false;
					inst.trigger.filter('button').
					each(function() {
						this.disabled = false;
					}).end().
					filter('img').css({
						opacity: '1.0',
						cursor: ''
					});
				} else if (nodeName == 'div' || nodeName == 'span') {
					var inline = $target.children('.' + this._inlineClass);
					inline.children().removeClass('ui-state-disabled');
					inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
					removeAttr("disabled");
				}
				this._disabledInputs = $.map(this._disabledInputs,
					function(value) {
						return (value == target ? null : value);
					}); // delete entry
			},

			/* Disable the date picker to a jQuery selection.
	   @param  target    element - the target input field or division or span */
			_disableDatepicker: function(target) {
				var $target = $(target);
				var inst = $.data(target, PROP_NAME);
				if (!$target.hasClass(this.markerClassName)) {
					return;
				}
				var nodeName = target.nodeName.toLowerCase();
				if (nodeName == 'input') {
					target.disabled = true;
					inst.trigger.filter('button').
					each(function() {
						this.disabled = true;
					}).end().
					filter('img').css({
						opacity: '0.5',
						cursor: 'default'
					});
				} else if (nodeName == 'div' || nodeName == 'span') {
					var inline = $target.children('.' + this._inlineClass);
					inline.children().addClass('ui-state-disabled');
					inline.find("select.ui-datepicker-month, select.ui-datepicker-year").
					attr("disabled", "disabled");
				}
				this._disabledInputs = $.map(this._disabledInputs,
					function(value) {
						return (value == target ? null : value);
					}); // delete entry
				this._disabledInputs[this._disabledInputs.length] = target;
			},

			/* Is the first field in a jQuery collection disabled as a datepicker?
	   @param  target    element - the target input field or division or span
	   @return boolean - true if disabled, false if enabled */
			_isDisabledDatepicker: function(target) {
				if (!target) {
					return false;
				}
				for (var i = 0; i < this._disabledInputs.length; i++) {
					if (this._disabledInputs[i] == target)
						return true;
				}
				return false;
			},

			/* Retrieve the instance data for the target control.
	   @param  target  element - the target input field or division or span
	   @return  object - the associated instance data
	   @throws  error if a jQuery problem getting data */
			_getInst: function(target) {
				try {
					return $.data(target, PROP_NAME);
				} catch (err) {
					throw 'Missing instance data for this datepicker';
				}
			},

			/* Update or retrieve the settings for a date picker attached to an input field or division.
	   @param  target  element - the target input field or division or span
	   @param  name    object - the new settings to update or
	                   string - the name of the setting to change or retrieve,
	                   when retrieving also 'all' for all instance settings or
	                   'defaults' for all global defaults
	   @param  value   any - the new value for the setting
	                   (omit if above is an object or to retrieve a value) */
			_optionDatepicker: function(target, name, value) {
				var inst = this._getInst(target);
				if (arguments.length == 2 && typeof name == 'string') {
					return (name == 'defaults' ? $.extend({}, $.datepicker._defaults) :
						(inst ? (name == 'all' ? $.extend({}, inst.settings) :
							this._get(inst, name)) : null));
				}
				var settings = name || {};
				if (typeof name == 'string') {
					settings = {};
					settings[name] = value;
				}
				if (inst) {
					if (this._curInst == inst) {
						this._hideDatepicker();
					}
					var date = this._getDateDatepicker(target, true);
					var minDate = this._getMinMaxDate(inst, 'min');
					var maxDate = this._getMinMaxDate(inst, 'max');
					extendRemove(inst.settings, settings);
					// reformat the old minDate/maxDate values if dateFormat changes and a new minDate/maxDate isn't provided
					if (minDate !== null && settings['dateFormat'] !== undefined && settings['minDate'] === undefined)
						inst.settings.minDate = this._formatDate(inst, minDate);
					if (maxDate !== null && settings['dateFormat'] !== undefined && settings['maxDate'] === undefined)
						inst.settings.maxDate = this._formatDate(inst, maxDate);
					this._attachments($(target), inst);
					this._autoSize(inst);
					this._setDate(inst, date);
					this._updateAlternate(inst);
					this._updateDatepicker(inst);
				}
			},

			// change method deprecated
			_changeDatepicker: function(target, name, value) {
				this._optionDatepicker(target, name, value);
			},

			/* Redraw the date picker attached to an input field or division.
	   @param  target  element - the target input field or division or span */
			_refreshDatepicker: function(target) {
				var inst = this._getInst(target);
				if (inst) {
					this._updateDatepicker(inst);
				}
			},

			/* Set the dates for a jQuery selection.
	   @param  target   element - the target input field or division or span
	   @param  date     Date - the new date */
			_setDateDatepicker: function(target, date) {
				var inst = this._getInst(target);
				if (inst) {
					this._setDate(inst, date);
					this._updateDatepicker(inst);
					this._updateAlternate(inst);
				}
			},

			/* Get the date(s) for the first entry in a jQuery selection.
	   @param  target     element - the target input field or division or span
	   @param  noDefault  boolean - true if no default date is to be used
	   @return Date - the current date */
			_getDateDatepicker: function(target, noDefault) {
				var inst = this._getInst(target);
				if (inst && !inst.inline)
					this._setDateFromField(inst, noDefault);
				return (inst ? this._getDate(inst) : null);
			},

			/* Handle keystrokes. */
			_doKeyDown: function(event) {
				var inst = $.datepicker._getInst(event.target);
				var handled = true;
				var isRTL = inst.dpDiv.is('.ui-datepicker-rtl');
				inst._keyEvent = true;
				if ($.datepicker._datepickerShowing)
					switch (event.keyCode) {
						case 9:
							$.datepicker._hideDatepicker();
							handled = false;
							break; // hide on tab out
						case 13:
							var sel = $('td.' + $.datepicker._dayOverClass + ':not(.' +
								$.datepicker._currentClass + ')', inst.dpDiv);
							if (sel[0])
								$.datepicker._selectDay(event.target, inst.selectedMonth, inst.selectedYear, sel[0]);
							var onSelect = $.datepicker._get(inst, 'onSelect');
							if (onSelect) {
								var dateStr = $.datepicker._formatDate(inst);

								// trigger custom callback
								onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);
							} else
								$.datepicker._hideDatepicker();
							return false; // don't submit the form
							break; // select the value on enter
						case 27:
							$.datepicker._hideDatepicker();
							break; // hide on escape
						case 33:
							$.datepicker._adjustDate(event.target, (event.ctrlKey ? -$.datepicker._get(inst, 'stepBigMonths') : -$.datepicker._get(inst, 'stepMonths')), 'M');
							break; // previous month/year on page up/+ ctrl
						case 34:
							$.datepicker._adjustDate(event.target, (event.ctrlKey ? +$.datepicker._get(inst, 'stepBigMonths') : +$.datepicker._get(inst, 'stepMonths')), 'M');
							break; // next month/year on page down/+ ctrl
						case 35:
							if (event.ctrlKey || event.metaKey) $.datepicker._clearDate(event.target);
							handled = event.ctrlKey || event.metaKey;
							break; // clear on ctrl or command +end
						case 36:
							if (event.ctrlKey || event.metaKey) $.datepicker._gotoToday(event.target);
							handled = event.ctrlKey || event.metaKey;
							break; // current on ctrl or command +home
						case 37:
							if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, (isRTL ? +1 : -1), 'D');
							handled = event.ctrlKey || event.metaKey;
							// -1 day on ctrl or command +left
							if (event.originalEvent.altKey) $.datepicker._adjustDate(event.target, (event.ctrlKey ? -$.datepicker._get(inst, 'stepBigMonths') : -$.datepicker._get(inst, 'stepMonths')), 'M');
							// next month/year on alt +left on Mac
							break;
						case 38:
							if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, -7, 'D');
							handled = event.ctrlKey || event.metaKey;
							break; // -1 week on ctrl or command +up
						case 39:
							if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, (isRTL ? -1 : +1), 'D');
							handled = event.ctrlKey || event.metaKey;
							// +1 day on ctrl or command +right
							if (event.originalEvent.altKey) $.datepicker._adjustDate(event.target, (event.ctrlKey ? +$.datepicker._get(inst, 'stepBigMonths') : +$.datepicker._get(inst, 'stepMonths')), 'M');
							// next month/year on alt +right
							break;
						case 40:
							if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, +7, 'D');
							handled = event.ctrlKey || event.metaKey;
							break; // +1 week on ctrl or command +down
						default:
							handled = false;
					} else if (event.keyCode == 36 && event.ctrlKey) // display the date picker on ctrl+home
						$.datepicker._showDatepicker(this);
					else {
						handled = false;
					}
				if (handled) {
					event.preventDefault();
					event.stopPropagation();
				}
			},

			/* Filter entered characters - based on date format. */
			_doKeyPress: function(event) {
				var inst = $.datepicker._getInst(event.target);
				if ($.datepicker._get(inst, 'constrainInput')) {
					var chars = $.datepicker._possibleChars($.datepicker._get(inst, 'dateFormat'));
					var chr = String.fromCharCode(event.charCode == undefined ? event.keyCode : event.charCode);
					return event.ctrlKey || event.metaKey || (chr < ' ' || !chars || chars.indexOf(chr) > -1);
				}
			},

			/* Synchronise manual entry and field/alternate field. */
			_doKeyUp: function(event) {
				var inst = $.datepicker._getInst(event.target);
				if (inst.input.val() != inst.lastVal) {
					try {
						var date = $.datepicker.parseDate($.datepicker._get(inst, 'dateFormat'), (inst.input ? inst.input.val() : null),
							$.datepicker._getFormatConfig(inst));
						if (date) { // only if valid
							$.datepicker._setDateFromField(inst);
							$.datepicker._updateAlternate(inst);
							$.datepicker._updateDatepicker(inst);
						}
					} catch (event) {
						$.datepicker.log(event);
					}
				}
				return true;
			},

			/* Pop-up the date picker for a given input field.
       If false returned from beforeShow event handler do not show.
	   @param  input  element - the input field attached to the date picker or
	                  event - if triggered by focus */
			_showDatepicker: function(input) {
				input = input.target || input;
				if (input.nodeName.toLowerCase() != 'input') // find from button/image trigger
					input = $('input', input.parentNode)[0];
				if ($.datepicker._isDisabledDatepicker(input) || $.datepicker._lastInput == input) // already here
					return;
				var inst = $.datepicker._getInst(input);
				if ($.datepicker._curInst && $.datepicker._curInst != inst) {
					$.datepicker._curInst.dpDiv.stop(true, true);
					if (inst && $.datepicker._datepickerShowing) {
						$.datepicker._hideDatepicker($.datepicker._curInst.input[0]);
					}
				}
				var beforeShow = $.datepicker._get(inst, 'beforeShow');
				var beforeShowSettings = beforeShow ? beforeShow.apply(input, [input, inst]) : {};
				if (beforeShowSettings === false) {
					//false
					return;
				}
				extendRemove(inst.settings, beforeShowSettings);
				inst.lastVal = null;
				$.datepicker._lastInput = input;
				$.datepicker._setDateFromField(inst);
				if ($.datepicker._inDialog) // hide cursor
					input.value = '';
				if (!$.datepicker._pos) { // position below input
					$.datepicker._pos = $.datepicker._findPos(input);
					$.datepicker._pos[1] += input.offsetHeight; // add the height
				}
				var isFixed = false;
				$(input).parents().each(function() {
					isFixed |= $(this).css('position') == 'fixed';
					return !isFixed;
				});
				if (isFixed && $.browser.opera) { // correction for Opera when fixed and scrolled
					$.datepicker._pos[0] -= document.documentElement.scrollLeft;
					$.datepicker._pos[1] -= document.documentElement.scrollTop;
				}
				var offset = {
					left: $.datepicker._pos[0],
					top: $.datepicker._pos[1]
				};
				$.datepicker._pos = null;
				//to avoid flashes on Firefox
				inst.dpDiv.empty();
				// determine sizing offscreen
				inst.dpDiv.css({
					position: 'absolute',
					display: 'block',
					top: '-1000px'
				});
				$.datepicker._updateDatepicker(inst);
				// fix width for dynamic number of date pickers
				// and adjust position before showing
				offset = $.datepicker._checkOffset(inst, offset, isFixed);
				inst.dpDiv.css({
					position: ($.datepicker._inDialog && $.blockUI ?
						'static' : (isFixed ? 'fixed' : 'absolute')),
					display: 'none',
					left: offset.left + 'px',
					top: offset.top + 'px'
				});
				if (!inst.inline) {
					var showAnim = $.datepicker._get(inst, 'showAnim');
					var duration = $.datepicker._get(inst, 'duration');
					var postProcess = function() {
						var cover = inst.dpDiv.find('iframe.ui-datepicker-cover'); // IE6- only
						if ( !! cover.length) {
							var borders = $.datepicker._getBorders(inst.dpDiv);
							cover.css({
								left: -borders[0],
								top: -borders[1],
								width: inst.dpDiv.outerWidth(),
								height: inst.dpDiv.outerHeight()
							});
						}
					};
					inst.dpDiv.zIndex($(input).zIndex() + 1);
					$.datepicker._datepickerShowing = true;
					if ($.effects && $.effects[showAnim])
						inst.dpDiv.show(showAnim, $.datepicker._get(inst, 'showOptions'), duration, postProcess);
					else
						inst.dpDiv[showAnim || 'show']((showAnim ? duration : null), postProcess);
					if (!showAnim || !duration)
						postProcess();
					if (inst.input.is(':visible') && !inst.input.is(':disabled'))
						inst.input.focus();
					$.datepicker._curInst = inst;
				}
			},

			/* Generate the date picker content. */
			_updateDatepicker: function(inst) {
				var self = this;
				self.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
				var borders = $.datepicker._getBorders(inst.dpDiv);
				instActive = inst; // for delegate hover events
				inst.dpDiv.empty().append(this._generateHTML(inst));
				var cover = inst.dpDiv.find('iframe.ui-datepicker-cover'); // IE6- only
				if ( !! cover.length) { //avoid call to outerXXXX() when not in IE6
					cover.css({
						left: -borders[0],
						top: -borders[1],
						width: inst.dpDiv.outerWidth(),
						height: inst.dpDiv.outerHeight()
					})
				}
				inst.dpDiv.find('.' + this._dayOverClass + ' a').mouseover();
				var numMonths = this._getNumberOfMonths(inst);
				var cols = numMonths[1];
				var width = 17;
				inst.dpDiv.removeClass('ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4').width('');
				if (cols > 1)
					inst.dpDiv.addClass('ui-datepicker-multi-' + cols).css('width', (width * cols) + 'em');
				inst.dpDiv[(numMonths[0] != 1 || numMonths[1] != 1 ? 'add' : 'remove') +
					'Class']('ui-datepicker-multi');
				inst.dpDiv[(this._get(inst, 'isRTL') ? 'add' : 'remove') +
					'Class']('ui-datepicker-rtl');
				if (inst == $.datepicker._curInst && $.datepicker._datepickerShowing && inst.input &&
					// #6694 - don't focus the input if it's already focused
					// this breaks the change event in IE
					inst.input.is(':visible') && !inst.input.is(':disabled') && inst.input[0] != document.activeElement)
					inst.input.focus();
				// deffered render of the years select (to avoid flashes on Firefox)
				if (inst.yearshtml) {
					var origyearshtml = inst.yearshtml;
					setTimeout(function() {
						//assure that inst.yearshtml didn't change.
						if (origyearshtml === inst.yearshtml && inst.yearshtml) {
							inst.dpDiv.find('select.ui-datepicker-year:first').replaceWith(inst.yearshtml);
						}
						origyearshtml = inst.yearshtml = null;
					}, 0);
				}
			},

			/* Retrieve the size of left and top borders for an element.
	   @param  elem  (jQuery object) the element of interest
	   @return  (number[2]) the left and top borders */
			_getBorders: function(elem) {
				var convert = function(value) {
					return {
						thin: 1,
						medium: 2,
						thick: 3
					}[value] || value;
				};
				return [parseFloat(convert(elem.css('border-left-width'))),
					parseFloat(convert(elem.css('border-top-width')))];
			},

			/* Check positioning to remain on screen. */
			_checkOffset: function(inst, offset, isFixed) {
				var dpWidth = inst.dpDiv.outerWidth();
				var dpHeight = inst.dpDiv.outerHeight();
				var inputWidth = inst.input ? inst.input.outerWidth() : 0;
				var inputHeight = inst.input ? inst.input.outerHeight() : 0;
				var viewWidth = document.documentElement.clientWidth + $(document).scrollLeft();
				var viewHeight = document.documentElement.clientHeight + $(document).scrollTop();

				offset.left -= (this._get(inst, 'isRTL') ? (dpWidth - inputWidth) : 0);
				offset.left -= (isFixed && offset.left == inst.input.offset().left) ? $(document).scrollLeft() : 0;
				offset.top -= (isFixed && offset.top == (inst.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;

				// now check if datepicker is showing outside window viewport - move to a better place if so.
				offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
					Math.abs(offset.left + dpWidth - viewWidth) : 0);
				offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
					Math.abs(dpHeight + inputHeight) : 0);

				return offset;
			},

			/* Find an object's position on the screen. */
			_findPos: function(obj) {
				var inst = this._getInst(obj);
				var isRTL = this._get(inst, 'isRTL');
				while (obj && (obj.type == 'hidden' || obj.nodeType != 1 || $.expr.filters.hidden(obj))) {
					obj = obj[isRTL ? 'previousSibling' : 'nextSibling'];
				}
				var position = $(obj).offset();
				return [position.left, position.top];
			},

			/* Hide the date picker from view.
	   @param  input  element - the input field attached to the date picker */
			_hideDatepicker: function(input) {
				var inst = this._curInst;
				if (!inst || (input && inst != $.data(input, PROP_NAME)))
					return;
				if (this._datepickerShowing) {
					var showAnim = this._get(inst, 'showAnim');
					var duration = this._get(inst, 'duration');
					var self = this;
					var postProcess = function() {
						$.datepicker._tidyDialog(inst);
						self._curInst = null;
					};
					if ($.effects && $.effects[showAnim])
						inst.dpDiv.hide(showAnim, $.datepicker._get(inst, 'showOptions'), duration, postProcess);
					else
						inst.dpDiv[(showAnim == 'slideDown' ? 'slideUp' :
							(showAnim == 'fadeIn' ? 'fadeOut' : 'hide'))]((showAnim ? duration : null), postProcess);
					if (!showAnim)
						postProcess();
					this._datepickerShowing = false;
					var onClose = this._get(inst, 'onClose');
					if (onClose)
						onClose.apply((inst.input ? inst.input[0] : null), [(inst.input ? inst.input.val() : ''), inst]);
					this._lastInput = null;
					if (this._inDialog) {
						this._dialogInput.css({
							position: 'absolute',
							left: '0',
							top: '-100px'
						});
						if ($.blockUI) {
							$.unblockUI();
							$('body').append(this.dpDiv);
						}
					}
					this._inDialog = false;
				}
			},

			/* Tidy up after a dialog display. */
			_tidyDialog: function(inst) {
				inst.dpDiv.removeClass(this._dialogClass).unbind('.ui-datepicker-calendar');
			},

			/* Close date picker if clicked elsewhere. */
			_checkExternalClick: function(event) {
				if (!$.datepicker._curInst)
					return;

				var $target = $(event.target),
					inst = $.datepicker._getInst($target[0]);

				if ((($target[0].id != $.datepicker._mainDivId &&
						$target.parents('#' + $.datepicker._mainDivId).length == 0 && !$target.hasClass($.datepicker.markerClassName) && !$target.closest("." + $.datepicker._triggerClass).length &&
						$.datepicker._datepickerShowing && !($.datepicker._inDialog && $.blockUI))) ||
					($target.hasClass($.datepicker.markerClassName) && $.datepicker._curInst != inst))
					$.datepicker._hideDatepicker();
			},

			/* Adjust one of the date sub-fields. */
			_adjustDate: function(id, offset, period) {
				var target = $(id);
				var inst = this._getInst(target[0]);
				if (this._isDisabledDatepicker(target[0])) {
					return;
				}
				this._adjustInstDate(inst, offset +
					(period == 'M' ? this._get(inst, 'showCurrentAtPos') : 0), // undo positioning
					period);
				this._updateDatepicker(inst);
			},

			/* Action for current link. */
			_gotoToday: function(id) {
				var target = $(id);
				var inst = this._getInst(target[0]);
				if (this._get(inst, 'gotoCurrent') && inst.currentDay) {
					inst.selectedDay = inst.currentDay;
					inst.drawMonth = inst.selectedMonth = inst.currentMonth;
					inst.drawYear = inst.selectedYear = inst.currentYear;
				} else {
					var date = new Date();
					inst.selectedDay = date.getDate();
					inst.drawMonth = inst.selectedMonth = date.getMonth();
					inst.drawYear = inst.selectedYear = date.getFullYear();
				}
				this._notifyChange(inst);
				this._adjustDate(target);
			},

			/* Action for selecting a new month/year. */
			_selectMonthYear: function(id, select, period) {
				var target = $(id);
				var inst = this._getInst(target[0]);
				inst['selected' + (period == 'M' ? 'Month' : 'Year')] =
					inst['draw' + (period == 'M' ? 'Month' : 'Year')] =
					parseInt(select.options[select.selectedIndex].value, 10);
				this._notifyChange(inst);
				this._adjustDate(target);
			},

			/* Action for selecting a day. */
			_selectDay: function(id, month, year, td) {
				var target = $(id);
				if ($(td).hasClass(this._unselectableClass) || this._isDisabledDatepicker(target[0])) {
					return;
				}
				var inst = this._getInst(target[0]);
				inst.selectedDay = inst.currentDay = $('a', td).html();
				inst.selectedMonth = inst.currentMonth = month;
				inst.selectedYear = inst.currentYear = year;
				this._selectDate(id, this._formatDate(inst,
					inst.currentDay, inst.currentMonth, inst.currentYear));
			},

			/* Erase the input field and hide the date picker. */
			_clearDate: function(id) {
				var target = $(id);
				var inst = this._getInst(target[0]);
				this._selectDate(target, '');
			},

			/* Update the input field with the selected date. */
			_selectDate: function(id, dateStr) {
				var target = $(id);
				var inst = this._getInst(target[0]);
				dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
				if (inst.input)
					inst.input.val(dateStr);
				this._updateAlternate(inst);
				var onSelect = this._get(inst, 'onSelect');
				if (onSelect)
					onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]); // trigger custom callback
				else if (inst.input)
					inst.input.trigger('change'); // fire the change event
				if (inst.inline)
					this._updateDatepicker(inst);
				else {
					this._hideDatepicker();
					this._lastInput = inst.input[0];
					if (typeof(inst.input[0]) != 'object')
						inst.input.focus(); // restore focus
					this._lastInput = null;
				}
			},

			/* Update any alternate field to synchronise with the main field. */
			_updateAlternate: function(inst) {
				var altField = this._get(inst, 'altField');
				if (altField) { // update alternate field too
					var altFormat = this._get(inst, 'altFormat') || this._get(inst, 'dateFormat');
					var date = this._getDate(inst);
					var dateStr = this.formatDate(altFormat, date, this._getFormatConfig(inst));
					$(altField).each(function() {
						$(this).val(dateStr);
					});
				}
			},

			/* Set as beforeShowDay function to prevent selection of weekends.
	   @param  date  Date - the date to customise
	   @return [boolean, string] - is this date selectable?, what is its CSS class? */
			noWeekends: function(date) {
				var day = date.getDay();
				return [(day > 0 && day < 6), ''];
			},

			/* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
	   @param  date  Date - the date to get the week for
	   @return  number - the number of the week within the year that contains this date */
			iso8601Week: function(date) {
				var checkDate = new Date(date.getTime());
				// Find Thursday of this week starting on Monday
				checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
				var time = checkDate.getTime();
				checkDate.setMonth(0); // Compare with Jan 1
				checkDate.setDate(1);
				return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
			},

			/* Parse a string value into a date object.
	   See formatDate below for the possible formats.

	   @param  format    string - the expected format of the date
	   @param  value     string - the date in the above format
	   @param  settings  Object - attributes include:
	                     shortYearCutoff  number - the cutoff year for determining the century (optional)
	                     dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
	                     dayNames         string[7] - names of the days from Sunday (optional)
	                     monthNamesShort  string[12] - abbreviated names of the months (optional)
	                     monthNames       string[12] - names of the months (optional)
	   @return  Date - the extracted date value or null if value is blank */
			parseDate: function(format, value, settings) {
				if (format == null || value == null)
					throw 'Invalid arguments';
				value = (typeof value == 'object' ? value.toString() : value + '');
				if (value == '')
					return null;
				var shortYearCutoff = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff;
				shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff :
					new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
				var dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
				var dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames;
				var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
				var monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames;
				var year = -1;
				var month = -1;
				var day = -1;
				var doy = -1;
				var literal = false;
				// Check whether a format character is doubled
				var lookAhead = function(match) {
					var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
					if (matches)
						iFormat++;
					return matches;
				};
				// Extract a number from the string value
				var getNumber = function(match) {
					var isDoubled = lookAhead(match);
					var size = (match == '@' ? 14 : (match == '!' ? 20 :
						(match == 'y' && isDoubled ? 4 : (match == 'o' ? 3 : 2))));
					var digits = new RegExp('^\\d{1,' + size + '}');
					var num = value.substring(iValue).match(digits);
					if (!num)
						throw 'Missing number at position ' + iValue;
					iValue += num[0].length;
					return parseInt(num[0], 10);
				};
				// Extract a name from the string value and convert to an index
				var getName = function(match, shortNames, longNames) {
					var names = $.map(lookAhead(match) ? longNames : shortNames, function(v, k) {
						return [[k, v]];
					}).sort(function(a, b) {
						return -(a[1].length - b[1].length);
					});
					var index = -1;
					$.each(names, function(i, pair) {
						var name = pair[1];
						if (value.substr(iValue, name.length).toLowerCase() == name.toLowerCase()) {
							index = pair[0];
							iValue += name.length;
							return false;
						}
					});
					if (index != -1)
						return index + 1;
					else
						throw 'Unknown name at position ' + iValue;
				};
				// Confirm that a literal character matches the string value
				var checkLiteral = function() {
					if (value.charAt(iValue) != format.charAt(iFormat))
						throw 'Unexpected literal at position ' + iValue;
					iValue++;
				};
				var iValue = 0;
				for (var iFormat = 0; iFormat < format.length; iFormat++) {
					if (literal)
						if (format.charAt(iFormat) == "'" && !lookAhead("'"))
							literal = false;
						else
							checkLiteral();
						else
							switch (format.charAt(iFormat)) {
								case 'd':
									day = getNumber('d');
									break;
								case 'D':
									getName('D', dayNamesShort, dayNames);
									break;
								case 'o':
									doy = getNumber('o');
									break;
								case 'm':
									month = getNumber('m');
									break;
								case 'M':
									month = getName('M', monthNamesShort, monthNames);
									break;
								case 'y':
									year = getNumber('y');
									break;
								case '@':
									var date = new Date(getNumber('@'));
									year = date.getFullYear();
									month = date.getMonth() + 1;
									day = date.getDate();
									break;
								case '!':
									var date = new Date((getNumber('!') - this._ticksTo1970) / 10000);
									year = date.getFullYear();
									month = date.getMonth() + 1;
									day = date.getDate();
									break;
								case "'":
									if (lookAhead("'"))
										checkLiteral();
									else
										literal = true;
									break;
								default:
									checkLiteral();
							}
				}
				if (iValue < value.length) {
					throw "Extra/unparsed characters found in date: " + value.substring(iValue);
				}
				if (year == -1)
					year = new Date().getFullYear();
				else if (year < 100)
					year += new Date().getFullYear() - new Date().getFullYear() % 100 +
						(year <= shortYearCutoff ? 0 : -100);
				if (doy > -1) {
					month = 1;
					day = doy;
					do {
						var dim = this._getDaysInMonth(year, month - 1);
						if (day <= dim)
							break;
						month++;
						day -= dim;
					} while (true);
				}
				var date = this._daylightSavingAdjust(new Date(year, month - 1, day));
				if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day)
					throw 'Invalid date'; // E.g. 31/02/00
				return date;
			},

			/* Standard date formats. */
			ATOM: 'yy-mm-dd', // RFC 3339 (ISO 8601)
			COOKIE: 'D, dd M yy',
			ISO_8601: 'yy-mm-dd',
			RFC_822: 'D, d M y',
			RFC_850: 'DD, dd-M-y',
			RFC_1036: 'D, d M y',
			RFC_1123: 'D, d M yy',
			RFC_2822: 'D, d M yy',
			RSS: 'D, d M y', // RFC 822
			TICKS: '!',
			TIMESTAMP: '@',
			W3C: 'yy-mm-dd', // ISO 8601

			_ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
				Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),

			/* Format a date object into a string value.
	   The format can be combinations of the following:
	   d  - day of month (no leading zero)
	   dd - day of month (two digit)
	   o  - day of year (no leading zeros)
	   oo - day of year (three digit)
	   D  - day name short
	   DD - day name long
	   m  - month of year (no leading zero)
	   mm - month of year (two digit)
	   M  - month name short
	   MM - month name long
	   y  - year (two digit)
	   yy - year (four digit)
	   @ - Unix timestamp (ms since 01/01/1970)
	   ! - Windows ticks (100ns since 01/01/0001)
	   '...' - literal text
	   '' - single quote

	   @param  format    string - the desired format of the date
	   @param  date      Date - the date value to format
	   @param  settings  Object - attributes include:
	                     dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
	                     dayNames         string[7] - names of the days from Sunday (optional)
	                     monthNamesShort  string[12] - abbreviated names of the months (optional)
	                     monthNames       string[12] - names of the months (optional)
	   @return  string - the date in the above format */
			formatDate: function(format, date, settings) {
				if (!date)
					return '';
				var dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
				var dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames;
				var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
				var monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames;
				// Check whether a format character is doubled
				var lookAhead = function(match) {
					var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
					if (matches)
						iFormat++;
					return matches;
				};
				// Format a number, with leading zero if necessary
				var formatNumber = function(match, value, len) {
					var num = '' + value;
					if (lookAhead(match))
						while (num.length < len)
							num = '0' + num;
					return num;
				};
				// Format a name, short or long as requested
				var formatName = function(match, value, shortNames, longNames) {
					return (lookAhead(match) ? longNames[value] : shortNames[value]);
				};
				var output = '';
				var literal = false;
				if (date)
					for (var iFormat = 0; iFormat < format.length; iFormat++) {
						if (literal)
							if (format.charAt(iFormat) == "'" && !lookAhead("'"))
								literal = false;
							else
								output += format.charAt(iFormat);
							else
								switch (format.charAt(iFormat)) {
									case 'd':
										output += formatNumber('d', date.getDate(), 2);
										break;
									case 'D':
										output += formatName('D', date.getDay(), dayNamesShort, dayNames);
										break;
									case 'o':
										output += formatNumber('o',
											Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
										break;
									case 'm':
										output += formatNumber('m', date.getMonth() + 1, 2);
										break;
									case 'M':
										output += formatName('M', date.getMonth(), monthNamesShort, monthNames);
										break;
									case 'y':
										output += (lookAhead('y') ? date.getFullYear() :
											(date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
										break;
									case '@':
										output += date.getTime();
										break;
									case '!':
										output += date.getTime() * 10000 + this._ticksTo1970;
										break;
									case "'":
										if (lookAhead("'"))
											output += "'";
										else
											literal = true;
										break;
									default:
										output += format.charAt(iFormat);
								}
					}
				return output;
			},

			/* Extract all possible characters from the date format. */
			_possibleChars: function(format) {
				var chars = '';
				var literal = false;
				// Check whether a format character is doubled
				var lookAhead = function(match) {
					var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
					if (matches)
						iFormat++;
					return matches;
				};
				for (var iFormat = 0; iFormat < format.length; iFormat++)
					if (literal)
						if (format.charAt(iFormat) == "'" && !lookAhead("'"))
							literal = false;
						else
							chars += format.charAt(iFormat);
						else
							switch (format.charAt(iFormat)) {
								case 'd':
								case 'm':
								case 'y':
								case '@':
									chars += '0123456789';
									break;
								case 'D':
								case 'M':
									return null; // Accept anything
								case "'":
									if (lookAhead("'"))
										chars += "'";
									else
										literal = true;
									break;
								default:
									chars += format.charAt(iFormat);
							}
				return chars;
			},

			/* Get a setting value, defaulting if necessary. */
			_get: function(inst, name) {
				return inst.settings[name] !== undefined ?
					inst.settings[name] : this._defaults[name];
			},

			/* Parse existing date and initialise date picker. */
			_setDateFromField: function(inst, noDefault) {
				if (inst.input.val() == inst.lastVal) {
					return;
				}
				var dateFormat = this._get(inst, 'dateFormat');
				var dates = inst.lastVal = inst.input ? inst.input.val() : null;
				var date, defaultDate;
				date = defaultDate = this._getDefaultDate(inst);
				var settings = this._getFormatConfig(inst);
				try {
					date = this.parseDate(dateFormat, dates, settings) || defaultDate;
				} catch (event) {
					this.log(event);
					dates = (noDefault ? '' : dates);
				}
				inst.selectedDay = date.getDate();
				inst.drawMonth = inst.selectedMonth = date.getMonth();
				inst.drawYear = inst.selectedYear = date.getFullYear();
				inst.currentDay = (dates ? date.getDate() : 0);
				inst.currentMonth = (dates ? date.getMonth() : 0);
				inst.currentYear = (dates ? date.getFullYear() : 0);
				this._adjustInstDate(inst);
			},

			/* Retrieve the default date shown on opening. */
			_getDefaultDate: function(inst) {
				return this._restrictMinMax(inst,
					this._determineDate(inst, this._get(inst, 'defaultDate'), new Date()));
			},

			/* A date may be specified as an exact value or a relative one. */
			_determineDate: function(inst, date, defaultDate) {
				var offsetNumeric = function(offset) {
					var date = new Date();
					date.setDate(date.getDate() + offset);
					return date;
				};
				var offsetString = function(offset) {
					try {
						return $.datepicker.parseDate($.datepicker._get(inst, 'dateFormat'),
							offset, $.datepicker._getFormatConfig(inst));
					} catch (e) {
						// Ignore
					}
					var date = (offset.toLowerCase().match(/^c/) ?
						$.datepicker._getDate(inst) : null) || new Date();
					var year = date.getFullYear();
					var month = date.getMonth();
					var day = date.getDate();
					var pattern = /([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g;
					var matches = pattern.exec(offset);
					while (matches) {
						switch (matches[2] || 'd') {
							case 'd':
							case 'D':
								day += parseInt(matches[1], 10);
								break;
							case 'w':
							case 'W':
								day += parseInt(matches[1], 10) * 7;
								break;
							case 'm':
							case 'M':
								month += parseInt(matches[1], 10);
								day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
								break;
							case 'y':
							case 'Y':
								year += parseInt(matches[1], 10);
								day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
								break;
						}
						matches = pattern.exec(offset);
					}
					return new Date(year, month, day);
				};
				var newDate = (date == null || date === '' ? defaultDate : (typeof date == 'string' ? offsetString(date) :
					(typeof date == 'number' ? (isNaN(date) ? defaultDate : offsetNumeric(date)) : new Date(date.getTime()))));
				newDate = (newDate && newDate.toString() == 'Invalid Date' ? defaultDate : newDate);
				if (newDate) {
					newDate.setHours(0);
					newDate.setMinutes(0);
					newDate.setSeconds(0);
					newDate.setMilliseconds(0);
				}
				return this._daylightSavingAdjust(newDate);
			},

			/* Handle switch to/from daylight saving.
	   Hours may be non-zero on daylight saving cut-over:
	   > 12 when midnight changeover, but then cannot generate
	   midnight datetime, so jump to 1AM, otherwise reset.
	   @param  date  (Date) the date to check
	   @return  (Date) the corrected date */
			_daylightSavingAdjust: function(date) {
				if (!date) return null;
				date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
				return date;
			},

			/* Set the date(s) directly. */
			_setDate: function(inst, date, noChange) {
				var clear = !date;
				var origMonth = inst.selectedMonth;
				var origYear = inst.selectedYear;
				var newDate = this._restrictMinMax(inst, this._determineDate(inst, date, new Date()));
				inst.selectedDay = inst.currentDay = newDate.getDate();
				inst.drawMonth = inst.selectedMonth = inst.currentMonth = newDate.getMonth();
				inst.drawYear = inst.selectedYear = inst.currentYear = newDate.getFullYear();
				if ((origMonth != inst.selectedMonth || origYear != inst.selectedYear) && !noChange)
					this._notifyChange(inst);
				this._adjustInstDate(inst);
				if (inst.input) {
					inst.input.val(clear ? '' : this._formatDate(inst));
				}
			},

			/* Retrieve the date(s) directly. */
			_getDate: function(inst) {
				var startDate = (!inst.currentYear || (inst.input && inst.input.val() == '') ? null :
					this._daylightSavingAdjust(new Date(
						inst.currentYear, inst.currentMonth, inst.currentDay)));
				return startDate;
			},

			/* Generate the HTML for the current state of the date picker. */
			_generateHTML: function(inst) {
				var today = new Date();
				today = this._daylightSavingAdjust(
					new Date(today.getFullYear(), today.getMonth(), today.getDate())); // clear time
				var isRTL = this._get(inst, 'isRTL');
				var showButtonPanel = this._get(inst, 'showButtonPanel');
				var hideIfNoPrevNext = this._get(inst, 'hideIfNoPrevNext');
				var navigationAsDateFormat = this._get(inst, 'navigationAsDateFormat');
				var numMonths = this._getNumberOfMonths(inst);
				var showCurrentAtPos = this._get(inst, 'showCurrentAtPos');
				var stepMonths = this._get(inst, 'stepMonths');
				var isMultiMonth = (numMonths[0] != 1 || numMonths[1] != 1);
				var currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) :
					new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
				var minDate = this._getMinMaxDate(inst, 'min');
				var maxDate = this._getMinMaxDate(inst, 'max');
				var drawMonth = inst.drawMonth - showCurrentAtPos;
				var drawYear = inst.drawYear;
				if (drawMonth < 0) {
					drawMonth += 12;
					drawYear--;
				}
				if (maxDate) {
					var maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(),
						maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()));
					maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
					while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
						drawMonth--;
						if (drawMonth < 0) {
							drawMonth = 11;
							drawYear--;
						}
					}
				}
				inst.drawMonth = drawMonth;
				inst.drawYear = drawYear;
				var prevText = this._get(inst, 'prevText');
				prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText,
					this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
					this._getFormatConfig(inst)));
				var prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ?
					'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_' + dpuuid +
					'.datepicker._adjustDate(\'#' + inst.id + '\', -' + stepMonths + ', \'M\');"' +
					' title="' + prevText + '"><span class="ui-icon ui-icon-circle-triangle-' + (isRTL ? 'e' : 'w') + '">' + prevText + '</span></a>' :
					(hideIfNoPrevNext ? '' : '<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="' + prevText + '"><span class="ui-icon ui-icon-circle-triangle-' + (isRTL ? 'e' : 'w') + '">' + prevText + '</span></a>'));
				var nextText = this._get(inst, 'nextText');
				nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText,
					this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)),
					this._getFormatConfig(inst)));
				var next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ?
					'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_' + dpuuid +
					'.datepicker._adjustDate(\'#' + inst.id + '\', +' + stepMonths + ', \'M\');"' +
					' title="' + nextText + '"><span class="ui-icon ui-icon-circle-triangle-' + (isRTL ? 'w' : 'e') + '">' + nextText + '</span></a>' :
					(hideIfNoPrevNext ? '' : '<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="' + nextText + '"><span class="ui-icon ui-icon-circle-triangle-' + (isRTL ? 'w' : 'e') + '">' + nextText + '</span></a>'));
				var currentText = this._get(inst, 'currentText');
				var gotoDate = (this._get(inst, 'gotoCurrent') && inst.currentDay ? currentDate : today);
				currentText = (!navigationAsDateFormat ? currentText :
					this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));
				var controls = (!inst.inline ? '<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_' + dpuuid +
					'.datepicker._hideDatepicker();">' + this._get(inst, 'closeText') + '</button>' : '');
				var buttonPanel = (showButtonPanel) ? '<div class="ui-datepicker-buttonpane ui-widget-content">' + (isRTL ? controls : '') +
					(this._isInRange(inst, gotoDate) ? '<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_' + dpuuid +
					'.datepicker._gotoToday(\'#' + inst.id + '\');"' +
					'>' + currentText + '</button>' : '') + (isRTL ? '' : controls) + '</div>' : '';
				var firstDay = parseInt(this._get(inst, 'firstDay'), 10);
				firstDay = (isNaN(firstDay) ? 0 : firstDay);
				var showWeek = this._get(inst, 'showWeek');
				var dayNames = this._get(inst, 'dayNames');
				var dayNamesShort = this._get(inst, 'dayNamesShort');
				var dayNamesMin = this._get(inst, 'dayNamesMin');
				var monthNames = this._get(inst, 'monthNames');
				var monthNamesShort = this._get(inst, 'monthNamesShort');
				var beforeShowDay = this._get(inst, 'beforeShowDay');
				var showOtherMonths = this._get(inst, 'showOtherMonths');
				var selectOtherMonths = this._get(inst, 'selectOtherMonths');
				var calculateWeek = this._get(inst, 'calculateWeek') || this.iso8601Week;
				var defaultDate = this._getDefaultDate(inst);
				var html = '';
				for (var row = 0; row < numMonths[0]; row++) {
					var group = '';
					this.maxRows = 4;
					for (var col = 0; col < numMonths[1]; col++) {
						var selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
						var cornerClass = ' ui-corner-all';
						var calender = '';
						if (isMultiMonth) {
							calender += '<div class="ui-datepicker-group';
							if (numMonths[1] > 1)
								switch (col) {
									case 0:
										calender += ' ui-datepicker-group-first';
										cornerClass = ' ui-corner-' + (isRTL ? 'right' : 'left');
										break;
									case numMonths[1] - 1:
										calender += ' ui-datepicker-group-last';
										cornerClass = ' ui-corner-' + (isRTL ? 'left' : 'right');
										break;
									default:
										calender += ' ui-datepicker-group-middle';
										cornerClass = '';
										break;
								}
							calender += '">';
						}
						calender += '<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix' + cornerClass + '">' +
							(/all|left/.test(cornerClass) && row == 0 ? (isRTL ? next : prev) : '') +
							(/all|right/.test(cornerClass) && row == 0 ? (isRTL ? prev : next) : '') +
							this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
								row > 0 || col > 0, monthNames, monthNamesShort) + // draw month headers
						'</div><table class="ui-datepicker-calendar"><thead>' +
							'<tr>';
						var thead = (showWeek ? '<th class="ui-datepicker-week-col">' + this._get(inst, 'weekHeader') + '</th>' : '');
						for (var dow = 0; dow < 7; dow++) { // days of the week
							var day = (dow + firstDay) % 7;
							thead += '<th' + ((dow + firstDay + 6) % 7 >= 5 ? ' class="ui-datepicker-week-end"' : '') + '>' +
								'<span title="' + dayNames[day] + '">' + dayNamesMin[day] + '</span></th>';
						}
						calender += thead + '</tr></thead><tbody>';
						var daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
						if (drawYear == inst.selectedYear && drawMonth == inst.selectedMonth)
							inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
						var leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
						var curRows = Math.ceil((leadDays + daysInMonth) / 7); // calculate the number of rows to generate
						var numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows); //If multiple months, use the higher number of rows (see #7043)
						this.maxRows = numRows;
						var printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
						for (var dRow = 0; dRow < numRows; dRow++) { // create date picker rows
							calender += '<tr>';
							var tbody = (!showWeek ? '' : '<td class="ui-datepicker-week-col">' +
								this._get(inst, 'calculateWeek')(printDate) + '</td>');
							for (var dow = 0; dow < 7; dow++) { // create date picker days
								var daySettings = (beforeShowDay ?
									beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, '']);
								var otherMonth = (printDate.getMonth() != drawMonth);
								var unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] ||
									(minDate && printDate < minDate) || (maxDate && printDate > maxDate);
								tbody += '<td class="' +
									((dow + firstDay + 6) % 7 >= 5 ? ' ui-datepicker-week-end' : '') + // highlight weekends
								(otherMonth ? ' ui-datepicker-other-month' : '') + // highlight days from other months
								((printDate.getTime() == selectedDate.getTime() && drawMonth == inst.selectedMonth && inst._keyEvent) || // user pressed key
									(defaultDate.getTime() == printDate.getTime() && defaultDate.getTime() == selectedDate.getTime()) ?
									// or defaultDate is current printedDate and defaultDate is selectedDate
									' ' + this._dayOverClass : '') + // highlight selected day
								(unselectable ? ' ' + this._unselectableClass + ' ui-state-disabled' : '') + // highlight unselectable days
								(otherMonth && !showOtherMonths ? '' : ' ' + daySettings[1] + // highlight custom dates
									(printDate.getTime() == currentDate.getTime() ? ' ' + this._currentClass : '') + // highlight selected day
									(printDate.getTime() == today.getTime() ? ' ui-datepicker-today' : '')) + '"' + // highlight today (if different)
								((!otherMonth || showOtherMonths) && daySettings[2] ? ' title="' + daySettings[2] + '"' : '') + // cell title
								(unselectable ? '' : ' onclick="DP_jQuery_' + dpuuid + '.datepicker._selectDay(\'#' +
									inst.id + '\',' + printDate.getMonth() + ',' + printDate.getFullYear() + ', this);return false;"') + '>' + // actions
								(otherMonth && !showOtherMonths ? '&#xa0;' : // display for other months
									(unselectable ? '<span class="ui-state-default">' + printDate.getDate() + '</span>' : '<a class="ui-state-default' +
										(printDate.getTime() == today.getTime() ? ' ui-state-highlight' : '') +
										(printDate.getTime() == currentDate.getTime() ? ' ui-state-active' : '') + // highlight selected day
										(otherMonth ? ' ui-priority-secondary' : '') + // distinguish dates from other months
										'" href="#">' + printDate.getDate() + '</a>')) + '</td>'; // display selectable date
								printDate.setDate(printDate.getDate() + 1);
								printDate = this._daylightSavingAdjust(printDate);
							}
							calender += tbody + '</tr>';
						}
						drawMonth++;
						if (drawMonth > 11) {
							drawMonth = 0;
							drawYear++;
						}
						calender += '</tbody></table>' + (isMultiMonth ? '</div>' +
							((numMonths[0] > 0 && col == numMonths[1] - 1) ? '<div class="ui-datepicker-row-break"></div>' : '') : '');
						group += calender;
					}
					html += group;
				}
				html += buttonPanel + ($.browser.msie && parseInt($.browser.version, 10) < 7 && !inst.inline ?
					'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>' : '');
				inst._keyEvent = false;
				return html;
			},

			/* Generate the month and year header. */
			_generateMonthYearHeader: function(inst, drawMonth, drawYear, minDate, maxDate,
				secondary, monthNames, monthNamesShort) {
				var changeMonth = this._get(inst, 'changeMonth');
				var changeYear = this._get(inst, 'changeYear');
				var showMonthAfterYear = this._get(inst, 'showMonthAfterYear');
				var html = '<div class="ui-datepicker-title">';
				var monthHtml = '';
				// month selection
				if (secondary || !changeMonth)
					monthHtml += '<span class="ui-datepicker-month">' + monthNames[drawMonth] + '</span>';
				else {
					var inMinYear = (minDate && minDate.getFullYear() == drawYear);
					var inMaxYear = (maxDate && maxDate.getFullYear() == drawYear);
					monthHtml += '<select class="ui-datepicker-month" ' +
						'onchange="DP_jQuery_' + dpuuid + '.datepicker._selectMonthYear(\'#' + inst.id + '\', this, \'M\');" ' +
						'>';
					for (var month = 0; month < 12; month++) {
						if ((!inMinYear || month >= minDate.getMonth()) &&
							(!inMaxYear || month <= maxDate.getMonth()))
							monthHtml += '<option value="' + month + '"' +
								(month == drawMonth ? ' selected="selected"' : '') +
								'>' + monthNamesShort[month] + '</option>';
					}
					monthHtml += '</select>';
				}
				if (!showMonthAfterYear)
					html += monthHtml + (secondary || !(changeMonth && changeYear) ? '&#xa0;' : '');
				// year selection
				if (!inst.yearshtml) {
					inst.yearshtml = '';
					if (secondary || !changeYear)
						html += '<span class="ui-datepicker-year">' + drawYear + '</span>';
					else {
						// determine range of years to display
						var years = this._get(inst, 'yearRange').split(':');
						var thisYear = new Date().getFullYear();
						var determineYear = function(value) {
							var year = (value.match(/c[+-].*/) ? drawYear + parseInt(value.substring(1), 10) :
								(value.match(/[+-].*/) ? thisYear + parseInt(value, 10) :
									parseInt(value, 10)));
							return (isNaN(year) ? thisYear : year);
						};
						var year = determineYear(years[0]);
						var endYear = Math.max(year, determineYear(years[1] || ''));
						year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
						endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
						inst.yearshtml += '<select class="ui-datepicker-year" ' +
							'onchange="DP_jQuery_' + dpuuid + '.datepicker._selectMonthYear(\'#' + inst.id + '\', this, \'Y\');" ' +
							'>';
						for (; year <= endYear; year++) {
							inst.yearshtml += '<option value="' + year + '"' +
								(year == drawYear ? ' selected="selected"' : '') +
								'>' + year + '</option>';
						}
						inst.yearshtml += '</select>';

						html += inst.yearshtml;
						inst.yearshtml = null;
					}
				}
				html += this._get(inst, 'yearSuffix');
				if (showMonthAfterYear)
					html += (secondary || !(changeMonth && changeYear) ? '&#xa0;' : '') + monthHtml;
				html += '</div>'; // Close datepicker_header
				return html;
			},

			/* Adjust one of the date sub-fields. */
			_adjustInstDate: function(inst, offset, period) {
				var year = inst.drawYear + (period == 'Y' ? offset : 0);
				var month = inst.drawMonth + (period == 'M' ? offset : 0);
				var day = Math.min(inst.selectedDay, this._getDaysInMonth(year, month)) +
					(period == 'D' ? offset : 0);
				var date = this._restrictMinMax(inst,
					this._daylightSavingAdjust(new Date(year, month, day)));
				inst.selectedDay = date.getDate();
				inst.drawMonth = inst.selectedMonth = date.getMonth();
				inst.drawYear = inst.selectedYear = date.getFullYear();
				if (period == 'M' || period == 'Y')
					this._notifyChange(inst);
			},

			/* Ensure a date is within any min/max bounds. */
			_restrictMinMax: function(inst, date) {
				var minDate = this._getMinMaxDate(inst, 'min');
				var maxDate = this._getMinMaxDate(inst, 'max');
				var newDate = (minDate && date < minDate ? minDate : date);
				newDate = (maxDate && newDate > maxDate ? maxDate : newDate);
				return newDate;
			},

			/* Notify change of month/year. */
			_notifyChange: function(inst) {
				var onChange = this._get(inst, 'onChangeMonthYear');
				if (onChange)
					onChange.apply((inst.input ? inst.input[0] : null), [inst.selectedYear, inst.selectedMonth + 1, inst]);
			},

			/* Determine the number of months to show. */
			_getNumberOfMonths: function(inst) {
				var numMonths = this._get(inst, 'numberOfMonths');
				return (numMonths == null ? [1, 1] : (typeof numMonths == 'number' ? [1, numMonths] : numMonths));
			},

			/* Determine the current maximum date - ensure no time components are set. */
			_getMinMaxDate: function(inst, minMax) {
				return this._determineDate(inst, this._get(inst, minMax + 'Date'), null);
			},

			/* Find the number of days in a given month. */
			_getDaysInMonth: function(year, month) {
				return 32 - this._daylightSavingAdjust(new Date(year, month, 32)).getDate();
			},

			/* Find the day of the week of the first of a month. */
			_getFirstDayOfMonth: function(year, month) {
				return new Date(year, month, 1).getDay();
			},

			/* Determines if we should allow a "next/prev" month display change. */
			_canAdjustMonth: function(inst, offset, curYear, curMonth) {
				var numMonths = this._getNumberOfMonths(inst);
				var date = this._daylightSavingAdjust(new Date(curYear,
					curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]), 1));
				if (offset < 0)
					date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
				return this._isInRange(inst, date);
			},

			/* Is the given date in the accepted range? */
			_isInRange: function(inst, date) {
				var minDate = this._getMinMaxDate(inst, 'min');
				var maxDate = this._getMinMaxDate(inst, 'max');
				return ((!minDate || date.getTime() >= minDate.getTime()) &&
					(!maxDate || date.getTime() <= maxDate.getTime()));
			},

			/* Provide the configuration settings for formatting/parsing. */
			_getFormatConfig: function(inst) {
				var shortYearCutoff = this._get(inst, 'shortYearCutoff');
				shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff :
					new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
				return {
					shortYearCutoff: shortYearCutoff,
					dayNamesShort: this._get(inst, 'dayNamesShort'),
					dayNames: this._get(inst, 'dayNames'),
					monthNamesShort: this._get(inst, 'monthNamesShort'),
					monthNames: this._get(inst, 'monthNames')
				};
			},

			/* Format the given date for display. */
			_formatDate: function(inst, day, month, year) {
				if (!day) {
					inst.currentDay = inst.selectedDay;
					inst.currentMonth = inst.selectedMonth;
					inst.currentYear = inst.selectedYear;
				}
				var date = (day ? (typeof day == 'object' ? day :
						this._daylightSavingAdjust(new Date(year, month, day))) :
					this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
				return this.formatDate(this._get(inst, 'dateFormat'), date, this._getFormatConfig(inst));
			}
		});

		/*
		 * Bind hover events for datepicker elements.
		 * Done via delegate so the binding only occurs once in the lifetime of the parent div.
		 * Global instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
		 */

		function bindHover(dpDiv) {
			var selector = 'button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a';
			return dpDiv.bind('mouseout', function(event) {
				var elem = $(event.target).closest(selector);
				if (!elem.length) {
					return;
				}
				elem.removeClass("ui-state-hover ui-datepicker-prev-hover ui-datepicker-next-hover");
			})
				.bind('mouseover', function(event) {
					var elem = $(event.target).closest(selector);
					if ($.datepicker._isDisabledDatepicker(instActive.inline ? dpDiv.parent()[0] : instActive.input[0]) || !elem.length) {
						return;
					}
					elem.parents('.ui-datepicker-calendar').find('a').removeClass('ui-state-hover');
					elem.addClass('ui-state-hover');
					if (elem.hasClass('ui-datepicker-prev')) elem.addClass('ui-datepicker-prev-hover');
					if (elem.hasClass('ui-datepicker-next')) elem.addClass('ui-datepicker-next-hover');
				});
		}

		/* jQuery extend now ignores nulls! */

		function extendRemove(target, props) {
			$.extend(target, props);
			for (var name in props)
				if (props[name] == null || props[name] == undefined)
					target[name] = props[name];
			return target;
		};

		/* Determine whether an object is an array. */

		function isArray(a) {
			return (a && (($.browser.safari && typeof a == 'object' && a.length) ||
				(a.constructor && a.constructor.toString().match(/\Array\(\)/))));
		};

		/* Invoke the datepicker functionality.
   @param  options  string - a command, optionally followed by additional parameters or
                    Object - settings for attaching new datepicker functionality
   @return  jQuery object */
		$.fn.datepicker = function(options) {

			/* Verify an empty collection wasn't passed - Fixes #6976 */
			if (!this.length) {
				return this;
			}

			/* Initialise the date picker. */
			if (!$.datepicker.initialized) {
				$(document).mousedown($.datepicker._checkExternalClick).
				find('body').append($.datepicker.dpDiv);
				$.datepicker.initialized = true;
			}

			var otherArgs = Array.prototype.slice.call(arguments, 1);
			if (typeof options == 'string' && (options == 'isDisabled' || options == 'getDate' || options == 'widget'))
				return $.datepicker['_' + options + 'Datepicker'].
			apply($.datepicker, [this[0]].concat(otherArgs));
			if (options == 'option' && arguments.length == 2 && typeof arguments[1] == 'string')
				return $.datepicker['_' + options + 'Datepicker'].
			apply($.datepicker, [this[0]].concat(otherArgs));
			return this.each(function() {
				typeof options == 'string' ?
					$.datepicker['_' + options + 'Datepicker'].
				apply($.datepicker, [this].concat(otherArgs)) :
					$.datepicker._attachDatepicker(this, options);
			});
		};

		$.datepicker = new Datepicker(); // singleton instance
		$.datepicker.initialized = false;
		$.datepicker.uuid = new Date().getTime();
		$.datepicker.version = "1.8.18";

		// Workaround for #4055
		// Add another global to avoid noConflict issues with inline event handlers
		window['DP_jQuery_' + dpuuid] = $;
	})(jQuery);

	;(function(){
		$.datepicker.regional['zh-CN'] = {
			closeText: '关闭',
			prevText: '&#x3c;上月',
			nextText: '下月&#x3e;',
			currentText: '今天',
			monthNames: ['一月','二月','三月','四月','五月','六月',
			'七月','八月','九月','十月','十一月','十二月'],
			monthNamesShort: ['一','二','三','四','五','六',
			'七','八','九','十','十一','十二'],
			dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
			dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
			dayNamesMin: ['日','一','二','三','四','五','六'],
			weekHeader: '周',
			dateFormat: 'yy-mm-dd',
			firstDay: 1,
			isRTL: false,
			showMonthAfterYear: true,
			yearSuffix: '年'
		};
		$.datepicker.setDefaults($.datepicker.regional['zh-CN']);
	})();

	/*
	 * jQuery UI Slider Access
	 * By: Trent Richardson [http://trentrichardson.com]
	 * Version 0.3
	 * Last Modified: 10/20/2012
	 *
	 * Copyright 2011 Trent Richardson
	 * Dual licensed under the MIT and GPL licenses.
	 * http://trentrichardson.com/Impromptu/GPL-LICENSE.txt
	 * http://trentrichardson.com/Impromptu/MIT-LICENSE.txt
	 *
	 */
	;(function($) {
		$.fn.extend({
			sliderAccess: function(options) {
				options = options || {};
				options.touchonly = options.touchonly !== undefined ? options.touchonly : true; // by default only show it if touch device

				if (options.touchonly === true && !("ontouchend" in document)) {
					return $(this);
				}

				return $(this).each(function(i, obj) {
					var $t = $(this),
						o = $.extend({}, {
							where: 'after',
							step: $t.slider('option', 'step'),
							upIcon: 'ui-icon-plus',
							downIcon: 'ui-icon-minus',
							text: false,
							upText: '+',
							downText: '-',
							buttonset: true,
							buttonsetTag: 'span',
							isRTL: false
						}, options),
						$buttons = $('<' + o.buttonsetTag + ' class="ui-slider-access">' +
							'<button data-icon="' + o.downIcon + '" data-step="' + (o.isRTL ? o.step : o.step * -1) + '">' + o.downText + '</button>' +
							'<button data-icon="' + o.upIcon + '" data-step="' + (o.isRTL ? o.step * -1 : o.step) + '">' + o.upText + '</button>' +
							'</' + o.buttonsetTag + '>');

					$buttons.children('button').each(function(j, jobj) {
						var $jt = $(this);
						$jt.button({
							text: o.text,
							icons: {
								primary: $jt.data('icon')
							}
						})
							.click(function(e) {
								var step = $jt.data('step'),
									curr = $t.slider('value'),
									newval = curr += step * 1,
									minval = $t.slider('option', 'min'),
									maxval = $t.slider('option', 'max'),
									slidee = $t.slider("option", "slide") || function() {},
									stope = $t.slider("option", "stop") || function() {};

								e.preventDefault();

								if (newval < minval || newval > maxval) {
									return;
								}

								$t.slider('value', newval);

								slidee.call($t, null, {
									value: newval
								});
								stope.call($t, null, {
									value: newval
								});
							});
					});

					// before or after					
					$t[o.where]($buttons);

					if (o.buttonset) {
						$buttons.removeClass('ui-corner-right').removeClass('ui-corner-left').buttonset();
						$buttons.eq(0).addClass('ui-corner-left');
						$buttons.eq(1).addClass('ui-corner-right');
					}

					// adjust the width so we don't break the original layout
					var bOuterWidth = $buttons.css({
						marginLeft: ((o.where === 'after' && !o.isRTL) || (o.where === 'before' && o.isRTL) ? 10 : 0),
						marginRight: ((o.where === 'before' && !o.isRTL) || (o.where === 'after' && o.isRTL) ? 10 : 0)
					}).outerWidth(true) + 5;
					var tOuterWidth = $t.outerWidth(true);
					$t.css('display', 'inline-block').width(tOuterWidth - bOuterWidth);
				});
			}
		});
	})(jQuery);

	/*! jQuery Timepicker Addon - v1.4.1 - 2013-11-12
	 * http://trentrichardson.com/examples/timepicker
	 * Copyright (c) 2013 Trent Richardson; Licensed MIT */
	;(function($) {

		/*
		 * Lets not redefine timepicker, Prevent "Uncaught RangeError: Maximum call stack size exceeded"
		 */
		$.ui.timepicker = $.ui.timepicker || {};
		if ($.ui.timepicker.version) {
			return;
		}

		/*
		 * Extend jQueryUI, get it started with our version number
		 */
		$.extend($.ui, {
			timepicker: {
				version: "1.4.1"
			}
		});

		/* 
		 * Timepicker manager.
		 * Use the singleton instance of this class, $.timepicker, to interact with the time picker.
		 * Settings for (groups of) time pickers are maintained in an instance object,
		 * allowing multiple different settings on the same page.
		 */
		var Timepicker = function() {
			this.regional = []; // Available regional settings, indexed by language code
			this.regional[''] = { // Default regional settings
				currentText: 'Now',
				closeText: 'Done',
				amNames: ['AM', 'A'],
				pmNames: ['PM', 'P'],
				timeFormat: 'HH:mm',
				timeSuffix: '',
				timeOnlyTitle: 'Choose Time',
				timeText: 'Time',
				hourText: 'Hour',
				minuteText: 'Minute',
				secondText: 'Second',
				millisecText: 'Millisecond',
				microsecText: 'Microsecond',
				timezoneText: 'Time Zone',
				isRTL: false
			};
			this._defaults = { // Global defaults for all the datetime picker instances
				showButtonPanel: true,
				timeOnly: false,
				showHour: null,
				showMinute: null,
				showSecond: null,
				showMillisec: null,
				showMicrosec: null,
				showTimezone: null,
				showTime: true,
				stepHour: 1,
				stepMinute: 1,
				stepSecond: 1,
				stepMillisec: 1,
				stepMicrosec: 1,
				hour: 0,
				minute: 0,
				second: 0,
				millisec: 0,
				microsec: 0,
				timezone: null,
				hourMin: 0,
				minuteMin: 0,
				secondMin: 0,
				millisecMin: 0,
				microsecMin: 0,
				hourMax: 23,
				minuteMax: 59,
				secondMax: 59,
				millisecMax: 999,
				microsecMax: 999,
				minDateTime: null,
				maxDateTime: null,
				onSelect: null,
				hourGrid: 0,
				minuteGrid: 0,
				secondGrid: 0,
				millisecGrid: 0,
				microsecGrid: 0,
				alwaysSetTime: true,
				separator: ' ',
				altFieldTimeOnly: true,
				altTimeFormat: null,
				altSeparator: null,
				altTimeSuffix: null,
				pickerTimeFormat: null,
				pickerTimeSuffix: null,
				showTimepicker: true,
				timezoneList: null,
				addSliderAccess: false,
				sliderAccessArgs: null,
				controlType: 'slider',
				defaultValue: null,
				parse: 'strict'
			};
			$.extend(this._defaults, this.regional['']);
		};

		$.extend(Timepicker.prototype, {
			$input: null,
			$altInput: null,
			$timeObj: null,
			inst: null,
			hour_slider: null,
			minute_slider: null,
			second_slider: null,
			millisec_slider: null,
			microsec_slider: null,
			timezone_select: null,
			hour: 0,
			minute: 0,
			second: 0,
			millisec: 0,
			microsec: 0,
			timezone: null,
			hourMinOriginal: null,
			minuteMinOriginal: null,
			secondMinOriginal: null,
			millisecMinOriginal: null,
			microsecMinOriginal: null,
			hourMaxOriginal: null,
			minuteMaxOriginal: null,
			secondMaxOriginal: null,
			millisecMaxOriginal: null,
			microsecMaxOriginal: null,
			ampm: '',
			formattedDate: '',
			formattedTime: '',
			formattedDateTime: '',
			timezoneList: null,
			units: ['hour', 'minute', 'second', 'millisec', 'microsec'],
			support: {},
			control: null,

			/* 
			 * Override the default settings for all instances of the time picker.
			 * @param  {Object} settings  object - the new settings to use as defaults (anonymous object)
			 * @return {Object} the manager object
			 */
			setDefaults: function(settings) {
				extendRemove(this._defaults, settings || {});
				return this;
			},

			/*
			 * Create a new Timepicker instance
			 */
			_newInst: function($input, opts) {
				var tp_inst = new Timepicker(),
					inlineSettings = {},
					fns = {},
					overrides, i;

				for (var attrName in this._defaults) {
					if (this._defaults.hasOwnProperty(attrName)) {
						var attrValue = $input.attr('time:' + attrName);
						if (attrValue) {
							try {
								inlineSettings[attrName] = eval(attrValue);
							} catch (err) {
								inlineSettings[attrName] = attrValue;
							}
						}
					}
				}

				overrides = {
					beforeShow: function(input, dp_inst) {
						if ($.isFunction(tp_inst._defaults.evnts.beforeShow)) {
							return tp_inst._defaults.evnts.beforeShow.call($input[0], input, dp_inst, tp_inst);
						}
					},
					onChangeMonthYear: function(year, month, dp_inst) {
						// Update the time as well : this prevents the time from disappearing from the $input field.
						tp_inst._updateDateTime(dp_inst);
						if ($.isFunction(tp_inst._defaults.evnts.onChangeMonthYear)) {
							tp_inst._defaults.evnts.onChangeMonthYear.call($input[0], year, month, dp_inst, tp_inst);
						}
					},
					onClose: function(dateText, dp_inst) {
						if (tp_inst.timeDefined === true && $input.val() !== '') {
							tp_inst._updateDateTime(dp_inst);
						}
						if ($.isFunction(tp_inst._defaults.evnts.onClose)) {
							tp_inst._defaults.evnts.onClose.call($input[0], dateText, dp_inst, tp_inst);
						}
					}
				};
				for (i in overrides) {
					if (overrides.hasOwnProperty(i)) {
						fns[i] = opts[i] || null;
					}
				}

				tp_inst._defaults = $.extend({}, this._defaults, inlineSettings, opts, overrides, {
					evnts: fns,
					timepicker: tp_inst // add timepicker as a property of datepicker: $.datepicker._get(dp_inst, 'timepicker');
				});
				tp_inst.amNames = $.map(tp_inst._defaults.amNames, function(val) {
					return val.toUpperCase();
				});
				tp_inst.pmNames = $.map(tp_inst._defaults.pmNames, function(val) {
					return val.toUpperCase();
				});

				// detect which units are supported
				tp_inst.support = detectSupport(
					tp_inst._defaults.timeFormat +
					(tp_inst._defaults.pickerTimeFormat ? tp_inst._defaults.pickerTimeFormat : '') +
					(tp_inst._defaults.altTimeFormat ? tp_inst._defaults.altTimeFormat : ''));

				// controlType is string - key to our this._controls
				if (typeof(tp_inst._defaults.controlType) === 'string') {
					if (tp_inst._defaults.controlType === 'slider' && typeof($.ui.slider) === 'undefined') {
						tp_inst._defaults.controlType = 'select';
					}
					tp_inst.control = tp_inst._controls[tp_inst._defaults.controlType];
				}
				// controlType is an object and must implement create, options, value methods
				else {
					tp_inst.control = tp_inst._defaults.controlType;
				}

				// prep the timezone options
				var timezoneList = [-720, -660, -600, -570, -540, -480, -420, -360, -300, -270, -240, -210, -180, -120, -60,
					0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480, 525, 540, 570, 600, 630, 660, 690, 720, 765, 780, 840
				];
				if (tp_inst._defaults.timezoneList !== null) {
					timezoneList = tp_inst._defaults.timezoneList;
				}
				var tzl = timezoneList.length,
					tzi = 0,
					tzv = null;
				if (tzl > 0 && typeof timezoneList[0] !== 'object') {
					for (; tzi < tzl; tzi++) {
						tzv = timezoneList[tzi];
						timezoneList[tzi] = {
							value: tzv,
							label: $.timepicker.timezoneOffsetString(tzv, tp_inst.support.iso8601)
						};
					}
				}
				tp_inst._defaults.timezoneList = timezoneList;

				// set the default units
				tp_inst.timezone = tp_inst._defaults.timezone !== null ? $.timepicker.timezoneOffsetNumber(tp_inst._defaults.timezone) :
					((new Date()).getTimezoneOffset() * -1);
				tp_inst.hour = tp_inst._defaults.hour < tp_inst._defaults.hourMin ? tp_inst._defaults.hourMin :
					tp_inst._defaults.hour > tp_inst._defaults.hourMax ? tp_inst._defaults.hourMax : tp_inst._defaults.hour;
				tp_inst.minute = tp_inst._defaults.minute < tp_inst._defaults.minuteMin ? tp_inst._defaults.minuteMin :
					tp_inst._defaults.minute > tp_inst._defaults.minuteMax ? tp_inst._defaults.minuteMax : tp_inst._defaults.minute;
				tp_inst.second = tp_inst._defaults.second < tp_inst._defaults.secondMin ? tp_inst._defaults.secondMin :
					tp_inst._defaults.second > tp_inst._defaults.secondMax ? tp_inst._defaults.secondMax : tp_inst._defaults.second;
				tp_inst.millisec = tp_inst._defaults.millisec < tp_inst._defaults.millisecMin ? tp_inst._defaults.millisecMin :
					tp_inst._defaults.millisec > tp_inst._defaults.millisecMax ? tp_inst._defaults.millisecMax : tp_inst._defaults.millisec;
				tp_inst.microsec = tp_inst._defaults.microsec < tp_inst._defaults.microsecMin ? tp_inst._defaults.microsecMin :
					tp_inst._defaults.microsec > tp_inst._defaults.microsecMax ? tp_inst._defaults.microsecMax : tp_inst._defaults.microsec;
				tp_inst.ampm = '';
				tp_inst.$input = $input;

				if (tp_inst._defaults.altField) {
					tp_inst.$altInput = $(tp_inst._defaults.altField).css({
						cursor: 'pointer'
					}).focus(function() {
						$input.trigger("focus");
					});
				}

				if (tp_inst._defaults.minDate === 0 || tp_inst._defaults.minDateTime === 0) {
					tp_inst._defaults.minDate = new Date();
				}
				if (tp_inst._defaults.maxDate === 0 || tp_inst._defaults.maxDateTime === 0) {
					tp_inst._defaults.maxDate = new Date();
				}

				// datepicker needs minDate/maxDate, timepicker needs minDateTime/maxDateTime..
				if (tp_inst._defaults.minDate !== undefined && tp_inst._defaults.minDate instanceof Date) {
					tp_inst._defaults.minDateTime = new Date(tp_inst._defaults.minDate.getTime());
				}
				if (tp_inst._defaults.minDateTime !== undefined && tp_inst._defaults.minDateTime instanceof Date) {
					tp_inst._defaults.minDate = new Date(tp_inst._defaults.minDateTime.getTime());
				}
				if (tp_inst._defaults.maxDate !== undefined && tp_inst._defaults.maxDate instanceof Date) {
					tp_inst._defaults.maxDateTime = new Date(tp_inst._defaults.maxDate.getTime());
				}
				if (tp_inst._defaults.maxDateTime !== undefined && tp_inst._defaults.maxDateTime instanceof Date) {
					tp_inst._defaults.maxDate = new Date(tp_inst._defaults.maxDateTime.getTime());
				}
				tp_inst.$input.bind('focus', function() {
					tp_inst._onFocus();
				});

				return tp_inst;
			},

			/*
			 * add our sliders to the calendar
			 */
			_addTimePicker: function(dp_inst) {
				var currDT = (this.$altInput && this._defaults.altFieldTimeOnly) ? this.$input.val() + ' ' + this.$altInput.val() : this.$input.val();

				this.timeDefined = this._parseTime(currDT);
				this._limitMinMaxDateTime(dp_inst, false);
				this._injectTimePicker();
			},

			/*
			 * parse the time string from input value or _setTime
			 */
			_parseTime: function(timeString, withDate) {
				if (!this.inst) {
					this.inst = $.datepicker._getInst(this.$input[0]);
				}

				if (withDate || !this._defaults.timeOnly) {
					var dp_dateFormat = $.datepicker._get(this.inst, 'dateFormat');
					try {
						var parseRes = parseDateTimeInternal(dp_dateFormat, this._defaults.timeFormat, timeString, $.datepicker._getFormatConfig(this.inst), this._defaults);
						if (!parseRes.timeObj) {
							return false;
						}
						$.extend(this, parseRes.timeObj);
					} catch (err) {
						$.timepicker.log("Error parsing the date/time string: " + err +
							"\ndate/time string = " + timeString +
							"\ntimeFormat = " + this._defaults.timeFormat +
							"\ndateFormat = " + dp_dateFormat);
						return false;
					}
					return true;
				} else {
					var timeObj = $.datepicker.parseTime(this._defaults.timeFormat, timeString, this._defaults);
					if (!timeObj) {
						return false;
					}
					$.extend(this, timeObj);
					return true;
				}
			},

			/*
			 * generate and inject html for timepicker into ui datepicker
			 */
			_injectTimePicker: function() {
				var $dp = this.inst.dpDiv,
					o = this.inst.settings,
					tp_inst = this,
					litem = '',
					uitem = '',
					show = null,
					max = {},
					gridSize = {},
					size = null,
					i = 0,
					l = 0;

				// Prevent displaying twice
				if ($dp.find("div.ui-timepicker-div").length === 0 && o.showTimepicker) {
					var noDisplay = ' style="display:none;"',
						html = '<div class="ui-timepicker-div' + (o.isRTL ? ' ui-timepicker-rtl' : '') + '"><dl>' + '<dt class="ui_tpicker_time_label"' + ((o.showTime) ? '' : noDisplay) + '>' + o.timeText + '</dt>' +
							'<dd class="ui_tpicker_time"' + ((o.showTime) ? '' : noDisplay) + '></dd>';

					// Create the markup
					for (i = 0, l = this.units.length; i < l; i++) {
						litem = this.units[i];
						uitem = litem.substr(0, 1).toUpperCase() + litem.substr(1);
						show = o['show' + uitem] !== null ? o['show' + uitem] : this.support[litem];

						// Added by Peter Medeiros:
						// - Figure out what the hour/minute/second max should be based on the step values.
						// - Example: if stepMinute is 15, then minMax is 45.
						max[litem] = parseInt((o[litem + 'Max'] - ((o[litem + 'Max'] - o[litem + 'Min']) % o['step' + uitem])), 10);
						gridSize[litem] = 0;

						html += '<dt class="ui_tpicker_' + litem + '_label"' + (show ? '' : noDisplay) + '>' + o[litem + 'Text'] + '</dt>' +
							'<dd class="ui_tpicker_' + litem + '"><div class="ui_tpicker_' + litem + '_slider"' + (show ? '' : noDisplay) + '></div>';

						if (show && o[litem + 'Grid'] > 0) {
							html += '<div style="padding-left: 1px"><table class="ui-tpicker-grid-label"><tr>';

							if (litem === 'hour') {
								for (var h = o[litem + 'Min']; h <= max[litem]; h += parseInt(o[litem + 'Grid'], 10)) {
									gridSize[litem]++;
									var tmph = $.datepicker.formatTime(this.support.ampm ? 'hht' : 'HH', {
										hour: h
									}, o);
									html += '<td data-for="' + litem + '">' + tmph + '</td>';
								}
							} else {
								for (var m = o[litem + 'Min']; m <= max[litem]; m += parseInt(o[litem + 'Grid'], 10)) {
									gridSize[litem]++;
									html += '<td data-for="' + litem + '">' + ((m < 10) ? '0' : '') + m + '</td>';
								}
							}

							html += '</tr></table></div>';
						}
						html += '</dd>';
					}

					// Timezone
					var showTz = o.showTimezone !== null ? o.showTimezone : this.support.timezone;
					html += '<dt class="ui_tpicker_timezone_label"' + (showTz ? '' : noDisplay) + '>' + o.timezoneText + '</dt>';
					html += '<dd class="ui_tpicker_timezone" ' + (showTz ? '' : noDisplay) + '></dd>';

					// Create the elements from string
					html += '</dl></div>';
					var $tp = $(html);

					// if we only want time picker...
					if (o.timeOnly === true) {
						$tp.prepend('<div class="ui-widget-header ui-helper-clearfix ui-corner-all">' + '<div class="ui-datepicker-title">' + o.timeOnlyTitle + '</div>' + '</div>');
						$dp.find('.ui-datepicker-header, .ui-datepicker-calendar').hide();
					}

					// add sliders, adjust grids, add events
					for (i = 0, l = tp_inst.units.length; i < l; i++) {
						litem = tp_inst.units[i];
						uitem = litem.substr(0, 1).toUpperCase() + litem.substr(1);
						show = o['show' + uitem] !== null ? o['show' + uitem] : this.support[litem];

						// add the slider
						tp_inst[litem + '_slider'] = tp_inst.control.create(tp_inst, $tp.find('.ui_tpicker_' + litem + '_slider'), litem, tp_inst[litem], o[litem + 'Min'], max[litem], o['step' + uitem]);

						// adjust the grid and add click event
						if (show && o[litem + 'Grid'] > 0) {
							size = 100 * gridSize[litem] * o[litem + 'Grid'] / (max[litem] - o[litem + 'Min']);
							$tp.find('.ui_tpicker_' + litem + ' table').css({
								width: size + "%",
								marginLeft: o.isRTL ? '0' : ((size / (-2 * gridSize[litem])) + "%"),
								marginRight: o.isRTL ? ((size / (-2 * gridSize[litem])) + "%") : '0',
								borderCollapse: 'collapse'
							}).find("td").click(function(e) {
								var $t = $(this),
									h = $t.html(),
									n = parseInt(h.replace(/[^0-9]/g), 10),
									ap = h.replace(/[^apm]/ig),
									f = $t.data('for'); // loses scope, so we use data-for

								if (f === 'hour') {
									if (ap.indexOf('p') !== -1 && n < 12) {
										n += 12;
									} else {
										if (ap.indexOf('a') !== -1 && n === 12) {
											n = 0;
										}
									}
								}

								tp_inst.control.value(tp_inst, tp_inst[f + '_slider'], litem, n);

								tp_inst._onTimeChange();
								tp_inst._onSelectHandler();
							}).css({
								cursor: 'pointer',
								width: (100 / gridSize[litem]) + '%',
								textAlign: 'center',
								overflow: 'hidden'
							});
						} // end if grid > 0
					} // end for loop

					// Add timezone options
					this.timezone_select = $tp.find('.ui_tpicker_timezone').append('<select></select>').find("select");
					$.fn.append.apply(this.timezone_select,
						$.map(o.timezoneList, function(val, idx) {
							return $("<option />").val(typeof val === "object" ? val.value : val).text(typeof val === "object" ? val.label : val);
						}));
					if (typeof(this.timezone) !== "undefined" && this.timezone !== null && this.timezone !== "") {
						var local_timezone = (new Date(this.inst.selectedYear, this.inst.selectedMonth, this.inst.selectedDay, 12)).getTimezoneOffset() * -1;
						if (local_timezone === this.timezone) {
							selectLocalTimezone(tp_inst);
						} else {
							this.timezone_select.val(this.timezone);
						}
					} else {
						if (typeof(this.hour) !== "undefined" && this.hour !== null && this.hour !== "") {
							this.timezone_select.val(o.timezone);
						} else {
							selectLocalTimezone(tp_inst);
						}
					}
					this.timezone_select.change(function() {
						tp_inst._onTimeChange();
						tp_inst._onSelectHandler();
					});
					// End timezone options

					// inject timepicker into datepicker
					var $buttonPanel = $dp.find('.ui-datepicker-buttonpane');
					if ($buttonPanel.length) {
						$buttonPanel.before($tp);
					} else {
						$dp.append($tp);
					}

					this.$timeObj = $tp.find('.ui_tpicker_time');

					if (this.inst !== null) {
						var timeDefined = this.timeDefined;
						this._onTimeChange();
						this.timeDefined = timeDefined;
					}

					// slideAccess integration: http://trentrichardson.com/2011/11/11/jquery-ui-sliders-and-touch-accessibility/
					if (this._defaults.addSliderAccess) {
						var sliderAccessArgs = this._defaults.sliderAccessArgs,
							rtl = this._defaults.isRTL;
						sliderAccessArgs.isRTL = rtl;

						setTimeout(function() { // fix for inline mode
							if ($tp.find('.ui-slider-access').length === 0) {
								$tp.find('.ui-slider:visible').sliderAccess(sliderAccessArgs);

								// fix any grids since sliders are shorter
								var sliderAccessWidth = $tp.find('.ui-slider-access:eq(0)').outerWidth(true);
								if (sliderAccessWidth) {
									$tp.find('table:visible').each(function() {
										var $g = $(this),
											oldWidth = $g.outerWidth(),
											oldMarginLeft = $g.css(rtl ? 'marginRight' : 'marginLeft').toString().replace('%', ''),
											newWidth = oldWidth - sliderAccessWidth,
											newMarginLeft = ((oldMarginLeft * newWidth) / oldWidth) + '%',
											css = {
												width: newWidth,
												marginRight: 0,
												marginLeft: 0
											};
										css[rtl ? 'marginRight' : 'marginLeft'] = newMarginLeft;
										$g.css(css);
									});
								}
							}
						}, 10);
					}
					// end slideAccess integration

					tp_inst._limitMinMaxDateTime(this.inst, true);
				}
			},

			/*
			 * This function tries to limit the ability to go outside the
			 * min/max date range
			 */
			_limitMinMaxDateTime: function(dp_inst, adjustSliders) {
				var o = this._defaults,
					dp_date = new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay);

				if (!this._defaults.showTimepicker) {
					return;
				} // No time so nothing to check here

				if ($.datepicker._get(dp_inst, 'minDateTime') !== null && $.datepicker._get(dp_inst, 'minDateTime') !== undefined && dp_date) {
					var minDateTime = $.datepicker._get(dp_inst, 'minDateTime'),
						minDateTimeDate = new Date(minDateTime.getFullYear(), minDateTime.getMonth(), minDateTime.getDate(), 0, 0, 0, 0);

					if (this.hourMinOriginal === null || this.minuteMinOriginal === null || this.secondMinOriginal === null || this.millisecMinOriginal === null || this.microsecMinOriginal === null) {
						this.hourMinOriginal = o.hourMin;
						this.minuteMinOriginal = o.minuteMin;
						this.secondMinOriginal = o.secondMin;
						this.millisecMinOriginal = o.millisecMin;
						this.microsecMinOriginal = o.microsecMin;
					}

					if (dp_inst.settings.timeOnly || minDateTimeDate.getTime() === dp_date.getTime()) {
						this._defaults.hourMin = minDateTime.getHours();
						if (this.hour <= this._defaults.hourMin) {
							this.hour = this._defaults.hourMin;
							this._defaults.minuteMin = minDateTime.getMinutes();
							if (this.minute <= this._defaults.minuteMin) {
								this.minute = this._defaults.minuteMin;
								this._defaults.secondMin = minDateTime.getSeconds();
								if (this.second <= this._defaults.secondMin) {
									this.second = this._defaults.secondMin;
									this._defaults.millisecMin = minDateTime.getMilliseconds();
									if (this.millisec <= this._defaults.millisecMin) {
										this.millisec = this._defaults.millisecMin;
										this._defaults.microsecMin = minDateTime.getMicroseconds();
									} else {
										if (this.microsec < this._defaults.microsecMin) {
											this.microsec = this._defaults.microsecMin;
										}
										this._defaults.microsecMin = this.microsecMinOriginal;
									}
								} else {
									this._defaults.millisecMin = this.millisecMinOriginal;
									this._defaults.microsecMin = this.microsecMinOriginal;
								}
							} else {
								this._defaults.secondMin = this.secondMinOriginal;
								this._defaults.millisecMin = this.millisecMinOriginal;
								this._defaults.microsecMin = this.microsecMinOriginal;
							}
						} else {
							this._defaults.minuteMin = this.minuteMinOriginal;
							this._defaults.secondMin = this.secondMinOriginal;
							this._defaults.millisecMin = this.millisecMinOriginal;
							this._defaults.microsecMin = this.microsecMinOriginal;
						}
					} else {
						this._defaults.hourMin = this.hourMinOriginal;
						this._defaults.minuteMin = this.minuteMinOriginal;
						this._defaults.secondMin = this.secondMinOriginal;
						this._defaults.millisecMin = this.millisecMinOriginal;
						this._defaults.microsecMin = this.microsecMinOriginal;
					}
				}

				if ($.datepicker._get(dp_inst, 'maxDateTime') !== null && $.datepicker._get(dp_inst, 'maxDateTime') !== undefined && dp_date) {
					var maxDateTime = $.datepicker._get(dp_inst, 'maxDateTime'),
						maxDateTimeDate = new Date(maxDateTime.getFullYear(), maxDateTime.getMonth(), maxDateTime.getDate(), 0, 0, 0, 0);

					if (this.hourMaxOriginal === null || this.minuteMaxOriginal === null || this.secondMaxOriginal === null || this.millisecMaxOriginal === null) {
						this.hourMaxOriginal = o.hourMax;
						this.minuteMaxOriginal = o.minuteMax;
						this.secondMaxOriginal = o.secondMax;
						this.millisecMaxOriginal = o.millisecMax;
						this.microsecMaxOriginal = o.microsecMax;
					}

					if (dp_inst.settings.timeOnly || maxDateTimeDate.getTime() === dp_date.getTime()) {
						this._defaults.hourMax = maxDateTime.getHours();
						if (this.hour >= this._defaults.hourMax) {
							this.hour = this._defaults.hourMax;
							this._defaults.minuteMax = maxDateTime.getMinutes();
							if (this.minute >= this._defaults.minuteMax) {
								this.minute = this._defaults.minuteMax;
								this._defaults.secondMax = maxDateTime.getSeconds();
								if (this.second >= this._defaults.secondMax) {
									this.second = this._defaults.secondMax;
									this._defaults.millisecMax = maxDateTime.getMilliseconds();
									if (this.millisec >= this._defaults.millisecMax) {
										this.millisec = this._defaults.millisecMax;
										this._defaults.microsecMax = maxDateTime.getMicroseconds();
									} else {
										if (this.microsec > this._defaults.microsecMax) {
											this.microsec = this._defaults.microsecMax;
										}
										this._defaults.microsecMax = this.microsecMaxOriginal;
									}
								} else {
									this._defaults.millisecMax = this.millisecMaxOriginal;
									this._defaults.microsecMax = this.microsecMaxOriginal;
								}
							} else {
								this._defaults.secondMax = this.secondMaxOriginal;
								this._defaults.millisecMax = this.millisecMaxOriginal;
								this._defaults.microsecMax = this.microsecMaxOriginal;
							}
						} else {
							this._defaults.minuteMax = this.minuteMaxOriginal;
							this._defaults.secondMax = this.secondMaxOriginal;
							this._defaults.millisecMax = this.millisecMaxOriginal;
							this._defaults.microsecMax = this.microsecMaxOriginal;
						}
					} else {
						this._defaults.hourMax = this.hourMaxOriginal;
						this._defaults.minuteMax = this.minuteMaxOriginal;
						this._defaults.secondMax = this.secondMaxOriginal;
						this._defaults.millisecMax = this.millisecMaxOriginal;
						this._defaults.microsecMax = this.microsecMaxOriginal;
					}
				}

				if (adjustSliders !== undefined && adjustSliders === true) {
					var hourMax = parseInt((this._defaults.hourMax - ((this._defaults.hourMax - this._defaults.hourMin) % this._defaults.stepHour)), 10),
						minMax = parseInt((this._defaults.minuteMax - ((this._defaults.minuteMax - this._defaults.minuteMin) % this._defaults.stepMinute)), 10),
						secMax = parseInt((this._defaults.secondMax - ((this._defaults.secondMax - this._defaults.secondMin) % this._defaults.stepSecond)), 10),
						millisecMax = parseInt((this._defaults.millisecMax - ((this._defaults.millisecMax - this._defaults.millisecMin) % this._defaults.stepMillisec)), 10),
						microsecMax = parseInt((this._defaults.microsecMax - ((this._defaults.microsecMax - this._defaults.microsecMin) % this._defaults.stepMicrosec)), 10);

					if (this.hour_slider) {
						this.control.options(this, this.hour_slider, 'hour', {
							min: this._defaults.hourMin,
							max: hourMax
						});
						this.control.value(this, this.hour_slider, 'hour', this.hour - (this.hour % this._defaults.stepHour));
					}
					if (this.minute_slider) {
						this.control.options(this, this.minute_slider, 'minute', {
							min: this._defaults.minuteMin,
							max: minMax
						});
						this.control.value(this, this.minute_slider, 'minute', this.minute - (this.minute % this._defaults.stepMinute));
					}
					if (this.second_slider) {
						this.control.options(this, this.second_slider, 'second', {
							min: this._defaults.secondMin,
							max: secMax
						});
						this.control.value(this, this.second_slider, 'second', this.second - (this.second % this._defaults.stepSecond));
					}
					if (this.millisec_slider) {
						this.control.options(this, this.millisec_slider, 'millisec', {
							min: this._defaults.millisecMin,
							max: millisecMax
						});
						this.control.value(this, this.millisec_slider, 'millisec', this.millisec - (this.millisec % this._defaults.stepMillisec));
					}
					if (this.microsec_slider) {
						this.control.options(this, this.microsec_slider, 'microsec', {
							min: this._defaults.microsecMin,
							max: microsecMax
						});
						this.control.value(this, this.microsec_slider, 'microsec', this.microsec - (this.microsec % this._defaults.stepMicrosec));
					}
				}

			},

			/*
			 * when a slider moves, set the internal time...
			 * on time change is also called when the time is updated in the text field
			 */
			_onTimeChange: function() {
				if (!this._defaults.showTimepicker) {
					return;
				}
				var hour = (this.hour_slider) ? this.control.value(this, this.hour_slider, 'hour') : false,
					minute = (this.minute_slider) ? this.control.value(this, this.minute_slider, 'minute') : false,
					second = (this.second_slider) ? this.control.value(this, this.second_slider, 'second') : false,
					millisec = (this.millisec_slider) ? this.control.value(this, this.millisec_slider, 'millisec') : false,
					microsec = (this.microsec_slider) ? this.control.value(this, this.microsec_slider, 'microsec') : false,
					timezone = (this.timezone_select) ? this.timezone_select.val() : false,
					o = this._defaults,
					pickerTimeFormat = o.pickerTimeFormat || o.timeFormat,
					pickerTimeSuffix = o.pickerTimeSuffix || o.timeSuffix;

				if (typeof(hour) === 'object') {
					hour = false;
				}
				if (typeof(minute) === 'object') {
					minute = false;
				}
				if (typeof(second) === 'object') {
					second = false;
				}
				if (typeof(millisec) === 'object') {
					millisec = false;
				}
				if (typeof(microsec) === 'object') {
					microsec = false;
				}
				if (typeof(timezone) === 'object') {
					timezone = false;
				}

				if (hour !== false) {
					hour = parseInt(hour, 10);
				}
				if (minute !== false) {
					minute = parseInt(minute, 10);
				}
				if (second !== false) {
					second = parseInt(second, 10);
				}
				if (millisec !== false) {
					millisec = parseInt(millisec, 10);
				}
				if (microsec !== false) {
					microsec = parseInt(microsec, 10);
				}
				if (timezone !== false) {
					timezone = parseInt(timezone, 10);
				}

				var ampm = o[hour < 12 ? 'amNames' : 'pmNames'][0];

				// If the update was done in the input field, the input field should not be updated.
				// If the update was done using the sliders, update the input field.
				var hasChanged = (hour !== this.hour || minute !== this.minute || second !== this.second || millisec !== this.millisec || microsec !== this.microsec ||
					(this.ampm.length > 0 && (hour < 12) !== ($.inArray(this.ampm.toUpperCase(), this.amNames) !== -1)) || (this.timezone !== null && timezone !== this.timezone));

				if (hasChanged) {

					if (hour !== false) {
						this.hour = hour;
					}
					if (minute !== false) {
						this.minute = minute;
					}
					if (second !== false) {
						this.second = second;
					}
					if (millisec !== false) {
						this.millisec = millisec;
					}
					if (microsec !== false) {
						this.microsec = microsec;
					}
					if (timezone !== false) {
						this.timezone = timezone;
					}

					if (!this.inst) {
						this.inst = $.datepicker._getInst(this.$input[0]);
					}

					this._limitMinMaxDateTime(this.inst, true);
				}
				if (this.support.ampm) {
					this.ampm = ampm;
				}

				// Updates the time within the timepicker
				this.formattedTime = $.datepicker.formatTime(o.timeFormat, this, o);
				if (this.$timeObj) {
					if (pickerTimeFormat === o.timeFormat) {
						this.$timeObj.text(this.formattedTime + pickerTimeSuffix);
					} else {
						this.$timeObj.text($.datepicker.formatTime(pickerTimeFormat, this, o) + pickerTimeSuffix);
					}
				}

				this.timeDefined = true;
				if (hasChanged) {
					this._updateDateTime();
				}
			},

			/*
			 * call custom onSelect.
			 * bind to sliders slidestop, and grid click.
			 */
			_onSelectHandler: function() {
				var onSelect = this._defaults.onSelect || this.inst.settings.onSelect;
				var inputEl = this.$input ? this.$input[0] : null;
				if (onSelect && inputEl) {
					onSelect.apply(inputEl, [this.formattedDateTime, this]);
				}
			},

			/*
			 * update our input with the new date time..
			 */
			_updateDateTime: function(dp_inst) {
				dp_inst = this.inst || dp_inst;
				var dtTmp = (dp_inst.currentYear > 0 ?
					new Date(dp_inst.currentYear, dp_inst.currentMonth, dp_inst.currentDay) :
					new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay)),
					dt = $.datepicker._daylightSavingAdjust(dtTmp),
					//dt = $.datepicker._daylightSavingAdjust(new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay)),
					//dt = $.datepicker._daylightSavingAdjust(new Date(dp_inst.currentYear, dp_inst.currentMonth, dp_inst.currentDay)),
					dateFmt = $.datepicker._get(dp_inst, 'dateFormat'),
					formatCfg = $.datepicker._getFormatConfig(dp_inst),
					timeAvailable = dt !== null && this.timeDefined;
				this.formattedDate = $.datepicker.formatDate(dateFmt, (dt === null ? new Date() : dt), formatCfg);
				var formattedDateTime = this.formattedDate;

				// if a slider was changed but datepicker doesn't have a value yet, set it
				if (dp_inst.lastVal === "") {
					dp_inst.currentYear = dp_inst.selectedYear;
					dp_inst.currentMonth = dp_inst.selectedMonth;
					dp_inst.currentDay = dp_inst.selectedDay;
				}

				/*
				 * remove following lines to force every changes in date picker to change the input value
				 * Bug descriptions: when an input field has a default value, and click on the field to pop up the date picker.
				 * If the user manually empty the value in the input field, the date picker will never change selected value.
				 */
				//if (dp_inst.lastVal !== undefined && (dp_inst.lastVal.length > 0 && this.$input.val().length === 0)) {
				//	return;
				//}

				if (this._defaults.timeOnly === true) {
					formattedDateTime = this.formattedTime;
				} else if (this._defaults.timeOnly !== true && (this._defaults.alwaysSetTime || timeAvailable)) {
					formattedDateTime += this._defaults.separator + this.formattedTime + this._defaults.timeSuffix;
				}

				this.formattedDateTime = formattedDateTime;

				if (!this._defaults.showTimepicker) {
					this.$input.val(this.formattedDate);
				} else if (this.$altInput && this._defaults.timeOnly === false && this._defaults.altFieldTimeOnly === true) {
					this.$altInput.val(this.formattedTime);
					this.$input.val(this.formattedDate);
				} else if (this.$altInput) {
					this.$input.val(formattedDateTime);
					var altFormattedDateTime = '',
						altSeparator = this._defaults.altSeparator ? this._defaults.altSeparator : this._defaults.separator,
						altTimeSuffix = this._defaults.altTimeSuffix ? this._defaults.altTimeSuffix : this._defaults.timeSuffix;

					if (!this._defaults.timeOnly) {
						if (this._defaults.altFormat) {
							altFormattedDateTime = $.datepicker.formatDate(this._defaults.altFormat, (dt === null ? new Date() : dt), formatCfg);
						} else {
							altFormattedDateTime = this.formattedDate;
						}

						if (altFormattedDateTime) {
							altFormattedDateTime += altSeparator;
						}
					}

					if (this._defaults.altTimeFormat) {
						altFormattedDateTime += $.datepicker.formatTime(this._defaults.altTimeFormat, this, this._defaults) + altTimeSuffix;
					} else {
						altFormattedDateTime += this.formattedTime + altTimeSuffix;
					}
					this.$altInput.val(altFormattedDateTime);
				} else {
					this.$input.val(formattedDateTime);
				}

				this.$input.trigger("change");
			},

			_onFocus: function() {
				if (!this.$input.val() && this._defaults.defaultValue) {
					this.$input.val(this._defaults.defaultValue);
					var inst = $.datepicker._getInst(this.$input.get(0)),
						tp_inst = $.datepicker._get(inst, 'timepicker');
					if (tp_inst) {
						if (tp_inst._defaults.timeOnly && (inst.input.val() !== inst.lastVal)) {
							try {
								$.datepicker._updateDatepicker(inst);
							} catch (err) {
								$.timepicker.log(err);
							}
						}
					}
				}
			},

			/*
			 * Small abstraction to control types
			 * We can add more, just be sure to follow the pattern: create, options, value
			 */
			_controls: {
				// slider methods
				slider: {
					create: function(tp_inst, obj, unit, val, min, max, step) {
						var rtl = tp_inst._defaults.isRTL; // if rtl go -60->0 instead of 0->60
						return obj.prop('slide', null).slider({
							orientation: "horizontal",
							value: rtl ? val * -1 : val,
							min: rtl ? max * -1 : min,
							max: rtl ? min * -1 : max,
							step: step,
							slide: function(event, ui) {
								tp_inst.control.value(tp_inst, $(this), unit, rtl ? ui.value * -1 : ui.value);
								tp_inst._onTimeChange();
							},
							stop: function(event, ui) {
								tp_inst._onSelectHandler();
							}
						});
					},
					options: function(tp_inst, obj, unit, opts, val) {
						if (tp_inst._defaults.isRTL) {
							if (typeof(opts) === 'string') {
								if (opts === 'min' || opts === 'max') {
									if (val !== undefined) {
										return obj.slider(opts, val * -1);
									}
									return Math.abs(obj.slider(opts));
								}
								return obj.slider(opts);
							}
							var min = opts.min,
								max = opts.max;
							opts.min = opts.max = null;
							if (min !== undefined) {
								opts.max = min * -1;
							}
							if (max !== undefined) {
								opts.min = max * -1;
							}
							return obj.slider(opts);
						}
						if (typeof(opts) === 'string' && val !== undefined) {
							return obj.slider(opts, val);
						}
						return obj.slider(opts);
					},
					value: function(tp_inst, obj, unit, val) {
						if (tp_inst._defaults.isRTL) {
							if (val !== undefined) {
								return obj.slider('value', val * -1);
							}
							return Math.abs(obj.slider('value'));
						}
						if (val !== undefined) {
							return obj.slider('value', val);
						}
						return obj.slider('value');
					}
				},
				// select methods
				select: {
					create: function(tp_inst, obj, unit, val, min, max, step) {
						var sel = '<select class="ui-timepicker-select" data-unit="' + unit + '" data-min="' + min + '" data-max="' + max + '" data-step="' + step + '">',
							format = tp_inst._defaults.pickerTimeFormat || tp_inst._defaults.timeFormat;

						for (var i = min; i <= max; i += step) {
							sel += '<option value="' + i + '"' + (i === val ? ' selected' : '') + '>';
							if (unit === 'hour') {
								sel += $.datepicker.formatTime($.trim(format.replace(/[^ht ]/ig, '')), {
									hour: i
								}, tp_inst._defaults);
							} else if (unit === 'millisec' || unit === 'microsec' || i >= 10) {
								sel += i;
							} else {
								sel += '0' + i.toString();
							}
							sel += '</option>';
						}
						sel += '</select>';

						obj.children('select').remove();

						$(sel).appendTo(obj).change(function(e) {
							tp_inst._onTimeChange();
							tp_inst._onSelectHandler();
						});

						return obj;
					},
					options: function(tp_inst, obj, unit, opts, val) {
						var o = {},
							$t = obj.children('select');
						if (typeof(opts) === 'string') {
							if (val === undefined) {
								return $t.data(opts);
							}
							o[opts] = val;
						} else {
							o = opts;
						}
						return tp_inst.control.create(tp_inst, obj, $t.data('unit'), $t.val(), o.min || $t.data('min'), o.max || $t.data('max'), o.step || $t.data('step'));
					},
					value: function(tp_inst, obj, unit, val) {
						var $t = obj.children('select');
						if (val !== undefined) {
							return $t.val(val);
						}
						return $t.val();
					}
				}
			} // end _controls

		});

		$.fn.extend({
			/*
			 * shorthand just to use timepicker.
			 */
			timepicker: function(o) {
				o = o || {};
				var tmp_args = Array.prototype.slice.call(arguments);

				if (typeof o === 'object') {
					tmp_args[0] = $.extend(o, {
						timeOnly: true
					});
				}

				return $(this).each(function() {
					$.fn.datetimepicker.apply($(this), tmp_args);
				});
			},

			/*
			 * extend timepicker to datepicker
			 */
			datetimepicker: function(o) {
				o = o || {};
				var tmp_args = arguments;

				if (typeof(o) === 'string') {
					if (o === 'getDate') {
						return $.fn.datepicker.apply($(this[0]), tmp_args);
					} else {
						return this.each(function() {
							var $t = $(this);
							$t.datepicker.apply($t, tmp_args);
						});
					}
				} else {
					return this.each(function() {
						var $t = $(this);
						$t.datepicker($.timepicker._newInst($t, o)._defaults);
					});
				}
			}
		});

		/*
		 * Public Utility to parse date and time
		 */
		$.datepicker.parseDateTime = function(dateFormat, timeFormat, dateTimeString, dateSettings, timeSettings) {
			var parseRes = parseDateTimeInternal(dateFormat, timeFormat, dateTimeString, dateSettings, timeSettings);
			if (parseRes.timeObj) {
				var t = parseRes.timeObj;
				parseRes.date.setHours(t.hour, t.minute, t.second, t.millisec);
				parseRes.date.setMicroseconds(t.microsec);
			}

			return parseRes.date;
		};

		/*
		 * Public utility to parse time
		 */
		$.datepicker.parseTime = function(timeFormat, timeString, options) {
			var o = extendRemove(extendRemove({}, $.timepicker._defaults), options || {}),
				iso8601 = (timeFormat.replace(/\'.*?\'/g, '').indexOf('Z') !== -1);

			// Strict parse requires the timeString to match the timeFormat exactly
			var strictParse = function(f, s, o) {

				// pattern for standard and localized AM/PM markers
				var getPatternAmpm = function(amNames, pmNames) {
					var markers = [];
					if (amNames) {
						$.merge(markers, amNames);
					}
					if (pmNames) {
						$.merge(markers, pmNames);
					}
					markers = $.map(markers, function(val) {
						return val.replace(/[.*+?|()\[\]{}\\]/g, '\\$&');
					});
					return '(' + markers.join('|') + ')?';
				};

				// figure out position of time elements.. cause js cant do named captures
				var getFormatPositions = function(timeFormat) {
					var finds = timeFormat.toLowerCase().match(/(h{1,2}|m{1,2}|s{1,2}|l{1}|c{1}|t{1,2}|z|'.*?')/g),
						orders = {
							h: -1,
							m: -1,
							s: -1,
							l: -1,
							c: -1,
							t: -1,
							z: -1
						};

					if (finds) {
						for (var i = 0; i < finds.length; i++) {
							if (orders[finds[i].toString().charAt(0)] === -1) {
								orders[finds[i].toString().charAt(0)] = i + 1;
							}
						}
					}
					return orders;
				};

				var regstr = '^' + f.toString()
					.replace(/([hH]{1,2}|mm?|ss?|[tT]{1,2}|[zZ]|[lc]|'.*?')/g, function(match) {
						var ml = match.length;
						switch (match.charAt(0).toLowerCase()) {
							case 'h':
								return ml === 1 ? '(\\d?\\d)' : '(\\d{' + ml + '})';
							case 'm':
								return ml === 1 ? '(\\d?\\d)' : '(\\d{' + ml + '})';
							case 's':
								return ml === 1 ? '(\\d?\\d)' : '(\\d{' + ml + '})';
							case 'l':
								return '(\\d?\\d?\\d)';
							case 'c':
								return '(\\d?\\d?\\d)';
							case 'z':
								return '(z|[-+]\\d\\d:?\\d\\d|\\S+)?';
							case 't':
								return getPatternAmpm(o.amNames, o.pmNames);
							default: // literal escaped in quotes
								return '(' + match.replace(/\'/g, "").replace(/(\.|\$|\^|\\|\/|\(|\)|\[|\]|\?|\+|\*)/g, function(m) {
									return "\\" + m;
								}) + ')?';
						}
					})
					.replace(/\s/g, '\\s?') +
					o.timeSuffix + '$',
					order = getFormatPositions(f),
					ampm = '',
					treg;

				treg = s.match(new RegExp(regstr, 'i'));

				var resTime = {
					hour: 0,
					minute: 0,
					second: 0,
					millisec: 0,
					microsec: 0
				};

				if (treg) {
					if (order.t !== -1) {
						if (treg[order.t] === undefined || treg[order.t].length === 0) {
							ampm = '';
							resTime.ampm = '';
						} else {
							ampm = $.inArray(treg[order.t].toUpperCase(), o.amNames) !== -1 ? 'AM' : 'PM';
							resTime.ampm = o[ampm === 'AM' ? 'amNames' : 'pmNames'][0];
						}
					}

					if (order.h !== -1) {
						if (ampm === 'AM' && treg[order.h] === '12') {
							resTime.hour = 0; // 12am = 0 hour
						} else {
							if (ampm === 'PM' && treg[order.h] !== '12') {
								resTime.hour = parseInt(treg[order.h], 10) + 12; // 12pm = 12 hour, any other pm = hour + 12
							} else {
								resTime.hour = Number(treg[order.h]);
							}
						}
					}

					if (order.m !== -1) {
						resTime.minute = Number(treg[order.m]);
					}
					if (order.s !== -1) {
						resTime.second = Number(treg[order.s]);
					}
					if (order.l !== -1) {
						resTime.millisec = Number(treg[order.l]);
					}
					if (order.c !== -1) {
						resTime.microsec = Number(treg[order.c]);
					}
					if (order.z !== -1 && treg[order.z] !== undefined) {
						resTime.timezone = $.timepicker.timezoneOffsetNumber(treg[order.z]);
					}


					return resTime;
				}
				return false;
			}; // end strictParse

			// First try JS Date, if that fails, use strictParse
			var looseParse = function(f, s, o) {
				try {
					var d = new Date('2012-01-01 ' + s);
					if (isNaN(d.getTime())) {
						d = new Date('2012-01-01T' + s);
						if (isNaN(d.getTime())) {
							d = new Date('01/01/2012 ' + s);
							if (isNaN(d.getTime())) {
								throw "Unable to parse time with native Date: " + s;
							}
						}
					}

					return {
						hour: d.getHours(),
						minute: d.getMinutes(),
						second: d.getSeconds(),
						millisec: d.getMilliseconds(),
						microsec: d.getMicroseconds(),
						timezone: d.getTimezoneOffset() * -1
					};
				} catch (err) {
					try {
						return strictParse(f, s, o);
					} catch (err2) {
						$.timepicker.log("Unable to parse \ntimeString: " + s + "\ntimeFormat: " + f);
					}
				}
				return false;
			}; // end looseParse

			if (typeof o.parse === "function") {
				return o.parse(timeFormat, timeString, o);
			}
			if (o.parse === 'loose') {
				return looseParse(timeFormat, timeString, o);
			}
			return strictParse(timeFormat, timeString, o);
		};

		/**
		 * Public utility to format the time
		 * @param {string} format format of the time
		 * @param {Object} time Object not a Date for timezones
		 * @param {Object} [options] essentially the regional[].. amNames, pmNames, ampm
		 * @returns {string} the formatted time
		 */
		$.datepicker.formatTime = function(format, time, options) {
			options = options || {};
			options = $.extend({}, $.timepicker._defaults, options);
			time = $.extend({
				hour: 0,
				minute: 0,
				second: 0,
				millisec: 0,
				microsec: 0,
				timezone: null
			}, time);

			var tmptime = format,
				ampmName = options.amNames[0],
				hour = parseInt(time.hour, 10);

			if (hour > 11) {
				ampmName = options.pmNames[0];
			}

			tmptime = tmptime.replace(/(?:HH?|hh?|mm?|ss?|[tT]{1,2}|[zZ]|[lc]|'.*?')/g, function(match) {
				switch (match) {
					case 'HH':
						return ('0' + hour).slice(-2);
					case 'H':
						return hour;
					case 'hh':
						return ('0' + convert24to12(hour)).slice(-2);
					case 'h':
						return convert24to12(hour);
					case 'mm':
						return ('0' + time.minute).slice(-2);
					case 'm':
						return time.minute;
					case 'ss':
						return ('0' + time.second).slice(-2);
					case 's':
						return time.second;
					case 'l':
						return ('00' + time.millisec).slice(-3);
					case 'c':
						return ('00' + time.microsec).slice(-3);
					case 'z':
						return $.timepicker.timezoneOffsetString(time.timezone === null ? options.timezone : time.timezone, false);
					case 'Z':
						return $.timepicker.timezoneOffsetString(time.timezone === null ? options.timezone : time.timezone, true);
					case 'T':
						return ampmName.charAt(0).toUpperCase();
					case 'TT':
						return ampmName.toUpperCase();
					case 't':
						return ampmName.charAt(0).toLowerCase();
					case 'tt':
						return ampmName.toLowerCase();
					default:
						return match.replace(/'/g, "");
				}
			});

			return tmptime;
		};

		/*
	* the bad hack :/ override datepicker so it doesn't close on select
	// inspired: http://stackoverflow.com/questions/1252512/jquery-datepicker-prevent-closing-picker-when-clicking-a-date/1762378#1762378
	*/
		$.datepicker._base_selectDate = $.datepicker._selectDate;
		$.datepicker._selectDate = function(id, dateStr) {
			var inst = this._getInst($(id)[0]),
				tp_inst = this._get(inst, 'timepicker');

			if (tp_inst) {
				tp_inst._limitMinMaxDateTime(inst, true);
				inst.inline = inst.stay_open = true;
				//This way the onSelect handler called from calendarpicker get the full dateTime
				this._base_selectDate(id, dateStr);
				inst.inline = inst.stay_open = false;
				this._notifyChange(inst);
				this._updateDatepicker(inst);
			} else {
				this._base_selectDate(id, dateStr);
			}
		};

		/*
		 * second bad hack :/ override datepicker so it triggers an event when changing the input field
		 * and does not redraw the datepicker on every selectDate event
		 */
		$.datepicker._base_updateDatepicker = $.datepicker._updateDatepicker;
		$.datepicker._updateDatepicker = function(inst) {

			// don't popup the datepicker if there is another instance already opened
			var input = inst.input[0];
			if ($.datepicker._curInst && $.datepicker._curInst !== inst && $.datepicker._datepickerShowing && $.datepicker._lastInput !== input) {
				return;
			}

			if (typeof(inst.stay_open) !== 'boolean' || inst.stay_open === false) {

				this._base_updateDatepicker(inst);

				// Reload the time control when changing something in the input text field.
				var tp_inst = this._get(inst, 'timepicker');
				if (tp_inst) {
					tp_inst._addTimePicker(inst);
				}
			}
		};

		/*
		 * third bad hack :/ override datepicker so it allows spaces and colon in the input field
		 */
		$.datepicker._base_doKeyPress = $.datepicker._doKeyPress;
		$.datepicker._doKeyPress = function(event) {
			var inst = $.datepicker._getInst(event.target),
				tp_inst = $.datepicker._get(inst, 'timepicker');

			if (tp_inst) {
				if ($.datepicker._get(inst, 'constrainInput')) {
					var ampm = tp_inst.support.ampm,
						tz = tp_inst._defaults.showTimezone !== null ? tp_inst._defaults.showTimezone : tp_inst.support.timezone,
						dateChars = $.datepicker._possibleChars($.datepicker._get(inst, 'dateFormat')),
						datetimeChars = tp_inst._defaults.timeFormat.toString()
							.replace(/[hms]/g, '')
							.replace(/TT/g, ampm ? 'APM' : '')
							.replace(/Tt/g, ampm ? 'AaPpMm' : '')
							.replace(/tT/g, ampm ? 'AaPpMm' : '')
							.replace(/T/g, ampm ? 'AP' : '')
							.replace(/tt/g, ampm ? 'apm' : '')
							.replace(/t/g, ampm ? 'ap' : '') +
							" " + tp_inst._defaults.separator +
							tp_inst._defaults.timeSuffix +
							(tz ? tp_inst._defaults.timezoneList.join('') : '') +
							(tp_inst._defaults.amNames.join('')) + (tp_inst._defaults.pmNames.join('')) +
							dateChars,
						chr = String.fromCharCode(event.charCode === undefined ? event.keyCode : event.charCode);
					return event.ctrlKey || (chr < ' ' || !dateChars || datetimeChars.indexOf(chr) > -1);
				}
			}

			return $.datepicker._base_doKeyPress(event);
		};

		/*
		 * Fourth bad hack :/ override _updateAlternate function used in inline mode to init altField
		 * Update any alternate field to synchronise with the main field.
		 */
		$.datepicker._base_updateAlternate = $.datepicker._updateAlternate;
		$.datepicker._updateAlternate = function(inst) {
			var tp_inst = this._get(inst, 'timepicker');
			if (tp_inst) {
				var altField = tp_inst._defaults.altField;
				if (altField) { // update alternate field too
					var altFormat = tp_inst._defaults.altFormat || tp_inst._defaults.dateFormat,
						date = this._getDate(inst),
						formatCfg = $.datepicker._getFormatConfig(inst),
						altFormattedDateTime = '',
						altSeparator = tp_inst._defaults.altSeparator ? tp_inst._defaults.altSeparator : tp_inst._defaults.separator,
						altTimeSuffix = tp_inst._defaults.altTimeSuffix ? tp_inst._defaults.altTimeSuffix : tp_inst._defaults.timeSuffix,
						altTimeFormat = tp_inst._defaults.altTimeFormat !== null ? tp_inst._defaults.altTimeFormat : tp_inst._defaults.timeFormat;

					altFormattedDateTime += $.datepicker.formatTime(altTimeFormat, tp_inst, tp_inst._defaults) + altTimeSuffix;
					if (!tp_inst._defaults.timeOnly && !tp_inst._defaults.altFieldTimeOnly && date !== null) {
						if (tp_inst._defaults.altFormat) {
							altFormattedDateTime = $.datepicker.formatDate(tp_inst._defaults.altFormat, date, formatCfg) + altSeparator + altFormattedDateTime;
						} else {
							altFormattedDateTime = tp_inst.formattedDate + altSeparator + altFormattedDateTime;
						}
					}
					$(altField).val(altFormattedDateTime);
				}
			} else {
				$.datepicker._base_updateAlternate(inst);
			}
		};

		/*
		 * Override key up event to sync manual input changes.
		 */
		$.datepicker._base_doKeyUp = $.datepicker._doKeyUp;
		$.datepicker._doKeyUp = function(event) {
			var inst = $.datepicker._getInst(event.target),
				tp_inst = $.datepicker._get(inst, 'timepicker');

			if (tp_inst) {
				if (tp_inst._defaults.timeOnly && (inst.input.val() !== inst.lastVal)) {
					try {
						$.datepicker._updateDatepicker(inst);
					} catch (err) {
						$.timepicker.log(err);
					}
				}
			}

			return $.datepicker._base_doKeyUp(event);
		};

		/*
		 * override "Today" button to also grab the time.
		 */
		$.datepicker._base_gotoToday = $.datepicker._gotoToday;
		$.datepicker._gotoToday = function(id) {
			var inst = this._getInst($(id)[0]),
				$dp = inst.dpDiv;
			this._base_gotoToday(id);
			var tp_inst = this._get(inst, 'timepicker');
			selectLocalTimezone(tp_inst);
			var now = new Date();
			this._setTime(inst, now);
			$('.ui-datepicker-today', $dp).click();
		};

		/*
		 * Disable & enable the Time in the datetimepicker
		 */
		$.datepicker._disableTimepickerDatepicker = function(target) {
			var inst = this._getInst(target);
			if (!inst) {
				return;
			}

			var tp_inst = this._get(inst, 'timepicker');
			$(target).datepicker('getDate'); // Init selected[Year|Month|Day]
			if (tp_inst) {
				inst.settings.showTimepicker = false;
				tp_inst._defaults.showTimepicker = false;
				tp_inst._updateDateTime(inst);
			}
		};

		$.datepicker._enableTimepickerDatepicker = function(target) {
			var inst = this._getInst(target);
			if (!inst) {
				return;
			}

			var tp_inst = this._get(inst, 'timepicker');
			$(target).datepicker('getDate'); // Init selected[Year|Month|Day]
			if (tp_inst) {
				inst.settings.showTimepicker = true;
				tp_inst._defaults.showTimepicker = true;
				tp_inst._addTimePicker(inst); // Could be disabled on page load
				tp_inst._updateDateTime(inst);
			}
		};

		/*
		 * Create our own set time function
		 */
		$.datepicker._setTime = function(inst, date) {
			var tp_inst = this._get(inst, 'timepicker');
			if (tp_inst) {
				var defaults = tp_inst._defaults;

				// calling _setTime with no date sets time to defaults
				tp_inst.hour = date ? date.getHours() : defaults.hour;
				tp_inst.minute = date ? date.getMinutes() : defaults.minute;
				tp_inst.second = date ? date.getSeconds() : defaults.second;
				tp_inst.millisec = date ? date.getMilliseconds() : defaults.millisec;
				tp_inst.microsec = date ? date.getMicroseconds() : defaults.microsec;

				//check if within min/max times.. 
				tp_inst._limitMinMaxDateTime(inst, true);

				tp_inst._onTimeChange();
				tp_inst._updateDateTime(inst);
			}
		};

		/*
		 * Create new public method to set only time, callable as $().datepicker('setTime', date)
		 */
		$.datepicker._setTimeDatepicker = function(target, date, withDate) {
			var inst = this._getInst(target);
			if (!inst) {
				return;
			}

			var tp_inst = this._get(inst, 'timepicker');

			if (tp_inst) {
				this._setDateFromField(inst);
				var tp_date;
				if (date) {
					if (typeof date === "string") {
						tp_inst._parseTime(date, withDate);
						tp_date = new Date();
						tp_date.setHours(tp_inst.hour, tp_inst.minute, tp_inst.second, tp_inst.millisec);
						tp_date.setMicroseconds(tp_inst.microsec);
					} else {
						tp_date = new Date(date.getTime());
						tp_date.setMicroseconds(date.getMicroseconds());
					}
					if (tp_date.toString() === 'Invalid Date') {
						tp_date = undefined;
					}
					this._setTime(inst, tp_date);
				}
			}

		};

		/*
		 * override setDate() to allow setting time too within Date object
		 */
		$.datepicker._base_setDateDatepicker = $.datepicker._setDateDatepicker;
		$.datepicker._setDateDatepicker = function(target, date) {
			var inst = this._getInst(target);
			if (!inst) {
				return;
			}

			if (typeof(date) === 'string') {
				date = new Date(date);
				if (!date.getTime()) {
					$.timepicker.log("Error creating Date object from string.");
				}
			}

			var tp_inst = this._get(inst, 'timepicker');
			var tp_date;
			if (date instanceof Date) {
				tp_date = new Date(date.getTime());
				tp_date.setMicroseconds(date.getMicroseconds());
			} else {
				tp_date = date;
			}

			// This is important if you are using the timezone option, javascript's Date 
			// object will only return the timezone offset for the current locale, so we 
			// adjust it accordingly.  If not using timezone option this won't matter..
			// If a timezone is different in tp, keep the timezone as is
			if (tp_inst) {
				// look out for DST if tz wasn't specified
				if (!tp_inst.support.timezone && tp_inst._defaults.timezone === null) {
					tp_inst.timezone = tp_date.getTimezoneOffset() * -1;
				}
				date = $.timepicker.timezoneAdjust(date, tp_inst.timezone);
				tp_date = $.timepicker.timezoneAdjust(tp_date, tp_inst.timezone);
			}

			this._updateDatepicker(inst);
			this._base_setDateDatepicker.apply(this, arguments);
			this._setTimeDatepicker(target, tp_date, true);
		};

		/*
		 * override getDate() to allow getting time too within Date object
		 */
		$.datepicker._base_getDateDatepicker = $.datepicker._getDateDatepicker;
		$.datepicker._getDateDatepicker = function(target, noDefault) {
			var inst = this._getInst(target);
			if (!inst) {
				return;
			}

			var tp_inst = this._get(inst, 'timepicker');

			if (tp_inst) {
				// if it hasn't yet been defined, grab from field
				if (inst.lastVal === undefined) {
					this._setDateFromField(inst, noDefault);
				}

				var date = this._getDate(inst);
				if (date && tp_inst._parseTime($(target).val(), tp_inst.timeOnly)) {
					date.setHours(tp_inst.hour, tp_inst.minute, tp_inst.second, tp_inst.millisec);
					date.setMicroseconds(tp_inst.microsec);

					// This is important if you are using the timezone option, javascript's Date 
					// object will only return the timezone offset for the current locale, so we 
					// adjust it accordingly.  If not using timezone option this won't matter..
					if (tp_inst.timezone != null) {
						// look out for DST if tz wasn't specified
						if (!tp_inst.support.timezone && tp_inst._defaults.timezone === null) {
							tp_inst.timezone = date.getTimezoneOffset() * -1;
						}
						date = $.timepicker.timezoneAdjust(date, tp_inst.timezone);
					}
				}
				return date;
			}
			return this._base_getDateDatepicker(target, noDefault);
		};

		/*
		 * override parseDate() because UI 1.8.14 throws an error about "Extra characters"
		 * An option in datapicker to ignore extra format characters would be nicer.
		 */
		$.datepicker._base_parseDate = $.datepicker.parseDate;
		$.datepicker.parseDate = function(format, value, settings) {
			var date;
			try {
				date = this._base_parseDate(format, value, settings);
			} catch (err) {
				// Hack!  The error message ends with a colon, a space, and
				// the "extra" characters.  We rely on that instead of
				// attempting to perfectly reproduce the parsing algorithm.
				if (err.indexOf(":") >= 0) {
					date = this._base_parseDate(format, value.substring(0, value.length - (err.length - err.indexOf(':') - 2)), settings);
					// $.timepicker.log("Error parsing the date string: " + err + "\ndate string = " + value + "\ndate format = " + format);
				} else {
					throw err;
				}
			}
			return date;
		};

		/*
		 * override formatDate to set date with time to the input
		 */
		$.datepicker._base_formatDate = $.datepicker._formatDate;
		$.datepicker._formatDate = function(inst, day, month, year) {
			var tp_inst = this._get(inst, 'timepicker');
			if (tp_inst) {
				tp_inst._updateDateTime(inst);
				return tp_inst.$input.val();
			}
			return this._base_formatDate(inst);
		};

		/*
		 * override options setter to add time to maxDate(Time) and minDate(Time). MaxDate
		 */
		$.datepicker._base_optionDatepicker = $.datepicker._optionDatepicker;
		$.datepicker._optionDatepicker = function(target, name, value) {
			var inst = this._getInst(target),
				name_clone;
			if (!inst) {
				return null;
			}

			var tp_inst = this._get(inst, 'timepicker');
			if (tp_inst) {
				var min = null,
					max = null,
					onselect = null,
					overrides = tp_inst._defaults.evnts,
					fns = {},
					prop;
				if (typeof name === 'string') { // if min/max was set with the string
					if (name === 'minDate' || name === 'minDateTime') {
						min = value;
					} else if (name === 'maxDate' || name === 'maxDateTime') {
						max = value;
					} else if (name === 'onSelect') {
						onselect = value;
					} else if (overrides.hasOwnProperty(name)) {
						if (typeof(value) === 'undefined') {
							return overrides[name];
						}
						fns[name] = value;
						name_clone = {}; //empty results in exiting function after overrides updated
					}
				} else if (typeof name === 'object') { //if min/max was set with the JSON
					if (name.minDate) {
						min = name.minDate;
					} else if (name.minDateTime) {
						min = name.minDateTime;
					} else if (name.maxDate) {
						max = name.maxDate;
					} else if (name.maxDateTime) {
						max = name.maxDateTime;
					}
					for (prop in overrides) {
						if (overrides.hasOwnProperty(prop) && name[prop]) {
							fns[prop] = name[prop];
						}
					}
				}
				for (prop in fns) {
					if (fns.hasOwnProperty(prop)) {
						overrides[prop] = fns[prop];
						if (!name_clone) {
							name_clone = $.extend({}, name);
						}
						delete name_clone[prop];
					}
				}
				if (name_clone && isEmptyObject(name_clone)) {
					return;
				}
				if (min) { //if min was set
					if (min === 0) {
						min = new Date();
					} else {
						min = new Date(min);
					}
					tp_inst._defaults.minDate = min;
					tp_inst._defaults.minDateTime = min;
				} else if (max) { //if max was set
					if (max === 0) {
						max = new Date();
					} else {
						max = new Date(max);
					}
					tp_inst._defaults.maxDate = max;
					tp_inst._defaults.maxDateTime = max;
				} else if (onselect) {
					tp_inst._defaults.onSelect = onselect;
				}
			}
			if (value === undefined) {
				return this._base_optionDatepicker.call($.datepicker, target, name);
			}
			return this._base_optionDatepicker.call($.datepicker, target, name_clone || name, value);
		};

		/*
		 * jQuery isEmptyObject does not check hasOwnProperty - if someone has added to the object prototype,
		 * it will return false for all objects
		 */
		var isEmptyObject = function(obj) {
			var prop;
			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					return false;
				}
			}
			return true;
		};

		/*
		 * jQuery extend now ignores nulls!
		 */
		var extendRemove = function(target, props) {
			$.extend(target, props);
			for (var name in props) {
				if (props[name] === null || props[name] === undefined) {
					target[name] = props[name];
				}
			}
			return target;
		};

		/*
		 * Determine by the time format which units are supported
		 * Returns an object of booleans for each unit
		 */
		var detectSupport = function(timeFormat) {
			var tf = timeFormat.replace(/'.*?'/g, '').toLowerCase(), // removes literals
				isIn = function(f, t) { // does the format contain the token?
					return f.indexOf(t) !== -1 ? true : false;
				};
			return {
				hour: isIn(tf, 'h'),
				minute: isIn(tf, 'm'),
				second: isIn(tf, 's'),
				millisec: isIn(tf, 'l'),
				microsec: isIn(tf, 'c'),
				timezone: isIn(tf, 'z'),
				ampm: isIn(tf, 't') && isIn(timeFormat, 'h'),
				iso8601: isIn(timeFormat, 'Z')
			};
		};

		/*
		 * Converts 24 hour format into 12 hour
		 * Returns 12 hour without leading 0
		 */
		var convert24to12 = function(hour) {
			hour %= 12;

			if (hour === 0) {
				hour = 12;
			}

			return String(hour);
		};

		var computeEffectiveSetting = function(settings, property) {
			return settings && settings[property] ? settings[property] : $.timepicker._defaults[property];
		};

		/*
		 * Splits datetime string into date and time substrings.
		 * Throws exception when date can't be parsed
		 * Returns {dateString: dateString, timeString: timeString}
		 */
		var splitDateTime = function(dateTimeString, timeSettings) {
			// The idea is to get the number separator occurrences in datetime and the time format requested (since time has
			// fewer unknowns, mostly numbers and am/pm). We will use the time pattern to split.
			var separator = computeEffectiveSetting(timeSettings, 'separator'),
				format = computeEffectiveSetting(timeSettings, 'timeFormat'),
				timeParts = format.split(separator), // how many occurrences of separator may be in our format?
				timePartsLen = timeParts.length,
				allParts = dateTimeString.split(separator),
				allPartsLen = allParts.length;

			if (allPartsLen > 1) {
				return {
					dateString: allParts.splice(0, allPartsLen - timePartsLen).join(separator),
					timeString: allParts.splice(0, timePartsLen).join(separator)
				};
			}

			return {
				dateString: dateTimeString,
				timeString: ''
			};
		};

		/*
		 * Internal function to parse datetime interval
		 * Returns: {date: Date, timeObj: Object}, where
		 *   date - parsed date without time (type Date)
		 *   timeObj = {hour: , minute: , second: , millisec: , microsec: } - parsed time. Optional
		 */
		var parseDateTimeInternal = function(dateFormat, timeFormat, dateTimeString, dateSettings, timeSettings) {
			var date,
				parts,
				parsedTime;

			parts = splitDateTime(dateTimeString, timeSettings);
			date = $.datepicker._base_parseDate(dateFormat, parts.dateString, dateSettings);

			if (parts.timeString === '') {
				return {
					date: date
				};
			}

			parsedTime = $.datepicker.parseTime(timeFormat, parts.timeString, timeSettings);

			if (!parsedTime) {
				throw 'Wrong time format';
			}

			return {
				date: date,
				timeObj: parsedTime
			};
		};

		/*
		 * Internal function to set timezone_select to the local timezone
		 */
		var selectLocalTimezone = function(tp_inst, date) {
			if (tp_inst && tp_inst.timezone_select) {
				var now = date || new Date();
				tp_inst.timezone_select.val(-now.getTimezoneOffset());
			}
		};

		/*
		 * Create a Singleton Instance
		 */
		$.timepicker = new Timepicker();

		/**
		 * Get the timezone offset as string from a date object (eg '+0530' for UTC+5.5)
		 * @param {number} tzMinutes if not a number, less than -720 (-1200), or greater than 840 (+1400) this value is returned
		 * @param {boolean} iso8601 if true formats in accordance to iso8601 "+12:45"
		 * @return {string}
		 */
		$.timepicker.timezoneOffsetString = function(tzMinutes, iso8601) {
			if (isNaN(tzMinutes) || tzMinutes > 840 || tzMinutes < -720) {
				return tzMinutes;
			}

			var off = tzMinutes,
				minutes = off % 60,
				hours = (off - minutes) / 60,
				iso = iso8601 ? ':' : '',
				tz = (off >= 0 ? '+' : '-') + ('0' + Math.abs(hours)).slice(-2) + iso + ('0' + Math.abs(minutes)).slice(-2);

			if (tz === '+00:00') {
				return 'Z';
			}
			return tz;
		};

		/**
		 * Get the number in minutes that represents a timezone string
		 * @param  {string} tzString formatted like "+0500", "-1245", "Z"
		 * @return {number} the offset minutes or the original string if it doesn't match expectations
		 */
		$.timepicker.timezoneOffsetNumber = function(tzString) {
			var normalized = tzString.toString().replace(':', ''); // excuse any iso8601, end up with "+1245"

			if (normalized.toUpperCase() === 'Z') { // if iso8601 with Z, its 0 minute offset
				return 0;
			}

			if (!/^(\-|\+)\d{4}$/.test(normalized)) { // possibly a user defined tz, so just give it back
				return tzString;
			}

			return ((normalized.substr(0, 1) === '-' ? -1 : 1) * // plus or minus
				((parseInt(normalized.substr(1, 2), 10) * 60) + // hours (converted to minutes)
					parseInt(normalized.substr(3, 2), 10))); // minutes
		};

		/**
		 * No way to set timezone in js Date, so we must adjust the minutes to compensate. (think setDate, getDate)
		 * @param  {Date} date
		 * @param  {string} toTimezone formatted like "+0500", "-1245"
		 * @return {Date}
		 */
		$.timepicker.timezoneAdjust = function(date, toTimezone) {
			var toTz = $.timepicker.timezoneOffsetNumber(toTimezone);
			if (!isNaN(toTz)) {
				date.setMinutes(date.getMinutes() + -date.getTimezoneOffset() - toTz);
			}
			return date;
		};

		/**
		 * Calls `timepicker()` on the `startTime` and `endTime` elements, and configures them to
		 * enforce date range limits.
		 * n.b. The input value must be correctly formatted (reformatting is not supported)
		 * @param  {Element} startTime
		 * @param  {Element} endTime
		 * @param  {Object} options Options for the timepicker() call
		 * @return {jQuery}
		 */
		$.timepicker.timeRange = function(startTime, endTime, options) {
			return $.timepicker.handleRange('timepicker', startTime, endTime, options);
		};

		/**
		 * Calls `datetimepicker` on the `startTime` and `endTime` elements, and configures them to
		 * enforce date range limits.
		 * @param  {Element} startTime
		 * @param  {Element} endTime
		 * @param  {Object} options Options for the `timepicker()` call. Also supports `reformat`,
		 *   a boolean value that can be used to reformat the input values to the `dateFormat`.
		 * @param  {string} method Can be used to specify the type of picker to be added
		 * @return {jQuery}
		 */
		$.timepicker.datetimeRange = function(startTime, endTime, options) {
			$.timepicker.handleRange('datetimepicker', startTime, endTime, options);
		};

		/**
		 * Calls `datepicker` on the `startTime` and `endTime` elements, and configures them to
		 * enforce date range limits.
		 * @param  {Element} startTime
		 * @param  {Element} endTime
		 * @param  {Object} options Options for the `timepicker()` call. Also supports `reformat`,
		 *   a boolean value that can be used to reformat the input values to the `dateFormat`.
		 * @return {jQuery}
		 */
		$.timepicker.dateRange = function(startTime, endTime, options) {
			$.timepicker.handleRange('datepicker', startTime, endTime, options);
		};

		/**
		 * Calls `method` on the `startTime` and `endTime` elements, and configures them to
		 * enforce date range limits.
		 * @param  {string} method Can be used to specify the type of picker to be added
		 * @param  {Element} startTime
		 * @param  {Element} endTime
		 * @param  {Object} options Options for the `timepicker()` call. Also supports `reformat`,
		 *   a boolean value that can be used to reformat the input values to the `dateFormat`.
		 * @return {jQuery}
		 */
		$.timepicker.handleRange = function(method, startTime, endTime, options) {
			options = $.extend({}, {
				minInterval: 0, // min allowed interval in milliseconds
				maxInterval: 0, // max allowed interval in milliseconds
				start: {}, // options for start picker
				end: {} // options for end picker
			}, options);

			function checkDates(changed, other) {
				var startdt = startTime[method]('getDate'),
					enddt = endTime[method]('getDate'),
					changeddt = changed[method]('getDate');

				if (startdt !== null) {
					var minDate = new Date(startdt.getTime()),
						maxDate = new Date(startdt.getTime());

					minDate.setMilliseconds(minDate.getMilliseconds() + options.minInterval);
					maxDate.setMilliseconds(maxDate.getMilliseconds() + options.maxInterval);

					if (options.minInterval > 0 && minDate > enddt) { // minInterval check
						endTime[method]('setDate', minDate);
					} else if (options.maxInterval > 0 && maxDate < enddt) { // max interval check
						endTime[method]('setDate', maxDate);
					} else if (startdt > enddt) {
						other[method]('setDate', changeddt);
					}
				}
			}

			function selected(changed, other, option) {
				if (!changed.val()) {
					return;
				}
				var date = changed[method].call(changed, 'getDate');
				if (date !== null && options.minInterval > 0) {
					if (option === 'minDate') {
						date.setMilliseconds(date.getMilliseconds() + options.minInterval);
					}
					if (option === 'maxDate') {
						date.setMilliseconds(date.getMilliseconds() - options.minInterval);
					}
				}
				if (date.getTime) {
					other[method].call(other, 'option', option, date);
				}
			}

			$.fn[method].call(startTime, $.extend({
				onClose: function(dateText, inst) {
					checkDates($(this), endTime);
				},
				onSelect: function(selectedDateTime) {
					selected($(this), endTime, 'minDate');
				}
			}, options, options.start));
			$.fn[method].call(endTime, $.extend({
				onClose: function(dateText, inst) {
					checkDates($(this), startTime);
				},
				onSelect: function(selectedDateTime) {
					selected($(this), startTime, 'maxDate');
				}
			}, options, options.end));

			checkDates(startTime, endTime);
			selected(startTime, endTime, 'minDate');
			selected(endTime, startTime, 'maxDate');
			return $([startTime.get(0), endTime.get(0)]);
		};

		/**
		 * Log error or data to the console during error or debugging
		 * @param  {Object} err pass any type object to log to the console during error or debugging
		 * @return {void}
		 */
		$.timepicker.log = function(err) {
			if (window.console) {
				window.console.log(err);
			}
		};

		/*
		 * Add util object to allow access to private methods for testability.
		 */
		$.timepicker._util = {
			_extendRemove: extendRemove,
			_isEmptyObject: isEmptyObject,
			_convert24to12: convert24to12,
			_detectSupport: detectSupport,
			_selectLocalTimezone: selectLocalTimezone,
			_computeEffectiveSetting: computeEffectiveSetting,
			_splitDateTime: splitDateTime,
			_parseDateTimeInternal: parseDateTimeInternal
		};

		/*
		 * Microsecond support
		 */
		if (!Date.prototype.getMicroseconds) {
			Date.prototype.microseconds = 0;
			Date.prototype.getMicroseconds = function() {
				return this.microseconds;
			};
			Date.prototype.setMicroseconds = function(m) {
				this.setMilliseconds(this.getMilliseconds() + Math.floor(m / 1000));
				this.microseconds = m % 1000;
				return this;
			};
		}

		/*
		 * Keep up with the version
		 */
		$.timepicker.version = "1.4.1";

	})(jQuery);

	/* Simplified Chinese translation for the jQuery Timepicker Addon /
	/ Written by Will Lu */
	;(function($) {
		$.timepicker.regional['zh-CN'] = {
			timeOnlyTitle: '选择时间',
			timeText: '时间',
			hourText: '小时',
			minuteText: '分钟',
			secondText: '秒钟',
			millisecText: '微秒',
			microsecText: '微秒',
			timezoneText: '时区',
			currentText: '现在时间',
			closeText: '完成',
			timeFormat: 'HH:mm',
			amNames: ['AM', 'A'],
			pmNames: ['PM', 'P'],
			isRTL: false
		};
		$.timepicker.setDefaults($.timepicker.regional['zh-CN']);
	})(jQuery);

	// 初始化组件
	function initDatePicker() {
		$("[datepicker]").each(function() {
			var $this = $(this);
			if (!$this.data("initDatepicker")) {
				$this.data("initDatepicker","1");
				var options = $this.attr("datepicker");
				options = $.parseJSON(options) || {};

				// 选择年月后的回调函数
				var onSelectMonthYearCallback = options["onSelectMonthYearCallback"] || '';
				// 选择日后的回调函数
				var onSelectCallback = options["onSelectCallback"] || '';
				// 时间格式
				var timeFormat = options["timeFormat"] || '';
				timeFormat = timeFormat.toLowerCase(timeFormat);

				if(timeFormat.indexOf('hh:mm') !== -1){	// 有时分
					$this.datetimepicker({
						timeFormat: timeFormat,
						dateFormat: "yy-mm-dd",
						stepHour: 1,
						stepMinute: 1,
						stepSecond: 1
					});
				} else {	// 年月日
					var param = {
							changeYear: true,
							showButtonPanel: true,
							closeText: '清空',
							currentText: "今天",
							beforeShow: function(input, obj) {
								var dp = $(input).datepicker( "widget" );
								var zIndex = upgTool.getHighestZIndex();
						        setTimeout(function(){
						            dp.css('zIndex', zIndex+1);
						        }, 0);
							},
							onSelect: function(){
								if(onSelectCallback.length && typeof window[onSelectCallback] == 'function'){
									window[onSelectCallback].apply(this, arguments);
								}
							},
							onChangeMonthYear: function(){
								if(onSelectMonthYearCallback.length && typeof window[onSelectMonthYearCallback] == 'function'){
									window[onSelectMonthYearCallback].apply(this, arguments);
								}
							}
					};

					$.extend(param, options);

					if (options.endId) {
						$.extend(param, {
							onSelect: function( selectedDate ) {
								$("#"+options.endId).datepicker( "option", "minDate", selectedDate );
							}
						});
					}
					if (options.startId) {
						$.extend(param, {
							onSelect: function( selectedDate ) {
								$("#"+options.startId).datepicker( "option", "maxDate", selectedDate );
							}
						});
					}
					$this.prop("readonly", true);
					$this.datepicker(param);
				}
			}
		});
	}

	// // 日历 清空
	$(".ui-datepicker-close").live("click", function() {
		var $this = $(this);
		var text = $this.html();
		if(text == "清空"){
			// 找出当前文本框
			var associatedInputSelector = $this.siblings('.ui-datepicker-current').attr('onclick').replace(/^.*'(#[^']+)'.*/gi, '$1');
	    $(associatedInputSelector).val('');
		}
	});

	exports.init = initDatePicker;

})
