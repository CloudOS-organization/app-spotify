export default class SpotifyApi {

    constructor(accessToken) {
        this.accessToken = accessToken;
        this.spotifyApiUrl = 'https://api.spotify.com';
        this.addScript()
    }

    addScript() {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);        
    }

    async isAccessTokenValid() {
        const response = await fetch(`${this.spotifyApiUrl}/v1/me`, {
            method: 'GET', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
            }
        })
        const errorsMsg = await response.json();
        if (errorsMsg.error && errorsMsg?.error?.message === "Invalid access token") {
            console.log('New Token');
            return true;
        }
        return false;
    }

    async getAccountData() {
        const response = await fetch(`${this.spotifyApiUrl}/v1/me`, {
            method: 'GET', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
            }
        })
        return await response.json()
    }

    async putPlayerPlay(songId, deviceId) {
        if (deviceId.length > 0) {
            const trackBody = {
                "uris": [songId],
                "offset": {
                    "position": 0
                },
                "position_ms": 0
            }        
            const response = await fetch(`${this.spotifyApiUrl}/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.accessToken
                },
                body: JSON.stringify(trackBody)
            });
        }
    }

    async playPLaylist(playlistId, offset, deviceId) {
        if (deviceId.length > 0) {
            const trackBody = {
                "context_uri": playlistId,
                "offset": {
                    "position": offset,
                },
                "position_ms": 0
            }        
            const response = await fetch(`${this.spotifyApiUrl}/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.accessToken
                },
                body: JSON.stringify(trackBody)
            });
        }
    }

    async putPlayerRepeatMode(repeat_mode) {
        repeat_mode++;
        const searchParams = new URLSearchParams();
        if (repeat_mode === 1) {
            searchParams.append('state', 'context');  
        } else if (repeat_mode === 2) {
            searchParams.append('state', 'track');  
        } else if (repeat_mode === 3) {
            searchParams.append('state', 'off');  
        }
        const response = await fetch(`${this.spotifyApiUrl}/v1/me/player/repeat?${searchParams.toString()}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
            },
        });
    }

    async putPlayerShuffle(shuffle) {
        const searchParams = new URLSearchParams();
        if (!shuffle) {
            searchParams.append('state', 'true');  
        } else {
            searchParams.append('state', 'false');  
        }
        const response = await fetch(`${this.spotifyApiUrl}/v1/me/player/shuffle?${searchParams.toString()}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
            },
        });
    }

    async getPlaylists() {
        let offset=0
        let total=0
        let playlists = [];
        do {
            const response = await fetch(`${this.spotifyApiUrl}/v1/me/playlists?offset=${offset}&limit=20`, {
                method: 'GET', 
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.accessToken
                }
            })
            const responsePlaylists = await response.json()
            playlists = playlists.concat(responsePlaylists.items)
            offset = offset + responsePlaylists.limit; 
            console.log(offset)
            console.log(responsePlaylists)
            console.log(offset < total);
            total = responsePlaylists.total;
        } while (offset < total); 
        console.log(playlists.length)
        return playlists;
    }

    async getPlaylistsById(playlistId) {
        const response = await fetch(`${this.spotifyApiUrl}/v1/playlists/${playlistId}`, {
            method: 'GET', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
            }
        })
        return await response.json()
    } 

    async getSearchRequest(q) {
        const searchParams = new URLSearchParams();
        searchParams.append('q', q);
        searchParams.append('type', 'track,artist');
        const response = await fetch(`${this.spotifyApiUrl}/v1/search?${searchParams.toString()}`, {
            method: 'GET', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
            }
        })
        return await response.json()
    } 

    async geUserTopArtists() {
        const searchParams = new URLSearchParams();
        searchParams.append('time_range', 'medium_term');
        const response = await fetch(`${this.spotifyApiUrl}/v1/me/top/artists?${searchParams.toString()}`, {
            method: 'GET', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
            }
        })
        return await response.json()
    } 

    getTrackTimestamp(ms) {
        let s = ms / 1000;
        let secs = s % 60;
        s = (s - secs) / 60;
        let mins = s % 60;
        let hrs = (s - mins) / 60;
        if (hrs > 0) {
            return Math.floor(hrs) + ':' + Math.floor(mins) + ':' + (Math.floor(secs) < 9 ? `0${Math.floor(secs)}` : Math.floor(secs));
        } else {
            return  Math.floor(mins) + ':' + (Math.floor(secs) < 9 ? `0${Math.floor(secs)}` : Math.floor(secs));
        }
        
      }
}