const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken')
// const morgan = require('morgan')

const port = process.env.PORT || 8000

// const corsOption =()=>{

// }

app.use(cors({
  origin: 'http://localhost:5173', // Set the allowed origin
  credentials: true // Allow credentials (cookies)
}));
app.use(express.json())
app.use(cookieParser())
// app.use(morgan('env'))






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vjcdyry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const userCollection =client.db('hotel-managment').collection('User')


    // jwt generate
   app.post('/jwt', async(req,res)=>{
    const user = req.body;
    console.log("I need a jwt", user);
    const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: '365d'
    })
    res
     
        .cookie('token',token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict'
        })
        .send({success: true})
   })


//    user created and update and also verifi user dont duplicate
    app.put('/user/:email', async(req,res)=>{
    const email = req.params.email;
    const user= req.body;
    const query = {email: email}
    const options = {upsert: true}
    const isExist = await userCollection.findOne(query)
    console.log("User found----->",isExist);
    if(isExist)return res.send(isExist)
    const result = await userCollection.updateOne(
       query,
       {
        $set: {...user, timestamp: Date.now()},
       },
       options
   )
   res.send(result)
   })


//    logout

  app.get('/logout', async(req,res)=>{
    try{
      res.clearCookie('token',{
        maxAge: 0,
        secure: process.env.NODE_ENV=== "production",
        sameSite: process.env.NODE.ENV === 'production' ? 'none' : 'strict'
      })
        .send({success: true})
        console.log("logout successfull");
    }catch{
      res.status(500).send(err)
    }
  })
   





    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
   

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send("doctor is running")
})

app.listen(port, ()=>{
    console.log(`Car docrotr server is running on  port ${port}`);
})