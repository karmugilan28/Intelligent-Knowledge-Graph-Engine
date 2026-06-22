import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LearningGraph from './src/models/learningGraph.model.js';
import connectDB from './src/config/db.js';

dotenv.config();

const check = async () => {
  // Connect to the DB (it will connect to our running local memory DB fallback because MONGODB_URI isn't running)
  // Wait, the running server is using MongoMemoryServer on a random port!
  // How can we connect to the running MongoMemoryServer?
  // Let's check the server logs for the URI!
  // In the server logs: "In-Memory MongoDB Server started on: mongodb://127.0.0.1:62884/"
  // So we can connect to that URI directly!
  
  const memoryUri = 'mongodb://127.0.0.1:62884/';
  console.log(`Connecting to: ${memoryUri}`);
  
  try {
    await mongoose.connect(memoryUri);
    console.log('Connected to fallback database.');
    
    const graphs = await LearningGraph.find({});
    console.log(`Found ${graphs.length} graphs.`);
    
    for (const g of graphs) {
      console.log(`Graph Document ID: ${g.documentId}`);
      console.log('Nodes:');
      g.nodes.forEach(n => {
        console.log(`  - ID: "${n.id}", Position: x=${n.position.x}, y=${n.position.y}`);
      });
      console.log('Edges:');
      g.edges.forEach(e => {
        console.log(`  - Source: "${e.source}", Target: "${e.target}", Label: "${e.label}"`);
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
};

check();
