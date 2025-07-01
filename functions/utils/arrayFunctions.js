/**
 * Adds an item to an array if it doesn't already exist
 * @param {Array} currentArray - The current array
 * @param {*} item - The item to add
 * @return {Array} Updated array with the item added (if not already present)
 */
function addToArray(currentArray = [], item) {
  if (!currentArray.includes(item)) {
    return [...currentArray, item];
  }
  return currentArray;
}

/**
 * Removes an item from an array if it exists
 * @param {Array} currentArray - The current array
 * @param {*} item - The item to remove
 * @return {Array} Updated array with the item removed (if it existed)
 */
function removeFromArray(currentArray = [], item) {
  return currentArray.filter((arrayItem) => arrayItem !== item);
}

module.exports = {
  addToArray,
  removeFromArray,
};
