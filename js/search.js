document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');

    if (!searchInput || !searchIcon) return;

    const isOnPagesRoute = window.location.pathname.includes('/pages/');
    const filterPagePath = isOnPagesRoute ? 'filter.html' : 'pages/filter.html';

    const redirectToSearchResults = () => {
        const searchKeyword = searchInput.value.trim().toLowerCase();
        
        if (searchKeyword.length > 0) {
            window.location.href = `${filterPagePath}?search=${encodeURIComponent(searchKeyword)}`;
        }
    };

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            redirectToSearchResults();
        }
    });

    searchIcon.addEventListener('click', redirectToSearchResults);
});
