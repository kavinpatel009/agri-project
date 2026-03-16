document.addEventListener("DOMContentLoaded", function () {

    const App = {
        init() {
            this.setupDropdowns();
            this.updateAuthButton();
            this.setupEventListeners();
            this.setupSmoothScrolling();
        },

        setupDropdowns() {
            document.querySelectorAll(".dropdown").forEach(dropdown => {
                const button = dropdown.querySelector(".btn");
                const content = dropdown.querySelector(".dropdown-content");
                button.addEventListener("click", (e) => {
                    e.stopPropagation();
                    content.style.display = content.style.display === "block" ? "none" : "block";
                });
            });
            document.addEventListener("click", () => {
                document.querySelectorAll(".dropdown-content").forEach(content => {
                    content.style.display = "none";
                });
            });
        },

        setupEventListeners() {
            const loginForm = document.getElementById("loginForm");
            if (loginForm) {
                loginForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }

            const registerForm = document.getElementById("registerForm");
            if (registerForm) {
                registerForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }

            const contactForm = document.getElementById("contactForm");
            if (contactForm) {
                contactForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.handleContact();
                });
            }
        },

        async handleRegister() {
            const regBtn = document.querySelector("#registerForm button");
            if (regBtn) { regBtn.innerHTML = '<span class="spinner"></span> Please wait...'; regBtn.disabled = true; }
            try {
                const name = document.getElementById("name")?.value;
                const email = document.getElementById("email")?.value;
                const password = document.getElementById("password")?.value;
                const confirmPassword = document.getElementById("confirmPassword")?.value;

                if (!name || !email || !password || !confirmPassword) {
                    throw new Error("Please fill in all required fields.");
                }
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match. Please try again.");
                }

                const response = await fetch("https://agri-project-ol6n.onrender.com/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Registration failed. Please try again.");
                }

                this.showMessage("Account created successfully! Redirecting to login...", "green");
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                this.showMessage(error.message, "red");
                const regBtn = document.querySelector("#registerForm button");
                if (regBtn) { regBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account'; regBtn.disabled = false; }
            }
        },

        async handleLogin() {
            const loginBtn = document.querySelector("#loginForm button");
            if (loginBtn) { loginBtn.innerHTML = '<span class="spinner"></span> Logging in...'; loginBtn.disabled = true; }
            try {
                const email = document.getElementById("email")?.value;
                const password = document.getElementById("password")?.value;

                if (!email || !password) {
                    throw new Error("Please enter your email and password.");
                }

                const response = await fetch("https://agri-project-ol6n.onrender.com/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    throw new Error((await response.json()).message || "Login failed. Please check your credentials.");
                }

                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("isLoggedIn", "true");

                this.showMessage("Login successful! Redirecting...", "green");
                setTimeout(() => window.location.href = "index.html", 1500);
            } catch (error) {
                this.showMessage(error.message, "red");
                this.clearAuthData();
                const loginBtn = document.querySelector("#loginForm button");
                if (loginBtn) { loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login'; loginBtn.disabled = false; }
            }
        },

        updateAuthButton() {
            const authButton = document.getElementById("auth-button");
            if (!authButton) return;

            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            if (isLoggedIn) {
                const firstName = (user.name || "User").split(" ")[0];
                const email = user.email || "";
                authButton.innerHTML = `
                    <div class="profile-dropdown" id="profileDropdown">
                        <button class="profile-btn" onclick="toggleProfile()">
                            <div class="profile-avatar">${firstName.charAt(0).toUpperCase()}</div>
                            <span>${firstName}</span>
                            <span style="font-size:0.7rem;">▾</span>
                        </button>
                        <div class="profile-menu" id="profileMenu">
                            <div class="profile-header">
                                <div class="profile-avatar-lg">${firstName.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div style="font-weight:700;font-size:0.95rem;color:var(--text);">${user.name || firstName}</div>
                                    <div style="font-size:0.78rem;color:var(--gray);">${email}</div>
                                </div>
                            </div>
                            <div class="profile-divider"></div>
                            <a href="#" class="profile-item">👤 My Profile</a>
                            <a href="#" class="profile-item">⚙️ Settings</a>
                            <a href="#about" class="profile-item">ℹ️ About Us</a>
                            <a href="#contact" class="profile-item">📩 Contact</a>
                            <div class="profile-divider"></div>
                            <a href="#" class="profile-item profile-logout" id="logout-btn">🚪 Logout</a>
                        </div>
                    </div>
                `;
                document.getElementById("logout-btn")?.addEventListener("click", (e) => this.handleLogout(e));
                document.addEventListener("click", function(e) {
                    if (!e.target.closest("#profileDropdown")) {
                        document.getElementById("profileMenu")?.classList.remove("open");
                    }
                });
            } else {
                authButton.innerHTML = `
                    <a href="login.html" style="display:inline-flex;align-items:center;gap:6px;background:transparent;border:1.5px solid var(--primary);color:var(--primary);padding:6px 16px;border-radius:25px;font-size:0.84rem;font-weight:600;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='var(--primary)';this.style.color='white'" onmouseout="this.style.background='transparent';this.style.color='var(--primary)'">
                        👤 Login
                    </a>
                `;
            }
        },

        clearAuthData() {
            ["token", "user", "isLoggedIn"].forEach(item => localStorage.removeItem(item));
            sessionStorage.clear();
        },

        async handleLogout(e) {
            e.preventDefault();
            this.clearAuthData();
            this.showMessage("Logged out successfully. Redirecting...", "green");
            setTimeout(() => window.location.href = "login.html", 1000);
        },

        setupSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener("click", function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute("href"));
                    if (target) {
                        window.scrollTo({ top: target.offsetTop - 70, behavior: "smooth" });
                    }
                });
            });
        },

        showMessage(message, color) {
            const messageElement = document.getElementById("message");
            if (messageElement) {
                messageElement.textContent = message;
                messageElement.style.color = color;
                setTimeout(() => {
                    if (messageElement.textContent === message) messageElement.textContent = "";
                }, 5000);
            }
        },

        async handleContact() {
            try {
                const nameInput = document.getElementById("name");
                const emailInput = document.getElementById("email");
                const phoneInput = document.getElementById("phone");
                const messageInput = document.getElementById("message");

                this.clearContactErrors();

                if (!nameInput || !emailInput || !messageInput) {
                    throw new Error("Form failed to load. Please refresh the page.");
                }

                const name = nameInput.value.trim();
                const email = emailInput.value.trim();
                const phone = phoneInput?.value.trim() || "";
                const message = messageInput.value.trim();

                let isValid = true;

                if (!name) { this.showError("name-error", "Please enter your name."); isValid = false; }
                if (!email) { this.showError("email-error", "Email is required."); isValid = false; }
                else if (!this.validateEmail(email)) { this.showError("email-error", "Please enter a valid email address."); isValid = false; }
                if (phone && !this.validatePhone(phone)) { this.showError("phone-error", "Please enter a valid 10-digit phone number."); isValid = false; }
                if (!message) { this.showError("message-error", "Please write a message."); isValid = false; }

                if (!isValid) return;

                const submitBtn = document.querySelector("#contactForm button[type='submit']");
                if (submitBtn) { submitBtn.innerHTML = '<span class="spinner"></span> Sending...'; submitBtn.disabled = true; }

                // Try API with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                try {
                    const response = await fetch("https://agri-project-ol6n.onrender.com/api/contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, email, phone, message }),
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || "Failed to send message. Please try again.");
                    }

                    this.showFormMessage("✅ Message sent successfully! We'll reply within 24 hours.", "green");
                    document.getElementById("contactForm").reset();
                    if (submitBtn) { submitBtn.innerHTML = 'Send Message'; submitBtn.disabled = false; }

                } catch (fetchError) {
                    clearTimeout(timeoutId);
                    if (fetchError.name === 'AbortError') {
                        // Server timeout — show success anyway (message may have gone through)
                        this.showFormMessage("✅ Message received! We'll get back to you soon.", "green");
                        document.getElementById("contactForm").reset();
                    } else {
                        throw fetchError;
                    }
                    if (submitBtn) { submitBtn.innerHTML = 'Send Message'; submitBtn.disabled = false; }
                }

            } catch (error) {
                this.showFormMessage("❌ " + (error.message || "Something went wrong. Please try WhatsApp instead."), "error");
                const submitBtn = document.querySelector("#contactForm button[type='submit']");
                if (submitBtn) { submitBtn.innerHTML = 'Send Message'; submitBtn.disabled = false; }
            }
        },

        clearContactErrors() {
            document.querySelectorAll(".error-text").forEach(el => { el.textContent = ""; });
        },

        showError(elementId, message) {
            const errorElement = document.getElementById(elementId);
            if (errorElement) errorElement.textContent = message;
        },

        showFormMessage(message, type) {
            const messageElement = document.getElementById("form-message");
            if (messageElement) {
                messageElement.textContent = message;
                messageElement.style.color = type === "green" ? "#4CAF50" : "#e53e3e";
                messageElement.style.marginTop = "10px";
                setTimeout(() => { messageElement.textContent = ""; }, 5000);
            }
        },

        validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        validatePhone(phone) {
            return /^[0-9]{10}$/.test(phone);
        }
    };

    App.init();
});
