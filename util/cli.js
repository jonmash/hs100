'use strict';

var argv = require('minimist')(process.argv.slice(2));

const hs100 = require('./src/hs100.js');

if(argv.help || argv.h || argv._[0] == "help") {
    display_usage_info_and_exit();
}

var options = {
    host: argv.host || argv.H || "192.168.0.110",
    port: argv.port || argv.p || 9999,
    timeout: argv.timeout || argv.t || 2000,
    debug: (argv.debug) ? true : false,
};

if (argv._[0] == "all") {

    if(!hs100.valid_command(argv._[1])) {
        console.error("Unknown Command: " + argv._[1]);
        display_usage_info_and_exit();
    }

    hs100.broadcast(argv._[1], options, (result) => {
        if(!result) {
            console.error("Error running command: " + argv._[1]);
        }
        console.log(result);
    });

} else {

    if(!hs100.valid_command(argv._[0])) {
        console.error("Unknown Command: " + argv._[0]);
        display_usage_info_and_exit();
    }

    hs100.send(argv._[0], options, (result) => {
        if(!result) {
            console.error("Error running command: " + argv._[0]);
        }
        console.log(result);
    });
}

function display_usage_info_and_exit() {
    console.log(
        "\n"+
        "Usage: node index.js [options] command\n"+
        "\n"+
        "An application for controlling HS100 compatible smart plugs.\n"+
        "\n"+
        "Options:\n"+
        "\n"+
        "  -h, --help           Display this usage information.\n"+
        "  -p, --port           Specifies the port to connect on. Default: 9999\n"+
        "  -H, --host           Specifies the HOST to connect to. Default: 192.168.0.110\n"+
        "  -t, --timeout        Specifies the amount of time to wait for the command to\n" +
        "                       complete in ms. Default: 2000ms\n"+
        "  --debug              Enable verbose debug message. Default: false\n"+
        "\n"+
        "Commands:\n"+
        "\n"+
        "  all [command]        Broadcasts a command to all devices on the subnet."+
        "  on                   Turns on the outlet.\n"+
        "  off                  Turns off the outlet.\n"+
        "  query                Queries the device for status information.\n"
    );
    process.exit(0);
}