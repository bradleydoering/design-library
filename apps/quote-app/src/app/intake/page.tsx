import { QuoteForm } from "@/components/QuoteForm/QuoteForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function QuotePage() {
  return (
    <ProtectedRoute>
      <QuoteForm />
    </ProtectedRoute>
  );
}