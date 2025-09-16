# Retrieval Augmented Bioinformatics Software Tutorial Supporting Chatbot (RA-BSTS Chatbot)

## Contributors:

[@hannahkimincompbio](https://github.com/hannahkimincompbio) (maintainer)
[@Dwanky-y](https://www.github.com/Dwanky-y)
[@rahadarmannabid](https://github.com/rahadarmannabid)

## Installation (2025-09-15 version using Groq Client)

1. Clone the git repository

```
git clone https://github.com/Interdisciplinary-HCI/RA-BSTS.git
```

2. Install `Node.js` and `npm`

Follow instructions here: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

3. Install package requirements from `package-lock.json`

```
cd RA-BSTS
npm install
cd backend
npm install
```

4. Make an `.env` file containing `GROQ_API_KEY = "gsk_<your_api_key>"` in the `/backend` folder.

```
echo '\n*.env' >> .gitignore
echo 'GROQ_API_KEY = "gsk_..."' > ./backend/.env
```

5. Install `ollama` (https://github.com/ollama/ollama?tab=readme-ov-file) and pull three models. Read details here: https://ollama.com/library.

```
<ollama installed>
ollama pull mxbai-embed-large // 669 MB
```

<!-- ollama pull llama2:7b // 3.8 GB
ollama pull llama-guard3:8b // 4.9 GB -->

6. Install docker.

7. Install chromadb. https://v03.api.js.langchain.com/classes/_langchain_community.vectorstores_chroma.Chroma.html

```
npm install @langchain/community chromadb
```

8. Have FOUR tabs open in the terminal to observe each process.
<!-- Or just simply run `sh run.sh` after `cd RA-BSTS`. Make sure that docker is running in the background. -->

```
// 1. Chromadb tab: Make sure docker is running in the background before.
RA-BSTS/backend % docker run -p 8000:8000 -v /absolute/path/on/your/machine:/data ghcr.io/chroma-core/chroma:latest
```

<!-- docker run -p 8000:8000 -v /Users/Palindrome/Documents/project_gits/RA-BSTS/backend/chroma_data:/data ghcr.io/chroma-core/chroma:latest -->

```
// 2. ollama tab
RA-BSTS/backend % ollama serve
```

```
// 3. Backend tab
RA-BSTS/backend % node server.js
```

```
// 4. Frontend tab: Once you run this line, the web app can be viewed on the browser at 'http://localhost:5173/'
RA-BSTS % npm run dev
```
