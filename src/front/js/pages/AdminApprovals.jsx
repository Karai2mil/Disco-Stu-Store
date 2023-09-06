import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate } from "react-router-dom";

import "../../styles/home.css";


export const AdminApprovals = () => {
    const [approvalData, setApprovalData] = useState([]);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(
        sessionStorage.getItem("pendingApprovals") || 0
    );
    const { actions } = useContext(Context);
    const navigate = useNavigate();

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

    const fetchData = async () => {
        try {
            const data = await actions.getArticleForApproval();
            setApprovalData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleArticleReview = (item) => {
        actions.setArticleToApprove(item);
        navigate(`/article-review/${item.id}`);
    }

    return (
        <div style={{ marginBottom: '300px' }}>
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
                                        <p style={{ fontSize: '1.1rem' }}>Aprobaciones</p>
                                    </Link>
                                    <div className="d-flex justify-content-center">
                                        <i className="fa-solid fa-caret-down" style={{ color: '#ffffff' }}></i>
                                    </div>
                                </div>
                                <div className="nav-item me-3 me-lg-0">
                                    <Link to="/admin-inbox" className="nav-link text-white d-flex align-items-center">
                                        <i className="fa-solid fa-message p-2"></i>
                                        <p>Bandeja de entrada</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla y menu izquierdo */}
            <div className="container" style={{ margin: '30px 100px', border: '1px solid #eeeeee' }}>
                <div className="row" style={{ margin: '30px 70px' }}>
                    <div id="messages_center" className="">
                        <h3 className="mb-3">Articulos pendientes de aprobación</h3>
                        {/*<div className="d-flex justify-content-between mb-3">
                                    <button className="btn btn-light"><i className="fa-solid fa-trash"></i> Aprobar</button>
                                    <button className="btn btn-light"><i className="fa-solid fa-trash"></i> Rechazar</button>
                                </div>*/}

                        <div className="table-responsive">
                            <table className="table table-hover">
                                <tr>
                                    <th>Titulo:</th>
                                    <th>Usuario: </th>
                                    <th>Genero:</th>
                                    <th>Pais:</th>
                                </tr>
                                <tbody>
                                    {approvalData.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <a style={{ cursor: 'pointer' }} onClick={() => handleArticleReview(item)}>{item.titulo}</a>
                                            </td>
                                            <td>{item.user.usuario}</td>
                                            <td>{item.genero}</td>
                                            <td>{item.pais}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>

                    </div>
                </div>
            </div>
        </div>

    );
};
