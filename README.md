# Retrieval-Augmented Bioinformatics Software Tutorial Supporting Chatbot (RA-BSTS Chatbot)

_Last Updated: 2025-09-23 (using Groq Client)_

_Tested on: Apple M1 Pro 16GB Sequoia 15.7_

---

## Contributors

- [Hannah Kim](https://github.com/hannahkimincompbio) (maintainer)
- [Minh Doan](https://www.github.com/Dwanky-y)
- [Rahad Arman Nabid](https://github.com/rahadarmannabid)

## Table of Contents

- [**Installation**](#installation)
- [**Run RA-BSTS Chatbot on the Command Line**](#run-ra-bsts-chatbot-on-the-command-line)
- [**References**](#references)

---

## Installation

1. Clone the git repository.

```
git clone https://github.com/Interdisciplinary-HCI/RA-BSTS.git
```

**OR**

Download ZIP file and unzip the file.

![Download ZIP file](./Download%20Zip.png)

2. Install `Node.js` and `npm`. Follow instructions here: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

3. Install package requirements from `package-lock.json`.

```
cd RA-BSTS
npm install
cd backend
npm install
```

4. Obtain a _free_ API key from Groq (https://console.groq.com/keys). Keep this key somewhere safe. Make an `.env` file containing `GROQ_API_KEY = "gsk_<your_api_key>"` in the `/backend` folder.

```
echo 'GROQ_API_KEY = "gsk_<your_api_key>"' > ./backend/.env
```

5. Install `ollama` (https://github.com/ollama/ollama?tab=readme-ov-file) and pull the models as below. Read details here: https://ollama.com/library.

```
<ollama installed>
ollama pull mxbai-embed-large // 669 MB
```

<!-- ollama pull llama2:7b // 3.8 GB
ollama pull llama-guard3:8b // 4.9 GB -->

6. Install docker https://www.docker.com/get-started/.

---

## Run RA-BSTS Chatbot on the Command Line

Have FOUR tabs open in the terminal to observe each process.

<!-- Or just simply run `sh run.sh` after `cd RA-BSTS`. Make sure that docker is running in the background. -->

```
// 1. Chromadb tab: Make sure docker is running in the background before.
docker run -p 8000:8000 -v </absolute/path/on/your/machine>:/data ghcr.io/chroma-core/chroma:latest
```

- example:

```
docker run -p 8000:8000 -v /Users/Palindrome/Documents/project_gits/RA-BSTS/backend/chroma_data:/data ghcr.io/chroma-core/chroma:latest
```

```
// 2. ollama tab
ollama serve
```

```
// 3. Frontend tab: Once you run this line, the web app can be viewed on the browser at 'http://localhost:5173/'
cd RA-BSTS
npm run dev
```

```
// 4. Backend tab
cd backend
node server.js
```

<!-- node server.js > "pid_serverlog.log" -->

---

## References

- [BioGenie](https://github.com/Capstone-Projects-2025-Spring/project-003-bioinformatics-chatbot): BioInformatics Software Tutorial Chatbot S2025 Capstone Project
