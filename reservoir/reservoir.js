
// We want to be able to iterate through the alphabet, either in order, or randomly.
// Not seeing the same letter twice until we hit the reset button.

// Scan values:
const CLAY = 0;
const SAND = 1;
const SETTLED = 2;
const FLOW = 3;
const SPRING = 4;

const SPRINGX = 500;
const SPRINGY = 0;

let minX = Number.MAX_SAFE_INTEGER;
let maxX = -minX;
let minY = Number.MAX_SAFE_INTEGER;
let maxY = -minY;

// The last place we put a flow cell
let curFlowX;
let curFlowY;

scan = []; // our 2D array of the scan 

const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');

document.addEventListener('DOMContentLoaded', () => {
    nextBtn.addEventListener('click', onNext);
    resetBtn.addEventListener('click', onReset);
});


const readInput = () => {

    d3.text("https://mspencev.github.io/puzzles/reservoir/input.txt", (err, text) => {

        if (err) {
            console.log("error fetching data: ", err);
            return;
        }

        console.log('text: ', text.split('\n'));

        clayLocs = []
        text.split('\n').forEach((pair) => {
            // x=495, y=2..7
            if (!pair || pair.length === 0) {
                return;
            }
            const v = pair.split(', ');
            const kv1 = getKeyValues(v[0]); // ex: ['y', [4, 6]]
            const kv2 = getKeyValues(v[1]);
            // Assume either x or y may have multiple values, but not both
            if (kv1[1].length > 1) {
                kv1[1].forEach((val) => {
                    const loc = {}
                    loc[kv2[0]] = kv2[1][0];
                    loc[kv1[0]] = val;
                    addClayLoc(loc);
                })
            } else if (kv2[1].length > 1) {
                kv2[1].forEach((val) => {
                    const loc = {}
                    loc[kv1[0]] = kv1[1][0];
                    loc[kv2[0]] = val;
                    addClayLoc(loc);
                })
            } else {
                const loc = {}
                loc[kv1[0]] = kv1[1][0];
                loc[kv2[0]] = kv2[1][0];
                addClayLoc(loc);
            }
        });

        populateScan(clayLocs);

        curFlowX = SPRINGX - minX;
        curFlowY = SPRINGY;
        drawScan();
        // flow();
    });
}

const addClayLoc = (loc) => {
    maxX = maxX < loc['x'] ? loc['x'] : maxX;
    maxY = maxY < loc['y'] ? loc['y'] : maxY;
    minX = minX > loc['x'] ? loc['x'] : minX;
    minY = minY > loc['y'] ? loc['y'] : minY;
    clayLocs.push(loc);
};

/**
 * Returns array, index 0 = key ('x', or 'y'), and 1 = array of integer values.
 * @param {} keyValuesStr 
 */
const getKeyValues = (keyValuesStr) => {
    const kv = keyValuesStr.split('=');
    const key = kv[0];
    const val = [];
    if (kv[1].indexOf('..') > 0) {
        let range = kv[1].split('..');
        range = [Number.parseInt(range[0]), Number.parseInt(range[1])];
        for (let i = range[0]; i <= range[1]; ++i) {
            val.push(i);
        }
    } else {
        val.push(Number.parseInt(kv[1]));
    }

    return [key, val];
}

populateScan = (clayLocs) => {

    // Assuming:  Y values are fine as is (i.e. 0 is the "top" y value, y = 1 is the row just below it).
    // Assuming:  X values can start at any number (not necessarily from 0)

    // Initialize
    for (let x = minX; x <= maxX; ++x) {
        scan.push([]);
        for (let y = 0; y <= maxY; ++y) {
            scan[x - minX][y] = SAND;
        }
    }

    clayLocs.forEach((loc) => {
        scan[loc.x - minX][loc.y] = CLAY;
    });

    // Insert spring row
    scan[SPRINGX - minX][SPRINGY] = SPRING;
};


/*
where to place the next flow?

Current flow at x, y:

look down:
	y+1 > maxY ?  Finished!!
	Sand ? -> put flow, x, y+1
	Clay ? -> look left
	Flow ? -> look left ?? Should never get here
	Settled ? -> look left

look left:
	Sand ? -> sand below it ? put flow; x-1, y || clay below it? put flow; x-1, y || settled below it ? put flow; x-1, y
	Clay ? -> look right  
	Flow ? -> look left
	Settled ? -> look left // Should never get here

look right:
	Sand ? -> sand below it ? put flow; x+1, y || clay below it? put flow; x+1, y || settled below it?  put flow; x+1, y
	Clay ? -> turn row into settled; x, y-1
	Flow ? -> look right
	Settled ? -> look right // should never get here
*/

placeNextFlow = () => {

    // Look down
    if (curFlowY + 1 > maxY) {
        console.log('Found the bottom!', curFlowY, maxY);
        nextBtn.classList.add('disabled');
        return;
    }

    const down = scan[curFlowX][curFlowY + 1];
    switch (down) {
        case SAND:
            setScan(FLOW, curFlowX, curFlowY + 1)
            break;
        case CLAY:
            lookLeft(curFlowX, curFlowY);
            break;
        case FLOW:
            lookLeft(curFlowX, curFlowY);
            break;
        case SETTLED:
            lookLeft(curFlowX, curFlowY);
            break;
    }
}

/**
 * x, y = the cell we are to look left of
 */
lookLeft = (x, y) => {
    const left = scan[x - 1][y];
    switch (left) {
        case SAND:
            setScan(FLOW, x - 1, y);
            break;
        case CLAY:
            lookRight(x, y);
            break;
        case FLOW:
            lookLeft(x - 1, y);
            break;
        case SETTLED:
            lookLeft(x - 1, y);
            console.log('Should never get here');
            break;
    }
}


/**
 * x, y = the cell we are to look right of
 */
lookRight = (x, y) => {
    const right = scan[x + 1][y];
    switch (right) {
        case SAND:
            setScan(FLOW, x + 1, y);
            break;
        case CLAY:
            settleRow(x, y);
            lookLeft(x, y - 1);
            break;
        case FLOW:
            lookRight(x + 1, y);
            break;
        case SETTLED:
            lookRight(x + 1, y);
            console.log('Should never get here');
            break;
    }
}

settleRow = (x, y) => {

    let i = x;
    let val = scan[x][y];
    while (val != CLAY) {
        scan[i][y] = SETTLED;
        i -= 1;
        val = scan[i][y];
    }
    i = x;
    val = scan[x][y];
    while (val != CLAY) {
        scan[i][y] = SETTLED;
        i += 1;
        val = scan[i][y];
    }
};

setScan = (cellValue, x, y) => {
    scan[x][y] = cellValue;
    curFlowX = x;
    curFlowY = y;
    drawScan();
}

onNext = () => {
    placeNextFlow();
    drawScan();
}

readInput();
