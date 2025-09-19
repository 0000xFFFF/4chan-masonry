// ==UserScript==
// @name         4chan-masonry
// @namespace    0000xFFFF
// @version      1.0
// @description  View all images from 4chan thread in a masonry grid layout.
// @author       0000xFFFF
// @match        *://boards.4chan.org/*/thread/*
// @match        *://boards.4channel.org/*/thread/*
// @grant        GM_addStyle
// @icon         data:image/ico;base64,AAABAAEAEBAAAAEAIADMAAAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAQAAAAEAgGAAAAH/P/YQAAAJNJREFUeJxjYBhM4D8SJlnN/7QzxnCsFSyKFSOrwWpI9DZdsEI0m+AYJAdSg6EZ2RY0TV9grkM2BEktQjMuW2EY2RBkgxjwaUbzL7ohr+AGIBsCVfQHmwFYXQAEbDgMwRuYUPVsGAEpqMSB0xCMAESPRlyxgSyONRphBuBLSElHDfEmIrgBaM4nRg7VEDSaWDnyAQA+Ad0pEUxcvAAAAABJRU5ErkJggg==
// ==/UserScript==

function GM_addStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
    return style;
}

// Usage

var MasonryCss = `

#fcm_overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.95);
    z-index: 10000;
    overflow: auto;
    box-sizing: border-box;
}

#fcm_topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
    z-index: 999;
    transition: transform 0.3s ease-in-out;
    will-change: transform;
    backdrop-filter: blur(5px);
}

.fcm_slider_container {
    display: flex;
    align-items: center;
    gap: 15px;
}

.fcm_close {
    padding: 8px 12px;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.2s ease;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.fcm_close:hover {
    background: #b71c1c;
    transform: scale(1.05);
}

#fcm_masonry {
    display: block;
    gap: 10px;
    margin-top: 50px;
    column-gap: 5px;
}

.fcm_shortcut_4chanx {
    margin: 0 0 0 5px;
    padding: 0;
    cursor: pointer;
    display: flex;
    justify-content: center;
}

.fcm_shortcut_4chanx img {
    width: 16px;
    height: 13px;
}

.fcm_button_regular {
    padding: 12px 18px;
    display: flex;
    gap: 5px;
    background: #2d5016;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
    white-space: nowrap;
}

.fcm_button_regular:hover {
    background: #4a7c21;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}

.fcm_button_regular img {
    height: 15px;
}

.fcm_container {
    display: flex;
    margin: 15px 0 15px 0;
}

.fcm_grid_container {
    max-width: 97vw;
    margin: 0 auto;
}

.fcm_value_display {
    color: white;
    font-weight: bold;
    font-size: 16px;
    min-width: 20px;
}

.fcm_media_wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.fcm_media_wrapper:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0,0,0,0.6);
    z-index: 100;
}

.fcm_media_img,
.fcm_media_thumb,
.fcm_media_video {
    width: 100%;
    display: block;
    object-fit: cover;
    cursor: pointer;
}

.fcm_media_img {
    object-fit: contain;
    transition: opacity 0.3s ease;
}

.fcm_media_video {
    object-fit: contain;
    display: none;
}

.fcm_play_btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    background: rgba(0,0,0,0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    pointer-events: none;
    opacity: 0.4;
}

.fcm_tooltip {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 8px;
    font-size: 12px;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    word-break: break-all;
}

.fcm_media_wrapper:hover .fcm_tooltip {
    transform: translateY(0);
}

`;

GM_addStyle(MasonryCss);


const userscript_icon = "data:image/ico;base64,AAABAAEAEA0AAAEAIADLAAAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAQAAAADQgGAAAAoLvuJAAAAJJJREFUeJxjYECA/0gYF8Cp5n/aGWM41goWxYqR1WA1JHqbLlghmk1wDJIDqcHQjGwLmqYvMNchG4KkFqEZl60wjGwIskEM+DSj+RfdkFdwA5ANgSr6g80ArC4AAjYchuANTKh6NoyAFFTiwGkIRgCiRyOu2EAWxxqNMAPwJaSko4Z4ExHcADTnEyOHaggaTVAOABLO3SkZ/WViAAAAAElFTkSuQmCC";

const gridRowsMin = 1;
const gridRowsMax = 15;
let gridRows = 12;
let isGridOpen = false;
let gridOverlay = null;

function initUI() {
    const button = document.createElement('span');
    button.title = "Masonry Grid";

    button.addEventListener('click', function (e) {
        e.preventDefault();
        openGrid();
    });

    const forchanX_header = document.getElementById("header-bar")
    if (forchanX_header) { // if 4chan X is detected

        const element = document.getElementById("shortcut-watcher");
        button.id = "shortcut-masonry";
        button.className = "shortcut brackets-wrap fcm_shortcut_4chanx";

        const img = document.createElement("img");
        img.src = userscript_icon;
        button.appendChild(img);

        forchanX_header.appendChild(button);
        element.parentElement.insertBefore(button, element);
    }
    else {
        button.className = "fcm_button_regular";

        const img = document.createElement("img");
        img.src = userscript_icon;
        button.appendChild(img);

        const span = document.createElement("span");
        span.innerHTML = "Masonry Grid";
        button.appendChild(span);

        const containerDiv = document.createElement('div');
        containerDiv.id = "4chan_grid_cont";
        containerDiv.className = "fcm_container";

        containerDiv.appendChild(button);
        const threadElement = document.querySelector(".thread");
        threadElement.parentElement.insertBefore(containerDiv, threadElement);
    }

    findMediaLinks(button);
}

