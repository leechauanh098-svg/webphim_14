document.addEventListener('DOMContentLoaded', function () {
  const navbar = document.querySelector('.navbar');
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  const mobileMenuBtn = document.getElementById('mobile-menu');
  const navMenu = document.getElementById('main-nav');
  const navBackdrop = document.getElementById('mobile-backdrop');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  console.log('Global init: dropdowns found:', dropdowns.length);

  dropdowns.forEach(function (dropdown) {
    const button = dropdown.querySelector('.nav-filter-button');
    if (!button) return;

    button.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('Dropdown clicked');

      dropdowns.forEach(function (d) {
        if (d !== dropdown) {
          d.classList.remove('open');
          const btn = d.querySelector('.nav-filter-button');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      const isOpen = dropdown.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('.nav-dropdown')) return;
    dropdowns.forEach(function (d) {
      d.classList.remove('open');
      const btn = d.querySelector('.nav-filter-button');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('open');
      navBackdrop.classList.toggle('show', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navBackdrop.classList.remove('show');
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
  }

// --- ĐĂNG NHẬP ---
  const userData = localStorage.getItem('user_logged');
  const headerActions = document.querySelector('.header-actions');
  const mobileLoginLink = document.querySelector('.mobile-menu-login');
  const isInPages = location.pathname.includes('/pages/');
  const loginUrl = isInPages ? 'auth.html' : 'pages/auth.html';

  function doLogout() {
    localStorage.removeItem('user_logged');
    window.location.reload();
  }

  if (userData && headerActions) {
    // Nếu đã đăng nhập: Hiển thị tên và nút Thoát
    const user = JSON.parse(userData);
    headerActions.innerHTML = `
      <div class="user-info">
        <span class="user-name">Hi, ${user.username}</span>
        <button id="logout-btn" class="logout-btn">Thoát</button>
      </div>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', doLogout);

    if (mobileLoginLink) {
      mobileLoginLink.removeAttribute('href');
      mobileLoginLink.classList.add('mobile-user-info');
      mobileLoginLink.innerHTML = `
        <span class="mobile-user-name">Hi, ${user.username}</span>
        <button id="logout-btn-mobile" class="mobile-logout-btn" type="button">Thoát</button>
      `;

      const mobileLogoutBtn = document.getElementById('logout-btn-mobile');
      if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          doLogout();
        });
      }
    }
  } else {
    // Nếu chưa đăng nhập: Giữ logic chuyển hướng cũ 
    const loginButton = document.querySelector('.login-button');
    if (loginButton) {
      loginButton.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = loginUrl;
      });
    }

    if (mobileLoginLink) {
      mobileLoginLink.href = loginUrl;
    }
  }
});
