class Helper {
    static ERR_STATIC_CLASS() { return `Entry is a static class and cannot be instantiated.`; }

    constructor() {
        throw new Error(Entry.ERR_STATIC_CLASS);
    }

    static fetchJson(url) {
        let temp = fs.readFileSync(url, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading the file: ${err}`);
                return;
            }
        });
        return JSON.parse(temp);
    }
    
    static deepEqual(obj1, obj2) {
        if (obj1 === obj2) return true; // Same reference or identical primitive values
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
            return false;
        }
        let keys1 = Object.keys(obj1);
        let keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (let key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!Helper.deepEqual(obj1[key], obj2[key])) return false; // Recursively compare values
        }

        return true;
    }
}

module.exports = Helper;
