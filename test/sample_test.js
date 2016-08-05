'use strict';

//var grunt_init_node_sample = require('../lib/grunt-init-node-sample.js');

/*
    ======== A Handy Little Nodeunit Reference ========
    https://github.com/caolan/nodeunit

    Test methods:
        test.expect(numAssertions)
        test.done()
    Test assertions:
        test.ok(value, [message])
        test.equal(actual, expected, [message])
        test.notEqual(actual, expected, [message])
        test.deepEqual(actual, expected, [message])
        test.notDeepEqual(actual, expected, [message])
        test.strictEqual(actual, expected, [message])
        test.notStrictEqual(actual, expected, [message])
        test.throws(block, [error], [message])
        test.doesNotThrow(block, [error], [message])
        test.ifError(value)
*/

exports['sample-tests'] = {
    setUp: function(done) {
        // setup here
        done();
    },
    'no args': function(test) {
        test.expect(1);
        // tests here
        test.equal(1, 1, '1 should equal 1');
        test.done();
    },
};