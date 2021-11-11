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
    const database = client.db("cycleHouse")
    const cycleCollection = database.collection("cycles")
    const orderCollection = database.collection("orders")
    
    app.get("/product", async (req, res) => {
      const cursor = cycleCollection.find({});
      const cycles = await cursor.toArray();
      res.send(cycles);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const product = await cycleCollection.findOne(query);
      console.log("load user with id:", product);
      res.json(product);
    });
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    app.get("/orders/:email", async (req, res) => {
      const query = {
        accountMail: req.params.email,
      };
      console.log(query)
      const result = await orderCollection.find(query).toArray();
      console.log(result);
      res.json(result);
    });

    app.post("/product/addProduct", async (req, res) => {
      const product = req.body;
      console.log("hit the post api", product);

      const result = await cycleCollection.insertOne(product);
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
      console.log(id);
      const updateInfo = req.body;
      console.log(updateInfo);
      const result = await orderCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: { status: updateInfo.status } }
      );
      res.send(result);
    });
    app.delete("/product/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cycleCollection.deleteOne(query);
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