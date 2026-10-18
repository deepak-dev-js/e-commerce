import { assets } from "../assets/assets";

const Hero = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 bg-gray-50">
      {/* Hero Content */}
      <div className="max-w-lg">
        <p className="text-gray-500 uppercase tracking-widest mb-3">
          Our Latest Collection
        </p>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Discover Your Style
        </h1>

        <p className="mt-5 text-gray-600">
          Explore our latest collection and find products that match your style.
        </p>

        <button onClick={() => alert("Shop Now clicked")} className="mt-6 bg-black text-white px-6 py-3 hover:bg-gray-800">
          Shop Now
        </button>
      </div>

      {/* Hero Image */}
      <div className="mt-10 md:mt-0">
        <img
          src={assets.banner}
          alt="Featured collection"
          className="w-full max-w-md object-cover"
        />
      </div>
    </section>
  );
};

export default Hero;