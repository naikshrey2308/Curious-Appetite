import { memo, useContext, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import "./home.css";
import "../../animate.css";
import HomeContext from "./HomeContext";
import Input from "../../Components/FormComponents/Input";
import UserContext from "../../UserContext";
import PatternMatchErrors from "../../Errors";
import RegisterContext from "../../Components/User/RegisterContext";
import Configuration from "../../config";
import { AES } from "crypto-js";

function LoginPanel(props) {

    const panel = useRef();

    const [loginPanel, toggleLoginPanel, authenticated, setAuthenticated] = useContext(HomeContext);
    const [panelStyle, setPanelStyle] = useState({});
    const [registerPanel, toggleRegisterPanel] = useContext(RegisterContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [popup, togglePopup] = useState(false);
    const popupText = useRef();
    const popupPanel = useRef();

    const [user, setUser] = useContext(UserContext);
    
    async function Login() {
        const req = await fetch(`${Configuration.host}/api/User/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "email": email,
                "password": password,
            })
        })
        let res = await req.json();
        console.log(res);

        togglePopup(true);
        toggleLoginPanel(false);
        if(res.status == 404) {
            // User is not found
            popupText.current.textContent = "The user with the given email id was not found.";
        } else if (res.status == 401) {
            // Password is incorrect
            popupText.current.textContent = "The password pertaining to this user is incorrect.";
        } else {
            // Successful Login
            popupText.current.textContent = `Welcome Back, ${res.name}`;
            setAuthenticated(true);
            setUser(res);
            localStorage.setItem("id", AES.encrypt(res.id.toString(), Configuration.key));
        }
        setTimeout(() => {
            popupPanel.current.style.animation = "0.3s slideOutUp ease-in forwards";
        }, 4000);
        setTimeout(() => {
            popupPanel.current.style.animation = "0.3s slideInDown ease-out forwards";
            togglePopup(false);
        }, 5000);
    }

    function showRegisterPanel() {
        toggleLoginPanel(false);
        toggleRegisterPanel(true);
    }

    useEffect(() => {
        setPanelStyle({
            animation: `slideInRight 0.3s ease-out forwards`,
            width: "30%", 
            zIndex: 1000
        });
    }, [panel.current]);

    return (
        <>
        {
            <div ref={popupPanel} className={(popup ? "" : "d-none") + " login-popup toast show position-absolute"} style={{zIndex: 1000, top: "15%", left: "40%"}} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                    <strong className="me-auto">Login Attempt</strong>
                    <button type="button" onClick={() => togglePopup(false)} className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div ref={popupText} className="toast-body">
                    Hello
                </div>
            </div>
        }
        { (loginPanel) && 
            <div ref={panel} style={panelStyle} className="position-fixed end-0 top-0 min-vh-100 bg-light">
                <p className="text-end p-3">
                    <button onClick={() => toggleLoginPanel(false)} className="btn btn-transparent">
                        <MdClose size={30} className="text-secondary"></MdClose>
                    </button>
                </p>
                <div className="login-form w-75 text-center">
                    <img src="./images/logos/logo.png" width={"60%"} />
                    <h6>Login to</h6>
                    <h3>Curious Appetite</h3>
                    <form onSubmit={(e) => e.preventDefault()} className="form px-3 mt-5 mb-4">
                        <Input value={email} setValue={setEmail} placeholder={"Your Email"} type={"email"} pattern={"^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"} validate={true} required={true} patternMatchError={PatternMatchErrors.email} />
                        <Input value={password} setValue={setPassword} placeholder={"Password"} type={"password"} pattern={"^.+$"} required={true} />
                        <input onClick={Login} type="submit" value="Login" className="btn btn-primary px-3" />
                    </form>
                    <div className="d-flex align-items-center justify-content-between">
                        <hr className="d-inline-block" style={{width: "40%"}} />
                        OR
                        <hr className="d-inline-block" style={{width: "40%"}} />
                    </div>
                    <div className="mt-4 pb-3">
                        <a className="link-primary my-3" onClick={showRegisterPanel}>Create an Account</a>
                    </div>
                </div>
            </div>
        }
        </>
    );
}

export default memo(LoginPanel);