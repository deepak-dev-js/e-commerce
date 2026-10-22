const stats = [
  {
    title: "Total Products",
    value: "—",
  },
  {
    title: "Total Orders",
    value: "—",
  },
  {
    title: "Total Customers",
    value: "—",
  },
  {
    title: "Total Revenue",
    value: "—",
  },
];

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Dashboard
      </h1>

      <p className="text-gray-500 mt-2">
        Welcome to your ApnaShop admin panel.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <p className="text-gray-500">{stat.title}</p>

            <h2 className="text-3xl font-bold mt-3">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold">
          Getting Started
        </h2>

        <p className="text-gray-600 mt-2">
          Start by adding products to your store.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;