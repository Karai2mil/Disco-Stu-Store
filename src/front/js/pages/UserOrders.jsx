import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext'
import { useNavigate } from 'react-router-dom';
import PaymentComponent from '../component/PayPalPayment.jsx'
import Swal from 'sweetalert2';

export const UserOrders = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [ordersList, setOrdersList] = useState([]);
    const [refreshOrders, setRefreshOrders] = useState(false);
    const [checkboxStates, setCheckboxStates] = useState([]);

    const paidOrders = ordersList.filter(order => order.pagado);
    const pendingOrders = ordersList.filter(order => !order.pagado);

    const sortedOrdersList = [...pendingOrders, ...paidOrders];

    useEffect(() => {
        const handleGetOrders = async () => {
            const user_id = localStorage.getItem('userID');
            const ordersData = await actions.getOrderPlaced(user_id);
            setOrdersList(ordersData);

            const initialCheckboxStates = ordersData.map(() => ({
                valoracionPositiva: false,
                valoracionNegativa: false,
            }));
            setCheckboxStates(initialCheckboxStates);

            // Restablecer la actualización de pedidos
            setRefreshOrders(false);
        };

        handleGetOrders();
    }, [refreshOrders]);

    const updatePageData = async () => {
        try {
            const user_id = localStorage.getItem('userID');
            const ordersData = await actions.getOrderPlaced(user_id);
            setOrdersList(ordersData);
        } catch (error) {
            console.error('Error updating page data:', error);
        }
    };

    const handlerDeleteOrder = async (order_id) => {
        const user_id = localStorage.getItem('userID');

        try {
            await actions.deleteOrderbyOrderId({
                user_id,
                order_id
            });

            // Alerta de éxito
            Swal.fire({
                icon: 'success',
                title: 'Pedido eliminado exitosamente',
                showConfirmButton: false,
                timer: 1500
            });


            setOrdersList(prevOrders => prevOrders.filter(order => order.id !== order_id));
        } catch (error) {

            Swal.fire({
                icon: 'error',
                title: 'Error al eliminar el pedido',
                text: 'Hubo un problema al eliminar el pedido. Por favor, inténtalo de nuevo más tarde.',
                confirmButtonText: 'Cerrar'
            });
        }
    };

    const formatDate = date => {
        if (!date) return '';

        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('es-ES', options);
    };

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

    const handleEnviarValoracion = async (order, index) => {
        const currentCheckboxStates = [...checkboxStates];
        const currentCheckboxState = currentCheckboxStates[index];
        if (currentCheckboxState.valoracionPositiva) {
            const object = {
                'vendedor_id': order.vendedor_id,
                'positivo_o_negativo': 'POSITIVO',
                'order_id': order.id,
            }
            const response = await actions.sendRating(object)
            if (response == 'COMPLETED') {
                window.location.reload();
            }
        } else if (currentCheckboxState.valoracionNegativa) {
            const object = {
                'vendedor_id': order.vendedor_id,
                'positivo_o_negativo': 'NEGATIVO',
                'order_id': order.id,
            }
            const response = await actions.sendRating(object)
            if (response == 'COMPLETED') {
                window.location.reload();
            }
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="card bg-black rounded-0 border-0">
                <div className="text-white d-flex flex-row w-100 border-0">
                    <div className="ms-4 mt-5 d-flex flex-column" style={{ width: "150px" }}></div>
                    <div className="ms-3" style={{ marginTop: "130px" }}></div>
                </div>
                <div className="p-4 text-black" style={{ backgroundColor: "#f8f9fa" }}>
                    <h3 className="text-center">Mensajes</h3>
                    <div className="d-flex justify-content-end text-center py-1"></div>
                </div>
            </div>
            <div>
                <div className="container-fluid" style={{ margin: '30px' }}>
                    <div className="row me-3">
                        <div className="col-md-2">
                            <div style={{ marginTop: '10px' }}>
                                <div>
                                    <button onClick={() => handleNavigateOrders()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline"><strong>Pedidos</strong></button>
                                    <button onClick={() => handleNavigateInbox()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Bandeja de entrada</button>
                                    <button onClick={() => handleNavigateSent()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Enviados</button>
                                    <button onClick={() => handleNavigateTrash()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Papelera</button>
                                </div>
                            </div>
                        </div>
                        <div id="messages_center" className="col-md-10" style={{ marginRight: '10px', width: '80%', border: '1px solid #eeeeee' }}>
                            {sortedOrdersList.length > 0 ?
                                (
                                    sortedOrdersList.map((order, index) => (
                                        <div style={{margin: '10px 0px'}} key={index}>
                                            <div className="table-responsive">
                                                <table className="table table-bordered table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Pedido</th>
                                                            <th>Fecha de Creación</th>
                                                            <th>Estado</th>
                                                            <th>Artículo ID</th>
                                                            <th>Artículo</th>
                                                            <th>
                                                                {(order.haveShipping === false) ? (
                                                                    <p>Subtotal</p>
                                                                ) : (
                                                                    <p>Total</p>
                                                                )}
                                                            </th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr key={order.id}>
                                                            <td>{order.id}</td>
                                                            <td>{formatDate(new Date())}</td>
                                                            <td>{order.pagado ? "Pagado" : "Pendiente"}</td>
                                                            <td>{order.articulos.map(articulo => articulo.id).join(', ')}</td>
                                                            <td>{order.articulos.map(articulo => articulo.titulo).join(', ')}</td>
                                                            <td>
                                                                {(order.haveShipping === false) ? (
                                                                    <span>${order.subtotal}</span>
                                                                ) : (
                                                                    <span>${order.precio_total}</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {(order.haveShipping === false) ? (
                                                                    <p>Contacta al vendedor para establecer precio de envío, o <span onClick={() => handlerDeleteOrder(order.id)} style={{color: '#0000ee', cursor: 'pointer'}}>cancele su pedido.</span></p>
                                                                ) : (
                                                                    <div>
                                                                        {!order.pagado && (
                                                                            <button className="btn btn-outline-dark w-100 mb-2" onClick={() => handlerDeleteOrder(order.id)}>Cancelar pedido</button>
                                                                        )}
                                                                        {!order.pagado && (
                                                                            <PaymentComponent orderID={order.id} cost={order.precio_total} updatePageData={updatePageData} seller_id={order.vendedor_id} ofertas_ids={order.ofertas_ids} />
                                                                        )}
                                                                    </div>
                                                                )}

                                                            </td>

                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                            {order.pagado &&
                                            <div>
                                                {
                                                    !order.valorado && checkboxStates.length > 0 ? (
                                                        <div className='d-flex mt-0 align-items-center' style={{ borderLeft: '1px solid #eeeeee', borderBottom: '1px solid #eeeeee', paddingLeft: '10px' }}>
                                                    <p><strong>Enviar valoracion al vendedor:</strong></p>
                                                    <div className='d-flex align-items-center' style={{ marginLeft: '30px' }}>
                                                        <input type="checkbox"
                                                            checked={checkboxStates[index].valoracionPositiva}
                                                            onChange={() => {
                                                                const updatedStates = [...checkboxStates];
                                                                updatedStates[index] = {
                                                                    valoracionPositiva: !checkboxStates[index].valoracionPositiva,
                                                                    valoracionNegativa: false,
                                                                };
                                                                setCheckboxStates(updatedStates);
                                                            }}
                                                            style={{ marginRight: '5px' }}
                                                        />
                                                        <i className="fa-solid fa-circle-check" style={{ color: '#239a4d' }}></i>
                                                        <p><strong>Positivo</strong></p>
                                                    </div>
                                                    <div className='d-flex align-items-center' style={{ marginLeft: '30px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={checkboxStates[index].valoracionNegativa}
                                                            onChange={() => {
                                                                const updatedStates = [...checkboxStates];
                                                                updatedStates[index] = {
                                                                    'valoracionPositiva': false,
                                                                    'valoracionNegativa': !checkboxStates[index].valoracionNegativa,
                                                                };
                                                                setCheckboxStates(updatedStates);
                                                            }}
                                                            style={{ marginRight: '5px' }}
                                                        />
                                                        <i className="fa-solid fa-xmark" style={{ color: '#cf0707' }}></i>
                                                        <p><strong>Negativo</strong></p>
                                                    </div>
                                                    <button style={{ marginLeft: 'auto', marginRight: '5px' }} onClick={() => handleEnviarValoracion(order, index)} type='button' className='btn btn-dark'>Enviar</button>
                                                </div>
                                                    ) : (
                                                        <div>
                                                            <p>Pedido valorado</p>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                                
                                            }
                                        </div>
                                    ))

                                ) : (
                                    <img src="" alt="" />
                                )
                            }
                        </div>

                    </div>
                </div>
            </div>
        </div>

    )
}
