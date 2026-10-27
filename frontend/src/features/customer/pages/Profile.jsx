import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Package, Edit } from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/customer/profile`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
        <User size={48} className="text-gray-400" />
        <h2 className="text-xl font-semibold">Unable to load profile</h2>
        <p className="text-center text-sm text-gray-500">
          Please log in or try again later.
        </p>
      </div>
    );
  }

  const fullName = user.fullName || user.name || "User";
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const address = [
    user.addressLine,
    user.city,
    user.state,
    user.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const details = [
    {
      label: "Full Name",
      value: fullName,
      icon: User,
    },
    {
      label: "Email Address",
      value: user.email || "Not provided",
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: user.phone || "Not provided",
      icon: Phone,
    },
    {
      label: "Address",
      value: address || "No address added",
      icon: MapPin,
    },
    {
      label: "Member Since",
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        : "Not available",
      icon: Calendar,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your ApnaShop account information.
          </p>
        </div>

        {/* Profile Header */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gray-900 text-3xl font-semibold text-white">
              {initials}
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-gray-900">
                {fullName}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {user.email || "No email available"}
              </p>
              <span className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                ApnaShop Member
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>

            <button
              type="button"
              onClick={() =>
                alert("Edit Profile feature will be added next.")
              }
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="rounded-lg bg-gray-100 p-3">
                  <Icon size={20} className="text-gray-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-1 break-words font-medium text-gray-900">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            to="/my-orders"
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-300"
          >
            <div className="rounded-xl bg-gray-100 p-3">
              <Package size={24} className="text-gray-700" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">My Orders</h3>
              <p className="mt-1 text-sm text-gray-500">
                View your order history.
              </p>
            </div>
          </Link>

          <a
            href="/"
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-gray-300"
          >
            <div className="rounded-xl bg-gray-100 p-3">
              <User size={24} className="text-gray-700" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Continue Shopping</h3>
              <p className="mt-1 text-sm text-gray-500">
                Explore products on ApnaShop.
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
