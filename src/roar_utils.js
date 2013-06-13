// Roar Engine API Javascript wrapper
// http://github.com/roarengine/roarjs


var RoarUtils =
{
  dom_ready: function(fn)
  {

    if(document.addEventListener) //W3C
    {
      document.addEventListener("DOMContentLoaded", fn, false)
    }
    else //IE
    {
      document.onreadystatechange = function()
      {
        if(document.readyState === "interactive")
        {
          fn()
        }
      }
    }
  },
}


