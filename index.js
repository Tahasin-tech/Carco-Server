const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId=require('mongodb').ObjectId;
// const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { response } = require('express');

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bl05f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dnwfd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connected')
        const database = client.db('carco');
        const usersCollection = database.collection('users');
        const carsCollection = database.collection('cars');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');

        //carsCollection
        
        app.get('/cars',async(req,res)=>{
            const cursor = carsCollection.find({});
            const cars=await cursor.toArray();
            res.send(cars);
        })
        
        app.get('/cars/:id',async(req,res)=>{
            const id=req.params.id;
            const query ={_id:ObjectId(id)};
            const car=await carsCollection.findOne(query);
            res.json(car);
        })

        app.post('/cars',async(req,res)=>{
          const car = req.body;
          const result=await carsCollection.insertOne(car);
          res.json(result);
        })

        app.delete('/cars/:id',async(req,res)=>{
            const id=req.params.id;
            const query = {_id:ObjectId(id)};
            const result=await carsCollection.deleteOne(query);
            res.json(result)
        })
        //ordersCollection
        app.get('/orders',async(req,res)=>{
            let query ={};
            const email = req.query.email;
            if(email){
                query={email:email};
            }
            const cursor = ordersCollection.find(query)
            const orders=await cursor.toArray();
            res.json(orders);
        })
        app.post('/orders',async(req,res)=>{
            const order =req.body;
            const result =await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result)
          })
          app.get('/orders/:id',async(req,res)=>{
            const id= req.params.id;
            const query ={_id:ObjectId(id)};
            const newQuery={$set:{status:'shipped'}}
            const result = await ordersCollection.updateOne(query, newQuery);
            console.log('load user with id :',id)
            res.json(result)
        })
          app.delete('/orders/:id',async(req,res)=>{
            const id=req.params.id;
            const query = {_id:ObjectId(id)};
            const result=await ordersCollection.deleteOne(query);
            res.json(result)
        })
        // usersCollection

        app.get('/users/:email',async(req,res)=>{
            const email=req.params.email;
            const query = {email:email};
            const user = await usersCollection.findOne(query);
            let isAdmin =false;
            if(user?.role==='admin'){
                isAdmin=true;
            }
            res.json({admin:isAdmin});
        })
        app.post('/users',async(req,res)=>{
          const user =req.body;
          const result =await usersCollection.insertOne(user);
          console.log(result);
          res.json(result)
        })
        app.put('/users',async(req,res)=>{
            const user =req.body;
            const filter = {email:user.email};
            const options={upsert:true};
            const updateDoc={$set:user};
            const result=await usersCollection.updateOne(filter,updateDoc,options)
            res.json(result)
        })
        
        app.put('/users/admin',async(req,res)=>{
            const user =req.body;
            const filter = {email:user.email};
            const updateDoc={$set:{role:'admin'}};
            const result=await usersCollection.updateOne(filter,updateDoc)
            res.json(result)
        })

        //reviewsCollection
        app.get('/cars',async(req,res)=>{
            const cursor = carsCollection.find({});
            const cars=await cursor.toArray();
            res.send(cars);
        })
        app.get('/reviews',async(req,res)=>{
            const cursor = reviewsCollection.find({});
            const reviews=await cursor.toArray();
            res.send(reviews);
        })
        app.post('/reviews',async(req,res)=>{
            const review =req.body;
            const result =await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello vehica server')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})