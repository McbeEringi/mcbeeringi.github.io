import { EditorView, ViewPlugin, gutter, Decoration, GutterMarker, WidgetType } from "./@codemirror-view.js";
import { Facet, StateEffect, StateField, EditorSelection, Prec, RangeSet, RangeSetBuilder, Compartment, EditorState, ChangeSet, Text } from "./@codemirror-state.js";
import { StyleModule } from "./style-mod.js";
import { language, highlightingFor } from "./@codemirror-language.js";
import { highlightTree } from "./@lezer-highlight.js";

// This algorithm was heavily inspired by Neil Fraser's
// diff-match-patch library. See https://github.com/google/diff-match-patch/
/**
A changed range.
*/
class Change {
    constructor(
    /**
    The start of the change in document A.
    */
    fromA, 
    /**
    The end of the change in document A. This is equal to `fromA`
    in case of insertions.
    */
    toA, 
    /**
    The start of the change in document B.
    */
    fromB, 
    /**
    The end of the change in document B. This is equal to `fromB`
    for deletions.
    */
    toB) {
        this.fromA = fromA;
        this.toA = toA;
        this.fromB = fromB;
        this.toB = toB;
    }
    /**
    @internal
    */
    offset(offA, offB) {
        return new Change(this.fromA + offA, this.toA + offA, this.fromB + offB, this.toB + offB);
    }
}
function findDiff(a, fromA, toA, b, fromB, toB) {
    if (a == b)
        return [];
    // Remove identical prefix and suffix
    let prefix = commonPrefix(a, fromA, toA, b, fromB, toB);
    let suffix = commonSuffix(a, fromA + prefix, toA, b, fromB + prefix, toB);
    fromA += prefix;
    toA -= suffix;
    fromB += prefix;
    toB -= suffix;
    let lenA = toA - fromA, lenB = toB - fromB;
    // Nothing left in one of them
    if (!lenA || !lenB)
        return [new Change(fromA, toA, fromB, toB)];
    // Try to find one string in the other to cover cases with just 2
    // deletions/insertions.
    if (lenA > lenB) {
        let found = a.slice(fromA, toA).indexOf(b.slice(fromB, toB));
        if (found > -1)
            return [
                new Change(fromA, fromA + found, fromB, fromB),
                new Change(fromA + found + lenB, toA, toB, toB)
            ];
    }
    else if (lenB > lenA) {
        let found = b.slice(fromB, toB).indexOf(a.slice(fromA, toA));
        if (found > -1)
            return [
                new Change(fromA, fromA, fromB, fromB + found),
                new Change(toA, toA, fromB + found + lenA, toB)
            ];
    }
    // Only one character left on one side, does not occur in other
    // string.
    if (lenA == 1 || lenB == 1)
        return [new Change(fromA, toA, fromB, toB)];
    // Try to split the problem in two by finding a substring of one of
    // the strings in the other.
    let half = halfMatch(a, fromA, toA, b, fromB, toB);
    if (half) {
        let [sharedA, sharedB, sharedLen] = half;
        return findDiff(a, fromA, sharedA, b, fromB, sharedB)
            .concat(findDiff(a, sharedA + sharedLen, toA, b, sharedB + sharedLen, toB));
    }
    // Fall back to more expensive general search for a shared
    // subsequence.
    return findSnake(a, fromA, toA, b, fromB, toB);
}
let scanLimit = 1e9;
// Implementation of Myers 1986 "An O(ND) Difference Algorithm and Its Variations"
function findSnake(a, fromA, toA, b, fromB, toB) {
    let lenA = toA - fromA, lenB = toB - fromB;
    if (scanLimit < 1e9 && Math.min(lenA, lenB) > scanLimit * 16) {
        if (Math.min(lenA, lenB) > scanLimit * 64)
            return [new Change(fromA, toA, fromB, toB)];
        return crudeMatch(a, fromA, toA, b, fromB, toB);
    }
    let off = Math.ceil((lenA + lenB) / 2);
    frontier1.reset(off);
    frontier2.reset(off);
    let match1 = (x, y) => a.charCodeAt(fromA + x) == b.charCodeAt(fromB + y);
    let match2 = (x, y) => a.charCodeAt(toA - x - 1) == b.charCodeAt(toB - y - 1);
    let test1 = (lenA - lenB) % 2 != 0 ? frontier2 : null, test2 = test1 ? null : frontier1;
    for (let depth = 0; depth < off; depth++) {
        if (depth > scanLimit)
            return crudeMatch(a, fromA, toA, b, fromB, toB);
        let done = frontier1.advance(depth, lenA, lenB, off, test1, false, match1) ||
            frontier2.advance(depth, lenA, lenB, off, test2, true, match2);
        if (done)
            return bisect(a, fromA, toA, fromA + done[0], b, fromB, toB, fromB + done[1]);
    }
    // No commonality at all.
    return [new Change(fromA, toA, fromB, toB)];
}
class Frontier {
    constructor() {
        this.vec = [];
    }
    reset(off) {
        this.len = off << 1;
        for (let i = 0; i < this.len; i++)
            this.vec[i] = -1;
        this.vec[off + 1] = 0;
        this.start = this.end = 0;
    }
    advance(depth, lenX, lenY, vOff, other, fromBack, match) {
        for (let k = -depth + this.start; k <= depth - this.end; k += 2) {
            let off = vOff + k;
            let x = k == -depth || (k != depth && this.vec[off - 1] < this.vec[off + 1])
                ? this.vec[off + 1] : this.vec[off - 1] + 1;
            let y = x - k;
            while (x < lenX && y < lenY && match(x, y)) {
                x++;
                y++;
            }
            this.vec[off] = x;
            if (x > lenX) {
                this.end += 2;
            }
            else if (y > lenY) {
                this.start += 2;
            }
            else if (other) {
                let offOther = vOff + (lenX - lenY) - k;
                if (offOther >= 0 && offOther < this.len && other.vec[offOther] != -1) {
                    if (!fromBack) {
                        let xOther = lenX - other.vec[offOther];
                        if (x >= xOther)
                            return [x, y];
                    }
                    else {
                        let xOther = other.vec[offOther];
                        if (xOther >= lenX - x)
                            return [xOther, vOff + xOther - offOther];
                    }
                }
            }
        }
        return null;
    }
}
// Reused across calls to avoid growing the vectors again and again
const frontier1 = /*@__PURE__*/new Frontier, frontier2 = /*@__PURE__*/new Frontier;
// Given a position in both strings, recursively call `findDiff` with
// the sub-problems before and after that position. Make sure cut
// points lie on character boundaries.
function bisect(a, fromA, toA, splitA, b, fromB, toB, splitB) {
    let stop = false;
    if (!validIndex(a, splitA) && ++splitA == toA)
        stop = true;
    if (!validIndex(b, splitB) && ++splitB == toB)
        stop = true;
    if (stop)
        return [new Change(fromA, toA, fromB, toB)];
    return findDiff(a, fromA, splitA, b, fromB, splitB).concat(findDiff(a, splitA, toA, b, splitB, toB));
}
function chunkSize(lenA, lenB) {
    let size = 1, max = Math.min(lenA, lenB);
    while (size < max)
        size = size << 1;
    return size;
}
// Common prefix length of the given ranges. Because string comparison
// is so much faster than a JavaScript by-character loop, this
// compares whole chunks at a time.
function commonPrefix(a, fromA, toA, b, fromB, toB) {
    if (fromA == toA || fromA == toB || a.charCodeAt(fromA) != b.charCodeAt(fromB))
        return 0;
    let chunk = chunkSize(toA - fromA, toB - fromB);
    for (let pA = fromA, pB = fromB;;) {
        let endA = pA + chunk, endB = pB + chunk;
        if (endA > toA || endB > toB || a.slice(pA, endA) != b.slice(pB, endB)) {
            if (chunk == 1)
                return pA - fromA - (validIndex(a, pA) ? 0 : 1);
            chunk = chunk >> 1;
        }
        else if (endA == toA || endB == toB) {
            return endA - fromA;
        }
        else {
            pA = endA;
            pB = endB;
        }
    }
}
// Common suffix length
function commonSuffix(a, fromA, toA, b, fromB, toB) {
    if (fromA == toA || fromB == toB || a.charCodeAt(toA - 1) != b.charCodeAt(toB - 1))
        return 0;
    let chunk = chunkSize(toA - fromA, toB - fromB);
    for (let pA = toA, pB = toB;;) {
        let sA = pA - chunk, sB = pB - chunk;
        if (sA < fromA || sB < fromB || a.slice(sA, pA) != b.slice(sB, pB)) {
            if (chunk == 1)
                return toA - pA - (validIndex(a, pA) ? 0 : 1);
            chunk = chunk >> 1;
        }
        else if (sA == fromA || sB == fromB) {
            return toA - sA;
        }
        else {
            pA = sA;
            pB = sB;
        }
    }
}
// a assumed to be be longer than b
function findMatch(a, fromA, toA, b, fromB, toB, size, divideTo) {
    let rangeB = b.slice(fromB, toB);
    // Try some substrings of A of length `size` and see if they exist
    // in B.
    let best = null;
    for (;;) {
        if (best || size < divideTo)
            return best;
        for (let start = fromA + size;;) {
            if (!validIndex(a, start))
                start++;
            let end = start + size;
            if (!validIndex(a, end))
                end += end == start + 1 ? 1 : -1;
            if (end >= toA)
                break;
            let seed = a.slice(start, end);
            let found = -1;
            while ((found = rangeB.indexOf(seed, found + 1)) != -1) {
                let prefixAfter = commonPrefix(a, end, toA, b, fromB + found + seed.length, toB);
                let suffixBefore = commonSuffix(a, fromA, start, b, fromB, fromB + found);
                let length = seed.length + prefixAfter + suffixBefore;
                if (!best || best[2] < length)
                    best = [start - suffixBefore, fromB + found - suffixBefore, length];
            }
            start = end;
        }
        if (divideTo < 0)
            return best;
        size = size >> 1;
    }
}
// Find a shared substring that is at least half the length of the
// longer range. Returns an array describing the substring [startA,
// startB, len], or null.
function halfMatch(a, fromA, toA, b, fromB, toB) {
    let lenA = toA - fromA, lenB = toB - fromB;
    if (lenA < lenB) {
        let result = halfMatch(b, fromB, toB, a, fromA, toA);
        return result && [result[1], result[0], result[2]];
    }
    // From here a is known to be at least as long as b
    if (lenA < 4 || lenB * 2 < lenA)
        return null;
    return findMatch(a, fromA, toA, b, fromB, toB, Math.floor(lenA / 4), -1);
}
function crudeMatch(a, fromA, toA, b, fromB, toB) {
    let lenA = toA - fromA, lenB = toB - fromB;
    let result;
    if (lenA < lenB) {
        let inv = findMatch(b, fromB, toB, a, fromA, toA, Math.floor(lenA / 6), 50);
        result = inv && [inv[1], inv[0], inv[2]];
    }
    else {
        result = findMatch(a, fromA, toA, b, fromB, toB, Math.floor(lenB / 6), 50);
    }
    if (!result)
        return [new Change(fromA, toA, fromB, toB)];
    let [sharedA, sharedB, sharedLen] = result;
    return findDiff(a, fromA, sharedA, b, fromB, sharedB)
        .concat(findDiff(a, sharedA + sharedLen, toA, b, sharedB + sharedLen, toB));
}
function mergeAdjacent(changes, minGap) {
    for (let i = 1; i < changes.length; i++) {
        let prev = changes[i - 1], cur = changes[i];
        if (prev.toA > cur.fromA - minGap && prev.toB > cur.fromB - minGap) {
            changes[i - 1] = new Change(prev.fromA, cur.toA, prev.fromB, cur.toB);
            changes.splice(i--, 1);
        }
    }
}
// Reorder and merge changes
function normalize(a, b, changes) {
    for (;;) {
        mergeAdjacent(changes, 1);
        let moved = false;
        // Move unchanged ranges that can be fully moved across an
        // adjacent insertion/deletion, to simplify the diff.
        for (let i = 0; i < changes.length; i++) {
            let ch = changes[i], pre, post;
            // The half-match heuristic sometimes produces non-minimal
            // diffs. Strip matching pre- and post-fixes again here.
            if (pre = commonPrefix(a, ch.fromA, ch.toA, b, ch.fromB, ch.toB))
                ch = changes[i] = new Change(ch.fromA + pre, ch.toA, ch.fromB + pre, ch.toB);
            if (post = commonSuffix(a, ch.fromA, ch.toA, b, ch.fromB, ch.toB))
                ch = changes[i] = new Change(ch.fromA, ch.toA - post, ch.fromB, ch.toB - post);
            let lenA = ch.toA - ch.fromA, lenB = ch.toB - ch.fromB;
            // Only look at plain insertions/deletions
            if (lenA && lenB)
                continue;
            let beforeLen = ch.fromA - (i ? changes[i - 1].toA : 0);
            let afterLen = (i < changes.length - 1 ? changes[i + 1].fromA : a.length) - ch.toA;
            if (!beforeLen || !afterLen)
                continue;
            let text = lenA ? a.slice(ch.fromA, ch.toA) : b.slice(ch.fromB, ch.toB);
            if (beforeLen <= text.length &&
                a.slice(ch.fromA - beforeLen, ch.fromA) == text.slice(text.length - beforeLen)) {
                // Text before matches the end of the change
                changes[i] = new Change(ch.fromA - beforeLen, ch.toA - beforeLen, ch.fromB - beforeLen, ch.toB - beforeLen);
                moved = true;
            }
            else if (afterLen <= text.length &&
                a.slice(ch.toA, ch.toA + afterLen) == text.slice(0, afterLen)) {
                // Text after matches the start of the change
                changes[i] = new Change(ch.fromA + afterLen, ch.toA + afterLen, ch.fromB + afterLen, ch.toB + afterLen);
                moved = true;
            }
        }
        if (!moved)
            break;
    }
    return changes;
}
// Process a change set to make it suitable for presenting to users.
function makePresentable(changes, a, b) {
    for (let posA = 0, i = 0; i < changes.length; i++) {
        let change = changes[i];
        let lenA = change.toA - change.fromA, lenB = change.toB - change.fromB;
        // Don't touch short insertions or deletions.
        if (lenA && lenB || lenA > 3 || lenB > 3) {
            let nextChangeA = i == changes.length - 1 ? a.length : changes[i + 1].fromA;
            let maxScanBefore = change.fromA - posA, maxScanAfter = nextChangeA - change.toA;
            let boundBefore = findWordBoundaryBefore(a, change.fromA, Math.min(maxScanBefore, 5));
            let boundAfter = findWordBoundaryAfter(a, change.toA, Math.min(maxScanAfter, 5));
            let lenBefore = change.fromA - boundBefore, lenAfter = boundAfter - change.toA;
            if (!lenA || !lenB) {
                let changeLen = Math.max(lenA, lenB);
                let [changeText, changeFrom, changeTo] = lenA ? [a, change.fromA, change.toA] : [b, change.fromB, change.toB];
                let indentBefore, indentLen;
                // An insertion or deletion that falls inside words on both
                // sides can maybe be moved to align with word boundaries.
                if (lenBefore && lenAfter) {
                    if (changeLen > lenBefore &&
                        a.slice(boundBefore, change.fromA) == changeText.slice(changeTo - lenBefore, changeTo)) {
                        change = changes[i] = new Change(boundBefore, boundBefore + lenA, change.fromB - lenBefore, change.toB - lenBefore);
                        boundBefore = change.fromA;
                        boundAfter = findWordBoundaryAfter(a, change.toA, Math.min(nextChangeA - change.toA, 5));
                    }
                    else if (changeLen > lenAfter &&
                        a.slice(change.toA, boundAfter) == changeText.slice(changeFrom, changeFrom + lenAfter)) {
                        change = changes[i] = new Change(boundAfter - lenA, boundAfter, change.fromB + lenAfter, change.toB + lenAfter);
                        boundAfter = change.toA;
                        boundBefore = findWordBoundaryBefore(a, change.fromA, Math.min(change.fromA - posA, 5));
                    }
                    lenBefore = change.fromA - boundBefore;
                    lenAfter = boundAfter - change.toA;
                    // Indentation before the change is repeated at its end. Move it across.
                }
                else if (!lenBefore && !lenAfter &&
                    (indentLen = change.fromA - (indentBefore = findIndentBefore(a, change.fromA, maxScanBefore))) &&
                    a.slice(indentBefore, change.fromA) == changeText.slice(changeTo - indentLen, changeTo)) {
                    change = changes[i] = new Change(indentBefore, indentBefore + lenA, change.fromB - indentLen, change.toB - indentLen);
                }
            }
            // Grow the change to the word boundaries.
            if (lenBefore || lenAfter) {
                change = changes[i] = new Change(change.fromA - lenBefore, change.toA + lenAfter, change.fromB - lenBefore, change.toB + lenAfter);
            }
            posA = change.toA;
        }
    }
    mergeAdjacent(changes, 3);
    return changes;
}
let wordChar;
try {
    wordChar = /*@__PURE__*/new RegExp("[\\p{Alphabetic}\\p{Number}]", "u");
}
catch (_) { }
function asciiWordChar(code) {
    return code > 48 && code < 58 || code > 64 && code < 91 || code > 96 && code < 123;
}
function wordCharAfter(s, pos) {
    if (pos == s.length)
        return 0;
    let next = s.charCodeAt(pos);
    if (next < 192)
        return asciiWordChar(next) ? 1 : 0;
    if (!wordChar)
        return 0;
    if (!isSurrogate1(next) || pos == s.length - 1)
        return wordChar.test(String.fromCharCode(next)) ? 1 : 0;
    return wordChar.test(s.slice(pos, pos + 2)) ? 2 : 0;
}
function wordCharBefore(s, pos) {
    if (!pos)
        return 0;
    let prev = s.charCodeAt(pos - 1);
    if (prev < 192)
        return asciiWordChar(prev) ? 1 : 0;
    if (!wordChar)
        return 0;
    if (!isSurrogate2(prev) || pos == 1)
        return wordChar.test(String.fromCharCode(prev)) ? 1 : 0;
    return wordChar.test(s.slice(pos - 2, pos)) ? 2 : 0;
}
function findWordBoundaryAfter(s, pos, max) {
    if (pos == s.length || !wordCharBefore(s, pos))
        return pos;
    for (let cur = pos, end = pos + max;;) {
        let size = wordCharAfter(s, cur);
        if (!size)
            return cur;
        cur += size;
        if (cur > end)
            return pos;
    }
}
function findWordBoundaryBefore(s, pos, max) {
    if (!pos || !wordCharAfter(s, pos))
        return pos;
    for (let cur = pos, end = pos - max;;) {
        let size = wordCharBefore(s, cur);
        if (!size)
            return cur;
        cur -= size;
        if (cur < end)
            return pos;
    }
}
function findIndentBefore(s, pos, max) {
    for (let cur = pos, end = pos - max;;) {
        let next = cur ? s.charCodeAt(cur - 1) : 10;
        if (next == 10)
            return cur;
        cur--;
        if (cur < end || (next != 32 && next != 9))
            return pos;
    }
}
const isSurrogate1 = (code) => code >= 0xD800 && code <= 0xDBFF;
const isSurrogate2 = (code) => code >= 0xDC00 && code <= 0xDFFF;
// Returns false if index looks like it is in the middle of a
// surrogate pair.
function validIndex(s, index) {
    return !index || index == s.length || !isSurrogate1(s.charCodeAt(index - 1)) || !isSurrogate2(s.charCodeAt(index));
}
/**
Compute the difference between two strings.
*/
function diff(a, b, config) {
    var _a;
    scanLimit = ((_a = config === null || config === void 0 ? void 0 : config.scanLimit) !== null && _a !== void 0 ? _a : 1e9) >> 1;
    return normalize(a, b, findDiff(a, 0, a.length, b, 0, b.length));
}
/**
Compute the difference between the given strings, and clean up the
resulting diff for presentation to users by dropping short
unchanged ranges, and aligning changes to word boundaries when
appropriate.
*/
function presentableDiff(a, b, config) {
    return makePresentable(diff(a, b, config), a, b);
}

