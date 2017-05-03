if (typeof String.prototype.startsWith !== 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) === str;
  };
}
var modelLoader = {};

modelLoader.Mesh = function( objectData ){
    /*
        With the given elementID or string of the OBJ, this parses the
        OBJ and creates the mesh.
    */

    var verts = [];
    
    // unpacking stuff
    var packed = {};
    packed.indices = [];
    
    // array of lines separated by the newline
    var lines = objectData.split( '\n' )
    for( var i=0; i<lines.length; i++ ){

       lines[i] = lines[i].replace(/\s{2,}/g, " "); // remove double spaces

      // if this is a vertex
      if( lines[ i ].startsWith( 'v ' ) ){
        line = lines[ i ].slice( 2 ).split( " " )
        verts.push( line[ 0 ] );
        verts.push( line[ 1 ] );
        verts.push( line[ 2 ] );
      }
      // if this is a vertex normal
      else if( lines[ i ].startsWith( 'vn' ) ){
      }
      // if this is a texture
      else if( lines[ i ].startsWith( 'vt' ) ){
      }
      // if this is a face
      else if( lines[ i ].startsWith( 'f ' ) ){
        line = lines[ i ].slice( 2 ).split( " " );
        for(var j=1; j <= line.length-2; j++){
            var i1 = line[0].split('/')[0] - 1;
            var i2 = line[j].split('/')[0] - 1;
            var i3 = line[j+1].split('/')[0] - 1;
            packed.indices.push(i1,i2,i3);
        }
      }
    }
    this.vertices = verts;
    this.indices = packed.indices;
    this.normal = computeNormal(verts,packed.indices);
}

function normalize(v) {
  var det = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
  return [v[0]/det,v[1]/det,v[2]/det];
}

function computeNormal(vertices, indices) {
  var normal_vect = [];
	var average_vect = [];
	
  for(var i=0;i<indices.length;i+=3){
		var v1 = [vertices[3*indices[i]], vertices[3*indices[i]+1], vertices[3*indices[i]+2]];
		var v2 = [vertices[3*indices[i+1]], vertices[3*indices[i+1]+1], vertices[3*indices[i+1]+2]];
		var v3 = [vertices[3*indices[i+2]], vertices[3*indices[i+2]+1], vertices[3*indices[i+2]+2]];
		var a = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
		var b = [v3[0]-v1[0], v3[1]-v1[1], v3[2]-v1[2]];
		var ax = a[1]*b[2]-a[2]*b[1];
		var ay = a[2]*b[0]-a[0]*b[2];
		var az = a[0]*b[1]-a[1]*b[0];
		var normal = normalize([ax,ay,az]);
   
		if(average_vect[indices[i]] == null){
			average_vect[indices[i]] = [];
			}
		if(average_vect[indices[i+1]] == null){
			average_vect[indices[i+1]] = [];
			} 
		if(average_vect[indices[i+2]] == null){
			average_vect[indices[i+2]] = [];
			}
      
		average_vect[indices[i]].push(normal);
		average_vect[indices[i+1]].push(normal);
		average_vect[indices[i+2]].push(normal);
	}
 
  for(i=0;i<vertices.length;i+=3){
	  var k = i/3;
		normal_vect[i] = 0.0;
		normal_vect[i+1] = 0.0;
		normal_vect[i+2] = 0.0;

    if (average_vect[k] != null){
      for(var j=0;j<average_vect[k].length;j++){
				normal_vect[i] += average_vect[k][j][0];
				normal_vect[i+1] += average_vect[k][j][1];
				normal_vect[i+2] += average_vect[k][j][2];
      }
      if(average_vect[k].length>0){
				normal_vect[i] /= average_vect[k].length;
				normal_vect[i+1] /= average_vect[k].length;
				normal_vect[i+2] /= average_vect[k].length;
      }else{
				normal_vect[i] = 0.0;
				normal_vect[i+1] = 0.0;
				normal_vect[i+2] = 0.0;
      }
    }
  }

  return normal_vect; 
}