import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addToWishlist } from "../../../services/wishlistService";

const VerifyEmail = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;
    const redirectTo = location.state?.redirect || "/";
    const wishlistProductId = location.state?.wishlistProductId;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!email) {
            setError("Email not found. Please register again.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/verify-email`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ email, otp }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Email verification failed");
            }

            window.dispatchEvent(new Event("auth-changed"));

            if (wishlistProductId) {
                try {
                    await addToWishlist(wishlistProductId);
                    toast.success("Added to wishlist!");
                } catch (wishlistError) {
                    console.error(
                        "Failed to add product to wishlist:",
                        wishlistError
                    );
                    toast.error("Could not add product to wishlist.");
                }
            }

            navigate(redirectTo, {
                replace: true,
            });
        } catch (error) {
            setError(error.message || "Email verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Verify Your Email
                    </h1>

                    <p className="mt-3 text-sm text-gray-600">
                        We sent a 6-digit verification code to
                    </p>

                    <p className="mt-1 break-all font-medium text-gray-900">
                        {email || "Email unavailable"}
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="otp"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Enter OTP
                    </label>

                    <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(event) => {
                            setOtp(
                                event.target.value.replace(/\D/g, "").slice(0, 6)
                            );
                            setError("");
                        }}
                        maxLength={6}
                        pattern="\d{6}"
                        required
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.5em] text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    />
                </div>

                {error && (
                    <p
                        role="alert"
                        aria-live="polite"
                        className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Verifying..." : "Verify Email"}
                </button>

                <p className="text-center text-sm text-gray-600">
                    Enter the code sent to your email. The code expires in 10 minutes.
                </p>

                <p className="text-center text-sm text-gray-600">
                    Wrong email?{" "}
                    <Link
                        to="/register"
                        state={location.state}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                        Register again
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default VerifyEmail;
