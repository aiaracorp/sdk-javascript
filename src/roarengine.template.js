// Roar Engine API Javascript wrapper
// http://github.com/roarengine/roarjs

// All Roar calls map to the Web API URLs
// so RoarAPICore.User.login() is http://api.roar.io/yourgame/user/login/
var RoarAPICore =
{
  version: '<%= data.version %>',

  Config:
  {
    url: 'http://api.roar.io/',
    fallback_url: 'http://api.roarengine.com/',

    game: null,
    initialised: false,
    useJSON: false,

    exclude_from_auth: [ 'user/login', 'info/ping' ]
  },

  Session:
  {
    auth_token: null,

    // This should be overriden if you want something to happen when you've
    // auth'd
    on_setAuthToken: function( token ) {},

    setAuthToken: function( token ) 
    { 
      RoarAPICore.Session.auth_token = token 
      this.on_setAuthToken( token )
    }
  },

  init: function()
  {
    if (!RoarAPICore.Config.initialised)
    {
      RoarAPICore.Config.initialised = true 
    }
  },

  // Initiates a 'test Roar' connection to `http://api.roar.io`
  connectionTest: function( callback )
  {
    RoarAPICore._send( 'test', null, callback )
  },

  Events: new EventTarget(),

  Console:
  {
    // Called when an action is started
    start: function( controller, action, id ) {},
    reply: function( id, data ) {}
  },

  HistoryLog:
  {
    log: function(mesg) {}
  },

  // A simple alerter that can be overriden to handle specific alert_codes
  Report: function( message, alert_code )
  {
    alert(message)
  },


  History:
  {
    log: {},

    // Adds started call to the History log and returns the log unique `id`
    add: function( controller, action )
    {
      // Determine current History.log length
      var len = 0, key
      for (key in RoarAPICore.History.log)
        if (RoarAPICore.History.log.hasOwnProperty(key)) len++
      
      var id = len + 1

      RoarAPICore.History.log[id] = {
          id:id
        , started: new Date().getTime()
        , ended: null
        , totaltime: null
        , controller:controller
        , action:action
        , result:null
        , result_code:-1 
        }

      RoarAPICore.HistoryLog.log( RoarAPICore.History.log[id] )

      return id
    },

    // Completes a call and returns the completed entry
    end: function( id, data, time )
    {
      var log = RoarAPICore.History.log[id]

      log.result = data
      log.ended = time
      log.totaltime = time - log.started
      
      return log
    }
  },

  _serialize: function(obj, prefix) 
  {
    var str = []
    for(var p in obj) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p]
      str.push(typeof v === "object" ? 
      RoarAPICore._serialize(v, k) :
      encodeURIComponent(k) + "=" + encodeURIComponent(v))
    }
    return str.join("&")
  },

  // Removes '@' symbol prefix from all object keys
  // (RoarJS returns @prefixed JSON from XML conversion legacy)
  _squash: function( chunk )
  {
    var o = {}
    var tem

    for (var p in chunk)
    {
      if (chunk.hasOwnProperty(p))
      {
        // First, retrieve the object
        tem = chunk[p]

        // Then replace the '@' and '#' prefix
        if (p.charAt(0) === '@') p = p.slice(1)
        else if (p.charAt(0) === '#') p = p.slice(1)

        // Convert string booleans to native booleans
        if (tem === 'true') tem = true
        else if (tem === 'false') tem = false

        if(tem && typeof tem==='object') o[p] = arguments.callee( tem )
        else o[p] = tem
      }
    }
    return o
  },


  _send: function( apicall, params, cb, ecb )
  {       
    params = params || {}

    if (RoarAPICore.Config.game == null) RoarAPICore.Report('No Roar game set.\nLooks like you forgot to set RoarAPICore.Config.game', "ROAR_ALERT")
    else
    {
      // Setup 'Test Roar Connection' flag
      var _test = (apicall === 'test')

      var uc = apicall.split('/')
      var controller = uc[0]
      var action = uc[1]

      // Setup API URL to call
      var main_url = RoarAPICore.Config.url+RoarAPICore.Config.game+'/'+apicall+'/'
      var fallback_url = RoarAPICore.Config.fallback_url+RoarAPICore.Config.game+'/'+apicall+'/'

      // Log to history
      var call_id = RoarAPICore.History.add( controller, action )

      // Fire call sending event
      RoarAPICore.Events.fire("ROAR_NETWORK_START", {"call_id":call_id} )

      // Force main address in a connection test
      if ( _test ) main_url = RoarAPICore.Config.url
      // Otherwise continue as normal
      else
      {
        // Write to console
        RoarAPICore.Console.start( controller, action, call_id )

        params.auth_token = RoarAPICore.Session.auth_token 
      }

      var cors = function(method, url)
      {
        var xhr = new XMLHttpRequest()
        if ("withCredentials" in xhr)
        {
          xhr.open(method, url, true)
        } 
        else if (typeof XDomainRequest !== "undefined")
        {
          xhr = new XDomainRequest()
          xhr.open(method, url)
        } 
        else 
        {
          xhr = null
        }
        return xhr
      }

      var request = cors("POST", main_url)
      if (request)
      {
        request.onload = function()
        {
          var endTime = new Date().getTime()
          var data
          
          // Convert any XML response to JSON
          if (!RoarAPICore.Config.useJSON)
          {
            data = JSON.parse( xml2json( request.responseXML, "" ) )
          }
          else { data = JSON.parse(request.responseText) }

          // Remove xml2json '@' conversion legacy prefix
          data = RoarAPICore._squash( data )
          
          // Add call response and time to the History.log
          RoarAPICore.History.end( call_id, data, endTime )

          // Fire call complete event
          RoarAPICore.Events.fire("ROAR_NETWORK_END", {"call_id":call_id} )

          // Check if it was just a test call to Roar and run callback
          if (_test) 
          { 
            cb(data) 
            return 
          }

          // Reformat XML display for Console: < to &lt;
          RoarAPICore.Console.reply(
              call_id,
              (RoarAPICore.Config.useJSON) ? data : request.responseText.replace(/</g, '&lt;').replace(/>/g, '&gt;') 
              )


          var UNKNOWN_ERR = 0    // Default unspecified error (parse manually)
          var UNAUTHORIZED = 1   // Auth token is no longer valid. Relogin.
          var BAD_INPUTS = 2     // Incorrect parameters passed to Roar
          var DISALLOWED = 3     // Action was not allowed (but otherwise successful)
          var FATAL_ERROR = 4    // Server died somehow (sad/bad/etc)
          var AWESOME = 11       // Turn it up.
          var OK = 200           // Everything ok - proceed


          // -- Parse the Roar response
          // Unexpected server response
          if (typeof data.roar[controller][action] === 'undefined') 
          { 
            RoarAPICore.Events.fire("FATAL") 
            if (ecb) ecb( null, FATAL, call_id )
          }
          else
          {
            // -- Check for error
            var callback_code
            var callback_msg
            var d = data.roar[controller][action]

            // Pre-process <server> block if any
            if ( typeof data.roar.server !== 'undefined' )
            {
              // Dispatch the entire <server> object
              RoarAPICore.Events.fire("ROAR_SERVER_ALL", data.roar.server )
              for ( var node in data.roar.server )
              {
                // Dispatch each individual <server> node
                RoarAPICore.Events.fire("ROAR_SERVER_"+node.toUpperCase(), data.roar.server[node] )
              }
            }

            // Server returned an error. Action did not succeed.
            if (d.status === 'error') 
            {
              callback_code = UNKNOWN_ERR
              callback_msg = d.error.text
              
              // Indeterminate error type back from Chameleon.. try figure it out
              if (d.error.type === "0")
              {
                if (d.error.text==='Must be logged in') { callback_code = UNAUTHORIZED }
                if (d.error.text==='Invalid auth_token') { callback_code = UNAUTHORIZED }
                if (d.error.text==='Must specify auth_token') { callback_code = BAD_INPUTS }
                if (d.error.text==='Must specify name and hash') { callback_code = BAD_INPUTS }
                if (d.error.text==="Invalid name or password") { callback_code = DISALLOWED }
                if (d.error.text==="Player already exists") { callback_code = DISALLOWED }
              }

              // Error: fire the error callback
              if (ecb!=null) ecb( data, callback_code, callback_msg, call_id )
            }
            // No error - pre-process the result
            else 
            {
              // Grab the auth_token if it's there
              if( typeof d.auth_token !== 'undefined') RoarAPICore.Session.setAuthToken( d.auth_token )
              
              callback_code = OK
              if (cb!=null) cb( data, callback_code, callback_msg, call_id )
            }

            RoarAPICore.Events.fire( "CALL_COMPLETE", 
              {
                  data:data
                , code:callback_code
                , message:callback_msg
                , call_id:call_id 
              })
          }

          
        }

        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        request.send( RoarAPICore._serialize( params ) )
      }
      // No request object :(
      else
      {
        // Browser is not able to provide an XHR transport
        // Either build your own, or tell your user to upgrade/change platforms
        RoarAPICore.Report( "No XHR method available to your browser. Please upgrade.", "NO_XHR" )
      }

      // Returns the ID of the call that has just been made
      return call_id
    }
  }

}


// Roar API reference: http://roarengine.com/developers/api/
// HTTP calls as controller/action map to RoarAPI.controller.action()
// --
var RoarAPI = 
{
<% _.each(data.modules, function(m,i,l) { %>  <%= m.name %>:
  {
<%
var pad_str="                ";
_.each( m.functions,
  function(f,j,ll)
    {
       url = f.url ? f.url : (m.name+"/"+f.name);
       obj = f.obj ? f.obj : "obj";
       while( f.name.length+1 >= pad_str.length) { pad_str = pad_str + "  "; } 
%>    <%= data.pad_right(f.name+":",pad_str) %>function(obj, cb, ecb) { return RoarAPICore._send('<%= url %>', <%= obj %>, cb, ecb ) }<% if(j!=ll.length-1){print(",\n");}%><% } ) %>
  }<% if(i!=l.length-1){ print(",\n"); } %>
<% } ) %>}




// Wait for DOM to load
RoarUtils.dom_ready( function(){ RoarAPICore.init() } )
