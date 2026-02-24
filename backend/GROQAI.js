const { ChatGroq } = require("@langchain/groq")

const { createVector, chromaSearch, readandChunkFile } = require("./CHROMA");
const { AIMessage } = require("@langchain/core/messages");

// Find a way to use the API key in a .env file
require("dotenv").config();

const GROQ = new ChatGroq({
    model: "llama-3.3-70b-versatile", //"llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b"
    temperature: .1, // the higher the number the more abstract the AI becomes. In our case we want it low because we are dealing with facts
    apiKey: process.env.GROQ_API_KEY
})

const GUARDRAIL = new ChatGroq({
    // "meta-llama/llama-guard-4-12b" will be deprecated on Groq as of 2026-03-05. It used to return things like "unsafe S9".

    // The alternative suggested by Groq (https://console.groq.com/docs/models) is "openai/gpt-oss-safeguard-20b", but that would mean replacing the model in our GROQ constant above because guardrailing is done inside the generator model. 
    // Instead of generating answers, it would simply return "I’m sorry, but I can’t share that."

    // Other options are "meta-llama/llama-prompt-guard-2-22m" and "meta-llama/llama-prompt-guard-2-86m". They can replace the model in the GUARDRAIL constant. They will return a number when safe or simply error out when unsafe.

    model: "meta-llama/llama-guard-4-12b", 
    temperature: .1, // the higher the number the more abstract the AI becomes. In our case we want it low because we are dealing with facts
    apiKey: process.env.GROQ_API_KEY
})

async function addChunkedFileToChroma() {
    const chunkedFile = await readandChunkFile("./documents/hyphy-i-hci-ver1.txt", 800, 50) // filePath, chunkSize, chunkOverlap
    createVector(await chunkedFile)
}

async function callWithRAGResult(chatHistory, context) {
    const promptTemplate =  `
                        Context: "${context.map((item) => `"${item.pageContent}", `)}" 
                        Question: ${chatHistory[chatHistory.length - 1].content}
                        Chat History: ${chatHistory.map((item) => `"${item.role}: ${item.content}", `)
                    }`
    
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
        return [true, "LikelyBenignForOurPurpose" + " (" + resultArray[1] + ")"];
        } else if (resultArray[1] === "S14"){ // S14: llama-guard Code Interpreter Abuse, so intended more for users' jailbreaking attempts, but it seems to be catching more general things.
        return [true, "LikelyBenignForOurPurpose" + " (" + resultArray[1] + ")"];
        } else {
            return [false, resultArray[0] + " (" + resultArray[1] + ")"];
        } 
    }
}

async function getGroqChatCompletion(chatHistory) {
    console.log("GRAQAI.js | User Prompt:::::::::::::::::::::::::::::::::::::: " , chatHistory[chatHistory.length - 1].content)

    // RAG is done here; does RAG whether user query is safe or not for development purposes, users will not see this.
    const context = await chromaSearch(chatHistory[chatHistory.length - 1].content, 3) // last user query content, top three relevant contexts
    console.log("GRAQAI.js | Retrieval Results: " , context) 

    // Guardrail
    const guard = await guardrailing(chatHistory[chatHistory.length - 1].content) // checks user QUERY for safety

    if (!guard[0]) {
        return { role: "assistant", content: "I'm sorry, but I can't assist with that request because " + guard[1] + "." };
    } else {
        // RAG updated prompt
        const updatedPrompt = await callWithRAGResult(chatHistory, context)
        // console.log("GRAQAI.js | Updated Prompt: ", updatedPrompt)

        // Groq AI response generated here
        const groqResponse = await GROQ.invoke(updatedPrompt);
        const groqGuard = await guardrailing(groqResponse.content); // checks AI response content for safety
        console.log("GRAQAI.js | Groq Response with RAG: ", groqResponse.content);
        // // Groq Response WITHOUT RAG but with guardrailing
        // const groqResponse = await GROQ.invoke(chatHistory);
        // const groqGuard = await guardrailing(groqResponse.content); // checks AI response content for safety
        // console.log("GRAQAI.js | Groq Response WITHOUT RAG: ", groqResponse.content);

        if (!groqGuard[0]) {
            return { role: "assistant", content: "I'm sorry, but I can't assist with that request because " + groqGuard[1] + "`." };
        } else {
            return groqResponse; // otherwise, return the AI response with both role AND content
        }
    } 

}

addChunkedFileToChroma();
module.exports = { getGroqChatCompletion };