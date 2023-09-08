(() => {
	let yOffset;
	const goTop = document.querySelector('#goTop');
	const slideArea = document.querySelector('.slider-area');

	$('.owl-carousel').owlCarousel({
		center: true,
		loop: true,
		autoWidth: true,
		touchDrag: false,
		autoplay: true,
		mouseDrag: false,
	});

	window.addEventListener('load', () => {
		AOS.init();
	});

	window.addEventListener('resize', () => {
		yOffset = window.pageYOffset;
	});

	window.addEventListener('scroll', () => {
		yOffset = window.pageYOffset;
		let box = document.querySelector('.slider-box');
		let boxHeight = box.clientHeight;
		let boxTop = box.offsetTop;
		let addNum = boxTop - boxHeight;

		function scrollTop() {
			window.scroll({
				behavior: 'smooth',
				left: 0,
				top: 0,
			});
		}

		function classAdd() {
			slideArea.classList.add('observe');
			setTimeout(() => {
				slideArea.classList.add('on');
			}, 500);
		}
		function classRemove() {
			setTimeout(() => {
				slideArea.classList.remove('on');
				slideArea.classList.remove('observe');
			});
		}

		goTop.addEventListener('click', scrollTop);

		if (yOffset > 100) {
			goTop.classList.add('on');
		} else {
			goTop.classList.remove('on');
		}

		if (addNum < yOffset) {
			classAdd();
		}

		if (addNum - 200 > yOffset) {
			classRemove();
		}
	});
})();
