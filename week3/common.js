"use strict";

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

let gl;

const initGL = (canvas) => {
    gl = canvas.getContext("webgl");

    if (gl === undefined || gl === null) {
        alert("Could not initialise WebGL.");
        return;
    }

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}

const getShader = (gl, id) => {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType === 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    console.log(str);
    console.log("----");

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

const mvPushMatrix = () => {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

const mvPopMatrix = () => {
    if (mvMatrixStack.length <= 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

const setMatrixUniforms = () => {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

const degToRad = (degrees)  => {
    return degrees * Math.PI / 180;
}

const webGLStart = () => {
    var canvas = document.getElementById("webgl-canvas");

    $("#objectList").on("change", function() {
        switch(this.value) {
            case "sphere":
                break;

            case "cone":
                break;

            case "cylinder":
                createGeometry();
                break;
        }
    });

    initGL(canvas);
    initShaders()
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}

class Geometry {
    constructor() {
        this.positionBuffer = undefined;
        this.colorBuffer = undefined;
        this.wireColorBuffer = undefined;

        this.vertices = [];
        this.colors = [];

        this.orientation = [ 0, 0, 0 ];
        this.position = [ 0, 0, 0 ];
        this.angle = [ 0, 0, 0 ];
    }

    bindPositionBuffer() {
        if (!this.positionBuffer) {
            this.positionBuffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    }

    bindColorBuffer() {
        if (!this.colorBuffer) {
            this.colorBuffer = gl.createBuffer();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    }

    applyTranslation(modelViewMatrix) {
        mat4.translate(modelViewMatrix, this.position);
    }

    applyOrientation(modelViewMatrix) {
        mat4.rotate(modelViewMatrix, this.angle[0], [ this.orientation[0], 0, 0 ]);
        mat4.rotate(modelViewMatrix, this.angle[1], [ 0, this.orientation[1], 0 ]);
        mat4.rotate(modelViewMatrix, this.angle[2], [ 0, 0, this.orientation[2] ]);
    }

    bindBuffers() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
    }

    render(renderWire = false) {
    }
}

class Pyramid extends Geometry {
    constructor() {
        super();

        // VERTICES
        super.bindPositionBuffer();
        this.vertices = [
            // Front face
             0.0,  1.0,  0.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
            // Right face
             0.0,  1.0,  0.0,
             1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,
            // Back face
             0.0,  1.0,  0.0,
             1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,
            // Left face
             0.0,  1.0,  0.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        // How many items per side
        this.positionBuffer.itemSize = 3;
        // How many vertices
        this.positionBuffer.numItems = 12;

        // COLORS
        super.bindColorBuffer();
        this.colors = [
            // Front face
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            // Right face
            1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            // Back face
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            // Left face
            1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        this.colorBuffer.itemSize = 4;
        this.colorBuffer.numItems = 12;

        // WIREFRAME
        this.wireColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.wireColorBuffer);
        this.wireColors = [
            // Front face
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            // Right face
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            // Back face
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            // Left face
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.wireColors), gl.STATIC_DRAW);
        this.wireColorBuffer.itemSize = 4;
        this.wireColorBuffer.numItems = 12;
    }

    render(renderWire = false) {
        gl.drawArrays(gl.TRIANGLES, 0, this.positionBuffer.numItems);

        if (renderWire) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.wireColorBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.wireColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINE_STRIP, 0, this.positionBuffer.numItems);
        }
    }

    renderWires() {
    }
}
