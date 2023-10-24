import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext'
import { useNavigate } from 'react-router-dom';


const User_inbox = () => {

    const navigate = useNavigate()
    const { actions } = useContext(Context)
    const [selectedItems, setSelectedItems] = useState([]);
    const userId = localStorage.getItem('userID');
    const [data, setData] = useState({ inbox: [] });
    const [users, setUsers] = useState([]);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedData = await actions.getAllMessages(userId);
                setData(fetchedData);
            } catch (error) {
                console.log('Error fetching messages: ', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchUsers = await actions.getAllUsersInfo(userId)
                setUsers(fetchUsers);
            } catch (error) {
                console.log('Error fetching data: ', error);
            }
        };
        fetchData();
    }, []);

    const toggleSelectMessage = (messageId) => {
        setSelectedItems((prevSelectedMessages) => {
            if (prevSelectedMessages.includes(messageId)) {
                return prevSelectedMessages.filter((selected) => selected !== messageId);
            } else {
                return [...prevSelectedMessages, messageId];
            }
        });
    };

    const handleDeleteMessage = async () => {
        const selectedItemsCopy = [...selectedItems]
        setSelectedItems([])
        const fetchMessages = await actions.deleteMessage(selectedItemsCopy)
        if (fetchMessages == 'COMPLETED') {
            window.location.reload();
        }
    }

    const handleViewMessage = async (element) => {
        if (element.isMessage == 'True'){
            if (users.length > 0) {
                const emisor = users.find((user) => user.id === element.emisor_id);
                const receptor = users.find((user) => user.id == element.receptor_id)
                const emisorName = emisor.username;
                const receptorName = receptor.username;
                const messageData = {
                    'emisor': emisorName,
                    'receptor': receptorName,
                    'fecha': element.fecha,
                    'mensaje': element.mensaje,
                    'asunto': element.asunto
                }
                navigate('/messages/message', { state: { messageData } });
            }
        }
        if (element.isMessage == 'False'){
            const parts = element.asunto.split(' ');
            const orderIdWithHash = parts[parts.length - 1];
            const orderId = orderIdWithHash.replace('#', '');
            const emisor = users.find((user) => user.id === element.emisor_id);
            try {
                const orderData = await actions.getOrderById(orderId);
                orderData.emisor = emisor.username
                sessionStorage.setItem('currentOrderData', JSON.stringify(orderData))
                navigate('/messages/message/order');
            } catch (error) {
                console.error('Error fetching order data:', error);
            }
        }
    };

    const handleSelectAllMessages = () => {
        if (selectedItems.length === data.inbox.length) {
            setSelectedItems([]);
        } else {
            const allMessageIds = data.inbox.map(element => element.id);
            setSelectedItems(allMessageIds);
        }
    };

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
                                    <button onClick={() => handleNavigateOrders()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Pedidos</button>
                                    <button onClick={() => handleNavigateInbox()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline"><strong>Bandeja de entrada</strong></button>
                                    <button onClick={() => handleNavigateSent()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Enviados</button>
                                    <button onClick={() => handleNavigateTrash()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Papelera</button>
                                </div>
                            </div>
                        </div>
                        <div id="messages_center" className="col-md-9">
                            <div className="mb-3 d-flex justify-content-end">
                                <button onClick={() => handleDeleteMessage()} className="btn btn-outline-dark">Eliminar</button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="bg-light">
                                        <tr>
                                            {
                                                data.inbox.length > 0 ? (
                                                    <th className="col"><input type="checkbox" onChange={handleSelectAllMessages} checked={selectedItems.length === data.inbox.length} /></th>
                                                ) : (
                                                <th className="col">{''}</th>
                                                )
                                            }
                                            <th className="col">De</th>
                                            <th className="col">Asunto</th>
                                            <th className="col">Enviado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.inbox.length > 0 & users.length > 0 ? (
                                            data.inbox.map((element, index) => {
                                                const emisor = users.find((user) => user.id == element.emisor_id);
                                                const emisorName = emisor ? emisor.username : 'Emisor desconocido';
                                                return (
                                                    <tr key={element.id}>
                                                        <td style={{ width: '30px', padding: '2px 0px 0px 5px' }}>
                                                            <input
                                                                type="checkbox"
                                                                onChange={() => toggleSelectMessage(element.id)}
                                                                checked={selectedItems.includes(element.id)}
                                                            />
                                                        </td>
                                                        <td style={{ width: '25%' }}>{emisorName}</td>
                                                        <td onClick={() => handleViewMessage(element)} style={{ width: '54%', cursor: 'pointer', textDecoration: 'underline' }}>{element.asunto}</td>
                                                        <td style={{ width: '18%' }}>{element.fecha}</td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td className="col">No hay mensajes en la bandeja de enviados.</td>
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
    )
}

export default User_inbox