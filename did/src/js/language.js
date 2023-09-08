(() => {
	const lang = {
		en: {
			COMING_SOON: 'coming soon',
			MAIN_TITLE: 'New DID <br> Revolution.',
			MAIN_DESCRIPTION: 'Blockchain-based decentralized identity <br>verification service.',
			NATIONAL_CERTIFICATE: 'National certificate',
			CIVILIAN_LICENSE: 'Civilian license',
			LABEL_1: 'A certificate filled with dust in the closet.',
			DESCRIPTION_1:
				"Aren't there too many different sizes, different <br>shapes and sizes for each certificate to be<br> carried in a different issuing agency, wallet,<br> and dust only accumulated in the closet?",
			CAPTION_1: 'All different certificates<br> in Korea.',
			LABEL_2: 'So that you can take out<br> all these certificates<br> and check them out at<br> any time,',
			LABEL_3: 'Can we collect them in <br> one place?',
			LABEL_4: 'Now, <br>one app contains<br> all my certificates.',
			SUB_TITLE: 'All Good Things<br> Come to<br> Those who<br> Wait',
			LABEL_5: 'FIT MORE<br> IN YOUR POCKET',
			COPY: 'f1alliance. All Rights Reserved',
			COMING_SOON2: 'Coming Soon',
		},
		ko: {
			COMING_SOON: 'coming soon',
			MAIN_TITLE: 'DID의<br> 새로운 혁명',
			MAIN_DESCRIPTION: '블록체인 기반의 탈중앙화 신원증명서비스 ',
			NATIONAL_CERTIFICATE: '국가자격증',
			CIVILIAN_LICENSE: '민간자격증',
			LABEL_1: '옷장 속 먼지쌓인 자격증',
			DESCRIPTION_1:
				'각 자격증 마다 다른 발급기관, 지갑 속에 담기엔 <br>너무 다양한 규격, 서로다른 모양과 크기로 들고다니지<br> 못하고 혹시 옷장 속에서 먼지만 쌓이고 있지는 않나요?',
			CAPTION_1: '서로 다른 국내 모든 자격증',
			LABEL_2: '이 많은 자격증을<br> 언제든 꺼내 확인할 수 있게',
			LABEL_3: '한 곳에 모을 수 있을까?',
			LABEL_4: '이제<br> 앱 하나에<br> 내 모든 자격증이<br> 담깁니다.',
			SUB_TITLE: 'All Good Things<br> Come to <br>Those who<br> Wait',
			LABEL_5: 'FIT MORE<br> IN YOUR POCKET',
			COPY: 'f1alliance. All Rights Reserved',
			COMING_SOON2: 'Coming Soon',
		},
	};

	if (!sessionStorage.locale) {
		sessionStorage.setItem('locale', 'en');
	}

	const EN = document.getElementById('btn-en');
	const KO = document.getElementById('btn-ko');

	let locale = sessionStorage.getItem('locale');

	document.documentElement.lang = locale;

	// 언어별 적용
	if (locale === 'ko') {
		KO.classList.add('active');
	} else {
		EN.classList.add('active');
	}

	// 언어별 렌더링
	function render(locale) {
		const $lang = document.querySelectorAll('[data-lang]');
		$lang.forEach((el) => {
			const code = el.dataset.lang;
			el.innerHTML = lang[locale][code];
		});
	}

	render(locale.substr(0, 2));

	// 버튼 이벤트
	EN.addEventListener('click', (e) => {
		sessionStorage.setItem('locale', 'en');
		document.documentElement.lang = 'en';
		render('en');
		KO.classList.remove('active');
		EN.classList.add('active');
	});
	KO.addEventListener('click', (e) => {
		sessionStorage.setItem('locale', 'ko');
		document.documentElement.lang = 'ko';
		render('ko');
		EN.classList.remove('active');
		KO.classList.add('active');
	});
})();
