
/**
 * 
 * @param {String} tagName 
 * @param {Object} props 
 * @param {Array} children 
 */
export default function Element(tagName, props, children) {
    this.tagName = tagName;
    this.props = props || {};
    this.children = children || [];
    this.key = props ? props.key : void 666;

    if (props instanceof Array) {
        this.children = props;
        this.props = {};
    }

    let count = 0;
    if (this.children) {
        let self = this;
        this.children.forEach(function (child, index) {
            if (child instanceof Element) {
                // 元素节点
                count += child.count;
            } else {
                self.children[index] = '' + child;
            }
            count++;
        });
    }
    this.count = count;

}


Element.prototype.render = function () {
    let el = document.createElement(this.tagName),
        props = this.props;

    for (let propName in props) {
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

/*
var ul = new Element('ul', { id: 'list' }, [
            new Element('li', { class: 'item' }, ['Item 1']),
            new Element('li', { class: 'item' }, ['Item 2']),
            new Element('li', { class: 'item' }, ['Item 3'])
            ]);

var ulRoot = ul.render();
document.body.appendChild(ulRoot);*/