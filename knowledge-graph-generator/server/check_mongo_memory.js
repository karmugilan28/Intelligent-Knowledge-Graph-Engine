import { MongoMemoryServer } from 'mongodb-memory-server';

async function test() {
  try {
    console.log("Attempting to spin up MongoMemoryServer (version 4.4.29)...");
    const mongod = await MongoMemoryServer.create({
      binary: {
        version: '4.4.29'
      }
    });
    console.log("In-Memory MongoDB Server started successfully!");
    console.log("URI:", mongod.getUri());
    await mongod.stop();
    console.log("Stopped successfully!");
  } catch (err) {
    console.error("Failed to start MongoMemoryServer:", err);
  }
}

test();
