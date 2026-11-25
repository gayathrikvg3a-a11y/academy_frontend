// ================= CURRICULUM HELPERS =================
//
// A course's curriculum is modules, each split into topics, each with its
// lessons. These shape the API's modules into that tree and count what's in
// it.

// Each lesson belongs to a topic. A lesson may arrive nested on its topic or
// listed on the module with a topic id, so both are handled. Lessons in no
// topic (added before topics existed) are kept as `looseLessons`, so they can
// still be opened and moved into one.
export function groupLessons(module) {
  const lessons = module.lessons ?? [];

  const topics = module.topics.map((topic) => ({
    ...topic,
    lessons: (
      Array.isArray(topic.lessons)
        ? topic.lessons
        : lessons.filter((lesson) => lesson.topic === topic.id)
    ).map((lesson) => ({
      ...lesson,
      course: lesson.course ?? module.course,
      module: module.id,
      module_title: lesson.module_title ?? module.title,
      topic: topic.id,
      topic_title: topic.title,
    })),
  }));

  const placed = new Set(
    topics.flatMap((topic) =>
      topic.lessons.map((lesson) => lesson.id)
    )
  );

  return {
    ...module,
    topics,
    looseLessons: lessons.filter(
      (lesson) => !placed.has(lesson.id)
    ),
  };
}

// Every lesson in a grouped module, in a topic or not.
export const moduleLessons = (module) => [
  ...module.topics.flatMap((topic) => topic.lessons),
  ...module.looseLessons,
];

export const totalMinutes = (lessons) =>
  lessons.reduce(
    (total, lesson) => total + (Number(lesson.duration_minutes) || 0),
    0
  );

// 45 → "45 min", 120 → "2 h", 130 → "2 h 10 min".
export function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);

  if (!hours) return `${rest} min`;

  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

// 1 → "1 topic", 3 → "3 topics".
export const countOf = (count, word) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

// "3 topics · 5 lessons · 2 h 10 min", leaving out what's empty.
export function summarize({ modules, topics, lessons }) {
  const minutes = totalMinutes(lessons);

  return [
    modules !== undefined && countOf(modules, "module"),
    countOf(topics, "topic"),
    countOf(lessons.length, "lesson"),
    minutes > 0 && formatMinutes(minutes),
  ]
    .filter(Boolean)
    .join(" · ");
}
