var gui = require('nw.gui');
var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var UnionType = require('ref-union');
var ffi = require('ffi');
//var THREE = require('three');

var FloatArray = ArrayType(ref.types.float);
var UInt16Array = ArrayType(ref.types.uint16);

var MathTree = ref.types.void;
var MathTreePtr = ref.refType(MathTree);

var PackedTree = ref.types.void;
var PackedTreePtr = ref.refType(PackedTree);

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

var Interval = StructType({
  'lower': 'float',
  'upper': 'float',
});

var ASDF = StructType({});
var ASDF = StructType({
  'state': 'int',

  'X': ref.refType(Interval),
  'Y': ref.refType(Interval),
  'Z': ref.refType(Interval),

  'branches': ArrayType(ref.refType(ASDF)),

  'd': FloatArray,

  'data': new UnionType({
    'vp': ref.refType('void'),
    //'cms': ArrayType(CMSPathPtr),
    'tri': ref.refType('uint32'),
    //'contour: ref.refType(ref.refType(Path))
  })

});
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
  'build_arrays': ['void', [RegionPtr, 'float', 'float', 'float', 'float', 'float', 'float']],

  // asdf
  'build_asdf': [ASDFPtr, [PackedTreePtr, Region, 'bool', IntPtr]],
  'asdf_root': [ASDFPtr, [PackedTreePtr, Region]],
});

var win = gui.Window.get();
win.showDevTools();

document.write("Sum: ", libfab.add_f(1.2, 3.4));

// create a math tree with the equation
var math_tree = libfab.parse('-r++qXqYqZf10');
libfab.print_tree_verbose(math_tree);

// create a packed tree from math tree
var packed_tree = libfab.make_packed(math_tree);

// make a region with a bounding box
var xmin = -50;
var xmax = 50;
var ymin = -50;
var ymax = 50;
var zmin = -50;
var zmax = 50;
var scale = 100;

var dx = xmax - xmin;
var dy = ymax - ymin;
var dz = zmax - zmin;

var ni = Math.max(Math.round(dx * scale), 1);
var nj = Math.max(Math.round(dy * scale), 1);
var nk = Math.max(Math.round(dz * scale), 1);

var region = new Region({
  imin: 0, jmin: 0, kmin: 0,
  ni: ni, nj: nj, nk: nk,
  voxels: ni * nj * nk,
  X: new FloatArray(ni + 1),
  Y: new FloatArray(nj + 1),
  Z: new FloatArray(nk + 1),
  L: new FloatArray(nk + 1),
});
console.log(region);
libfab.build_arrays(region.ref(), xmin, ymin, zmin, xmax, ymax, zmax);
console.log(region);

// make an ASDF root

// build ASDF from region and packed tree
var halt = ref.alloc(ref.types.int);
halt.writeInt32LE(0, 0);
console.log(halt);

// attach it to ASDF root
// use ASDF to generate mesh
// load mesh into vertex buffer
//


