import {useEffect, useState} from "react";
import './App.css';
import axios from 'axios';
import useAuth from "./useAuth";
import SpotifyWebApi from "spotify-web-api-node"

function codedump() {
    const CLIENT_ID = "a727d682cb234036b94074e2eff5b8ee"
    const CLIENT_SECRECT = "cfecc1a4e33c4f4790159e46737a2c4a"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"
    const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private user-top-read';

    const [token, setToken] = useState("")
    const [searchKey, setSearchKey] = useState("")
    const [artists, setArtists] = useState([])
    const [playlists, setPlayLists] = useState([])
    const [selectedPlayList, setSelectedPlayLists] = useState([])
    const [selectedTempo, setSelectedTempo] = useState([])
    const [alltracks, setAllTracks] = useState("")
    const access_token = useAuth(token);
    // const getToken = () => {
    //     let urlParams = new URLSearchParams(window.location.hash.replace("#","?"));
    //     let token = urlParams.get('access_token');
    // }

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        // getToken()


        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }

        setToken(token)

    }, [])

    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
    }

    const searchArtists = async (e) => {
        e.preventDefault()
        const {data} = await axios.get("https://api.spotify.com/v1/search", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                q: searchKey,
                type: "artist"
            }
        })

        setArtists(data.artists.items)
    }
    const allPlaylists = async (e) => {
        e.preventDefault()
        const {data} = await axios.get("https://api.spotify.com/v1/me/playlists", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
a
        setPlayLists(data.items);
    }
    const renderPlaylists = () => {
        return (
            playlists.map(playlist => (
            <div key={playlist.id}>
                <button onClick={()=>select(playlist)}>{playlist.name}</button>           
            </div>
        ))
        )
    }
    const select = (playlist) => {
        console.log(playlist.name);
        console.log(playlist.id);
        // setSelectedPlayLists(previousArray =>([...previousArray,playlist.name]))
        setSelectedPlayLists(playlist.id)
        
        console.log(playlist.name);
    }
    const Tempo = () => {
        console.log(selectedTempo);
        selectedPlaylistTracks();
    }
    const selectedPlaylistTracks = async () => {
        const {data} = await axios.get(`https://api.spotify.com/v1/playlists/${selectedPlayList}`, {
            headers: {
                Authorization: `Bearer ${token}}`
            }
        }).then((response)=>{
            console.log(response);
        })
            setAllTracks(data.data)
    }
    // const renderPlaylistTracks = () => {
    //     return (
    //         alltracks.map(track=> (
    //         <div key={track.id}>
    //             <p>{track.name}</p>          
    //         </div>
    //     ))
    //     )
    // }

    const renderArtists = () => {
        return( 
        artists.map(artist => (
            <div key={artist.id}>
                {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt=""/> : <div>No Image</div>}
                {artist.name}
            </div>
        ))
        )
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Spotify React</h1>
                {!token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scopes=${scope}`}>Login
                        to Spotify</a>
                    : <div><button onClick={logout}>Logout</button>
                    <button onClick={allPlaylists}>display allPlaylists</button>
                    {renderPlaylists()}
                    {selectedPlayList}
                    </div>}
                {playlists&&token&&selectedPlayList.length!=0? 
                    <form onSubmit={Tempo}>
                        <input type="number" onChange={e => setSelectedTempo(e.target.value)} placeholder="type in a tempo"/>
                        <button type={"submit"}>Filter</button>
                    </form>
                    
                   :token&&playlists.length!=0?<div>Please Select a playlist</div>:<div></div>
                }
                {/* {alltracks.length!=0?
                // <div>{renderPlaylistTracks}</div>:<div></div>
                     */}
                
              
               
            </header>
            
        </div>
    );
}

export default codedump;