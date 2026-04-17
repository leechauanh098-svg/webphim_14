document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signin-form');

    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const pass = document.getElementById('login-password').value.trim();

            try {
                const response = await fetch('../assets/account/user.json');
                if (!response.ok) throw new Error('Không thể tải dữ liệu tài khoản');

                const users = await response.json();
                const user = users.find(u => u.email === email && u.password === pass);

                if (user) {
                    alert("Đăng nhập thành công!");
                    localStorage.setItem('user_logged', JSON.stringify(user));
                    window.location.href = '../index.html';
                } else {
                    alert("Email hoặc mật khẩu không chính xác!");
                }
            } catch (error) {
                console.error("Lỗi:", error);
                alert("Đã xảy ra lỗi hệ thống.");
            }
        });
    }
});
