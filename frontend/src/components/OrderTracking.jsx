const trackingSteps = [
  { status: "confirmed", label: "Ordered" },
  { status: "in_transit", label: "In Transit" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const OrderTracking = ({ orderStatus }) => {
  const statusOrder = [
    "awaiting_payment",
    "confirmed",
    "packed",
    "shipped",
    "in_transit",
    "out_for_delivery",
    "delivered",
  ];

  const currentIndex = statusOrder.indexOf(orderStatus);

  if (["cancelled", "awaiting_payment"].includes(orderStatus)) {
    return (
      <p className="mt-4 text-sm font-medium text-gray-600">
        Order status: {orderStatus.replaceAll("_", " ")}
      </p>
    );
  }

  return (
    <div className="mt-6 w-full px-2">
      <div className="flex items-start">
        {trackingSteps.map((step, index) => {
          const stepIndex = statusOrder.indexOf(step.status);
          const isCompleted = currentIndex >= stepIndex;

          return (
            <div
              key={step.status}
              className="relative flex flex-1 flex-col items-center"
            >
              {/* Connecting line */}
              {index < trackingSteps.length - 1 && (
                <div
                  className={`absolute left-1/2 top-4 h-0.5 w-full ${
                    currentIndex >=
                    statusOrder.indexOf(trackingSteps[index + 1].status)
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}

              {/* Status circle */}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white ${
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                {isCompleted ? "✓" : ""}
              </div>

              {/* Status label */}
              <p
                className={`mt-2 text-center text-xs font-semibold ${
                  isCompleted ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracking;