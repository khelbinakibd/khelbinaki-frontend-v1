const TermsPrivacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-600">
        Khelbinaki – Terms & Privacy
      </h1>

      {/* Privacy Policy */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Privacy Policy
        </h2>
        <p className="mb-3">
          At <strong>Khelbinaki</strong>, we value your privacy. We collect only
          essential information such as your name, email, phone number, and
          booking details to ensure smooth turf booking management. Your data is
          never shared or sold to third parties without your consent.
        </p>
        <p className="mb-3">
          We use secure servers and encrypted payment gateways to protect your
          personal and financial information. You may contact us anytime if you
          wish to review, update, or delete your data.
        </p>
      </section>

      {/* Terms & Conditions */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Terms & Conditions
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Turf bookings are confirmed only after full or partial payment.
          </li>
          <li>
            Customers must arrive at least 10 minutes before the booked slot.
          </li>
          <li>
            Any damage to the turf or equipment during your session will be
            charged accordingly.
          </li>
          <li>
            Khelbinaki reserves the right to cancel or reschedule bookings in
            case of maintenance or emergencies.
          </li>
          <li>
            Misconduct or violation of rules may result in suspension from using
            our platform.
          </li>
        </ul>
      </section>

      {/* Refund Policy */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Refund Policy
        </h2>
        <p className="mb-3">
          Refunds are applicable only if the booking is canceled at least{" "}
          <strong>24 hours</strong> before the scheduled time. Refunds will be
          processed within <strong>5–7 business days</strong> via the same
          payment method.
        </p>
        <p className="mb-3">
          In case of weather issues or turf unavailability, users will receive
          a full refund or a credit for future booking.
        </p>
        <p>
          For any refund-related queries, please contact our support team at{" "}
          <a
            href="mailto:support@khelbinaki.com"
            className="text-green-600 font-medium underline"
          >
            support@khelbinaki.com
          </a>
          .
        </p>
      </section>
    </div>
  );
};

export default TermsPrivacy;
