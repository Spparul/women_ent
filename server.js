const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   In-Memory Database
========================= */
let sellers = [];
let buyers = [];
let products = [];
let orders = [];
let events = [];
let notifications = [];
let mentorRequests = [];

/* =========================
   HELPER FUNCTIONS
========================= */

function generateId() {
  return Date.now().toString();
}

function addNotification(userId, message) {
  notifications.push({
    id: generateId(),
    userId,
    message,
    time: new Date()
  });
}

/* =========================
   REGISTER
========================= */

app.post("/api/:role/register", (req, res) => {
  const { role } = req.params;
  const { phone, password, name } = req.body;

  if (!phone || !password || !name) {
    return res.json({ message: "All fields required" });
  }

  const list = role === "seller" ? sellers : buyers;

  const alreadyExists = list.find(u => u.phone === phone);
  if (alreadyExists) {
    return res.json({ message: "User already exists" });
  }

  const user = {
    ...req.body,
    id: generateId(),
    creditScore: 50,
    confidenceScore: 50,
    revenue: 0
  };

  list.push(user);

  res.json({ message: "Registered successfully" });
});

/* =========================
   LOGIN
========================= */

app.post("/api/login", (req, res) => {
  const { phone, password, role } = req.body;

  const list = role === "seller" ? sellers : buyers;

  const user = list.find(
    u => u.phone === phone && u.password === password
  );

  if (!user) {
    return res.json({ success: false });
  }

  res.json({ success: true, user });
});

/* =========================
   PRODUCTS
========================= */

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/product/add", (req, res) => {
  const { sellerId, name, price } = req.body;

  if (!name || !price) {
    return res.json({ message: "Product name and price required" });
  }

  const product = {
    id: generateId(),
    sellerId,
    name,
    price: Number(price)
  };

  products.push(product);

  addNotification(sellerId, "Product successfully added");

  res.json({ message: "Product added" });
});

/* =========================
   ORDER
========================= */

app.post("/api/order", (req, res) => {
  const { buyerId, sellerId, totalAmount } = req.body;

  const order = {
    id: generateId(),
    buyerId,
    sellerId,
    totalAmount: Number(totalAmount),
    date: new Date()
  };

  orders.push(order);

  const seller = sellers.find(s => s.id === sellerId);
  const buyer = buyers.find(b => b.id === buyerId);

  if (seller) {
    seller.revenue += Number(totalAmount);
    seller.creditScore += 5;
    seller.confidenceScore += 3;
  }

  if (buyer) {
    buyer.confidenceScore += 2;
  }

  addNotification(sellerId, "New order received");
  addNotification(buyerId, "Order placed successfully");

  res.json({ message: "Order placed successfully" });
});

/* =========================
   EVENTS
========================= */

app.get("/api/events", (req, res) => {
  res.json(events);
});

app.post("/api/event", (req, res) => {
  const { sellerId, title, date } = req.body;

  if (!title) {
    return res.json({ message: "Event title required" });
  }

  const event = {
    id: generateId(),
    sellerId,
    title,
    date: date || new Date()
  };

  events.push(event);

  addNotification(sellerId, "Event created successfully");

  res.json({ message: "Event created" });
});

/* =========================
   MENTORING
========================= */

app.post("/api/mentor/request", (req, res) => {
  const { note } = req.body;

  mentorRequests.push({
    id: generateId(),
    note,
    status: "pending",
    time: new Date()
  });

  res.json({ message: "Mentor request sent" });
});

/* =========================
   MAILBOX
========================= */

app.get("/api/notifications/:id", (req, res) => {
  const userNotes = notifications.filter(
    n => n.userId === req.params.id
  );

  res.json(userNotes);
});

/* =========================
   SERVER START
========================= */

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});