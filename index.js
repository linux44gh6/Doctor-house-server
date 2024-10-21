require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express()
const port = (process.env.PORT || 3000)
const { ObjectId } = require('mongodb');
const nodemailer=require('nodemailer')
//middleware
app.use(cors({
 origin:['http://localhost:5173'] 
}))
app.use(express.json())

//setup transporter
const transporter=nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.MAIL,
    pass:process.env.MAIL_PASS
  }
})

//mongoDB connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pnsxsk9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const doctorCollection = client.db('doctor-house').collection('doctors')
const appointmentCollection = client.db('doctor-house').collection('appointment')
const userCollection=client.db('doctor-server').collection('usersInfo')
async function run() {
  try {

    app.get('/', async (req, res) => {
      res.send('Doctor server running')
    })

    app.get('/doctor', async (req, res) => {
      const result = await doctorCollection.find().toArray()
      res.send(result)
    })
    app.get('/doctor/:id', async (req, res) => {
      try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }; 
          console.log(query);
       
          const result = await doctorCollection.findOne(query);
          if (result) {
              res.send(result);
          } else {
              res.status(404).send({ message: 'Doctor not found' });
          }
      } catch (error) {
          console.error(error);
          res.status(500).send({ message: 'Error fetching doctor details' });
      }
  });
    app.post('/appointment', async (req, res) => {
      const data = req.body
      console.log(data);
      const result = await appointmentCollection.insertOne(data)
      res.send(result)
    })

    app.post('/users',async(req,res)=>{
      const userData=req.body
      const existing={email:userData.email}
      const exist=await userCollection.findOne(existing)
      if(exist){
        res.send('Email already exist')
      }
      else{
        const result=await userCollection.insertOne(userData)
        res.send(result)
      }
      console.log(userData);
    })
//sending the mail 
    app.post('/send_mail',async(req,res)=>{
      const {email,name,doctorName}=req.body
      const mailOption={
        from:email,
        to:process.env.MAIL,
        subject:`Contact By ${name}`,
        text:`you have new massage from
        Name:${name}
        Email:${email}
        Message:I need doctor ${doctorName}
        `
      }
      transporter.sendMail(mailOption,(error,info)=>{
        if(error){
          console.log(error);
          return res.status(500).send("Error sending Email")
        }
        console.log(info.response);
        res.status(200).send("Email send success")
      })
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`doctor house runing at ${port}`);
})
