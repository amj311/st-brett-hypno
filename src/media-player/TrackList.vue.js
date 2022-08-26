const TrackList = Vue.component('tracklist',{
    template: /*html*/`

    <div id="list-wrapper">
        <div v-html="stylesheet"></div>

        <div class="list-title">{{title}}</div>

        <div class="row header">
            <span class="col"></span>
            <span class="col">Title</span>
            <span class="col">Category</span>
        </div>

        <div v-for="track in tracks" class="row">
            <div class="col" id="play-button" @click="playTrack(track)"><i class="fa fa-play"></i></div>
            <div class="col track-title" :title="track.name">{{track.name}}</div>
            <div class="col track-category" :title="track.category?.name">{{track.category?.name}}</div>
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
                    grid-template-columns: 1.5em 3fr 1fr;
                    gap: .3em;
                    padding: .3em 0;
                    border-bottom: 1px solid #888;
                }
                
                .col {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: no-break;
                }

                .row #play-button {
                    line-height: 1.5em;
                    width: 1.5em;
                    font-size: 1em;
                    border-radius: 50%;
                    background: linear-gradient(325deg, #787ff6, #4adede);
                    color: #fff;
                    text-align: center;
                    font-weight: bold;
                    cursor: pointer;
                    user-select: none;
                }
                .row #play-button i {
                    font-size: .8em;
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
    },

    computed: {
    }
});

module.exports = TrackList;