const BASE_URL = "http://localhost:5000";

/* Toggle Seller Fields */
function toggleFields() {
  const role = document.getElementById("role").value;
  const sellerFields = document.getElementById("sellerFields");
  sellerFields.style.display = role === "buyer" ? "none" : "block";
}

/* Register */
function register() {
  const role = document.getElementById("role").value;

  const userData = {
    phone: document.getElementById("phone").value,
    password: document.getElementById("password").value,
    name: document.getElementById("name").value,
    address: document.getElementById("address").value,
    businessName: document.getElementById("businessName")?.value || "",
    description: document.getElementById("description")?.value || ""
  };

  fetch(`${BASE_URL}/api/${role}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(userData)
  })
  .then(res => res.json())
  .then(data => alert(data.message));
}

/* Login */
function login() {
  const phone = document.getElementById("loginPhone").value;
  const password = document.getElementById("loginPassword").value;
  const role = document.getElementById("role").value;

  fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ phone, password, role })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", role);
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid credentials");
    }
  });
}

/* Dashboard Load */
if (window.location.pathname.includes("dashboard.html")) {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");

  if (!user) window.location.href = "index.html";

  document.getElementById("scoreBox").innerHTML =
    `Credit: ${user.creditScore || 0}<br>
     Confidence: ${user.confidenceScore || 0}`;

  showDashboard();
}

/* Dashboard View */
function showDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  document.getElementById("content").innerHTML = `
    <div class="card">
      <h3>Revenue Overview</h3>
      <canvas id="barChart"></canvas>
      <canvas id="pieChart"></canvas>
    </div>
  `;

  new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Revenue"],
      datasets: [{
        label: "Revenue",
        data: [user.revenue || 0],
        backgroundColor: "#ff9f43"
      }]
    }
  });

  new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: ["Revenue", "Remaining"],
      datasets: [{
        data: [user.revenue || 0, 10000 - (user.revenue || 0)],
        backgroundColor: ["#6c63ff", "#ddd"]
      }]
    }
  });
}

/* Logout */
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}