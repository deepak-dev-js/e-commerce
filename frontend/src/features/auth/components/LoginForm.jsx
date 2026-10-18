const LoginForm = ({ onSubmit }) => {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded border px-3 py-2"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div>
        <label className="mb-1 block" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded border px-3 py-2"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      <button
        className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        type="submit"
      >
        Log in
      </button>
    </form>
  );
};

export default LoginForm;
