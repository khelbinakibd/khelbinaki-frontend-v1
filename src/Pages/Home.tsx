import BookingShort from "../Components/BookingShort";
import FootballGame from "../Components/FootballGame";
import Slider from "../Components/Slider";
import TurfList from "../Components/TurfList";
import { useAuth } from "../Hooks/useAuth";
import AboutUs from "./AboutUs";

const Home = () => {
    const {user}=useAuth();
    console.log("get user------>",user);
    return (
        <div className="w-full">
         <Slider/>
         <BookingShort/>
         <TurfList/>
         <FootballGame/>
         <AboutUs/>
        </div>
    )
}
export default Home;