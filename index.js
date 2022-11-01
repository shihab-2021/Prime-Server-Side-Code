const ObjectId = require("mongodb").ObjectId;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongo url and client //
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.avm9c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Prime");
    const usersCollection = database.collection("users");
    const blogCollection = database.collection("blogs");

    // for getting users
    app.get("/users", async (req, res) => {
      const user = usersCollection.find({});
      const result = await user.toArray();
      res.send(result);
    });

    // for getting all blog 
    app.get("/blogs", async (req, res) => {
      const cursor = blogCollection?.find({});
      const blogs = await cursor?.toArray();
      res.json(blogs);
    });

    // for posting blogs
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogCollection.insertOne(blog);
      res.json(result);
    });

    // for single blog
    app.get("/blog/:id", async (req, res) => {
      const query = { _id: ObjectId(req?.params?.id) };
      const cursor = await blogCollection?.findOne(query);
      res.json(cursor);
      console.log(cursor);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(
    `<h1 style="color:Tomato; text-align: center; padding: 50px;">Welcome to Prime server side!!!</h1><div style="padding: 50px; "><h2>Prime team members:</h2><h3>C193069 - Shajibul Alam Shihab</h3><h3>C193048 - Tanvir Hasan Sohan</h3><h3>C193071 - Muhtakim Safat Mishon</h3></div>`
  );
});

app.listen(port, () => {
  console.log(`Listening port: ${port}`);
});
