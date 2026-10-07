// src/views/billing/PaymentMethodCard.jsx
export default function PaymentMethodCard({ onUpdateCard, canAdmin, paymentMethod }) {
  return (
    <div className="bs-card">
      <div className="bs-card__topline">
        <div className="bs-card__title">Payment Method</div>
        {canAdmin && (
          <button className="bs-btn bs-btn--outline bs-btn--sm" onClick={onUpdateCard}>Update Card</button>
        )}
      </div>

      {paymentMethod ? (
        <div className="bs-payment-method">
          <div className="bs-payment-method__icon">💳</div>
          <div>
            <div className="bs-payment-method__name">{paymentMethod.brand || 'Card'} •••• {paymentMethod.last_four}</div>
            <div className="bs-payment-method__sub">Active Payment Method</div>
          </div>
        </div>
      ) : (
        <div className="bs-payment-method">
          <div className="bs-payment-method__sub">No default payment method.</div>
        </div>
      )}
    </div>
  );
}