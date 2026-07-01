import DonationForm from "./Donateform";

const Donate = () => {
  return (
    <div className="bg-bg-color min-h-screen pb-24">
      <section className="bg-primary text-white py-45 relative overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 z-0 bg-[url('/header/donate.webp.jpeg')] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('header/donate.webp.jpeg')` }} 
        />

        <div className="absolute inset-0 bg-black/30 z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold mb-4 drop-shadow-sm">
            Invest in Sustainable Change
          </h1>
          <p className="text-xl lg:text-2xl max-w-2xl mx-auto text-white opacity-95 drop-shadow-sm">
            Your donation directly empowers marginalized communities. Together, we can build a thriving, equitable future.
          </p>
        </div>
      </section>

      <DonationForm/>
    </div>
  );
};

export default Donate;
