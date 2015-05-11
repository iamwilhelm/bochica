var ref = require('ref');
var ffi = require('ffi');
//var THREE = require('three');

var libfab = ffi.Library('libfab/libfab', {
  'add_f': ['float', ['float', 'float']],

});

document.write("Sum: ", libfab.add_f(1.2, 3.4));

