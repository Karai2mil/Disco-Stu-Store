import React, { useState, useContext, useEffect } from 'react'
import { Context } from '../store/appContext'
import { useNavigate } from 'react-router-dom';




export const UserViewOrderMessage = () => {


    const navigate = useNavigate()
    const { actions } = useContext(Context)
    const [envio, setEnvio] = useState('')
    const [orderData, setOrderData] = useState(null)

    useEffect(() => {
        const orderDataJson = sessionStorage.getItem('currentOrderData')
        const orderData = JSON.parse(orderDataJson)
        setOrderData(orderData)
    }, [])

    const handleNavigateInbox = () => {
        navigate('/messages')
    }
    const handleNavigateSent = () => {
        navigate('/messages/sent')
    }
    const handleNavigateTrash = () => {
        navigate('/messages/trash')
    }

    const handleNavigateOrders = () => {
        navigate('/user-orders')
    }

    const formatDate = date => {
        if (!date) return '';

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('es-ES', options);
    };

    const handleShipping = (value) => {
        setEnvio(value)
    }

    const sendShippingCost = async (e) => {
        e.preventDefault();
        const data = {
            'order_id': orderData.id,
            'shipping_cost': envio
        }
        const shippingFetch = await actions.sendShippingCost(data)
        if (shippingFetch == 'COMPLETED') {
            const updatedOrderData = { ...orderData };
            updatedOrderData.precio_envio = envio;
            updatedOrderData.haveShipping = true;
            sessionStorage.setItem('currentOrderData', JSON.stringify(updatedOrderData));
            window.location.reload()
        }
    }

    return (
        <div style={{ marginBottom: '180px' }}>
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
                        <div className="col-md-2">
                            <div style={{ marginTop: '10px' }}>
                                <div>
                                    <button onClick={() => handleNavigateOrders()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Pedidos</button>
                                    <button onClick={() => handleNavigateInbox()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Bandeja de entrada</button>
                                    <button onClick={() => handleNavigateSent()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Enviados</button>
                                    <button onClick={() => handleNavigateTrash()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Papelera</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-10" style={{ marginRight: '10px', width: '80%' }}>
                            <div id='message_center'>
                                <div className="border rounded">
                                    <fieldset>
                                        {
                                            orderData === null ? (
                                                <p>Cargando informacion del pedido...</p>
                                            ) : (
                                                <div>

                                                    <legend className="bg-light" style={{ padding: '0.4rem 0.4rem 0.4rem 1rem' }}><strong>Pedido #{orderData.id}</strong></legend>
                                                    <form>
                                                        <div className="p-3">
                                                            {
                                                                <div className='d-flex w-100 mb-4' style={{ borderBottom: 'solid 1px #8A8A8A' }}>
                                                                    <p>Pedido de {orderData.emisor} </p>
                                                                </div>
                                                            }
                                                            <div id="messages_center" className="col-md-9 w-100">
                                                                <div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-bordered table-hover">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Pedido</th>
                                                                                    <th>Fecha de Creación</th>
                                                                                    <th>Estado</th>
                                                                                    <th>Artículo ID</th>
                                                                                    <th>Artículo</th>
                                                                                    <th>{orderData.haveShipping === false ? <p>Subtotal</p> : <p>Total</p>}</th>
                                                                                    <th>Acciones</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr key={orderData.id}>
                                                                                    <td>{orderData.id}</td>
                                                                                    <td>{formatDate(new Date())}</td>
                                                                                    <td>{orderData.pagado ? "Pagado" : "Pendiente"}</td>
                                                                                    <td>{orderData.articulos.map(articulo => articulo.id).join(', ')}</td>
                                                                                    <td>{orderData.articulos.map(articulo => articulo.titulo).join(', ')}</td>

                                                                                    <td>
                                                                                        {(orderData.haveShipping === true) ? (
                                                                                            <span>${parseFloat(orderData.subtotal) + parseFloat(orderData.precio_envio)}</span>
                                                                                        ) : (
                                                                                            <span>${parseFloat(orderData.subtotal)}</span>
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        {(orderData.haveShipping === false) ? (
                                                                                            <div>
                                                                                                <label htmlFor="envio">Precio de envío (USD)</label>
                                                                                                <input onChange={(e) => handleShipping(e.target.value)} value={envio} style={{ width: '6rem', marginLeft: '5px' }} type="text" id='envio' />
                                                                                            </div>
                                                                                        ) : (
                                                                                            <p>Envío establecido (USD {orderData.precio_envio})</p>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>

                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {(orderData.haveShipping === false) ? (
                                                                <div className='d-flex justify-content-end'>
                                                                    <button type='button' onClick={(e) => sendShippingCost(e)} className='btn btn-outline-dark'>Establcer precio de envío</button>

                                                                </div>) : (
                                                                <span></span>
                                                            )}
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
