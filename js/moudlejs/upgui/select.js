define(function(require, exports, module){
  var uiselect = function(){
    this.speed = 100;

    var me = this;
    this.ui = function(jqwrapper){
      var jqselect = jqwrapper.children('select');
      if(!jqselect.length) return;

      // 元素初始化
      var field_name = jqselect.attr('name'),
          selected = jqselect.children("option:selected"),
          init_text = selected.text(),
          init_value = selected.val(),
          ops = jqselect.children('option');

      var input_show = $('<input>').attr('class', 'inputCommon').attr('readonly', 'readonly').val(init_text).appendTo(jqwrapper),
          arrow = $('<i>').attr('class', 'ui_select_arrow').text('▼').appendTo(jqwrapper),
          ul = $('<ul>').attr('class', 'ui_select_ul').hide().appendTo(jqwrapper),
          input_hidden = $('<input>').attr('type', 'hidden').attr('name', field_name).val(init_value).appendTo(jqwrapper);
      // 表单验证属性
      if(typeof jqselect.attr('valid') !== 'undefined')
        input_hidden.attr('valid', '');
      if(typeof jqselect.attr('valid-msg-options') !== 'undefined')
        input_hidden.attr('valid-msg-options', jqselect.attr('valid-msg-options'));


      for (var i = 0; i < ops.length; i++) {
        var op = ops.eq(i);
        var li = $('<li>').attr('rel', op.attr('value')).text(op.text()).appendTo(ul);
        if(op.attr('value') == init_value) {
          li.addClass('selected');
        }
      };

      // 避免高度过高
      if(ul.height() > 200) {
        ul.css({'overflow-y': 'scroll', 'height': '200px'});
      }

      // 下拉列表项事件
      ul.children('li').click(function(){
        input_hidden.val($(this).attr('rel')).trigger('change');
        input_show.val($(this).text());
        $(this).siblings().removeClass('selected').end().addClass('selected');
        ul.slideUp(me.speed);
      }).hover(function(){
        $(this).addClass('hover');
      }, function(){
        $(this).removeClass('hover');
      });

      // 触发下拉列表显示
      arrow.click(function(e){
        ul.slideToggle(me.speed);
        // 隐藏其他下拉项
        $('.ui_select_ul').not($(this).parent().children('.ui_select_ul')).hide();
        e.stopPropagation();
      });
      input_show.click(function(e){
        arrow.trigger('click');
        e.stopPropagation();
      });

      // 失去焦点时候收起下拉列表
      $('body').click(function(){
        ul.slideUp(me.speed);
      });

      jqselect.remove();
    };
  };

  exports.init =function(selector){
    var UI = new uiselect();
    $(selector).each(function(){
      UI.ui($(this));
    });
  };
});
