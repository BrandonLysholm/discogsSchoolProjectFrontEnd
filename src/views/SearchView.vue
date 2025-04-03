<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';
import GlobalMixin from '@/mixins/global-mixin';
import store from '@/store';
import AlbumInfo from '@/models/AlbumInfo';

@Component({})
export default class SearchView extends Mixins(GlobalMixin) {
  tempArtist: any = {};

  searchTerm = '';

  bUpdating = false;

  discogsArtistID = -1;

  auth = 'Discogs key=NtzUPqNXsgTEaYvNOgbM, secret=oWGChYBPFYVPrdmoIshwetXmmdRQZisj';

  bHideResult = true;

  bHideSave = true;

  /**
   * This is called when the "search" button is clicked
   * It calls the Discogs API and then sets the tempArtist object
   * with the response
   * It chains multiple Discogs API calls due to how their API is structured
   */
  async searchArtist() {
    this.bUpdating = true;
    this.bHideSave = true;
    this.tempArtist = {};
    // here I need to call the Discogs API to get artist
    // 1. First Call - Taking text input and API search
    await fetch(
      `https://api.discogs.com/database/search?artist=${this.searchTerm}`,
      { headers: { Authorization: this.auth } },
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`Network response was not OK: ${response.status}`);
      })
      // 1.5. Processing the response of first call
      .then(async (artistResponse) => {
        const nextRequest = artistResponse.results[0].resource_url;
        // 2. Second Call - searching the first album, to get the artist
        await fetch(nextRequest, { headers: { Authorization: this.auth } })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error(`Network response was not OK: ${response.status}`);
          })
          // 2.5 Processing the response of second call
          .then((artist) => {
            // Here we are finally getting the artistID from the album we searched
            this.discogsArtistID = artist.artists[0].id;
          })
          .catch((error) => {
            console.log(`Problem with the fetch operation: ${error.message}`);
          });
      })
      .catch((error) => {
        console.log(`Problem with the fetch operation: ${error.message}`);
      });
    // Now need to get all the artist info

    await fetch(`https://api.discogs.com/artists/${this.discogsArtistID}`, { headers: { Authorization: this.auth } })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`Network response was not OK: ${response.status}`);
      })
      // 3.5. Processing the response of third call
      .then((artistInfo) => {
        // Here is where I get the response to finally set tempArtist
        this.tempArtist.artistID = this.discogsArtistID;
        this.tempArtist.artistName = artistInfo.name;
        this.tempArtist.artistPic = artistInfo.images[0].uri;
        // Since tempArtist is a literal, adding additional info not stored in my DB
        this.tempArtist.desc = artistInfo.profile;
        //   Here is for error catching
      })
      .catch((error) => {
        console.log(`Problem with the fetch operation: ${error.message}`);
      });
    this.bUpdating = false;
    this.bHideResult = false;
    this.searchTerm = '';
  }

  /**
   * Gets called when 'Save Artist' button is clicked
   * It stores the artist information into the database, and then
   * calls to get all of their releases, and adds an entry of album info
   * for each release
   */
  async saveArtist() {
    this.bHideResult = true;

    // Formatting the tempArtist into the proper format for the database
    const savingInfo = {
      accountID: store.getters.username,
      discogsArtistID: this.tempArtist.artistID,
      artistName: this.tempArtist.artistName,
      rating: 1,
      artistPic: this.tempArtist.artistPic,
    };
    // Call API to save
    const savedArtist = await this.callAPI(this.ARTIST_INFO_API, 'POST', savingInfo);
    // Call Discogs API to get all albums to add for use later
    const albumResults = await this.getAlbumResult(savedArtist.discogsArtistID);
    // For each album retrieved, add certain elements into the database for use later
    albumResults.forEach((album) => {
      const albumSaving = {
        discogsAlbumID: album.id,
        albumTitle: album.title,
        rating: 1,
        releaseDate: album.year,
        artistID: savedArtist.artistInfoID,
        albumPic: album.thumb,
        accountID: store.getters.username,
      };
      this.callAPI(this.ALBUM_INFO_API, 'POST', albumSaving);
      this.bHideSave = false;
    });
  }

  /**
   * Called in saveArtist to retreive all albums
   * for currently saving artist frrom the Discogs API, and formats it to return
   * an array of object literals instead of a promise
   * so that I can use a foreach in album saving to save
   * all albums for the artist being saved
   */
  async getAlbumResult(artistID: number) {
    const returnObj = [{
      id: 1, title: '', year: 1, thumb: '',
    }];
    // Calling the discogs API to retreive all releases (albums) for the artist
    await fetch(`https://api.discogs.com/artists/${artistID}/releases`, { headers: { Authorization: this.auth } }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`Network response was not OK: ${response.status}`);
    })
      .then((albumInfo) => {
        // Formatting the response from a Promise to an array of object literals
        // So that it can be handled better in the saveArtist
        returnObj.pop();
        albumInfo.releases.forEach((album: any) => {
          returnObj.push({
            id: album.id, title: album.title, year: album.year, thumb: album.thumb,
          });
        });
      })
      .catch((error) => {
        console.log(`Problem with the fetch operation: ${error.message}`);
      });

    return returnObj;
  }

  async redirectHome() {
    await this.$router.push('/home');
  }
}
</script>

<template>
  <div>
    <h1>Search for new artists:</h1>
    <b-input-group>
      <b-form-group label="Search:" label-for="input-search">
        <b-form-input id="input-search" v-model="searchTerm"></b-form-input>
      </b-form-group>
    </b-input-group>
    <b-button variant="primary" @click="searchArtist">Search</b-button>
    <!--    Search Results-->
    <div :hidden="bHideResult">
      <h5> You Searched for: {{tempArtist.artistName}}</h5>
      <img :src="tempArtist.artistPic" :alt="tempArtist.artistName" width="250px"/>
      <p>{{tempArtist.desc}}</p>
      <b-button variant="primary" @click="saveArtist">Add to liked artists</b-button>
    </div>
    <!--Save View to redirect to home-->
    <div :hidden="bHideSave">
      <h5> You Saved: {{tempArtist.artistName}}</h5>
      <img :src="tempArtist.artistPic" :alt="tempArtist.artistName" width="250px"/>
      <p>{{tempArtist.desc}}</p>
      <b-button variant="primary" @click="redirectHome">View liked artists</b-button>
    </div>
  </div>

</template>

<style scoped>

</style>
