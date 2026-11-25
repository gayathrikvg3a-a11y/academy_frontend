
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Power, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import api from "../api/axios";

import PageHeader from "../components/common/PageHeader";
import useSnackbar from "../components/common/useSnackbar";


function PaymentTypes() {

    // ================= STATES =================

    const [paymentTypes, setPaymentTypes] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [formOpen, setFormOpen] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");

    const [paymentTypeName, setPaymentTypeName] = useState("");

    const [isActive, setIsActive] = useState(true);

    const [formError, setFormError] = useState("");

    const { showSnackbar } = useSnackbar();


    // ================= RESPONSE HELPER =================

    const getResponseData = (response) => {

        if (Array.isArray(response.data)) {
            return response.data;
        }

        return response.data?.results || [];

    };


    // ================= GET PAYMENT TYPES =================

    const fetchPaymentTypes = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "payment-types/"
            );

            const data = getResponseData(response);

            setPaymentTypes(data);

        } catch (error) {

            console.error(
                "Failed to fetch payment types:",
                error.response?.data || error
            );

            showSnackbar(
                "Failed to fetch payment types.",
                "error"
            );

        } finally {

            setLoading(false);

        }

    };


    // ================= INITIAL LOAD =================

    useEffect(() => {

        fetchPaymentTypes();

    }, []);


    // ================= OPEN ADD FORM =================

    const handleAdd = () => {

        setEditingId(null);

        setPaymentTypeName("");

        setIsActive(true);

        setFormError("");

        setFormOpen(true);

    };


    // ================= OPEN EDIT FORM =================

    const handleEdit = (paymentType) => {

        setEditingId(paymentType.id);

        setPaymentTypeName(
            paymentType.payment_type_name
        );

        setIsActive(paymentType.is_active);

        setFormError("");

        setFormOpen(true);

    };


    // ================= CLOSE FORM =================

    const handleCloseForm = () => {

        setFormOpen(false);

        setEditingId(null);

        setPaymentTypeName("");

        setIsActive(true);

        setFormError("");

    };


    // ================= POST AND PUT =================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const trimmedName = paymentTypeName.trim();

        if (!trimmedName) {

            setFormError(
                "Payment type name is required."
            );

            return;

        }

        const payload = {

            payment_type_name: trimmedName,

            is_active: isActive,

        };

        try {

            setSaving(true);

            setFormError("");

            if (editingId) {

                // PUT - UPDATE EXISTING PAYMENT TYPE

                await api.put(
                    `payment-types/${editingId}/`,
                    payload
                );

                showSnackbar(
                    "Payment type updated successfully."
                );

            } else {

                // POST - CREATE NEW PAYMENT TYPE

                await api.post(
                    "payment-types/",
                    payload
                );

                showSnackbar(
                    "Payment type created successfully."
                );

            }

            handleCloseForm();

            await fetchPaymentTypes();

        } catch (error) {

            console.error(
                "Failed to save payment type:",
                error.response?.data || error
            );

            const message =
                error.response?.data?.message ||
                "Failed to save payment type.";

            setFormError(message);

            showSnackbar(message, "error");

        } finally {

            setSaving(false);

        }

    };


    // ================= PATCH - ACTIVATE / DEACTIVATE =================

    const handleToggleStatus = async (paymentType) => {

        try {

            const newStatus = !paymentType.is_active;

            await api.patch(
                `payment-types/${paymentType.id}/`,
                {
                    is_active: newStatus
                }
            );

            showSnackbar(
                newStatus
                    ? "Payment type activated successfully."
                    : "Payment type deactivated successfully."
            );

            await fetchPaymentTypes();

        } catch (error) {

            console.error(
                "Failed to update payment type status:",
                error.response?.data || error
            );

            showSnackbar(
                "Failed to update payment type status.",
                "error"
            );

        }

    };


    // ================= DELETE - DEACTIVATE =================

    const handleDelete = async (paymentType) => {

        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${paymentType.payment_type_name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `payment-types/${paymentType.id}/`
            );

            showSnackbar(
                "Payment type deactivated successfully."
            );

            await fetchPaymentTypes();

        } catch (error) {

            console.error(
                "Failed to deactivate payment type:",
                error.response?.data || error
            );

            showSnackbar(
                "Failed to deactivate payment type.",
                "error"
            );

        }

    };


    // ================= SEARCH =================

    const filteredPaymentTypes = paymentTypes.filter(
        (paymentType) =>
            paymentType.payment_type_name
                ?.toLowerCase()
                .includes(search.toLowerCase().trim())
    );


    // ================= LOADING =================

    if (loading) {

        return (

            <div className="flex min-h-[60vh] items-center justify-center">

                <Spinner />

            </div>

        );

    }


    // ================= UI =================

    return (

        <div className="flex w-full min-w-0 flex-col gap-4">

            {/* HEADER */}

            <PageHeader

                title="Payment Types"

                subtitle="Manage payment methods"

                action={

                    <Button onClick={handleAdd}>

                        <Plus data-icon="inline-start" />

                        Add Payment Type

                    </Button>

                }

            />


            {/* SEARCH */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <input

                    type="text"

                    placeholder="Search payment type..."

                    value={search}

                    onChange={(e) =>
                        setSearch(e.target.value)
                    }

                    className="w-full rounded-md border px-3 py-2 text-sm sm:max-w-sm"

                />

                <p className="text-sm text-muted-foreground">

                    Total Payment Types: {filteredPaymentTypes.length}

                </p>

            </div>


            {/* ADD / EDIT FORM */}

            {formOpen && (

                <div className="rounded-lg border bg-card p-5 shadow-sm">

                    <div className="mb-4 flex items-center justify-between">

                        <h2 className="text-lg font-semibold">

                            {editingId
                                ? "Edit Payment Type"
                                : "Add Payment Type"}

                        </h2>

                        <Button

                            variant="ghost"

                            size="icon"

                            onClick={handleCloseForm}

                        >

                            <X />

                        </Button>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >

                        {/* PAYMENT TYPE NAME */}

                        <div className="flex flex-col gap-2">

                            <label className="text-sm font-medium">

                                Payment Type Name

                            </label>

                            <input

                                type="text"

                                placeholder="Enter payment type name"

                                value={paymentTypeName}

                                onChange={(e) =>
                                    setPaymentTypeName(e.target.value)
                                }

                                className="rounded-md border px-3 py-2 text-sm"

                            />

                        </div>


                        {/* ACTIVE STATUS */}

                        <div className="flex items-center gap-3">

                            <input

                                type="checkbox"

                                id="payment-active"

                                checked={isActive}

                                onChange={(e) =>
                                    setIsActive(e.target.checked)
                                }

                            />

                            <label
                                htmlFor="payment-active"
                                className="text-sm font-medium"
                            >

                                Active

                            </label>

                        </div>


                        {/* ERROR MESSAGE */}

                        {formError && (

                            <p className="text-sm text-red-500">

                                {formError}

                            </p>

                        )}


                        {/* FORM BUTTONS */}

                        <div className="flex gap-2">

                            <Button
                                type="submit"
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Payment Type"
                                        : "Save Payment Type"}

                            </Button>


                            <Button

                                type="button"

                                variant="outline"

                                onClick={handleCloseForm}

                            >

                                Cancel

                            </Button>

                        </div>

                    </form>

                </div>

            )}


            {/* PAYMENT TYPE TABLE */}

            <div className="overflow-x-auto rounded-lg border">

                <table className="w-full text-sm">

                    <thead className="bg-muted">

                        <tr>

                            <th className="px-4 py-3 text-left">
                                ID
                            </th>

                            <th className="px-4 py-3 text-left">
                                Payment Type Name
                            </th>

                            <th className="px-4 py-3 text-left">
                                Status
                            </th>

                            <th className="px-4 py-3 text-center">
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredPaymentTypes.length > 0 ? (

                            filteredPaymentTypes.map((paymentType) => (

                                <tr
                                    key={paymentType.id}
                                    className="border-t"
                                >

                                    <td className="px-4 py-3">

                                        {paymentType.id}

                                    </td>


                                    <td className="px-4 py-3 font-medium">

                                        {paymentType.payment_type_name}

                                    </td>


                                    <td className="px-4 py-3">

                                        <span

                                            className={
                                                paymentType.is_active
                                                    ? "rounded-full bg-green-100 px-3 py-1 text-green-700"
                                                    : "rounded-full bg-red-100 px-3 py-1 text-red-700"
                                            }

                                        >

                                            {paymentType.is_active
                                                ? "Active"
                                                : "Inactive"}

                                        </span>

                                    </td>


                                    <td className="px-4 py-3">

                                        <div className="flex items-center justify-center gap-2">

                                            {/* EDIT - PUT */}

                                            <Button

                                                size="icon"

                                                variant="outline"

                                                onClick={() =>
                                                    handleEdit(paymentType)
                                                }

                                                title="Edit"

                                            >

                                                <Pencil size={16} />

                                            </Button>


                                            {/* STATUS - PATCH */}

                                            <Button

                                                size="icon"

                                                variant="outline"

                                                onClick={() =>
                                                    handleToggleStatus(paymentType)
                                                }

                                                title={
                                                    paymentType.is_active
                                                        ? "Deactivate"
                                                        : "Activate"
                                                }

                                            >

                                                <Power size={16} />

                                            </Button>


                                            {/* DELETE API */}

                                            <Button

                                                size="icon"

                                                variant="destructive"

                                                onClick={() =>
                                                    handleDelete(paymentType)
                                                }

                                                disabled={!paymentType.is_active}

                                                title="Delete / Deactivate"

                                            >

                                                <Trash2 size={16} />

                                            </Button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>

                                <td

                                    colSpan="4"

                                    className="py-8 text-center text-muted-foreground"

                                >

                                    No payment types found.

                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default PaymentTypes;
