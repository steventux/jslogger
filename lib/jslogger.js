var jslogger = (function() {

  var _level = 0; 
  var _doAlerts = false;
  
  var DEBUG_LABEL = "[DEBUG] ";
  var INFO_LABEL = "[INFO] ";
  var ERROR_LABEL = "[ERROR] ";
  var LOGGER_HTML = '<div id="logger"><div id="logger-handle" class="handle"></div><div id="log_console" class="console"></div></div>';
  var LOG_MARKUP = '<div id="log"><h3>Log Output:</h3><ul></ul></div>';
  
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
    if (_doAlerts) alert(msg);
    var logEl = document.getElementById('log');
    var consoleEl = document.getElementById('log_console');
    if (!logEl) consoleEl.innerHTML = LOG_MARKUP;
    var logList = consoleEl.getElementsByTagName('ul')[0];
    logList.innerHTML += "<li>" + msg + "</li>";
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
  
  // Public
  return {
  
    init: function() {
      if (location.search.indexOf("showLog=true") > -1) {
        var config = _getParams(location.search);
        var _display = false;
        _level = _getLogLevel(config['level']) || 0;
        _doAlerts = config['doAlerts'] || false;
        if (_level) _display = true;
        if (_display) document.body.innerHTML += LOGGER_HTML;
        if (typeof Draggable != 'undefined') 
          new Draggable('logger', {handle: 'logger-handle'});
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
        _append(ERROR_LABEL + msg);
      }
    }
    
  }  
  
})();

window.onload = jslogger.init;
