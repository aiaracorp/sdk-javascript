Roarengine.js
===================

Roar Engine is a cross platform social game buidling backend - http://roarengine.com

The Roar Engine JS API wrapper provides developers a simple toolset for communicating with a Roar backend.

- **JSON oriented**: automatically converts server XML to JSON for ease of use in JS apps
- **Events and callbacks**: supports event driven and callback driven development paradigms
- **CORS-enabled network communication**: no pesky PHP/Flash/etc XHR required
- **Console panel**: in-app client-server communication watch panel

A complete API reference can be found: http://roarengine.github.io/webapi/

## Installation

Your application **needs** to include:

- roarengine.min.js
- roarconsole.css

These can be placed anywhere, and called as follows:

        <!-- Roar Engine JS API includes -->
        <script src="roarengine.min.js"></script>
        <link rel="stylesheet" href="roarconsole.css"/>

## Usage

### Using RoarJS
Configure the game instance you wish to use (your unique 'game tag'):

`Roar.Config.game = 'your_game_tag';`

#### Configuration options

- Enable the visual console: `Roar.Console.enable()`. See <a href="#console">below</a> for details.
- Log to browser JS console: `Roar.Config.logToBrowserConsole = true;`


### Making API calls to Roar
Roar Web API calls follow the **controller**/**action** pattern. A Roar Javascript API call takes the form:

`RoarAPI.controller.action( params_obj, callback_fn, error_fn )`

- **params_obj** : JSON object with the parameters for the call (See [API reference](http://roarengine.com/developers/api/))
- **callback_fn** : A custom callback function run on successful server response
- **error_fn** : Optional custom error handler for this call

**Callback structure**: Your callbacks receive the following:

`callback_fn( response_data_obj, callback_code_str, call_index_int )`

- **response_data_obj** : JSON object
- **callback_code_str** : Response code string (see Callback Codes below)
- **call_index_int** : The index id for this call (reference `Roar.History.log[ index ]`)

### Event watchers

Events can be handled by adding listeners to `Roar.Events` as follows:

`Roar.Events.addListener( EVENT_CODE_STR, callback_fn )`

Callback functions receive **event objects**: `callback_fn( event )`

- **type**: The event that was fired (See Event Codes below)
- **data**: The call object and server response

<a name="console"></a>
### Console

The console shows a record of API calls made, along with the server responses. To pull up the console:

`Roar.Console.enable();`


## Event and Callback Codes

### Network events
All network calls to Roar Engine will fire two events, one before and one after the call respectively. These two events return the `call_id` as a payload - this can then be used to query the `Roar.History.log[ call_id ]` for information about the call.

- ROAR_NETWORK_START: fired as the call is being made
- ROAR_NETWORK_END: fired when the call is completed and a response has been received


### Server response code events
The following code string are used by events and callbacks in Roar JS:

- OK : call successfully completed
- ERROR : undefined error
- UNAUTHORIZED : attempted a call that required a valid auth_token
- BAD_REQUEST : the call did not supply the correct parameters or params were incorrectly formatted
- NOT_FOUND : the api call you made does not exist
- FORBIDDEN : call was understood, but action did not succeed (not enough gold, did not meet requirements, etc)
- SERVER_DOWN : your game server is temporarily down (for a few seconds during a Publish or an upgrade)
- FATAL_ERROR : Roar server fatal error. Try again, or contact support.
- FAILED_CONNECTION : could not reach Roar Engine servers. The internet is down?


### Server block events
Any response from Roar Engine can include a `<server>` block of data. These will generate events in `Roar.Events`. Process either:

- ROAR_SERVER_ALL : The entire chunk of the <server> block. Process manually.

Or manually watch and process each of these:

- ROAR_SERVER_REGEN : The stat will be changing at the prescribed time
- ROAR_SERVER_UPDATE : A core 'stat' has been updated
- ROAR_SERVER_INVENTORY_CHANGED : Player inventory has been updated
- ROAR_SERVER_TASK_COMPLETE : A task has been successfully completed
- ROAR_SERVER_ACHIEVEMENT_COMPLETE : An achievement has been unlocked
- ROAR_SERVER_LEVEL_UP : Player level has increased
- ROAR_SERVER_INVITE_ACCEPTED : Your "friend me" invitation was accepted
- ROAR_SERVER_FRIEND_REQUEST : Incoming request to be someone's friend
- ROAR_SERVER_TRANSACTION : Real money transaction has just completed




## Example

### Roar API Call
A call to [/user/login](http://roarengine.com/developers/api/current/#user/login) could be made as follows:

    RoarAPI.info.ping( {"user":"chairman", "hash":"mao"}, processLogin, myErrorLogin );

    function processLogin( data, code, index )
    {
        console.log(["Successful login"]);
        // Show game screen and do stuff
    }

    function myErrorLogin( data, code, index )
    {
        console.log("Login Error");
        // Show error message and handle the sadness
    }

### Event watcher

Roarengine.js fires events based on responses from the server. A call to watch for &lt;server&gt; blocks could be made as follows:

    Roar.Events.addListener('ROAR_SERVER_ALL', myServerBlock);

    function myServerBlock( event )
    {
        var type = event.type;
        var data = event.data;

        // Process data manually
    }
