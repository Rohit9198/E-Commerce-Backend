import database from "../database/db.js";

const sampleProducts = [
  {
    name: "Wireless Noise-Canceling Headphones",
    description: "Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and crystal clear sound.",
    price: 199.99,
    category: "Electronics",
    ratings: 4.8,
    stock: 25,
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        public_id: "seed_headphones",
      },
    ],
  },
  {
    name: "Classic Minimalist Watch",
    description: "Elegant analog wrist watch with genuine leather strap, sapphire crystal glass, and water resistance up to 50m.",
    price: 149.50,
    category: "Fashion",
    ratings: 4.7,
    stock: 18,
    images: [
      {
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        public_id: "seed_watch",
      },
    ],
  },
  {
    name: "Ultra-Fast Mechanical Gaming Keyboard",
    description: "Custom RGB backlit mechanical keyboard with hot-swappable switches, PBT keycaps, and ultra-low latency.",
    price: 129.99,
    category: "Electronics",
    ratings: 4.9,
    stock: 30,
    images: [
      {
        url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
        public_id: "seed_keyboard",
      },
    ],
  },
  {
    name: "Organic Hydrating Facial Serum",
    description: "Deeply moisturizing face serum enriched with Vitamin C, hyaluronic acid, and botanical extracts for radiant skin.",
    price: 45.00,
    category: "Beauty",
    ratings: 4.6,
    stock: 50,
    images: [
      {
        url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
        public_id: "seed_serum",
      },
    ],
  },
  {
    name: "Modern Ceramic Coffee Mug Set",
    description: "Handcrafted ceramic mug set with matte finish, ergonomic handle, perfect for coffee, tea, and warm beverages.",
    price: 34.99,
    category: "Home & Garden",
    ratings: 4.5,
    stock: 40,
    images: [
      {
        url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800",
        public_id: "seed_mugs",
      },
    ],
  },
  {
    name: "Smart Fitness Running Shoes",
    description: "Lightweight breathable running sneakers with responsive cushioning and non-slip rubber traction sole.",
    price: 119.00,
    category: "Sports",
    ratings: 4.7,
    stock: 22,
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        public_id: "seed_shoes",
      },
    ],
  },
  {
    name: "High-Performance Car Dash Cam 4K",
    description: "Dual channel 4K front and 1080P rear camera with night vision, built-in GPS, and parking monitor mode.",
    price: 89.99,
    category: "Automotive",
    ratings: 4.6,
    stock: 15,
    images: [
      {
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        public_id: "seed_dashcam",
      },
    ],
  },
  {
    name: "The Art of Creative Coding - Hardcover",
    description: "A comprehensive journey through modern software engineering, web development, and digital design patterns.",
    price: 29.95,
    category: "Books",
    ratings: 4.9,
    stock: 35,
    images: [
      {
        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
        public_id: "seed_book",
      },
    ],
  },
  {
    name: "Soft Cotton Baby Romper & Hat Set",
    description: "100% organic combed cotton newborn jumpsuit set, gentle on sensitive skin with snap closures for easy changes.",
    price: 24.99,
    category: "Kids & Baby",
    ratings: 4.8,
    stock: 45,
    images: [
      {
        url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
        public_id: "seed_baby",
      },
    ],
  },
];

async function seedProducts() {
  try {
    let userResult = await database.query("SELECT id FROM users LIMIT 1");
    let userId;

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const newUser = await database.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
        ["Store Admin", "admin@shopmate.com", "$2b$10$wE99q4q3hVb78.2dC2y3r.B7gB8sEre90NfR5i3.Q8tB9wZl9eU6y", "Admin"]
      );
      userId = newUser.rows[0].id;
    }

    console.log("Using user ID:", userId, "for created_by");

    for (const prod of sampleProducts) {
      const existing = await database.query(
        "SELECT id FROM products WHERE name = $1",
        [prod.name]
      );

      if (existing.rows.length === 0) {
        await database.query(
          "INSERT INTO products (name, description, price, category, ratings, stock, images, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())",
          [
            prod.name,
            prod.description,
            prod.price,
            prod.category,
            prod.ratings,
            prod.stock,
            JSON.stringify(prod.images),
            userId,
          ]
        );
        console.log("+ Added product:", prod.name);
      } else {
        console.log("- Product already exists:", prod.name);
      }
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedProducts();
