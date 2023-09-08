import {Curtains, Plane, Vec2} from './src/index.mjs';

export const curtain = (cCanvas,cClass,cId) => {
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

    const curtains = new Curtains({
        container: cCanvas,
        premultipliedAlpha: true,
        pixelRatio: Math.min(1.5, window.devicePixelRatio) // limit pixel ratio for performance
    });

    // handling errors
    curtains.onError(function() {
        // we will add a class to the document body to display original images
        document.body.classList.add("no-curtains");
    }).onContextLost(() => {
        curtains.restoreContext();
    });


    // const planeElements = document.getElementsByClassName("curtain");
    const planeElements = document.getElementsByClassName(cClass)

    if(planeElements.length > 0) {

        const curtainPlaneParams = {
            widthSegments: 50,
            heightSegments: 37,
            drawCheckMargins: {
                top: 0,
                right: 0,
                bottom: 100,
                left: 0,
            },
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

        // home curtain
        // here we will write our title inside our canvas
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


        const canvas = document.createElement("canvas");

        canvas.setAttribute("data-sampler", "titleSampler");
        canvas.style.display = "none";

        curtainPlane.loadCanvas(canvas);

        curtainPlane.onReady(() => {
            const wrapper = document.getElementById(cId);

            wrapper.addEventListener("mousemove", function(e) {
                handleMovement(e, curtainPlane);
            });

            wrapper.addEventListener("touchmove", function(e) {
                handleMovement(e, curtainPlane);
            }, {passive: true});

        }).onLoading((texture) => {
			deltas.max = 4;
            // if(curtainPlane.textures.length === 2) {
            //     setTimeout(() => {
            //         // document.body.classList.add("curtain-ready");
            //         deltas.max = 4;
            //     }, 200);
            // }
        }).onRender(() => {
			// console.log(curtainPlane);
            curtainPlane.uniforms.mouseTime.value++;

            // decrease the mouse move strenght with damping : if the user doesn't move the mouse, effect will fade away
            deltas.applied += (deltas.max - deltas.applied) * 0.02;
            deltas.max += (0 - deltas.max) * 0.01;

            // send the new mouse move strength value
            curtainPlane.uniforms.mouseMoveStrength.value = deltas.applied;

        }).onReEnterView(() => {
            // force title drawing if it was hidden on page load
            curtainPlane.textures[1].needUpdate();
        }).onAfterResize(() => {
            writeTitle(curtainPlane, canvas);
        });
    }

	
}