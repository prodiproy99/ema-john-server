const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a30od.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }); 
 
async function run() {
    try {
    
      await client.connect();
      const productCollection = client.db('emajohn').collection('product')

     app.get('/product', async(req, res) =>{
         console.log('query', req.query);
         const page = parseInt(req.query.page)
         const size = parseInt(req.query.size)
         const query = {}
         const cursor = productCollection.find(query)
         let products;
         if(page || size){
             // 0---> skip: 0 get: 0-10(10)
             // 1---> skip: 1*10 get: 11-20(10)
             // 2---> skip: 2*10 get: 21-30(10)
            products = await cursor.skip(page*size).limit(size).toArray()
            
        }
        else{
             products = await cursor.toArray()

         }
         res.send(products)
     })

     app.get('/productCount', async(req, res)=>{
         const count = await productCollection.estimatedDocumentCount()
         res.send({count})
     })
    //  use post to get product by ids
    app.post('/productBykeys', async(req, res) =>{ 
        const keys = req.body;
        const ids = keys.map(id => ObjectId(id))
        const query = {_id: {$in: ids}}
        const cursor = productCollection.find(query)
        const products = await cursor.toArray()
        res.send(products)
        console.log(keys);
    })

    } finally { 
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('ema running waiting for john')
})
app.listen(port, () => {
    console.log('ema is running port', port);
})