console.log("Script loaded!");

async function loginUser() {
    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token); // Store token for session
            alert("Login successful!");
            window.location.href = "dashboard.html"; // Redirect after login
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while logging in.");
    }
}

// Function to register a new user
async function registerUser() {
    const email = document.querySelector("#register-email").value;
    const password = document.querySelector("#register-password").value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        alert(data.message);
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while registering.");
    }
}
