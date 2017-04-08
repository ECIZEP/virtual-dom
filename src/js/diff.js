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
        // same node, diff
        // first diff props
        let propsPatches = diffProps(newNode,oldNode);
        propsPatches ? currentPatches.push({
            type: PATCH.PROPS,
            props: propsPatches
        }) : void 666;

        // second diff children reorder which contains remove and insert
        let diffChildren = diffList(newNode.children, oldNode.children, "key");
        let newChildren = diffChildren.children;

        // need to reorder
        diffChildren.moves.length > 0 ? currentPatches.push({
            type: PATCH.REORDER,
            moves: diffChildren.moves
        }) : void 666;

        // now dfs
        let leftNode = null;
        let currentIndex  = index;
        oldNode.children.forEach(function (child, i) {
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




  var AGE = 'age'
  var REPUTATION = 'reputation'

  var sortKey = AGE
  var sortType = 1

  var list = [
    {username: 'Jerry', age: 12, reputation: 200, uid: 'user1'},
    {username: 'Pony', age: 33, reputation: 3000, uid: 'user4'},
    {username: 'Lucy', age: 21, reputation: 99, uid: 'user2'},
    {username: 'Tomy', age: 20, reputation:20, uid: 'user3'},
    {username: 'Funky', age: 49, reputation: 521, uid: 'user5'}
  ]

  // render table
  function renderTree () {
    var rows = renderRows()
    return new Element('div', [
      new Element('b', ['sortKey: ' + sortKey, ' | sortType: ' + (sortType ? 'up' : 'down')]),
      new Element('table', [
        new Element('thead', [
          new Element('tr', [
            new Element('th', ['UID']),
            new Element('th', ['NAME']),
            new Element('th', {'id': 'sort-head1', sortKey: 'age'}, ['AGE']),
            new Element('th', {'id': 'sort-head2', sortKey: 'reputation'}, ['REPUTATION'])
          ])
        ]),
        new Element('tbody', rows)
      ])
    ])
  }

  function renderRows() {
    var rows = []
    for (var i = 0, len = list.length; i < len; i++) {
      var item = list[i]
      rows.push(
        new Element('tr', {key: item.uid}, [
          new Element('td', [item.uid]),
          new Element('td', [item.username]),
          new Element('td', [item.age]),
          new Element('td', [item.reputation]),
        ])
      )
    }
    return rows
  }

  var tree = renderTree()
  var dom = tree.render()
  document.body.appendChild(dom)

  var sortTriggers = [
    document.getElementById('sort-head1'),
    document.getElementById('sort-head2')
  ]
  for (var i = 0, len = sortTriggers.length; i < len; i++) {
    var trigger = sortTriggers[i];
    (function(_trigger){
      _trigger.onclick = function () {
        var key = _trigger.getAttribute('sortKey')
        if (key === sortKey) {
          sortType = !sortType
        } else {
          sortKey = key
          sortType = 1
        }
        sortData()
        var newTree = renderTree()
        var patches = diff(newTree, tree)
        console.log(patches);
        tree = newTree
      }
    })(trigger)
  }

  function sortData() {
    list.sort(function (a, b) {
      if (sortType) {
        return a[sortKey] - b[sortKey]
      } else {
        return b[sortKey] - a[sortKey]
      }
    })
  }