
const AboutUs = () => {
  return (
    <section className="w-full bg-white py-16 px-6 lg:px-20">

       <div className="text-center ">
       <h2 className="text-4xl md:text-6xl font-semi-bold text-center mb-2 sm:mb-4 text-green-700">
        About <span className="text-black">Us</span>
      </h2>
      <p className="text-lg leading-7  text-gray-500 italic text-center px-3 md:w-2/3 mx-auto  w-full mb-10"></p>

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
            Our Mission
          </h4>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-6 leading-snug">
            Where Bangladesh Plays
          </h2>
          <p className="sm:text-lg text-sm text-gray-700 mb-4 font-medium">
            <span className="font-semibold text-green-700">
              Our mission is to deliver a reliable, modern, and people-first turf booking experience
            </span>{" "}
            designed to grow with players and turf owners across Bangladesh.
          </p>
          <p className="text-gray-600 leading-relaxed sm:text-lg text-sm mb-4">
            We’re launching with a simple belief: booking a turf should be as smooth as the game itself. That’s why we’ve built KhelbiNaki focusing on speed, reliability, and an intuitive experience for both players and turf owners.
          </p>
          <p className="text-gray-600 leading-relaxed sm:text-lg text-sm">
            This is just the beginning. We're here to transform how Bangladesh plays.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
