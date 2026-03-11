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
                authButton.innerHTML = `
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span style="background:#e8f5e9;color:#2e7d32;padding:6px 14px;border-radius:20px;font-weight:600;font-size:0.9rem;">👤 ${firstName}</span>
                        <a href="#" id="logout-btn" class="btn" style="padding:6px 16px;font-size:0.9rem;">Logout</a>
                    </div>
                `;
                document.getElementById("logout-btn")?.addEventListener("click", (e) => this.handleLogout(e));
            } else {
                authButton.innerHTML = `
                    <div style="display:flex;flex-direction:row;gap:10px;align-items:center;">
                        <a href="login.html" class="btn">Login</a>
                        <a href="signup.html" class="btn">Sign Up</a>
                    </div>
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

                if (!isValid) throw new Error("Please fix the errors above.");

                const submitBtn = document.querySelector("#contactForm button[type='submit']");
                if (submitBtn) { submitBtn.innerHTML = '<span class="spinner"></span> Sending...'; submitBtn.disabled = true; }

                const response = await fetch("https://agri-project-ol6n.onrender.com/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, phone, message })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to send message. Please try again.");
                }

                this.showFormMessage("✅ Message sent successfully!", "green");
                document.getElementById("contactForm").reset();
                if (submitBtn) { submitBtn.innerHTML = 'Send Message'; submitBtn.disabled = false; }

            } catch (error) {
                this.showFormMessage(error.message, "error");
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
