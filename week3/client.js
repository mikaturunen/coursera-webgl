"use strict";
// TODO undo functionality (use up, down to start new array and move to populate it, voila)

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

/**
 * Creates a simple rectangle around the given point. Point being the origin of the rectangle.
 * @param {vec2} origin Rectangle origin
 * @returns {vec2[]} Rectangle made from two triangles. Ready to be rendered with gl.TRIANGLES.
 */
const createRectangle = (origin, size) => {
	size = size * 0.005;
	// TODO should we rotate the rectangle?
	return [
		vec2(-size + origin[0], -size + origin[1]),
		vec2(-size + origin[0], size + origin[1]),
		vec2(size + origin[0], -size + origin[1]),
		vec2(size + origin[0], -size + origin[1]),
		vec2(size + origin[0], size + origin[1]),
		vec2(-size + origin[0], size + origin[1])
	];
}

/**
 * Thought of making a simple LErP function but what it turned into is a beast
 * with a broken soul that should be rewritten.. Yeah, it's a LERP function that
 * barely does what it's told.
 * @param {vec2} current Current position of mouse in pixel space.
 * @param {vec2} previous Previous position of the mouse in pixel space.
 * @retuns {vec2[]} Array of interpolated values ending to 'current' position.
 */
const superSimpleLerp = (current, previous) => {
	if (current[0] === previous[0] && current[1] === previous[0]) {
		return [ current ];
	}

	let direction = subtract(current, previous);
	let magnitude = Math.floor(length(direction));

	let interpolatedPoints = [];
	lerp(interpolatedPoints, previous, direction, magnitude, 1);
	interpolatedPoints.push(current);
	return interpolatedPoints;
};

/**
 * Linear interpolation function. Super simple.
 */
const lerp = (newPoints, start, direction, magnitude, count) => {
	if (magnitude === 1) {
		return;
	}

	let t = 0;
	let scaled;
	let interpolatedPosition;

	for(var count=1; magnitude>count; count++) {
		t = (1 / magnitude) * count;
		scaled = scale(t, direction);
		interpolatedPosition = add(start, scaled);
		newPoints.push(vec2(interpolatedPosition[0], interpolatedPosition[1]));
	}
}

/**
 * Clears the canvas of all colors.
 */
const clearCanvas = () => {
	positions = [];
	vertices = [];
	verticeColors = [];
	verticeUndoStart = [];

	sendValuesToGpu(vertices, verticeColors);
	render(vertices, verticeColors);
}

/**
 * Updates the size of the brush.
 */
const updateSize = () => {
	brushWidth = $("#size").val()
}

/**
 * On mouse down event.
 * @param {number} x Mouse X in pixel space
 * @param {number} y Mouse Y in pixel space
 */
const onMouseDown = (x, y) => {
	mouseDownPosition = vec2(x,y);
	positions.push(mouseDownPosition);
	verticeUndoStart.push([]);
	console.log(mouseDownPosition, "down");
}

/**
 * On mouse up event.
 * @param {number} x Mouse X in pixel space
 * @param {number} y Mouse Y in pixel space
 */
const onMouseUp = (x, y) => {
	mouseUpPosition = vec2(x,y);
	console.log(mouseUpPosition, "up");
}

/**
 * Generates the rectangle vertices with two triangles around the current origin.
 * @param {vec2}} current Origin for the rectangle.
 */
const createVertices = (current) => {
	// Interpolate positions between the existing x,y and the current one
	Array.prototype.push.apply(
		vertices,
		createRectangle(current, brushWidth)
	);

	Array.prototype.push.apply(
		verticeColors,
		[
			vec4(activeColor),
			vec4(activeColor),
			vec4(activeColor),
			vec4(activeColor),
			vec4(activeColor),
			vec4(activeColor)
		]
	);
}

/**
 * Converts value from screen space (pixels) to gl world space.
 * @param {vec2} p Point to convert.
 */
const convertToWorldCoordinates = (p) => {
	p[0] = 2 * p[0] / widthRatio - 1;
	p[1] = 2 * (heightRatio - p[1]) / heightRatio - 1;
}

/**
 * On mouse move event.
 * @param {number} x Mouse X in pixel space.
 * @param {number} y Mouse Y in pixel space.
 */
const onMouseMove = (x, y) => {
	if (!event.buttons) {
		return;
	}

	// Interpolating the canvas coordinates
	let interpolatedPositions = [];
	let previous = positions.length === 0 ? vec2(x, y) : positions[positions.length - 1];
	let current = vec2(x, y);
	positions.push(vec2(x, y));
	let interpolatedPoints = superSimpleLerp(current, previous);

	interpolatedPoints.forEach(p => {
		// Transform them into the world coordinates for gl to churn.
		convertToWorldCoordinates(p);
		createVertices(p);
	});

	sendValuesToGpu(vertices, verticeColors);
	render(vertices);
}

/**
 * Initializes the WebGL context completely.
 * @returns {boolean} true on success and false on failure.
 */
const initializeWebGl = () => {
	var canvas = document.getElementById("gl-canvas");
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
};

/**
 * Sends given values to GPU for handling.
 * @param {vec2[]} vertices Array of vertices
 * @param {vec4[]} verticeColors Color vertices for the vertices property.
 */
const sendValuesToGpu = (vertices, verticeColors) => {
	// Load the data into the GPU

	// Buffer for vertices
	const bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	let vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	// Buffer for vertice colors
	const colorBufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colorBufferId);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(verticeColors), gl.STATIC_DRAW );
	let vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
}

const render = (points) => {
	gl.clear(gl.COLOR_BUFFER_BIT);
	//gl.drawArrays(gl.LINES, 0, points.length);
	gl.drawArrays(gl.TRIANGLES, 0, points.length);
};

/**
 * OnLoad function. Given as callback to the window.onload to be loaded as the context becomes ready on the Window object.
 */
const onLoad = () => {
	if (!initializeWebGl()) {
		return;
	}

	let canvas = document.getElementById("webgl-canvas");
	widthRatio = $(canvas).width();
	heightRatio = $(canvas).width();
	offset = $(canvas).offset();

	canvas.addEventListener("mousemove", (e) => {
   	var rect = canvas.getBoundingClientRect();
    	var x = e.clientX - rect.left;
    	var y = e.clientY - rect.top;
		onMouseMove(x, y);
	});
	canvas.addEventListener("mousedown", (e) => {
   	var rect = canvas.getBoundingClientRect();
    	var x = e.clientX - rect.left;
    	var y = e.clientY - rect.top;
		onMouseDown(x, y);
	});
	canvas.addEventListener("mouseup", (e) => {
   	var rect = canvas.getBoundingClientRect();
    	var x = e.clientX - rect.left;
    	var y = e.clientY - rect.top;
		onMouseUp(x, y);
	});

 	var picker = document.getElementById("picker");

	updateSize();
	sendValuesToGpu(vertices, verticeColors);
	render(vertices);
};

window.onload = onLoad;
