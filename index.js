require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app=express()
const port=(process.env.PORT||3000)

 //middleware

 app.use(cors())
 app.use(express.json())
console.log(process.env.DB_PASS);
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pnsxsk9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const doctorCollection=client.db('doctor-house').collection('doctors')
const appointmentCollection=client.db('doctor-house').collection('appointment')

async function run() {
  try {

    app.get('/',async(req,res)=>{
        res.send('Doctor server running')
    })

    app.get('/doctor',async(req,res)=>{
        const result=await doctorCollection.find().toArray()
         res.send(result)
    })

    app.post('/appointment',async(req,res)=>{
      const data=req.body
      console.log(data);
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log(`doctor house runing at ${port}`);
})
