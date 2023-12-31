import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext'
import { useNavigate, Link } from 'react-router-dom';


export const AdminInbox = () => {

    const navigate = useNavigate()
    const { actions } = useContext(Context)
    const [selectedItems, setSelectedItems] = useState([]);
    const [adminMessages, setAdminMessages] = useState();
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(
        sessionStorage.getItem("pendingApprovals") || 0
    );

    useEffect(() => {
        const fetchPendingArticles = async () => {
            const pendingArticleApprovals = await actions.getArticleForApproval();
            const pendingVideoApprovals = await actions.getVideoUpdates();

            if (pendingArticleApprovals && pendingVideoApprovals) {
                const totalApprovals = pendingArticleApprovals.length + pendingVideoApprovals.data.length
                sessionStorage.setItem("pendingApprovals", totalApprovals);
                setPendingApprovalsCount(totalApprovals);
            }
        };

        const handlePendingApprovalsUpdate = (event) => {
            if (event.data && event.data.type === "pendingApprovalsUpdated") {
                const newValue = event.data.value;
                setPendingApprovalsCount(newValue);
            }
        };

        fetchPendingArticles();

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
                const fetchedData = await actions.getAllAdminMessages();
                console.log(fetchedData)
                setAdminMessages(fetchedData);

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

    const hanlderNavigateArticle = (articulo_id) => {
        navigate(`/article/${articulo_id}`)
    }

    const deleteComment = async (message_data) => {
        const deleteCommentFetch = await actions.deleteArticleComment(message_data.id)
        if (deleteCommentFetch.status === 'COMPLETED') {
            location.reload()
        }
    }

    const keepComment = async (message_data) => {
        const keepCommentFetch = await actions.deleteAdminMessage(message_data.message_id)
        if (keepCommentFetch.status === 'COMPLETED') {
            location.reload()
        }
    }

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
                            <div  style={{width: '70%'}} className="d-flex align-items-center justify-content-between m-auto">
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/home-edition" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-pencil p-2"></i>
                                        <p>Editar home</p>
                                    </Link>
                                </div>
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/admin-panel" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-users p-2"></i>
                                        <p style={{ fontSize: '1.1rem' }}>Administrar usuarios</p>
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
                                        <p>Bandeja de entrada</p>
                                    </Link>
                                    <div className="d-flex justify-content-center">
                                        <i className="fa-solid fa-caret-down" style={{ color: '#ffffff' }}></i>
                                    </div>
                                </div>
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/admin/reported/comments" className="nav-link text-white d-flex align-items-center">
                                        <i class="fa-solid fa-comment-medical p-2"></i>
                                        <p>Comentarios denunciados</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Cuerpo*/}
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
                                    <thead className="bg-light" style={{ borderBottom: '2px solid black' }}>
                                        <tr>
                                            <th className="col"><input type="checkbox" /></th>
                                            <th className="col">De</th>
                                            <th className="col">Asunto</th>
                                            <th className="col">Enviado</th>
                                        </tr>
                                    </thead>
                                    {adminMessages &&
                                        adminMessages.inbox.length > 0 ? (
                                        adminMessages.inbox.map((element, index) => (
                                            <tbody style={{ borderTop: 'none' }}>
                                                <tr key={element.id} style={{ cursor: 'pointer' }}>
                                                    <td style={{ width: '30px', padding: '0.5rem' }}>
                                                        <input type="checkbox" onChange={() => toggleSelectMessage(element.id)} />
                                                    </td>
                                                    <td style={{ width: '25%' }}>{element.emisor_id}</td>
                                                    <td style={{ width: '54%' }}><p style={{ color: 'rgb(52, 52, 204)', textDecoration: 'underline' }} data-bs-toggle='collapse' data-bs-target={`#collapse${element.id}`} aria-expanded="false" aria-controls={`collapse${element.id}`}>{element.asunto}</p></td>
                                                    <td style={{ width: '18%' }}>{element.fecha}</td>
                                                </tr>
                                                <tr className='w-100'>
                                                    <td colSpan='4' className='p-0'>
                                                        <div className="collapse my-2" id={`collapse${element.id}`}>
                                                            <div className="p-3">
                                                                {adminMessages.comments
                                                                    .filter(comment => comment.message_id === element.id)
                                                                    .map(comment => (
                                                                        <div className='d-flex flex-column w-100' key={comment.id}>
                                                                            <div style={{ borderBottom: '1px solid rgb(138, 138, 138)', display: 'flex' }}>
                                                                                <p>Comentario de {comment.user_id} en articulo&nbsp;</p><p style={{ color: 'rgb(52, 52, 204)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => hanlderNavigateArticle(comment.articulo_id)}>{comment.articulo_id}</p><p>, {comment.fecha}</p>
                                                                            </div>
                                                                            <div className="d-flex mb-4">
                                                                                <p>{comment.comentario}</p>
                                                                            </div>
                                                                            <div className='d-flex justify-content-end'>
                                                                                <button onClick={() => keepComment(comment)} type='button' className='btn btn-success' style={{ marginRight: '5px' }}>Conservar comentario</button>
                                                                                <button onClick={() => deleteComment(comment)} type='button' className='btn btn-danger'>Eliminar comentario</button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        ))
                                    ) : (
                                        <tbody>
                                            <tr>
                                                <td colSpan="4">No hay mensajes en la bandeja de entrada</td>
                                            </tr>
                                        </tbody>
                                    )}

                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
