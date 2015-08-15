"use strict";

var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fragment");
    var vertexShader = getShader(gl, "shader-vertex");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

var mvMatrixStack = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function initBuffers() {
    createGeometry();
}

var createGeometry = function createGeometry(a, b, c) {
    allGeometry.push(new Pyramid());
};

var allGeometry = [];

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    // move camera back
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0, 0.0, -10.0]);

    allGeometry.forEach(function (geometry) {
        mvPushMatrix();
        geometry.applyTranslation(mvMatrix);
        geometry.applyOrientation(mvMatrix);
        geometry.bindBuffers();
        geometry.render(true);
        mvPopMatrix();
    });
}

var lastTime = 0;
var animate = function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        allGeometry.forEach(function (geometry) {
            geometry.angle[1] += 2.0 * elapsed / 1000.0;
            //geometry.angle[2] -= (7.5 * elapsed) / 1000.0;
            geometry.orientation[1] = 1;
        });
    }

    lastTime = timeNow;
};

var tick = function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
};

window.onload = webGLStart;