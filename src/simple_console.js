// Roar Engine API Javascript wrapper
// http://github.com/roarengine/roarjs
//
// This class provides a simple console for all roarjs calls.
//
// To use it you need to replace the default stub console:
//
//     RoarSimpleConsole.init()
//     RoarAPICore.Console = RoarSimpleConsole
//
// Note that this is done by default in the legacy helper

  
var  RoarSimpleConsole =
{
  init: function()
  {
    // Create and append the console box
    var rc = document.createElement('div')
    rc.setAttribute('id', 'roar-console')
    rc.innerHTML = '<div id="roar-console-controls"></div><div id="roar-user"></div><div id="roar-console-log"></div>'
    document.body.appendChild(rc)
  },

  enable: function()
  {
    this.useConsole = true
    var rc = document.getElementById('roar-console')
    rc.setAttribute('style', 'display:block')
  },

  disable: function()
  {
    this.useConsole = false
    var rc = document.getElementById('roar-console')
    rc.setAttribute('style', 'display:none')
  },

  start: function( controller, action, id)
  {
    if( ! this.useConsole) { return }
    var target = document.getElementById('roar-console-log')
    var ac = document.createElement('div')
    ac.setAttribute('id', 'roar-history-'+id)
    //ac.setAttribute('class')
    ac.innerHTML = '<div class="roar-console-api">'+RoarAPICore.Config.url+RoarAPICore.Config.game+'/<span class="roar-console-apibold">'+controller+'/'+action+'/</span>'
    target.insertBefore( ac, target.firstChild )
  },

  reply: function(id, data)
  {
    if( ! this.useConsole) { return }
    var t = document.getElementById('roar-history-'+id)
    var ac = document.createElement('div')
    ac.innerHTML = '<pre>'+data+'</pre>'
    t.appendChild( ac )
  },

  useConsole:true
}
