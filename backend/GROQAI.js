const { ChatGroq } = require("@langchain/groq")

const { createVector, chromaSearch, readandChunkFile } = require("./CHROMA")

// Find a way to use the API key in a .env file
require("dotenv").config();

const GROQ = new ChatGroq({
    model: "llama-3.1-8b-instant", // "llama3-8b-8192" < deprecated
    temperature: .1, // the higher the number the more abstract the AI becomes. In our case we want it low because we are dealing with facts
    apiKey: process.env.GROQ_API_KEY
})

async function addChunkedFileToChroma() {
    const chunkedFile = await readandChunkFile("./documents/hyphy-i-hci-ver1.txt", 800, 50) // filePath, chunkSize, chunkOverlap
    createVector(await chunkedFile)
}

async function callWithRAGResult(chatHistory, context) {
    const promptTemplate =  `Please answer the question with the given context if applicable to the question. \
                            If the context does not help in answering the question, please start your response with "Because this is not relevant to our main topic,".
                        Context: "${context.map((item) => `"${item.pageContent}", `)}" 
                        Question: ${chatHistory[chatHistory.length - 1].content}
                        Chat History: ${chatHistory.map((item) => `"${item.role}: ${item.content}", `)}`

    
    return promptTemplate
}

async function getGroqChatCompletion(chatHistory) {
    // RAG is done here
    const context = await chromaSearch(chatHistory[chatHistory.length - 1].content, 3) // last user query content, top three relevant contexts
    console.log("GRAQAI.js | User Prompt::::::::::::::::::: " , chatHistory[chatHistory.length - 1].content)
    console.log("GRAQAI.js | Results: " , context) 

    const updatedPrompt = await callWithRAGResult(chatHistory, context)
    // console.log("GRAQAI.js | Updated Prompt: ", updatedPrompt)

    // Groq AI response generated here
    return GROQ.invoke(updatedPrompt) 
}

addChunkedFileToChroma();
module.exports = { getGroqChatCompletion };