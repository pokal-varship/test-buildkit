import React, { useState } from 'react';

const PaymentMethodSelector = () => {
  const [selectedCard, setSelectedCard] = useState<string>("addNew");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) {
      alert('Please select a payment method.');
    } else {
      alert('Payment submitted!');
    }
  };

  const SavedCard = [
    { id: '0977', exp: '12/25' },
    { id: '0172', exp: '08/32' },
  ]

  return (
    <form onSubmit={handleSubmit} className="payment-method-selector">
      <h2 className="payment-method-label mb-3">Payment</h2>

      {/* Saved Cards */}
      <div className="border p-3 rounded mb-4">
        <p className="payment-method-label pb-2">Saved Cards</p>
        {SavedCard.map((card) => (
          <label key={card.id} className="flex items-center space-x-2 mb-2">
            <input
              type="radio"
              name="savedCard"
              checked={selectedCard === card.id}
              onChange={() => setSelectedCard(card.id)}
            />
            <span className="payment-saved-card">Card ending xx{card.id} - {card.exp}</span>
          </label>
        ))}
      </div>

      {/* New Payment Method */}
      <div className="payment-method-new-card border p-3 rounded mb-4 bg-yellow-50">
        <label className="flex items-center mb-2">
          <input
            type="radio"
            name="paymentMethod"
            checked={selectedCard === "addNew"}
            onChange={() => setSelectedCard("addNew")}
          />
          <span className="payment-method-new-card-label ml-2 font-medium">Add New Payment Method</span>
        </label>
      </div>
      <style>{`
        .payment-method-selector {
          background-color: var(--cards-containers);
          border: 1px solid var(--borders-dividers);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .payment-method-label {
          font-size: var(--heading-h4);
          font-weight: var(--font-bold);
          color: var(--primary-text);
        }
        .payment-saved-card {
          font-size: var(--heading-h6);
          font-weight: var(--font-medium);
          color: var(--primary-text);
        }
        .payment-method-new-card {
          background-color: var(--cards-containers);
        }
        .payment-method-new-card-label {
          font-size: var(--heading-h6);
          font-weight: var(--font-medium);
          color: var(--primary-text);
        }
      `}</style>
    </form>
  );
}

export default PaymentMethodSelector;
