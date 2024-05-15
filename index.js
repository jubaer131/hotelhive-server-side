
const express =require('express')
const cors =require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// midle ware 

app.use(
    cors({
      origin: [
        
       
        "https://wonderful-souffle-eaed92.netlify.app"
        
      ],
      credentials: true,
    })
  );

// app.use(cors())
app.use(express.json())
app.use(cookieParser())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8dssgfd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb+srv://<username>:<password>@cluster0.8dssgfd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
console.log(uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


  // midle ware 
  const logger = (req,res,next)=>{
    console.log('log:info',req.method, req.url );
    next();
  }

  const varifytoken = (req,res,next)=>{
    const token = req?.cookies?.token;
    // console.log('token in the middle ware', token)

    if(!token){
      return res.Status(401).send({message : 'unauthorized access'})
    }

    jwt.varify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
   if(err){
    return res.Status(401).send({message:'unauthorize access'})
   }
   req.user = decoded;
   next()
    })
   

  }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
  const roomcollection = client.db('hotelhive').collection('data1')
  const roomdatacollection = client.db('hotelhive').collection('data2')
  const reviewcollection =client.db('hotelhive').collection('review')

 //creating Token
 


app.post("/jwt",logger,  async (req, res) => {
  const user = req.body;
  console.log("user for token", user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

  res.cookie("token", token,{
    httpOnly:true,
    secure:true,
    sameSite:'none'
  } )
  .send({ success: true });
});
app.post("/logout", async (req, res) => {
  const user = req.body;
  console.log("logging out", user);
  res
    .clearCookie("token", { maxAge: 0 })
    .send({ success: true });
});







  // services api 
app.get('/our-roomdataall', async(req,res)=>{
 const result =await roomcollection.find().toArray()
 res.send(result)

})
app.get('/roompagedetail/:id', async(req,res)=>{
  const id = req.params.id 
  const query = {_id : new ObjectId (id)}
 const result =await roomcollection.findOne(query)
 res.send(result)

})

  
// jwt token  

 app.get('/RoomsPage',logger,varifytoken, async(req,res)=>{
  const filter =req.query.filter
  if(req.user.email !== req.query.email){
    return res.status(403).send({
      message : 'forbidden access'
    })
  }

  let query = {}
  if(filter)query = {PricePerNight: filter}
  const result = await roomcollection.find(query).toArray()
  res.send(result)
 })

 app.get('/userreviewpost', async(req,res)=>{
  const result =await reviewcollection.find().toArray()
  res.send(result)
 
 })

 app.get('/bookingroom/:email',async(req,res)=>{
  const email = req.params.email 
  console.log(email)
  const query = {email:email}
  const result = await roomdatacollection.find(query).toArray()
  res.send(result)
})





app.patch('/featured-rooms/:id', async(req,res)=>{
  const id = req.params.id 
  const  Status = req.body 
  const query = {_id : new ObjectId(id)}
  const updatedoc ={
    $set : {...Status}
  }
  const result = await roomcollection.updateOne(query,updatedoc)
  res.send(result)
})
app.patch('/booking-cancel/:id', async(req,res)=>{
  const id = req.params.id 
  const  Status = req.body 
  console.log(Status)
  const query = {_id : new ObjectId(id)}
  const updatedoc ={
    $set : {...Status}
  }
  const result = await roomcollection.updateOne(query,updatedoc)
  res.send(result)
})


app.put('/updatedate/:email', async (req, res) => {
  const email = req.params.email;
  console.log(email)
  const filter = {email:email }
  const options = { upsert: true }
  const update = req.body;
  console.log(update)
  const sport = {
      $set: {...update}
          
          
      
  }

  const result = await roomdatacollection.updateOne(filter, sport, options);
  res.send(result);
})




// datacollection-2

app.post('/myrooms-data', async(req,res)=>{
  const roomdata = req.body
  console.log(roomdata)
  const result = await roomdatacollection.insertOne(roomdata)
  res.send(result)

})
// datacollection-3



app.post('/userreview', async(req,res)=>{
  const reviewdata = req.body
  console.log(reviewdata)
  const result = await  reviewcollection.insertOne(reviewdata)
  res.send(result)

})



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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