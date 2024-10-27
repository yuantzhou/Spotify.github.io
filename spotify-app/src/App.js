import {useEffect, useState} from "react";
import './App.css';
import axios from 'axios';


function App() {
    const CLIENT_ID = "a727d682cb234036b94074e2eff5b8ee"
    const CLIENT_SECRECT = "cfecc1a4e33c4f4790159e46737a2c4a"
    const REDIRECT_URI = "https://yuantzhou.github.io/Spotify.github.io/"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"
    const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private user-top-read';

    const [token, setToken] = useState("")
    const [playlists, setPlayLists] = useState([])
    const [minTempo, setSelectedMINTempo] = useState(0)
    const [maxTempo, setSelectedMAXTempo] = useState(0)
    const [alltracks, setAllTracks] = useState([])
    const [tracksTempo, setTracksTempo]= useState([])
    const [User, setUser]= useState([])
    const [resMessage, setResMessage]= useState("")
    const [fun,setFun] = useState("")
    const [feature,setFeature] = useState("")
    const [top,setTop]= useState("")
    const [tracksFeature, setTracksFeature]= useState([])
    const [tracksFilterFeature, setTracksFilterFeature]= useState([])
    const [selectedPlaylist,setSelectedPlayList] = useState("");
    const [suggestions,setSuggestions] = useState([]);
    const [numberOfSuggestions, setNumofSuggestions]= useState("");
    const [working, setWorkingPlayList] = useState([])
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

    const setProfile = async () => {
        const profileData =  await axios.get( `https://api.spotify.com/v1/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setUser(profileData.data)
    }
    const allPlaylists = async () => {
        const {data} = await axios.get("https://api.spotify.com/v1/me/playlists?limit=50", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        setPlayLists(data.items);
    }
    if(User.length==0&& token){
        setProfile();
        allPlaylists();
    }
    const sortTempohigh=(a,b)=>{
        if ( a.tempo < b.tempo){
            return 1;
          }
          if ( a.tempo> b.tempo){
            return -1;
          }
          return 0;
    }
    const logout = () => {
        setToken("")
        window.localStorage.removeItem("token")
      
    }
    const renderProfilePicture= ()=>{
       if(User.length!=0){ return(
                <div >
                    <img className="img-circle" src={User.images[0].url} width="75%" height="75%"/>         
                </div>
        )}
    }
    const cap = ( string)=>{
        return string.charAt(0).toUpperCase()+string.slice(1);
    }
    const renderPlaylists = () => {
        return (
            playlists.map(playlist => (
            <li key={playlist.id} >
                <button onClick={()=>Select(playlist)} className={playlist.name==selectedPlaylist? "btn btn-success":"btn normal"}>{cap(playlist.name)}</button>           
            </li>
        ))
        )
    }
    const Select = async (playlist) => {
        console.log(playlist.name);
        console.log(playlist.id);
        setSelectedPlayList(playlist.name)
        selectedPlaylistTracks(playlist.id);
        setTracksTempo([]);
        setTracksFeature([])
        
        console.log(playlist.name);
    }
    
   
    const Tempo = async() => {
        setTracksFeature([])
        setTracksTempo([]);
        if(tracksTempo.length==0){
            for(let t of alltracks){
           addTracksTempo(t);
       }
       setTracksTempo( tracksTempo.sort(sortTempohigh))
    }
    else{
        setTracksTempo([]);
        for(let t of alltracks){
            addTracksTempo(t);
        }
    }
    }
    const selectedPlaylistTracks = async (thePlayList) => {
        const {data} = await axios.get(`https://api.spotify.com/v1/playlists/${thePlayList}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            setAllTracks(data.tracks.items);

    }
 
    const addTracksTempo = async (Track) => {
        const data = await axios.get(`https://api.spotify.com/v1/audio-features/${Track.track.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if(data.data.tempo>=minTempo && data.data.tempo<=maxTempo){ 
        setTracksTempo(previousArray =>([...previousArray,data.data]))}
    }
    const renderPlaylistTracks = () => {
     
        return (
            alltracks.map(tck=> (
                // <div key={temp.id} className="featureCell">
                //             <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                //             <div className="pDetail">{temp.acousticness}</div>          
                //         </div>
            <div key={tck.track.id} className="featureCell">
                <div className="pName">{tck.track.name}</div>
                <div className="pDetail">{tck.track.artists[0].name}</div>          
            </div>
        ))
        )
    }
    const renderPlaylistTempos = () => {
        return (
            tracksTempo.map(temp=> (
                <div key={temp.id} className="featureCell">
                <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                <div className="pDetail">{temp.tempo}</div>   
                </div>
        ))
        )
    }
    const renderNewFilterList = () => {
        
       if(tracksTempo.length>0 && fun=="Tempo"){
           return(<div className="generate"><button onClick={postNewTempoPlaylist} >Generate Playlist</button></div>)
       }
       if(tracksFeature.length>0 && fun== "Optimized"){
        return(<div className="generate"><button onClick={postNewFeaturePlaylist} >Generate Playlist</button></div>)
    }
        if(suggestions.length>0 && fun=="Suggestions"){
        return(<div className="generate"><button onClick={postNewSuggestionPlaylist} >Generate Playlist</button></div>)
    }
                
    }
    const getUserID= async () => {return new Promise(async resolve=>{
        const profileData = await axios.get( `https://api.spotify.com/v1/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        resolve(profileData.data.id)
    })
    }
    const newPlaylist= async (UserID) => {return new Promise(async resolve=>{
        const body = { 
        name: `Tempoify-${fun} of ${selectedPlaylist}`,
        description: `This playlist is generated by Tempoify using the ${fun} feature based on ${selectedPlaylist}`,
        public: true };
        const headers={
            Authorization: `Bearer ${token}`
        }
        const response =  await axios.post(`https://api.spotify.com/v1/users/${UserID}/playlists`, body,{headers});
        
        resolve(response.data.id)
    }
        )
        
    }
    const postNewFeaturePlaylist = async() => {
            setResMessage(555)
        let userID= await getUserID();
        let landingID= await newPlaylist(userID);
        let uris ="";
        if(tracksFilterFeature.length!=0){
            for(let u of tracksFilterFeature){
                uris+=u.uri+",";
            } 
        }else{
            for(let u of tracksFeature){
                uris+=u.uri+",";
            } 
        }
    
     addUrisToPlayList(uris,landingID);
    }
    const postNewSuggestionPlaylist = async() => {
            setResMessage(555)
        let userID= await getUserID();
        let landingID= await newPlaylist(userID);
        let uris ="";
     for(let u of suggestions){
         uris+=u.uri+",";
     } 
     addUrisToPlayList(uris,landingID);
    }
    const postNewTempoPlaylist = async() => {
            setResMessage(555)
        let userID= await getUserID();
        let landingID= await newPlaylist(userID);
        let uris ="";
     for(let u of tracksTempo){
         uris+=u.uri+",";
     } 
     addUrisToPlayList(uris,landingID);
    }
    const addUrisToPlayList= async (uris,landingID) => {    
      
        const headers={
                Authorization: `Bearer ${token}`
            }
            try {const response = await axios.post(`https://api.spotify.com/v1/playlists/${landingID}/tracks?uris=${uris}`,"",{headers});
            setResMessage(response.request.status);
        }catch (error) {
            setResMessage(error.response);
    }
    }
    const renderResponse = ()=>{
        if(resMessage){
            if(resMessage == 201){
            return(<div className="fadeout"> Playlist Generated!</div>)
        }
        if(resMessage == 555){
            return(<div></div>)
        }
        else{
            return(<div className="fadeOut"> Something Went Wrong!</div>)
        }
        }
    }
    const changeFun = async (e) => {
        setFun(e);
        setTracksTempo([]);
        setTracksFeature([]);
        setTracksFilterFeature([]);
        setSuggestions([])
    
        
        
    }
    const changeSuggestion = async (e) => {
        setFun(e);
        setTracksTempo([]);
        setTracksFeature([]);
        setTracksFilterFeature([]);
        setSuggestions([]);
        for(let t of alltracks){
            addTrackOP(t);
        }
        
    }
    const setBothTempo =(e)=>{
         setSelectedMINTempo(e);
         setSelectedMAXTempo(e*1+10)
    }
    const displayFeature = async(feature)=>{
        setFeature(feature)
       for(let t of alltracks){
        addTrackOP(t);
    }
   }
   
   const addTrackOP = async (Track) => { 
    if(tracksFeature.length<alltracks.length){   
    const data = await axios.get(`https://api.spotify.com/v1/audio-features/${Track.track.id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    setTracksFeature(previousArray =>([...previousArray,data.data]))
}
    }
   
    const renderPlaylistFeature = () => {
        switch(feature){
        case "Acousticness":
            if(tracksFilterFeature.length!=0){
                return(
                    tracksFilterFeature.map(temp=> (
                        <div key={temp.id} className="featureCell">
                            <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                            <div className="pDetail">{temp.acousticness}</div>          
                        </div>
                    ))
                )
            }
            return (
            tracksFeature.map(temp=> (
                <div key={temp.id} className="featureCell">
                <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                <div className="pDetail">{temp.acousticness}</div>          
            </div>
        ))
        )
        case "Danceability":
            if(tracksFilterFeature.length!=0){
                return(
                    tracksFilterFeature.map(temp=> (
                        <div key={temp.id} className="featureCell">
                <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                <div className="pDetail">{temp.danceability}</div>   
                </div>
                    ))
                )
            }
            return (
                tracksFeature.map(temp=> (
                    <div key={temp.id} className="featureCell">
                    <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                    <div className="pDetail">{temp.danceability}</div>   
                    </div>
            ))
            )
        case "Energy":
            if(tracksFilterFeature.length!=0){
                return(
                    tracksFilterFeature.map(temp=> (
                        <div key={temp.id} className="featureCell">
                <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                <div className="pDetail">{temp.energy}</div>   
                </div>
                    ))
                )
            }
            return (
                    tracksFeature.map(temp=> (
                        <div key={temp.id} className="featureCell">
                        <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                        <div className="pDetail">{temp.energy}</div>   
                        </div>
                ))
                )
        case "Instrumentalness":
            if(tracksFilterFeature.length!=0){
                return(
                    tracksFilterFeature.map(temp=> (
                        <div key={temp.id} className="featureCell">
                <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                <div className="pDetail">{temp.instrumentalness}</div>   
                </div>
                    ))
                )
            }
            return (
                        tracksFeature.map(temp=> (
                            <div key={temp.id} className="featureCell">
                            <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                            <div className="pDetail">{temp.instrumentalness}</div>   
                            </div>
                    ))
                    )
        case "Speechiness":
            if(tracksFilterFeature.length!=0){
                return(
                    tracksFilterFeature.map(temp=> (
                        <div key={temp.id} className="featureCell">
                        <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                        <div className="pDetail">{temp.speechiness}</div>   
                        </div>
                    ))
                )
            }
                    return (
                        tracksFeature.map(temp=> (
                            <div key={temp.id} className="featureCell">
                            <div className="pName">{alltracks.find(elem =>elem.track.id==temp.id).track.name}</div>
                            <div className="pDetail">{temp.speechiness}</div>   
                            </div>
                    ))
                    )
    }
    }
    const getAcousticnessAvg = async (fAvg) => {    
        
         tracksFeature.map(to => (to.avgDiff=Math.abs(to.acousticness-fAvg)))
        
    }
    const getEnergyAvg = async (fAvg) => {    
        tracksFeature.map(to => (to.avgDiff=Math.abs(to.energy-fAvg)))
    }
    const getDanceAvg = async (fAvg) => {    
         tracksFeature.map(to => (to.avgDiff=Math.abs(to.danceability-fAvg)))
    }
    const getInstrumentAvg = async (fAvg) => {    
         tracksFeature.map(to => (to.avgDiff=Math.abs(to.instrumentalness-fAvg)))
    }
    const getSpeechAvg = async (fAvg) => {    
         tracksFeature.map(to => (to.avgDiff=Math.abs(to.speechiness-fAvg)))
    }
    function compareAvgDiff( a, b )
  {
  if ( a.avgDiff < b.avgDiff){
    return -1;
  }
  if ( a.avgDiff > b.avgDiff){
    return 1;
  }
  return 0;
}
const getSuggestions = async () => { 
    // sendSeeds();
    let tSum=0;
    for(let t of tracksFeature){
    tSum = tSum+t.danceability+t.acousticness+t.instrumentalness+t.energy+t.speechiness
    }
    let tAvg= tSum/tracksFeature.length;
    tracksFeature.map(to => (to.allFeaturePoints= to.danceability+to.acousticness+to.instrumentalness+to.energy+to.speechiness));
    tracksFeature.map(to2 => (to2.avgDiff=Math.abs(to2.allFeaturePoints-tAvg)))
    tracksFeature.sort(compareAvgDiff)
    sendSeeds(tracksFeature.slice(0,4))
}
const sendSeeds = async (sortedTracks) => { 
   let uris=""
    for(let y of sortedTracks){
       uris+=y.id+","
   } 
    const data = await axios.get(`https://api.spotify.com/v1/recommendations?seed_tracks=${uris}`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
})
setSuggestions(data.data.tracks);
if(numberOfSuggestions!=0){
    setSuggestions(data.data.tracks.slice(0,numberOfSuggestions));
}
}
const renderSuggestions=()=>{
    return(
        suggestions.map(temp=> (
            <div key={temp.id} className="featureCell">
            <div className="pName">{temp.name}</div>
            
            </div>
    ))
    )

}
const sortTempolow=(a,b)=>{
    if ( a.tempo < b.tempo){
        return -1;
      }
      if ( a.tempo> b.tempo){
        return 1;
      }
      return 0;
}


const Joshstuff =  async() => { 
    // https://open.spotify.com/playlist/3os1umKWEhFeNROTDXVv4p?si=c85c25a3eaf84ff6
    // https://open.spotify.com/playlist/1j7sm55kF76VmazCe3ypbD?si=eeA9w3SrQsKjezg0FKk7JQ&utm_source=copy-link
    const data = await axios.get(`https://api.spotify.com/v1/playlists/1j7sm55kF76VmazCe3ypbD/tracks`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    setWorkingPlayList(data.data);
    // console.log(working.items);
    // console.log(working)
    // let userID= await getUserID();
    //     let landingID= await newPlaylist(userID);
    //     let uris ="";
    //  for(let u of working.items){
    //      uris+=u.track.uri+",";
    //  } 
    //  addUrisToPlayList(uris,landingID);
    
    console.log(tracksTempo)
    
   
    }
    

    const analysisTop =()=>{
        
       setTracksFilterFeature([]);
        let sum =0;
        switch(feature){
            case "Acousticness":
                sum=0;
                for(let f of tracksFeature){
                    sum=sum+f.acousticness
                }
                getAcousticnessAvg( sum/tracksFeature.length);
                tracksFeature.sort(compareAvgDiff);
                console.log(tracksFeature);
                if(top!=0){
                    setTracksFilterFeature(tracksFeature.slice(0,top))
            }              
                break;
            case "Danceability":
                sum=0;
                for(let f of tracksFeature){
                    sum= sum+f.danceability
                }
                
                getDanceAvg( sum/tracksFeature.length);
                
                tracksFeature.sort(compareAvgDiff);
                
                if(top!=0){
                    setTracksFilterFeature(tracksFeature.slice(0,top))
                }       
                break;
            case "Energy":
                sum=0;
                for(let f of tracksFeature){
                    sum= sum+f.energy
                }
                getEnergyAvg( sum/tracksFeature.length);
                
                tracksFeature.sort(compareAvgDiff);
                if(top!=0){
                    setTracksFilterFeature(tracksFeature.slice(0,top))
                }       
                break;
            case "Instrumentalness":
                sum=0;
                for(let f of tracksFeature){
                    sum= sum+f.instrumentalness
                }
                getInstrumentAvg( sum/tracksFeature.length);
             
                tracksFeature.sort(compareAvgDiff);
              
                if(top!=0){
                    setTracksFilterFeature(tracksFeature.slice(0,top))
                }       
                break;
            case "Speechiness":
                sum=0;
                for(let f of tracksFeature){
                    sum= sum+f.speechiness
                }
                getSpeechAvg( sum/tracksFeature.length);
                tracksFeature.sort(compareAvgDiff);
                if(top!=0){
                    setTracksFilterFeature(tracksFeature.slice(0,top))
                }       
                break;
        }
   }

    const renderFun = ()=>{
        if(fun=="Tempo"){return(<div><form onSubmit={Tempo} className="filterForm">
                        <p className="desHeader"> Please Select the Desirable Tempo Range You Wish To Have</p>
                        <p className="description">By Default the Maximun Tempo is +10 from Minimun</p>
                        <p>Minimun Bpm</p><input type="number" onChange={e => setBothTempo(e.target.value)} placeholder="type in a tempo"/>
                        <p>Maximun Bpm</p><input type="number" onChange={e => setSelectedMAXTempo(e.target.value)} placeholder="Defaulty +10 from minimun" value={maxTempo}/>
                        <button type={"submit"}>Filter</button>
                    </form>
                    <div className="featureCellHeader">
                        <div className="pNameHeader"> Song Name</div>
                        <div className="pDetailHeader"> Tempo Value (Bpm)</div>          
                    </div>
                    </div>
                    )}
        if(fun=="Suggestions"){return(<div><form  className="filterForm" onSubmit={getSuggestions}>
                    <p className="desHeader"> Suggestions Base on the Tracks of This PlayList</p>
                        <p className="description">Suggestions uses tracks feature like danceability, energy, and acousticness to determinent an average and send 5 songs that's closest to average to generate suggestions</p>
                    <p>Number of Suggestions</p><input type="number" onChange={e => setNumofSuggestions(e.target.value)} placeholder="Number of songs up to 20"/>
                    <button type={"submit"}>Filter</button>
                </form>
                <div className="featureCellHeader">
                    <div className="pNameHeader"> Song Name</div>        
                </div>
                </div>
                )}
        if(fun=="Optimized"){return(<div><form onSubmit={analysisTop} className="filterForm">
                         <p className="desHeader"> Choose a Desirable Feature for you to Focus on</p>
                        <p className="description">After Calculating the average of the feature you select in the playlist the songs are ranked by how close they are to the average </p>
                        <select onChange={(e)=>displayFeature(e.target.value)} >
                        <option value="">Choose a Feature</option>
                        <option value="Acousticness">Acousticness</option>
                        <option value="Danceability">Danceability</option>
                        <option value="Energy">Energy</option>
                        <option value="Instrumentalness">Instrumentalness</option>
                        <option value="Speechiness">Speechiness</option>
                        </select>
                        <p>How Many Top Songs Would You Like?</p>
                        <input type="number" onChange={e => setTop(e.target.value)} placeholder="Number of top songs?"/>
                        <button type={"submit"}>Filter</button>
                    </form>
                    <div className="featureCellHeader">
                        <div className="pNameHeader"> Song Name</div>
                        <div className="pDetailHeader"> Feature Value</div>          
                    </div>
                    </div>
                    )}
        else{
            return(<div className="filterForm">Please Select a Functionality</div>)
        }
    
                    
    }
    const renderSwitch= ()=>{
        if(fun=="Tempo"){
           return renderPlaylistTempos()
        }
        if(fun=="Suggestions"){
            return renderSuggestions()
        }
        if(fun=="Optimized"){
            return renderPlaylistFeature();
        }
    }
    return (
        <div className={!token? "":"container-fluid"}>
            <div className={!token? "":"row content"}>
                <div className="col-sm-3 sidenav">{!token ?
                    <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scopes=${scope}`} className="login">Login
                        to Spotify</a>
                    : <div ><button className="logout"onClick={logout}>Logout</button>
                    <div >{renderProfilePicture()}</div>
                   <ul className="playLists">{renderPlaylists()}</ul>
                
                    </div>
                    }</div>
                    {/* 4tc4jhCiOb9PlY3bh1PMzB?si=6a1ede8285ab4bc0 */}
                {playlists&&token&&alltracks.length!==0? 
                    <div className="col-sm-9">
                    <div className="box intro">
                        <h2>Welcome to Tempoify</h2>
                        <h4>This app work with your spotify account, all of your playlists are listed at the side and after selecting a functionality it will Generate a new playlist base on your need </h4>
                        <h3>Select One of your playlist you would like to work and one of the functionality at the top. </h3>
                        <div className="btns">
                            <button onClick={e => changeFun(e.target.innerHTML)} className={fun=="Tempo"? "btn btn-primary":"fun"}>Tempo</button>
                            <button onClick={e => changeSuggestion(e.target.innerHTML)}className={fun=="Suggestions"? "btn btn-primary":"fun"}>Suggestions</button>
                            <button onClick={e => changeFun(e.target.innerHTML)} className={fun=="Optimized"? "btn btn-primary":"fun"}>Optimized</button>
                            {/* <button onClick={Joshstuff}>Client</button> */}
                    </div>
                        </div>
                        <div className="allTracks">{renderPlaylistTracks()}
                    </div>
                    {renderFun()}
                    <div className="preview">{renderSwitch()}</div>
               
                    
                    {renderNewFilterList()}
                    {renderResponse()}
                </div> // :tracksTempo.length==0?
                // <button>display songs tempo</button>  
               
                   :token&&alltracks.length==0? <div className="col-sm-9"><div className="box intro">
                       <h2>Welcome to Tempoify</h2>
                       <h4>This app work with your spotify account, all of your playlists are listed at the side and after selecting a functionality it will Generate a new playlist base on your need </h4>
                        <h3>Select One of your playlist you would like to work with on the left and one of the functionality at the top. </h3>
                        </div>
                        <div className="pointerLeft">
                        <div className="pointerLeftArrow"></div>
                        Please Select a playlist
                        </div>
                        </div>
                        :<div></div>
                }
                
              
                </div>
                
        </div>
    );
}

export default App;