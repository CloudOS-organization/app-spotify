import {Window} from 'https://repo.cloudos.batchcloud.de/core/component/mod.js';
import {html , Type} from 'https://repo.cloudos.batchcloud.de/core/deps.js';
import SpotifyApi from './asset/lib/spotify.js';

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}


export default class Spotify extends Window {
    static name = 'spotify-app';

    static properties = {
        ...super.properties,
        //Spotify
        spotify: Type.object(null),
        spotifyLoginPopup: Type.object(),
        //Spotify Player
        spotifyPlayer: Type.object(null),
        spotifyPlayerSettings: Type.object({}),
        //Spotify Session
        spotifyAccount: Type.object(null),
        spotifyPlaylists: Type.object([]),
        spotifyTopArtists: Type.object(null),
        //Spotify Current Session
        spotifyCurrentTrack: Type.object(track),
        spotifyCurrentState: Type.object({}),
        spotifyCurrentPlaylist: Type.object(null),
        spotifyCurrentSearch: Type.object(null),
        //APP Interaction
        navigation: Type.string('home'),
        
        loading: Type.boolean(false),    
    };

    constructor() {
        super();
        this.storage.set('account', {"username": "cpbasti"})
        //this.storage.set('player', {'volume': 1,'deviceName': 'Batis Cloud Player'});
        this.main();
    }

