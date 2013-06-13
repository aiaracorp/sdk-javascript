echo -e 'RoarJS (buidling...)'
echo -e '---------------------'

echo -e "[Checking config json]"
cat api_functions.json | node external/jsonlint > /dev/null

echo -e "[Building js from template]"
node template.js

echo -e "[JSHint static code analysis...]"
jshint src/roarengine.js --config .jshint-config

echo -e "[Copying files into one location...]"
cat vendor/xml2json.js vendor/json2.js vendor/eventtarget.js src/roar_utils.js src/roarengine.js src/console_history_log.js src/simple_console.js src/legacy.js > roarengine.min.js

echo -e "[Uglyfying roarengine.min.js...]"
uglifyjs -v -nc --overwrite roarengine.min.js

echo -e "------"
echo -e "[Done]"
