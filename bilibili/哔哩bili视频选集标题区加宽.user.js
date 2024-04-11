// ==UserScript==
// @name        哔哩哔哩（bilibili | B站）多p 合集 视频选集区标题显示加宽
// @namespace   http://tampermonkey.net/
// @version     0.5
// @description 哔哩哔哩（bilibili | B站 | b站）多p 合集 视频选集区标题显示加宽， v0.5 支持2023年新版播放器的合集列表标题显示加宽
// @author      chulong
// @homepage    https://greasyfork.org/zh-CN/scripts/423654
// @match       https://www.bilibili.com/video/av*
// @match       https://www.bilibili.com/video/BV*
// ==/UserScript==

(function () {
    "use strict";

    // Your code here...
    const CONFIG_WIDTH = "550px"; // 自定义宽度 觉得宽了或窄了不适合，自己修改这个值

    // 被监控对象，右下角控制按钮区域， 只有全屏时才会出现选集按钮 这是新版的
    var newPartTitleListInFullScreenModeElementToObserve = document.querySelector(
        "#bilibili-player > div > div > div.bpx-player-primary-area >" +
        "div.bpx-player-video-area > div.bpx-player-control-wrap >" +
        "div.bpx-player-control-entity > div.bpx-player-control-bottom >" +
        "div.bpx-player-control-bottom-right"

    )

    if (newPartTitleListInFullScreenModeElementToObserve) {
        handleNewPlayPage();
    } else {
        handleOldPlayPage();
    }

    function handleNewPlayPage() {
        // 非全屏时，分p 列表显示框
        let multiPageDiv = document.getElementById("multi_page");
        if(multiPageDiv) {
            multiPageDiv.style.width = CONFIG_WIDTH;
        }

         // 非全屏时，合集列表显示框
        let sectionListDiv = document.querySelector('#mirror-vdcon > div.right-container.is-in-large-ab > div > div:nth-child(8) > div.base-video-sections-v1 > div.video-sections-content-list');
        if (sectionListDiv) {
            sectionListDiv.style.width = CONFIG_WIDTH;
        }

         // 非全屏时，合集列表标题
        let videoEpisodeCardInfoTitleNodeList = document.querySelectorAll('div.video-episode-card__info-title');
        videoEpisodeCardInfoTitleNodeList.forEach((item, index) => {
            item.style.width = CONFIG_WIDTH;
        });


        // 新版播放页，  常规播放或宽屏播放时选集列表的宽度
        var liItems = document.querySelectorAll("#multi_page > div.cur-list > ul.list-box li");
        if (liItems) {
           liItems.forEach( function(item, index){
               item.style.width = CONFIG_WIDTH
           });
        }

        // 网页全屏或全屏播放时选集列表的宽度
        function fullScreenCallback(mutationRecords , observer) {
                mutationRecords.forEach((item, index) => {
                    if (item.type == 'childList') {
                        item.addedNodes.forEach((it, i) => {
                            if (it.ariaLabel == "选集") {
                                let titleListWrap = document.querySelector("div.bpx-player-ctrl-eplist-menu-wrap");
                                if (titleListWrap) {
                                    titleListWrap.style.width = CONFIG_WIDTH;
                                    console.log('设置了宽度')
                                }
                            }
                        });
                    }
                });
        }

        let newPartTitleListInFullScreenModeLoadMutationObserver = new MutationObserver(fullScreenCallback);
        let newConfig = {
            childList: true,
            subtree: false,
        };
        newPartTitleListInFullScreenModeLoadMutationObserver.observe(newPartTitleListInFullScreenModeElementToObserve, newConfig);
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