const mergeConfig = /*@__PURE__*/Facet.define({
    combine: values => values[0]
});
const setChunks = /*@__PURE__*/StateEffect.define();
const ChunkField = /*@__PURE__*/StateField.define({
    create(state) {
        return null;
    },
    update(current, tr) {
        for (let e of tr.effects)
            if (e.is(setChunks))
                current = e.value;
        return current;
    }
});
/**
Get the changed chunks for the merge view that this editor is part
of, plus the side it is on if it is part of a `MergeView`. Returns
null if the editor doesn't have a merge extension active or the
merge view hasn't finished initializing yet.
*/
function getChunks(state) {
    let field = state.field(ChunkField, false);
    if (!field)
        return null;
    let conf = state.facet(mergeConfig);
    return { chunks: field, side: conf ? conf.side : null };
}
let moveByChunk = (dir) => ({ state, dispatch }) => {
    let chunks = state.field(ChunkField, false), conf = state.facet(mergeConfig);
    if (!chunks || !chunks.length || !conf)
        return false;
    let { head } = state.selection.main, pos = 0;
    for (let i = chunks.length - 1; i >= 0; i--) {
        let chunk = chunks[i];
        let [from, to] = conf.side == "b" ? [chunk.fromB, chunk.toB] : [chunk.fromA, chunk.toA];
        if (to < head) {
            pos = i + 1;
            break;
        }
        if (from <= head) {
            if (chunks.length == 1)
                return false;
            pos = i + (dir < 0 ? 0 : 1);
            break;
        }
    }
    let next = chunks[(pos + (dir < 0 ? chunks.length - 1 : 0)) % chunks.length];
    let [from, to] = conf.side == "b" ? [next.fromB, next.toB] : [next.fromA, next.toA];
    dispatch(state.update({
        selection: { anchor: from },
        userEvent: "select.byChunk",
        effects: EditorView.scrollIntoView(EditorSelection.range(to, from))
    }));
    return true;
};
/**
Move the selection to the next changed chunk.
*/
const goToNextChunk = /*@__PURE__*/moveByChunk(1);
/**
Move the selection to the previous changed chunk.
*/
const goToPreviousChunk = /*@__PURE__*/moveByChunk(-1);

