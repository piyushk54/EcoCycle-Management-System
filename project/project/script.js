
"use strict";

/* ================= BASIC HELPERS ================= */

function scrollToSection(id) {
    const element = document.getElementById(id);

    if (element) {
        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* ================= MOBILE MENU ================= */

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-open");
    });
}

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        if (navLinks) {
            navLinks.classList.remove("mobile-open");
        }
    });
});


/* ================= TOAST ================= */

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}


/* ================= AUTH ================= */

const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authButtonText = document.getElementById("authButtonText");
const authSwitchText = document.getElementById("authSwitchText");
const authSwitchButton = document.getElementById("authSwitchButton");

let authMode = "login";


function openAuth(mode = "login") {
    if (!authModal) return;

    authMode = mode;
    updateAuthUI();
    authModal.classList.add("show");
}


function closeAuth() {
    if (authModal) {
        authModal.classList.remove("show");
    }
}


function toggleAuthMode() {
    authMode = authMode === "login" ? "signup" : "login";
    updateAuthUI();
}


function updateAuthUI() {
    const signupFields = document.querySelectorAll(".signup-only");

    if (
        !authTitle ||
        !authSubtitle ||
        !authButtonText ||
        !authSwitchText ||
        !authSwitchButton
    ) {
        return;
    }

    if (authMode === "signup") {
        authTitle.textContent = "Create Your Account";

        authSubtitle.textContent =
            "Join EcoCycle and start your recycling journey.";

        authButtonText.textContent = "Create Account";
        authSwitchText.textContent = "Already have an account?";
        authSwitchButton.textContent = "Login";

        signupFields.forEach(field => {
            field.classList.remove("hidden");
        });

    } else {
        authTitle.textContent = "Welcome Back";

        authSubtitle.textContent =
            "Login to manage your recycling journey.";

        authButtonText.textContent = "Login";
        authSwitchText.textContent = "Don't have an account?";
        authSwitchButton.textContent = "Create Account";

        signupFields.forEach(field => {
            field.classList.add("hidden");
        });
    }
}


if (authModal) {
    authModal.addEventListener("click", event => {
        if (event.target === authModal) {
            closeAuth();
        }
    });
}


/* ================= PICKUP ================= */

const pickupForm = document.getElementById("pickupForm");

if (pickupForm) {
    pickupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("pickupName").value.trim();
        const phone = document.getElementById("pickupPhone").value.trim();
        const wasteType = document.getElementById("wasteType").value;
        const quantity = document.getElementById("quantity").value;
        const address = document.getElementById("address").value.trim();
        const date = document.getElementById("pickupDate").value;
        const time = document.getElementById("pickupTime").value;

        if (
            !name ||
            !phone ||
            !wasteType ||
            !quantity ||
            !address ||
            !date ||
            !time
        ) {
            showToast("Please fill all pickup details.");
            return;
        }

        const savedUser = JSON.parse(
            localStorage.getItem("ecoUser") || "null"
        );

        const pickupData = {
            fullName: name,
            phone: phone,
            email: savedUser?.email || "",
            eWasteType: wasteType,
            address: address,
            pickupDate: date
        };

        try {
            showToast("Submitting pickup request...");

            const response = await fetch(
                "http://localhost:8080/api/pickups",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(pickupData)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Could not submit pickup request."
                );
            }

            const pickupId = result.trackingId;

            const savedPickup = {
                ...pickupData,
                id: pickupId,
                status: result.status || "Pending"
            };

            localStorage.setItem(
                "latestPickup",
                JSON.stringify(savedPickup)
            );

            showToast(
                "Pickup scheduled successfully! ID: " + pickupId
            );

            pickupForm.reset();

            const trackingInput =
                document.getElementById("trackingId");

            if (trackingInput) {
                trackingInput.value = pickupId;
            }

            setTimeout(() => {
                scrollToSection("tracking");
                trackPickup();
            }, 700);

        } catch (error) {
            console.error("Pickup request error:", error);

            showToast(
                "Pickup request failed. Check backend and database."
            );
        }
    });
}


/* ================= TRACK PICKUP ================= */

