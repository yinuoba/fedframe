define(function(require, exports, module) {
	require.async('./passwordRate.css');

	function getPasswordRate(str, username) {
		var commonWord = ["123456", "admin", "admin123"];
		var UPPER = /[A-Z]/,
			DIGIT = /[0-9]/,
			SPECIAL = /[^a-zA-Z0-9]/,
			SAME = /^(.)\1+$/;

		if (str.length < 6) {
			return 0;
		}
		if (SAME.test(str)) {
			return 1;
		}
		if ($.inArray(str, commonWord) >= 0) {
			return 0;
		}

		var rate = 0;
		if (DIGIT.test(str)) {
			rate++;
		}

		if (SPECIAL.test(str)) {
			rate++;
		}

		if (UPPER.test(str)) {
			rate++;
		}

		if (str.length >= 8) {
			rate++;
		}

		return rate;
	}

	function setPasswordRate(pwd) {
		var rate = getPasswordRate(pwd, '{$userInfo.detail.email}');
		$("#strength_L").removeClass("strengthL");
		$("#strength_L").removeClass("strengthLL");
		$("#strength_M").removeClass("strengthM");
		$("#strength_H").removeClass("strengthH");
		$("#strength_H").removeClass("strengthHH");
		switch (rate) {
			case 0:
				$("#strength_L").addClass("strengthLL");
				break;
			case 1:
				$("#strength_L").addClass("strengthL");
				break;
			case 2:
				$("#strength_M").addClass("strengthM");
				break;
			case 3:
				$("#strength_H").addClass("strengthH");
				break;
			case 4:
				$("#strength_H").addClass("strengthHH");
				break;
		}
	}

	exports.init = setPasswordRate;
});