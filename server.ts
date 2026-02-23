import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("blackpeopleeats.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    lat REAL,
    lng REAL,
    category TEXT,
    is_black_owned INTEGER DEFAULT 0,
    is_sponsored INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    bio TEXT,
    profile_pic TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER,
    followed_id INTEGER,
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY(follower_id) REFERENCES users(id),
    FOREIGN KEY(followed_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER,
    user_id INTEGER,
    user_name TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    image_url TEXT,
    review TEXT,
    rating INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed data if empty
const restaurantCount = db.prepare("SELECT COUNT(*) as count FROM restaurants").get() as { count: number };
if (restaurantCount.count === 0) {
  const seedRestaurants = [
    { name: "Slutty Vegan", city: "Atlanta", address: "154 Howell Mill Rd NW", category: "Vegan", is_black_owned: 1, is_sponsored: 1 },
    { name: "Busy Bee Cafe", city: "Atlanta", address: "810 Martin Luther King Jr Dr SW", category: "Soul Food", is_black_owned: 1, is_sponsored: 0 },
    { name: "Harold's Chicken Shack", city: "Chicago", address: "1208 E 53rd St", category: "Chicken", is_black_owned: 1, is_sponsored: 0 },
    { name: "The Breakfast Klub", city: "Houston", address: "3711 Travis St", category: "Breakfast", is_black_owned: 1, is_sponsored: 1 },
    { name: "Dooky Chase's", city: "New Orleans", address: "2301 Orleans Ave", category: "Creole", is_black_owned: 1, is_sponsored: 0 }
  ];

  const insertRestaurant = db.prepare(`
    INSERT INTO restaurants (name, city, address, category, is_black_owned, is_sponsored)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  seedRestaurants.forEach(r => insertRestaurant.run(r.name, r.city, r.address, r.category, r.is_black_owned, r.is_sponsored));

  // Seed a default user
  db.prepare("INSERT OR IGNORE INTO users (id, username, bio, profile_pic) VALUES (1, 'ChefBae', 'Foodie & Explorer', 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=200&h=200&fit=crop')").run();

  const insertPost = db.prepare(`
    INSERT INTO posts (restaurant_id, user_id, user_name, meal_name, review, rating, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPost.run(1, 1, "ChefBae", "One Night Stand Burger", "The best vegan burger I've ever had. Period.", 5, "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=600&h=450&fit=crop");
  insertPost.run(2, 1, "ChefBae", "Fried Chicken & Mac", "Tastes like grandma's cooking. The line is worth it.", 4, "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&h=450&fit=crop");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/restaurants", (req, res) => {
    const city = req.query.city;
    let query = `
      SELECT r.*, AVG(p.rating) as avg_rating 
      FROM restaurants r 
      LEFT JOIN posts p ON r.id = p.restaurant_id
    `;
    const params = [];
    if (city) {
      query += " WHERE r.city = ?";
      params.push(city);
    }
    query += " GROUP BY r.id";
    const restaurants = db.prepare(query).all(...params);
    res.json(restaurants);
  });

  app.get("/api/sponsors", (req, res) => {
    const sponsors = db.prepare("SELECT * FROM restaurants WHERE is_sponsored = 1").all();
    res.json(sponsors);
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    res.json(user);
  });

  app.post("/api/users/:id", (req, res) => {
    const { username, bio, profile_pic } = req.body;
    db.prepare("UPDATE users SET username = ?, bio = ?, profile_pic = ? WHERE id = ?")
      .run(username, bio, profile_pic, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/follow", (req, res) => {
    const { follower_id, followed_id } = req.body;
    db.prepare("INSERT OR IGNORE INTO follows (follower_id, followed_id) VALUES (?, ?)")
      .run(follower_id, followed_id);
    res.json({ success: true });
  });

  app.get("/api/posts", (req, res) => {
    const userId = req.query.userId;
    let query = `
      SELECT p.*, r.name as restaurant_name, r.city as restaurant_city, u.profile_pic as user_avatar
      FROM posts p 
      JOIN restaurants r ON p.restaurant_id = r.id 
      JOIN users u ON p.user_id = u.id
    `;
    const params = [];
    if (userId) {
      query += " WHERE p.user_id IN (SELECT followed_id FROM follows WHERE follower_id = ?) OR p.user_id = ?";
      params.push(userId, userId);
    }
    query += " ORDER BY p.created_at DESC";
    const posts = db.prepare(query).all(...params);
    res.json(posts);
  });

  app.post("/api/posts", (req, res) => {
    const { restaurant_id, user_id, user_name, meal_name, image_url, review, rating } = req.body;
    const info = db.prepare(`
      INSERT INTO posts (restaurant_id, user_id, user_name, meal_name, image_url, review, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(restaurant_id, user_id || 1, user_name, meal_name, image_url, review, rating || 5);
    res.json({ id: info.lastInsertRowid });
  });

  // Stripe Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      if (!stripe) {
        return res.json({ url: "https://checkout.stripe.com/pay/mock_session?reason=no_key" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Restaurant Sponsorship",
                description: "Highlight your restaurant on BlackPeopleEats",
              },
              unit_amount: 5000, // $50.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