/**
A chunk describes a range of lines which have changed content in
them. Either side (a/b) may either be empty (when its `to` is
equal to its `from`), or points at a range starting at the start
of the first changed line, to 1 past the end of the last changed
line. Note that `to` positions may point past the end of the
document. Use `endA`/`endB` if you need an end position that is
certain to be a valid document position.
*/
class Chunk {
    constructor(
    /**
    The individual changes inside this chunk. These are stored
    relative to the start of the chunk, so you have to add
    `chunk.fromA`/`fromB` to get document positions.
    */
    changes, 
    /**
    The start of the chunk in document A.
    */
    fromA, 
    /**
    The end of the chunk in document A. This is equal to `fromA`
    when the chunk covers no lines in document A, or is one unit
    past the end of the last line in the chunk if it does.
    */
    toA, 
    /**
    The start of the chunk in document B.
    */
    fromB, 
    /**
    The end of the chunk in document A.
    */
    toB) {
        this.changes = changes;
        this.fromA = fromA;
        this.toA = toA;
        this.fromB = fromB;
        this.toB = toB;
    }
    /**
    @internal
    */
    offset(offA, offB) {
        return offA || offB
            ? new Chunk(this.changes, this.fromA + offA, this.toA + offA, this.fromB + offB, this.toB + offB)
            : this;
    }
    /**
    Returns `fromA` if the chunk is empty in A, or the end of the
    last line in the chunk otherwise.
    */
    get endA() { return Math.max(this.fromA, this.toA - 1); }
    /**
    Returns `fromB` if the chunk is empty in B, or the end of the
    last line in the chunk otherwise.
    */
    get endB() { return Math.max(this.fromB, this.toB - 1); }
    /**
    Build a set of changed chunks for the given documents.
    */
    static build(a, b, conf) {
        return toChunks(presentableDiff(a.toString(), b.toString(), conf), a, b, 0, 0);
    }
    /**
    Update a set of chunks for changes in document A. `a` should
    hold the updated document A.
    */
    static updateA(chunks, a, b, changes, conf) {
        return updateChunks(findRangesForChange(chunks, changes, true, b.length), chunks, a, b, conf);
    }
    /**
    Update a set of chunks for changes in document B.
    */
    static updateB(chunks, a, b, changes, conf) {
        return updateChunks(findRangesForChange(chunks, changes, false, a.length), chunks, a, b, conf);
    }
}
function fromLine(fromA, fromB, a, b) {
    let lineA = a.lineAt(fromA), lineB = b.lineAt(fromB);
    return lineA.to == fromA && lineB.to == fromB && fromA < a.length && fromB < b.length
        ? [fromA + 1, fromB + 1] : [lineA.from, lineB.from];
}
function toLine(toA, toB, a, b) {
    let lineA = a.lineAt(toA), lineB = b.lineAt(toB);
    return lineA.from == toA && lineB.from == toB ? [toA, toB] : [lineA.to + 1, lineB.to + 1];
}
function toChunks(changes, a, b, offA, offB) {
    let chunks = [];
    for (let i = 0; i < changes.length; i++) {
        let change = changes[i];
        let [fromA, fromB] = fromLine(change.fromA + offA, change.fromB + offB, a, b);
        let [toA, toB] = toLine(change.toA + offA, change.toB + offB, a, b);
        let chunk = [change.offset(-fromA + offA, -fromB + offB)];
        while (i < changes.length - 1) {
            let next = changes[i + 1];
            let [nextA, nextB] = fromLine(next.fromA + offA, next.fromB + offB, a, b);
            if (nextA > toA + 1 && nextB > toB + 1)
                break;
            chunk.push(next.offset(-fromA + offA, -fromB + offB));
            [toA, toB] = toLine(next.toA + offA, next.toB + offB, a, b);
            i++;
        }
        chunks.push(new Chunk(chunk, fromA, Math.max(fromA, toA), fromB, Math.max(fromB, toB)));
    }
    return chunks;
}
const updateMargin = 1000;
// Finds the given position in the chunks. Returns the extent of the
// chunk it overlaps with if it overlaps, or a position corresponding
// to that position on both sides otherwise.
function findPos(chunks, pos, isA, start) {
    let lo = 0, hi = chunks.length;
    for (;;) {
        if (lo == hi) {
            let refA = 0, refB = 0;
            if (lo)
                ({ toA: refA, toB: refB } = chunks[lo - 1]);
            let off = pos - (isA ? refA : refB);
            return [refA + off, refB + off];
        }
        let mid = (lo + hi) >> 1, chunk = chunks[mid];
        let [from, to] = isA ? [chunk.fromA, chunk.toA] : [chunk.fromB, chunk.toB];
        if (from > pos)
            hi = mid;
        else if (to <= pos)
            lo = mid + 1;
        else
            return start ? [chunk.fromA, chunk.fromB] : [chunk.toA, chunk.toB];
    }
}
function findRangesForChange(chunks, changes, isA, otherLen) {
    let ranges = [];
    changes.iterChangedRanges((cFromA, cToA, cFromB, cToB) => {
        let fromA = 0, toA = isA ? changes.length : otherLen;
        let fromB = 0, toB = isA ? otherLen : changes.length;
        if (cFromA > updateMargin)
            [fromA, fromB] = findPos(chunks, cFromA - updateMargin, isA, true);
        if (cToA < changes.length - updateMargin)
            [toA, toB] = findPos(chunks, cToA + updateMargin, isA, false);
        let lenDiff = (cToB - cFromB) - (cToA - cFromA), last;
        let [diffA, diffB] = isA ? [lenDiff, 0] : [0, lenDiff];
        if (ranges.length && (last = ranges[ranges.length - 1]).toA >= fromA)
            ranges[ranges.length - 1] = { fromA: last.fromA, fromB: last.fromB, toA, toB,
                diffA: last.diffA + diffA, diffB: last.diffB + diffB };
        else
            ranges.push({ fromA, toA, fromB, toB, diffA, diffB });
    });
    return ranges;
}
function updateChunks(ranges, chunks, a, b, conf) {
    if (!ranges.length)
        return chunks;
    let chunkI = 0, offA = 0, offB = 0;
    let result = [];
    for (let range of ranges) {
        let fromA = range.fromA + offA, toA = range.toA + offA + range.diffA;
        let fromB = range.fromB + offB, toB = range.toB + offB + range.diffB;
        while (chunkI < chunks.length) {
            let next = chunks[chunkI];
            if (next.toA + offA <= fromA && next.toB + offB <= fromB)
                result.push(next.offset(offA, offB));
            else if (next.fromA + offA > toA)
                break;
            chunkI++;
        }
        for (let chunk of toChunks(presentableDiff(a.sliceString(fromA, toA), b.sliceString(fromB, toB), conf), a, b, fromA, fromB))
            result.push(chunk);
        offA += range.diffA;
        offB += range.diffB;
        while (chunkI < chunks.length) {
            let next = chunks[chunkI];
            if (next.fromA > toA + offA && next.fromB > toB + offB)
                break;
            chunkI++;
        }
    }
    while (chunkI < chunks.length)
        result.push(chunks[chunkI++].offset(offA, offB));
    return result;
}

