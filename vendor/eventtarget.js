function EventTarget()
{
  this._listeners = {}
}

EventTarget.prototype = 
{
  constructor: EventTarget,

  addListener: function(type, listener)
  {
    if (typeof this._listeners[type] === "undefined"){
      this._listeners[type] = [];
    }

    this._listeners[type].push(listener);
  },

  // Alias addListener
  bind: function() { this.addListener.apply( this, arguments ) },

  fire: function(event, data)
  {
    if (typeof event === 'string') event = { type: event, data:data }
    
    if (!event.target) event.target = this

    if (!event.type) throw new Error("Event object missing 'type' property")

    if ( this._listeners[event.type] instanceof Array )
    {
      var listeners = this._listeners[ event.type ]
      for (var i=0; i < listeners.length; i++)
          listeners[i].call( this, event )
    }
  },

  // Alias fire
  trigger: function() { this.fire.apply( this, arguments ) },

  removeListener: function(type, listener)
  {
    if (this._listeners[type] instanceof Array)
    {
      var listeners = this._listeners[type]

      for (var i=0; i < listeners.length; i++)
      {
        if (listeners[i] === listener)
        {
          listeners.splice(i, 1)
          break
        }
      }
    }
  },

  unbind: function() { this.removeListener.apply( this, arguments ) }
};