document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');

    if (!movieId) {
        window.location.href = '../index.html';
        return;
    }

   
    fetch('../data/movies.json')
        .then(res => res.json())
        .then(data => {
            const movie = data.find(m => String(m.id) === movieId);
            if (movie) {
                renderMovieDetail(movie);
            } else {
                console.error("Không tìm thấy phim!");
            }
        })
        .catch(err => console.error("Lỗi tải dữ liệu:", err));

    function renderMovieDetail(movie) {
      
        document.getElementById('movie-title').textContent = movie.title;
        document.getElementById('movie-sub-title').textContent = movie.eng;
        document.getElementById('movie-country').textContent = movie.country;
        document.getElementById('movie-episodes').textContent = `${movie.eps} tập`;
        document.getElementById('movie-desc').textContent = movie.description;
        
      
        document.getElementById('spec-year').textContent = movie.year;
        document.getElementById('spec-country').textContent = movie.country;

        const durationDisplay = document.getElementById('spec-duration');

        if (durationDisplay) durationDisplay.textContent = movie.duration || "60 phút/tập";
        
        const bannerDuration = document.getElementById('banner-duration');
        if (bannerDuration) bannerDuration.textContent = movie.duration || "60 phút/tập";
      
        const posterImg = document.getElementById('movie-img');
        posterImg.src = movie.doc; 
        
        const heroBg = document.getElementById('hero-bg');

        heroBg.style.backgroundImage = `linear-gradient(to bottom, rgba(15,15,20,0.6), #0f0f14), url(${movie.ngang})`;

      
        const epList = document.getElementById('episode-list');
        const currentEpDisplay = document.getElementById('current-ep-display');
        const totalEpDisplay = document.getElementById('total-ep-display');
        const totalEps = parseInt(movie.eps) || 0;

       
        if(currentEpDisplay) currentEpDisplay.textContent = totalEps;
        if(totalEpDisplay) totalEpDisplay.textContent = totalEps;
        
        epList.innerHTML = "";

        if (totalEps > 0) {
            for (let i = 1; i <= totalEps; i++) {
                const epLink = document.createElement('a');
                epLink.href = `watch.html?id=${movie.id}&ep=${i}`;
                epLink.className = 'ep-item';
             
                epLink.innerHTML = `<i class="fas fa-play"></i> Tập ${i}`;
                epList.appendChild(epLink);
            }
        } else {
            epList.innerHTML = `<p class="updating">Phim đang cập nhật...</p>`;
        }

        const btnWatch = document.getElementById('btn-watch');
        if (btnWatch) btnWatch.href = `watch.html?id=${movie.id}&ep=1`;
    }

 
    const btnSend = document.getElementById('btn-send-comment');
    const commentInput = document.getElementById('comment-text');
    const commentList = document.getElementById('comments-list');
    const commentCount = document.getElementById('comment-count');
    if (commentCount && !commentCount.textContent) {
    commentCount.textContent = "0";
}

    if (btnSend) {
        btnSend.onclick = function () {
            const text = commentInput.value.trim();
            if (!text) return;
            const commentHtml = `
                <div class="comment-item" style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #2a2a32;">
                    <div class="user-avatar" style="font-size: 2rem; color: #444;"><i class="fas fa-user-circle"></i></div>
                    <div class="comment-content">
                        <p class="user-name" style="font-weight: 600; margin-bottom: 5px; font-size: 0.9rem;">Người dùng</p>
                        <p class="user-text" style="color: #b3b3b3; font-size: 0.85rem; line-height: 1.4;">${text}</p>
                    </div>
                </div>
            `;
            const emptyState = commentList.querySelector('.empty-state');
            if (emptyState) emptyState.style.display = 'none';

            commentList.insertAdjacentHTML('afterbegin', commentHtml);
            commentCount.textContent = parseInt(commentCount.textContent) + 1;
            commentInput.value = "";
        };
    }
});