async function trackPickup() {
    const input = document.getElementById("trackingId");

    if (!input) return;

    const id = input.value.trim();

    if (!id) {
        showToast("Please enter a pickup ID.");
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:8080/api/pickups/" +
            encodeURIComponent(id)
        );

        if (response.status === 404) {
            showToast("Pickup request not found.");
            return;
        }

        if (!response.ok) {
            throw new Error("Tracking request failed.");
        }

        const pickup = await response.json();

        const resultId = document.getElementById("resultId");

        if (resultId) {
            resultId.textContent = pickup.trackingId || id;
        }

        showToast("Pickup found successfully!");

    } catch (error) {
        console.error("Tracking error:", error);

        showToast(
            "Unable to track pickup. Check backend connection."
        );
    }

    const trackingResult =
        document.getElementById("trackingResult");

    if (trackingResult) {
        trackingResult.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


/* ================= RECYCLING CENTER SEARCH ================= */

function searchCenters() {
    const searchInput = document.getElementById("centerSearch");

    if (!searchInput) return;

    const searchValue = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".center-card");

    let found = false;

    cards.forEach(card => {
        const searchableText = (
            card.dataset.search || card.textContent
        ).toLowerCase();

        if (
            searchValue === "" ||
            searchableText.includes(searchValue)
        ) {
            card.style.display = "block";
            found = true;
        } else {
            card.style.display = "none";
        }
    });

    if (!found) {
        showToast("No recycling center found.");
    }
}


/* ================= CONTACT FORM ================= */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name =
            document.getElementById("contactName").value.trim();

        const email =
            document.getElementById("contactEmail").value.trim();

        const message =
            document.getElementById("contactMessage").value.trim();

        if (!name || !email || !message) {
            showToast("Please fill all contact details.");
            return;
        }

        showToast("Thank you! Your message has been received.");

        contactForm.reset();
    });
}


/* ================= AUTH FORM / BACKEND ================= */

const authForm = document.getElementById("authForm");

if (authForm) {
    authForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nameInput =
            document.getElementById("authName");

        const emailInput =
            document.getElementById("authEmail");

        const passwordInput =
            document.getElementById("authPassword");

        const name = nameInput
            ? nameInput.value.trim()
            : "";

        const email = emailInput
            ? emailInput.value.trim()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";

        const isSignup = authMode === "signup";

        if (!email || !password) {
            showToast("Please enter your email and password.");
            return;
        }

        if (isSignup && !name) {
            showToast("Please enter your full name.");
            return;
        }

        if (isSignup && password.length < 8) {
            showToast("Password must be at least 8 characters.");
            return;
        }

        const endpoint = isSignup
            ? "http://localhost:8080/api/auth/register"
            : "http://localhost:8080/api/auth/login";

        const requestBody = isSignup
            ? {
                fullName: name,
                email: email,
                password: password
            }
            : {
                email: email,
                password: password
            };

        const submitButton = authForm.querySelector(
            'button[type="submit"]'
        );

        const originalButtonText = authButtonText
            ? authButtonText.textContent
            : "";

        try {
            if (submitButton) {
                submitButton.disabled = true;
            }

            if (authButtonText) {
                authButtonText.textContent = "Please wait...";
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                showToast(
                    data.message || "Authentication failed."
                );
                return;
            }

            localStorage.setItem(
                "ecoUser",
                JSON.stringify(data.user)
            );

            localStorage.setItem("loggedIn", "true");

            showToast(
                data.message ||
                (
                    isSignup
                        ? "Account created successfully!"
                        : "Login successful!"
                )
            );

            closeAuth();
            authForm.reset();
            updateAuthUI();

        } catch (error) {
            console.error("Authentication error:", error);

            showToast(
                "Backend connection failed. Make sure Spring Boot is running on port 8080."
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }

            if (authButtonText) {
                authButtonText.textContent =
                    originalButtonText ||
                    (
                        authMode === "signup"
                            ? "Create Account"
                            : "Login"
                    );
            }
        }
    });
}


/* ================= DATE VALIDATION ================= */

const pickupDate = document.getElementById("pickupDate");

if (pickupDate) {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    pickupDate.min = `${year}-${month}-${day}`;
}


/* ================= INITIAL LOAD ================= */

document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();

    const savedPickup = JSON.parse(
        localStorage.getItem("latestPickup") || "null"
    );

    const trackingInput =
        document.getElementById("trackingId");

    if (savedPickup && trackingInput) {
        trackingInput.value = savedPickup.id || "";
    }
});
