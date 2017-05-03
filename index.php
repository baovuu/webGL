<?php
?>
<html>
<head>
<meta charset="utf-8">
<title>Model Viewer</title>
<!-- include all javascript source files -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script type="text/javascript" src="js/sylvester.js"></script>
<script type="text/javascript" src="js/math.js"></script>
<script type="text/javascript" src="js/glUtils.js"></script>
<script type="text/javascript" src="js/meshLoader.js"></script>
<script type="text/javascript" src="js/arcball.js"></script>
<script type="text/javascript" src="js/demo.js"></script>
<script type="text/javascript" src="js/main.js"></script>
</head>
<body>
<canvas id="glcanvas">canvas not supported</canvas>

<div id="meshSelect-wrapper">
    <span>Select object from this directory (.obj files only)</span>
    <select id="meshSelect">
    <?php //----- php code to create html selection with local files

        $files = glob("*.obj"); //find all .obj files in current directory
        $beginFile = "";
        foreach ($files as $filename) {
            if($filename == end($files)){
                $beginFile = $filename;
                echo "<option selected=\"selected\">$filename</option>";
            } else {
                echo "<option>$filename</option>";
            }
        }
    ?>
    </select>
    <br />
    <span>Or upload a local file here:</span>
    <input type="file" id="files" name="files[]"/>
</div>


<!-- Fragment Shader -->
<script id="FragmentShader1" type="x-shader/x-fragment">
    #ifdef GL_OES_standard_derivatives
        #extension GL_OES_standard_derivatives : enable
    #endif

    precision mediump float;
    varying vec3 normalInterp;
    varying vec3 vertPos;

    const vec3 lightPos = vec3(1.0,1.0,1.0);
    const vec3 ambientColor = vec3(0.1, 0.1, 0.1);
    const vec3 diffuseColor = vec3(0.5, 0.1, 0.1);
    const vec3 specColor = vec3(1.0, 1.0, 1.0);

    void main(void){
      vec3 normal = normalize(normalInterp);
      vec3 lightDir = normalize(lightPos - vertPos);
      vec3 reflectDir = reflect(-lightDir, normal);
      vec3 viewDir = normalize(-vertPos);

      float lambertian = max(dot(lightDir,normal), 0.0);
      float specular = 0.0;

      if(lambertian > 0.0) {
        float specAngle = max(dot(reflectDir, viewDir), 0.0);
        specular = pow(specAngle, 15.0);
      }

      gl_FragColor = vec4(ambientColor + lambertian*diffuseColor + specular*specColor, 1.0);
    }
</script>

<!-- Vertex Shader -->
<script id="VertexShader1" type="x-shader/x-vertex">
    attribute vec3 vPos; //vertex position
    attribute vec3 bary; //barycentric
    attribute vec3 normals; //normal
    
    varying vec3 interpBary;
    varying vec3 normalInterp;
  
    varying vec3 vertPos;
    uniform mat4 uMVMatrix;//modelviewmatrix
    uniform mat4 uPMatrix;//projectionmatrix
    uniform mat4 uNMatrix;//normalmatrix
    
    void main(void) {
      interpBary = bary;
      gl_Position = uPMatrix * uMVMatrix * vec4(vPos, 1.0);
      vec3 normal = vec3(uNMatrix * vec4(normals, 0.0));
      vec4 vertPos4 = uMVMatrix * vec4(vPos, 1.0);
      vertPos = vec3(vertPos4) / vertPos4.w;
      normalInterp = vec3(uNMatrix * vec4(normals, 0.0));
    }
</script>


<script>
    //grab the filename for the .obj we will first open
    var filename = "<? echo $beginFile ?>";

    //register callbacks for mesh loading
    setupLoadingCallbacks();

    //call the main mesh Loading function; main.js
    executeMainLoop(filename); 
</script>

</body>
</html>
