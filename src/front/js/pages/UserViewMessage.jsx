import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom';




export const UserViewMessage = () => {

    const location = useLocation();
    
    const messageData = location.state.messageData;

    const navigate = useNavigate()

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

    return (
        <div>
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
                            <div style={{ marginTop: '10px' }}>
                                <div>
                                    <button onClick={() => handleNavigateOrders()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Pedidos</button>
                                    <button onClick={() => handleNavigateInbox()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Bandeja de entrada</button>
                                    <button onClick={() => handleNavigateSent()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Enviados</button>
                                    <button onClick={() => handleNavigateTrash()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Papelera</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-9">
                            <div id='message_center'>
                                <div className="border rounded">
                                    <fieldset>
                                        <legend className="bg-light" style={{ padding: '0.4rem 0.4rem 0.4rem 1rem' }}><strong>{messageData.asunto}</strong></legend>
                                        <form>
                                            <div className="p-3">
                                                {
                                                    <div className='d-flex w-100 mb-4' style={{ borderBottom: 'solid 1px #8A8A8A' }}>
                                                        <p>Mensaje de {messageData.emisor} a {messageData.receptor} </p>
                                                        <p style={{ marginLeft: '80px' }}>{messageData.fecha}</p>

                                                    </div>
                                                }
                                                <div className="d-flex mb-4">
                                                    <p>{messageData.mensaje}</p>                                                
                                                </div>
                                            </div>
                                        </form>
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
