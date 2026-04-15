document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(location.search);
  const searchKeyword = params.get('search');
  const filterKey = params.get('filter');
  const filterValue = params.get('value');

  const pageTitle = document.querySelector('#filter-title');
  const pageSubtitle = document.querySelector('#filter-subtitle');
  const pageSummary = document.querySelector('#filter-summary');
  const movieList = document.querySelector('#filter-list');

  const EMPTY_TEXT = 'Không tìm thấy phim phù hợp với bộ lọc này.';
  const MOVIES_PATH = location.pathname.includes('/pages/') 
    ? '../assets/data/movies.json' 
    : 'assets/data/movies.json';

  const escapeText = text => String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const normalizeText = text => String(text || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
 .replace(/\s+/g, ' ')
    .trim();

  const renderEmpty = message => {
    if (movieList) {
      movieList.innerHTML = '<div class="filter-empty">' 
        + escapeText(message) 
        + '</div>';
    }
  };

  const renderMovies = movies => {
    if (!movieList) {
      return;
    }
    
    if (!movies.length) {
      renderEmpty(EMPTY_TEXT);
      return;
    }

    movieList.innerHTML = movies
      .map(movie => {
        const movieId = movie?.id || '';
        const movieTitle = escapeText(movie?.title);
        const movieEng = escapeText(movie?.eng);
        const movieImage = escapeText(movie?.doc || movie?.ngang || '');
        
        return `<a href='detail.html?id=${movieId}' class='movie-card-link'>

          <article class='filter-card movie-card'>
            <img src='${movieImage}' alt='${movieTitle}'>
            <div class='movie-info'>
              <h4>${movieTitle}</h4>
              <span class='eng'>${movieEng}</span>
            </div>
          </article>
        </a>`;
      })
      .join('');
  };

  const searchMovies = (movies, keyword) => {
    const normalized = normalizeText(keyword);
    
    return movies.filter(movie => {
      const fields = [
        movie?.title,
        movie?.eng,
        movie?.category,
        movie?.country
      ];
      
      return fields.some(field => normalizeText(field).includes(normalized));
    });
  };

  const filterMovies = (movies, key, value) => {
    if (key === 'country' && value === 'han') {
      return movies.filter(movie => 
        String(movie?.country || '').toLowerCase() === 'hàn quốc'
      );
    }
    
    if (key === 'country' && value === 'trung') {
      return movies.filter(movie => 
        String(movie?.country || '').toLowerCase() === 'trung quốc'
      );

    }
    
    if (key === 'country' && value === 'aumy') {
      return movies.filter(movie => 
        String(movie?.country || '').toLowerCase() === 'âu mỹ'
      );
    }
    
    if (key === 'genre' && value === 'tinhcam') {
      return movies.filter(movie => 
        String(movie?.category || '').toLowerCase().includes('tình cảm')
      );
    }
    
    if (key === 'genre' && value === 'tamly') {
      return movies.filter(movie => 
        String(movie?.category || '').toLowerCase().includes('tâm lý')
      );
    }
    
    if (key === 'genre' && value === 'hinhsu') {
      return movies.filter(movie => 
        String(movie?.category || '').toLowerCase().includes('hình sự')
      );
    }
    
    if (key === 'genre' && value === 'hoathinh') {
      return movies.filter(movie => 
        String(movie?.category || '').toLowerCase().includes('hoạt hình')
      );
    }
    
    if (key === 'genre' && value === 'cotrang') {
      return movies.filter(movie => 
        String(movie?.category || '').toLowerCase().includes('cổ trang')
      );
    }
    
    if (key === 'type' && value === 'movie') {
      return movies.filter(movie => Number(movie?.eps) <= 1);
    }
    
    if (key === 'type' && value === 'series') {
      return movies.filter(movie => Number(movie?.eps) > 1);
    } 
    return movies;
  };

  if (!searchKeyword && !filterKey) {
    if (pageTitle) {
      pageTitle.textContent = 'Danh Mục Phim';
    }
    
    if (pageSubtitle) {
      pageSubtitle.textContent = 'Vui lòng chọn danh mục từ menu điều hướng.';
    }
    
    if (pageSummary) {
      pageSummary.textContent = 'Chưa có bộ lọc được chọn.';
    }
    
    renderEmpty(EMPTY_TEXT);
    return;
  }
  fetch(MOVIES_PATH)
    .then(response => response.json())
    .then(data => {
      const movies = Array.isArray(data) ? data : [];
      if (searchKeyword) {
        const results = searchMovies(movies, searchKeyword);
        if (pageTitle) {
          pageTitle.innerHTML = 'Kết quả tìm kiếm: <span class="search-keyword">"' 
            + escapeText(searchKeyword) 
            + '"</span>';
        }
        if (pageSubtitle) {
          pageSubtitle.textContent = '';
        }
        if (pageSummary) {
          pageSummary.textContent = 'Tìm thấy ' + results.length + ' phim phù hợp';
        }
        renderMovies(results);
      } else {
        const results = filterMovies(movies, filterKey, filterValue);
        const filterLabels = {
          'country-han': {
            label: 'Quốc gia',
            title: 'Quốc gia: Hàn Quốc',
            desc: 'Danh sách phim theo quốc gia Hàn Quốc.'
          },
          'country-trung': {
            label: 'Quốc gia',
            title: 'Quốc gia: Trung Quốc',
            desc: 'Danh sách phim theo quốc gia Trung Quốc.'
          },
          'country-aumy': {
            label: 'Quốc gia',
            title: 'Quốc gia: Âu Mỹ',
            desc: 'Danh sách phim theo khu vực Âu Mỹ.'
          },
          'type-movie': {
            label: 'Loại phim',
            title: 'Phim Lẻ',
            desc: 'Danh sách phim có 1 tập.'
          },
          'type-series': {
            label: 'Loại phim',
            title: 'Phim Bộ',
            desc: 'Danh sách phim nhiều tập.'
          },
          'genre-tinhcam': {
            label: 'Thể loại',
            title: 'Thể loại: Tình cảm',
            desc: 'Danh sách phim có thể loại tình cảm.'
          },
          'genre-tamly': {
            label: 'Thể loại',
            title: 'Thể loại: Tâm lý',
            desc: 'Danh sách phim có thể loại tâm lý.'
          },
          'genre-hinhsu': {
            label: 'Thể loại',
            title: 'Thể loại: Hình sự',
            desc: 'Danh sách phim có thể loại hình sự.'
          },
          'genre-hoathinh': {
            label: 'Thể loại',
            title: 'Thể loại: Hoạt hình',
            desc: 'Danh sách phim có thể loại hoạt hình.'
          },
          'genre-cotrang': {
            label: 'Thể loại',
            title: 'Thể loại: Cổ trang',
            desc: 'Danh sách phim có thể loại cổ trang.'
          }
        };
        const info = filterLabels[filterKey + '-' + filterValue] || {
          label: 'Danh mục',
          title: 'Danh mục',
          desc: 'Danh sách phim.'
        };
        if (pageTitle) {
          pageTitle.textContent = info.title;
        }
        if (pageSubtitle) {
          pageSubtitle.textContent = info.desc;
        }
        
        if (pageSummary) {
          pageSummary.textContent = info.label 
            + ': ' 
            + info.title 
            + ' • ' 
            + results.length 
            + ' phim';

        }
        renderMovies(results);
      }
    })
    .catch(error => {
      console.error('Lỗi tải dữ liệu:', error);
      
      if (pageTitle) {
        pageTitle.textContent = 'Không thể tải dữ liệu phim';
      }
      
      if (pageSubtitle) {
        pageSubtitle.textContent = 'Vui lòng thử tải lại trang.';
      }
      
      renderEmpty(EMPTY_TEXT);
    });
});