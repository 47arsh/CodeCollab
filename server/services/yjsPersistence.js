const Y = require("yjs");
const defaultPool = require("../db.js");

const DB_INIT_ORIGIN = Symbol("db-init");

function createYjsPersistence(pool = defaultPool) {
  const writeQueues = new Map();

  function queueSaveUpdate(docName, update) {
    const currentQueue = writeQueues.get(docName) || Promise.resolve();
    const nextQueue = currentQueue
      .then(async () => {
        const buffer = Buffer.isBuffer(update) ? update : Buffer.from(update);
        await pool.query(
          "INSERT INTO yjs_updates (room_id, update_data) VALUES ($1, $2);",
          [docName, buffer]
        );
      })
      .catch((err) => {
        console.error("[Yjs Persistence] Failed to save update:", err.message);
      });

    writeQueues.set(docName, nextQueue);
    return nextQueue.finally(() => {
      if (writeQueues.get(docName) === nextQueue) {
        writeQueues.delete(docName);
      }
    });
  }

  async function bindState(docName, ydoc) {
    if (ydoc._persistenceBound) {
      return;
    }
    ydoc._persistenceBound = true;

    let isRestoring = true;
    const pendingUpdates = [];

    // Register update listener before applying DB updates, but filter out DB_INIT_ORIGIN
    ydoc.on("update", (update, origin) => {
      if (origin === DB_INIT_ORIGIN) {
        return;
      }

      if (isRestoring) {
        pendingUpdates.push(update);
        return;
      }

      queueSaveUpdate(docName, update);
    });

    try {
      // Query saved updates ordered by insertion sequence
      const res = await pool.query(
        "SELECT update_data FROM yjs_updates WHERE room_id = $1 ORDER BY id ASC;",
        [docName]
      );

      for (const row of res.rows) {
        Y.applyUpdate(ydoc, row.update_data, DB_INIT_ORIGIN);
      }
    } catch (err) {
      console.error("[Yjs Persistence] Failed to load updates for room:", err.message);
    } finally {
      isRestoring = false;
    }

    // Flush any concurrent updates that arrived while restoring
    for (const pending of pendingUpdates) {
      queueSaveUpdate(docName, pending);
    }
  }

  async function writeState(docName, ydoc) {
    const pendingQueue = writeQueues.get(docName);
    if (pendingQueue) {
      await pendingQueue;
    }
  }

  return {
    provider: pool,
    bindState,
    writeState,
    queueSaveUpdate,
    writeQueues,
  };
}

function setupYjsPersistence(ysocketio, pool = defaultPool) {
  const persistence = createYjsPersistence(pool);
  ysocketio.persistence = persistence;

  // Wrap initDocument to prevent concurrent duplicate initialization of the same room
  const originalInitDocument = ysocketio.initDocument.bind(ysocketio);
  const initLocks = new Map();

  ysocketio.initDocument = async function (docName, nsp, gcEnabled) {
    if (this._documents.has(docName)) {
      return this._documents.get(docName);
    }

    if (initLocks.has(docName)) {
      return await initLocks.get(docName);
    }

    const initPromise = (async () => {
      try {
        return await originalInitDocument(docName, nsp, gcEnabled);
      } finally {
        initLocks.delete(docName);
      }
    })();

    initLocks.set(docName, initPromise);
    return await initPromise;
  };

  return persistence;
}

module.exports = {
  createYjsPersistence,
  setupYjsPersistence,
  DB_INIT_ORIGIN,
};
