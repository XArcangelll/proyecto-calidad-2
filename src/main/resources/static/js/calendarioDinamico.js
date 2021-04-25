JotForm.init(function() {

	JotForm.calendarMonths = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
	JotForm.calendarDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
	JotForm.calendarOther = "Today";

	JotForm.checkAppointmentAvailability = function checkAppointmentAvailability(day, slot, data) {
		if (!(day && slot && data && data[day])) return false;
		return data[day][slot];
	};

	(function init(props) {
		var PREFIX = window.location.href.indexOf('jotform.pro') > -1 || window.location.pathname.indexOf('build') > -1 || window.location.pathname.indexOf('form-templates') > -1 || window.location.pathname.indexOf('pdf-templates') > -1 || window.location.pathname.indexOf('table-templates') > -1 || window.location.pathname.indexOf('approval-templates') > -1 ? '/server.php' : JotForm.server;

		// boilerplate
		var effectsOut = null;
		var changed = {};
		var constructed = false;
		var _window = window,
			document = _window.document;

		var wrapper = document.querySelector('#' + props.qid.value);
		var uniqueId = props.qid.value;
		var element = wrapper.querySelector('.appointmentField');
		var input = wrapper.querySelector('#input_' + props.id.value + '_date');
		var tzInput = wrapper.querySelector('#input_' + props.id.value + '_timezone');
		var timezonePickerCommon = void 0;
		var isTimezonePickerFromCommonLoaded = false;

		function debounce(func, wait, immediate) {
			var timeout = void 0;
			return function wrappedFN() {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				var context = this;
				var later = function later() {
					timeout = null;
					if (!immediate) func.apply.apply(func, [context].concat(args));
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply.apply(func, [context].concat(args));
			};
		}

		var classNames = function classNames(obj) {
			return Object.keys(obj).reduce(function(acc, key) {
				if (!obj[key]) return acc;
				return [].concat(acc, [key]);
			}, []).join(' ');
		};

		var assignObject = function assignObject() {
			for (var _len2 = arguments.length, objects = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				objects[_key2] = arguments[_key2];
			}

			return objects.reduce(function(acc, obj) {
				Object.keys(obj).forEach(function(key) {
					acc[key] = obj[key];
				});

				return acc;
			}, {});
		};

		var objectEntries = function objectEntries(obj) {
			return Object.keys(obj).reduce(function(acc, key) {
				var value = obj[key];
				var pair = [key, value];
				return [].concat(acc, [pair]);
			}, []);
		};

		var fillArray = function fillArray(arr, value) {
			var newArr = [];
			for (var i = 0; i < arr.length; i++) {
				newArr.push(value);
			}
			return newArr;
		};

		var getJSON = function getJSON(url, cb) {
			return new Ajax.Request(url, {
				evalJSON: 'force',
				method: 'GET',
				onComplete: function onComplete(response) {
					return cb(response.responseJSON);
				}
			});
		};

		var beforeRender = function beforeRender() {
			if (effectsOut) {
				effectsOut();
				effectsOut = null;
			}
		};

		var afterRender = function afterRender() {
			effectsOut = effects();
		};

		var setState = function setState(newState) {
			var changedKeys = Object.keys(newState).filter(function(key) {
				return state[key] !== newState[key];
			});

			if (!changedKeys.length) {
				return;
			}

			changed = changedKeys.reduce(function(acc, key) {
				var _assignObject;

				return assignObject({}, acc, (_assignObject = {}, _assignObject[key] = state[key], _assignObject));
			}, changed);

			state = assignObject({}, state, newState);
			if (constructed) {
				render();
			}
		};

		var isStartWeekOnMonday = function isStartWeekOnMonday() {
			var _props = props,
				startDay = _props.startWeekOn.value;

			return !startDay || startDay === 'Monday';
		};

		var monthNames = function monthNames() {
			return (JotForm.calendarMonthsTranslated || JotForm.calendarMonths || _Utils.specialOptions.Months.value).map(function(monthName) {
				return String.prototype.locale ? monthName.locale() : monthName;
			});
		};
		var daysOfWeek = function daysOfWeek() {
			return (JotForm.calendarDaysTranslated || JotForm.calendarDays || _Utils.specialOptions.Days.value).map(function(dayName) {
				return String.prototype.locale ? dayName.locale() : dayName;
			});
		};
		// we need remove unnecessary "Sunday", if there is time field on the form
		var dayNames = function dayNames() {
			var days = daysOfWeek().length === 8 ? daysOfWeek().slice(1) : daysOfWeek();
			return isStartWeekOnMonday() ? days : [days[days.length - 1]].concat(days.slice(0, 6));
		};

		var oneHour = 1000 * 60 * 60;
		// const oneDay = oneHour * 24;

		var intPrefix = function intPrefix(d) {
			if (d < 10) {
				return '0' + d;
			}

			return '' + d;
		};

		var toFormattedDateStr = function toFormattedDateStr(date) {
			var _props2 = props,
				_props2$dateFormat$va = _props2.dateFormat.value,
				format = _props2$dateFormat$va === undefined ? 'yyyy-mm-dd' : _props2$dateFormat$va;

			if (!date) return;
			if (typeof date === 'string') {
				var _date$split = date.split('-'),
					_year = _date$split[0],
					_month = _date$split[1],
					_day = _date$split[2];

				return format.replace(/yyyy/, _year).replace(/mm/, _month).replace(/dd/, _day);
			}

			var year = date.getFullYear();
			var month = intPrefix(date.getMonth() + 1);
			var day = intPrefix(date.getUTCDate());
			return format.replace(/yyyy/, year).replace(/mm/, month).replace(/dd/, day);
		};

		var toDateStr = function toDateStr(date) {
			if (!date) return;
			var year = date.getFullYear();
			var month = intPrefix(date.getMonth() + 1);
			var day = intPrefix(date.getDate());

			return year + '-' + month + '-' + day;
		};

		var toDateTimeStr = function toDateTimeStr(date) {
			if (!date) return;
			var ymd = toDateStr(date);
			var hour = intPrefix(date.getHours());
			var minute = intPrefix(date.getMinutes());
			return ymd + ' ' + hour + ':' + minute;
		};

		var getTimezoneOffset = function getTimezoneOffset(timezone) {
			if (!timezone) {
				return 0;
			}
			var cityArgs = timezone.split(' ');
			var splitted = cityArgs[cityArgs.length - 1].replace(/\(GMT|\)/g, '').split(':');

			if (!splitted) {
				return 0;
			}

			return parseInt(splitted[0] || 0, 10) + (parseInt(splitted[1] || 0, 10) / 60 || 0);
		};

		var getGMTSuffix = function getGMTSuffix(offset) {
			if (offset === 0) {
				return '';
			}

			var offsetMinutes = Math.abs(offset) % 60;
			var offsetHours = Math.abs(offset - offsetMinutes) / 60;

			var str = intPrefix(offsetHours) + ':' + intPrefix(offsetMinutes);

			if (offset < 0) {
				return '+' + str;
			}

			return '-' + str;
		};

		// const toJSDate = (dateStr, timezone) => {
		//   if (!dateStr) return;

		//   const gmtSuffix = getGMTSuffix(timezone || state.timezone);

		//   return new Date(`${dateStr} GMT${gmtSuffix}`);
		// };

		var getYearMonth = function getYearMonth(date) {
			if (!date) return;

			var _date$split2 = date.split('-'),
				y = _date$split2[0],
				m = _date$split2[1];

			return y + '-' + m;
		};

		var getMondayBasedDay = function getMondayBasedDay(date) {
			var day = date.getUTCDay();
			if (day === 0) {
				return 6; // sunday index
			}
			return day - 1;
		};

		var getDay = function getDay(date) {
			return isStartWeekOnMonday() ? getMondayBasedDay(date) : date.getUTCDay();
		};

		var getUserTimezone = function getUserTimezone() {
			var _props3 = props,
				_props3$autoDetectTim = _props3.autoDetectTimezone;
			_props3$autoDetectTim = _props3$autoDetectTim === undefined ? {} : _props3$autoDetectTim;
			var autoDetectValue = _props3$autoDetectTim.value,
				_props3$timezone = _props3.timezone;
			_props3$timezone = _props3$timezone === undefined ? {} : _props3$timezone;
			var timezoneAtProps = _props3$timezone.value;

			if (autoDetectValue === 'No') {
				return timezoneAtProps;
			}

			try {
				var tzStr = Intl.DateTimeFormat().resolvedOptions().timeZone;
				if (tzStr) {
					var tz = tzStr + ' (GMT' + getGMTSuffix(new Date().getTimezoneOffset()) + ')';
					return tz;
				}
			} catch (e) {
				console.error(e.message);
			}

			return props.timezone.value;
		};

		var passedProps = props;

		var getStateFromProps = function getStateFromProps() {
			var newProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var startDate = new Date(newProps.startDate ? newProps.startDate.value : '');
			var today = new Date();
			var date = toDateStr(new Date(Math.max(startDate, today) || today));

			return {
				date: date,
				timezones: state ? state.timezones : { loading: true }
			};
		};

		var getFirstAvailableDates = function getFirstAvailableDates(cb) {
			var _props4 = props,
				_props4$formID = _props4.formID,
				formID = _props4$formID === undefined ? global.__formInfo.id : _props4$formID;
			var _state = state,
				_state$timezone = _state.timezone,
				timezone = _state$timezone === undefined ? getUserTimezone() : _state$timezone;


			if (!formID || !timezone) return;

			// eslint-disable-next-line max-len
			var url = PREFIX + '?action=getAppointments&formID=' + formID + '&timezone=' + encodeURIComponent(timezone) + '&ncTz=' + new Date().getTime() + '&firstAvailableDates';

			return getJSON(url, function(_ref) {
				var content = _ref.content;
				return cb(content);
			});
		};

		var state = getStateFromProps(props);

		var loadTimezones = function loadTimezones(cb) {
			setState({
				timezones: { loading: true }
			});

			getJSON((props.cdnconfig.CDN || '/') + 'assets/form/timezones.json?ncTz=' + new Date().getTime(), function(data) {
				var timezones = objectEntries(data).reduce(function(acc, _ref2) {
					var group = _ref2[0],
						cities = _ref2[1];

					acc.push({
						group: group,
						cities: cities
					});
					return acc;
				}, []);

				cb(timezones);
			});
		};

		var loadMonthData = function loadMonthData(startDate, endDate, cb) {
			var _props5 = props,
				_props5$formID = _props5.formID,
				formID = _props5$formID === undefined ? (typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object' ? global.__formInfo.id : null : _props5$formID,
				id = _props5.id.value;
			var _state2 = state,
				timezone = _state2.timezone;


			if (!formID || !timezone) return;

			// eslint-disable-next-line max-len
			var url = PREFIX + '?action=getAppointments&formID=' + formID + '&qid=' + id + '&timezone=' + encodeURIComponent(timezone) + '&startDate=' + toDateStr(startDate) + '&endDate=' + toDateStr(endDate) + '&ncTz=' + new Date().getTime();

			return getJSON(url, function(_ref3) {
				var data = _ref3.content;
				return cb(data);
			});
		};

		var generateMonthData = function generateMonthData(startDate, endDate, data) {
			var d1 = startDate.getDate();
			var d2 = endDate.getDate();
			var dPrefix = startDate.getFullYear() + '-' + intPrefix(startDate.getMonth() + 1) + '-';

			var daysLength = d2 - d1 + 1 || 0;
			var days = fillArray(new Array(daysLength), '');

			var slots = days.reduce(function(acc, day) {
				var _assignObject2;

				var dayStr = '' + dPrefix + intPrefix(day + 1);
				return assignObject(acc, (_assignObject2 = {}, _assignObject2[dayStr] = data[dayStr] || false, _assignObject2));
			}, {});

			var availableDays = Object.keys(data).filter(function(d) {
				return !Array.isArray(slots[d]) && !!slots[d];
			});

			return {
				availableDays: availableDays,
				slots: slots
			};
		};

		var lastReq = void 0;

		var updateMonthData = function updateMonthData(startDate, endDate, data) {
			var _generateMonthData = generateMonthData(startDate, endDate, data),
				availableDays = _generateMonthData.availableDays,
				slots = _generateMonthData.slots;

			if (JSON.stringify(slots) === JSON.stringify(state.slots)) {
				return;
			}

			setState({
				availableDays: availableDays,
				slots: slots
			});
		};

		var getDateRange = function getDateRange(dateStr) {
			var _dateStr$split = dateStr.split('-'),
				y = _dateStr$split[0],
				m = _dateStr$split[1];

			var startDate = new Date(y, m - 1, 1);
			var endDate = new Date(y, m, 0);
			return [startDate, endDate];
		};

		var load = function load() {
			var _state3 = state,
				dateStr = _state3.date;

			var _getDateRange = getDateRange(dateStr),
				startDate = _getDateRange[0],
				endDate = _getDateRange[1];

			setState(assignObject({ loading: true }, generateMonthData(startDate, endDate, {})));

			var req = loadMonthData(startDate, endDate, function(data) {
				if (lastReq !== req) {
					return;
				}

				updateMonthData(startDate, endDate, data);
				var _state4 = state,
					availableDays = _state4.availableDays,
					forcedStartDate = _state4.forcedStartDate,
					forcedEndDate = _state4.forcedEndDate,
					slots = _state4.slots;


				var firstAvailable = availableDays.find(function(d) {
					var foundSlot = Object.keys(slots[d]).find(function(slot) {
						var slotDate = dateInTimeZone(new Date((d + ' ' + slot).replace(/-/g, '/')));

						if (forcedStartDate && slotDate > forcedStartDate) return false;
						if (forcedEndDate && slotDate < forcedEndDate) return false;

						return true;
					});

					return foundSlot;
				});

				var newDate = availableDays.indexOf(dateStr) === -1 && firstAvailable;

				setState({
					loading: false,
					date: newDate || dateStr
				});
			});

			lastReq = req;
		};

		var dateInTimeZone = function dateInTimeZone(date) {
			var timezone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : state.timezone;

			if (!date) return;
			var diffTime = (getTimezoneOffset(timezone) - state.nyTz) * oneHour;
			return new Date(date.getTime() - diffTime);
		};

		var dz = function dz(date, tz1, tz2) {
			if (!date) return;
			var diffTime = (tz1 - tz2) * oneHour;
			return new Date(date.getTime() - diffTime);
		};

		var revertDate = function revertDate(d, t1, t2) {
			if (!d) return '';

			var pDate = new Date(d.replace(/-/, '/'));
			var utz = getTimezoneOffset(getUserTimezone());
			var tz1 = getTimezoneOffset(t1) - utz;
			var tz2 = getTimezoneOffset(t2) - utz;

			var val = dz(pDate, tz1, tz2);

			return toDateTimeStr(val);
		};

		var amPmConverter = function amPmConverter(_time) {
			var _props6 = props,
				_props6$timeFormat = _props6.timeFormat;
			_props6$timeFormat = _props6$timeFormat === undefined ? {} : _props6$timeFormat;
			var _props6$timeFormat$va = _props6$timeFormat.value,
				timeFormat = _props6$timeFormat$va === undefined ? '24 Hour' : _props6$timeFormat$va;

			if (!_time || !(typeof _time === 'string') || _time.indexOf('M') > -1 || !timeFormat || timeFormat === '24 Hour') {
				return _time;
			}
			var time = _time.substring(0, 2);
			var hour = time % 12 || 12;
			var ampm = time < 12 ? 'AM' : 'PM';
			return '' + hour + _time.substring(2, 5) + ' ' + ampm;
		};

		var validate = function validate(dateStr, cb) {
			var _state5 = state,
				defaultValue = _state5.defaultValue;


			if (JotForm.isEditMode() && defaultValue === dateStr) {
				return cb(true);
			}

			var parts = dateStr.split(' ');
			var slot = parts.slice(1).join(' ');

			var _parts$0$split = parts[0].split('-'),
				y = _parts$0$split[0],
				m = _parts$0$split[1],
				d = _parts$0$split[2];

			var startDate = new Date(y, m - 1, 1);
			var endDate = new Date(y, m, 0);

			loadMonthData(startDate, endDate, function(data) {
				var day = y + '-' + m + '-' + d;
				var isValid = JotForm.checkAppointmentAvailability(day, amPmConverter(slot), data);
				cb(isValid);
				if (!isValid) {
					var _assignObject3;

					// add unavailable slot if it is not in response for deselection
					data[day] = assignObject({}, data[day], (_assignObject3 = {}, _assignObject3[slot] = false, _assignObject3));
				}

				// still in same month
				if (state.date.indexOf(y + '-' + m) === 0) {
					updateMonthData(startDate, endDate, data);
				}
			});
		};

		// let validationInterval;

		var validation = function validation(_value) {
			var shouldValidate = _value || $(input).hasClassName('validate');

			if (!shouldValidate) {
				$(input).addClassName('valid');
				JotForm.corrected(input);
				JotForm.runConditionForId(props.id.value);
				return;
			}

			if (!_value) {
				$(input).removeClassName('valid');
				JotForm.errored(input, JotForm.texts.required);
				JotForm.runConditionForId(props.id.value);
				return;
			}

			validate(_value, function(isValid) {
				if (isValid) {
					$(input).addClassName('valid');
					JotForm.corrected(input);
					JotForm.runConditionForId(props.id.value);
					return;
				}

				// clearInterval(validationInterval);

				var parts = _value.split(' ');
				var dateStr = parts[0];

				var date = new Date(dateStr);
				var day = getDay(date);
				var datetime = dayNames()[day] + ', ' + monthNames()[date.getMonth()] + ' ' + intPrefix(date.getUTCDate()) + ', ' + date.getFullYear();

				var time = parts.slice(1).join(' ');
				var errorText = JotForm.texts.slotUnavailable.replace('{time}', time).replace('{date}', datetime);

				$(input).removeClassName('valid');
				JotForm.errored(input, errorText);
				JotForm.runConditionForId(props.id.value);
			});
		};

		var setValue = function setValue(value) {
			input.value = value ? toDateTimeStr(dateInTimeZone(new Date(value.replace(/-/g, '/')))) : '';

			setState({
				value: value
			});

			// trigger input event for supporting progress bar widget
			input.triggerEvent('input');

			// clearInterval(validationInterval);

			validation(value);
			// validationInterval = setInterval(() => { validation(state.value); }, 1000 * 5);
		};

		var handleClick = function handleClick(e) {
			var target = e.target;

			var $target = $(target);

			if (!$target || !$target.hasClassName) {
				return;
			}

			if ($target.hasClassName('disabled') && !$target.hasClassName('active')) {
				return;
			}

			e.preventDefault();
			var value = target.dataset.value;

			setValue($target.hasClassName('active') ? undefined : value);
		};

		var setTimezone = function setTimezone(timezone) {
			tzInput.value = timezone;
			setState({ timezone: timezone });
			if (input.value) {
				var date = toDateTimeStr(dz(new Date(input.value.replace(/-/g, '/')), state.nyTz, getTimezoneOffset(state.timezone)));
				setDate(date.split(' ')[0]);
				setState({ value: date });
			}
		};

		var handleTimezoneChange = function handleTimezoneChange(e) {
			var target = e.target;
			var timezone = target.value;

			setTimezone(timezone);
		};

		var setDate = function setDate(date) {
			return setState({ date: date });
		};

		var handleDateChange = function handleDateChange(e) {
			var target = e.target;
			var date = target.dataset.value;


			if (!date) return;

			setDate(date);
		};

		var handleMonthYearChange = function handleMonthYearChange(e) {
			var _e$target = e.target,
				dataset = _e$target.dataset,
				inputVal = _e$target.value;
			var name = dataset.name;

			if (!name) {
				return;
			}

			var _state6 = state,
				date = _state6.date;

			var oldDate = new Date(date);
			var oldMonth = oldDate.getMonth();
			var oldYear = oldDate.getFullYear();
			var oldDay = oldDate.getUTCDate();

			var value = inputVal || e.target.getAttribute('value');

			if (name === 'month') {
				var newDate = new Date(oldYear, value, oldDay);
				var i = 1;
				while ('' + newDate.getMonth() !== '' + value && i < 10) {
					newDate = new Date(oldYear, value, oldDay - i);
					i++;
				}

				return setDate(toDateStr(newDate));
			}

			return setDate(toDateStr(new Date(value, oldMonth, oldDay)));
		};

		var toggleMobileState = function toggleMobileState() {
			var $wrapper = $(wrapper);
			if ($wrapper.hasClassName('isOpenMobile')) {
				$wrapper.removeClassName('isOpenMobile');
			} else {
				$wrapper.addClassName('isOpenMobile');
			}
		};

		var keepSlotsScrollPosition = function keepSlotsScrollPosition() {
			var visibleSlot = element.querySelector('.appointmentSlots.slots .slot.active, .appointmentSlots.slots .slot:not(.disabled)');

			element.querySelector('.appointmentSlots.slots').scrollTop = visibleSlot ? visibleSlot.offsetTop : 0;
		};

		var setTimezonePickerState = function setTimezonePickerState() {
			var _state7 = state,
				timezone = _state7.timezone;
			var _props7 = props,
				_props7$autoDetectTim = _props7.autoDetectTimezone;
			_props7$autoDetectTim = _props7$autoDetectTim === undefined ? {} : _props7$autoDetectTim;
			var autoDetecTimezoneValue = _props7$autoDetectTim.value,
				_props7$timezone = _props7.timezone;
			_props7$timezone = _props7$timezone === undefined ? {} : _props7$timezone;
			var timezoneValueProps = _props7$timezone.value;

			if (autoDetecTimezoneValue === 'No') {
				timezonePickerCommon.setSelectedTimezone(timezoneValueProps);
			} else {
				timezonePickerCommon.setSelectedTimezone(timezone);
			}
			timezonePickerCommon.setIsAutoSelectTimezoneOpen(autoDetecTimezoneValue);
		};

		var handleUIUpdate = function handleUIUpdate() {
			try {
				var breakpoints = {
					450: 'isLarge',
					225: 'isNormal',
					175: 'shouldBreakIntoNewLine'
				};

				var offsetWidth = function() {
					try {
						var appointmentCalendarRow = element.querySelector('.appointmentFieldRow.forCalendar');
						var appointmendCalendar = element.querySelector('.appointmentCalendar');
						return appointmentCalendarRow.getBoundingClientRect().width - appointmendCalendar.getBoundingClientRect().width;
					} catch (e) {
						return null;
					}
				}();

				if (offsetWidth === null || parseInt(wrapper.readAttribute('data-breakpoint-offset'), 10) === offsetWidth) {
					return;
				}

				var breakpoint = Object.keys(breakpoints).reduce(function(prev, curr) {
					return Math.abs(curr - offsetWidth) < Math.abs(prev - offsetWidth) ? curr : prev;
				});
				var breakpointName = breakpoints[breakpoint];

				wrapper.setAttribute('data-breakpoint', breakpointName);
				wrapper.setAttribute('data-breakpoint-offset', offsetWidth);
			} catch (e) {
				// noop.
			}
		};

		var uiUpdateInterval = void 0;

		var effects = function effects() {
			clearInterval(uiUpdateInterval);

			var shouldLoad = changed.timezone && changed.timezone !== state.timezone || // time zone changed
				changed.date && getYearMonth(changed.date) !== getYearMonth(state.date); // y-m changed

			changed = {};

			if (shouldLoad) {
				load();
			}

			var cancelBtn = element.querySelector('.cancel');

			if (cancelBtn) {
				cancelBtn.addEventListener('click', function() {
					setValue(undefined);
				});
			}

			var forSelectedDate = element.querySelector('.forSelectedDate span');

			if (forSelectedDate) {
				forSelectedDate.addEventListener('click', function() {
					setDate(state.value.split(' ')[0]);
				});
			}

			if (isTimezonePickerFromCommonLoaded) {
				setTimezonePickerState();
				var timezonePickerWrapper = element.querySelector('.forTimezonePicker');
				timezonePickerCommon.init(timezonePickerWrapper);
			} else {
				element.querySelector('.timezonePicker').addEventListener('change', handleTimezoneChange);
			}

			element.querySelector('.calendar .days').addEventListener('click', handleDateChange);
			element.querySelector('.monthYearPicker').addEventListener('change', handleMonthYearChange);
			element.querySelector('.dayPicker').addEventListener('click', handleDateChange);
			element.querySelector('.selectedDate').addEventListener('click', toggleMobileState);

			Array.prototype.slice.call(element.querySelectorAll('.monthYearPicker .pickerArrow')).forEach(function(el) {
				return el.addEventListener('click', handleMonthYearChange);
			});
			Array.prototype.slice.call(element.querySelectorAll('.slot')).forEach(function(el) {
				return el.addEventListener('click', handleClick);
			});

			keepSlotsScrollPosition();
			uiUpdateInterval = setInterval(handleUIUpdate, 250);

			JotForm.runAllCalculations();
		};

		var onTimezoneOptionClick = function onTimezoneOptionClick(timezoneValue) {
			setTimezone(timezoneValue);
		};

		var renderMonthYearPicker = function renderMonthYearPicker() {
			var _state8 = state,
				date = _state8.date;

			var _split = (date || '-').split('-'),
				year = _split[0],
				month = _split[1];

			var yearOpts = fillArray(new Array(20), '').map(function(i) {
				return '' + (2020 + i);
			});

			return '\n      <div class=\'monthYearPicker\'>\n        <div class=\'pickerItem\'>\n          <select class=\'pickerMonth\' data-name=\'month\'>\n            ' + monthNames().map(function(monthName, i) {
				return '<option ' + (parseInt(month, 10) === i + 1 ? 'selected' : '') + ' value=\'' + i + '\'>' + monthName + '</option>';
			}).join('') + '\n          </select>\n          <button type=\'button\' class=\'pickerArrow pickerMonthArrow prev\' value=\'' + (parseInt(month, 10) - 2) + '\' data-name=\'month\'></button>\n          <button type=\'button\' class=\'pickerArrow pickerMonthArrow next\' value=\'' + parseInt(month, 10) + '\' data-name=\'month\'></button>\n        </div>\n        <div class=\'pickerItem\'>\n          <select class=\'pickerYear\' data-name=\'year\'>\n            ' + yearOpts.map(function(yearName) {
				return '<option ' + (year === yearName ? 'selected' : '') + '>' + yearName + '</option>';
			}).join('') + '\n          </select>\n          <button type=\'button\' class=\'pickerArrow pickerYearArrow prev\' value=\'' + (parseInt(year, 10) - 1) + '\' data-name=\'year\' />\n          <button type=\'button\' class=\'pickerArrow pickerYearArrow next\' value=\'' + (parseInt(year, 10) + 1) + '\' data-name=\'year\' />\n        </div>\n      </div>\n    ';
		};

		var getNav = function getNav() {
			var _state9 = state,
				availableDays = _state9.availableDays,
				dateStr = _state9.date;


			var next = void 0;
			var prev = void 0;

			var _dateStr$split2 = dateStr.split('-'),
				year = _dateStr$split2[0],
				month = _dateStr$split2[1];

			if (availableDays) {
				var dayIndex = availableDays.indexOf(dateStr);
				if (dayIndex > 0) {
					prev = availableDays[dayIndex - 1];
				} else {
					var prevDate = new Date(year, month - 1, 0);
					prev = toDateStr(prevDate);
				}
				if (dayIndex + 1 < availableDays.length) {
					next = availableDays[dayIndex + 1];
				} else {
					var nextDate = new Date(year, month, 1);
					next = toDateStr(nextDate);
				}
			}

			return { prev: prev, next: next };
		};

		var renderDayPicker = function renderDayPicker() {
			var _state10 = state,
				loading = _state10.loading;

			var _getNav = getNav(),
				prev = _getNav.prev,
				next = _getNav.next;

			return '\n      <div class=\'appointmentDayPicker dayPicker\'>\n        <button type=\'button\' ' + (loading || !prev ? 'disabled' : '') + ' class="appointmentDayPickerButton prev" ' + (prev && 'data-value="' + prev + '"') + '>&lt;</button>\n        <button type=\'button\' ' + (loading || !next ? 'disabled' : '') + ' class="appointmentDayPickerButton next" ' + (next && 'data-value="' + next + '"') + '>&gt;</button>\n      </div>\n    ';
		};

		var renderTimezonePicker = function renderTimezonePicker() {
			var _state11 = state,
				timezone = _state11.timezone,
				timezones = _state11.timezones;


			return '\n      <div class=\'timezonePickerWrapper\'> \n        <select class=\'timezonePicker\'>\n          ' + (!timezones.loading && timezones.map(function(_ref4) {
				var group = _ref4.group,
					cities = _ref4.cities;
				return '\n                <optgroup label="' + group + '">\n                  ' + cities.map(function(val) {
					return '<option ' + (timezone.indexOf((group + '/' + val).split(' ')[0]) > -1 ? 'selected' : '') + ' value=\'' + group + '/' + val + '\'>' + val + '</option>';
				}).join('') + '\n                </optgroup>\n              ';
			}).join('')) + '\n        </select>\n        <div class=\'timezonePickerName\'>' + timezone + '</div>\n      </div>\n    ';
		};

		var renderCalendarDays = function renderCalendarDays() {
			var _state12 = state,
				slots = _state12.slots,
				dateStr = _state12.date,
				value = _state12.value,
				availableDays = _state12.availableDays;

			var days = slots ? Object.keys(slots) : [];
			var todayStr = toDateStr(new Date());

			if (!days.length) {
				return '';
			}

			var firstDay = getDay(new Date(days[0]));
			days.unshift.apply(days, fillArray(new Array(firstDay), 'precedingDay'));

			var trailingDays = Math.ceil(days.length / 7) * 7 - days.length;
			days.push.apply(days, fillArray(new Array(trailingDays), 'trailingDay'));

			var weeks = days.map(function(i) {
				return i % 7 === 0 ? days.slice(i, i + 7) : null;
			}).filter(function(a) {
				return a;
			});

			var dateValue = value && value.split(' ')[0];

			return '\n      ' + weeks.map(function(week) {
				return '<div class=\'calendarWeek\'>' + week.map(function(day) {
					var dayObj = new Date(day);
					if (day === 'precedingDay' || day === 'trailingDay') {
						return '<div class="calendarDay ' + day + ' empty"></div>';
					}
					var active = day === dateStr;
					var isToday = todayStr === day;
					var beforeStartDate = state.forcedStartDate ? state.forcedStartDate > dayObj : false;
					var afterEndDate = state.forcedEndDate ? state.forcedEndDate < dayObj : false;
					var isUnavailable = availableDays.indexOf(day) === -1 || beforeStartDate || afterEndDate;
					var isSelected = day === dateValue;
					var classes = 'calendarDay ' + classNames({
						isSelected: isSelected,
						isToday: isToday,
						isUnavailable: isUnavailable,
						isActive: active
					});
					return '<div class=\'' + classes + '\' data-value=\'' + day + '\'><span class=\'calendarDayEach\'>' + day.split('-')[2].replace(/^0/, '') + '</span></div>';
				}).join('') + '</div>';
			}).join('') + '\n    ';
		};

		var renderEmptyState = function renderEmptyState() {
			/* eslint-disable */
			return '\n      <div class="appointmentSlots-empty">\n        <div class="appointmentSlots-empty-container">\n          <div class="appointmentSlots-empty-icon">\n            <svg width="124" height="102" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n              <defs>\n                <path d="M55 32.001c0 21.54 17.46 39 39 39 3.457 0 6.81-.45 10-1.294v34.794H0v-104l71 .001c-9.7 7.095-16 18.561-16 31.5z" id="a"/>\n              </defs>\n              <g fill="none" fill-rule="evenodd">\n                <g transform="translate(-1 -1)">\n                  <mask id="b" fill="#fff">\n                    <use xlink:href="#a"/>\n                  </mask>\n                  <g mask="url(#b)">\n                    <path d="M18.85 52.001c9.858 0 17.85 7.992 17.85 17.85 0 9.859-7.992 17.85-17.85 17.85S1 79.71 1 69.851c0-9.858 7.992-17.85 17.85-17.85zm5.666 10.842L17.38 69.98l-2.44-2.44a2.192 2.192 0 00-3.1 3.1l3.99 3.987a2.192 2.192 0 003.098 0l8.687-8.686a2.191 2.191 0 00-3.1-3.099z" fill="#D5D6DA"/>\n                    <path d="M92.043 10.643H81.597V7.576A6.582 6.582 0 0075.023 1a6.582 6.582 0 00-6.574 6.575v3.067H41.833V7.576A6.582 6.582 0 0035.26 1a6.582 6.582 0 00-6.574 6.575v3.149a2.187 2.187 0 00-.585-.082H19.37c-6.042 0-10.957 4.916-10.957 10.958v27.126a2.192 2.192 0 004.383 0V33.215h86.211a2.192 2.192 0 000-4.383H12.795v-7.231a6.582 6.582 0 016.574-6.575H28.1c.203 0 .398-.03.585-.08v2.82a6.582 6.582 0 006.574 6.574c3.625 0 10.574-2.95 10.574-6.574v-2.74H68.45v2.74a6.582 6.582 0 006.574 6.574c3.625 0 7.574-2.95 7.574-6.574v-2.74h9.446a6.582 6.582 0 016.574 6.575v73.072a3.95 3.95 0 01-3.946 3.945h-77.95a3.95 3.95 0 01-3.944-3.944v-5.67c0-1.047-.981-2.192-2.192-2.192-1.21 0-2.191.981-2.191 2.192v5.67c0 4.592 3.736 8.327 8.327 8.327h77.95c4.592 0 8.328-3.736 8.328-8.328V21.601c0-6.042-4.915-10.958-10.957-10.958zM37.45 17.766a2.194 2.194 0 01-2.191 2.191 2.194 2.194 0 01-2.191-2.191V7.576c0-1.209.983-2.192 2.19-2.192 1.21 0 2.192.983 2.192 2.192v10.19zm39.764 0a2.194 2.194 0 01-2.191 2.191 2.194 2.194 0 01-2.191-2.191V7.576c0-1.209.983-2.192 2.191-2.192 1.208 0 2.191.983 2.191 2.192v10.19z" fill="#D5D6DA" fill-rule="nonzero"/>\n                    <path d="M55.68 63.556c-4.592 0-8.328 3.736-8.328 8.327 0 4.592 3.736 8.328 8.327 8.328 4.592 0 8.328-3.736 8.328-8.328 0-4.591-3.736-8.327-8.328-8.327zm0 12.272a3.95 3.95 0 01-3.945-3.945 3.95 3.95 0 013.944-3.944 3.95 3.95 0 013.945 3.944 3.95 3.95 0 01-3.945 3.945zm26.854-12.272c-4.591 0-8.327 3.736-8.327 8.327 0 4.592 3.736 8.328 8.327 8.328 4.592 0 8.328-3.736 8.328-8.328 0-4.591-3.736-8.327-8.328-8.327zm0 12.272a3.95 3.95 0 01-3.944-3.945 3.95 3.95 0 013.944-3.944 3.95 3.95 0 013.945 3.944 3.95 3.95 0 01-3.945 3.945zM30.126 36.701c-4.591 0-8.327 3.736-8.327 8.328 0 4.591 3.736 8.327 8.327 8.327 4.592 0 8.328-3.736 8.328-8.327 0-4.592-3.736-8.328-8.328-8.328zm0 12.272a3.95 3.95 0 01-3.944-3.944 3.95 3.95 0 013.944-3.945 3.95 3.95 0 013.945 3.945 3.95 3.95 0 01-3.945 3.944z" fill="#D5D6DA" fill-rule="nonzero"/>\n                    <path d="M83.836 36.701c-4.592 0-8.328 3.736-8.328 8.328 0 4.591 3.736 8.327 8.328 8.327 4.591 0 8.327-3.736 8.327-8.327 0-4.592-3.736-8.328-8.327-8.328zm0 12.272a3.95 3.95 0 01-3.945-3.944 3.95 3.95 0 013.945-3.945 3.95 3.95 0 013.944 3.945 3.95 3.95 0 01-3.944 3.944z" fill="#2B3245" fill-rule="nonzero"/>\n                    <path d="M56.981 36.701c-4.592 0-8.327 3.736-8.327 8.328 0 4.591 3.735 8.327 8.327 8.327 4.592 0 8.327-3.736 8.327-8.327 0-4.592-3.735-8.328-8.327-8.328zm0 12.272a3.95 3.95 0 01-3.944-3.944 3.95 3.95 0 013.944-3.945 3.95 3.95 0 013.945 3.945 3.95 3.95 0 01-3.945 3.944z" fill="#D5D6DA" fill-rule="nonzero"/>\n                    <path d="M68.829 11.201l.001 6.375a6.375 6.375 0 006.146 6.371l.229.004a6.375 6.375 0 006.371-6.146l.004-.229-.001-6.375h6.871c6.627 0 12 5.373 12 12v8.4H11.2v-8.4c0-6.627 5.373-12 12-12h5.849l.001 6.75a6 6 0 005.775 5.996l.225.004h.375a6.375 6.375 0 006.375-6.375l-.001-6.375h27.03z" fill="#D5D6DA"/>\n                  </g>\n                </g>\n                <path d="M92 0c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32-17.673 0-32-14.327-32-32C60 14.327 74.327 0 92 0zm21.268 15.365L75.365 53.268A26.884 26.884 0 0092 59c14.912 0 27-12.088 27-27a26.88 26.88 0 00-5.732-16.635zM92 5C77.088 5 65 17.088 65 32c0 6.475 2.28 12.417 6.079 17.069l37.99-37.99A26.888 26.888 0 0092 5z" fill="#D5D6DA"/>\n              </g>\n            </svg>\n          </div>\n          <div class="appointmentSlots-empty-text">' + JotForm.texts.noSlotsAvailable + '</div>\n        </div>\n      </div>\n    ';
			/* eslint-enable */
		};

		var dateWithAMPM = function dateWithAMPM() {
			var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
			var _props8 = props,
				_props8$timeFormat = _props8.timeFormat;
			_props8$timeFormat = _props8$timeFormat === undefined ? {} : _props8$timeFormat;
			var _props8$timeFormat$va = _props8$timeFormat.value,
				timeFormat = _props8$timeFormat$va === undefined ? '24 Hour' : _props8$timeFormat$va;

			var time = new Date(date.replace(/-/g, '/')).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hourCycle: timeFormat === 'AM/PM' ? 'h12' : 'h23' });
			var day = date && date.split(' ')[0];
			return day + ' ' + time;
		};

		var renderSlots = function renderSlots() {
			var _state13 = state,
				dateStr = _state13.date,
				_state13$value = _state13.value,
				dateValue = _state13$value === undefined ? '' : _state13$value,
				_state13$defaultValue = _state13.defaultValue,
				defaultValue = _state13$defaultValue === undefined ? '' : _state13$defaultValue,
				timezone = _state13.timezone,
				forcedStartDate = _state13.forcedStartDate,
				forcedEndDate = _state13.forcedEndDate;

			var dateSlots = state.slots && state.slots[dateStr] || {};

			var stateValue = dateWithAMPM(dateValue);
			var defaultValueTZ = revertDate(defaultValue, ' ', timezone);

			var parsedDefaultVal = dateWithAMPM(defaultValueTZ);

			var entries = objectEntries(dateSlots);

			if (!entries || !entries.length) {
				return renderEmptyState();
			}

			return entries.map(function(_ref5) {
				var name = _ref5[0],
					value = _ref5[1];

				var rn = amPmConverter(name);
				var slotValue = dateStr + ' ' + rn;
				var realD = dateInTimeZone(new Date(slotValue.replace(/-/g, '/')));
				var active = stateValue === slotValue;

				var disabled = forcedStartDate && forcedStartDate > realD || forcedEndDate && forcedEndDate < realD || !(value || parsedDefaultVal === slotValue);

				return '<div class="appointmentSlot slot ' + classNames({ disabled: disabled, active: active }) + '" data-value="' + slotValue + '">' + name + '</div>';
			}).join('');
		};

		var renderDay = function renderDay() {
			var _state14 = state,
				dateStr = _state14.date;

			var date = new Date(dateStr);
			var day = getDay(date);

			return '\n      <div class=\'appointmentDate\'>\n        ' + (dateStr && dayNames()[day] + ', ' + monthNames()[date.getUTCMonth()] + ' ' + intPrefix(date.getUTCDate())) + '\n      </div>\n    ';
		};

		var renderCalendar = function renderCalendar() {
			var _state15 = state,
				dateStr = _state15.date;


			return '\n      <div class=\'selectedDate\'>\n        <input class=\'currentDate\' type=\'text\' value=\'' + toFormattedDateStr(dateStr) + '\' style=\'pointer-events: none;\' />\n      </div>\n      ' + renderMonthYearPicker() + '\n      <div class=\'appointmentCalendarDays days\'>\n        <div class=\'daysOfWeek\'>\n          ' + dayNames().map(function(day) {
				return '<div class="dayOfWeek ' + day.toLowerCase() + '">' + day.toUpperCase().slice(0, 3) + '</div>';
			}).join('') + '\n        </div>\n        ' + renderCalendarDays() + '\n      </div>\n    ';
		};

		var renderSelectedDate = function renderSelectedDate() {
			var _state16 = state,
				_state16$value = _state16.value,
				value = _state16$value === undefined ? '' : _state16$value;

			var dateStr = value && value.split(' ')[0];
			var _props9 = props,
				_props9$timeFormat = _props9.timeFormat;
			_props9$timeFormat = _props9$timeFormat === undefined ? {} : _props9$timeFormat;
			var _props9$timeFormat$va = _props9$timeFormat.value,
				timeFormat = _props9$timeFormat$va === undefined ? '24 Hour' : _props9$timeFormat$va;


			var date = new Date(dateStr);
			var time = new Date(value.replace(/-/g, '/')).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hourCycle: timeFormat === 'AM/PM' ? 'h12' : 'h23' });
			var day = getDay(date);
			var datetime = dayNames()[day] + ', ' + monthNames()[date.getUTCMonth()] + ' ' + intPrefix(date.getUTCDate()) + ', ' + date.getFullYear();

			var text = JotForm.texts.appointmentSelected.replace('{time}', time).replace('{date}', datetime);
			var valEl = '<div style=\'display: none\' class=\'jsAppointmentValue\'>' + datetime + ' ' + time + '</div>';
			return value ? valEl + '<div class=\'appointmentFieldRow forSelectedDate\'><span>' + text + '</span><button type=\'button\' class=\'cancel\'>x</button></div>' : '';
		};

		var render = debounce(function() {
			var _state17 = state,
				loading = _state17.loading;


			beforeRender();
			element.innerHTML = '\n      <div class=\'appointmentFieldContainer\'>\n        <div class=\'appointmentFieldRow forCalendar\'>\n          <div class=\'calendar appointmentCalendar\'>\n            <div class=\'appointmentCalendarContainer\'>\n              ' + renderCalendar() + '\n            </div>\n          </div>\n          <div class=\'appointmentDates\'>\n            <div class=\'appointmentDateSelect\'>\n              ' + renderDay() + '\n              ' + renderDayPicker() + '\n            </div>\n            <div class=\'appointmentSlots slots ' + classNames({ isLoading: loading }) + '\'>\n              <div class=\'appointmentSlotsContainer\'>\n                ' + renderSlots() + '\n              </div>\n            </div>\n            <div class=\'appointmentCalendarTimezone forTimezonePicker\'>\n              ' + (isTimezonePickerFromCommonLoaded ? '' : renderTimezonePicker()) + '\n            </div>\n          </div>\n        </div>\n        ' + renderSelectedDate() + '\n      </div>\n    ';
			afterRender();
		});

		var _update = function _update(newProps) {
			state = assignObject({}, state, getStateFromProps(newProps));
			props = newProps;
			load();
		};

		input.addEventListener('change', function(e) {
			if (!state.nyTz) return;
			var date = toDateTimeStr(dz(new Date(e.target.value.replace(/-/g, '/')), state.nyTz, getTimezoneOffset(state.timezone)));
			setDate(date.split(' ')[0]);
			setState({ value: date, defaultValue: date });
			validation(date);
		});
		tzInput.addEventListener('change', function(e) {
			var defaultTimezone = e.target.value;
			setTimezone(defaultTimezone);
			setState({ defaultTimezone: defaultTimezone });
		});
		document.addEventListener('translationLoad', function() {
			return render();
		});

		var getInitialData = function getInitialData(timezones) {
			getFirstAvailableDates(function(data) {
				var nyTz = -4;
				try {
					nyTz = getTimezoneOffset(timezones.find(function(_ref6) {
						var group = _ref6.group;
						return group === 'America';
					}).cities.find(function(c) {
						return c.indexOf('New_York') > -1;
					}));
				} catch (e) {
					console.log(e);
				}
				JotForm.appointments.initialData = data;
				JotForm.nyTz = nyTz;
				JotForm.appointments.listeners.forEach(function(fn) {
					return fn({ data: data, timezones: timezones, nyTz: nyTz });
				});
			});
		};

		if (!JotForm.appointments) {
			JotForm.appointments = { listeners: [] };

			loadTimezones(function(timezones) {
				JotForm.timezones = timezones;
				getInitialData(timezones);
			});
		}

		var requestTry = 1;
		var requestTimeout = 1000;

		var construct = function construct(_ref7) {
			var data = _ref7.data,
				timezones = _ref7.timezones,
				nyTz = _ref7.nyTz;

			var qdata = data[props.id.value];
			var _props10 = props,
				_props10$autoDetectTi = _props10.autoDetectTimezone;
			_props10$autoDetectTi = _props10$autoDetectTi === undefined ? {} : _props10$autoDetectTi;
			var autoDetectValue = _props10$autoDetectTi.value;


			if (autoDetectValue === 'No') {
				load();
			}

			if (!qdata || qdata.error) {
				constructed = true;

				if (!qdata && requestTry < 4) {
					requestTry += 1;
					setTimeout(function() {
						getInitialData(JotForm.timezones);
					}, requestTry * requestTimeout);
				}

				return;
			}

			constructed = false;

			var userTimezone = getUserTimezone();

			var setUpdatedTimezone = function setUpdatedTimezone(currentTimezone) {
				if (!currentTimezone) {
					return currentTimezone;
				}

				var _currentTimezone$spli = currentTimezone.split('/'),
					currentCont = _currentTimezone$spli[0],
					currCity = _currentTimezone$spli[1];

				var currentCity = currCity && currCity.split(' (')[0];
				var group = timezones.find(function(timezone) {
					return timezone.group === currentCont;
				});
				if (!group) {
					return currentTimezone;
				}
				var matchedTimezone = group.cities.find(function(c) {
					return c.indexOf(currentCity) > -1;
				});

				if (!matchedTimezone) return false;

				return group.group + '/' + matchedTimezone;
			};

			var timezone = setUpdatedTimezone(userTimezone) || setUpdatedTimezone(props.timezone.value) || props.timezone.value;

			if (window.timezonePickerCommon) {
				isTimezonePickerFromCommonLoaded = true;
				timezonePickerCommon = window.timezonePickerCommon({
					id: uniqueId,
					timezones: timezones,
					selectedTimezone: timezone,
					onOptionClick: onTimezoneOptionClick,
					usePortal: true
				});
			}

			setTimezone(timezone);
			var dateStr = Object.keys(qdata)[0];

			var _getDateRange2 = getDateRange(dateStr),
				startDate = _getDateRange2[0],
				endDate = _getDateRange2[1];

			updateMonthData(startDate, endDate, qdata);
			var _state18 = state,
				availableDays = _state18.availableDays;

			var newDate = availableDays.indexOf(dateStr) === -1 ? availableDays[0] : dateStr;

			constructed = true;

			setState({
				timezones: timezones,
				loading: false,
				date: newDate || dateStr,
				nyTz: nyTz
			});

			setTimeout(function() {
				if (input.value) {
					input.triggerEvent('change');
				}
			}, 100);
		};

		JotForm.appointments.listeners.push(construct);

		if (JotForm.appointments.initialData) {
			setTimeout(function() {
				construct({
					data: JotForm.appointments.initialData,
					timezones: JotForm.timezones,
					nyTz: JotForm.nyTz
				});
			}, requestTimeout);
		}

		JotForm.appointments[props.id.value] = {
			update: function update(newProps) {
				return _update(assignObject(passedProps, newProps));
			},
			forceStartDate: function forceStartDate(newDate) {
				if (!newDate) {
					setState({ forcedStartDate: undefined });
					return;
				}

				try {
					var forcedStartDate = new Date(newDate);
					if ('' + forcedStartDate === '' + state.forcedStartDate) return;
					var date = new Date(state.availableDays.find(function(d) {
						return new Date(d + ' 23:59:59') >= forcedStartDate;
					}));

					if (!date.getTime()) {
						date = forcedStartDate;
					}

					date = toDateStr(date);

					setState({ forcedStartDate: forcedStartDate, date: date });
				} catch (e) {
					console.log(e);
				}
			},
			forceEndDate: function forceEndDate(newDate) {
				if (!newDate) {
					setState({ forcedEndDate: undefined });
					return;
				}

				try {
					var forcedEndDate = new Date(newDate);
					if ('' + forcedEndDate === '' + state.forcedEndDate) return;
					var availableDays = state.availableDays.filter(function(d) {
						return new Date(d + ' 00:00:00') <= forcedEndDate;
					});

					var date = new Date(availableDays.indexOf(state.date) > -1 ? state.date : availableDays[availableDays.length - 1]);

					if (!date.getTime()) {
						date = forcedEndDate;
					}

					date = toDateStr(date);

					setState({ forcedEndDate: forcedEndDate, date: date });
				} catch (e) {
					console.log(e);
				}
			},
			getComparableValue: function getComparableValue() {
				return input.value && toDateTimeStr(dz(new Date(input.value.replace(/-/g, '/')), state.nyTz, getTimezoneOffset(props.timezone.value))) || '';
			}
		};

		return _update;
	})({ "text": { "text": "Question", "value": "Seleccionar Fecha y Hora" }, "labelAlign": { "text": "Label Align", "value": "Top", "dropdown": [["Auto", "Auto"], ["Left", "Left"], ["Right", "Right"], ["Top", "Top"]] }, "required": { "text": "Required", "value": "Yes", "dropdown": [["No", "No"], ["Yes", "Yes"]] }, "description": { "text": "Hover Text", "value": "", "textarea": true }, "slotDuration": { "text": "Slot Duration", "value": "20", "dropdown": [[15, "15 min"], [30, "30 min"], [45, "45 min"], [60, "60 min"], ["custom", "Custom min"]], "hint": "Select how long each slot will be." }, "startDate": { "text": "Start Date", "value": "" }, "endDate": { "text": "End Date", "value": "" }, "intervals": { "text": "Intervals", "value": [{ "from": "16:30", "to": "19:01", "days": ["Mon", "Tue", "Wed", "Thu", "Fri"] }], "hint": "The hours will be applied to the selected days and repeated." }, "useBlockout": { "text": "Blockout Custom Dates", "value": "No", "dropdown": [["No", "No"], ["Yes", "Yes"]], "hint": "Disable certain date(s) in the calendar." }, "blockoutDates": { "text": "Blockout dates", "value": [{ "startDate": "2021-02-09", "endDate": "2021-02-09" }] }, "useLunchBreak": { "text": "Lunch Time", "value": "No", "dropdown": [["No", "No"], ["Yes", "Yes"]], "hint": "Enable lunchtime in the calendar." }, "lunchBreak": { "text": "Lunchtime hours", "value": [{ "from": "12:00", "to": "14:00" }] }, "timezone": { "text": "Timezone", "value": "America/Argentina/Salta (GMT-03:00)" }, "timeFormat": { "text": "Time Format", "value": "AM/PM", "dropdown": [["24 Hour", "24 Hour"], ["AM/PM", "AM/PM"]], "icon": "images/blank.gif", "iconClassName": "toolbar-time_format_24" }, "months": { "value": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], "hidden": true }, "days": { "value": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"], "hidden": true }, "startWeekOn": { "text": "Start Week On", "value": "Sunday", "dropdown": [["Monday", "Monday"], ["Sunday", "Sunday"]], "toolbar": false }, "rollingDays": { "text": "Rolling Days", "value": "", "toolbar": false }, "appointmentType": { "hidden": true, "value": "single" }, "dateFormat": { "hidden": true, "value": "dd/mm/yyyy" }, "hidden": { "hidden": true, "value": "No" }, "maxAttendee": { "hidden": true, "value": "5" }, "maxEvents": { "hidden": true, "value": "6" }, "minScheduleNotice": { "hidden": true, "value": "12" }, "name": { "hidden": true, "value": "seleccionarFecha" }, "order": { "hidden": true, "value": "3" }, "qid": { "toolbar": false, "value": "input_3" }, "type": { "hidden": true, "value": "control_appointment" }, "id": { "toolbar": false, "value": "3" }, "qname": { "toolbar": false, "value": "q3_seleccionarFecha" }, "cdnconfig": { "CDN": "https://cdn.jotfor.ms/" }, "passive": false, "formProperties": { "products": false, "highlightLine": "Enabled", "coupons": false, "useStripeCoupons": false, "taxes": false, "comparePaymentForm": "", "paymentListSettings": false, "newPaymentUIForNewCreatedForms": "Yes", "formBackground": "#FFFFFF" }, "formID": 210981216484659, "themeVersion": "v2" });
	if (window.JotForm && JotForm.accessible) $('input_31').setAttribute('tabindex', 0);
	JotForm.newDefaultTheme = true;
	JotForm.extendsNewTheme = false;
	JotForm.newPaymentUIForNewCreatedForms = true;
	JotForm.newPaymentUI = true;
	JotForm.alterTexts({ "ageVerificationError": "Debe ser mayor de {minAge} años para enviar este formulario.", "alphabetic": "Este campo solo puede contener letras.", "alphanumeric": "Este campo solo puede contener letras y números.", "appointmentSelected": "Ha seleccionado {time} del {date}", "ccDonationMinLimitError": "La Cantidad Mínima es {minAmount} {currency}", "ccInvalidCVC": "El número CVC no es válido.", "ccInvalidExpireDate": "La fecha de expiración no es válida", "ccInvalidNumber": "El número de su tarjeta de crédito no es válido.", "ccMissingDetails": "Please fill up the credit card details.", "ccMissingDonation": "Favor ponga valores númericos en la cantidad a donar.", "ccMissingProduct": "Por favor seleccione al menos un producto.", "characterLimitError": "Demasiados caracteres. El límite es", "characterMinLimitError": "Muy pocos caracteres. El mínimum es", "confirmClearForm": "¿Está seguro que desea limpiar el formulario?", "confirmEmail": "El correo electrónico no coincide", "currency": "Este campo sólo puede contener valores de moneda.", "cyrillic": "Este campo solo puede contener caracteres cirílicos.", "dateInvalid": "Esta fecha no es valida. El formato de fecha es {format}", "dateInvalidSeparate": "Esta fecha no es válida. Ponga una {element} válida", "dateLimited": "Esta fecha no está disponible.", "disallowDecimals": "Por favor, introduzca un número entero.", "email": "Introduzca una dirección e-mail válida", "fillMask": "El valor de este campo debe llenar la mascara", "freeEmailError": "No se permiten cuentas de correo gratuitas", "generalError": "Existen errores en el formulario, por favor corríjalos antes de continuar.", "generalPageError": "Hay errores en esta página. Por favor, corríjalos antes de continuar.", "gradingScoreError": "El puntaje total debería ser sólo &amp;quot;menos que&amp;quot; o &amp;quot;igual que&amp;quot;", "incompleteFields": "Existen campos requeridos incompletos. Por favor complételos.", "inputCarretErrorA": "La entrada no debe ser inferior al valor mínimo:", "inputCarretErrorB": "La entrada debe ser menor al valor:", "lessThan": "Tu puntuación debería ser menor o igual que", "maxDigitsError": "El máximo de dígitos permitido es", "maxSelectionsError": "The maximum number of selections allowed is ", "minSelectionsError": "El número mínimo de opciones obligatorias es", "multipleFileUploads_emptyError": "El fichero {file} está vacío; por favor, selecciona de nuevo los ficheros sin él.", "multipleFileUploads_fileLimitError": "Solo {fileLimit} carga de archivos permitida.", "multipleFileUploads_minSizeError": "{file} is demasiado pequeño, el tamaño mínimo de fichero es: {minSizeLimit}.", "multipleFileUploads_onLeave": "Se están cargando los ficheros, si cierras ahora, se cancelará dicha carga.", "multipleFileUploads_sizeError": "{file} es demasiado grande; el tamaño del archivo no debe superar los {sizeLimit}.", "multipleFileUploads_typeError": "El fichero {file} posee una extensión no permitida. Sólo están permitidas las extensiones {extensions}.", "multipleFileUploads_uploadFailed": "File upload failed, please remove it and upload the file again.", "noSlotsAvailable": "No hay cupos disponibles", "noUploadExtensions": "File has no extension file type (e.g. .txt, .png, .jpeg)", "numeric": "Este campo sólo admite valores numéricos.", "pastDatesDisallowed": "La fecha debe ser futura", "pleaseWait": "Por favor, espere ...", "required": "Campo requerido.", "requireEveryCell": "Se requieren todas las celdas.", "requireEveryRow": "Todas las filas son obligatorias.", "requireOne": "Al menos un campo requerido.", "restrictedDomain": "This domain is not allowed", "slotUnavailable": "{time} del {date} ha sido tomada. Favor seleccionar otro espacio.", "uploadExtensions": "Solo puede subir los siguientes archivos:", "uploadFilesize": "Tamaño del archivo no puede ser mayor que:", "uploadFilesizemin": "Tamañao de archivo no puede ser menos de:", "url": "Este campo solo contiene una URL válida.", "validateEmail": "You need to validate this e-mail", "wordLimitError": "Demasiadas palabras. El límite es", "wordMinLimitError": "Muy pocas palabras. El mínimo es" });
	JotForm.clearFieldOnHide = "disable";
	JotForm.submitError = "jumpToFirstError";
	/*INIT-END*/
});

