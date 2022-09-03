const TrackList = Vue.component('tracklist',{
    template: /*html*/`

    <div id="list-wrapper">
        <div v-html="stylesheet"></div>

        <div class="list-title">{{title}}</div>

        <div class="row header">
            <span class="col"></span>
            <span class="col">Title</span>
            <span class="col">Category</span>
            <span class="col">Release Date</span>
        </div>

        <div v-for="track in tracks" class="row">
            <div class="col" id="play-button" @click="playTrack(track)"><i class="fa fa-play"></i></div>
            <div class="col track-title" :title="track.name">{{track.name}}</div>
            <div class="col sub track-category" :title="track.category_name">{{track.category_name}}</div>
            <div class="col sub track-release" title="d">{{fmtDate(track.release_date)}}</div>
        </div>
        
    </div>`,

    props: ["tracks", "title"],
    
    data: function() {
        return {
            loading: false,
            
            stylesheet: /*html*/`
            <style>
                #list-wrapper {
                    width: 100%;
                }
                .list-title {
                    font-size: 1.3em;
                }
                
                .row {
                    display: grid;
                    align-items: center;
                    grid-template-columns: 1.5em 3fr 1fr 6em;
                    gap: 1em;
                    padding: .5em 0;
                    border-bottom: 1px solid #888;
                }

                .header .col {
                    text-transform: uppercase;
                    font-size: .8em;
                    color: #000000dd;
                }
                
                /*.col {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }*/

                .col.sub {
                    font-size: .9em;
                    color: #000000dd;
                }

                .row #play-button {
                    height: 1em;
                    width: 1em;
                    font-size: 1.8em;
                    border-radius: 50%;
                    background: linear-gradient(325deg, #1ca7ec 30%, #4adede);
                    color: #fff;
                    text-align: center;
                    font-weight: bold;
                    cursor: pointer;
                    user-select: none;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .row #play-button i {
                    font-size: .5em;
                }
                .row:not(:hover) #play-button {
                    filter: grayscale(1);
                }
                
            </style>
            `
        }
    },

    async beforeMount() {
    },

    methods: {
        playTrack(track) {
            this.$emit('playTrack', track)    
        },

        fmtDate(dateString) {
            let date = new Date(dateString);
            return `${date.getUTCMonth()+1}/${date.getUTCDate()}/${date.getUTCFullYear()}`
        }
    },

    computed: {
    }
});

module.exports = TrackList;