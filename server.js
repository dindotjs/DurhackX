//npm init -y
//npm install cors
//npm.install express node-fetch
//node server.js
const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const querystring = require("querystring");
const path = require("path");
const app = express();
const port = 8888;

const client_id = "1732f6ea9de34d09a9d1d7c1b0384b20";
const client_secret = "74057aa8e1fa48229032809d31ff8c28";
const redirect_uri = "http://localhost:8888/callback";

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/callback", async (req, res) => {
    const code = req.query.code;
    
    if (!code) {
        return res.status(400).send("No code provided");
    }
    
    try {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64")
            },
            body: querystring.stringify({
                grant_type: "authorization_code",
                code,
                redirect_uri
            })
        });
        
        const data = await tokenResponse.json();
        console.log("Access Token Response:", data);
        
        res.send(`
            <script>
                if (window.opener) {
                    window.opener.postMessage(${JSON.stringify(data)}, 'http://localhost:8888');
                    window.close();
                } else {
                    document.body.innerHTML = '<h3>Authentication successful! You can close this window.</h3>';
                }
            </script>
        `);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Authentication failed");
    }
});

app.get("/top-artists", async (req, res) => {
    const accessToken = req.query.access_token;
    const timeRange = req.query.time_range || "medium_term";
    const limit = req.query.limit || 20;
    
    if (!accessToken) {
        return res.status(400).json({ error: "No access token provided" });
    }
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching top artists:", error);
        res.status(500).json({ error: "Failed to fetch top artists" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});