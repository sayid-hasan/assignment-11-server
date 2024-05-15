const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.grteoyu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //   database
    const blogsCollection = client.db("blogsDB").collection("blogs");
    // comment collection
    const commentsCollection = client.db("blogsDB").collection("comments");
    // wishlist collection
    const wishlistCollection = client.db("blogsDB").collection("wishlist");
    // adding data from add blog page on blogCollection through post method
    app.post("/addblogs", async (req, res) => {
      const blog = req.body;
      console.log(blog);
      const result = await blogsCollection.insertOne(blog);
      res.send(result);
    });
    // adding commments on database through post
    app.post("/comments", async (req, res) => {
      const comment = req.body;
      // console.log(comment);
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });
    // posting data on wishlist
    app.post("/wishlist", async (req, res) => {
      const data = req.body;
      const email = req.query.email;
      const query = {
        id: data.id,
        wishListerEmail: email,
      };
      const ifexist = await wishlistCollection.findOne(query);
      if (ifexist) return;
      const result = await wishlistCollection.insertOne(data);
      res.send(result);
    });
    // getting data for specific user in wishlist
    app.get("/wishlists", async (req, res) => {
      const email = req.query.email;
      console.log("wishlist", email);
      const query = {
        wishListerEmail: email,
      };
      const result = await wishlistCollection.find(query).toArray();
      res.send(result);
    });

    // deleting wishlist
    app.delete("/wishlist/:id", async (req, res) => {
      const id = req.params.id;
      console.log("dele", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    });

    // updating blog data
    app.patch("/updateblog/:id", async (req, res) => {
      const id = req.params.id;
      const blog = req.body;
      console.log(id, blog);
      const filter = { _id: new ObjectId(id) };
      const updateBlog = {
        $set: {
          user_email: blog.user_email,
          blog_title: blog.blog_title,
          user_name: blog.user_name,
          image: blog.image,
          category_name: blog.category_name,

          short_description: blog.short_description,
          long_description: blog.long_description,
        },
      };
      const result = await blogsCollection.updateOne(filter, updateBlog);
      res.send(result);
    });
    // getting comments for ui
    app.get("/allcomment/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {
        blog_id: id,
      };

      const cursor = await commentsCollection.find(query).toArray();
      res.send(cursor);
    });

    app.get("/blogs", async (req, res) => {
      const limit = 6;
      const cursor = await blogsCollection.find().limit(limit).toArray();
      res.send(cursor);
    });
    // getting single data by id for view details
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);
      res.send(result);
    });

    app.get("/", (req, res) => {
      res.send("blogs are running");
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
