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
        let combined = combineConfig(configs, { startVersion: 0, clientID: null, sharedEffects: () => [] });
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
    let own = 0;
    while (own < updates.length && updates[own].clientID == clientID)
        own++;
    if (own) {
        unconfirmed = unconfirmed.slice(own);
        updates = updates.slice(own);
    }
    // If all updates originated with us, we're done.
    if (!updates.length)
        return state.update({ annotations: [collabReceive.of(new CollabState(version, unconfirmed))] });
    let changes = updates[0].changes, effects = updates[0].effects || [];
    for (let i = 1; i < updates.length; i++) {
        let update = updates[i];
        effects = StateEffect.mapEffects(effects, update.changes);
        if (update.effects)
            effects = effects.concat(update.effects);
        changes = changes.compose(update.changes);
    }
    if (unconfirmed.length) {
        unconfirmed = unconfirmed.map(update => {
            let updateChanges = update.changes.map(changes);
            changes = changes.map(update.changes, true);
            return new LocalUpdate(update.origin, updateChanges, StateEffect.mapEffects(update.effects, changes), clientID);
        });
        effects = StateEffect.mapEffects(effects, unconfirmed.reduce((ch, u) => ch.compose(u.changes), ChangeSet.empty(unconfirmed[0].changes.length)));
    }
    return state.update({
        changes,
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

export { collab, getClientID, getSyncedVersion, receiveUpdates, sendableUpdates };
