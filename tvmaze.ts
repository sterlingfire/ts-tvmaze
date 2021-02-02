import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");
const BASE_URL = "http://api.tvmaze.com/";
const DEFAULT_IMAGE_URL = "https://tinyurl.com/tv-missing";
const search_endpoint = "search/shows";
type Show = {
  id: number,
  name: string,
  summary: string,
  image: {medium:string}
}
type Episode = {
  id: number,
  name: string,
  season: string,
  number: string
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term:string):Promise<Show[]> {
  const result = await axios.get(`${BASE_URL}/${search_endpoint}`, 
    { params: { q: term }});
  return result.data.map(( r : {show : Show }) => {
    let show=r.show;
    return {  'id':show.id,
              'name':show.name,
              'summary':show.summary,
              'image':show.image?.medium || DEFAULT_IMAGE_URL }
            });

}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button id=${show.name}-btn type=click class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    
    const buttonName = $(`${show.id}-btn`);
    buttonName.on("click", async function (){
      console.log("click heard");
      await searchForEpisodesAndDisplay(show.id);
    });

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term: string = <string>$("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a showId, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showId: number) {
  const episodes_url: string = `${BASE_URL}/shows/${showId}/episodes`;
  const result = await axios.get(episodes_url);
  return result.data.map(( r : {episode : Episode }) => {
    let episode=r.episode;
    return {  'id':episode.id,
              'name':episode.name,
              'season':episode.season,
              'number':episode.number }
            });
 }
 
/** Given list of episodes, create episode list item for each and add to DOM. */

function populateEpisodes(episodes: Episode[]) { 

  $episodesArea.show;

  const $episodes = episodes.map((e: Episode) => {
    return $(
      `<li>${e.name} (season ${e.season}, number ${e.number})</li>`
      );
  });

  $episodesList.append($episodes);
}

/** Handle episodes button submit: get episodes from API and display. */

async function searchForEpisodesAndDisplay(showId: number){
  console.log("click heard, made it to search");
  const episodes = await getEpisodesOfShow(showId);

  populateEpisodes(episodes);
}

