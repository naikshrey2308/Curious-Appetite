import { memo, useContext, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import HomeContext from "../../pages/home/HomeContext";
import Input from "../../Components/FormComponents/Input";
import UserContext from "../../UserContext";
import RegisterContext from "./RegisterContext";
import PatternMatchErrors from "../../Errors";
import "./Register.css";
import axios from "axios";
import Configuration from "../../config";

function Register() {

    const [user, setUser] = useContext(UserContext);

    const panel = useRef();
    const fileRef = useRef();
    const profilepicRef = useRef();

    const [panelStyle, setPanelStyle] = useState(null);
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [gender, setGender] = useState(null);
    const [registerPanel, toggleRegisterPanel] = useContext(RegisterContext);
    const [loginPanel, toggleLoginPanel, authenticated, setAuthenticated] = useContext(HomeContext);
    
    const [randomPictureIndex, setRandomPictureIndex] = useState(parseInt(1 + Math.random() * 7));
    // setRandomPictureIndex();

    function showLoginPanel() {
        toggleLoginPanel(true);
        toggleRegisterPanel(false);
    }

    function selectImage() {
        if(fileRef.current.files) {
            let url = URL.createObjectURL(fileRef.current.files[0]);
            profilepicRef.current.src = url;
        } else {
            profilepicRef.current.src = "./images/profilepics/default-" + randomPictureIndex + ".jpg";
        }
    }

    async function Register() {
        console.log(fileRef.current.files);
        let formdata = new FormData();
        formdata.append("name", name);
        formdata.append("email", email);
        formdata.append("password", password);
        formdata.append("gender", gender);
        if(fileRef.current.files.length != 0) {
            formdata.append("file", fileRef.current.files[0], `/default-${randomPictureIndex}.jpg`);
        } else {
            formdata.append("filePath", `default-${randomPictureIndex}.jpg`);
        }
        const res = await axios.post(`${Configuration.host}/api/User/`, formdata);
        // const res = await req.json();
        console.log(res);

        if(res.status == 200) {
            setUser(res.data);
            setAuthenticated(true);
            toggleRegisterPanel(false);
        }
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
            {/* {
            <div ref={popupPanel} className={(popup ? "" : "d-none") + " login-popup toast show position-absolute"} style={{zIndex: 1000, top: "15%", left: "40%"}} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="toast-header">
                    <strong className="me-auto">Login Attempt</strong>
                    <button type="button" onClick={() => togglePopup(false)} class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div ref={popupText} className="toast-body">
                    Hello
                </div>
            </div>
        } */}
        {  (registerPanel) &&
            <div ref={panel} style={panelStyle} className="position-fixed end-0 top-0 min-vh-100 bg-light">
                <p className="text-end p-3">
                    <button onClick={() => toggleRegisterPanel(false)} className="btn btn-transparent">
                        <MdClose size={30} className="text-secondary"></MdClose>
                    </button>
                </p>
                <div className="login-form w-75 text-center">
                    <img ref={profilepicRef} style={{cursor: "pointer"}} onClick={() => fileRef.current.click()} src={"./images/profilepics/default-" + randomPictureIndex + ".jpg"} className="circle-img border-primary border mb-3" width={200} height={200} />
                    <h6>Sign up for</h6>
                    <h3>Curious Appetite</h3>
                    <form encType="multipart/form-data" onSubmit={(e) => e.preventDefault()} className="form px-3 mt-3 mb-4">
                        <input type={"file"} ref={fileRef} onChange={selectImage} accept="image/*" className="d-none" />
                        <Input value={name} setValue={setName} placeholder={"Your Name"} type={"text"} pattern={"^[a-zA-Z ]+$"} validate={true} required={true} patternMatchError={PatternMatchErrors.name} />
                        <Input value={email} setValue={setEmail} placeholder={"Your Email"} type={"email"} pattern={"^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"} validate={true} required={true} patternMatchError={PatternMatchErrors.email} />
                        <Input value={password} setValue={setPassword} placeholder={"Password"} type={"password"} pattern={"^.+$"} required={true} />
                        <div className="w-100 mb-3 justify-content-center d-flex">
                            {/* <div>
                                I identify as a:
                            </div>  */}
                            <div onClick={() => setGender("male")} style={{cursor: "pointer"}} className={((gender == "male") ? "bg-male" : "bg-muted") + " w-25 mx-1 py-3 br-5"}>
                                <img src="./images/misc/male.jpg" className="w-25" />
                            </div>
                            <div onClick={() => setGender("female")} style={{cursor: "pointer"}} className={((gender == "female") ? "bg-female" : "bg-muted") + " w-25 mx-1 py-3 br-5"}>
                                <img src="./images/misc/female.jpg" className="w-25" />
                            </div>
                        </div>
                        <input onClick={Register} type="submit" value="Create My Account" className="btn btn-primary px-3" />
                    </form>
                    <div className="d-flex align-items-center justify-content-between">
                        <hr className="d-inline-block" style={{width: "40%"}} />
                        OR
                        <hr className="d-inline-block" style={{width: "40%"}} />
                    </div>
                    <div className="mt-4 pb-3">
                        <a onClick={showLoginPanel} className="link-primary my-3">Already have an account? Login Here.</a>
                    </div>
                </div>
            </div>
        }
        </>
    );
}

export default memo(Register);