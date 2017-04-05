/* O(N)的复杂度解决同一层级上子元素的重排问题
* var oldList = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }];
* var newList = [{ id: "b" }, { id: "a" }, { id: "b" }, { id: "e" }, { id: "f" }];
* 使用插入或者删除，从oldList到newList的变换，尽量复用原有元素
* 不是最优的方法，最优复杂度太高了，对于DOM操作O(N)的这个算法已经OK
// moves: [ 
//   {index: 3, type: 0}, 
//   {index: 0, type: 1, item: {id: "c"}},  
//   {index: 0, type: 0},  
//   {index: 4, type: 1, item: {id: "f"}} 
//  ] 
*/

/**
 * 
 * @param {Array} newList 
 * @param {Array} oldList 
 * @param {Object} key 
 */
function diffList (newList, oldList, key) {
	let newListMap = makeKeyIndexAndFree(newList, key),
		oldListMap = makeKeyIndexAndFree(oldList, key),
		newFree = newListMap.free,
		oldKeyIndex = oldListMap.keyIndex,
		newKeyIndex = newListMap.keyIndex,
		i = 0,
		freeIndex = 0,
		// old中不用删除的子元素数组
		children = [],
		// 记录操作的对象数组，type-0为删除 1位插入
		moves = [];

	// 第一步：使用children过滤一遍oldList，把要newList中不存在的节点干掉
	while (i < oldList.length) {
		let item = oldList[i];
		let itemKey = getKeyValue(item, key);
		if (itemKey) {
			if (newKeyIndex.hasOwnProperty(itemKey)) {
				// 新的list里面有这个元素,把最新的push进去
				let newItemIndex = newKeyIndex[itemKey];
				children.push(newList[newItemIndex]);
			} else {
				// 没有的就是要删除的，push 空，占个位置
				children.push(null);
			}
		} else {
			let freeItem = newFree[freeIndex++];
			children.push(freeItem);
		}
		i++;
	}

	// 第二步，前面过滤的节点，将之删除的操作push进moves数组记录
	i = 0;
	let simulateList = children.slice();
	while (i < simulateList.length) {
		if (simulateList[i] === null) {
			remove(i);
			simulateList.splice(i,1);
		} else {
			i++;
		}
	}

	// 第三步，找出需要插入的元素
	// 遍历一遍newList，同时对比simulate，按序
	i = 0;
	let j = 0;
	while (i < newList.length) {
		let item = newList[i];
		let itemKey = getKeyValue(item, key);

		let simulateItem = simulateList[j];
		let simulateItemKey = getKeyValue(simulateItem, key);

		if (simulateItemKey) {
			if (simulateItemKey === itemKey) {
				// 位置和元素都没有变化，不用动
				j++;
			} else {
				if (!oldKeyIndex.hasOwnProperty(itemKey)) {
					// 这是一个新的元素
					insert(i, item);
				} else {
					// 乱序的旧元素，算法对于这种情况的处理没有用到动规的思想，所以最后的结果不是最好的情况
					let nextSimulateKey = getKeyValue(simulateList[j+1], key);
					if (nextSimulateKey === itemKey) {
						// 简单的判断下，simulate下一个节点和我一样
						remove(i);
						simulateList.splice(j,1);
					} else {
						// 这种情况就只能当新节点插入了
						insert(i,item);
					}
				}
			}
		} else {
			// 没有key标识的，无法判断simulate和newList节点是否为同一个，所以只能当新的节点插入
			insert(i, item);
		}
		i++;
	}

	function remove(i) {
		moves.push({
			type: 0,
			index: i
		});
	}

	function insert(i, item) {
		moves.push({
			type: 1,
			index: i,
			item: item
		});
	}

	return {
		moves: moves,
		children: children
	}

}	

/**
 * 取出对象的元素key所对应的下标
 * 没有下标的放入free中
 * @param {Array} list 
 * @param {String} key 
 */
function makeKeyIndexAndFree(list, key) {
	let keyIndex = {};
	let free = [];

	for (let i = 0; i < list.length; i++) {
		let item = list[i];
		let itemKey = getKeyValue(item, key);
		if (itemKey) {
			// key索引对应值存在，将这个值当做keyIndex的索引，值为i
			keyIndex[itemKey] = i;
		} else {
			// key索引没有，放入free中
			free.push(item);
		}
	}

	return {
		keyIndex: keyIndex,
		free: free
	}
}

function getKeyValue(item, key) {
	if (!item || !key) {
		return void 666;
	} else {
		return typeof key === 'string' ? item[key] : void 6969;
	}
}

exports.diffList = diffList;