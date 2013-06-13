// Roar Engine API Javascript wrapper
// http://github.com/roarengine/roarjs
//
// This class provides a simple history to console log
//
// To use it you need to replace the default stub logger:
//
//     RoarAPICore.HistoryLog = RoarConsoleHistoryLog
//
// Note that this is done by default in the legacy helper

var RoarConsoleHistoryLog =
{
  log: function( mesg )
  {
    if( window.console && console.log )
    {
      console.log( "RoarJS:" + mesg )
    }
  }
}
