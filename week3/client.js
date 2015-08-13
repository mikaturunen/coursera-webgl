"use strict";

(() => {

    let gl;
    let program;
    let widthRatio = 0;
    let heightRatio = 0;
    let offset = { top: 0, left: 0 };
    let positions = [];
    let vertices = [];
    let verticeUndoStart = [];
    let verticeColors = [];
    let activeColor;
    let brushWidth = 1;
    let mouseDownPosition;
    let mouseUpPosition;

    const renderer = {
        initialize: (canvas) => {
        	gl = WebGLUtils.setupWebGL(canvas);
        	if (!gl) {
        		alert("WebGL isn't available");
        		return false;
        	}

        	//  Configure WebGL
        	gl.viewport(0, 0, canvas.width, canvas.height);
        	gl.clearColor(1.0, 1.0, 1.0, 1.0);
        	//  Load shaders and initialize attribute buffers
        	program = initShaders(gl, "vertex-shader", "fragment-shader");
        	gl.useProgram(program);

        	return true;
        },

        sendToGpu: (vertices, verticeColors) => {
            // Load the data into the GPU
            // Buffer for vertices
            const bufferId = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            gl.bufferData(gl.ARRAY_BUFFER, utility.flattenVertices(vertices), gl.STATIC_DRAW);
            let vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            // Buffer for vertice colors
            const colorBufferId = gl.createBuffer();
            gl.bindBuffer( gl.ARRAY_BUFFER, colorBufferId);
            gl.bufferData( gl.ARRAY_BUFFER, utility.flattenVertices(verticeColors), gl.STATIC_DRAW );
            let vColor = gl.getAttribLocation( program, "vColor" );
            gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vColor);
        },

        render: (vertices) => {
        	gl.clear(gl.COLOR_BUFFER_BIT);
        	gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        }
    };

    const utility = {
        toWorldCoordinates: (p) => {
        	p[0] = 2 * p[0] / widthRatio - 1;
        	p[1] = 2 * (heightRatio - p[1]) / heightRatio - 1;
        },

        flattenVertices: (vertices) => {
            // Single item in the vertices array is an array vecX === [x,y]
            var floats = new Float32Array( vertices.length * 2 );
            vertices.forEach((v, index) => { floats[index] = v; });
            console.log(floats);
            return floats;
        }
    };

    /**
     * Creates a simple rectangle around the given point. Point being the origin of the rectangle.
     * @param {vec2} origin Rectangle origin
     * @returns {vec2[]} Rectangle made from two triangles. Ready to be rendered with gl.TRIANGLES.
     */
    const createRectangle = (origin, size) => {

    	return [
    		vec2.fromValues(-size + origin[0], -size + origin[1]),
    		vec2.fromValues(-size + origin[0], size + origin[1]),
    		vec2.fromValues(size + origin[0], -size + origin[1]),
    		vec2.fromValues(size + origin[0], -size + origin[1]),
    		vec2.fromValues(size + origin[0], size + origin[1]),
    		vec2.fromValues(-size + origin[0], size + origin[1])
    	];
    }

    // Attaching a super simple event to the window onload event and going from there
    window.onload = () => {
        let canvas = document.getElementById("webgl-canvas");
        if (!renderer.initialize(canvas)) {
    		return;
    	}

    	widthRatio = $(canvas).width();
    	heightRatio = $(canvas).width();
    	offset = $(canvas).offset();

        verticeColors = [
            vec4.fromValues(1,0,0,1),
            vec4.fromValues(1,0,0,1),
            vec4.fromValues(1,0,0,1),
            vec4.fromValues(1,0,0,1),
            vec4.fromValues(1,0,0,1),
            vec4.fromValues(1,0,0,1),
        ];
        vertices = createRectangle(vec2.fromValues(0,0), 0.5);

    	renderer.sendToGpu(vertices, verticeColors);
    	renderer.render(vertices);
    };

})();
