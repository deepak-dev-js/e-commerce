const ShippingAddress = ({ shippingAddress, setShippingAddress }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;

    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black";

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Shipping Address
      </h2>

      <form id="shipping-address-form" className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
            Full Name
          </label>

          <input
            id="fullName"
            name="fullName"
            value={shippingAddress.fullName}
            onChange={handleChange}
            autoComplete="name"
            className={inputClass}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email Address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={shippingAddress.email}
            onChange={handleChange}
            autoComplete="email"
            className={inputClass}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Phone Number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={shippingAddress.phone}
            onChange={handleChange}
            autoComplete="tel"
            pattern="[0-9]{10}"
            maxLength={10}
            className={inputClass}
            placeholder="10-digit mobile number"
            title="Enter a 10-digit mobile number"
            required
          />
        </div>

        <div>
          <label htmlFor="pincode" className="mb-2 block text-sm font-medium">
            PIN Code
          </label>

          <input
            id="pincode"
            name="pincode"
            type="text"
            value={shippingAddress.pincode}
            onChange={handleChange}
            autoComplete="postal-code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            className={inputClass}
            placeholder="6-digit PIN code"
            title="Enter a 6-digit PIN code"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="addressLine"
            className="mb-2 block text-sm font-medium"
          >
            Street Address
          </label>

          <input
            id="addressLine"
            name="addressLine"
            value={shippingAddress.addressLine}
            onChange={handleChange}
            autoComplete="street-address"
            className={inputClass}
            placeholder="House number, street, area"
            required
          />
        </div>

        <div>
          <label htmlFor="city" className="mb-2 block text-sm font-medium">
            City
          </label>

          <input
            id="city"
            name="city"
            value={shippingAddress.city}
            onChange={handleChange}
            autoComplete="address-level2"
            className={inputClass}
            placeholder="Enter your city"
            required
          />
        </div>

        <div>
          <label htmlFor="state" className="mb-2 block text-sm font-medium">
            State
          </label>

          <input
            id="state"
            name="state"
            value={shippingAddress.state}
            onChange={handleChange}
            autoComplete="address-level1"
            className={inputClass}
            placeholder="Enter your state"
            required
          />
        </div>
      </form>
    </section>
  );
};

export default ShippingAddress;