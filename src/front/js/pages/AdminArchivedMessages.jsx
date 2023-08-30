import React, { useContext, useState, useEffect } from 'react'
import { Context } from '../store/appContext'
import { useNavigate, Link } from 'react-router-dom';


export const AdminArchivedMessages = () => {

    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [selectedItems, setSelectedItems] = useState([]);
    const userId = localStorage.getItem('userID');
    const [data, setData] = useState({ deleted_messages: [] });
    const [users, setUsers] = useState([]);
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


    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchDeletedMessages = await actions.getAllMessages(userId)
                setData(fetchDeletedMessages);

                const usersData = await actions.getAllUsersInfo();
                setUsers(usersData);
            } catch (error) {
                console.log('Error fetching data: ', error);
            }
        };
        fetchData();
    }, [actions, userId]);


    const handleNavigateInbox = () => {
        navigate('/admin-inbox')
    }

    const toggleSelectMessage = (messageId) => {
        setSelectedItems((prevSelectedItems) => {
            if (prevSelectedItems.includes(messageId)) {
                return prevSelectedItems.filter((selected) => selected !== messageId);
            } else {
                return [...prevSelectedItems, messageId];
            }
        });
    };

    const handleRecoverMessage = async () => {
        try {
            await Promise.all(selectedItems.map(async (messageId) => {
                const response = await actions.recoverDeletedMessage(messageId); // Cambia esto a la acción real para recuperar mensajes
            }));
            setSelectedItems([]);
            // Actualiza la lista de mensajes eliminados después de la recuperación
            await actions.getDeletedMessages(userId); // Cambia esto a la acción real para obtener los mensajes eliminados
        } catch (error) {
            console.log('Error recovering messages:', error);
        }
    };

    return (
        <div className="container-flui">
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
                                        <i class="fa-solid fa-pencil p-2"></i>
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
                                        <i class="fa-solid fa-caret-down" style={{ color: '#ffffff' }}></i>
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
                            <div style={{ marginTop: '10px' }}>
                                <div>
                                    <button onClick={() => handleNavigateInbox()} style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline">Bandeja de entrada</button>
                                    <button style={{ width: '100%', textAlign: 'left', padding: '6px' }} type="button" className="btn btn-outline"><strong>Archivados</strong></button>
                                </div>
                            </div>
                        </div>
                        <div id="messages_center" className="col-md-9">
                            <h3 className="mb-3">Mensajes Archivados</h3>
                            <div className="mb-3 d-flex justify-content-end">
                                <button onClick={() => handleDeleteMessage()} className="btn btn-outline-dark">Eliminar</button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="col"><input type="checkbox" /></th>
                                            <th className="col">Para</th>
                                            <th className="col">Asunto</th>
                                            <th className="col">Enviado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.deleted_messages.length > 0 ? (
                                            data.deleted_messages.map((element, index) => {
                                                const emisor = users.find((user) => user.id === element.emisor_id);
                                                // Si se encuentra el emisor, muestra el nombre, de lo contrario, muestra "Emisor desconocido"
                                                const emisorName = emisor ? emisor.username : 'Emisor desconocido';

                                                return (
                                                    <tr key={element.id}>
                                                        <td style={{ width: '30px', padding: '2px 0px 0px 5px' }}><input onChange={() => toggleSelectMessage(element.id)} type="checkbox" /></td>
                                                        <td style={{ width: '25%' }}>{emisorName}</td>
                                                        <td style={{ width: '54%' }}>{element.asunto}</td>
                                                        <td style={{ width: '18%' }}>{element.fecha}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4">No hay mensajes archivados</td>
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

