import {diffList} from './list-diff';
import {PATCH} from './patch';
import Element from './element';

export default function diff(newTree, oldTree) {
    let index = 0;
    let patches = {};
    dfsWalk(newTree, oldTree, patches, index);
    return patches;
}

/**
 * 
 * @param {Element} newNode 
 * @param {Element} oldNode 
 * @param {Array} patches 
 * @param {Number} index 
 */
function dfsWalk(newNode, oldNode, patches, index) {
    let currentPatches = [];

    if (newNode === null) {
        // remove oldNode,do nothing
    } else if (typeof newNode === 'string' && typeof oldNode === 'string') {
        if (newNode !== oldNode) {
            currentPatches.push({
                type: PATCH.TEXT,
                content: newNode
            });
        }
    } else if (newNode.tagName === oldNode.tagName && newNode.key === oldNode.key) {
        // 标签一样，并且key一致，比较属性值
        let propsPatches = diffProps(newNode,oldNode);
        propsPatches ? currentPatches.push({
            type: PATCH.PROPS,
            props: propsPatches
        }) : void 666;

        // 比较子元素，得到从old --> new 的步骤
        // 如果key都是 undefined，diffList无法优化重排
        let diffChildren = diffList(newNode.children, oldNode.children, "key");
        // newChildren是对应oldNode.children序列的新元素，
        let newChildren = diffChildren.newChildren;

        // 子元素需要重新排序，把重排的步骤压入
        // key:undefined的情况，此处diffChildren.moves为空，按最坏的情况处理，递归进子节点一个一个修改Text
        diffChildren.moves.length > 0 ? currentPatches.push({
            type: PATCH.REORDER,
            moves: diffChildren.moves
        }) : void 666;

        // 深度优先递归
        let leftNode = null;
        let currentIndex  = index;
        oldNode.children.forEach(function (child, i) {
            // 深度优先记录下标
            currentIndex  = (leftNode && leftNode.count)
             ? currentIndex + leftNode.count + 1 : currentIndex + 1;
            // 这里只需要比newNode和oldNode共同拥有的子元素，old的删除，新的直接插
            // 共同有的child比较差异，避免大的DOM操作
            dfsWalk(newChildren[i], child, patches, currentIndex);
            leftNode = child;
        });

    } else {
        // different node replace
        currentPatches.push({
            type: PATCH.REPLACE,
            node: newNode
        });
    }

    currentPatches.length > 0 ? patches[index] = currentPatches : void 666;
}


function diffProps (newNode, oldNode) {
    let propsPatches = {},
        count = 0,
        newProps = newNode.props,
        oldProps = oldNode.props;
    
    // first find out the common but changed props
    for (let key in oldProps) {
        if (newProps[key] !== oldProps[key]) {
            count++;
            propsPatches[key] = newProps[key];
        }
    }

    // find out new props
    for (let key in newProps) {
        if (!oldProps.hasOwnProperty(key)) {
            count++;
            propsPatches[key] = newProps[key];
        }
    }

    if (count === 0) {
        return null;
    }

    return propsPatches;
}