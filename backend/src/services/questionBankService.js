const InterviewQuestion = require('../models/InterviewQuestion');
const { TOP_145_QUESTIONS } = require('../data/top145Questions');

/**
 * Inserts the built-in question bank the first time it is read. Runs as an
 * idempotent bulk upsert keyed on the (unique) prompt so already-present
 * questions are never duplicated or overwritten. Admin edits to built-in
 * questions survive because this only adds what is missing.
 */
let ensureDefaultsPromise = null;

async function ensureBuiltInQuestions() {
  if (!ensureDefaultsPromise) {
    ensureDefaultsPromise = (async () => {
      const docs = TOP_145_QUESTIONS.map((q) => ({
        updateOne: {
          filter: { prompt: q.prompt },
          update: { $setOnInsert: { ...q, isBuiltIn: true, isActive: true } },
          upsert: true,
        },
      }));
      await InterviewQuestion.bulkWrite(docs, { ordered: false });
    })();
  }
  return ensureDefaultsPromise;
}

module.exports = { ensureBuiltInQuestions };
