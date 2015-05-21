var gui = require('nw.gui');
var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var UnionType = require('ref-union');
var ffi = require('ffi');
//var THREE = require('three');

var FloatArray = ArrayType('float');
var UInt16Array = ArrayType('uint16');
var UInt32Array = ArrayType('uint32');

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

//var CMSpath = StructType({})
//var CMSpath = StructType({
//  'edge': 'int',
//  'next': ref.refType(CMSpath),
//  'prev': ref.refType(CMSpath),
////  'vertex'
//});

var ASDF = StructType({});
var ASDFPtr = ref.refType(ASDF);
ASDF.defineProperty('state', 'int');
ASDF.defineProperty('X', Interval);
ASDF.defineProperty('Y', Interval);
ASDF.defineProperty('Z', Interval);
ASDF.defineProperty('branches', ArrayType(ASDFPtr, 8));
ASDF.defineProperty('d', new ArrayType('float', 8));
ASDF.defineProperty('data',
  new UnionType({
    'vp': ref.refType('void'),
    'cms': ref.refType('void'),
    //'cms': ArrayType(CMSPathPtr),
    'tri': ref.refType('uint32'),
    'contour': ref.refType('void'),
    //'contour: ref.refType(ref.refType(Path))
  })
);
console.log(ASDF.size);

var Mesh = StructType({
  'vdata': FloatArray,
  'vcount': 'uint32',
  'valloc': 'uint32',

  'tdata': UInt32Array,
  'tcount': 'uint32',
  'talloc': 'uint32',

  'X': Interval,
  'Y': Interval,
  'Z': Interval,
});
var MeshPtr = ref.refType(Mesh);

var IntPtr = ref.refType('int');

var libfab = ffi.Library('build/libfab', {
  // math
  'add_f': ['float', ['float', 'float']],

  // mathtree
  'parse': [MathTreePtr, ['string']],
  'print_tree': ['void', [MathTreePtr]],
  'print_tree_verbose': ['void', [MathTreePtr]],

  // packed tree
  'make_packed': [PackedTreePtr, [MathTreePtr]],
  'eval_f': ['float', [PackedTreePtr, 'float', 'float', 'float']],

  // region
  'build_arrays': ['void', [RegionPtr, 'float', 'float', 'float', 'float', 'float', 'float']],

  // asdf
  'build_asdf': [ASDFPtr, [PackedTreePtr, Region, 'bool', IntPtr]],
  'asdf_root': [ASDFPtr, [PackedTreePtr, Region]],
  'triangulate': [MeshPtr, [ASDFPtr, IntPtr]],
});

var win = gui.Window.get();
win.showDevTools();

document.write("Sum: ", libfab.add_f(1.2, 3.4));

// create a math tree with the equation
var math_tree_ptr = libfab.parse('-r++qXqYqZf1');
libfab.print_tree_verbose(math_tree_ptr);

// create a packed tree from math tree
var packed_tree_ptr = libfab.make_packed(math_tree_ptr);

// make a region with a bounding box
var xmin = -0.05;
var xmax = 1.05;
var ymin = -0.05;
var ymax = 1.05;
var zmin = -0.05;
var zmax = 1.05;
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
libfab.build_arrays(region.ref(), xmin, ymin, zmin, xmax, ymax, zmax);
console.log("Region");
console.log(region);

// make an ASDF root
var asdf_root_ptr = libfab.asdf_root(packed_tree_ptr, region);
console.log("ASDF root");
console.log(asdf_root_ptr.deref());

// build ASDF from region and packed tree
var halt_ptr = ref.alloc(ref.types.uint32);
halt_ptr.writeInt32LE(0, 0);

var asdf_ptr = libfab.build_asdf(packed_tree_ptr, region, true, halt_ptr);
console.log("ASDF");
console.log(asdf_ptr.deref());

// attach it to ASDF root

// use ASDF to generate mesh
var mesh = libfab.triangulate(asdf_ptr, halt_ptr);
console.log("Mesh");
console.log(mesh.deref());

// load mesh into vertex buffer


