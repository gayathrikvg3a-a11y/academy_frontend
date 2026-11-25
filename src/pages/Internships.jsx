import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    getInternshipStudents,
    deleteInternshipStudent,
} from "../api/internshipApi";

import InternshipTable from "../components/InternshipTable";
import InternshipForm from "../components/InternshipForm";
import InternshipFilters from "../components/InternshipFilters";

import PageHeader from "../components/common/PageHeader";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useConfirm from "../components/common/useConfirm";
import useSnackbar from "../components/common/useSnackbar";

export default function Internships() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openForm, setOpenForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const {
        confirm,
        askConfirm,
        closeConfirm,
        runConfirm,
    } = useConfirm();

    const {
            showSnackbar,
        } = useSnackbar();

    // ==========================
    // Filters
    // ==========================

    const [filters, setFilters] = useState({
        search: "",
        status: "",
    });

    // ==========================
    // Load Students
    // ==========================

    const loadStudents = async () => {
        try {
            setLoading(true);

            const response = await getInternshipStudents();

            setStudents(response.data);
        } catch (error) {
            console.error(error);

            showSnackbar(
                "Failed to load internship students.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ==========================
    // Add
    // ==========================

    const handleAdd = () => {
        setSelectedStudent(null);
        setOpenForm(true);
    };

    // ==========================
    // Edit
    // ==========================

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setOpenForm(true);
    };

    // ==========================
    // Delete
    // ==========================

    const handleDelete = (student) => {
        askConfirm({
            title: "Delete Internship Student",
            message: `Delete "${student.student_name}"? This action cannot be undone.`,
            onConfirm: () => confirmDelete(student),
        });
    };

    const confirmDelete = async (student) => {
        try {
            await deleteInternshipStudent(student.id);

            await loadStudents();

            showSnackbar(
                "Internship student deleted successfully."
            );
        } catch (error) {
            console.error(error);

            showSnackbar(
                "Failed to delete internship student.",
                "error"
            );
        }
    };

    // ==========================
    // Filter Change
    // ==========================

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ==========================
    // Reset Filters
    // ==========================

    const handleResetFilters = () => {
        setFilters({
            search: "",
            status: "",
        });
    };

    // ==========================
    // Filter Students
    // ==========================

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const search = filters.search.toLowerCase();

            const matchesSearch =
                student.student_name?.toLowerCase().includes(search) ||
                student.internship_id?.toLowerCase().includes(search) ||
                student.phone?.toLowerCase().includes(search) ||
                student.email?.toLowerCase().includes(search) ||
                student.college?.toLowerCase().includes(search);

            const matchesStatus =
                !filters.status ||
                student.status === filters.status;

            return matchesSearch && matchesStatus;
        });
    }, [students, filters]);

    return (
        <div className="flex flex-col gap-4">

            <PageHeader
                title="Internships"
                subtitle="Manage internship students"
                action={
                    <Button onClick={handleAdd}>
                        <Plus data-icon="inline-start" />
                        Add Student
                    </Button>
                }
            />

            <InternshipFilters
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
            />

            <InternshipTable
                rows={filteredStudents}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <InternshipForm
                open={openForm}
                student={selectedStudent}
                onClose={() => {
                    setOpenForm(false);
                    setSelectedStudent(null);
                }}
                onSuccess={async () => {
                    const wasEdit = Boolean(selectedStudent);

                    await loadStudents();

                    showSnackbar(
                        wasEdit
                            ? "Internship student updated successfully."
                            : "Internship student added successfully."
                    );
                }}
            />

            <ConfirmDialog
                {...confirm}
                onConfirm={runConfirm}
                onClose={closeConfirm}
            />
</div>
    );
}
