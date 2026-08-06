function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function updateStreak(user, now = new Date()) {
  const last = user.streak.lastActive ? startOfDay(user.streak.lastActive) : null;
  const today = startOfDay(now);

  if (!last) {
    user.streak.current = 1;
    user.streak.longest = Math.max(user.streak.longest || 0, 1);
    user.streak.lastActive = now;
    return user;
  }
  const diffDays = Math.round((today - last) / 86400000);
  if (diffDays === 0) {
    return user; // already active today
  }
  if (diffDays === 1) {
    user.streak.current += 1;
  } else {
    user.streak.current = 1;
  }
  user.streak.longest = Math.max(user.streak.longest || 0, user.streak.current);
  user.streak.lastActive = now;
  return user;
}

module.exports = { updateStreak };
