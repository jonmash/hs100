'use strict';
const net = require('net');
const util = require('util');

var HS100Util = function () {
    this.commands = [];
    this.commands.on = JSON.stringify({
            "system":{
                "set_relay_state":{
                    "state":1
                }
            }
        });
    this.commands.off = JSON.stringify({
            "system":{
                "set_relay_state":{
                    "state":0
                }
            }
        });

    this.commands.query = JSON.stringify({
            "system":{
                "get_sysinfo":null
            }
        });
      
    this.debug_enabled = false;
};

HS100Util.prototype.decrypt = function decrypt(input, seed) {
  seed = seed || 0xAB;
  var buf = new Buffer(input);

  var key = seed;
  var next;
  for (var i = 0; i < buf.length; i++) {
    next = buf[i];
    buf[i] = buf[i] ^ key;
    key = next;
  }
  return buf;
};

HS100Util.prototype.encrypt = function encrypt(input, seed) {
  seed = seed || 0xAB;
  var buf = new Buffer(input.length);

  var key = seed;
  for (var i = 0; i < input.length; i++) {
    buf[i] = input[i] ^ key;
    key = buf[i];
  }
  return buf;
};

HS100Util.prototype.valid_command = function valid_command(cmd) {
    return !!(this.commands[cmd]);
};

HS100Util.prototype.debug = function debug_print(msg) {
    if (this.debug_enabled) {
        console.log(msg);
    }
};

HS100Util.prototype._parse_response = function parse(msg) {
    try {
        var parsed = JSON.parse(msg.toString());
        if (parsed &&
                parsed.system &&
                parsed.system.set_relay_state &&
                parsed.system.set_relay_state.err_code === 0) {
            this.debug("Success!");
            return parsed;
        } else if (parsed &&
                parsed.system &&
                parsed.system.get_sysinfo &&
                parsed.system.get_sysinfo.err_code === 0) {
            this.debug("Success:");
            this.debug(util.inspect(parsed, false, null));
            return parsed;
        } 
    } catch ( error ) {
        console.error(error);
        return false;
    }
};

HS100Util.prototype.broadcast = function broadcast_cmd(cmd, options, callback) {
    if(!this.valid_command(cmd)) {
        console.error("Invalid command: " + cmd);
        callback(false);
    }
    cmd = this.commands[cmd];
    this.debug_enabled = options.debug;
    
    const dgram = require('dgram');
    const udpclient = dgram.createSocket('udp4');
    
    var return_result = [];

    udpclient.on('error', (err) => {
        this.debug(`udpclient error:\n${err.stack}`);
        udpclient.close();
        clearTimeout(timer);
        callback(false);
    });

    udpclient.on('listening', () => {
        udpclient.setBroadcast(true);
    });

    udpclient.on('message', (data, info) => {
        var decrypted = this.decrypt(data);
        var result = this._parse_response(decrypted);
        if (result) {
            return_result.push(result);
        }
    });

    this.debug('Broadcasting!');

    var json = new Buffer(cmd);

    this.debug(this.encrypt(json).toString("hex"));

    udpclient.bind();
    udpclient.send(this.encrypt(json), 0, json.length, options.port, '255.255.255.255', (err) => {
        if(err) {
            console.error("UDP Send Err: \r\n\t" + err.toString());
            clearTimeout(timer);
            callback(false);
        }
    });

    var timer = setTimeout(() => {
        udpclient.close();
        callback(return_result);
    }, options.timeout);
};

HS100Util.prototype.send = function send_cmd(cmd, options, callback) {
    if(!this.valid_command(cmd)) {
        console.error("Invalid command: " + cmd);
        callback(false);
    }
    
    cmd = this.commands[cmd];
    this.debug_enabled = options.debug;
    
    const client = net.connect(options, () => {
        this.debug('connected to server!');

        var header = new Buffer(4);
        var json = new Buffer(cmd);
        header.writeUInt32BE(json.length);

        this.debug(Buffer.concat([header, this.encrypt(json)]).toString("hex"));

        client.write(Buffer.concat([header, this.encrypt(json)]));
    });

    client.on('data', (data) => {
        var decrypted = this.decrypt(data.slice(4));
        clearTimeout(timer);
        callback(this._parse_response(decrypted));
        client.end();
    });

    client.on('error', (error) => {
        this.debug('Client error: \r\n\t'+ error);
        clearTimeout(timer);
        callback(false);
    });
    
    // Kill the connection after a timeout
    var timer = setTimeout(() => {
        console.error("Timeout!");
        client.destroy();
        callback(false);
    }, options.timeout);
};

module.exports = new HS100Util();