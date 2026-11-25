import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import api from "../api/axios";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

import StudentCards from "../components/StudentCards";
import StudentFilters from "../components/StudentFilters";
import StudentTable from "../components/StudentTable";
import StudentDetails from "../components/StudentDetails";
import StudentForm from "../components/StudentForm";
import StudentPayments from "../components/StudentPayments";
import StudentCertificates from "../components/StudentCertificates";
import StudentPagination from "../components/StudentPagination";

function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [filterLoading, setFilterLoading] =
    useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [formOpen, setFormOpen] =
    useState(false);

  const [paymentsOpen, setPaymentsOpen] =
    useState(false);

  const [certificatesOpen, setCertificatesOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const [page, setPage] = useState(1);

  const [totalStudents, setTotalStudents] =
    useState(0);

  const pageSize = 10;

  const {
    confirm,
    askConfirm,
    closeConfirm,
    runConfirm,
  } = useConfirm();

  const {
    showSnackbar,
  } = useSnackbar();

  // ================= RESPONSE HELPER =================

  const getResponseData = (response) => {
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.results || [];
  };

  // ================= ALL STUDENTS =================

  const fetchAllStudents = async () => {
    try {
      const response = await api.get(
        "students/",
        {
          params: {
            page_size: 100,
          },
        }
      );

      const studentData =
        getResponseData(response);

      setAllStudents(studentData);
    } catch (error) {
      console.error(
        "Failed to fetch all students:",
        error.response?.data || error
      );
    }
  };

  // ================= STUDENTS =================

  const fetchStudents = async () => {
    try {
      setFilterLoading(true);

      const params = {
        page,
        page_size: pageSize,
      };

      const cleanedSearch = search.trim();

      if (cleanedSearch !== "") {
        params.search = cleanedSearch;
      }

      if (course !== "") {
        params.course = course;
      }

      if (batch !== "") {
        params.batch = batch;
      }

      if (status !== "") {
        params.status = status;
      }

      const response = await api.get(
        "students/",
        {
          params,
        }
      );

      const studentData =
        getResponseData(response);

      setStudents(studentData);

      if (Array.isArray(response.data)) {
        setTotalStudents(
          response.data.length
        );
      } else {
        setTotalStudents(
          response.data.count || 0
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch students:",
        error.response?.data || error
      );

      setStudents([]);
      setTotalStudents(0);
    } finally {
      setFilterLoading(false);
    }
  };

  // ================= COURSES =================

  const fetchCourses = async () => {
    try {
      const response = await api.get(
        "courses/"
      );

      const courseData =
        getResponseData(response);

      setCourses(courseData);
    } catch (error) {
      console.error(
        "Failed to fetch courses:",
        error.response?.data || error
      );
    }
  };

  // ================= BATCHES =================

  const fetchBatches = async () => {
    try {
      const response = await api.get(
        "batches/"
      );

      const batchData =
        getResponseData(response);

      setBatches(batchData);
    } catch (error) {
      console.error(
        "Failed to fetch batches:",
        error.response?.data || error
      );
    }
  };

  // ================= INITIAL DATA =================

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);

      await Promise.all([
        fetchAllStudents(),
        fetchCourses(),
        fetchBatches(),
      ]);
    } finally {
      setInitialLoading(false);
    }
  };

  // ================= REFRESH =================

  const refreshStudentData = async () => {
    await Promise.all([
      fetchStudents(),
      fetchAllStudents(),
    ]);
  };

  // ================= CLEAR FILTERS =================

  const handleClearFilters = () => {
    setSearch("");
    setCourse("");
    setBatch("");
    setStatus("ACTIVE");
    setPage(1);
  };

  const handleSelectStatusCard = (selectedStatus) => {
    setStatus(selectedStatus ?? "ACTIVE");
    setPage(1);
  };

  // ================= DELETE =================

  const handleDeleteStudent = (student) => {
    askConfirm({
      title: "Delete Student",
      message: `Delete "${student.student_name}" (${student.student_id})? This action cannot be undone.`,
      onConfirm: () => confirmDeleteStudent(student),
    });
  };

  const confirmDeleteStudent = async (
    student
  ) => {
    try {
      await api.delete(
        `students/${student.id}/`
      );

      // If this was the last row on the last page, step back one page so
      // the list lands on a non-empty page instead of showing a blank one.
      if (page > 1 && students.length === 1) {
        setPage((current) => current - 1);
      } else {
        await refreshStudentData();
      }

      showSnackbar(
        "Student deleted successfully."
      );
    } catch (error) {
      console.error(
        "Failed to delete student:",
        error.response?.data || error
      );

      showSnackbar(
        "Failed to delete student.",
        "error"
      );
    }
  };

  // ================= INITIAL LOAD =================

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= RESET PAGE =================

  useEffect(() => {
    setPage(1);
  }, [
    search,
    course,
    batch,
    status,
  ]);

  // ================= FILTER FETCH =================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    search,
    course,
    batch,
    status,
    page,
  ]);

  // ================= LOADING =================

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {/* ================= HEADER ================= */}

      <PageHeader
        title="Students"
        subtitle="Manage academy students"
        action={
          <Button
            onClick={() => {
              setSelectedStudent(null);
              setFormOpen(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Add Student
          </Button>
        }
      />

      {/* ================= CARDS ================= */}

      <StudentCards
        students={allStudents}
        onSelect={handleSelectStatusCard}
      />

      {/* ================= FILTERS ================= */}

      <StudentFilters
        search={search}
        setSearch={setSearch}
        courses={courses}
        batches={batches}
        course={course}
        setCourse={setCourse}
        batch={batch}
        setBatch={setBatch}
        status={status}
        setStatus={setStatus}
        onClearFilters={handleClearFilters}
      />

      {/* ================= TABLE ================= */}

      {filterLoading ? (
        <div className="flex justify-center py-5">
          <Spinner />
        </div>
      ) : (
        <>
          <StudentTable
            students={students}
            onView={(student) => {
              setSelectedStudent(student);
              setDetailsOpen(true);
            }}
            onEdit={(student) => {
              setSelectedStudent(student);
              setFormOpen(true);
            }}
            onPayments={(student) => {
              setSelectedStudent(student);
              setPaymentsOpen(true);
            }}
            onCertificates={(student) => {
              setSelectedStudent(student);
              setCertificatesOpen(true);
            }}
            onProgress={(student) => {
              navigate(
                `/students/${student.id}/progress`
              );
            }}
            onDelete={handleDeleteStudent}
          />

          <StudentPagination
            page={page}
            setPage={setPage}
            totalStudents={totalStudents}
            pageSize={pageSize}
          />
        </>
      )}

      {/* ================= DETAILS ================= */}

      <StudentDetails
        open={detailsOpen}
        onClose={() => {
            setDetailsOpen(false);
            setSelectedStudent(null);
        }}
        student={selectedStudent}
        onEdit={(student) => {
            setDetailsOpen(false);
            setSelectedStudent(student);
            setFormOpen(true);
        }}
        onAddPayment={(student) => {
            setDetailsOpen(false);
            setSelectedStudent(student);
            setPaymentsOpen(true);
        }}
        />

      {/* ================= FORM ================= */}

      <StudentForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSuccess={async () => {
          const wasEdit = Boolean(selectedStudent);

          await refreshStudentData();

          setFormOpen(false);
          setSelectedStudent(null);

          showSnackbar(
            wasEdit
              ? "Student updated successfully."
              : "Student added successfully."
          );
        }}
      />

      {/* ================= PAYMENTS ================= */}

      <StudentPayments
        open={paymentsOpen}
        onClose={() => {
          setPaymentsOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onPaymentSaved={
          refreshStudentData
        }
      />

      {/* ================= CERTIFICATES ================= */}

      <StudentCertificates
        open={certificatesOpen}
        onClose={() => {
          setCertificatesOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />

      <ConfirmDialog
        {...confirm}
        onConfirm={runConfirm}
        onClose={closeConfirm}
      />
</div>
  );
}

export default Students;
