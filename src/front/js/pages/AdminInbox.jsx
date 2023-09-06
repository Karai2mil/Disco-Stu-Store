import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext'
import { useNavigate, Link } from 'react-router-dom';


export const AdminInbox = () => {

    const navigate = useNavigate()
    const { actions } = useContext(Context)
    const [selectedItems, setSelectedItems] = useState([]);
    const userId = localStorage.getItem('userID');
    const [data, setData] = useState({ inbox: [] });
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(
        sessionStorage.getItem("pendingApprovals") || 0
    );

    useEffect(() => {
        const fetchPendingApprovals = async () => {
            const pendingApprovals = await actions.getArticleForApproval();
            if (pendingApprovals)
                sessionStorage.setItem("pendingApprovals", pendingApprovals.length);
            setPendingApprovalsCount(pendingApprovals.length);
        };

        const handlePendingApprovalsUpdate = (event) => {
            if (event.data && event.data.type === "pendingApprovalsUpdated") {
                const newValue = event.data.value;
                setPendingApprovalsCount(newValue);
            }
        };

        fetchPendingApprovals();

        window.addEventListener("message", handlePendingApprovalsUpdate);

        return () => {
            window.removeEventListener("message", handlePendingApprovalsUpdate);
        };
    }, []);

    const handleNavigateArchived = () => {
        navigate('/admin-archived-messages')
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

    const toggleSelectMessage = (index) => {
        // Verificar si el índice ya está seleccionado para añadirlo o removerlo de la lista
        setSelectedItems((prevSelectedItems) => {
            if (prevSelectedItems.includes(index)) {
                return prevSelectedItems.filter((selected) => selected !== index);
            } else {
                return [...prevSelectedItems, index];
            }
        });
    };

    const handleDeleteMessage = () => {
        const selectedItemsCopy = [...selectedItems]
        setSelectedItems([])
        selectedItemsCopy.map(element => {
            const message_data = {
                'message_id': element
            }
            actions.deleteMessage(message_data)
        })
    }

    return (
        <div className="container-flui" style={{ marginBottom: '189px' }}>
            {/* Encabezado */}
            <div className="container-fluid p-0 m-0">
                <div className="card border-0 rounded-0">
                    <div
                        className="text-white d-flex flex-row justify-content-center flex-column"
                        style={{ backgroundColor: "#000", height: "170px" }}
                    >
                        <div className="text-white">
                            <h3 className="text-center">Panel de Administrador</h3>
                        </div>
                        <div id="icons" style={{ marginTop: '30px' }}>
                            <div className="d-flex align-items-center justify-content-between w-50 m-auto">
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/home-edition" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-pencil p-2"></i>
                                        <p>Editar home</p>
                                    </Link>
                                </div>
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/admin-panel" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-users p-2"></i>
                                        <p>Administrar usuarios</p>
                                    </Link>
                                </div>
                                <div className="nav-item me-3 me-lg-0 justify-content-center">
                                    <Link to="/approvals" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-clipboard p-2"></i>
                                        {pendingApprovalsCount > 0 && (
                                            <span className="badge bg-danger top-0 start-100 translate-middle"
                                                style={{
                                                    fontSize: '0.5rem',
                                                    padding: '0.2rem 0.5rem',
                                                    top: '-1rem'
                                                }}
                                            >
                                                {pendingApprovalsCount}
                                            </span>
                                        )}
                                        <p>Aprobaciones</p>
                                    </Link>
                                </div>
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/admin-inbox" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-message p-2"></i>
                                        <p style={{ fontSize: '1.1rem' }}>Bandeja de entrada</p>
                                    </Link>
                                    <div className="d-flex justify-content-center">
                                        <i className="fa-solid fa-caret-down" style={{ color: '#ffffff' }}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', margin: '30px 100px', border: '1px solid #eeeeee' }}>
                <div className="container">
                    <div className="row" style={{ margin: '30px 70px' }}>
                        <div className="col-md-3">
                            <div className="mt-3">
                                <div>
                                    <button style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline"><strong>Bandeja de entrada</strong></button>
                                    <button onClick={() => handleNavigateArchived()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Archivados</button>
                                </div>
                            </div>
                        </div>
                        <div id="messages_center" className="col-md-9">
                            <h3 className="mb-3">Bandeja de entrada</h3>
                            <div className="mb-3 d-flex justify-content-end">
                                <button onClick={() => handleDeleteMessage()} className="btn btn-outline-dark">Eliminar</button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="col"><input type="checkbox" /></th>
                                            <th className="col">De</th>
                                            <th className="col">Asunto</th>
                                            <th className="col">Enviado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.inbox.length > 0 ? (
                                            data.inbox.map((element, index) => (
                                                <tr key={element.id}>
                                                    <td style={{ width: '30px', padding: '0.5rem' }}>
                                                        <input type="checkbox" onChange={() => toggleSelectMessage(element.id)} />
                                                    </td>
                                                    <td style={{ width: '25%' }}>{element.emisor_id}</td>
                                                    <td style={{ width: '54%' }}>{element.asunto}</td>
                                                    <td style={{ width: '18%' }}>{element.fecha}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4">No hay mensajes en la bandeja de entrada</td>
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