const decorateChunks = /*@__PURE__*/ViewPlugin.fromClass(class {
    constructor(view) {
        ({ deco: this.deco, gutter: this.gutter } = getChunkDeco(view));
    }
    update(update) {
        if (update.docChanged || update.viewportChanged || chunksChanged(update.startState, update.state) ||
            configChanged(update.startState, update.state))
            ({ deco: this.deco, gutter: this.gutter } = getChunkDeco(update.view));
    }
}, {
    decorations: d => d.deco
});
const changeGutter = /*@__PURE__*/Prec.low(/*@__PURE__*/gutter({
    class: "cm-changeGutter",
    markers: view => { var _a; return ((_a = view.plugin(decorateChunks)) === null || _a === void 0 ? void 0 : _a.gutter) || RangeSet.empty; }
}));
function chunksChanged(s1, s2) {
    return s1.field(ChunkField, false) != s2.field(ChunkField, false);
}
function configChanged(s1, s2) {
    return s1.facet(mergeConfig) != s2.facet(mergeConfig);
}
const changedLine = /*@__PURE__*/Decoration.line({ class: "cm-changedLine" });
const changedText = /*@__PURE__*/Decoration.mark({ class: "cm-changedText" });
const inserted = /*@__PURE__*/Decoration.mark({ tagName: "ins", class: "cm-insertedLine" });
const deleted = /*@__PURE__*/Decoration.mark({ tagName: "del", class: "cm-deletedLine" });
const changedLineGutterMarker = /*@__PURE__*/new class extends GutterMarker {
    constructor() {
        super(...arguments);
        this.elementClass = "cm-changedLineGutter";
    }
};
function buildChunkDeco(chunk, doc, isA, highlight, builder, gutterBuilder) {
    let from = isA ? chunk.fromA : chunk.fromB, to = isA ? chunk.toA : chunk.toB;
    let changeI = 0;
    if (from != to) {
        builder.add(from, from, changedLine);
        builder.add(from, to, isA ? deleted : inserted);
        if (gutterBuilder)
            gutterBuilder.add(from, from, changedLineGutterMarker);
        for (let iter = doc.iterRange(from, to - 1), pos = from; !iter.next().done;) {
            if (iter.lineBreak) {
                pos++;
                builder.add(pos, pos, changedLine);
                if (gutterBuilder)
                    gutterBuilder.add(pos, pos, changedLineGutterMarker);
                continue;
            }
            let lineEnd = pos + iter.value.length;
            if (highlight)
                while (changeI < chunk.changes.length) {
                    let nextChange = chunk.changes[changeI];
                    let nextFrom = from + (isA ? nextChange.fromA : nextChange.fromB);
                    let nextTo = from + (isA ? nextChange.toA : nextChange.toB);
                    let chFrom = Math.max(pos, nextFrom), chTo = Math.min(lineEnd, nextTo);
                    if (chFrom < chTo)
                        builder.add(chFrom, chTo, changedText);
                    if (nextTo < lineEnd)
                        changeI++;
                    else
                        break;
                }
            pos = lineEnd;
        }
    }
}
function getChunkDeco(view) {
    let chunks = view.state.field(ChunkField);
    let { side, highlightChanges, markGutter } = view.state.facet(mergeConfig), isA = side == "a";
    let builder = new RangeSetBuilder();
    let gutterBuilder = markGutter ? new RangeSetBuilder() : null;
    let { from, to } = view.viewport;
    for (let chunk of chunks) {
        if ((isA ? chunk.fromA : chunk.fromB) >= to)
            break;
        if ((isA ? chunk.toA : chunk.toB) > from)
            buildChunkDeco(chunk, view.state.doc, isA, highlightChanges, builder, gutterBuilder);
    }
    return { deco: builder.finish(), gutter: gutterBuilder && gutterBuilder.finish() };
}
class Spacer extends WidgetType {
    constructor(height) {
        super();
        this.height = height;
    }
    eq(other) { return this.height == other.height; }
    toDOM() {
        let elt = document.createElement("div");
        elt.className = "cm-mergeSpacer";
        elt.style.height = this.height + "px";
        return elt;
    }
    updateDOM(dom) {
        dom.style.height = this.height + "px";
        return true;
    }
    get estimatedHeight() { return this.height; }
    ignoreEvent() { return false; }
}
const adjustSpacers = /*@__PURE__*/StateEffect.define({
    map: (value, mapping) => value.map(mapping)
});
const Spacers = /*@__PURE__*/StateField.define({
    create: () => Decoration.none,
    update: (spacers, tr) => {
        for (let e of tr.effects)
            if (e.is(adjustSpacers))
                return e.value;
        return spacers.map(tr.changes);
    },
    provide: f => EditorView.decorations.from(f)
});
const epsilon = .01;
function updateSpacers(a, b, chunks) {
    let buildA = new RangeSetBuilder(), buildB = new RangeSetBuilder();
    let spacersA = a.state.field(Spacers).iter(), spacersB = b.state.field(Spacers).iter();
    let posA = 0, posB = 0, offA = 0, offB = 0;
    for (let chunkI = 0;; chunkI++) {
        let chunk = chunkI < chunks.length ? chunks[chunkI] : null;
        // A range at posA/posB is unchanged, must be aligned.
        if (posA < (chunk ? chunk.fromA : a.state.doc.length)) {
            let heightA = a.lineBlockAt(posA).top + offA;
            let heightB = b.lineBlockAt(posB).top + offB;
            let diff = heightA - heightB;
            if (diff < -epsilon) {
                offA -= diff;
                buildA.add(posA, posA, Decoration.widget({
                    widget: new Spacer(-diff),
                    block: true,
                    side: -1
                }));
            }
            else if (diff > epsilon) {
                offB += diff;
                buildB.add(posB, posB, Decoration.widget({
                    widget: new Spacer(diff),
                    block: true,
                    side: -1
                }));
            }
        }
        if (!chunk)
            break;
        posA = chunk.toA;
        posB = chunk.toB;
        while (spacersA.value && spacersA.from < posA) {
            offA -= spacersA.value.spec.widget.height;
            spacersA.next();
        }
        while (spacersB.value && spacersB.from < posB) {
            offB -= spacersB.value.spec.widget.height;
            spacersB.next();
        }
    }
    while (spacersA.value) {
        offA -= spacersA.value.spec.widget.height;
        spacersA.next();
    }
    while (spacersB.value) {
        offB -= spacersB.value.spec.widget.height;
        spacersB.next();
    }
    let docDiff = (a.contentHeight + offA) - (b.contentHeight + offB);
    if (docDiff < epsilon) {
        buildA.add(a.state.doc.length, a.state.doc.length, Decoration.widget({
            widget: new Spacer(-docDiff),
            block: true,
            side: 1
        }));
    }
    else if (docDiff > epsilon) {
        buildB.add(b.state.doc.length, b.state.doc.length, Decoration.widget({
            widget: new Spacer(docDiff),
            block: true,
            side: 1
        }));
    }
    let decoA = buildA.finish(), decoB = buildB.finish();
    if (!RangeSet.eq([decoA], [a.state.field(Spacers)]))
        a.dispatch({ effects: adjustSpacers.of(decoA) });
    if (!RangeSet.eq([decoB], [b.state.field(Spacers)]))
        b.dispatch({ effects: adjustSpacers.of(decoB) });
}
const uncollapse = /*@__PURE__*/StateEffect.define({
    map: (value, change) => change.mapPos(value)
});
class CollapseWidget extends WidgetType {
    constructor(lines) {
        super();
        this.lines = lines;
    }
    eq(other) { return this.lines == other.lines; }
    toDOM(view) {
        let outer = document.createElement("div");
        outer.className = "cm-collapsedLines";
        outer.textContent = "⦚ " + view.state.phrase("$ unchanged lines", this.lines) + " ⦚";
        outer.addEventListener("click", e => {
            let pos = view.posAtDOM(e.target);
            view.dispatch({ effects: uncollapse.of(pos) });
            let { side, sibling } = view.state.facet(mergeConfig);
            if (sibling)
                sibling().dispatch({ effects: uncollapse.of(mapPos(pos, view.state.field(ChunkField), side == "a")) });
        });
        return outer;
    }
    ignoreEvent(e) { return e instanceof MouseEvent; }
    get estimatedHeight() { return 27; }
}
function mapPos(pos, chunks, isA) {
    let startOur = 0, startOther = 0;
    for (let i = 0;; i++) {
        let next = i < chunks.length ? chunks[i] : null;
        if (!next || (isA ? next.fromA : next.fromB) >= pos)
            return startOther + (pos - startOur);
        [startOur, startOther] = isA ? [next.toA, next.toB] : [next.toB, next.toA];
    }
}
const CollapsedRanges = /*@__PURE__*/StateField.define({
    create(state) { return Decoration.none; },
    update(deco, tr) {
        deco = deco.map(tr.changes);
        for (let e of tr.effects)
            if (e.is(uncollapse))
                deco = deco.update({ filter: from => from != e.value });
        return deco;
    },
    provide: f => EditorView.decorations.from(f)
});
function collapseUnchanged({ margin = 3, minSize = 4 }) {
    return CollapsedRanges.init(state => buildCollapsedRanges(state, margin, minSize));
}
function buildCollapsedRanges(state, margin, minLines) {
    let builder = new RangeSetBuilder();
    let isA = state.facet(mergeConfig).side == "a";
    let chunks = state.field(ChunkField);
    let prevLine = 1;
    for (let i = 0;; i++) {
        let chunk = i < chunks.length ? chunks[i] : null;
        let collapseFrom = i ? prevLine + margin : 1;
        let collapseTo = chunk ? state.doc.lineAt(isA ? chunk.fromA : chunk.fromB).number - 1 - margin : state.doc.lines;
        let lines = collapseTo - collapseFrom + 1;
        if (lines >= minLines) {
            builder.add(state.doc.line(collapseFrom).from, state.doc.line(collapseTo).to, Decoration.replace({
                widget: new CollapseWidget(lines),
                block: true
            }));
        }
        if (!chunk)
            break;
        prevLine = state.doc.lineAt(Math.min(state.doc.length, isA ? chunk.toA : chunk.toB)).number;
    }
    return builder.finish();
}

