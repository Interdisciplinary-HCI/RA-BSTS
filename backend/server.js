const express = require('express');
const cors = require('cors');
const { getGroqChatCompletion } = require('./GROQAI');
const app = express();
const port = 5001;
const fs = require('fs');

// Middleware
app.use(cors());
app.use(express.json());

// Initialization of chatHistory with a system prompt
let chatHistory = [
    {
        role: "system", // Admin
        content: "You are an AI chatbot named Retrieval-Augmented Bioinformatics Software Tutorial Supporting Chatbot, or RA-BSTS Chatbot.\
        You are an assistant for question-answering tasks.\
        You are helping users with questions related to the HyPhy software, which is a suite of bioinformatics software used for hypothesis testing using phylogenies.\
        If you do not know the answer, say 'I don't know'.\
        "
    },
]

let chatHistory4Log = chatHistory.slice();

let chatHistoryFileName = `chatlog_${new Date().toISOString().replace(/:/g, "_")}.json`;

// Endpoint to handle user messages and get AI responses
app.post('/Ai/:UserMessage', async (req, res) => {
    const userMessage = req.params.UserMessage // get user message from request
    chatHistory.push({ role:"user", content: userMessage}) // add user message to chat history
    chatHistory4Log.push({ role:"user", content: userMessage, date: new Date().toISOString()})
    try{
        const aiResponse = await getGroqChatCompletion(chatHistory) /////////////////////////////////////////////////
        // const aiTextResponse = aiResponse.content || "" // get the response from the AI

        // Formatting AI response to have line breaks for better readability
        const lineLength = 80; // max characters per line
        // Insert "\n" every 80 characters (you can adjust the number)
        const aiTextResponseRaw = aiResponse.content || ""
        const aiTextResponse = aiTextResponseRaw.replace(new RegExp(`(.{1,${lineLength}})(\\s+|$)`, 'g'),'$1\n');

        console.log(aiTextResponse);

        chatHistory.push({role: "assistant", content: aiTextResponse}) // adds ANY response to chat history
        // console.log("server.js | chatHistory: ", chatHistory)
        chatHistory4Log.push({ role:"assistant", content: aiTextResponse, date: new Date().toISOString()})
        res.send(aiTextResponse)
    } catch(error) {
        console.error("Error fetching AI response: ", error);
        res.status(500).send("Can't get AI response")
    }
    const jsonString = JSON.stringify(chatHistory4Log, null, 2); // Convert array to JSON string with indentation
    fs.writeFile(chatHistoryFileName, jsonString, (err) => {
        if (err) {
        console.error("Error writing chatHistory:", err);
        } else {
        console.log("Successfully wrote chatHistory ------------------------");
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});