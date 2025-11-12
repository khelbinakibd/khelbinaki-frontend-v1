import { useState } from "react";
import { Link } from "react-router";
import { AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormData {
  transactionId: string;
  amount: number;
  paymentType: "full" | "advance";
  lastFourDigits: string;
}

interface BkashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  bkashNumber: string;
  onSubmit: (data: PaymentFormData) => void;
  isLoading: boolean;
}

const BkashPaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  bkashNumber,
  onSubmit,
  isLoading,
}: BkashPaymentModalProps) => {
  const [transactionId, setTransactionId] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [paymentType, setPaymentType] = useState<"full" | "advance">("advance");

  if (!isOpen) return null;

  const advanceAmount = Math.ceil(totalAmount * 0.2);
  const paymentAmount = paymentType === "advance" ? advanceAmount : totalAmount;

  const resetAndClose = () => {
    setTransactionId("");
    setLastFourDigits("");
    setPaymentType("advance");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }
    if (!lastFourDigits.trim() || lastFourDigits.length !== 4) {
      toast.error("Please enter last 4 digits of your phone number");
      return;
    }

    onSubmit({
      transactionId: transactionId.trim(),
      amount: paymentAmount,
      paymentType,
      lastFourDigits: lastFourDigits.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-[750px] md:w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">bKash Payment</h2>
          <button
            onClick={resetAndClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
            type="button"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                className="w-12 h-12"
                src="https://mohammadalinijhoom.com/wp-content/uploads/2024/07/bKash-Logo.png"
                alt="bKash Logo"
              />
              <div>
                <p className="font-bold text-gray-800">Make Payment to:</p>
                <p className="text-2xl font-bold text-pink-600">{bkashNumber}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 mt-3">
              <p className="text-sm text-gray-600 mb-1">Reference</p>
              <p className="font-semibold text-gray-800">Turf Booking Payment</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Amount to Pay:</span>
              <span className="text-3xl font-bold text-green-600">৳{paymentAmount}</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentType("advance")}
                className={`flex-1 border rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  paymentType === "advance"
                    ? "border-green-600 bg-green-100 text-green-700"
                    : "border-gray-200 text-gray-600 hover:border-green-400"
                }`}
                disabled={isLoading}
              >
                Pay 20 Percent (৳{advanceAmount})
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("full")}
                className={`flex-1 border rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  paymentType === "full"
                    ? "border-green-600 bg-green-100 text-green-700"
                    : "border-gray-200 text-gray-600 hover:border-green-400"
                }`}
                disabled={isLoading}
              >
                Pay Full (৳{totalAmount})
              </button>
            </div>
            {paymentType === "advance" && (
              <p className="text-sm text-gray-600">
                Remaining ৳{totalAmount - advanceAmount} to be paid later
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="trx-id">
              bKash Transaction ID *
            </label>
            <input
              id="trx-id"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter 10-digit TrxID (e.g., 9AF7X12B4C)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-100 outline-none transition-all"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter the transaction ID you received from bKash after making payment
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="phone-digits">
              Last 4 Digits of Your Phone Number *
            </label>
            <input
              id="phone-digits"
              type="text"
              value={lastFourDigits}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                setLastFourDigits(value);
              }}
              placeholder="Enter last 4 digits (e.g., 1234)"
              maxLength={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-100 outline-none transition-all"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter the last 4 digits of the phone number you used for payment
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Make payment of ৳{paymentAmount} to the bKash number above</li>
                  <li>Save the transaction ID from your bKash app</li>
                  <li>Enter the transaction ID and last 4 digits of your phone number</li>
                  <li>Your booking will be pending until admin confirms payment</li>
                </ol>
                <Link
                  to="/bkash-payment-way"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold mt-3 hover:underline"
                >
                  How to make a payment guide -&gt;
                </Link>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !transactionId.trim() || lastFourDigits.length !== 4}
            className="w-full bg-gradient-to-r from-pink-600 via-pink-700 to-pink-800 text-white py-4 rounded-xl font-bold text-lg hover:from-pink-700 hover:via-pink-800 hover:to-pink-900 transform hover:scale-105 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit Payment"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BkashPaymentModal;
