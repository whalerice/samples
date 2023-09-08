import { Curtains } from './curtains/src/index.mjs';
import { initCurtain } from './curtains/plane.min.js';

const splideState = {
	type: 'fade',
	autoplay : true,
	interval: 7000,
	pauseOnHover: false,
	pauseOnFocus:false,
	pagination: false,
	rewind: true,
	easing: 'cubic-bezier(0.25, 0.25, 0.75, 0.75)',
}

const splide = new Splide('.splide', splideState).mount();
const bar    = splide.root.querySelector( '.slider-progress-bar' );
const header = document.querySelector('.header');
const end = splide.Components.Controller.getEnd() + 1;

const smokeInfo = [
	{
		objs: {
			canvas: document.querySelector('#smoke1'),
			img: document.querySelector('.img-1'),
			party: smokemachine(document.querySelector('#smoke1').getContext('2d'), [255,255,255]),
		},
		values: {x:433,y:391,width:700,height:699}
	},
	{
		objs: {
			canvas: document.querySelector('#smoke2'),
			img: document.querySelector('.img-2'),
			party: smokemachine(document.querySelector('#smoke2').getContext('2d'), [255,255,255]),
		},
		values: {x:378,y:671,width:1067,height:988}
	},
	{
		objs: {
			canvas: document.querySelector('#smoke3'),
			img: document.querySelector('.img-3'),
			party: smokemachine(document.querySelector('#smoke3').getContext('2d'), [255,255,255]),
		},
		values: {x:409,y:601,width:1400,height:1230}
	},
	{
		objs: {
			canvas: document.querySelector('#smoke4'),
			img: document.querySelector('.img-4'),
			party: smokemachine(document.querySelector('#smoke4').getContext('2d'), [255,255,255]),
		},
		values: {x:534,y:647,width:1200,height:871}
	},
	{
		objs: {
			canvas: document.querySelector('#smoke5'),
			img: document.querySelector('.img-5'),
			party: smokemachine(document.querySelector('#smoke5').getContext('2d'), [255,255,255]),
		},
		values: {x:165,y:493,width:1400,height:959}
	},
	{
		objs: {
			canvas: document.querySelector('#smoke6'),
			img: document.querySelector('.img-6'),
			party: smokemachine(document.querySelector('#smoke6').getContext('2d'), [255,255,255]),
		},
		values: {x:256,y:604,width:600,height:976}
	},
	{
		objs: {
			canvas: document.querySelector('#smoke7'),
			img: document.querySelector('.img-7'),
			party: smokemachine(document.querySelector('#smoke7').getContext('2d'), [255,255,255]),
		},
		values: {x:1040,y:867,width:1761,height:1085}
	},
	{
		objs: {
			canvas: document.querySelector('#smoke8'),
			img: document.querySelector('.img-8'),
			party: smokemachine(document.querySelector('#smoke8').getContext('2d'), [255,255,255]),
		},
		values: {x:511,y:677,width:1000,height:938}
	},
	{
		objs: {
			canvas: document.querySelector('#smoke9'),
			img: document.querySelector('.img-9'),
			party: smokemachine(document.querySelector('#smoke9').getContext('2d'), [255,255,255]),
		},
		values: {x:759,y:555,width:1100,height:956}
	}
];
splide.on('move', function (destIndex,prevIndex) {
	bar.style.width = String( 100 * ( destIndex + 1 ) / end ) + '%';
	
	if (prevIndex !== 9) {
		smokeInfo[prevIndex].objs.party.stop();
	}

	if (destIndex !== 9) {
		smokeInfo[destIndex].objs.party.start();
	}

	if (destIndex === 9) {
		curtainsA.clearDepth();
		curtainsA.disableDrawing();
		header.classList.add('hide');

		curtainsB.enableDrawing();
	}
	else {
		curtainsA.enableDrawing();
		header.classList.remove('hide');

		curtainsB.clearDepth();
		curtainsB.disableDrawing();
	}
});
splide.on('resized', function () {
	initSmoke();
});

function initSmoke() {
	for (let i = 0; i < smokeInfo.length; i++) {
		const elem = smokeInfo[i];
		elem.objs.canvas.getContext("2d").clearRect(0, 0, 0, 0);
	}
	smokeInfo.forEach((item) => {
		const canvas = item.objs.canvas;
		const party = item.objs.party;
		const img = item.objs.img;
		const values = item.values;

		party.setPreDrawCallback(() => {
			const x = img.offsetLeft + ((img.width * values.x)/values.width);
			const y = img.offsetTop + ((img.height * values.y)/values.height);
			canvas.width = innerWidth;
			canvas.height = innerHeight;
			party.addSmoke(x, y, .1);
		});
	})
	
}

const curtainsA = new Curtains({
	container: 'canvas',
	premultipliedAlpha: true,
	pixelRatio: Math.min(1.5, window.devicePixelRatio)
});

const curtainsB = new Curtains({
	container: 'canvas2',
	premultipliedAlpha: true,
	pixelRatio: Math.min(1.5, window.devicePixelRatio)
});

window.addEventListener('load', () => {
	bar.style.width = String( 100 * 1 / end ) + '%';
	initCurtain(curtainsA,'curtain','header');
	initCurtain(curtainsB,'curtain2','simbolbox');
	initSmoke();
	for (let i = 0; i < smokeInfo.length; i++) {
		const element = smokeInfo[i];
		element.objs.party.stop();
	}
	smokeInfo[0].objs.party.start();
	document.body.addEventListener('contextmenu', event =>{event.preventDefault()})
});