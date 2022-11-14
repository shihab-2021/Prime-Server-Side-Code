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

    // user post api
    app.post("/users-data", async (req, res) => {
      const cursor = await usersCollection.insertOne(req.body);
      res.json(cursor);
    });

    // users when the first time register put api
    app.put("/users-data", async (req, res) => {
      const query = { email: req.body.email };
      const options = { upsert: true };
      const updateDocs = { $set: req.body };

      // getting user info if already have in the db
      const userInfo = await usersCollection.findOne(query);
      if (userInfo) {
        res.send("already in the db ");
      } else {
        const result = await usersCollection.updateOne(
          query,
          updateDocs,
          options
        );
      }
    });
    
    // put user for google login
    app.put("/users-data", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // user profile update api here
    app.put("/profile-update", async (req, res) => {
      const query = { email: req.body.email };
      const options = { upsert: true };
      const updateDocs = { $set: req.body };
      const result = await usersCollection.updateOne(
        query,
        updateDocs,
        options
      );
      res.json(result);
    });

    // users follow and following api start here
    app.put("/user", async (req, res) => {
      const bloggerId = req.body.bloggerId;
      const userId = req.body.userId;
      const options = { upsert: true };

      // getting blogger info here
      const blogger = await usersCollection.findOne({
        _id: ObjectId(bloggerId),
      });
      const bloggerPayload = {
        id: blogger?._id,
        email: blogger?.email,
        name: blogger?.displayName,
        image: blogger?.image,
      };
      // getting user info here
      const user = await usersCollection.findOne({ _id: ObjectId(userId) });
      const userPayload = {
        id: user?._id,
        email: user?.email,
        name: user?.displayName,
        image: user?.image,
      };

      // update blogger here
      const bloggerDocs = {
        $push: { followers: userPayload },
      };
      // update user here
      const userDocs = {
        $push: { following: bloggerPayload },
      };

      const updateBlogger = await usersCollection.updateOne(
        blogger,
        bloggerDocs,
        options
      );
      const updateUser = await usersCollection.updateOne(
        user,
        userDocs,
        options
      );
      res.send("followers following updated");
    });

    // and user follow and following api end here
    app.get("/users", async (req, res) => {
      const user = usersCollection.find({});
      const result = await user.toArray();
      res.send(result);
    });

    // and user follow and following api end here
    app.get("/users-data", async (req, res) => {
      const user = usersCollection.find({});
      const result = await user.toArray();
      res.send(result);
    });

    // users information by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      // let isAdmin = false;
      // if (user?.role === "admin") {
      //   isAdmin = true;
      // }
      res.json(user);
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

    // blog delete api
    app.delete("/blog/:id", async (req, res) => {
      const query = { _id: ObjectId(req?.params?.id) };
      const result = await blogCollection?.deleteOne(query);
      res.json(result);
    });

    // for updating the blog || adding comment
    app.put("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDocs = {
        $push: { comment: req?.body },
      };
      const result = await blogCollection.updateOne(query, updateDocs, options);
    });

    // reporting blog
    app.put("/blog/:id/reportBlog", async (req, res) => {
      const query = { _id: ObjectId(req?.params?.id) };
      const updateDocs = {
        $push: { reports: req.body },
      };
      const result = await blogCollection.updateOne(query, updateDocs);
      console.log(result);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(
    `<h1 style="color:Tomato; text-align: center; padding: 50px;">Welcome to Prime server side!!!</h1><div style="padding: 50px; "><h2>Prime team members:</h2><h3>C193069 - Shajibul Alam Shihab</h3><h3>C193048 - Tanvir Hasan Sohan</h3><h3>C193071 - Muhtakim Safat Mishon</h3><p>Links of API in down below:</p></div>`
  );
});

app.listen(port, () => {
  console.log(`Listening port: ${port}`);
});
