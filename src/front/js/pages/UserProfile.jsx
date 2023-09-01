import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserFavorites } from './userFavorites.jsx'

import { Context } from "../store/appContext";

import styles from "../../styles/Offers.module.css";

export const UserProfile = () => {
    const [userData, setUserData] = useState({});
    const [isSeller, setIsSeller] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [userOffers, setUserOffers] = useState('')
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
        const fetchUserOffers = async () => {
            try {
                const userId = localStorage.getItem('userID');
                const userData = await actions.getUserOffers(userId);
                setUserOffers(userData);
            } catch (error) {
                console.error("Error al obtener ofertas del usuario:", error);
            }
        };
        fetchUserOffers();
    }, []);

    useEffect(() => {
        const sellerValidation = async () => {
            const user_id = localStorage.getItem('userID')
            const backendUrl = process.env.BACKEND_URL + `/api/users/validate_seller/${user_id}`;
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
            const backendUrl = process.env.BACKEND_URL + `/api/users/validate_paypal_connection/${user_id}`;
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

    const deleteOffer = async (offer) => {
        const offer_id = [offer.id]
        const fetchDeleteOffer = await actions.deleteOffer(offer_id)
        if (fetchDeleteOffer == 'COMPLETED') {
            window.location.reload()
        }
    }

    return (
        <div className="container-fluid px-0 mx-0">

            <div className="card border-0 rounded-0">
                <div className=" text-white d-flex flex-row" style={{ backgroundColor: '#000', height: '170px' }}>
                </div>
                <div className="p-4 text-black" style={{ backgroundColor: '#f8f9fa' }}>
                    <h3 className="text-center mb-3">Perfil de {userData.usuario}</h3>
                    <div className="card-body p-4 text-black">
                        <div className="mb-5" style={{ border: '1px solid #eeeeee', padding: '20px 100px' }}>
                            <p className="lead fw-normal mb-1">Información de envio: </p>
                            <div className="p-4" style={{ backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>                                
                                <div style={{ backgroundColor: '#f8f9fa' }}>
                                    <p className="font-italic mb-1">Dirección: {userData.direccion_comprador}</p>
                                    <p className="font-italic mb-1">Cuidad: {userData.ciudad_comprador} </p>
                                    <p className="font-italic mb-0">Pais: {userData.pais_comprador}</p>
                                    <p className="font-italic mb-0">Codigo Postal: {userData.codigo_postal_comprador} </p>
                                    <p className="font-italic mb-0">Telefono: {userData.telefono_comprador} </p>
                                </div>
                                <div className="d-flex justify-content-end text-center py-1" style={{ width: '320px', marginLeft: 'auto', marginTop: 'auto' }}>
                                    <Link to="/edit-user" className="btn btn-outline-dark" data-mdb-ripple-color="dark" style={{ zIndex: '1' }}>
                                        <i className="fa-solid fa-gear"></i> Configurar informacion de usuario
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="mb-5" style={{ border: '1px solid #eeeeee', padding: '20px 100px' }}>
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

                                <div style={{ width: '320px'}}>
                                    <Link to="/seller" className="btn btn-outline-dark" data-mdb-ripple-color="dark" style={{ zIndex: '1' }}>
                                        <i className="fa-solid fa-gear"></i> Configurar información del vendedor
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="mb-5" style={{ border: '1px solid #eeeeee', padding: '20px 50px' }}>
                            <p className="lead fw-normal mb-3" style={{paddingLeft: '50px'}}>Articulos en venta:</p>
                            <div id='offers'>
                                <table className={styles.tableProfile}>
                                    <thead className={styles.tableHead}>
                                        <tr>
                                            <th style={{ width: '50%', paddingLeft: '70px' }}>Articulo</th>
                                            <th style={{ width: '15%', paddingLeft: '10px' }}>Precio</th>
                                            <th style={{ width: '15%', paddingLeft: '10px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userOffers && userOffers.length > 0 ? (
                                            userOffers.map((offer, index) => {
                                                return (
                                                    <tr key={index} style={{ marginBottom: '40px' }}>
                                                        <td style={{ width: '50%', paddingLeft: '70px' }}>
                                                            <p style={{ marginBottom: '5px' }}><strong>{offer.titulo}</strong></p>
                                                            <div className={styles.properties}>
                                                                <p className={styles.articleConditionsProfile}>Estado del soporte:</p>
                                                                <p className={styles.articleConditionsProfile}>{offer.condicion_soporte}</p>
                                                            </div>
                                                            <div className={styles.properties}>
                                                                <p className={styles.articleConditionsProfile}>Condición de la funda:</p>
                                                                <p className={styles.articleConditionsProfile}>{offer.condicion_funda}</p>
                                                            </div>
                                                        </td>
                                                        <td style={{ width: '18%', paddingLeft: '10px' }}>
                                                            <p style={{ color: '#CD2906' }}><strong>${offer.precio}</strong></p>
                                                        </td>
                                                        <td style={{ width: '16%', padding: '0px 20px 0px 10px' }}>
                                                            <button onClick={() => deleteOffer(offer)} type="button" className={`btn btn-dark ${styles.cartBtn}`}>Eliminar oferta</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td>
                                                    <p className='p-2'><strong>No tienes articulos en venta</strong></p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

