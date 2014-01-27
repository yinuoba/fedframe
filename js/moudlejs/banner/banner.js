/**
 * 轮播图片
 * @param  {[type]} require [description]
 * @param  {[type]} exports [description]
 * @param  {[type]} module  [description]
 * @return {[type]}         [description]
 */
define(function(require, exports, module) {
  /* 图片切换插件
   * 调用该插件的html结构请参考首页轮播
   * */
  (function($) {
    $.fn.imgSlider= function(options) {
      //默认设置
      var defaultSetting = {
        list: null, //图片列表（必填参数）
        nav: null, //导航（可选）
        timer: 5000, //切换间隔
        fade: 300, //过渡时间
        prev: '.guide_prev',  //向左浏览图片展览
        next: '.guide_next'  //向右浏览图片展览
      };
      var _opt = $.extend(defaultSetting, options);
      
      //if (!$list) return;
      
      return this.each(function() {
        var timer = null;
        var $list = $(_opt.list, this);
        var $nav = $(_opt.nav, this);
        var imgSize = $list.find('li').size();
        var index = 0;
        createNav();
        initImg();

        if(_opt.prev){
          $(_opt.prev, this).on('click', function(){
            stop();
            switchTo(index == 0 ? imgSize - 1 : index - 1);
            autoPlay();
          });
        }
        if(_opt.next){
          $(_opt.next, this).on('click', function(){
            stop();
            switchTo(index + 1 == imgSize ? 0 : index + 1);
            autoPlay();
          });
        }
        autoPlay();

        function createNav() {
          $list.find('li').each(function(i) {
            var _length = $(this).index() + 1;
            $('<span>' + _length + '</span>', $nav).addClass(i === 0 ? 'on' : '')
             .on('click', function() {
                switchTo($(this).index());
              }).hover(function(){
                stop();
              })
              .appendTo($nav);
          });
        }

        function initImg() {
          $list.find('li:gt(0)').css("display", "none");
          $list.css('position', 'relative');
          $list.find('li').css({
            position: 'absolute',
            top: 0,
            left: 0
          }).hover(function() {
            stop();
          }, function() {
            autoPlay();
          });
        }

        function switchTo(_index) {
          var $li = $list.find('li');
          var $span = $nav.find('span');
          if (!$li.eq(_index).is('visible')) {
            $list.find('li:visible').fadeOut(_opt.fade);
            $li.eq(_index).fadeIn(_opt.fade);
            $span.removeClass('on').eq(_index).addClass('on');
            index = _index;
          }
        }

        function stop() {
          clearInterval(timer);
        }

        function autoPlay() {
          timer = setInterval(function() {
            index = index === imgSize - 1 ? 0 : index + 1;
            switchTo(index);
          }, _opt.timer);
        }
      });

      
    };
  })(jQuery);

  $(document).ready(function() {
    $('a[href="#"]').each(function() {
      $(this).attr('href', 'javascript:void(0)')
    });
    $('.perform li').each(function() {
      var o = $(this);
      $(this).find('.s').click(function() {
        var j = $(this).index();
        o.find('.s').removeClass('on').eq(j).addClass('on');
        o.find('.info').hide().eq(j).fadeIn(500)
      })
    });
    $('.artist_l li').each(function(m) {
      $(this).find('a').css('top', -$(this).height());
      $(this).hover(function() {
          $(this).find('a').animate({
              'top': '0'
            },
            200)
        },
        function() {
          $(this).find('a').animate({
            'top': $(this).height()
          }, {
            duration: 200,
            complete: function() {
              $(this).css('top', -$(this).parent('li').height())
            }
          })
        })
    });
    $('#calendar td').live('mouseover',
      function() {
        $('#calendar td').removeClass('hover');
        $(this).addClass('hover')
      });
    $('.category_list .item').each(function(i) {
      $(this).hover(function() {
          $('.category_list .item').removeClass('on').eq(i).addClass('on');
          $('.category_list ol').hide().eq(i).show()
        },
        function() {
          $(this).find('ol').hide();
          $(this).removeClass('on')
        })
    });
    $('.u_city_a li').each(function(i) {
      $(this).click(function() {
        if (i == 10) return false;
        $('.u_city_nav li').removeClass('on').eq(i).addClass('on');
        $('.u_city_nav p').hide().eq(i).show()
      })
    });
    var intIndexCity = 0;
    var intHoverCity = 0;
    $('.u_city_nav .more').click(function() {
      if (intIndexCity == 1) {
        $(this).removeClass('on');
        $('.s_citys').hide(200);
        intIndexCity = 0
      } else {
        $(this).addClass('on');
        $('.s_citys').show(200);
        intIndexCity = 1
      }
      return false
    });
    $('.s_citys').hover(function() {
        intHoverCity = 1
      },
      function() {
        intHoverCity = 0
      });
    $('body').bind('click',
      function() {
        if (intIndexCity == 1 && intHoverCity == 0) {
          $('.s_citys').hide(200);
          $('.u_city_nav .more').removeClass('on');
          intIndexCity = 0
        }
      });

    function scrollList() {
      if ($('.scroll_txt li').length <= 1) return;
      var temp = $('.scroll_txt li:last');
      temp.hide();
      $('.scroll_txt li:last').remove();
      $('.scroll_txt li:first').before(temp);
      temp.slideDown(500)
    }
    window.setInterval(scrollList, 5000);
    $('.live_top li').each(function(i) {
      $(this).hover(function() {
        $('.live_top li').removeClass('on').eq(i).addClass('on')
      })
    });
    $('.list_1 li').each(function(i) {
      $(this).hover(function() {
        $('.list_1 li').removeClass('on').eq(i).addClass('on')
      })
    });
    $('.vote_m dd').each(function(i) {
      $(this).click(function() {
        $('.vote_m dd').removeClass('on').eq(i).addClass('on')
      })
    });
    $('.tr_commend dl').each(function(i) {
      $(this).hover(function() {
        $('.tr_commend dl').removeClass('on').eq(i).addClass('on')
      })
    });
    $('.ticketInfo .help').hover(function() {
        $('.minTips').fadeIn('fast')
      },
      function() {
        $('.minTips').fadeOut('fast')
      });
    $('.videoList li').hover(function() {
        $(this).addClass('on')
      },
      function() {
        $(this).removeClass('on')
      });
    $('.min_tip .tab_min_b a').each(function(i) {
      $(this).click(function() {
        $('.tab_min_b a').removeClass('on').eq(i).addClass('on')
      })
    });
    $('.news_list li').hover(function() {
        $(this).addClass('on')
      },
      function() {
        $(this).removeClass('on')
      });
    $('.tr_pic_list li').hover(function() {
        $(this).addClass('on')
      },
      function() {
        $(this).removeClass('on')
      });
    $('.sift .expand').toggle(function() {
        $('#city').height(24);
        $(this).html('\u5c55\u5f00')
      },
      function() {
        $('#city').height('auto');
        $(this).html('\u6536\u7f29')
      });
    $('.buy_caption .tab_t a').each(function(i) {
      $(this).click(function() {
        $('.buy_caption .tab_t a').removeClass('on').eq(i).addClass('on');
        $('.buy_caption dl').hide().eq(i).show()
      })
    });
    $('.vocal_list li .t .c7').click(function() {
      $(this).parent().parent().find('.t').show();
      $(this).parent().hide()
    })
  });
  $(document).ready(function() {
    //首页BANNER
    $('#imgPlay').imgSlider({
      list: $("#actor"),
      nav: $("#numInner")
    });
     
  });
  $(document).ready(function() {
    var isshowcity = false;
    var ishovercitys = false;
    $('.s_city .s').click(function() {
      if (isshowcity == false) {
        $('.s_c_links').show(200);
        $(this).addClass('on');
        isshowcity = true
      } else {
        $('.s_c_links').hide(200);
        $(this).removeClass('on');
        isshowcity = false
      }
      return false
    });
    $('.s_c_links').hover(function() {
        ishovercitys = true
      },
      function() {
        ishovercitys = false
      });
    $('body').bind('click',
      function() {
        if (isshowcity == true && ishovercitys == false) {
          $('.s_c_links').hide(200);
          $('.s_city .s').removeClass('on');
          isshowcity = false
        }
      })
  });
  $(document).ready(function() {
    $('.sd').each(function(i) {
      $(this).find('.hztitle').click(function() {
        $('.sd').eq(i).find('p').toggle()
      })
    });
    $(".hztitle").toggle(function() {
        $(this).addClass("hztitle-2")
      },
      function() {
        $(this).removeClass("hztitle-2")
      })
  });

  function artHeight() {
    var rh = $('.artists_r').height();
    var lh = $('.artists_l').height();
    var list = $('.artists_l .tab_min_in').height();
    var dh = rh - lh;
    if (dh > 0) {
      var h = lh + dh - 12;
      $('.artists_l').height(h)
    }
    if (rh - list < 90) {
      $('.artists_l').height('auto')
    }
  }
});