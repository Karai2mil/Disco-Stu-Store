import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../store/appContext'
import { useNavigate, Link } from 'react-router-dom';


export const AdminReportedComments = () => {

    const navigate = useNavigate()
    const { actions } = useContext(Context)
    const [reportedComments, setReportedComments] = useState();
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
                const fetchedData = await actions.getCommentsReports();
                console.log(fetchedData)
                setReportedComments(fetchedData);

            } catch (error) {
                console.log('Error fetching messages: ', error);
            }
        };
        fetchData();
    }, []);

    const hanlderNavigateArticle = (articulo_id) => {
        navigate(`/article/${articulo_id}`)
    }

    const deleteComment = async (report) => {
        const deleteCommentFetch = await actions.deleteArticleComment(report.comentario_id)
        if (deleteCommentFetch.status === 'COMPLETED') {
            location.reload()
        }
    }

    const keepComment = async (report) => {
        const keepCommentFetch = await actions.deleteReport(report.id)
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
                            <div style={{ width: '70%' }} className="d-flex align-items-center justify-content-between m-auto">
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
                                </div>
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/admin/reported/comments" className="nav-link text-white d-flex align-items-center">
                                        <i class="fa-solid fa-comment-medical p-2"></i>
                                        <p>Comentarios denunciados</p>
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
            {/*Cuerpo*/}
            <div style={{ display: 'flex', margin: '30px 100px', border: '1px solid #eeeeee' }}>
                <div className="container">
                    <div className="row" style={{ margin: '30px 70px' }}>
                        <div id="messages_center">
                            <h4 className="mb-3">Comentarios denunciados</h4>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="bg-light" style={{ borderBottom: '2px solid black' }}>
                                        <tr>
                                            <th className='col'></th>
                                            <th className="col">Denunciante</th>
                                            <th className="col">Avance</th>
                                            <th className="col">Fecha</th>
                                        </tr>
                                    </thead>
                                    {reportedComments &&
                                        reportedComments.data.length > 0 ? (
                                        reportedComments.data.map((report, index) => (
                                            <tbody style={{ borderTop: 'none' }}>
                                                <tr key={report.id} style={{}}>
                                                    <td style={{ width: '3%', cursor: 'pointer', color: 'rgb(52, 52, 204)' }} data-bs-toggle='collapse' data-bs-target={`#collapse${report.id}`} aria-expanded="false" aria-controls={`collapse${report.id}`}>
                                                        <i className="fa-solid fa-caret-down"></i>
                                                    </td>
                                                    <td style={{ width: '25%' }}>{report.user_denunciante_usuario}, ID: {report.user_id_denunciante}</td>
                                                    <td style={{ maxWidth: '54%', width: '54%' }}>
                                                        <p>{report.comentario.substring(0, 60)}...</p>
                                                    </td>
                                                    <td style={{ width: '18%', maxWidth:  '100%' }}>{report.fecha_de_reporte}</td>
                                                </tr>
                                                <tr className='w-100'>
                                                    <td colSpan='4' className='p-0'>
                                                        <div className="collapse my-2" id={`collapse${report.id}`}>
                                                            <div className="p-3">
                                                                <div className='d-flex flex-column w-100 card card-body' key={report.id}>
                                                                    <div style={{ borderBottom: '1px solid rgb(138, 138, 138)', display: 'flex' }}>
                                                                        <p>Comentario de {report.user_escritor_usuario} - id: {report.user_id_escritor} en articulo&nbsp;</p><p style={{ color: 'rgb(52, 52, 204)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => hanlderNavigateArticle(report.articulo_id)}>{report.articulo_id}</p><p>, {report.fecha}</p>
                                                                    </div>
                                                                    <div className="d-flex mb-4">
                                                                        <p>{report.comentario}</p>
                                                                    </div>
                                                                    <div className='d-flex justify-content-end'>
                                                                        <button onClick={() => keepComment(report)} type='button' className='btn btn-success' style={{ marginRight: '5px' }}>Conservar comentario</button>
                                                                        <button onClick={() => deleteComment(report)} type='button' className='btn btn-danger'>Eliminar comentario</button>
                                                                    </div>
                                                                </div>
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