JotForm.prepareCalculationsOnTheFly([null, { "name": "sacarTurno", "qid": "1", "text": "Sacar Turno", "type": "control_head" }, null, { "name": "seleccionarFecha", "qid": "3", "text": "Seleccionar Fecha y Hora", "type": "control_appointment" }, null, { "name": "nombreY5", "qid": "5", "text": "Nombre y Apellido del Paciente", "type": "control_fullname" }, { "name": "numeroDe", "qid": "6", "text": "Numero de Tel\u002FCel", "type": "control_phone" }, null, null, { "name": "input9", "qid": "9", "text": "HORARIOS DE ATENCION MARTES Y JUEVES DE 16:30 A 19:00 - UNICAMENTE PAMI", "type": "control_text" }, null, null, null, null, null, null, null, null, null, null, null, null, { "name": "tags", "qid": "22", "text": "Tags", "type": "control_checkbox" }, null, null, null, null, null, { "name": "motivoDel", "qid": "28", "text": "Motivo Del Turno", "type": "control_widget" }, null, { "name": "enviar", "qid": "30", "text": "Enviar", "type": "control_button" }, { "name": "dni", "qid": "31", "subLabel": "Dni", "text": "DNI", "type": "control_textbox" }]);
setTimeout(function() {
	JotForm.paymentExtrasOnTheFly([null, { "name": "sacarTurno", "qid": "1", "text": "Sacar Turno", "type": "control_head" }, null, { "name": "seleccionarFecha", "qid": "3", "text": "Seleccionar Fecha y Hora", "type": "control_appointment" }, null, { "name": "nombreY5", "qid": "5", "text": "Nombre y Apellido del Paciente", "type": "control_fullname" }, { "name": "numeroDe", "qid": "6", "text": "Numero de Tel\u002FCel", "type": "control_phone" }, null, null, { "name": "input9", "qid": "9", "text": "HORARIOS DE ATENCION MARTES Y JUEVES DE 16:30 A 19:00 - UNICAMENTE PAMI", "type": "control_text" }, null, null, null, null, null, null, null, null, null, null, null, null, { "name": "tags", "qid": "22", "text": "Tags", "type": "control_checkbox" }, null, null, null, null, null, { "name": "motivoDel", "qid": "28", "text": "Motivo Del Turno", "type": "control_widget" }, null, { "name": "enviar", "qid": "30", "text": "Enviar", "type": "control_button" }, { "name": "dni", "qid": "31", "subLabel": "Dni", "text": "DNI", "type": "control_textbox" }]);
}, 20); 
