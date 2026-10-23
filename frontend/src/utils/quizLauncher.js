import { studentApi } from '../api/client';

export const findMatchingQuiz = (quizzes, { topic, subject, quizId } = {}) => {
  if (!quizzes || quizzes.length === 0) return null;

  if (quizId) {
    const found = quizzes.find((q) => q.quizId === Number(quizId) || q.id === Number(quizId));
    if (found) return found;
  }

  const clean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  if (topic) {
    const tClean = clean(topic);

    // Exact or partial title match
    const byTitle = quizzes.find(
      (q) => clean(q.title).includes(tClean) || tClean.includes(clean(q.title))
    );
    if (byTitle) return byTitle;

    // Specific curriculum keyword associations
    if (
      tClean.includes('array') ||
      tClean.includes('tree') ||
      tClean.includes('bst') ||
      tClean.includes('graph') ||
      tClean.includes('linkedlist') ||
      tClean.includes('datastructure') ||
      tClean.includes('dsa')
    ) {
      const dsa = quizzes.find(
        (q) => clean(q.subjectName).includes('datastructure') || clean(q.title).includes('datastructure') || clean(q.title).includes('tree')
      );
      if (dsa) return dsa;
    }

    if (
      tClean.includes('sql') ||
      tClean.includes('database') ||
      tClean.includes('normaliz') ||
      tClean.includes('transaction') ||
      tClean.includes('concurrency') ||
      tClean.includes('relational') ||
      tClean.includes('dbms')
    ) {
      const dbms = quizzes.find(
        (q) => clean(q.subjectName).includes('database') || clean(q.title).includes('database') || clean(q.title).includes('sql')
      );
      if (dbms) return dbms;
    }

    if (
      tClean.includes('network') ||
      tClean.includes('tcp') ||
      tClean.includes('osi') ||
      tClean.includes('routing') ||
      tClean.includes('subnet') ||
      tClean.includes('protocol') ||
      tClean.includes('ip')
    ) {
      const cn = quizzes.find(
        (q) => clean(q.subjectName).includes('network') || clean(q.title).includes('network')
      );
      if (cn) return cn;
    }

    if (
      tClean.includes('process') ||
      tClean.includes('schedul') ||
      tClean.includes('memory') ||
      tClean.includes('paging') ||
      tClean.includes('cpu') ||
      tClean.includes('operating') ||
      tClean.includes('os')
    ) {
      const os = quizzes.find(
        (q) => clean(q.subjectName).includes('operating') || clean(q.title).includes('operating')
      );
      if (os) return os;
    }

    if (
      tClean.includes('agile') ||
      tClean.includes('architect') ||
      tClean.includes('pattern') ||
      tClean.includes('microservice') ||
      tClean.includes('software') ||
      tClean.includes('design')
    ) {
      const se = quizzes.find(
        (q) => clean(q.subjectName).includes('software') || clean(q.title).includes('architecture') || clean(q.title).includes('pattern')
      );
      if (se) return se;
    }
  }

  if (subject) {
    const sClean = clean(subject);
    const bySubject = quizzes.find(
      (q) => clean(q.subjectName).includes(sClean) || sClean.includes(clean(q.subjectName))
    );
    if (bySubject) return bySubject;
  }

  // Fallback to first quiz
  return quizzes[0];
};

export const launchDirectQuiz = async ({ topic, subject, quizId, navigate }) => {
  try {
    const res = await studentApi.getAssignedQuizzes();
    const quizzes = res.data || [];
    const matched = findMatchingQuiz(quizzes, { topic, subject, quizId });

    if (matched && matched.quizId) {
      const startRes = await studentApi.startQuizAttempt(matched.quizId);
      if (startRes.success) {
        navigate(`/student/quizzes/${matched.quizId}/take`, { state: { quizData: startRes.data } });
        return true;
      }
    }
  } catch (err) {
    console.warn('Direct quiz launch fell back to quiz index:', err);
  }

  // Fallback to quizzes page with autostart
  navigate(`/student/quizzes?topic=${encodeURIComponent(topic || '')}&subject=${encodeURIComponent(subject || '')}&autoStart=true`);
  return false;
};
