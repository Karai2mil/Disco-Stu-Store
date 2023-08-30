import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserFavorites } from './userFavorites.jsx'

import { Context } from "../store/appContext";

export const UserProfile = () => {
    const [userData, setUserData] = useState({});
    const [isSeller, setIsSeller] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const { actions } = useContext(Context);

    useEffect(() => {

        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('userID');
                const userData = await actions.getUserById(userId);
                setUserData(userData);
            } catch (error) {
                console.error("Error al obtener la información del usuario:", error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const sellerValidation = async () => {
            const user_id = localStorage.getItem('userID')
            const backendUrl = process.env.BACKEND_URL + `api/users/validate_seller/${user_id}`;
            return await fetch(backendUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result == 'VALIDATED') {
                        setIsSeller(true)
                    }
                });
        };
        const paypalValidation = async () => {
            const user_id = localStorage.getItem('userID')
            const backendUrl = process.env.BACKEND_URL + `api/users/validate_paypal_connection/${user_id}`;
            return await fetch(backendUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result.status == 'CONNECTED') {
                        setIsConnected(true)
                    }
                });
        };
        sellerValidation()
        paypalValidation()
    }), []

    return (
        <div className="container-fluid px-0 mx-0">

            <div className="card border-0 rounded-0">
                <div className=" text-white d-flex flex-row" style={{ backgroundColor: '#000', height: '170px' }}>
                </div>
                <div className="p-4 text-black" style={{ backgroundColor: '#f8f9fa' }}>
                    <h3 className="text-center mb-3">Perfil de {userData.usuario}</h3>
                    <div className="card-body p-4 text-black">
                        <div className="mb-5" style={{border: '1px solid #eeeeee', padding: '10px 30px'}}>
                            <p className="lead fw-normal mb-1">Información de envio: </p>
                            <div className="p-4" style={{ backgroundColor: '#f8f9fa' }}>
                                <p className="font-italic mb-1">Dirección: {userData.direccion_comprador}</p>
                                <p className="font-italic mb-1">Cuidad: {userData.ciudad_comprador} </p>
                                <p className="font-italic mb-0">Pais: {userData.pais_comprador}</p>
                                <p className="font-italic mb-0">Codigo Postal: {userData.codigo_postal_comprador} </p>
                                <p className="font-italic mb-0">Telefono: {userData.telefono_comprador} </p>
                            </div>
                            <div className="d-flex justify-content-end text-center py-1" style={{ width: '320px', marginRight: '24px', marginLeft: 'auto' }}>
                                <Link to="/edit-user" className="btn btn-outline-dark" data-mdb-ripple-color="dark" style={{ zIndex: '1' }}>
                                    <i className="fa-solid fa-gear"></i> Configurar informacion de usuario
                                </Link>
                            </div>
                        </div>
                        <div className="mb-5" style={{border: '1px solid #eeeeee', padding: '10px 30px'}}>
                            <p className="lead fw-normal mb-1">Informacion de vendedor:</p>
                            <div className="p-4" style={{ backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {isSeller ? (
                                            <i className="fa-solid fa-circle-check" style={{ color: '#239a4d', marginRight: '10px' }}></i>
                                        ) : (
                                            <i className="fa-solid fa-xmark" style={{ color: '#cf0707', marginRight: '10px' }}></i>
                                        )
                                        }
                                        <p className="font-italic mb-1">Habilitado para vender</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {isConnected ? (
                                            <i className="fa-solid fa-circle-check" style={{ color: '#239a4d', marginRight: '10px' }}></i>
                                        ) : (
                                            <i className="fa-solid fa-xmark" style={{ color: '#cf0707', marginRight: '10px' }}></i>
                                        )
                                        }
                                        <p className="font-italic mb-1">Conectado con PayPal</p>
                                    </div>
                                </div>

                                <div style={{ width: '320px' }}>
                                    <Link to="/seller" className="btn btn-outline-dark" data-mdb-ripple-color="dark" style={{ zIndex: '1' }}>
                                        <i className="fa-solid fa-gear"></i> Configurar información del vendedor
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

