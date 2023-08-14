import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext'
import { useNavigate } from 'react-router-dom';
// import PayPalPayment from '../component/PayPalPayment.jsx'


export const UserOrders = () => {
    const navigate = useNavigate()
    const { store, actions } = useContext(Context);
    const [ordersList, setOrdersList] = useState([]);
    const [vendorInfo, setVendorInfo] = useState([]);
    const [totalArticles, setTotalArticles] = useState(0);

    useEffect(() => {
        actions.getCart();
    }, []);

    const handleNavigateSent = () => {
        navigate('/messages/sent')
    }

    const handleNavigateOrders = () => {
        navigate('/user-orders')
    }

    const handleNavigateInbox = () => {
        navigate('/messages')
    }
    const handleNavigateTrash = () => {
        navigate('/messages/trash')
    }

    const handleNavigateWriteMessage = () => {
        navigate('/messages/compose')
    }

    const handleGetOrders = async () => {
        const user_id = localStorage.getItem('userID')
        const ordersData = await actions.getOrderPlaced(user_id);

        setOrdersList(ordersData);

        const totalArticles = ordersData.reduce((total, order) => total + order.items.length, 0);
        setTotalArticles(totalArticles);

    }

    useEffect(() => {
        handleGetOrders();
    }, []);


    return (
        <div>
            {/* Header */}
            <div className="card bg-black rounded-0 border-0">
                <div
                    className="text-white d-flex flex-row w-100 border-0"
                >
                    <div
                        className="ms-4 mt-5 d-flex flex-column"
                        style={{ width: "150px" }}
                    ></div>
                    <div className="ms-3" style={{ marginTop: "130px" }}></div>
                </div>
                <div
                    className="p-4 text-black"
                    style={{ backgroundColor: "#f8f9fa" }}
                >
                    <h3 className="text-center">Mensajes</h3>
                    <div className="d-flex justify-content-end text-center py-1">
                    </div>
                </div>
            </div>
            <div>
                <div className="container-fluid" style={{ margin: '30px' }}>
                    <div className="row me-3">
                        <div className="col-md-3">
                            <div>
                                <button onClick={() => handleNavigateWriteMessage()} className="btn btn-dark mb-3 w-100">Escribir</button>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <div>
                                    <button onClick={() => handleNavigateOrders()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline"><strong>Pedidos</strong></button>
                                    <button onClick={() => handleNavigateInbox()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Bandeja de entrada</button>
                                    <button onClick={() => handleNavigateSent()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Enviados</button>
                                    <button onClick={() => handleNavigateTrash()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Papelera</button>
                                </div>
                            </div>
                        </div>
                        <div id="messages_center" className="col-md-9">
                            <div className="mb-3 me-3 d-flex justify-content-end">
                                <button onClick={() => handleDeleteMessage()} className="btn btn-outline-dark">Eliminar</button>
                            </div>
                            <div class="table-responsive">
                                <h5 style={{ margin: 0 }}><strong>Tienes total de Pedidos:</strong>{totalArticles}</h5>
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Número de Pedido</th>
                                            <th>Vendedor</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordersList.map(order => (

                                            <tr key={order.id}>
                                                <td>{order.id}</td>
                                                <td>Vendedor: {vendorInfo.nombre}</td>
                                                <td>${order.precio_total}</td>
                                                {/* <td><PayPalPayment /></td> */}
                                            </tr>

                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

