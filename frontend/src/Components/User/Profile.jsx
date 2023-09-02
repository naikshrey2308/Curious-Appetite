import { memo, useContext, useEffect, useRef, useState } from "react";
import HomeContext from "../../pages/home/HomeContext";
import UserContext from "../../UserContext";
import ProfileContext from "./ProfileContext";
import axios from "axios";
import { MdClose } from "react-icons/md";
import Configuration from "../../config";
import Input from "../FormComponents/Input";
import PatternMatchErrors from "../../Errors";

function Profile(props) {

    const [user, setUser] = useContext(UserContext);
    const [, , authenticated, setAuthenticated] = useContext(HomeContext);
    const [profilePanel, toggleProfilePanel] = useContext(ProfileContext);

    const panel = useRef();
    const fileRef = useRef();
    const profilepicRef = useRef();

    const [panelStyle, setPanelStyle] = useState(null);
    const [id, setId] = useState(null);
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [gender, setGender] = useState(null);
    
    function selectImage() {
        if(fileRef.current.files) {
            let url = URL.createObjectURL(fileRef.current.files[0]);
            profilepicRef.current.src = url;
        } else {
            profilepicRef.current.src = "./images/profilepics/default-" + randomPictureIndex + ".jpg";
        }
    }

    async function Update() {
        console.log(fileRef.current.files);
        let formdata = new FormData();
        formdata.append("id", id);
        formdata.append("name", name);
        formdata.append("email", email);
        formdata.append("password", password);
        formdata.append("gender", gender);
        if(fileRef.current.files.length != 0) {
            formdata.append("file", fileRef.current.files[0]);
        } else {
            formdata.append("filePath", user.profilePicturePath);
        }
        const res = await axios.put(`${Configuration.host}/api/User/${id}`, formdata);
        // const res = await req.json();
        console.log(res.data.password);

        if(res.status == 200) {
            setUser(res.data);
            setPassword(res.data.password);
            setAuthenticated(true);
        }
    }

    async function Delete() {
        const res = axios.delete(`${Configuration.host}/api/User/${id}`);
        console.log(res);
        setUser(null);
        setAuthenticated(false);
        localStorage.clear();
    }

    useEffect(() => {
        setPanelStyle({
            animation: `slideInRight 0.3s ease-out forwards`,
            width: "30%", 
            zIndex: 1000
        });
        if(user) {
            console.log(user);
            setId(user.id);
            setName(user.name);
            setEmail(user.email);
            setPassword(user.password);
            setGender(user.gender);
            (async function() {
                const res = await axios.get(`${Configuration.host}/api/User/${user.id}`);
                console.log(res.data);
                setPassword(res.data.password);
                setGender(res.data.gender);
            })();
        }
    }, [panel.current, user]);

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
        {  (user && authenticated && profilePanel) &&
            <div ref={panel} style={panelStyle} className="border-start border-2 position-fixed end-0 top-0 min-vh-100 bg-light">
                <p className="text-end p-3">
                    <button onClick={() => toggleProfilePanel(false)} className="btn btn-transparent">
                        <MdClose size={30} className="text-secondary"></MdClose>
                    </button>
                </p>
                <div className="login-form w-75 text-center">
                    <img ref={profilepicRef} style={{cursor: "pointer"}} onClick={() => fileRef.current.click()} src={`${Configuration.host}/${user.profilePicturePath}`} className="circle-img border-primary border mb-4" width={200} height={200} />
                    <h6>View and Update Profile</h6>
                    <h3>Curious Appetite</h3>
                    <form encType="multipart/form-data" onSubmit={(e) => e.preventDefault()} className="form px-3 mt-3 mb-3">
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
                        <input onClick={Update} type="submit" value="Update Details" className="btn btn-primary px-3 my-2" />
                    </form>
                    <input onClick={Delete} type="submit" value="Delete My Account" className="btn btn-light text-danger px-3" />
                </div>
            </div>
        }
        </>
    );
}

export default memo(Profile);