/**
 * 列表排序
 * @param  {[type]} require [description]
 * @param  {[type]} exports [description]
 * @param  {[type]} module  [description]
 * @return {[type]}         [description]
 */
define(function(require, exports, module) {
	require.async('orderlist/orderlist.css');
	// 排序
	function sortList($form, order_field, order_type) {
		$("[name='order']", $form).val(order_field + "|" + order_type);
		upgTool.refreshForm($form);
	}

	// 初始化
	function initOrderField($form) {
		// 初始化需要排序的字段
		$("[order_field]").each(function() {
			var $this = $(this);
			var $form = $form || $this.closest('form');
			// 创建order隐藏域
			var $order = $('input[name="order"]', $form);
			if(!$order.length){
				$form.append($('<input type="hidden" name="order" />'));
			}

			// 根据属性创建箭头及给箭头添加事件
			if (!$this.data("initOrderField")) {
				$this.data("initOrderField", "1");

				var order_field = $this.attr("order_field");
				var order_type = $this.attr("order_type");

				var $a = $("<a/>").attr("href", "javascript:;").addClass("updown_sort").click(function() {
					var order_type_ = order_type == "desc" ? "asc" : "desc";
					sortList($form, order_field, order_type_);
				});

				var value = $this.html();

				$a.html(value).append($('<i class="sort_normal" />'));

				$this.html('').append($a);

				if (order_type) {
					$this.find("a>i").replaceWith($('<i class="sort_' + order_type + '"/>'));
				}
			}
		})
	}
	exports.init = initOrderField;
});