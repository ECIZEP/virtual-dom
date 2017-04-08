import Util from './util';


const PATCH = {
    REPLACE: 'replace',
    REORDER: 'reorder',
    PROPS: 'props',
    TEXT: 'text'
}


function patch (dom, patches) {
    let walker = {index: 0};
    dfsWalker(dom, patches, walker);
}

function dfsWalker (dom, patches, walker) {
    let currentPatches = patches[walker.index];

    let length = dom.childNodes ? dom.childNodes.length : 0;

    // 依旧深度遍历，和diff的深度遍历技巧不一样，这次不用计算count，使用了对象--引用
    for (let i = 0; i < length; i++) {
        walker.index++;
        dfsWalker(dom.childNodes[i], patches, walker);
    }

    // 等子元素patch后patch, 否则出错
    if (currentPatches) {
        applyPatched(dom, currentPatches);
    }
}


function applyPatched (dom, currentPatches) {
    currentPatches.forEach(function (patch){
        switch(patch.type) {
            case PATCH.REPLACE:
                let newNode = (typeof patch.node === 'string') ?
                    document.createTextNode(patch.node) : patch.node.render();
                dom.parentNode.replaceChild(newNode, dom);
                break;
            case PATCH.REORDER: 
                reorderChildNodes(dom, patch.moves);
                break;
            case PATCH.PROPS:
                let props = patch.props;
                for (let key in props) {
                    if (typeof props[key] === 'undefined') {
                        dom.removeAttribute(key);
                    } else {
                        Util.setAttr(dom, key, props[key]);
                    }
                }
                break;
            case PATCH.TEXT: 
                dom.nodeValue = patch.content;
                break;
        }
    });
}

function reorderChildNodes(dom, moves) {
    let staticChildNodes = [].slice.call(dom.childNodes);

    let map = {};
    staticChildNodes.forEach(function (child) {
        let keyValue = child.getAttribute("key");
        if (keyValue) {
            map[keyValue] = child;
        }
    });

    moves.forEach(function (move){
        let index = move.index;
        if (move.type === "remove") {
            dom.removeChild(dom.childNodes[index]);
            staticChildNodes.splice(index, 1);
        } else if (move.type === 'insert') {
            let key = move.item.key;
            // 元素复用， 因为递归时是先更新子元素，所以此处复用的子元素已经是最新的
            let insertNode = map[key] ? map[key] 
                : typeof move.item === 'string' 
                ? document.createTextNode(move.item) 
                : move.item.render();
            staticChildNodes.splice(index, 0, insertNode);
            dom.insertBefore(insertNode, dom.childNodes[index] || null);
        }
    });
}

exports.PATCH = PATCH;
exports.patch = patch;