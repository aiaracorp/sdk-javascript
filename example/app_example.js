// ----------- Your game ---------- //
// Once the whole page has loaded, start your game
RoarUtils.dom_ready( function(){ App.init(); } );

var App =
{
	init: function()
	{
		// -- Set the game tag you've created at http://admin.roar.io/
		RoarAPICore.Config.game = 'lpm2';

		// -- Show/hide the Roar console
		RoarAPICore.Console.enable();
		// RoarAPICore.Console.disable();


		// -- System EVENTS: Setup global Roar system event handlers 
		// Roar system events that will be fired for *all* calls are:
		// 
		// - OK : call successfully completed
		// - ERROR : undefined error
		// - UNAUTHORIZED : attempted a call that required a valid auth_token
		// - BAD_REQUEST : the call did not supply the correct parameters or params were incorrectly formatted
		// - NOT_FOUND : the api call you made does not exist
		// - FORBIDDEN : call was understood, but action did not succeed (not enough gold, did not meet requirements, etc)
		// - SERVER_DOWN : your game server is temporarily down (for a few seconds during a Publish or an upgrade)
		// - FATAL_ERROR : Roar server fatal error. Try again, or contact support.
		// - FAILED_CONNECTION : could not reach Roar Engine servers. The internet is down?
		// 
		// -- Roar System Event callback format is: callback( event )
		// where `event` is defined as:
		//
		// - type : String : One of the Roar System events eg. "OK" or "UNAUTHORIZED"
		// - data : Object : The data usually sent to the callback function
		// 		- call_id : Integer : Reference to RoarAPICore.History.log[] index for the call
		//  	- callback_code : String : The event error code (should match the event 'type')
		//  	- data : Object : The response from the Roar server
		// 
		// -- Add global event handlers here
		RoarAPICore.Events.addListener('UNAUTHORIZED', App._onUnauthorized);
		RoarAPICore.Events.addListener('SERVER_DOWN', App._serverDown);
		RoarAPICore.Events.addListener('FATAL_ERROR', App._fatalError);


		// -- Server chunk Events:
		// Generated when an API call also returns a block of <server> information
		//
		// - ROAR_SERVER_ALL : The entire chunk of the <server> block. Process manually.
		//
		// OR if you'd prefer, process each event individually (do not do BOTH):
		// - ROAR_SERVER_REGEN : The stat will be changing at the prescribed time
		// - ROAR_SERVER_UPDATE : A core 'stat' has been updated
		// - ROAR_SERVER_INVENTORY_CHANGED : Player inventory has been updated
		// - ROAR_SERVER_TASK_COMPLETE : A task has been successfully completed
		// - ROAR_SERVER_ACHIEVEMENT_COMPLETE : An achievement has been unlocked
		// - ROAR_SERVER_LEVEL_UP : Player level has increased
		// - ROAR_SERVER_INVITE_ACCEPTED : Your "friend me" invitation was accepted
		// - ROAR_SERVER_FRIEND_REQUEST : Incoming request to be someone's friend
		// - ROAR_SERVER_TRANSACTION : Real money transaction has just completed
		RoarAPICore.Events.addListener('ROAR_SERVER_ALL', App._processServerBlock);



		// -- Start making API calls!
		// -- http://roarengine.com/developers/api/
		//
		// If you're calling: 'info/ping', then the Roar Javascript call is: RoarAPI.info.ping( ... ); (see below)

		// -- Roar API calls are made like this:
		//   RoarAPI.controller.action( parameters_object, callback_function, error_handler_function );
		//
		// - parameters_object : Object : JSON containing the parameters required by the call. Set to null where none required.
		// - callback_function : Function : the callback to execute when the API call is a success (no Errors)
		// - error_handler_function : Function : executed when the API call returns an Error code
		//
		// Returns: apicall_id : integer : Reference to RoarAPICore.History.log[] index for the call
		// 
		// -- Callback functions receive: 
		//   callback( response_data_object, callback_code_string, call_index_integer )
		//
		// - response_data: Roar server response for the given call
		// - callback_code: The Roar event code for the call eg. "OK" or "UNAUTHORIZED"
		// - call_index_integer: Reference to RoarAPICore.History.log[] index for the call
		RoarAPI.info.ping( null, App.pinghandler, App._errorHandler );
		RoarAPI.user.login( {"name":"jack", "hash":"sprat"} , App.onLogin, App._errorHandler );



		// -- RoarAPICore.Report( message, alert_code )
		// You may override the default alert() behaviour of RoarAPICore.Report to handle the following alert_codes:
		// - NO_XHR : The XmlHttpRequest transport could not be built in the browser
		// - ROAR_ALERT : A standard 'Roar JS API' alert message
	},


	_errorHandler: function( roardata, error_code, call_index )
	{
		// console.log(['Error', error_code, roardata ]);
	},

	_onUnauthorized: function( e )
	{
		// Last call was made by a user who is not correctly logged in
		// Re-login the player

		// For games where login/account creation is an AUTOMATED process:
		// - If the initial login of the NEW credentials fails
		// - try RoarAPI.user.create(...)
		// - if that succeeds, log the player in with these new credentials
		// - if that fails, chances are the login credentials were just wrong, try again
	},

	_serverDown: function( e )
	{
		// Your Roar game server is temporarily down (probably for a publish or an upgrade)
		// Hang loose for a bit, and then try again.
	},

	_failedConnection: function( e )
	{
		// Unable to reach Roar Engine servers. Maybe the internet is down?
		// Switch to offline mode or put up a "come back later" page
	},

	_fatalError: function( e )
	{
		// Something is broken. Contact Roar support.
	},



	onLogin: function(d, code, id)
	{
		RoarAPI.info.poll( null, null, App._errorHandler );
	},

	pinghandler: function(d, id) 
	{ 
		// console.log( [id, d.roar.info.ping['@status'], RoarAPICore.History.log[id] ] );
	}
}