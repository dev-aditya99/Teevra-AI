import express from "express"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import cors from "cors";
import "dotenv/config"
import geminiFirstAid from "./utils/geminiFirstAid.js";

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["POST", "GET"]
}));
// app.use(cors());
app.use(express.json());

// eleven labs 
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

app.post("/tts", async (req, res) => {
    const { text } = req.body;
    const geminiRes = await geminiFirstAid(text);
    const geminiParsedRes = JSON.parse(`${geminiRes.split('```json')[1].split('```')[0]}`);

    const audio = await elevenlabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
        text: geminiParsedRes.response,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128"
    });

    res.setHeader("Content-Type", "audio/mpeg");

    // directly pipe
    const reader = audio.getReader();
    const pump = async () => {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            res.write(value);
        }
        res.end();
    }

    pump();
});

app.listen(8787, () => console.log("server running"));
