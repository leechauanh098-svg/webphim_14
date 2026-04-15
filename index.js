document.addEventListener('DOMContentLoaded', function () {
  const escapeText = text => String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const convertToNumber = value => Number(value) || 0;
  const normalizeKey = text => String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const dom = {
    banner: document.querySelector('.banner-swiper .swiper-wrapper'),
    pagination: document.querySelector('.banner-pagination'),
    topGrid: document.getElementById('top-movies-grid'),
    rows: document.querySelector('.movie-rows'),
    updates: document.getElementById('new-updates-grid')
  };

  const state = { movies: [], rows: [], swiper: null, lenis: null, watchNowBound: false };

  const topIds = [3, 6, 16, 5, 12];
  const countries = ['Hàn Quốc', 'Trung Quốc', 'Âu Mỹ'];
  const featured = {
    'Hàn Quốc': ['Vũ Trụ Của Đôi Ta', 'Nghệ Thuật Lừa Dối Của Sarah', 'Cực Hạn', 'Chị Em', 'Luật Sư Bóng Ma'],
    'Trung Quốc': ['Ngọn Lửa Rực Rỡ Của Cô Ấy', 'Còn Ra Thể Thống Gì Nữa?', 'Trục Ngọc', 'Phá Kén', 'Nữ Pháp Y (Phần 2)'],
    'Âu Mỹ': ['Dòng Tộc Bridgerton (Phần 4)', 'Phi Vụ Động Trời 2', 'Đồi Gió Hú', 'Lính Mới (Phần 8)', 'Bắt cóc: Elizabeth Smart']
  };
  const filters = {
    country: { 'Hàn Quốc': 'han', 'Trung Quốc': 'trung', 'Âu Mỹ': 'aumy' },
    genre: { 'Tình cảm': 'tinhcam', 'Tâm lý': 'tamly', 'Hình sự': 'hinhsu', 'Hoạt hình': 'hoathinh', 'Cổ trang': 'cotrang' }
  };

  fetch('assets/data/movies.json')
    .then(response => response.json())
    .then(data => {
      state.movies = Array.isArray(data) ? data : [];
      renderHome();
    })
    .catch(error => console.error('Lỗi tải phim:', error));

  function renderHome() {
    renderTopMovies();
    loadBanner();
    setupCountryRows();
    renderUpdates();
  }

  function renderTopMovies() {
    if (!dom.topGrid) return;
    const selected = topIds.map(movieId => state.movies.find(movie => convertToNumber(movie?.id) === movieId)).filter(movie => movie && movie.doc).slice(0, 5);
    dom.topGrid.innerHTML = selected.map((movie, index) => {
      const id = convertToNumber(movie?.id);
      const title = escapeText(movie?.title);
      const image = escapeText(movie?.doc);
      const eps = convertToNumber(movie?.eps);
      const status = eps > 0 ? `Hoàn tất (${eps}/${eps})` : 'Đang cập nhật';
      return `<a href='pages/detail.html?id=${id}' class='top-movie-card-link'>
        <div class='top-movie-card' data-aos='fade-up' data-aos-delay='${100 + index * 50}'>
          <img src='${image}' alt='${title}'>
          <div class='top-movie-info'>
            <div class='ranking'>${index + 1}</div>
            <div class='top-movie-text'><h3>${title}</h3><span>${status}</span></div>
          </div>
        </div>
      </a>`;
    }).join('');
  }

  function loadBanner() {
    if (!dom.banner) return;
    fetch('assets/data/slides.json')
      .then(response => response.json())
      .then(data => {
        const slides = Array.isArray(data?.slides) ? data.slides : [];
        let htmlContent = '';
        slides.forEach(slide => {
          const foundMovie = state.movies.find(movie => normalizeKey(movie?.title) === normalizeKey(slide.title));
          const movieId = foundMovie ? convertToNumber(foundMovie.id) : '';
          const metaLinks = Array.isArray(slide.meta) ? slide.meta.map(metaValue => {
            if (filters.country[metaValue]) return `<a href='pages/filter.html?filter=country&value=${filters.country[metaValue]}'>${escapeText(metaValue)}</a>`;
            if (filters.genre[metaValue]) return `<a href='pages/filter.html?filter=genre&value=${filters.genre[metaValue]}'>${escapeText(metaValue)}</a>`;
            return `<span>${escapeText(metaValue)}</span>`;
          }).join('') : '';
          htmlContent += `<div class='swiper-slide banner-slide' data-aos='fade-up' data-aos-delay='100' data-movie-id='${movieId}' data-movie-title='${escapeText(slide.title)}'>
            <div class='banner-overlay'></div>
            <div class='banner-image' style="background-image: url('${escapeText(slide.image)}');"></div>
            <div class='banner-content container'>
              <h1>${escapeText(slide.title)}</h1>
              <div class='meta-info'>${metaLinks}</div>
              <p>${escapeText(slide.description)}</p>
              <button class='watch-now-button' type='button'>Xem ngay <i class='fas fa-play'></i></button>
            </div>
          </div>`;
        });
        dom.banner.innerHTML = htmlContent;
        bindWatchNowNavigation();
        initSwiper();
      })
      .catch(error => { console.error('Lỗi load banner:', error); initSwiper(); });
  }

  function bindWatchNowNavigation() {
    if (!dom.banner || state.watchNowBound) return;
    dom.banner.addEventListener('click', event => {
      const button = event.target.closest('.watch-now-button');
      if (!button) return;
      const slide = button.closest('.banner-slide');
      let id = slide?.dataset.movieId;
      if (!id) {
        const slideTitle = normalizeKey(slide?.dataset.movieTitle || '');
        const matchedMovie = state.movies.find(movie => normalizeKey(movie?.title) === slideTitle);
        id = matchedMovie ? convertToNumber(matchedMovie.id) : '';
      }
      if (id) {
        window.location.href = `pages/detail.html?id=${id}`;
      }
    });
    state.watchNowBound = true;
  }

  function initSwiper() {
    if (!document.querySelector('.banner-swiper')) return;
    if (state.swiper) { state.swiper.destroy(true, true); state.swiper = null; }
    if (typeof Swiper === 'undefined') return;
    // Thư viện: Swiper.js - chức năng: Tạo carousel cho banner slides
    state.swiper = new Swiper('.banner-swiper', {
      loop: true, speed: 700, effect: 'fade', fadeEffect: { crossFade: true },
      autoplay: { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
      navigation: { nextEl: '.banner-next-button', prevEl: '.banner-prev-button' },
      pagination: { el: '.banner-pagination', type: 'bullets', clickable: true },
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { enabled: true, prevSlideMessage: 'Slide trước', nextSlideMessage: 'Slide tiếp theo', paginationBulletMessage: 'Đi đến slide {{index}}' }
    });
  }

  function setupCountryRows() {
    if (!dom.rows) return;
    state.rows = countries.map(country => {
      const allMovies = state.movies.filter(movie => movie?.country === country && movie?.ngang).sort((movieA, movieB) => convertToNumber(movieB?.id) - convertToNumber(movieA?.id));
      const preferredMovies = featured[country] || [];
      const priority = preferredMovies.map(title => allMovies.find(movie => movie?.title === title)).filter(Boolean);
      const list = [...priority, ...allMovies].filter((movie, index, array) => array.findIndex(x => x?.id === movie?.id) === index).slice(0, 5);
      return list.length ? { label: country === 'Hàn Quốc' ? 'Phim Hàn\nQuốc Mới' : country === 'Trung Quốc' ? 'Phim Trung\nQuốc Mới' : 'Phim Âu\nMỹ Mới', pos: 0, items: list.map(movie => ({ id: convertToNumber(movie?.id), title: movie?.title, eng: movie?.eng, ngang: movie?.ngang })) } : null;
    }).filter(Boolean);
    renderCountryRows();
  }

  function renderCountryRows() {
    if (!dom.rows || !state.rows.length) return;
    let htmlContent = '';
    state.rows.forEach((row, rowIndex) => {
      let cards = '';
      for (let i = 0; i < 3 && i < row.items.length; i++) {
        const movie = row.items[(row.pos + i) % row.items.length];
        const id = movie.id;
        const title = escapeText(movie.title);
        const image = escapeText(movie.ngang);
        const eng = escapeText(movie.eng);
        cards += `<a href='pages/detail.html?id=${id}' class='movie-horizontal-card-link'>
          <div class='movie-horizontal-card'>
            <img src='${image}' alt='${title}'>
            <h4>${title}</h4>
            <span>${eng}</span>
          </div>
        </a>`;
      }
      htmlContent += `<div class="row-category">
        <h3 class="row-country">${escapeText(row.label).replace(/\n/g, window.matchMedia('(max-width: 1100px)').matches ? ' ' : '<br>')}</h3>
        <div class="movie-row-content">
          ${cards}
          <button class="row-nav-btn" type="button" data-row-index="${rowIndex}" aria-label="Xem phim kế bên">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>`;
    });
    dom.rows.innerHTML = htmlContent;
    dom.rows.querySelectorAll('.movie-row-content').forEach(rowElement => {
      const button = rowElement.querySelector('.row-nav-btn');
      const image = rowElement.querySelector('.movie-horizontal-card img');
      if (button && image) {
        const rowRect = rowElement.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        button.style.top = (imageRect.top - rowRect.top + imageRect.height / 2) + 'px';
      }
    });
    dom.rows.addEventListener('click', event => {
      const button = event.target.closest('.row-nav-btn');
      if (!button) return;
      const row = state.rows[parseInt(button.dataset.rowIndex)];
      if (row && row.items.length > 1) {
        row.pos = (row.pos + 1) % row.items.length;
        renderCountryRows();
      }
    });
  }

  function renderUpdates() {
    if (!dom.updates) return;
    const groups = {};
    state.movies.filter(movie => movie?.doc).forEach(movie => {
      const country = movie.country || 'Khác';
      if (!groups[country]) groups[country] = [];
      groups[country].push(movie);
    });
    const order = [...countries.filter(country => groups[country]), ...Object.keys(groups).filter(country => !countries.includes(country))];
    const cursor = {};
    order.forEach(country => { cursor[country] = 0; });
    const mixed = [];
    let hasNext = true;
    while (hasNext) {
      hasNext = false;
      order.forEach(country => {
        if ((cursor[country] || 0) < (groups[country] || []).length) {
          mixed.push(groups[country][cursor[country]]);
          cursor[country]++;
          hasNext = true;
        }
      });
    }
    const gridColumns = window.getComputedStyle(dom.updates).getPropertyValue('grid-template-columns').split(' ').length || 1;
    const displayLimit = Math.min(mixed.length, Math.ceil(12 / gridColumns) * gridColumns);
    dom.updates.innerHTML = mixed.slice(0, displayLimit).map(movie => {
      const id = convertToNumber(movie?.id);
      const title = escapeText(movie?.title);
      const image = escapeText(movie?.doc);
      const eng = movie?.eng ? `<span>${escapeText(movie.eng)}</span>` : '';
      return `<a href='pages/detail.html?id=${id}' class='movie-card-link'>
        <div class='movie-card'>
          <img src='${image}' alt='${title}'>
          <div class='movie-info'><h4>${title}</h4>${eng}</div>
        </div>
      </a>`;
    }).join('');
  }

  // Thư viện: Lenis.js - chức năng: Cuộn trang mượt
  if (typeof Lenis !== 'undefined') {
    state.lenis = new Lenis({
      duration: 1.2, easing: parameter => Math.min(1, 1.001 - Math.pow(2, -10 * parameter)),
      direction: 'vertical', gestureDirection: 'vertical', smooth: true, smoothTouch: false, touchMultiplier: 2
    });
    const animationFrameCallback = timestamp => { state.lenis.raf(timestamp); requestAnimationFrame(animationFrameCallback); };
    requestAnimationFrame(animationFrameCallback);
  }

  // Thư viện: AOS.js - chức năng: Hiệu ứng khi cuộn trang
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 600, offset: 100, easing: 'ease-in-out-quad', once: false });
    if (state.lenis) state.lenis.on('scroll', () => AOS.refresh());
  }

  window.addEventListener('resize', () => {
    if (state.rows.length > 0) renderCountryRows();
    if (state.movies.length > 0) renderUpdates();
  });

  window.allMovies = state.movies;
});