import { Facet, combineConfig, Annotation, StateField, StateEffect, ChangeSet, Transaction } from "./@codemirror-state.js";

class LocalUpdate {
    constructor(origin, changes, effects, clientID) {
        this.origin = origin;
        this.changes = changes;
        this.effects = effects;
        this.clientID = clientID;
    }
}
class CollabState {
    constructor(
    // The version up to which changes have been confirmed.
    version, 
    // The local updates that havent been successfully sent to the
    // server yet.
    unconfirmed) {
        this.version = version;
        this.unconfirmed = unconfirmed;
    }
}
const collabConfig = /*@__PURE__*/Facet.define({
    combine(configs) {
        let combined = combineConfig(configs, { startVersion: 0, clientID: null, sharedEffects: () => [] }, {
            generatedID: a => a
        });
        if (combined.clientID == null)
            combined.clientID = (configs.length && configs[0].generatedID) || "";
        return combined;
    }
});
const collabReceive = /*@__PURE__*/Annotation.define();
const collabField = /*@__PURE__*/StateField.define({
    create(state) {
        return new CollabState(state.facet(collabConfig).startVersion, []);
    },
    update(collab, tr) {
        let isSync = tr.annotation(collabReceive);
        if (isSync)
            return isSync;
        let { sharedEffects, clientID } = tr.startState.facet(collabConfig);
        let effects = sharedEffects(tr);
        if (effects.length || !tr.changes.empty)
            return new CollabState(collab.version, collab.unconfirmed.concat(new LocalUpdate(tr, tr.changes, effects, clientID)));
        return collab;
    }
});
/**
Create an instance of the collaborative editing plugin.
*/
function collab(config = {}) {
    return [collabField, collabConfig.of(Object.assign({ generatedID: Math.floor(Math.random() * 1e9).toString(36) }, config))];
}
/**
Create a transaction that represents a set of new updates received
from the authority. Applying this transaction moves the state
forward to adjust to the authority's view of the document.
*/
function receiveUpdates(state, updates) {
    let { version, unconfirmed } = state.field(collabField);
    let { clientID } = state.facet(collabConfig);
    version += updates.length;
    let effects = [], changes = null;
    let own = 0;
    for (let update of updates) {
        let ours = own < unconfirmed.length ? unconfirmed[own] : null;
        if (ours && ours.clientID == update.clientID) {
            if (changes)
                changes = changes.map(ours.changes, true);
            effects = StateEffect.mapEffects(effects, update.changes);
            own++;
        }
        else {
            effects = StateEffect.mapEffects(effects, update.changes);
            if (update.effects)
                effects = effects.concat(update.effects);
            changes = changes ? changes.compose(update.changes) : update.changes;
        }
    }
    if (own)
        unconfirmed = unconfirmed.slice(own);
    if (unconfirmed.length) {
        if (changes)
            unconfirmed = unconfirmed.map(update => {
                let updateChanges = update.changes.map(changes);
                changes = changes.map(update.changes, true);
                return new LocalUpdate(update.origin, updateChanges, StateEffect.mapEffects(update.effects, changes), clientID);
            });
        if (effects.length) {
            let composed = unconfirmed.reduce((ch, u) => ch.compose(u.changes), ChangeSet.empty(unconfirmed[0].changes.length));
            effects = StateEffect.mapEffects(effects, composed);
        }
    }
    if (!changes)
        return state.update({ annotations: [collabReceive.of(new CollabState(version, unconfirmed))] });
    return state.update({
        changes: changes,
        effects,
        annotations: [
            Transaction.addToHistory.of(false),
            Transaction.remote.of(true),
            collabReceive.of(new CollabState(version, unconfirmed))
        ],
        filter: false
    });
}
/**
Returns the set of locally made updates that still have to be sent
to the authority. The returned objects will also have an `origin`
property that points at the transaction that created them. This
may be useful if you want to send along metadata like timestamps.
(But note that the updates may have been mapped in the meantime,
whereas the transaction is just the original transaction that
created them.)
*/
function sendableUpdates(state) {
    return state.field(collabField).unconfirmed;
}
/**
Get the version up to which the collab plugin has synced with the
central authority.
*/
function getSyncedVersion(state) {
    return state.field(collabField).version;
}
/**
Get this editor's collaborative editing client ID.
*/
function getClientID(state) {
    return state.facet(collabConfig).clientID;
}
/**
Rebase and deduplicate an array of client-submitted updates that
came in with an out-of-date version number. `over` should hold the
updates that were accepted since the given version (or at least
their change descs and client IDs). Will return an array of
updates that, firstly, has updates that were already accepted
filtered out, and secondly, has been moved over the other changes
so that they apply to the current document version.
*/
function rebaseUpdates(updates, over) {
    if (!over.length || !updates.length)
        return updates;
    let changes = null, skip = 0;
    for (let update of over) {
        let other = skip < updates.length ? updates[skip] : null;
        if (other && other.clientID == update.clientID) {
            if (changes)
                changes = changes.mapDesc(other.changes, true);
            skip++;
        }
        else {
            changes = changes ? changes.composeDesc(update.changes) : update.changes;
        }
    }
    if (skip)
        updates = updates.slice(skip);
    return !changes ? updates : updates.map(update => {
        let updateChanges = update.changes.map(changes);
        changes = changes.mapDesc(update.changes, true);
        return {
            changes: updateChanges,
            effects: update.effects && StateEffect.mapEffects(update.effects, changes),
            clientID: update.clientID
        };
    });
}

export { collab, getClientID, getSyncedVersion, rebaseUpdates, receiveUpdates, sendableUpdates };
