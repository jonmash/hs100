var argv = require('minimist')(process.argv.slice(2));
const net = require('net');
const hs100 = require('./hs100_util.js');

if(argv.help || argv.h || argv._[0] == "help") {
  display_usage_info_and_exit();
}

var options = {
	host: argv.host || argv.H || "192.168.0.110",
	port: argv.port || argv.p || 9999
};

if(!hs100.commands[argv._[0]]) {
	console.error("Unknown Command");
  display_usage_info_and_exit();
	process.exit(1);
}

var command = hs100.commands[argv._[0]];
var debug = (argv.debug) ? true : false;

const client = net.connect(options, () => {
	if(debug){console.log('connected to server!');}
	var header = new Buffer(4);
	header.writeUInt32BE(command.length);
	var json = new Buffer(command);
	if(debug){console.log(Buffer.concat([header, hs100.encrypt(json)]).toString("hex"));}
	client.write(Buffer.concat([header, hs100.encrypt(json)]));
});

// Kill the connection after a timeout
var timer = setTimeout(function() {
  console.log("Timeout!");
  client.destroy();
  process.exit(1);
}, 5000);

client.on('data', (data) => {
  var decrypted = hs100.decrypt(data.slice(4));
  if(debug){console.log(decrypted.toString());}
  try {
    var parsed = JSON.parse(decrypted.toString());
    if (parsed &&
        parsed.system &&
        parsed.system.set_relay_state &&
        parsed.system.set_relay_state.err_code == 0) {
      console.log("Success!");
    } else if (
        parsed &&
        parsed.system &&
        parsed.system.get_sysinfo &&
        parsed.system.get_sysinfo.err_code == 0) {
      var util = require('util');
      console.log("Success:");
      console.log(util.inspect(parsed, false, null));
    }
  } catch(error) {
    console.log(error);
  }
	client.end();
});
client.on('end', () => {
	if(debug){console.log('disconnected from server');}
  clearTimeout(timer);
});


function display_usage_info_and_exit() {
  console.log(
    "\n"+
    "Usage: node hs100.js [options] command\n"+
    "\n"+
    "An application for controlling HS100 compatible smart plugs.\n"+
    "\n"+
    "Options:\n"+
    "\n"+
    "  -h, --help           Display this usage information.\n"+
    "  -p, --port           Specifies the port to connect on. Default: 9999\n"+
    "  -H, --host           Specifies the HOST to connect to. Default: 192.168.0.110\n"+
    "\n"+
    "Commands:\n"+
    "\n"+
    "  on                   Turns on the outlet.\n"+
    "  off                  Turns off the outlet.\n"+
    "  query                Queries the device for status information.\n"
  )
  process.exit(0);
}