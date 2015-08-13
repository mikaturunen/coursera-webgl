"use strict";

(function () {

    var gl = undefined;
    var program = undefined;
    var widthRatio = 0;
    var heightRatio = 0;
    var offset = { top: 0, left: 0 };
    var positions = [];
    var vertices = [];
    var verticeUndoStart = [];
    var verticeColors = [];
    var activeColor = undefined;
    var brushWidth = 1;
    var mouseDownPosition = undefined;
    var mouseUpPosition = undefined;

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
            gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
            var vPosition = gl.getAttribLocation(program, "vPosition");
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            // Buffer for vertice colors
            var colorBufferId = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferId);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(verticeColors), gl.STATIC_DRAW);
            var vColor = gl.getAttribLocation(program, "vColor");
            gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vColor);
        },

        render: function render(vertices) {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        }
    };

    var utility = {
        toWorldCoordinates: function toWorldCoordinates(p) {
            p[0] = 2 * p[0] / widthRatio - 1;
            p[1] = 2 * (heightRatio - p[1]) / heightRatio - 1;
        }
    };

    /**
     * Creates a simple rectangle around the given point. Point being the origin of the rectangle.
     * @param {vec2} origin Rectangle origin
     * @returns {vec2[]} Rectangle made from two triangles. Ready to be rendered with gl.TRIANGLES.
     */
    var createRectangle = function createRectangle(origin, size) {

        return [vec2(-size + origin[0], -size + origin[1]), vec2(-size + origin[0], size + origin[1]), vec2(size + origin[0], -size + origin[1]), vec2(size + origin[0], -size + origin[1]), vec2(size + origin[0], size + origin[1]), vec2(-size + origin[0], size + origin[1])];
    };

    // Attaching a super simple event to the window onload event and going from there
    window.onload = function () {
        var canvas = document.getElementById("webgl-canvas");
        if (!renderer.initialize(canvas)) {
            return;
        }

        widthRatio = $(canvas).width();
        heightRatio = $(canvas).width();
        offset = $(canvas).offset();

        verticeColors = [vec4(1, 0, 0, 1), vec4(1, 0, 0, 1), vec4(1, 0, 0, 1), vec4(1, 0, 0, 1), vec4(1, 0, 0, 1), vec4(1, 0, 0, 1)];
        vertices = createRectangle(vec2(0, 0), 0.5);

        renderer.sendToGpu(vertices, verticeColors);
        renderer.render(vertices);
    };
})();