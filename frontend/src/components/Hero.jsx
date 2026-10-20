import { assets } from "../assets/assets";

const Hero = () => {
  return (
    <section className=" px-8 bg-gray-50">
          {/* Hero Image */}
      <div className="mt-5 md:mt-0">
        <img
          src={assets.banner}
          alt="Featured collection"
          className="w-full object-cover"
        />
      </div>

  
    </section>
  );
};

export default Hero;