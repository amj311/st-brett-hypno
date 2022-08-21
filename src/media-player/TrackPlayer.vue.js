const AirtableService = require("../services/AirtableService");
const {Howl, Howler} = require('howler');

const TrackPlayer = Vue.component('trackplayer',{
    template: /*html*/`

    <div id="player-wrapper">
        <div v-html="stylesheet"></div>

        <div id="top-section">
            <button @click="close">&times;</button>
        </div>

        <template v-if="track">
       
        <div id="center-info">
            <div id="title">{{track.name}}</div>
            <div id="play-button">
                <div v-if="isLoadingTrack">•••</div>
                <div v-else-if="howl?.playing()" @click="pause">| |</div>
                <div v-else @click="play">▶</div>
            </div>
        </div>

        <div id="progress-bar">
            <div id="bars-wrapper">
                <div id="playback-progress" class="bar" :style="{width: trackProgress+'%'}"></div>
            </div>
            <div id="progress-info">
                <span>{{fmtMSS(howl.seek())}}</span>
                <span>{{fmtMSS(howl.duration())}}</span>
            </div>
        </div>
        

       </template>
    </div>`,

    props: ["track", "autostart"],
    
    data: function() {
        return {
            loading: false,
            howl: null,
            animation: null,
            trackProgress: 0,
            
            stylesheet: /*html*/`
            <style>
                #player-wrapper {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                }
                #center-info {
                    flex-grow: 1;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    display: flex;
                    text-align: center;
                }
                #title {
                    font-size: 2em;
                    margin: 1em;
                }
                #play-button {
                    line-height: 3em;
                    width: 3em;
                    border-radius: 50%;
                    background: #888;
                    color: #fff;
                    text-align: center;
                    font-weight: bold;
                    cursor: pointer;
                    user-select: none;
                }
                #play-button > div {
                    width: inherit;
                    line-height: inherit;
                }
                #bars-wrapper {
                    display: relative;
                    width: 100%;
                    height: 10px;
                    background: #eee;
                }
                .bar {
                    position: relative;
                    top: 0;
                    left: 0;
                    height: 100%;
                    background: #aaa;
                }
                #progress-info {
                    justify-content: space-between;
                    display: flex;
                }
                
            </style>
            `
        }
    },

    async mounted() {
        this.handleNewTrack();
    },

    beforeDestroy() {
        this.unload();
    },

    watch: {
        track() { this.handleNewTrack() }
    },

    methods: {
        handleNewTrack() {
            this.unload();
            if (!this.track) return;

            this.howl = new Howl({
                src: [ 'https://docs.google.com/uc?export=download&id='+this.track.drive_id ],
                html5: true,
                preload: 'metadata'
            });
            this.howl.load();
            this.howl.on('end', this.stop);
            if (this.autostart) this.play();
        },
        
        unload() {
            if (!this.howl) return;
            this.howl.unload();
            this.howl = null;
        },
        

        play() {
            this.howl.play();
            this.doAnimation();
        },

        pause() {
            this.howl.pause();
            this.stopAnimation();
        },

        stop() {
            this.howl.stop();
            this.updateProgress();
            this.stopAnimation();
        },

        updateProgress() {
            this.trackProgress = this.howl.state() === 'loaded' ? this.howl.seek() / this.howl.duration() * 100 : 0;
        },

        doAnimation() {
            if (this.animation !== null) return;
            this.animation = requestAnimationFrame(this.onAnimationFrame);
        },
        stopAnimation() {
            cancelAnimationFrame(this.animation);
            this.animation = null;
        },
        onAnimationFrame() {
            if (this.track && this.howl) {
                this.updateProgress();
            } 
            this.animation = null;
            this.doAnimation();
        },

        close() {
            if (confirm("Are you sure you want to end this meditation?")) {
                this.unload();
                this.$emit('close')    
            }
        },

        fmtMSS(seconds) {
            var minutes = Math.floor(seconds / 60);
            var seconds = Math.floor((seconds - minutes * 60));
        
            return minutes + ":" + (seconds<10 ? "0" : "") + seconds
        }
        
    },

    computed: {
        isLoadingTrack() {
            return this.howl ? this.howl.state() !== 'loaded' : false;
        }
    }
});

module.exports = TrackPlayer;