    renderBody() {
        if (this.spotify && this.spotifyPlayer) {
            return html`
                <div class="spotify__container">
                    <div class="spotify__discover">

                        <div class="spotify__navigation navigation">
                            <div class="navigation__container">
                                <div class="navigation__item">
                                    <button @click=${() => this.logout()} class="navigation__item__button navigation__item__logo">
                                        ${this.spotifyAccount != null && this.spotifyAccount.images.length > 0 ? html`
                                            <img src="${this.spotifyAccount.images[0].url}" class="navigation__item__icon">
                                        ` : html`
                                            <img src="https://www.garvisor.com/frontend/images/empty-user-pic.png" class="navigation__item__icon">
                                        `} 
                                    </button>
                                </div>
                                <div class="navigation__item">
                                    <button @click=${() => {this.navigation = 'home'}} class="navigation__item__button ${this.navigation == 'home' ? 'navigation__item__button__selected' : ''}">
                                    <svg role="img" height="24" width="24" class="Svg-sc-1bi12j5-0 gSLhUO home-active-icon" viewBox="0 0 24 24"><path d="M21 22V7.174l-9.001-5.195L3 7.214V22h7v-7h4v7z"></path></svg>
                                    </button>
                                </div>
                                <div class="navigation__item">
                                    <button @click=${() => {this.navigation = 'search'}} class="navigation__item__button ${this.navigation == 'search' ? 'navigation__item__button__selected' : ''}">
                                    <svg role="img" height="24" width="24" class="Svg-sc-1bi12j5-0 gSLhUO search-active-icon" viewBox="0 0 24 24"><path d="M16.736 16.262A8.457 8.457 0 0019 10.5a8.5 8.5 0 10-3.779 7.067l4.424 5.18 1.521-1.299-4.43-5.186zM10.5 17C6.916 17 4 14.084 4 10.5S6.916 4 10.5 4 17 6.916 17 10.5 14.084 17 10.5 17z"></path></svg>
                                    </button>
                                </div>
                                <div class="navigation__item">
                                    <button @click=${() => {this.navigation = 'collection'; this.spotifyCurrentPlaylist = null}} class="navigation__item__button ${this.navigation == 'collection' ? 'navigation__item__button__selected' : ''}">
                                    <svg role="img" height="24" width="24" class="Svg-sc-1bi12j5-0 gSLhUO collection-active-icon" viewBox="0 0 24 24"><path d="M14.617 3.893l-1.827.814 7.797 17.513 1.827-.813-7.797-17.514zM3 22h2V4H3v18zm5 0h2V4H8v18z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="spotify__discover_view discover ${this.spotifyCurrentTrack.name ? 'discover__small': ''}">
                            <div class="discover__item discover__home ${this.navigation == 'home' ? '' : 'discover__disabled'}">
                                <div @click=${() => {this.navigation = 'liked'}}>
                                    Liked Songs
                                
                                </div>


                                <div class="discover__home__title">
                                     Top Artists von ${this.spotifyAccount != null && this.spotifyAccount.display_name}
                                </div>
                                <div class="discover__home__top__artists">
                                    ${this.spotifyTopArtists && this.spotifyTopArtists.items.map(item => {
                                        return html`
                                            <div class="discover__home__top__artists__item">
                                                <div>
                                                    <img src=${item.images?.[0].url}>
                                                </div>
                                                <div>
                                                    ${item.name}
                                                </div>
                                            </div>
                                        `;
                                    })}
                                </div>
                            </div>
                            <div class="discover__item discover__search ${this.navigation == 'search' ? '' : 'discover__disabled'}">
                                    search
                                    <input @change=${(e) => {this.searchTrackOrArtist(e)}}  type="text" placeholder="Suche...">
                                    ${this.spotifyCurrentSearch && this.spotifyCurrentSearch.tracks.items.map(track => {
                                        return html`
                                            <div @click=${() => this.playSongByUri(track.uri)} class="">
                                                
                                                ${track.name}
                                                
                                            </div>
                                        `;
                                    })}
                                    <br>
                                    <hr>
                                    <br>
                                    ${this.spotifyCurrentSearch && this.spotifyCurrentSearch.artists.items.map(artist => {
                                        return html`
                                            <div class="">
                                                
                                                ${artist.name}
                                                
                                            </div>
                                        `;
                                    })}
                            </div>
                            <div class="discover__item discover__search ${this.navigation == 'liked' ? '' : 'discover__disabled'}">
                                ${this.spotifyCurrentPlaylist?.tracks?.items?.map((item, index) => {
                                    return html`
                                        <div class="playlist__tracks__item">
                                            <div @click=${() => this.playSongByPLaylist(this.spotifyCurrentPlaylist.uri, index)} class="tracks__container" date-url="${item.track.uri}">
                                                <div class="tracks__container__name">
                                                    ${item.track.name}
                                                </div>
                                                <div class="tracks__container__artist">
                                                    ${item.track.artists.map(artist => {
                                                        return html`<a>${artist.name}</a>`;
                                                    })}
                                                </div>
                                                <div class="tracks__container__album-name">
                                                    ${item.track.album.name}
                                                </div>
                                                <div class="tracks__container__duration">
                                                    ${this.spotify.getTrackTimestamp(item.track.duration_ms)}
                                                </div>
                                                <div class="tracks__container__liked-song">
                                                    <svg role="img" height="16" width="16" viewBox="0 0 16 16" class="Svg-sc-1bi12j5-0 gSLhUO"><path d="M13.764 2.727a4.057 4.057 0 00-5.488-.253.558.558 0 01-.31.112.531.531 0 01-.311-.112 4.054 4.054 0 00-5.487.253A4.05 4.05 0 00.974 5.61c0 1.089.424 2.113 1.168 2.855l4.462 5.223a1.791 1.791 0 002.726 0l4.435-5.195A4.052 4.052 0 0014.96 5.61a4.057 4.057 0 00-1.196-2.883zm-.722 5.098L8.58 13.048c-.307.36-.921.36-1.228 0L2.864 7.797a3.072 3.072 0 01-.905-2.187c0-.826.321-1.603.905-2.187a3.091 3.091 0 012.191-.913 3.05 3.05 0 011.957.709c.041.036.408.351.954.351.531 0 .906-.31.94-.34a3.075 3.075 0 014.161.192 3.1 3.1 0 01-.025 4.403z"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                })}
                            </div>
                            <div class="discover__item discover__playlists ${this.navigation == 'collection' ? '' : 'discover__disabled'}">
                                ${this.spotifyCurrentPlaylist ? html`
                                <div class="playlist">
                                    <div class="playlist__container">
                                        <div class="playlist__information">
                                            <div class="playlist__information__cover">
                                                <img src=${this.spotifyCurrentPlaylist.images?.[0]?.url} class="playlist__item__cover" alt="" width="100px" />
                                            
                                            </div>
                                            <div class="playlist__information__meta">
                                                <div class="playlist__information__title">
                                                    ${this.spotifyCurrentPlaylist.name}
                                                </div>
                                                <div class="playlist__information__description">
                                                    ${this.spotifyCurrentPlaylist.description}
                                                </div>
                                                <div class="playlist__information__owner">
                                                    ${this.spotifyCurrentPlaylist.owner.display_name}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="playlist__tracks">
                                            ${this.spotifyCurrentPlaylist?.tracks?.items?.map((item, index) => {
                                                return html`
                                                    <div class="playlist__tracks__item">
                                                        <div @click=${() => this.playSongByPLaylist(this.spotifyCurrentPlaylist.uri, index)} class="tracks__container" date-url="${item.track.uri}">
                                                            <div class="tracks__container__name">
                                                                ${item.track.name}
                                                            </div>
                                                            <div class="tracks__container__artist">
                                                                ${item.track.artists.map(artist => {
                                                                    return html`<a>${artist.name}</a>`;
                                                                })}
                                                            </div>
                                                            <div class="tracks__container__album-name">
                                                                ${item.track.album.name}
                                                            </div>
                                                            <div class="tracks__container__duration">
                                                                ${this.spotify.getTrackTimestamp(item.track.duration_ms)}
                                                            </div>
                                                            <div class="tracks__container__liked-song">
                                                                <svg role="img" height="16" width="16" viewBox="0 0 16 16" class="Svg-sc-1bi12j5-0 gSLhUO"><path d="M13.764 2.727a4.057 4.057 0 00-5.488-.253.558.558 0 01-.31.112.531.531 0 01-.311-.112 4.054 4.054 0 00-5.487.253A4.05 4.05 0 00.974 5.61c0 1.089.424 2.113 1.168 2.855l4.462 5.223a1.791 1.791 0 002.726 0l4.435-5.195A4.052 4.052 0 0014.96 5.61a4.057 4.057 0 00-1.196-2.883zm-.722 5.098L8.58 13.048c-.307.36-.921.36-1.228 0L2.864 7.797a3.072 3.072 0 01-.905-2.187c0-.826.321-1.603.905-2.187a3.091 3.091 0 012.191-.913 3.05 3.05 0 011.957.709c.041.036.408.351.954.351.531 0 .906-.31.94-.34a3.075 3.075 0 014.161.192 3.1 3.1 0 01-.025 4.403z"></path></svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ` : html`  
                                <div class="playlists">
                                    <div class="playlists__title">
                                        <h1>Playlist</h1>
                                    </div>
                                    <div class="playlists__list">
                                    ${this.spotifyPlaylists.length > 0 && this.spotifyPlaylists.map(playlist => {
                                        return html`
                                            <div @click=${() => this.displayPlaylistTracks(playlist.id)} class="playlists__item" date-url="${playlist.id}">
                                                <div class="playlists__item__cover">
                                                    ${playlist.images?.[0]?.url ? html`
                                                        <img src=${playlist.images?.[0]?.url} class="playlists__item__cover_image" alt="" />
                                                    ` : html`
                                                        <div class="playlists__item__cover_image playlists__item__cover__empty">
                                                            <svg height="32" role="img" width="32" viewBox="-20 -25 100 100" class="Wgwf0V3pqGzonCGlL1EJ _kJ9S08_9ePBrXbUs9ri" aria-hidden="true" data-testid="card-image-fallback"><path d="M16 7.494v28.362A8.986 8.986 0 0 0 9 32.5c-4.962 0-9 4.038-9 9s4.038 9 9 9 9-4.038 9-9V9.113l30-6.378v27.031a8.983 8.983 0 0 0-7-3.356c-4.962 0-9 4.038-9 9 0 4.963 4.038 9 9 9s9-4.037 9-9V.266L16 7.494zM9 48.5c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7c0 3.859-3.141 7-7 7zm32-6.09c-3.86 0-7-3.14-7-7 0-3.859 3.14-7 7-7s7 3.141 7 7c0 3.861-3.141 7-7 7z" fill="currentColor" fill-rule="evenodd"></path></svg>
                                                        </div>
                                                    `}
                                                </div>
                                                <div class="playlists__item_meta">
                                                    <div class="playlists__item__title">
                                                        ${playlist.name}
                                                    </div>
                                                    <div class="playlists__item__owner">
                                                        Von ${playlist.owner.display_name}
                                                    </div>
                                                </div>    
                                            </div>
                                        `;
                                    })}
                                    </div>
                                </div>
                            `}
                            </div>

                        </div>

                    </div>
                    <div class="spotify__player player ${this.spotifyCurrentTrack.name ? "player__active": "player__disabled"}">
                        <div class="player__container">
                            <div class="player__wrapper">
                                <div class="player__track">
                                    <div class="player__track__cover">
                                        <img src=${this.spotifyCurrentTrack.album.images[0].url}>
                                    </div>
                                    <div class="player__track__meta">
                                        <div class="player__track__title">
                                            ${this.spotifyCurrentTrack.name}
                                        </div>
                                        <div class="player__track__artists">
                                            ${this.spotifyCurrentTrack.artists.map(artist => {
                                                return html`<a>${artist.name}</a>`;
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div class="player__controls">
                                    <div class="player__controls__button">
                                        <div>
                                            <button @click=${() => { this.changeShuffle() }} class="player__controls__button__shuffle ${this.spotifyCurrentState.shuffle > 0 ? '': 'player__controls__button__disabled'}">
                                                <svg role="img" height="16" width="16" viewBox="0 0 16 16" class="Svg-sc-1bi12j5-0 gSLhUO"><path d="M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z"></path></svg>
                                            </button>
                                        </div>
                                        <div>
                                            <button @click=${() => { this.spotifyPlayer.previousTrack() }}>
                                                <svg role="img" height="16" width="16" viewBox="0 0 16 16" class="Svg-sc-1bi12j5-0 gSLhUO"><path d="M13 2.5L5 7.119V3H3v10h2V8.881l8 4.619z"></path></svg>
                                            </button>
                                        </div>
                                        <div>
                                            <button @click=${() => { this.spotifyPlayer.togglePlay() }} class="play">
                                                ${ this.spotifyCurrentState.paused ? html`
                                                    <svg role="img" height="16" width="16" viewBox="0 0 16 16" class="Svg-sc-1bi12j5-0 gSLhUO"><path d="M4.018 14L14.41 8 4.018 2z"></path></svg>
                                                ` : html`
                                                    <svg role="img" height="16" width="16" viewBox="0 0 16 16" class="Svg-sc-1bi12j5-0 gSLhUO"><path fill="none" d="M0 0h16v16H0z"></path><path d="M3 2h3v12H3zm7 0h3v12h-3z"></path></svg>
                                                `}
                                            </button>
                                        </div>
                                        <div>
                                            <button @click=${() => { this.spotifyPlayer.nextTrack() }}>
                                                <svg role="img" height="16" width="16" viewBox="0 0 16 16" class="Svg-sc-1bi12j5-0 gSLhUO"><path d="M11 3v4.119L3 2.5v11l8-4.619V13h2V3z"></path></svg>
                                            </button>
                                        </div>
                                        <div>
                                            <button  @click=${() => { this.changeRepeatMode() }} class="player__controls__button__repeat-mode ${this.spotifyCurrentState.repeat_mode == 0 ? 'player__controls__button__disabled' : this.spotifyCurrentState.repeat_mode > 1 ? 'player__controls__button__repeat-mode__track': ''}">
                                                <svg role="img" height="16" width="16" viewBox="0 0 16 16" class="Svg-sc-1bi12j5-0 gSLhUO"><path d="M5.5 5H10v1.5l3.5-2-3.5-2V4H5.5C3 4 1 6 1 8.5c0 .6.1 1.2.4 1.8l.9-.5C2.1 9.4 2 9 2 8.5 2 6.6 3.6 5 5.5 5zm9.1 1.7l-.9.5c.2.4.3.8.3 1.3 0 1.9-1.6 3.5-3.5 3.5H6v-1.5l-3.5 2 3.5 2V13h4.5C13 13 15 11 15 8.5c0-.6-.1-1.2-.4-1.8z"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="player__controls__track">
                                        <input @change=${(e) => {this.changePlayerTrackPosition(e)}} type="range" min="0" max=${this.spotifyCurrentState.duration} value=${this.spotifyCurrentState.position} class="player__controls__track__range">
                                    </div>
                                </div>
                                <div class="player__stream">
                                    <input @change=${(e) => {this.changePlayerVolume(e)}} type="range" min="0" max="100" value=${this.spotifyPlayerSettings.volume} class="player__controls__volume__range">
                                </div>
                            </div>
                            <div class="player__party">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.loading) {
            const userId = 'cpbasti';
            const loginUrl = `https://api.cloudos.batchcloud.de/spotify/login?user=${userId}`;
            this.spotifyLoginPopup = window.open(loginUrl,'targetWindow','toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=400,height=700'); 
            return html`
                <div class="spotify__loading">
                    <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
                </div>
            `;
        } else {
            return html`
                <div class="spotify__login">
                    <div class="spotify__login__header">
                        <div class="spotify__login__logo">
                            <img src="https://repo.cloudos.batchcloud.de/spotify/asset/img/logo.png">
                        </div>
                    </div>
                    <div class="spotify__login__button">
                        <button @click=${() => {this.loading = true}}>Login</button>
                    </div>
                </div>
            `;
        }
    }
    
    main() { 
        this.account = this.storage.get('account')
        this.spotifyPlayerSettings = this.storage.ref('player');
        this.initializeSpotify();
        this.socket.on(`os:spotify:${this.account.username}`, (message) => {
            const spotifyAccountToken = JSON.parse(message);
            //console.log('Socket Message', message)
            this.storage.set('accountToken', spotifyAccountToken)
            this.initializeSpotify();
        })
    }

    close() {
        super.close();
        if (this.spotifyLoginPopup) {
            this.spotifyLoginPopup.close()
        }
        this.spotifyPlayer.disconnect();
    }

    logout() {
        this.spotify = null;
        this.spotifyPlayer.removeListener('ready');
        this.spotifyPlayer.disconnect()
        this.storage.remove('accountToken');
    }

    changePlayerVolume(e) {
        this.spotifyPlayer.setVolume((e.target.value / 100)).then(() => {
            this.spotifyPlayerSettings.volume = e.target.value;
        });
    }

    changePlayerTrackPosition(e) {
        this.spotifyPlayer.seek(e.target.value).then(() => {
            console.log('Changed position!');
        });
    }

    isAccessTokenExpire(spotifyAccountToken) {
        const expire_date = new Date(spotifyAccountToken.expire_date);
        const current_date = new Date();
        if (current_date.getTime() >= expire_date.getTime())  {
            return true;
        } else {
            return false;
        }
    }

    async initializeSpotify() {
        const spotifyAccountToken = this.storage.get('accountToken');
        if (spotifyAccountToken && this.spotify == null) {
            if (this.isAccessTokenExpire(spotifyAccountToken)) {
                this.socket.emit('os:spotify:refreshToken', this.account.username)
            } else {
                this.spotify = new SpotifyApi(spotifyAccountToken.access_token);
                this.getSpotifyPlayer(spotifyAccountToken.access_token)
                
                this.spotifyAccount = await this.spotify.getAccountData();
                this.spotifyPlaylists = await this.spotify.getPlaylists();
                this.spotifyTopArtists = await this.spotify.geUserTopArtists();
               
                this.loading = false;
            } 
        } 
    }

    async getSpotifyPlayer(access_token) {
        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: (this.spotifyPlayerSettings.deviceName ? this.spotifyPlayerSettings.deviceName : 'Cloud OS Player'),
                getOAuthToken: cb => { cb(access_token); },
                volume: (this.spotifyPlayerSettings.volume / 100)
            });
    
            player.addListener('ready', ({ device_id }) => {
                this.spotifyPlayerDeviceId = device_id;
                console.log('Ready with Device ID', device_id);
            });
    
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });
            
            player.addListener('player_state_changed', ( state => { 
                if (state) {
                    this.spotifyCurrentTrack = state.track_window.current_track;
                    this.spotifyCurrentState = state;
                
                    player.getCurrentState().then( state => { 
                        (!state)? this.active=false : this.active=true
                    });
    
                    player.getVolume().then(volume => {
                        this.spotifyPlayerSettings.volume = (volume * 100);
                    });

                    console.log('spotifyCurrentTrack', this.spotifyCurrentTrack)
                    console.log('spotifyCurrentState', this.spotifyCurrentState)
                }
            }));

            this.spotifyPlayer = player;
            player.connect();
        };
    }

    async displayPlaylistTracks(playlistId) {
        this.spotifyCurrentPlaylist = await this.spotify.getPlaylistsById(playlistId);
        console.log('spotifyCurrentPlaylist', this.spotifyCurrentPlaylist)
    }

    async searchTrackOrArtist(e) {
        this.spotifyCurrentSearch = await this.spotify.getSearchRequest(e.target.value)
        console.log('spotifyCurrentSearch', this.spotifyCurrentSearch)
    }

    async playSongByUri(trackUri) {
        const response = await this.spotify.putPlayerPlay(trackUri, this.spotifyPlayerDeviceId); 
    } 

    async playSongByPLaylist(playlistUri, offset) {
        const response = await this.spotify.playPLaylist(playlistUri, offset, this.spotifyPlayerDeviceId); 
    }

    async changeRepeatMode() {
        const response = await this.spotify.putPlayerRepeatMode((this.spotifyCurrentState.repeat_mode)); 
    }

    async changeShuffle() {
        const response = await this.spotify.putPlayerShuffle(this.spotifyCurrentState.shuffle); 
    }

}
