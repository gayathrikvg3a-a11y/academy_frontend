import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getCourseById } from "../api/courseApi";

import CourseOverview from "../components/CourseOverview";
import Curriculum from "../components/Curriculum";
import CourseFee from "../components/common/CourseFee";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";

function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await getCourseById(id);
      setCourse(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!course) {
    return (
      <p className="text-destructive">Course not found.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title={course.name}
        subtitle={[course.course_code, course.category_name]
          .filter(Boolean)
          .join(" • ")}
        back={{
          label: "Back to Courses",
          onClick: () => navigate("/courses"),
        }}
        meta={
          <>
            <StatusBadge status={course.is_active ? "ACTIVE" : "INACTIVE"} />
            <Badge variant="outline">
              {course.duration} {course.duration_type}
            </Badge>
            <Badge variant="outline">
              <CourseFee
                orientation="horizontal"
                fee={course.course_fee}
                discount={course.discount_fee}
              />
            </Badge>
          </>
        }
      />

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        </TabsList>

        {tab === "overview" && (
          <CourseOverview course={course} />
        )}

        {tab === "curriculum" && (
          <Curriculum courseId={course.id} />
        )}
      </Tabs>

    </div>
  );
}

export default CourseView;
