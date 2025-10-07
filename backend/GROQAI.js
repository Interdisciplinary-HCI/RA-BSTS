const { ChatGroq } = require("@langchain/groq")

const { createVector, chromaSearch, readandChunkFile } = require("./CHROMA");
const { AIMessage } = require("@langchain/core/messages");

// Find a way to use the API key in a .env file
require("dotenv").config();

const GROQ = new ChatGroq({
    model: "llama-3.3-70b-versatile", 
    temperature: .1, // the higher the number the more abstract the AI becomes. In our case we want it low because we are dealing with facts
    apiKey: process.env.GROQ_API_KEY
})

const GUARDRAIL = new ChatGroq({
    model: "meta-llama/llama-guard-4-12b", 
    temperature: .1, // the higher the number the more abstract the AI becomes. In our case we want it low because we are dealing with facts
    apiKey: process.env.GROQ_API_KEY
})

async function addChunkedFileToChroma() {
    const chunkedFile = await readandChunkFile("./documents/hyphy-i-hci-ver1.txt", 800, 50) // filePath, chunkSize, chunkOverlap
    createVector(await chunkedFile)
}

async function callWithRAGResult(chatHistory, context) {
    const promptTemplate =  `Please answer the question with the given context if applicable to the question. \
                            If the context does not help in answering the question, \
                            please start your response with \
                            "I am a RA-BSTS chatbot. This is not very relevant to our main topic...".
                        Context: "${context.map((item) => `"${item.pageContent}", `)}" 
                        Question: ${chatHistory[chatHistory.length - 1].content}
                        Chat History: ${chatHistory.map((item) => `"${item.role}: ${item.content}", `)}`

    
    return promptTemplate
}

async function guardrailing(queryOrResponse) {
    const AIMessage = await GUARDRAIL.invoke(queryOrResponse);
    const result = AIMessage.content;
    console.log("GRAQAI.js | Guard Result: ", result);
    if (result === "safe") {
        return [true, result];
    } else {
        const resultArray = result.split('\n');
        if (resultArray[1] === "S9"){ // S9: llama-guard Indiscriminate Weapons, when I just asked about the task scenario.
        return [true, resultArray[1]];
        } else if (resultArray[1] === "S14"){ // S14: llama-guard Code Interpreter Abuse, so intended more for users' jailbreaking attempts, but it seems to be catching more general things.
        return [true, resultArray[1]];
        } else {
            return [false, resultArray[1]];
        } 
    }
}

async function getGroqChatCompletion(chatHistory) {
    // RAG is done here
    const context = await chromaSearch(chatHistory[chatHistory.length - 1].content, 3) // last user query content, top three relevant contexts
    // console.log("GRAQAI.js | User Prompt::::::::::::::::::: " , chatHistory[chatHistory.length - 1].content)
    console.log("GRAQAI.js | Retrieval Results: " , context) 

    // Llama-Guard4
    const guardResult = await guardrailing(chatHistory[chatHistory.length - 1].content) // checks user query for safety

    if (!guardResult[0]) {
        return { role: "assistant", content: "I'm sorry, but I can't assist with that request." + " " + guardResult[0] + " " + guardResult[1] };
    } else {
        // RAG updated prompt
        const updatedPrompt = await callWithRAGResult(chatHistory, context)
        // console.log("GRAQAI.js | Updated Prompt: ", updatedPrompt)

        // Groq AI response generated here
        const groqResponse = await GROQ.invoke(updatedPrompt);
        // console.log("GRAQAI.js | Groq Response: ", groqResponse);
        const groqGuardResponse = await guardrailing(groqResponse.content); // checks AI response content for safety
        if (!groqGuardResponse[0]) {
            return { role: "assistant", content: "I'm sorry, but I can't assist with that request." + " " + guardResult[0] + " " + guardResult[1] };
        } else {
            return groqResponse; // otherwise, return the AI response with both role AND content
        }
    } 
}

addChunkedFileToChroma();
module.exports = { getGroqChatCompletion };