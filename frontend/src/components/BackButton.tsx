import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BackButton({
  to,
  onBack,
}: {
  to?: string;
  onBack?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  function goBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (!to) return;
    // Only use history when the page records the expected return destination.
    if (location.state?.from === to && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(to);
    }
  }

  return (
    <button
      type="button"
      className="icon-button back-button"
      aria-label="Voltar"
      onClick={goBack}
    >
      <ArrowLeft size={24} aria-hidden="true" />
    </button>
  );
}
