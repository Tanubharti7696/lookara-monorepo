// src/views/billing/PaymentMethodCard.jsx
export default function PaymentMethodCard({ onUpdateCard, canAdmin }) {
  return (
    <div className="bs-card">
      <div className="bs-card__topline">
        <div className="bs-card__title">Payment Method</div>
        {canAdmin && (
          <button className="bs-btn bs-btn--outline bs-btn--sm" onClick={onUpdateCard}>Update Card</button>
        )}
      </div>

      <div className="bs-payment-method">
        <div className="bs-payment-method__icon">💳</div>
        <div>
          <div className="bs-payment-method__name">Visa •••• 4242</div>
          <div className="bs-payment-method__sub">Expires 12/2027 • Sarah Chen</div>
        </div>
      </div>
    </div>
  );
}