var HS100Util = function () {
  this.commands = [];
  this.commands['on'] = JSON.stringify({
        "system":{
          "set_relay_state":{
            "state":1
          }
        }
      });
  this.commands['off'] = JSON.stringify({
        "system":{
          "set_relay_state":{
            "state":0
          }
        }
      });
        
  this.commands['query'] = JSON.stringify({
        "system":{
          "get_sysinfo":null
        }
      });
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

module.exports = new HS100Util();