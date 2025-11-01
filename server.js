const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const querystring = require("querystring");

const app = express();
const port = 8888;

const client_id = "1732f6ea9de34d09a9d1d7c1b0384b20";
const client_secret = "74057aa8e1fa48229032809d31ff8c28";
const redirect_uri = "http://localhost:8888/callback";

app.get("/callback", async (req, res) => {
    const code = req.query.code;

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

    res.send("Authorization successful! You can close this tab.");
    
    window.location.href = "http://localhost:8888/success";
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
