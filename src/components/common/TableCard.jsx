// ================= TABLE CARD =================
//
// The card every data table sits in. Declares the outlined-surface treatment
// once and keeps wide tables scrolling inside their own card rather than
// pushing the page sideways. The CRM's Table self-wraps in overflow-x-auto.

function TableCard({ children }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {children}
    </div>
  );
}

export default TableCard;
