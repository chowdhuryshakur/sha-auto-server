const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p2ptn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('shop');
        const carsCollection = database.collection('cars');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');

        //cars APIs
        // GET API
        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        });
        // GET 
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const car = await carsCollection.findOne(query);
            res.json(car);
        })
        // POST API
        app.post('/cars', async (req, res) => {
            const offer = req.body;
            const result = await carsCollection.insertOne(offer);
            res.json(result)
        });
        //delete
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.deleteOne(query);
            res.json(result);
        })

        //reviews APIs
        // GET API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        // POST API
        app.post('/reviews', async (req, res) => {
            const offer = req.body;
            const result = await reviewsCollection.insertOne(offer);
            res.json(result)
        });

        //user APIs
        //isAdmin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //post
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        //update
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        //make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.findOneAndUpdate(filter, updateDoc, {
                upsert: true
            });
            res.json(result);
        })

        // orders APIs
        //post
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result)
        });
        //get
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { user_mail: email };
            const cursor = await ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })
        //get
        app.get('/orders', async (req, res) => {
            const cursor = await ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })
        //put
        app.put('/orders/:id', (req, res) => {
            const id = req.params.id;
            const result = ordersCollection.findOneAndUpdate(
                { _id: ObjectId(id) },
                {
                    $set: {
                        status: req.body.status
                    }
                },
                {
                    upsert: true
                }
            );
            res.json(result);
        })
        //DELETE
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);

        })
    } finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})