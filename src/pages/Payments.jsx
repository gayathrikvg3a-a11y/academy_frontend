  import { useEffect, useState } from "react";
  import { Plus } from "lucide-react";

  import { Button } from "@/components/ui/button";
  import { Spinner } from "@/components/ui/spinner";

  import api from "../api/axios";

  import PageHeader from "../components/common/PageHeader";
  import ConfirmDialog from "../components/common/ConfirmDialog";
  import useConfirm from "../components/common/useConfirm";
  import useSnackbar from "../components/common/useSnackbar";

  import PaymentCards from "../components/PaymentCards";
  import PaymentFilters from "../components/PaymentFilters";
  import PaymentTable from "../components/PaymentTable";
  import PaymentPagination from "../components/PaymentPagination";
  import PaymentForm from "../components/PaymentForm";
  import PaymentReceiptDialog from "../components/PaymentReceiptDialog";

  function Payments() {
    const [payments, setPayments] = useState([]);

    const [allPayments, setAllPayments] = useState([]);

    const [paymentMethods, setPaymentMethods] =
      useState([]);

    const [initialLoading, setInitialLoading] =
      useState(true);

    const [filterLoading, setFilterLoading] =
      useState(false);

    const [selectedPayment, setSelectedPayment] =
      useState(null);

    const [formOpen, setFormOpen] =
      useState(false);

    const [receiptOpen, setReceiptOpen] =
      useState(false);

    const [search, setSearch] = useState("");

    const [paymentMethod, setPaymentMethod] =
      useState("");

    const [paymentDate, setPaymentDate] =
      useState("");

    const [page, setPage] = useState(1);

    const [totalPayments, setTotalPayments] =
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

    // ================= ALL PAYMENTS =================

    const fetchAllPayments = async () => {
      try {
        const response = await api.get(
          "payments/",
          {
            params: {
              page_size: 1000,
            },
          }
        );

        const paymentData =
          getResponseData(response);

        setAllPayments(paymentData);
      } catch (error) {
        console.error(
          "Failed to fetch payments:",
          error.response?.data || error
        );
      }
    };

    // ================= PAYMENTS =================

    const fetchPayments = async () => {
      try {
        setFilterLoading(true);

        const params = {
          page,
          page_size: pageSize,
        };

        if (search.trim() !== "") {
          params.search = search.trim();
        }

        if (paymentMethod !== "") {
          params.payment_method = paymentMethod;
        }

        if (paymentDate !== "") {
          params.payment_date = paymentDate;
        }

        const response = await api.get(
          "payments/",
          {
            params,
          }
        );

        const paymentData =
          getResponseData(response);

        setPayments(paymentData);

        if (Array.isArray(response.data)) {
          setTotalPayments(
            response.data.length
          );
        } else {
          setTotalPayments(
            response.data.count || 0
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch payments:",
          error.response?.data || error
        );

        setPayments([]);
        setTotalPayments(0);
      } finally {
        setFilterLoading(false);
      }
    };

    // ================= PAYMENT METHODS =================

    const fetchPaymentMethods = async () => {
      try {
        const response = await api.get(
          "payment-methods/",
          {
            params: {
              data: "alllist",
            },
          }
        );

        setPaymentMethods(
          getResponseData(response)
        );
      } catch (error) {
        console.error(
          "Failed to fetch payment methods:",
          error
        );
      }
    };

    // ================= INITIAL DATA =================

    const loadInitialData = async () => {
      try {
        setInitialLoading(true);

        await Promise.all([
          fetchAllPayments(),
          fetchPaymentMethods(),
        ]);
      } finally {
        setInitialLoading(false);
      }
    };

    // ================= REFRESH =================

    const refreshPaymentData = async () => {
      await Promise.all([
        fetchPayments(),
        fetchAllPayments(),
      ]);
    };

    // ================= CLEAR FILTERS =================

    const handleClearFilters = () => {
      setSearch("");
      setPaymentMethod("");
      setPaymentDate("");
      setPage(1);
    };

    // ================= DELETE =================

    const handleDeletePayment = (payment) => {
      askConfirm({
        title: "Delete Payment",
        message: `Delete receipt "${payment.receipt_number}"? This action cannot be undone.`,
        onConfirm: () => confirmDeletePayment(payment),
      });
    };

    const confirmDeletePayment = async (
      payment
    ) => {
      try {
        await api.delete(
          `payments/${payment.id}/`
        );

        await refreshPaymentData();

        showSnackbar(
          "Payment deleted successfully."
        );
      } catch (error) {
        console.error(
          "Failed to delete payment:",
          error.response?.data || error
        );

        showSnackbar(
          "Failed to delete payment.",
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
      paymentMethod,
      paymentDate,
    ]);

    // ================= FILTER FETCH =================

    useEffect(() => {
      const timer = setTimeout(() => {
        fetchPayments();
      }, 400);

      return () => {
        clearTimeout(timer);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      search,
      paymentMethod,
      paymentDate,
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
          title="Payments"
          subtitle="Manage academy fee payments"
          action={
            <Button
              onClick={() => {
                setSelectedPayment(null);
                setFormOpen(true);
              }}
            >
              <Plus data-icon="inline-start" />
              Add Payment
            </Button>
          }
        />

        {/* ================= CARDS ================= */}

        <PaymentCards
          payments={allPayments}
        />

        {/* ================= FILTERS ================= */}

        <PaymentFilters
          search={search}
          setSearch={setSearch}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          paymentMethods={paymentMethods}
          onClearFilters={handleClearFilters}
        />

        {/* ================= TABLE ================= */}

        {filterLoading ? (
          <div className="flex justify-center py-5">
            <Spinner />
          </div>
        ) : (
          <>
            <PaymentTable
              payments={payments}
              onView={(payment) => {
                setSelectedPayment(payment);
                setReceiptOpen(true);
              }}
              onEdit={(payment) => {
                setSelectedPayment(payment);
                setFormOpen(true);
              }}
              onDelete={handleDeletePayment}
            />

            <PaymentPagination
              page={page}
              setPage={setPage}
              totalPayments={totalPayments}
              pageSize={pageSize}
            />
          </>
        )}

        {/* ================= PAYMENT FORM ================= */}

        <PaymentForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          onSuccess={async () => {
            const wasEdit = Boolean(selectedPayment);

            setFormOpen(false);
            setSelectedPayment(null);

            await refreshPaymentData();

            showSnackbar(
              wasEdit
                ? "Payment updated successfully."
                : "Payment recorded successfully."
            );
          }}
        />

        {/* ================= RECEIPT ================= */}

        <PaymentReceiptDialog
          open={receiptOpen}
          onClose={() => {
            setReceiptOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
        />

        <ConfirmDialog
          {...confirm}
          onConfirm={runConfirm}
          onClose={closeConfirm}
        />
  </div>
    );
  }

  export default Payments;
