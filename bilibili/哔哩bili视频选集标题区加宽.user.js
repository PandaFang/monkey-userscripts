// ==UserScript==
// @name        哔哩哔哩（bilibili | B站）多p 合集 视频选集区标题显示加宽加高
// @namespace   http://tampermonkey.net/
// @version     0.6
// @description 哔哩哔哩（bilibili | B站 | b站）多p 合集 视频选集区标题显示加宽加高， v0.6 支持2023年新版播放器的合集列表标题显示加宽加高
// @author      chulong
// @homepage    https://greasyfork.org/zh-CN/scripts/423654
// @match       https://www.bilibili.com/video/av*
// @match       https://www.bilibili.com/video/BV*
// @grant       GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    // Your code here...
    debugger;

    const CONFIG_WIDTH = "550px"; // 全屏播放时，右下角选集容器的宽度
    const SCRIPT_NAME = 'B站分P合集标题显示加宽脚本'

    // 被监控对象，右下角控制按钮区域， 只有全屏时才会出现选集按钮 这是新版的
    var newPartTitleListInFullScreenModeElementToObserve = document.querySelector(
        "#bilibili-player > div > div > div.bpx-player-primary-area >" +
        "div.bpx-player-video-area > div.bpx-player-control-wrap >" +
        "div.bpx-player-control-entity > div.bpx-player-control-bottom >" +
        "div.bpx-player-control-bottom-right"

    )

    // 获取播放器的高度，后续分p合集列表容器参照此高度
    let videoPlayerHeight = window.getComputedStyle(document.getElementById('playerWrap')).height;

    if (newPartTitleListInFullScreenModeElementToObserve) {
        handleNewPlayPage();
    } else {
        handleOldPlayPage();
    }

    function handleNewPlayPage() {

        // 获取投稿按钮的位置，后面加宽参考它的位置
        let uploadButtonRect = document.querySelector('.header-upload-entry').getBoundingClientRect();

        // 非全屏时，新版播放页，常规播放或宽屏播放时分p选集列表的宽度
        let multiPageDiv = document.getElementById("multi_page");
        if(multiPageDiv) {
            multiPageDiv.style.width =  uploadButtonRect.x + uploadButtonRect.width -  multiPageDiv.getBoundingClientRect().x + 'px'
            let titleTextWidth = uploadButtonRect.x + uploadButtonRect.width -  multiPageDiv.getBoundingClientRect().x - 16 + 'px'
            GM_addStyle(`.multi-page-v1 .cur-list .list-box li{width: ${titleTextWidth} !important}`)

        }

         // 非全屏时，合集列表显示框
        let sectionListDiv = document.querySelector('#mirror-vdcon > div.right-container.is-in-large-ab > div > div:nth-child(8) > div.base-video-sections-v1 > div.video-sections-content-list');
        if (sectionListDiv) {
            let videoSectionsContainer = document.querySelector('div.base-video-sections-v1')
            let sectionListWidth = uploadButtonRect.x + uploadButtonRect.width -  videoSectionsContainer.getBoundingClientRect().x;
       
            videoSectionsContainer.style.width = sectionListWidth + 'px';
            sectionListDiv.style.height = videoPlayerHeight;

               // 非全屏时，合集列表标题
            let videoEpisodeCardInfoTitleNodeList = document.querySelectorAll('div.video-episode-card__info-title');
            videoEpisodeCardInfoTitleNodeList.forEach((item, index) => {
                item.style.width = sectionListWidth - 60 + 'px';
            });
        }

      

        // 非全屏时，合集列表显示框的高度
        
        let sectionListDivObserver = new MutationObserver(function callback1(mutationRecords, observer) {
            mutationRecords.forEach((item, index) =>{
                // if (item.type == 'childList') {
                    sectionListDiv.style.height = 'fit-content'
                    sectionListDiv.style.maxHeight = videoPlayerHeight;
            })

        });
        let childListChangeObserveConfig = {
            attributes: true,
            attributeFilter:['style'],
            childList: true,
            subtree: false,
        };
        sectionListDivObserver.observe(sectionListDiv, childListChangeObserveConfig);

        // 网页全屏或全屏播放时选集列表的容器的宽度
        GM_addStyle('.bpx-player-ctrl-eplist-menu-wrap{width: 550px}')
    }

    // -------- 以下是处理旧版播放页（2023年以前）
    function handleOldPlayPage() {
        // 常规播放或宽屏播放时选集列表的宽度
        var listDiv = document.querySelector("#multi_page > div.cur-list");
        if (listDiv) {
            listDiv.style.width = CONFIG_WIDTH;
        }

        // 网页全屏或全屏播放时选集列表的宽度
        function callback(mutationRecords, observer) {
            let titleListWrap = document.querySelector("div.bilibili-player-video-btn-menu-wrap");
            if (titleListWrap) {
                titleListWrap.style.width = CONFIG_WIDTH;
                observer.disconnect(); // 一直监听 会收到播放时间的更新，每秒都在触发 callback。所以用完立即 disconnect
                handlePartChangeInFullScreenMode();
            }
        }

        var partTitleListInFullScreenModeElementToObserve = document.querySelector(
            "#bilibiliPlayer > div.bilibili-player-area > div.bilibili-player-video-wrap > "
            + "div.bilibili-player-video-control-wrap > div.bilibili-player-video-control > "
            + "div.bilibili-player-video-control-bottom > div.bilibili-player-video-control-bottom-right"
        );

        let partTitleListInFullScreenModeLoadMutationObserver = new MutationObserver(callback);
        let config = {
            childList: true,
            subtree: true,
        };
        partTitleListInFullScreenModeLoadMutationObserver.observe(partTitleListInFullScreenModeElementToObserve, config);

        // 网页全屏或全屏播放时选集列表的宽度, 如果发生切p， 页面不会reload, 但是宽度复原了，这是处理此种情况，
        // 比原来的 observer 一直监听性能更好，原有的 observer 会收到播放时间的更新，每秒都在触发 callback
        function handlePartChangeInFullScreenMode() {
            let titleListToObserve = document.querySelector("#multi_page > div.cur-list > ul");
            if (!titleListToObserve) {
                return;
            }
            var obser = new MutationObserver(function (mutationRecords, observer) {
                let titleListWrap = document.querySelector("div.bilibili-player-video-btn-menu-wrap");
                if (titleListWrap) {
                    titleListWrap.style.width = CONFIG_WIDTH;
                }
            });
            obser.observe(titleListToObserve, {
                attributes: true,
                subtree: true,
                attributeFilter: ["class"],
            });
        }
    }
})();
