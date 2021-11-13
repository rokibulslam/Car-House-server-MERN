const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
require("dotenv").config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2efaz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

async function run() {
  try {
    await client.connect();
    console.log("server connected");
    const database = client.db("carHouse")
    const carCollection = database.collection("cars")
    const orderCollection = database.collection("orders")
    const usersCollection = database.collection("users")
    const reviewCollection = database.collection("review");
    // Manage Product 
    app.get("/product", async (req, res) => {
      const cursor = carCollection.find({});
      const cycles = await cursor.toArray();
      res.send(cycles);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const product = await carCollection.findOne(query);
      console.log("load user with id:", product);
      res.json(product);
    });
    // Update Product 
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id
      const query = {
        _id: ObjectId(id),
      };
      const updateInfo = req.body
      const update = { $set:{
        ProductName: updateInfo.ProductName,
        price: updateInfo.price,
        description: updateInfo.description,
        imgURL: updateInfo.imgURL,
        brand: updateInfo.brand
      }}
      const result = await carCollection.updateOne(query, update)
      res.send(result)
    });
    
    // Manage Order
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    app.get("/orders/:email", async (req, res) => {
      const query = {
        email: req.params.email,
      };
      console.log(query)
      const result = await orderCollection.find(query).toArray();
      console.log(result);
      res.json(result);
    });

    app.post("/product/addProduct", async (req, res) => {
      const product = req.body;
      console.log("hit the post api", product);

      const result = await carCollection.insertOne(product);
      console.log(result);
      res.json(result);
    });
    app.post("/orders", async (req, res) => {
      const order = req.body;
      console.log("hit the orders");
      const result = await orderCollection.insertOne(order);
      console.log(result);
      res.json(result);
    });
    // Manage Order 
    
    app.put("/order/status/:id", async (req, res) => {
      const id = req.params.id;
      const updateInfo = req.body;
      const result = await orderCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: { status: updateInfo.status } }
      );
      res.send(result);
    });
    app.delete("/product/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      console.log(result);
      console.log(id);
      res.json(result);
    });
    // Delete/cancel order 
    app.delete("/order/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log(result);
      console.log(id);
      res.json(result);
    });

    // Users API 
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });
    // Admin API 
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateRole = { $set: { role: 'admin' } }
      const result = await usersCollection.updateOne(filter, updateRole)
      console.log(result)
      res.json(result);
    })
    // Get all Admins 
    app.get("/admins/:role", async (req, res) => {
      const query = {
        role: req.params.role,
      };
      console.log(query);
      const result = await usersCollection.find(query).toArray();
      console.log(result);
      res.json(result);
    });
    // Check role of User 
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      else {
        isAdmin = false
      }
      console.log(isAdmin)
      res.json({ admin: isAdmin });
    });
    // Review Manage 
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.post("/review", async (req, res) => {
      const order = req.body;
      console.log("hit the orders");
      const result = await reviewCollection.insertOne(order);
      console.log(result);
      res.json(result);
    });
    
  } finally {
    // await client.close()
  }
}
run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`listening at port ${port}`)
})