const externalTheme = /*@__PURE__*/EditorView.styleModule.of(/*@__PURE__*/new StyleModule({
    ".cm-mergeView": {
        overflowY: "auto",
    },
    ".cm-mergeViewEditors": {
        display: "flex",
        alignItems: "stretch",
    },
    ".cm-mergeViewEditor": {
        flexGrow: 1,
        flexBasis: 0,
        overflow: "hidden"
    },
    ".cm-merge-revert": {
        width: "1.6em",
        flexGrow: 0,
        flexShrink: 0,
        position: "relative"
    },
    ".cm-merge-revert button": {
        position: "absolute",
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "center",
        background: "none",
        border: "none",
        font: "inherit",
        cursor: "pointer"
    }
}));
const baseTheme = /*@__PURE__*/EditorView.baseTheme({
    ".cm-mergeView & .cm-scroller, .cm-mergeView &": {
        height: "auto !important",
        overflowY: "visible !important"
    },
    "&.cm-merge-a .cm-changedLine, .cm-deletedChunk": {
        backgroundColor: "rgba(160, 128, 100, .08)"
    },
    "&.cm-merge-b .cm-changedLine": {
        backgroundColor: "rgba(100, 160, 128, .08)"
    },
    "&light.cm-merge-a .cm-changedText, &light .cm-deletedChunk .cm-deletedText": {
        background: "linear-gradient(#ee443366, #ee443366) bottom/100% 2px no-repeat",
    },
    "&dark.cm-merge-a .cm-changedText, &dark .cm-deletedChunk .cm-deletedText": {
        background: "linear-gradient(#ffaa9966, #ffaa9966) bottom/100% 2px no-repeat",
    },
    "&light.cm-merge-b .cm-changedText": {
        background: "linear-gradient(#22bb2266, #22bb2266) bottom/100% 2px no-repeat",
    },
    "&dark.cm-merge-b .cm-changedText": {
        background: "linear-gradient(#88ff8866, #88ff8866) bottom/100% 2px no-repeat",
    },
    ".cm-insertedLine, .cm-deletedLine": {
        textDecoration: "none"
    },
    ".cm-deletedChunk": {
        paddingLeft: "6px",
        "& .cm-chunkButtons": {
            position: "absolute",
            insetInlineEnd: "5px"
        },
        "& button": {
            border: "none",
            cursor: "pointer",
            color: "white",
            margin: "0 2px",
            borderRadius: "3px",
            "&[name=accept]": { background: "#2a2" },
            "&[name=reject]": { background: "#d43" }
        },
    },
    ".cm-collapsedLines": {
        padding: "5px 5px 5px 10px",
        cursor: "pointer"
    },
    "&light .cm-collapsedLines": {
        color: "#444",
        background: "linear-gradient(to bottom, transparent 0, #f3f3f3 30%, #f3f3f3 70%, transparent 100%)"
    },
    "&dark .cm-collapsedLines": {
        color: "#ddd",
        background: "linear-gradient(to bottom, transparent 0, #222 30%, #222 70%, transparent 100%)"
    },
    ".cm-changeGutter": { width: "3px", paddingLeft: "1px" },
    "&light.cm-merge-a .cm-changedLineGutter, &light .cm-deletedLineGutter": { background: "#e43" },
    "&dark.cm-merge-a .cm-changedLineGutter, &dark .cm-deletedLineGutter": { background: "#fa9" },
    "&light.cm-merge-b .cm-changedLineGutter": { background: "#2b2" },
    "&dark.cm-merge-b .cm-changedLineGutter": { background: "#8f8" },
});

