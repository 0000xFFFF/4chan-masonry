// ==UserScript==
// @name         4chan-masonry
// @namespace    0000xFFFF
// @version      1.0
// @description  View all images from 4chan thread in a masonry grid layout.
// @author       0000xFFFF
// @match        *://boards.4chan.org/*/thread/*
// @match        *://boards.4channel.org/*/thread/*
// @grant        none
// @icon         data:image/ico;base64,AAABAAEAEBAAAAEAIADMAAAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAQAAAAEAgGAAAAH/P/YQAAAJNJREFUeJxjYBhM4D8SJlnN/7QzxnCsFSyKFSOrwWpI9DZdsEI0m+AYJAdSg6EZ2RY0TV9grkM2BEktQjMuW2EY2RBkgxjwaUbzL7ohr+AGIBsCVfQHmwFYXQAEbDgMwRuYUPVsGAEpqMSB0xCMAESPRlyxgSyONRphBuBLSElHDfEmIrgBaM4nRg7VEDSaWDnyAQA+Ad0pEUxcvAAAAABJRU5ErkJggg==
// ==/UserScript==


(function() {
    'use strict';

    let gridRows = 8;
    let isGridOpen = false;
    let gridOverlay = null;

    function createViewButton() {
        const button = document.createElement('button');
        button.id = "4chan_grid_button";
        button.innerHTML = '🖼️ View All Images';
        button.style.cssText = `
            padding: 12px 18px;
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
        `;

        // Hover effect
        button.addEventListener('mouseenter', () => {
            button.style.background = '#4a7c21';
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = '#2d5016';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        });

        return button;
    }

    function findMediaLinks() {
        const mediaLinks = [];
        const files = document.querySelectorAll('div.file');

        files.forEach((fileDiv, index) => {
            const fileText = fileDiv.querySelector('.fileText');
            const fileThumb = fileDiv.querySelector('.fileThumb');
            const fileThumbImage = fileThumb.querySelector("img");
            const link = fileText.querySelector('a');
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

                    const newElement = {
                        url: url,
                        originalName: originalName,
                        postId: postId,
                        index: index + 1,
                        isVideo: isVideo,
                        thumbnail: (fileThumbImage.src)
                    };
                    mediaLinks.push(newElement);

                }
            }
        });

        if (mediaLinks.length === 0) {
            const imgElements = document.querySelectorAll('img[src*="jpg"], img[src*="jpeg"], img[src*="png"], img[src*="gif"], img[src*="webp"], img[src*="bmp"]');
            const videoElements = document.querySelectorAll('img[src*="mp4"], img[src*="webm"], img[src*="mkv"], img[src*="avi"], img[src*="mov"]');
            const mediaLinks = [...list1, ...list2];

            mediaLinks.forEach((img_or_vid, index) => {
                const url = img_or_vid.src;
                const filename = url.split('/').pop().split('?')[0];
                const isVideo = /\.(mp4|webm|mkv|avi|mov)(\?|$)/i.test(url);

                imageLinks.push({
                    url: url,
                    originalName: filename,
                    postId: filename,
                    index: index + 1,
                    isVideo: isVideo
                });
            });
        }

        return mediaLinks;
    }

    function createRowSlider() {
        const sliderContainer = document.createElement('div');
        sliderContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(0,0,0,0.8);
            border-radius: 10px;
        `;

        const label = document.createElement('label');
        label.textContent = 'Grid Rows:';
        label.style.cssText = `
            color: white;
            font-weight: bold;
            font-size: 16px;
        `;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '2';
        slider.max = '8';
        slider.value = gridRows;
        slider.style.cssText = `
            width: 200px;
            height: 6px;
            background: #333;
            outline: none;
            border-radius: 3px;
            cursor: pointer;
        `;

        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = gridRows;
        valueDisplay.style.cssText = `
            color: white;
            font-weight: bold;
            font-size: 16px;
            min-width: 20px;
        `;

        slider.addEventListener('input', (e) => {
            gridRows = parseInt(e.target.value);
            valueDisplay.textContent = gridRows;
            updateMasonryGrid();
        });

        sliderContainer.appendChild(label);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);

        return sliderContainer;
    }

    function updateMasonryGrid() {
        const gridContainer = document.getElementById('masonry-grid');
        if (gridContainer) {
            gridContainer.style.columnCount = gridRows;
        }
    }

    function createMasonryGrid(mediaLinks) {
        const overlay = document.createElement('div');
        overlay.id = 'image-grid-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.95);
            z-index: 10000;
            overflow: auto;
            box-sizing: border-box;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            max-width: 97vw;
            margin: 0 auto;
        `;

        // Close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕ Close';
        closeButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #d32f2f;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            z-index: 10001;
            transition: background 0.3s ease;
        `;

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = '#b71c1c';
        });

        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = '#d32f2f';
        });

        closeButton.addEventListener('click', closeGrid);

        // Row slider
        const sliderContainer = createRowSlider();

        // Grid container
        const gridContainer = document.createElement('div');
        gridContainer.id = 'masonry-grid';
        gridContainer.style.cssText = `
            display: block;
            gap: 10px;
            margin-top: 20px;
            column-count: ${gridRows};
            column-gap: 5px;
        `;

        // Create image elements
        mediaLinks.forEach((mediaData, index) => {
            const mediaWrapper = document.createElement('div');
            mediaWrapper.style.cssText = `
                position: relative;
                overflow: hidden;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            `;

            if (mediaData.isVideo) {
                // Thumbnail image
                const thumbImg = document.createElement('img');
                thumbImg.src = mediaData.thumbnail;
                thumbImg.style.cssText = `
                    width: 100%;
                    height: auto;
                    display: block;
                    object-fit: cover;
                    cursor: pointer;
                `;
                mediaWrapper.appendChild(thumbImg);

                // Play button overlay
                const playBtn = document.createElement('div');
                playBtn.style.cssText = `
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
                `;
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
                            video.style.cssText = `
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
                                display: none;
                            `;
                            video.loop = true;
                            video.muted = true;
                            video.playsInline = true;

                            video.addEventListener('canplay', () => {
                                videoLoaded = true;
                                thumbImg.style.display = 'none';
                                playBtn.style.display = 'none';
                                video.style.display = 'block';
                                video.play().catch(() => { });
                            });

                            mediaWrapper.appendChild(video);
                        } else if (videoLoaded) {
                            thumbImg.style.display = 'none';
                            playBtn.style.display = 'none';
                            video.style.display = 'block';
                            video.play().catch(() => { });
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
                        video.play().catch(() => { });
                    }
                });
            }
            else {
                const img = document.createElement('img');
                img.src = mediaData.thumbnail;
                img.loading = 'lazy';
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                    transition: opacity 0.3s ease;
                `;
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
            tooltip.style.cssText = `
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
            `;

            // Hover effects
            mediaWrapper.addEventListener('mouseenter', () => {
                mediaWrapper.style.transform = 'scale(1.05)';
                mediaWrapper.style.boxShadow = '0 8px 25px rgba(0,0,0,0.6)';
                mediaWrapper.style.zIndex = '100';
                tooltip.style.transform = 'translateY(0)';
            });

            mediaWrapper.addEventListener('mouseleave', () => {
                mediaWrapper.style.transform = 'scale(1)';
                mediaWrapper.style.boxShadow = 'none';
                mediaWrapper.style.zIndex = '1';
                tooltip.style.transform = 'translateY(100%)';
            });

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

        container.appendChild(sliderContainer);
        container.appendChild(gridContainer);
        overlay.appendChild(closeButton);
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
                const containerDiv = document.createElement('div');
                containerDiv.id = "4chan_grid_cont";
                containerDiv.style.cssText = `
                    display: flex;
                    margin: 15px 0 15px 0;
                `;

                const viewButton = createViewButton();
                viewButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    openGrid();
                });

                containerDiv.appendChild(viewButton);

                const threadElement = document.querySelector(".thread");
                threadElement.parentElement.insertBefore(containerDiv, threadElement);

                const mediaLinks = findMediaLinks();
                console.log(`Found ${mediaLinks.length} media files on page:`, mediaLinks);

                document.getElementById("4chan_grid_button").innerHTML = `🖼️ Masonry Grid (${mediaLinks.length})`;

            } catch (error) {
                console.error('Error initializing userscript:', error);
            }
        }, 500);
    }

    init();

})();