function findMediaLinks(button = null) {
    const mediaLinks = [];
    const files = document.querySelectorAll('div.file');

    files.forEach((fileDiv, index) => {
        const fileText = fileDiv.querySelector('.fileText');
        const fileThumb = fileDiv.querySelector('.fileThumb');
        const fileThumbImage = fileThumb.querySelector("img");
        let link = null;
        if (fileText) { link = fileText.querySelector('a'); }

        if (link && link.href) {
            const url = link.href.startsWith('//') ? 'https:' + link.href : link.href;

            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(url);
            const isVideo = /\.(mp4|webm|mkv|avi|mov)(\?|$)/i.test(url);

            if (isImage || isVideo) {
                const postId = url.split('/').pop().split('?')[0];
                let originalName = link.title.trim() || link.textContent.trim() || postId;

                // if 4chan-X is used fix the name fetching
                const fnfull = link.querySelector('.fnfull');
                if (fnfull) { originalName = fnfull.textContent.trim(); }

                // get file info text
                const fileInfo = fileDiv.querySelector(".file-info");
                let width = null;
                let height = null;
                if (fileInfo) {
                    const fileInfoClone = fileInfo.cloneNode(true);
                    fileInfoClone.querySelectorAll("a").forEach(a => a.remove());
                    const info = fileInfoClone.textContent.trim();
                    const size = info.split(", ")[1].replace(")", "");
                    const width_and_height = size.split("x");
                    width = width_and_height[0];
                    height = width_and_height[1];
                }

                const newElement = {
                    url: url,
                    originalName: originalName,
                    postId: postId,
                    index: index + 1,
                    isVideo: isVideo,
                    thumbnail: (fileThumbImage.src),
                    width: width,
                    height: height
                };
                mediaLinks.push(newElement);
            }
        }
    });

    if (button) {
        button.title = `Masonry Grid (${mediaLinks.length})`;
    }

    return mediaLinks;
}

function findMediaLinksFromImgAndVideoElements() {
    const mediaLinks = []
    const imgElements = document.querySelectorAll('img[src*="jpg"], img[src*="jpeg"], img[src*="png"], img[src*="gif"], img[src*="webp"], img[src*="bmp"]');
    const videoElements = document.querySelectorAll('video[src*="mp4"], video[src*="webm"], video[src*="mkv"], video[src*="avi"], video[src*="mov"]');
    const mediaElements = [...imgElements, ...videoElements];
    mediaElements.forEach((img_or_vid, index) => {
        const url = img_or_vid.src;
        const filename = url.split('/').pop().split('?')[0];
        const isVideo = /\.(mp4|webm|mkv|avi|mov)(\?|$)/i.test(url);

        mediaLinks.push({
            url: url,
            originalName: filename,
            postId: filename,
            index: index + 1,
            isVideo: isVideo
        });
    });
    return mediaLinks;
}

function updateMasonryGrid() {
    const gridContainer = document.getElementById('fcm_masonry');
    if (gridContainer) {
        gridContainer.style.columnCount = gridRows;
    }
}

function createTopBar() {
    const topbar = document.createElement("div");
    topbar.id = "fcm_topbar";

    const sliderContainer = document.createElement('div');
    sliderContainer.className = "fcm_slider_container";

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = "setting_slider_cols";
    slider.min = gridRowsMin;
    slider.max = gridRowsMax;
    slider.step = "1";
    slider.value = gridRows;

    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = gridRows;
    valueDisplay.className = "fcm_value_display";

    slider.addEventListener('input', (e) => {
        gridRows = parseInt(e.target.value);
        valueDisplay.textContent = gridRows;
        updateMasonryGrid();
    });

    function slider_left() { slider.value = Math.max(Number(slider.value) - Number(slider.step), slider.min); }
    function slider_right() { slider.value = Math.min(Number(slider.value) + Number(slider.step), slider.max); }

    slider.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft': slider_left(); break;
            case 'ArrowRight': slider_right(); break;
        }
    });

    slider.focus();
    slider.select();

    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    topbar.appendChild(sliderContainer);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = "fcm_close";
    closeButton.innerHTML = '✕';
    closeButton.addEventListener('click', closeGrid);

    topbar.appendChild(closeButton);
    return topbar;
}

