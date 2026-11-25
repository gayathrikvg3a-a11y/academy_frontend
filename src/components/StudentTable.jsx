import { useState } from "react";
import {
  MoreVertical,
  Eye,
  Pencil,
  CreditCard,
  Award,
  Library,
  Trash2,
  Phone,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import StatusBadge from "./common/StatusBadge";
import TableCard from "./common/TableCard";

function StudentTable({
  students,
  onView,
  onEdit,
  onPayments,
  onCertificates,
  onProgress,
  onDelete,
}) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStudentInitial = (name) => {
    if (!name) {
      return "S";
    }

    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <>
      <TableCard>
        <Table className="min-w-[1000px]">
          {/* TABLE HEADER */}

          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          {/* TABLE BODY */}

          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  <p className="font-medium text-muted-foreground">No students found</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Try changing your search or filters.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  {/* STUDENT */}

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-[42px]">
                        <AvatarImage
                          src={student.student_photo || undefined}
                          alt={student.student_name}
                        />
                        <AvatarFallback className="bg-primary/10 font-bold text-primary">
                          {getStudentInitial(student.student_name)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium text-foreground">{student.student_name}</p>
                        <p className="text-sm text-muted-foreground">{student.student_id}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* CONTACT */}

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="size-4 text-muted-foreground/70" />
                      <span className="text-sm text-foreground">{student.phone || "-"}</span>
                    </div>
                  </TableCell>

                  {/* COURSE */}

                  <TableCell className="whitespace-normal">
                    <p className="max-w-[190px] text-sm font-medium text-foreground">
                      {student.course_name || "-"}
                    </p>
                  </TableCell>

                  {/* BATCH */}

                  <TableCell className="whitespace-normal">
                    <p className="max-w-[190px] text-sm text-foreground">
                      {student.batch_name || "-"}
                    </p>
                  </TableCell>

                  {/* STATUS */}

                  <TableCell>
                    <StatusBadge status={student.status || "UNKNOWN"} />
                  </TableCell>

                  {/* PAYMENT STATUS */}

                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <StatusBadge status={student.payment_status || "PENDING"} />
                      <p className="text-sm font-semibold text-success">
                        {formatCurrency(student.total_paid)} paid
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(student.balance)} balance
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Fee {formatCurrency(student.course_fee)}
                      </p>
                    </div>
                  </TableCell>

                  {/* ACTIONS */}

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" aria-label="Student actions" />}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <MoreVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[200px]">
                        <DropdownMenuItem
                          onClick={() => {
                            onView(selectedStudent);
                          }}
                        >
                          <Eye /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onEdit(selectedStudent);
                          }}
                        >
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            onPayments(selectedStudent);
                          }}
                        >
                          <CreditCard /> Payments
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onCertificates(selectedStudent);
                          }}
                        >
                          <Award /> Certificates
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onProgress(selectedStudent);
                          }}
                        >
                          <Library /> Course Progress
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            onDelete(selectedStudent);
                          }}
                        >
                          <Trash2 /> Drop Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableCard>
    </>
  );
}

export default StudentTable;
