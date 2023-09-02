import { createContext, memo, useContext, useRef } from "react";
import { BiSearchAlt } from "react-icons/bi";
import "./home.css";
import HomeContext from "./HomeContext";
import SearchContext from "./SearchContext";

function Intro(props) {

    const [,,authenticated,] = useContext(HomeContext);

    const [search, setSearch] = useContext(SearchContext);

    const searchRef = useRef();

    return (
        <div>
            <div className="intro">
                <div className="floater">
                    {
                        // (!authenticated) &&
                        <div className="d-flex align-items-center justify-content-center">
                            <img src="/images/logos/logo.png" width={300} />
                        </div>
                    }
                    <h1 className="title text-light">
                        Curious Appetite
                    </h1>
                    <h3 className="text-primary font-cursive">
                        Makes insipid food delicious by providing brilliant recipes
                    </h3>
                    {/* {
                        (authenticated) &&
                        <p className="text-secondary mt-5">
                        <div className="bg-light d-flex br-50 w-100 my-5">
                            <input ref={searchRef} value={search} onChange={() => setSearch(searchRef.current.value)} type={"search"} style={{width: "85%"}} className="px-5 py-3 br-50-l" placeholder='Search "Pizza"' />
                            <div className="bg-primary d-flex justify-content-center align-items-center br-50-r" style={{width: "15%"}}>
                                <BiSearchAlt color="white" size={25}></BiSearchAlt>
                            </div>
                        </div>
                        </p>
                    } */}
                </div>
            </div>
        </div>
    );
}

export default memo(Intro);