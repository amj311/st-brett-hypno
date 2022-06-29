Vue.component('recentblogs',{
    template: /*html*/`
    <div id="RecentBlogsVueWrapper">
        <div v-html="stylesheet"></div>
        
        <div v-if="loading" class="strb-loading">Loading...</div>
        <div v-else class="strb-main">
            <div v-for="blog in recents" class="strb-blog-wrapper">
                <div class="strb-blog-container">
                    <div class="strb-thumb-wrapper" v-if="showThumbs">
                        <img class="strb-thumb" :src="blog.image" />
                    </div>
                    <div class="strb-blog-content">
                        <div class="strb-blog-title">{{blog.title || "No Title"}}</div>
                        <div class="strb-blog-blurb">{{blog.description}}</div>    
                        <div class="strb-button-wrapper"><a class="btn btn-primary" :href="blog.st_link">Read More</a></div>
                    </div>
                </div>
            </div>    
        </div>
    </div>`,

    data: function() {
        return {
            blogEls: [],
            recents: [],
            showThumbs: this.config.SHOW_THUMBNAILS,
            unusedDefaultThumbs: [],
            loading: true,
            
            stylesheet: /*html*/`
            <style>
                .strb-main  {
                    display: flex;
                    flex-wrap: wrap;
                }
                .strb-blog-wrapper {
                    flex-grow: 1;
                    display: flex;
                    justify-content: center;
                }
                .strb-blog-container {
                    margin: 1em;
                    width:100%;
                    max-width: 20em;
                    min-width: 10em;
                    border: 1px solid #ccc;
                }
                .strb-thumb-wrapper {
                    width:100%;
                    height: 8em;
                    display: flex"
                }
                .strb-thumb {
                    object-fit: cover;
                    height: 100%;
                    width: 100%;
                    object-position: top;
                }
                .strb-blog-content {
                    padding:1em;
                }
            
                .strb-blog-title {
                }
                
                .strb-blog-blurb {
                    word-break: break-word;
                }
                
                .strb-button-wrapper {}
            </style>
            `
        }
    },

    props: ["config"],

    mounted() {
        this.loading = true;
        fetch(this.config.RSS_URL)
            .then(data => data.text() )
            .then(text => new window.DOMParser().parseFromString(text, "text/xml"))
            .then(doc => {
                this.blogEls = [];
                doc.querySelectorAll('item').forEach(blog=>{
                    this.blogEls.push(blog)
                })
                this.prepareMostRecent();
                this.loading = false;
            });
    },

    methods: {
        prepareMostRecent() {
            this.recents = this.blogEls.splice(0,this.config.QTY)
                .map(el=>this.createBlogFromElement(el));
        },
        useDefaultThumb() {
            if (!this.config.DEFAULT_THUMBNAILS) return null;
            if (this.unusedDefaultThumbs.length === 0) {
                this.unusedDefaultThumbs = [...this.config.DEFAULT_THUMBNAILS];
            }
            return this.unusedDefaultThumbs.shift();
        },
        createBlogFromElement(el) {
            let blog = {};
            blog.title = getCData(el.querySelector("title")?.innerHTML);
            blog.content = getCData(getFirstDescendant(el,"content:encoded")?.innerHTML);
            blog.date = getFirstDescendant(el,"pubDate")?.innerHTML;
            blog.st_link = getFirstDescendant(el,"link")?.innerHTML;
            blog.image = new window.DOMParser().parseFromString(blog.content, "text/html")
                .querySelector("img")?.src;
            if (!blog.image) blog.image = this.useDefaultThumb();
            blog.description = el.querySelector("description")?.innerHTML;
            return blog;
        }
    }
});

function getCData(string) {
    return string?.replace("<![CDATA[","").replace("]]>","");
}
function getFirstDescendant(el,tagname) {
    return el.getElementsByTagName(tagname)[0];
}

function insertRecentBlogs(elId,config,version="latest") {
    let anchorEl = document.getElementById(elId);
    let html = /*html*/`
        <div id="RecentBlogInsert"><recentblogs :config="config"></recentblogs></div>
    `
    anchorEl.outerHTML = html;
    new Vue({el:"#RecentBlogInsert",data:{config}});
}


function insertWidget(widgetName,elId,config) {
    let anchorEl = document.getElementById(elId);
    let anchorId = `${widgetName}_${elId}`;
    anchorEl.outerHTML = /*html*/`
        <div id="${anchorId}"><${widgetName} :config="config" /></div>
    `
    new Vue({el:anchorId, data:{config}});
}