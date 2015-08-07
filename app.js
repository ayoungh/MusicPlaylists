var SpotifyWebApi = require('spotify-web-api-node');
var config = require('./config');

/**
 * Set the credentials given on Spotify's My Applications page.
 * https://developer.spotify.com/my-applications
 */
var spotifyApi = new SpotifyWebApi({
 clientId : config.clientId,
 clientSecret : config.clientSecret,
 redirectUri : config.redirectUri
});

spotifyApi.setAccessToken(config.authCode);








/////////////////

// XXX: Get all playlist names and ID's
var totalplaylistCount = 0;
var playlistCount = 0;
var offsetAmount = 0;
var playlistsArr = [];
var playlistsFNCount = 0;

var firstRun = false;

var savePlaylists = function (data, cb) {

  //go through the list given in data
  for (var i = 0; i < data.body.items.length; i++) {
    playlistCount++;
    playlistsArr.push(data.body.items[i]);
    //console.log('Batch 1: ', playlistCount, ' ', data.body.items[i].name);
    console.log('PlaylistName: ', data.body.items[i].name, ' <<');

    if (typeof cb === 'function') {
      console.log('Get tracks: ');
      cb(data.body.items[i].id);
    } else {
      console.log('not a function');
    }

  }


  return {
    playlistsFoundCount: data.body.total
    ,playlistsArray: playlistsArr
  }



};

var getTracks = function(id){

  var tracks = [];

  // Get tracks in a playlist
  spotifyApi.getPlaylistTracks(config.username, id, { 'offset' : 0, 'limit' : 5 }) //, 'fields' : 'items'
    .then(function(data) {
      console.log('The playlist contains these tracks'); //, data.body

      if (data.body.items) {
        console.log('|-->> ', data.body.items[0].track.name);
        tracks.push(data.body.items[0].track.name);
        console.log(tracks);
      } else {
        console.log('no tracks found');
      }


    }, function(err) {
      console.log('Something went wrong!', err);
    });

};





//////////////////////////////

var playlists = function (offset) {
  //console.log('new offset: ', offset);
  playlistsFNCount++;
  console.log('Batch '+playlistsFNCount+' : \n');

  // Get a user's playlists
  spotifyApi.getUserPlaylists(config.username, {'limit': 10, 'offset': offset})
    .then(function(data) {
      console.log('getUserPlaylists');
      if (data && data.body) {
        offsetAmount+=10;
        for (var i = 0; i < data.body.items.length; i++) {
          playlistCount++;

          console.log(playlistCount, data.body.items[i].name, data.body.items[i].id);
          playlistsArr.push( {name:data.body.items[i].name, id:data.body.items[i].id});

          if (playlistCount === offsetAmount-1) {
            console.log(playlistsArr);
            //launch this function again with new offset
            playlists(offsetAmount);
            console.log('playlistCount', playlistCount, 'total: ', totalplaylistCount);
          }

        }

      }

    },function(err) {
      console.log('Something went wrong!', err);
  });
};






/////////////
// 1ST RUN //
/////////////
// Get a user's playlists
spotifyApi.getUserPlaylists(config.username, {'limit': 10, 'offset': 0})
  .then(function(data) {



    if (data && data.body) {

      totalplaylistCount = data.body.total;

      offsetAmount+=10;
      for (var i = 0; i < data.body.items.length; i++) {
        playlistCount++;
        console.log(playlistCount, data.body.items[i].name, data.body.items[i].id);
        playlistsArr.push( {name:data.body.items[i].name, id:data.body.items[i].id});

        //console.log('data.body.offset: ', data.body.offset);

        if (i === offsetAmount-1) { //!firstRun &&
          //console.log(playlistsArr);
          firstRun = true;

          //launch this function again with new offset
          playlists(offsetAmount);

        }
        //  else {
        //    if (i === data.body.offset-1) {
        //      //launch this function again with new offset
        //      playlists(offsetAmount);
        //    }
        // }

      }

    }


    //console.log(data);

    //console.log('spotifyApi.getUserPlaylists - Retrieved playlists', data.body.total);

    //savePlaylists(data, getTracks);

      //for the playlist id get the tracks inside
      //console.log(data.body.items[i]);

      //console.log('i: ', i, 'data.body.items.length: ', data.body.items.length);
      // if (i+1 === data.body.items.length) {
      //   console.log('Batch 1: playlistsArr: ', playlistsArr, playlistsArr.length);
      // }


  },function(err) {
    console.log('Something went wrong!', err);
});
