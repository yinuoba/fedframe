define(function(require, exports, module) {
	var industryTpl = $('<div/>').attr({"id": "industryTpl"}).load('/public/tpl/industry.html');

	require.async('./industry.css');
	$.extend({
		weiboTree: function(customOpt) {
			var defaultOptions = {
				multiSelect: true,
				callback: null,
				showTips: true,
				forceQuestionType: false,
				noteTreeId: "weiboTreeSelectedList",
				questionNoteTreeId: "weiboTreeSelectedQuestionList",
				mainDiv: "#weiboTree-main",
				treeDiv: "#weiboTree",
				selectedDiv: "#weiboTree-selectedList",
				tipsDiv: "#weiboTree-tipsArea",
				tipsQuestionDiv: "#weiboTree-tipsArea-question",
				searchDiv: "#weiboTree-searchArea",
				statusDiv: "#weiboTree-status",
				notFoundDiv: "#weiboTree-notFound",
				saveBtn: "#weiboTree-saveBtn",
				tradeBtn: "#weiboTree-tradeBtn",
				corpBtn: "#weiboTree-corpBtn",
				questionBtn: "#weiboTree-questionBtn",
				tradeBtnSOn: "#weiboTree-tradeBtn-small-on",
				tradeBtnSOff: "#weiboTree-tradeBtn-small-off",
				corpBtnSOn: "#weiboTree-corpBtn-small-on",
				corpBtnSOff: "#weiboTree-corpBtn-small-off",
				closeBtn: "#weiboTree-closeBtn"
			}, setting = {}, _this = this;
			var loadedData = new Array();
			var queryType;
			var isQuestion = false;
			var questionIds = [];
			var sourceTree = "";
			$.extend(setting, defaultOptions, customOpt);
			$.extend(this, {
				printSetting: function() {
					console.log(setting)
				},
				init: function() {
					_this.close();
					$(setting.selectedDiv).empty();
					$(setting.selectedDiv).append("<ul/>");
					$(setting.closeBtn).unbind("click").click(function() {
						_this.save();
						_this.close();
					});
					$(setting.tradeBtn + "," + setting.tradeBtnSOn + "," + setting.tradeBtnSOff).unbind("click").click(function() {
						_this.trade();
					});
					$(setting.corpBtn + "," + setting.corpBtnSOn + "," + setting.corpBtnSOff).unbind("click").click(function() {
						_this.corp();
					});
					$(setting.questionBtn).unbind("click").click(function() {
						isQuestion = true;
						$(setting.tipsQuestionDiv).hide();
						_this.getQuestionList();
					});
					loadedData['trade'] = [];
					loadedData['corp'] = [];

					if (setting.source && setting.source.tree) {
						sourceTree = setting.source.tree;
						if (sourceTree && sourceTree.length > 0) {
							$(setting.selectedDiv).empty().append(sourceTree);
						}
						if (setting.source.queryType) {
							queryType = setting.source.queryType;
						}
					}
					// 按enter搜索
					$(setting.searchDiv + " :text").unbind("keydown").bind('keydown', function(e) {
						if (e.keyCode == 13) {
							_this.innerSearch($.trim(this.value));
						}
					});

					// 清空上一次的搜索条件
					$(setting.searchDiv + " :text").val('');
				},
				trade: function() {
					queryType = "trade";
					_this.getList();
					$(setting.searchDiv + " :button").unbind("click").click(function() {
						_this.innerSearch($(this).val());
					});
					$(setting.saveBtn).unbind("click").click(function() {
						_this.save();
					});
					upgTool.removeErrorMsg();
				},
				corp: function() {
					queryType = "corp";
					_this.getList();
					$(setting.searchDiv + " :button").unbind("click").click(function() {
						_this.search($(this).val());
					});
					$(setting.saveBtn).unbind("click").click(function() {
						_this.save();
					});
				},
				open: function(forceOpen) {
					upgTool.removeErrorMsg();
					isQuestion = false;
					$(setting.treeDiv + " .pageNav").remove();
					if (!_this.isQuestionExists() || !_this.isDataExists() || forceOpen) {
						if (_this.isDataExists()) {
							$(setting.tipsDiv).hide();
							$(setting.tipsQuestionDiv).show();
							$(setting.treeDiv).show();
							$(setting.searchDiv).hide();
							$(setting.notFoundDiv).hide();
							if (_this.isQuestionExists()) {
								isQuestion = true;
								_this.getQuestionList();
							} else {
								_this.openQuestion();
							}
						} else {
							$(setting.tipsDiv).show();
							$(setting.tipsQuestionDiv).hide();
							if ($(setting.statusDiv).length > 0) {
								$(setting.statusDiv).show();
							}
							$(setting.treeDiv).show();
							$(setting.searchDiv).hide();
							$(setting.notFoundDiv).hide();
						}

						if (!setting.showTips) {
							_this.setTreeDivPos();
						}
					}
				},
				setTreeDivPos: function() {
					var getCenterPos = function($obj) {
						var $window = $(window);
						var offset = $obj.offset();

						var left = Math.round(Math.max($window.width() - $obj.outerWidth(), 0) / 2);
						var top = Math.round(Math.max($window.height() - $obj.outerHeight(), 0) / 3) + $window.scrollTop();

						return {
							"top": top,
							"left": left
						};
					}
					var $boxPos = getCenterPos($(setting.treeDiv));
					$(setting.treeDiv).css({
						"position": "absolute",
						"top": $boxPos.top,
						"left": "-350px"
					});
					$(setting.searchDiv + " :button").css({
						//"margin-left": "-25px"
					});

					$(setting.treeDiv).css({
						"zIndex": upgTool.getHighestZIndex() + 2
					});
				},
				openQuestion: function() {
					$(setting.saveBtn).unbind("click").click(function() {
						_this.save();
					});
					$(setting.searchDiv).hide();
					$(setting.notFoundDiv).hide();
					$(setting.treeDiv + " .pageNav").remove();
					$(".cntBoxMainCenter01").remove();
					$(setting.treeDiv).show();
					$(setting.saveBtn).hide();
					if (!setting.showTips) {
						_this.setTreeDivPos();
					}
					if (setting.showTips) {
						$(setting.tipsDiv).hide();
						$(setting.tipsQuestionDiv).show();
						if (queryType == "trade") {
							$(setting.tradeBtnSOn).show();
							$(setting.tradeBtnSOff).hide();
							$(setting.corpBtnSOn).hide();
							$(setting.corpBtnSOff).show();
						} else {
							$(setting.tradeBtnSOn).hide();
							$(setting.tradeBtnSOff).show();
							$(setting.corpBtnSOn).show();
							$(setting.corpBtnSOff).hide();
						}
					} else {
						$(setting.tipsDiv).hide();
						$(setting.tipsQuestionDiv).hide();
					}
				},
				getList: function() {
					$(setting.saveBtn).show();
					$(setting.tipsDiv).hide();
					$(setting.tipsQuestionDiv).hide();
					$(setting.searchDiv).show();
					$(setting.notFoundDiv).hide();
					setting.target.questionStr.val("");
					setting.target.qType.val("");
					var data = setting.target.questionStr.data("weiboTree");
					if (data) {
						if (data.queryType != queryType) {
							isQuestion = false;
							$(setting.statusDiv + " > img").attr("src", "/public/image/industry/choose_img1.png");
							setting.target.questionStr.removeData("weiboTree");
							$(setting.selectedDiv + " > ul").empty();
							questionIds = [];
						} else {
							if (_this.isQuestionExists()) {
								questionIds = setting.target.questionStr.data("weiboTree").questionIds;
							}
							$(setting.selectedDiv).html(data.tree);
						}
					}
					_this.nextLv(null, queryType);
				}, // end list
				nextLv: function(clickedObj, type, p, auto) {
					// clickedObj = checkbox. if clickedObj is null, it will load lv1 inside mainDiv 
					var curLv = 0;
					var objVal = 0;
					var postOpt = {
						queryType: type
					};
					if (clickedObj) {
						clickedObj = $(clickedObj);
						curLv = clickedObj.attr("level");
						objVal = clickedObj.val();
						$.extend(postOpt, {
							id: objVal
						});
						if ($(clickedObj).prop("checked") || auto) {
							$(clickedObj).after('<img src="/public/image/load/icon_waiting.gif" width="15">');
							$(clickedObj).hide();
						}
					} else {
						$(setting.mainDiv).html('<img src="/public/image/load/icon_waiting.gif">');
					}
					if (type == 'corp') {
						p = p == null ? 0 : p;
						var term = curLv == 0 ? $(setting.searchDiv + " :input").val() : "";
						$.extend(postOpt, {
							p: p,
							limit: "10",
							term: term
						});
					}

					var nextLv = parseInt(curLv) + 1;
					if (nextLv == 2 || nextLv == 3 || nextLv == 4) {
						$(".cntBoxMainCenter0" + nextLv).remove();
					}

					if ((curLv == 1 || curLv == 3) && clickedObj && !clickedObj.prop("checked")) {
						return;
					}

					// check loadedData exists
					var opt = {
						clickedObj: clickedObj,
						type: type,
						curLv: curLv,
						objVal: objVal,
						nextLv: nextLv,
						postOpt: postOpt
					}
					// always load lv1 corp data from server 
					if ((queryType == "trade" || (queryType == 'corp' && curLv > 0)) && loadedData[queryType].length > 0 && loadedData[queryType][objVal]) {
						$.extend(opt, {
							json: loadedData[queryType][objVal]
						});
						if (loadedData[queryType][objVal].data && loadedData[queryType][objVal].data.length > 0) {
							_this.doNextLv(opt);
						} else {
							clickedObj.show();
							clickedObj.siblings("img").remove();
						}
					} else {
						$.post("/index.php/Financing/CorpFinancing/api_trade", postOpt, function(json) {
							if (json.boolen == "1") {
								if (queryType == 'corp') {
									json = json.data;
									if (curLv == 0) {
										$(setting.notFoundDiv).show();
										if (json && json.data && json.data.length == 0) {
											$(setting.notFoundDiv).html('找不到企业。请修改关键字').show();
											$(setting.mainDiv + " > img").remove();
											$(setting.saveBtn).hide();
										} else {
											$(setting.notFoundDiv).html('找到 ' + json.count + ' 家企业。').show();
											$(setting.saveBtn).show();
										}
									}
								}
								loadedData[queryType][objVal] = json;
								$(setting.treeDiv).data("loadedData", loadedData);
								if (json && json.data && json.data.length > 0) {
									$.extend(opt, {
										json: json
									});
									_this.doNextLv(opt);
								} else {
									clickedObj.show();
									clickedObj.siblings("img").remove();
								}
							}
						}, "json");
					}
				}, // end nextLv
				doNextLv: function(opt) {
					var clickedObj = opt.clickedObj;
					var type = opt.type;
					var curLv = opt.curLv;
					var objVal = opt.objVal;
					var nextLv = opt.nextLv;
					var postOpt = opt.postOpt;
					var json = opt.json;

					var div = $('<div/>').addClass("cntBoxMainCenter0" + nextLv);
					var closeBtn_wrap = $('<div/>').addClass("close_wrap");
					if (curLv == 1) {
						div.addClass("dn");
					}
					var closeBtn = $("<a/>").addClass("del");
					closeBtn.click(function() {
						div.remove();
					});
					// special css setting for 制造业 (way too much lv2 items) [id=132]
					if (curLv == 1 && objVal == "132") {
						div.css({
							"width": "500px",
							"max-width": "500px",
							"height": "300px",
							"overflow": "auto"
						});
						closeBtn.css({
							"left": "470px"
						});
					}
					if (nextLv == 2 || nextLv == 4) {
						div.append(closeBtn_wrap.append(closeBtn));
					}

					var ul = $("<ul/>");
					div.append(ul);
					for (var i = 0; i < json.data.length; i++) {
						var textlength = 0;
						if (nextLv == 1) {
							textlength = 10;
						} else if (nextLv == 3) {
							textlength = 12;
						} else if (nextLv == 4) {
							textlength = 10;
						}
						var labelName = type == "corp" ? json.data[i].corp_name : json.data[i].trade_name_cn;
						var labelFor = json.data[i].id;
						var label = $('<label></label>').attr("for", labelFor).html(labelName);
						if (textlength > 0) {
							label.attr("textlength", textlength);
						}
						if (nextLv == 2) {
							label.addClass("acolor1");
						}
						var checkbox = $("<input/>").attr("type", "checkbox").attr("id", json.data[i].id).attr("value", json.data[i].id).attr("parent", objVal).attr("level", nextLv);
						if ($(setting.selectedDiv + " label[for='selected-" + json.data[i].id + "']").length > 0) {
							checkbox.prop("checked", "checked");

							var allowEdit = true;
							if ($(setting.selectedDiv + " label[for='selected-" + json.data[i].id + "']").attr("allowEdit")) {
								allowEdit = $(setting.selectedDiv + " label[for='selected-" + json.data[i].id + "']").attr("allowEdit") === "true" ? true : false;
							}
							if (!allowEdit) {
								checkbox.prop("disabled", true);
							}
						}
						checkbox.click(function() {
							eventSelect(this);
						});
						var a = $("<a/>").append(checkbox).append(label);
						var li = $('<li/>').append(a);
						ul.append(li);

						//if (nextLv==2) {
						//_this.nextLv(checkbox, type, 0, true);
						//}

						checkbox.parent("a").hover(function() {
							if ($(this).find("img").length == 0) {
								eventHover(this);
							}
						}, function() {});
					}
					upgTool.textLength(div);

					if (curLv == 0) {
						$(setting.mainDiv).html(div);
					} else {
						// remove loading img
						clickedObj.show();
						clickedObj.siblings("img").remove();

						var a = clickedObj.parent("a");
						a.after(div);
						var pos = a.position();
						if (nextLv == 2) {
							var isOutsideViewPort = (a.offset().left + a.innerWidth() + div.outerWidth()) > ($("div.main_area").outerWidth() + $("div.main_area").position().left) ? true : false;
							var left = isOutsideViewPort ? "-216px" : pos.left + a.innerWidth();
							div.css({
								top: pos.top,
								left: pos.left + a.innerWidth(),
								position: "absolute"
							});
						}
					}

					div.show();
					if (queryType == "corp") {
						var preDiv = $("<div/>").addClass("fl").addClass("pageNav").css({
							"padding-left": "185px",
							"padding-top": "10px",
							"cursor": "pointer"
						}).html("上一页").click(function() {
							_this.nextLv(null, queryType, (json.nowPage - 1));
						});

						var nextDiv = $("<div/>").addClass("fr").addClass("pageNav").css({
							"padding-right": "30px",
							"padding-top": "10px",
							"cursor": "pointer"
						}).html("下一页").click(function() {
							_this.nextLv(null, queryType, (json.nowPage + 1));
						});

						if (json.nowPage + 1 <= json.totalPages) {
							div.after(nextDiv);
						}
						if (json.nowPage - 1 >= 1) {
							div.after(preDiv);
						}
					}

					function eventHover(obj) {
						var checkbox = $(obj).children(":checkbox");
						if (checkbox.prop("checked")) {
							if (!$(obj).siblings("div .cntBoxMainCenter0" + (nextLv + 1)).is(":visible")) {
								$(obj).siblings("div .cntBoxMainCenter0" + (nextLv + 1)).remove();
								eventSelect(checkbox);
							}
						}
					}

					function eventSelect(obj) {
						_this.doSelect(obj);
						//if (nextLv==1 || nextLv==3) {
						_this.nextLv(obj, type);
						$(setting.treeDiv).find(":checkbox[level='" + nextLv + "']").parent("a").removeClass("afocus");
						if ($(obj).prop("checked")) {
							$(obj).parent("a").addClass("afocus");
						}
						//}
						if (nextLv == 2) {
							if ($(obj).prop("checked")) {
								$(obj).parent("a").parent("li").addClass("lifocus");
							} else {
								$(obj).parent("a").parent("li").removeClass("lifocus");
							}
						}
					}
				}, // end doNextLv
				doSelect: function(obj) {
					obj = $(obj);
					if (!obj.prop("checked")) {
						$(setting.selectedDiv + " label[for='selected-" + obj.val() + "']").parent("li").remove();
						if (obj.attr("level") == 2) {
							$(setting.treeDiv).find(":checkbox[parent='" + obj.attr("id") + "']").removeAttr("checked");
							$(".cntBoxMainCenter04").remove();
						}
					} else if ($(setting.selectedDiv + " label[for='selected-" + obj.val() + "']").length <= 0) {
						if (!setting.multiSelect) {
							$(setting.treeDiv).find(":checkbox[level='" + obj.attr("level") + "'][id!='" + obj.attr("id") + "']").each(function() {
								$(this).removeAttr("checked");
								_this.doSelect(this);
							});
						}

						// check parent when child is checked
						var orginalParent = $(setting.treeDiv).find(":checkbox[id='" + obj.attr("parent") + "']");
						if (!orginalParent.prop("checked")) {
							orginalParent.prop("checked", "checked");
							_this.doSelect(orginalParent);
						}
						var liClass = obj.attr("parent") == 0 ? "" : " class='leaf'";
						var liObjLabelText = obj.siblings("label").attr("full-text") ? obj.siblings("label").attr("full-text") : obj.siblings("label").html();
						var liObj = '<li' + liClass + '><div></div><label for="selected-' + obj.val() + '">' + liObjLabelText + '</label></li>';
						var parentObj = $(setting.selectedDiv + " label[for='selected-" + obj.attr("parent") + "']");
						if (parentObj.length == 0) {
							$(setting.selectedDiv + " > ul").append(liObj);
						} else {
							if (parentObj.siblings("ul").length == 0) {
								parentObj.parent("li").append("<ul/>");
							}
							parentObj.siblings("ul").append(liObj);
						}
					}
				}, // end doSelect
				getQuestionList: function() {
					isQuestion = true;
					if (!_this.isQuestionExists()) {
						$(setting.saveBtn).hide();
					} else {
						$(setting.saveBtn).show();
					}

					_this.nextQuestionLv(null);

					var data = setting.target.questionStr.data("weiboTree");
					if (data) {
						$(setting.selectedDiv).html(data.tree);
					}
				}, // getQuestionList
				nextQuestionLv: function(clickedObj) {
					var curLv = 0;
					var objVal = 0;
					var nextLv = parseInt(curLv) + 1;
					var div = $('<div/>').addClass("cntBoxMainCenter01");
					var ul = $("<ul/>");
					div.append(ul);
					if (!clickedObj) {
						$(setting.mainDiv).html(div);
					}

					// clickedObj = a. if clickedObj is null, it will load lv1 inside mainDiv
					$.post("/index.php", {
						app: "home",
						mod: "User",
						act: "getQuestionTypeByAjax"
					}, function(json) {
						if (json.boolen == "1") {
							var questionIdsObj = [];
							if (_this.isQuestionExists()) {
								questionIdsObj = setting.target.questionStr.data("weiboTree").questionIds;
							} else {
								if (setting.source && setting.source.questions) {
									var sourceQuestion = setting.source.questions;
									$(sourceQuestion).find("li>label").each(function() {
										questionIdsObj.push({
											id: $(this).attr("qid"),
											name: $(this).html(),
											allowEdit: $(this).attr("allowEdit")
										});
									});
								}
							}

							for (var i = 0; i < json.data.length; i++) {
								var label = $("<label></label>").attr("for", json.data[i].id).html(json.data[i].type_name);
								label.attr("textlength", "10");
								var a = $("<a/>").append(label);
								a.hover(function() {
									$(setting.treeDiv + " .cntBoxMainCenter02").hide();
									$(setting.treeDiv).find("a").removeClass("afocus");
									$(this).siblings("div.cntBoxMainCenter02").show();
									$(this).addClass("afocus");
								}, function() {

								});
								var li = $('<li/>').append(a);
								ul.append(li);

								if (json.data[i].nextList.length > 0) {
									var nl_div = $('<div/>').addClass("cntBoxMainCenter02").addClass("dn");
									var nl_pos = a.position();
									nl_div.css({
										top: nl_pos.top,
										left: nl_pos.left + a.innerWidth(),
										position: "absolute"
									});
									var close_wrap = $("<div/>").addClass("close_wrap");
									var closeBtn = $("<a/>").addClass("del");
									closeBtn.click(function() {
										$(this).parent(".cntBoxMainCenter02").hide();
									});
									//nl_div.append(close_wrap);
									closeBtn.append(close_wrap);

									var nl_ul = $("<ul/>");
									nl_div.append(nl_ul);
									a.after(nl_div);
									$.each(json.data[i].nextList, function(j, nextList) {
										var nl_label = $("<label></label>").attr("for", nextList.id).html(nextList.type_name);
										var isCheck = false;
										var allowEdit = true;
										for (qidCount in questionIdsObj) {
											if (questionIdsObj[qidCount].id == nextList.id) {
												isCheck = true;
												allowEdit = questionIdsObj[qidCount].allowEdit === "false" ? false : true;
											}
										}
										var nl_checkbox = $("<input/>").attr("type", "checkbox").attr("id", nextList.id).attr("value", nextList.id).attr("parent", objVal).attr("level", nextLv).attr("name", "questionId");
										if (isCheck) {
											nl_checkbox.prop("checked", "checked");
											if (!allowEdit) {
												nl_checkbox.prop("disabled", true);
											}
										}
										nl_checkbox.click(function() {
											$(setting.saveBtn).show();
										});
										var nl_a = $("<a/>").append(nl_checkbox).append(nl_label);
										var nl_li = $('<li/>').append(nl_a);
										nl_ul.append(nl_li);
									});
								}
							}
							initTextlength(div);
						}
					}, "json");

					function eventSelect(obj) {
						_this.doSelect(obj);
						if (nextLv == 1 || nextLv == 3) {
							_this.nextLv(obj, type);
							$(setting.treeDiv).find(":checkbox[level='" + nextLv + "']").parent("a").removeClass("afocus");
							if ($(obj).prop("checked")) {
								$(obj).parent("a").addClass("afocus");
							}
						}
					}
				}, //end nextQuestionLv
				save: function() {
					var result = [];
					var questions = questionIds;
					var questionStr = "";
					var obj = $(setting.selectedDiv + " > ul");
					getRecursiveTree(obj);

					if ($("input[name='questionId']").length > 0) {
						if ($("input[name='questionId']:checked").length > 0) {
							questions = [];
							$("input[name='questionId']:checked").each(function() {
								var x = {};
								x.id = $(this).val();
								x.name = $(this).siblings("label").html();
								x.allowEdit = $(this).prop("disabled") ? "false" : "true";
								questions.push(x);
							});
						}
					} else {
						if (setting.source && setting.source.questions) {
							questions = [];
							$(setting.source.questions).find("li>label").each(function() {
								questions.push({
									id: $(this).attr("qid"),
									name: $(this).html(),
									allowEdit: $(this).attr("allowEdit")
								});
							});
						}
					}

					//questionStr=A1=1,2,3|A2=2,3,4
					for (var i = 0; i < result.length; i++) {
						if (questionStr.length > 0) {
							questionStr += "|";
						}
						var questionStrIdArr = [];
						$.each(questions, function(i) {
							var questionsId = typeof(questions[i].allowEdit) == "undefined" || questions[i].allowEdit === "true" ? questions[i].id : 0;
							questionStrIdArr.push(questionsId);
						})
						var resultId = typeof(result[i].allowEdit) == "undefined" || result[i].allowEdit === "true" ? result[i].id : 0;
						if (typeof(result[i].allowEdit) == "undefined" || result[i].allowEdit === "true" || questionStrIdArr.length > 0) {
							// check all zero case
							var allZero = true;
							for (z in questionStrIdArr) {
								if (questionStrIdArr[z] != 0) {
									allZero = false;
								}
							}
							if (resultId != 0 || !allZero) {
								questionStr += resultId + "=" + questionStrIdArr.join(",");
							}
						}
					}

					var data = {};
					if (result.length > 0 || setting.forceQuestionType) {
						var selectedQuestion = '';
						$.each(questions, function(i, question) {
							selectedQuestion += '<li>' + question.name + '</li>';
						})
						selectedQuestion = '<div id="' + setting.questionNoteTreeId + '"><ul>' + selectedQuestion + '</ul></div>';

						var html = '<div id="' + setting.noteTreeId + '" class="dn"><table class="tableTreeView"><tr>';
						html += '<td class="tableTreeView_left tabletdtreeviewList" valign="top">' + $(setting.selectedDiv).html() + '</td>';
						if (questions.length > 0 && setting.showTips) {
							html += '<td class="tableTreeView_right" valign="top">' + selectedQuestion + '</td>';
						}
						html += '</tr></table></div>';

						$.extend(data, {
							tree: $(setting.selectedDiv).html(),
							queryType: queryType,
							questionStr: questionStr,
							questionIds: questions,
							noteTree: html,
							noteQuestion: selectedQuestion,
							result: result
						})
						setting.target.questionStr.val(questionStr);
						setting.target.qType.val(queryType);
						setting.target.questionStr.data("weiboTree", data);

						if ($(setting.statusDiv).length > 0) {
							$(setting.statusDiv).attr("note", "weiboTreeSelectedList");
							$(setting.statusDiv).attr("note-options", '{"gravity":"nw"}');

							$("#weiboTreeSelectedList").remove();
							$(setting.statusDiv).after(html);
							initNote($(setting.statusDiv));
						}

						if (!isQuestion && setting.showTips) {
							_this.openQuestion();
						} else {
							_this.close();
						}
					}
					var cb;
					if (setting.callback && typeof setting.callback.fun === 'function') {
						$.extend(data, setting.callback);
						cb = setting.callback.fun(data);
					}

					if ($(setting.statusDiv).length > 0) {
						if (result.length > 0) {
							var img = $(setting.statusDiv + " > img");
							if (queryType == 'trade') {
								var imgSrc = isQuestion && questions.length > 0 ? "/public/image/industry/choose_img11.png" : "/public/image/industry/choose_img8.png";
								img.attr("src", imgSrc);
								if (!img.attr("binded")) {
									img.attr("binded", "binded");
									img.click(function() {
										_this.open(true);
									});
								}
							} else if (queryType == 'corp') {
								var imgSrc = isQuestion && questions.length > 0 ? "/public/image/industry/choose_img10.png" : "/public/image/industry/choose_img7.png";
								img.attr("src", imgSrc);
								if (!img.attr("binded")) {
									img.attr("binded", "binded");
									img.click(function() {
										_this.open(true);
									});
								}
							}
						}
					}

					function getRecursiveTree(obj, arr) {
						arr = arr || [];
						obj.children("li").each(function() {
							$(this).children("label[for^='selected']").each(function() {
								var ulObj = $(this).siblings("ul");
								if (ulObj.length > 0 && $("li", ulObj).length > 0) {
									getRecursiveTree(ulObj, arr);
								} else {
									var x = {};
									x.id = $(this).attr("for").replace("selected-", "");
									x.name = $(this).attr("full-text") ? $(this).attr("full-text") : $(this).html();
									x.allowEdit = $(this).attr("allowEdit");
									result.push(x);
								}
							});
						});
					} // end getRecursiveTree
				}, // end save
				innerSearch: function() {
					var s = $(setting.searchDiv + " :input").val();
					var num = 0;
					var liNum = 0;
					$('li#noDataSearchLi', $(setting.treeDiv + " .cntBoxMainCenter01 > ul")).remove();
					$(setting.treeDiv + " .cntBoxMainCenter02").remove();
					$(setting.treeDiv + " .cntBoxMainCenter01 > ul > li").show();
					$(setting.treeDiv + " .cntBoxMainCenter01 > ul > li").each(function() {
						liNum ++;
						if (s.length == 0) {
							$(this).show();
						} else {
							var fullText = $("label", this).attr("full-text");
							if (fullText) {
								if (fullText.indexOf(s) < 0) {
									$(this).hide();
									num++;
								}
							} else {
								if ($("label", this).is(":contains('" + s + "')")) {} else {
									num++;
									$(this).hide();
								}
							}
						}
					})
					if(num == liNum){
						$(setting.treeDiv + " .cntBoxMainCenter01 > ul").append($('<li id="noDataSearchLi"/>').html('无数据'));
					}
				}, // end innerSearch
				search: function() {
					_this.nextLv(null, queryType);
				}, // end search
				isDataExists: function() {
					if (setting.target.questionStr.data("weiboTree")) {
						if (setting.target.questionStr.data("weiboTree").questionStr.length > 0) {
							return true;
						}
					}
					return false;
				},
				isQuestionExists: function() {
					if (setting.target.questionStr.data("weiboTree")) {
						if (setting.target.questionStr.data("weiboTree").questionIds.length > 0) {
							return true;
						}
					}
					return false;
				},
				close: function() {
					$(".cntBoxMainCenter01").remove();
					if (!isQuestion) {
						$(setting.selectedDiv + " > ul").empty();
					}
					$(setting.saveBtn).hide();
					$(setting.treeDiv).hide();
					$(setting.searchDiv + " :input").val();

					if ($(setting.statusDiv).length > 0) {
						if (setting.target.questionStr.data("weiboTree")) {
							if (setting.target.questionStr.data("weiboTree").questionStr.length <= 0) {
								$(setting.statusDiv).hide();
							}
						} else {
							$(setting.statusDiv).hide();
						}
					}
				}, // end close
				reset: function() {
					if ($(setting.statusDiv).length > 0) {
						$(setting.statusDiv + " > img").attr("src", "/public/image/industry/choose_img1.png");
						$(setting.statusDiv).hide();
					}
					setting.target.questionStr.removeData("weiboTree");
					setting.target.questionStr.val("");
					setting.target.qType.val("");
					$(setting.selectedDiv + " > ul").empty();
					_this.close();
				},
				destory: function() {
					$(setting.closeBtn).unbind("click");
					$(setting.tradeBtn).unbind("click");
					$(setting.corpBtn).unbind("click");
					$(setting.saveBtn).unbind("click");
					_this.close();
				}
			}); // end weiboTree inner property

			return this;
		} // end weiboTree
	});
	exports.tpl = industryTpl;
});