const collapseCompartment = /*@__PURE__*/new Compartment, configCompartment = /*@__PURE__*/new Compartment;
/**
A merge view manages two editors side-by-side, highlighting the
difference between them and vertically aligning unchanged lines.
If you want one of the editors to be read-only, you have to
configure that in its extensions.

By default, views are not scrollable. Style them (`.cm-mergeView`)
with a height and `overflow: auto` to make them scrollable.
*/
class MergeView {
    /**
    Create a new merge view.
    */
    constructor(config) {
        this.revertDOM = null;
        this.revertToA = false;
        this.revertToLeft = false;
        this.measuring = -1;
        this.diffConf = config.diffConfig;
        let sharedExtensions = [
            Prec.low(decorateChunks),
            baseTheme,
            externalTheme,
            Spacers,
            EditorView.updateListener.of(update => {
                if (this.measuring < 0 && (update.heightChanged || update.viewportChanged) &&
                    !update.transactions.some(tr => tr.effects.some(e => e.is(adjustSpacers))))
                    this.measure();
            }),
        ];
        let configA = [mergeConfig.of({
                side: "a",
                sibling: () => this.b,
                highlightChanges: config.highlightChanges !== false,
                markGutter: config.gutter !== false
            })];
        if (config.gutter !== false)
            configA.push(changeGutter);
        let stateA = EditorState.create({
            doc: config.a.doc,
            selection: config.a.selection,
            extensions: [
                config.a.extensions || [],
                EditorView.editorAttributes.of({ class: "cm-merge-a" }),
                configCompartment.of(configA),
                sharedExtensions
            ]
        });
        let configB = [mergeConfig.of({
                side: "b",
                sibling: () => this.a,
                highlightChanges: config.highlightChanges !== false,
                markGutter: config.gutter !== false
            })];
        if (config.gutter !== false)
            configB.push(changeGutter);
        let stateB = EditorState.create({
            doc: config.b.doc,
            selection: config.b.selection,
            extensions: [
                config.b.extensions || [],
                EditorView.editorAttributes.of({ class: "cm-merge-b" }),
                configCompartment.of(configB),
                sharedExtensions
            ]
        });
        this.chunks = Chunk.build(stateA.doc, stateB.doc, this.diffConf);
        let add = [
            ChunkField.init(() => this.chunks),
            collapseCompartment.of(config.collapseUnchanged ? collapseUnchanged(config.collapseUnchanged) : [])
        ];
        stateA = stateA.update({ effects: StateEffect.appendConfig.of(add) }).state;
        stateB = stateB.update({ effects: StateEffect.appendConfig.of(add) }).state;
        this.dom = document.createElement("div");
        this.dom.className = "cm-mergeView";
        this.editorDOM = this.dom.appendChild(document.createElement("div"));
        this.editorDOM.className = "cm-mergeViewEditors";
        let orientation = config.orientation || "a-b";
        let wrapA = document.createElement("div");
        wrapA.className = "cm-mergeViewEditor";
        let wrapB = document.createElement("div");
        wrapB.className = "cm-mergeViewEditor";
        this.editorDOM.appendChild(orientation == "a-b" ? wrapA : wrapB);
        this.editorDOM.appendChild(orientation == "a-b" ? wrapB : wrapA);
        this.a = new EditorView({
            state: stateA,
            parent: wrapA,
            root: config.root,
            dispatchTransactions: trs => this.dispatch(trs, this.a)
        });
        this.b = new EditorView({
            state: stateB,
            parent: wrapB,
            root: config.root,
            dispatchTransactions: trs => this.dispatch(trs, this.b)
        });
        this.setupRevertControls(!!config.revertControls, config.revertControls == "b-to-a", config.renderRevertControl);
        if (config.parent)
            config.parent.appendChild(this.dom);
        this.scheduleMeasure();
    }
    dispatch(trs, target) {
        if (trs.some(tr => tr.docChanged)) {
            let last = trs[trs.length - 1];
            let changes = trs.reduce((chs, tr) => chs.compose(tr.changes), ChangeSet.empty(trs[0].startState.doc.length));
            this.chunks = target == this.a ? Chunk.updateA(this.chunks, last.newDoc, this.b.state.doc, changes, this.diffConf)
                : Chunk.updateB(this.chunks, this.a.state.doc, last.newDoc, changes, this.diffConf);
            target.update([...trs, last.state.update({ effects: setChunks.of(this.chunks) })]);
            let other = target == this.a ? this.b : this.a;
            other.update([other.state.update({ effects: setChunks.of(this.chunks) })]);
            this.scheduleMeasure();
        }
        else {
            target.update(trs);
        }
    }
    /**
    Reconfigure an existing merge view.
    */
    reconfigure(config) {
        if ("diffConfig" in config) {
            this.diffConf = config.diffConfig;
        }
        if ("orientation" in config) {
            let aB = config.orientation != "b-a";
            if (aB != (this.editorDOM.firstChild == this.a.dom.parentNode)) {
                let domA = this.a.dom.parentNode, domB = this.b.dom.parentNode;
                domA.remove();
                domB.remove();
                this.editorDOM.insertBefore(aB ? domA : domB, this.editorDOM.firstChild);
                this.editorDOM.appendChild(aB ? domB : domA);
                this.revertToLeft = !this.revertToLeft;
                if (this.revertDOM)
                    this.revertDOM.textContent = "";
            }
        }
        if ("revertControls" in config || "renderRevertControl" in config) {
            let controls = !!this.revertDOM, toA = this.revertToA, render = this.renderRevert;
            if ("revertControls" in config) {
                controls = !!config.revertControls;
                toA = config.revertControls == "b-to-a";
            }
            if ("renderRevertControl" in config)
                render = config.renderRevertControl;
            this.setupRevertControls(controls, toA, render);
        }
        let highlight = "highlightChanges" in config, gutter = "gutter" in config, collapse = "collapseUnchanged" in config;
        if (highlight || gutter || collapse) {
            let effectsA = [], effectsB = [];
            if (highlight || gutter) {
                let currentConfig = this.a.state.facet(mergeConfig);
                let markGutter = gutter ? config.gutter !== false : currentConfig.markGutter;
                let highlightChanges = highlight ? config.highlightChanges !== false : currentConfig.highlightChanges;
                effectsA.push(configCompartment.reconfigure([
                    mergeConfig.of({ side: "a", sibling: () => this.b, highlightChanges, markGutter }),
                    markGutter ? changeGutter : []
                ]));
                effectsB.push(configCompartment.reconfigure([
                    mergeConfig.of({ side: "b", sibling: () => this.a, highlightChanges, markGutter }),
                    markGutter ? changeGutter : []
                ]));
            }
            if (collapse) {
                let effect = collapseCompartment.reconfigure(config.collapseUnchanged ? collapseUnchanged(config.collapseUnchanged) : []);
                effectsA.push(effect);
                effectsB.push(effect);
            }
            this.a.dispatch({ effects: effectsA });
            this.b.dispatch({ effects: effectsB });
        }
        this.scheduleMeasure();
    }
    setupRevertControls(controls, toA, render) {
        this.revertToA = toA;
        this.revertToLeft = this.revertToA == (this.editorDOM.firstChild == this.a.dom.parentNode);
        this.renderRevert = render;
        if (!controls && this.revertDOM) {
            this.revertDOM.remove();
            this.revertDOM = null;
        }
        else if (controls && !this.revertDOM) {
            this.revertDOM = this.editorDOM.insertBefore(document.createElement("div"), this.editorDOM.firstChild.nextSibling);
            this.revertDOM.addEventListener("mousedown", e => this.revertClicked(e));
            this.revertDOM.className = "cm-merge-revert";
        }
        else if (this.revertDOM) {
            this.revertDOM.textContent = "";
        }
    }
    scheduleMeasure() {
        if (this.measuring < 0) {
            let win = (this.dom.ownerDocument.defaultView || window);
            this.measuring = win.requestAnimationFrame(() => {
                this.measuring = -1;
                this.measure();
            });
        }
    }
    measure() {
        updateSpacers(this.a, this.b, this.chunks);
        if (this.revertDOM)
            this.updateRevertButtons();
    }
    updateRevertButtons() {
        let dom = this.revertDOM, next = dom.firstChild;
        let vpA = this.a.viewport, vpB = this.b.viewport;
        for (let i = 0; i < this.chunks.length; i++) {
            let chunk = this.chunks[i];
            if (chunk.fromA > vpA.to || chunk.fromB > vpB.to)
                break;
            if (chunk.fromA < vpA.from || chunk.fromB < vpB.from)
                continue;
            let top = this.a.lineBlockAt(chunk.fromA).top + "px";
            while (next && +(next.dataset.chunk) < i)
                next = rm(next);
            if (next && next.dataset.chunk == String(i)) {
                if (next.style.top != top)
                    next.style.top = top;
                next = next.nextSibling;
            }
            else {
                dom.insertBefore(this.renderRevertButton(top, i), next);
            }
        }
        while (next)
            next = rm(next);
    }
    renderRevertButton(top, chunk) {
        let elt;
        if (this.renderRevert) {
            elt = this.renderRevert();
        }
        else {
            elt = document.createElement("button");
            let text = this.a.state.phrase("Revert this chunk");
            elt.setAttribute("aria-label", text);
            elt.setAttribute("title", text);
            elt.textContent = this.revertToLeft ? "⇜" : "⇝";
        }
        elt.style.top = top;
        elt.setAttribute("data-chunk", String(chunk));
        return elt;
    }
    revertClicked(e) {
        let target = e.target, chunk;
        while (target && target.parentNode != this.revertDOM)
            target = target.parentNode;
        if (target && (chunk = this.chunks[target.dataset.chunk])) {
            let [source, dest, srcFrom, srcTo, destFrom, destTo] = this.revertToA
                ? [this.b, this.a, chunk.fromB, chunk.toB, chunk.fromA, chunk.toA]
                : [this.a, this.b, chunk.fromA, chunk.toA, chunk.fromB, chunk.toB];
            let insert = source.state.sliceDoc(srcFrom, Math.max(srcFrom, srcTo - 1));
            if (srcFrom != srcTo && destTo <= dest.state.doc.length)
                insert += source.state.lineBreak;
            dest.dispatch({
                changes: { from: destFrom, to: Math.min(dest.state.doc.length, destTo), insert },
                userEvent: "revert"
            });
            e.preventDefault();
        }
    }
    /**
    Destroy this merge view.
    */
    destroy() {
        this.a.destroy();
        this.b.destroy();
        if (this.measuring > -1)
            (this.dom.ownerDocument.defaultView || window).cancelAnimationFrame(this.measuring);
        this.dom.remove();
    }
}
function rm(elt) {
    let next = elt.nextSibling;
    elt.remove();
    return next;
}

