const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookeiparser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors({
  origin: ['http://localhost:5173', 'assignment11-2cec1.web.app', 'assignment11-2cec1.firebaseapp.com'],
  credentials: true
}));
app.use(express.json());
app.use(cookeiparser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mym2gsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middleware
// const logger = async (req, res, next) => {
//   console.log('called:', req.hostname, req.originalUrl);
//   next();
// }
// const verifyToken = async (req, res, next) => {
//   const token = req.cookies?.token;
//   // console.log('token value in middleware: ', token)
//   if (!token) {
//     return res.status(401).send({ message: 'not authorized' })
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: 'not authorized' })
//     }
//     console.log('value of token in middleware: ', decoded)
//     req.user = decoded;
//     next()
//   })

// }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignment11db = client.db('assignment11db').collection('queryproduct');
    const assignment11db_users = client.db('assignment11db').collection('users');
    const assignment11db_recomendation = client.db('assignment11db').collection('recomendation');
    const assignment11db_blog = client.db('assignment11db').collection('blogs');


    // auth api's
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: true,  //for the production value should be true.
          sameSite: 'none'
        })
        .send({ success: true });
    })

    // get api's
    app.get('/users', async (req, res) => {
      const cursor = assignment11db_users.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    // app.get('/queryproduct',logger, async (req, res) => {
    //   const cursor = assignment11db.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })

    app.get('/queryproduct', async(req, res)=>{
      console.log(req.query.email)
      console.log('cookei from client: ',req.cookies.token)
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result =await assignment11db.find(query).toArray();
      res.send(result)
    })

    app.get('/queryproduct/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignment11db.findOne(query);
      res.send(result);
    })
    app.get('/recomendation', async (req, res) => {
      console.log(req.query.email)
      console.log('recomendation client cookies: ',req.cookies.token)
      let query ={};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const cursor = assignment11db_recomendation.find(query);
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
      const query = { _id: new ObjectId(id) };
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
      const result = await assignment11db_blog.insertOne(newblog);
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