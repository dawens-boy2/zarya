const { zaryaid } = require('./id'); 
const express = require('express');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");
const { Storage } = require("megajs");

const {
    default: ZaryaBot_V1_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

// Function to generate a random Mega ID
function randomMegaId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

// Upload credentials to Mega
async function uploadCredsToMega(credsPath) {
    try {
        const storage = await new Storage({
            email: 'nexusxd.bot@gmail.com',
            password: 'malvin266'
        }).ready;
        console.log('Mega storage initialized.');

        if (!fs.existsSync(credsPath)) throw new Error(`File not found: ${credsPath}`);

        const fileSize = fs.statSync(credsPath).size;
        const uploadResult = await storage.upload({
            name: `${randomMegaId()}.json`,
            size: fileSize
        }, fs.createReadStream(credsPath)).complete;

        const fileNode = storage.files[uploadResult.nodeId];
        const megaUrl = await fileNode.link();

        console.log(`Session successfully uploaded to Mega: ${megaUrl}`);
        return megaUrl;
    } catch (error) {
        console.error('Error uploading to Mega:', error);
        throw error;
    }
}

// Remove a file
function removeFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { recursive: true, force: true });
    }
}

// Route handler
router.get('/', async (req, res) => {
    const id = zaryaid(); 
    let num = req.query.number;

    async function ZaryaBotV1_Pair_Code() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);

        try {
            const ZaryaBotV1 = ZaryaBot_V1_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari")
            });

            if (!ZaryaBotV1.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await ZaryaBotV1.requestPairingCode(num);
                console.log(`Your Code: ${code}`);

                if (!res.headersSent) res.send({ code });
            }

            ZaryaBotV1.ev.on('creds.update', saveCreds);
            ZaryaBotV1.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(5000);
                    const filePath = `./temp/${id}/creds.json`;

                    if (!fs.existsSync(filePath)) return console.error("File not found:", filePath);

                    const megaUrl = await uploadCredsToMega(filePath);
                    const sid = megaUrl.includes("https://mega.nz/file/")
                        ? 'ZaryaBot-V1~' + megaUrl.split("https://mega.nz/file/")[1]
                        : 'Error: Invalid URL';

                    console.log(`Session ID: ${sid}`);
                    const session = await ZaryaBotV1.sendMessage(ZaryaBotV1.user.id, { text: sid });

                    const ZaryaBotV1_TEXT = `
🎉 *Welcome to ZaryaBot-V1!* 🚀  

🔒 *Your Session ID* is ready! ⚠️ _Keep it private and secure — don't share it with anyone._

🔑 *Copy & Paste the SESSION_ID Above*  
🛠️ Add it to your environment variable: *SESSION_ID*

💡 *What Next?*  
1️⃣ Explore all the cool features of ZaryaBot-V1.  
2️⃣ Stay updated with our latest releases and support.  
3️⃣ Enjoy seamless WhatsApp automation! 🤖  

🔗 *Join Our Support Channel:* 👉 [Click Here](https://whatsapp.com/channel/0029VbCHd5V1dAw132PB7M1B)  
⭐ *Show Some Love!* Give us a ⭐ on GitHub: 👉 [ZaryaBot-V1 Repo](https://github.com/dawens-boy2/ZaryaBot-V1/)  

🚀 _Thanks for choosing ZaryaBot-V1 — Let the automation begin!_ ✨`;

                    await ZaryaBotV1.sendMessage(ZaryaBotV1.user.id, { text: ZaryaBotV1_TEXT }, { quoted: session });

                    await delay(100);
                    await ZaryaBotV1.ws.close();
                    return removeFile(`./temp/${id}`);
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(10000);
                    ZaryaBotV1_Pair_Code();
                }
            });
        } catch (err) {
            console.error("Service Has Been Restarted:", err);
            removeFile(`./temp/${id}`);

            if (!res.headersSent) {
                res.send({ code: "Service is Currently Unavailable" });
            }
        }
    }

    await ZaryaBotV1_Pair_Code();
});

module.exports = router;