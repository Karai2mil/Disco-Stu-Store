import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

import fondo from '../../img/LOGOFONDOBLANCO.png';

export const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const formRef = useRef(null);
    const { actions } = useContext(Context);
    const [usernameOrMail, setUsernameOrMail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        document.addEventListener("click", handleDocumentClick);
        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // Limpiar el mensaje de error anterior

        if (!usernameOrMail || !password) {
            setErrorMessage("Por favor ingrese usuario y contraseña");
            return;
        }

        try {
            const userData = await actions.login({
                username_or_email: usernameOrMail,
                password: password,
            });

            if (userData.is_admin) {
                navigate("/admin-panel");
            } else {
                const lastVisitedPage = sessionStorage.getItem("lastVisitedPage");
                const urlParts = lastVisitedPage.split("/");
                const pageName = urlParts[urlParts.length - 1];
                if (pageName) {
                    navigate("/" + pageName);
                } else {
                    navigate("/");
                }
            }

        } catch (err) {
            setErrorMessage(
                "Error al iniciar sesión. Por favor revise sus credenciales e intente de nuevo"
            );
        }
    };


    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleDocumentClick = (event) => {
        if (
            formRef.current &&
            !formRef.current.contains(event.target) &&
            event.target.getAttribute("id") !== "show_hide_password"
        ) {
            setShowPassword(false);
        }
    };

    return (
        <div className="container mt-3">
            <main>
                <div className="row">
                    <div className="col-lg-3 col-md-3 col-sm-2 col-xs-3"></div>
                    <div className="col-lg-6 col-md-6 col-sm-8 col-xs-6">
                        <img src={fondo} className="img-fluid mb-4 p-3 rounded" style={{width: '500px', marginLeft: '65px'}} alt="store-logo" />
                        <h1 className="text-center mb-4">Inicia sesión en DiscoStu</h1>
                        <form className="mb-3" ref={formRef}>
                            <div className="form-group mb-3">
                                {errorMessage && (
                                    <div className="alert alert-danger">{errorMessage}</div>
                                )}

                                <label htmlFor="usernameOrMail">
                                    Nombre de usuario o correo:{" "}
                                </label>
                                <input
                                    aria-invalid="false"
                                    autoFocus=""
                                    className="form-control mt-2"
                                    id="usernameOrMail"
                                    name="usernameOrMail"
                                    required
                                    type="text"
                                    value={usernameOrMail}
                                    onChange={(e) => {
                                        setErrorMessage("");
                                        setUsernameOrMail(e.target.value);
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            handleLogin(e);
                                        }
                                    }}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="password">Contraseña: </label>
                                <div className="input-group mt-2" id="password_group_wrapper">
                                    <input
                                        aria-invalid="false"
                                        autoFocus=""
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setErrorMessage("");
                                            setPassword(e.target.value);
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                                handleLogin(e);
                                            }
                                        }}
                                    />
                                    <div className="input-group-append" id="show_hide_password">
                                        <span className="input-group-text">
                                            <button
                                                type="button"
                                                className="border-0"
                                                aria-pressed="false"
                                                onClick={handleTogglePassword}
                                            >
                                                <span className="sr-only">
                                                    {showPassword
                                                        ? "Ocultar contraseña"
                                                        : "Mostrar contraseña"}
                                                </span>
                                                <i
                                                    role="img"
                                                    aria-hidden="true"
                                                    className={`far ${showPassword ? "fa-eye" : "fa-eye-slash"
                                                        }`}
                                                ></i>
                                            </button>
                                        </span>
                                    </div>
                                </div>
                                <p className="text-center mt-3">
                                    <Link to="/forgot-password" className="ms-2">
                                        ¿Ha olvidado su contraseña?
                                    </Link>
                                </p>
                            </div>
                            <div className="d-grid gap-2 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-success btn-block"
                                    onClick={handleLogin}
                                >
                                    Iniciar sesión
                                </button>
                            </div>
                            <p className="text-center mt-3">
                                ¿No eres usuario de DiscoStu?
                                <Link to="/signup" className="ms-2">
                                    Crea una cuenta
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};