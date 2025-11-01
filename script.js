const client_id = "1732f6ea9de34d09a9d1d7c1b0384b20";
const client_secret = "74057aa8e1fa48229032809d31ff8c28";
function link_spotify(){
    var base_url = "https://accounts.spotify.com/authorize";
    var redirect_uri = "http://localhost:8888/callback";
    var scope = "user-top-read";
    var auth_url = base_url + "?response_type=code" +
                   "&client_id=" + encodeURIComponent(client_id) +
                   "&scope=" + encodeURIComponent(scope) +
                   "&redirect_uri=" + encodeURIComponent(redirect_uri);
    if (token) {
        auth_url += "&state=" + encodeURIComponent(token);
    }
    window.location.href = auth_url;


}
link_spotify();