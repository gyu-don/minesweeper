// Assume that a, b are sorted.
function intersection(a, b) {
    let result = [];
    let ai, bi;
    for (ai = bi = 0; ai < a.length && bi < b.length;) {
        if (a[ai] == b[bi]) {
            result.push(a[ai]);
            ai++;
            bi++;
        }
        else if (a[ai] < b[bi]) {
            ai++;
        }
        else {
            bi++;
        }
    }
    return result;
}

// Assume that a, b are sorted.
function complement(a, b) {
    let result = [];
    let ai, bi;
    for(ai=bi=0;ai<a.length&&bi<b.length;){
        if(b[bi] < a[ai]) bi++;
        else if(a[ai] < b[bi]) result.push(a[ai++]);
        else{ ai++; bi++; }
    }
    for(;ai<a.length;) result.push(a[ai++]);
    return result
}

function around(w, h, i) {
    let result = [];
    const x = i % w;
    const y = Math.floor(i / w);
    if (y > 0) {
        if (x > 0) result.push(i - w - 1);
        result.push(i - w);
        if (x < w - 1) result.push(i - w + 1);
    }
    if (x > 0) result.push(i - 1);
    result.push(i);
    if (x < w - 1) result.push(i + 1);
    if (y < h - 1) {
        if (x > 0) result.push(i + w - 1);
        result.push(i + w);
        if (x < w - 1) result.push(i + w + 1);
    }
    return result;
}

function range(n) {
    return Array.from(new Array(n), (_, i) => i);
}
