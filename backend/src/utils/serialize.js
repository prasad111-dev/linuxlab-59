function serializeAttempt(attempt) {
  const a = attempt && typeof attempt.toObject === 'function' ? attempt.toObject() : attempt;
  if (!a) return null;
  const task = a.task && typeof a.task === 'object' ? a.task : null;
  const category = a.category && typeof a.category === 'object' ? a.category : null;
  return {
    id: String(a._id),
    user: String(a.user),
    task: task
      ? { id: String(task._id), title: task.title, difficulty: task.difficulty, points: task.points, estimatedMinutes: task.estimatedMinutes }
      : a.task ? String(a.task) : null,
    category: category ? { id: String(category._id), name: category.name, slug: category.slug, icon: category.icon, color: category.color } : (a.category ? String(a.category) : null),
    status: a.status,
    score: a.score,
    maxScore: a.maxScore,
    pointsAwarded: a.pointsAwarded,
    passed: a.passed,
    containerId: a.containerId,
    wsTicket: a.wsTicket,
    timeTakenSeconds: a.timeTakenSeconds,
    feedback: a.feedback,
    optimization: a.optimization,
    correctSolution: a.correctSolution,
    recommendedNext: a.recommendedNext || null,
    mistakes: a.mistakes || [],
    rulesSummary: a.rulesSummary || '',
    hintsUsed: a.hintsUsed,
    explainUsed: a.explainUsed,
    commandHistory: a.commandHistory || [],
    evaluation: a.evaluation || null,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt,
    createdAt: a.createdAt,
  };
}

module.exports = { serializeAttempt };
