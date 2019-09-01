function L2TGeometry( ) {

  THREE.InstancedBufferGeometry.call(this);
  this.meshArray = new Float32Array();
  this.meshNormalsArray = new Float32Array();
  this.heightArray = new Uint8Array();
  this.densityArray = new Uint8Array();
  this.densityCount = 10;
  
  }

L2TGeometry.prototype = Object.assign( Object.create( THREE.InstancedBufferGeometry.prototype ), {

  constructor: L2TGeometry,

  loadData: function( sourceDensity, sourceHeight, callback ) {

    var scope = this;

    // Leer imagen densidades 

    var loaderHeight = new THREE.FileLoader();
    loaderHeight.setResponseType( 'arraybuffer' );

    loaderHeight.load( sourceHeight, function( data ) {

      scope.heightArray = new Uint8Array( data );
      scope.width = Math.sqrt( scope.heightArray.length );
      
      // Leer imagen de alturas dentro del CallBack 

      var loaderDensity = new THREE.FileLoader();
      loaderDensity.setResponseType( 'arraybuffer' );

      loaderDensity.load( sourceDensity, function( data ) {
        
        scope.densityArray = new Uint8Array( data );
        scope.finalDensity = scope.densityArray.map( function( data, index ) {

          if ( scope.heightArray[ index ] == 0 ) {

            return 0;

          } else {
             // TODO jugar con esta función para obtener buenos resultados.

            return Math.ceil( data / scope.heightArray[ index ] );
          }

        });

        scope.densityCount = scope.finalDensity.reduce( function( a, b ) {
          
          return a + b;

        });

        var instancePositions = new Float32Array( scope.densityCount * 3 );
        var instanceScales = new Float32Array( scope.densityCount );

        var iterator = 0;
        var scaleIterator = 0;

        for ( let i  = 0; i < scope.width; i++ ) {
          for ( let n = 0; n < scope.width; n++ ) {
        
            var index = ( i * 80 ) + n;

            for ( let j = 0; j < scope.finalDensity[ index ]; j++ ) {

              instancePositions[ iterator++ ] = ( n * 25 ) - 987.5 + ( Math.random() - 0.5 ) * 25;
              instancePositions[ iterator++ ] = 987.5 - ( i * 25 ) + ( Math.random() - 0.5 ) * 25;
              //  TODO z en función de mdt
              instancePositions[ iterator++ ] = 0;

              instanceScales[ scaleIterator++ ] = scope.heightArray[ index ];

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
  },

  loadModel: function( source, callback ) {

    var scope = this;

    var loader = new THREE.BufferGeometryLoader();

    loader.load( source, function( data ) {

      scope.meshArray = data.attributes.position.clone();
      scope.meshNormalsArray = data.attributes.normal.clone();

      scope.addAttribute( 'position', data.attributes.position.clone() );
      scope.addAttribute( 'normal', data.attributes.normal.clone() );

      shaderMaterial = new THREE.MeshLambertMaterial( { color: 'green' } );
      shaderMaterial.onBeforeCompile = function( shader ) {

        shader.vertexShader = 'attribute vec3 instancePosition;\n' + shader.vertexShader;
        shader.vertexShader = 'attribute float instanceScale;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(

          '#include <begin_vertex>',
          'vec3 transformed = vec3( ( position * instanceScale / 15. ) + instancePosition );'
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
