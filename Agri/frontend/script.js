document.addEventListener("DOMContentLoaded", function () {
    console.log("Script Loaded Successfully - Chalu ho gaya bhai!");

    const App = {
        // Initialize all components
        init() {
            this.setupDropdowns();
            this.updateAuthButton();
            this.setupEventListeners();
            this.setupSmoothScrolling();
        },

        // Dropdown functionality (kept for other dropdowns if needed)
        setupDropdowns() {
            document.querySelectorAll(".dropdown").forEach(dropdown => {
                const button = dropdown.querySelector(".btn");
                const content = dropdown.querySelector(".dropdown-content");
                
                button.addEventListener("click", (e) => {
                    e.stopPropagation();
                    content.style.display = content.style.display === "block" ? "none" : "block";
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener("click", () => {
                document.querySelectorAll(".dropdown-content").forEach(content => {
                    content.style.display = "none";
                });
            });
        },

        // Setup all form event listeners
        setupEventListeners() {
            // Login Form
            const loginForm = document.getElementById("loginForm");
            if (loginForm) {
                loginForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }

            // Register Form
            const registerForm = document.getElementById("registerForm");
            if (registerForm) {
                registerForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.handleRegister();
                });
            }

            // Contact Form (with null checks)
            const contactForm = document.getElementById("contactForm");
            if (contactForm) {
                contactForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.handleContact();
                });
            }
        },

        // Handle registration
        async handleRegister() {
            const regBtn = document.querySelector("#registerForm button");
            if(regBtn){regBtn.innerHTML='<span class="spinner"></span> Please wait...';regBtn.disabled=true;}
            try {
                // Get form values with null checks
                const name = document.getElementById("name")?.value;
                const email = document.getElementById("email")?.value;
                const password = document.getElementById("password")?.value;
                const confirmPassword = document.getElementById("confirmPassword")?.value;

                if (!name || !email || !password || !confirmPassword) {
                    throw new Error("Saare fields bharna zaroori hai!");
                }

                if (password !== confirmPassword) {
                    throw new Error("Password match nahi kar raha!");
                }

                const response = await fetch("https://agri-project-ol6n.onrender.com/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Register karne mein problem aa gayi");
                }

                this.showMessage("Account ban gaya! Login page pe redirect ho rahe hain...", "green");
                setTimeout(() => window.location.href = "login.html", 1500);
            } catch (error) {
                console.error("Register Error:", error);
                this.showMessage(error.message, "red");
            }
        },

        // Handle login
        async handleLogin() {
            const loginBtn = document.querySelector("#loginForm button");
            if(loginBtn){loginBtn.innerHTML='<span class="spinner"></span> Logging in...';loginBtn.disabled=true;}
            try {
                const email = document.getElementById("email")?.value;
                const password = document.getElementById("password")?.value;

                if (!email || !password) {
                    throw new Error("Email aur password dono bharna padega");
                }

                const response = await fetch("https://agri-project-ol6n.onrender.com/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    throw new Error((await response.json()).message || "Login nahi ho paya");
                }
                
                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("isLoggedIn", "true");

                this.showMessage("Login Success", "green");
                setTimeout(() => window.location.href = "index.html", 1500);
            } catch (error) {
                console.error("Login Error:", error);
                this.showMessage(error.message, "red");
                this.clearAuthData();
            }
        },

        // Update auth buttons based on login status
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
                
                // Add logout event listener
                document.getElementById("logout-btn")?.addEventListener("click", (e) => this.handleLogout(e));
            } else {
                authButton.innerHTML = `
                    <div style="display: flex; flex-direction: row; gap: 10px; align-items: center;">
                        <a href="login.html" class="btn">Login</a>
                        <a href="signup.html" class="btn">Sign Up</a>
                    </div>
                `;
            }
        },

        // Clear auth data
        clearAuthData() {
            ["token", "user", "isLoggedIn"].forEach(item => localStorage.removeItem(item));
            sessionStorage.clear();
        },

        // Handle logout
        async handleLogout(e) {
            e.preventDefault();
            this.clearAuthData();
            this.showMessage("Logout ho gaya! Login page pe redirect ho rahe hain...", "green");
            setTimeout(() => window.location.href = "login.html", 1000);
        },

        // Smooth scrolling for anchor links
        setupSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener("click", function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute("href"));
                    if (target) {
                        window.scrollTo({ 
                            top: target.offsetTop - 70, 
                            behavior: "smooth" 
                        });
                    }
                });
            });
        },

        // Show messages to user
        showMessage(message, color) {
            const messageElement = document.getElementById("message");
            if (messageElement) {
                messageElement.textContent = message;
                messageElement.style.color = color;
                setTimeout(() => {
                    if (messageElement.textContent === message) {
                        messageElement.textContent = "";
                    }
                }, 5000);
            }
        },

        // Contact form handling (unchanged)
        async handleContact() {
            try {
                const nameInput = document.getElementById("name");
                const emailInput = document.getElementById("email");
                const phoneInput = document.getElementById("phone");
                const messageInput = document.getElementById("message");
                
                this.clearContactErrors();
                
                if (!nameInput || !emailInput || !messageInput) {
                    throw new Error("Form sahi se load nahi hua. Page refresh karo.");
                }
        
                const name = nameInput.value.trim();
                const email = emailInput.value.trim();
                const phone = phoneInput?.value.trim() || "";
                const message = messageInput.value.trim();
        
                let isValid = true;
                
                if (!name) {
                    this.showError("name-error", "Naam bharo bhai!");
                    isValid = false;
                }
                
                if (!email) {
                    this.showError("email-error", "Email zaroori hai");
                    isValid = false;
                } else if (!this.validateEmail(email)) {
                    this.showError("email-error", "Sahi email daalo");
                    isValid = false;
                }
                
                if (phone && !this.validatePhone(phone)) {
                    this.showError("phone-error", "Sahi phone number daalo");
                    isValid = false;
                }
                
                if (!message) {
                    this.showError("message-error", "Message to likho!");
                    isValid = false;
                }
                
                if (!isValid) {
                    throw new Error("Form mein errors hain");
                }
        
                const formData = { name, email, phone, message };
        
                const response = await fetch("https://agri-project-ol6n.onrender.com/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Message send nahi hua. Baad mein try karo.");
                }
        
                this.showFormMessage("Message Sent Successfully!","green");
                document.getElementById("contactForm").reset();
                
            } catch (error) {
                console.error("Contact Error:", error);
                this.showFormMessage(error.message, "error");
            }
        },
        
        clearContactErrors() {
            document.querySelectorAll(".error-text").forEach(el => {
                el.textContent = "";
            });
        },
        
        showError(elementId, message) {
            const errorElement = document.getElementById(elementId);
            if (errorElement) {
                errorElement.textContent = message;
            }
        },
        
        showFormMessage(message, type) {
            const messageElement = document.getElementById("form-message");
            if (messageElement) {
                messageElement.textContent = message;
                messageElement.className = type;
                
                setTimeout(() => {
                    messageElement.textContent = "";
                    messageElement.className = "";
                }, 5000);
            }
        },
        
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        validatePhone(phone) {
            const re = /^[0-9]{10}$/;
            return re.test(phone);
        }
    };

    // Start the app
    App.init();
});