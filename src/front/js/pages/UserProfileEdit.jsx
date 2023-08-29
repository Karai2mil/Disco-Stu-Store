import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Context } from "../store/appContext";

export const UserProfileEdit = () => {
    const { actions } = useContext(Context);
    const { userCurrentData } = useState([]);

    useEffect(() => {

        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('userID');
                const userCurrentData = await actions.getUserById(userId);
                console.log("Data de usuario", userCurrentData);
            } catch (error) {
                console.error("Error al obtener la información del usuario:", error);
            }
        };
        fetchUserData();
    }, []);

    const [userData, setUserData] = useState({
        nombre: "John Doe",
        // correo: "john@example.com",
        direccion_comprador: "123 Main St",
        ciudad_comprador: "New York",
        estado_comprador: "NY",
        codigo_postal_comprador: "10001",
        pais_comprador: "USA",
        telefono_comprador: "123-456-7890",
        valoracion: 4.5,
        cantidad_de_valoraciones: 10,
        is_admin: false,
    });

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setUserData({
            ...userData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const userId = localStorage.getItem('userID')
            const responseMessage = await actions.editUser(userId, userData);

            console.log(responseMessage);

        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div className="container-fluid px-0 mx-0">

            <div className="card border-0 rounded-0">
                <div className=" text-white d-flex flex-row" style={{ backgroundColor: '#000', height: '200px' }}>
                    <div className="ms-4 mt-5 d-flex flex-column" style={{ width: '150px' }}>
                    </div>
                    <div className="ms-3" style={{ marginTop: '130px' }}>
                    </div>
                </div>
                <div className="p-4 text-black" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex justify-content-end text-center align-items-center py-1">
                        <button type="submit" className="btn btn-outline-dark" data-mdb-ripple-color="dark" style={{ zIndex: '1' }} onClick={handleSubmit} >
                            <p>Guardar cambios</p>
                        </button>
                        <Link to="/user-profile" className="nav-link text-dark btn" data-mdb-ripple-color="dark" style={{ zIndex: '1', marginLeft: '5px' }}>
                            <button type="button" className="btn btn-outline-dark">Cancelar</button>
                        </Link>
                    </div>
                </div>
                <div className="card-body p-4 text-black">
                    <div className="container">
                        <h1>Editar Perfil de Usuario</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    name="nombre"
                                    value={userData.nombre}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {/* <div className="form-group">
                                <label htmlFor="correo">Correo:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="correo"
                                    name="correo"
                                    value={userData.correo}
                                    onChange={handleInputChange}
                                />
                            </div> */}
                            <div className="form-group">
                                <label htmlFor="direccion_comprador">Dirección del Comprador:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="direccion_comprador"
                                    name="direccion_comprador"
                                    value={userData.direccion_comprador}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ciudad_comprador">Ciudad del Comprador:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="ciudad_comprador"
                                    name="ciudad_comprador"
                                    value={userData.ciudad_comprador}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="estado_comprador">Estado del Comprador:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="estado_comprador"
                                    name="estado_comprador"
                                    value={userData.estado_comprador}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="codigo_postal_comprador">Código Postal del Comprador:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="codigo_postal_comprador"
                                    name="codigo_postal_comprador"
                                    value={userData.codigo_postal_comprador}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pais_comprador">País del Comprador:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="pais_comprador"
                                    name="pais_comprador"
                                    value={userData.pais_comprador}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefono_comprador">Teléfono:</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    id="telefono_comprador"
                                    name="telefono_comprador"
                                    value={userData.telefono_comprador}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

    );
};

