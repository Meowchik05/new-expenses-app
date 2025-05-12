const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://sber:123@cluster0.wvbm5rc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const dbName = "myDatabase";
const collectionName = "expenses";

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    // API endpoints
    app.get('/api/expenses', async (req, res) => {
      try {
        const userId = req.query.userId;
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const expenses = await collection.find({ userId }).toArray();
        res.json(expenses);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ error: 'Failed to fetch expenses' });
      }
    });

    app.post('/api/expenses', async (req, res) => {
      try {
        const { userId } = req.body;
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const newExpense = {
          ...req.body,
          createdAt: new Date()
        };
        
        const result = await collection.insertOne(newExpense);
        const insertedExpense = {
          ...req.body,
          _id: result.insertedId
        };
        
        res.status(201).json(insertedExpense);
      } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).json({ error: 'Failed to add expense' });
      }
    });

    app.patch('/api/expenses/:id/amount', async (req, res) => {
      try {
        const { id } = req.params;
        const { userId, value } = req.body;

      if (!userId || !id || id === 'undefined' || value === undefined) {
        return res.status(400).json({ 
          error: 'Invalid request',
          details: `Required fields: userId, id, value`
      });
    }

    // Находим документ по id и userId
      const document = await collection.findOne({
        $or: [
         { id: Number(id) },
          { id: id }
        ],
        userId
      });

      if (!document) {
        return res.status(404).json({
          error: 'Document not found',
          details: `No match for id=${id} (userId=${userId})`
      });
    }

    // Обновляем сумму (увеличиваем на value)
    const result = await collection.updateOne(
      { _id: document._id },
      { $inc: { amount: Number(value) } }
    );

    // Возвращаем обновленный документ
    const updatedDocument = await collection.findOne({ _id: document._id });
    
    res.json({
      success: true,
      updatedExpense: updatedDocument
    });
  } catch (err) {
    console.error('PATCH Error:', err);
    res.status(500).json({ 
      error: 'Database operation failed',
      details: err.message 
    });
  }
});

    app.delete('/api/expenses/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { userId } = req.query;
    
        // Жёсткая валидация параметров
        if (!userId || !id || id === 'undefined') {
          return res.status(400).json({ 
            error: 'Invalid request',
            details: `Received: id=${id}, userId=${userId}`
          });
        }
    
        // Ищем документ независимо от типа ID
        const document = await collection.findOne({
          $or: [
            { id: Number(id) }, // Проверяем как число
            { id: id }          // Проверяем как строку
          ],
          userId
        });
    
        if (!document) {
          return res.status(404).json({
            error: 'Document not found',
            details: `No match for id=${id} (userId=${userId})`
          });
        }
    
        // Удаляем по _id из MongoDB для гарантии
        const result = await collection.deleteOne({ 
          _id: document._id 
        });
    
        res.json({ 
          success: true,
          deletedId: document.id
        });
      } catch (err) {
        console.error('DELETE Error:', err);
        res.status(500).json({ 
          error: 'Database operation failed',
          details: err.message 
        });
      }
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

run();