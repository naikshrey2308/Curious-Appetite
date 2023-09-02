import { memo, createContext, useState, useEffect, useContext } from "react";
import "react-bootstrap";
import { Button, Row } from "react-bootstrap";
import { useCol } from "react-bootstrap/esm/Col";
import Profile from "../../Components/User/Profile";
import Register from "../../Components/User/Register";
import HomeContext from "./HomeContext";
import Intro from "./intro";
import LoginPanel from "./LoginPanel";

function Home(props) {

    return (
        <>
            <Intro />
            <LoginPanel />
            <Register />
            <Profile />
        </>
    )
}

export default memo(Home);