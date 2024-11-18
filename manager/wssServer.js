const dotenv = require('dotenv');

// load env variables
dotenv.config();

const WebSocket = require('ws');
const redis = require('redis');
const winston = require('winston');

const AI_QUEUE = 'ai_queue';
const NEW_AI_QUEUE = 'new_ai_queue';

// initialize the websocket server
const wss = new WebSocket.Server({ port: 8080 });

// intialize a redis client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
})

// connect to the redis client
redisClient.on('error', (err) => winston.error('Redis Client Error', err));
redisClient.connect().then(() => winston.info('Connected to Redis'));

// websocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message) => {
        console.log('Received message:', message);
        const payload = JSON.parse(message);

        sendAiResponses(ws);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// function to send all responses to client
async function sendAiResponses(ws) {
    try {
        const aiResponses = await redisClient.lRange(AI_QUEUE, 0, -1);
        
        if (aiResponses.length > 0) {
            ws.send(JSON.stringify(aiResponses));  // Send all user ai responses
            
            // remove sent ai responses from the queue
            for (let aiResponse of aiResponses) {
                await redisClient.lRem(AI_QUEUE, 0, aiResponse);
            }
        } else {
            ws.send(JSON.stringify({ error: 'No ai responses available' }));
        }
    } catch (error) {
        console.error('Error fetching ai responses from Redis:', error);
        ws.send(JSON.stringify({ error: 'Server error fetching ai responses' }));
    }
}

// this is a redis subscriber setup to listen for new ai responses
const redisSubscriber = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});
redisSubscriber.connect();
redisSubscriber.subscribe(NEW_AI_QUEUE, (message) => {
    const aiResponse = JSON.parse(message);
    console.log(aiResponse);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            sendAiResponses(client);
        }
    });
});
redisSubscriber.on('message', async (channel, message) => {
    if (channel === NEW_AI_QUEUE) {
        const aiResponse = JSON.parse(message);
        console.log(aiResponse);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                sendAiResponses(client);
            }
        });
    }
});

console.log('WebSocket server running on ws://localhost:8080');