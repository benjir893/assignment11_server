const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mym2gsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignment11db = client.db('assignment11db').collection('queryproduct');
    const assignment11db_users = client.db('assignment11db').collection('users');
    const assignment11db_recomendation = client.db('assignment11db').collection('recomendation');
    const assignment11db_blog = client.db('assignment11db').collection('blogs');

    // get api's
    app.get('/users', async (req, res) => {
      const cursor = assignment11db_users.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get('/queryproduct', async (req, res) => {
      const cursor = assignment11db.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/queryproduct/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignment11db.findOne(query);
      res.send(result);
    })
    app.get('/recomendation', async (req, res) => {
      const cursor = assignment11db_recomendation.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get('/recomendation/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignment11db_recomendation.findOne(query);
      res.send(result);
    })
    app.get('/blogs', async (req, res) => {
      const cursor = assignment11db_blog.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    //delete api's
    app.delete('/queryproduct/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignment11db.deleteOne(query);
      res.send(result);
    })
    app.delete('/recomendation/:id', async (req, res) => {
      const id = req.params.id;
      const query = { id: new ObjectId(id) };
      const result = await assignment11db_recomendation.deleteOne(query);
      res.send(result)
    })
    app.put('/queryproduct/:id', async (req, res) => {
      const id = req.params.id;
      const updatedQuery = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true }
      const prod = {
        $set: {
          ProductImage: updatedQuery.ProductImage,
          QueryTitle: updatedQuery.QueryTitle,
          ProductName: updatedQuery.ProductName,
          BrandName: updatedQuery.BrandName,
          AlternationReason: updatedQuery.AlternationReason,
          DatePosted: updatedQuery.DatePosted,
          // name: updatedQuery.name,
          // image: updatedQuery.image,
          // email: updatedQuery.email,
        }
      }
      const result = await assignment11db.updateOne(query, prod, options);
      res.send(result);
    })
    //post api's
    app.post('/recomendation', async (req, res) => {
      const newquery = req.body;
      const result = assignment11db_recomendation.insertOne(newquery);
      res.send(result)
    })
    app.post('/queryproduct', async (req, res) => {
      const newQuery = req.body;
      const result = await assignment11db.insertOne(newQuery);
      res.send(result);
    })
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const result = await assignment11db_users.insertOne(newUser);
      res.send(result);
    })
    app.post('/blogs', async (req, res) => {
      const newblog = req.body;
      const result =await assignment11db_blog.insertOne(newblog);
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server11 is running...')
});

app.listen(port, () => {
  console.log(`server port number is on ${port}`);
})