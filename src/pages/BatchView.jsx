import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import BatchStudents from "../components/BatchStudents";
import BatchOverview from "../components/BatchOverview";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";

import { getBatch } from "../api/batchApi";

function BatchView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    loadBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadBatch = async () => {
    try {
      setLoading(true);

      const response = await getBatch(id);
      setBatch(response.data);
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

  if (!batch) {
    return (
      <p className="text-destructive">Batch not found.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      <PageHeader
        title={batch.batch_name}
        subtitle={`${batch.batch_code} • ${batch.course_name}`}
        back={{
          label: "Back to Batches",
          onClick: () => navigate("/batches"),
        }}
        meta={
          <>
            {/* Status is the one thing worth colour here. Session is
                context, and "Active" is the expected state — only its
                absence deserves to be loud. */}
            <StatusBadge status={batch.status} />

            <Badge variant="outline">
              {batch.session === "MORNING"
                ? "Morning"
                : "Evening"}
            </Badge>

            {batch.is_active ? (
              <Badge variant="outline">Active</Badge>
            ) : (
              <StatusBadge status="INACTIVE" />
            )}
          </>
        }
      />

      {/* Tabs */}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {tab === "overview" && (
          <BatchOverview batch={batch} />
        )}

        {tab === "students" && (
          <BatchStudents batch={batch} />
        )}
      </Tabs>

    </div>
  );
}

export default BatchView;
