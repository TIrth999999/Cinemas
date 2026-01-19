import { useNavigate } from "react-router-dom"
import "../../components/successFailure.css"

const PaymentFailure = () => {
  const navigate = useNavigate()

  return (
    <div className="payment-status-container">
      <div className="status-card">
        <h1>Payment Cancelled</h1>

        <div className="icon-circle failure">
          <div className="inner-circle failure">
            {/* SVG X Icon */}
            <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <p>The transaction was cancelled or failed. No amount was deducted.</p>

        <div className="action-buttons">
          <button
            className="btn-status btn-outline-gray"
            onClick={() => navigate("/home")}
          >
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailure