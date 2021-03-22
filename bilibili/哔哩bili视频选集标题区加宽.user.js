// ==UserScript==
// @name         哔哩哔哩（bilibili | B站）多p 视频选集区标题显示加宽
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  哔哩哔哩（bilibili | B站 | b站）多p 视频选集区标题显示加宽
// @author       chulong
// @match       https://www.bilibili.com/video/av*
// @match       https://www.bilibili.com/video/BV*
// ==/UserScript==

(function () {
    "use strict";

    // Your code here...
    const CONFIG_WIDTH = "500px"; // 自定义宽度 觉得宽了或窄了不适合，自己修改这个值

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
})();
