document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const $ = id => document.getElementById(id);
    const esc = str => String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    function formatTime() {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const d = now.getDate();
        const mo = (now.getMonth() + 1).toString().padStart(2, '0');
        return `${h}:${m} - ${d}/${mo}`;
    }

    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');
    const epParam = parseInt(params.get('ep') || '1', 10);

    if (!movieId) {
        window.location.href = '../index.html';
        return;
    }

    let currentMovie = null;
    let currentEp = epParam;

// HÀM 1: Thiết lập Trình phát Video (Player)
    function setupPlayer(movie, ep, totalEps) {
        const loading = $('player-loading');
        const iframe  = $('video-iframe');
        const videoEl = $('video-player'); // Lấy thẻ video mới thêm
        const fallback = $('player-fallback');

        // Lấy link phim từ trường "video" trong movies.json
        let src = null;
        if (movie.video) {
            if (Array.isArray(movie.video)) {
                src = movie.video[ep - 1] || movie.video[0]; 
            } else {
                src = movie.video;
            }
        }

        // Ẩn tất cả màn hình phát lúc ban đầu
        if (iframe) iframe.style.display = 'none';
        if (videoEl) videoEl.style.display = 'none';
        if (fallback) fallback.style.display = 'none';

        // Xử lý hiển thị
        if (src) {
            // NẾU LINK LÀ ĐUÔI .M3U8 TRỰC TIẾP
            if (src.includes('.m3u8') && !src.includes('motphimtc.net')) {
                if (videoEl) {
                    videoEl.style.display = 'block'; // Hiện thẻ video
                    
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(src);
                        hls.attachMedia(videoEl);
                        hls.on(Hls.Events.MANIFEST_PARSED, function() {
                            if (loading) loading.style.display = 'none';
                            videoEl.play().catch(e => console.log("Trình duyệt chặn tự động phát"));
                        });
                    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
                        // Dành riêng cho trình duyệt Safari (hỗ trợ m3u8 sẵn)
                        videoEl.src = src;
                        videoEl.addEventListener('loadedmetadata', function() {
                            if (loading) loading.style.display = 'none';
                            videoEl.play();
                        });
                    }
                }
            } 
            // NẾU LÀ LINK NHÚNG (EMBED) NHƯ YOUTUBE HOẶC PLAYER KHÁC
            else {
                if (iframe) {
                    iframe.src = src;
                    iframe.style.display = 'block'; // Hiện thẻ iframe
                    iframe.onload = () => {
                        if (loading) loading.style.display = 'none';
                    };
                }
            }
        } else {
            // KHÔNG CÓ LINK PHIM -> HIỆN POSTER FALLBACK
            if (loading) {
                setTimeout(() => {
                    loading.style.display = 'none';
                    const fallbackImg = $('fallback-img');
                    const fallbackTitle = $('fallback-title');

                    if (fallbackImg) fallbackImg.src = movie.ngang || movie.doc || '';
                    if (fallbackTitle) fallbackTitle.textContent = totalEps > 1
                        ? `${movie.title} - Tập ${ep}`
                        : movie.title;

                    if (fallback) fallback.style.display = 'flex';
                }, 900);
            }
        }
    }

    // HÀM 2: Render toàn bộ dữ liệu ra trang
    function renderPage(movie) {
        currentMovie = movie;
        const totalEps = parseInt(movie.eps) || 0;
        const ep = Math.max(1, Math.min(currentEp, totalEps || 1));
        currentEp = ep;

        document.title = `${movie.title} - Tập ${ep} | FILMHAY`;

        const bcMovieLink = $('bc-movie-link');
        if (bcMovieLink) {
            bcMovieLink.textContent = movie.title;
            bcMovieLink.href = `detail.html?id=${movie.id}`;
        }
        const bcEp = $('bc-episode');
        if (bcEp) bcEp.textContent = totalEps === 1 ? 'Phim lẻ' : `Tập ${ep}`;

        // Gọi hàm setupPlayer ở đây
        setupPlayer(movie, ep, totalEps);

        const watchTitle = $('watch-title');
        if (watchTitle) watchTitle.textContent = totalEps > 1
            ? `${movie.title} - Tập ${ep}`
            : movie.title;

        const watchMeta = $('watch-meta');
        if (watchMeta) {
            watchMeta.innerHTML = [
                `<span><i class="fas fa-globe-asia"></i>${esc(movie.country)}</span>`,
                `<span><i class="fas fa-calendar"></i>${esc(movie.year)}</span>`,
                movie.category ? `<span><i class="fas fa-tag"></i>${esc(movie.category)}</span>` : '',
                `<span><i class="fas fa-film"></i>${totalEps > 1 ? `${totalEps} tập` : 'Phim lẻ'}</span>`
            ].filter(Boolean).join('');
        }

        setupNavBtns(ep, totalEps, movie.id);
        renderEpisodeList(movie, ep, totalEps);
        renderInfo(movie, ep);
    }

    function setupNavBtns(ep, totalEps, movieId) {
        const btnPrev = $('btn-prev-ep');
        const btnNext = $('btn-next-ep');

        if (btnPrev) {
            btnPrev.disabled = ep <= 1;
            btnPrev.onclick = () => {
                if (ep > 1) navigateEp(ep - 1, movieId);
            };
        }

        if (btnNext) {
            btnNext.disabled = ep >= totalEps || totalEps <= 1;
            btnNext.onclick = () => {
                if (ep < totalEps) navigateEp(ep + 1, movieId);
            };
        }
    }

    function navigateEp(newEp, movieId) {
        window.location.href = `watch.html?id=${movieId}&ep=${newEp}`;
    }

    function renderEpisodeList(movie, activeEp, totalEps) {
        const grid = $('ep-grid');
        const badge = $('ep-count-badge');

        if (!grid) return;
        if (badge) badge.textContent = totalEps > 0 ? `${totalEps} tập` : 'Cập nhật';

        grid.innerHTML = '';
        if (totalEps <= 0) {
            grid.innerHTML = `<p class="ep-updating">Đang cập nhật...</p>`;
            return;
        }

        for (let i = 1; i <= totalEps; i++) {
            const btn = document.createElement('a');
            btn.href = `watch.html?id=${movie.id}&ep=${i}`;
            btn.className = 'ep-btn' + (i === activeEp ? ' active' : '');
            btn.textContent = i;
            btn.title = `Tập ${i}`;
            grid.appendChild(btn);
        }

        setTimeout(() => {
            const activeBtn = grid.querySelector('.ep-btn.active');
            if (activeBtn) activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 100);
    }

    function renderInfo(movie, ep) {
        const poster = $('info-poster');
        if (poster) {
            poster.src = movie.doc || movie.ngang || '';
            poster.alt = movie.title;
        }

        const infoTitle = $('info-title');
        if (infoTitle) infoTitle.textContent = movie.title;

        const infoEng = $('info-eng');
        if (infoEng) infoEng.textContent = movie.eng || '';

        const specsEl = $('info-specs');
        if (specsEl) {
            const totalEps = parseInt(movie.eps) || 0;
            const specs = [
                { label: 'Năm phát hành:', value: movie.year },
                { label: 'Quốc gia:', value: movie.country },
                { label: 'Thể loại:', value: movie.category },
                { label: 'Số tập:', value: totalEps > 1 ? `${totalEps} tập` : 'Phim lẻ' },
                { label: 'Thời lượng:', value: movie.duration || (totalEps > 1 ? '~45 phút/tập' : '~90 phút') }
            ].filter(s => s.value);

            specsEl.innerHTML = specs.map(s =>
                `<div class="info-spec-row">
                    <span class="info-spec-label">${esc(s.label)}</span>
                    <span class="info-spec-value">${esc(String(s.value))}</span>
                </div>`
            ).join('');
        }

        const detailBtn = $('info-detail-btn');
        if (detailBtn) detailBtn.href = `detail.html?id=${movie.id}`;

        const descEl = $('info-desc');
        if (descEl) descEl.textContent = movie.description || '';
    }

    let commentCount = 0;

    function initComments() {
        const sendBtn   = $('cmt-send');
        const textarea  = $('cmt-text');
        const list      = $('cmt-list');
        const countEl   = $('cmt-count');

        if (!sendBtn || !textarea || !list) return;

        function getDisplayName() {
            const loggedUserRaw = localStorage.getItem('user_logged');
            if (!loggedUserRaw) return 'Người dùng';

            try {
                const loggedUser = JSON.parse(loggedUserRaw);
                return (loggedUser && loggedUser.username) ? loggedUser.username : 'Người dùng';
            } catch (error) {
                return 'Người dùng';
            }
        }

        function addComment() {
            const text = textarea.value.trim();
            if (!text) return;

            const displayName = getDisplayName();

            const empty = list.querySelector('.cmt-empty');
            if (empty) empty.remove();

            commentCount++;
            if (countEl) countEl.textContent = commentCount;

            const item = document.createElement('div');
            item.className = 'cmt-item';
            item.innerHTML = `
                <div class="cmt-avatar"><i class="fas fa-user-circle"></i></div>
                <div class="cmt-body">
                    <div class="cmt-user">${esc(displayName)} <span class="cmt-time">${formatTime()}</span></div>
                    <div class="cmt-text">${esc(text)}</div>
                </div>`;

            list.insertAdjacentElement('afterbegin', item);
            textarea.value = '';
            textarea.style.height = '';
        }

        sendBtn.addEventListener('click', addComment);

        textarea.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                addComment();
            }
        });

        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 160) + 'px';
        });
    }

    // TẢI DỮ LIỆU TỪ JSON
    fetch('../assets/data/movies.json')
        .then(res => {
            if (!res.ok) throw new Error('Không thể tải dữ liệu phim');
            return res.json();
        })
        .then(data => {
            const movie = data.find(m => String(m.id) === String(movieId));
            if (!movie) {
                window.location.href = `detail.html?id=${movieId}`;
                return;
            }
            renderPage(movie);
            initComments();
        })
        .catch(err => {
            console.error('Lỗi:', err);
            const loading = $('player-loading');
            if (loading) loading.innerHTML = '<p style="color:#bc0000">Không thể tải phim. Vui lòng thử lại.</p>';
        });
});
