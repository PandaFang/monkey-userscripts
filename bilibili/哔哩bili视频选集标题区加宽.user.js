// ==UserScript==
// @name         哔哩哔哩（bilibili | B站）多p 视频选集区标题显示加宽
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  哔哩哔哩（bilibili | B站 | b站）多p 视频选集区标题显示加宽
// @author       chulong
// @match       https://www.bilibili.com/video/av*
// @match       https://www.bilibili.com/video/BV*
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    const CONFIG_WIDTH = '500px'

    // 常规播放或宽屏播放时选集列表的宽度
    var listDiv = document.querySelector("#multi_page > div.cur-list")
    if (listDiv) {
        listDiv.style.width = CONFIG_WIDTH;
    }

    // 网页全屏或全屏播放时选集列表的宽度
    function callback(mutationRecords, observer) {
        for (let mutation of mutationRecords) {
            if (mutation.type === 'childList') {
                let nodes = mutation.addedNodes;
                for (let node of nodes) {
                    if (node.nodeName === 'DIV' && node.classList.contains('bilibili-player-video-btn-pagelist')) {
                        let titleListWrap = document.querySelector('div.bilibili-player-video-btn-menu-wrap');
                        if (titleListWrap) {
                            titleListWrap.style.width = CONFIG_WIDTH;
                            mutationObserver.disconnect();
                        }
                    }
                }
            }
        }
    }

    let elementToObserve = document.getElementById('bilibiliPlayer');
    let mutationObserver = new MutationObserver(callback);
    let config = {
        childList: true,
        subtree: true,
    };
    mutationObserver.observe(elementToObserve, config);

})();