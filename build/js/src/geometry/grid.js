function makeGrid(length, width, height, DataCtor, elemSize) {
    DataCtor = DataCtor || Int32Array;
    elemSize = elemSize || 1;
    const data = new DataCtor(length * width * height * elemSize);
    function index(x, y, z) {
        return ((((x * width) + y) * height) + z) * elemSize;
    }
    function set(x, y, z, ...args) {
        const i = index(x, y, z);
        for (let j = 0; j < elemSize; ++j) {
            data[i + j] = args[j];
        }
    }
    function toArray(x, y, z, array = [], offset = 0) {
        const i = index(x, y, z);
        for (let j = 0; j < elemSize; ++j) {
            array[offset + j] = data[i + j];
        }
    }
    function fromArray(x, y, z, array, offset = 0) {
        const i = index(x, y, z);
        for (let j = 0; j < elemSize; ++j) {
            data[i + j] = array[offset + j];
        }
    }
    function copy(grid) {
        data.set(grid.data);
    }
    // function clone() {
    //   return makeGrid(
    //     length, width, height, DataCtor, elemSize
    //   ).copy(this)
    // }
    return { data, index, set, toArray, fromArray, copy };
}
export { makeGrid };
