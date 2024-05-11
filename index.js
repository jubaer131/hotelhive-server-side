
const express =require('express')
const cors =require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// midle ware 
//Must remove "/" from your production URL
app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://cardoctor-bd.web.app",
        
      ],
      credentials: true,
    })
  );
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8dssgfd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb+srv://<username>:<password>@cluster0.8dssgfd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    // await client.connect();
  const roomcollection = client.db('hotelhive').collection('data1')

app.get('/featuredrooms', async(req,res)=>{
 const result =await roomcollection.find().toArray()
 res.send(result)

})

app.patch('/room/:id', async(req,res)=>{
  const id = req.params.id 
  const  Status = req.body 
  const query = {_id : new ObjectId (id)}
  const updatedoc ={
    $set : {...Status}
  }
  const result = await roomcollection.updateOne(query,updatedoc)
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
  res.send('Hotel hive is running ')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})