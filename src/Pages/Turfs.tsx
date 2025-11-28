import { useState, useEffect } from "react";
import TurfList from "../Components/TurfList";
import Container from "../Components/Container";

const Turfs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  // 🕒 Debounce logic
  useEffect(() => {
    const delay = setTimeout(() => {
      setLocation(searchTerm);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <Container>
      <div className="p-2">

 <div className="text-center my-8">
       {/* <h2 className="text-4xl md:text-6xl font-bold text-center mb-4 text-green-700">
        Our<span className="text-black"> Turfs</span>
      </h2>
      <p className="text-lg leading-7 text-gray-500 italic text-center px-3 md:w-2/3 mx-auto w-full mb-10">
        Choose your favorite turf and make every game unforgettable.
      </p> */}

        {/* Search Section */}
        <div className="flex justify-center items-center  gap-2">
           
                    <input
                      type="text"
                      name="name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="md:w-2/4 w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 outline-none hover:border-gray-300"
                      placeholder="Search turf name , location"
                      required
                    />
                 
          <button
            onClick={() => setLocation(searchTerm)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:opacity-90 transition"
          >
            Search
          </button>
        </div>

      </div>

        {/* Turf List */}
        <TurfList location={location} />
      </div>
    </Container>
  );
};

export default Turfs;
