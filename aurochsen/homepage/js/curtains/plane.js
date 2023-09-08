import {Plane, Vec2} from './src/index.mjs';

export const initCurtain = (curtainTarget,planeTarget,wrapperId) => {
	// console.log(curtainTarget);
	const mousePosition = new Vec2();
	const mouseLastPosition = new Vec2();
	const deltas = {
		max: 0,
		applied: 0,
	};
	
	function handleMovement(e, plane) {
		// update mouse last pos
		mouseLastPosition.copy(mousePosition);
	
		const mouse = new Vec2();
	
		// touch event
		if(e.targetTouches) {
			mouse.set(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
		}
		// mouse event
		else {
			mouse.set(e.clientX, e.clientY);
		}
	
		// lerp the mouse position a bit to smoothen the overall effect
		mousePosition.set(
			curtains.lerp(mousePosition.x, mouse.x, 0.3),
			curtains.lerp(mousePosition.y, mouse.y, 0.3)
		);
	
		if(plane) {
			const mouseCoords = plane.mouseToPlaneCoords(mousePosition);
	
			// mouse must be not too much below the curtains to update the uniforms
			if(mouseCoords.y > -1.25) {
				plane.uniforms.mousePosition.value = mouseCoords;
	
				if(mouseLastPosition.x && mouseLastPosition.y) {
					let delta = Math.sqrt(Math.pow(mousePosition.x - mouseLastPosition.x, 2) + Math.pow(mousePosition.y - mouseLastPosition.y, 2)) / 30;
					delta = Math.min(4, delta);
					if(delta >= deltas.max) {
						deltas.max = delta;
					}
				}
			}
		}
	}
	function writeTitle(plane, canvas) {
		const planeBoundinRect = plane.getBoundingRect();
	
		const htmlPlaneWidth = planeBoundinRect.width;
		const htmlPlaneHeight = planeBoundinRect.height;
	
		// set sizes
		canvas.width = htmlPlaneWidth;
		canvas.height = htmlPlaneHeight;
		const context = canvas.getContext("2d");
	
		context.width = htmlPlaneWidth;
		context.height = htmlPlaneHeight;
	}
	
	const curtains = curtainTarget;
	
	// handling errors
	curtains.onError(function() {
		// we will add a class to the document body to display original images
		document.body.classList.add("no-curtains");
	}).onContextLost(() => {
		curtains.restoreContext();
	});
	
	const vs = `precision mediump float;

	// default mandatory variables
	attribute vec3 aVertexPosition;
	attribute vec2 aTextureCoord;

	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;

	// custom variables
	varying vec3 vVertexPosition;
	varying vec3 vOriginalVertexPosition;
	varying vec2 vTextureCoord;

	uniform float uMouseTime;
	uniform vec2 uMousePosition;
	uniform float uMouseMoveStrength;


	void main() {

		vec3 vertexPosition = aVertexPosition;

		// fix the curtain on top (y coord ranges from top : 1.0 to bottom : -1.0)
		float yCoordRatio = vertexPosition.y - 1.0;


		float distanceFromMouse = distance(vec2(uMousePosition.x, 0.0), vec2(vertexPosition.x, 0.0));

		//float waveSinusoid = cos(10.0 * 1.5 * ((1.0 / (distanceFromMouse - 2.0)) - (uMouseTime / 500.0)));
		float waveSinusoid = cos(35.0 * ((1.0 / (cos(distanceFromMouse) - 2.0)) - uMouseTime * 0.0015));

		float xAttenuation = ((2.0 - abs(uMousePosition.x - vertexPosition.x)) / 2.0);
		float yAttenuation = ((-1.0 * uMousePosition.y) + 1.0) / 2.0;
		if(uMousePosition.y <= -1.0) {
			yAttenuation = yAttenuation + (uMousePosition.y + 1.0) * 1.5;
		}
		yAttenuation = clamp(yAttenuation, 0.0, 1.0);

		float curtainEffect = yCoordRatio  * waveSinusoid * uMouseMoveStrength * xAttenuation * yAttenuation;

		float xDisplacement = abs(yCoordRatio) * sign(vertexPosition.x);

		vertexPosition.z +=  curtainEffect / 30.0;
		vertexPosition.x +=  curtainEffect * 1.5 * xDisplacement / 240.0;

		gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

		// varyings
		vTextureCoord = aTextureCoord;
		vVertexPosition = vertexPosition;
		vOriginalVertexPosition = aVertexPosition;
	}`;
	const fs = `precision mediump float;

	varying vec3 vVertexPosition;
	varying vec3 vOriginalVertexPosition;
	varying vec2 vTextureCoord;

	uniform sampler2D curtainSampler;
	uniform sampler2D titleSampler;


	vec3 getNormal(vec3 pos, vec3 originalPos) {
		float diff = 0.25;
		vec3 neighbour1 = vec3(originalPos.x + diff, originalPos.y, originalPos.z);
		vec3 neighbour2 = vec3(originalPos.x, pos.y + diff, originalPos.z);
		vec3 tangent = (neighbour1 - pos);
		vec3 bitangent = (neighbour2 - pos);
		return normalize(cross(tangent, bitangent));
	}


	void main() {

		vec2 textureCoords = vec2(vTextureCoord.x, vTextureCoord.y);

		// slides transitions
		vec4 finalColor = texture2D(curtainSampler, textureCoords);
		vec4 title = texture2D(titleSampler, textureCoords);

		finalColor = mix(finalColor, title, title.a);

		//finalColor.rgb -= clamp(-vVertexPosition.z / 5.0, 0.0, 1.0);
		//finalColor.rgb += clamp(vVertexPosition.z / 5.0, 0.0, 1.0);

		vec3 normal = getNormal(vVertexPosition, vOriginalVertexPosition);

		vec3 lightPos = normalize(vec3(0.3, 0.3, 1.0));
		float light = smoothstep(0.45, 1.0, dot(normal, lightPos));

		float lightStrength = 0.35;
		float ambientLight = 1.0 - lightStrength;
		finalColor.rgb = finalColor.rgb * light * lightStrength + finalColor.rgb * ambientLight;

		// handling premultiplied alpha
		finalColor = vec4(finalColor.rgb * finalColor.a, finalColor.a);

		gl_FragColor = finalColor;
	}`;

	const planeElements = document.getElementsByClassName(planeTarget)
	
	const curtainPlaneParams = {
		vertexShader: vs,
        fragmentShader: fs,
		widthSegments: 50,
		heightSegments: 37,
		uniforms: {
			mouseTime: {
				name: "uMouseTime",
				type: "1f",
				value: 0,
			},
			mousePosition: {
				name: "uMousePosition",
				type: "2f",
				value: mousePosition,
			},
			mouseMoveStrength: {
				name: "uMouseMoveStrength",
				type: "1f",
				value: 0,
			},
		},
	};
	
	const curtainPlane = new Plane(curtains, planeElements[0], curtainPlaneParams);
	const canvas = document.createElement("canvas");
	
	canvas.setAttribute("data-sampler", "titleSampler");
	canvas.style.display = "none";
	
	curtainPlane.loadCanvas(canvas);
	
	curtainPlane.onReady(() => {
		const wrapper = document.getElementById(wrapperId);
	
		wrapper.addEventListener("mousemove", function(e) {
			handleMovement(e, curtainPlane);
		});
	
		wrapper.addEventListener("touchmove", function(e) {
			handleMovement(e, curtainPlane);
		}, {passive: true});
	
	}).onLoading(() => {
		deltas.max = 6;
	}).onRender(() => {
		curtainPlane.uniforms.mouseTime.value++;
		deltas.applied += (deltas.max - deltas.applied) * 0.02;
		deltas.max += (0 - deltas.max) * 0.01;
		curtainPlane.uniforms.mouseMoveStrength.value = deltas.applied;
	}).onReEnterView(() => {
		curtainPlane.textures[1].needUpdate();
	}).onAfterResize(() => {
		writeTitle(curtainPlane, canvas);
	});
}