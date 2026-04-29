import PinkleBall from "../../assets/MainLogo/PinkleBall.png";
import { useNavigate } from "react-router-dom";

const MainLogo = () => {
  const navigate = useNavigate();

  return (
    <>
      <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
        <img src={PinkleBall} alt="PinkleBall" className="h-12 w-12" />
        <h1 className="bg-linear-to-r from-pink-300 via-pink-400 to-pink-500 bg-clip-text text-transparent text-xl font-semibold">PinkleBall</h1>
      </div>
    </>
  );
};

export default MainLogo;
