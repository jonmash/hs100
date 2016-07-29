function decrypt (input, first) {
  first = first || 0xAB;
  var buf = new Buffer(input);
  
  var key = first;
  var next;
  for (var i = 0; i < buf.length; i++) {
    next = buf[i];
    buf[i] = buf[i] ^ key;
    key = next;
  }
  return buf;
};

function encrypt(input, first) {
  first = first || 0xAB;
  var buf = new Buffer(input.length);

  var key = first;
  for (var i = 0; i < input.length; i++) {
    buf[i] = input[i] ^ key;
    key = buf[i];
  }
  return buf;
};


// These strings come from: https://github.com/natefox/tplink-hs100/blob/master/turn_off.py
// var encrypted = new Buffer("0000002ad0f281f88bff9af7d5ef94b6c5a0d48bf99cf091e8b7c4b0d1a5c0e2d8a381f286e793f6d4eedfa2dfa2", "hex");
// {"system":{"set_relay_state":{"state":1}}}

// var encrypted = new Buffer("00000025d0f281e28aef8bfe92f7d5ef94b6d1b4c09ff194ec98c7a6c5b1d8b7d9fbc1afdab6daa7da", "hex");
// {"schedule":{"get_next_action":null}}

// 0000002ad0f281f88bff9af7d5ef94b6c5a0d48bf99cf091e8b7c4b0d1a5c0e2d8a381f286e793f6d4eedea3dea3
// {"system":{"set_relay_state":{"state":0}}}

// 0000002dd0f281f88bff9af7d5ef94b6c5a0d48bf99cf091e8b7c4b0d1a5c0e2d8a381e496e4bbd8b7d3b694ae9ee39ee3
// {"system":{"set_relay_state":{"err_code":0}}}

// These string come from https://georgovassilis.blogspot.com/2016/05/controlling-tp-link-hs100-wi-fi-smart.html
var payload_on = new Buffer("AAAAKtDygfiL/5r31e+UtsWg1Iv5nPCR6LfEsNGlwOLYo4HyhueT9tTu36Lfog==", "base64");
// {"system":{"set_relay_state":{"state":1}}}

// base64 encoded data to send to the plug to switch it off
var payload_off = new Buffer("AAAAKtDygfiL/5r31e+UtsWg1Iv5nPCR6LfEsNGlwOLYo4HyhueT9tTu3qPeow==", "base64");
// {"system":{"set_relay_state":{"state":0}}}

// base64 encoded data to send to the plug to query it
var payload_query = new Buffer("AAAAI9Dw0qHYq9+61/XPtJS20bTAn+yV5o/hh+jK8J7rh+vLtpbr", "base64");
// { "system":{ "get_sysinfo":null } }

// base64 encoded data to query emeter - hs100 doesn't seem to support this in hardware, but the API seems to be there...
var payload_emeter = new Buffer("AAAAJNDw0rfav8uu3P7Ev5+92r/LlOaD4o76k/6buYPtmPSYuMXlmA==", "base64");
// { "emeter":{ "get_realtime":null } }

console.log(decrypt(payload_on.slice(4)).toString());
var header = new Buffer(4);
header.fill(0);
header[3] = 0x2a;
var json = new Buffer("{\"system\":{\"set_relay_state\":{\"state\":1}}}");
console.log(Buffer.concat([header, json]).toString('hex'));
console.log(Buffer.concat([header, encrypt(json)]).toString("base64"));
console.log(Buffer.concat([header, encrypt(json)]).toString("hex"));