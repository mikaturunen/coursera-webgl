"use strict";

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var renderer = {
    initialize: function initialize(canvas) {
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

    sendToGpu: function sendToGpu(vertices, verticeColors) {
        // Load the data into the GPU
        // Buffer for vertices
        var bufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, utility.flattenVertices(vertices), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // Buffer for vertice colors
        var colorBufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId);
        gl.bufferData(gl.ARRAY_BUFFER, utility.flattenVertices(verticeColors), gl.STATIC_DRAW);
        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
    },

    render: function render(vertices) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    }
};

var gl = undefined;

var initGL = function initGL(canvas) {
    gl = canvas.getContext("webgl");

    if (gl === undefined || gl === null) {
        alert("Could not initialise WebGL.");
        return;
    }

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
};

var getShader = function getShader(gl, id) {
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
};

var mvPushMatrix = function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
};

var mvPopMatrix = function mvPopMatrix() {
    if (mvMatrixStack.length <= 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
};

var setMatrixUniforms = function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
};

var degToRad = function degToRad(degrees) {
    return degrees * Math.PI / 180;
};

var webGLStart = function webGLStart() {
    var canvas = document.getElementById("webgl-canvas");

    $("#objectList").on("change", function () {
        switch (this.value) {
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
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
};

var Geometry = (function () {
    function Geometry() {
        _classCallCheck(this, Geometry);

        this.positionBuffer = undefined;
        this.colorBuffer = undefined;
        this.wireColorBuffer = undefined;

        this.vertices = [];
        this.colors = [];

        this.orientation = [0, 0, 0];
        this.position = [0, 0, 0];
        this.angle = [0, 0, 0];
    }

    _createClass(Geometry, [{
        key: "bindPositionBuffer",
        value: function bindPositionBuffer() {
            if (!this.positionBuffer) {
                this.positionBuffer = gl.createBuffer();
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        }
    }, {
        key: "bindColorBuffer",
        value: function bindColorBuffer() {
            if (!this.colorBuffer) {
                this.colorBuffer = gl.createBuffer();
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        }
    }, {
        key: "applyTranslation",
        value: function applyTranslation(modelViewMatrix) {
            mat4.translate(modelViewMatrix, this.position);
        }
    }, {
        key: "applyOrientation",
        value: function applyOrientation(modelViewMatrix) {
            mat4.rotate(modelViewMatrix, this.angle[0], [this.orientation[0], 0, 0]);
            mat4.rotate(modelViewMatrix, this.angle[1], [0, this.orientation[1], 0]);
            mat4.rotate(modelViewMatrix, this.angle[2], [0, 0, this.orientation[2]]);
        }
    }, {
        key: "bindBuffers",
        value: function bindBuffers() {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.positionBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.colorBuffer.itemSize, gl.FLOAT, false, 0, 0);
            setMatrixUniforms();
        }
    }, {
        key: "render",
        value: function render() {
            var renderWire = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
        }
    }]);

    return Geometry;
})();

var Pyramid = (function (_Geometry) {
    _inherits(Pyramid, _Geometry);

    function Pyramid() {
        _classCallCheck(this, Pyramid);

        _get(Object.getPrototypeOf(Pyramid.prototype), "constructor", this).call(this);

        // VERTICES
        _get(Object.getPrototypeOf(Pyramid.prototype), "bindPositionBuffer", this).call(this);
        this.vertices = [
        // Front face
        0.0, 1.0, 0.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
        // Right face
        0.0, 1.0, 0.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0,
        // Back face
        0.0, 1.0, 0.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0,
        // Left face
        0.0, 1.0, 0.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        // How many items per side
        this.positionBuffer.itemSize = 3;
        // How many vertices
        this.positionBuffer.numItems = 12;

        // COLORS
        _get(Object.getPrototypeOf(Pyramid.prototype), "bindColorBuffer", this).call(this);
        this.colors = [
        // Front face
        1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
        // Right face
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
        // Back face
        1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
        // Left face
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        this.colorBuffer.itemSize = 4;
        this.colorBuffer.numItems = 12;

        // WIREFRAME
        this.wireColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.wireColorBuffer);
        this.wireColors = [
        // Front face
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        // Right face
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        // Back face
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        // Left face
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.wireColors), gl.STATIC_DRAW);
        this.wireColorBuffer.itemSize = 4;
        this.wireColorBuffer.numItems = 12;
    }

    _createClass(Pyramid, [{
        key: "render",
        value: function render() {
            var renderWire = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            gl.drawArrays(gl.TRIANGLES, 0, this.positionBuffer.numItems);

            if (renderWire) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.wireColorBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, this.wireColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.LINE_STRIP, 0, this.positionBuffer.numItems);
            }
        }
    }, {
        key: "renderWires",
        value: function renderWires() {}
    }]);

    return Pyramid;
})(Geometry);