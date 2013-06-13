RoarAPICore.Config.on_setAuthToken = function( token )
{
  var ra = document.getElementById('roar-user') 
    ra.innerHTML = 'AuthToken: '+token 
}

RoarAPICore.HistoryLog = RoarConsoleHistoryLog;

RoarAPICore.Console = RoarSimpleConsole
RoarUtils.dom_ready( function() {
  RoarSimpleConsole.init()
} )

