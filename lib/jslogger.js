var jslogger = (function() {

  var main;
  var drag;
  var offset = {X : 0, Y : 0};

  var _level = 0;
  var _doAlerts = false;

  var DEBUG_LABEL = "[DEBUG] ";
  var INFO_LABEL = "[INFO] ";
  var ERROR_LABEL = "[ERROR] ";

  function createEl(tagName, props, styles, children) {
    var el = document.createElement(tagName)
    if (props) {
      for (var propName in props) {
        el.setAttribute(propName, props[propName]) || eval('el.'+propName+'=props[propName];')
      }
    }
    if (styles) styleEl(el, styles)
    if (children) {
      for (var i = 3; i < arguments.length; i++) el.appendChild(arguments[i])
    }
    return el
  }

  function styleEl(el, styles) {
    for (var styleName in styles) {
      try { el.style[styleName] = styles[styleName] }
      catch (e) {
        if (el.currentStyle) el.currentStyle[styleName] = styles[styleName]
      }
    }
    return el
  }

  function initPos () {
    if(main) {
      var rightOffset = getRightOffset();
      var scroll = getScroll();
      main.style.right = (25 + scroll.X - rightOffset) + "px";
      main.style.top = (10 + scroll.Y) + "px";
    }
  }

  function setPos (obj, x, y) {
    if( obj && x && y) {
      obj.style.left = x + "px";
      obj.style.top = y + "px";
    }
  }

  function getPos(obj) {
    var pos = { X : 0, Y : 0};
    if(obj) {
      if(typeof obj.offsetLeft != "undefined") {
        pos = { X : obj.offsetLeft, Y : obj.offsetTop};
        while(obj = obj.offsetParent) {
          pos.X += obj.offsetLeft;
          pos.Y += obj.offsetTop;
        }
      } else if(typeof obj.pageX != "undefined") {
        pos = { X : obj.pageX, Y : obj.pageY };
      } else if(typeof obj.clientX  != "undefined") {
        var scroll = getScroll();
        pos = { X : obj.clientX + scroll.X, Y : obj.clientY + scroll.Y };
      }
    }
    return pos;
  }

  function getRightOffset() {
    if (!window.innerWidth &&
        document.documentElement.clientWidth && document.body.clientWidth &&
        document.documentElement.clientWidth != document.body.clientWidth) {
      return (document.documentElement.clientWidth - document.body.clientWidth) / 2;
    } else {
      return 0;
    }
  }

  function getScroll() {
    var scrollY;
    var scrollX;
    if(typeof window.pageYOffset == 'number') {
      scrollX = window.pageXOffset;
      scrollY = window.pageYOffset;
    } else if(document.body && (document.body.scrollTop || document.body.scrollLeft)) {
      scrollX = document.body.scrollLeft;
      scrollY = document.body.scrollTop;
    } else if(document.documentElement && (document.documentElement.scrollTop || document.documentElement.scrollLeft)) {
      scrollY = document.documentElement.scrollTop;
      scrollX = document.documentElement.scrollLeft;
    } else {
      scrollX = 0;
      scrollY = 0;
    }
    return { X : scrollX, Y : scrollY };
  }

  // Private
  function _getLogLevel(l) {
    switch (l) {
      case 'debug':;  case 'DEBUG': return 5;  break;
      case 'info':;   case 'INFO':  return 3;   break;
      case 'error':;  case 'ERROR': return 1;  break;
      default : return 0;
    }
  }

  function _append(msg) {
    if (_level > 0) _doOutput(msg);
  }
  function _doOutput (msg) {
    if (_doAlerts) { alert(msg); return; }
    var log = document.getElementById('jslogger-log');
    log.innerHTML += '<li>' + msg + "</li>";
  }
  function _getParams(qs) {
    var params = {};
    var pairs = qs.split("&");
    for (var pair in pairs) {
      var nv = pairs[pair].split("=");
      params[nv[0]] = nv[1];
    }
    return params;
  }

  var Events = function() {

    return {
      handleOnMouseDown : function(evt) {
        evt = (evt) ? evt : ((event) ? event : null);
        drag = main;
        if(drag) {
          var evtPos = getPos(evt);
          var divPos = getPos(drag);
          offset.X = evtPos.X - divPos.X + getRightOffset();
          offset.Y = evtPos.Y - divPos.Y;
          return false;
        }
      },

      handleOnMouseUp : function(evt) {
        evt = (evt) ? evt : ((event) ? event : null);
        drag = null;
        //evt.cancelBubble = true;
      },

      handleOnMouseMove : function(evt) {
        evt = (evt) ? evt : ((event) ? event : null);
        if (drag) {
          var evtPos = getPos(evt);
          setPos(drag, evtPos.X - offset.X, evtPos.Y - offset.Y);

          evt.cancelBubble = true;
          return false;
        }
      },

      handleOnKeyUp : function(evt) {
        evt = (evt) ? evt : ((event) ? event : null);
        switch(evt.keyCode) {
          case 27 : Windowable.destroy(); break;
        }
        return false;
      },

      ignore : function(evt) {
        evt = (evt) ? evt : ((event) ? event : null);
        if (evt) {
          evt.cancelBubble = true;
        }
        return false;
      },

      addHandler : function(elt, evtName, fn) {
        var onEvent = 'on' + evtName;
        elt[onEvent] = fn;
      }
    }
  }();

  // Public
  return {

    init: function() {
      if (location.search.indexOf("showLog=true") > -1) {
        var config = _getParams(location.search);
        var _display = false;
        _level = _getLogLevel(config['level']) || 0;
        _doAlerts = config['doAlerts'] || false;
        if (_level) _display = true;
        main = createEl('div', {id:'jslogger'}, {
          width:'300px', height:'300px', fontSize:'10px', border:'1px solid #666',
          margin:'0',padding:'0',position:'absolute',zIndex:'999999999',
          fontFamily:'arial,helvetica,sans-serif' });
        var header = createEl('div', {id:'jslogger-header'}, {height:'20px',
          backgroundColor:'#ccc', color:'#fff', cursor:'move', fontWeight:'bold',
          fontSize:'13px',paddingLeft:'6px'});
        header.onmousedown = Events.handleOnMouseDown;
        header.onmouseup = Events.handleOnMouseUp;
        header.innerHTML = 'JS Log'
        var log = createEl('ul', {id:'jslogger-log'}, {overflow:'auto',padding:'3px'});
        main.appendChild(header);
        main.appendChild(log);
        initPos();
        existingMove = document.onmousemove;
        document.onmousemove = function(evt){
          Events.handleOnMouseMove(evt)
          if (existingMove) existingMove(evt)
        }
        document.body.appendChild(main);
      }
    },

    debug : function(msg) {
      if (_level == 5) _append(DEBUG_LABEL + msg);
    },
    info : function(msg) {
      if (_level >= 3) _append(INFO_LABEL + msg);
    },
    /**
     * Function: error
     *   Logs at ERROR level giving line number and exception message.
     * Parameters:
     *   msg - An informative message used to prepend this log line.
     *   err - The js error object thrown.
     */
    error : function(msg, err) {
      if (_level >= 1) {
        if (err) {
          if (err.lineNumber) msg = err.lineNumber + ": " + msg + "\n";
          if (err.fileName) msg = err.fileName + ": " + msg + "\n";
          if (err.message) msg += " (Message: '" + err.message + "')\n";
        }
        _append('<span style="color:red">'+ ERROR_LABEL + msg + '</span>');
      }
    }

  }

})();

window.onload = jslogger.init;

