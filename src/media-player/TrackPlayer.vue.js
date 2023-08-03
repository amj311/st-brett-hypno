const {Howl} = require('howler');
const AirtableService = require("../services/AirtableService");

const TrackPlayer = Vue.component('trackplayer',{
    template: /*html*/`

    <div id="player-wrapper">
        <div v-html="stylesheet"></div>

        <div id="top-section">
            <div class="bar-item button" @click="close"><i class="fa fa-times"></i></div>
        </div>

        <template v-if="track">
            <div id="center-info">
                <div id="title">{{track.name}}</div>
                <div id="center-controls">
                    <div class="button" id="scrub-back" @click="()=>scrub(-10)">
                        <i class="fa fa-undo"></i>
                    </div>
                    <div id="play-button">
                        <div v-if="isLoadingTrack"><i class="fa fa-spinner fa-spin"></i></div>
                        <div v-else-if="activeHowl?.playing()" @click="pause"><i class="fa fa-pause"></i></div>
                        <div v-else @click="play"><i class="fa fa-play"></i></div>
                    </div>
                    <div class="button" id="scrub-forward" @click="()=>scrub(10)">
                        <i class="fa fa-repeat"></i>
                    </div>
                </div>
            </div>

            <div id="progress-bar">
                <div id="bars-wrapper">
                    <div id="playback-progress" class="bar" :style="{width: trackProgress+'%'}"></div>
                </div>
                <div id="progress-info">
                    <span>{{fmtMSS(activeHowl?.seek())}}</span>
                    <span>{{fmtMSS(activeHowl?.duration())}}</span>
                </div>
            </div>
       </template>
    </div>`,

    props: ["track", "autostart"],
    
    data: function() {
        return {
            loading: false,
            activeHowl: null,
            legalHowl: null,
			legalMode: true,
            trackHowl: null,
            animation: null,
            trackProgress: 0,
            
            stylesheet: /*html*/`
            <style>
                #player-wrapper {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                }
                #top-section .bar-item {
                    display: inline-block;
                    
                    font-size: 1.5em;
                    color: #555;
                    margin: 0 .125em;
                    cursor: pointer;
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
                #player-wrapper #play-button {
                    line-height: 3em;
                    width: 3em;
                    border-radius: 50%;
                    background: linear-gradient(325deg, #1ca7ec 30%, #4adede);
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
                #center-controls {
                    display: flex;
                    align-items: center;
                }

                #center-controls .button {
                    font-size: 1.5em;
                    margin: 1em;
                    opacity: .8;
                    cursor: pointer;
                    user-select: none;
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
                    background: linear-gradient(325deg, #1ca7ec 30%, #4adede);
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
		this.loadLegal();
        this.handleNewTrack();
    },

    beforeDestroy() {
        this.unloadTrack();
    },

    watch: {
        track() { this.handleNewTrack() }
    },

    methods: {
        loadLegal() {
            this.legalHowl = new Howl({
                src: [ 'https://docs.google.com/uc?export=download&id='+'1-nc2L0JdL2-SXMme_X_AXRX2D7pV1vic' ],
                html5: true,
                preload: true
            });
            this.legalHowl.load();
            this.legalHowl.on('end', this.onEndLegal);
			this.activeHowl = this.legalHowl;
            // if (this.autostart) this.play();
        },

		enterLegal() {
			this.legalMode = true;
			this.activeHowl = this.legalHowl;
            if (this.autostart) this.play();
		},

		onEndLegal() {
			this.legalMode = false;
			this.activeHowl = this.trackHowl;
			this.trackHowl.seek(0);
			this.trackHowl.play();
		},

        handleNewTrack() {
            this.unloadTrack();
            if (!this.track) return;

			this.setupTrack();
			this.enterLegal();
        },

		setupTrack() {
            this.trackHowl = new Howl({
                src: [ 'https://docs.google.com/uc?export=download&id='+this.track.drive_id ],
                html5: true,
                preload: true
            });
			this.trackHowl.on('load', () => {
				if (!this.track?.duration) {
					AirtableService.updateTrackDuration(this.track.id, this.trackHowl.duration())
					this.track.duration = this.trackHowl.duration();
				}
			})
            this.trackHowl.load();
            this.trackHowl.on('end', this.stop);
		},
        
        unloadTrack() {
            if (!this.trackHowl) return;
            this.trackHowl.unload();
            this.trackHowl = null;
        },
        

        play() {
            this.activeHowl.play();
            this.doAnimation();
        },

        pause() {
            this.activeHowl.pause();
            this.stopAnimation();
        },

        stop() {
            this.activeHowl.stop();
            this.updateProgress();
            this.stopAnimation();
        },

        scrub(delta) {
            let time = this.activeHowl.seek() + delta;
            time = Math.max(0, time);
            time = Math.min(this.activeHowl.duration(), time);
            this.activeHowl.seek(time)
        },

        updateProgress() {
            this.trackProgress = this.activeHowl.state() === 'loaded' ? this.activeHowl.seek() / this.activeHowl.duration() * 100 : 0;
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
            if (this.activeHowl) {
                this.updateProgress();
            } 
            this.animation = null;
            this.doAnimation();
        },

        close() {
            if (confirm("Are you sure you want to end this meditation?")) {
                this.unloadTrack();
                this.$emit('close')    
            }
        },

        fmtMSS(seconds) {
			if (!seconds) {
				return "--:--";
			}
            var minutes = Math.floor(seconds / 60);
            var seconds = Math.floor((seconds - minutes * 60));
        
            return minutes + ":" + (seconds<10 ? "0" : "") + seconds
        }
        
    },

    computed: {
        isLoadingTrack() {
            return this.activeHowl ? this.activeHowl.state() !== 'loaded' : false;
        }
    }
});

module.exports = TrackPlayer;