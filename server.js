require("dotenv").config();
const express = require("express");
const cors = require("cors");
const lyricsFinder = require("lyrics-finder");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3001;

app.get('/lyrics', async (req, res) => {
  const { artist, track } = res.query;
  const lyrics = (await lyricsFinder(artist, track)) || 'error, no lyrics found';
  res.json({ lyrics })
});

app.post("/login", async (req, res) => {
  const { code } = req.body
  const spotifyAPI = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  })
  try {
    const {
      body: { access_token, refresh_token, expires_in },
    } = await spotifyAPI.authorizationCodeGrant(code)

    res.json({ access_token, refresh_token, expires_in })
  } catch (e) {
    console.log(e, 'error inside of /login')
  }
})

app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  const spotifyAPI = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  })
  try {
    const {
      body: { access_token, expires_in },
    } = await spotifyAPI.refreshAccessToken()
    res.json({ access_token, expires_in })
  } catch (e) {
    console.log(e, 'error inside of /refresh');
  }
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));