$(function() {
  var scene = new THREE.Scene();

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // set up the cube
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshLambertMaterial({ color: 0xdfff00 });
  var cube = new THREE.Mesh(geometry, material);
  scene.add( cube );

  // set up the rook
  var loader = new THREE.STLLoader();
  var shaderMaterial = new THREE.ShaderMaterial({
    attributes: {},
    uniforms: {
      time: { type: "f", value: 0 },
      resolution: { type: "v2", value: new THREE.Vector2 },
    },
    vertexShader: $('#vertex-shader').text(),
    fragementShader: $('#fragment-shader').text()
  });
  var mesh = null;
  loader.load('./assets/rook.stl', function(geometry) {
    var material = new THREE.MeshPhongMaterial({ color: 0xff5533, specular: 0x111111, shininess: 100 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set( 0, 0, 0 );
    mesh.rotation.set( 0, 0, 0 );
    mesh.scale.set( 0.5, 0.5, 0.5 );

    scene.add(mesh);
  });

  // set up lighting
  var ambientLight = new THREE.AmbientLight( 0x777777 );
  scene.add(ambientLight);

  var light = new THREE.PointLight(0xffffff);
  light.position.set(100, 0, 100);
  scene.add(light);

  // set up camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.z = 50;
  camera.position.y = -50;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  function render() {
    requestAnimationFrame( render );

    // move cube
    cube.rotation.x += 0.05;
    cube.rotation.y += 0.05;
    cube.position.x += 0.05;

    // move rook
    if (mesh != null) {
      //mesh.rotation.y += 0.05;
      mesh.rotation.z += 0.01;
    }

    // move camera
    //camera.position.x -= 0.05;

    renderer.render( scene, camera );
  }
  render();
});