const deletedChunkGutterMarker = /*@__PURE__*/new class extends GutterMarker {
    constructor() {
        super(...arguments);
        this.elementClass = "cm-deletedLineGutter";
    }
};
const unifiedChangeGutter = /*@__PURE__*/Prec.low(/*@__PURE__*/gutter({
    class: "cm-changeGutter",
    markers: view => { var _a; return ((_a = view.plugin(decorateChunks)) === null || _a === void 0 ? void 0 : _a.gutter) || RangeSet.empty; },
    widgetMarker: (view, widget) => widget instanceof DeletionWidget ? deletedChunkGutterMarker : null
}));
/**
Create an extension that causes the editor to display changes
between its content and the given original document. Changed
chunks will be highlighted, with uneditable widgets displaying the
original text displayed above the new text.
*/
function unifiedMergeView(config) {
    let orig = typeof config.original == "string" ? Text.of(config.original.split(/\r?\n/)) : config.original;
    let diffConf = config.diffConfig;
    return [
        Prec.low(decorateChunks),
        deletedChunks,
        baseTheme,
        EditorView.editorAttributes.of({ class: "cm-merge-b" }),
        EditorState.transactionExtender.of(tr => {
            let updateDoc = tr.effects.find(e => e.is(updateOriginalDoc));
            if (!tr.docChanged && !updateDoc)
                return null;
            let prev = tr.startState.field(ChunkField);
            let chunks = updateDoc ? Chunk.updateA(prev, updateDoc.value.doc, tr.newDoc, updateDoc.value.changes, diffConf)
                : Chunk.updateB(prev, tr.startState.field(originalDoc), tr.newDoc, tr.changes, diffConf);
            return { effects: setChunks.of(chunks) };
        }),
        mergeConfig.of({
            highlightChanges: config.highlightChanges !== false,
            markGutter: config.gutter !== false,
            syntaxHighlightDeletions: config.syntaxHighlightDeletions !== false,
            mergeControls: config.mergeControls !== false,
            side: "b"
        }),
        originalDoc.init(() => orig),
        config.gutter !== false ? unifiedChangeGutter : [],
        ChunkField.init(state => Chunk.build(orig, state.doc, diffConf))
    ];
}
/**
The state effect used to signal changes in the original doc in a
unified merge view.
*/
const updateOriginalDoc = /*@__PURE__*/StateEffect.define();
/**
Create an effect that, when added to a transaction on a unified
merge view, will update the original document that's being compared against.
*/
function originalDocChangeEffect(state, changes) {
    return updateOriginalDoc.of({ doc: changes.apply(state.doc), changes });
}
const originalDoc = /*@__PURE__*/StateField.define({
    create: () => Text.empty,
    update(doc, tr) {
        for (let e of tr.effects)
            if (e.is(updateOriginalDoc))
                doc = e.value.doc;
        return doc;
    }
});
/**
Get the original document from a unified merge editor's state.
*/
function getOriginalDoc(state) {
    return state.field(originalDoc);
}
const DeletionWidgets = /*@__PURE__*/new WeakMap;
class DeletionWidget extends WidgetType {
    constructor(buildDOM) {
        super();
        this.buildDOM = buildDOM;
        this.dom = null;
    }
    eq(other) { return this.dom == other.dom; }
    toDOM(view) { return this.dom || (this.dom = this.buildDOM(view)); }
}
function deletionWidget(state, chunk) {
    let known = DeletionWidgets.get(chunk.changes);
    if (known)
        return known;
    let buildDOM = (view) => {
        let { highlightChanges, syntaxHighlightDeletions, mergeControls } = state.facet(mergeConfig);
        let text = view.state.field(originalDoc).sliceString(chunk.fromA, chunk.endA);
        let lang = syntaxHighlightDeletions && state.facet(language);
        let dom = document.createElement("div");
        dom.className = "cm-deletedChunk";
        if (mergeControls) {
            let buttons = dom.appendChild(document.createElement("div"));
            buttons.className = "cm-chunkButtons";
            let accept = buttons.appendChild(document.createElement("button"));
            accept.name = "accept";
            accept.textContent = state.phrase("Accept");
            accept.onmousedown = e => { e.preventDefault(); acceptChunk(view, view.posAtDOM(dom)); };
            let reject = buttons.appendChild(document.createElement("button"));
            reject.name = "reject";
            reject.textContent = state.phrase("Reject");
            reject.onmousedown = e => { e.preventDefault(); rejectChunk(view, view.posAtDOM(dom)); };
        }
        let content = dom.appendChild(document.createElement("del"));
        let changes = chunk.changes, changeI = 0, inside = false;
        function add(from, to, cls) {
            for (let at = from; at < to;) {
                let nextStop = to, nodeCls = cls + (inside ? " cm-deletedText" : "");
                if (highlightChanges && changeI < changes.length) {
                    let nextBound = inside ? changes[changeI].toA : changes[changeI].fromA;
                    if (nextBound <= nextStop) {
                        nextStop = nextBound;
                        if (inside)
                            changeI++;
                        inside = !inside;
                    }
                }
                if (nextStop > at) {
                    let node = document.createTextNode(text.slice(at, nextStop));
                    if (nodeCls) {
                        let span = dom.appendChild(document.createElement("span"));
                        span.className = nodeCls;
                        content.appendChild(node);
                    }
                    else {
                        content.appendChild(node);
                    }
                }
                at = nextStop;
            }
        }
        if (lang) {
            let tree = lang.parser.parse(text), pos = 0;
            highlightTree(tree, { style: tags => highlightingFor(state, tags) }, (from, to, cls) => {
                if (from > pos)
                    add(pos, from, "");
                add(from, to, cls);
                pos = to;
            });
            add(pos, text.length, "");
        }
        else {
            add(0, text.length, "");
        }
        return dom;
    };
    let deco = Decoration.widget({
        block: true,
        side: -1,
        widget: new DeletionWidget(buildDOM)
    });
    DeletionWidgets.set(chunk.changes, deco);
    return deco;
}
/**
In a [unified](https://codemirror.net/6/docs/ref/#merge.unifiedMergeView) merge view, accept the
chunk under the given position or the cursor. This chunk will no
longer be highlighted unless it is edited again.
*/
function acceptChunk(view, pos) {
    let { state } = view, at = pos !== null && pos !== void 0 ? pos : state.selection.main.head;
    let chunk = view.state.field(ChunkField).find(ch => ch.fromB <= at && ch.endB >= at);
    if (!chunk)
        return false;
    let insert = view.state.sliceDoc(chunk.fromB, Math.max(chunk.fromB, chunk.toB - 1));
    let orig = view.state.field(originalDoc);
    if (chunk.fromB != chunk.toB && chunk.toA <= orig.length)
        insert += view.state.lineBreak;
    let changes = ChangeSet.of({ from: chunk.fromA, to: Math.min(orig.length, chunk.toA), insert }, orig.length);
    view.dispatch({
        effects: updateOriginalDoc.of({ doc: changes.apply(orig), changes }),
        userEvent: "accept"
    });
    return true;
}
/**
In a [unified](https://codemirror.net/6/docs/ref/#merge.unifiedMergeView) merge view, reject the
chunk under the given position or the cursor. Reverts that range
to the content it has in the original document.
*/
function rejectChunk(view, pos) {
    let { state } = view, at = pos !== null && pos !== void 0 ? pos : state.selection.main.head;
    let chunk = state.field(ChunkField).find(ch => ch.fromB <= at && ch.endB >= at);
    if (!chunk)
        return false;
    let orig = state.field(originalDoc);
    let insert = orig.sliceString(chunk.fromA, Math.max(chunk.fromA, chunk.toA - 1));
    if (chunk.fromA != chunk.toA && chunk.toB <= state.doc.length)
        insert += state.lineBreak;
    view.dispatch({
        changes: { from: chunk.fromB, to: Math.min(state.doc.length, chunk.toB), insert },
        userEvent: "revert"
    });
    return true;
}
function buildDeletedChunks(state) {
    let builder = new RangeSetBuilder();
    for (let ch of state.field(ChunkField))
        builder.add(ch.fromB, ch.fromB, deletionWidget(state, ch));
    return builder.finish();
}
const deletedChunks = /*@__PURE__*/StateField.define({
    create: state => buildDeletedChunks(state),
    update(deco, tr) {
        return tr.state.field(ChunkField, false) != tr.startState.field(ChunkField, false) ? buildDeletedChunks(tr.state) : deco;
    },
    provide: f => EditorView.decorations.from(f)
});

export { Change, Chunk, MergeView, acceptChunk, diff, getChunks, getOriginalDoc, goToNextChunk, goToPreviousChunk, originalDocChangeEffect, presentableDiff, rejectChunk, unifiedMergeView, updateOriginalDoc };
