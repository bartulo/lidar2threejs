function L2TGeometry( ) {

  THREE.InstancedBufferGeometry.call(this);
  this.res = 10;
  
  }

L2TGeometry.prototype = Object.assign( Object.create( THREE.InstancedBufferGeometry.prototype ), {

  constructor: L2TGeometry,

  loadData: function( sourceDensity, sourceHeight, callback ) {

    var scope = this;

    // Leer MDT

    var loaderMDT = new THREE.FileLoader();
    loaderMDT.setResponseType( 'arraybuffer' );

    loaderMDT.load( 'images/m.bin', function( data ) {
      var mdtArray = new Uint8Array( data );

    // Leer imagen densidades 

    var loaderHeight = new THREE.FileLoader();
    loaderHeight.setResponseType( 'arraybuffer' );

    loaderHeight.load( sourceHeight, function( data ) {

      var heightArray = new Uint8Array( data );
      console.log( heightArray );
      scope.width = Math.sqrt( heightArray.length );
      
      // Leer imagen de alturas dentro del CallBack 

      var loaderDensity = new THREE.FileLoader();
      loaderDensity.setResponseType( 'arraybuffer' );

      loaderDensity.load( sourceDensity, function( data ) {
        
        var densityArray = new Uint8Array( data );
        var finalDensity = densityArray.map( function( data, index ) {

          if ( heightArray[ index ] == 0 ) {

            return 0;

          } else {

             // TODO jugar con esta función para obtener buenos resultados.

            let dens = ( Math.floor( ( data * Math.pow( scope.res, 2 ) / 100 ) / (  Math.pow( ( heightArray[ index ] / 40 ), 2 ) * 3.14 ) ) );
            if ( dens > 20 ){
              return 20;
            } else {
              return dens;
            }
          }

        });

        var densityCount = finalDensity.reduce( function( a, b ) {
          
          return a + b;

        });
        console.log( densityCount );

        var instancePositions = new Float32Array( densityCount * 3 );
        var instanceScales = new Float32Array( densityCount );

        var iterator = 0;
        var scaleIterator = 0;

        console.log( scope.width );
        console.log( scope.res );

        for ( let i  = 0; i < scope.width; i++ ) {
          for ( let n = 0; n < scope.width; n++ ) {
        
            var index = ( i * scope.width ) + n;

            planeGeometry.vertices[ index ].z = ( mdtArray[index ] / 255 ) * 900 -2;
            
            if ( finalDensity[ index ] != 0 ) {

              for ( let j = 0; j < finalDensity[ index ]; j++ ) {

                instancePositions[ iterator++ ] = ( n * scope.res ) - 995 + ( Math.random() - .5 ) * scope.res;
                instancePositions[ iterator++ ] = 995 - ( i * scope.res ) + ( Math.random() - .5 ) * scope.res;
                instancePositions[ iterator++ ] = ( mdtArray[index ] / 255 ) * 900 + 2 ;

                instanceScales[ scaleIterator++ ] = heightArray[ index ] / 1.5;

              }
            }
          }
        }

        scope.addAttribute( 'instancePosition', new THREE.InstancedBufferAttribute( instancePositions, 3, 'normalized' ));
        scope.addAttribute( 'instanceScale', new THREE.InstancedBufferAttribute( instanceScales, 1, 'normalized' ));

        if (callback !== undefined ) {

          callback();

        }

      });

    });
    });
  },

  loadModel: function( source, callback ) {

    var scope = this;

    var loader = new THREE.BufferGeometryLoader();

    loader.load( source, function( data ) {

      scope.addAttribute( 'position', data.attributes.position.clone() );
      scope.addAttribute( 'normal', data.attributes.normal.clone() );

      shaderMaterial = new THREE.MeshLambertMaterial( { color: 'green' } );
      shaderMaterial.onBeforeCompile = function( shader ) {

        shader.vertexShader = 'attribute vec3 instancePosition;\n' + shader.vertexShader;
        shader.vertexShader = 'attribute float instanceScale;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(

          '#include <begin_vertex>',
          `vec4 wa = vec4( instanceScale / 21., 0., 0., 1. );
          vec4 xa = vec4( 0., instanceScale / 21., 0., 1. );
          vec4 ya = vec4( 0., 0., instanceScale / 6., 1.);
          vec4 za = vec4( 0., 0., 0., 1. );
          mat4 instanceMatrix = mat4( wa, xa, ya, za );
          vec3 transformed = ( ( instanceMatrix * vec4( position, 1. ) ).xyz ) + instancePosition;
          `
          );

        materialShader = shader;

      };


      if ( callback !== undefined ) {

        callback();

       }

    });
  },

  init: function( ) {

  }


  });
