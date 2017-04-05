import {diffList} from './list-diff';


function Element (tagName, props, children) {
    this.tagName = tagName;
    this.props = props || {};
    this.children = children || [];
}


Element.prototype.render = function () {
    let el = document.createElement(this.tagName),
        props = this.props;
    
    for (var propName in props) {
        let propValue = props[propName];
        el.setAttribute(propName, propValue);
    }

    let children = this.children;

    children.forEach(function (child) {
        let childEl = (child instanceof Element) ? child.render() : document.createTextNode(child);
        el.appendChild(childEl);
    });

    return el;
}


var oldList = [{id: "a"}, {id: "b"}, {id: "c"}, {id: "d"}, {id: "e"}]
var newList = [{id: "c"}, {id: "a"}, {id: "b"}, {id: "e"}, {id: "f"}]
 
var moves = diffList(newList, oldList, "id")
// `moves` is a sequence of actions (remove or insert):  
// type 0 is removing, type 1 is inserting 
// moves: [ 
//   {index: 3, type: 0}, 
//   {index: 0, type: 1, item: {id: "c"}},  
//   {index: 3, type: 0},  
//   {index: 4, type: 1, item: {id: "f"}} 
//  ] 
 
console.log(JSON.stringify(moves.moves));

moves.moves.forEach(function(move) {
  if (move.type === 0) {
    oldList.splice(move.index, 1) // type 0 is removing 
  } else {
    oldList.splice(move.index, 0, move.item) // type 1 is inserting 
  }
})
 
// now `oldList` is equal to `newList` 
// [{id: "c"}, {id: "a"}, {id: "b"}, {id: "e"}, {id: "f"}] 
console.log(oldList) 

var ul = new Element('ul', { id: 'list' }, [
            new Element('li', { class: 'item' }, ['Item 1']),
            new Element('li', { class: 'item' }, ['Item 2']),
            new Element('li', { class: 'item' }, ['Item 3'])
            ]);

var ulRoot = ul.render();
document.body.appendChild(ulRoot);