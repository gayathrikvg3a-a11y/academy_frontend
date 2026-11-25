import { useEffect, useState } from "react";
import { ListTree, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import ModuleForm from "./ModuleForm";
import TopicForm from "./TopicForm";
import TopicSection from "./TopicSection";
import LessonForm from "./LessonForm";
import LessonRow from "./LessonRow";
import LessonDialog from "./LessonDialog";

import ConfirmDialog from "./common/ConfirmDialog";
import useConfirm from "./common/useConfirm";
import useSnackbar from "./common/useSnackbar";

import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../api/curriculumApi";

import {
  createLesson,
  updateLesson,
  deleteLesson,
} from "../api/lessonApi";

import {
  groupLessons,
  moduleLessons,
  summarize,
} from "../utils/curriculum";

// Topics and lessons indent under their module's title, past its number, so
// the nesting reads at a glance. On a phone they sit flush to save width.
const NESTED = "pr-4 pl-4 sm:pl-13";

/* ===============================
      LOADING
=============================== */

function CurriculumSkeleton() {
  return (
    <div
      className="flex flex-col gap-4"
      aria-busy="true"
      aria-label="Loading curriculum"
    >
      {[0, 1].map((card) => (
        <Card key={card} className="gap-0 py-0">
          <div className="flex gap-3 px-4 py-3.5">
            <Skeleton className="size-6 motion-reduce:animate-none" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-2/3 motion-reduce:animate-none" />
            </div>
          </div>

          <div className={`flex flex-col gap-3 border-t py-4 ${NESTED}`}>
            {["w-1/2", "w-2/5", "w-3/5"].map((width) => (
              <Skeleton
                key={width}
                className={`h-4 ${width} motion-reduce:animate-none`}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function Curriculum({ courseId }) {

  /* ===============================
        STATES
  =============================== */

  const [loading, setLoading] = useState(true);

  const [modules, setModules] = useState([]);

  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicModule, setTopicModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [viewLesson, setViewLesson] = useState(null);

  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const [openModuleForm, setOpenModuleForm] = useState(false);
  const [openTopicForm, setOpenTopicForm] = useState(false);
  const [openLessonForm, setOpenLessonForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const { showSnackbar } = useSnackbar();

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  /* ===============================
        LOAD DATA
  =============================== */

  useEffect(() => {
    setLoading(true);
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Only a course's first load shows the skeleton; a refresh after a save
  // keeps the curriculum on screen and swaps it in when it arrives.
  const refreshData = async () => {
    try {
      // Each module arrives with its lessons nested, so one request
      // covers the whole curriculum. Topics are nested too where the
      // API includes them; a module without them fetches its own.
      const moduleRes = await getModules(courseId);

      const curriculum = await Promise.all(
        moduleRes.data.map(async (module) =>
          groupLessons(
            Array.isArray(module.topics)
              ? module
              : { ...module, topics: (await getTopics(module.id)).data }
          )
        )
      );

      setModules(curriculum);
    } catch (error) {
      console.error(error);

      showSnackbar(
        "Failed to load curriculum.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
        MODULE CRUD
  =============================== */

  const handleAddModule = () => {
    setSelectedModule(null);
    setOpenModuleForm(true);
  };

  const handleEditModule = () => {
    setOpenModuleForm(true);
  };

  const handleCloseModuleForm = () => {
    setSelectedModule(null);
    setOpenModuleForm(false);
  };

  const handleSaveModule = async (data) => {
    try {

      setSaving(true);

      if (selectedModule) {

        await updateModule(
          selectedModule.id,
          data
        );

        showSnackbar(
          "Module updated successfully."
        );

      } else {

        await createModule(data);

        showSnackbar(
          "Module created successfully."
        );

      }

      handleCloseModuleForm();

      await refreshData();

    } catch (error) {

      console.error(error);

      showSnackbar(
        "Unable to save module.",
        "error"
      );

    } finally {

      setSaving(false);

    }
  };

  const handleDeleteModule = (module) => {
    askConfirm({
      title: "Delete Module",
      message: `Delete "${module.title}"?`,
      onConfirm: () => confirmDeleteModule(module),
    });
  };

  const confirmDeleteModule = async (module) => {
    try {
      await deleteModule(module.id);

      showSnackbar(
        "Module deleted successfully."
      );

      await refreshData();
    } catch (error) {
      console.error(error);

      showSnackbar(
        "Unable to delete module.",
        "error"
      );
    }
  };

  /* ===============================
        TOPIC CRUD
  =============================== */

  const handleAddTopic = (module) => {
    setSelectedTopic(null);
    setTopicModule(module);
    setOpenTopicForm(true);
  };

  const handleEditTopic = (module, topic) => {
    setSelectedTopic(topic);
    setTopicModule(module);
    setOpenTopicForm(true);
  };

  const handleCloseTopicForm = () => {
    setSelectedTopic(null);
    setOpenTopicForm(false);
  };

  const handleSaveTopic = async (data) => {
    try {

      setSaving(true);

      if (selectedTopic) {

        await updateTopic(
          selectedTopic.id,
          data
        );

        showSnackbar(
          "Topic updated successfully."
        );

      } else {

        await createTopic(data);

        showSnackbar(
          "Topic created successfully."
        );

      }

      handleCloseTopicForm();

      await refreshData();

    } catch (error) {

      console.error(error);

      showSnackbar(
        "Unable to save topic.",
        "error"
      );

    } finally {

      setSaving(false);

    }
  };

  const handleDeleteTopic = (topic) => {
    const lessonCount = topic.lessons.length;

    askConfirm({
      title: "Delete Topic",
      message: lessonCount
        ? `Delete "${topic.title}"? It still has ${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}.`
        : `Delete "${topic.title}"?`,
      onConfirm: () => confirmDeleteTopic(topic),
    });
  };

  const confirmDeleteTopic = async (topic) => {
    try {
      await deleteTopic(topic.id);

      showSnackbar(
        "Topic deleted successfully."
      );

      await refreshData();
    } catch (error) {
      console.error(error);

      showSnackbar(
        "Unable to delete topic.",
        "error"
      );
    }
  };

  /* ===============================
        LESSON CRUD
  =============================== */

  const handleAddLesson = (module, topic) => {
    setSelectedLesson(null);
    setSelectedModuleId(module.id);
    setSelectedTopicId(topic.id);
    setOpenLessonForm(true);
  };

  const handleEditLesson = (lesson) => {
    setViewLesson(null);
    setSelectedLesson(lesson);
    setSelectedModuleId(lesson.module);
    setOpenLessonForm(true);
  };

  const handleCloseLessonForm = () => {
    setSelectedLesson(null);
    setOpenLessonForm(false);
  };

  const handleSaveLesson = async (data) => {

    try {

      setSaving(true);

      if (selectedLesson) {

        await updateLesson(
          selectedLesson.id,
          data
        );

        showSnackbar(
          "Lesson updated successfully."
        );

      } else {

        await createLesson(data);

        showSnackbar(
          "Lesson created successfully."
        );

      }

      handleCloseLessonForm();

      await refreshData();

    } catch (error) {

      console.error(error);

      showSnackbar(
        "Unable to save lesson.",
        "error"
      );

    } finally {

      setSaving(false);

    }

  };

  const handleDeleteLesson = (lesson) => {
    askConfirm({
      title: "Delete Lesson",
      message: `Delete "${lesson.lesson_title}"?`,
      onConfirm: () => confirmDeleteLesson(lesson),
    });
  };

  const confirmDeleteLesson = async (lesson) => {
    try {
      await deleteLesson(lesson.id);

      showSnackbar(
        "Lesson deleted successfully."
      );

      await refreshData();
    } catch (error) {
      console.error(error);

      showSnackbar(
        "Unable to delete lesson.",
        "error"
      );
    }
  };

  const topicCount = modules.reduce(
    (total, module) => total + module.topics.length,
    0
  );

  const courseSummary = summarize({
    modules: modules.length,
    topics: topicCount,
    lessons: modules.flatMap(moduleLessons),
  });

  const lessonRows = (lessons) =>
    lessons.map((lesson) => (
      <LessonRow
        key={lesson.id}
        lesson={lesson}
        onView={setViewLesson}
        onEdit={handleEditLesson}
        onDelete={handleDeleteLesson}
      />
    ));

  return (
    <div className="flex flex-col gap-4">

      {/* ================= Header ================= */}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div>
          <h2 className="text-lg font-semibold">Curriculum</h2>

          {!loading && modules.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {courseSummary}
            </p>
          )}
        </div>

        {/* The empty state carries its own Add Module. */}
        {(loading || modules.length > 0) && (
          <Button onClick={handleAddModule}>
            <Plus data-icon="inline-start" />
            Add Module
          </Button>
        )}
      </div>

      {/* ================= Modules ================= */}

      {loading ? (
        <CurriculumSkeleton />
      ) : modules.length === 0 ? (

        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListTree />
            </EmptyMedia>
            <EmptyTitle>No modules yet</EmptyTitle>
            <EmptyDescription>
              A curriculum is a list of modules. Each module is split into
              topics, and each topic holds its lessons.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={handleAddModule}>
              <Plus data-icon="inline-start" />
              Add Module
            </Button>
          </EmptyContent>
        </Empty>

      ) : (

        modules.map((module, index) => (
          <Card key={module.id} className="gap-0 py-0">

            {/* Module Header */}

            <div className="flex items-start gap-3 px-4 py-3.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground tabular-nums">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-balance">
                  {module.title}
                </h3>

                {module.description && (
                  <p className="mt-0.5 max-w-prose text-sm text-pretty text-muted-foreground">
                    {module.description}
                  </p>
                )}

                {module.topics.length > 0 && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {summarize({
                      topics: module.topics.length,
                      lessons: moduleLessons(module),
                    })}
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${module.title}`}
                      className="-mt-0.5 text-muted-foreground"
                    />
                  }
                  onClick={() => setSelectedModule(module)}
                >
                  <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditModule}>
                    <Pencil /> Edit Module
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleDeleteModule(module)}
                  >
                    <Trash2 /> Delete Module
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Topics, each with its lessons */}

            {module.topics.length > 0 ? (
              <ol className={`divide-y border-t ${NESTED}`}>
                {module.topics.map((topic, topicIndex) => (
                  <TopicSection
                    key={topic.id}
                    topic={topic}
                    position={topicIndex + 1}
                    onAddLesson={(item) => handleAddLesson(module, item)}
                    onEdit={(item) => handleEditTopic(module, item)}
                    onDelete={handleDeleteTopic}
                  >
                    {lessonRows(topic.lessons)}
                  </TopicSection>
                ))}
              </ol>
            ) : (
              <p className={`border-t py-3 text-sm text-muted-foreground ${NESTED}`}>
                No topics yet. Topics split the module into parts, each
                with its own lessons.
              </p>
            )}

            {/* Lessons in no topic */}

            {module.looseLessons.length > 0 && (
              <div className={`border-t py-3 ${NESTED}`}>
                <h4 className="font-medium">Not in a topic</h4>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Edit a lesson to move it into a topic.
                </p>

                <ul className="mt-2">
                  {lessonRows(module.looseLessons)}
                </ul>
              </div>
            )}

            {/* Module Footer */}

            <div className={`border-t py-2 ${NESTED}`}>
              <Button
                size="sm"
                variant="ghost"
                className="-ml-1.5 text-muted-foreground"
                onClick={() => handleAddTopic(module)}
              >
                <Plus data-icon="inline-start" />
                Add Topic
              </Button>
            </div>

          </Card>
        ))
      )}

      {/* ================= Module Form ================= */}

      <ModuleForm
        open={openModuleForm}
        module={selectedModule}
        courseId={courseId}
        onClose={handleCloseModuleForm}
        onSave={handleSaveModule}
        saving={saving}
      />

      {/* ================= Topic Form ================= */}

      <TopicForm
        open={openTopicForm}
        topic={selectedTopic}
        module={topicModule}
        onClose={handleCloseTopicForm}
        onSave={handleSaveTopic}
        saving={saving}
      />

      {/* ================= Lesson Form ================= */}

      <LessonForm
        open={openLessonForm}
        lesson={selectedLesson}
        moduleId={selectedModuleId}
        topicId={selectedTopicId}
        topics={
          modules.find((module) => module.id === selectedModuleId)
            ?.topics ?? []
        }
        courseId={courseId}
        onClose={handleCloseLessonForm}
        onSave={handleSaveLesson}
        saving={saving}
      />

      {/* ================= Lesson View ================= */}

      <LessonDialog
        lesson={viewLesson}
        onClose={() => setViewLesson(null)}
        onEdit={handleEditLesson}
      />

      {/* ================= Confirm Dialog ================= */}

      <ConfirmDialog
        {...confirm}
        onConfirm={runConfirm}
        onClose={closeConfirm}
      />

    </div>
  );
}

export default Curriculum;
