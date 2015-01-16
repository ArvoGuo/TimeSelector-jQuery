(function ($) {
  var TimeSelector = function (opts) {
    this.init(opts);
  };

  var fn = TimeSelector.prototype;

  fn.init = function (opts) {
    var defaultOpts = {
      html: '<div class="time-selector-container time-selector-cherry">' +
        '<div class="progress-container time-selector-cherry">' +
        '<div class="progress-name time-selector-cherry">小时</div>' +
        '<div class="progress-line time-selector-cherry">' +
        '<div class="progress-point time-selector-cherry hour ">' +
        '<div class="tooltip top time-selector-cherry" role="tooltip">' +
        '<div class="tooltip-arrow time-selector-cherry"></div>' +
        '<div class="tooltip-inner time-selector-cherry progress-score ">0</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="progress-container time-selector-cherry">' +
        '<div class="progress-name time-selector-cherry">分钟</div>' +
        '<div class="progress-line time-selector-cherry">' +
        '<div class="progress-point time-selector-cherry minute">' +
        '<div class="tooltip top time-selector-cherry" role="tooltip">' +
        '<div class="tooltip-arrow time-selector-cherry"></div>' +
        '<div class="tooltip-inner time-selector-cherry progress-score">0</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="progress-container-submit time-selector-cherry">' +
        '<a class="btn btn-primary pull-right time-selector-cherry progress-submit" href="javascript:void(0)">确定</a>' +
        '</div>' +
        '</div>',
      show: false,
      maxH: 23,
      maxM: 59,
      toolTipTop: 39
    };
    var self = this;
    var optstemp = $.extend(true, {}, defaultOpts);
    self.opts = $.extend(true, optstemp, opts);
    self.Ele = $(self.opts.html);
    self.ElePointH = self.Ele.find('.hour');
    self.ElePointM = self.Ele.find('.minute');
    self.EleSubmit = self.Ele.find('.progress-submit');
    self.EleInput = self.opts.div.find('.time-selector-field');
    if (!self.EleInput.val()) {
      self.EleInput.val('00:00');
    }
    self.opts.div.find('.time-selector-container').remove();
    self.opts.div.append(self.Ele);
    self.setPosition();
    self.ElePointHLineWdith = self.ElePointH.parent().width();
    self.ElePointMLineWdith = self.ElePointM.parent().width();
    self.bindActionEle();
    self.bindActionCommon();

    if (self.opts.show) {
      self.Ele.removeClass('hidden');
    } else {
      self.Ele.addClass('hidden');
    }
  };

  fn.setPosition = function () {
    var self = this;
    var points = self.Ele.find('.progress-point');
    points.map(function (index, item) {
      item = $(item);
      var pH = item.parent().height();
      var top = Math.abs((pH - item.height()) / 2);
      item.css({
        top: '-' + top + 'px'
      });
    });

    setTimeout(function(){
      var h = self.opts.div.height();
      self.Ele.css({
        left: '0px',
        top: h + 'px'
      });
    },0);
  };

  fn.resetElePos = function() {
    var self = this;
    setTimeout(function(){
      var h = self.opts.div.height();
      self.Ele.css({
        left: '0px',
        top: h + 'px'
      });
    },0);
  };

  fn.setToolTipPos = function (point) {
    var self = this;
    var tool = point.find('.tooltip');
    var toolLeft = (tool.width() - point.width()) / 2;
    tool.css({
      left: '-' + toolLeft + 'px',
      top: '-' + self.opts.toolTipTop + 'px'
    });
  };

  fn.bindActionEle = function () {
    var self = this;
    var mouseDownX;
    var mouseMoveX;
    var itemPresentX;
    var lineOffsetX;
    var maxWidth;
    var maxWidthLeft;
    var containers = self.Ele.find('.progress-container');
    // bind container
    containers.map(function (index, item) {
      item = $(item);
      item.on('mousedown', function (e) {
        e.preventDefault();
        var target = $(e.target);
        var EleLine = item.find('.progress-line');
        var ElePoint = item.find('.progress-point');
        maxWidth = EleLine.width();
        mouseDownX = e.pageX;
        maxWidthLeft = maxWidth - ElePoint.width() / 2;
        lineOffsetX = EleLine.offset().left;
        if (target.hasClass('progress-line')) {
          ElePoint.css({
            left: (mouseDownX - lineOffsetX) + 'px'
          });
          self.updatescore(ElePoint);
        }
        itemPresentX = ElePoint.position().left;
        $(this).on('mousemove', mousemove);
        $(this).on('mouseup', mouseup);
        $(this).on('mouseleave', mouseleave);
      });
    });

    function mousemove(e) {
      e.preventDefault();
      e.stopPropagation();
      mouseMoveX = e.pageX;
      var point = $(this).find('.progress-point');
      var rightX = itemPresentX + (mouseMoveX - mouseDownX);
      if (rightX < 0) {
        rightX = 0;
      } else if (rightX > maxWidthLeft) {
        rightX = maxWidthLeft;
      }
      point.css({
        left: rightX + 'px'
      });
      self.updatescore(point);
    }

    function mouseup() {
      $(this).off('mousemove', mousemove);
      $(this).off('mouseup', mouseup);
    }

    function mouseleave(e) {
      e.stopPropagation();
      var minX = $(this).parent().offset().left;
      var maxX = $(this).parent().offset().left + $(this).parent().width();

      if (true) {
        $(this).off('mousemove', mousemove);
      }
    }

  };

  fn.bindActionCommon = function () {
    var self = this;
    // self.EleInput.on('input', function() {
    //   self.updatePointFromInput();
    // });
    self.EleInput.on('click', function (e) {
      //e.stopPropagation();
      if (!self.Ele.hasClass('hidden')) {
        self.hide();
        return;
      }
      self.show();
    });
    self.Ele.find('.progress-score').on('DOMNodeInserted', function () {
      self.setToolTipPos($(this).parent().parent());
    });
    self.EleSubmit.on('click', function (e) {
      e.preventDefault();
      self.hide();
    });
    $('body').on('click', function(e){
      if (self.Ele.hasClass('hidden')) {
        return;
      }
      self.bodyClick(e,self);
    });
  };

  fn.bodyClick = function(e,self) {
    e.preventDefault();
    e.stopPropagation();
    var target = e.target;
    var count = 0;
    do {
      if (target === self.opts.div.get(0)) {
        return;
      }
      target = target.parentNode;
      count ++;
    } while (target.parentNode);
    self.hide();
  };

  fn.show = function () {
    var self = this;
    self.resetElePos();
    self.updatePointFromInput();
    if (self.Ele.hasClass('hidden')) {
      self.Ele.removeClass('hidden');
    }
  };

  fn.hide = function () {
    var self = this;
    self.Ele.addClass('hidden');
  };

  fn.updatescore = function (point) {
    var self = this;
    var presentX = point.position().left;
    var C = point.parent().width() - point.width() / 2;
    var percent = C / presentX;
    var value;
    if (point.hasClass('hour')) {
      value = Math.round(self.opts.maxH / percent);
    }
    if (point.hasClass('minute')) {
      value = Math.round(self.opts.maxM / percent);
    }
    point.find('.progress-score').text(value);
    self.updateInputFromPoint();
  };


  fn.updatePointFromInput = function () {
    var self = this;
    self.checkInputValue();
    var v = self.EleInput.val();
    v = v.split(':');
    if (v.length !== 2) {
      return;
    }
    var h = parseInt(v[0] || 0);
    var m = parseInt(v[1] || 0);
    //h
    var hWidth;
    var hLeft;
    hWidth = self.ElePointHLineWdith - self.ElePointH.width() / 2;
    hLeft = (hWidth * h) / self.opts.maxH;
    self.ElePointH.css({
      left: hLeft + 'px'
    });
    self.ElePointH.find('.progress-score').text(h);
    //m
    var mWidth;
    var mLeft;
    mWidth = self.ElePointMLineWdith - self.ElePointM.width() / 2;
    mLeft = (mWidth * m) / self.opts.maxM;
    self.ElePointM.css({
      left: mLeft + 'px'
    });
    self.ElePointM.find('.progress-score').text(m);
  };

  fn.checkInputValue = function() {
    var self = this;
    var v = self.EleInput.val();
    v = v.split(':');
    if (v.length !== 2) {
      return false;
    }
    var h = parseInt(v[0] || 0);
    var m = parseInt(v[1] || 0);

    if ((h !== 0 && !h) || (m !== 0 && !m)) {
      return false;
    }
    h = h < 0 ? 0 : h;
    h = h > self.opts.maxH ? self.opts.maxH : h;
    m = m < 0 ? 0 : m;
    m = m > self.opts.maxM ? self.opts.maxM : m;
    h = self.formatValue(h);
    m = self.formatValue(m);
    self.EleInput.val(h + ':' + m);
  };

  fn.updateInputFromPoint = function () {
    var self = this;
    var h = self.formatValue(self.ElePointH.text());
    var m = self.formatValue(self.ElePointM.text());
    var value = h + ':' + m;
    self.EleInput.val(value).trigger('input');
  };

  fn.formatValue = function (value) {
    return value < 10 ? '0' + value : value;
  };
  $.TimeSelector = TimeSelector;
})($);