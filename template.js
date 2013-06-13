//var Mustache = require("./external/mustache/mustache.js")
var _ = require("./external/underscore/underscore.js")

fs = require('fs')

api_functions = require("./api_functions.json")

js_template = fs.readFileSync('src/roarengine.template.js',"utf8");

function pad_left( v, str )
{
	if (v.length < str.length)
	{
		return  String(str+v).slice(-str.length)
	}
	return v
}

function pad_right( v, str )
{
	if (v.length < str.length)
	{
		return  String(v+str).slice(0,str.length)
	}
	return v
}

api_functions.data.pad_left = pad_left
api_functions.data.pad_right = pad_right

var output = _.template(js_template, api_functions)

fs.writeFile("src/roarengine.js",output);
