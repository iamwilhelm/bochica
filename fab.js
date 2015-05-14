var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var ffi = require('ffi');
//var THREE = require('three');

var MathTree = ref.types.void;
var MathTreePtr = ref.refType(MathTree);

var PackedTree = ref.types.void;
var PackedTreePtr = ref.refType(PackedTree);

var FloatArray = ArrayType(ref.types.float);
var UInt16Array = ArrayType(ref.types.uint16);

var Region = StructType({
  'imin': 'uint32',
  'jmin': 'uint32',
  'kmin': 'uint32',
  'ni': 'uint32',
  'nj': 'uint32',
  'nk': 'uint32',
  'voxels': 'uint64',
  'X': FloatArray,
  'Y': FloatArray,
  'Z': FloatArray,
  'L': UInt16Array,
});
var RegionPtr = ref.refType(Region);

var ASDF = ref.types.void;
var ASDFPtr = ref.refType(ASDF);

var IntPtr = ref.refType('int');

var libfab = ffi.Library('libfab/libfab', {
  // math
  'add_f': ['float', ['float', 'float']],

  // mathtree
  //'new_tree': [MathTreePtr, ['uint32', 'uint32']],
  'parse': [MathTreePtr, ['string']],
  'print_tree': ['void', [MathTreePtr]],
  'print_tree_verbose': ['void', [MathTreePtr]],

  // packed tree
  'make_packed': [PackedTreePtr, [MathTreePtr]],

  // region
  'build_arrays': [RegionPtr, ['float', 'float', 'float', 'float', 'float', 'float']],

  // asdf
  'build_asdf': [ASDFPtr, [PackedTreePtr, Region, 'bool', IntPtr]],
  'asdf_root': [ASDFPtr, [PackedTreePtr, Region]],
});

document.write("Sum: ", libfab.add_f(1.2, 3.4));

// create a math tree with the equation
var math_tree = libfab.parse('-r++qXqYqZf10');
libfab.print_tree_verbose(math_tree);

// create a packed tree from math tree
var packed_tree = libfab.make_packed(math_tree);

// make a region with a bounding box
var region = new Region({
  imin: 0, jmin: 0, kmin: 0,
  ni: 1000, nj: 1000, nk: 1000,
  voxels: 1000 * 1000 * 1000,
  X: new FloatArray(0), Y: new FloatArray(0), Z: new FloatArray(0), L: new FloatArray(0),
});
console.log(region.toJSON());

// make an ASDF root

// build ASDF from region and packed tree
// attach it to ASDF root
// use ASDF to generate mesh
// load mesh into vertex buffer
//