function createMasonryGrid(mediaLinks) {
    const overlay = document.createElement('div');
    overlay.id = 'fcm_overlay';

    const topbar = createTopBar();

    let lastScroll = 0;
    overlay.addEventListener("scroll", () => {
      const currentScroll = overlay.scrollTop;

      if (currentScroll > lastScroll) { topbar.style.transform = "translateY(-100%)"; }
      else { topbar.style.transform = "translateY(0)"; }

      lastScroll = currentScroll;
    });

    overlay.appendChild(topbar);

    const container = document.createElement('div');
    container.className = "fcm_grid_container";

    const handleParentClick = (event) => {
        event.preventDefault();
        if (event.target === event.currentTarget) {
          closeGrid();
        }
    };

    overlay.addEventListener('click', handleParentClick);
    container.addEventListener('click', handleParentClick);
    topbar.addEventListener('click', handleParentClick);

    // Grid container
    const gridContainer = document.createElement('div');
    gridContainer.id = 'fcm_masonry';
    gridContainer.style.columnCount = gridRows;

    // Create image elements
    mediaLinks.forEach((mediaData, index) => {
        const mediaWrapper = document.createElement('div');
        mediaWrapper.className = "fcm_media_wrapper";

        if (mediaData.isVideo) {
            // Thumbnail image
            const thumbImg = document.createElement('img');
            thumbImg.src = mediaData.thumbnail;
            thumbImg.className = "fcm_media_thumb";
            mediaWrapper.appendChild(thumbImg);

            // Play button overlay
            const playBtn = document.createElement('div');
            playBtn.className = "fcm_play_btn";
            playBtn.innerHTML = '&#9658;';
            mediaWrapper.appendChild(playBtn);

            let video = null;
            let hoverTimeout = null;
            let videoLoaded = false;

            // Hover in → wait 100ms → load and play muted video
            mediaWrapper.addEventListener('mouseenter', () => {
                hoverTimeout = setTimeout(() => {
                    if (!video) {
                        video = document.createElement('video');
                        video.src = mediaData.url;
                        video.className = "fcm_media_video";
                        video.loop = true;
                        video.muted = true;
                        video.playsInline = true;

                        video.addEventListener('canplay', () => {
                            videoLoaded = true;
                            thumbImg.style.display = 'none';
                            playBtn.style.display = 'none';
                            video.style.display = 'block';
                            video.play().catch(() => {});
                        });

                        mediaWrapper.appendChild(video);
                    } else if (videoLoaded) {
                        thumbImg.style.display = 'none';
                        playBtn.style.display = 'none';
                        video.style.display = 'block';
                        video.play().catch(() => {});
                    }
                }, 100);
            });

            // Hover out → only reset if not clicked
            mediaWrapper.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
                if (video) {
                    video.pause();
                    video.style.display = 'none';
                    thumbImg.style.display = 'block';
                    playBtn.style.display = 'flex';
                }
            });

            // Click → unmute, controls on, persistent
            mediaWrapper.addEventListener('click', (e) => {
                if (video && !video.controls) {
                    e.preventDefault();
                    video.muted = false;
                    video.controls = true;
                    video.autoplay = true;
                    thumbImg.style.display = 'none';
                    playBtn.style.display = 'none';
                    video.style.display = 'block';
                    video.play().catch(() => {});
                }
            });
        }
        else {
            const img = document.createElement('img');
            img.src = mediaData.thumbnail;
            img.loading = 'lazy';
            img.className = "fcm_media_img";
            mediaWrapper.appendChild(img);

            // Preload full image in background
            const fullImg = new Image();
            fullImg.src = mediaData.url;
            fullImg.onload = () => {
                img.style.opacity = '0'; // fade out thumbnail
                setTimeout(() => {
                    img.src = fullImg.src; // replace with full image
                    img.style.opacity = '1'; // fade in full image
                }, 200); // delay so fade-out is visible
            };
        }

        // Filename tooltip
        const tooltip = document.createElement('div');
        tooltip.textContent = mediaData.originalName;
        tooltip.className = "fcm_tooltip";

        // Click middle click to open full size
        mediaWrapper.addEventListener('mousedown', (event) => {
            if (event.button === 1) {
                // 0 = left, 1 = middle, 2 = right
                window.open(mediaData.url, '_blank');
            }
        });

        mediaWrapper.appendChild(tooltip);
        gridContainer.appendChild(mediaWrapper);
    });

    container.appendChild(gridContainer);
    overlay.appendChild(container);

    return overlay;
}

function openGrid() {
    if (isGridOpen) return;

    const mediaLinks = findMediaLinks();
    if (mediaLinks.length === 0) {
        alert('No media found on this page!');
        return;
    }

    gridOverlay = createMasonryGrid(mediaLinks);
    document.body.appendChild(gridOverlay);
    isGridOpen = true;

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    // Close on escape key
    document.addEventListener('keydown', handleEscapeKey);
}

function closeGrid() {
    if (!isGridOpen || !gridOverlay) return;

    document.body.removeChild(gridOverlay);
    gridOverlay = null;
    isGridOpen = false;

    // Restore body scrolling
    document.body.style.overflow = 'auto';

    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeGrid();
    }
}

async function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }

    setTimeout(async () => {
        try {
            initUI();

        } catch (error) {
            console.error('Error initializing userscript:', error);
        }
    }, 500);
}

init();
