const Register = () => {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Create an account</h1>
      <form className="space-y-4">
        <div>
          <label className="mb-1 block" htmlFor="name">
            Name
          </label>
          <input
            autoComplete="name"
            className="w-full rounded border px-3 py-2"
            id="name"
            name="name"
            required
            type="text"
          />
        </div>

        <div>
          <label className="mb-1 block" htmlFor="register-email">
            Email
          </label>
          <input
            autoComplete="email"
            className="w-full rounded border px-3 py-2"
            id="register-email"
            name="email"
            required
            type="email"
          />
        </div>

        <div>
          <label className="mb-1 block" htmlFor="register-password">
            Password
          </label>
          <input
            autoComplete="new-password"
            className="w-full rounded border px-3 py-2"
            id="register-password"
            name="password"
            required
            type="password"
          />
        </div>

        <button
          className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
          type="submit"
        >
          Register
        </button>
      </form>
    </main>
  );
};

export default Register;
