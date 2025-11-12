
const AboutUs = () => {
  return (
    <section className="w-full bg-white py-16 px-6 lg:px-20">

       <div className="text-center ">
       <h2 className="text-4xl md:text-6xl font-bold text-center mb-2 sm:mb-4 text-green-700">
        About <span className="italic text-yellow-500">Us</span>
      </h2>
      <p className="text-lg leading-7  text-gray-500 italic text-center px-3 md:w-2/3 mx-auto  w-full mb-10">There are about us some information</p>

      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side (Images) */}
        <div className="flex flex-col gap-6">
          <img
            src="https://thumbs.dreamstime.com/b/table-top-view-soccer-football-world-cup-season-background-table-top-view-soccer-football-world-cup-season-background-116101174.jpg"
            alt="Turf Booking"
            className="rounded-xl shadow-lg rotate-[-2deg]"
          />
          <img
            src="https://www.dlsu.edu.ph/wp-content/uploads/2024/09/BOOTS-ON-THE-GROUND-img1.png"
            alt="Turf Community"
            className="rounded-xl shadow-lg rotate-2"
          />
        </div>

        {/* Right Side (Content) */}
        <div>
          <h4 className="text-sm font-semibold text-green-600 tracking-widest uppercase mb-3">
            About Us
          </h4>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-6 leading-snug">
            Bangladesh’s leading <br /> turf booking platform
          </h2>
          <p className="sm:text-lg text-sm text-gray-700 mb-4 font-medium">
            <span className="font-semibold text-green-700">
              Our mission is to make turf booking simple, modern, and hassle-free
            </span>{" "}
            — empowering players to reserve their favorite turf anytime, anywhere.
          </p>
          <p className="text-gray-600 leading-relaxed sm:text-lg text-sm">
            We connect multiple turfs across Bangladesh into one seamless platform, 
            making it easier than ever for players to book without needing to 
            physically visit or make phone calls. With just a few clicks, you can 
            secure your playtime and focus on what matters most — enjoying the game.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
